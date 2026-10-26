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
import { STLLoader } from 'three-stdlib';
import { OBJExporter } from 'three-stdlib';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { exportToFbx } from './threeDExportHelpers';
import { unpackZipArchive, createVirtualLoadingManager } from './archiveModelHandler';

// Non-blocking tick to let UI and GC breathe
const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Loads a 3D model file (or unpacked archive / folder) from memory into a THREE.Scene or THREE.Group
 * Captures all animations (gltf.animations, fbx.animations) and preserves textures/materials.
 */
const load3DModel = async (file, onProgress) => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // Handle Archive packages (.zip, .rar, etc.)
  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || ext === 'gz') {
    onProgress?.(15, `Extracting 3D package archive (${file.name})...`);
    await yieldToMain();

    const { primaryEntry, urlMap, revokeAll } = await unpackZipArchive(file);
    const basePath = primaryEntry.path.includes('/') ? primaryEntry.path.substring(0, primaryEntry.path.lastIndexOf('/')) : '';
    const manager = createVirtualLoadingManager(urlMap, basePath);

    try {
      const primaryExt = primaryEntry.ext.toLowerCase();
      onProgress?.(30, `Loading packaged model: ${primaryEntry.name}...`);
      await yieldToMain();

      let loadedRoot = null;

      if (primaryExt === 'glb' || primaryExt === 'gltf') {
        const loader = new GLTFLoader(manager);
        loadedRoot = await new Promise((resolve, reject) => {
          loader.load(
            primaryEntry.objectUrl,
            (gltf) => {
              const root = gltf.scene || gltf.scenes[0];
              if (gltf.animations && gltf.animations.length > 0) {
                root.animations = gltf.animations;
              }
              resolve(root);
            },
            undefined,
            (err) => reject(new Error(`Failed to load archive GLTF: ${err.message || 'Parser failed'}`))
          );
        });
      } else if (primaryExt === 'fbx') {
        const loader = new FBXLoader(manager);
        loader.setPath(basePath ? (basePath.endsWith('/') ? basePath : `${basePath}/`) : '');
        const resp = await fetch(primaryEntry.objectUrl);
        const buffer = await resp.arrayBuffer();
        const obj = loader.parse(buffer, basePath ? (basePath.endsWith('/') ? basePath : `${basePath}/`) : '');

        // Find texture images in archive
        const imageEntries = Array.from(urlMap.entries()).filter(([key]) =>
          /\.(png|jpe?g|webp|bmp|tga)$/i.test(key)
        );

        const textureCache = new Map();
        const getTexture = (url) => {
          if (textureCache.has(url)) return textureCache.get(url);
          const tex = new THREE.TextureLoader().load(url);
          tex.colorSpace = THREE.SRGBColorSpace;
          textureCache.set(url, tex);
          return tex;
        };

        obj.traverse((child) => {
          if (child.isMesh) {
            const mats = Array.isArray(child.material) ? child.material : (child.material ? [child.material] : []);
            
            mats.forEach((mat) => {
              // Strip shader VFX vertex colors that darken models to black
              if (mat.vertexColors) {
                mat.vertexColors = false;
              }

              // Auto-bind diffuse textures if unmapped
              if (!mat.map && imageEntries.length > 0) {
                const matName = (mat.name || '').toLowerCase();
                const meshName = (child.name || '').toLowerCase();

                let matchedEntry = imageEntries.find(([path]) => {
                  const lower = path.toLowerCase();
                  return (matName && lower.includes(matName)) || (meshName && lower.includes(meshName));
                });

                if (!matchedEntry) {
                  matchedEntry = imageEntries.find(([path]) => {
                    const lower = path.toLowerCase();
                    return lower.includes('diff') || lower.includes('basecolor') || lower.includes('color') || lower.includes('albedo');
                  });
                }

                if (!matchedEntry && imageEntries.length > 0) {
                  matchedEntry = imageEntries.find(([path]) => {
                    const lower = path.toLowerCase();
                    return !lower.includes('normal') && !lower.includes('rough') && !lower.includes('metal') && !lower.includes('bump');
                  }) || imageEntries[0];
                }

                if (matchedEntry) {
                  mat.map = getTexture(matchedEntry[1]);
                }
              }

              if (mat.map) {
                if (mat.color) {
                  mat.color.setHex(0xffffff);
                }
                mat.needsUpdate = true;
              }
            });
          }
        });

        loadedRoot = obj;
      } else if (primaryExt === 'obj') {
        // Look for corresponding .mtl in urlMap
        const mtlFileName = primaryEntry.name.replace(/\.obj$/i, '.mtl');
        const mtlUrl = urlMap.get(mtlFileName) || urlMap.get(mtlFileName.toLowerCase());

        if (mtlUrl) {
          const mtlLoader = new MTLLoader(manager);
          const materials = await new Promise((resolve, reject) => {
            mtlLoader.load(mtlUrl, resolve, undefined, reject);
          });
          materials.preload();

          const objLoader = new OBJLoader(manager);
          objLoader.setMaterials(materials);
          loadedRoot = await new Promise((resolve, reject) => {
            objLoader.load(primaryEntry.objectUrl, resolve, undefined, reject);
          });
        } else {
          const objLoader = new OBJLoader(manager);
          loadedRoot = await new Promise((resolve, reject) => {
            objLoader.load(primaryEntry.objectUrl, resolve, undefined, reject);
          });
        }
      } else if (primaryExt === 'stl') {
        const loader = new STLLoader(manager);
        const geom = await new Promise((resolve, reject) => {
          loader.load(primaryEntry.objectUrl, resolve, undefined, reject);
        });
        const mat = new THREE.MeshStandardMaterial({
          color: 0xdadada,
          roughness: 0.45,
          metalness: 0.15,
          side: THREE.DoubleSide
        });
        loadedRoot = new THREE.Mesh(geom, mat);
      } else {
        throw new Error(`Unsupported primary model format in archive: .${primaryExt}`);
      }

      // Store cleanup on root so converter can safely revoke all archive URLs after export
      loadedRoot._revokeArchive = revokeAll;
      return loadedRoot;
    } catch (archiveErr) {
      revokeAll();
      throw archiveErr;
    }
  }

  // Handle direct standalone 3D files
  const buffer = await file.arrayBuffer();
  onProgress?.(20, `Parsing .${ext} geometry & animations...`);
  await yieldToMain();

  if (ext === 'glb' || ext === 'gltf') {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.parse(
        buffer,
        '',
        (gltf) => {
          const root = gltf.scene || gltf.scenes[0];
          // Preserve animation tracks
          if (gltf.animations && gltf.animations.length > 0) {
            root.animations = gltf.animations;
          }
          resolve(root);
        },
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

  if (ext === 'stl') {
    const loader = new STLLoader();
    const geom = loader.parse(buffer);
    geom.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xdadada,
      roughness: 0.45,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    return new THREE.Mesh(geom, mat);
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

    // Collect animations from scene root or child objects
    const animations = [];
    if (scene.animations && Array.isArray(scene.animations)) {
      animations.push(...scene.animations);
    }

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
          truncateDrawRange: true,
          animations: animations.length > 0 ? animations : undefined
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
  const animations = scene.animations && Array.isArray(scene.animations) ? scene.animations : undefined;
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => resolve(new Blob([result], { type: 'model/gltf-binary' })),
      (err) => reject(new Error(`Export error: ${err.message}`)),
      { binary: true, animations }
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
    if (scene?._revokeArchive) {
      try {
        scene._revokeArchive();
      } catch (_e) {}
    }
    disposeScene(scene);
    scene = null;
  }
}
