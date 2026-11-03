import { convertTextToForeignObject } from '../utils/textConversionUtils';
import { clearOverlayType } from '../utils/geometryUtils';
import { clearSmartGuides } from '../utils/smartGuides';
import { getTopLevelFrames } from '../utils/frameHierarchyUtils';
import { TYPE_CURSOR, PENCIL_CURSOR, PEN_CURSOR, SHAPE_CURSOR } from '../utils/constants';
import editCacheManager from '../../utils/EditCacheManager';

/**
 * Custom hook to manage direct inline text editing on the exact existing text element:
 * - Edits directly in-place on the canvas (ZERO dummy overlays or floating textareas).
 * - Preserves exact text alignment (center, right, left, justify) before, during, and after editing.
 * - Instant 0ms startup without layout thrashing or lag.
 * - Applies TYPE_CURSOR during editing.
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

    // 1. Remove any dummy overlay if one lingered in the DOM
    const dummy = document.getElementById('vector-studio-type-router');
    if (dummy) dummy.remove();

    let foTarget = target;

    // 2. If target is raw SVG <text> or <tspan>, convert it in-place to <foreignObject>
    if (target.tagName.toLowerCase() === 'text' || target.tagName.toLowerCase() === 'tspan') {
      const textEl = target.tagName.toLowerCase() === 'tspan' ? (target.closest('text') || target) : target;
      if (!textEl) return;
      const fo = convertTextToForeignObject(textEl);
      if (!fo) return;
      textEl.replaceWith(fo);
      foTarget = fo;

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
    const svgRoot = foTarget.ownerSVGElement || foTarget.closest('svg');
    const svgContainer = foTarget.closest('.page-svg-container') || svgRoot?.parentElement;

    // 3. Strictly preserve exact text alignment (never default center/right to left)
    const rawAnchor = (
      foTarget.getAttribute('text-anchor') ||
      target?.getAttribute?.('text-anchor') ||
      target?.closest?.('[text-anchor]')?.getAttribute('text-anchor') ||
      ''
    ).toLowerCase().trim();
    const isAnchorCenter = rawAnchor === 'middle' || rawAnchor === 'center';
    const isAnchorRight = rawAnchor === 'end' || rawAnchor === 'right';

    const dataAlign = (
      foTarget.getAttribute('data-text-align') ||
      foTarget.getAttribute('data-align') ||
      foTarget.getAttribute('text-align') ||
      target?.getAttribute?.('data-text-align') ||
      target?.getAttribute?.('data-align') ||
      ''
    ).toLowerCase().trim();

    const inlineAlign = (div.style.textAlign || '').toLowerCase().trim();
    const validInline = inlineAlign && inlineAlign !== 'start' && inlineAlign !== 'initial' && inlineAlign !== 'inherit';

    let detectedAlign = 'left';
    if (isAnchorCenter || dataAlign === 'center' || inlineAlign === 'center') {
      detectedAlign = 'center';
    } else if (isAnchorRight || dataAlign === 'right' || inlineAlign === 'right') {
      detectedAlign = 'right';
    } else if (dataAlign === 'justify' || inlineAlign === 'justify') {
      detectedAlign = 'justify';
    } else if (validInline) {
      detectedAlign = inlineAlign;
    }

    div.style.textAlign = detectedAlign;
    foTarget.setAttribute('data-text-align', detectedAlign);

    // 4. Set cursor to TYPE_CURSOR
    if (svgContainer) {
      svgContainer.classList.add('text-editing-mode');
      const divWrapper = svgContainer.querySelector('div');
      if (divWrapper) divWrapper.style.cursor = TYPE_CURSOR;
    }

    // Remove selection handles during active editing
    document.querySelectorAll('.selection-overlay-layer .resize-handle').forEach(h => h.remove());
    document.querySelectorAll('[id^="highlight-overlay-html-"] .resize-handle').forEach(h => h.remove());

    clearOverlayType('hover');
    clearOverlayType('child-hover');
    clearSmartGuides();

    // 5. Make exact text directly editable in-place on the page
    foTarget.setAttribute('data-editing', 'true');
    div.setAttribute('contenteditable', 'true');
    const isScrollable = foTarget.getAttribute('data-scrollable') === 'true';
    if (!isScrollable) {
      div.style.setProperty('display', 'flex', 'important');
      div.style.setProperty('flex-direction', 'column', 'important');
      div.style.setProperty('justify-content', 'center', 'important');
      div.style.setProperty('height', '100%', 'important');
    }
    const initSizingMode = foTarget.getAttribute('data-sizing-mode') || 'auto-width';
    if (initSizingMode === 'auto-width') {
      div.style.setProperty('white-space', 'pre', 'important');
      div.style.setProperty('width', 'max-content', 'important');
      div.style.setProperty('overflow-wrap', 'normal', 'important');
    } else {
      div.style.setProperty('white-space', 'pre-wrap', 'important');
      div.style.setProperty('width', '100%', 'important');
      div.style.setProperty('overflow-wrap', 'break-word', 'important');
    }
    div.setAttribute('spellcheck', 'false');
    div.style.outline = 'none';
    div.style.userSelect = 'text';
    div.style.pointerEvents = 'auto';
    div.style.cursor = TYPE_CURSOR;

    const stopScrollPropagation = (e) => {
      e.stopPropagation();
    };
    div.addEventListener('mousedown', stopScrollPropagation);
    div.addEventListener('pointerdown', stopScrollPropagation);
    div.addEventListener('touchstart', stopScrollPropagation);
    div.addEventListener('wheel', stopScrollPropagation);

    // 6. Fast session initialization
    editCacheManager.startSession(foTarget, div);

    const handleInput = () => {
      // Keep alignment strictly locked
      if (div.style.textAlign !== detectedAlign) {
        div.style.textAlign = detectedAlign;
      }
      // Real-time selection box growth as you type
      editCacheManager.scheduleInputMeasurement((el, highlightType) => {
        drawOverlayHighlight(el, highlightType);
      });
    };

    div.addEventListener('input', handleInput);

    // 7. Instant focus with 0ms lag
    div.focus();

    // 8. Place caret at exact click coordinates
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
        if (document.caretRangeFromPoint) {
          const clickRange = document.caretRangeFromPoint(cx, cy);
          if (clickRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(clickRange);
            placed = true;
          }
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
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    placeCaretAtClick(clientX, clientY);

    // Defer highlight redraw to rAF to guarantee 0ms focus latency
    requestAnimationFrame(() => {
      drawOverlayHighlight(foTarget, 'selected');
    });

    const cleanup = () => {
      isEditingTextRef.current = false;
      window.__savedTextSelection = null;
      clearSmartGuides();
      editCacheManager.endSession((el, highlightType) => drawOverlayHighlight(el, highlightType));

      div.removeEventListener('input', handleInput);
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

      if (svgContainer) {
        svgContainer.classList.remove('text-editing-mode');
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

      // Auto-grow height and width while maintaining exact alignment
      const sizingMode = foTarget.getAttribute('data-sizing-mode') || 'auto-width';
      const isScrollable = foTarget.getAttribute('data-scrollable') === 'true';

      if (!isScrollable) {
        const oldWidth = div.style.width;
        const oldHeight = div.style.height;
        const oldMinHeight = div.style.minHeight;

        if (sizingMode === 'auto-width') {
          div.style.whiteSpace = 'pre';
          div.style.overflowWrap = 'normal';
          div.style.width = 'max-content';
        }

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

        if (Math.abs(contentW - currentW) > 2) {
          const widthDiff = contentW - currentW;
          const currentAlign = div.style.textAlign || foTarget.getAttribute('data-text-align') || 'left';
          foTarget.setAttribute('width', Math.max(contentW + 4, 10));
          if (currentAlign === 'center') {
            foTarget.setAttribute('x', currentX - (widthDiff / 2));
          } else if (currentAlign === 'right' || currentAlign === 'end') {
            foTarget.setAttribute('x', currentX - widthDiff);
          }
        }

        if (sizingMode !== 'fixed' && Math.abs(contentH - currentH) > 2) {
          foTarget.setAttribute('height', contentH + 4);
        }
      }

      // Persist alignment on div and foreignObject
      const finalAlign = div.style.textAlign || foTarget.getAttribute('data-text-align') || 'left';
      div.style.textAlign = finalAlign;
      foTarget.setAttribute('data-text-align', finalAlign);

      cleanup();

      // Re-select element and redraw highlight
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
        return;
      }

      if (e.key === 'Enter') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const node = range.startContainer;
          const textBefore = (node.nodeType === Node.TEXT_NODE ? node.textContent.slice(0, range.startOffset) : '');
          const currentLine = textBefore.split('\n').pop() || '';
          
          const bulletMatch = currentLine.match(/^(•\s*)/);
          const numMatch = currentLine.match(/^(\d+)\.\s*/);

          if (bulletMatch) {
            e.preventDefault();
            if (currentLine.trim() === '•') {
              // Empty bullet item -> exit list
              document.execCommand('delete', false, null);
              document.execCommand('insertText', false, '\n');
            } else {
              document.execCommand('insertText', false, '\n• ');
            }
          } else if (numMatch) {
            e.preventDefault();
            const currentNum = parseInt(numMatch[1], 10);
            if (currentLine.trim() === `${currentNum}.`) {
              // Empty numbered item -> exit list
              document.execCommand('delete', false, null);
              document.execCommand('insertText', false, '\n');
            } else {
              document.execCommand('insertText', false, `\n${currentNum + 1}. `);
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