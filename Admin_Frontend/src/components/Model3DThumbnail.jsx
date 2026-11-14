import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Box, RefreshCw } from 'lucide-react';

export default function Model3DThumbnail({ url, className = '' }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !mountRef.current) return;

    let isMounted = true;
    const container = mountRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // Studio Lights for crisp render preview
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const cleanUrl = url.split('?')[0];
    const isObj = cleanUrl.toLowerCase().endsWith('.obj');
    const loader = isObj ? new OBJLoader() : new GLTFLoader();

    loader.load(
      url,
      (data) => {
        if (!isMounted) return;
        const object = isObj ? data : data.scene;

        // Auto-center and fit bounds
        const bbox = new THREE.Box3().setFromObject(object);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        object.position.x = -center.x;
        object.position.y = -center.y;
        object.position.z = -center.z;

        const pivotGroup = new THREE.Group();
        pivotGroup.add(object);
        // Slightly rotate model at an attractive isometric 3D display angle
        pivotGroup.rotation.y = Math.PI / 5;
        pivotGroup.rotation.x = Math.PI / 18;
        scene.add(pivotGroup);

        // Adjust camera distance for optimal framing
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.45;
        camera.position.set(0, cameraDistance * 0.35, cameraDistance);
        camera.lookAt(0, 0, 0);

        // Render single static snapshot
        renderer.render(scene, camera);
        setLoading(false);
      },
      undefined,
      (err) => {
        if (!isMounted) return;
        console.warn('Failed to load 3D preview:', err);
        setError(true);
        setLoading(false);
      }
    );

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.render(scene, camera);
      }
    });
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [url]);

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <Box className="w-[2.6vw] h-[2.6vw] text-gray-400 stroke-1" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
          <RefreshCw className="w-[1.4vw] h-[1.4vw] text-[#ea543a] animate-spin" />
        </div>
      )}
      <div ref={mountRef} className="w-full h-full pointer-events-none" />
    </div>
  );
}
