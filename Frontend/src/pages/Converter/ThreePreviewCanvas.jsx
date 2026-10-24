import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import JSZip from 'jszip';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js';
import { Loader2 } from 'lucide-react';

/**
 * Lightweight, memory-optimized 3D Canvas Previewer
 * Supports: GLB, OBJ, FBX, USDZ
 */
export default function ThreePreviewCanvas({
  blobUrl,
  format = 'GLB',
  autoRotate = true,
  className = ''
}) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 240;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
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

    const normalizeAndCenterModel = (object) => {
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

      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Center model
      object.position.x += -center.x;
      object.position.y += -box.min.y;
      object.position.z += -center.z;

      // Fit camera
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
      cameraZ = Math.max(cameraZ, 2.5);

      camera.position.set(cameraZ * 0.8, cameraZ * 0.7, cameraZ);
      controls.target.set(0, size.y / 2, 0);
      controls.update();

      setIsLoading(false);
    };

    if (fmt === 'GLB' || fmt === 'GLTF') {
      const loader = new GLTFLoader();
      loader.load(
        blobUrl,
        (gltf) => {
          normalizeAndCenterModel(gltf.scene || gltf.scenes[0]);
        },
        undefined,
        (err) => {
          console.error('Error loading GLTF preview:', err);
          if (isMounted) setIsLoading(false);
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
                color: 0xdadada, // #dadada requested material color
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
    } else if (fmt === 'FBX') {
      (async () => {
        try {
          const resp = await fetch(blobUrl);
          const buffer = await resp.arrayBuffer();
          if (!isMounted) return;
          const loader = new FBXLoader();
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
                  color: 0xdadada, // #dadada requested material color
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

          normalizeAndCenterModel(object);
        } catch (err) {
          console.error('Error loading FBX preview:', err);
          if (isMounted) setIsLoading(false);
        }
      })();
    } else if (fmt === 'USDZ') {
      (async () => {
        try {
          const response = await fetch(blobUrl);
          const buffer = await response.arrayBuffer();
          if (!isMounted) return;
          const loader = new USDLoader();
          const object = loader.parse(buffer);

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
          if (isMounted) setIsLoading(false);
        }
      })();
    }

    // Animation Loop
    const animate = () => {
      if (!isMounted) return;
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

  return (
    <div className={`relative w-full h-full min-h-[200px] rounded-xl overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
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
    </div>
  );
}
