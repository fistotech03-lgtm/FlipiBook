import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
});

export const flipbookApi = {
    // Folders API
    getFolders: (emailId) => api.get('/api/flipbook/folders', { params: { emailId } }),
    createFolder: (emailId, folderName) => api.post('/api/flipbook/folder/create', { emailId, folderName }),
    renameFolder: (emailId, oldName, newName, folderId) =>
        api.post('/api/flipbook/folder/rename', { emailId, oldName, newName, folderId }),
    deleteFolder: (emailId, folderName, folderId) =>
        api.delete('/api/flipbook/folder', { data: { emailId, folderName, folderId } }),
    duplicateFolder: (emailId, folderName) =>
        api.post('/api/flipbook/folder/duplicate', { emailId, folderName }),
    reorderFolders: (emailId, folders) =>
        api.post('/api/flipbook/folder/reorder', { emailId, folders }),

    // Flipbooks API
    getBooks: (emailId) => api.get('/api/flipbook/list', { params: { emailId } }),
    saveBook: (payload) => api.post('/api/flipbook/save', payload),
    savePagesBatch: (payload) => api.post('/api/flipbook/save-pages-batch', payload),
    deleteBook: (emailId, v_id) => api.delete(`/api/flipbook/delete/${v_id}`, { params: { emailId } }),
    restoreBook: (emailId, bookName, folder) =>
        api.post('/api/flipbook/restore', { emailId, bookName, folder }),
    duplicateBook: (payload) => api.post('/api/flipbook/duplicate', payload),
    toggleFavorite: (payload) => api.post('/api/flipbook/favorite', payload),
    removeRecent: (payload) => api.post('/api/flipbook/remove-recent', payload),
    emptyTrash: (emailId) => api.post('/api/flipbook/empty-trash', { emailId }),
    unpublishBook: (payload) => api.post('/api/flipbook/unpublish', payload),
    trashBook: (payload) => api.post('/api/flipbook/trash', payload),
    renameBook: (payload) => api.post('/api/flipbook/rename', payload),
    moveBook: (payload) => api.post('/api/flipbook/move', payload),
    deleteBookPermanently: (payload) => api.delete('/api/flipbook/delete', { data: payload }),

    // Storage Settings API
    getStorageSettings: (emailId) =>
        api.get('/api/usersetting/get-settings', { params: { emailId } }),
};

export default flipbookApi;
