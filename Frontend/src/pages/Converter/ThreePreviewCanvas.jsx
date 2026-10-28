import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import JSZip from 'jszip';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { STLLoader } from 'three-stdlib';
import { TGALoader } from 'three-stdlib';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js';
import { unpackZipArchive, createVirtualLoadingManager } from './archiveModelHandler';
import { Loader2, Play, Pause, Film, AlertTriangle } from 'lucide-react';

/**
 * Lightweight, memory-optimized 3D Canvas Previewer
 * Supports: GLB, OBJ, FBX, USDZ
 */
export default function ThreePreviewCanvas({
  blobUrl,
  format = 'GLB',
  autoRotate = true,
  className = '',
  onAnimationsDetected
}) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsMapRef = useRef(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [availableAnimations, setAvailableAnimations] = useState([]);
  const [selectedAnimation, setSelectedAnimation] = useState('');
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(true);

  // Sync autoRotate updates dynamically without re-mounting the entire WebGL canvas
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !blobUrl) return;

    let isMounted = true;
    let animId = null;
    let loadedObject = null;
    let mixer = null;
    const clock = new THREE.Clock();
    let archiveRevoker = null;
    setIsLoading(true);
    setLoadError(null);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 240;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 50000);
    camera.position.set(2, 2, 3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // High-clarity studio lighting setup
    // Hemisphere light simulates sky and ground reflections
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.8);
    scene.add(hemiLight);

    // Key front-top light for primary highlights
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    // Fill light from opposite side to soften shadows
    const fillLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);

    // Rim/Back light to define silhouettes and edges
    const rimLight = new THREE.DirectionalLight(0xf0f9ff, 1.0);
    rimLight.position.set(0, -6, -8);
    scene.add(rimLight);

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0xd1d5db, 0xe5e7eb);
    grid.position.y = -0.01;
    scene.add(grid);

    // Load Model
    const fmt = format.toUpperCase();

    const normalizeAndCenterModel = (object, animations = []) => {
      if (!isMounted || !object) return;
      loadedObject = object;

      // Ensure all meshes have vertex normals calculated so lighting reflects properly
      object.traverse((child) => {
        if (child.isMesh && child.geometry) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      });

      scene.add(object);

      // Play skeletal / keyframe animations if present
      const animClips = animations && animations.length > 0 ? animations : (object.animations || []);
      if (animClips.length > 0) {
        mixer = new THREE.AnimationMixer(object);
        mixerRef.current = mixer;
        actionsMapRef.current.clear();

        const names = animClips.map((clip, idx) => clip.name || `Animation ${idx + 1}`);
        setAvailableAnimations(names);
        setSelectedAnimation(names[0]);
        setIsPlayingAnimation(true);
        if (typeof onAnimationsDetected === 'function') {
          onAnimationsDetected(names);
        }

        animClips.forEach((clip, idx) => {
          const name = names[idx];
          const action = mixer.clipAction(clip);
          actionsMapRef.current.set(name, action);
        });

        // Start with the first animation
        const firstAction = actionsMapRef.current.get(names[0]);
        if (firstAction) {
          firstAction.play();
        }
      } else {
        mixerRef.current = null;
        actionsMapRef.current.clear();
        setAvailableAnimations([]);
        setSelectedAnimation('');
        if (typeof onAnimationsDetected === 'function') {
          onAnimationsDetected([]);
        }
      }

      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Guard against models with invalid or zero bounding boxes (fallback bounds)
      const maxDim = (Math.max(size.x, size.y, size.z) > 0.0001 && isFinite(size.x))
        ? Math.max(size.x, size.y, size.z)
        : 1;

      // Scale up or down extreme models (e.g. FBX exported in millimeters or micrometers)
      if (maxDim > 1000) {
        const scaleFactor = 10 / maxDim;
        object.scale.multiplyScalar(scaleFactor);
        box.setFromObject(object);
        box.getSize(size);
        box.getCenter(center);
      } else if (maxDim < 0.01 && maxDim > 0) {
        const scaleFactor = 2 / maxDim;
        object.scale.multiplyScalar(scaleFactor);
        box.setFromObject(object);
        box.getSize(size);
        box.getCenter(center);
      }

      // Center model
      object.position.x += -center.x;
      object.position.y += -box.min.y;
      object.position.z += -center.z;

      // Fit camera
      const finalMaxDim = Math.max(size.x, size.y, size.z) || 1;
      const fov = camera.fov * (Math.PI / 180);
      const aspect = camera.aspect || (width / height) || 1;
      // In wide modals or split views, fit both vertically and horizontally so the model stays prominently sized
      const distV = (finalMaxDim / 2) / Math.tan(fov / 2);
      const distH = (finalMaxDim / 2) / (Math.tan(fov / 2) * aspect);
      let cameraDist = Math.max(distV, distH) * 1.35;
      cameraDist = Math.max(cameraDist, 1.8);

      camera.near = Math.max(0.01, cameraDist / 100);
      camera.far = Math.max(5000, cameraDist * 100);
      camera.updateProjectionMatrix();

      camera.position.set(cameraDist * 0.75, cameraDist * 0.55, cameraDist);
      controls.target.set(0, size.y / 2, 0);
      controls.maxDistance = cameraDist * 10;
      controls.minDistance = cameraDist * 0.05;
      controls.update();

      setIsLoading(false);
    };

    const isArchive = ['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(fmt);

    if (isArchive) {
      (async () => {
        try {
          const resp = await fetch(blobUrl);
          const archiveBlob = await resp.blob();
          if (!isMounted) return;

          const { primaryEntry, urlMap, revokeAll } = await unpackZipArchive(archiveBlob);
          archiveRevoker = revokeAll;
          const basePath = primaryEntry.path.includes('/') ? primaryEntry.path.substring(0, primaryEntry.path.lastIndexOf('/')) : '';
          const manager = createVirtualLoadingManager(urlMap, basePath);
          const primaryExt = primaryEntry.ext.toUpperCase();

          if (primaryExt === 'GLB' || primaryExt === 'GLTF') {
            const loader = new GLTFLoader(manager);
            loader.load(
              primaryEntry.objectUrl,
              (gltf) => {
                normalizeAndCenterModel(gltf.scene || gltf.scenes[0], gltf.animations);
              },
              undefined,
              (err) => {
                console.error('Error loading archive GLTF:', err);
                if (isMounted) setIsLoading(false);
              }
            );
          } else if (primaryExt === 'FBX') {
            const loader = new FBXLoader(manager);
            // Provide basePath so FBXLoader parses embedded texture references using manager
            loader.setPath(basePath ? (basePath.endsWith('/') ? basePath : `${basePath}/`) : '');
            
            const subResp = await fetch(primaryEntry.objectUrl);
            const subBuf = await subResp.arrayBuffer();
            const fbxObj = loader.parse(subBuf, basePath ? (basePath.endsWith('/') ? basePath : `${basePath}/`) : '');

            // Find all image textures present in the archive
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

            fbxObj.traverse((child) => {
              if (child.isMesh) {
                if (child.geometry && !child.geometry.attributes.normal) {
                  child.geometry.computeVertexNormals();
                }

                const mats = Array.isArray(child.material) ? child.material : (child.material ? [child.material] : []);
                
                if (mats.length === 0) {
                  const defaultMat = new THREE.MeshStandardMaterial({
                    roughness: 0.5,
                    metalness: 0.1,
                    side: THREE.DoubleSide
                  });
                  child.material = defaultMat;
                  mats.push(defaultMat);
                }

                mats.forEach((mat) => {
                  mat.side = THREE.DoubleSide;

                  // If material does not have a map loaded
                  if (!mat.map && imageEntries.length > 0) {
                    const matName = (mat.name || '').toLowerCase();
                    const meshName = (child.name || '').toLowerCase();

                    // 1. Try matching texture path by material or mesh name
                    let matchedEntry = imageEntries.find(([path]) => {
                      const lower = path.toLowerCase();
                      return (matName && lower.includes(matName)) || (meshName && lower.includes(meshName));
                    });

                    // 2. Try diffuse / baseColor keywords
                    if (!matchedEntry) {
                      matchedEntry = imageEntries.find(([path]) => {
                        const lower = path.toLowerCase();
                        return lower.includes('diff') || lower.includes('basecolor') || lower.includes('color') || lower.includes('albedo');
                      });
                    }

                    // 3. Fallback to any valid color texture in archive
                    if (!matchedEntry && imageEntries.length > 0) {
                      const colorImage = imageEntries.find(([path]) => {
                        const lower = path.toLowerCase();
                        return !lower.includes('normal') && !lower.includes('rough') && !lower.includes('metal') && !lower.includes('bump');
                      }) || imageEntries[0];
                      matchedEntry = colorImage;
                    }

                    if (matchedEntry) {
                      mat.map = getTexture(matchedEntry[1]);
                      mat.needsUpdate = true;
                    }
                  }

                  // IMPORTANT: In game/character FBX models, geometry often contains vertex colors used for VFX masks
                  // (e.g. [0,0,0] for black lightning or [0,1,0] for effect shaders) which turns the model completely black or green.
                  // Disable vertex colors when diffuse texture is used or when vertex colors would darken the mesh.
                  if (mat.vertexColors) {
                    mat.vertexColors = false;
                  }

                  // If mesh has vertex colors and diffuse texture, delete vertex color attribute so it doesn't darken the texture
                  if (mat.map && child.geometry && child.geometry.attributes.color) {
                    child.geometry.deleteAttribute('color');
                  }

                  // If material has a map, reset diffuse color to clean white so texture displays accurately
                  if (mat.map) {
                    if (mat.color) {
                      mat.color.setHex(0xffffff);
                    }
                    mat.needsUpdate = true;
                  } else {
                    // Check if material is pitch black or untextured
                    const isDarkOrMissing = !mat.color ||
                      (mat.color.r < 0.12 && mat.color.g < 0.12 && mat.color.b < 0.12);

                    if (isDarkOrMissing) {
                      mat.color = new THREE.Color(0xdadada);
                      mat.roughness = 0.45;
                      mat.metalness = 0.15;
                      mat.needsUpdate = true;
                    }
                  }
                });
              }
            });

            normalizeAndCenterModel(fbxObj, fbxObj.animations);
          } else if (primaryExt === 'USDZ') {
            const loader = new USDLoader(manager);
            const subResp = await fetch(primaryEntry.objectUrl);
            const subBuf = await subResp.arrayBuffer();
            const usdzObj = loader.parse(subBuf);
            normalizeAndCenterModel(usdzObj);
          } else if (primaryExt === 'OBJ') {
            const mtlFileName = primaryEntry.name.replace(/\.obj$/i, '.mtl');
            const mtlUrl = urlMap.get(mtlFileName) || urlMap.get(mtlFileName.toLowerCase());

            if (mtlUrl) {
              const mtlLoader = new MTLLoader(manager);
              const materials = await new Promise((res, rej) => mtlLoader.load(mtlUrl, res, undefined, rej));
              materials.preload();
              const objLoader = new OBJLoader(manager);
              objLoader.setMaterials(materials);
              objLoader.load(
                primaryEntry.objectUrl,
                (obj) => normalizeAndCenterModel(obj),
                undefined,
                () => { if (isMounted) setIsLoading(false); }
              );
            } else {
              const objLoader = new OBJLoader(manager);
              objLoader.load(
                primaryEntry.objectUrl,
                (obj) => normalizeAndCenterModel(obj),
                undefined,
                () => { if (isMounted) setIsLoading(false); }
              );
            }
          } else if (primaryExt === 'STL') {
            const loader = new STLLoader(manager);
            loader.load(
              primaryEntry.objectUrl,
              (geom) => {
                const mat = new THREE.MeshStandardMaterial({
                  color: 0xdadada,
                  roughness: 0.45,
                  metalness: 0.15,
                  side: THREE.DoubleSide
                });
                normalizeAndCenterModel(new THREE.Mesh(geom, mat));
              },
              undefined,
              () => { if (isMounted) setIsLoading(false); }
            );
          }
        } catch (err) {
          console.error('Error loading archive 3D model:', err);
          if (isMounted) {
            setLoadError(err.message || 'Failed to load model from archive');
            setIsLoading(false);
          }
        }
      })();
    } else if (fmt === 'GLB' || fmt === 'GLTF') {
      const loader = new GLTFLoader();
      loader.load(
        blobUrl,
        (gltf) => {
          const root = gltf.scene || gltf.scenes[0];
          // Ensure double-sided materials and clean vertex color blending
          root.traverse((child) => {
            if (child.isMesh && child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((mat) => {
                mat.side = THREE.DoubleSide;
                if (mat.map) {
                  mat.vertexColors = false;
                  if (mat.color) mat.color.setHex(0xffffff);
                  if (child.geometry?.attributes?.color) {
                    child.geometry.deleteAttribute('color');
                  }
                }
              });
            }
          });
          normalizeAndCenterModel(root, gltf.animations);
        },
        undefined,
        (err) => {
          console.error('Error loading GLTF preview:', err);
          if (isMounted) {
            setLoadError('Failed to load GLTF / GLB model');
            setIsLoading(false);
          }
        }
      );
    } else if (fmt === 'OBJ') {
      const loader = new OBJLoader();
      loader.load(
        blobUrl,
        (obj) => {
          obj.traverse((child) => {
            if (child.isMesh) {
              if (child.geometry && !child.geometry.attributes.normal) {
                child.geometry.computeVertexNormals();
              }
              child.material = new THREE.MeshStandardMaterial({
                color: 0xdadada,
                roughness: 0.45,
                metalness: 0.15,
                side: THREE.DoubleSide
              });
            }
          });
          normalizeAndCenterModel(obj);
        },
        undefined,
        (err) => {
          console.error('Error loading OBJ preview:', err);
          if (isMounted) setIsLoading(false);
        }
      );
    } else if (fmt === 'STL') {
      (async () => {
        try {
          const resp = await fetch(blobUrl);
          const buf = await resp.arrayBuffer();
          const loader = new STLLoader();
          const geom = loader.parse(buf);
          geom.computeVertexNormals();
          const mat = new THREE.MeshStandardMaterial({
            color: 0xdadada,
            roughness: 0.45,
            metalness: 0.15,
            side: THREE.DoubleSide
          });
          normalizeAndCenterModel(new THREE.Mesh(geom, mat));
        } catch (err) {
          console.error('Error loading STL preview:', err);
          if (isMounted) setIsLoading(false);
        }
      })();
    } else if (fmt === 'FBX') {
      (async () => {
        try {
          const resp = await fetch(blobUrl);
          const buffer = await resp.arrayBuffer();
          if (!isMounted) return;
          const manager = new THREE.LoadingManager();
          try {
            class SafeTGALoaderStandalone extends TGALoader {
              parse(buffer) {
                if (buffer && buffer.byteLength >= 4) {
                  const bytes = new Uint8Array(buffer.slice(0, 4));
                  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
                  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
                  const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
                  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
                  if (isPng || isJpg || isGif || isWebp) {
                    return { width: 1, height: 1, data: new Uint8Array([255, 255, 255, 255]) };
                  }
                }
                try {
                  return super.parse(buffer);
                } catch (_e) {
                  return { width: 1, height: 1, data: new Uint8Array([255, 255, 255, 255]) };
                }
              }
            }
            manager.addHandler(/\.tga$/i, new SafeTGALoaderStandalone(manager));
          } catch (_e) {}
          const loader = new FBXLoader(manager);
          const object = loader.parse(buffer, '');

          // Ensure FBX meshes have clean, visible gray clay materials and valid normals
          object.traverse((child) => {
            if (child.isMesh) {
              if (child.geometry && !child.geometry.attributes.normal) {
                child.geometry.computeVertexNormals();
              }

              // Replace missing, untextured, black, or flat materials with a clean studio gray material
              const isDarkOrMissing = !child.material ||
                (Array.isArray(child.material) && child.material.length === 0) ||
                (!child.material.map && (
                  !child.material.color ||
                  (child.material.color.r < 0.15 && child.material.color.g < 0.15 && child.material.color.b < 0.15)
                ));

              if (isDarkOrMissing) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xdadada,
                  roughness: 0.45,
                  metalness: 0.15,
                  side: THREE.DoubleSide
                });
              } else if (child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((m) => {
                  m.side = THREE.DoubleSide;
                });
              }
            }
          });

          normalizeAndCenterModel(object, object.animations);
        } catch (err) {
          console.error('Error loading FBX preview:', err);
          if (isMounted) {
            setLoadError('Failed to parse FBX model');
            setIsLoading(false);
          }
        }
      })();
    } else if (fmt === 'USDZ') {
      (async () => {
        try {
          const response = await fetch(blobUrl);
          const buffer = await response.arrayBuffer();
          if (!isMounted) return;

          let object = null;

          // Check if USDZ contains USDC (binary crate)
          let hasCrate = false;
          try {
            const testZip = await JSZip.loadAsync(buffer);
            hasCrate = Object.keys(testZip.files).some((f) => f.endsWith('.usdc'));
          } catch (_e) {}

          if (hasCrate) {
            console.warn('USDZ file contains binary USDC crate which is not supported by Three.js parser.');
            throw new Error('This USDZ file uses binary .usdc format internally, which browser Three.js cannot parse directly. Please upload the .glb version instead.');
          }

          const loader = new USDLoader();
          object = loader.parse(buffer);

          if (!object || object.children.length === 0) {
            throw new Error('USDZ file parsed 0 meshes. Please upload the .glb version instead.');
          }

          // Restore opacities, alpha cutoff and material blending from USDA
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
                        mat.alphaTest = 0.05;
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
            console.warn('USDA texture enhancement failed:', e);
          }

          normalizeAndCenterModel(object);
        } catch (err) {
          console.error('Error loading USDZ preview:', err);
          if (isMounted) {
            setLoadError(err.message || 'Failed to load USDZ model');
            setIsLoading(false);
          }
        }
      })();
    }

    // Animation Loop
    const animate = () => {
      if (!isMounted) return;
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }
      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !isMounted) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 240;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      controlsRef.current = null;

      if (mixer) {
        mixer.stopAllAction();
        mixer = null;
      }

      if (archiveRevoker) {
        try {
          archiveRevoker();
        } catch (_e) {}
      }

      if (loadedObject) {
        loadedObject.traverse((node) => {
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
      }

      grid.geometry.dispose();
      grid.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (container) {
        container.replaceChildren();
      }
    };
  }, [blobUrl, format]);

  const handleSelectAnimation = (animName) => {
    setSelectedAnimation(animName);
    const targetAction = actionsMapRef.current.get(animName);
    if (!targetAction) return;

    actionsMapRef.current.forEach((action) => {
      action.stop();
    });

    targetAction.reset().play();
    setIsPlayingAnimation(true);
  };

  const handleTogglePlay = () => {
    const currentAction = actionsMapRef.current.get(selectedAnimation);
    if (!currentAction) return;

    if (isPlayingAnimation) {
      currentAction.paused = true;
      setIsPlayingAnimation(false);
    } else {
      currentAction.paused = false;
      currentAction.play();
      setIsPlayingAnimation(true);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[200px] rounded-xl overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Animation Selector Bar */}
      {availableAnimations.length > 0 && !isLoading && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 p-1.5 px-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-md z-20 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 min-w-0">
            <Film className="w-3.5 h-3.5 text-[#ea543a] shrink-0" />
            <span className="font-semibold text-2xs text-slate-500 uppercase tracking-wider shrink-0">
              Clips ({availableAnimations.length}):
            </span>
            <select
              value={selectedAnimation}
              onChange={(e) => handleSelectAnimation(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-lg px-2 py-1 text-xs font-medium text-slate-800 outline-none cursor-pointer truncate max-w-[140px] sm:max-w-[200px]"
            >
              {availableAnimations.map((animName) => (
                <option key={animName} value={animName}>
                  {animName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
              isPlayingAnimation
                ? 'bg-orange-50 text-[#ea543a] border border-orange-200/80 hover:bg-orange-100'
                : 'bg-[#1e232d] text-white hover:bg-[#ea543a]'
            }`}
            title={isPlayingAnimation ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlayingAnimation ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span className="text-2xs">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="text-2xs">Play</span>
              </>
            )}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 transition-opacity">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#ea543a] animate-spin" />
          </div>
          <span className="text-xs font-semibold text-gray-600 tracking-tight">
            Loading 3D Model...
          </span>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">Notice</h4>
          <p className="text-xs text-slate-600 max-w-sm leading-relaxed mb-4">
            {loadError}
          </p>
        </div>
      )}
    </div>
  );
}
