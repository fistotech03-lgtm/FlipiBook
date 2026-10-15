/**
 * useSaveEngine.js
 * Flipbook persistence engine: differential page sync, inline raster upload,
 * interaction data normalization, database updates, and auto-save triggers.
 */

import { useRef } from 'react';
import axios from 'axios';
import { getSupabaseBaseUrl, resolveUploadsPath } from '../../../utils/assetUtils';
import { validateInteractions } from './interactionValidation';
import { useAuth } from '../../../context/AuthContext';

const VIRTUAL_FOLDERS = new Set(['recent book', 'recent', 'all books', 'all flipbooks', 'favorites', 'trash']);

const resolvePhysicalFolder = (folderInput) => {
  if (Array.isArray(folderInput)) {
    const real = folderInput.find(f => f && !VIRTUAL_FOLDERS.has(String(f).trim().toLowerCase()));
    return real ? String(real).trim() : 'My_Flipbooks';
  }
  if (folderInput && typeof folderInput === 'string') {
    const clean = folderInput.trim();
    if (VIRTUAL_FOLDERS.has(clean.toLowerCase())) return 'My_Flipbooks';
    return clean || 'My_Flipbooks';
  }
  return 'My_Flipbooks';
};

export const useSaveEngine = ({
  pages,
  setPages,
  currentBook,
  v_id,
  setHasUnsavedChanges,
  isSaving,
  setIsSaving,
  triggerSaveSuccess,
  getFlipbookDimensions,
  setActivePageIndex,
  toast,
  location,
  navigate,
  setActiveTopTool,
  setSelectedLayerId
}) => {
  const { user } = useAuth();
  const autoSaveTimerRef = useRef(null);
  const justSavedRef = useRef(false);
  const lastSavedHtmlsRef = useRef({});

    const saveFlipbook = async (isManual = false, overridePages = null) => {
    let pagesToSave = overridePages || pages;
    if (isSaving || !pagesToSave || pagesToSave.length === 0) return;

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    const validation = validateInteractions(pagesToSave);
    if (!validation.isValid) {
      if (isManual) {
        toast.error(validation.message);
        if (typeof validation.pageIndex === 'number' && validation.pageIndex >= 0) {
          setActivePageIndex(validation.pageIndex);
        }
        if (validation.elementId) {
          setActiveTopTool('interaction');
          setSelectedLayerId(validation.elementId);
          window.dispatchEvent(new CustomEvent('select-layer', { detail: { layerId: validation.elementId } }));

          const dispatchOpen = () => {
            window.dispatchEvent(new CustomEvent('open-interaction-accordion', {
              detail: {
                elementId: validation.elementId,
                pageIndex: validation.pageIndex,
                field: validation.field
              }
            }));
          };
          dispatchOpen();
          setTimeout(dispatchOpen, 100);
          setTimeout(dispatchOpen, 250);
          setTimeout(dispatchOpen, 400);
        }
      }
      return;
    }

    try {
      setIsSaving(true);


      const userEmail = user?.emailId || user?.email || currentBook?.userEmail || '';
      const sanitizedEmail = userEmail ? userEmail.replace(/[@.]/g, "_") : "";
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '') || 'http://localhost:5000';

      // Extract and upload assets (3D models, slideshows, blob URLs, inline raster images) before saving
      const fNameFor3D = resolvePhysicalFolder(currentBook?.folderName || location.state?.folderName);
      const bNameFor3D = currentBook?.flipbookName || location.state?.flipbookName || 'Untitled Flipbook';
      const userFolderForAsset = currentBook?.userID || currentBook?.userId || sanitizedEmail;
      const projectBaseUrl = getSupabaseBaseUrl(userFolderForAsset, fNameFor3D, bNameFor3D);

      const normalizePageAssetUrls = (htmlStr) => {
        if (!htmlStr || typeof htmlStr !== 'string') return htmlStr;
        const assetRegex = /(?:https?:\/\/[^\/"'\s]+(?:\/(?:storage|uploads)(?:\/[^\/"'\s]+)*|\/assets)?|\/(?:storage|uploads)(?:\/[^\/"'\s]+)*)\/assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi;
        let res = htmlStr.replace(assetRegex, '../assets/$1/$2');
        const escapedAssetRegex = /(?:https?:\\\/\\\/[^\\/"'\s]+(?:\\?\/(?:storage|uploads)(?:\\?\/[^\\/"'\s]+)*|\\?\/assets)?|\\?\/(?:storage|uploads)(?:\\?\/[^\\/"'\s]+)*)\\?\/assets\\?\/(Image|video|gif|audio|3D_Model|download)\\?\/([^"&'<>)\s,\\]+)/gi;
        res = res.replace(escapedAssetRegex, '../assets/$1/$2');
        res = res.replace(/(["'\s(])\/assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi, '$1../assets/$2/$3');
        res = res.replace(/(["'\s(])assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi, '$1../assets/$2/$3');
        res = res.replace(/(["'\s(])\.\/assets\/(Image|video|gif|audio|3D_Model|download)\/([^"&'<>)\s,]+)/gi, '$1../assets/$2/$3');
        res = res.replace(/(?:\.\.\/|\.\/)+assets\//g, '../assets/');
        if (projectBaseUrl && res.includes(projectBaseUrl)) {
          res = res.split(projectBaseUrl).join('../');
        }
        return res;
      };

      pagesToSave = await Promise.all(pagesToSave.map(async (p) => {
        if (!p.html) return p;

        let newHtml = p.html;
        if (newHtml.includes('data-interaction="3d-viewer"') || newHtml.includes('data-interaction="slideshow"') || newHtml.includes('data-interaction="download"') || newHtml.includes('data-interaction="audio"')) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(newHtml, 'image/svg+xml');
          const threedElements = doc.querySelectorAll('[data-interaction="3d-viewer"]');

          for (let el of threedElements) {
            let dataVal = el.getAttribute('data-interaction-value');
            if (!dataVal) continue;

            // Ensure default data-interaction-config exists on element
            let existingConfig = {};
            const confStr = el.getAttribute('data-interaction-config');
            if (confStr) {
              try { existingConfig = JSON.parse(confStr); } catch  { /* ignore */ }
            }
            let modelName = '3D Model';
            try {
              const parsedVal = JSON.parse(dataVal);
              if (parsedVal.displayName || parsedVal.name) {
                modelName = parsedVal.displayName || parsedVal.name;
              }
            } catch  { /* ignore */ }

            const defaultConfig = {
              shadowStrength: 35,
              shadowSoftness: 35,
              autoRotate: true,
              autoRotateSpeed: 1.5,
              lockMaxZoom: true,
              maxZoom: 4.5,
              bgType: 'Solid',
              bgColor: '#ffffffff',
              customBg: true,
              enableAR: true,
              qrText: 'Scan Me',
              qrColor: '#000000',
              qrBgType: 'Solid',
              qrBgColor: '#ffffff',
              qrLevel: 'L',
              qrDotType: 'square',
              qrCornerSquareType: 'square',
              qrCornerDotType: 'square',
              qrLogo: null,
              topText: 'You can Rotate 3D Model',
              bottomText: modelName
            };

            const mergedConfig = {
              ...defaultConfig,
              ...existingConfig,
              topText: (existingConfig && existingConfig.topText !== undefined && existingConfig.topText !== '') ? existingConfig.topText : 'You can Rotate 3D Model',
              bottomText: (existingConfig && existingConfig.bottomText !== undefined && existingConfig.bottomText !== '') ? existingConfig.bottomText : modelName
            };

            el.setAttribute('data-interaction-config', JSON.stringify(mergedConfig));

            let actualDataUri = null;

            if (dataVal.startsWith('{')) {
              try {
                const originalJson = JSON.parse(dataVal);
                if (originalJson.data && (originalJson.data.startsWith('data:') || originalJson.data.startsWith('blob:'))) {
                  actualDataUri = originalJson.data;
                }
              } catch  { /* ignore */ }
            } else if (dataVal.startsWith('data:') || dataVal.startsWith('blob:')) {
              actualDataUri = dataVal;
            }

            if (actualDataUri) {
              let blob;
              if (actualDataUri.startsWith('blob:')) {
                const res = await fetch(actualDataUri);
                blob = await res.blob();
              } else {
                const parts = actualDataUri.split(',');
                const mimeString = parts[0].split(':')[1].split(';')[0];
                let byteString;
                if (parts[0].indexOf('base64') >= 0) {
                  byteString = atob(parts[1]);
                } else {
                  byteString = decodeURI(parts[1]);
                }
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                blob = new Blob([ab], { type: mimeString });
              }

              const formData = new FormData();
              formData.append('emailId', user?.emailId);
              formData.append('folderName', fNameFor3D);
              formData.append('flipbookName', bNameFor3D);
              if (currentBook?.v_id || v_id) {
                formData.append('flipbook_v_id', currentBook?.v_id || v_id);
              }

              let isFromGallery = false;
              let fileName = `model_${Date.now()}.glb`;
              let modelHotspotsToSave = [];
              let sourceModelIdToSave = null;
              let modelDisplayNameToSave = null;
              try {
                if (dataVal.startsWith('{')) {
                  const originalJson = JSON.parse(dataVal);
                  if (originalJson.fromGallery) isFromGallery = true;
                  if (originalJson.name) fileName = originalJson.name;
                  if (Array.isArray(originalJson.hotspots)) modelHotspotsToSave = originalJson.hotspots;
                  if (originalJson.v_id || originalJson.modelId || originalJson.sourceModelId) {
                    sourceModelIdToSave = originalJson.v_id || originalJson.modelId || originalJson.sourceModelId;
                  }
                  if (originalJson.displayName) modelDisplayNameToSave = originalJson.displayName;
                }
              } catch  { /* ignore */ }

              if (isFromGallery) {
                formData.append('skipGlobalGallery', 'true');
              }
              if (modelHotspotsToSave && modelHotspotsToSave.length > 0) {
                formData.append('hotspots', JSON.stringify(modelHotspotsToSave));
              }
              if (sourceModelIdToSave) {
                formData.append('sourceModelId', sourceModelIdToSave);
              }
              if (modelDisplayNameToSave) {
                formData.append('displayName', modelDisplayNameToSave);
              }

              formData.append('model', blob, fileName);

              const uploadRes = await axios.post(`${backendUrl}/api/flipbook/upload-3d-model`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
              });

              if (uploadRes.data && uploadRes.data.url) {
                // url is relative: ./assets/3D_Model/<filename>
                const finalUrl = uploadRes.data.url;
                const absoluteUrl = `${getSupabaseBaseUrl(sanitizedEmail, fNameFor3D, bNameFor3D)}${finalUrl.replace(/^\.\//, '')}`;

                let newHtmlVal = dataVal.replace(actualDataUri, absoluteUrl);

                if (dataVal.startsWith('{') && uploadRes.data.v_id) {
                  try {
                    const obj = JSON.parse(newHtmlVal);
                    obj.v_id = uploadRes.data.v_id;
                    if (uploadRes.data.hotspots) {
                      obj.hotspots = uploadRes.data.hotspots;
                    } else if (modelHotspotsToSave && modelHotspotsToSave.length > 0) {
                      obj.hotspots = modelHotspotsToSave;
                    }
                    if (uploadRes.data.displayName) {
                      obj.displayName = uploadRes.data.displayName;
                    } else if (modelDisplayNameToSave) {
                      obj.displayName = modelDisplayNameToSave;
                    }
                    newHtmlVal = JSON.stringify(obj);
                  } catch  { /* ignore */ }
                }

                el.setAttribute('data-interaction-value', newHtmlVal);

                const escapedOld = dataVal.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                const escapedNew = newHtmlVal.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

                if (newHtml.includes(escapedOld)) {
                  newHtml = newHtml.replace(escapedOld, escapedNew);
                } else if (newHtml.includes(dataVal)) {
                  newHtml = newHtml.replace(dataVal, newHtmlVal);
                } else {
                  newHtml = newHtml.replace(actualDataUri, absoluteUrl);
                }

                // Update live DOM immediately to prevent stale interaction states in UI
                try {
                  const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                  if (editorDoc) {
                    const liveEls = editorDoc.querySelectorAll('[data-interaction="3d-viewer"]');
                    liveEls.forEach(lEl => {
                      const lDataVal = lEl.getAttribute('data-interaction-value');
                      if (lDataVal && lDataVal === dataVal) {
                        lEl.setAttribute('data-interaction-value', newHtmlVal);
                      } else if (lDataVal && lDataVal.includes(actualDataUri)) {
                        lEl.setAttribute('data-interaction-value', lDataVal.replace(actualDataUri, absoluteUrl));
                      }
                      lEl.setAttribute('data-interaction-config', JSON.stringify(mergedConfig));
                    });
                  }
                } catch  { /* ignore */ }
              }
            }
          }

          // Extract and upload slideshow interaction images into assets/Image/
          const slideshowElements = doc.querySelectorAll('[data-interaction="slideshow"]');
          for (let el of slideshowElements) {
            let dataVal = el.getAttribute('data-interaction-value');
            if (!dataVal) continue;

            try {
              let imgList = JSON.parse(dataVal);
              if (Array.isArray(imgList) && imgList.length > 0) {
                let hasChanges = false;
                const updatedList = await Promise.all(imgList.map(async (imgObj) => {
                  if (!imgObj || !imgObj.data) return imgObj;
                  const dataSrc = imgObj.data;

                  if (dataSrc.startsWith('data:image/') || dataSrc.startsWith('blob:')) {
                    try {
                      let blob;
                      if (dataSrc.startsWith('blob:')) {
                        const res = await fetch(dataSrc);
                        blob = await res.blob();
                      } else {
                        const parts = dataSrc.split(',');
                        const mimeString = parts[0].split(':')[1].split(';')[0];
                        let byteString;
                        if (parts[0].indexOf('base64') >= 0) {
                          byteString = atob(parts[1]);
                        } else {
                          byteString = decodeURI(parts[1]);
                        }
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) {
                          ia[i] = byteString.charCodeAt(i);
                        }
                        blob = new Blob([ab], { type: mimeString });
                      }

                      const formData = new FormData();
                      formData.append('emailId', user?.emailId);
                      formData.append('folderName', fNameFor3D);
                      formData.append('flipbookName', bNameFor3D);
                      formData.append('type', 'image');
                      formData.append('assetType', 'Image');
                      formData.append('page_v_id', 'global');
                      if (currentVId || v_id) {
                        formData.append('v_id', currentVId || v_id);
                      }
                      const safeName = imgObj.name || `slide_${Date.now()}.png`;
                      formData.append('file', blob, safeName);

                      const uploadRes = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                      });

                      if (uploadRes.data && uploadRes.data.url) {
                        const finalUrl = uploadRes.data.url;
                        const assetPathMatch = finalUrl.match(/assets\/[^/]+\/[^/]+$/);
                        const relativeUrl = assetPathMatch ? `../${assetPathMatch[0]}` : uploadRes.data.flipbookPath || (finalUrl.startsWith('../') ? finalUrl : `../${finalUrl.replace(/^(\.\/|\/)/, '')}`);

                        hasChanges = true;
                        return {
                          ...imgObj,
                          data: relativeUrl,
                          url: relativeUrl,
                          file_v_id: uploadRes.data.file_v_id
                        };
                      }
                    } catch (uploadErr) {
                      console.warn("Slideshow interaction image upload error:", uploadErr);
                    }
                  }
                  return imgObj;
                }));

                if (hasChanges) {
                  const newHtmlVal = JSON.stringify(updatedList);
                  el.setAttribute('data-interaction-value', newHtmlVal);

                  const escapedOld = dataVal.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                  const escapedNew = newHtmlVal.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

                  if (newHtml.includes(escapedOld)) {
                    newHtml = newHtml.replace(escapedOld, escapedNew);
                  } else if (newHtml.includes(dataVal)) {
                    newHtml = newHtml.replace(dataVal, newHtmlVal);
                  }

                  // Update live DOM element
                  try {
                    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                    if (editorDoc) {
                      const liveEl = editorDoc.getElementById(el.id);
                      if (liveEl) {
                        liveEl.setAttribute('data-interaction-value', newHtmlVal);
                      }
                    }
                  } catch  { /* ignore */ }
                }
              }
            } catch (jsonErr) {
              console.warn("Failed to parse slideshow interaction data:", jsonErr);
            }
          }

          newHtml = new XMLSerializer().serializeToString(doc.documentElement);
        } catch (err) {
          console.error('Error processing 3D models or interactions in page before save', err);
        }
      }

      // 2. EPHEMERAL BLOB URL EXTRACTION AND PERSISTENCE TO DISK
      const blobRegex = /blob:https?:\/\/[^\s"'<>)\],]+/g;
      const uniqueBlobUris = Array.from(new Set(newHtml.match(blobRegex) || []));
      for (const blobUrl of uniqueBlobUris) {
        try {
          const res = await fetch(blobUrl);
          const blob = await res.blob();
          const mimeType = (blob.type || '').toLowerCase();
          const isVideo = mimeType.startsWith('video/');
          const isAudio = mimeType.startsWith('audio/');
          const isGif = mimeType === 'image/gif' || blobUrl.toLowerCase().includes('.gif');
          const assetType = isVideo ? 'video' : (isAudio ? 'audio' : (isGif ? 'gif' : 'image'));
          const subFolder = isVideo ? 'video' : (isAudio ? 'audio' : (isGif ? 'gif' : 'Image'));

          let fileExt = '.png';
          if (isVideo) {
            fileExt = mimeType.includes('webm') ? '.webm' : '.mp4';
          } else if (isAudio) {
            fileExt = mimeType.includes('ogg') ? '.ogg' : (mimeType.includes('wav') ? '.wav' : '.mp3');
          } else if (isGif) {
            fileExt = '.gif';
          } else {
            fileExt = mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg' : (mimeType.includes('webp') ? '.webp' : '.png');
          }

          const formData = new FormData();
          formData.append('emailId', userEmail);
          formData.append('folderName', fNameFor3D);
          formData.append('flipbookName', bNameFor3D);
          formData.append('type', assetType);
          formData.append('assetType', subFolder);
          formData.append('page_v_id', p.v_id || p.id || 'global');
          if (currentVId || v_id) {
            formData.append('v_id', currentVId || v_id);
          }
          formData.append('file', blob, `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}${fileExt}`);

          const uploadRes = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });

          if (uploadRes.data && (uploadRes.data.url || uploadRes.data.filename)) {
            const filename = uploadRes.data.filename;
            const relativeUrl = uploadRes.data.flipbookPath || (uploadRes.data.url?.startsWith('../') ? uploadRes.data.url : `../assets/${subFolder}/${filename}`);
            const absoluteUrl = `${projectBaseUrl}assets/${subFolder}/${filename}`;

            // Replace blobUrl with clean relativeUrl in page SVG
            newHtml = newHtml.split(blobUrl).join(relativeUrl);

            // Update live DOM in editor to absoluteUrl so canvas stays visually responsive
            try {
              const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
              if (editorDoc) {
                const liveImgs = editorDoc.querySelectorAll(`image[href*="${blobUrl}"], image[*|href*="${blobUrl}"]`);
                liveImgs.forEach(img => {
                  img.setAttribute('href', absoluteUrl);
                  try { img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', absoluteUrl); } catch {}
                  if (uploadRes.data.file_v_id) {
                    img.parentElement?.setAttribute('data-file-vid', uploadRes.data.file_v_id);
                  }
                });

                const liveVids = editorDoc.querySelectorAll(`video[src*="${blobUrl}"]`);
                liveVids.forEach(vid => {
                  vid.src = absoluteUrl;
                  vid.setAttribute('src', absoluteUrl);
                  if (uploadRes.data.file_v_id) {
                    vid.closest('g')?.setAttribute('data-file-vid', uploadRes.data.file_v_id);
                  }
                });

                const maskedEls = editorDoc.querySelectorAll(`[data-masked-image-url*="${blobUrl}"]`);
                maskedEls.forEach(mEl => {
                  mEl.setAttribute('data-masked-image-url', absoluteUrl);
                });
              }
            } catch (domErr) {
              console.warn('Failed to update live DOM after blob upload:', domErr);
            }

            console.log(`[Save] Uploaded blob asset to flipbook disk: ${relativeUrl} (${absoluteUrl})`);
          }
        } catch (blobErr) {
          console.warn('[Save] Failed to fetch ephemeral blob asset (expired or revoked):', blobUrl, blobErr.message);
          // Auto-heal dead blob URL:
          // 1. Try to find if this blob URL is referenced by an element that already has data-relative-src, data-storage-url, or data-file-vid
          let recoveredUrl = null;
          try {
            const parser = new DOMParser();
            const tempDoc = parser.parseFromString(newHtml, 'image/svg+xml');
            const targetEl = tempDoc.querySelector(`[href*="${blobUrl}"], [*|href*="${blobUrl}"], [src*="${blobUrl}"], [data-masked-image-url*="${blobUrl}"]`);
            if (targetEl) {
              const relSrc = targetEl.getAttribute('data-relative-src');
              const storageUrl = targetEl.getAttribute('data-storage-url');
              const fileVid = targetEl.getAttribute('data-file-vid') || targetEl.closest('g')?.getAttribute('data-file-vid');
              if (relSrc) {
                recoveredUrl = relSrc;
              } else if (storageUrl) {
                recoveredUrl = storageUrl;
              } else if (fileVid) {
                recoveredUrl = `../assets/Image/${fileVid}.png`;
              }
            }
          } catch (e) {}

          // 2. Also check live editor DOM if not found in SVG string
          if (!recoveredUrl) {
            try {
              const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
              if (editorDoc) {
                const liveEl = editorDoc.querySelector(`[href*="${blobUrl}"], [*|href*="${blobUrl}"], [src*="${blobUrl}"], [data-masked-image-url*="${blobUrl}"]`);
                if (liveEl) {
                  const relSrc = liveEl.getAttribute('data-relative-src');
                  const storageUrl = liveEl.getAttribute('data-storage-url');
                  const fileVid = liveEl.getAttribute('data-file-vid') || liveEl.closest('g')?.getAttribute('data-file-vid');
                  if (relSrc) recoveredUrl = relSrc;
                  else if (storageUrl) recoveredUrl = storageUrl;
                  else if (fileVid) recoveredUrl = `../assets/Image/${fileVid}.png`;
                }
              }
            } catch (e) {}
          }

          // 3. If recovered, replace dead blob with recovered URL; otherwise replace with neutral transparent SVG placeholder so browser never throws net::ERR_FILE_NOT_FOUND
          if (recoveredUrl) {
            newHtml = newHtml.split(blobUrl).join(recoveredUrl);
            console.log(`[Save] Auto-healed dead blob URL ${blobUrl} -> ${recoveredUrl}`);
          } else {
            const emptyPlaceholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
            newHtml = newHtml.split(blobUrl).join(emptyPlaceholder);
            console.warn(`[Save] Replaced unrecoverable dead blob URL ${blobUrl} with placeholder to prevent ERR_FILE_NOT_FOUND`);
          }
        }
      }

      // --- 3. DIRECT STRING SEARCH base64 extraction and upload ---
      // Regex engines often fail silently or hit length limits on 3MB+ contiguous strings.
      // We use a pure indexOf search to safely extract huge data URIs.
      const uniqueDataUris = new Set();
      let searchIndex = 0;
      while (searchIndex < newHtml.length) {
        const imgIdx = newHtml.indexOf('data:image/', searchIndex);
        const audIdx = newHtml.indexOf('data:audio/', searchIndex);
        const vidIdx = newHtml.indexOf('data:video/', searchIndex);

        let foundIdx = -1;
        const indices = [imgIdx, audIdx, vidIdx].filter(idx => idx !== -1);
        if (indices.length > 0) {
          foundIdx = Math.min(...indices);
        }

        if (foundIdx === -1) break;

        // Find nearest delimiter character
        const endChars = ['"', "'", '&quot;', '&apos;', ')', '>', ' ', '\n', '\r'];
        let endIdx = -1;
        for (const ch of endChars) {
          const idx = newHtml.indexOf(ch, foundIdx);
          if (idx !== -1 && (endIdx === -1 || idx < endIdx)) {
            endIdx = idx;
          }
        }

        if (endIdx !== -1) {
          const dataUri = newHtml.substring(foundIdx, endIdx);
          if (dataUri.includes(';base64,')) {
            uniqueDataUris.add(dataUri);
          }
          searchIndex = endIdx;
        } else {
          break;
        }
      }

      for (const actualDataUri of uniqueDataUris) {
        try {
          // Browsers (like Chrome) limit fetch() URLs to ~2MB.
          // To handle 3MB+ data URIs, we manually convert base64 to Blob.
          const parts = actualDataUri.split(',');
          const mimeString = parts[0].split(':')[1].split(';')[0];

          // Handle URL encoded data URIs (e.g. svg+xml) or pure base64
          let byteString;
          if (parts[0].indexOf('base64') >= 0) {
            byteString = atob(parts[1]);
          } else {
            byteString = decodeURI(parts[1]);
          }

          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          const isAudio = blob.type.startsWith('audio/');
          const isVideo = blob.type.startsWith('video/');
          const assetType = isAudio ? 'audio' : (isVideo ? 'video' : 'image');

          let fileExt = '.bin';
          if (isAudio) {
            if (mimeString.includes('mpeg') || mimeString.includes('mp3')) fileExt = '.mp3';
            else if (mimeString.includes('wav')) fileExt = '.wav';
            else if (mimeString.includes('ogg')) fileExt = '.ogg';
            else if (mimeString.includes('mp4') || mimeString.includes('m4a')) fileExt = '.m4a';
            else if (mimeString.includes('aac')) fileExt = '.aac';
            else fileExt = '.mp3';
          } else if (isVideo) {
            fileExt = mimeString.includes('webm') ? '.webm' : '.mp4';
          } else {
            fileExt = mimeString.includes('png') ? '.png' : (mimeString.includes('webp') ? '.webp' : '.jpg');
          }

          const formData = new FormData();
          formData.append('emailId', userEmail);
          formData.append('folderName', fNameFor3D);
          formData.append('flipbookName', bNameFor3D);
          formData.append('type', assetType);
          formData.append('assetType', assetType === 'image' ? 'Image' : assetType);
          formData.append('page_v_id', p.v_id || p.id || 'global');
          if (currentVId || v_id) {
            formData.append('v_id', currentVId || v_id);
          }
          formData.append('file', blob, `asset_${Date.now()}${fileExt}`);

          const uploadRes = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });

          if (uploadRes.data && uploadRes.data.url) {
            const finalUrl = uploadRes.data.url;
            const assetPathMatch = finalUrl.match(/assets\/[^/]+\/[^/]+$/);
            const relativeUrl = assetPathMatch ? `../${assetPathMatch[0]}` : uploadRes.data.flipbookPath || (finalUrl.startsWith('../') ? finalUrl : `../${finalUrl.replace(/^(\.\/|\/)/, '')}`);
            const userFolder = currentBook?.userID || currentBook?.userId || sanitizedEmail;
            const absoluteUrl = assetPathMatch
              ? `${getSupabaseBaseUrl(userFolder, fNameFor3D, bNameFor3D)}${assetPathMatch[0]}`
              : finalUrl;

            // Replace the data URI directly in the raw HTML with clean relative path
            newHtml = newHtml.split(actualDataUri).join(relativeUrl);

            // Update the live DOM element so InteractionPanel shows the image immediately
            try {
              const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
              if (editorDoc) {
                const liveEls = editorDoc.querySelectorAll(`[data-interaction="download"], [data-interaction="audio"]`);
                liveEls.forEach(lEl => {
                  const lDataVal = lEl.getAttribute('data-interaction-value');
                  if (lDataVal && lDataVal.includes(actualDataUri)) {
                    lEl.setAttribute('data-interaction-value', lDataVal.split(actualDataUri).join(absoluteUrl));
                  }
                });
                const liveImgs = editorDoc.querySelectorAll(`image[href*="${actualDataUri}"], image[*|href*="${actualDataUri}"]`);
                liveImgs.forEach(img => {
                  img.setAttribute('href', absoluteUrl);
                  try { img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', absoluteUrl); } catch {}
                });
              }
            } catch  { /* ignore */ }

            console.log(`[Save] Uploaded large asset directly: ${absoluteUrl}`);
          }
        } catch (err) {
          console.error('[Save] Failed to upload large asset directly:', err);
        }
      }

      if (newHtml && !newHtml.includes('id="global-fonts-style"')) {
        const fontsStyle = `<style id="global-fonts-style">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&amp;family=Inter:wght@300;400;500;600;700;900&amp;family=Roboto:wght@300;400;500;700;900&amp;family=Outfit:wght@300;400;500;600;700;900&amp;family=Montserrat:wght@300;400;500;600;700;900&amp;family=Playfair+Display:ital,wght@0,400..900;1,400..900&amp;family=Nunito+Sans:wght@300;400;500;600;700;900&amp;display=swap');
@font-face { font-family: 'Designer_Signature'; src: url('${window.location.origin}/lib/Fonts/designer_signature/Designer_Signature.otf') format('opentype'); }
@font-face { font-family: 'Open Sans'; src: url('${window.location.origin}/lib/Fonts/Open_Sans/OpenSans-VariableFont_wdth,wght.ttf') format('truetype'); }
@font-face { font-family: 'Lato'; src: url('${window.location.origin}/lib/Fonts/Lato/Lato-Regular.ttf') format('truetype'); }
@font-face { font-family: 'Oswald'; src: url('${window.location.origin}/lib/Fonts/Oswald/Oswald-VariableFont_wght.ttf') format('truetype'); }
@font-face { font-family: 'Merriweather'; src: url('${window.location.origin}/lib/Fonts/Merriweather/Merriweather-VariableFont_opsz,wdth,wght.ttf') format('truetype'); }
@font-face { font-family: 'Allura'; src: url('${window.location.origin}/lib/Fonts/Allura/Allura-Regular.ttf') format('truetype'); }
@font-face { font-family: 'Parisienne'; src: url('${window.location.origin}/lib/Fonts/Parisienne/Parisienne-Regular.ttf') format('truetype'); }
@font-face { font-family: 'Satisfy'; src: url('${window.location.origin}/lib/Fonts/Satisfy/Satisfy-Regular.ttf') format('truetype'); }
@font-face { font-family: 'Poppins'; src: url('${window.location.origin}/lib/Fonts/Poppins/Poppins-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Poppins'; src: url('${window.location.origin}/lib/Fonts/Poppins/Poppins-Italic.ttf') format('truetype'); font-weight: 400; font-style: italic; }
@font-face { font-family: 'Poppins'; src: url('${window.location.origin}/lib/Fonts/Poppins/Poppins-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; }
@font-face { font-family: 'Poppins'; src: url('${window.location.origin}/lib/Fonts/Poppins/Poppins-BoldItalic.ttf') format('truetype'); font-weight: 700; font-style: italic; }
@font-face { font-family: 'Public Sans'; src: url('${window.location.origin}/lib/Fonts/Public_Sans/PublicSans-VariableFont_wght.ttf') format('truetype'); font-weight: 100 900; font-style: normal; }
@font-face { font-family: 'Public Sans'; src: url('${window.location.origin}/lib/Fonts/Public_Sans/PublicSans-Italic-VariableFont_wght.ttf') format('truetype'); font-weight: 100 900; font-style: italic; }
@font-face { font-family: 'Lora'; src: url('${window.location.origin}/lib/Fonts/Lora/Lora-VariableFont_wght.ttf') format('truetype'); font-weight: 400 700; font-style: normal; }
@font-face { font-family: 'Lora'; src: url('${window.location.origin}/lib/Fonts/Lora/Lora-Italic-VariableFont_wght.ttf') format('truetype'); font-weight: 400 700; font-style: italic; }
@font-face { font-family: 'Cabin'; src: url('${window.location.origin}/lib/Fonts/Cabin/Cabin-VariableFont_wdth,wght.ttf') format('truetype'); font-weight: 400 700; font-style: normal; }
@font-face { font-family: 'Cabin'; src: url('${window.location.origin}/lib/Fonts/Cabin/Cabin-Italic-VariableFont_wdth,wght.ttf') format('truetype'); font-weight: 400 700; font-style: italic; }
</style>`;
        if (newHtml.includes('<defs>')) {
          newHtml = newHtml.replace('<defs>', '<defs>' + fontsStyle);
        } else {
          newHtml = newHtml.replace(/<svg[^>]*>/i, '$&<defs>' + fontsStyle + '</defs>');
        }
      }

      newHtml = normalizePageAssetUrls(newHtml);
      return { ...p, html: newHtml };
    }));

    const modifiedPagesIndices = [];
    pagesToSave.forEach((p, index) => {
      const pid = p.v_id || p.id;
      const isKnownSaved = pid && lastSavedHtmlsRef.current[pid] && lastSavedHtmlsRef.current[pid] === p.html;
      if (!isKnownSaved) {
        modifiedPagesIndices.push(index);
      }
    });

    let currentVId = v_id;
    let lastRes = null;

      if (modifiedPagesIndices.length === 0) {
        // Send full structure with content so reordering/deletions never lose page data
        const payloadPages = pagesToSave.map((p, index) => ({
          pageNumber: index + 1,
          pageName: p.name || `Page ${index + 1}`,
          fileName: p.fileName || (p.name ? (p.name.endsWith('.svg') ? p.name : `${p.name}.svg`) : `${index + 1}.svg`),
          content: normalizePageAssetUrls(p.html),
          hide: p.isHidden ? 1 : 0,
          v_id: p.v_id || (typeof p.id === 'string' && p.id.length > 5 ? p.id : null)
        }));

        const activeDims = getFlipbookDimensions();
        const payload = {
          emailId: userEmail,
          v_id: currentVId,
          flipbookName: currentBook?.flipbookName || location.state?.flipbookName || 'Untitled Flipbook',
          folderName: resolvePhysicalFolder(currentBook?.folderName || location.state?.folderName),
          overwrite: true,
          keepBase64: false,
          pages: payloadPages,
          meta: {
            width: activeDims.width,
            height: activeDims.height,
            templateId: currentBook?.templateId || location.state?.templateId,
            orientation: currentBook?.orientation || location.state?.orientation
          }
        };

        lastRes = await axios.post(`${backendUrl}/api/flipbook/save`, payload, { withCredentials: true });
        if (lastRes.data && lastRes.data.v_id) {
          currentVId = lastRes.data.v_id;
        }
      } else {
        // Send all modified pages together in a single save request
        const modifiedSet = new Set(modifiedPagesIndices);

        const payloadPages = await Promise.all(pagesToSave.map(async (p, index) => {
          const isModified = modifiedSet.has(index);
          const pid = p.v_id || p.id;
          const isKnownSaved = pid && lastSavedHtmlsRef.current[pid] && lastSavedHtmlsRef.current[pid] === p.html;
          let content = (isModified || !isKnownSaved) ? normalizePageAssetUrls(p.html) : undefined;
          let contentChunkId = undefined;

          // CHUNKED UPLOAD LOGIC: If content is too large (> 2MB), upload in chunks
          const CHUNK_THRESHOLD = 2 * 1024 * 1024; // 2MB
          if (content && content.length > CHUNK_THRESHOLD) {
            const uploadId = `chunked-${Math.random().toString(36).substr(2, 9)}`;
            const CHUNK_DATA_SIZE = 1 * 1024 * 1024; // 1MB chunks
            const totalChunks = Math.ceil(content.length / CHUNK_DATA_SIZE);

            console.log(`[Save] Page ${index + 1} is large (${(content.length / 1024 / 1024).toFixed(2)} MB). Uploading in ${totalChunks} chunks...`);

            for (let i = 0; i < totalChunks; i++) {
              const chunk = content.substr(i * CHUNK_DATA_SIZE, CHUNK_DATA_SIZE);
              await axios.post(`${backendUrl}/api/flipbook/save/chunk`, {
                uploadId,
                chunkIndex: i,
                totalChunks,
                chunkData: chunk
              }, { withCredentials: true });
            }
            content = undefined;
            contentChunkId = uploadId;
          }

          return {
            pageNumber: index + 1,
            pageName: p.name || `Page ${index + 1}`,
            fileName: p.fileName || (p.name ? (p.name.endsWith('.svg') ? p.name : `${p.name}.svg`) : `${index + 1}.svg`),
            content,
            contentChunkId,
            hide: p.isHidden ? 1 : 0,
            v_id: p.v_id || (typeof p.id === 'string' && p.id.length > 5 ? p.id : null)
          };
        }));

        const activeDims = getFlipbookDimensions();
        const payload = {
          emailId: userEmail,
          v_id: currentVId,
          flipbookName: currentBook?.flipbookName || location.state?.flipbookName || 'Untitled Flipbook',
          folderName: resolvePhysicalFolder(currentBook?.folderName || location.state?.folderName),
          overwrite: true,
          keepBase64: false,
          pages: payloadPages,
          meta: {
            width: activeDims.width,
            height: activeDims.height,
            templateId: currentBook?.templateId || location.state?.templateId,
            orientation: currentBook?.orientation || location.state?.orientation
          }
        };

        const payloadSize = JSON.stringify(payload).length;
        console.log(`[Save] Sending modified pages ${Array.from(modifiedSet).map(n => n + 1).join(', ')}. Payload size: ${(payloadSize / 1024).toFixed(2)} KB`);

        lastRes = await axios.post(`${backendUrl}/api/flipbook/save`, payload, { withCredentials: true });
        if (lastRes.data && lastRes.data.v_id) {
          currentVId = lastRes.data.v_id;
        }
      }

      if (lastRes && lastRes.data && lastRes.data.v_id) {
        // Track successfully saved HTML to rapidly skip unchanged pages next time
        pagesToSave.forEach(p => {
          const pid = p.v_id || p.id;
          lastSavedHtmlsRef.current[pid] = p.html;
        });

        setHasUnsavedChanges(false);
        justSavedRef.current = true;
        // Merge backend v_id properties without overwriting live page HTML edited during async save window
        setPages(prevPages => {
          if (!prevPages || prevPages.length === 0) return pagesToSave;
          const backendPages = lastRes?.data?.pages || [];
          return prevPages.map((page, idx) => {
            const bPage = backendPages[idx];
            if (bPage && bPage.v_id && bPage.v_id !== currentVId && !page.v_id) {
              return { ...page, v_id: bPage.v_id };
            }
            return page;
          });
        });
        window.dispatchEvent(new CustomEvent('flipbook-saved'));
        triggerSaveSuccess({
          name: currentBook?.flipbookName || location.state?.flipbookName || 'Untitled Flipbook',
          folder: resolvePhysicalFolder(currentBook?.folderName || location.state?.folderName),
          isManual
        });
        console.log("Flipbook saved successfully:", lastRes.data);

        // Transition to project URL if we don't have a v_id yet
        if (!v_id) {
          const folderName = resolvePhysicalFolder(currentBook?.folderName || location.state?.folderName);
          const newUrl = `/editor/${encodeURIComponent(folderName)}/${lastRes.data.v_id}`;
          navigate(newUrl, { replace: true, state: location.state });
        }
      }
    } catch (err) {
      console.error("Failed to save flipbook:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Internal server error";
      const is413 = err?.response?.status === 413;
      alert(is413 ? "Save failed: The content size is too large for the server." : `Failed to save flipbook: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveFlipbook,
    autoSaveTimerRef,
    justSavedRef,
    lastSavedHtmlsRef
  };
};
