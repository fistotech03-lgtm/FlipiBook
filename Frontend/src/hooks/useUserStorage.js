import { useState, useEffect, useCallback } from 'react';
import flipbookApi from '../api/flipbookApi';

export function useUserStorage(emailId) {
    const [storage, setStorage] = useState(() => {
        try {
            const cached = localStorage.getItem('user_storage_settings');
            if (cached) return JSON.parse(cached);
        } catch (e) {}
        return { used: 0, total: 300 * 1024 * 1024 };
    });

    const [isLoadingStorage, setIsLoadingStorage] = useState(false);
    const [isUpgradeCardClosed, setIsUpgradeCardClosed] = useState(() => {
        try {
            return (
                localStorage.getItem('hide_upgrade_card') === 'true' ||
                sessionStorage.getItem('hide_upgrade_card') === 'true'
            );
        } catch (e) {
            return false;
        }
    });

    const fetchLiveStorageSettings = useCallback(async () => {
        setIsLoadingStorage(true);
        try {
            const res = await flipbookApi.getStorageSettings();
            if (res.data) {
                const newStorage = {
                    used: typeof res.data.usedStorage === 'number' ? res.data.usedStorage : 0,
                    total: typeof res.data.maxStorage === 'number' ? res.data.maxStorage : 300 * 1024 * 1024,
                };
                setStorage(newStorage);
                try {
                    localStorage.setItem('user_storage_settings', JSON.stringify(newStorage));
                    window.dispatchEvent(new Event('storage'));
                } catch (e) {}
            }
        } catch (error) {
            console.error('Error fetching storage settings:', error);
        } finally {
            setIsLoadingStorage(false);
        }
    }, []);

    useEffect(() => {
        fetchLiveStorageSettings();
    }, [fetchLiveStorageSettings]);

    // Real-time synchronization: listen for custom and cross-tab storage update events
    useEffect(() => {
        const handleStorageEvent = (e) => {
            if (e?.detail && typeof e.detail.used === 'number') {
                setStorage((prev) => ({
                    ...prev,
                    used: e.detail.used,
                    ...(e.detail.total ? { total: e.detail.total } : {})
                }));
            }
            fetchLiveStorageSettings();
        };

        const handleStorageKeyChange = (e) => {
            if (e.key === 'user_storage_settings' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (parsed && typeof parsed.used === 'number') {
                        setStorage(parsed);
                    }
                } catch (_) {}
            }
        };

        window.addEventListener('flipibook_storage_updated', handleStorageEvent);
        window.addEventListener('storage', handleStorageKeyChange);

        return () => {
            window.removeEventListener('flipibook_storage_updated', handleStorageEvent);
            window.removeEventListener('storage', handleStorageKeyChange);
        };
    }, [fetchLiveStorageSettings]);

    const updateStorageOptimistically = useCallback((calculatorFn) => {
        setStorage((prev) => {
            const updated = calculatorFn(prev);
            try {
                localStorage.setItem('user_storage_settings', JSON.stringify(updated));
                window.dispatchEvent(new Event('storage'));
            } catch (e) {}
            return updated;
        });
    }, []);

    return {
        storage,
        setStorage,
        isLoadingStorage,
        isUpgradeCardClosed,
        setIsUpgradeCardClosed,
        fetchLiveStorageSettings,
        updateStorageOptimistically,
    };
}

export default useUserStorage;
