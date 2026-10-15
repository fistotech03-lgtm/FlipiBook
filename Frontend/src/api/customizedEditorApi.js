import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true
});

export const customizedEditorApi = {
  // Service Status & Auth
  getStatus: () => api.get('/api/customized-editor/status'),
  checkAuth: () => api.get('/api/customized-editor/check-auth'),

  // Settings
  getSettings: (v_id) => api.get(`/api/customized-editor/settings/${v_id}`),
  getPublicSettings: (v_id, shareId) =>
    api.get('/api/customized-editor/public/settings', { params: { v_id, shareId } }),
  updateSettings: (payload) => api.post('/api/customized-editor/update-settings', payload),
  resetSettings: (v_id) => api.post('/api/customized-editor/reset-settings', { v_id }),

  // Customized Assets
  uploadCustomizedAsset: (formData) =>
    api.post('/api/customized-editor/upload-customized-asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteCustomizedAsset: (payload) =>
    api.post('/api/customized-editor/delete-customized-asset', payload),
  getUserAssets: (params) => api.get('/api/customized-editor/assets', { params }),
  getBackgroundAssets: () => api.get('/api/customized-editor/background-assets'),
  copyThemeAsset: (payload) => api.post('/api/customized-editor/copy-theme-asset', payload),

  // Leads
  submitLead: (payload) => api.post('/api/customized-editor/submit-lead', payload),
  getLeads: (params) => api.get('/api/customized-editor/leads', { params }),
  deleteLead: (leadId) => api.delete(`/api/customized-editor/leads/${leadId}`),

  // Visibility & Credential Protection
  verifyCredential: (payload) => api.post('/api/customized-editor/verify-credential', payload),
  sendVisibilityOtp: (payload) => api.post('/api/customized-editor/send-visibility-otp', payload),
  verifyVisibilityOtp: (payload) => api.post('/api/customized-editor/verify-visibility-otp', payload),

  // Presets
  getUserPresets: () => api.get('/api/customized-editor/presets'),
  saveUserPreset: (payload) => api.post('/api/customized-editor/presets', payload)
};

export default customizedEditorApi;
