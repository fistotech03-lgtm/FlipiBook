/**
 * usePageManager.js
 * Manages flipbook page CRUD operations, ordering, renumbering,
 * and undo/redo history snapshot stack.
 */

import { useCallback } from 'react';
import { parseLayersFromSVG } from './svgFilterUtils';
import pageCacheManager from '../utils/PageCacheManager';
import { sanitizeSvgXml, safeSerializeSvg } from '../utils/editorUtils';
import { useHistoryManager } from './useHistoryManager';

export const usePageManager = ({
  pages,
  setPages,
  activePageIndex,
  setActivePageIndex,
  selectedLayerId,
  setSelectedLayerId,
  multiSelectedIds,
  setMultiSelectedIds,
  setHasUnsavedChanges,
  createDefaultPageData,
  isUndoRedoActiveRef,
  prevSelectedLayerIdRef,
  prevMultiSelectedIdsRef,
  setAlertState,
  currentBook,
  v_id
}) => {
  const {
    history,
    redoStack,
    setHistory,
    setRedoStack,
    saveToHistory,
    undo,
    redo,
    pagesRef,
    selectedLayerIdRef,
    multiSelectedIdsRef,
  } = useHistoryManager({
    pages,
    setPages,
    activePageIndex,
    setActivePageIndex,
    selectedLayerId,
    setSelectedLayerId,
    multiSelectedIds,
    setMultiSelectedIds,
    isUndoRedoActiveRef,
    prevSelectedLayerIdRef,
    prevMultiSelectedIdsRef,
  });

  const updatePageHtml = (pageIndex, html, explicitLayers = null) => {
    let sanitizedHtml = sanitizeSvgXml(html);
    if (typeof sanitizedHtml === 'string' && sanitizedHtml.includes('custom-video-overlay')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitizedHtml, 'image/svg+xml');
      doc.querySelectorAll('.custom-video-overlay').forEach(el => el.remove());
      const svg = doc.querySelector('svg');
      if (svg) sanitizedHtml = safeSerializeSvg(svg) || svg.outerHTML;
    }

    saveToHistory(pagesRef.current, selectedLayerIdRef.current, pageIndex, multiSelectedIdsRef.current);

    setPages(prev => {
      const updated = [...prev];
      const page = updated[pageIndex];
      if (!page) return prev;

      let newLayers = explicitLayers;
      if (!newLayers) {
        const cached = pageCacheManager.getCachedLayers(page.id, sanitizedHtml);
        if (cached && cached.length > 0) {
          newLayers = cached;
        } else {
          try {
            const parser = new DOMParser();
            let doc = parser.parseFromString(sanitizedHtml, 'image/svg+xml');
            let svgEl = doc.querySelector('svg');
            if (!svgEl || doc.querySelector('parsererror')) {
              doc = parser.parseFromString(sanitizedHtml, 'text/html');
              svgEl = doc.querySelector('svg');
            }
            if (svgEl) {
              const pageGroup = svgEl.querySelector('[data-type="frame"]') ||
                                svgEl.querySelector('[data-name="Overlay"]')?.parentElement;
              if (pageGroup) {
                let movedAny = false;
                Array.from(svgEl.children).forEach(child => {
                  if (child === pageGroup) return;
                  if (['defs', 'metadata', 'style', 'title', 'desc'].includes(child.tagName.toLowerCase())) return;
                  if (child.getAttribute('data-name') === 'Document Shield' || child.getAttribute('data-type') === 'shield') return;
                  pageGroup.appendChild(child);
                  movedAny = true;
                });
                if (movedAny) {
                  sanitizedHtml = safeSerializeSvg(svgEl) || svgEl.outerHTML;
                }
              }
            }
            newLayers = svgEl ? parseLayersFromSVG(svgEl) : (page.layers || []);
            pageCacheManager.setCachedLayers(page.id, sanitizedHtml, newLayers);
          } catch {
            newLayers = page.layers || [];
          }
        }
      }

      // Debounce thumbnail generation so it never blocks smooth editing
      pageCacheManager.updateThumbnailDebounced(page.id, sanitizedHtml, 500);

      updated[pageIndex] = {
        ...page,
        html: sanitizedHtml,
        layers: newLayers
      };
      pagesRef.current = updated;
      return updated;
    });
  };

  const clearPage = (index) => {
    saveToHistory();
    setPages(prev => {
      const updated = [...prev];
      if (updated[index]) {
        // Find existing background color to preserve it
        let currentBg = '#ffffff';
        const parser = new DOMParser();
        if (updated[index].html) {
          const oldDoc = parser.parseFromString(updated[index].html, 'image/svg+xml');
          currentBg = oldDoc.querySelector('[data-name="Overlay"]')?.getAttribute('fill') || '#ffffff';
        }

        const { html, layers } = createDefaultPageData(updated[index].name);

        // Apply existing background to new default HTML
        const newDoc = parser.parseFromString(html, 'image/svg+xml');
        const newOverlay = newDoc.querySelector('[data-name="Overlay"]');
        if (newOverlay) {
          newOverlay.setAttribute('fill', currentBg);
        }

        const finalHtml = safeSerializeSvg(newDoc) || html;

        pageCacheManager.invalidatePage(updated[index].id);
        pageCacheManager.setCachedLayers(updated[index].id, finalHtml, layers);

        updated[index] = {
          ...updated[index],
          html: finalHtml,
          layers
        };
      }
      return updated;
    });

    if (typeof document !== 'undefined') {
      const liveSvg = document.querySelector(`.page-svg-container[data-page-index="${index}"] svg`);
      if (liveSvg) {
        Array.from(liveSvg.children).forEach(child => {
          const name = child.getAttribute('data-name') || '';
          const type = child.getAttribute('data-type') || '';
          if (!name.includes('Overlay') && !name.includes('PDF Background') && type !== 'frame' && type !== 'background' && !['defs', 'metadata', 'style'].includes(child.tagName.toLowerCase())) {
            child.remove();
          }
        });
      }
      document.querySelectorAll('.selection-overlay-layer polygon, [id^="overlay-poly-"], [id^="highlight-overlay-html-"]').forEach(el => el.remove());
    }

    setHasUnsavedChanges(true);
    setSelectedLayerId(null);
    setMultiSelectedIds(new Set());
  };

  const insertPageAfter = (index) => {
    // PDF / Page limit (commented out for now - can re-enable later):
    /*
    if (pages.length >= 12) {
      setAlertState({
        isOpen: true,
        title: 'Limit Reached',
        message: 'You can only have up to 12 pages in a flipbook.',
        type: 'warning'
      });
      return;
    }
    */
    saveToHistory();
    setPages(prev => {
      const name = `Page ${prev.length + 1}`;
      const { html, layers } = createDefaultPageData(name);
      const newPage = {
        id: 'page_' + Math.random().toString(36).substr(2, 9),
        name: name,
        html,
        layers
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, newPage);
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const duplicatePage = (index) => {
    // PDF / Page limit (commented out for now - can re-enable later):
    /*
    if (pages.length >= 12) {
      setAlertState({
        isOpen: true,
        title: 'Limit Reached',
        message: 'You can only have up to 12 pages in a flipbook.',
        type: 'warning'
      });
      return;
    }
    */
    saveToHistory();
    setPages(prev => {
      const pageToDuplicate = prev[index];
      if (!pageToDuplicate) return prev;

      const newPageId = 'page_' + Math.random().toString(36).substr(2, 9);
      const baseName = pageToDuplicate.name ? pageToDuplicate.name.replace(/\s*\(Copy(?:\s+\d+)?\)$/i, '') : 'Page';
      let copyName = `${baseName} (Copy)`;
      let copyCounter = 1;
      const existingNames = new Set(prev.map(p => p.name?.toLowerCase()));
      while (existingNames.has(copyName.toLowerCase())) {
        copyCounter++;
        copyName = `${baseName} (Copy ${copyCounter})`;
      }

      // Synchronize name in the SVG's root frame data-name
      let newHtml = pageToDuplicate.html;
      if (newHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(newHtml, 'image/svg+xml');
        const rootGroup = doc.querySelector('g[data-type="frame"]');
        if (rootGroup) {
          rootGroup.setAttribute('data-name', copyName);
          rootGroup.setAttribute('id', `g-frame-${Math.random().toString(36).substr(2, 7)}`);
          newHtml = safeSerializeSvg(doc) || newHtml;
        }
      }

      const newPage = {
        ...pageToDuplicate,
        id: newPageId,
        v_id: newPageId,
        name: copyName,
        html: newHtml,
        layers: pageToDuplicate.layers ? structuredClone(pageToDuplicate.layers) : []
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, newPage);
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const renamePage = (id, newName) => {
    const trimmedName = (newName || '').trim();
    if (!trimmedName) return;

    const cleanFileName = trimmedName.replace(/[\\/:*?"<>|]/g, '').trim() + '.svg';
    let targetPage = null;

    setPages(prev => prev.map((p, idx) => {
      if (p.id === id || p.v_id === id || idx === id) {
        targetPage = p;
        const updatedPage = { ...p, name: trimmedName, fileName: cleanFileName };

        // Synchronize name with the SVG's root frame data-name
        if (p.html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(p.html, 'image/svg+xml');
          const rootGroup = doc.querySelector('g[data-type="frame"]');
          if (rootGroup) {
            rootGroup.setAttribute('data-name', trimmedName);
            updatedPage.html = safeSerializeSvg(doc) || updatedPage.html;
            // Re-parse layers to keep the layer panel header in sync
            updatedPage.layers = parseLayersFromSVG(doc.documentElement);
          }
        }
        return updatedPage;
      }
      return p;
    }));
    setHasUnsavedChanges(true);
  };

  const togglePageVisibility = (index) => {
    saveToHistory();
    setPages(prev => {
      const updated = [...prev];
      const newHiddenState = !updated[index].isHidden;
      updated[index] = { ...updated[index], isHidden: newHiddenState };
      
      if (newHiddenState && index === activePageIndex) {
        setSelectedLayerId(null);
        setMultiSelectedIds(new Set());
      }
      
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const deletePage = (index) => {
    if (pages.length <= 1) {
      setAlertState({
        isOpen: true,
        title: 'Cannot Delete Page',
        message: 'A flipbook must have at least one page. You cannot delete the only remaining page.',
        type: 'warning'
      });
      return;
    }
    const pageToDelete = pages[index];
    saveToHistory();
    setPages(prev => {
      const updated = prev.filter((_p, i) => i !== index);
      return updated;
    });
    if (activePageIndex >= pages.length - 1) {
      setActivePageIndex(Math.max(0, pages.length - 2));
    }
    setHasUnsavedChanges(true);
  };

  const movePageUp = (index) => {
    if (index === 0) return;
    saveToHistory();
    setPages(prev => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
    setActivePageIndex(index - 1);
  };

  const movePageDown = (index) => {
    if (index === pages.length - 1) return;
    saveToHistory();
    setPages(prev => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
    setActivePageIndex(index + 1);
  };

  const movePageToFirst = (index) => {
    if (index === 0) return;
    saveToHistory();
    movePage(index, 0, true); // true indicates history is already saved
  };

  const movePageToLast = (index) => {
    if (index === pages.length - 1) return;
    saveToHistory();
    movePage(index, pages.length - 1, true); // true indicates history is already saved
  };


  const movePage = (fromIndex, toIndex, alreadySaved = false) => {
    if (fromIndex === toIndex) return;
    if (!alreadySaved) saveToHistory();

    setPages(prev => {
      const updated = [...prev];
      const page = updated.splice(fromIndex, 1)[0];
      updated.splice(toIndex, 0, page);
      return updated;
    });
    setActivePageIndex(toIndex);
    setHasUnsavedChanges(true);
  };


    const handleClearAllPages = useCallback(() => {
    setPages(prevPages => 
      prevPages.map((p, i) => {
        const name = p.name || `Page ${i + 1}`;
        const { html, layers } = createDefaultPageData(name, currentBook?.width, currentBook?.height);
        return {
          ...p,
          html: html,
          layers: layers || []
        };
      })
    );
    if (setHasUnsavedChanges) setHasUnsavedChanges(true);
  }, [createDefaultPageData, currentBook, setHasUnsavedChanges, setPages]);

  return {
    history,
    redoStack,
    setHistory,
    setRedoStack,
    saveToHistory,
    undo,
    redo,
    updatePageHtml,
    clearPage,
    insertPageAfter,
    duplicatePage,
    renamePage,
    togglePageVisibility,
    deletePage,
    movePageUp,
    movePageDown,
    movePageToFirst,
    movePageToLast,
    movePage,
    handleClearAllPages
  };
};
