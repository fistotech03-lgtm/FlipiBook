import { convertTextToForeignObject } from '../utils/textConversionUtils';
import { clearOverlayType } from '../utils/geometryUtils';
import { getTopLevelFrames } from '../utils/frameHierarchyUtils';
import { TYPE_CURSOR, PENCIL_CURSOR, PEN_CURSOR, SHAPE_CURSOR } from '../utils/constants';

/**
 * Custom hook to manage inline text editing within SVG foreignObjects,
 * caret positioning, auto-resizing, and font styles.
 */
export const useInlineTextEditor = ({
  isEditingTextRef,
  selectedLayerIdRef,
  multiSelectedIdsRef,
  activeMainToolRef,
  selectedPenToolRef,
  suppressClickRef,
  currentFrameIdRef,
  activeTopTool,
  activePageIndex,
  pages,
  setSelectedLayerId,
  setMultiSelectedIds,
  setCurrentFrameId,
  drawOverlayHighlight,
  saveModifiedPageHtml
}) => {
  const enterTextEditMode = (target, clientX = null, clientY = null, selectAll = false) => {
    if (!target || !target.id) return;
    if (activeTopTool === 'interaction' || activeTopTool === 'animation') return;

    let foTarget = target;

    // If the target is a raw <text> element, convert it to foreignObject first
    if (target.tagName.toLowerCase() === 'text' || target.tagName.toLowerCase() === 'tspan') {
      const textEl = target.tagName.toLowerCase() === 'tspan' ? target.closest('text') : target;
      if (!textEl) return;
      const fo = convertTextToForeignObject(textEl);
      if (!fo) return;
      textEl.replaceWith(fo);
      foTarget = fo;

      // Explicitly redraw the highlight now that the FO is in the DOM
      requestAnimationFrame(() => {
        const highlightType = document.querySelector(`[id="overlay-poly-child-selected-${foTarget.id}"]`) ? 'child-selected' : 'selected';
        drawOverlayHighlight(foTarget, highlightType);
      });

      // Update selection to reflect new FO id (same as original text id)
      if (setSelectedLayerId) setSelectedLayerId(fo.id);
      selectedLayerIdRef.current = fo.id;
      if (setMultiSelectedIds) {
        setMultiSelectedIds(new Set([fo.id]));
        multiSelectedIdsRef.current = new Set([fo.id]);
      }
    }

    if (foTarget.tagName.toLowerCase() !== 'foreignobject') return;

    let div = foTarget.firstElementChild;
    if (!div) return;
    if (div.classList.contains('flipbook-text-outer')) {
      const scrollbarDiv = div.querySelector('.flipbook-text-scrollbar');
      if (scrollbarDiv) div = scrollbarDiv;
    }

    isEditingTextRef.current = true;
    const svgRoot = foTarget.ownerSVGElement;

    // Set cursor for the wrapper container
    const svgContainer = foTarget.closest('.page-svg-container');
    if (svgContainer) {
      const divWrapper = svgContainer.querySelector('div');
      if (divWrapper) divWrapper.style.cursor = 'text';
    }

    // Keep the main selection overlay but remove the corner dots
    document.querySelectorAll('.selection-overlay-layer .resize-handle').forEach(h => h.remove());
    document.querySelectorAll('[id^="highlight-overlay-html-"] .resize-handle').forEach(h => h.remove());

    clearOverlayType('hover');
    clearOverlayType('child-hover');

    // Mark as editing
    foTarget.setAttribute('data-editing', 'true');
    div.setAttribute('contenteditable', 'true');
    div.style.outline = 'none';
    div.style.userSelect = 'text';
    div.style.pointerEvents = 'auto';
    div.style.cursor = 'text';

    const stopScrollPropagation = (e) => {
      e.stopPropagation();
    };
    div.addEventListener('mousedown', stopScrollPropagation);
    div.addEventListener('pointerdown', stopScrollPropagation);
    div.addEventListener('touchstart', stopScrollPropagation);
    div.addEventListener('wheel', stopScrollPropagation);

    const handleInput = () => {
      const sizingMode = foTarget.getAttribute('data-sizing-mode') || 'auto-height';
      const isScrollable = foTarget.getAttribute('data-scrollable') === 'true';

      if (!isScrollable) {
        const oldHeight = div.style.height;
        const oldMinHeight = div.style.minHeight;
        const oldWidth = div.style.width;

        // Temporarily allow height to shrink to measure true text height
        div.style.setProperty('height', 'auto', 'important');
        div.style.setProperty('min-height', '0px', 'important');

        if (sizingMode === 'auto-width') {
          div.style.setProperty('width', 'max-content', 'important');
        }

        const contentH = div.scrollHeight;
        const contentW = div.scrollWidth;

        div.style.setProperty('height', oldHeight || '100%', 'important');
        div.style.setProperty('min-height', oldMinHeight || '100%', 'important');
        if (sizingMode === 'auto-width') {
          div.style.setProperty('width', oldWidth || '100%', 'important');
        }

        const foH = parseFloat(foTarget.getAttribute('height')) || 0;
        const foW = parseFloat(foTarget.getAttribute('width')) || 0;
        const currentX = parseFloat(foTarget.getAttribute('x')) || 0;

        if (sizingMode === 'auto-width' && Math.abs(contentW - foW) > 2) {
          const widthDiff = contentW - foW;
          const align = window.getComputedStyle(div).textAlign;
          foTarget.setAttribute('width', Math.max(contentW + 4, 10));
          if (align === 'center') {
            foTarget.setAttribute('x', currentX - (widthDiff / 2));
          } else if (align === 'right' || align === 'end') {
            foTarget.setAttribute('x', currentX - widthDiff);
          }
        }

        if (sizingMode !== 'fixed' && Math.abs(contentH - foH) > 2) {
          foTarget.setAttribute('height', contentH + 4);
        }

        // Always ensure the selection overlay highlight precisely encloses the current element
        const highlightType = document.querySelector(`[id="overlay-poly-child-selected-${foTarget.id}"]`) ? 'child-selected' : 'selected';
        const container = foTarget.closest('.page-svg-container');
        if (container) {
          const pageIdx = container.getAttribute('data-page-index');
          const overlay = document.getElementById(`highlight-overlay-${pageIdx}`);
          if (overlay) {
            const oldSel = overlay.querySelector(`[id="overlay-poly-selected-${foTarget.id}"]`);
            if (oldSel) oldSel.remove();
            const oldChildSel = overlay.querySelector(`[id="overlay-poly-child-selected-${foTarget.id}"]`);
            if (oldChildSel) oldChildSel.remove();
          }
        }
        drawOverlayHighlight(foTarget, highlightType);
        clearOverlayType('hover');
        clearOverlayType('child-hover');

        // Also redraw parent group's entered overlay to prevent the dashed line from sticking in the middle
        const parentGroup = foTarget.closest('g');
        if (parentGroup && parentGroup.getAttribute('data-name') === 'Group') {
          const overlayNode = document.querySelector(`[id="overlay-poly-entered-${parentGroup.id}"]`);
          if (overlayNode) {
            overlayNode.remove();
            drawOverlayHighlight(parentGroup, 'entered');
          }
        }
      }
    };
    div.addEventListener('input', handleInput);
    div.focus();

    // Immediately trigger a resize so it precisely shrink-wraps the initial text
    handleInput();

    // Place cursor at the clicked position using caretRangeFromPoint if coords are available
    // Otherwise fall back to end of text
    const placeCaretAtClick = (cx, cy) => {
      let placed = false;
      if (selectAll) {
        const range = document.createRange();
        range.selectNodeContents(div);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        placed = true;
      } else if (cx !== null && cy !== null) {
        // Standard (Chrome/Edge/Safari)
        if (document.caretRangeFromPoint) {
          const clickRange = document.caretRangeFromPoint(cx, cy);
          if (clickRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(clickRange);
            placed = true;
          }
          // Firefox
        } else if (document.caretPositionFromPoint) {
          const pos = document.caretPositionFromPoint(cx, cy);
          if (pos) {
            const range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            placed = true;
          }
        }
      }
      if (!placed) {
        // Fallback: move to end
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    // Use a tiny timeout so the browser has fully rendered the contenteditable before we place the caret
    setTimeout(() => placeCaretAtClick(clientX, clientY), 0);

    div.setAttribute('spellcheck', 'false');

    const cleanup = () => {
      isEditingTextRef.current = false;
      
      
      foTarget.removeAttribute('data-editing');
      div.removeAttribute('contenteditable');
      div.style.outline = 'none';
      div.style.boxShadow = '';
      div.style.userSelect = 'none';
      div.style.pointerEvents = 'none';
      div.style.cursor = '';
      div.classList.remove('text-edit-box');
      div.removeEventListener('blur', handleBlur);
      div.removeEventListener('keydown', handleKeyDown);
      div.removeEventListener('mousedown', stopScrollPropagation);
      div.removeEventListener('pointerdown', stopScrollPropagation);
      div.removeEventListener('touchstart', stopScrollPropagation);
      div.removeEventListener('wheel', stopScrollPropagation);
      const s = window.getSelection();
      if (s) s.removeAllRanges();

      // Restore cursor for wrapper
      if (svgContainer) {
        const divWrapper = svgContainer.querySelector('div');
        if (divWrapper) {
          const isPencilActive = activeMainToolRef.current === 'pen' && selectedPenToolRef.current === 'pencil';
          const isPenToolActive = activeMainToolRef.current === 'pen';
          const isShapeActive = activeMainToolRef.current === 'shapes';
          const isTypeActive = activeMainToolRef.current === 'type';
          divWrapper.style.cursor = isPencilActive ? PENCIL_CURSOR : (isPenToolActive ? PEN_CURSOR : (isShapeActive ? SHAPE_CURSOR : (isTypeActive ? TYPE_CURSOR : 'default')));
        }
      }
    };

    const handleBlur = () => {
      const activeEl = document.activeElement;
      const isSidebarTarget = activeEl && (
        activeEl.closest('.right-sidebar') ||
        activeEl.closest('#right-sidebar') ||
        activeEl.closest('[data-panel]') ||
        activeEl.closest('.z-50') ||
        activeEl.closest('.text-editor-panel') ||
        activeEl.closest('.color-picker')
      );

      if (window.__isInteractingWithSidebar || isSidebarTarget) {
        return;
      }

      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 200);

      
      const finalContent = div.innerText || '';

      if (finalContent.trim().length === 0) {
        const container = foTarget.closest('.page-svg-container');
        foTarget.remove();
        cleanup();
        const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
        const topFrames = svgRoot ? getTopLevelFrames(svgRoot) : [];
        const rootId = (topFrames && topFrames.length > 0 ? topFrames[0].id : pages[pageIdx]?.layers?.[0]?.id);

        if (rootId) {
          if (setSelectedLayerId) setSelectedLayerId(rootId);
          selectedLayerIdRef.current = rootId;
          if (setMultiSelectedIds) {
            setMultiSelectedIds(new Set([rootId]));
            multiSelectedIdsRef.current = new Set([rootId]);
          }
          if (setCurrentFrameId) setCurrentFrameId(rootId);
          currentFrameIdRef.current = rootId;
        } else {
          if (setSelectedLayerId) setSelectedLayerId(null);
          selectedLayerIdRef.current = null;
          if (setMultiSelectedIds) {
            setMultiSelectedIds(new Set());
            multiSelectedIdsRef.current = new Set();
          }
        }
        if (container) saveModifiedPageHtml(pageIdx, svgRoot);
        return;
      }

      // Auto-grow height and width to fit content
      const sizingMode = foTarget.getAttribute('data-sizing-mode') || 'auto-height';
      const isScrollable = foTarget.getAttribute('data-scrollable') === 'true';

      if (!isScrollable) {
        const oldWidth = div.style.width;
        const oldHeight = div.style.height;
        const oldMinHeight = div.style.minHeight;

        if (sizingMode === 'auto-width') {
          div.style.width = 'max-content';
        }

        // Temporarily allow height to shrink to measure true text height
        div.style.setProperty('height', 'auto', 'important');
        div.style.setProperty('min-height', '0px', 'important');

        const contentW = div.scrollWidth;
        const contentH = div.scrollHeight;

        div.style.width = oldWidth;
        div.style.setProperty('height', oldHeight || '100%', 'important');
        div.style.setProperty('min-height', oldMinHeight || '100%', 'important');

        const currentW = parseFloat(foTarget.getAttribute('width')) || 0;
        const currentH = parseFloat(foTarget.getAttribute('height')) || 0;
        const currentX = parseFloat(foTarget.getAttribute('x')) || 0;

        if (sizingMode === 'auto-width' && Math.abs(contentW - currentW) > 2) {
          const widthDiff = contentW - currentW;
          const align = window.getComputedStyle(div).textAlign;
          foTarget.setAttribute('width', Math.max(contentW + 4, 10));
          if (align === 'center') {
            foTarget.setAttribute('x', currentX - (widthDiff / 2));
          } else if (align === 'right' || align === 'end') {
            foTarget.setAttribute('x', currentX - widthDiff);
          }
        }

        if (sizingMode !== 'fixed' && Math.abs(contentH - currentH) > 2) {
          foTarget.setAttribute('height', contentH + 4);
        }
      }

      cleanup();

      // Re-select the element and redraw handles
      if (foTarget.id) {
        if (setSelectedLayerId) setSelectedLayerId(foTarget.id);
        selectedLayerIdRef.current = foTarget.id;
        if (setMultiSelectedIds) {
          setMultiSelectedIds(new Set([foTarget.id]));
          multiSelectedIdsRef.current = new Set([foTarget.id]);
        }
        drawOverlayHighlight(foTarget, 'selected');
      }

      const container = foTarget.closest('.page-svg-container');
      if (container) saveModifiedPageHtml(parseInt(container.getAttribute('data-page-index')), svgRoot);
    };

    const handleKeyDown = (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        e.preventDefault();
        div.blur();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;

          let lineText = '';
          let walker = document.createTreeWalker(div, NodeFilter.SHOW_ALL, null, false);
          walker.currentNode = node;

          if (node.nodeType === Node.TEXT_NODE) {
            lineText = node.textContent.substring(0, range.startOffset);
          }

          let prev = walker.previousNode();
          while (prev) {
            if (prev.nodeName === 'BR' || prev.nodeName === 'DIV' || prev.nodeName === 'P') break;
            if (prev.nodeType === Node.TEXT_NODE) lineText = prev.textContent + lineText;
            prev = walker.previousNode();
          }

          const bulletMatch = lineText.match(/^\s*(•|-)\s+/);
          const numberMatch = lineText.match(/^\s*(\d+)\.\s+/);

          if (bulletMatch || numberMatch) {
            e.preventDefault();
            let prefix = '';
            let isEmpty = false;

            if (bulletMatch) {
              if (lineText.trim() === bulletMatch[0].trim()) isEmpty = true;
              else prefix = bulletMatch[0].trim() + ' ';
            } else if (numberMatch) {
              if (lineText.trim() === numberMatch[0].trim()) isEmpty = true;
              else {
                const nextNum = parseInt(numberMatch[1], 10) + 1;
                prefix = nextNum + '. ';
              }
            }

            if (isEmpty) {
              const deleteRange = document.createRange();
              deleteRange.setEnd(range.startContainer, range.startOffset);
              let startNode = node;
              let startOffset = 0;
              walker.currentNode = node;
              let p = walker.previousNode();
              while (p) {
                if (p.nodeName === 'BR' || p.nodeName === 'DIV' || p.nodeName === 'P') break;
                if (p.nodeType === Node.TEXT_NODE) {
                  startNode = p;
                  startOffset = 0;
                }
                p = walker.previousNode();
              }
              deleteRange.setStart(startNode, startOffset);
              sel.removeAllRanges();
              sel.addRange(deleteRange);
              document.execCommand('delete', false);
            } else {
              document.execCommand('insertHTML', false, '<br>' + prefix);
            }
          }
        }
      }
    };

    div.addEventListener('blur', handleBlur);
    div.addEventListener('keydown', handleKeyDown);
  };



  return {
    enterTextEditMode
  };
};
