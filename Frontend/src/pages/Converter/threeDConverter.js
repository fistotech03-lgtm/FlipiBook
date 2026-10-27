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
import { WebIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { resample, prune, dedup, quantize } from '@gltf-transform/functions';
import { exportToFbx } from './threeDExportHelpers';
import { unpackZipArchive, createVirtualLoadingManager } from './archiveModelHandler';

// Non-blocking tick to let UI and GC breathe
const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Converts any material (MeshPhongMaterial, MeshLambertMaterial, etc.) to THREE.MeshStandardMaterial.
 * Standardizing materials is required for GLTFExporter / USDZExporter and eliminates shader artifacts.
 */
const standardizeToMeshStandard = (mat) => {
  if (!mat) {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
  }

  if (mat.isMeshStandardMaterial) {
    mat.side = THREE.DoubleSide;
    mat.vertexColors = false;
    if (mat.map && mat.color) {
      mat.color.setHex(0xffffff);
    }
    return mat;
  }

  const standardMat = new THREE.MeshStandardMaterial({
    name: mat.name || '',
    color: mat.map ? new THREE.Color(0xffffff) : (mat.color ? mat.color.clone() : new THREE.Color(0xffffff)),
    map: mat.map || null,
    normalMap: mat.normalMap || mat.bumpMap || null,
    roughnessMap: mat.roughnessMap || null,
    metalnessMap: mat.metalnessMap || null,
    roughness: 0.5,
    metalness: 0.1,
    opacity: typeof mat.opacity === 'number' ? mat.opacity : 1.0,
    transparent: mat.transparent || (mat.opacity < 0.99),
    alphaTest: mat.alphaTest || 0,
    side: THREE.DoubleSide,
    vertexColors: false
  });

  if (mat.emissive) {
    standardMat.emissive = mat.emissive.clone();
    if (mat.emissiveIntensity) standardMat.emissiveIntensity = mat.emissiveIntensity;
  }

  return standardMat;
};

/**
 * Normalizes all meshes in a scene hierarchy:
 * 1. Converts non-standard materials to MeshStandardMaterial (crucial for USDZ & GLTF exporters).
 * 2. Neutralizes / strips misleading vertex colors when diffuse textures are present.
 * 3. Ensures computed vertex normals exist on all meshes.
 */
const normalizeSceneMaterials = (root) => {
  if (!root) return;
  root.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) {
        if (!child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
        // If geometry has a color attribute and materials have a texture map or default vertex colors,
        // remove the color attribute to avoid multiplying textures with black/dark VFX vertex colors
        if (child.geometry.attributes.color) {
          const hasMap = Array.isArray(child.material)
            ? child.material.some((m) => m && m.map)
            : Boolean(child.material && child.material.map);
          if (hasMap) {
            child.geometry.deleteAttribute('color');
          }
        }
      }

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => standardizeToMeshStandard(m));
        } else {
          child.material = standardizeToMeshStandard(child.material);
        }
      } else {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.5,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
      }
    }
  });
};

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
 * Downscales and re-compresses binary texture bytes using an offscreen HTML5 Canvas.
 * Directly produces a Uint8Array containing compressed JPEG or PNG data.
 */
const compressBinaryTexture = async (uint8Array, currentMimeType = 'image/png', maxDimension = 1024, quality = 0.75) => {
  if (!uint8Array || uint8Array.length === 0) return null;

  try {
    const blob = new Blob([uint8Array], { type: currentMimeType });
    let imageSource;

    if (typeof createImageBitmap !== 'undefined') {
      try {
        imageSource = await createImageBitmap(blob);
      } catch (_e) {}
    }

    if (!imageSource) {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image decode failed'));
        img.src = url;
      });
      URL.revokeObjectURL(url);
      imageSource = img;
    }

    const srcWidth = imageSource.width;
    const srcHeight = imageSource.height;
    if (!srcWidth || !srcHeight) return null;

    let targetWidth = srcWidth;
    let targetHeight = srcHeight;
    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth >= targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

    // Detect if image has transparency
    let hasAlpha = false;
    try {
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
      const step = Math.max(1, Math.floor(imgData.length / (4 * 1000)));
      for (let p = 3; p < imgData.length; p += 4 * step) {
        if (imgData[p] < 240) {
          hasAlpha = true;
          break;
        }
      }
    } catch (_e) {}

    const outMime = hasAlpha ? 'image/png' : 'image/jpeg';
    const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, outMime, quality));
    if (!outBlob) return null;

    const outBuf = await outBlob.arrayBuffer();
    // Only return compressed if it actually saved space or changed resolution
    if (outBuf.byteLength < uint8Array.byteLength || targetWidth < srcWidth || outMime !== currentMimeType) {
      return {
        imageBytes: new Uint8Array(outBuf),
        mimeType: outMime
      };
    }
  } catch (err) {
    console.warn('compressBinaryTexture failed, keeping original:', err);
  }

  return null;
};

/**
 * Optimizes meshes and textures safely without blowing call stack or memory
 */
const optimizeScene = async (scene, compressionPreset, onProgress) => {
  // Always normalize materials and remove darkening vertex colors so textures display vividly across all presets
  normalizeSceneMaterials(scene);

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
      if (geom.attributes.color && (!isTextureOnly || child.material?.map || Array.isArray(child.material))) {
        geom.deleteAttribute('color');
      }

      if (!geom.attributes.normal) {
        geom.computeVertexNormals();
      }
    }

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
const export3DModel = async (scene, targetFormat, compressionPreset, onProgress) => {
  const fmt = (targetFormat || 'GLB').toUpperCase();
  onProgress?.(75, `Encoding to ${fmt}...`);
  await yieldToMain();

  // Ensure materials are standardized and colors calibrated for export
  normalizeSceneMaterials(scene);

  const isMeshOpt = compressionPreset?.includes('Draco') || compressionPreset?.includes('Meshopt');
  const isTextureOnly = compressionPreset?.includes('Texture Only');
  const maxTextureSize = isTextureOnly ? 1024 : (isMeshOpt ? 1024 : 2048);

  if (fmt === 'GLB' || fmt === 'GLTF') {
    const isBinary = fmt === 'GLB';
    const exporter = new GLTFExporter();

    // Collect animations from scene root or child objects
    const animations = [];
    if (scene.animations && Array.isArray(scene.animations)) {
      animations.push(...scene.animations);
    }

    const rawBlob = await new Promise((resolve, reject) => {
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
          maxTextureSize: maxTextureSize,
          truncateDrawRange: true,
          animations: animations.length > 0 ? animations : undefined
        }
      );
    });

    // If original preset or non-binary format, return uncompressed export directly
    if (!isBinary || compressionPreset?.includes('Original')) {
      return rawBlob;
    }

    // Step 4: Preset-specific Binary Optimization Pipeline via @gltf-transform
    // Distinctly differentiates presets so that file sizes scale predictably:
    // - Original: Untouched 100%
    // - Lossless: Light buffer deduplication & animation resampling (geometry & textures 100% untouched)
    // - Texture Only: Downscales and compresses textures (geometry untouched)
    // - Draco + Meshopt: Full quantization + texture compression (highest reduction)
    try {
      const isLossless = compressionPreset?.includes('Lossless');
      onProgress?.(85, 'Applying preset-specific compression...');
      await yieldToMain();

      const io = new WebIO().registerExtensions(ALL_EXTENSIONS);
      const rawArrayBuffer = await rawBlob.arrayBuffer();
      const doc = await io.readBinary(new Uint8Array(rawArrayBuffer));

      // 1. Resample animations, deduplicate shared accessors and prune unused buffers
      await doc.transform(
        resample(),
        prune(),
        dedup()
      );

      // 2. Geometry Quantization: ONLY applied for Draco + Meshopt
      // (Keeps geometry raw 32-bit floats for "Lossless" and "Texture Only")
      if (isMeshOpt) {
        await doc.transform(
          quantize({
            quantizePosition: 14,
            quantizeNormal: 10,
            quantizeTexcoord: 12,
            quantizeColor: 8,
            quantizeWeight: 8
          })
        );
      }

      // 3. Texture Compression: Applied for "Texture Only" and "Draco + Meshopt"
      // (Leaves textures 100% untouched for "Lossless")
      if (isTextureOnly || isMeshOpt) {
        const targetDim = isTextureOnly ? 1024 : 1024;
        const quality = isTextureOnly ? 0.70 : 0.78;

        const textures = doc.getRoot().listTextures();
        for (const tex of textures) {
          const imgBytes = tex.getImage();
          if (imgBytes && imgBytes.byteLength > 0) {
            const compressed = await compressBinaryTexture(
              imgBytes,
              tex.getMimeType() || 'image/png',
              targetDim,
              quality
            );
            if (compressed) {
              tex.setImage(compressed.imageBytes);
              tex.setMimeType(compressed.mimeType);
            }
          }
        }
      }

      const optimizedBytes = await io.writeBinary(doc);
      return new Blob([optimizedBytes], { type: 'model/gltf-binary' });
    } catch (transformErr) {
      console.warn('Binary quantization skipped, returning raw GLB:', transformErr);
      return rawBlob;
    }
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
    // USDZExporter requires MeshStandardMaterial on all meshes and ignores SkinnedMesh bone transforms if not converted
    normalizeSceneMaterials(scene);
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
    const outputBlob = await export3DModel(scene, targetFormat, compressionPreset, onProgress);

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
