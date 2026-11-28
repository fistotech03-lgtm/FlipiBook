/* eslint-disable react-hooks/purity, react-hooks/immutability */
import { useEffect, useRef, useCallback } from 'react';
import { applyPenDefaults } from '../../utils/penDefaults';
import {
  pathToDCombo,
  getPaperSegments, getPaperCurves, cleanPaperPathData, mergeMeetingNodes, applyHandleDrag, deleteSelectedNodeOrHandle
} from '../../penTool';
import {
  formatSmoothPathD,
  getSvgPoint,
  getLocalPoint,
  clearOverlayType
} from '../utils/geometryUtils';
import { clearSmartGuides, initSmartGuides, computeResizeSmartGuides, collectResizeGuideLines, renderSmartGuides, getBoxInSvg } from '../utils/smartGuides';
import { snapLineEnd, showLineAngleGuide, clearLineAngleGuide } from '../utils/lineAngleGuide';
import { getTopLevelFrames, getDirectChildFrames, hitTest, isPageRootElement, getAllSelectablePageElements } from '../utils/frameHierarchyUtils';
import { useInlineTextEditor } from './useInlineTextEditor';
import { resolveGroupTarget, findGroupAtPoint } from '../utils/hitTargetResolver';
import editCacheManager from '../../utils/EditCacheManager';
import { updateShapeMaskTransform } from '../../LeftActionMenu/Elements/utils/shapeMaskUtils';
import { drawShapeImageAdjustOverlay } from '../../penTool/penOverlayEngine';
import { hasCustomImageInShape } from '../../LeftActionMenu/Elements/utils/imageFramingUtils';

// Page container for a pointer event. `currentTarget` is the page div for canvas listeners but
// `window` for the global mousemove/up listeners (no .closest) — fall back to the event target,
// then to the given / active page.
const getEventPageContainer = (e, pageIndex) => {
  const ct = e?.currentTarget;
  if (ct && typeof ct.closest === 'function') {
    const c = ct.classList?.contains('page-svg-container') ? ct : ct.closest('.page-svg-container');
    if (c) return c;
  }
  const t = e?.target;
  const fromTarget = t && typeof t.closest === 'function' ? t.closest('.page-svg-container') : null;
  if (fromTarget) return fromTarget;
  if (pageIndex !== undefined && pageIndex !== null) {
    return document.querySelector(`.page-svg-container[data-page-index="${pageIndex}"]`);
  }
  return document.querySelector('.page-svg-container');
};


/**
 * Hook managing canvas pointer interactions:
 * - Mouse down, move, leave, click, double click
 * - Shape creation, pencil drawing, pen tool vectra sessions
 * - Marquee rectangle selection, frame selection drill-down
 * - Global mouseup listeners for pen/shape commit
 */
const setsAreEqual = (a, b) => a.size === b.size && [...a].every(v => b.has(v));

// Hover diagnostics: run `window.__fbeHoverDebug = true` in the console, hover, then read the log.
// OFF by default; `window.__fbeHoverDebug = true` enables it. Repeats are skipped so moving
// within one element doesn't flood the console.
let lastHoverDbg = '';
const hoverDbg = (...args) => {
  try {
    if (window.__fbeHoverDebug !== true) return;
    const key = JSON.stringify(args);
    if (key === lastHoverDbg) return;
    lastHoverDbg = key;
    console.log('%c[hover]', 'color:#5255CA;font-weight:bold', ...args);
  } catch { /* noop */ }
};

export const useCanvasPointerEvents = ({
  zoom = 90,
  activePageIndex = 0,
  setActivePageIndex,
  pages = [],
  setSelectedLayerId,
  setMultiSelectedIds,
  setCurrentFrameId,
  activeMainTool,
  setActiveMainTool,
  activeTopTool,
  selectedPenTool,
  selectedSelectTool,
  selectedShapeTool,
  setMarquee,
  isConvertedFlipbook,
  updatePageHtml,
  saveModifiedPageHtml,
  // Refs
  currentFrameIdRef,
  selectedLayerIdRef,
  multiSelectedIdsRef,
  activeMainToolRef,
  activeTopToolRef,
  selectedSelectToolRef,
  selectedPenToolRef,
  drawingPathRef,
  drawingPointsRef,
  isFreehandDrawingRef,
  drawingPageIndexRef,
  drawingSvgRef,
  drawingShapeRef,
  shapeStartPointRef,
  draggedNodeIndexRef,
  bendingStateRef,
  drawingSubPathsRef,
  drawingSubPathElsRef,
  activeBendingSegmentRef,
  handleDraggingStateRef,
  nodeEditModeRef,
  nodeEditPathRef,
  nodeEditPaperPathRef,
  nodeEditPageIndexRef,
  nodeEditDragRef,
  nodeEditSelectedSegIdxRef,
  nodeEditSelectedSegIndicesRef,
  nodeEditSelectedHandleSideRef,
  nodeEditSelectedCurveIdxRef,
  nodeEditHoverCurveIdxRef,
  nodeEditSplitSegIdxRef,
  nodeEditScreenNodesRef,
  nodeEditScreenSegmentsRef,
  nodeEditImageAdjustRef,
  vectraPenSessionRef,
  paperScopeRef,
  marqueeRef,
  marqueeOverlayRef1,
  marqueeOverlayRef2,
  marqueeCandidatesRef,
  marqueeDataRef,
  suppressClickRef,
  isAltPressedRef,
  lastMousePosRef,
  lastClickRef,
  isEditingTextRef,
  drawMeasurementOverlayRef,
  skipClearSelectionRef,
  loadDIntoVectraSession,
  // Helper callbacks
  drawOverlayHighlight,
  drawBendingNodes,
  renderVectraOverlay,
  clearPenToolNodes,
  drawNodeEditOverlay,
  enterNodeEditMode,
  exitNodeEditMode,
  commitAndExitPenDrawing,
  convertTextToForeignObject,
  getDraggableElement
}) => {
  const lastHoveredIdRef = useRef(null);

  // ── Single hover state: every hover path (canvas, converted mode, direct tool, Layers panel,
  // mouse leave) goes through these two functions, so there is exactly one hover box at a time.
  const clearHover = () => {
    const prevId = lastHoveredIdRef.current;
    if (prevId) {
      document.querySelectorAll(`[id="${CSS.escape(prevId)}"]`).forEach(el => {
        el.removeAttribute('data-hovered');
        el.removeAttribute('data-child-hovered');
      });
      lastHoveredIdRef.current = null;
    }
    clearOverlayType('hover');
    clearOverlayType('child-hover');
  };
  // Returns true when a box was drawn. Same id → no work (O(1) fast path, checked by callers).
  const setHover = (el, type = 'hover') => {
    clearHover();
    if (!el || !el.id) return false;
    lastHoveredIdRef.current = el.id;
    // Already selected: selection box is visible; remember id so moves within it stay no-op.
    if (selectedLayerIdRef.current === el.id || multiSelectedIdsRef.current?.has(el.id)) return false;
    el.setAttribute(type === 'child-hover' ? 'data-child-hovered' : 'data-hovered', 'true');
    try { drawOverlayHighlight(el, type); } catch (err) { console.warn('[hover] draw failed:', err); }
    return true;
  };
  const resolveTargetParentForCreation = (svg, clientX, clientY) => {
    let activeId = currentFrameIdRef.current;
    const topFrames = getTopLevelFrames(svg);
    const hitRoot = topFrames.find(f => hitTest(f, clientX, clientY));

    if (activeId) {
      const activeEl = svg.querySelector(`[id="${activeId}"]`);
      if (activeEl && !hitTest(activeEl, clientX, clientY) && hitRoot) {
        activeId = hitRoot.id;
        setCurrentFrameId(hitRoot.id);
        currentFrameIdRef.current = hitRoot.id;
      }
    } else if (hitRoot) {
      activeId = hitRoot.id;
    }
    const rootPageFrame = topFrames.find(f => isPageRootElement(f, svg)) || svg.querySelector('g[data-type="frame"]') || svg.querySelector('g') || svg;
    return activeId ? (svg.querySelector(`[id="${activeId}"]`) || rootPageFrame) : rootPageFrame;
  };

  const shapeImageAdjustTargetRef = useRef(null);
  const shapeImageAdjustPageIndexRef = useRef(null);

  const exitShapeImageAdjust = useCallback(() => {
    if (!shapeImageAdjustTargetRef.current && !window.__isAdjustingShapeImage) return;
    const target = shapeImageAdjustTargetRef.current;
    shapeImageAdjustTargetRef.current = null;
    shapeImageAdjustPageIndexRef.current = null;
    window.__isAdjustingShapeImage = false;
    window.__shapeImageAdjustTarget = null;
    window.__shapeImageAdjustGhostRect = null;
    document.body.classList.remove('shape-adjust-active');
    if (target) {
      target.removeAttribute('data-image-adjust-active');
      target.parentElement?.removeAttribute('data-image-adjust-active');
    }
    document.querySelectorAll('[id^="highlight-overlay-"] #node-edit-overlay-group').forEach(g => {
      g.innerHTML = '';
    });
  }, []);

  const startShapeImageAdjust = useCallback((targetEl, pageIndex) => {
    if (!targetEl) return;
    const shapeEl = targetEl.tagName?.toLowerCase() === 'g'
      ? (targetEl.querySelector('path, rect, circle, ellipse, polygon') || targetEl)
      : targetEl;
    if (!hasCustomImageInShape(shapeEl)) {
      return; // Placeholder images should not be adjusted or moved inside the frame
    }
    exitShapeImageAdjust();
    if (nodeEditModeRef.current) {
      exitNodeEditMode();
    }
    shapeImageAdjustTargetRef.current = shapeEl;
    shapeImageAdjustPageIndexRef.current = pageIndex;
    window.__isAdjustingShapeImage = true;
    window.__shapeImageAdjustTarget = shapeEl;
    document.body.classList.add('shape-adjust-active');
    shapeEl.setAttribute('data-image-adjust-active', 'true');
    if (targetEl !== shapeEl) {
      targetEl.setAttribute('data-image-adjust-active', 'true');
    }
    // Clean up normal selection box and handles immediately
    document.querySelectorAll('[id^="highlight-overlay-html-"] .resize-handle').forEach(h => h.remove());
    document.querySelectorAll('.selection-overlay-layer polygon, .selection-overlay-layer g.overlay-type-selected').forEach(el => el.remove());
    drawShapeImageAdjustOverlay(shapeEl, pageIndex, zoom);
  }, [zoom, exitNodeEditMode, exitShapeImageAdjust]);

  // ── Screen-space marquee box (unscaled, pixel-snapped like smart guides) ──
  const getScreenMarqueeBox = () => {
    let box = document.getElementById('marquee-screen-box');
    if (box) return box;
    const host = document.getElementById('main-zoom-container')?.parentElement;
    if (!host) return null;
    box = document.createElement('div');
    box.id = 'marquee-screen-box';
    box.style.cssText = 'position:absolute; display:none; box-sizing:border-box; border:1px solid #5255CA; background-color:rgba(82,85,202,0.1); pointer-events:none; z-index:36; left:0; top:0; width:0; height:0;';
    host.appendChild(box);
    return box;
  };

  const updateScreenMarqueeBox = (x1, y1, x2, y2) => {
    const box = getScreenMarqueeBox();
    if (!box) return;
    const hostRect = box.parentElement.getBoundingClientRect();
    const left = Math.round(Math.min(x1, x2) - hostRect.left);
    const top = Math.round(Math.min(y1, y2) - hostRect.top);
    const right = Math.round(Math.max(x1, x2) - hostRect.left);
    const bottom = Math.round(Math.max(y1, y2) - hostRect.top);
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${Math.max(1, right - left)}px`;
    box.style.height = `${Math.max(1, bottom - top)}px`;
    box.style.display = 'block';
  };

  const hideScreenMarqueeBox = () => {
    const box = document.getElementById('marquee-screen-box');
    if (box) box.style.display = 'none';
  };

  const cleanupMarquee = () => {
    hideScreenMarqueeBox();
    if (marqueeOverlayRef1?.current) {
      marqueeOverlayRef1.current.style.display = 'none';
      const rectEl = marqueeOverlayRef1.current.querySelector ? marqueeOverlayRef1.current.querySelector('rect') : null;
      if (rectEl) {
        rectEl.setAttribute('x', '0');
        rectEl.setAttribute('y', '0');
        rectEl.setAttribute('width', '0');
        rectEl.setAttribute('height', '0');
      }
    }
    if (marqueeOverlayRef2?.current) {
      marqueeOverlayRef2.current.style.display = 'none';
    }
    if (marqueeDataRef.current?.hasDragged) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 100);
    }
    marqueeDataRef.current = null;
    marqueeRef.current = null;
    if (typeof setMarquee === 'function') {
      setMarquee(null);
    }
  };

  const handleSvgMouseUp = (e) => {
    if (marqueeDataRef.current || marqueeRef.current) {
      cleanupMarquee();
    }
  };

  const handleSvgMouseDown = (pageIndex, e) => {
    window.__isCanvasPointerDown = true;
    if (e._handledMarquee) return;
    if (e.button !== 0 || e.target.closest('.resize-handle') || window.__isHoveringTableDivider || window.__isResizingTableDivider) return;

    // Allow native text selection/interaction inside actively edited text boxes
    if (e.target.closest('[contenteditable="true"]')) {
      e.stopPropagation();
      return;
    }

    // Allow native button/navigation clicks on slideshow navigation arrows and pagination
    if (e.target.closest('.swiper-button-prev, .swiper-button-next, .swiper-pagination, .swiper-pagination-bullet, [data-slideshow-nav]')) {
      return;
    }

    const canvasContent = document.getElementById(`canvas-content-${pageIndex}`) ||
      document.querySelector(`[data-page-index="${pageIndex}"] [id^="canvas-content-"]`) ||
      document.querySelector('[id^="canvas-content-"]');

    const targetPageContainer = e.currentTarget?.classList?.contains('page-svg-container')
      ? e.currentTarget
      : (e.currentTarget?.closest?.('.page-svg-container') ||
         document.querySelector(`[data-page-index="${pageIndex}"]`) ||
         canvasContent ||
         document.querySelector('.page-svg-container'));

    const container = targetPageContainer || e.currentTarget;
    const svg = canvasContent?.querySelector('svg') || container?.querySelector('svg:not([id^="highlight-overlay-"]):not([id^="marquee"])') || container?.querySelector('svg');
    if (!svg) return;

    const getDistinctNodes = (paperPath, selSet) => {
      if (!paperPath || !selSet) return [];
      const segments = getPaperSegments(paperPath);
      const selSegs = Array.from(selSet).map(idx => segments[idx]).filter(Boolean);
      const distinct = [];
      selSegs.forEach(seg => {
        if (!distinct.some(s => Math.hypot(s.point.x - seg.point.x, s.point.y - seg.point.y) < 3.0)) {
          distinct.push(seg);
        }
      });
      return distinct;
    };

    const checkCanJoinNodes = (paperPath, selSet) => {
      if (!paperPath || !selSet) return false;
      try {
        const distinct = getDistinctNodes(paperPath, selSet);
        if (distinct.length !== 2) return false;

        const segments = getPaperSegments(paperPath);
        const curves = getPaperCurves(paperPath);

        const pt1 = distinct[0].point;
        const pt2 = distinct[1].point;

        const segs1 = segments.filter(s => Math.hypot(s.point.x - pt1.x, s.point.y - pt1.y) < 3.0);
        const segs2 = segments.filter(s => Math.hypot(s.point.x - pt2.x, s.point.y - pt2.y) < 3.0);

        const isConnected = curves.some(c =>
          (segs1.includes(c.segment1) && segs2.includes(c.segment2)) ||
          (segs1.includes(c.segment2) && segs2.includes(c.segment1))
        );
        return !isConnected;
      } catch {
        return false;
      }
    };

    // ── STANDALONE SHAPE IMAGE ADJUST MODE (Unflattened masked shapes) ────────
    if (shapeImageAdjustTargetRef.current) {
      const target = shapeImageAdjustTargetRef.current;
      if (!hasCustomImageInShape(target)) {
        exitShapeImageAdjust();
        return;
      }
      const rect = target.getBoundingClientRect();
      const ghostRect = window.__shapeImageAdjustGhostRect;
      const isInsideShape = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      const isInsideGhost = Boolean(ghostRect && (
        e.clientX >= ghostRect.left && e.clientX <= ghostRect.right &&
        e.clientY >= ghostRect.top && e.clientY <= ghostRect.bottom
      ));

      if (isInsideShape || isInsideGhost) {
        const pIdx = shapeImageAdjustPageIndexRef.current !== null ? shapeImageAdjustPageIndexRef.current : activePageIndex;
        nodeEditDragRef.current = {
          mode: 'image-pan',
          pathEl: target,
          startClientX: e.clientX,
          startClientY: e.clientY,
          startPanX: parseFloat(target.getAttribute('data-slot-pan-x') || '0'),
          startPanY: parseFloat(target.getAttribute('data-slot-pan-y') || '0'),
          startZoom: parseFloat(target.getAttribute('data-slot-zoom') || '1'),
          bbox: rect,
          scale: zoom / 100,
          pageIndex: pIdx,
          isStandaloneAdjust: true
        };
        suppressClickRef.current = true;
        e.stopPropagation();
        return;
      } else {
        exitShapeImageAdjust();
      }
    }

    // ── NODE EDIT MODE: Handle node, handle, and line segment dragging ──────────
    if (nodeEditModeRef.current && nodeEditPathRef.current && activeMainTool !== 'pen') {
      const pathEl = nodeEditPathRef.current;
      const paperPath = nodeEditPaperPathRef.current;
      if (!paperPath || !pathEl) return;

      skipClearSelectionRef.current = true;
      if (pathEl && pathEl.id) {
        selectedLayerIdRef.current = pathEl.id;
        if (typeof setSelectedLayerId === 'function') setSelectedLayerId(pathEl.id);
        if (typeof setMultiSelectedIds === 'function') {
          multiSelectedIdsRef.current = new Set([pathEl.id]);
          setMultiSelectedIds(new Set([pathEl.id]));
        }
      }
      window.dispatchEvent(new CustomEvent('node-edit-mode-changed', { detail: { active: true, pathId: pathEl.id } }));

      // Screen-space hit testing using stored node positions from drawNodeEditOverlay.
      // These positions are in actual screen pixels (from pathEl.getScreenCTM()),
      // so they correctly match e.clientX/e.clientY regardless of zoom/scroll/transforms.
      let hitSegIdx = -1;
      let hitHandleSide = null; // 'point', 'in', 'out'
      const HIT_RADIUS_PX = 12; // screen pixel radius

      const screenNodes = nodeEditScreenNodesRef.current;
      let minDist = HIT_RADIUS_PX;
      for (const node of screenNodes) {
        const dist = Math.hypot(e.clientX - node.x, e.clientY - node.y);
        if (dist < minDist) {
          minDist = dist;
          hitSegIdx = node.segIdx;
          hitHandleSide = node.handleSide;
        }
      }

      paperScopeRef.current.activate();
      const svgEl = pathEl.ownerSVGElement;
      const pt = getLocalPoint(svgEl, pathEl, e.clientX, e.clientY);
      const mousePt = new paperScopeRef.current.Point(pt.x, pt.y);

      if (hitSegIdx !== -1 && !isNaN(hitSegIdx)) {
        if (nodeEditImageAdjustRef?.current || pathEl.getAttribute('data-image-adjust-active') === 'true') {
          if (nodeEditImageAdjustRef) nodeEditImageAdjustRef.current = false;
          pathEl.removeAttribute('data-image-adjust-active');
          drawNodeEditOverlay(pathEl, paperPath, pageIndex);
        }
        if (hitHandleSide === 'point') {
          // Deleting an anchor point is ONLY performed if the Pen Subtract tool is active
          if (selectedPenToolRef.current === 'subtract') {
            const segments = getPaperSegments(paperPath);
            if (segments[hitSegIdx]) {
              segments[hitSegIdx].remove();
            }
            mergeMeetingNodes(paperPath);
            const dStr = cleanPaperPathData(paperPath);
            const remainingSegments = getPaperSegments(paperPath);
            if (remainingSegments.length <= 1 || !dStr || dStr.trim() === '') {
              pathEl.remove();
              exitNodeEditMode();
              if (svgEl && updatePageHtml) {
                saveModifiedPageHtml(pageIndex, svgEl);
              }
              if (typeof setSelectedLayerId === 'function') setSelectedLayerId(null);
            } else {
              pathEl.setAttribute('d', dStr);
              nodeEditSelectedSegIdxRef.current = null;
              nodeEditSelectedSegIndicesRef.current = new Set();
              drawNodeEditOverlay(pathEl, paperPath, pageIndex);
            }
            suppressClickRef.current = true;
            e.stopPropagation();
            return;
          }

          let selSet = nodeEditSelectedSegIndicesRef.current || new Set();
          if (e.shiftKey) {
            if (selSet.has(hitSegIdx)) selSet.delete(hitSegIdx);
            else selSet.add(hitSegIdx);
          } else {
            // Select only the clicked node point (plus any co-located merged nodes) and unselect other nodes
            selSet = new Set([hitSegIdx]);
          }
          const isSplitNode = (nodeEditSplitSegIdxRef.current !== null);
          const segments = getPaperSegments(paperPath);
          const primarySeg = segments[hitSegIdx];
          if (primarySeg) {
            // Snap all co-located/merged nodes ONLY if it is not a split node action
            if (!isSplitNode && !e.shiftKey) {
              segments.forEach((s, sIdx) => {
                if (Math.hypot(s.point.x - primarySeg.point.x, s.point.y - primarySeg.point.y) < 1.5) {
                  selSet.add(sIdx);
                  s.point.x = primarySeg.point.x;
                  s.point.y = primarySeg.point.y;
                }
              });
            }

            let currentNodeType = primarySeg.nodeType;
            if (!currentNodeType) {
              if (primarySeg.handleIn.isZero() && primarySeg.handleOut.isZero()) {
                currentNodeType = 'sharp';
              } else if (!primarySeg.handleIn.isZero() && !primarySeg.handleOut.isZero()) {
                const dot = primarySeg.handleIn.normalize().dot(primarySeg.handleOut.normalize());
                if (dot < -0.90) {
                  currentNodeType = Math.abs(primarySeg.handleIn.length - primarySeg.handleOut.length) < 4.0 ? 'balanced' : 'smooth';
                } else {
                  currentNodeType = 'custom';
                }
              } else {
                currentNodeType = 'custom';
              }
              primarySeg.nodeType = currentNodeType;
            }
            const distinctCount = getDistinctNodes(paperPath, selSet).length;
            const canJoin = checkCanJoinNodes(paperPath, selSet);
            window.dispatchEvent(new CustomEvent('node-selected', { detail: { nodeType: currentNodeType, segIdx: hitSegIdx, selectedCount: distinctCount, canJoin, isLineSelected: false } }));
          }

          nodeEditSelectedHandleSideRef.current = 'point';
          nodeEditSelectedCurveIdxRef.current = null;
          nodeEditSelectedSegIndicesRef.current = selSet;
          nodeEditSelectedSegIdxRef.current = hitSegIdx;
          if (nodeEditSplitSegIdxRef.current !== hitSegIdx) {
            nodeEditSplitSegIdxRef.current = null;
          }
          drawNodeEditOverlay(pathEl, paperPath, pageIndex);

          // Store initial local positions of all selected nodes for multi-node translation
          const startPoints = {};
          selSet.forEach(idx => {
            if (segments[idx]) {
              startPoints[idx] = segments[idx].point.clone();
            }
          });

          nodeEditDragRef.current = {
            mode: 'node',
            segIdx: hitSegIdx,
            handleSide: hitHandleSide,
            startPt: pt,
            startPoints,
            pathEl,
            paperPath,
            pageIndex
          };
        } else {
          // Double-click (e.detail === 2), Alt+Click, or Subtract tool on a top/bottom control handle retracts/deletes that handle point
          if (e.detail === 2 || e.altKey || selectedPenToolRef.current === 'subtract') {
            deleteSelectedNodeOrHandle(paperPath, [hitSegIdx], hitHandleSide, paperScopeRef.current);
            nodeEditSelectedHandleSideRef.current = 'point';
            nodeEditSelectedSegIdxRef.current = hitSegIdx;
            nodeEditSelectedSegIndicesRef.current = new Set([hitSegIdx]);
            const dStr = cleanPaperPathData(paperPath);
            pathEl.setAttribute('d', dStr);
            drawNodeEditOverlay(pathEl, paperPath, pageIndex);
            if (svgEl && updatePageHtml) {
              saveModifiedPageHtml(pageIndex, svgEl);
            }
            suppressClickRef.current = true;
            e.stopPropagation();
            return;
          }

          nodeEditSelectedHandleSideRef.current = hitHandleSide;
          nodeEditSelectedSegIndicesRef.current = new Set([hitSegIdx]);
          nodeEditSelectedSegIdxRef.current = hitSegIdx;
          drawNodeEditOverlay(pathEl, paperPath, pageIndex);
          // Dispatch the actual nodeType of the segment (not always 'custom') to keep the correct button highlighted
          // NOTE: 'segments' is only declared in the 'point' branch above, so we re-fetch here
          const handleSegs = getPaperSegments(paperPath);
          const hitSeg = handleSegs[hitSegIdx];
          let hitNodeType = 'custom';
          if (hitSeg) {
            if (hitSeg.nodeType) {
              hitNodeType = hitSeg.nodeType;
            } else if (!hitSeg.handleIn.isZero() && !hitSeg.handleOut.isZero()) {
              const dot = hitSeg.handleIn.normalize().dot(hitSeg.handleOut.normalize());
              hitNodeType = (dot < -0.90)
                ? (Math.abs(hitSeg.handleIn.length - hitSeg.handleOut.length) < 4.0 ? 'balanced' : 'smooth')
                : 'custom';
            } else if (hitSeg.handleIn.isZero() && hitSeg.handleOut.isZero()) {
              hitNodeType = 'sharp';
            }
          }
          window.dispatchEvent(new CustomEvent('node-selected', { detail: { nodeType: hitNodeType, selectedCount: 1, canJoin: false, isLineSelected: false } }));

          nodeEditDragRef.current = {
            mode: 'handle',
            segIdx: hitSegIdx,
            handleSide: hitHandleSide,
            startPt: pt,
            pathEl,
            paperPath,
            pageIndex
          };
        }

        suppressClickRef.current = true;
        e.stopPropagation();
        return;
      }

      // Path-line proximity: Check if clicking near path curve segment
      // Use stored screen-space segment midpoints for reliable detection
      const SEG_HIT_RADIUS_PX = 25;
      let hitCurveIdx = -1;
      let hitSeg1Idx = -1;
      let hitSeg2Idx = -1;
      let segMinDist = SEG_HIT_RADIUS_PX;

      for (const seg of nodeEditScreenSegmentsRef.current) {
        // Also compute distance to nearest point along segment by sampling screen positions
        const dist = Math.hypot(e.clientX - seg.mx, e.clientY - seg.my);
        if (dist < segMinDist) {
          segMinDist = dist;
          hitCurveIdx = seg.curveIdx;
          hitSeg1Idx = seg.seg1Idx;
          hitSeg2Idx = seg.seg2Idx;
        }
      }

      // Fallback: use paper.js local distance if screen midpoints didn't find anything
      if (hitCurveIdx === -1) {
        try {
          const nearestLoc = paperPath.getNearestLocation(mousePt);
          if (nearestLoc && nearestLoc.curve) {
            const ctm = pathEl.getScreenCTM();
            const scale = ctm ? Math.sqrt(ctm.a * ctm.a + ctm.b * ctm.b) : 1;
            const screenDist = nearestLoc.distance * scale;
            if (screenDist <= SEG_HIT_RADIUS_PX) {
              const curves = getPaperCurves(paperPath);
              const segments = getPaperSegments(paperPath);
              hitCurveIdx = curves.indexOf(nearestLoc.curve);
              hitSeg1Idx = segments.indexOf(nearestLoc.curve.segment1);
              hitSeg2Idx = segments.indexOf(nearestLoc.curve.segment2);
            }
          }
        } catch { /* ignored */ }
      }

      if (hitCurveIdx !== -1 && hitSeg1Idx !== -1 && hitSeg2Idx !== -1) {
        if (nodeEditImageAdjustRef?.current || pathEl.getAttribute('data-image-adjust-active') === 'true') {
          if (nodeEditImageAdjustRef) nodeEditImageAdjustRef.current = false;
          pathEl.removeAttribute('data-image-adjust-active');
          drawNodeEditOverlay(pathEl, paperPath, pageIndex);
        }
        const curves = getPaperCurves(paperPath);
        const segments = getPaperSegments(paperPath);
        const curve = curves[hitCurveIdx];
        if (curve) {
          if (e.ctrlKey) {
            // Ctrl + drag on segment in Node Edit Mode: Bend the line into a curve!
            nodeEditDragRef.current = {
              mode: 'segment-bend',
              curveIndex: hitCurveIdx,
              startPt: pt,
              startHandle1: curve.segment1.handleOut.clone(),
              startHandle2: curve.segment2.handleIn.clone(),
              pathEl,
              paperPath,
              pageIndex
            };
          } else {
            // Regular click: select both endpoint nodes (plus co-located nodes) and allow moving the segment
            const selSet = new Set([hitSeg1Idx, hitSeg2Idx]);
            [hitSeg1Idx, hitSeg2Idx].forEach(idx => {
              if (segments[idx]) {
                const p = segments[idx].point;
                segments.forEach((s, sIdx) => {
                  if (Math.hypot(s.point.x - p.x, s.point.y - p.y) < 3.0) {
                    selSet.add(sIdx);
                    s.point.x = p.x;
                    s.point.y = p.y;
                  }
                });
              }
            });

            nodeEditSelectedHandleSideRef.current = 'line';
            nodeEditSelectedCurveIdxRef.current = hitCurveIdx;
            nodeEditSelectedSegIndicesRef.current = selSet;
            nodeEditSelectedSegIdxRef.current = hitSeg1Idx;
            drawNodeEditOverlay(pathEl, paperPath, pageIndex);
            const distinctCount = getDistinctNodes(paperPath, selSet).length;
            const canJoin = checkCanJoinNodes(paperPath, selSet);
            // Detect actual curve type from segment handles instead of always dispatching 'custom'
            const curveSeg1 = segments[hitSeg1Idx];
            let curveNodeType = 'custom';
            if (curveSeg1) {
              if (curveSeg1.nodeType) {
                curveNodeType = curveSeg1.nodeType;
              } else if (!curveSeg1.handleIn.isZero() && !curveSeg1.handleOut.isZero()) {
                const dot = curveSeg1.handleIn.normalize().dot(curveSeg1.handleOut.normalize());
                curveNodeType = (dot < -0.90)
                  ? (Math.abs(curveSeg1.handleIn.length - curveSeg1.handleOut.length) < 4.0 ? 'balanced' : 'smooth')
                  : 'custom';
              } else if (curveSeg1.handleIn.isZero() && curveSeg1.handleOut.isZero()) {
                curveNodeType = 'sharp';
              }
            }
            window.dispatchEvent(new CustomEvent('node-selected', { detail: { nodeType: curveNodeType, selectedCount: distinctCount, canJoin, isLineSelected: true } }));

            // Store initial positions of all segment endpoint nodes (and co-located nodes)
            const startPoints = {};
            selSet.forEach(idx => {
              if (segments[idx]) {
                startPoints[idx] = segments[idx].point.clone();
              }
            });

            nodeEditDragRef.current = {
              mode: 'segment-translate',
              curveIndex: hitCurveIdx,
              seg1Idx: hitSeg1Idx,
              seg2Idx: hitSeg2Idx,
              startPt: pt,
              startPoints,
              pathEl,
              paperPath,
              pageIndex
            };
          }
        }

        suppressClickRef.current = true;
        e.stopPropagation();
        return;
      }

      // Check if clicking inside a masked shape's body to pan/move the image inside
      const hasImageMask = Boolean(
        pathEl.getAttribute?.('data-mask-enabled') === 'true' ||
        pathEl.getAttribute?.('data-masked-image-url') ||
        pathEl.closest?.('[data-mask-enabled="true"]') !== null ||
        (pathEl.getAttribute?.('fill') && pathEl.getAttribute?.('fill').includes('url(#pattern')) ||
        pathEl.closest?.('[fill*="url(#pattern"]') !== null
      );
      const rect = pathEl.getBoundingClientRect();
      const isInsideBbox = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      const isInsideShape = isInsideBbox || (e.target === pathEl || pathEl.contains(e.target)) || hitTest(pathEl, e.clientX, e.clientY) || (paperPath?.contains && paperPath.contains(mousePt));

      if (hasImageMask && isInsideShape) {
        if (!hasCustomImageInShape(pathEl)) {
          // Placeholder inside frame should not be moved/panned
        } else {
          if (!nodeEditImageAdjustRef?.current || pathEl.getAttribute('data-image-adjust-active') !== 'true') {
            if (nodeEditImageAdjustRef) nodeEditImageAdjustRef.current = true;
            pathEl.setAttribute('data-image-adjust-active', 'true');
            drawNodeEditOverlay(pathEl, paperPath, pageIndex);
          }

          nodeEditDragRef.current = {
            mode: 'image-pan',
            pathEl,
            paperPath,
            startPt: pt,
            startClientX: e.clientX,
            startClientY: e.clientY,
            startPanX: parseFloat(pathEl.getAttribute('data-slot-pan-x') || '0'),
            startPanY: parseFloat(pathEl.getAttribute('data-slot-pan-y') || '0'),
            startZoom: parseFloat(pathEl.getAttribute('data-slot-zoom') || '1'),
            bbox: rect,
            scale: zoom / 100,
            pageIndex
          };
          suppressClickRef.current = true;
          e.stopPropagation();
          return;
        }
      }

      // Clicked outside all nodes and path → exit Node Edit Mode and select full path
      const pIdx = nodeEditPageIndexRef.current !== null ? nodeEditPageIndexRef.current : activePageIndex;
      const targetPath = pathEl;
      const targetId = targetPath?.id;

      exitNodeEditMode();

      if (targetPath && targetId) {
        if (selectedLayerIdRef) selectedLayerIdRef.current = targetId;
        if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([targetId]);
        if (setSelectedLayerId) setSelectedLayerId(targetId);
        if (setMultiSelectedIds) setMultiSelectedIds(new Set([targetId]));
        if (skipClearSelectionRef) skipClearSelectionRef.current = true;
        setTimeout(() => {
          const freshEl = document.getElementById(targetId) || targetPath;
          if (freshEl && drawOverlayHighlight) {
            drawOverlayHighlight(freshEl, 'selected');
          }
        }, 40);
      }

      if (targetPath && targetPath.ownerSVGElement && saveModifiedPageHtml) {
        saveModifiedPageHtml(pIdx, targetPath.ownerSVGElement);
      }

      suppressClickRef.current = true;
      e.stopPropagation();
      return;
    }



    // ── Creation Tool: Text (Type) Tool — Figma style ───────────────────────────
    //  • drag  → draws a box; on release a FIXED-size text box of that size (text wraps inside)
    //  • click → AUTO-WIDTH text at the point
    // Either way the new text starts empty with a caret (empty text is removed if left unedited).
    if (activeMainTool === 'type') {
      const parentEl = resolveTargetParentForCreation(svg, e.clientX, e.clientY);
      if (!parentEl) return;

      const startPt = getLocalPoint(svg, parentEl, e.clientX, e.clientY);
      const startX = e.clientX;
      const startY = e.clientY;
      const DRAG_THRESHOLD = 4; // px — below this it's a click

      // Rubber-band box shown while dragging (fixed-positioned: independent of canvas zoom/scroll)
      const band = document.createElement('div');
      band.setAttribute('data-text-draw-band', 'true');
      // Same look as the editor's hover / selection box (1px #5255CA, no fill) → hands over seamlessly
      band.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;box-sizing:border-box;border:1px solid #5255CA;background:transparent;pointer-events:none;z-index:2147483646;display:none;';
      document.body.appendChild(band);
      // While drawing, hide other elements' hover boxes so only the box being drawn is visible
      if (!document.getElementById('pe-text-drawing-style')) {
        const st = document.createElement('style');
        st.id = 'pe-text-drawing-style';
        st.textContent = 'body.pe-text-drawing [id^="highlight-overlay-"] [id*="hover"] { display: none !important; }';
        document.head.appendChild(st);
      }
      document.body.classList.add('pe-text-drawing');

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) { band.style.display = 'none'; return; }
        band.style.display = 'block';
        band.style.left = `${Math.min(startX, ev.clientX)}px`;
        band.style.top = `${Math.min(startY, ev.clientY)}px`;
        band.style.width = `${Math.abs(dx)}px`;
        band.style.height = `${Math.abs(dy)}px`;
      };
      const onUp = (ev) => {
        window.removeEventListener('mousemove', onMove, true);
        window.removeEventListener('mouseup', onUp, true);
        document.body.classList.remove('pe-text-drawing');
        const dragged = Math.abs(ev.clientX - startX) >= DRAG_THRESHOLD || Math.abs(ev.clientY - startY) >= DRAG_THRESHOLD;
        const endPt = dragged ? getLocalPoint(svg, parentEl, ev.clientX, ev.clientY) : null;
        if (!dragged) band.remove();
        // Dragged: keep the drawn box on screen until the new text's selection box replaces it (no gap)
        createTextElement(parentEl, startPt, endPt, dragged ? band : null);
      };
      window.addEventListener('mousemove', onMove, true);
      window.addEventListener('mouseup', onUp, true);

      const createTextElement = (parentEl, p1, p2, drawnBand = null) => {
        const id = `text-${Math.random().toString(36).substr(2, 9)}`;
        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        const ptToMmScale = 0.2645833333333333;
        const isFixed = Boolean(p2);
        // Box in the parent's local units → foreignObject units (it is scaled by ptToMmScale)
        const left = isFixed ? Math.min(p1.x, p2.x) : p1.x;
        const top = isFixed ? Math.min(p1.y, p2.y) : p1.y;
        const boxW = isFixed ? Math.max(Math.abs(p2.x - p1.x) / ptToMmScale, 40) : 190;
        const boxH = isFixed ? Math.max(Math.abs(p2.y - p1.y) / ptToMmScale, 38) : 38;

        fo.setAttribute('id', id);
        fo.setAttribute('x', left / ptToMmScale);
        fo.setAttribute('y', top / ptToMmScale);
        fo.setAttribute('width', String(boxW));
        fo.setAttribute('height', String(boxH));
        fo.setAttribute('transform', `matrix(${ptToMmScale} 0 0 ${ptToMmScale} 0 0)`);
        fo.setAttribute('fill', '#000000');
        fo.setAttribute('stroke', 'none');
        fo.setAttribute('stroke-width', '0');
        fo.setAttribute('font-family', "'Outfit', sans-serif");
        fo.setAttribute('font-size', '24pt');
        fo.setAttribute('font-weight', 'normal');
        fo.setAttribute('data-font-weight', 'normal');
        fo.setAttribute('letter-spacing', '0');
        fo.setAttribute('data-auto-wrap', isFixed ? 'true' : 'false');
        fo.setAttribute('data-sizing-mode', isFixed ? 'fixed' : 'auto-width');
        fo.setAttribute('data-type', 'text');

        const div = document.createElement('div');
        div.style.width = isFixed ? '100%' : 'max-content'; // auto-width: scrollWidth matches the text
        div.style.height = '100%';
        div.style.minHeight = '100%';
        div.style.display = 'block'; // keep styled runs inline (no flex column)
        div.style.color = '#000000';
        div.style.fontFamily = "'Outfit', sans-serif";
        div.style.fontSize = '24pt';
        div.style.fontWeight = 'normal';
        div.setAttribute('data-font-weight', 'normal');
        div.style.fontStyle = 'normal';
        div.style.textDecoration = 'none';
        div.style.textAlign = 'left';
        div.style.lineHeight = '1.2';
        div.style.letterSpacing = '0px';
        if (isFixed) {
          // Same setup as Text Properties → Fixed: wraps inside the drawn box, starts at the top
          div.style.setProperty('white-space', 'pre-wrap', 'important');
          div.style.setProperty('overflow-wrap', 'break-word', 'important');
          div.style.setProperty('word-break', 'normal');
          div.style.setProperty('overflow', 'visible', 'important');
        } else {
          div.style.wordBreak = 'normal';
          div.style.overflowWrap = 'normal';
          div.style.whiteSpace = 'pre'; // never wraps unless the user presses Enter
        }
        div.style.padding = '0px';
        div.style.margin = '0';
        div.style.boxSizing = 'border-box';
        div.style.outline = 'none';
        div.style.background = 'transparent';
        div.style.userSelect = 'none';
        div.style.pointerEvents = 'none';

        div.innerText = ''; // starts empty with a caret (Figma); removed on exit if nothing typed
        fo.appendChild(div);

        parentEl.appendChild(fo);

        if (updatePageHtml) {
          saveModifiedPageHtml(pageIndex, svg);
          window.dispatchEvent(new CustomEvent('expand-layer-parent', { detail: { id: id } }));
          if (setActiveMainTool) setActiveMainTool('select');
          window.dispatchEvent(new CustomEvent('select-layer', { detail: { layerId: id } }));
        }

        skipClearSelectionRef.current = true;

        setTimeout(() => {
          if (setActiveMainTool) setActiveMainTool('select');

          if (setSelectedLayerId) {
            setSelectedLayerId(id);
            selectedLayerIdRef.current = id;
          }
          if (setMultiSelectedIds) {
            setMultiSelectedIds(new Set([id]));
            multiSelectedIdsRef.current = new Set([id]);
          }

          // Highlight it instantly and put the caret in it
          const mountedText = container.querySelector(`[id="${id}"]`);
          if (mountedText) {
            // Click-created text (Figma): only a blinking caret until the first character is typed —
            // no selection box yet. A dragged box (fixed) shows its box immediately.
            if (!isFixed) {
              if (!document.getElementById('pe-text-caret-only-style')) {
                const st = document.createElement('style');
                st.id = 'pe-text-caret-only-style';
                st.textContent = 'body.pe-text-caret-only [id^="highlight-overlay-"], body.pe-text-caret-only [id^="overlay-poly-"], body.pe-text-caret-only [id^="overlay-path-"], body.pe-text-caret-only .resize-handle { opacity: 0 !important; transition: none !important; }';
                document.head.appendChild(st);
              }
              document.body.classList.add('pe-text-caret-only');
            }
            drawOverlayHighlight(mountedText, 'selected');
            enterTextEditMode(mountedText, null, null, true);
            // Selection box is drawn now — remove the drag box in the same frame
            if (drawnBand) requestAnimationFrame(() => drawnBand.remove());
            if (!isFixed) {
              const editDiv = mountedText.querySelector('[contenteditable="true"]') || mountedText.firstElementChild;
              const showBox = () => {
                document.body.classList.remove('pe-text-caret-only');
                if (editDiv) {
                  editDiv.removeEventListener('input', onFirstInput);
                  editDiv.removeEventListener('focusout', showBox);
                }
              };
              const onFirstInput = () => {
                if (!(editDiv?.innerText || '').trim()) return; // still empty → keep caret only
                showBox();
                if (mountedText.isConnected) {
                  drawOverlayHighlight(mountedText, 'selected');
                  window.dispatchEvent(new CustomEvent('force-update-selection-box', { detail: { elementId: id } }));
                }
              };
              if (editDiv) {
                editDiv.addEventListener('input', onFirstInput);
                editDiv.addEventListener('focusout', showBox); // left without typing → empty text is removed; restore boxes
              } else {
                showBox();
              }
              // Safety net: never leave selection boxes hidden
              setTimeout(() => { if (!editDiv || !editDiv.isConnected) showBox(); }, 30000);
            }
          }

          if (drawnBand && drawnBand.isConnected) requestAnimationFrame(() => drawnBand.remove()); // safety
          suppressClickRef.current = false;
        }, 100);

        suppressClickRef.current = true;
      };

      suppressClickRef.current = true;
      e.stopPropagation();
      return;
    }

    // ── Pen/Pencil Tool Drawing (Only on Active Page) ─────────────────────────────
    if (activeMainTool === 'pen' && pageIndex === activePageIndex) {
      const currentPenTool = selectedPenToolRef?.current || selectedPenTool || 'pen';
      if (currentPenTool === 'pencil') {
        const parentEl = resolveTargetParentForCreation(svg, e.clientX, e.clientY);
        if (!parentEl) return;
        const pt = getLocalPoint(svg, parentEl, e.clientX, e.clientY);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const id = `pencil-${Math.random().toString(36).substr(2, 9)}`;
        path.setAttribute('id', id);
        path.setAttribute('data-type', 'vector-path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000000');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('shape-rendering', 'geometricPrecision');
        path.setAttribute('vector-effect', 'non-scaling-stroke'); // stroke stays the same when resized (like shapes)
        applyPenDefaults(path);
        path.setAttribute('d', `M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);

        parentEl.appendChild(path);
        drawingPathRef.current = path;
        drawingPointsRef.current = [{ x: pt.x, y: pt.y }];
        drawingPageIndexRef.current = pageIndex;
        drawingSvgRef.current = svg;
        isFreehandDrawingRef.current = true;
        suppressClickRef.current = true;
        return;
      }

      // Vectra Pen Tool
      const parentEl = resolveTargetParentForCreation(svg, e.clientX, e.clientY);
      if (!parentEl) return;
      const pt = getLocalPoint(svg, parentEl, e.clientX, e.clientY);

      const vSession = vectraPenSessionRef.current;

      // Create or reuse an existing SVG <path> element for the Pen session
      let pathEl = drawingPathRef.current;
      if (!pathEl || !pathEl.parentElement || !pathEl.ownerSVGElement) {
        let existingTarget = nodeEditModeRef.current ? nodeEditPathRef.current : null;

        if (existingTarget && existingTarget.getAttribute('d')) {
          pathEl = existingTarget;
          drawingPathRef.current = pathEl;
          drawingPageIndexRef.current = pageIndex;
          drawingSvgRef.current = svg;

          if (vSession.paths.size === 0) {
            loadDIntoVectraSession(pathEl.getAttribute('d'), vSession, paperScopeRef.current);
          }
        } else {
          const id = `vpath-${Math.random().toString(36).substr(2, 9)}`;
          pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathEl.setAttribute('id', id);
          pathEl.setAttribute('data-type', 'vector-path');
          pathEl.setAttribute('data-name', 'Vector Path');
          pathEl.setAttribute('fill', 'none');
          pathEl.setAttribute('stroke', '#000000');
          pathEl.setAttribute('stroke-width', '1.5');
          pathEl.setAttribute('stroke-linecap', 'round');
          pathEl.setAttribute('stroke-linejoin', 'round');
          pathEl.setAttribute('shape-rendering', 'geometricPrecision');
          pathEl.setAttribute('vector-effect', 'non-scaling-stroke'); // stroke stays the same when resized (like shapes)
          applyPenDefaults(pathEl);
          parentEl.appendChild(pathEl);
          drawingPathRef.current = pathEl;
          drawingPageIndexRef.current = pageIndex;
          drawingSvgRef.current = svg;
        }
      }

      vSession.onDown(e, pt);

      // Update single <path> element's d attribute with ALL paths in vSession
      const comboD = pathToDCombo(vSession.paths);
      if (comboD) {
        pathEl.setAttribute('d', comboD);
      }

      // Render overlay showing ALL nodes for ALL paths currently in vSession
      renderVectraOverlay(pageIndex, pathEl.parentElement || parentEl, vSession);
      suppressClickRef.current = true;
      return;
    }

    // ── Shapes Tool Drawing (Only on Active Page) ──────────────────────────────
    if (activeMainTool === 'shapes' && pageIndex === activePageIndex) {
      let parentEl = resolveTargetParentForCreation(svg, e.clientX, e.clientY);
      if (!parentEl) return;
      const pt = getLocalPoint(svg, parentEl, e.clientX, e.clientY);

      if (parentEl) {
        let shape;
        const id = `shape-${Math.random().toString(36).substr(2, 9)}`;

        switch (selectedShapeTool) {
          case 'rectangle':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.setAttribute('x', pt.x);
            shape.setAttribute('y', pt.y);
            shape.setAttribute('width', '0');
            shape.setAttribute('height', '0');
            shape.setAttribute('data-is-element-shape', 'true');
            shape.setAttribute('data-shape-id', 'rounded-rectangle');
            shape.setAttribute('data-shape-title', 'Rectangle');
            shape.setAttribute('data-shape-type', 'rectangle');
            shape.setAttribute('data-tl', '0');
            shape.setAttribute('data-tr', '0');
            shape.setAttribute('data-bl', '0');
            shape.setAttribute('data-br', '0');
            shape.setAttribute('data-corner-linked', 'true');
            shape.setAttribute('rx', '0');
            shape.setAttribute('ry', '0');
            break;
          case 'circle':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            shape.setAttribute('cx', pt.x);
            shape.setAttribute('cy', pt.y);
            shape.setAttribute('rx', '0');
            shape.setAttribute('ry', '0');
            shape.setAttribute('data-is-element-shape', 'true');
            shape.setAttribute('data-shape-id', 'true-circle');
            shape.setAttribute('data-shape-title', 'Circle');
            shape.setAttribute('data-shape-type', 'ellipse');
            break;
          case 'free-frame':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.setAttribute('x', pt.x);
            shape.setAttribute('y', pt.y);
            shape.setAttribute('width', '0');
            shape.setAttribute('height', '0');
            break;
          case 'line':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            shape.setAttribute('x1', pt.x);
            shape.setAttribute('y1', pt.y);
            shape.setAttribute('x2', pt.x);
            shape.setAttribute('y2', pt.y);
            break;
          case 'polygon':
          case 'star':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            shape.setAttribute('d', `M ${pt.x} ${pt.y}`);
            shape.setAttribute('data-cx', pt.x);
            shape.setAttribute('data-cy', pt.y);
            shape.setAttribute('data-count', selectedShapeTool === 'polygon' ? '3' : '5');
            shape.setAttribute('data-ratio', '40');
            shape.setAttribute('data-radius', '0');
            shape.setAttribute('data-shape-type', selectedShapeTool);
            shape.setAttribute('data-is-element-shape', 'true');
            shape.setAttribute('data-shape-id', selectedShapeTool === 'polygon' ? 'sharp-triangle' : 'chubby-5-point-star');
            shape.setAttribute('data-shape-title', selectedShapeTool === 'polygon' ? 'Polygon' : 'Star');
            break;
        }

        if (shape) {
          shape.setAttribute('id', id);
          if (selectedShapeTool === 'line') {
            shape.setAttribute('fill', 'none');
            shape.setAttribute('stroke', '#000000');
            shape.setAttribute('stroke-width', '1');
            shape.setAttribute('data-stroke-color', '#000000');
            shape.setAttribute('data-stroke-width', '1');
            shape.setAttribute('data-name', `Line ${id.substr(0, 4)}`);
            shape.setAttribute('data-type', 'shape');
            shape.setAttribute('data-shape-type', 'line');
            shape.setAttribute('data-is-element-shape', 'true');
            shape.setAttribute('data-shape-id', 'straight-line');
            shape.setAttribute('data-shape-title', 'Line');
            shape.setAttribute('vector-effect', 'non-scaling-stroke');
          } else if (selectedShapeTool === 'free-frame') {
            const zoomScale = zoom / 100;
            shape.setAttribute('fill', 'transparent');
            shape.setAttribute('stroke', '#000000');
            shape.setAttribute('stroke-width', String(1 / zoomScale));
            shape.removeAttribute('stroke-dasharray');
            shape.setAttribute('data-interaction', 'open-link');
            shape.setAttribute('data-interaction-value', '');
            shape.setAttribute('data-drawing', 'true');
            shape.setAttribute('data-name', 'Free Frame');
            shape.setAttribute('data-type', 'shape');
          } else {
            shape.setAttribute('fill', '#d0ccff');
            shape.setAttribute('stroke', 'none');
            shape.setAttribute('stroke-width', '0');
            shape.setAttribute('data-fill-color', '#d0ccff');
            shape.setAttribute('data-stroke-color', 'none');
            shape.setAttribute('data-stroke-width', '0');
            shape.setAttribute('data-stroke-position', 'Inside');
            shape.setAttribute('paint-order', 'stroke fill');
            shape.style.paintOrder = 'stroke fill';
            shape.setAttribute('vector-effect', 'non-scaling-stroke');
            const formattedName = selectedShapeTool.charAt(0).toUpperCase() + selectedShapeTool.slice(1);
            shape.setAttribute('data-name', `${formattedName} ${id.substr(0, 4)}`);
            shape.setAttribute('data-type', 'shape');
          }

          parentEl.appendChild(shape);
          drawingShapeRef.current = shape;
          shapeStartPointRef.current = pt;
          drawingPageIndexRef.current = pageIndex;
          drawingSvgRef.current = svg;
          suppressClickRef.current = true;
        }
      }
      return;
    }

    if (!['select', 'upload'].includes(activeMainTool)) return;

    // ── Update Active Page on MouseDown ─────────────────────────────────────
    if (setActivePageIndex && activePageIndex !== pageIndex) {
      setActivePageIndex(pageIndex);
    }


    // 1. Identify level candidates and check if click hit any (including gaps)
    let candidates = [];
    let effectiveFrameId = currentFrameIdRef.current;

    if (effectiveFrameId) {
      const frameEl = svg.querySelector(`[id="${effectiveFrameId}"]`);
      candidates = frameEl ? getDirectChildFrames(frameEl) : [];
    } else {
      candidates = getTopLevelFrames(svg);
    }

    let hitCandidate = null;
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (hitTest(candidates[i], e.clientX, e.clientY, 2)) {
        hitCandidate = candidates[i];
        break;
      }
    }

    const topFrames = getTopLevelFrames(svg);
    if (!hitCandidate || topFrames.some(f => f.id === hitCandidate.id)) {
      const leafTarget = (svg && e.target && svg.contains && svg.contains(e.target)) ? getDraggableElement(e.target, svg) : null;
      if (leafTarget) {
        const leafIsBase = topFrames.some(f => f.id === leafTarget.id);
        if (!leafIsBase && leafTarget.getAttribute('data-name') !== 'Overlay') {
          hitCandidate = leafTarget;
        }
      }
    }

    // Empty gap inside a group: hit the group itself
    if (!hitCandidate || topFrames.some(f => f.id === hitCandidate.id) || isPageRootElement(hitCandidate, svg) ||
        hitCandidate.getAttribute('data-name') === 'Overlay' || hitCandidate.getAttribute('data-type') === 'background') {
      const gapGroup = findGroupAtPoint(svg, e.clientX, e.clientY, selectedLayerIdRef.current);
      const gapGroupSelected = gapGroup && (selectedLayerIdRef.current === gapGroup.id || multiSelectedIdsRef.current.has(gapGroup.id));
      // Unselected group: let drag-select (marquee) start; a plain click still selects the group on 'click'.
      if (gapGroupSelected) hitCandidate = gapGroup;
    }

    // ── NEW: Check if we hit ANY already-selected element's bounding box ──────────
    let hitAnySelected = false;
    const currentMultiIds = multiSelectedIdsRef.current;
    if (currentMultiIds.size > 0) {
      for (const id of currentMultiIds) {
        const el = svg.querySelector(`[id="${id}"]`);
        if (el && hitTest(el, e.clientX, e.clientY, 2)) {
          hitAnySelected = true;
          break;
        }
      }
    }

    let hitMultiSelectionGap = false;
    if (currentMultiIds.size > 1 && !hitAnySelected) {
      const pageContainer = getEventPageContainer(e, pageIndex);
      const multiPoly = pageContainer?.querySelector('.selection-overlay-layer #overlay-poly-selected-multi-selection-bounds') || pageContainer?.querySelector('.selection-overlay-layer #overlay-poly-selected-multi');
      if (multiPoly) {
        const polyRect = multiPoly.getBoundingClientRect();
        if (e.clientX >= polyRect.left && e.clientX <= polyRect.right &&
          e.clientY >= polyRect.top && e.clientY <= polyRect.bottom) {
          hitMultiSelectionGap = true;
        }
      }
    }

    const hitBaseFrame = hitCandidate && topFrames.some(f => f.id === hitCandidate.id);

    // 2. Selection/Drag Priority
    // If we hit any valid child candidate OR any already-selected element OR the multi-selection gap, 
    // don't start a marquee unless user holds Ctrl or Shift to draw a selection box across elements.
    if ((hitCandidate && !hitBaseFrame || hitAnySelected || hitMultiSelectionGap) && !e.ctrlKey && !e.shiftKey && selectedSelectToolRef.current !== 'direct') {
      return;
    }

    // 3. Marquee Start Detection
    let hitSelectedImage = false;
    if (hitAnySelected && currentMultiIds.size === 1) {
      const id = Array.from(currentMultiIds)[0];
      const el = svg.querySelector(`[id="${id}"]`);
      if (el && (el.getAttribute('data-type') === 'image' || el.tagName.toLowerCase() === 'image')) {
        hitSelectedImage = true;
      }
    }

    // Start marquee if user holds Ctrl (unless clicking a selected image) OR if they clicked on the background/base frame
    // (Also start if Shift is held so Shift+Drag can draw marquee over elements without Ctrl)
    // Converted flipbooks / Interaction & Animation modules: NEVER start marquee drag-selection
    const isInsideTable = Boolean(e.target?.closest?.('td, th, table, [data-type="table-frame"], [data-type="table"], g[id^="table-"]'));
    const isModuleWithoutMarquee = activeTopTool === 'interaction' || activeTopTool === 'animation' || activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';
    const shouldStartMarquee = !isInsideTable && !isModuleWithoutMarquee && (((e.ctrlKey || e.shiftKey) && !hitSelectedImage) || (!isConvertedFlipbook && (!hitCandidate || hitBaseFrame) && selectedSelectToolRef.current !== 'direct' && !isEditingTextRef.current));

    if (shouldStartMarquee) {
      const rect = container.getBoundingClientRect();
      const scale = zoom / 100;
      const startX = (e.clientX - rect.left) / scale;
      const startY = (e.clientY - rect.top) / scale;

      marqueeDataRef.current = { startX, startY, containerRect: rect, scale, startClientX: e.clientX, startClientY: e.clientY };

      // Cache candidates and their bounding boxes for the marquee operation
      if (!hitCandidate || hitBaseFrame) {
        currentFrameIdRef.current = null;
        if (typeof setCurrentFrameId === 'function') setCurrentFrameId(null);
      }
      const isInteractiveTool = activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';
      const candidatePool = getAllSelectablePageElements(svg);

      let marqueeCandidates = candidatePool.filter(el => {
        if (!el || !el.id) return false;
        if (isConvertedFlipbook) {
          const isHotspot = el.getAttribute('data-is-hotspot') === 'true' || el.getAttribute('data-type') === 'hotspot';
          const isFreeFrame = el.getAttribute('data-name') === 'Free Frame' || el.getAttribute('data-type') === 'free-frame' || el.id?.startsWith('free-frame');
          const isFreeFrameCandidate = isFreeFrame && isInteractiveTool;
          const isShape = el.getAttribute('data-type') === 'shape' && !isFreeFrame;
          const isIcon = el.getAttribute('data-type') === 'icon';
          const tag = el.tagName.toLowerCase();
          const isText = tag === 'text' || tag === 'foreignobject' || el.getAttribute('data-type') === 'text' || el.getAttribute('data-type') === 'group';
          return isHotspot || isFreeFrameCandidate || isShape || isIcon || isText;
        }
        return true;
      });

      marqueeCandidatesRef.current = marqueeCandidates.map(el => ({
        id: el.id,
        rect: el.getBoundingClientRect()
      }));

      setMarquee({ pageIndex });
      if (marqueeRef) marqueeRef.current = { pageIndex };
      e._handledMarquee = true;

      const activeRef = marqueeOverlayRef1; // Single page is always container 1
      if (activeRef.current) {
        activeRef.current.style.display = 'none';
        const rectEl = activeRef.current.querySelector ? activeRef.current.querySelector('rect') : null;
        if (rectEl) {
          rectEl.setAttribute('x', String(startX));
          rectEl.setAttribute('y', String(startY));
          rectEl.setAttribute('width', '0');
          rectEl.setAttribute('height', '0');
          rectEl.setAttribute('stroke-width', (1 / scale).toFixed(3));
        } else {
          Object.assign(activeRef.current.style, {
            borderWidth: `${(1 / scale).toFixed(3)}px`,
            left: `${startX}px`,
            top: `${startY}px`,
            width: '0px',
            height: '0px'
          });
        }
      }
      return;
    }
  };

  // ── FIGMA-STYLE MOUSE MOVE: hover highlight & Marquee update ─────────────────
  const handleSvgMouseMove = (pageIndex, e) => {
    // Fast-path: if an element is currently being dragged, suppress canvas hover scanning
    if (document.body.classList.contains('dragging-active') || document.querySelector('[data-dragging="true"]')) {
      return;
    }
    // Screen colour picker open: no hover boxes on the page
    if (document.body.classList.contains('screen-color-picking')) {
      clearHover();
      return;
    }

    lastMousePosRef.current = { x: e.clientX, y: e.clientY, target: e.target };
    if (isAltPressedRef.current && selectedLayerIdRef.current) {
      if (drawMeasurementOverlayRef.current) {
        drawMeasurementOverlayRef.current(e.target);
      }
    }

    // ── NODE EDIT MODE: Drag node(s), handle, or line segment ─────────────────
    if (nodeEditDragRef.current) {
      const { mode, segIdx, handleSide, pathEl, paperPath, startPt, startPoints, curveIndex, startHandle1, startHandle2 } = nodeEditDragRef.current;

      if (mode === 'image-pan') {
        const { pathEl: panPathEl, startClientX, startClientY, startPanX, startPanY, startZoom, bbox, scale, isStandaloneAdjust } = nodeEditDragRef.current;
        const currentScale = scale || (zoom / 100) || 1;
        const dxPx = (e.clientX - startClientX) / currentScale;
        const dyPx = (e.clientY - startClientY) / currentScale;
        const unscaledW = (bbox && bbox.width > 0) ? (bbox.width / currentScale) : 100;
        const unscaledH = (bbox && bbox.height > 0) ? (bbox.height / currentScale) : 100;
        const normDx = dxPx / unscaledW;
        const normDy = dyPx / unscaledH;
        const newPanX = Math.round((startPanX + normDx) * 1000) / 1000;
        const newPanY = Math.round((startPanY + normDy) * 1000) / 1000;

        updateShapeMaskTransform({
          selectedElement: panPathEl,
          panX: newPanX,
          panY: newPanY,
          zoom: startZoom
        });
        if (isStandaloneAdjust || shapeImageAdjustTargetRef.current) {
          const pIdx = shapeImageAdjustPageIndexRef.current !== null ? shapeImageAdjustPageIndexRef.current : activePageIndex;
          drawShapeImageAdjustOverlay(panPathEl, pIdx, zoom);
        } else if (typeof drawNodeEditOverlay === 'function' && nodeEditPaperPathRef?.current) {
          drawNodeEditOverlay(panPathEl, nodeEditPaperPathRef.current, nodeEditPageIndexRef?.current !== null ? nodeEditPageIndexRef.current : activePageIndex);
        }
        suppressClickRef.current = true;
        return;
      }

      const svgEl = pathEl?.ownerSVGElement;
      if (!svgEl) return;
      const pt = getLocalPoint(svgEl, pathEl, e.clientX, e.clientY);
      paperScopeRef.current.activate();
      const mousePoint = new paperScopeRef.current.Point(pt.x, pt.y);
      const delta = (startPt && startPt.x !== undefined) ? mousePoint.subtract(new paperScopeRef.current.Point(startPt.x, startPt.y)) : null;

      if (mode === 'node') {
        if (startPoints && Object.keys(startPoints).length > 0) {
          Object.keys(startPoints).forEach(sIdxStr => {
            const sIdx = parseInt(sIdxStr);
            const seg = paperPath?.segments?.[sIdx];
            if (seg && startPoints[sIdx]) {
              seg.point = startPoints[sIdx].add(delta);
            }
          });
        } else {
          const seg = paperPath?.segments?.[segIdx];
          if (seg) seg.point = mousePoint;
        }
      } else if (mode === 'handle') {
        const seg = paperPath?.segments?.[segIdx];
        if (seg) {
          applyHandleDrag(seg, handleSide, mousePoint, e.altKey);
        }
      } else if (mode === 'segment-bend') {
        const curve = paperPath?.curves?.[curveIndex];
        if (curve && startHandle1 && startHandle2) {
          curve.segment1.handleOut = startHandle1.add(delta.multiply(0.5));
          curve.segment2.handleIn = startHandle2.add(delta.multiply(-0.5));
        }
      }

      if (paperPath?.pathData) {
        pathEl.setAttribute('d', paperPath.pathData);
        drawNodeEditOverlay(pathEl, paperPath, nodeEditPageIndexRef.current);
      }
      suppressClickRef.current = true;
      return;
    }

    // ── NODE EDIT MODE: Hover Segment Highlight ────────────────
    if (nodeEditModeRef.current && nodeEditPathRef.current && nodeEditPaperPathRef.current && !nodeEditDragRef.current && activeMainTool !== 'pen') {
      const SEG_HIT_RADIUS_PX = 22;
      let hoverCurveIdx = -1;
      let minSegDist = SEG_HIT_RADIUS_PX;

      for (const seg of nodeEditScreenSegmentsRef.current) {
        const dist = Math.hypot(e.clientX - seg.mx, e.clientY - seg.my);
        if (dist < minSegDist) {
          minSegDist = dist;
          hoverCurveIdx = seg.curveIdx;
        }
      }

      if (hoverCurveIdx !== nodeEditHoverCurveIdxRef.current) {
        nodeEditHoverCurveIdxRef.current = hoverCurveIdx;
        drawNodeEditOverlay(nodeEditPathRef.current, nodeEditPaperPathRef.current, nodeEditPageIndexRef.current);
      }
    }

    // ── Ctrl + Click Bending Update ──
    if (bendingStateRef.current) {
      const { pathEl, paperPath, curveIndex, pageIndex: activePageIdx } = bendingStateRef.current;
      const svg = pathEl.ownerSVGElement;
      const pt = getLocalPoint(svg, pathEl, e.clientX, e.clientY);

      paperScopeRef.current.activate();
      const curve = paperPath?.curves?.[curveIndex];
      if (curve) {
        const mousePoint = new paperScopeRef.current.Point(pt.x, pt.y);

        // Symmetrical bending logic: point handles towards mouse
        const p1 = curve.segment1.point;
        const p2 = curve.segment2.point;

        // Factor of 0.45 creates a natural-looking bow that passes near the cursor
        curve.segment1.handleOut = mousePoint.subtract(p1).multiply(0.45);
        curve.segment2.handleIn = mousePoint.subtract(p2).multiply(0.45);

        pathEl.setAttribute('d', paperPath.pathData);
      }
      drawBendingNodes(activePageIdx, pathEl, paperPath, curveIndex);

      // ── SYNC WITH PEN TOOL STATE ──
      // If this path is part of an active drawing session, we must update the handles in drawingSubPathsRef
      // otherwise finalize/redraw (like pressing Enter) will recalculate automated curves and lose the bend.
      const subPathIdx = drawingSubPathElsRef.current.indexOf(pathEl);
      if (subPathIdx !== -1) {
        const subPath = drawingSubPathsRef.current[subPathIdx];
        const p1Ref = subPath[curveIndex];
        const p2Ref = subPath[(curveIndex + 1) % subPath.length];

        p1Ref.handleOut = { x: curve.segment1.handleOut.x, y: curve.segment1.handleOut.y };
        p2Ref.handleIn = { x: curve.segment2.handleIn.x, y: curve.segment2.handleIn.y };
      }

      suppressClickRef.current = true;
      return;
    }

    // ── Handle Dragging Logic ───────────────────────────────────────────────
    if (handleDraggingStateRef.current) {
      const { pathEl, paperPath, curveIndex, handleSide, pageIndex: activePageIdx } = handleDraggingStateRef.current;
      const svg = pathEl.ownerSVGElement;
      const pt = getLocalPoint(svg, pathEl, e.clientX, e.clientY);

      paperScopeRef.current.activate();
      const curve = paperPath.curves[curveIndex];
      const mousePoint = new paperScopeRef.current.Point(pt.x, pt.y);

      if (handleSide === 'out') {
        curve.segment1.handleOut = mousePoint.subtract(curve.segment1.point);
      } else {
        curve.segment2.handleIn = mousePoint.subtract(curve.segment2.point);
      }

      pathEl.setAttribute('d', paperPath.pathData);
      drawBendingNodes(activePageIdx, pathEl, paperPath, curveIndex);

      // Sync with Pen session points
      const subPathIdx = drawingSubPathElsRef.current.indexOf(pathEl);
      if (subPathIdx !== -1) {
        const subPath = drawingSubPathsRef.current[subPathIdx];
        if (handleSide === 'out') {
          subPath[curveIndex].handleOut = { x: curve.segment1.handleOut.x, y: curve.segment1.handleOut.y };
        } else {
          subPath[(curveIndex + 1) % subPath.length].handleIn = { x: curve.segment2.handleIn.x, y: curve.segment2.handleIn.y };
        }
      }

      suppressClickRef.current = true;
      return;
    }

    // ── Freehand Pencil Update (During Drag) ──────────
    if (isFreehandDrawingRef.current && drawingPathRef.current) {
      const svg = drawingSvgRef.current || (getEventPageContainer(e, pageIndex)?.querySelector('svg'));
      if (!svg) return;
      const pt = getLocalPoint(svg, drawingPathRef.current.parentElement, e.clientX, e.clientY);

      const lastPt = drawingPointsRef.current[drawingPointsRef.current.length - 1];
      if (lastPt && Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) < 1.5) return;

      drawingPointsRef.current.push(pt);
      const d = formatSmoothPathD(drawingPointsRef.current);
      drawingPathRef.current.setAttribute('d', d);
      suppressClickRef.current = true;
      return;
    }

    // ── Vectra Pen Tool Update & Hover Preview ──────────
    const currentPenTool = selectedPenToolRef?.current || selectedPenTool || 'pen';
    if (activeMainTool === 'pen' && currentPenTool === 'pen') {
      const pageContainer = getEventPageContainer(e, pageIndex);
      const svg = drawingSvgRef.current || (pageContainer?.querySelector('svg')) || e.currentTarget?.querySelector?.('svg');
      if (svg) {
        const parentEl = drawingPathRef.current?.parentElement || resolveTargetParentForCreation(svg, e.clientX, e.clientY);
        if (parentEl) {
          const pt = getLocalPoint(svg, parentEl, e.clientX, e.clientY);
          const vSession = vectraPenSessionRef.current;
          vSession.scale = zoom / 100;

          if (e.buttons & 1) {
            vSession.onDrag(e, pt);
          } else {
            vSession.onHover(e, pt);
          }

          const pathEl = drawingPathRef.current;
          if (pathEl) {
            const comboD = pathToDCombo(vSession.paths);
            if (comboD) pathEl.setAttribute('d', comboD);
          }

          if (pageContainer) {
            pageContainer.classList.remove('cur-pen-close', 'cur-pen-extend', 'cur-snap');
            if (vSession.cursor && vSession.cursor !== 'cur-pen') {
              pageContainer.classList.add(vSession.cursor);
            }
          }

          const targetPageIndex = (drawingPageIndexRef.current !== null && drawingPageIndexRef.current !== undefined)
            ? drawingPageIndexRef.current
            : pageIndex;
          renderVectraOverlay(targetPageIndex, parentEl, vSession);
        }
      }
      suppressClickRef.current = true;
      return;
    }

    // ── Shapes Drawing Update ────────────────────────────────────────────────
    if (drawingShapeRef.current) {
      const svg = drawingSvgRef.current;
      const shape = drawingShapeRef.current;
      let pt = getLocalPoint(svg, shape.parentElement || svg, e.clientX, e.clientY);
      const start = shapeStartPointRef.current;

      // Smart guides while drawing (page edges / centre + other elements), cached once per shape.
      // Ctrl/Cmd = no snapping. The Line tool snaps its own end point (angle + guides) below.
      const shapeParentCtm = (shape.parentElement || svg)?.getScreenCTM?.();
      const shapeNoSnap = e.ctrlKey || e.metaKey;
      const isLineTool = selectedShapeTool === 'line';
      if (!shape.__shapeGuideState) {
        shape.__shapeGuideState = { svgElement: svg, svg, element: shape };
        try { initSmartGuides(shape.__shapeGuideState); } catch { /* no guides */ }
      }
      if (pt && start && !isLineTool && !shapeNoSnap && shapeParentCtm && shape.__shapeGuideState.smartGuidesData) {
        const { snappedPoint } = computeResizeSmartGuides({
          resizeState: shape.__shapeGuideState,
          currentPoint: pt,
          parentCTM: shapeParentCtm,
          dir: 'se',
          zoomScale: zoom / 100,
        });
        if (snappedPoint) pt = { x: snappedPoint.x, y: snappedPoint.y };
      }

      if (pt && start) {
        const dx = pt.x - start.x;
        const dy = pt.y - start.y;

        // Shared bounding box starting from mouse-down point (start) to current cursor (pt)
        let boxW = Math.abs(dx);
        let boxH = Math.abs(dy);
        if (e.shiftKey) {
          const maxDim = Math.max(boxW, boxH);
          boxW = maxDim;
          boxH = maxDim;
        }
        const boxX = dx < 0 ? start.x - boxW : start.x;
        const boxY = dy < 0 ? start.y - boxH : start.y;

        const mapUnitVerticesToBox = (unitPts) => {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (const p of unitPts) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          }
          const spanX = maxX - minX || 1;
          const spanY = maxY - minY || 1;
          return unitPts.map((p) => {
            const x = boxX + ((p.x - minX) / spanX) * boxW;
            const y = boxY + ((p.y - minY) / spanY) * boxH;
            return `${x},${y}`;
          });
        };

        switch (selectedShapeTool) {
          case 'rectangle':
          case 'free-frame': {
            shape.setAttribute('x', boxX);
            shape.setAttribute('y', boxY);
            shape.setAttribute('width', boxW);
            shape.setAttribute('height', boxH);
            break;
          }
          case 'circle': {
            shape.setAttribute('cx', boxX + boxW / 2);
            shape.setAttribute('cy', boxY + boxH / 2);
            shape.setAttribute('rx', boxW / 2);
            shape.setAttribute('ry', boxH / 2);
            break;
          }
          case 'line': {
            // Straightness guide: auto-snap near 0°/45°/90°/135° (Shift = always snap to 45° steps,
            // Ctrl/Cmd = free angle) + orange guide when perfectly straight + live angle badge.
            const parentCtm = (shape.parentElement || svg).getScreenCTM?.();
            const noSnap = e.ctrlKey || e.metaKey;
            const angleSnap = snapLineEnd(start, pt, parentCtm, { shiftKey: e.shiftKey, disableSnap: noSnap });
            const { snapped } = angleSnap;
            let { end, angle } = angleSnap;

            // Smart guides on the end point (page edges / centre + other elements), like resizing.
            // Horizontal line → snap x only, vertical → y only (keeps it perfectly straight),
            // 45° → keep the exact angle, free angle → both axes.
            const guideState = shape.__shapeGuideState;
            const axisOnly = snapped ? (angle % 180 === 0 ? 'x' : (angle % 180 === 90 ? 'y' : 'none')) : 'both';
            if (!noSnap && axisOnly !== 'none' && parentCtm && guideState.smartGuidesData) {
              const { snappedPoint } = computeResizeSmartGuides({
                resizeState: guideState,
                currentPoint: end,
                parentCTM: parentCtm,
                dir: axisOnly === 'x' ? 'e' : (axisOnly === 'y' ? 's' : 'se'),
                zoomScale: zoom / 100,
              });
              if (snappedPoint) end = { x: snappedPoint.x, y: snappedPoint.y };
              if (!snapped) angle = snapLineEnd(start, end, parentCtm, { disableSnap: true }).angle;
            }
            shape.setAttribute('x2', end.x);
            shape.setAttribute('y2', end.y);

            // Magenta smart-guide lines for the end point (badge = the angle badge below)
            if (guideState.smartGuidesData && !noSnap) {
              try {
                const svgInv = svg.getScreenCTM()?.inverse();
                const endSvg = (parentCtm && svgInv)
                  ? new DOMPoint(end.x, end.y).matrixTransform(svgInv.multiply(parentCtm))
                  : { x: end.x, y: end.y };
                const pointBox = { left: endSvg.x, right: endSvg.x, top: endSvg.y, bottom: endSvg.y, width: 0, height: 0, centerX: endSvg.x, centerY: endSvg.y };
                const { guides } = collectResizeGuideLines({ resizeState: guideState, currentBox: pointBox, dir: 'se' });
                renderSmartGuides(drawingPageIndexRef.current ?? activePageIndex, guides, null, zoom / 100, svg);
              } catch { /* ignore */ }
            } else {
              clearSmartGuides();
            }
            if (parentCtm && shape.tagName?.toLowerCase() === 'line') {
              const toClient = (p) => ({
                x: parentCtm.a * p.x + parentCtm.c * p.y + parentCtm.e,
                y: parentCtm.b * p.x + parentCtm.d * p.y + parentCtm.f,
              });
              showLineAngleGuide({
                startClient: toClient(start),
                endClient: toClient(end),
                snapped,
                angle,
                cursor: { x: e.clientX, y: e.clientY },
              });
            }
            break;
          }
          case 'polygon': {
            const sides = parseInt(shape.getAttribute('data-count') || 3);
            const unitPts = [];
            for (let i = 0; i < sides; i++) {
              const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
              unitPts.push({ x: Math.cos(angle), y: Math.sin(angle) });
            }
            const points = mapUnitVerticesToBox(unitPts);
            shape.setAttribute('d', `M ${points.join(' L ')} Z`);
            shape.setAttribute('data-rx', boxW / 2);
            shape.setAttribute('data-ry', boxH / 2);
            shape.setAttribute('data-cx', boxX + boxW / 2);
            shape.setAttribute('data-cy', boxY + boxH / 2);
            break;
          }
          case 'star': {
            const ratio = parseFloat(shape.getAttribute('data-ratio') || 40) / 100;
            const count = parseInt(shape.getAttribute('data-count') || 5);
            const sides = count * 2;
            const unitPts = [];
            for (let i = 0; i < sides; i++) {
              const r = (i % 2 === 0) ? 1 : ratio;
              const angle = (Math.PI / count) * i - Math.PI / 2;
              unitPts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
            }
            const points = mapUnitVerticesToBox(unitPts);
            shape.setAttribute('d', `M ${points.join(' L ')} Z`);
            shape.setAttribute('data-rx', boxW / 2);
            shape.setAttribute('data-ry', boxH / 2);
            shape.setAttribute('data-cx', boxX + boxW / 2);
            shape.setAttribute('data-cy', boxY + boxH / 2);
            break;
          }
        }

        // Smart-guide lines + W × H badge for the shape being drawn (the line has its own guides)
        if (!isLineTool) {
          if (!shapeNoSnap && shape.__shapeGuideState?.smartGuidesData) {
            try {
              const currentBox = getBoxInSvg(shape, svg);
              const dir = `${dy < 0 ? 'n' : 's'}${dx < 0 ? 'w' : 'e'}`;
              const { guides, badge } = collectResizeGuideLines({ resizeState: shape.__shapeGuideState, currentBox, dir });
              if (badge && currentBox) {
                // badge under the moving corner
                badge.x = dx < 0 ? currentBox.left : currentBox.right;
                badge.y = dy < 0 ? currentBox.top : currentBox.bottom;
              }
              renderSmartGuides(drawingPageIndexRef.current ?? activePageIndex, guides, badge, zoom / 100, svg);
            } catch { /* ignore */ }
          } else {
            clearSmartGuides();
          }
        }

        if (typeof drawOverlayHighlight === 'function') {
          drawOverlayHighlight(shape, 'selected');
        }
        suppressClickRef.current = true;
      }
      return;
    }

    const isPenToolActive = activeMainTool === 'pen';
    const isShapes = activeMainTool === 'shapes';
    const isSelectionTool = ['select', 'upload'].includes(activeMainTool);
    const allowSelection = isSelectionTool || ((isPenToolActive || isShapes) && pageIndex !== activePageIndex);

    if (!allowSelection) return;
    if (document.querySelector('[data-dragging="true"]')) return;

    // ── MARQUEE UPDATE ──
    const isModuleWithoutMarquee = activeTopTool === 'interaction' || activeTopTool === 'animation' || activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';
    if ((e.buttons & 1) === 0 && (marqueeRef.current || marqueeDataRef.current)) {
      cleanupMarquee();
      return;
    }
    if (marqueeDataRef.current && marqueeDataRef.current.containerRect && !isConvertedFlipbook && !isModuleWithoutMarquee) {
      const { startX, startY, containerRect, scale } = marqueeDataRef.current;
      const curX = (e.clientX - containerRect.left) / scale;
      const curY = (e.clientY - containerRect.top) / scale;

      if (!marqueeDataRef.current.hasDragged) {
        const dx = curX - startX;
        const dy = curY - startY;
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
          return;
        }
        marqueeDataRef.current.hasDragged = true;
        // Keep the scaled SVG overlay hidden; the crisp screen-space box is used instead
        if (marqueeOverlayRef1.current) {
          marqueeOverlayRef1.current.style.display = 'none';
        }
      }

      const x = Math.min(curX, startX);
      const y = Math.min(curY, startY);
      const width = Math.abs(curX - startX);
      const height = Math.abs(curY - startY);

      // Direct DOM update for marquee box in unscaled screen space (pixel-snapped, crisp 1px border)
      const { startClientX, startClientY } = marqueeDataRef.current;
      const sx = startClientX ?? (containerRect.left + startX * scale);
      const sy = startClientY ?? (containerRect.top + startY * scale);
      updateScreenMarqueeBox(sx, sy, e.clientX, e.clientY);

      updateMarqueeSelection(sx, sy, e.clientX, e.clientY);
      return;
    }

    const container = (e.currentTarget && typeof e.currentTarget.querySelector === 'function')
      ? e.currentTarget
      : (document.getElementById(`canvas-content-${pageIndex}`) || document.querySelector(`[data-page-index="${pageIndex}"]`));
    const svg = container?.querySelector('svg');
    if (!svg) return;

    // Fast-path: do not process canvas hover states while user is actively typing or editing text
    if (isEditingTextRef.current || editCacheManager.isEditing()) {
      // A text edit that ended without its cleanup (element re-rendered / removed, focus lost another
      // way) leaves these flags on and silently kills ALL hover boxes in Edit mode. Only a live,
      // still-editing text element keeps hover suppressed; otherwise end the stale session.
      const editTarget = editCacheManager.getActiveTarget?.() ||
        document.querySelector('.page-svg-container [data-editing="true"]');
      const stillEditing = !!(editTarget && editTarget.isConnected && editTarget.getAttribute?.('data-editing') === 'true');
      if (stillEditing) {
        if (e.target && e.target !== svg && e.target.closest?.('[id]') && e.target.closest('[id]') !== svg) {
          hoverDbg('NOT drawn: a text box is still in edit mode →', editTarget.id, '(click outside the text to finish editing)');
        }
        return;
      }
      hoverDbg('ending stale text-edit session');
      isEditingTextRef.current = false;
      try { editCacheManager.endSession(null); } catch { /* noop */ }
    }

    // Converted Flipbook Mode (PDF, DOC, PPT): Only hover user-added Frames or Hotspots
    if (isConvertedFlipbook) {
      let hoverTarget = null;
      let curr = e.target;
      const isInteractiveTool = activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';
      while (curr && curr !== svg) {
        if (curr.getAttribute) {
          const isHotspot = curr.getAttribute('data-is-hotspot') === 'true' || curr.getAttribute('data-type') === 'hotspot';
          const isFreeFrame = (curr.getAttribute('data-name') === 'Free Frame' || curr.getAttribute('data-type') === 'free-frame' || curr.id?.startsWith('free-frame')) && isInteractiveTool;
          const isShape = curr.getAttribute('data-type') === 'shape' && curr.getAttribute('data-name') !== 'Free Frame' && curr.getAttribute('data-type') !== 'free-frame' && !curr.id?.startsWith('free-frame');
          const isIcon = curr.getAttribute('data-type') === 'icon';
          const isShield = curr.getAttribute('data-name') === 'Document Shield' || curr.getAttribute('data-type') === 'shield';
          if (isShield) {
            hoverTarget = null;
            break;
          }
          if (isHotspot || isFreeFrame || isShape || isIcon) {
            hoverTarget = curr;
            break;
          }
        }
        curr = curr.parentElement || curr.parentNode;
      }

      // Any other element the user added on top of the converted page (text, image, QR, map, embed,
      // button, shape…): hover what a click selects — same box as hovering it in the Layers panel.
      // The PDF page itself (background / vector layer / shield / overlay / page frame) never hovers.
      if (!hoverTarget) {
        const isPdfBase = (node) => !!node?.closest?.(
          '[data-name="PDF Background"], [data-type="pdf-vector-layer"], [data-name="Document Shield"], [data-type="shield"], [data-name="Overlay"], [data-type="background"]'
        );
        const clickTarget = getDraggableElement(e.target, svg);
        if (
          clickTarget && clickTarget !== svg && clickTarget.id &&
          !isPdfBase(e.target) && !isPdfBase(clickTarget) &&
          clickTarget.getAttribute('data-type') !== 'frame' &&
          clickTarget.getAttribute('data-locked') !== 'true' &&
          clickTarget.getAttribute('data-hidden') !== 'true' &&
          !isPageRootElement(clickTarget, svg)
        ) {
          hoverTarget = clickTarget;
        }
      }

      const hId = hoverTarget?.id || null;
      if (hId === lastHoveredIdRef.current) return;
      if (setHover(hoverTarget, 'hover')) hoverDbg('DRAWN hover box →', hId);
      else if (!hId) clearHover();
      return;
    }

    // Direct selection mode: hover the deepest element with an ID
    if (selectedSelectTool === 'direct') {
      const target = getDraggableElement(e.target, svg);
      const targetId = (target && target.id && target.tagName.toLowerCase() !== 'svg') ? target.id : null;
      if (targetId === lastHoveredIdRef.current) return;
      if (targetId) setHover(target, 'child-hover');
      else clearHover();
      return;
    }

    // Normal Mode: Direct O(1) Target Resolution (avoids forced synchronous reflows across hundreds of template elements)
    // The page container behind the SVG (e.g. "canvas-content-0") is hit through empty gaps — inside a
    // group's outline too — so it counts as empty page and goes through the group-gap lookup.
    const isBackground = !e.target || e.target === svg || !svg.contains(e.target) ||
      e.target.getAttribute?.('data-name') === 'Overlay' ||
      e.target.getAttribute?.('data-type') === 'background' ||
      e.target.getAttribute?.('data-type') === 'shield' ||
      (e.target.id && e.target.id.includes('overlay-poly-'));

    if (isBackground && !findGroupAtPoint(svg, e.clientX, e.clientY, selectedLayerIdRef.current)) {
      if (lastHoveredIdRef.current) clearHover();
      return;
    }

    const effectiveFrameId = currentFrameIdRef.current;
    let candidate = null;
    let isChild = false;

    if (effectiveFrameId) {
      const frameEl = svg.querySelector(`[id="${effectiveFrameId}"]`);
      if (frameEl && frameEl.contains(e.target) && e.target !== frameEl) {
        // Outline exactly what a click here selects (handleSvgClick → getDraggableElement), so the
        // hover box and the selection box are the same box
        const clickTarget = getDraggableElement(e.target, svg);
        if (clickTarget && clickTarget !== frameEl && clickTarget.id && frameEl.contains(clickTarget) &&
            clickTarget.getAttribute('data-name') !== 'Overlay' && clickTarget.getAttribute('data-locked') !== 'true' &&
            !getDirectChildFrames(frameEl).some(f => f.contains(clickTarget))) {
          candidate = clickTarget;
          isChild = true;
        }
      }
      if (!candidate && frameEl && frameEl.contains(e.target) && e.target !== frameEl) {
        let curr = e.target;
        while (curr && curr.parentElement && curr.parentElement !== frameEl) {
          curr = curr.parentElement;
        }
        if (curr && curr.parentElement === frameEl && curr.id && curr.getAttribute('data-name') !== 'Overlay' && curr.getAttribute('data-locked') !== 'true') {
          candidate = curr;
          isChild = true;
        }
      }
    }

    if (!candidate) {
      let curr = e.target;
      while (curr && curr.parentElement && curr.parentElement !== svg) {
        curr = curr.parentElement;
      }
      if (curr && curr.parentElement === svg && curr.id && curr.getAttribute('data-name') !== 'Overlay' && curr.getAttribute('data-locked') !== 'true' && curr.tagName.toLowerCase() !== 'style' && curr.tagName.toLowerCase() !== 'defs') {
        candidate = curr;
        isChild = false;
      }
    }

    // Hovering the empty gap inside a group (or the page frame behind it) -> hover the group
    if (!candidate || isBackground || isPageRootElement(candidate, svg) || candidate.getAttribute('data-type') === 'frame' ||
        candidate.getAttribute('data-type') === 'background' || candidate.id === effectiveFrameId) {
      const gapGroup = findGroupAtPoint(svg, e.clientX, e.clientY, selectedLayerIdRef.current);
      if (gapGroup) {
        candidate = gapGroup;
        isChild = Boolean(effectiveFrameId && svg.querySelector(`[id="${effectiveFrameId}"]`)?.contains(gapGroup));
      }
    }

    // Group-first hover: show the group's outline until you're working inside it
    if (candidate && e.target && !(e.target.id && e.target.id.includes('overlay-poly-'))) {
      // Same leaf + same resolver as handleSvgClick → hover box === the box a click selects
      const leaf = getDraggableElement(e.target, svg) || e.target;
      const groupAware = resolveGroupTarget(leaf, svg, selectedLayerIdRef.current);
      if (groupAware && groupAware.id) {
        candidate = groupAware;
        isChild = Boolean(effectiveFrameId && svg.querySelector(`[id="${effectiveFrameId}"]`)?.contains(groupAware));
      }
    }

    const candidateId = candidate ? candidate.id : null;
    // Same element under cursor - NO work needed!
    if (candidateId === lastHoveredIdRef.current) return;

    if (!candidate || !candidateId) {
      clearHover();
      const contentEl = e.target?.closest?.('[id]');
      if (contentEl && contentEl !== svg) hoverDbg('NOT drawn: no hoverable element found for →', contentEl.id);
      return;
    }

    if (setHover(candidate, isChild ? 'child-hover' : 'hover')) {
      hoverDbg('DRAWN hover box →', candidateId, isChild ? '(child-hover)' : '(hover)');
    } else {
      hoverDbg('skip: element already selected →', candidateId);
    }
  };

  // ── MARQUEE SELECTION LOGIC (Screen-Space Intersection) ──
  const updateMarqueeSelection = (startX, startY, currentX, currentY) => {
    const minX = Math.min(startX, currentX);
    const maxX = Math.max(startX, currentX);
    const minY = Math.min(startY, currentY);
    const maxY = Math.max(startY, currentY);

    const newSelectedIds = new Set();

    (marqueeCandidatesRef.current || []).forEach(item => {
      const { id, rect: elRect } = item;
      if (!elRect || (elRect.width === 0 && elRect.height === 0)) return;

      const intersects = !(
        minX > elRect.right ||
        maxX < elRect.left ||
        minY > elRect.bottom ||
        maxY < elRect.top
      );

      if (intersects) {
        newSelectedIds.add(id);
      }
    });

    // Avoid state updates if selection is identical
    if (!setsAreEqual(newSelectedIds, multiSelectedIdsRef.current)) {
      multiSelectedIdsRef.current = newSelectedIds;
      setMultiSelectedIds(newSelectedIds);
      const primary = Array.from(newSelectedIds)[newSelectedIds.size - 1];
      selectedLayerIdRef.current = primary || null;
      setSelectedLayerId(primary || null);
    }
  };

  // ── FIGMA-STYLE GLOBAL MOUSE UP (Handles end of marquee) ─────────────────────
  // ── FIGMA-STYLE GLOBAL MOUSE UP (Handles end of marquee or tool drawing) ────────────────
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      window.__isCanvasPointerDown = false;
      // ── Node Edit Mode: Finalize node drag ──
      if (nodeEditDragRef.current) {
        const { pathEl, pageIndex: nePageIndex } = nodeEditDragRef.current;
        nodeEditDragRef.current = null;
        if (pathEl && pathEl.ownerSVGElement && updatePageHtml) {
          saveModifiedPageHtml(nePageIndex, pathEl.ownerSVGElement);
        }
        setTimeout(() => { suppressClickRef.current = false; }, 50);
        return;
      }

      // ── Bending/Handle Dragging Finalization ──
      const activeState = (bendingStateRef.current || handleDraggingStateRef.current);
      if (activeState) {
        const { pathEl, paperPath, curveIndex, pageIndex } = activeState;
        const svgEl = pathEl.ownerSVGElement;
        if (svgEl && updatePageHtml) {
          saveModifiedPageHtml(pageIndex, svgEl);
        }
        activeBendingSegmentRef.current = { pathEl, paperPath, curveIndex, pageIndex };
        bendingStateRef.current = null;
        handleDraggingStateRef.current = null;
        return;
      }

      const currentPenTool = selectedPenToolRef?.current || selectedPenTool || 'pen';
      if (activeMainTool === 'pen' && currentPenTool === 'pen') {
        const vSession = vectraPenSessionRef.current;
        vSession.onUp();
        if (drawingPathRef.current) {
          const comboD = pathToDCombo(vSession.paths);
          if (comboD) drawingPathRef.current.setAttribute('d', comboD);
          if (drawingPathRef.current.parentElement) {
            const targetPageIndex = (drawingPageIndexRef.current !== null && drawingPageIndexRef.current !== undefined)
              ? drawingPageIndexRef.current
              : activePageIndex;
            renderVectraOverlay(targetPageIndex, drawingPathRef.current.parentElement, vSession);
          }
          window.dispatchEvent(new CustomEvent('editor-content-changed'));
        }
      }

      // Termination for drag-based pen tools (Pencil)
      if (drawingPathRef.current) {
        const points = drawingPointsRef.current;
        const tool = selectedPenToolRef?.current || selectedPenTool;

        draggedNodeIndexRef.current = { pIdx: -1, ptIdx: -1 };

        if (tool === 'pencil') {
          const path = drawingPathRef.current;
          const pageIdx = drawingPageIndexRef.current;
          const svgEl = path?.ownerSVGElement;

          if (points.length <= 1 && path) {
            const pt = points[0] || { x: 0, y: 0 };
            path.setAttribute('d', `M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)} L ${(pt.x + 0.1).toFixed(2)} ${pt.y.toFixed(2)}`);
          } else if (points.length > 1 && path) {
            const simplified = points.filter((_, i) => i % 2 === 0 || i === points.length - 1);
            const ptsToUse = simplified.length > 2 ? simplified : points;
            const pathData = formatSmoothPathD(ptsToUse);
            path.setAttribute('d', pathData);
          }
          path?.setAttribute('shape-rendering', 'geometricPrecision');

          if (svgEl && updatePageHtml) {
            updatePageHtml(pageIdx, svgEl.outerHTML);
            if (path && path.id) {
              window.dispatchEvent(new CustomEvent('expand-layer-parent', { detail: { id: path.id } }));

              // Auto-select newly created path
              if (setSelectedLayerId) {
                setSelectedLayerId(path.id);
                selectedLayerIdRef.current = path.id;
              }
              if (setMultiSelectedIds) {
                setMultiSelectedIds(new Set([path.id]));
                multiSelectedIdsRef.current = new Set([path.id]);
              }
              if (path) drawOverlayHighlight(path, 'selected');
            }
          }

          // Switch back to selection tool
          skipClearSelectionRef.current = true;
          setTimeout(() => {
            if (setActiveMainTool) setActiveMainTool('select');
            suppressClickRef.current = false;
          }, 100);

          drawingPathRef.current = null;
          drawingPointsRef.current = [];
          drawingPageIndexRef.current = null;
          drawingSvgRef.current = null;
          isFreehandDrawingRef.current = false;
          clearPenToolNodes(pageIdx);
        }

        return;
      }

      // Termination for Shape tools
      if (drawingShapeRef.current) {
        clearLineAngleGuide();
        clearSmartGuides();
        delete drawingShapeRef.current.__shapeGuideState;
        const shape = drawingShapeRef.current;
        const pageIdx = drawingPageIndexRef.current;
        const svgEl = shape?.ownerSVGElement;

        if (shape.getAttribute('data-name') === 'Free Frame') {
          shape.removeAttribute('data-drawing');
          shape.removeAttribute('stroke-dasharray');
        }

        const start = shapeStartPointRef.current;
        if (start && svgEl && e) {
          const pt = getLocalPoint(svgEl, shape.parentElement || svgEl, e.clientX, e.clientY);
          if (pt && Math.hypot(pt.x - start.x, pt.y - start.y) < 2) {
            const type = shape.getAttribute('data-shape-type') || shape.tagName.toLowerCase();

            if (type === 'rect' || type === 'free-frame' || shape.tagName.toLowerCase() === 'rect') {
              shape.setAttribute('x', start.x - 15);
              shape.setAttribute('y', start.y - 15);
              shape.setAttribute('width', 30);
              shape.setAttribute('height', 30);
            } else if (type === 'circle' || type === 'ellipse' || shape.tagName.toLowerCase() === 'ellipse') {
              shape.setAttribute('cx', start.x);
              shape.setAttribute('cy', start.y);
              shape.setAttribute('rx', 15);
              shape.setAttribute('ry', 15);
            } else if (type === 'line' || shape.tagName.toLowerCase() === 'line') {
              shape.setAttribute('x1', start.x - 15);
              shape.setAttribute('y1', start.y - 15);
              shape.setAttribute('x2', start.x + 15);
              shape.setAttribute('y2', start.y + 15);
            } else if (type === 'polygon' || type === 'star') {
              const radius = 15;
              const isStar = type === 'star';
              const count = isStar ? parseInt(shape.getAttribute('data-count') || 5) : parseInt(shape.getAttribute('data-count') || 3);
              const sides = isStar ? count * 2 : count;
              const points = [];
              for (let i = 0; i < sides; i++) {
                let r = radius;
                if (isStar && i % 2 !== 0) {
                  const ratio = parseFloat(shape.getAttribute('data-ratio') || 40) / 100;
                  r = radius * ratio;
                }
                const angle = (isStar ? (Math.PI / count) : (2 * Math.PI / count)) * i - Math.PI / 2;
                points.push(`${start.x + r * Math.cos(angle)},${start.y + r * Math.sin(angle)}`);
              }
              shape.setAttribute('d', `M ${points.join(' L ')} Z`);
              shape.setAttribute('data-rx', radius);
              shape.setAttribute('data-ry', radius);
              shape.setAttribute('data-cx', start.x);
              shape.setAttribute('data-cy', start.y);
            }
          }
        }

        // Store original aspect ratio
        try {
          if (shape && typeof shape.getBBox === 'function') {
            const bbox = shape.getBBox();
            if (bbox.width > 0 && bbox.height > 0) {
              shape.setAttribute('data-original-aspect-ratio', (bbox.width / bbox.height).toString());
            } else {
              shape.setAttribute('data-original-aspect-ratio', '1');
            }
          }
        } catch {
          // ignore error if getBBox fails
        }

        drawingShapeRef.current = null;
        shapeStartPointRef.current = null;
        drawingPageIndexRef.current = null;
        drawingSvgRef.current = null;

        if (svgEl && updatePageHtml) {
          updatePageHtml(pageIdx, svgEl.outerHTML);
          if (shape && shape.id) {
            window.dispatchEvent(new CustomEvent('expand-layer-parent', { detail: { id: shape.id } }));
            if (setSelectedLayerId) {
              setSelectedLayerId(shape.id);
              selectedLayerIdRef.current = shape.id;
            }
            if (setMultiSelectedIds) {
              setMultiSelectedIds(new Set([shape.id]));
              multiSelectedIdsRef.current = new Set([shape.id]);
            }
          }
          skipClearSelectionRef.current = true;
          setTimeout(() => {
            if (setActiveMainTool) setActiveMainTool('select');
            suppressClickRef.current = false;
          }, 100);
        } else {
          setTimeout(() => {
            suppressClickRef.current = false;
          }, 100);
        }
        return;
      }

      // Termination for Marquee Selection
      if (marqueeDataRef.current || marqueeRef.current) {
        cleanupMarquee();
      }
    };

    const handleGlobalMouseMove = (e) => {
      const isDrawingOrDragging = Boolean(
        marqueeDataRef.current ||
        drawingShapeRef.current ||
        isFreehandDrawingRef.current ||
        drawingPathRef.current ||
        nodeEditDragRef.current
      );
      if (isDrawingOrDragging && (e.buttons & 1) !== 0) {
        handleSvgMouseMove(activePageIndex, e);
      } else if (marqueeDataRef.current && (e.buttons & 1) === 0) {
        cleanupMarquee();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('pointerup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('pointerup', handleGlobalMouseUp);
    };
  }, [selectedPenTool, activeMainTool, updatePageHtml, setActiveMainTool, setSelectedLayerId]);

  // ── Wheel-to-zoom on masked shape while in node edit mode ──────────────────
  useEffect(() => {
    const handleShapeMaskWheel = (e) => {
      const isStandalone = Boolean(shapeImageAdjustTargetRef.current);
      if (!nodeEditModeRef.current && !isStandalone) return;
      const rawEl = isStandalone ? shapeImageAdjustTargetRef.current : nodeEditPathRef.current;
      const pathEl = (rawEl?.id ? document.getElementById(rawEl.id) : null) || rawEl;
      if (!pathEl) return;
      const hasImageMask = Boolean(
        pathEl.getAttribute?.('data-mask-enabled') === 'true' ||
        pathEl.getAttribute?.('data-masked-image-url') ||
        pathEl.closest?.('[data-mask-enabled="true"]') !== null ||
        (pathEl.getAttribute?.('fill') && pathEl.getAttribute?.('fill').includes('url(#pattern')) ||
        pathEl.closest?.('[fill*="url(#pattern"]') !== null
      );
      if (!hasImageMask || !hasCustomImageInShape(pathEl)) return;

      const rect = pathEl.getBoundingClientRect();
      const ghostRect = window.__shapeImageAdjustGhostRect;
      const isOverShape = (
        e.clientX >= (rect.left - 20) && e.clientX <= (rect.right + 20) &&
        e.clientY >= (rect.top - 20) && e.clientY <= (rect.bottom + 20)
      );
      const isOverGhost = Boolean(ghostRect && (
        e.clientX >= (ghostRect.left - 20) && e.clientX <= (ghostRect.right + 20) &&
        e.clientY >= (ghostRect.top - 20) && e.clientY <= (ghostRect.bottom + 20)
      ));
      if (!isOverShape && !isOverGhost) return;

      // Only zoom image when image adjust mode is active
      const isAdjustActive = isStandalone || Boolean(pathEl.getAttribute('data-image-adjust-active') === 'true' || nodeEditImageAdjustRef?.current === true);
      if (!isAdjustActive) return;

      e.preventDefault();
      e.stopPropagation();

      const currentZoom = parseFloat(pathEl.getAttribute('data-slot-zoom') || '1');
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      const newZoom = Math.round(Math.min(Math.max(0.5, currentZoom + delta), 5.0) * 100) / 100;

      updateShapeMaskTransform({
        selectedElement: pathEl,
        zoom: newZoom,
        onSync: () => {
          if (pathEl.ownerSVGElement && saveModifiedPageHtml) {
            const pIdx = nodeEditPageIndexRef.current !== null ? nodeEditPageIndexRef.current : activePageIndex;
            saveModifiedPageHtml(pIdx, pathEl.ownerSVGElement);
          }
        }
      });
      if (isStandalone) {
        const pIdx = shapeImageAdjustPageIndexRef.current !== null ? shapeImageAdjustPageIndexRef.current : activePageIndex;
        drawShapeImageAdjustOverlay(pathEl, pIdx, zoom);
      } else if (typeof drawNodeEditOverlay === 'function' && nodeEditPaperPathRef?.current) {
        drawNodeEditOverlay(pathEl, nodeEditPaperPathRef.current, nodeEditPageIndexRef?.current !== null ? nodeEditPageIndexRef.current : activePageIndex);
      }
    };

    window.addEventListener('wheel', handleShapeMaskWheel, { passive: false, capture: true });
    window.addEventListener('trigger-exit-shape-adjust', exitShapeImageAdjust);
    return () => {
      window.removeEventListener('wheel', handleShapeMaskWheel, { capture: true });
      window.removeEventListener('trigger-exit-shape-adjust', exitShapeImageAdjust);
    };
  }, [activePageIndex, saveModifiedPageHtml, zoom, exitShapeImageAdjust]);

  useEffect(() => {
    window.__startShapeImageAdjust = startShapeImageAdjust;
    window.__exitShapeImageAdjust = exitShapeImageAdjust;
    return () => {
      window.__startShapeImageAdjust = null;
      window.__exitShapeImageAdjust = null;
    };
  }, [startShapeImageAdjust, exitShapeImageAdjust]);

  useEffect(() => {
    const handleTriggerImageAdjust = (e) => {
      if (e?.detail?.targetEl) {
        startShapeImageAdjust(e.detail.targetEl, e.detail.pageIndex ?? activePageIndex);
        return;
      }
      const layerId = e?.detail?.layerId;
      if (!layerId) return;
      const svg = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"] svg`) || document.querySelector('svg');
      let targetPath = svg?.querySelector(`[id="${CSS.escape(layerId)}"]`) || document.getElementById(layerId);
      if (!targetPath) return;

      const slotId = e?.detail?.slotId;
      if (slotId && targetPath) {
        const slotEl = targetPath.querySelector(`[data-pattern-id="${slotId}"], [fill*="${slotId}"]`);
        if (slotEl) targetPath = slotEl;
      }

      const isFlattened = Boolean(
        targetPath.getAttribute('data-flattened') === 'true' ||
        targetPath.closest?.('[data-flattened="true"]')
      );
      if (!isFlattened) {
        startShapeImageAdjust(targetPath, activePageIndex);
        return;
      }

      const validPath = targetPath.tagName?.toLowerCase() === 'path' ? targetPath : (targetPath.querySelector?.('path') || targetPath);
      if (!nodeEditModeRef.current || nodeEditPathRef.current !== validPath) {
        if (typeof enterNodeEditMode === 'function') {
          enterNodeEditMode(validPath, activePageIndex);
        }
      }
      if (nodeEditImageAdjustRef) nodeEditImageAdjustRef.current = true;
      validPath.setAttribute('data-image-adjust-active', 'true');
      if (nodeEditPaperPathRef.current && typeof drawNodeEditOverlay === 'function') {
        drawNodeEditOverlay(validPath, nodeEditPaperPathRef.current, activePageIndex);
      }
    };

    window.addEventListener('trigger-image-adjust', handleTriggerImageAdjust);
    return () => window.removeEventListener('trigger-image-adjust', handleTriggerImageAdjust);
  }, [activePageIndex, enterNodeEditMode, drawNodeEditOverlay, startShapeImageAdjust]);

  // ── HOVER SYNC FROM LAYERS PANEL ─────────────────────────────────────────────
  useEffect(() => {
    const handleLayerHover = (e) => {
      const { layerId, isHovered, pageIndex } = e.detail || {};

      clearHover();

      if (!isHovered || !layerId) return;

      // If already selected, do not draw hover box (selection box is already visible)
      if (selectedLayerIdRef.current === layerId || multiSelectedIdsRef.current?.has(layerId)) {
        return;
      }

      const targetPageIndex = typeof pageIndex === 'number' ? pageIndex : activePageIndex;
      const targetContainer = document.querySelector(`.page-svg-container[data-page-index="${targetPageIndex}"]`)
                           || document.getElementById('main-flipbook-editor')?.contentDocument?.querySelector(`.page-svg-container[data-page-index="${targetPageIndex}"]`)
                           || document.querySelector('.page-svg-container');

      if (!targetContainer) return;

      const targetEl = targetContainer.querySelector(`[id="${CSS.escape(layerId)}"]`)
                    || targetContainer.querySelector(`[data-name="${CSS.escape(layerId)}"]`)
                    || document.getElementById(layerId);

      if (!targetEl) return;

      // Skip base background / locked / overlay elements
      const isBackgroundOrOverlay = targetEl.getAttribute('data-name') === 'Overlay' ||
        targetEl.getAttribute('data-type') === 'background' ||
        targetEl.getAttribute('data-type') === 'shield' ||
        targetEl.getAttribute('data-locked') === 'true';

      if (isBackgroundOrOverlay) return;

      if (!targetEl.id) targetEl.id = layerId;
      setHover(targetEl, 'hover');
    };

    window.addEventListener('layer-hover', handleLayerHover);
    return () => {
      window.removeEventListener('layer-hover', handleLayerHover);
    };
  }, [activePageIndex, drawOverlayHighlight]);

  // ── FIGMA-STYLE MOUSE LEAVE: clear all hovers ─────────────────────────────────
  const handleSvgMouseLeave = (e) => {
    if ((e.buttons & 1) === 0 && (marqueeDataRef.current || marqueeRef.current)) {
      cleanupMarquee();
    }
    clearHover();
  };


  // ── Helper: set single selection and clear multi-selection ───────────────────
  const setSingleSelection = (id) => {
    let resolvedId = id;
    if (resolvedId) {
      const el = document.getElementById(resolvedId);
      const isInternalTextOfTypography = el && ['text', 'tspan', 'foreignobject'].includes(el.tagName?.toLowerCase());
      if (!isInternalTextOfTypography) {
        const typographyParent = el?.closest?.('[data-typography-type="motion-graphic"], [data-subtopic="Titles"], [data-motion-template]');
        if (typographyParent && typographyParent.id) {
          resolvedId = typographyParent.id;
        }
      }
      const shapeParent = el?.closest?.('[data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"]');
      if (shapeParent && shapeParent.id && !shapeParent.closest?.('[data-type="audio-frame"], g[id^="audio-"]')) {
        resolvedId = shapeParent.id;
      }
      const buttonParent = el?.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]');
      if (buttonParent && buttonParent.id) {
        resolvedId = buttonParent.id;
      }
      const audioParent = el?.closest?.('[data-type="audio-frame"], g[id^="audio-"]');
      if (audioParent && audioParent.id) {
        resolvedId = audioParent.id;
      }
      const tableParent = el?.closest?.('[data-type="table-frame"], [data-type="table"], g[id^="table-"]');
      if (tableParent && tableParent.id) {
        resolvedId = tableParent.id;
      }
      const mediaParent = el?.closest?.('[data-is-image-group="true"], [data-is-video-group="true"], [data-is-gif-group="true"]');
      if (mediaParent && mediaParent.id) {
        resolvedId = mediaParent.id;
      }
      const mapContainer = el?.closest?.('[data-type="map"], g[id^="map-"]');
      if (mapContainer) {
        const rootMap = (mapContainer.tagName?.toLowerCase() === 'g' ? mapContainer : mapContainer.closest('g[id^="map-"], g[data-type="map"]')) || mapContainer;
        if (rootMap && rootMap.id) {
          resolvedId = rootMap.id;
        }
      }
      const qrParent = el?.closest?.('[data-type="qrcode"], g[id^="qrcode-"]');
      if (qrParent && qrParent.id) {
        resolvedId = qrParent.id;
      }
      const embedParent = el?.closest?.('[data-type="embed-frame"], g[id^="embed-"]');
      if (embedParent && embedParent.id) {
        resolvedId = embedParent.id;
      }
      const slideshowParent = el?.closest?.('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]');
      if (slideshowParent && slideshowParent.id) {
        resolvedId = slideshowParent.id;
      }
      const finalEl = document.getElementById(resolvedId) || el;
      const isFreeFrame = finalEl ? (
        finalEl.getAttribute('data-name') === 'Free Frame' ||
        finalEl.getAttribute('data-type') === 'free-frame' ||
        (finalEl.id && finalEl.id.startsWith('free-frame'))
      ) : resolvedId.startsWith('free-frame');
      if (isFreeFrame && activeTopToolRef.current !== 'interaction' && activeTopToolRef.current !== 'animation') {
        return;
      }
      const isAudio = finalEl ? (
        finalEl.getAttribute('data-type') === 'audio-frame' ||
        (finalEl.id && finalEl.id.startsWith('audio-')) ||
        (typeof finalEl.closest === 'function' && !!finalEl.closest('[data-type="audio-frame"], g[id^="audio-"]'))
      ) : resolvedId.startsWith('audio-');
      if (isAudio && activeTopToolRef.current === 'interaction') {
        return;
      }
    }
    id = resolvedId;

    if (setSelectedLayerId) {
      setSelectedLayerId(id);
      selectedLayerIdRef.current = id;
    }

    const safeTargetId = (window.CSS && CSS.escape) ? CSS.escape(id) : id;
    const targetEl = id ? (document.getElementById(id) || document.querySelector(`.page-svg-container [id="${safeTargetId}"]`)) : null;
    const isRoot = isPageRootElement(targetEl, targetEl?.closest?.('svg') || null);

    // Pen/pencil paths drawn before non-scaling strokes: convert once, keeping their current look,
    // so resizing no longer changes the stroke width.
    if (targetEl && targetEl.getAttribute('data-type') === 'vector-path' && !targetEl.getAttribute('vector-effect')) {
      try {
        const sw = parseFloat(targetEl.getAttribute('stroke-width'));
        const m = targetEl.getScreenCTM();
        const k = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 0;
        if (sw > 0 && k > 0) targetEl.setAttribute('stroke-width', String(Math.max(0.5, Math.round(sw * k * 2) / 2)));
        targetEl.setAttribute('vector-effect', 'non-scaling-stroke');
      } catch { /* keep as is */ }
    }

    const newSet = (id && !isRoot) ? new Set([id]) : new Set();
    multiSelectedIdsRef.current = newSet;
    setMultiSelectedIds(newSet);

    if (newSet.size <= 1) {
      document.querySelectorAll('.overlay-type-multi-child-selected').forEach(el => el.remove());
      const mb = document.getElementById('overlay-poly-selected-multi-selection-bounds');
      if (mb) mb.remove();
      const mbOld = document.getElementById('overlay-poly-selected-multi');
      if (mbOld) mbOld.remove();
    }

    const clearAllTableHighlights = (targetTableEl = null) => {
      const tables = targetTableEl ? [targetTableEl] : Array.from(document.querySelectorAll('[data-type="table-frame"], [data-type="table"], g[id^="table-"]'));
      tables.forEach(tParent => {
        tParent.removeAttribute('data-table-selected');
        tParent.removeAttribute('data-table-mode');
        tParent.querySelectorAll('.table-cell-selection-overlay').forEach(n => n.remove());
        const table = tParent.querySelector('table');
        if (table) {
          const normalBorder = tParent.getAttribute('data-border-color') || '#cbd5e1';
          table.querySelectorAll('[data-neighbor-highlighted]').forEach(td => {
            td.removeAttribute('data-neighbor-highlighted');
            td.style.removeProperty('border-top-color');
            td.style.removeProperty('border-bottom-color');
            td.style.removeProperty('border-left-color');
            td.style.removeProperty('border-right-color');
            td.style.borderColor = td.getAttribute('data-cell-border-color') || normalBorder;
          });
          table.querySelectorAll('td[data-cell-selected], th[data-cell-selected], td[contenteditable="true"], th[contenteditable="true"]').forEach(td => {
            td.removeAttribute('data-cell-selected');
            td.removeAttribute('contenteditable');
            td.style.removeProperty('outline');
            td.style.removeProperty('outline-offset');
            td.style.removeProperty('box-shadow');
            td.style.cursor = 'default';
            td.style.userSelect = 'none';
            td.style.borderColor = td.getAttribute('data-cell-border-color') || normalBorder;
          });
          table.style.removeProperty('border-top-color');
          table.style.removeProperty('border-bottom-color');
          table.style.removeProperty('border-left-color');
          table.style.removeProperty('border-right-color');
        }
      });
      window.dispatchEvent(new CustomEvent('clear-table-cell-selection', { detail: { elementId: targetTableEl ? targetTableEl.id : null } }));
    };

    if (id) {
      // Purge selection overlays for other elements across all overlay layers
      document.querySelectorAll('.selection-overlay-layer').forEach(overlay => {
        overlay.querySelectorAll('.overlay-type-selected, .overlay-type-child-selected').forEach(node => {
          if (!node.id.endsWith(`-${id}`)) {
            node.remove();
          }
        });
      });
      // Clear data-table-selected and cell selections for any table that is not the newly selected element
      document.querySelectorAll('[data-type="table-frame"], [data-type="table"], g[id^="table-"]').forEach(tbl => {
        if (tbl.id !== id) {
          clearAllTableHighlights(tbl);
        } else {
          tbl.setAttribute('data-table-selected', 'true');
          if (!tbl.getAttribute('data-table-mode')) {
            tbl.setAttribute('data-table-mode', 'global');
          }
        }
      });
      document.querySelectorAll('[id^="highlight-overlay-html-"]').forEach(htmlOverlay => {
        htmlOverlay.querySelectorAll('.resize-handle, .corner-value-badge, [id^="rotation-degree-badge-"], [id^="rotate-handle-"], [id^="rotate-hotspot-"], [id^="interaction-badge-"]').forEach(node => {
          if (!node.id.includes(id)) {
            node.remove();
          }
        });
      });
      if (targetEl && !isRoot && typeof drawOverlayHighlight === 'function') {
        const highlightType = targetEl.getAttribute('data-child-selected') === 'true' ? 'child-selected' : 'selected';
        drawOverlayHighlight(targetEl, highlightType);
      }
    } else {
      clearOverlayType('selected');
      clearOverlayType('child-selected');
      clearAllTableHighlights();
    }
    clearSmartGuides();
  };


  // ── Modular Hook Call: Inline ForeignObject Text Editor & Spell Checker ──
  const { enterTextEditMode } = useInlineTextEditor({
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
  });

  // ── FIGMA-STYLE CLICK: hierarchical frame drill-down selection ─────────────────
  const handleSvgClick = (e) => {
    clearSmartGuides();
    if (e.target.closest('.resize-handle') || window.__isHoveringTableDivider || window.__isResizingTableDivider) return;

    // Allow native text selection/interaction inside actively edited text boxes
    if (e.target.closest('[contenteditable="true"]')) {
      e.stopPropagation();
      return;
    }

    // Allow native button/navigation clicks on slideshow navigation arrows and pagination
    if (e.target.closest('.swiper-button-prev, .swiper-button-next, .swiper-pagination, .swiper-pagination-bullet, [data-slideshow-nav]')) {
      return;
    }

    e.stopPropagation();
    e.preventDefault(); // Prevent default browser actions (like following <a> links or downloading) on the canvas

    const now = Date.now();
    const timeSinceLast = now - (lastClickRef.current.time || 0);
    const dx = e.clientX - (lastClickRef.current.x || 0);
    const dy = e.clientY - (lastClickRef.current.y || 0);
    const distance = Math.hypot(dx, dy);

    // A double click must happen within 500ms AND the mouse must not have moved more than 10 pixels
    const isDoubleClick = timeSinceLast > 0 && timeSinceLast < 500 && distance < 10;

    lastClickRef.current = { time: now, target: e.target, x: e.clientX, y: e.clientY };

    if (isDoubleClick) {
      if (activeMainTool === 'pen' && (drawingPathRef.current || vectraPenSessionRef.current?.paths?.size > 0)) {
        const vSession = vectraPenSessionRef.current;
        if (vSession) vSession.finishPath();
        commitAndExitPenDrawing();
        if (typeof setActiveMainTool === 'function') {
          setActiveMainTool('select');
        }
        suppressClickRef.current = false;
        return;
      }
      handleSvgDoubleClick(e);
      return;
    }

    // ── Update Active Page on Click ─────────────────────────────────────────
    const container = e.currentTarget.closest('.page-svg-container');
    if (container) {
      const pageIdx = parseInt(container.getAttribute('data-page-index'));
      if (!isNaN(pageIdx) && setActivePageIndex && activePageIndex !== pageIdx) {
        setActivePageIndex(pageIdx);
      }
    }


    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Clear hover states immediately on click to prevent overlapping outlines
    svg.querySelectorAll('[data-hovered="true"]').forEach(el => el.removeAttribute('data-hovered'));
    svg.querySelectorAll('[data-child-hovered="true"]').forEach(el => el.removeAttribute('data-child-hovered'));
    clearOverlayType('hover');
    clearOverlayType('child-hover');

    // ── Converted Flipbook Mode (PDF, DOC, PPT): Avoid clicking any path or full page! Only select Frames or Hotspots ──
    if (isConvertedFlipbook) {
      let interactiveTarget = null;
      const isInteractiveTool = activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';

      // Check if clicking an overlay polygon for a selected element
      if (e.target.tagName?.toLowerCase() === 'polygon' && e.target.id?.includes('overlay-poly-')) {
        const polyId = e.target.id.replace(/^overlay-poly-(selected|child-selected|hover|child-hover|entered|multi-child-selected)-/, '');
        const underEl = svg.querySelector(`[id="${polyId}"]`);
        if (underEl) {
          const isHotspot = underEl.getAttribute('data-is-hotspot') === 'true' || underEl.getAttribute('data-type') === 'hotspot';
          const isFreeFrame = (underEl.getAttribute('data-name') === 'Free Frame' || underEl.getAttribute('data-type') === 'free-frame' || underEl.id?.startsWith('free-frame')) && isInteractiveTool;
          const isShape = underEl.getAttribute('data-type') === 'shape' && underEl.getAttribute('data-name') !== 'Free Frame' && underEl.getAttribute('data-type') !== 'free-frame' && !underEl.id?.startsWith('free-frame');
          const isIcon = underEl.getAttribute('data-type') === 'icon';
          if (isHotspot || isFreeFrame || isShape || isIcon) {
            interactiveTarget = underEl;
          }
        }
      }

      if (!interactiveTarget) {
        let curr = e.target;
        while (curr && curr !== svg) {
          if (curr.getAttribute) {
            const isHotspot = curr.getAttribute('data-is-hotspot') === 'true' || curr.getAttribute('data-type') === 'hotspot';
            const isFreeFrame = (curr.getAttribute('data-name') === 'Free Frame' || curr.getAttribute('data-type') === 'free-frame' || curr.id?.startsWith('free-frame')) && isInteractiveTool;
            const isShape = curr.getAttribute('data-type') === 'shape' && curr.getAttribute('data-name') !== 'Free Frame' && curr.getAttribute('data-type') !== 'free-frame' && !curr.id?.startsWith('free-frame');
            const isIcon = curr.getAttribute('data-type') === 'icon';
            const isShield = curr.getAttribute('data-name') === 'Document Shield' || curr.getAttribute('data-type') === 'shield';
            if (isShield) {
              interactiveTarget = null;
              break;
            }
            if (isHotspot || isFreeFrame || isShape || isIcon) {
              interactiveTarget = curr;
              break;
            }
          }
          curr = curr.parentElement || curr.parentNode;
        }
      }

      if (interactiveTarget && interactiveTarget.id) {
        setSingleSelection(interactiveTarget.id);
      } else {
        // Clear selection: avoid clicking any path or full page!
        setSingleSelection(null);
        setCurrentFrameId(null);
        currentFrameIdRef.current = null;
      }
      return;
    }

    // ── Click on a shape inside a group → select the group first, then its children ──
    if (!e.shiftKey && !e.metaKey && !e.ctrlKey && selectedSelectTool !== 'direct' && !(e.target.id && e.target.id.includes('overlay-poly-'))) {
      const leaf = getDraggableElement(e.target, svg);
      const groupAware = leaf ? resolveGroupTarget(leaf, svg, selectedLayerIdRef.current) : null;
      if (groupAware && groupAware.id) {
        setSingleSelection(groupAware.id);
        return;
      }
    }

    // ── Click in the empty gap inside a group → select the group ───────────────
    if (!e.shiftKey && !e.metaKey && !e.ctrlKey && selectedSelectTool !== 'direct') {
      const direct = getDraggableElement(e.target, svg);
      const isOverlayPoly = Boolean(e.target.id && e.target.id.includes('overlay-poly-'));
      const onBackground = !isOverlayPoly && (!direct || direct === svg || isPageRootElement(direct, svg) ||
        direct.getAttribute?.('data-name') === 'Overlay' || direct.getAttribute?.('data-type') === 'background');
      const gapGroup = (onBackground || isOverlayPoly) ? findGroupAtPoint(svg, e.clientX, e.clientY, selectedLayerIdRef.current) : null;
      // Overlay outlines only count when they are the group's own hover/selection outline
      const polyIsGroupOutline = isOverlayPoly && gapGroup && e.target.id.endsWith(`-${gapGroup.id}`);
      if (onBackground || polyIsGroupOutline) {
        if (gapGroup) {
          setSingleSelection(gapGroup.id);
          return;
        }
      }
    }

    // ── Pre-empt polygon clicks (hit area padding) ─────────────────────────────
    let hitMultiSelectionGap = false;
    const currentMultiIds = multiSelectedIdsRef.current;
    if (currentMultiIds.size > 1) {
      const multiPoly = container?.querySelector('.selection-overlay-layer #overlay-poly-selected-multi-selection-bounds') || container?.querySelector('.selection-overlay-layer #overlay-poly-selected-multi');
      if (multiPoly) {
        const polyRect = multiPoly.getBoundingClientRect();
        if (e.clientX >= polyRect.left && e.clientX <= polyRect.right &&
          e.clientY >= polyRect.top && e.clientY <= polyRect.bottom) {
          hitMultiSelectionGap = true;
        }
      }
    }

    if (e.target.tagName.toLowerCase() === 'polygon' && e.target.id?.includes('overlay-poly-')) {
      const polySelectionId = e.target.id.replace(/^overlay-poly-(selected|child-selected|hover|child-hover|entered|multi-child-selected)-/, '');

      if (polySelectionId === 'multi' || polySelectionId === 'multi-selection-bounds') {
        const isMultiKey = Boolean(e.shiftKey || e.metaKey || (e.ctrlKey && !e.altKey));
        const elementsUnder = (typeof document !== 'undefined' && typeof document.elementsFromPoint === 'function')
          ? document.elementsFromPoint(e.clientX, e.clientY)
          : [];
        let hitUnder = null;
        for (const el of elementsUnder) {
          if (el && el !== svg && svg.contains(el) && el.id && !el.id.startsWith('overlay-') && !el.id.startsWith('resize-handle-') && !el.id.startsWith('rotate-handle-') && el.getAttribute('data-name') !== 'Overlay') {
            hitUnder = getDraggableElement(el, svg);
            if (hitUnder && hitUnder.id) break;
          }
        }

        if (hitUnder && hitUnder.id) {
          if (isMultiKey) {
            if (isPageRootElement(hitUnder, svg)) return;
            const currentSet = new Set(multiSelectedIdsRef.current);
            const primaryId = selectedLayerIdRef.current;
            const primaryEl = primaryId ? svg.querySelector(`[id="${primaryId}"]`) : null;
            if (primaryId && !isPageRootElement(primaryEl, svg)) currentSet.add(primaryId);

            // Strip any root IDs
            for (const id of Array.from(currentSet)) {
              const el = svg.querySelector(`[id="${id}"]`);
              if (isPageRootElement(el, svg)) currentSet.delete(id);
            }

            if (currentSet.has(hitUnder.id)) {
              currentSet.delete(hitUnder.id);
              if (primaryId === hitUnder.id) {
                const remaining = [...currentSet];
                const newPrimary = remaining.length > 0 ? remaining[remaining.length - 1] : null;
                if (setSelectedLayerId) {
                  setSelectedLayerId(newPrimary);
                  selectedLayerIdRef.current = newPrimary;
                }
              }
            } else {
              currentSet.add(hitUnder.id);
              if (setSelectedLayerId) {
                setSelectedLayerId(hitUnder.id);
                selectedLayerIdRef.current = hitUnder.id;
              }
            }
            multiSelectedIdsRef.current = currentSet;
            if (setMultiSelectedIds) setMultiSelectedIds(currentSet);
            return;
          } else {
            setSingleSelection(hitUnder.id);
            return;
          }
        }
        return;
      }

      if (polySelectionId) {
        const clickedEl = svg.querySelector(`[id="${polySelectionId}"]`);
        const isFreeFrame = clickedEl ? (
          clickedEl.getAttribute('data-name') === 'Free Frame' ||
          clickedEl.getAttribute('data-type') === 'free-frame' ||
          (clickedEl.id && clickedEl.id.startsWith('free-frame'))
        ) : polySelectionId.startsWith('free-frame');
        if (isFreeFrame && activeTopToolRef.current !== 'interaction' && activeTopToolRef.current !== 'animation') {
          return;
        }
        const isMultiKey = Boolean(e.shiftKey || e.metaKey || (e.ctrlKey && !e.altKey));
        if (isMultiKey) {
          if (typeof window !== 'undefined' && window.__interactMultiHandledAt && (Date.now() - window.__interactMultiHandledAt < 300)) {
            window.__interactMultiHandledAt = 0;
            return;
          }
          if (isPageRootElement(clickedEl, svg)) return;
          const currentSet = new Set(multiSelectedIdsRef.current);
          const primaryId = selectedLayerIdRef.current;
          const primaryEl = primaryId ? svg.querySelector(`[id="${primaryId}"]`) : null;
          if (primaryId && !isPageRootElement(primaryEl, svg)) currentSet.add(primaryId);

          // Strip any root IDs
          for (const id of Array.from(currentSet)) {
            const el = svg.querySelector(`[id="${id}"]`);
            if (isPageRootElement(el, svg)) currentSet.delete(id);
          }

          if (currentSet.has(polySelectionId)) {
            const clickedTable = clickedEl?.closest?.('[data-type="table-frame"], [data-type="table"]') || (polySelectionId?.startsWith('table-') ? clickedEl : null);
            if (clickedTable) {
              // Clicking on the selected table with Shift/Ctrl/Cmd is intended for cell selection/range, keep table selected!
              return;
            }
            currentSet.delete(polySelectionId);
            if (primaryId === polySelectionId) {
              const remaining = [...currentSet];
              const newPrimary = remaining.length > 0 ? remaining[remaining.length - 1] : null;
              if (setSelectedLayerId) {
                setSelectedLayerId(newPrimary);
                selectedLayerIdRef.current = newPrimary;
              }
            }
          } else {
            currentSet.add(polySelectionId);
            if (setSelectedLayerId) {
              setSelectedLayerId(polySelectionId);
              selectedLayerIdRef.current = polySelectionId;
            }
          }
          multiSelectedIdsRef.current = currentSet;
          if (setMultiSelectedIds) setMultiSelectedIds(currentSet);
          return;
        }

        // Normal click on polygon
        if (selectedLayerIdRef.current === polySelectionId && multiSelectedIdsRef.current.size <= 1) {
          // If the Type tool is active, clicking on the selected text enters inline editing
          if (activeMainToolRef.current === 'type') {
            const underlyingEl = svg.querySelector(`[id="${polySelectionId}"]`);
            const isTextTag = underlyingEl && ['text', 'tspan', 'foreignobject'].includes(underlyingEl.tagName?.toLowerCase());
            const isNotWidget = underlyingEl && !underlyingEl.closest?.(
              '[data-is-element-button="true"], [data-type="button"], g[id^="button-"], ' +
              '[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"], .slideshow-foreign-object, .flipibook-swiper-container, .swiper, ' +
              '[data-type="embed-frame"], [data-type="audio-frame"], [data-type="video"], [data-type="qrcode"], [data-type="map"], [data-type="table-frame"]'
            );
            if (isTextTag && isNotWidget) {
              enterTextEditMode(underlyingEl, e.clientX, e.clientY);
            }
          }
          return;
        }

        // Otherwise, select it
        setSingleSelection(polySelectionId);

        // Enter frame context if the element is inside a frame
        const underlyingEl = svg.querySelector(`[id="${polySelectionId}"]`);
        if (underlyingEl) {
          const topFrames = getTopLevelFrames(svg);
          const frameParent = topFrames.find(f => f.contains(underlyingEl));
          if (frameParent) {
            setCurrentFrameId(frameParent.id);
            currentFrameIdRef.current = frameParent.id;
          }
        }
        return;
      }
    }

    // ── Creation Tool: Text (Type) Tool logic removed (moved to mousedown) ──────


    // ── CLICK-OUTSIDE-PREVENTION (if in tools like pen/shapes but not typing) ───
    const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
    const isDrawingTool = activeMainTool === 'pen' || activeMainTool === 'shapes';
    const isSelectionTool = ['select', 'upload', 'type'].includes(activeMainTool);
    const allowClick = isSelectionTool || (isDrawingTool && pageIdx !== activePageIndex);

    if (!allowClick && !getDraggableElement(e.target, e.currentTarget)) {
      return;
    }

    // ── Ctrl + Shift + Click OR Direct selection tool: deep selection ────────
    if ((e.ctrlKey && e.shiftKey) || selectedSelectTool === 'direct') {
      const target = getDraggableElement(e.target, svg);
      if (target && target.id && target.tagName.toLowerCase() !== 'svg') {
        if (e.shiftKey && selectedSelectTool === 'direct') {
          // Multi-toggle in direct mode
          const currentSet = new Set(multiSelectedIdsRef.current);
          if (currentSet.has(target.id)) {
            currentSet.delete(target.id);
            if (selectedLayerIdRef.current === target.id) {
              const remaining = [...currentSet];
              const newPrimary = remaining.length > 0 ? remaining[remaining.length - 1] : null;
              if (setSelectedLayerId) {
                setSelectedLayerId(newPrimary);
                selectedLayerIdRef.current = newPrimary;
              }
            }
          } else {
            currentSet.add(target.id);
            if (setSelectedLayerId) {
              setSelectedLayerId(target.id);
              selectedLayerIdRef.current = target.id;
            }
          }
          multiSelectedIdsRef.current = currentSet;
          setMultiSelectedIds(currentSet);
          return;
        }

        setSingleSelection(target.id);
        return;
      }
    }

    // ── Shift / Cmd / Ctrl + Click: Multi-select toggle ─────────────────────────
    // Works at top-level OR inside an entered frame, but does NOT enter frames.
    const isMultiSelectClick = Boolean(e.shiftKey || e.metaKey || (e.ctrlKey && !e.altKey));
    if (isMultiSelectClick) {
      // Avoid double-toggling when interact.js drag-start just processed this Shift/Ctrl/Cmd press
      if (typeof window !== 'undefined' && window.__interactMultiHandledAt && (Date.now() - window.__interactMultiHandledAt < 300)) {
        window.__interactMultiHandledAt = 0;
        return;
      }
      // If clicking inside a table cell/element, do not toggle off the table from selection!
      const isInsideTable = Boolean(e.target?.closest?.('td, th, table, [data-type="table-frame"], [data-type="table"], g[id^="table-"]'));
      if (isInsideTable) {
        return;
      }

      const frameId = currentFrameIdRef.current;

      // Determine candidate element pool (same as current navigation level)
      let candidates = [];
      if (frameId) {
        const frameEl = svg.querySelector(`[id="${frameId}"]`);
        candidates = frameEl ? getDirectChildFrames(frameEl) : [];
      }
      if (candidates.length === 0) {
        candidates = getTopLevelFrames(svg);
      }

      // Expand any root page frame in candidates so we test against its child elements, never the page container
      const expandedCandidates = [];
      candidates.forEach(c => {
        if (isPageRootElement(c, svg)) {
          expandedCandidates.push(...getDirectChildFrames(c));
        } else {
          expandedCandidates.push(c);
        }
      });
      candidates = expandedCandidates;

      // Find the topmost candidate hit at this point
      let hitEl = null;
      // If primary selection is a leaf text box inside a group (or clicking directly onto another text box
      // while multi-selecting), prefer the direct leaf text box so Shift/Ctrl/Cmd+Click pairs sibling words!
      const primaryIdCheck = selectedLayerIdRef.current;
      const primaryElCheck = primaryIdCheck ? svg.querySelector(`[id="${primaryIdCheck}"]`) : null;
      const directLeafText = e.target?.closest?.('text[id], foreignObject[id]');
      if (
        directLeafText &&
        directLeafText.id &&
        svg.contains(directLeafText) &&
        !isPageRootElement(directLeafText, svg) &&
        (primaryElCheck?.tagName?.toLowerCase() === 'text' || primaryElCheck?.tagName?.toLowerCase() === 'foreignobject' || primaryElCheck?.parentElement?.closest('g[id]'))
      ) {
        hitEl = directLeafText;
      }

      // Group-aware target (same rule as a plain click): inside a group — e.g. the layers of an
      // imported SVG — Shift/Cmd+Click toggles the element at the level you are working in (a sibling
      // of the selected layer), not the whole top-level group.
      if (!hitEl && selectedSelectTool !== 'direct') {
        const leaf = getDraggableElement(e.target, svg);
        const groupAware = leaf ? resolveGroupTarget(leaf, svg, selectedLayerIdRef.current) : null;
        if (groupAware && groupAware.id && !isPageRootElement(groupAware, svg)) {
          hitEl = groupAware;
        }
      }

      if (!hitEl) {
        for (let i = candidates.length - 1; i >= 0; i--) {
          if (hitTest(candidates[i], e.clientX, e.clientY, 4)) {
            hitEl = candidates[i];
            break;
          }
        }
      }

      if (!hitEl) {
        const directTarget = getDraggableElement(e.target, svg);
        if (directTarget && directTarget.id && directTarget !== svg && directTarget.tagName.toLowerCase() !== 'svg') {
          if (!isPageRootElement(directTarget, svg)) {
            hitEl = directTarget;
          }
        }
      }

      if (hitEl && hitEl.id) {
        if (isPageRootElement(hitEl, svg)) return;

        // Toggle this element in/out of the multi-selection
        const currentSet = new Set(multiSelectedIdsRef.current);

        // Always keep the primary selectedLayerId in the set (if it exists AND is not root)
        const primaryId = selectedLayerIdRef.current;
        const primaryEl = primaryId ? svg.querySelector(`[id="${primaryId}"]`) : null;
        if (primaryId && !isPageRootElement(primaryEl, svg)) currentSet.add(primaryId);

        // Strip any root IDs
        for (const id of Array.from(currentSet)) {
          const el = svg.querySelector(`[id="${id}"]`);
          if (isPageRootElement(el, svg)) currentSet.delete(id);
        }

        if (currentSet.has(hitEl.id)) {
          currentSet.delete(hitEl.id);
          // If we removed the primary, promote another
          if (primaryId === hitEl.id) {
            const remaining = [...currentSet];
            const newPrimary = remaining.length > 0 ? remaining[remaining.length - 1] : null;
            if (setSelectedLayerId) {
              setSelectedLayerId(newPrimary);
              selectedLayerIdRef.current = newPrimary;
            }
          }
        } else {
          currentSet.add(hitEl.id);
          // The most recently clicked element becomes primary
          if (setSelectedLayerId) {
            setSelectedLayerId(hitEl.id);
            selectedLayerIdRef.current = hitEl.id;
          }
        }

        multiSelectedIdsRef.current = currentSet;
        if (setMultiSelectedIds) setMultiSelectedIds(currentSet);
      }
      // Shift+Click on empty space does nothing (don't clear multi-selection)
      return;
    }

    // ── Non-shift plain click: always clears multi-selection ─────────────────
    // Reset multi-selection on normal click (will rebuild from single selected)
    const frameId = currentFrameIdRef.current;
    const selId = selectedLayerIdRef.current;

    const effectiveFrameId = frameId;

    // ── Case 1: We are INSIDE an entered frame — INFINITE RECURSIVE DRILL-DOWN ─
    if (effectiveFrameId) {
      const frameEl = svg.querySelector(`[id="${effectiveFrameId}"]`);

      if (frameEl && hitTest(frameEl, e.clientX, e.clientY)) {
        // ── Clicked INSIDE the currently entered frame ──
        const children = getDirectChildFrames(frameEl);
        let clickedChild = null;
        for (let i = children.length - 1; i >= 0; i--) {
          if (hitTest(children[i], e.clientX, e.clientY)) {
            clickedChild = children[i];
            break;
          }
        }

        if (clickedChild) {
          if (selId === clickedChild.id) {
            // ── Already selected this child → try to ENTER it (go deeper)
            const grandchildren = getDirectChildFrames(clickedChild);
            if (grandchildren.length > 0) {
              setCurrentFrameId(clickedChild.id);
              currentFrameIdRef.current = clickedChild.id;
              // Immediately select whichever grandchild was actually hit
              for (let i = grandchildren.length - 1; i >= 0; i--) {
                if (hitTest(grandchildren[i], e.clientX, e.clientY)) {
                  setSingleSelection(grandchildren[i].id);
                  return;
                }
              }
              // Hit the gap inside the child → entered, keep child selected
              return;
            }
            // Child has no sub-frames → stay selected, nothing deeper to enter
            return;
          } else {
            // ── Different child → SELECT it 
            setSingleSelection(clickedChild.id);
          }
        } else {
          // Check if we hit a non-frame element (text, shape, path) inside this entered frame
          let target = getDraggableElement(e.target, e.currentTarget);

          if (e.target.tagName.toLowerCase() === 'polygon' && e.target.id?.includes('overlay-poly-')) {
            const polySelectionId = e.target.id.replace(/^overlay-poly-(selected|child-selected|hover|child-hover|entered|multi-child-selected)-/, '');
            const underlyingEl = svg.querySelector(`[id="${polySelectionId}"]`);
            if (underlyingEl) {
              const isFreeFrame = underlyingEl.getAttribute('data-name') === 'Free Frame' || underlyingEl.getAttribute('data-type') === 'free-frame' || underlyingEl.id?.startsWith('free-frame');
              if (!(isFreeFrame && activeTopToolRef.current !== 'interaction' && activeTopToolRef.current !== 'animation')) {
                target = underlyingEl;
              }
            }
          }

          if (target && target !== frameEl && frameEl.contains(target)) {
            setSingleSelection(target.id);
            return;
          }

          // 1. STICKY SELECTION PRIORITY: If clicking near the already-selected element, keep it selected!
          const activeSel = selectedLayerIdRef.current ? svg.querySelector(`[id="${selectedLayerIdRef.current}"]`) : null;
          if (activeSel && frameEl.contains(activeSel) && hitTest(activeSel, e.clientX, e.clientY, 15)) {
            setSingleSelection(activeSel.id);
            return;
          }

          // 2. Fallback: hit testing to catch clicks between text letters or transparent shape bounds
          const normalElements = Array.from(frameEl.children).filter(el => {
            const isFreeFrame = el.getAttribute('data-name') === 'Free Frame' || el.getAttribute('data-type') === 'free-frame' || el.id?.startsWith('free-frame');
            if (isFreeFrame && activeTopToolRef.current !== 'interaction' && activeTopToolRef.current !== 'animation') return false;
            return el.id && el.getAttribute('data-type') !== 'frame' &&
              el.getAttribute('data-name') !== 'Overlay' &&
              el.getAttribute('data-hidden') !== 'true' &&
              el.getAttribute('data-locked') !== 'true';
          });
          for (let i = normalElements.length - 1; i >= 0; i--) {
            if (hitTest(normalElements[i], e.clientX, e.clientY, 5)) {
              setSingleSelection(normalElements[i].id);
              return;
            }
          }

          // ── Clicked the entered frame's empty gap → behavior depends on level
          const topFrames = getTopLevelFrames(svg);
          const isRootFolder = topFrames.some(f => f.id === frameId);

          if (isRootFolder) {
            // ── Root Folder Gap (Canvas Background): Keep page root folder selected
            if (hitMultiSelectionGap) return; // Keep multi-selection intact!
            const rootId = (topFrames && topFrames.length > 0 ? topFrames[0].id : frameId);
            setSingleSelection(rootId);
            setCurrentFrameId(rootId);
            currentFrameIdRef.current = rootId;
          } else {
            // ── Deeper Frame Gap: exit one level (select frame, keep entered)
            if (hitMultiSelectionGap) return; // Keep multi-selection intact!
            setSingleSelection(frameId);
            // Don't null currentFrameId here to keep context
          }
        }
        return;

      } else {
        // ── Clicked completely OUTSIDE the entered frame
        // Exit current context and select whatever is at this point
        const topLevelEls = getTopLevelFrames(svg);
        let hitTopFrame = null;
        let targetEl = getDraggableElement(e.target, e.currentTarget);

        let currEl = targetEl;
        while (currEl && currEl !== svg) {
          if (topLevelEls.includes(currEl)) {
            hitTopFrame = currEl;
            break;
          }
          currEl = currEl.parentElement;
        }

        if (!hitTopFrame) {
          for (let i = topLevelEls.length - 1; i >= 0; i--) {
            if (hitTest(topLevelEls[i], e.clientX, e.clientY)) {
              hitTopFrame = topLevelEls[i];
              break;
            }
          }
        }

        setCurrentFrameId(null);
        currentFrameIdRef.current = null;

        if (hitTopFrame) {
          setSingleSelection(hitTopFrame.id);
          // Always enter the top level frame immediately upon click (handles both single and double page spreads cleanly)
          setCurrentFrameId(hitTopFrame.id);
          currentFrameIdRef.current = hitTopFrame.id;
        } else {
          // Hit nothing? Keep page root folder selected
          if (hitMultiSelectionGap) return; // Keep multi-selection intact!
          const rootId = (topLevelEls && topLevelEls.length > 0 ? topLevelEls[0].id : pages[activePageIndex]?.layers?.[0]?.id);
          if (rootId) {
            setSingleSelection(rootId);
            setCurrentFrameId(rootId);
            currentFrameIdRef.current = rootId;
          } else {
            setSingleSelection(null);
            setCurrentFrameId(null);
            currentFrameIdRef.current = null;
          }
        }
        return;
      }
    }

    // ── Case 2: No frame entered — top-level selection ────────────────────────
    const topLevelEls = getTopLevelFrames(svg);

    // 1. Identify which top-level frame was hit (topmost in z-order)
    let hitFrame = null;
    let target = getDraggableElement(e.target, e.currentTarget);

    // First, try to find the frame directly from the clicked target's DOM ancestry
    // This is robust against coordinate-based hitTest failing due to UI overlays (like the Upload panel)
    let currentEl = target;
    while (currentEl && currentEl !== svg) {
      if (topLevelEls.includes(currentEl)) {
        hitFrame = currentEl;
        break;
      }
      currentEl = currentEl.parentElement;
    }

    // Fallback to hitTest if DOM ancestry didn't find a top-level frame
    if (!hitFrame) {
      for (let i = topLevelEls.length - 1; i >= 0; i--) {
        if (hitTest(topLevelEls[i], e.clientX, e.clientY)) {
          hitFrame = topLevelEls[i];
          break;
        }
      }
    }

    if (hitFrame) {
      // Check if we hit an element inside this frame directly (lifted out of selId check to capture any hit!)
      let target = getDraggableElement(e.target, e.currentTarget);

      if (e.target.tagName.toLowerCase() === 'polygon' && e.target.id?.includes('overlay-poly-')) {
        const polySelectionId = e.target.id.replace('overlay-poly-selected-', '').replace('overlay-poly-child-selected-', '').replace('overlay-poly-hover-', '');
        const underlyingEl = svg.querySelector(`[id="${polySelectionId}"]`);
        if (underlyingEl) {
          const isFreeFrame = underlyingEl.getAttribute('data-name') === 'Free Frame' || underlyingEl.getAttribute('data-type') === 'free-frame' || underlyingEl.id?.startsWith('free-frame');
          if (!(isFreeFrame && activeTopToolRef.current !== 'interaction' && activeTopToolRef.current !== 'animation')) {
            target = underlyingEl;
          }
        }
      }

      if (target && target !== hitFrame && hitFrame.contains(target)) {
        setCurrentFrameId(hitFrame.id);
        currentFrameIdRef.current = hitFrame.id;
        setSingleSelection(target.id);
        return;
      }

      // STICKY SELECTION PRIORITY (Case 2)
      const activeSel = selectedLayerIdRef.current ? svg.querySelector(`[id="${selectedLayerIdRef.current}"]`) : null;
      if (activeSel && hitFrame.contains(activeSel) && hitTest(activeSel, e.clientX, e.clientY, 15)) {
        setCurrentFrameId(hitFrame.id);
        currentFrameIdRef.current = hitFrame.id;
        setSingleSelection(activeSel.id);
        return;
      }

      // Hit testing fallback for elements within hitFrame (text gaps)
      const normalEls = Array.from(hitFrame.children).filter(el => {
        const isFreeFrame = el.getAttribute('data-name') === 'Free Frame' || el.getAttribute('data-type') === 'free-frame' || el.id?.startsWith('free-frame');
        if (isFreeFrame && activeTopToolRef.current !== 'interaction' && activeTopToolRef.current !== 'animation') return false;
        return el.id && el.getAttribute('data-type') !== 'frame' &&
          el.getAttribute('data-name') !== 'Overlay' &&
          el.getAttribute('data-hidden') !== 'true' &&
          el.getAttribute('data-locked') !== 'true';
      });
      for (let i = normalEls.length - 1; i >= 0; i--) {
        if (hitTest(normalEls[i], e.clientX, e.clientY, 5)) {
          setCurrentFrameId(hitFrame.id);
          currentFrameIdRef.current = hitFrame.id;
          setSingleSelection(normalEls[i].id);
          return;
        }
      }

      if (selId === hitFrame.id) {
        // User clicked the ALREADY-SELECTED frame -> try to ENTER it (drill-down)
        const hasChildren = getDirectChildFrames(hitFrame).length > 0;
        if (hasChildren) {
          setCurrentFrameId(selId);
          currentFrameIdRef.current = selId;

          // Immediately check if a child is hit and select it
          const children = getDirectChildFrames(hitFrame);
          for (let i = children.length - 1; i >= 0; i--) {
            if (hitTest(children[i], e.clientX, e.clientY)) {
              setSingleSelection(children[i].id);
              return;
            }
          }
          // Clicked in the gap area of the frame — keep primary frame selected, just mark as entered
          return;
        }
        // Frame has no children — stay selected
        return;
      } else {
        // User clicked a DIFFERENT top-level frame -> SELECT it (unselects old)
        setSingleSelection(hitFrame.id);
        setCurrentFrameId(null);
        currentFrameIdRef.current = null;
        return;
      }
    } else {
      // 2. Clicked canvas background — deselect everything

      // ── STICKY SELECTION PRIORITY (Case 3) ──
      // If we are about to clear the selection, check if the click was VERY close to the active selection!
      // This protects against accidental deselection when trying to double-click text!
      const activeSel = selectedLayerIdRef.current ? svg.querySelector(`[id="${selectedLayerIdRef.current}"]`) : null;
      if (activeSel && hitTest(activeSel, e.clientX, e.clientY, 15)) {
        return; // Keep selection intact!
      }

      // ── MULTI-SELECTION GAP CLICK CHECK ──
      if (multiSelectedIdsRef.current.size > 1) {
        const multiPoly = container?.querySelector('.selection-overlay-layer #overlay-poly-selected-multi-selection-bounds') || container?.querySelector('.selection-overlay-layer #overlay-poly-selected-multi');
        if (multiPoly) {
          const rect = multiPoly.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            return; // Keep multi-selection intact!
          }
        }
      }

      if (topLevelEls && topLevelEls.length > 0) {
        const rootId = topLevelEls[0].id;
        setSingleSelection(rootId);
        setCurrentFrameId(rootId);
        currentFrameIdRef.current = rootId;
      } else {
        setSingleSelection(null);
        setCurrentFrameId(null);
        currentFrameIdRef.current = null;
      }
    }
  };

  // ── FIGMA-STYLE DOUBLE CLICK: enter frame / edit text ─────────────────────────
  const handleSvgDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditingTextRef.current) return;
    // Intentionally ignore suppressClickRef here so that micro-jitters during double-clicks don't abort text editing!

    const container = e.currentTarget;
    const svg = container.querySelector('svg');
    if (!svg) return;

    if (isConvertedFlipbook) {
      return;
    }

    // ── NODE EDIT MODE: Double-click on already-active node edit path ──────────────
    if (nodeEditModeRef.current) {
      // Already in node edit mode – do nothing on double click (single click to drag handles)
      return;
    }

    // ── INSTANT TEXT EDIT MODE (Vector-Studio Style) ─────────────────────────
    // Directly check what is under the cursor on double-click (pierces selection polygons, user groups, and frames)
    let directTextEl = null;
    const isExcludedFromTextEditing = (node) => {
      if (!node) return false;
      const selector = (
        '[data-is-element-button="true"], [data-type="button"], g[id^="button-"], ' +
        '[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"], .slideshow-foreign-object, .flipibook-swiper-container, .swiper, ' +
        '[data-type="embed-frame"], [data-type="audio-frame"], [data-type="video"], [data-type="qrcode"], [data-type="map"], [data-type="table-frame"], ' +
        '[data-is-image-frame="true"], [data-type="image-frame"], [data-frame-type], g[id^="image-frame-"]'
      );
      return Boolean(node.matches?.(selector) || node.closest?.(selector));
    };

    const isGenuineTextElement = (node) => {
      if (!node) return false;
      if (isExcludedFromTextEditing(node)) return false;
      const tag = node.tagName?.toLowerCase();
      if (tag === 'text' || tag === 'tspan') return true;
      if (tag === 'foreignobject') {
        if (node.getAttribute?.('data-type') === 'video' || node.querySelector?.('video, iframe, .swiper, table, canvas')) {
          return false;
        }
        return true;
      }
      return false;
    };

    const clickTargetTag = e.target?.tagName?.toLowerCase();
    if (['text', 'tspan'].includes(clickTargetTag) && !isExcludedFromTextEditing(e.target)) {
      directTextEl = clickTargetTag === 'tspan' ? (e.target.parentElement || e.target.parentNode) : e.target;
    } else if (clickTargetTag === 'foreignobject' && isGenuineTextElement(e.target)) {
      directTextEl = e.target;
    } else if (e.target?.closest && e.target.closest('foreignObject') && isGenuineTextElement(e.target.closest('foreignObject'))) {
      directTextEl = e.target.closest('foreignObject');
    } else if (typeof document.elementsFromPoint === 'function') {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of elements) {
        if (!svg.contains(el)) continue;
        if (isExcludedFromTextEditing(el)) continue;
        const tag = el.tagName?.toLowerCase();
        if (tag === 'tspan') {
          directTextEl = el.parentElement || el.parentNode;
          break;
        }
        if (tag === 'text') {
          directTextEl = el;
          break;
        }
        if (tag === 'foreignobject' && isGenuineTextElement(el)) {
          directTextEl = el;
          break;
        }
        if (el.closest && el.closest('foreignObject') && isGenuineTextElement(el.closest('foreignObject'))) {
          directTextEl = el.closest('foreignObject');
          break;
        }
      }
    }

    // Fallback: check currently selected layer if it's text within hitTest range (exclude buttons, slideshows, etc.)
    if (!directTextEl && selectedLayerIdRef.current) {
      const activeEl = svg.querySelector(`[id="${selectedLayerIdRef.current}"]`);
      if (activeEl && isGenuineTextElement(activeEl)) {
        if (hitTest(activeEl, e.clientX, e.clientY, 15)) {
          directTextEl = activeEl.tagName?.toLowerCase() === 'tspan' ? (activeEl.parentElement || activeEl.parentNode) : activeEl;
        }
      }
    }

    let effectiveTarget = directTextEl || e.target;
    if (effectiveTarget && effectiveTarget.tagName?.toLowerCase() === 'polygon' && effectiveTarget.id?.includes('overlay-poly-')) {
      const polyId = effectiveTarget.id.replace(/^overlay-poly-(selected|child-selected|hover|child-hover|entered|multi-child-selected)-/, '');
      const underlying = svg.querySelector(`[id="${polyId}"]`);
      if (underlying) effectiveTarget = underlying;
    }
    if ((!effectiveTarget || effectiveTarget === svg || effectiveTarget.closest?.('[id^="highlight-overlay"]')) && selectedLayerIdRef.current) {
      const selEl = svg.querySelector(`[id="${CSS.escape(selectedLayerIdRef.current)}"]`) || document.getElementById(selectedLayerIdRef.current);
      if (selEl) effectiveTarget = selEl;
    }

    // Check if double click targets compound elements or unflattened shapes
    const isFlattenedClick = Boolean(
      effectiveTarget?.closest?.('[data-flattened="true"]') ||
      effectiveTarget?.getAttribute?.('data-flattened') === 'true' ||
      effectiveTarget?.getAttribute?.('data-type') === 'vector-path'
    );

    const isDirectTextTarget = Boolean(
      directTextEl ||
      (!isExcludedFromTextEditing(effectiveTarget) && (
        ['text', 'tspan'].includes(effectiveTarget?.tagName?.toLowerCase()) ||
        (effectiveTarget?.tagName?.toLowerCase() === 'foreignobject' && isGenuineTextElement(effectiveTarget)) ||
        (effectiveTarget?.closest?.('foreignObject') && isGenuineTextElement(effectiveTarget.closest('foreignObject')))
      ))
    );

    if (!isFlattenedClick && !isDirectTextTarget) {
      // 1. Check if double-clicked inside an image frame (or its slots)
      const frameParent = effectiveTarget?.closest?.(
        '[data-is-image-frame="true"], [data-type="image-frame"], [data-frame-type], g[id^="image-frame-"]'
      );
      if (frameParent) {
        if (frameParent.id) {
          setSingleSelection(frameParent.id);
        }
        let slotPath = (effectiveTarget && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(effectiveTarget.tagName?.toLowerCase()))
          ? effectiveTarget
          : null;
        if (!slotPath && typeof document.elementsFromPoint === 'function') {
          const under = document.elementsFromPoint(e.clientX, e.clientY);
          slotPath = under.find(el => el.closest && el.closest(`[id="${frameParent.id}"]`) && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(el.tagName?.toLowerCase()));
        }
        if (!slotPath) {
          slotPath = frameParent.querySelector('[fill*="url(#pattern"]') || frameParent.querySelector('path, polygon, rect, circle, ellipse');
        }
        if (slotPath && hasCustomImageInShape(slotPath)) {
          const container = frameParent.closest('.page-svg-container');
          const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
          startShapeImageAdjust(slotPath, pageIdx);
          return;
        }
      }

      const compoundParent = effectiveTarget?.closest?.(
        '[data-is-element-typography="true"], [data-typography-type], [data-subtopic="Titles"], g[id^="typography-"], [data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"], [data-is-element-button="true"], [data-type="button"], g[id^="button-"], [data-type="audio-frame"], [data-type="qrcode"], [data-type="map"], [data-type="embed-frame"], [data-type="slideshow"], [data-type="table-frame"], [data-type="table"], g[id^="table-"]'
      );
      if (compoundParent) {
        const isTable = compoundParent.getAttribute('data-type') === 'table-frame' || compoundParent.id?.startsWith('table-');
        const isCellClick = isTable && Boolean(effectiveTarget?.closest?.('td, th'));
        if (compoundParent.id && (!isCellClick || selectedLayerIdRef.current !== compoundParent.id)) {
          setSingleSelection(compoundParent.id);
        }
        const hasMask = Boolean(
          compoundParent.getAttribute('data-mask-enabled') === 'true' ||
          compoundParent.getAttribute('data-masked-image-url') ||
          (compoundParent.getAttribute('fill') && compoundParent.getAttribute('fill').includes('url(#pattern')) ||
          compoundParent.querySelector?.('[data-mask-enabled="true"], [fill*="url(#pattern"]')
        );
        if (hasMask && hasCustomImageInShape(compoundParent)) {
          const container = compoundParent.closest('.page-svg-container');
          const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
          startShapeImageAdjust(compoundParent, pageIdx);
        }
        return;
      }
    }

    if (directTextEl && directTextEl.getAttribute('data-locked') !== 'true' && directTextEl.getAttribute('data-type') !== 'video' && !directTextEl.querySelector('video, iframe')) {
      const isModuleWithoutTextEdit = activeTopTool === 'interaction' || activeTopTool === 'animation' || activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';
      if (!isModuleWithoutTextEdit) {
        if (!directTextEl.id) {
          directTextEl.id = `text-${Math.random().toString(36).substr(2, 9)}`;
        }
        // If text is inside a frame, update currentFrameId
        const topFrames = getTopLevelFrames(svg);
        const parentFrame = topFrames.find(f => f.contains(directTextEl));
        if (parentFrame) {
          setCurrentFrameId(parentFrame.id);
          currentFrameIdRef.current = parentFrame.id;
        }
        setSingleSelection(directTextEl.id);
        enterTextEditMode(directTextEl, e.clientX, e.clientY);
        return;
      }
    }

    // If user clicked on a selection overlay polygon, resolve the underlying element
    let clickedEl = e.target;
    if (clickedEl && clickedEl.tagName?.toLowerCase() === 'polygon' && clickedEl.id?.includes('overlay-poly-')) {
      const polyId = clickedEl.id.replace(/^overlay-poly-(selected|child-selected|hover|child-hover|entered|multi-child-selected)-/, '');
      const underlying = svg.querySelector(`[id="${polyId}"]`);
      if (underlying) clickedEl = underlying;
    }
    let target = getDraggableElement(clickedEl, e.currentTarget) || (selectedLayerIdRef.current ? svg.querySelector(`[id="${selectedLayerIdRef.current}"]`) : null);
    const isFlattenedTarget = Boolean(
      target?.getAttribute?.('data-flattened') === 'true' ||
      target?.closest?.('[data-flattened="true"]') !== null
    );
    const hasImageMaskTarget = Boolean(
      target?.getAttribute?.('data-mask-enabled') === 'true' ||
      target?.closest?.('[data-mask-enabled="true"]') !== null ||
      (target?.getAttribute?.('fill') && target.getAttribute('fill').includes('url(#pattern')) ||
      target?.closest?.('[fill*="url(#pattern"]') !== null
    );

    const targetFrame = target?.closest?.(
      '[data-is-image-frame="true"], [data-type="image-frame"], [data-frame-type], g[id^="image-frame-"]'
    );
    if (targetFrame) {
      if (targetFrame.id) {
        setSingleSelection(targetFrame.id);
      }
      let slotPath = (target && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(target.tagName?.toLowerCase()))
        ? target
        : null;
      if (!slotPath && typeof document.elementsFromPoint === 'function') {
        const under = document.elementsFromPoint(e.clientX, e.clientY);
        slotPath = under.find(el => el.closest && el.closest(`[id="${targetFrame.id}"]`) && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(el.tagName?.toLowerCase()));
      }
      if (!slotPath) {
        slotPath = targetFrame.querySelector('[fill*="url(#pattern"]') || targetFrame.querySelector('path, polygon, rect, circle, ellipse');
      }
      if (slotPath && hasCustomImageInShape(slotPath)) {
        const container = targetFrame.closest('.page-svg-container');
        const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
        startShapeImageAdjust(slotPath, pageIdx);
        return;
      }
    }

    const isTargetText = Boolean(
      !isExcludedFromTextEditing(target) && (
        ['text', 'tspan'].includes(target?.tagName?.toLowerCase()) ||
        (target?.tagName?.toLowerCase() === 'foreignobject' && isGenuineTextElement(target)) ||
        (target?.closest?.('foreignObject') && isGenuineTextElement(target.closest('foreignObject')))
      )
    );

    const targetCompound = (!isFlattenedTarget && !isTargetText) ? target?.closest?.(
      '[data-is-element-typography="true"], [data-typography-type], [data-subtopic="Titles"], g[id^="typography-"], [data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"], [data-is-element-button="true"], [data-type="button"], g[id^="button-"], [data-type="audio-frame"], [data-type="qrcode"], [data-type="map"], [data-type="embed-frame"], [data-type="slideshow"], [data-type="table-frame"]'
    ) : null;
    if (targetCompound) {
      if (targetCompound.id) {
        setSingleSelection(targetCompound.id);
      }
      const hasMask = Boolean(
        targetCompound.getAttribute('data-mask-enabled') === 'true' ||
        targetCompound.getAttribute('data-masked-image-url') ||
        (targetCompound.getAttribute('fill') && targetCompound.getAttribute('fill').includes('url(#pattern')) ||
        targetCompound.querySelector?.('[data-mask-enabled="true"], [fill*="url(#pattern"]')
      );
      if (hasMask && hasCustomImageInShape(targetCompound)) {
        const container = targetCompound.closest('.page-svg-container');
        const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
        startShapeImageAdjust(targetCompound, pageIdx);
      }
      return;
    }

    // 2. Proactively check if we are double-clicking while a text is selected (exclude buttons, widgets, etc.)
    const selIdContext = selectedLayerIdRef.current;
    if (selIdContext && (!target || !['text', 'tspan', 'foreignobject'].includes(target.tagName?.toLowerCase()))) {
      let activeSelEls = svg.querySelectorAll(`[id="${selIdContext}"]`);
      // If there are duplicates due to temporary template saving leaks, find the visible one
      const activeSelEl = Array.from(activeSelEls).find(el => el.getBoundingClientRect().width > 0) || activeSelEls[0];

      if (activeSelEl && isGenuineTextElement(activeSelEl) && activeSelEl.getAttribute('data-locked') !== 'true') {
        // Bypass strict hitTest if the target was the overlay polygon (meaning they clicked inside the blue box exactly)
        const clickedPolygon = e.target.tagName.toLowerCase() === 'polygon';
        if (clickedPolygon || hitTest(activeSelEl, e.clientX, e.clientY, 15)) {
          target = activeSelEl;
        }
      }
    }

    // ── NODE EDIT MODE: Double-clicking a vector path, flattened shape, or masked shape ───────
    const isModuleWithoutPenEdit = activeTopTool === 'interaction' || activeTopTool === 'animation' || activeTopToolRef.current === 'interaction' || activeTopToolRef.current === 'animation';
    if (!isModuleWithoutPenEdit && target && !['text', 'tspan', 'foreignobject'].includes(target.tagName?.toLowerCase())) {
      const tag = target.tagName?.toLowerCase();
      const dataType = target.getAttribute?.('data-type') || '';
      const isFlattened = isFlattenedTarget;
      const isElementShapeTarget = !isFlattened && Boolean(
        target.getAttribute?.('data-is-element-shape') === 'true' ||
        target.getAttribute?.('data-shape-type') !== null ||
        target.getAttribute?.('data-type') === 'shape' ||
        target.closest?.('[data-is-element-shape="true"]') !== null ||
        target.closest?.('[data-shape-type]') !== null ||
        target.closest?.('[data-type="shape"]') !== null
      );

      const isVectorOrPath = (
        isFlattened ||
        (!isElementShapeTarget && (tag === 'path' || dataType === 'vector-path'))
      ) && target.getAttribute?.('data-locked') !== 'true' &&
        target.getAttribute?.('data-name') !== 'Overlay' &&
        target.getAttribute?.('data-type') !== 'frame' &&
        target.getAttribute?.('data-type') !== 'background';

      if (isVectorOrPath && (target.id || target.closest?.('[id]'))) {
        const container = target.closest('.page-svg-container');
        const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;
        const validPathTarget = target.tagName?.toLowerCase() === 'path' ? target : (target.querySelector?.('path') || target);
        enterNodeEditMode(validPathTarget, pageIdx);
        return;
      }
    }

    if (!target) {
      return;
    }

    const isText = isGenuineTextElement(target);
    if (isText && target.id) {
      if (activeTopTool !== 'interaction' && activeTopTool !== 'animation') {
        enterTextEditMode(target, e.clientX, e.clientY);
      }
      return;
    }

    const isCropModeMedia = target && !target.closest?.('[data-is-gif-group="true"]') && (
      (target.getAttribute('data-object-fit') === 'Crop') ||
      (target.closest?.('[data-object-fit="Crop"]'))
    );

    if (isCropModeMedia) {
      const cropLayer = target.closest?.('[data-object-fit="Crop"]') || target;
      if (cropLayer && cropLayer.id) {
        if (setSelectedLayerId) {
          setSelectedLayerId(cropLayer.id);
          selectedLayerIdRef.current = cropLayer.id;
        }

        const evt = new CustomEvent('enter-crop-mode', { detail: { elementId: cropLayer.id } });
        window.dispatchEvent(evt);
        return;
      }
    }

    // On double-click a frame: enter it immediately
    const frameId = currentFrameIdRef.current;
    const selId = selectedLayerIdRef.current;

    if (!frameId && selId) {
      // Enter the currently selected frame
      const selEl = svg.querySelector(`[id="${selId}"]`);
      if (selEl && hitTest(selEl, e.clientX, e.clientY)) {
        const hasChildren = getDirectChildFrames(selEl).length > 0;
        if (hasChildren) {
          setCurrentFrameId(selId);
          currentFrameIdRef.current = selId;
          // Select the child at this point as well
          const children = getDirectChildFrames(selEl);
          for (let i = children.length - 1; i >= 0; i--) {
            if (hitTest(children[i], e.clientX, e.clientY)) {
              if (setSelectedLayerId) {
                setSelectedLayerId(children[i].id);
                selectedLayerIdRef.current = children[i].id;
              }
              return;
            }
          }
          return;
        }
      }
    }

    // Fallback: select the target element directly
    if (target.id && target.tagName.toLowerCase() !== 'svg') {
      const isMediaGroupChild = target.closest('[data-is-image-group="true"]') ||
        target.closest('[data-is-video-group="true"]') ||
        target.closest('[data-is-gif-group="true"]') ||
        target.closest('[data-is-element-shape="true"]') ||
        target.closest('[data-shape-type]') ||
        target.closest('[data-type="shape"]') ||
        target.closest('g[id^="shape-"]');

      // If the target is a child of a compound group, do not drill down on double click
      if (isMediaGroupChild && isMediaGroupChild !== target) {
        if (setSelectedLayerId) {
          setSelectedLayerId(isMediaGroupChild.id);
          selectedLayerIdRef.current = isMediaGroupChild.id;
        }
        return;
      }

      if (setSelectedLayerId) {
        setSelectedLayerId(target.id);
        selectedLayerIdRef.current = target.id;
      }
    }
  };

  return {
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    handleSvgMouseLeave,
    handleSvgClick,
    handleSvgDoubleClick
  };
};

export default useCanvasPointerEvents;
