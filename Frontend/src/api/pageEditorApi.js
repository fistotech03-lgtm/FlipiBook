import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
});

export const pageEditorApi = {
    // Health & Status
    getStatus: () => 
        api.get('/api/page-editor/status'),

    // Flipbook Page Editor Data
    getData: (v_id, emailId) => 
        api.get('/api/page-editor/data', { params: { v_id, emailId } }),

    // Page Persistence
    savePage: (payload) => 
        api.post('/api/page-editor/save-page', payload),

    savePagesBatch: (payload) => 
        api.post('/api/page-editor/save-pages-batch', payload),

    getPage: (params) => 
        api.get('/api/page-editor/get-page', { params }),

    renamePage: (payload) => 
        api.post('/api/page-editor/rename-page', payload),

    deletePage: (payload) => 
        api.post('/api/page-editor/delete-page', payload),

    inlineSvgs: (payload) => 
        api.post('/api/page-editor/inline-svgs', payload),

    // Asset Management
    uploadAsset: (formData) => 
        api.post('/api/page-editor/upload-asset', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    deleteAsset: (payload) => 
        api.post('/api/page-editor/delete-asset', payload),

    getGalleryAssets: (params) => 
        api.get('/api/page-editor/get-gallery-assets', { params }),

    renameGalleryAsset: (payload) => 
        api.post('/api/page-editor/rename-gallery-asset', payload),

    deleteGalleryAsset: (payload) => 
        api.post('/api/page-editor/delete-gallery-asset', payload)
};

export default pageEditorApi;
