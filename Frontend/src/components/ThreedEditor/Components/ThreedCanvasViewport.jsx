import React, { Suspense, useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { TransformControls, Environment } from "@react-three/drei";
import { DirectionalSunLight, SceneEnvironmentController } from "./SceneEnvironmentController";
import RenderModel from "./ModelLoaders";
import MeshSelectionHighlight from "./MeshSelectionHighlight";
import FloorRenderer from "./FloorRenderer";
import SmoothOrbitControls from "./SmoothOrbitControls";
import AnimatedGizmo from "./AnimatedGizmo";
import Hotspot3DOverlay from "./Hotspot3DOverlay";
import { builtInHdris, getRegisteredHdris } from "../../../data/hdriData";

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('[ModelErrorBoundary] Failed to render model:', error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function SceneWrapperSync({ sceneWrapperRef, rootTransform, resetKey }) {
  React.useEffect(() => {
    if (sceneWrapperRef && sceneWrapperRef.current && rootTransform) {
      const pos = rootTransform.position || { x: 0, y: 0, z: 0 };
      const rot = rootTransform.rotation || { x: 0, y: 0, z: 0 };
      const sc = rootTransform.scale || { x: 1, y: 1, z: 1 };

      sceneWrapperRef.current.position.set(pos.x ?? 0, pos.y ?? 0, pos.z ?? 0);
      sceneWrapperRef.current.rotation.set(rot.x ?? 0, rot.y ?? 0, rot.z ?? 0);
      sceneWrapperRef.current.scale.set(sc.x ?? 1, sc.y ?? 1, sc.z ?? 1);
      sceneWrapperRef.current.updateMatrix();
      sceneWrapperRef.current.updateMatrixWorld(true);
    }
  }, [resetKey, rootTransform]);

  return null;
}

export default function ThreedCanvasViewport({
  models,
  isPlacingHotspot,
  navMode,
  isSyncing,
  handleCanvasPointerDown,
  handlePointerMissed,
  glInstanceRef,
  cameraInstanceRef,
  sceneInstanceRef,
  isCapturing,
  materialSettings,
  sceneWrapperRef,
  modelRef,
  modelRefs,
  settings,
  xrayMode,
  xrayMaterials,
  handleSetModelStats,
  handleSetMaterialList,
  selectedMaterial,
  handleSelectMaterial,
  hotspots,
  activeHotspotId,
  transformMode,
  rootTransform,
  transformValues,
  meshTransformsState,
  customizedMaterials,
  hiddenMaterials,
  deletedMaterials,
  handleMaterialSync,
  selectedTexture,
  resetKey,
  transformResetKey,
  sceneResetTrigger,
  uvUnwrapTrigger,
  handleTextureApplied,
  handleTextureIdentified,
  handleTransformStart,
  handleTransformEnd,
  handleTransformChange,
  handleModelReady,
  handleModelProgress,
  isAnimationPlaying,
  handleHasAnimationsChange,
  handleHasRiggingChange,
  showGridLines,
  showAxis,
  lastHotspotClickTimeRef,
  isHotspotFocusingRef,
  canvasPointerDownPosRef,
  setSelectedMaterial,
  controlsRef,
  autoRotate,
  autoRotateSpeed,
  autoRotateAxis,
  autoRotateRange,
  handleControlsChange,
  isTextureOpen,
  showHotspotModal,
  handleHotspotClick,
  handleDeleteHotspot,
  setEditingHotspot,
  setShowHotspotModal,
  setIsPlacingHotspot,
  isPlacingHotspotRef,
  activeLeftTab = "model",
  cameraBgType = "transparent",
  cameraBgColor = "#F3F3F3",
  onSelectTexture
}) {
  const rawX = materialSettings.lightPosition?.x ?? 10;
  const rawY = materialSettings.lightPosition?.y ?? 10;
  const rawZ = materialSettings.lightPosition?.z ?? 10;

  const sunX = Math.abs(rawX) < 0.001 && Math.abs(rawY) < 0.001 ? 0.01 : rawX;
  const sunY = Math.max(1.5, rawZ);
  const sunZ = -(Math.abs(rawX) < 0.001 && Math.abs(rawY) < 0.001 ? 0.01 : rawY);

  const containerRef = useRef(null);
  const [marqueeBox, setMarqueeBox] = useState(null); // { startX, startY, currentX, currentY }
  const marqueeDragRef = useRef({ isDown: false, startX: 0, startY: 0, hasDragged: false });

  // Handle Box/Marquee Selection (Left-click drag when in "model" tab)
  const handleViewportPointerDown = useCallback((e) => {
    // Only engage box selection on left click (button === 0) when in model tab, not placing hotspots, and not panning
    if (activeLeftTab !== "model" || isPlacingHotspot || navMode === "pan" || e.button !== 0) {
      return;
    }
    // Don't intercept clicks on UI overlays/gizmo
    if (e.target && e.target.closest && e.target.closest('.pointer-events-auto, .lucide, button, input')) {
      return;
    }

    // Check if user is clicking or dragging the TransformControls gizmo
    const gl = glInstanceRef.current;
    const camera = cameraInstanceRef.current;
    const scene = sceneInstanceRef.current;
    if (gl && camera && scene) {
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      let hitGizmo = false;
      scene.traverse((obj) => {
        if (hitGizmo) return;
        if (obj.isTransformControls || obj.isTransformControlsGizmo || obj.isTransformControlsPlane || (obj.name && (obj.name.includes('TransformControls') || obj.name.includes('Gizmo')))) {
          const hits = raycaster.intersectObject(obj, true);
          if (hits && hits.length > 0) {
            hitGizmo = true;
          }
        }
      });
      if (hitGizmo) {
        return; // Click is on the gizmo handles/planes, do not trigger marquee box selection!
      }
    }

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    marqueeDragRef.current = {
      isDown: true,
      startX: x,
      startY: y,
      hasDragged: false
    };
  }, [activeLeftTab, isPlacingHotspot, navMode, glInstanceRef, cameraInstanceRef, sceneInstanceRef]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!marqueeDragRef.current.isDown) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const dx = Math.abs(currentX - marqueeDragRef.current.startX);
      const dy = Math.abs(currentY - marqueeDragRef.current.startY);

      if (!marqueeDragRef.current.hasDragged && (dx > 5 || dy > 5)) {
        marqueeDragRef.current.hasDragged = true;
      }

      if (marqueeDragRef.current.hasDragged) {
        setMarqueeBox({
          startX: marqueeDragRef.current.startX,
          startY: marqueeDragRef.current.startY,
          currentX,
          currentY
        });
      }
    };

    const handlePointerUp = (e) => {
      if (!marqueeDragRef.current.isDown) return;
      const wasDragging = marqueeDragRef.current.hasDragged;
      const startX = marqueeDragRef.current.startX;
      const startY = marqueeDragRef.current.startY;
      marqueeDragRef.current = { isDown: false, startX: 0, startY: 0, hasDragged: false };
      setMarqueeBox(null);

      if (!wasDragging) return;

      const container = containerRef.current;
      const camera = cameraInstanceRef.current;
      const sceneWrapper = sceneWrapperRef.current;
      if (!container || !camera || !sceneWrapper) return;

      const rect = container.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const boxLeft = Math.min(startX, endX);
      const boxRight = Math.max(startX, endX);
      const boxTop = Math.min(startY, endY);
      const boxBottom = Math.max(startY, endY);

      // Check if box has reasonable size (at least 8x8 px)
      if (boxRight - boxLeft < 8 && boxBottom - boxTop < 8) return;

      const cWidth = rect.width;
      const cHeight = rect.height;
      if (cWidth <= 0 || cHeight <= 0) return;

      // Project 3D meshes to screen-space 2D coordinates
      // Group meshes by model / root group
      const selectedMeshes = [];
      const tempVec = new THREE.Vector3();
      const tempBox = new THREE.Box3();

      sceneWrapper.traverse((child) => {
        if (!child.isMesh || child.visible === false) return;
        if (deletedMaterials && (deletedMaterials.has(child.uuid) || (child.name && deletedMaterials.has(child.name)))) {
          return;
        }

        // Get world bounding box of mesh
        child.updateWorldMatrix(true, false);
        if (!child.geometry) return;

        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        if (!child.geometry.boundingBox) return;

        tempBox.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);

        // Project center and 8 corners to 2D
        const points = [
          tempBox.getCenter(new THREE.Vector3()),
          new THREE.Vector3(tempBox.min.x, tempBox.min.y, tempBox.min.z),
          new THREE.Vector3(tempBox.max.x, tempBox.min.y, tempBox.min.z),
          new THREE.Vector3(tempBox.min.x, tempBox.max.y, tempBox.min.z),
          new THREE.Vector3(tempBox.max.x, tempBox.max.y, tempBox.min.z),
          new THREE.Vector3(tempBox.min.x, tempBox.min.y, tempBox.max.z),
          new THREE.Vector3(tempBox.max.x, tempBox.min.y, tempBox.max.z),
          new THREE.Vector3(tempBox.min.x, tempBox.max.y, tempBox.max.z),
          new THREE.Vector3(tempBox.max.x, tempBox.max.y, tempBox.max.z),
        ];

        let minProjX = Infinity, maxProjX = -Infinity;
        let minProjY = Infinity, maxProjY = -Infinity;
        let isBehindCamera = false;

        for (const pt of points) {
          tempVec.copy(pt);
          tempVec.project(camera);

          // Check if behind camera
          if (tempVec.z > 1) {
            isBehindCamera = true;
          }

          const screenX = ((tempVec.x + 1) / 2) * cWidth;
          const screenY = ((-tempVec.y + 1) / 2) * cHeight;

          if (screenX < minProjX) minProjX = screenX;
          if (screenX > maxProjX) maxProjX = screenX;
          if (screenY < minProjY) minProjY = screenY;
          if (screenY > maxProjY) maxProjY = screenY;
        }

        if (isBehindCamera) return;

        // Check 2D bounding box intersection with marquee box
        const intersects = !(
          maxProjX < boxLeft ||
          minProjX > boxRight ||
          maxProjY < boxTop ||
          minProjY > boxBottom
        );

        if (intersects) {
          selectedMeshes.push(child);
        }
      });

      if (selectedMeshes.length === 0) {
        if (selectedMaterial) setSelectedMaterial(null);
        return;
      }

      // Check if all meshes of a model are selected
      // Collect all meshes in each model
      const modelTotalMeshesMap = new Map();
      sceneWrapper.traverse((child) => {
        if (!child.isMesh || child.visible === false) return;
        if (deletedMaterials && (deletedMaterials.has(child.uuid) || (child.name && deletedMaterials.has(child.name)))) return;

        // Find which model this belongs to
        let cur = child;
        let foundModelId = null;
        while (cur && cur !== sceneWrapper) {
          if (cur.userData?.modelId) {
            foundModelId = cur.userData.modelId;
            break;
          }
          cur = cur.parent;
        }
        if (!foundModelId && models[0]) foundModelId = models[0].id;

        if (foundModelId) {
          if (!modelTotalMeshesMap.has(foundModelId)) modelTotalMeshesMap.set(foundModelId, []);
          modelTotalMeshesMap.get(foundModelId).push(child);
        }
      });

      // Check if selected meshes comprise all meshes of all models or single model
      const selectedUuids = new Set(selectedMeshes.map(m => m.uuid));
      const fullySelectedModelIds = [];

      modelTotalMeshesMap.forEach((allMeshes, mId) => {
        if (allMeshes.length > 0 && allMeshes.every(m => selectedUuids.has(m.uuid))) {
          fullySelectedModelIds.push(mId);
        }
      });

      // If all models in the entire scene are enclosed and more than 1 model exists
      if (models.length > 1 && fullySelectedModelIds.length === models.length) {
        handleSelectMaterial({
          name: "All Models",
          isAll: true,
          isModel: true,
          isShift: e.shiftKey
        });
        return;
      }

      // If a single model is completely enclosed and ONLY its meshes are selected
      if (fullySelectedModelIds.length === 1 && selectedMeshes.length === (modelTotalMeshesMap.get(fullySelectedModelIds[0])?.length || 0)) {
        const fullModel = models.find(m => m.id === fullySelectedModelIds[0]);
        if (fullModel) {
          handleSelectMaterial({
            name: fullModel.name,
            isAll: false,
            isModel: true,
            modelId: fullModel.id,
            id: fullModel.id,
            parentGroup: fullModel.name,
            isShift: e.shiftKey
          });
          return;
        }
      }

      // If single mesh selected
      if (selectedMeshes.length === 1) {
        const singleMesh = selectedMeshes[0];
        const m = singleMesh.userData?.__preXrayMaterial || singleMesh.material;
        const mat = Array.isArray(m) ? m[0] : m;
        // Find which model it belongs to
        let cur = singleMesh;
        let ownerModel = null;
        while (cur && cur !== sceneWrapper) {
          if (cur.userData?.modelId) {
            ownerModel = models.find(mod => mod.id === cur.userData.modelId);
            break;
          }
          cur = cur.parent;
        }
        if (!ownerModel && models.length === 1) ownerModel = models[0];

        handleSelectMaterial({
          name: singleMesh.name || "Mesh",
          meshName: singleMesh.name,
          uuid: singleMesh.uuid,
          meshUuid: singleMesh.uuid,
          material: mat?.name || "Solid Material",
          modelId: ownerModel?.id || null,
          parentGroup: ownerModel?.name || null,
          isMesh: true,
          isShift: e.shiftKey
        });
        return;
      }

      // Multiple meshes/materials selected (Batch multi-select across or within models)
      const multiItems = selectedMeshes.map(mesh => {
        const m = mesh.userData?.__preXrayMaterial || mesh.material;
        const mat = Array.isArray(m) ? m[0] : m;
        let cur = mesh;
        let ownerModel = null;
        while (cur && cur !== sceneWrapper) {
          if (cur.userData?.modelId) {
            ownerModel = models.find(mod => mod.id === cur.userData.modelId);
            break;
          }
          cur = cur.parent;
        }
        if (!ownerModel && models.length === 1) ownerModel = models[0];

        return {
          uuid: mesh.uuid,
          meshUuid: mesh.uuid,
          name: mesh.name || "Mesh",
          meshName: mesh.name || "Mesh",
          material: mat?.name || "Solid Material",
          modelId: ownerModel?.id || null,
          parentGroup: ownerModel?.name || null,
          isMesh: true
        };
      });

      handleSelectMaterial({
        name: "Multiple Selection",
        isGroup: true,
        isMultiSelect: true,
        items: multiItems,
        uuids: multiItems.map(it => it.uuid),
        meshNames: multiItems.map(it => it.meshName),
        materials: multiItems.map(it => it.material),
        isShift: e.shiftKey
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    activeLeftTab,
    models,
    deletedMaterials,
    cameraInstanceRef,
    sceneWrapperRef,
    handleSelectMaterial,
    selectedMaterial,
    setSelectedMaterial
  ]);

  const handleViewportDragOver = useCallback((e) => {
    const isMaterialDrag = e.dataTransfer.types.includes("application/json");
    if (isMaterialDrag) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleViewportDrop = useCallback((e) => {
    const rawJson = e.dataTransfer.getData("application/json");
    if (!rawJson) return;

    try {
      const materialItem = JSON.parse(rawJson);
      if (materialItem && (materialItem.id || materialItem.name)) {
        e.preventDefault();
        e.stopPropagation();

        // Raycast to find the exact mesh hovered under mouse
        const gl = glInstanceRef.current;
        const camera = cameraInstanceRef.current;
        const scene = sceneInstanceRef.current;
        if (gl && camera && scene) {
          const rect = gl.domElement.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

          const meshes = [];
          scene.traverse((obj) => {
            if (obj.isMesh && obj.visible) meshes.push(obj);
          });

          const hits = raycaster.intersectObjects(meshes, true);
          if (hits && hits.length > 0) {
            const hitMesh = hits[0].object;
            const mat = hitMesh.material;
            const singleMat = Array.isArray(mat) ? mat[0] : mat;
            handleSelectMaterial?.({
              id: hitMesh.uuid,
              uuid: hitMesh.uuid,
              meshUuid: hitMesh.uuid,
              name: hitMesh.name || "Mesh",
              meshName: hitMesh.name || "Mesh",
              material: singleMat?.name || "Solid Material",
              isMesh: true
            });
          }
        }

        // Apply texture
        if (onSelectTexture) {
          onSelectTexture(materialItem);
        }
      }
    } catch {
      // not a valid material drop item
    }
  }, [glInstanceRef, cameraInstanceRef, sceneInstanceRef, handleSelectMaterial, onSelectTexture]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handleViewportPointerDown}
      onDragOver={handleViewportDragOver}
      onDrop={handleViewportDrop}
      className={`flex-1 h-full w-full relative select-none ${isPlacingHotspot ? "cursor-crosshair" : navMode === "pan" ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* 2D Marquee Box Selection Overlay */}
      {marqueeBox && (
        <div
          className="absolute border border-white/90 bg-white/10 pointer-events-none z-30 rounded-[1px] shadow-sm"
          style={{
            left: Math.min(marqueeBox.startX, marqueeBox.currentX),
            top: Math.min(marqueeBox.startY, marqueeBox.currentY),
            width: Math.abs(marqueeBox.currentX - marqueeBox.startX),
            height: Math.abs(marqueeBox.currentY - marqueeBox.startY),
            borderStyle: "dashed",
            borderWidth: "1.5px"
          }}
        />
      )}
      {!isSyncing && (
        <Canvas
          camera={{ position: [2.0, 1.8, 2.7], fov: 45, near: 0.05, far: 1000 }}
          onPointerDown={handleCanvasPointerDown}
          onPointerMissed={handlePointerMissed}
          dpr={[1, 1.5]}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          shadows={{ type: THREE.PCFShadowMap }}
          onCreated={({ gl, camera, scene }) => {
            glInstanceRef.current = gl;
            cameraInstanceRef.current = camera;
            sceneInstanceRef.current = scene;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFShadowMap;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          {activeLeftTab !== "camera" && !isCapturing && (
            <color attach="background" args={['#424242']} />
          )}

                    {/* Dynamic Multi-Light Setup */}
          <ambientLight intensity={0.35 + (100 - (materialSettings.shadowDensity ?? materialSettings.shadow ?? 50)) / 280} />

          {(Array.isArray(materialSettings.lights) && materialSettings.lights.length > 0
            ? materialSettings.lights
            : [
                {
                  id: "light_1",
                  enabled: true,
                  position: materialSettings.lightPosition || { x: 10, y: 10, z: 10 },
                  color: materialSettings.lightColor || "#ffffff",
                  intensity: materialSettings.lightIntensity ?? 100,
                  shadowDensity: materialSettings.shadowDensity ?? materialSettings.shadow ?? 100,
                  shadowSoftness: materialSettings.shadowSoftness ?? materialSettings.softness ?? 50,
                  castShadow: true,
                }
              ]
          ).map((light, lIdx) => {
            if (!light.enabled) return null;
            const lRawX = light.position?.x ?? (lIdx === 0 ? 10 : -8);
            const lRawY = light.position?.y ?? (lIdx === 0 ? 10 : 8);
            const lRawZ = light.position?.z ?? (lIdx === 0 ? 10 : 10);

            const lSunX = Math.abs(lRawX) < 0.001 && Math.abs(lRawY) < 0.001 ? 0.01 : lRawX;
            const lSunY = Math.max(1.5, lRawZ);
            const lSunZ = -(Math.abs(lRawX) < 0.001 && Math.abs(lRawY) < 0.001 ? 0.01 : lRawY);

            const lightOpacityMultiplier = (light.opacity ?? 100) / 100;
            const effectiveIntensity = (light.intensity ?? 100) * lightOpacityMultiplier;

            return (
              <React.Fragment key={light.id || lIdx}>
                <DirectionalSunLight
                  position={[lSunX, lSunY, lSunZ]}
                  specular={materialSettings.specular}
                  softness={light.shadowSoftness ?? 50}
                  color={light.color || "#ffffff"}
                  intensity={effectiveIntensity}
                  shadowDensity={lIdx === 0 || light.castShadow ? (light.shadowDensity ?? 100) * lightOpacityMultiplier : 0}
                />

                {/* Soft auxiliary fill bounce per active light */}
                <directionalLight
                  position={[-lSunX * 0.4, Math.max(lSunY * 0.5, 3), -lSunZ * 0.4]}
                  intensity={0.25 * (effectiveIntensity / 100)}
                  color={light.color || "#ffffff"}
                  castShadow={false}
                />
              </React.Fragment>
            );
          })}

          <Suspense fallback={null}>
            <SceneWrapperSync sceneWrapperRef={sceneWrapperRef} rootTransform={rootTransform} resetKey={transformResetKey || resetKey} />
            <group ref={sceneWrapperRef}>
              {models.map((model, index) => {
                const defaultOffset = index === 0
                  ? { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
                  : { position: { x: (index % 2 === 1 ? 1 : -1) * Math.ceil(index / 2) * 3.5, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };
                const modelRootTransform = model.transform || defaultOffset;
                return (
                  <ModelErrorBoundary key={model.id} modelId={model.id}>
                    <RenderModel
                      modelId={model.id}
                    ref={(r) => {
                      if (index === 0) modelRef.current = r;
                      if (r) modelRefs.current.set(model.id, r);
                      else modelRefs.current.delete(model.id);
                    }}
                    type={model.type}
                    url={model.url}
                    wireframe={settings.wireframe}
                    xrayMode={xrayMode}
                    xrayMaterials={xrayMaterials}
                    setModelStats={(stats) => handleSetModelStats(model.id, stats)}
                    setMaterialList={(list, dataMap) => handleSetMaterialList(model.id, list, dataMap)}
                    selectedMaterial={selectedMaterial}
                    onSelectMaterial={handleSelectMaterial}
                    activeHotspotMeshUuid={hotspots.find(h => h.id === activeHotspotId)?.meshUuid || null}
                    activeHotspotMeshName={hotspots.find(h => h.id === activeHotspotId)?.meshName || null}
                    modelName={model.name}
                    transformMode={transformMode}
                    rootTransform={modelRootTransform}
                    transformValues={transformValues}
                    meshTransforms={meshTransformsState}
                    materialSettings={materialSettings}
                    customizedMaterials={customizedMaterials}
                    hiddenMaterials={hiddenMaterials}
                    deletedMaterials={deletedMaterials}
                    onUpdateMaterialSetting={handleMaterialSync}
                    selectedTexture={selectedTexture}
                    resetKey={resetKey}
                    transformResetKey={transformResetKey}
                    sceneResetTrigger={sceneResetTrigger}
                    uvUnwrapTrigger={uvUnwrapTrigger}
                    onTextureApplied={handleTextureApplied}
                    onTextureIdentified={handleTextureIdentified}
                    onTransformStart={handleTransformStart}
                    onTransformEnd={handleTransformEnd}
                    onTransformChange={handleTransformChange}
                    onModelReady={(bounds) => handleModelReady(model.id, bounds)}
                    onProgress={(pct, stage) => handleModelProgress(model.id, pct, stage)}
                    isAnimationPlaying={isAnimationPlaying}
                    onHasAnimationsChange={(hasAnim) => handleHasAnimationsChange(model.id, hasAnim)}
                    onHasRiggingChange={(hasRig) => handleHasRiggingChange && handleHasRiggingChange(model.id, hasRig)}
                  />
                  </ModelErrorBoundary>
                );
              })}
            </group>

            {transformMode && (selectedMaterial?.name === "Scene" || selectedMaterial?.isAll || selectedMaterial?.name === "All Models" || (models && models.length > 1 && selectedMaterial?.isAll)) && (
              <TransformControls
                object={sceneWrapperRef.current}
                mode={transformMode}
                size={0.8}
                onMouseDown={handleTransformStart}
                onObjectChange={() => {
                  if (handleTransformChange && sceneWrapperRef.current) {
                    handleTransformChange({
                      isModelLevel: true,
                      isAll: true,
                      position: sceneWrapperRef.current.position,
                      rotation: sceneWrapperRef.current.rotation,
                      scale: sceneWrapperRef.current.scale
                    });
                  }
                }}
                onMouseUp={handleTransformEnd}
              />
            )}

            {/* Global Scene Highlight when Select All is active across multiple models */}
            {(() => {
              if (!selectedMaterial || (!selectedMaterial.isAll && selectedMaterial.name !== "All Models")) return null;
              const allMeshes = [];
              if (sceneWrapperRef && sceneWrapperRef.current) {
                sceneWrapperRef.current.traverse((child) => {
                  if (child.isMesh && child.visible !== false) {
                    if (deletedMaterials && (deletedMaterials.has(child.uuid) || (child.name && deletedMaterials.has(child.name)))) return;
                    allMeshes.push(child);
                  }
                });
              }
              if (allMeshes.length === 0) return null;
              return <MeshSelectionHighlight key="all_models_highlight" target={allMeshes} />;
            })()}
          </Suspense>

          <FloorRenderer
            floorType={materialSettings?.floorType || (settings.base ? "solid" : "grid")}
            floorColor={materialSettings?.floorColor || settings.baseColor || "#1a1a20"}
            floorRoughness={materialSettings?.floorRoughness ?? 20}
            floorReflectivity={materialSettings?.floorReflectivity ?? 65}
            floorBlur={materialSettings?.floorBlur ?? 50}
            showGridLines={showGridLines}
            showAxis={showAxis}
            shadowDensity={materialSettings?.shadowDensity ?? materialSettings?.shadow ?? 100}
            isCapturing={isCapturing}
            activeLeftTab={activeLeftTab}
            onFloorClick={(e) => {
              if (e.intersections && e.intersections.length > 0 && e.intersections[0].object !== e.object) {
                return;
              }
              if (canvasPointerDownPosRef.current) {
                const dx = Math.abs(e.clientX - canvasPointerDownPosRef.current.x);
                const dy = Math.abs(e.clientY - canvasPointerDownPosRef.current.y);
                if (dx > 6 || dy > 6) return;
              }
              if (Date.now() - lastHotspotClickTimeRef.current < 200) return;
              if (isHotspotFocusingRef.current) return;
              if (selectedMaterial) {
                setSelectedMaterial(null);
              }
            }}
          />

          <SmoothOrbitControls
            ref={controlsRef}
            sceneWrapperRef={sceneWrapperRef}
            autoRotate={autoRotate}
            autoRotateSpeed={(autoRotateSpeed || 1.0) * 2.0}
            autoRotateAxis={autoRotateAxis}
            autoRotateRange={autoRotateRange}
            dampingFactor={0.08}
            momentumFriction={0.95}
            rotateSpeed={1.0}
            minDistance={0.5}
            maxDistance={100}
            navMode={navMode}
            isModelTab={activeLeftTab === "model"}
            onChange={handleControlsChange}
          />

          {models.length > 0 && !isCapturing && (
            <AnimatedGizmo
              isTextureOpen={isTextureOpen}
              activeTab={activeLeftTab || "properties"}
            />
          )}

          {models.length > 0 && !isCapturing && !showHotspotModal && (
            <Hotspot3DOverlay
              hotspots={hotspots}
              activeHotspotId={activeHotspotId}
              onHotspotClick={handleHotspotClick}
              onDeleteHotspot={handleDeleteHotspot}
              onEditHotspot={(hs) => {
                setEditingHotspot(hs);
                setShowHotspotModal(true);
              }}
              sceneWrapperRef={sceneWrapperRef}
            />
          )}

          <Suspense fallback={null}>
            {(() => {
              const allKnownHdris = getRegisteredHdris();
              const envSetting = materialSettings?.environment;
              const isBuiltin = typeof envSetting === 'string' && envSetting.startsWith('builtin_');
              const isCustom = (typeof envSetting === 'string' && envSetting.startsWith('custom_')) || (!envSetting && (materialSettings?.customEnvMap || materialSettings?.maps?.envMap));

              let resolvedFile = null;
              if (isBuiltin) {
                const found = allKnownHdris.find(h => `builtin_${h.id}` === envSetting || h.aliases?.some(a => `builtin_${a}` === envSetting));
                resolvedFile = found?.file || materialSettings?.customEnvMap || null;
              } else if (isCustom) {
                resolvedFile = materialSettings?.customEnvMap || materialSettings?.maps?.envMap || null;
              }

              // Only fall back to customEnvMap if current environment is not an explicit standard preset
              const standardPresets = ['apartment', 'city', 'dawn', 'forest', 'lobby', 'night', 'park', 'studio', 'sunset', 'warehouse'];
              const isStandardPreset = standardPresets.includes(envSetting);

              if (isStandardPreset) {
                resolvedFile = null;
              } else if (!resolvedFile && materialSettings?.customEnvMap) {
                resolvedFile = materialSettings.customEnvMap;
              }

              const usePreset = resolvedFile ? null : (isStandardPreset ? envSetting : 'studio');

              return (
                <Environment
                  {...(resolvedFile ? { files: resolvedFile } : { preset: usePreset })}
                  background={!isCapturing && activeLeftTab !== "camera"}
                  blur={(materialSettings?.worldBlur ?? 0) / 100}
                  environmentIntensity={(materialSettings?.reflection ?? 18) <= 50 ? ((materialSettings?.reflection ?? 18) / 50) : 1.0 + (((materialSettings?.reflection ?? 18) - 50) / 50) * 2.0}
                />
              );
            })()}
            <SceneEnvironmentController
              envRotation={materialSettings?.envRotation || 0}
              worldOpacity={materialSettings?.worldOpacity ?? 0}
              worldBlur={materialSettings?.worldBlur ?? 0}
              reflection={materialSettings?.reflection ?? 18}
              isCapturing={isCapturing}
              isCameraTab={activeLeftTab === "camera"}
              customBgColor={null}
            />
          </Suspense>
        </Canvas>
      )}

      {isPlacingHotspot && (
        <div className="absolute top-[1.2vw] left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-[0.7vw] bg-neutral-900/90 backdrop-blur-md px-[1.2vw] py-[0.55vw] rounded-full shadow-2xl border border-indigo-500/50 text-white text-[0.8vw]">
            <span className="relative flex h-[0.7vw] w-[0.7vw]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-[0.7vw] w-[0.7vw] bg-indigo-500"></span>
            </span>
            <span className="font-semibold text-white/95">Click anywhere on model to place hotspot pin</span>
            <button
              type="button"
              onClick={() => {
                setIsPlacingHotspot(false);
                if (isPlacingHotspotRef) isPlacingHotspotRef.current = false;
              }}
              className="ml-[0.3vw] px-[0.6vw] py-[0.2vw] rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[0.72vw] font-medium transition-colors cursor-pointer"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
