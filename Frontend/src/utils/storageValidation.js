import flipbookApi from '../api/flipbookApi';

/**
 * Format bytes into MB display string (e.g., '289 MB', '11.5 MB')
 */
export const formatStorageMB = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) return '< 0.1 MB';
  if (mb < 10) return `${mb.toFixed(1)} MB`;
  return `${Math.round(mb)} MB`;
};

/**
 * Validates actual storage space occupied on the server against the user's quota.
 * Always fetches the live up-to-date calculation from the backend when emailId is provided.
 *
 * @param {string} emailId - The user's email address
 * @param {number} incomingBytes - Total size of the file(s) being uploaded
 * @param {object} [fallbackStorage] - Cached storage object { used, total }
 * @returns {Promise<{
 *   exceeds: boolean,
 *   isFull: boolean,
 *   used: number,
 *   total: number,
 *   available: number,
 *   incomingBytes: number,
 *   percent: number
 * }>}
 */
export const validateStorageBeforeUpload = async (emailId, incomingBytes = 0, fallbackStorage = null) => {
  let storage = fallbackStorage;

  if (emailId && emailId !== 'No Email' && emailId !== 'guest@example.com') {
    try {
      const res = await flipbookApi.getStorageSettings();
      if (res?.data) {
        storage = {
          used: typeof res.data.usedStorage === 'number' ? res.data.usedStorage : 0,
          total: typeof res.data.maxStorage === 'number' ? res.data.maxStorage : 300 * 1024 * 1024,
        };
        // Update local storage cache and notify all components listening to storage events
        try {
          localStorage.setItem('user_storage_settings', JSON.stringify(storage));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[StorageValidation] Could not fetch live storage, using fallback:', err);
    }
  }

  const effectiveUsed = (storage && typeof storage.used === 'number') ? storage.used : 0;
  const effectiveTotal = (storage && storage.total > 0) ? storage.total : (300 * 1024 * 1024);
  const available = Math.max(0, effectiveTotal - effectiveUsed);
  const exceeds = (effectiveUsed >= effectiveTotal) || (effectiveUsed + incomingBytes > effectiveTotal);
  const isFull = effectiveUsed >= effectiveTotal;
  const percent = effectiveTotal > 0 ? Math.min(100, Math.round((effectiveUsed / effectiveTotal) * 100)) : 0;

  return {
    exceeds,
    isFull,
    used: effectiveUsed,
    total: effectiveTotal,
    available,
    incomingBytes,
    percent
  };
};
