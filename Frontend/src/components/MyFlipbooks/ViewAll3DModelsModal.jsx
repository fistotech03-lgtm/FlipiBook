import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import axios from "axios";
import { X, Search, Plus, Eye, Check } from "lucide-react";
import RenderModel from "../ThreedEditor/Components/ModelLoaders";
import { resolveUploadsPath } from "../../utils/assetUtils";
import { useAuth } from "../../context/AuthContext";
import { RECENT_3D_PRESETS } from "./recent3dPresets";

class ThumbnailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#888888" roughness={0.5} />
        </mesh>
      );
    }
    return this.props.children;
  }
}

const AutoFitModel = ({ children, targetSize = 1.9 }) => {
  const groupRef = useRef();
  const fittedRef = useRef(false);

  const computeFit = useCallback(() => {
    const group = groupRef.current;
    if (!group) return false;

    group.position.set(0, 0, 0);
    group.scale.set(1, 1, 1);
    group.rotation.set(0, 0, 0);
    group.updateMatrixWorld(true);

    const box = new THREE.Box3();
    let hasMesh = false;

    group.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        if (child.geometry) {
          if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
          if (child.geometry.boundingBox) {
            const geomBox = child.geometry.boundingBox.clone();
            geomBox.applyMatrix4(child.matrixWorld);
            box.union(geomBox);
            hasMesh = true;
          }
        }
      }
    });

    if (!hasMesh || box.isEmpty()) return false;

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0.0001 && isFinite(maxDim)) {
      const scaleFactor = targetSize / maxDim;
      group.scale.setScalar(scaleFactor);
      const center = new THREE.Vector3();
      box.getCenter(center);
      group.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
      group.updateMatrixWorld(true);
      return true;
    }
    return false;
  }, [targetSize]);

  useFrame(() => {
    if (!fittedRef.current) {
      if (computeFit()) fittedRef.current = true;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

export default function ViewAll3DModelsModal({
  isOpen,
  onClose,
  uploadedModels = [],
  onOpenInEditor,
  onAddToFlipbook,
  onViewPreset
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'presets' | 'uploaded'
  const [searchQuery, setSearchQuery] = useState("");
  const [dbPresets, setDbPresets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPresets();
    }
  }, [isOpen]);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await axios.get(`${backendUrl}/api/presets/models`).catch(() => ({ data: { models: [] } }));
      setDbPresets(res.data?.models || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Combine standard 5 presets + any backend default models
  const allPresets = useMemo(() => {
    const list = [...RECENT_3D_PRESETS];
    (dbPresets || []).forEach((dbm) => {
      if (!list.some((p) => p.name.toLowerCase() === dbm.name.toLowerCase())) {
        list.push({
          id: dbm.id || dbm.modelId,
          name: dbm.name,
          title: dbm.name,
          format: (dbm.type || 'GLB').toUpperCase(),
          size: dbm.size || '10 MB',
          category: dbm.category || 'Preset',
          categoryColor: 'bg-orange-50 text-orange-600 border-orange-200',
          image: dbm.thumbnailUrl || null,
          modelUrl: dbm.url || '/chair.glb',
          isDb: true
        });
      }
    });
    return list;
  }, [dbPresets]);

  // Unified items
  const combinedItems = useMemo(() => {
    const presetItems = allPresets.map((p) => ({ ...p, isPreset: true }));
    const uploadedItems = uploadedModels.map((m) => ({
      ...m,
      id: m.modelId,
      name: m.displayName || m.name,
      title: m.displayName || m.name,
      format: (m.type || m.name?.split('.').pop() || 'GLB').toUpperCase(),
      size: m.size || 'N/A',
      category: 'Uploaded',
      categoryColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      isPreset: false,
      modelUrl: m.url
    }));

    if (activeTab === 'presets') return presetItems;
    if (activeTab === 'uploaded') return uploadedItems;
    return [...presetItems, ...uploadedItems];
  }, [allPresets, uploadedModels, activeTab]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (item.name || '').toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q);
    });
  }, [combinedItems, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[1.5vw] bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-[1vw] w-[64vw] max-w-[1080px] h-[40vw] max-h-[680px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-[1.4vw] py-[0.85vw] border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-[1vw]">
            <div>
              <h2 className="text-[1.15vw] font-bold text-slate-900 tracking-tight">Available 3D Models</h2>
              <p className="text-[0.72vw] text-slate-500">
                Browse presets and your uploaded 3D assets ({combinedItems.length} items)
              </p>
            </div>

            {/* Segmented filter pills */}
            <div className="flex items-center bg-slate-100 p-[0.18vw] rounded-full text-[0.72vw]">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-[0.8vw] py-[0.25vw] rounded-full transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                All ({allPresets.length + uploadedModels.length})
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`px-[0.8vw] py-[0.25vw] rounded-full transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-white text-[#ec5137] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Presets ({allPresets.length})
              </button>
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`px-[0.8vw] py-[0.25vw] rounded-full transition-all cursor-pointer ${
                  activeTab === 'uploaded'
                    ? 'bg-white text-[#ec5137] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                My Uploads ({uploadedModels.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[0.7vw]">
            {/* Search */}
            <div className="relative w-[13vw]">
              <Search className="absolute left-[0.7vw] top-1/2 -translate-y-1/2 text-slate-400" size="0.85vw" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[2vw] pr-[0.8vw] py-[0.35vw] bg-slate-50 border border-slate-200 rounded-full text-[0.75vw] focus:outline-none focus:border-[#ec5137] focus:bg-white text-slate-700 font-normal"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size="0.75vw" />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-[1.9vw] h-[1.9vw] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size="1.1vw" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-[1.2vw] bg-[#f8f9fc] min-h-0">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[5vw] text-slate-400">
              <Icon icon="ph:cube-light" className="w-[3.2vw] h-[3.2vw] text-slate-300 mb-[0.6vw]" />
              <p className="text-[0.9vw] font-bold text-slate-700">No 3D Models Found</p>
              <p className="text-[0.72vw] text-slate-400 mt-[0.1vw]">
                {searchQuery ? `No models matching "${searchQuery}"` : 'No models available in this tab.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-[0.9vw]">
              {filteredItems.map((item) => (
                <div
                  key={item.id || item.modelId || item.name}
                  className="group bg-white rounded-[0.85vw] p-[0.75vw] border border-slate-200/90 hover:border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="w-full h-[8.5vw] min-h-[110px] rounded-[0.55vw] bg-slate-50 flex items-center justify-center relative overflow-hidden border border-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-[0.4vw] group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Icon icon="ph:cube-duotone" className="w-[2.4vw] h-[2.4vw] text-[#ec5137]" />
                        <span className="text-[0.65vw] font-semibold text-slate-500 mt-[0.3vw]">{item.format} 3D Model</span>
                      </div>
                    )}
                    <span className="absolute top-[0.4vw] left-[0.4vw] bg-black/60 backdrop-blur-xs text-white text-[0.55vw] font-bold px-[0.35vw] py-[0.1vw] rounded-[0.25vw]">
                      {item.format}
                    </span>
                    {item.isPreset && (
                      <span className="absolute top-[0.4vw] right-[0.4vw] bg-[#ec5137] text-white text-[0.52vw] font-bold px-[0.35vw] py-[0.1vw] rounded-[0.25vw] uppercase">
                        Preset
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="mt-[0.6vw] flex flex-col space-y-[0.3vw]">
                    <h3 className="text-[0.82vw] font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <div className="flex items-center text-[0.68vw] text-slate-400 font-medium">
                      <span>{item.format}</span>
                      <span className="mx-[0.3vw]">•</span>
                      <span>{item.size}</span>
                    </div>

                    <div>
                      <span className={`inline-block px-[0.5vw] py-[0.1vw] rounded-[0.3vw] text-[0.6vw] font-semibold border ${item.categoryColor || 'bg-slate-100 text-slate-600'}`}>
                        {item.category}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-[auto_1fr] gap-[0.4vw] pt-[0.4vw]">
                      <button
                        type="button"
                        onClick={() => {
                          onViewPreset && onViewPreset(item);
                        }}
                        className="flex items-center justify-center gap-[0.25vw] px-[0.65vw] py-[0.4vw] rounded-[0.4vw] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[0.72vw] font-semibold cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye size="0.75vw" className="text-slate-500" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onAddToFlipbook && onAddToFlipbook(item);
                        }}
                        className="flex items-center justify-center gap-[0.25vw] px-[0.65vw] py-[0.4vw] rounded-[0.4vw] bg-[#ec5137] hover:bg-[#d4432c] text-white text-[0.72vw] font-semibold cursor-pointer shadow-2xs transition-colors truncate"
                      >
                        <Plus size="0.75vw" strokeWidth={2.5} />
                        <span className="truncate">Add to Flipbook</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-[1.4vw] py-[0.7vw] bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[0.72vw] text-slate-500">
            Showing <strong className="text-slate-800">{filteredItems.length}</strong> 3D assets
          </span>
          <button
            onClick={onClose}
            className="px-[1vw] py-[0.4vw] bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.75vw] font-semibold rounded-[0.4vw] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

