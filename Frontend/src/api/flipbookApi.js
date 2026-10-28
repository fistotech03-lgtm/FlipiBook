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

export const flipbookApi = {
    // Folders API
    getFolders: () => api.get('/api/flipbook/folders'),
    createFolder: (arg1, arg2) => {
        const folderName = arg2 !== undefined ? arg2 : arg1;
        return api.post('/api/flipbook/folder/create', { folderName });
    },
    renameFolder: (arg1, arg2, arg3, arg4) => {
        let oldName, newName, folderId;
        if (arg4 !== undefined) {
            oldName = arg2; newName = arg3; folderId = arg4;
        } else {
            oldName = arg1; newName = arg2; folderId = arg3;
        }
        return api.post('/api/flipbook/folder/rename', { oldName, newName, folderId });
    },
    deleteFolder: (arg1, arg2, arg3) => {
        let folderName, folderId;
        if (arg3 !== undefined) {
            folderName = arg2; folderId = arg3;
        } else {
            folderName = arg1; folderId = arg2;
        }
        return api.delete('/api/flipbook/folder', { data: { folderName, folderId } });
    },
    duplicateFolder: (arg1, arg2) => {
        const folderName = arg2 !== undefined ? arg2 : arg1;
        return api.post('/api/flipbook/folder/duplicate', { folderName });
    },
    reorderFolders: (arg1, arg2) => {
        const folders = Array.isArray(arg1) ? arg1 : arg2;
        return api.post('/api/flipbook/folder/reorder', { folders });
    },

    // Flipbooks API
    getBooks: () => api.get('/api/flipbook/list'),
    getPreview: (v_id, arg2, arg3) => {
        const signal = (arg2 && arg2.aborted !== undefined) ? arg2 : arg3;
        return api.get(`/api/flipbook/preview/${v_id}`, signal ? { signal } : undefined);
    },
    saveBook: (payload) => api.post('/api/flipbook/save', payload),
    savePagesBatch: (payload) => api.post('/api/flipbook/save-pages-batch', payload),
    renamePage: (payload) => api.post('/api/flipbook/rename-page', payload),
    deletePage: (payload) => api.post('/api/flipbook/delete-page', payload),
    deleteBook: (arg1, arg2) => {
        const v_id = arg2 || arg1;
        return api.delete(`/api/flipbook/delete/${v_id}`);
    },
    restoreBook: (arg1, arg2, arg3) => {
        let bookName, folder;
        if (arg3 !== undefined) {
            bookName = arg2; folder = arg3;
        } else {
            bookName = arg1; folder = arg2;
        }
        return api.post('/api/flipbook/restore', { bookName, folder });
    },
    duplicateBook: (payload) => api.post('/api/flipbook/duplicate', payload),
    toggleFavorite: (payload) => api.post('/api/flipbook/favorite', payload),
    removeRecent: (payload) => api.post('/api/flipbook/remove-recent', payload),
    emptyTrash: () => api.post('/api/flipbook/empty-trash'),
    unpublishBook: (payload) => api.post('/api/flipbook/unpublish', payload),
    trashBook: (payload) => api.post('/api/flipbook/trash', payload),
    renameBook: (payload) => api.post('/api/flipbook/rename', payload),
    moveBook: (payload) => api.post('/api/flipbook/move', payload),
    deleteBookPermanently: (payload) => api.delete('/api/flipbook/delete', { data: payload }),

    // Storage Settings API
    getStorageSettings: () =>
        api.get('/api/usersetting/get-settings'),
};

export default flipbookApi;
