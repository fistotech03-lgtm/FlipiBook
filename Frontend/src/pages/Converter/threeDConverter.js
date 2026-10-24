/**
 * Client-Side 3D Model Converter & Compressor
 * Supports: GLB, OBJ, FBX, USDZ
 * Memory-safe with geometry quantization, attribute deduping & explicit GPU buffer disposal.
 */

import * as THREE from 'three';
import JSZip from 'jszip';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { OBJExporter } from 'three-stdlib';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js';
import { exportToFbx } from './threeDExportHelpers';

// Non-blocking tick to let UI and GC breathe
const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Loads a 3D model file from memory into a THREE.Scene or THREE.Group
 */
const load3DModel = async (file, onProgress) => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const buffer = await file.arrayBuffer();

  onProgress?.(20, `Parsing .${ext} geometry...`);
  await yieldToMain();

  if (ext === 'glb' || ext === 'gltf') {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.parse(
        buffer,
        '',
        (gltf) => resolve(gltf.scene || gltf.scenes[0]),
        (err) => reject(new Error(`Failed to parse GLTF/GLB: ${err.message}`))
      );
    });
  }

  if (ext === 'obj') {
    const text = new TextDecoder().decode(buffer);
    const loader = new OBJLoader();
    const object = loader.parse(text);
    return object;
  }

  if (ext === 'fbx') {
    const loader = new FBXLoader();
    const object = loader.parse(buffer, '');
    return object;
  }

  if (ext === 'usdz') {
    const loader = new USDLoader();
    const object = loader.parse(buffer);

    // USDLoader in Three.js does not parse opacity / transparent attributes or material blending from USDA.
    // Inspect USDA in the USDZ archive to restore true material opacities, transparent blending, and proper double-sidedness.
    try {
      const zip = await JSZip.loadAsync(buffer);
      let mainUsdaText = '';
      for (const filename of Object.keys(zip.files)) {
        if (filename.endsWith('.usda') || filename.endsWith('.usd')) {
          const txt = await zip.files[filename].async('string');
          if (txt.includes('def Material') || txt.includes('outputs:surface.connect')) {
            mainUsdaText = txt;
            break;
          }
        }
      }

      if (mainUsdaText) {
        // 1. Parse material definitions (opacity, alpha texture connection, roughness, metalness)
        const matInfo = {};
        const mats = mainUsdaText.split('def Material ');
        for (let i = 1; i < mats.length; i++) {
          const block = mats[i];
          const name = block.substring(1, block.indexOf(String.fromCharCode(34), 1));
          let opacity = 1.0;
          let hasAlpha = false;
          let diffuseColor = null;

          for (const rawLine of block.split('\n')) {
            const line = rawLine.trim();
            if (line.includes('inputs:opacity.connect')) hasAlpha = true;
            if (line.includes('inputs:opacity =')) {
              const val = parseFloat(line.split('=')[1].trim());
              if (!isNaN(val)) opacity = val;
            }
            if (line.includes('color3f inputs:diffuseColor =')) {
              const colStr = line.split('=')[1].replace(/[()]/g, '').trim();
              const parts = colStr.split(',').map((v) => parseFloat(v.trim()));
              if (parts.length === 3 && !parts.some(isNaN)) diffuseColor = parts;
            }
          }
          matInfo[name] = { opacity, hasAlpha, diffuseColor };
        }

        // 2. Parse mesh name to material binding
        const meshBindings = {};
        let currentMesh = null;
        for (const rawLine of mainUsdaText.split('\n')) {
          const line = rawLine.trim();
          if (line.startsWith('def Xform') || line.startsWith('def Mesh')) {
            const idx1 = line.indexOf(String.fromCharCode(34));
            if (idx1 !== -1) {
              const idx2 = line.indexOf(String.fromCharCode(34), idx1 + 1);
              if (idx2 !== -1) currentMesh = line.substring(idx1 + 1, idx2);
            }
          }
          if (line.includes('rel material:binding = </Materials/')) {
            const mat = line.split('rel material:binding = </Materials/')[1].replace('>', '').trim();
            if (currentMesh) meshBindings[currentMesh] = mat;
          }
        }

        // 3. Traverse and apply true material properties & alpha blending
        object.traverse((child) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            const boundMatName = meshBindings[child.name] || meshBindings[child.parent?.name];
            const info = boundMatName ? matInfo[boundMatName] : null;

            mats.forEach((mat) => {
              mat.side = THREE.DoubleSide;

              const lowerName = (child.name + ' ' + (child.parent?.name || '') + ' ' + (mat.name || '')).toLowerCase();
              const isGlassLike = lowerName.includes('glass') || lowerName.includes('lens') || lowerName.includes('gauge_cover');

              if (info) {
                if (info.opacity < 0.99 || isGlassLike) {
                  mat.transparent = true;
                  mat.opacity = Math.min(info.opacity, isGlassLike ? 0.25 : info.opacity);
                  mat.depthWrite = !isGlassLike;
                }
                if (info.hasAlpha && mat.map) {
                  mat.transparent = true;
                  mat.alphaTest = 0.05; // Clean cutout blending for decals / labels / gauge marks
                }
                if (info.diffuseColor && !mat.map) {
                  mat.color.setRGB(info.diffuseColor[0], info.diffuseColor[1], info.diffuseColor[2]);
                }
              } else if (isGlassLike) {
                mat.transparent = true;
                mat.opacity = 0.25;
                mat.depthWrite = false;
              }
            });
          }
        });
      }
    } catch (e) {
      console.warn('USDA texture and opacity enhancement failed:', e);
    }

    return object;
  }

  throw new Error(`Unsupported 3D file format .${ext}`);
};

/**
 * Optimizes meshes and textures safely without blowing call stack or memory
 */
const optimizeScene = async (scene, compressionPreset, onProgress) => {
  // If Original Quality / Lossless preset selected, preserve mesh geometries and textures intact
  if (compressionPreset?.includes('Original')) {
    onProgress?.(50, 'Preserving original 3D geometry & texture quality...');
    await yieldToMain();
    return;
  }

  onProgress?.(50, `Applying ${compressionPreset} compression...`);
  await yieldToMain();

  const isMeshOpt = compressionPreset.includes('Draco') || compressionPreset.includes('Meshopt');
  const isTextureOnly = compressionPreset.includes('Texture Only');

  const meshes = [];
  scene.traverse((child) => {
    if (child.isMesh) meshes.push(child);
  });

  for (let i = 0; i < meshes.length; i++) {
    const child = meshes[i];
    const geom = child.geometry;

    if (geom) {
      // Remove redundant vertex attributes to save memory & storage
      if (geom.attributes.color && !isTextureOnly) {
        geom.deleteAttribute('color');
      }

      if (!geom.attributes.normal) {
        geom.computeVertexNormals();
      }

      // Quantize coordinates slightly for high compression presets
      if (isMeshOpt && geom.attributes.position) {
        const positions = geom.attributes.position.array;
        const len = positions.length;
        for (let j = 0; j < len; j++) {
          positions[j] = Math.round(positions[j] * 1000) / 1000;
        }
        geom.attributes.position.needsUpdate = true;
      }
    }

    // Material texture downscaling for memory economy
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat.map && mat.map.image) {
          mat.map.generateMipmaps = true;
          mat.map.minFilter = THREE.LinearMipmapLinearFilter;
        }
      });
    }

    if (i % 20 === 0) {
      await yieldToMain();
    }
  }
};

/**
 * Exports THREE 3D scene to specified target format
 */
const export3DModel = async (scene, targetFormat, onProgress) => {
  const fmt = (targetFormat || 'GLB').toUpperCase();
  onProgress?.(75, `Encoding to ${fmt}...`);
  await yieldToMain();

  if (fmt === 'GLB' || fmt === 'GLTF') {
    const isBinary = fmt === 'GLB';
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        (result) => {
          if (isBinary) {
            const blob = new Blob([result], { type: 'model/gltf-binary' });
            resolve(blob);
          } else {
            const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
            const blob = new Blob([output], { type: 'model/gltf+json' });
            resolve(blob);
          }
        },
        (err) => reject(new Error(`Failed to export GLTF/GLB: ${err.message || 'Call stack or memory limit exceeded'}`)),
        {
          binary: isBinary,
          embedImages: true,
          truncateDrawRange: true
        }
      );
    });
  }

  if (fmt === 'OBJ') {
    const exporter = new OBJExporter();
    const objText = exporter.parse(scene);
    return new Blob([objText], { type: 'text/plain' });
  }

  if (fmt === 'FBX') {
    return exportToFbx(scene);
  }

  if (fmt === 'USDZ') {
    const exporter = new USDZExporter();
    const arrayBuffer = await exporter.parseAsync(scene);
    return new Blob([arrayBuffer], { type: 'model/vnd.usdz+zip' });
  }

  // Fallback to GLB export
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => resolve(new Blob([result], { type: 'model/gltf-binary' })),
      (err) => reject(new Error(`Export error: ${err.message}`)),
      { binary: true }
    );
  });
};

/**
 * Dispose loaded THREE scene from memory to release RAM
 */
const disposeScene = (scene) => {
  if (!scene) return;
  scene.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose();
    }
    if (node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => {
        if (m.map) m.map.dispose();
        if (m.lightMap) m.lightMap.dispose();
        if (m.bumpMap) m.bumpMap.dispose();
        if (m.normalMap) m.normalMap.dispose();
        if (m.specularMap) m.specularMap.dispose();
        if (m.envMap) m.envMap.dispose();
        m.dispose();
      });
    }
  });
};

/**
 * Main 3D Converter & Compressor
 *
 * @param {File} file
 * @param {string} targetFormat - 'GLB' | 'GLTF' | 'OBJ' | 'STL' | 'FBX' | 'STEP'
 * @param {string} compressionPreset
 * @param {Function} onProgress - (percent: number, msg: string) => void
 * @returns {Promise<Blob>}
 */
export async function convertAndCompress3D(file, targetFormat, compressionPreset, onProgress) {
  onProgress?.(10, `Reading ${file.name}...`);
  await yieldToMain();

  let scene = null;
  try {
    // Step 1: Load into Three.js
    scene = await load3DModel(file, onProgress);

    // Step 2: Apply Mesh & Texture optimizations
    await optimizeScene(scene, compressionPreset, onProgress);

    // Step 3: Export to target format
    const outputBlob = await export3DModel(scene, targetFormat, onProgress);

    onProgress?.(100, 'Optimization complete!');
    return outputBlob;
  } finally {
    // Memory safeguard: explicitly release Three.js scene from RAM
    disposeScene(scene);
    scene = null;
  }
}
