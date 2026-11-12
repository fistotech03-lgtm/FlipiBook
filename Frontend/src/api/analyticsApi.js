import axios from 'axios';

let backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
        backendUrl = '';
    }
}

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
});

export const analyticsApi = {
    // Get user-level aggregated analytics across all flipbooks
    getUserAnalytics: (userEmail, days = 30) => {
        const email = (userEmail || '').trim();
        return api.get(`/api/analytics/user/${encodeURIComponent(email)}`, {
            params: { days }
        });
    },

    // Get analytics for a specific flipbook
    getFlipbookAnalytics: (v_id, days = 30) => {
        return api.get(`/api/analytics/book/${encodeURIComponent(v_id)}`, {
            params: { days }
        });
    },

    // Tracking Event Endpoints
    recordSessionStart: (payload) => api.post('/api/analytics/session-start', payload),
    recordHeartbeat: (payload) => api.post('/api/analytics/heartbeat', payload),
    recordSessionEnd: (payload) => api.post('/api/analytics/session-end', payload),
    recordPageFlip: (payload) => api.post('/api/analytics/page-flip', payload),
};

export default analyticsApi;

