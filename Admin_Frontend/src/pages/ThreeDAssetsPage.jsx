import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Sun,
  Layers,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileBox,
  Sparkles,
  UploadCloud,
  X
} from 'lucide-react';
import CustomColorPicker from '../components/CustomColorPicker';
import {
  get3DModels,
  upload3DModel,
  update3DModel,
  delete3DModel,
  get3DHdris,
  upload3DHdri,
  update3DHdri,
  delete3DHdri,
  get3DMaterials,
  upload3DMaterial,
  update3DMaterial,
  delete3DMaterial
} from '../services/adminApi';

export default function ThreeDAssetsPage() {
  const [activeTab, setActiveTab] = useState('models'); // 'models' | 'hdris' | 'materials'
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusMsg, setStatusMsg] = useState(null);

  // Data states
  const [models, setModels] = useState([]);
  const [hdris, setHdris] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Custom Delete Confirmation Modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    name: '',
    loading: false
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    description: '',
    color: '#ffffff',
    metallic: 0,
    roughness: 50,
    alpha: 100
  });

  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const previewInputRef = useRef(null);

  // Material maps refs
  const mapInputRef = useRef(null);
  const normalMapInputRef = useRef(null);
  const roughnessMapInputRef = useRef(null);
  const metalnessMapInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [removedFiles, setRemovedFiles] = useState([]);
  const [dragActiveField, setDragActiveField] = useState(null);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Generate object URLs for image preview & clean up
  const handleAssignFile = (key, file) => {
    if (!file) return;
    setRemovedFiles((prev) => prev.filter((k) => k !== key));
    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => {
        if (prev[key]) URL.revokeObjectURL(prev[key]);
        return { ...prev, [key]: url };
      });
    }
  };

  const handleRemoveFile = (key, e) => {
    if (e) e.stopPropagation();
    setRemovedFiles((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setSelectedFiles((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPreviewUrls((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleDropFile = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAssignFile(key, e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(key);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(null);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'models') {
        const res = await get3DModels();
        if (res.success) setModels(res.data || []);
      } else if (activeTab === 'hdris') {
        const res = await get3DHdris();
        if (res.success) setHdris(res.data || []);
      } else if (activeTab === 'materials') {
        const res = await get3DMaterials();
        if (res.success) setMaterials(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load 3D assets:', err);
      showStatus('error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSearch('');
    setCategoryFilter('All');
  }, [activeTab]);

  const handleOpenModal = () => {
    // Revoke any existing preview URLs
    Object.values(previewUrls).forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore invalid blob url revoking
      }
    });

    setEditingItem(null);
    setFormData({
      name: '',
      category: activeTab === 'hdris' ? 'Studio' : 'General',
      description: '',
      color: '#ffffff',
      metallic: 0,
      roughness: 50,
      alpha: 100
    });
    setSelectedFiles({});
    setPreviewUrls({});
    setRemovedFiles([]);
    setShowColorPicker(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    Object.values(previewUrls).forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    });

    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || (activeTab === 'hdris' ? 'Studio' : 'General'),
      description: item.description || '',
      color: item.color || '#ffffff',
      metallic: item.metallic !== undefined && item.metallic !== null ? item.metallic : 0,
      roughness: item.roughness !== undefined && item.roughness !== null ? item.roughness : 50,
      alpha: item.alpha !== undefined && item.alpha !== null ? item.alpha : 100
    });

    setSelectedFiles({});
    setRemovedFiles([]);

    const initialPreviews = {};
    if (activeTab === 'models') {
      if (item.thumbnailUrl) initialPreviews.thumbnail = item.thumbnailUrl;
    } else if (activeTab === 'hdris') {
      if (item.preview) initialPreviews.preview = item.preview;
    } else if (activeTab === 'materials') {
      if (item.preview) initialPreviews.preview = item.preview;
      if (item.maps) {
        Object.keys(item.maps).forEach((k) => {
          if (item.maps[k]) initialPreviews[k] = item.maps[k];
        });
      }
    }
    setPreviewUrls(initialPreviews);
    setShowColorPicker(false);
    setIsModalOpen(true);
  };

  const handleFileChange = (key, e) => {
    if (e.target.files && e.target.files[0]) {
      handleAssignFile(key, e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showStatus('error', 'Please provide a name');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    if (formData.description) payload.append('description', formData.description);

    setUploading(true);
    const targetId = editingItem?._id || editingItem?.id;
    if (removedFiles.length > 0) {
      payload.append('removedFiles', JSON.stringify(removedFiles));
    }

    try {
      if (activeTab === 'models') {
        if (!editingItem && !selectedFiles.modelFile) {
          showStatus('error', '3D model file (.glb/.gltf/.obj) is required');
          setUploading(false);
          return;
        }
        if (selectedFiles.modelFile) payload.append('modelFile', selectedFiles.modelFile);
        if (selectedFiles.thumbnail) payload.append('thumbnail', selectedFiles.thumbnail);

        if (editingItem) {
          await update3DModel(targetId, payload);
          showStatus('success', '3D Model updated successfully!');
        } else {
          await upload3DModel(payload);
          showStatus('success', '3D Model added to 3D Editor gallery successfully!');
        }
      } else if (activeTab === 'hdris') {
        if (!editingItem && !selectedFiles.hdriFile) {
          showStatus('error', 'HDRI environment file (.hdr/.exr) is required');
          setUploading(false);
          return;
        }
        if (selectedFiles.hdriFile) payload.append('hdriFile', selectedFiles.hdriFile);
        if (selectedFiles.preview) payload.append('preview', selectedFiles.preview);

        if (editingItem) {
          await update3DHdri(targetId, payload);
          showStatus('success', 'HDRI Environment updated successfully!');
        } else {
          await upload3DHdri(payload);
          showStatus('success', 'HDRI Environment added to 3D Editor successfully!');
        }
      } else if (activeTab === 'materials') {
        // Albedo / Base map is mandatory only on new creation
        if (!editingItem && !selectedFiles.map) {
          showStatus('error', 'Albedo / Base Map is mandatory for PBR materials');
          setUploading(false);
          return;
        }

        if (selectedFiles.preview) payload.append('preview', selectedFiles.preview);
        if (selectedFiles.map) payload.append('map', selectedFiles.map);
        if (selectedFiles.normalMap) payload.append('normalMap', selectedFiles.normalMap);
        if (selectedFiles.roughnessMap) payload.append('roughnessMap', selectedFiles.roughnessMap);
        if (selectedFiles.metalnessMap) payload.append('metalnessMap', selectedFiles.metalnessMap);

        if (formData.color) payload.append('color', formData.color);
        payload.append('metallic', formData.metallic);
        payload.append('roughness', formData.roughness);
        payload.append('alpha', formData.alpha);

        if (editingItem) {
          await update3DMaterial(targetId, payload);
          showStatus('success', 'Preset Material updated successfully!');
        } else {
          await upload3DMaterial(payload);
          showStatus('success', 'Preset Material added to 3D Editor successfully!');
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      console.error('Save failed:', err);
      showStatus('error', err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const promptDelete = (id, name) => {
    setDeleteConfirm({
      isOpen: true,
      id,
      name,
      loading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    try {
      if (activeTab === 'models') await delete3DModel(deleteConfirm.id);
      else if (activeTab === 'hdris') await delete3DHdri(deleteConfirm.id);
      else if (activeTab === 'materials') await delete3DMaterial(deleteConfirm.id);

      showStatus('success', `Deleted "${deleteConfirm.name}"`);
      setDeleteConfirm({ isOpen: false, id: null, name: '', loading: false });
      loadData();
    } catch (err) {
      showStatus('error', err.response?.data?.message || err.message);
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const currentList = activeTab === 'models' ? models : activeTab === 'hdris' ? hdris : materials;
  const filteredList = currentList.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...new Set(currentList.map((i) => i.category || 'General'))];

  return (
    <div className="flex flex-col gap-[1.2vw]">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.3vw] font-semibold text-gray-900 tracking-tight">3D Editor Asset Hub</h1>
          <p className="text-[0.78vw] text-gray-500 mt-[0.1vw]">
            Manage predefined 3D models, HDRI environments, and PBR materials synced live with the 3D Editor.
          </p>
        </div>

        <div className="flex items-center gap-[0.6vw]">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-[0.35vw] px-[0.75vw] py-[0.4vw] bg-white border border-gray-200 rounded-[0.45vw] text-[0.74vw] font-medium text-gray-700 hover:bg-gray-50 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-[0.85vw] h-[0.85vw] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center gap-[0.35vw] px-[0.95vw] py-[0.42vw] bg-[#ea543a] hover:bg-[#d43d24] text-white rounded-[0.45vw] text-[0.76vw] font-medium shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-[0.9vw] h-[0.9vw]" />
            <span>
              Upload {activeTab === 'models' ? '3D Model' : activeTab === 'hdris' ? 'HDRI' : 'Material'}
            </span>
          </button>
        </div>
      </div>

      {/* ── STATUS BANNER ── */}
      {statusMsg && (
        <div
          className={`flex items-center gap-[0.5vw] px-[0.85vw] py-[0.5vw] rounded-[0.45vw] text-[0.76vw] font-normal animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-[0.95vw] h-[0.95vw] text-emerald-600" />
          ) : (
            <AlertCircle className="w-[0.95vw] h-[0.95vw] text-red-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ── TAB BAR ── */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-[0.35vw]">
        <div className="flex items-center gap-[0.4vw]">
          <button
            type="button"
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-[0.35vw] px-[0.85vw] py-[0.4vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all cursor-pointer ${
              activeTab === 'models'
                ? 'bg-[#151c28] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Box className="w-[0.9vw] h-[0.9vw]" />
            <span>Predefined Models</span>
            <span className="text-[0.66vw] opacity-75 font-normal">({models.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hdris')}
            className={`flex items-center gap-[0.35vw] px-[0.85vw] py-[0.4vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all cursor-pointer ${
              activeTab === 'hdris'
                ? 'bg-[#151c28] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sun className="w-[0.9vw] h-[0.9vw]" />
            <span>HDRI Environments</span>
            <span className="text-[0.66vw] opacity-75 font-normal">({hdris.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-[0.35vw] px-[0.85vw] py-[0.4vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-[#151c28] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-[0.9vw] h-[0.9vw]" />
            <span>PBR Materials</span>
            <span className="text-[0.66vw] opacity-75 font-normal">({materials.length})</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-[0.5vw]">
          <div className="relative">
            <Search className="w-[0.85vw] h-[0.85vw] text-gray-400 absolute left-[0.6vw] top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-[1.9vw] pr-[0.8vw] py-[0.35vw] bg-white border border-gray-200 rounded-[0.45vw] text-[0.76vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ea543a] w-[14vw]"
            />
          </div>

          <div className="flex items-center gap-[0.3vw]">
            <Filter className="w-[0.8vw] h-[0.8vw] text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-[0.6vw] py-[0.35vw] bg-white border border-gray-200 rounded-[0.45vw] text-[0.76vw] font-medium text-gray-700 focus:outline-none focus:border-[#ea543a]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── ASSETS GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-[6vw] text-gray-400">
          <RefreshCw className="w-[2vw] h-[2vw] animate-spin text-[#ea543a]" />
          <span className="text-[0.8vw] font-medium mt-[0.6vw]">Loading 3D assets...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[0.8vw] p-[4vw] flex flex-col items-center justify-center text-center">
          <FileBox className="w-[3vw] h-[3vw] text-gray-300 stroke-1" />
          <h3 className="text-[1vw] font-semibold text-gray-800 mt-[0.6vw]">No assets found</h3>
          <p className="text-[0.76vw] text-gray-500 mt-[0.2vw]">
            {search
              ? `No ${activeTab} match "${search}". Try clearing search.`
              : `Click the "Upload" button above to add predefined ${activeTab} into FlipiBook.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-[1vw]">
          {filteredList.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-white border border-gray-200 hover:border-gray-300 rounded-[0.7vw] p-[0.7vw] flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Thumbnail / Image Preview */}
              <div className="w-full h-[9vw] rounded-[0.5vw] bg-gray-100 overflow-hidden relative flex items-center justify-center border border-gray-100">
                {activeTab === 'models' ? (
                  item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Box className="w-[2.8vw] h-[2.8vw] text-gray-400 stroke-1" />
                  )
                ) : activeTab === 'hdris' ? (
                  item.preview ? (
                    <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Sun className="w-[2.8vw] h-[2.8vw] text-amber-400 stroke-1" />
                  )
                ) : item.preview ? (
                  <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-[4.5vw] h-[4.5vw] rounded-full shadow-md"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #fff 0%, ${item.color || '#999'} 50%, #111 100%)`
                    }}
                  />
                )}

                {/* Category Pill Tag */}
                <span className="absolute top-[0.4vw] left-[0.4vw] px-[0.4vw] py-[0.12vw] bg-black/60 backdrop-blur-xs text-white rounded-[0.3vw] text-[0.58vw] font-medium">
                  {item.category || 'General'}
                </span>

                {/* Action buttons (Edit & Delete) */}
                <div className="absolute top-[0.4vw] right-[0.4vw] flex items-center gap-[0.25vw] opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(item);
                    }}
                    className="w-[1.5vw] h-[1.5vw] rounded-[0.35vw] bg-white/95 hover:bg-[#ea543a] hover:text-white text-gray-700 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    title="Edit asset"
                  >
                    <Edit2 className="w-[0.78vw] h-[0.78vw]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      promptDelete(item._id || item.id, item.name);
                    }}
                    className="w-[1.5vw] h-[1.5vw] rounded-[0.35vw] bg-white/95 hover:bg-red-500 hover:text-white text-gray-700 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    title="Delete asset"
                  >
                    <Trash2 className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="pt-[0.6vw] flex flex-col gap-[0.15vw]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.82vw] font-semibold text-gray-900 truncate" title={item.name}>
                    {item.name}
                  </span>
                  {activeTab === 'models' && (
                    <span className="text-[0.62vw] font-mono font-normal text-gray-500 bg-gray-50 px-[0.3vw] py-[0.05vw] rounded border border-gray-100">
                      {item.size || 'GLB'}
                    </span>
                  )}
                </div>

                <span className="text-[0.66vw] text-gray-400 truncate">
                  {item.url || item.file || 'Stored in storage/3d_assets'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── UPLOAD MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-[2vw] animate-in fade-in duration-150">
          <div className="bg-white rounded-[0.8vw] shadow-2xl border border-gray-200 w-[42vw] max-w-[620px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-[1.2vw] py-[0.85vw] border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-[0.45vw]">
                {editingItem ? (
                  <Edit2 className="w-[1.1vw] h-[1.1vw] text-[#ea543a]" />
                ) : (
                  <Sparkles className="w-[1.1vw] h-[1.1vw] text-[#ea543a]" />
                )}
                <h3 className="text-[0.95vw] font-semibold text-gray-900">
                  {editingItem ? 'Edit' : 'Upload'}{' '}
                  {activeTab === 'models'
                    ? '3D Model'
                    : activeTab === 'hdris'
                    ? 'HDRI Environment'
                    : 'PBR Material'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="w-[1.6vw] h-[1.6vw] rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-[1.2vw] flex flex-col gap-[0.85vw] overflow-y-auto max-h-[78vh]">
              {/* Asset Name */}
              <div className="flex flex-col gap-[0.25vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Sofa, Sunset Studio, Brushed Gold..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-[0.7vw] py-[0.4vw] border border-gray-200 rounded-[0.45vw] text-[0.76vw] font-normal focus:outline-none focus:border-[#ea543a]"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-[0.25vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Furniture, Studio, Metal, Glass..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-[0.7vw] py-[0.4vw] border border-gray-200 rounded-[0.45vw] text-[0.76vw] font-normal focus:outline-none focus:border-[#ea543a]"
                />
              </div>

              {/* ── 3D MODELS TAB FIELDS ── */}
              {activeTab === 'models' && (
                <>
                  <div className="flex flex-col gap-[0.25vw]">
                    <label className="text-[0.72vw] font-medium text-gray-700">
                      3D Model File (.glb, .gltf, .obj) <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragOver={(e) => handleDragOver('modelFile', e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropFile('modelFile', e)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-[0.55vw] p-[0.9vw] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-[0.2vw] ${
                        dragActiveField === 'modelFile'
                          ? 'border-[#ea543a] bg-orange-50/50'
                          : selectedFiles.modelFile
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/60'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".glb,.gltf,.obj"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange('modelFile', e)}
                        className="hidden"
                      />
                      <Box className={`w-[1.4vw] h-[1.4vw] ${selectedFiles.modelFile ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className="text-[0.72vw] font-medium text-gray-800">
                        {selectedFiles.modelFile ? selectedFiles.modelFile.name : 'Drag & drop 3D model or click to browse'}
                      </span>
                      <span className="text-[0.62vw] text-gray-400 font-normal">Supported: GLB, GLTF, OBJ (up to 300MB)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[0.25vw]">
                    <label className="text-[0.72vw] font-medium text-gray-700">Thumbnail Preview (Optional image)</label>
                    <div
                      onDragOver={(e) => handleDragOver('thumbnail', e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropFile('thumbnail', e)}
                      onClick={() => thumbInputRef.current?.click()}
                      className={`border border-dashed rounded-[0.55vw] p-[0.6vw] text-center cursor-pointer transition-all flex items-center justify-center gap-[0.5vw] ${
                        dragActiveField === 'thumbnail'
                          ? 'border-[#ea543a] bg-orange-50/40'
                          : selectedFiles.thumbnail
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        ref={thumbInputRef}
                        onChange={(e) => handleFileChange('thumbnail', e)}
                        className="hidden"
                      />
                      {previewUrls.thumbnail ? (
                        <div className="flex items-center gap-[0.6vw] w-full justify-between px-[0.4vw]">
                          <div className="flex items-center gap-[0.5vw] truncate">
                            <img
                              src={previewUrls.thumbnail}
                              alt="Thumbnail"
                              className="w-[2vw] h-[2vw] rounded object-cover border border-gray-200"
                            />
                            <span className="text-[0.7vw] font-medium text-gray-700 truncate">
                              {selectedFiles.thumbnail ? selectedFiles.thumbnail.name : 'Current Thumbnail'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFile('thumbnail', e)}
                            className="p-[0.2vw] hover:bg-gray-200 rounded text-gray-500 hover:text-red-500"
                            title="Remove file"
                          >
                            <X className="w-[0.9vw] h-[0.9vw]" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FileBox className="w-[1vw] h-[1vw] text-gray-400" />
                          <span className="text-[0.7vw] font-normal text-gray-600">
                            Drop thumbnail image or click to browse
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ── HDRIS TAB FIELDS ── */}
              {activeTab === 'hdris' && (
                <>
                  <div className="flex flex-col gap-[0.25vw]">
                    <label className="text-[0.72vw] font-medium text-gray-700">
                      HDRI Environment (.hdr, .exr) <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragOver={(e) => handleDragOver('hdriFile', e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropFile('hdriFile', e)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-[0.55vw] p-[0.9vw] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-[0.2vw] ${
                        dragActiveField === 'hdriFile'
                          ? 'border-[#ea543a] bg-orange-50/50'
                          : selectedFiles.hdriFile
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/60'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".hdr,.exr"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange('hdriFile', e)}
                        className="hidden"
                      />
                      <Sun className={`w-[1.4vw] h-[1.4vw] ${selectedFiles.hdriFile ? 'text-amber-500' : 'text-gray-400'}`} />
                      <span className="text-[0.72vw] font-medium text-gray-800">
                        {selectedFiles.hdriFile ? selectedFiles.hdriFile.name : 'Drag & drop HDR/EXR file or click to browse'}
                      </span>
                      <span className="text-[0.62vw] text-gray-400 font-normal">Supported: 360° HDR, EXR maps</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[0.25vw]">
                    <label className="text-[0.72vw] font-medium text-gray-700">Preview Image (.png, .jpg)</label>
                    <div
                      onDragOver={(e) => handleDragOver('preview', e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropFile('preview', e)}
                      onClick={() => previewInputRef.current?.click()}
                      className={`border border-dashed rounded-[0.55vw] p-[0.6vw] text-center cursor-pointer transition-all flex items-center justify-center gap-[0.5vw] ${
                        dragActiveField === 'preview'
                          ? 'border-[#ea543a] bg-orange-50/40'
                          : selectedFiles.preview
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        ref={previewInputRef}
                        onChange={(e) => handleFileChange('preview', e)}
                        className="hidden"
                      />
                      {previewUrls.preview ? (
                        <div className="flex items-center gap-[0.6vw] w-full justify-between px-[0.4vw]">
                          <div className="flex items-center gap-[0.5vw] truncate">
                            <img
                              src={previewUrls.preview}
                              alt="Preview"
                              className="w-[2vw] h-[2vw] rounded object-cover border border-gray-200"
                            />
                            <span className="text-[0.7vw] font-medium text-gray-700 truncate">
                              {selectedFiles.preview ? selectedFiles.preview.name : 'Current Preview'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFile('preview', e)}
                            className="p-[0.2vw] hover:bg-gray-200 rounded text-gray-500 hover:text-red-500"
                            title="Remove file"
                          >
                            <X className="w-[0.9vw] h-[0.9vw]" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FileBox className="w-[1vw] h-[1vw] text-gray-400" />
                          <span className="text-[0.7vw] font-normal text-gray-600">
                            Drop preview snapshot or click to browse
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ── PBR MATERIALS TAB FIELDS ── */}
              {activeTab === 'materials' && (
                <>
                  {/* Preview Sphere Image Dropzone */}
                  <div className="flex flex-col gap-[0.2vw]">
                    <label className="text-[0.72vw] font-medium text-gray-700">Preview Sphere Image</label>

                    <div
                      onDragOver={(e) => handleDragOver('preview', e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropFile('preview', e)}
                      onClick={() => previewInputRef.current?.click()}
                      className={`border border-dashed rounded-[0.45vw] p-[0.45vw] cursor-pointer transition-all flex items-center justify-center min-h-[2.8vw] ${
                        dragActiveField === 'preview'
                          ? 'border-[#ea543a] bg-orange-50/40'
                          : selectedFiles.preview
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        ref={previewInputRef}
                        onChange={(e) => handleFileChange('preview', e)}
                        className="hidden"
                      />
                      {previewUrls.preview ? (
                        <div className="flex items-center justify-between w-full px-[0.3vw]">
                          <div className="flex items-center gap-[0.5vw] truncate">
                            <img
                              src={previewUrls.preview}
                              alt="Sphere Preview"
                              className="w-[1.9vw] h-[1.9vw] rounded-full object-cover border border-gray-200 shadow-xs"
                            />
                            <div className="flex flex-col text-left truncate">
                              <span className="text-[0.68vw] font-medium text-gray-800 truncate">
                                {selectedFiles.preview ? selectedFiles.preview.name : 'Current Material Preview'}
                              </span>
                              <span className="text-[0.56vw] text-emerald-600 font-medium">
                                {selectedFiles.preview ? 'Ready to upload' : 'Existing file'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFile('preview', e)}
                            className="p-[0.2vw] hover:bg-gray-200 rounded text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove file"
                          >
                            <X className="w-[0.8vw] h-[0.8vw]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-[0.4vw] text-gray-500 py-[0.1vw]">
                          <UploadCloud className="w-[0.95vw] h-[0.95vw] text-gray-400" />
                          <span className="text-[0.68vw] font-normal text-gray-600">
                            Click to upload or drag & drop material sphere image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PBR Texture Maps Section - Clean Minimal Layout */}
                  <div className="flex flex-col gap-[0.35vw] pt-[0.1vw]">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-[0.2vw]">
                      <span className="text-[0.72vw] font-medium text-gray-800">Texture Maps</span>
                    </div>

                    <div className="grid grid-cols-2 gap-[0.5vw]">
                      {[
                        {
                          key: 'map',
                          title: 'Albedo / Base Map',
                          mandatory: true,
                          ref: mapInputRef
                        },
                        {
                          key: 'normalMap',
                          title: 'Normal Map',
                          mandatory: false,
                          ref: normalMapInputRef
                        },
                        {
                          key: 'roughnessMap',
                          title: 'Roughness Map',
                          mandatory: false,
                          ref: roughnessMapInputRef
                        },
                        {
                          key: 'metalnessMap',
                          title: 'Metallic Map',
                          mandatory: false,
                          ref: metalnessMapInputRef
                        }
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col gap-[0.15vw]">
                          {/* Map Heading */}
                          <div className="flex items-center justify-between px-[0.1vw]">
                            <span className="text-[0.68vw] font-medium text-gray-700">
                              {item.title}{' '}
                              {item.mandatory && <span className="text-red-500 text-[0.7vw]">*</span>}
                            </span>
                          </div>

                          {/* Minimal Map Dropzone */}
                          <div
                            onDragOver={(e) => handleDragOver(item.key, e)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropFile(item.key, e)}
                            onClick={() => item.ref.current?.click()}
                            className={`border border-dashed rounded-[0.4vw] p-[0.4vw] cursor-pointer transition-all flex items-center justify-center min-h-[3.2vw] ${
                              dragActiveField === item.key
                                ? 'border-[#ea543a] bg-orange-50/40'
                                : selectedFiles[item.key]
                                ? 'border-emerald-300 bg-emerald-50/20'
                                : item.mandatory && !selectedFiles[item.key]
                                ? 'border-orange-200 hover:border-orange-300 bg-white'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              ref={item.ref}
                              onChange={(e) => handleFileChange(item.key, e)}
                              className="hidden"
                            />

                            {previewUrls[item.key] ? (
                              <div className="flex items-center justify-between w-full px-[0.2vw] gap-[0.3vw]">
                                <div className="flex items-center gap-[0.4vw] min-w-0">
                                  <img
                                    src={previewUrls[item.key]}
                                    alt={item.title}
                                    className="w-[1.7vw] h-[1.7vw] rounded object-cover border border-gray-200 shrink-0"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[0.64vw] font-medium text-gray-700 truncate">
                                      {selectedFiles[item.key] ? selectedFiles[item.key].name : `${item.title}`}
                                    </span>
                                    <span className="text-[0.54vw] text-emerald-600 font-normal">
                                      {selectedFiles[item.key] ? 'Uploaded' : 'Existing file'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveFile(item.key, e)}
                                  className="p-[0.15vw] hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                  title="Remove texture"
                                >
                                  <X className="w-[0.75vw] h-[0.75vw]" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-[0.3vw] py-[0.1vw] text-gray-400 hover:text-gray-600">
                                <UploadCloud className="w-[0.85vw] h-[0.85vw]" />
                                <span className="text-[0.62vw] font-medium text-gray-600">Click to upload</span>
                                <span className="text-[0.56vw] text-gray-400 font-normal">or drag & drop</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Base Tint Color with Custom ColorPicker Popover */}
                  <div className="flex items-center justify-between pt-[0.2vw] relative">
                    <div className="flex flex-col">
                      <label className="text-[0.72vw] font-medium text-gray-700">Base Tint Color</label>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-[0.45vw] px-[0.6vw] py-[0.3vw] bg-white border border-gray-200 hover:border-gray-300 rounded-[0.4vw] shadow-2xs transition-all cursor-pointer"
                      >
                        <div
                          className="w-[1.2vw] h-[1.2vw] rounded-full border border-gray-300 shadow-inner"
                          style={{
                            backgroundColor: formData.color,
                            opacity: (formData.alpha ?? 100) / 100
                          }}
                        />
                        <span className="text-[0.68vw] font-mono font-medium text-gray-700 uppercase">
                          {formData.color}
                        </span>
                      </button>

                      {/* Custom ColorPicker Popover with Opacity */}
                      {showColorPicker && (
                        <div className="absolute right-0 bottom-full mb-[0.5vw] z-[120]">
                          <CustomColorPicker
                            color={formData.color}
                            onChange={(newHex) => setFormData({ ...formData, color: newHex })}
                            opacity={formData.alpha ?? 100}
                            onOpacityChange={(newAlpha) => setFormData({ ...formData, alpha: newAlpha })}
                            onClose={() => setShowColorPicker(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-[0.5vw] pt-[0.6vw] border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-[0.9vw] py-[0.38vw] rounded-[0.45vw] text-[0.74vw] font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-[1.1vw] py-[0.4vw] rounded-[0.45vw] text-[0.76vw] font-medium bg-[#ea543a] hover:bg-[#d43d24] text-white shadow-2xs cursor-pointer flex items-center gap-[0.3vw] transition-colors"
                >
                  {uploading && <RefreshCw className="w-[0.8vw] h-[0.8vw] animate-spin" />}
                  <span>{uploading ? 'Saving...' : editingItem ? 'Save Changes' : 'Save & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOM CONFIRMATION POPUP MODAL ── */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-[1vw] animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              if (!deleteConfirm.loading) {
                setDeleteConfirm({ isOpen: false, id: null, name: '', loading: false });
              }
            }}
          />

          {/* Modal Card */}
          <div className="relative z-10 bg-white rounded-[0.8vw] shadow-[0_16px_48px_rgba(0,0,0,0.18)] w-full max-w-[24vw] min-w-[340px] p-[1.4vw] border border-gray-100 flex flex-col animate-in zoom-in-95 duration-150">
            {/* Title */}
            <h3 className="text-[1.05vw] font-semibold text-gray-900 leading-snug">
              Delete {activeTab === 'models' ? '3D Model' : activeTab === 'hdris' ? 'HDRI Environment' : 'Material'}
            </h3>

            {/* Message Body */}
            <p className="text-[0.8vw] text-gray-600 font-normal leading-[1.5] mt-[0.5vw]">
              Are you sure you want to permanently delete <span className="font-semibold text-gray-900">"{deleteConfirm.name}"</span>? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-[0.6vw] mt-[1.4vw]">
              <button
                type="button"
                disabled={deleteConfirm.loading}
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '', loading: false })}
                className="px-[1vw] py-[0.45vw] text-[0.76vw] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[0.45vw] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirm.loading}
                onClick={handleConfirmDelete}
                className="px-[1.15vw] py-[0.45vw] text-[0.76vw] font-medium text-white bg-[#ea543a] hover:bg-[#d9482f] shadow-sm shadow-orange-500/20 rounded-[0.45vw] transition-all cursor-pointer flex items-center gap-[0.3vw] disabled:opacity-50 active:scale-95"
              >
                {deleteConfirm.loading && <RefreshCw className="w-[0.75vw] h-[0.75vw] animate-spin" />}
                <span>{deleteConfirm.loading ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
