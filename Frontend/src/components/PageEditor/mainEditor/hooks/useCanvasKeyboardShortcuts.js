import { useEffect } from 'react';
import {
  pathToD,
  deleteSelectedNodeOrHandle,
  cleanPaperPathData,
  getPaperSegments,
  parseSingleMatrix
} from '../../penTool';
import { getElementMatrix, matrixToTransform } from '../utils/geometryUtils';
import { getTopLevelFrames } from '../utils/frameHierarchyUtils';

/**
 * Hook managing canvas keyboard shortcuts:
 * - Escape / Enter (exit pen tool, exit node edit mode)
 * - Backspace / Delete (delete pen node, delete selected node/handle in node edit, delete canvas layers)
 * - Shift + P (switch to pencil)
 * - Ctrl+G / Ctrl+Shift+G (Group / Ungroup selected layers)
 * - Arrow keys (Nudge selected layers with optional Shift for 1mm vs 0.1mm)
 * - Custom window events: 'trigger-group', 'trigger-ungroup'
 */
export const useCanvasKeyboardShortcuts = ({
  activeTopTool,
  activeMainTool,
  setActiveMainTool,
  selectedPenTool,
  setSelectedPenTool,
  activePageIndex = 0,
  pages = [],
  updatePageHtml,
  saveModifiedPageHtml,
  setSelectedLayerId,
  setMultiSelectedIds,
  setCurrentFrameId,
  currentFrameIdRef,
  selectedLayerIdRef,
  multiSelectedIdsRef,
  vectraPenSessionRef,
  drawingPathRef,
  commitAndExitPenDrawing,
  clearVectraOverlay,
  renderVectraOverlay,
  nodeEditModeRef,
  nodeEditPaperPathRef,
  nodeEditPathRef,
  nodeEditPageIndexRef,
  nodeEditSelectedSegIndicesRef,
  nodeEditSelectedSegIdxRef,
  nodeEditSelectedHandleSideRef,
  nodeEditSelectedCurveIdxRef,
  paperScopeRef,
  enterNodeEditMode,
  exitNodeEditMode,
  drawNodeEditOverlay,
  drawOverlayHighlight,
  drawMultiSelectionHighlight,
  isAltPressedRef,
  drawMeasurementOverlayRef,
  lastMousePosRef
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Restrict shortcuts in non-editor modes
      if (activeTopTool !== 'editor') {
        const isSelectionKey = key === 'v' || key === 'a';
        if (!isSelectionKey) return;
      }

      // Ignore if typing in an input, textarea or contenteditable element
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) ||
        document.activeElement.contentEditable === 'true') {
        return;
      }

      if (e.key === 'Escape' || e.key === 'Enter') {
        if (activeMainTool === 'pen') {
          const vSession = vectraPenSessionRef?.current;
          if (vSession) vSession.onKey(e);
          if (commitAndExitPenDrawing) commitAndExitPenDrawing();
          if (typeof setActiveMainTool === 'function') {
            setActiveMainTool('select');
          }
          return;
        }

        if (nodeEditModeRef?.current) {
          const pathEl = nodeEditPathRef.current;
          const pIdx = nodeEditPageIndexRef.current;
          if (exitNodeEditMode) exitNodeEditMode();
          if (pathEl && pathEl.ownerSVGElement && saveModifiedPageHtml) {
            saveModifiedPageHtml(pIdx, pathEl.ownerSVGElement);
          }
          return;
        }
      } else if (e.key === 'Backspace') {
        if (activeMainTool === 'pen' && selectedPenTool === 'pen') {
          const vSession = vectraPenSessionRef?.current;
          const activePath = vSession?.getActivePath();
          if (activePath) {
            vSession.onKey(e);
            const pathEl = drawingPathRef.current;
            const updated = vSession.getActivePath();
            if (!updated) {
              if (pathEl && pathEl.parentNode) pathEl.parentNode.removeChild(pathEl);
              drawingPathRef.current = null;
              if (clearVectraOverlay) clearVectraOverlay(activePageIndex);
            } else if (pathEl) {
              pathEl.setAttribute('d', pathToD(updated));
              if (renderVectraOverlay) renderVectraOverlay(activePageIndex, pathEl.parentElement, vSession);
            }
            return;
          }
        }
      } else if (e.key === 'P' && e.shiftKey) {
        if (setActiveMainTool) setActiveMainTool('pen');
        if (setSelectedPenTool) setSelectedPenTool('pencil');
      } else if (e.key.toLowerCase() === 'm' && (e.ctrlKey || e.metaKey) && e.altKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('trigger-mask'));
      } else if (e.key.toLowerCase() === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('trigger-flatten'));
      } else if (e.key.toLowerCase() === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();

        const activeContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
        const svg = activeContainer?.querySelector('svg');
        if (!svg) return;

        const ids = (multiSelectedIdsRef?.current && multiSelectedIdsRef.current.size > 0)
          ? Array.from(multiSelectedIdsRef.current)
          : (selectedLayerIdRef?.current ? [selectedLayerIdRef.current] : []);

        const isUngroup = e.shiftKey;

        if (!isUngroup && ids.length > 0) {
          // GROUP
          const elements = ids.map(id => svg.querySelector(`[id="${id}"]`)).filter(Boolean);
          if (elements.length > 0) {
            const parent = elements[0].parentNode;
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = 'group-' + Date.now();
            group.setAttribute('data-name', 'Group');
            group.setAttribute('data-type', 'group');

            parent.insertBefore(group, elements[elements.length - 1].nextSibling);

            elements.forEach(el => {
              group.appendChild(el);
            });

            if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);

            if (setSelectedLayerId) setSelectedLayerId(group.id);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set([group.id]));
          }
        } else if (isUngroup && ids.length > 0) {
          // UNGROUP
          let hasChanges = false;
          const newSelectedIds = new Set();

          const groupsToUngroup = new Set();
          ids.forEach(id => {
            let el = svg.querySelector(`[id="${id}"]`);
            if (el && el.tagName.toLowerCase() !== 'g') {
              let parentG = el.closest('g');
              if (parentG) el = parentG;
            }
            if (el && el.tagName.toLowerCase() === 'g') {
              const elName = el.getAttribute('data-name') || '';
              const elType = el.getAttribute('data-type') || '';
              const isLocked = el.getAttribute('data-locked') === 'true';

              if (!isLocked && !elName.includes('PDF Background') && !elName.includes('Overlay') && elType !== 'frame' && elType !== 'background' && el.parentNode !== svg) {
                groupsToUngroup.add(el);
              }
            }
          });

          groupsToUngroup.forEach(el => {
            const parent = el.parentNode;
            const children = Array.from(el.childNodes);

            const groupTransform = el.getAttribute('transform') || '';
            const inheritableAttrs = ['fill', 'stroke', 'stroke-width', 'opacity', 'font-family', 'font-size', 'font-weight', 'color', 'letter-spacing', 'stroke-linecap', 'stroke-linejoin'];
            const inheritedStyles = {};
            inheritableAttrs.forEach(attr => {
              if (el.hasAttribute(attr)) inheritedStyles[attr] = el.getAttribute(attr);
            });

            children.forEach((child, idx) => {
              if (child.nodeType === 1) {
                if (!child.id) {
                  child.id = `ungrouped-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`;
                }

                if (groupTransform) {
                  const childTransform = child.getAttribute('transform') || '';
                  child.setAttribute('transform', `${groupTransform} ${childTransform}`.trim());
                }

                Object.entries(inheritedStyles).forEach(([attr, val]) => {
                  if (!child.hasAttribute(attr)) {
                    child.setAttribute(attr, val);
                  }
                });

                parent.insertBefore(child, el);
                if (child.id) newSelectedIds.add(child.id);
              }
            });

            parent.removeChild(el);
            hasChanges = true;
          });

          if (hasChanges) {
            if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);
            const newIdsArr = Array.from(newSelectedIds);
            if (setSelectedLayerId) setSelectedLayerId(newIdsArr.length === 1 ? newIdsArr[0] : null);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set(newIdsArr));
          }
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();

        // Node Edit Mode: Delete selected handle point, line segment, or center node
        if (nodeEditModeRef?.current && nodeEditPaperPathRef?.current && nodeEditPathRef?.current) {
          window.__nodeEditModeActive = true;
          let paperPath = nodeEditPaperPathRef.current;
          const pathEl = nodeEditPathRef.current;
          const pIdx = nodeEditPageIndexRef.current !== null ? nodeEditPageIndexRef.current : activePageIndex;
          const targetSegIndices = (nodeEditSelectedSegIndicesRef?.current && nodeEditSelectedSegIndicesRef.current.size > 0)
            ? Array.from(nodeEditSelectedSegIndicesRef.current)
            : (nodeEditSelectedSegIdxRef?.current !== null ? [nodeEditSelectedSegIdxRef.current] : []);

          const selectedHandleSide = nodeEditSelectedHandleSideRef?.current;

          if (targetSegIndices.length > 0 || selectedHandleSide === 'line' || selectedHandleSide === 'segment') {
            if (paperScopeRef?.current) {
              paperScopeRef.current.activate();
              const { sideDeleted, paperPath: updatedPath } = deleteSelectedNodeOrHandle(paperPath, targetSegIndices, selectedHandleSide, paperScopeRef.current, nodeEditSelectedCurveIdxRef?.current);
              if (updatedPath) {
                paperPath = updatedPath;
                nodeEditPaperPathRef.current = updatedPath;
              }
              if (sideDeleted === 'in' || sideDeleted === 'out') {
                if (nodeEditSelectedHandleSideRef) nodeEditSelectedHandleSideRef.current = 'point';
              } else {
                if (nodeEditSelectedHandleSideRef) nodeEditSelectedHandleSideRef.current = null;
                if (nodeEditSelectedCurveIdxRef) nodeEditSelectedCurveIdxRef.current = null;
                if (nodeEditSelectedSegIdxRef) nodeEditSelectedSegIdxRef.current = null;
                if (nodeEditSelectedSegIndicesRef) nodeEditSelectedSegIndicesRef.current = new Set();
              }

              const dStr = cleanPaperPathData(paperPath);
              const remainingSegments = getPaperSegments(paperPath);
              const svgEl = pathEl.ownerSVGElement;

              let allCollapsed = false;
              if (remainingSegments.length > 0) {
                const firstPt = remainingSegments[0].point;
                allCollapsed = remainingSegments.every(s => Math.hypot(s.point.x - firstPt.x, s.point.y - firstPt.y) < 2.0);
              }
              if (remainingSegments.length <= 1 || allCollapsed || !dStr || dStr.trim() === '') {
                pathEl.remove();
                if (exitNodeEditMode) exitNodeEditMode();
                if (svgEl && saveModifiedPageHtml) {
                  saveModifiedPageHtml(pIdx, svgEl);
                }
                if (typeof setSelectedLayerId === 'function') setSelectedLayerId(null);
              } else {
                pathEl.setAttribute('d', dStr);
                if (sideDeleted === 'point' || sideDeleted === 'line') {
                  if (nodeEditSelectedSegIdxRef) nodeEditSelectedSegIdxRef.current = null;
                  if (nodeEditSelectedSegIndicesRef) nodeEditSelectedSegIndicesRef.current = new Set();
                }
                if (drawNodeEditOverlay) drawNodeEditOverlay(pathEl, paperPath, pIdx);
                if (svgEl && saveModifiedPageHtml) {
                  saveModifiedPageHtml(pIdx, svgEl);
                }
              }
              return;
            }
          }
        }

        // Delete selected element(s) from canvas
        const ids = (multiSelectedIdsRef?.current && multiSelectedIdsRef.current.size > 0)
          ? Array.from(multiSelectedIdsRef.current)
          : (selectedLayerIdRef?.current ? [selectedLayerIdRef.current] : []);

        if (ids.length === 0) return;

        const activeContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
        const svg = activeContainer?.querySelector('svg');
        if (!svg) return;

        let deleted = false;
        ids.forEach(id => {
          const el = svg.querySelector(`[id="${id}"]`);
          if (!el) return;

          const elName = el.getAttribute('data-name') || '';
          const elType = el.getAttribute('data-type') || '';
          const isLocked = el.getAttribute('data-locked') === 'true';

          if (!isLocked && !elName.includes('PDF Background') && !elName.includes('Overlay') && elType !== 'frame' && elType !== 'background') {
            el.remove();
            deleted = true;
          }
        });

        if (deleted && updatePageHtml) {
          updatePageHtml(activePageIndex, svg.outerHTML);
          const topFrames = getTopLevelFrames(svg);
          const rootId = (topFrames && topFrames.length > 0 ? topFrames[0].id : pages[activePageIndex]?.layers?.[0]?.id);
          if (rootId) {
            if (setSelectedLayerId) setSelectedLayerId(rootId);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set([rootId]));
            if (setCurrentFrameId) setCurrentFrameId(rootId);
            if (currentFrameIdRef) currentFrameIdRef.current = rootId;
          } else {
            if (setSelectedLayerId) setSelectedLayerId(null);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set());
            if (setCurrentFrameId) setCurrentFrameId(null);
            if (currentFrameIdRef) currentFrameIdRef.current = null;
          }
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 0.1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        else if (e.key === 'ArrowDown') dy = step;
        else if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowRight') dx = step;

        const ids = (multiSelectedIdsRef?.current && multiSelectedIdsRef.current.size > 0)
          ? Array.from(multiSelectedIdsRef.current)
          : (selectedLayerIdRef?.current ? [selectedLayerIdRef.current] : []);

        if (ids.length === 0) return;

        ids.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;

          const elName = el.getAttribute('data-name') || '';
          const elType = el.getAttribute('data-type') || '';
          const isLocked = el.getAttribute('data-locked') === 'true';

          if (isLocked ||
            elName.includes('PDF Background') ||
            elName.includes('Overlay') ||
            elType === 'frame' ||
            elType === 'background') {
            return;
          }

          const matrix = getElementMatrix(el);
          const nextMatrix = new DOMMatrix().translate(dx, dy).multiply(matrix);
          el.setAttribute('transform', matrixToTransform(nextMatrix));

          const highlightType = (currentFrameIdRef?.current && el.id !== currentFrameIdRef.current) ? 'child-selected' : 'selected';
          if (drawOverlayHighlight) drawOverlayHighlight(el, highlightType);
        });

        if (multiSelectedIdsRef?.current && multiSelectedIdsRef.current.size > 1) {
          if (drawMultiSelectionHighlight) {
            drawMultiSelectionHighlight(multiSelectedIdsRef.current, 'selected');
          }
        }

        if (updatePageHtml) {
          const activeContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
          const svg = activeContainer?.querySelector('svg');
          if (svg) updatePageHtml(activePageIndex, svg.outerHTML);
        }

        if (!nodeEditModeRef?.current && isAltPressedRef?.current && drawMeasurementOverlayRef?.current && lastMousePosRef?.current && lastMousePosRef.current.target) {
          let currentTarget = lastMousePosRef.current.target;
          if (currentTarget && !document.contains(currentTarget)) {
            currentTarget = document.elementFromPoint(lastMousePosRef.current.x, lastMousePosRef.current.y) || currentTarget;
            lastMousePosRef.current.target = currentTarget;
          }
          drawMeasurementOverlayRef.current(currentTarget, true);
        }
      }
    };

    const handleTriggerGroup = () => {
      handleKeyDown({ key: 'g', ctrlKey: true, preventDefault: () => { } });
    };
    const handleTriggerUngroup = () => {
      handleKeyDown({ key: 'G', ctrlKey: true, shiftKey: true, preventDefault: () => { } });
    };

    const handleTriggerMask = () => {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const activeContainer = doc.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`) || document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
      const svg = activeContainer?.querySelector('svg') || doc.querySelector('svg');
      if (!svg) return;

      const ids = (multiSelectedIdsRef?.current && multiSelectedIdsRef.current.size > 0)
        ? Array.from(multiSelectedIdsRef.current)
        : (selectedLayerIdRef?.current ? [selectedLayerIdRef.current] : []);
      if (ids.length === 0) return;

      const elements = ids.map(id => svg.querySelector(`[id="${id}"]`)).filter(Boolean);
      if (elements.length === 0) return;

      // Check if selected element is already part of a mask group to toggle/unmask
      const existingMaskGroup = elements.find(el => el.getAttribute('data-type') === 'mask-group' || el.closest('[data-type="mask-group"]'));
      if (existingMaskGroup) {
        const mg = existingMaskGroup.getAttribute('data-type') === 'mask-group' ? existingMaskGroup : existingMaskGroup.closest('[data-type="mask-group"]');
        if (mg && mg.parentNode) {
          const parent = mg.parentNode;
          const maskUid = mg.getAttribute('data-mask-id') || mg.id;
          const clipDef = svg.querySelector(`clipPath[id="clip-${maskUid}"]`);
          if (clipDef) clipDef.remove();

          const unmaskedIds = [];
          const children = Array.from(mg.children);
          children.forEach(child => {
            if (child.getAttribute('data-name') === 'Mask Content' || child.hasAttribute('clip-path')) {
              Array.from(child.children).forEach(nestedChild => {
                parent.insertBefore(nestedChild, mg);
                if (nestedChild.id) unmaskedIds.push(nestedChild.id);
              });
            } else {
              parent.insertBefore(child, mg);
              if (child.id) unmaskedIds.push(child.id);
            }
          });
          parent.removeChild(mg);

          if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);
          if (unmaskedIds.length > 0) {
            if (setSelectedLayerId) setSelectedLayerId(unmaskedIds[0]);
            if (setMultiSelectedIds) setMultiSelectedIds(new Set(unmaskedIds));
          }
          return;
        }
      }

      // 2. Multi-selection or single-selection mask creation
      let maskEl = null;
      let targetEls = [];

      if (elements.length >= 2) {
        elements.sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
        maskEl = elements[0];
        targetEls = elements.slice(1);
      } else if (elements.length === 1) {
        const el = elements[0];
        const isShape = el.getAttribute('data-is-element-shape') === 'true' ||
                        el.getAttribute('data-shape-type') ||
                        el.querySelector('[data-is-element-shape="true"]') !== null ||
                        ['path', 'rect', 'circle', 'ellipse', 'polygon', 'g'].includes(el.tagName.toLowerCase());

        if (isShape) {
          const shapeTarget = el.getAttribute('data-is-element-shape') === 'true'
            ? el
            : (el.querySelector('[data-is-element-shape="true"]') || el.querySelector('path, polygon, rect, circle, ellipse') || el);

          const isMasked = shapeTarget.getAttribute('data-mask-enabled') === 'true' ||
                          el.getAttribute('data-mask-enabled') === 'true' ||
                          (shapeTarget.getAttribute('fill') && shapeTarget.getAttribute('fill').includes('url(#pattern-')) ||
                          shapeTarget.hasAttribute('data-masked-image-url');

          if (isMasked) {
            // Unmask
            shapeTarget.removeAttribute('data-mask-enabled');
            el.removeAttribute('data-mask-enabled');
            const patternMatch = (shapeTarget.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
            if (patternMatch && patternMatch[1]) {
              const defs = svg.querySelector('defs');
              const pat = defs ? defs.querySelector(`pattern[id="${patternMatch[1]}"]`) : null;
              if (pat) pat.remove();
            }
            const origFill = shapeTarget.getAttribute('data-original-fill') || '#3194FC';
            shapeTarget.setAttribute('fill', origFill);
            shapeTarget.removeAttribute('data-pattern-id');
            shapeTarget.removeAttribute('data-masked-image-url');
            shapeTarget.removeAttribute('data-slot-image-name');
            shapeTarget.removeAttribute('data-slot-image-meta');
            shapeTarget.removeAttribute('data-slot-original-url');
            shapeTarget.removeAttribute('data-slot-crop-data');
            shapeTarget.removeAttribute('data-slot-fix-type');
            shapeTarget.removeAttribute('data-slot-opacity');
            shapeTarget.removeAttribute('data-slot-filters');
            el.removeAttribute('data-slot-image-name');
            el.removeAttribute('data-slot-image-meta');
            el.removeAttribute('data-slot-original-url');
            el.removeAttribute('data-slot-crop-data');
            el.removeAttribute('data-slot-fix-type');
            el.removeAttribute('data-slot-opacity');
            el.removeAttribute('data-slot-filters');

            if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);
            window.dispatchEvent(new CustomEvent('shape-mask-toggled', { detail: { layerId: el.id, enabled: false } }));
            return;
          } else {
            // Mask mode enabled
            shapeTarget.setAttribute('data-mask-enabled', 'true');
            el.setAttribute('data-mask-enabled', 'true');
            if (!shapeTarget.hasAttribute('data-original-fill')) {
              shapeTarget.setAttribute('data-original-fill', shapeTarget.getAttribute('fill') || '#3194FC');
            }

            if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);
            if (typeof setActiveMainTool === 'function') {
              setActiveMainTool('select');
            }
            window.dispatchEvent(new CustomEvent('shape-mask-toggled', { detail: { layerId: el.id, enabled: true } }));
            return;
          }
        }

        maskEl = elements[0];
        const parent = maskEl.parentNode;
        if (parent && parent !== svg) {
          const siblings = Array.from(parent.children).filter(el => el.id && el.id !== maskEl.id && el.tagName.toLowerCase() !== 'defs');
          if (siblings.length > 0) {
            targetEls = siblings;
          }
        }
      }

      if (!maskEl || targetEls.length === 0) return;

      const maskUid = 'mask-' + Date.now();
      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
      }

      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.id = `clip-${maskUid}`;
      
      const maskClone = maskEl.cloneNode(true);
      maskClone.removeAttribute('id');
      clipPath.appendChild(maskClone);
      defs.appendChild(clipPath);

      const parent = maskEl.parentNode;
      const maskGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      maskGroup.id = maskUid;
      maskGroup.setAttribute('data-name', 'Mask Group');
      maskGroup.setAttribute('data-type', 'mask-group');
      maskGroup.setAttribute('data-mask-id', maskUid);

      parent.insertBefore(maskGroup, maskEl);
      maskGroup.appendChild(maskEl);

      const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      contentGroup.setAttribute('clip-path', `url(#clip-${maskUid})`);
      contentGroup.setAttribute('data-name', 'Mask Content');
      targetEls.forEach(el => {
        contentGroup.appendChild(el);
      });
      maskGroup.appendChild(contentGroup);

      if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);
      if (setSelectedLayerId) setSelectedLayerId(maskGroup.id);
      if (setMultiSelectedIds) setMultiSelectedIds(new Set([maskGroup.id]));
    };

    const handleTriggerFlatten = () => {
      const activeContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
      const svg = activeContainer?.querySelector('svg');
      if (!svg) return;

      const ids = (multiSelectedIdsRef?.current && multiSelectedIdsRef.current.size > 0)
        ? Array.from(multiSelectedIdsRef.current)
        : (selectedLayerIdRef?.current ? [selectedLayerIdRef.current] : []);
      if (ids.length === 0) return;

      let elements = ids.map(id => svg.querySelector(`[id="${id}"]`)).filter(Boolean);
      if (elements.length === 0) return;

      // Expand compound groups if child was selected, or promote child to compound group
      elements = elements.map(el => {
        const compoundGroup = el.parentElement?.closest?.(
          '[data-is-element-shape="true"], [data-type="shape"], [data-shape-type], g[id^="shape-"], [data-is-image-frame="true"], [data-type="mask-group"]'
        ) || el.closest?.(
          '[data-is-element-shape="true"], [data-type="shape"], [data-shape-type], g[id^="shape-"], [data-is-image-frame="true"], [data-type="mask-group"]'
        );
        return compoundGroup || el;
      });
      // Deduplicate elements
      elements = Array.from(new Set(elements));

      const lastEl = elements[elements.length - 1];
      const parent = lastEl?.parentNode;
      if (!parent) return;

      if (paperScopeRef?.current) {
        paperScopeRef.current.activate();
      }
      const paperScope = paperScopeRef?.current;
      if (!paperScope) return;

      const createPaperItemFromNode = (node) => {
        const tag = node.tagName?.toLowerCase();
        if (tag === 'circle') {
          const cx = parseFloat(node.getAttribute('cx') || '0');
          const cy = parseFloat(node.getAttribute('cy') || '0');
          const r = parseFloat(node.getAttribute('r') || '0');
          return new paperScope.Path.Circle(new paperScope.Point(cx, cy), r);
        }
        if (tag === 'ellipse') {
          const cx = parseFloat(node.getAttribute('cx') || '0');
          const cy = parseFloat(node.getAttribute('cy') || '0');
          const rx = parseFloat(node.getAttribute('rx') || '0');
          const ry = parseFloat(node.getAttribute('ry') || '0');
          return new paperScope.Path.Ellipse(new paperScope.Rectangle(cx - rx, cy - ry, rx * 2, ry * 2));
        }
        if (tag === 'rect') {
          const x = parseFloat(node.getAttribute('x') || '0');
          const y = parseFloat(node.getAttribute('y') || '0');
          const w = parseFloat(node.getAttribute('width') || '0');
          const h = parseFloat(node.getAttribute('height') || '0');
          const rx = parseFloat(node.getAttribute('rx') || '0');
          const ry = parseFloat(node.getAttribute('ry') || rx || '0');
          if (rx > 0 || ry > 0) {
            return new paperScope.Path.Rectangle(new paperScope.Rectangle(x, y, w, h), new paperScope.Size(rx, ry));
          }
          return new paperScope.Path.Rectangle(new paperScope.Rectangle(x, y, w, h));
        }
        if (tag === 'polygon' || tag === 'polyline') {
          const pointsAttr = node.getAttribute('points') || '';
          const pairs = pointsAttr.trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
          if (pairs.length >= 4) {
            const p = new paperScope.Path();
            for (let i = 0; i < pairs.length; i += 2) {
              p.add(new paperScope.Point(pairs[i], pairs[i + 1]));
            }
            if (tag === 'polygon') p.closed = true;
            return p;
          }
        }
        if (tag === 'line') {
          const x1 = parseFloat(node.getAttribute('x1') || '0');
          const y1 = parseFloat(node.getAttribute('y1') || '0');
          const x2 = parseFloat(node.getAttribute('x2') || '0');
          const y2 = parseFloat(node.getAttribute('y2') || '0');
          return new paperScope.Path.Line(new paperScope.Point(x1, y1), new paperScope.Point(x2, y2));
        }
        if (tag === 'image') {
          const x = parseFloat(node.getAttribute('x') || '0');
          const y = parseFloat(node.getAttribute('y') || '0');
          const w = parseFloat(node.getAttribute('width') || '0');
          const h = parseFloat(node.getAttribute('height') || '0');
          return new paperScope.Path.Rectangle(new paperScope.Rectangle(x, y, w, h));
        }
        if (tag === 'path') {
          const d = node.getAttribute('d');
          if (d) {
            try {
              const item = new paperScope.CompoundPath(d);
              if (item.children && item.children.length === 1) return item.children[0];
              return item;
            } catch {
              return new paperScope.Path(d);
            }
          }
        }
        return null;
      };

      const collectShapesWithStyles = (node, inherited = {}) => {
        let list = [];
        const tag = node.tagName?.toLowerCase();

        if (node.id === 'ghost-layer' || node.getAttribute?.('data-name') === 'Overlay' || tag === 'defs' || tag === 'clippath') {
          return list;
        }

        const rawFill = node.getAttribute?.('data-fill-color') || node.getAttribute?.('fill') || node.style?.fill;
        const nodeFill = (rawFill && rawFill !== 'inherit') ? rawFill : inherited.fill;

        // Check data-stroke-color first, then stroke attribute/style
        const explicitStroke = node.getAttribute?.('data-stroke-color');
        const standardStroke = node.getAttribute?.('stroke') || node.style?.stroke;
        const rawStroke = (explicitStroke && explicitStroke !== 'none' && explicitStroke !== '#' && explicitStroke !== 'inherit')
          ? explicitStroke
          : ((standardStroke && standardStroke !== 'inherit' && standardStroke !== 'none' && standardStroke !== '#') ? standardStroke : null);

        const nodeStroke = (rawStroke !== null && rawStroke !== undefined)
          ? rawStroke
          : (inherited.stroke && inherited.stroke !== 'none' && inherited.stroke !== 'inherit' && inherited.stroke !== '#' ? inherited.stroke : (rawStroke || standardStroke || inherited.stroke));

        const rawStrokeWidth = node.getAttribute?.('data-stroke-width') || node.getAttribute?.('stroke-width') || node.style?.strokeWidth;
        const nodeStrokeWidth = (rawStrokeWidth && rawStrokeWidth !== 'inherit' && rawStrokeWidth !== '0') ? rawStrokeWidth : (inherited.strokeWidth || rawStrokeWidth);
        const nodeOpacity = node.getAttribute?.('opacity') || node.style?.opacity;
        const nodeLinecap = node.getAttribute?.('stroke-linecap') || node.style?.strokeLinecap;
        const nodeLinejoin = node.getAttribute?.('stroke-linejoin') || node.style?.strokeLinejoin;
        const nodePaintOrder = node.getAttribute?.('paint-order') || node.style?.paintOrder;
        const nodeStrokeDash = node.getAttribute?.('stroke-dasharray') || node.getAttribute?.('data-stroke-dasharray');
        const nodeDataStrokeWidth = node.getAttribute?.('data-stroke-width') || inherited.dataStrokeWidth;
        const nodeDataStrokePos = node.getAttribute?.('data-stroke-position') || inherited.dataStrokePos;

        const effective = {
          fill: (nodeFill && nodeFill !== 'inherit') ? nodeFill : (inherited.fill || '#3194FC'),
          stroke: (nodeStroke && nodeStroke !== 'inherit') ? nodeStroke : (inherited.stroke || 'none'),
          strokeWidth: (nodeStrokeWidth && nodeStrokeWidth !== 'inherit') ? nodeStrokeWidth : (inherited.strokeWidth || '0'),
          opacity: (nodeOpacity && nodeOpacity !== 'inherit') ? nodeOpacity : inherited.opacity,
          linecap: (nodeLinecap && nodeLinecap !== 'inherit') ? nodeLinecap : inherited.linecap,
          linejoin: (nodeLinejoin && nodeLinejoin !== 'inherit') ? nodeLinejoin : inherited.linejoin,
          paintOrder: nodePaintOrder || inherited.paintOrder,
          strokeDash: nodeStrokeDash || inherited.strokeDash,
          dataStrokeWidth: nodeDataStrokeWidth,
          dataStrokePos: nodeDataStrokePos,
        };

        const imgUrl = node.getAttribute?.('data-masked-image-url') || node.getAttribute?.('data-slot-original-url') || node.getAttribute?.('href') || node.getAttribute?.('xlink:href');
        if (imgUrl) {
          effective.imageUrl = imgUrl;
        }
        const imgName = node.getAttribute?.('data-slot-image-name');
        if (imgName) effective.imageName = imgName;
        const imgMeta = node.getAttribute?.('data-slot-image-meta');
        if (imgMeta) effective.imageMeta = imgMeta;
        const origUrl = node.getAttribute?.('data-slot-original-url');
        if (origUrl) effective.originalUrl = origUrl;

        // If node has pattern fill, check image inside pattern
        if (effective.fill && effective.fill.includes('url(#')) {
          const patMatch = effective.fill.match(/#([^)'"]+)/);
          if (patMatch) {
            const patEl = svg.querySelector(`pattern[id="${patMatch[1]}"]`);
            const pImg = patEl?.querySelector?.('image, img');
            if (pImg) {
              const pHref = pImg.getAttribute('href') || pImg.getAttribute('xlink:href') || pImg.src;
              if (pHref) effective.imageUrl = pHref;
            }
          }
        }

        if (tag === 'g') {
          if (node.getAttribute?.('data-type') === 'mask-group') {
            const clipUrl = node.querySelector?.('[clip-path]')?.getAttribute?.('clip-path') || node.getAttribute?.('clip-path');
            const clipIdMatch = (clipUrl || '').match(/#([^)'"]+)/);
            if (clipIdMatch) {
              const clipEl = svg.querySelector(`clipPath[id="${clipIdMatch[1]}"]`);
              if (clipEl) {
                Array.from(clipEl.children).forEach(clipChild => {
                  list = list.concat(collectShapesWithStyles(clipChild, effective));
                });
                const innerImg = node.querySelector?.('image, img');
                if (innerImg) {
                  const href = innerImg.getAttribute('href') || innerImg.getAttribute('xlink:href') || innerImg.src;
                  if (href) effective.imageUrl = href;
                }
                return list;
              }
            }
          }

          Array.from(node.children).forEach(child => {
            list = list.concat(collectShapesWithStyles(child, effective));
          });
        } else {
          list.push({ node, styles: effective });
        }
        return list;
      };

      const allShapes = [];
      elements.forEach(el => {
        allShapes.push(...collectShapesWithStyles(el));
      });

      if (allShapes.length === 0) return;

      const validPaths = [];
      let baseFill = null;
      let baseStroke = null;
      let baseStrokeWidth = null;
      let baseOpacity = null;
      let baseLinecap = null;
      let baseLinejoin = null;
      let basePaintOrder = null;
      let baseStrokeDash = null;
      let baseDataStrokeWidth = null;
      let baseDataStrokePos = null;
      let baseImageUrl = null;
      let baseImageName = null;
      let baseImageMeta = null;
      let baseOriginalUrl = null;

      allShapes.forEach(({ node, styles }) => {
        try {
          const paperItem = createPaperItemFromNode(node);
          if (!paperItem) return;

          // Bake transforms up to parent container where flatPath will be inserted!
          // Stopping at parent prevents doubling the parent's transform!
          let curr = node;
          const matrices = [];
          while (curr && curr !== parent && curr.tagName && curr.tagName.toLowerCase() !== 'svg') {
            const transformAttr = curr.getAttribute?.('transform');
            const styleTransform = curr.style?.transform || curr.style?.translate;
            if (transformAttr || styleTransform) {
              matrices.unshift(parseSingleMatrix(curr));
            }
            curr = curr.parentElement;
          }
          let combinedMatrix = new DOMMatrix();
          matrices.forEach(m => {
            combinedMatrix = combinedMatrix.multiply(m);
          });

          if (!combinedMatrix.isIdentity) {
            const paperMatrix = new paperScope.Matrix(
              combinedMatrix.a, combinedMatrix.b,
              combinedMatrix.c, combinedMatrix.d,
              combinedMatrix.e, combinedMatrix.f
            );
            paperItem.transform(paperMatrix);
          }

          let bakedD = cleanPaperPathData ? cleanPaperPathData(paperItem) : null;
          if (!bakedD || bakedD.trim() === '') {
            bakedD = paperItem.pathData;
          }

          if (bakedD) {
            if (!baseFill && styles.fill && styles.fill !== 'none' && styles.fill !== 'inherit') baseFill = styles.fill;
            if (!baseStroke && styles.stroke && styles.stroke !== 'none' && styles.stroke !== 'inherit' && styles.stroke !== '#') baseStroke = styles.stroke;
            if (!baseStrokeWidth && styles.strokeWidth && styles.strokeWidth !== '0') baseStrokeWidth = styles.strokeWidth;
            if (!baseOpacity && styles.opacity) baseOpacity = styles.opacity;
            if (!baseLinecap && styles.linecap) baseLinecap = styles.linecap;
            if (!baseLinejoin && styles.linejoin) baseLinejoin = styles.linejoin;
            if (!basePaintOrder && styles.paintOrder) basePaintOrder = styles.paintOrder;
            if (!baseStrokeDash && styles.strokeDash) baseStrokeDash = styles.strokeDash;
            if (!baseDataStrokeWidth && styles.dataStrokeWidth) baseDataStrokeWidth = styles.dataStrokeWidth;
            if (!baseDataStrokePos && styles.dataStrokePos) baseDataStrokePos = styles.dataStrokePos;
            if (!baseImageUrl && styles.imageUrl) baseImageUrl = styles.imageUrl;
            if (!baseImageName && styles.imageName) baseImageName = styles.imageName;
            if (!baseImageMeta && styles.imageMeta) baseImageMeta = styles.imageMeta;
            if (!baseOriginalUrl && styles.originalUrl) baseOriginalUrl = styles.originalUrl;
            validPaths.push({ node, bakedD, styles });
          }
        } catch (err) {
          console.warn('Error processing shape in flatten:', err);
        }
      });

      if (validPaths.length === 0) return;

      // Preserve image as an SVG pattern fill if shape or selection had an image
      if (baseImageUrl) {
        let defs = svg.querySelector('defs');
        if (!defs) {
          defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          svg.insertBefore(defs, svg.firstChild);
        }
        const patId = 'pattern-flat-' + Date.now();
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.id = patId;
        pattern.setAttribute('patternUnits', 'objectBoundingBox');
        pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
        pattern.setAttribute('width', '1');
        pattern.setAttribute('height', '1');
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('href', baseImageUrl);
        img.setAttribute('width', '1');
        img.setAttribute('height', '1');
        img.setAttribute('preserveAspectRatio', 'none');
        pattern.appendChild(img);
        defs.appendChild(pattern);
        baseFill = `url(#${patId})`;
      }

      let combinedD = '';
      if (validPaths.length === 1) {
        combinedD = validPaths[0].bakedD;
      } else if (validPaths.length >= 2) {
        try {
          let united = null;
          for (const item of validPaths) {
            const p = new paperScope.Path(item.bakedD);
            if (!united) {
              united = p;
            } else {
              try {
                const u = united.unite(p);
                if (u && u.pathData) {
                  united = u;
                } else {
                  united = new paperScope.CompoundPath({ children: [united, p] });
                }
              } catch (e) {
                united = new paperScope.CompoundPath({ children: [united, p] });
              }
            }
          }
          if (united) {
            combinedD = cleanPaperPathData ? cleanPaperPathData(united) : united.pathData;
          }
        } catch (err) {
          console.warn('Paper.js union fallback:', err);
        }
        if (!combinedD) {
          combinedD = validPaths.map(p => p.bakedD).join(' ');
        }
      }

      const flatPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      flatPath.id = `shape-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
      flatPath.setAttribute('data-name', 'Shape');
      flatPath.setAttribute('data-type', 'shape');
      flatPath.setAttribute('data-shape-type', 'shape');
      flatPath.setAttribute('vector-effect', 'non-scaling-stroke');
      flatPath.setAttribute('d', combinedD);

      if (baseFill && baseFill !== 'inherit' && baseFill !== 'none') {
        flatPath.setAttribute('fill', baseFill);
        flatPath.setAttribute('data-fill-color', baseFill);
      } else if (baseFill === 'none') {
        flatPath.setAttribute('fill', 'none');
        flatPath.removeAttribute('data-fill-color');
      } else {
        flatPath.setAttribute('fill', '#3194FC');
        flatPath.setAttribute('data-fill-color', '#3194FC');
      }

      if (baseImageUrl) {
        flatPath.setAttribute('data-mask-enabled', 'true');
        flatPath.setAttribute('data-masked-image-url', baseImageUrl);
        if (baseOriginalUrl) flatPath.setAttribute('data-slot-original-url', baseOriginalUrl);
        if (baseImageName) flatPath.setAttribute('data-slot-image-name', baseImageName);
        if (baseImageMeta) flatPath.setAttribute('data-slot-image-meta', baseImageMeta);
      }
      if (baseStroke && baseStroke !== 'none' && baseStroke !== 'inherit' && baseStroke !== '#' && baseStroke !== 'transparent') {
        flatPath.setAttribute('stroke', baseStroke);
        flatPath.setAttribute('data-stroke-color', baseStroke);
        const sw = (baseDataStrokeWidth && baseDataStrokeWidth !== '0') ? baseDataStrokeWidth : (baseStrokeWidth || '1');
        const pos = baseDataStrokePos || 'Outside';
        flatPath.setAttribute('data-stroke-position', pos);
        flatPath.setAttribute('data-stroke-width', sw);

        if (pos === 'Outside') {
          flatPath.setAttribute('stroke-width', (parseFloat(sw) * 2).toString());
          flatPath.setAttribute('paint-order', 'stroke fill');
          flatPath.style.paintOrder = 'stroke fill';
        } else if (pos === 'Inside') {
          flatPath.setAttribute('stroke-width', (parseFloat(sw) * 2).toString());
          flatPath.setAttribute('paint-order', 'fill stroke');
          flatPath.style.paintOrder = 'fill stroke';
        } else {
          flatPath.setAttribute('stroke-width', sw);
          flatPath.setAttribute('paint-order', 'normal');
          flatPath.style.paintOrder = 'normal';
        }

        if (baseStrokeDash) {
          flatPath.setAttribute('stroke-dasharray', baseStrokeDash);
          flatPath.setAttribute('data-stroke-dasharray', baseStrokeDash);
        }
        if (baseLinecap) flatPath.setAttribute('stroke-linecap', baseLinecap);
        if (baseLinejoin) flatPath.setAttribute('stroke-linejoin', baseLinejoin);
      } else {
        flatPath.setAttribute('stroke', 'none');
        flatPath.setAttribute('stroke-width', '0');
        flatPath.removeAttribute('data-stroke-color');
        flatPath.removeAttribute('data-stroke-width');
      }
      if (baseOpacity && baseOpacity !== '1') {
        flatPath.setAttribute('opacity', baseOpacity);
      }

      parent.insertBefore(flatPath, lastEl.nextSibling);

      elements.forEach(el => {
        const overlay = el.parentNode?.querySelector(`.svg-shape-stroke-overlay[data-target="${el.id}"]`);
        if (overlay) overlay.remove();
        if (el.parentNode) el.parentNode.removeChild(el);
      });

      if (updatePageHtml) updatePageHtml(activePageIndex, svg.outerHTML);
      if (saveModifiedPageHtml) saveModifiedPageHtml(activePageIndex, svg);

      if (setSelectedLayerId) setSelectedLayerId(flatPath.id);
      if (selectedLayerIdRef) selectedLayerIdRef.current = flatPath.id;
      if (setMultiSelectedIds) setMultiSelectedIds(new Set([flatPath.id]));
      if (multiSelectedIdsRef) multiSelectedIdsRef.current = new Set([flatPath.id]);

      window.dispatchEvent(new CustomEvent('trigger-rebind-selection', { detail: { layerId: flatPath.id, pageIndex: activePageIndex } }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-group', handleTriggerGroup);
    window.addEventListener('trigger-ungroup', handleTriggerUngroup);
    window.addEventListener('trigger-mask', handleTriggerMask);
    window.addEventListener('trigger-flatten', handleTriggerFlatten);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-group', handleTriggerGroup);
      window.removeEventListener('trigger-ungroup', handleTriggerUngroup);
      window.removeEventListener('trigger-mask', handleTriggerMask);
      window.removeEventListener('trigger-flatten', handleTriggerFlatten);
    };
  }, [activePageIndex, activeTopTool, activeMainTool, setActiveMainTool, selectedPenTool, setSelectedPenTool, pages, updatePageHtml, saveModifiedPageHtml, setSelectedLayerId, setMultiSelectedIds, setCurrentFrameId, currentFrameIdRef, selectedLayerIdRef, multiSelectedIdsRef, vectraPenSessionRef, drawingPathRef, commitAndExitPenDrawing, clearVectraOverlay, renderVectraOverlay, nodeEditModeRef, nodeEditPaperPathRef, nodeEditPathRef, nodeEditPageIndexRef, nodeEditSelectedSegIndicesRef, nodeEditSelectedSegIdxRef, nodeEditSelectedHandleSideRef, nodeEditSelectedCurveIdxRef, paperScopeRef, enterNodeEditMode, exitNodeEditMode, drawNodeEditOverlay, drawOverlayHighlight, drawMultiSelectionHighlight, isAltPressedRef, drawMeasurementOverlayRef, lastMousePosRef]);
};

export default useCanvasKeyboardShortcuts;
