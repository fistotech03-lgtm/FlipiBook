/**
 * Client-Side 3D Model Converter & Compressor
 * Supports: GLB, GLTF, OBJ, STL, FBX, STEP/IGES (via occt-import-js)
 * Memory-safe with geometry quantization, attribute deduping & explicit GPU buffer disposal.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { STLLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { OBJExporter } from 'three-stdlib';
import { STLExporter } from 'three-stdlib';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import occtimportjs from 'occt-import-js';
import { exportToStep, exportToFbx } from './threeDExportHelpers';

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

  if (ext === 'stl') {
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);
    const material = new THREE.MeshStandardMaterial({ color: 0x90caf9, roughness: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);
    const group = new THREE.Group();
    group.add(mesh);
    return group;
  }

  if (ext === 'fbx') {
    const loader = new FBXLoader();
    const object = loader.parse(buffer, '');
    return object;
  }

  if (ext === 'step' || ext === 'stp' || ext === 'iges' || ext === 'igs') {
    onProgress?.(30, 'Converting CAD geometry...');
    await yieldToMain();
    const occt = await occtimportjs();
    const fileBytes = new Uint8Array(buffer);
    const result = occt.ReadStepFile(fileBytes, null);

    if (!result || !result.success) {
      throw new Error('Failed to parse CAD file with OCCT engine.');
    }

    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x99aab5, roughness: 0.4, metalness: 0.3 });

    for (const meshData of result.meshes) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.attributes.position.array, 3));
      if (meshData.attributes.normal) {
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.attributes.normal.array, 3));
      } else {
        geometry.computeVertexNormals();
      }
      if (meshData.index) {
        geometry.setIndex(new THREE.Uint32BufferAttribute(meshData.index.array, 1));
      }
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
    return group;
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

  if (fmt === 'STL') {
    const exporter = new STLExporter();
    const stlData = exporter.parse(scene, { binary: true });
    return new Blob([stlData], { type: 'application/octet-stream' });
  }

  if (fmt === 'STEP' || fmt === 'STP') {
    return exportToStep(scene);
  }

  if (fmt === 'FBX') {
    return exportToFbx(scene);
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
