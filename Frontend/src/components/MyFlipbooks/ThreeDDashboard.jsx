import React, { useState, useEffect, useMemo, useRef, Suspense, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF, Center } from '@react-three/drei';
import RenderModel from '../ThreedEditor/Components/ModelLoaders';
import {
  Box,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Eye,
  Wrench,
  Share2,
  Download,
  X,
  RotateCcw,
  Heart,
  CloudUpload,
  Sparkles,
  ChevronDown,
  Info,
  ArrowRight,
  Layers,
  Sliders,
  Maximize2,
  Check
} from 'lucide-react';
import { Icon } from '@iconify/react';
import dashboardBannerImg from '../../assets/Dashboard/Main.png';
import { resolveUploadsPath } from '../../utils/assetUtils';
import AlertModal from '../AlertModal';
import ThreeDBanner from './ThreeDBanner';

// Helper to construct cache-busting URLs for 3D models and thumbnails
const buildVersionedUrl = (rawPath, updatedAt, uploadedAt) => {
  if (!rawPath) return null;
  const resolved = resolveUploadsPath(rawPath);
  if (!resolved) return null;
  const timestamp = updatedAt ? new Date(updatedAt).getTime() : (uploadedAt ? new Date(uploadedAt).getTime() : '');
  if (!timestamp) return resolved;
  return resolved.includes('?') ? `${resolved}&v=${timestamp}` : `${resolved}?v=${timestamp}`;
};

// Safe error boundary for model canvas preview to prevent crash on corrupted files
class ThumbnailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('[ModelPreview] preview error:', err?.message || err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} />
        </mesh>
      );
    }
    return this.props.children;
  }
}

// Auto-fit wrapper: dynamically calculates the precise bounding box of all model meshes,
// normalizes scale so any large/small model fits cleanly in view, and centers it at (0, 0, 0).
const AutoFitModel = ({ children, targetSize = 1.9 }) => {
  const groupRef = useRef();
  const [isFitted, setIsFitted] = useState(false);
  const fittedRef = useRef(false);

  const computeFit = useCallback(() => {
    const group = groupRef.current;
    if (!group) return false;

    // Temporarily reset group transforms so we measure true geometry dimensions
    group.position.set(0, 0, 0);
    group.scale.set(1, 1, 1);
    group.rotation.set(0, 0, 0);
    group.updateMatrixWorld(true);

    const box = new THREE.Box3();
    let hasMesh = false;

    group.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        if (child.geometry) {
          if (!child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
          }
          child.updateWorldMatrix(true, false);
          const meshBox = new THREE.Box3().setFromObject(child);
          if (!meshBox.isEmpty()) {
            box.union(meshBox);
            hasMesh = true;
          }
        }
      }
    });

    if (!hasMesh || box.isEmpty()) return false;

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    if (!isFinite(maxDim) || maxDim <= 0.0001) return false;

    const center = new THREE.Vector3();
    box.getCenter(center);

    // Calculate scale factor so the model's largest dimension matches targetSize
    const scale = targetSize / maxDim;
    group.scale.setScalar(scale);

    // Center the model exactly at world origin (0, 0, 0)
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    group.updateMatrixWorld(true);

    return true;
  }, [targetSize]);

  useEffect(() => {
    fittedRef.current = false;
    setIsFitted(false);
  }, [children]);

  useFrame(() => {
    if (!fittedRef.current) {
      if (computeFit()) {
        fittedRef.current = true;
        setIsFitted(true);
      }
    }
  });

  return (
    <group ref={groupRef} visible={isFitted}>
      {children}
    </group>
  );
};

// 3D Model Card Preview with auto-fit centering and static 3/4 perspective
const ModelCardPreview = ({ model }) => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const fullThumbnailUrl = buildVersionedUrl(model.thumbnailUrl, model.updatedAt, model.uploadedAt);
  const fullUrl = buildVersionedUrl(model.url, model.updatedAt, model.uploadedAt);

  useEffect(() => {
    if (fullThumbnailUrl || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fullThumbnailUrl, fullUrl]);

  if (fullThumbnailUrl) {
    return (
      <img
        src={fullThumbnailUrl}
        alt={model.displayName || model.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center bg-[#f8fafc]">
      {isInView && fullUrl ? (
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          camera={{ fov: 32, position: [2.8, 2.0, 3.2] }}
        >
          <Suspense
            fallback={
              <Html center className="pointer-events-none">
                <div className="flex flex-col items-center justify-center gap-[0.4vw]">
                  <div className="w-[1.2vw] h-[1.2vw] border-2 border-gray-200 border-t-[#ea543a] rounded-full animate-spin" />
                  <span className="text-[0.6vw] font-semibold text-gray-400">Loading 3D...</span>
                </div>
              </Html>
            }
          >
            <ambientLight intensity={1.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <directionalLight position={[-5, 8, 5]} intensity={1.2} />

            {/* Dynamic Auto-Fit ensures tall, wide, or huge CAD models are perfectly centered and scaled */}
            <AutoFitModel targetSize={1.9}>
              <ThumbnailErrorBoundary>
                <RenderModel
                  type={model.type}
                  url={fullUrl}
                  isSelectionDisabled={true}
                  shouldClone={true}
                />
              </ThumbnailErrorBoundary>
            </AutoFitModel>

            <Environment preset="city" />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
              target={[0, 0, 0]}
              autoRotate={false}
            />
          </Suspense>
        </Canvas>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <Icon icon="ph:cube-duotone" className="w-[2.2vw] h-[2.2vw] text-slate-300 group-hover:text-[#ea543a] transition-colors" />
        </div>
      )}
    </div>
  );
};

export default function ThreeDDashboard({
  navigate: propNavigate,
  activeFolder,
  onUploadModel,
  onAddToFlipbook,
  onCountsChange
} = {}) {
  const internalNavigate = useNavigate();
  const navigate = propNavigate || internalNavigate;
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recent', 'favorites', 'trash'

  // Sync with activeFolder prop from sidebar
  useEffect(() => {
    if (!activeFolder) return;
    const lower = activeFolder.toLowerCase();
    if (lower.includes('recent')) {
      setActiveTab('recent');
    } else if (lower.includes('favorite')) {
      setActiveTab('favorites');
    } else if (lower.includes('trash')) {
      setActiveTab('trash');
    } else if (lower.includes('all')) {
      setActiveTab('all');
    }
  }, [activeFolder]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'glb', 'obj', 'fbx'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'public', 'private'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'name', 'size'
  const [isMultipleSelection, setIsMultipleSelection] = useState(false);
  const [selectedModelIds, setSelectedModelIds] = useState([]);

  // Favorites state set
  const [favorites, setFavorites] = useState(new Set());

  // Dropdown menus
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [modelNameInput, setModelNameInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [duplicateConfirm, setDuplicateConfirm] = useState(null); // { file, displayName }

  // Rename modal
  const [renamingModel, setRenamingModel] = useState(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete Alert
  const [deletingModel, setDeletingModel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview & Mesh Stats Modal
  const [previewModel, setPreviewModel] = useState(null);

  // Storage UI state
  const [isUpgradeCardClosed, setIsUpgradeCardClosed] = useState(false);

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Load User & Favorites from storage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('user_profile');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const savedFavs = localStorage.getItem('3d_model_favorites');
      if (savedFavs) {
        setFavorites(new Set(JSON.parse(savedFavs)));
      }
      const isUpgradeClosed = localStorage.getItem('hide_upgrade_card') === 'true';
      setIsUpgradeCardClosed(isUpgradeClosed);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsTypeFilterOpen(false);
        setIsStatusFilterOpen(false);
        setIsSortOpen(false);
      }
      if (!e.target.closest('.card-more-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch 3D models
  const fetchModels = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('user_profile');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        const res = await axios.get(`${backendUrl}/api/3d-models/get-models`, {
          params: { emailId: u.emailId }
        });
        setModels(res.data.models || []);
      }
    } catch (err) {
      console.error('Error fetching 3D models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();

    // Listen for model saves broadcast from ThreedEditor across tabs or views
    let bc;
    try {
      bc = new BroadcastChannel('threed_model_updates');
      bc.onmessage = (event) => {
        if (event.data?.type === 'model-saved') {
          // Clear useGLTF cache for models to free stale buffers
          try {
            if (typeof useGLTF?.clear === 'function') {
              useGLTF.clear();
            }
          } catch (_) {}
          fetchModels();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // Also re-fetch when returning to the dashboard tab/window to ensure fresh data
    const handleFocus = () => {
      fetchModels();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Favorite toggle
  const toggleFavorite = (modelId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      try {
        localStorage.setItem('3d_model_favorites', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Filter & Sort Models
  const filteredModels = useMemo(() => {
    return models
      .filter((m) => {
        const title = (m.displayName || m.name || '').toLowerCase();
        const matchesSearch = title.includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (activeTab === 'favorites' && !favorites.has(m.modelId)) return false;
        if (activeTab === 'recent') {
          const uploaded = new Date(m.uploadedAt || 0).getTime();
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (uploaded < sevenDaysAgo) return false;
        }

        // Folder filter when a custom folder is selected in FlipbooksSidebar
        if (
          activeTab === 'all' &&
          activeFolder &&
          activeFolder !== 'All Models' &&
          activeFolder !== 'All'
        ) {
          const folderLower = activeFolder.toLowerCase();
          const modelCategory = (m.category || '').toLowerCase();
          const modelFolder = (m.folder || '').toLowerCase();
          const matchCategory = modelCategory.includes(folderLower) || folderLower.includes(modelCategory);
          const matchFolder = modelFolder === folderLower;
          const matchName = title.includes(folderLower);
          if (!matchCategory && !matchFolder && !matchName) return false;
        }

        if (typeFilter === 'glb') {
          const isGlb = m.type === 'glb' || m.type === 'gltf' || m.name?.endsWith('.glb') || m.name?.endsWith('.gltf');
          if (!isGlb) return false;
        } else if (typeFilter === 'obj') {
          const isObj = m.type === 'obj' || m.name?.endsWith('.obj');
          if (!isObj) return false;
        } else if (typeFilter === 'fbx') {
          const isFbx = m.type === 'fbx' || m.type === 'stl' || m.name?.endsWith('.fbx') || m.name?.endsWith('.stl');
          if (!isFbx) return false;
        }

        if (statusFilter === 'public' && m.isPrivate) return false;
        if (statusFilter === 'private' && !m.isPrivate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
        if (sortBy === 'oldest') return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
        if (sortBy === 'name') return (a.displayName || a.name).localeCompare(b.displayName || b.name);
        if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
        return 0;
      });
  }, [models, searchQuery, activeTab, activeFolder, favorites, typeFilter, statusFilter, sortBy]);

  // Counts for sidebar tabs
  const allCount = models.length;
  const recentCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return models.filter((m) => new Date(m.uploadedAt || 0).getTime() >= sevenDaysAgo).length;
  }, [models]);
  const favCount = useMemo(() => models.filter((m) => favorites.has(m.modelId)).length, [models, favorites]);

  // Sync model counts with FlipbooksSidebar
  useEffect(() => {
    onCountsChange?.({ allCount, recentCount, favCount });
  }, [allCount, recentCount, favCount, onCountsChange]);

  // Safely format model size string or number (handles "3.20 MB", raw bytes number, etc.)
  const formatModelSize = (size) => {
    if (!size && size !== 0) return '';
    if (typeof size === 'string') {
      const trimmed = size.trim();
      if (!trimmed || trimmed === '0' || trimmed === '0 B' || trimmed === '0 MB' || trimmed === '0.0 MB') return '';
      // If it already includes a unit like MB, KB, GB
      if (/[a-zA-Z]/.test(trimmed)) {
        return trimmed;
      }
      const num = parseFloat(trimmed);
      if (isNaN(num) || num <= 0) return '';
      if (num > 10000) {
        return (num / (1024 * 1024)).toFixed(1) + ' MB';
      }
      return num.toFixed(1) + ' MB';
    }
    if (typeof size === 'number' && !isNaN(size) && size > 0) {
      if (size > 10000) {
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
      }
      return size.toFixed(1) + ' MB';
    }
    return '';
  };

  // Parse bytes for storage calculation
  const parseModelBytes = (size) => {
    if (!size) return 0;
    if (typeof size === 'number') {
      if (isNaN(size) || size <= 0) return 0;
      return size > 10000 ? size : size * 1024 * 1024;
    }
    if (typeof size === 'string') {
      const s = size.trim().toLowerCase();
      const val = parseFloat(s);
      if (isNaN(val) || val <= 0) return 0;
      if (s.includes('gb')) return val * 1024 * 1024 * 1024;
      if (s.includes('mb')) return val * 1024 * 1024;
      if (s.includes('kb')) return val * 1024;
      if (val > 10000) return val;
      return val * 1024 * 1024;
    }
    return 0;
  };

  // If some models have missing/zero size in DB, fetch content-length in background
  useEffect(() => {
    if (!models || models.length === 0) return;
    models.forEach((m) => {
      const formatted = formatModelSize(m.size);
      if (!formatted && m.url) {
        const fullUrl = resolveUploadsPath(m.url);
        fetch(fullUrl, { method: 'HEAD' })
          .then((res) => {
            const cl = res.headers.get('content-length');
            if (cl) {
              const bytes = parseInt(cl, 10);
              if (bytes > 0) {
                const mbStr = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                setModels((prev) =>
                  prev.map((item) => (item.modelId === m.modelId ? { ...item, size: mbStr } : item))
                );
              }
            }
          })
          .catch(() => {});
      }
    });
  }, [models.length]);

  // Storage calculation
  const totalSizeBytes = useMemo(() => models.reduce((acc, m) => acc + parseModelBytes(m.size), 0), [models]);
  const storageTotal = 300 * 1024 * 1024; // 300 MB limit
  const storagePercent = Math.min(100, Math.round((totalSizeBytes / storageTotal) * 100));
  const formatMB = (bytes) => {
    const safeBytes = typeof bytes === 'number' ? bytes : parseModelBytes(bytes);
    if (safeBytes <= 0) return '0 MB';
    const mb = safeBytes / (1024 * 1024);
    if (mb < 0.1) return '0.1 MB';
    if (mb < 100) return `${parseFloat(mb.toFixed(1))} MB`;
    return `${Math.round(mb)} MB`;
  };

  const userName = user?.name || user?.emailId?.split('@')[0] || 'User';

  const handleLaunchEditor = (modelId = null) => {
    if (modelId) {
      navigate(`/editor/threed_editor/${modelId}`);
    } else {
      navigate('/editor/threed_editor');
    }
  };

  const executeUpload = async (fileToUpload, displayName, forceNew = false) => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('user_profile');
    if (!storedUser) {
      setUploadError('User session missing. Please log in.');
      return;
    }
    const u = JSON.parse(storedUser);

    setIsUploading(true);
    setUploadProgress(15);
    setUploadError('');

    try {
      const uploadId = 'up_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', '0');
      formData.append('totalChunks', '1');
      formData.append('fileName', fileToUpload.name);
      formData.append('emailId', u.emailId);
      formData.append('chunk', fileToUpload);
      if (forceNew) {
        formData.append('forceNew', 'true');
      }
      if (displayName && displayName.trim()) {
        formData.append('displayName', displayName.trim());
      }

      const res = await axios.post(`${backendUrl}/api/3d-models/upload-chunk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setModelNameInput('');
      setDuplicateConfirm(null);
      fetchModels();

      const newModelId = res.data?.modelId || res.data?.model?.modelId;
      if (newModelId) {
        handleLaunchEditor(newModelId);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.message || 'Failed to upload 3D model.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a 3D model file (.glb, .gltf, .obj, .fbx, .stl)');
      return;
    }

    const cleanInputName = modelNameInput.trim().toLowerCase();
    const rawFileName = uploadFile.name.toLowerCase();
    const cleanFileName = uploadFile.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

    // Check if a model with the same file name or title already exists in the user's collection
    const existingMatch = models.find((m) => {
      const mName = (m.name || '').toLowerCase();
      const mDisplay = (m.displayName || '').toLowerCase();
      const mBaseName = mName.replace(/\.[^/.]+$/, '');
      return (
        mName === rawFileName ||
        mBaseName === cleanFileName ||
        (cleanInputName && (mDisplay === cleanInputName || mBaseName === cleanInputName))
      );
    });

    if (existingMatch) {
      setDuplicateConfirm({
        file: uploadFile,
        displayName: modelNameInput.trim(),
        existingName: existingMatch.displayName || existingMatch.name
      });
      return;
    }

    await executeUpload(uploadFile, modelNameInput.trim(), false);
  };

  const handleRenameSubmit = async () => {
    if (!renamingModel || !newNameInput.trim()) return;
    const storedUser = localStorage.getItem('user') || localStorage.getItem('user_profile');
    if (!storedUser) return;
    const u = JSON.parse(storedUser);

    setIsRenaming(true);
    try {
      await axios.post(`${backendUrl}/api/3d-models/rename-model`, {
        emailId: u.emailId,
        modelId: renamingModel.modelId,
        oldName: renamingModel.name,
        newName: newNameInput.trim()
      });
      setRenamingModel(null);
      setNewNameInput('');
      fetchModels();
    } catch (err) {
      console.error('Rename error:', err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingModel) return;
    const storedUser = localStorage.getItem('user') || localStorage.getItem('user_profile');
    if (!storedUser) return;
    const u = JSON.parse(storedUser);

    setIsDeleting(true);
    try {
      const emailEncoded = encodeURIComponent(u.emailId);
      await axios.delete(`${backendUrl}/api/3d-models/delete-model/${emailEncoded}/${deletingModel.modelId}`);
      setDeletingModel(null);
      fetchModels();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedModelIds || selectedModelIds.length === 0) return;
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('user_profile');
      if (!storedUser) return;
      const u = JSON.parse(storedUser);
      const emailEncoded = encodeURIComponent(u.emailId);
      await Promise.all(
        selectedModelIds.map((id) =>
          axios.delete(`${backendUrl}/api/3d-models/delete-model/${emailEncoded}/${id}`)
        )
      );
      setSelectedModelIds([]);
      setIsMultipleSelection(false);
      fetchModels();
    } catch (err) {
      console.error('Bulk delete error:', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto pl-[0.2vw] pr-[0.4vw] select-none text-slate-800">
      {/* TOP 3D BANNER (Unified with FlipbooksBanner styling & split into file) */}
      <ThreeDBanner
        user={user}
        onImportClick={() => setIsUploadModalOpen(true)}
        onLaunchEditor={() => handleLaunchEditor()}
        onViewPresets={() => {
          setTypeFilter('all');
          setStatusFilter('all');
          setSearchQuery('');
        }}
      />

      {/* CONTROLS & FILTER HEADER BAR (Exact FlipbooksToolbar styling & size) */}
      <div className="w-full mb-[0.8vw] relative z-20 flex-shrink-0">
        <h2 className="text-[1.15vw] font-bold text-[#1f2937] mb-[0.6vw]">
          {activeFolder === 'Recent' || activeTab === 'recent'
            ? 'Recent'
            : activeTab === 'favorites'
            ? 'Favorites'
            : activeTab === 'trash'
            ? 'Trash'
            : 'All Models'}
        </h2>

        <div className="flex items-center justify-between w-full" ref={menuRef}>
          {/* Left: Search & Filter Dropdowns */}
          <div className="flex items-center gap-[0.75vw]">
            {/* Search Input */}
            <div className="relative w-[15vw]">
              <Search className="absolute left-[0.9vw] top-1/2 -translate-y-1/2 text-[#ec5137]" size="0.95vw" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[2.4vw] pr-[1vw] py-[0.5vw] rounded-[0.6vw] border border-gray-200 text-[0.84vw] focus:outline-none focus:border-[#ec5137] focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-sm transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size="0.85vw" />
                </button>
              )}
            </div>

            {/* All 3D Formats Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTypeFilterOpen(!isTypeFilterOpen);
                  setIsStatusFilterOpen(false);
                  setIsSortOpen(false);
                }}
                className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
              >
                <Box size="0.9vw" className="text-[#ec5137]" />
                <span>{typeFilter === 'all' ? 'All 3D Formats' : typeFilter.toUpperCase()}</span>
                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
              </button>
              {isTypeFilterOpen && (
                <div className="absolute top-full left-0 mt-[0.25vw] min-w-[10vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden">
                  {['all', 'glb', 'obj', 'fbx'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setTypeFilter(tf);
                        setIsTypeFilterOpen(false);
                      }}
                      className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                        typeFilter === tf
                          ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                          : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                      }`}
                    >
                      {tf === 'all' ? 'All 3D Formats' : tf.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* All Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsStatusFilterOpen(!isStatusFilterOpen);
                  setIsTypeFilterOpen(false);
                  setIsSortOpen(false);
                }}
                className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
              >
                <Icon icon="lucide:disc" className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
                <span>{statusFilter === 'all' ? 'All Status' : (statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1))}</span>
                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
              </button>
              {isStatusFilterOpen && (
                <div className="absolute top-full left-0 mt-[0.25vw] min-w-[9vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden">
                  {['all', 'public', 'private'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setIsStatusFilterOpen(false);
                      }}
                      className={`w-full text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                        statusFilter === st
                          ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                          : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                      }`}
                    >
                      {st === 'all' ? 'All Status' : (st.charAt(0).toUpperCase() + st.slice(1))}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort by Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsTypeFilterOpen(false);
                  setIsStatusFilterOpen(false);
                }}
                className="flex items-center gap-[0.45vw] px-[0.9vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.6vw] text-[0.84vw] text-gray-700 hover:bg-gray-50 shadow-sm font-medium cursor-pointer"
              >
                <Icon icon="lucide:arrow-down-up" className="w-[0.9vw] h-[0.9vw] text-[#ec5137]" />
                <span>Sort by - <span className="text-gray-500 font-normal">
                  {sortBy === 'recent' ? 'Recently Created' : sortBy === 'oldest' ? 'Oldest First' : sortBy === 'name' ? 'Name (A → Z)' : 'File Size'}
                </span></span>
                <ChevronDown size="0.85vw" className="text-gray-400 ml-[0.3vw]" />
              </button>
              {isSortOpen && (
                <div className="absolute top-full left-0 mt-[0.25vw] min-w-[12vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-xl z-50 overflow-hidden">
                  {[
                    { id: 'recent', label: 'Recently Created' },
                    { id: 'oldest', label: 'Oldest First' },
                    { id: 'name', label: 'Name (A → Z)' },
                    { id: 'size', label: 'File Size' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortBy(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between text-left px-[1vw] py-[0.48vw] text-[0.8vw] transition-colors cursor-pointer first:rounded-t-[0.55vw] last:rounded-b-[0.55vw] ${
                        sortBy === opt.id
                          ? 'bg-[#fff5f3] text-[#ec5137] font-semibold'
                          : 'text-gray-700 hover:bg-[#fff5f3] hover:text-[#ec5137]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check size="0.75vw" className="text-[#ec5137]" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Actions & Multiple Selection Checkbox */}
          <div className="flex items-center gap-[1vw]">
            {selectedModelIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.4vw] bg-white text-red-500 border border-red-200 rounded-[0.5vw] hover:bg-red-50 transition-colors shadow-sm text-[0.75vw] font-semibold cursor-pointer"
              >
                <Trash2 size="0.9vw" /> Delete ({selectedModelIds.length})
              </button>
            )}

            <label
              className="flex items-center gap-[0.5vw] cursor-pointer select-none"
              onClick={(e) => {
                e.preventDefault();
                if (!isMultipleSelection) {
                  setIsMultipleSelection(true);
                  setSelectedModelIds(filteredModels.map((m) => m.modelId));
                } else {
                  if (selectedModelIds.length === filteredModels.length && filteredModels.length > 0) {
                    setSelectedModelIds([]);
                    setIsMultipleSelection(false);
                  } else {
                    setSelectedModelIds(filteredModels.map((m) => m.modelId));
                  }
                }
              }}
            >
              <div
                className={`w-[1.1vw] h-[1.1vw] rounded-[0.2vw] border flex items-center justify-center transition-all ${
                  isMultipleSelection && selectedModelIds.length === filteredModels.length && filteredModels.length > 0
                    ? 'bg-gray-700 border-gray-700'
                    : 'border-gray-400 bg-white'
                }`}
              >
                {isMultipleSelection && selectedModelIds.length === filteredModels.length && filteredModels.length > 0 && (
                  <Check size="0.75vw" className="text-white" strokeWidth={3} />
                )}
              </div>
              <span className="text-[0.85vw] font-medium text-gray-600">Multiple Selection</span>
            </label>
          </div>
        </div>
      </div>

        {/* 3D MODELS LIST / EMPTY STATE */}
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14vw,16.5vw))] gap-[1.2vw]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full h-[15vw] min-h-[220px] bg-white rounded-[0.9vw] border border-gray-200 animate-pulse p-[0.9vw]" />
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          /* EMPTY STATE (Matching screenshot & 100% 3D buttons) */
          <div className="w-full bg-white rounded-[1.1vw] border border-gray-200/80 p-[2.5vw] text-center shadow-[0_0.15vw_1vw_rgba(0,0,0,0.02)]">
            <div className="w-[3.8vw] h-[3.8vw] rounded-[0.9vw] bg-[#fff5f3] text-[#ea543a] flex items-center justify-center mx-auto mb-[0.9vw]">
              <Icon icon="ph:cube-bold" className="w-[2vw] h-[2vw]" />
            </div>
            <h3 className="text-[1.1vw] font-bold text-gray-900">No 3D Models Found</h3>
            <p className="text-[0.82vw] text-gray-500 mt-[0.25vw] mb-[1.2vw]">
              {searchQuery
                ? `No 3D models matching "${searchQuery}".`
                : 'Import your first 3D model file (.glb, .gltf, .obj, .fbx, .stl) or launch the 3D Studio Editor.'}
            </p>
            <div className="flex items-center justify-center gap-[0.8vw]">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-[1.2vw] py-[0.55vw] bg-[#ea543a] hover:bg-[#d4432c] text-white rounded-[0.55vw] text-[0.82vw] font-semibold transition-all inline-flex items-center gap-[0.45vw] cursor-pointer shadow-sm"
              >
                <Plus className="w-[0.95vw] h-[0.95vw]" />
                <span>Import 3D Model</span>
              </button>
              <button
                onClick={() => handleLaunchEditor()}
                className="px-[1.2vw] py-[0.55vw] bg-slate-900 hover:bg-black text-white rounded-[0.55vw] text-[0.82vw] font-semibold transition-all inline-flex items-center gap-[0.45vw] cursor-pointer shadow-sm"
              >
                <Icon icon="ph:cube-bold" className="w-[0.95vw] h-[0.95vw]" />
                <span>Launch 3D Editor</span>
              </button>
            </div>
          </div>
        ) : (
          /* CARD GRID (Reduced Width, Real-time 3D Model Preview, Minimalist Layout) */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14vw,16.5vw))] gap-[1.2vw]">
            {filteredModels.map((model) => {
              const title = model.displayName || model.name || 'Untitled 3D Model';
              const isFav = favorites.has(model.modelId);
              const isSelected = selectedModelIds.includes(model.modelId);
              const fileType = (model.type || model.name.split('.').pop() || 'glb').toUpperCase();
              const sizeMB = formatModelSize(model.size);
              const createdDate = model.uploadedAt
                ? new Date(model.uploadedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : '';

              return (
                <div
                  key={model.modelId}
                  className={`group bg-white rounded-[0.9vw] border transition-all duration-200 flex flex-col relative ${
                    activeMenuId === model.modelId ? 'z-30 ring-1 ring-gray-300' : 'z-10'
                  } ${
                    isSelected ? 'border-[#ea543a] ring-2 ring-[#ea543a]/20 shadow-md' : 'border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Thumbnail / 3D Canvas Preview Container */}
                  <div className="w-full h-[9.5vw] min-h-[140px] rounded-t-[0.9vw] bg-slate-50 border-b border-gray-100 relative flex items-center justify-center overflow-hidden">
                    <ModelCardPreview model={model} />

                    {/* Format Badge Top Left */}
                    <span className="absolute top-[0.45vw] left-[0.45vw] bg-black/65 backdrop-blur-xs text-white text-[0.58vw] font-bold px-[0.38vw] py-[0.12vw] rounded-[0.25vw] pointer-events-none z-10">
                      {fileType}
                    </span>

                    {/* Checkbox (if multiple selection enabled) or Favorite Top Right */}
                    <div className="absolute top-[0.45vw] right-[0.45vw] flex items-center gap-[0.3vw] z-10">
                      {isMultipleSelection ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedModelIds((prev) =>
                              prev.includes(model.modelId)
                                ? prev.filter((id) => id !== model.modelId)
                                : [...prev, model.modelId]
                            );
                          }}
                          className="w-[0.9vw] h-[0.9vw] rounded text-[#ea543a] focus:ring-[#ea543a] cursor-pointer"
                        />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(model.modelId);
                          }}
                          className="w-[1.6vw] h-[1.6vw] rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-gray-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          title="Favorite"
                        >
                          <Heart
                            className={`w-[0.85vw] h-[0.85vw] ${isFav ? 'text-rose-500 fill-rose-500' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-[0.75vw] flex flex-col justify-between flex-1 space-y-[0.55vw]">
                    <div>
                      <div className="flex items-start justify-between gap-[0.4vw]">
                        <h3
                          className="text-[0.82vw] font-bold text-gray-800 line-clamp-1 hover:text-[#ea543a] cursor-pointer transition-colors"
                          onClick={() => handleLaunchEditor(model.modelId)}
                          title={title}
                        >
                          {title}
                        </h3>

                        {/* Three Dots More Menu Dropdown */}
                        <div className="relative card-more-menu shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === model.modelId ? null : model.modelId);
                            }}
                            className="p-[0.2vw] text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-[0.85vw] h-[0.85vw]" />
                          </button>

                          {activeMenuId === model.modelId && (
                            <div className="absolute right-0 top-full mt-[0.25vw] w-[8.8vw] min-w-[120px] bg-white border border-gray-200/90 rounded-[0.55vw] shadow-xl py-[0.25vw] z-50">
                              {/* 1. File info */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewModel(model);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-gray-700 hover:bg-[#fff5f3] hover:text-[#ea543a] flex items-center gap-[0.4vw] cursor-pointer transition-colors"
                              >
                                <Info className="w-[0.8vw] h-[0.8vw]" />
                                <span>File info</span>
                              </button>

                              {/* 2. Rename */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingModel(model);
                                  setNewNameInput(model.displayName || model.name);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-gray-700 hover:bg-[#fff5f3] hover:text-[#ea543a] flex items-center gap-[0.4vw] cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-[0.8vw] h-[0.8vw]" />
                                <span>Rename</span>
                              </button>

                              {/* 3. Delete */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingModel(model);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-[0.4vw] cursor-pointer transition-colors border-t border-gray-100"
                              >
                                <Trash2 className="w-[0.8vw] h-[0.8vw]" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File Metadata (Simplified) */}
                      <p className="text-[0.68vw] text-gray-400 font-medium mt-[0.15vw]">
                        {[sizeMB, createdDate].filter(Boolean).join(' • ') || 'WebGL Model'}
                      </p>
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      onClick={() => handleLaunchEditor(model.modelId)}
                      className="w-full py-[0.38vw] bg-[#fff5f3] hover:bg-[#ea543a] text-[#ea543a] hover:text-white rounded-[0.45vw] text-[0.74vw] font-semibold transition-all flex items-center justify-center gap-[0.3vw] cursor-pointer"
                    >
                      <Icon icon="ph:cube-bold" className="w-[0.8vw] h-[0.8vw]" />
                      <span>Open 3D Editor</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* UPLOAD 3D MODEL MODAL (100% vw styling) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[1vw] bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[1.1vw] p-[1.4vw] w-[32vw] max-w-[90vw] shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-[0.7vw] border-b border-gray-100">
              <div className="flex items-center gap-[0.55vw]">
                <div className="w-[2vw] h-[2vw] rounded-[0.5vw] bg-[#fff5f3] text-[#ea543a] flex items-center justify-center">
                  <CloudUpload className="w-[1.1vw] h-[1.1vw]" />
                </div>
                <div>
                  <h3 className="text-[0.95vw] font-bold text-gray-900">Import 3D Model Asset</h3>
                  <p className="text-[0.68vw] text-gray-400">Supports GLTF, GLB, OBJ, FBX, STL</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-[1.1vw] h-[1.1vw]" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-[0.9vw] space-y-[0.9vw]">
              {uploadError && (
                <div className="p-[0.55vw] rounded-[0.45vw] bg-rose-50 border border-rose-200 text-rose-600 text-[0.72vw] font-medium">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-[0.72vw] font-semibold text-gray-700 mb-[0.25vw]">
                  3D Model Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Industrial Machinery Mesh 3D"
                  value={modelNameInput}
                  onChange={(e) => setModelNameInput(e.target.value)}
                  className="w-full px-[0.75vw] py-[0.5vw] bg-gray-50 border border-gray-200 rounded-[0.55vw] text-[0.8vw] focus:outline-none focus:border-[#ea543a]"
                />
              </div>

              <div>
                <label className="block text-[0.72vw] font-semibold text-gray-700 mb-[0.25vw]">
                  Select 3D Asset File
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#ea543a] bg-gray-50 hover:bg-[#fff5f3]/40 rounded-[0.75vw] p-[1.3vw] text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".glb,.gltf,.obj,.fbx,.stl"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) {
                        setUploadFile(f);
                        if (!modelNameInput) setModelNameInput(f.name.replace(/\.[^/.]+$/, ''));
                      }
                    }}
                  />
                  <Box className="w-[1.8vw] h-[1.8vw] text-[#ea543a] mx-auto mb-[0.4vw]" />
                  {uploadFile ? (
                    <div>
                      <p className="text-[0.8vw] font-bold text-gray-800">{uploadFile.name}</p>
                      <p className="text-[0.68vw] text-[#ea543a] font-semibold mt-[0.15vw]">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB - Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[0.8vw] font-semibold text-gray-700">Click to choose 3D file</p>
                      <p className="text-[0.65vw] text-gray-400 mt-[0.15vw]">Supported: .glb, .gltf, .obj, .fbx, .stl</p>
                    </div>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-[0.25vw]">
                  <div className="flex justify-between text-[0.72vw] font-semibold text-gray-700">
                    <span>Uploading 3D Model...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-[0.28vw] bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ea543a] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-[0.55vw] pt-[0.7vw] border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-gray-600 hover:bg-gray-100 rounded-[0.45vw] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="px-[1.1vw] py-[0.45vw] bg-[#ea543a] hover:bg-[#d4432c] disabled:opacity-50 text-white text-[0.78vw] font-semibold rounded-[0.45vw] shadow-sm transition-all cursor-pointer"
                >
                  {isUploading ? 'Uploading...' : 'Import & Open 3D Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME MODAL (100% vw styling) */}
      {renamingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[1vw] bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[1.1vw] p-[1.4vw] w-[26vw] max-w-[90vw] shadow-2xl border border-gray-200">
            <h3 className="text-[0.95vw] font-bold text-gray-900">Rename 3D Model</h3>
            <p className="text-[0.72vw] text-gray-500 mt-[0.15vw]">Enter a new name for this 3D asset.</p>
            <input
              type="text"
              value={newNameInput}
              onChange={(e) => setNewNameInput(e.target.value)}
              className="w-full px-[0.75vw] py-[0.5vw] bg-gray-50 border border-gray-200 rounded-[0.55vw] text-[0.8vw] mt-[0.7vw] focus:outline-none focus:border-[#ea543a]"
              autoFocus
            />
            <div className="flex items-center justify-end gap-[0.55vw] mt-[1vw]">
              <button
                onClick={() => setRenamingModel(null)}
                className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-gray-600 hover:bg-gray-100 rounded-[0.45vw] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={isRenaming || !newNameInput.trim()}
                className="px-[1.1vw] py-[0.45vw] bg-[#ea543a] hover:bg-[#d4432c] text-white text-[0.78vw] font-semibold rounded-[0.45vw] shadow-sm cursor-pointer"
              >
                {isRenaming ? 'Saving...' : 'Save Name'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE INFO MODAL (Interactive 3D Viewer & Metadata) */}
      {previewModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[1vw] bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[1.1vw] p-[1.4vw] w-[34vw] max-w-[90vw] shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-[0.7vw] border-b border-gray-100">
              <div className="flex items-center gap-[0.5vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.45vw] bg-[#fff5f3] text-[#ea543a] flex items-center justify-center">
                  <Info className="w-[1vw] h-[1vw]" />
                </div>
                <div>
                  <h3 className="text-[0.95vw] font-bold text-gray-900">File Information</h3>
                  <p className="text-[0.68vw] text-gray-400 truncate max-w-[22vw]">
                    {previewModel.displayName || previewModel.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModel(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-[0.2vw] rounded-full hover:bg-gray-100"
              >
                <X className="w-[1.1vw] h-[1.1vw]" />
              </button>
            </div>

            <div className="py-[1vw] text-center space-y-[0.8vw]">
              {/* Interactive 3D Model Inspector Box */}
              <div className="w-full h-[13vw] min-h-[200px] rounded-[0.75vw] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {previewModel.url ? (
                  <Canvas
                    style={{ width: '100%', height: '100%' }}
                    camera={{ fov: 32, position: [2.5, 2.0, 3.8] }}
                  >
                    <Suspense
                      fallback={
                        <Html center className="pointer-events-none">
                          <div className="flex flex-col items-center justify-center gap-[0.4vw]">
                            <div className="w-[1.4vw] h-[1.4vw] border-2 border-white/20 border-t-[#ea543a] rounded-full animate-spin" />
                            <span className="text-[0.65vw] font-semibold text-white/80">Loading 3D View...</span>
                          </div>
                        </Html>
                      }
                    >
                      <ambientLight intensity={1.8} />
                      <pointLight position={[10, 10, 10]} intensity={1.5} />
                      <directionalLight position={[-5, 8, 5]} intensity={1.2} />

                      <Center>
                        <group scale={0.7}>
                          <ThumbnailErrorBoundary>
                            <RenderModel
                              type={previewModel.type}
                              url={buildVersionedUrl(previewModel.url, previewModel.updatedAt, previewModel.uploadedAt)}
                              isSelectionDisabled={true}
                              shouldClone={true}
                            />
                          </ThumbnailErrorBoundary>
                        </group>
                      </Center>

                      <Environment preset="city" />

                      <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        autoRotate={false}
                      />
                    </Suspense>
                  </Canvas>
                ) : previewModel.thumbnailUrl ? (
                  <img
                    src={buildVersionedUrl(previewModel.thumbnailUrl, previewModel.updatedAt, previewModel.uploadedAt)}
                    alt={previewModel.name}
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Icon icon="ph:cube-duotone" className="w-[2.8vw] h-[2.8vw] text-[#ea543a]" />
                    <span className="text-[0.75vw] font-semibold text-gray-300 mt-[0.4vw]">
                      {(previewModel.type || 'GLB').toUpperCase()} WebGL Mesh Asset
                    </span>
                  </div>
                )}

                <span className="absolute bottom-[0.5vw] right-[0.6vw] text-[0.6vw] text-white/40 pointer-events-none">
                  Drag to rotate • Scroll to zoom
                </span>
              </div>

              {/* Detailed File Metadata Grid */}
              <div className="grid grid-cols-2 gap-[0.7vw] text-[0.72vw] text-left bg-gray-50 p-[0.75vw] rounded-[0.55vw] border border-gray-100">
                <div>
                  <span className="text-gray-400">File Name:</span>
                  <p className="font-semibold text-gray-800 truncate" title={previewModel.name}>{previewModel.name}</p>
                </div>
                <div>
                  <span className="text-gray-400">File Size:</span>
                  <p className="font-semibold text-gray-800">
                    {formatModelSize(previewModel.size) || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Asset Format:</span>
                  <p className="font-semibold text-gray-800 uppercase">{previewModel.type || 'GLB'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Upload Date:</span>
                  <p className="font-semibold text-gray-800">
                    {previewModel.uploadedAt ? new Date(previewModel.uploadedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-[0.55vw] pt-[0.7vw] border-t border-gray-100">
              <button
                onClick={() => setPreviewModel(null)}
                className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-gray-600 hover:bg-gray-100 rounded-[0.45vw] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPreviewModel(null);
                  handleLaunchEditor(previewModel.modelId);
                }}
                className="px-[1.1vw] py-[0.45vw] bg-[#ea543a] hover:bg-[#d4432c] text-white text-[0.78vw] font-semibold rounded-[0.45vw] flex items-center gap-[0.35vw] cursor-pointer shadow-sm"
              >
                <Icon icon="ph:cube-bold" className="w-[0.85vw] h-[0.85vw]" />
                <span>Open in 3D Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION ALERT */}
      {deletingModel && (
        <AlertModal
          isOpen={!!deletingModel}
          title="Delete 3D Model Asset?"
          message={`Are you sure you want to delete "${deletingModel.displayName || deletingModel.name}"? This action cannot be undone.`}
          confirmText="Delete 3D Model"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingModel(null)}
          loading={isDeleting}
        />
      )}

      {/* DUPLICATE MODEL CONFIRMATION ALERT */}
      {duplicateConfirm && (
        <AlertModal
          isOpen={!!duplicateConfirm}
          type="warning"
          title="Model Already Exists"
          message={`A 3D model named "${duplicateConfirm.existingName}" already exists in your workspace.\n\nDo you want to add it again as a new model?`}
          confirmText="Add as New Model"
          cancelText="Cancel"
          showCancel={true}
          onConfirm={() => {
            const { file, displayName } = duplicateConfirm;
            setDuplicateConfirm(null);
            executeUpload(file, displayName, true);
          }}
          onClose={() => setDuplicateConfirm(null)}
          isLoading={isUploading}
        />
      )}
    </div>
  );
}
