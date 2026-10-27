import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { getSupabaseBaseUrl, resolveUploadsPath } from '../../../../utils/assetUtils';
import { getTopLevelFrames } from '../utils/frameHierarchyUtils';

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

/**
 * Hook managing insertion of external media and assets:
 * - Images, GIFs, Video uploads, Iframe embeds (YouTube, Vimeo, Drive, Loom, Wistia)
 * - Hotspots, icon badges, style updates
 * - Masked image shapes (clipping masks)
 * - Background preloading of page images for smooth rendering
 */
export const useCanvasAssetInsertion = ({
  pages = [],
  activePageIndex = 0,
  baseWidth = 210,
  baseHeight = 297,
  updatePageHtml,
  saveModifiedPageHtml,
  setSelectedLayerId,
  setMultiSelectedIds,
  setActiveMainTool,
  setActiveTopTool,
  drawOverlayHighlight,
  currentFrameIdRef,
  setCurrentFrameId,
  selectedLayerIdRef,
  multiSelectedIdsRef,
  v_id,
  flipbookVId,
  folderName,
  flipbookName
}) => {
  const { user } = useAuth();
  const insertImageIntoPage = useCallback((pageIdx, rawDataUrl, dataType = 'image', dropPoint = null, targetShapeId = null, file = null) => {
    if (!rawDataUrl) return;
    if (typeof setActiveMainTool === 'function') {
      setActiveMainTool('select');
    }

    let dataUrl = typeof rawDataUrl === 'string' ? rawDataUrl.trim() : rawDataUrl;
    if (typeof dataUrl === 'string') {
      if (dataUrl.includes('\n') || dataUrl.includes('\r')) {
        const lines = dataUrl.split(/[\r\n]+/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        if (lines.length > 0) dataUrl = lines[0];
      }
      if (dataUrl.includes('<img') || dataUrl.includes('<a ')) {
        const match = dataUrl.match(/(?:src|href)=["']([^"']+)["']/i);
        if (match && match[1]) {
          dataUrl = match[1];
        }
      }
    }

    const container = document.querySelector(`.page-svg-container[data-page-index="${pageIdx}"]`);
    const svg = container?.querySelector('svg');
    if (!svg) {
      console.error(`[CanvasAssetInsertion] Could not find SVG container for page ${pageIdx}`);
      return;
    }

    const groupId = `image-group-${Math.random().toString(36).substr(2, 9)}`;
    const newGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    newGroup.id = groupId;
    newGroup.setAttribute('data-type', dataType || 'image');
    if (dataType === 'gif') {
      newGroup.setAttribute('data-name', 'GIF Group');
      newGroup.setAttribute('data-is-gif-group', 'true');
    } else if (dataType === 'video') {
      newGroup.setAttribute('data-name', 'Video Group');
      newGroup.setAttribute('data-is-video-group', 'true');
    } else {
      newGroup.setAttribute('data-name', 'Image Group');
      newGroup.setAttribute('data-is-image-group', 'true');
    }

    const imgId = `image-${Math.random().toString(36).substr(2, 9)}`;
    const newImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    newImg.id = imgId;
    newImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl);
    newImg.setAttribute('href', dataUrl);
    if (dataType === 'gif') {
      newImg.setAttribute('data-name', 'GIF');
    } else if (dataType === 'video') {
      newImg.setAttribute('data-name', 'Video');
    } else {
      newImg.setAttribute('data-name', 'Image');
    }
    newImg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    newGroup.appendChild(newImg);

    let inserted = false;
    const placeImageInFrame = (imgWidth = 100, imgHeight = 100) => {
      if (inserted) return;
      inserted = true;

      const uploadAssetInBackground = async (imgNode, groupNode, fileObj, sourceBlobUrl) => {
        try {
          let uploadFile = fileObj;
          if (!uploadFile && sourceBlobUrl && typeof sourceBlobUrl === 'string' && sourceBlobUrl.startsWith('blob:')) {
            const res = await fetch(sourceBlobUrl);
            const blob = await res.blob();
            const ext = dataType === 'gif' ? '.gif' : (blob.type?.includes('png') ? '.png' : '.jpg');
            uploadFile = new File([blob], `asset_${Date.now()}${ext}`, { type: blob.type || 'image/png' });
          }
          if (!uploadFile) return;

          const emailId = user?.emailId || user?.email;
          if (!emailId) return;

          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const resolvedFolder = resolvePhysicalFolder(folderName);
          const resolvedBook = flipbookName || 'Untitled_Document';
          const subFolder = dataType === 'gif' ? 'gif' : 'Image';

          const formData = new FormData();
          formData.append('emailId', emailId);
          if (flipbookVId || v_id) formData.append('v_id', flipbookVId || v_id);
          formData.append('folderName', resolvedFolder);
          formData.append('flipbookName', resolvedBook);
          formData.append('type', dataType || 'image');
          formData.append('assetType', subFolder);
          formData.append('page_v_id', pages[pageIdx]?.v_id || pages[pageIdx]?.id || 'global');
          formData.append('file', uploadFile);

          const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData);
          if (res.data && (res.data.url || res.data.filename)) {
            const filename = res.data.filename;
            const relativePath = res.data.flipbookPath || (res.data.url?.startsWith('../') ? res.data.url : `../assets/${subFolder}/${filename}`);

            // Live rendering needs a fully accessible URL, NOT an unresolvable relative ../assets/ path
            let accessibleUrl = '';
            if (res.data.serverUrl || res.data.storageUrl) {
              accessibleUrl = resolveUploadsPath(res.data.serverUrl || res.data.storageUrl);
            } else if (res.data.url && !res.data.url.startsWith('../') && !res.data.url.startsWith('./')) {
              accessibleUrl = resolveUploadsPath(res.data.url);
            } else {
              const projectBaseUrl = getSupabaseBaseUrl(
                user?.userID || user?.emailId || user?.email,
                resolvedFolder,
                resolvedBook
              );
              accessibleUrl = `${projectBaseUrl}assets/${subFolder}/${filename}`;
            }

            imgNode.setAttribute('href', accessibleUrl);
            try { imgNode.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', accessibleUrl); } catch {}
            imgNode.setAttribute('data-relative-src', relativePath);
            imgNode.setAttribute('data-flipbook-path', relativePath);
            if (res.data.file_v_id) {
              imgNode.dataset.fileVid = res.data.file_v_id;
              if (groupNode) {
                groupNode.dataset.fileVid = res.data.file_v_id;
                groupNode.setAttribute('data-file-vid', res.data.file_v_id);
                if (groupNode.hasAttribute('data-masked-image-url')) {
                  groupNode.setAttribute('data-masked-image-url', accessibleUrl);
                  groupNode.setAttribute('data-relative-src', relativePath);
                }
              }
            }

            if (saveModifiedPageHtml) {
              saveModifiedPageHtml(pageIdx, svg);
            } else if (updatePageHtml) {
              updatePageHtml(pageIdx, svg.outerHTML);
            }
            console.log(`[CanvasAssetInsertion] Background asset uploaded: ${relativePath} -> live: ${accessibleUrl}`);
          }
        } catch (err) {
          console.error('[CanvasAssetInsertion] Background asset upload failed:', err);
        }
      };

      if (targetShapeId && dataType === 'image') {
        const shapeEl = svg.querySelector(`[id="${targetShapeId}"]`);
        if (shapeEl) {
          try {
            // Find inner path or the shape itself
            let innerShape = shapeEl.querySelector('path, polygon, rect, circle, ellipse');
            if (!innerShape && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(shapeEl.tagName?.toLowerCase())) {
              innerShape = shapeEl;
            }

            const targetNode = innerShape || shapeEl;
            if (!targetNode.hasAttribute('data-original-fill')) {
              targetNode.setAttribute('data-original-fill', targetNode.getAttribute('fill') || shapeEl.getAttribute('fill') || '#3194FC');
            }

            shapeEl.setAttribute('data-mask-enabled', 'true');
            if (innerShape) innerShape.setAttribute('data-mask-enabled', 'true');

            const imgName = file?.name || 'Image.webp';
            const sizeStr = file?.size ? (file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)}MB` : `${Math.round(file.size / 1024)}KB`) : '24MB';
            const meta = `${sizeStr}`;

            shapeEl.setAttribute('data-slot-image-name', imgName);
            shapeEl.setAttribute('data-slot-image-meta', meta);
            shapeEl.setAttribute('data-slot-original-url', dataUrl);
            shapeEl.setAttribute('data-slot-fix-type', 'Fill All');

            if (innerShape) {
              innerShape.setAttribute('data-slot-image-name', imgName);
              innerShape.setAttribute('data-slot-image-meta', meta);
              innerShape.setAttribute('data-slot-original-url', dataUrl);
              innerShape.setAttribute('data-slot-fix-type', 'Fill All');
            }

            // Clean up any old clipPath/detached masked-img elements
            const safeShapeId = (targetShapeId || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '_');
            const oldClip = svg.querySelector(`clipPath[id="clip-shape-${safeShapeId}"]`);
            if (oldClip) oldClip.remove();
            const oldImg = svg.querySelector(`image[id="masked-img-${safeShapeId}"]`);
            if (oldImg) oldImg.remove();

            // Set up SVG pattern inside shape's defs or root defs
            let defs = shapeEl.querySelector('defs');
            if (!defs) {
              defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
              shapeEl.insertBefore(defs, shapeEl.firstChild);
            }

            const patternId = `pattern-${targetShapeId}`;
            let pattern = defs.querySelector(`pattern[id="${patternId}"]`);
            if (!pattern) {
              pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
              pattern.setAttribute('id', patternId);
              defs.appendChild(pattern);
            }

            let bbox = { width: 100, height: 100, x: 0, y: 0 };
            try {
              bbox = targetNode.getBBox();
            } catch(e) {}
            if (bbox.width === 0 || bbox.height === 0) bbox = { width: 100, height: 100, x: 0, y: 0 };

            const slotW = bbox.width;
            const slotH = bbox.height;

            pattern.setAttribute('patternUnits', 'objectBoundingBox');
            pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
            pattern.setAttribute('width', '1');
            pattern.setAttribute('height', '1');
            pattern.removeAttribute('patternTransform');
            pattern.removeAttribute('viewBox');

            let imageNode = pattern.querySelector('image, img');
            if (!imageNode) {
              imageNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
              pattern.appendChild(imageNode);
            }

            imageNode.removeAttribute('preserveAspectRatio');
            imageNode.removeAttribute('x');
            imageNode.removeAttribute('y');
            imageNode.setAttribute('href', dataUrl);
            imageNode.setAttribute('xlink:href', dataUrl);
            imageNode.setAttribute('opacity', '1');

            const tempImg = new window.Image();
            tempImg.onload = () => {
              const imgW = tempImg.naturalWidth || tempImg.width || slotW;
              const imgH = tempImg.naturalHeight || tempImg.height || slotH;
              const scale = Math.max(slotW / imgW, slotH / imgH);
              const finalW = imgW * scale;
              const finalH = imgH * scale;
              const tx = bbox.x + (slotW - finalW) / 2;
              const ty = bbox.y + (slotH - finalH) / 2;
              imageNode.setAttribute('width', imgW);
              imageNode.setAttribute('height', imgH);
              imageNode.setAttribute('transform', `matrix(${scale} 0 0 ${scale} ${tx} ${ty})`);
              if (saveModifiedPageHtml) {
                saveModifiedPageHtml(pageIdx, svg);
              } else if (updatePageHtml) {
                updatePageHtml(pageIdx, svg.outerHTML);
              }
            };
            tempImg.src = dataUrl;

            // Set pattern fill on both target node and group
            targetNode.setAttribute('fill', `url(#${patternId})`);
            shapeEl.setAttribute('fill', `url(#${patternId})`);

            if (saveModifiedPageHtml) {
              saveModifiedPageHtml(pageIdx, svg);
            } else if (updatePageHtml) {
              updatePageHtml(pageIdx, svg.outerHTML);
            }

            uploadAssetInBackground(imageNode, shapeEl, file, dataUrl);

            window.dispatchEvent(new CustomEvent('shape-mask-toggled', { detail: { layerId: targetShapeId, enabled: true, url: dataUrl } }));

            if (setSelectedLayerId) setSelectedLayerId(targetShapeId);
            if (selectedLayerIdRef) selectedLayerIdRef.current = targetShapeId;
            if (setMultiSelectedIds) setMultiSelectedIds(new Set([targetShapeId]));
            if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([targetShapeId]);

            if (setActiveMainTool) setActiveMainTool('select');
            setTimeout(() => {
              const el = document.getElementById(targetShapeId);
              if (el && typeof drawOverlayHighlight === 'function') {
                drawOverlayHighlight(el, 'selected');
              }
            }, 50);
            return;
          } catch (err) {
            console.error('[CanvasAssetInsertion] Masking image failed:', err);
          }
        }
      }

      const topFrames = getTopLevelFrames(svg);
      const targetFrame = currentFrameIdRef?.current ? svg.querySelector(`[id="${currentFrameIdRef.current}"]`) : null;
      const rootFrame = targetFrame || topFrames[0] || svg.querySelector('g') || svg;

      if (rootFrame) {
        try {
          let pWidth = baseWidth || 210, pHeight = baseHeight || 297;
          let pX = 0, pY = 0;

          try {
            const viewBoxAttr = svg.getAttribute('viewBox');
            if (viewBoxAttr) {
              const vb = viewBoxAttr.split(/[\s,]+/).map(Number);
              if (vb.length === 4 && !isNaN(vb[2]) && !isNaN(vb[3]) && vb[2] > 0 && vb[3] > 0) {
                pX = vb[0];
                pY = vb[1];
                pWidth = vb[2];
                pHeight = vb[3];
              }
            }
            if (rootFrame.getBBox) {
              const bbox = rootFrame.getBBox();
              if (bbox.width > 0 && bbox.height > 0) {
                pWidth = bbox.width;
                pHeight = bbox.height;
                pX = bbox.x;
                pY = bbox.y;
              }
            }
          } catch { /* ignored */ }

          const targetInitialSize = Math.min(pWidth * 0.4, 90);
          let displayWidth = targetInitialSize;
          let displayHeight = (imgHeight / imgWidth) * displayWidth;

          if (displayHeight > targetInitialSize) {
            displayHeight = targetInitialSize;
            displayWidth = (imgWidth / imgHeight) * displayHeight;
          }

          const cx = dropPoint && typeof dropPoint.x === 'number' ? dropPoint.x : (pX + pWidth / 2);
          const cy = dropPoint && typeof dropPoint.y === 'number' ? dropPoint.y : (pY + pHeight / 2);

          newGroup.setAttribute('data-object-fit', 'Fit');
          newImg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          newImg.setAttribute('x', (cx - displayWidth / 2).toString());
          newImg.setAttribute('y', (cy - displayHeight / 2).toString());
          newImg.setAttribute('width', displayWidth.toString());
          newImg.setAttribute('height', displayHeight.toString());

          rootFrame.appendChild(newGroup);

          if (saveModifiedPageHtml) {
            saveModifiedPageHtml(pageIdx, svg);
          } else if (updatePageHtml) {
            updatePageHtml(pageIdx, svg.outerHTML);
          }

          uploadAssetInBackground(newImg, newGroup, file, dataUrl);

          if (setSelectedLayerId) setSelectedLayerId(groupId);
          if (selectedLayerIdRef) selectedLayerIdRef.current = groupId;
          if (setMultiSelectedIds) setMultiSelectedIds(new Set([groupId]));
          if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([groupId]);

          if (setActiveMainTool) setActiveMainTool('select');
          if (setCurrentFrameId && rootFrame.id) {
            setCurrentFrameId(rootFrame.id);
            if (currentFrameIdRef) currentFrameIdRef.current = rootFrame.id;
          }

          setTimeout(() => {
            const el = document.getElementById(groupId);
            if (el && typeof drawOverlayHighlight === 'function') {
              drawOverlayHighlight(el, 'selected');
            }
          }, 50);
        } catch (err) {
          console.error('[CanvasAssetInsertion] Failed to insert image into SVG frame:', err);
        }
      }
    };

    const i = new Image();
    i.referrerPolicy = 'no-referrer';
    i.onload = () => {
      placeImageInFrame(i.width || 100, i.height || 100);
    };
    i.onerror = () => {
      placeImageInFrame(100, 100);
    };
    i.src = dataUrl;
  }, [baseHeight, baseWidth, currentFrameIdRef, drawOverlayHighlight, multiSelectedIdsRef, saveModifiedPageHtml, selectedLayerIdRef, setActiveMainTool, setCurrentFrameId, setMultiSelectedIds, setSelectedLayerId, updatePageHtml, user, folderName, flipbookName, flipbookVId, v_id, pages]);

  // Handle external asset insertion events
  useEffect(() => {
    const handleAddIcon = (e) => {
      const { icon, pageIndex, dropPoint } = e.detail || {};
      if (!icon) return;
      const targetPageIndex = pageIndex !== undefined ? pageIndex : activePageIndex;
      const page = pages[targetPageIndex];
      if (!page) return;

      const liveContainer = document.querySelector(`.page-svg-container[data-page-index="${targetPageIndex}"]`);
      const liveSvg = liveContainer?.querySelector('svg');

      let targetSvg = liveSvg;
      let doc = null;

      if (!targetSvg) {
        const parser = new DOMParser();
        doc = parser.parseFromString(page.html || '', 'image/svg+xml');
        targetSvg = doc.querySelector('svg');
      }
      if (!targetSvg) return;

      let svgW = baseWidth || 793;
      let svgH = baseHeight || 1121;
      let vbMinX = 0;
      let vbMinY = 0;
      const viewBox = targetSvg.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
          vbMinX = parts[0];
          vbMinY = parts[1];
          svgW = parts[2];
          svgH = parts[3];
        }
      } else {
        const wAttr = parseFloat(targetSvg.getAttribute('width'));
        const hAttr = parseFloat(targetSvg.getAttribute('height'));
        if (!isNaN(wAttr) && wAttr > 0) svgW = wAttr;
        if (!isNaN(hAttr) && hAttr > 0) svgH = hAttr;
      }

      const size = 42;
      let cx = dropPoint ? dropPoint.x : (vbMinX + svgW / 2);
      let cy = dropPoint ? dropPoint.y : (vbMinY + svgH / 2);

      const margin = 15;
      cx = Math.max(vbMinX + margin, Math.min(vbMinX + svgW - margin, cx));
      cy = Math.max(vbMinY + margin, Math.min(vbMinY + svgH - margin, cy));

      const newId = `icon-${Math.random().toString(36).substr(2, 9)}`;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.id = newId;
      g.setAttribute('data-type', 'icon');
      g.setAttribute('data-name', `${icon.name || 'Icon'}`);
      g.setAttribute('transform', `translate(${cx - size / 2}, ${cy - size / 2})`);

      // Transparent hit-box for reliable selection, dragging, and hover
      const hitRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hitRect.setAttribute('x', '0');
      hitRect.setAttribute('y', '0');
      hitRect.setAttribute('width', String(size));
      hitRect.setAttribute('height', String(size));
      hitRect.setAttribute('fill', 'transparent');
      hitRect.setAttribute('pointer-events', 'all');
      g.appendChild(hitRect);

      // Scaled icon paths container
      const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      iconGroup.setAttribute('transform', `scale(${size / 24})`);
      iconGroup.setAttribute('fill', 'none');
      iconGroup.setAttribute('stroke', '#111827');
      iconGroup.setAttribute('stroke-width', '2');
      iconGroup.setAttribute('stroke-linecap', 'round');
      iconGroup.setAttribute('stroke-linejoin', 'round');
      iconGroup.setAttribute('pointer-events', 'none');

      if (icon.html) {
        iconGroup.innerHTML = icon.html;
      } else if (icon.d) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', icon.d);
        iconGroup.appendChild(path);
      }
      g.appendChild(iconGroup);

      const targetContainer = targetSvg.querySelector('[data-type="frame"]') ||
                              targetSvg.querySelector('[data-name="Overlay"]')?.parentElement ||
                              targetSvg.querySelector('g[id^="g-"]') ||
                              targetSvg.querySelector('g') ||
                              targetSvg;

      // Migrate orphaned elements
      if (targetContainer !== targetSvg) {
        Array.from(targetSvg.children).forEach(child => {
          if (child === targetContainer) return;
          if (['defs', 'metadata', 'style', 'title', 'desc'].includes(child.tagName.toLowerCase())) return;
          if (child.getAttribute('data-name') === 'Document Shield' || child.getAttribute('data-type') === 'shield') return;
          targetContainer.appendChild(child);
        });
      }

      targetContainer.appendChild(g);

      if (liveSvg && saveModifiedPageHtml) {
        saveModifiedPageHtml(targetPageIndex, targetSvg);
      } else if (updatePageHtml) {
        updatePageHtml(targetPageIndex, targetSvg.outerHTML);
      }

      if (setSelectedLayerId) setSelectedLayerId(newId);
      if (selectedLayerIdRef) selectedLayerIdRef.current = newId;
      if (setMultiSelectedIds) setMultiSelectedIds(new Set([newId]));
      if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([newId]);

      if (setActiveMainTool) setActiveMainTool('select');
      setTimeout(() => {
        const el = document.getElementById(newId);
        if (el && typeof drawOverlayHighlight === 'function') {
          drawOverlayHighlight(el, 'selected');
        }
      }, 50);
    };

    const handleAddHotspot = (e) => {
      const { icon, pageIndex } = e.detail;
      const targetPageIndex = pageIndex !== undefined ? pageIndex : activePageIndex;
      const page = pages[targetPageIndex];
      if (!page) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(page.html || '', 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return;

      let svgW = 793;
      let svgH = 1121;
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[ ,]+/).map(parseFloat);
        if (parts.length === 4) {
          svgW = parts[2];
          svgH = parts[3];
        }
      } else {
        const wAttr = parseFloat(svg.getAttribute('width'));
        const hAttr = parseFloat(svg.getAttribute('height'));
        if (!isNaN(wAttr) && wAttr > 0) svgW = wAttr;
        if (!isNaN(hAttr) && hAttr > 0) svgH = hAttr;
      }
      const centerX = e.detail.dropPoint ? e.detail.dropPoint.x : (svgW / 2);
      const centerY = e.detail.dropPoint ? e.detail.dropPoint.y : (svgH / 2);

      const newId = `hotspot-${Date.now()}`;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.id = newId;
      g.setAttribute('data-type', 'hotspot');
      g.setAttribute('transform', `translate(${centerX - 12}, ${centerY - 12}) scale(0.5)`);
      g.setAttribute('data-is-hotspot', 'true');
      g.setAttribute('data-show-highlight', 'false');

      const currentPresetId = e.detail.presetId || (icon && icon.presetId);
      if (currentPresetId) {
        g.setAttribute('data-preset-id', currentPresetId);
        const actionMap = {
          'youtube': 'open-link',
          'instagram': 'open-link',
          'x': 'open-link',
          'facebook': 'open-link',
          'linkedin': 'open-link',
          'open-link': 'open-link',
          'navigate-to': 'navigate-to',
          'whatsapp': 'whatsapp',
          'call': 'call',
          'email': 'email',
          'video': 'popup',
          'popup': 'popup',
          'slideshow': 'slideshow',
          'zoom': 'zoom',
          'download': 'download',
          'audio': 'audio',
          'info-box': 'info-box',
          'location': 'open-link',
          '3d-viewer': '3d-viewer',
          'interactive-button': 'open-link'
        };
        const actionType = actionMap[currentPresetId];
        if (actionType) {
          g.setAttribute('data-interaction', actionType);
        }
      }

      if (icon?.bgColor) g.setAttribute('data-bg-color', icon.bgColor);
      if (icon?.iconColor) g.setAttribute('data-icon-color', icon.iconColor);

      if (icon?.html) {
        g.innerHTML = icon.html;
      } else if (icon?.d) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', icon.d);
        g.appendChild(path);
      } else if (icon?.src) {
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', icon.src);
        image.setAttribute('width', '48');
        image.setAttribute('height', '48');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        g.appendChild(image);
      }

      const targetContainer = svg.querySelector('[data-type="frame"]') || svg.querySelector('[data-name="Overlay"]') || svg;
      targetContainer.appendChild(g);

      if (updatePageHtml) updatePageHtml(targetPageIndex, svg.outerHTML);

      if (setSelectedLayerId) setSelectedLayerId(newId);
      if (selectedLayerIdRef) selectedLayerIdRef.current = newId;
      if (setMultiSelectedIds) setMultiSelectedIds(new Set([newId]));
      if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([newId]);

      if (setActiveMainTool) setActiveMainTool('select');
      setTimeout(() => {
        const el = document.getElementById(newId);
        if (el && typeof drawOverlayHighlight === 'function') {
          drawOverlayHighlight(el, 'selected');
        }
      }, 50);

      if (e.detail.isHotspot && typeof setActiveTopTool === 'function') {
        setActiveTopTool('interaction');
      }
    };

    const handleUploadVideo = (e) => {
      const { videoUrl, originalUrl, pageIndex, file } = e.detail;
      const targetPageIndex = pageIndex !== undefined ? pageIndex : activePageIndex;

      const container = document.querySelector(`.page-svg-container[data-page-index="${targetPageIndex}"]`);
      const svg = container?.querySelector('svg');
      if (!svg) return;

      const rawUrl = originalUrl || videoUrl || '';
      const lowerRaw = rawUrl.toLowerCase();
      const isYouTube = lowerRaw.includes('youtube.com') || lowerRaw.includes('youtu.be') || (videoUrl && videoUrl.includes('youtube.com/embed'));
      const isVimeo = lowerRaw.includes('vimeo.com') || (videoUrl && videoUrl.includes('vimeo.com/video'));
      const isDailymotion = lowerRaw.includes('dailymotion') || lowerRaw.includes('dai.ly');
      const isLoom = lowerRaw.includes('loom.com');
      const isWistia = lowerRaw.includes('wistia.com');
      const isGoogleDrive = lowerRaw.includes('drive.google.com');

      const isIframe = isYouTube || isVimeo || isDailymotion || isLoom || isWistia || isGoogleDrive || (videoUrl && (videoUrl.includes('embed') || videoUrl.includes('player') || videoUrl.includes('preview')));

      let finalEmbedUrl = videoUrl;
      if (isYouTube) {
        let videoId = '';
        if (rawUrl.includes('youtu.be/')) videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        else if (rawUrl.includes('watch?v=')) videoId = rawUrl.split('v=')[1]?.split('&')[0];
        else if (rawUrl.includes('shorts/')) videoId = rawUrl.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
        else if (rawUrl.includes('embed/')) videoId = rawUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
        if (videoId) finalEmbedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      } else if (isVimeo) {
        let videoId = rawUrl.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
        if (videoId && !isNaN(videoId)) finalEmbedUrl = `https://player.vimeo.com/video/${videoId}`;
      } else if (isDailymotion) {
        let videoId = '';
        if (rawUrl.includes('dai.ly/')) videoId = rawUrl.split('dai.ly/')[1]?.split('?')[0];
        else if (rawUrl.includes('video/')) videoId = rawUrl.split('video/')[1]?.split('?')[0];
        if (videoId) finalEmbedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
      } else if (isLoom) {
        let videoId = rawUrl.split('loom.com/share/')[1]?.split('?')[0];
        if (videoId) finalEmbedUrl = `https://www.loom.com/embed/${videoId}`;
      } else if (isWistia) {
        let videoId = rawUrl.split('wistia.com/medias/')[1]?.split('?')[0];
        if (videoId) finalEmbedUrl = `https://fast.wistia.net/embed/iframe/${videoId}`;
      } else if (isGoogleDrive) {
        const match = rawUrl.match(/\/d\/([^/]+)/);
        if (match && match[1]) finalEmbedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }

      // 1. Resolve true page dimensions from viewBox and background Overlay
      let pageX = 0, pageY = 0, pageW = baseWidth || 210, pageH = baseHeight || 297;
      const viewBoxAttr = svg.getAttribute('viewBox');
      if (viewBoxAttr) {
        const vb = viewBoxAttr.split(/[\s,]+/).map(Number);
        if (vb.length === 4 && !isNaN(vb[2]) && !isNaN(vb[3]) && vb[2] > 0 && vb[3] > 0) {
          pageX = vb[0];
          pageY = vb[1];
          pageW = vb[2];
          pageH = vb[3];
        }
      }

      const bgRect = svg.querySelector('[data-name="Overlay"]');
      if (bgRect) {
        const bgW = parseFloat(bgRect.getAttribute('width'));
        const bgH = parseFloat(bgRect.getAttribute('height'));
        const bgX = parseFloat(bgRect.getAttribute('x')) || 0;
        const bgY = parseFloat(bgRect.getAttribute('y')) || 0;
        if (!isNaN(bgW) && bgW > 0 && !isNaN(bgH) && bgH > 0) {
          pageX = bgX;
          pageY = bgY;
          pageW = bgW;
          pageH = bgH;
        }
      }

      // 2. Proportional initial dimensions (fit nicely in page at 16:9 ratio)
      const targetInitialW = Math.min(pageW * 0.65, 150);
      let displayWidth = targetInitialW;
      let displayHeight = displayWidth * (9 / 16);
      if (displayHeight > pageH * 0.6) {
        displayHeight = pageH * 0.6;
        displayWidth = displayHeight * (16 / 9);
      }

      const dropPoint = e.detail?.dropPoint;
      const initialCx = (dropPoint && typeof dropPoint.x === 'number') ? dropPoint.x : (pageX + pageW / 2);
      const initialCy = (dropPoint && typeof dropPoint.y === 'number') ? dropPoint.y : (pageY + pageH / 2);
      const initialX = initialCx - displayWidth / 2;
      const initialY = initialCy - displayHeight / 2;

      const groupId = `video-group-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const foId = `video-${Date.now()}`;

      const videoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      videoGroup.id = groupId;
      videoGroup.setAttribute('data-type', 'video');
      videoGroup.setAttribute('data-name', 'Video Group');
      videoGroup.setAttribute('data-is-video-group', 'true');



      const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      fo.id = foId;
      fo.setAttribute('data-type', 'video');
      fo.setAttribute('data-name', 'Video');
      fo.setAttribute('data-object-fit', 'Fit');
      fo.setAttribute('x', initialX.toString());
      fo.setAttribute('y', initialY.toString());
      fo.setAttribute('width', displayWidth.toString());
      fo.setAttribute('height', displayHeight.toString());
      if (file && file.name) fo.setAttribute('data-filename', file.name);
      if (file && file.size) fo.setAttribute('data-filesize', file.size);

      const videoWrapper = document.createElement('div');
      videoWrapper.className = 'video-container';
      Object.assign(videoWrapper.style, {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        borderRadius: '0px'
      });

      if (isIframe) {
        fo.setAttribute('data-is-iframe', 'true');
        fo.setAttribute('data-video-url', rawUrl);

        const iframe = document.createElement('iframe');
        iframe.src = finalEmbedUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');

        videoWrapper.appendChild(iframe);
      } else {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.display = 'block';
        video.setAttribute('playsinline', 'true');
        video.setAttribute('preload', 'metadata');

        const tempVid = document.createElement('video');
        tempVid.src = videoUrl;
        tempVid.onloadedmetadata = () => {
          if (tempVid.videoWidth && tempVid.videoHeight) {
            const aspect = tempVid.videoWidth / tempVid.videoHeight;
            let dynamicW = displayWidth;
            let dynamicH = dynamicW / aspect;
            if (dynamicH > pageH * 0.7) {
              dynamicH = pageH * 0.7;
              dynamicW = dynamicH * aspect;
            }
            const curX = parseFloat(fo.getAttribute('x')) || initialX;
            const curY = parseFloat(fo.getAttribute('y')) || initialY;
            const curW = parseFloat(fo.getAttribute('width')) || displayWidth;
            const curH = parseFloat(fo.getAttribute('height')) || displayHeight;
            const cX = curX + curW / 2;
            const cY = curY + curH / 2;

            fo.setAttribute('width', dynamicW.toString());
            fo.setAttribute('height', dynamicH.toString());
            fo.setAttribute('x', (cX - dynamicW / 2).toString());
            fo.setAttribute('y', (cY - dynamicH / 2).toString());

            boundsRect.setAttribute('width', dynamicW.toString());
            boundsRect.setAttribute('height', dynamicH.toString());
            boundsRect.setAttribute('x', (cX - dynamicW / 2).toString());
            boundsRect.setAttribute('y', (cY - dynamicH / 2).toString());

            const tempBar = fo.querySelector('.custom-video-overlay');
            if (tempBar) tempBar.remove();

            if (updatePageHtml) updatePageHtml(targetPageIndex, svg.outerHTML);
          }
        };

        videoWrapper.appendChild(video);
      }

      fo.appendChild(videoWrapper);
      videoGroup.appendChild(fo);

      // Append to the page canvas container, NOT to an arbitrary child layer
      const targetContainer = svg.querySelector('[data-type="frame"]') ||
        svg.querySelector('[data-name="Overlay"]')?.parentElement ||
        svg;
      targetContainer.appendChild(videoGroup);

      if (updatePageHtml) updatePageHtml(targetPageIndex, svg.outerHTML);

      if (!isIframe && (file || (videoUrl && typeof videoUrl === 'string' && videoUrl.startsWith('blob:')))) {
        (async () => {
          try {
            let uploadFile = file;
            if (!uploadFile && videoUrl && videoUrl.startsWith('blob:')) {
              const res = await fetch(videoUrl);
              const blob = await res.blob();
              uploadFile = new File([blob], `video_${Date.now()}.mp4`, { type: blob.type || 'video/mp4' });
            }
            if (!uploadFile) return;

            const emailId = user?.emailId || user?.email;
            if (!emailId) return;

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const resolvedFolder = resolvePhysicalFolder(folderName);
            const resolvedBook = flipbookName || 'Untitled_Document';

            const formData = new FormData();
            formData.append('emailId', emailId);
            if (flipbookVId || v_id) formData.append('v_id', flipbookVId || v_id);
            formData.append('folderName', resolvedFolder);
            formData.append('flipbookName', resolvedBook);
            formData.append('type', 'video');
            formData.append('assetType', 'video');
            formData.append('page_v_id', pages[targetPageIndex]?.v_id || pages[targetPageIndex]?.id || 'global');
            formData.append('file', uploadFile);

            const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData);
            if (res.data && (res.data.url || res.data.filename)) {
              const filename = res.data.filename;
              const relativePath = res.data.flipbookPath || (res.data.url?.startsWith('../') ? res.data.url : `../assets/video/${filename}`);

              let accessibleUrl = '';
              if (res.data.serverUrl || res.data.storageUrl) {
                accessibleUrl = resolveUploadsPath(res.data.serverUrl || res.data.storageUrl);
              } else if (res.data.url && !res.data.url.startsWith('../') && !res.data.url.startsWith('./')) {
                accessibleUrl = resolveUploadsPath(res.data.url);
              } else {
                const projectBaseUrl = getSupabaseBaseUrl(
                  user?.userID || user?.emailId || user?.email,
                  resolvedFolder,
                  resolvedBook
                );
                accessibleUrl = `${projectBaseUrl}assets/video/${filename}`;
              }

              fo.setAttribute('data-video-src', relativePath);
              fo.setAttribute('data-relative-src', relativePath);
              const vTag = fo.querySelector('video');
              if (vTag && accessibleUrl) {
                vTag.src = accessibleUrl;
              }
              if (res.data.file_v_id) {
                fo.setAttribute('data-file-vid', res.data.file_v_id);
                videoGroup.setAttribute('data-file-vid', res.data.file_v_id);
              }
              if (updatePageHtml) updatePageHtml(targetPageIndex, svg.outerHTML);
              console.log(`[CanvasAssetInsertion] Background video uploaded: ${relativePath} -> live: ${accessibleUrl}`);
            }
          } catch (err) {
            console.error('[CanvasAssetInsertion] Background video upload failed:', err);
          }
        })();
      }

      if (setSelectedLayerId) setSelectedLayerId(groupId);
      if (selectedLayerIdRef) selectedLayerIdRef.current = groupId;
      if (setMultiSelectedIds) setMultiSelectedIds(new Set([groupId]));
      if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([groupId]);

      if (setActiveMainTool) setActiveMainTool('select');
      setTimeout(() => {
        const el = document.getElementById(groupId) || document.getElementById(foId);
        if (el && typeof drawOverlayHighlight === 'function') {
          drawOverlayHighlight(el, 'selected');
        }
      }, 50);
    };

    const handleAddImage = (e) => {
      if (typeof setActiveMainTool === 'function') {
        setActiveMainTool('select');
      }
      const { url, gifUrl, pageIndex, dropPoint, type, targetShapeId, file } = e.detail || {};
      const targetPageIndex = pageIndex !== undefined ? pageIndex : activePageIndex;
      const mediaUrl = gifUrl || url;
      if (!mediaUrl) return;
      const dataType = type || (gifUrl || mediaUrl.toLowerCase().endsWith('.gif') ? 'gif' : 'image');
      insertImageIntoPage(targetPageIndex, mediaUrl, dataType, dropPoint, targetShapeId, file);
    };

    const handleUploadImageEvent = (e) => {
      const { pageIndex, dataUrl, dataType } = e.detail;
      insertImageIntoPage(pageIndex, dataUrl, dataType);
    };

    window.addEventListener('add-icon-to-editor', handleAddIcon);
    window.addEventListener('add-hotspot-to-editor', handleAddHotspot);
    window.addEventListener('update-hotspot-style', (e) => {
      const { id, pageIndex, html, presetId, iconSrc, bgColor, iconColor } = e.detail;
      const targetPageIndex = pageIndex !== undefined ? pageIndex : activePageIndex;
      const page = pages[targetPageIndex];
      if (!page) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(page.html || '', 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return;

      const g = svg.getElementById(id);
      if (!g) return;

      if (html) {
        g.innerHTML = html;
      }
      if (presetId) g.setAttribute('data-preset-id', presetId);
      if (iconSrc) {
        g.setAttribute('data-hotspot-icon-src', iconSrc);
      } else {
        g.removeAttribute('data-hotspot-icon-src');
      }
      if (bgColor) g.setAttribute('data-bg-color', bgColor);
      if (iconColor) g.setAttribute('data-icon-color', iconColor);

      if (updatePageHtml) updatePageHtml(targetPageIndex, svg.outerHTML);
    });
    window.addEventListener('add-image-to-editor', handleAddImage);
    window.addEventListener('upload-video-to-editor', handleUploadVideo);
    window.addEventListener('upload-image-to-editor', handleUploadImageEvent);

    return () => {
      window.removeEventListener('add-icon-to-editor', handleAddIcon);
      window.removeEventListener('add-hotspot-to-editor', handleAddHotspot);
      window.removeEventListener('add-image-to-editor', handleAddImage);
      window.removeEventListener('upload-video-to-editor', handleUploadVideo);
      window.removeEventListener('upload-image-to-editor', handleUploadImageEvent);
    };
  }, [activePageIndex, pages, updatePageHtml, setSelectedLayerId, selectedLayerIdRef, setMultiSelectedIds, multiSelectedIdsRef, setActiveMainTool, setActiveTopTool, drawOverlayHighlight, baseWidth, baseHeight, insertImageIntoPage, user, folderName, flipbookName, flipbookVId, v_id]);

  // Pre-load all images for instant view
  useEffect(() => {
    if (!pages || pages.length === 0) return;

    const loadedUrls = new Set();
    pages.forEach(page => {
      if (!page.html) return;

      const regex = /(?:src|href)="([^"]+)"/g;
      let match;
      while ((match = regex.exec(page.html)) !== null) {
        const url = match[1];
        if (url && !loadedUrls.has(url)) {
          const img = new Image();
          img.src = url;
          if (img.decode) {
            img.decode().catch(() => { });
          }
          loadedUrls.add(url);
        }
      }

      const styleRegex = /url\(["']?([^"']+)["']?\)/g;
      while ((match = styleRegex.exec(page.html)) !== null) {
        const url = match[1];
        if (url && !loadedUrls.has(url)) {
          const img = new Image();
          img.src = url;
          if (img.decode) {
            img.decode().catch(() => { });
          }
          loadedUrls.add(url);
        }
      }
    });
  }, [pages]);

  return {
    insertImageIntoPage
  };
};

export default useCanvasAssetInsertion;
