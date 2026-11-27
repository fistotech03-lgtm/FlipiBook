/**
 * useHistoryManager.js
 * Manages synchronous ref-backed Undo / Redo dual-stack history with
 * burst coalescing and selection restoration.
 */

import { useState, useRef } from 'react';

const MAX_HISTORY = 50;

export const useHistoryManager = ({
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
}) => {
  const [history, setHistoryState] = useState([]);
  const [redoStack, setRedoStackState] = useState([]);

  // Synchronous refs eliminate stale-closure bugs when saveToHistory / undo / redo
  // are invoked from event listeners, drag/resize callbacks, or rapid bursts.
  const historyRef = useRef([]);
  const redoStackRef = useRef([]);
  const pagesRef = useRef(pages);
  const selectedLayerIdRef = useRef(selectedLayerId);
  const activePageIndexRef = useRef(activePageIndex);
  const multiSelectedIdsRef = useRef(multiSelectedIds);
  const lastBurstRef = useRef({ key: null, time: 0 });

  pagesRef.current = pages;
  selectedLayerIdRef.current = selectedLayerId;
  activePageIndexRef.current = activePageIndex;
  multiSelectedIdsRef.current = multiSelectedIds;

  const setHistory = (updater) => {
    const next = typeof updater === 'function' ? updater(historyRef.current) : updater;
    historyRef.current = next;
    setHistoryState(next);
  };

  const setRedoStack = (updater) => {
    const next = typeof updater === 'function' ? updater(redoStackRef.current) : updater;
    redoStackRef.current = next;
    setRedoStackState(next);
  };

  const saveToHistory = (
    customPages,
    customLayerId,
    customPageIndex,
    customMultiIds,
    options = null
  ) => {
    const srcPages = customPages !== undefined ? customPages : pagesRef.current;
    const srcLayerId = customLayerId !== undefined ? customLayerId : selectedLayerIdRef.current;
    const srcPageIndex = customPageIndex !== undefined ? customPageIndex : activePageIndexRef.current;
    const srcMultiIds = customMultiIds !== undefined ? customMultiIds : multiSelectedIdsRef.current;

    if (!Array.isArray(srcPages)) return;

    // Coalesce rapid multi-attribute bursts (e.g. Interaction / Animation / Gradient presets)
    // within the same animation frame (~24ms) into a single atomic undo step.
    const coalesceKey = options?.coalesceKey;
    if (coalesceKey) {
      const now = Date.now();
      if (lastBurstRef.current.key === coalesceKey && (now - lastBurstRef.current.time) < 24) {
        lastBurstRef.current.time = now;
        return;
      }
      lastBurstRef.current = { key: coalesceKey, time: now };
    } else {
      lastBurstRef.current = { key: null, time: 0 };
    }

    // Fast shallow clone of page objects without re-serializing giant 10MB+ strings
    const snapPages = srcPages.map(p => ({ ...p }));
    const snap = {
      pages: snapPages,
      selectedLayerId: srcLayerId,
      activePageIndex: srcPageIndex,
      multiSelectedIds: Array.from(srcMultiIds || [])
    };

    const prev = historyRef.current;
    if (prev.length > 0) {
      const last = prev[prev.length - 1];
      const lastPages = Array.isArray(last) ? last : last.pages;
      const lastLayerId = Array.isArray(last) ? null : last.selectedLayerId;
      const lastPageIndex = Array.isArray(last) ? null : last.activePageIndex;
      const lastMultiIds = Array.isArray(last) ? [] : (last.multiSelectedIds || []);

      const isSamePages = lastPages && lastPages.length === snap.pages.length &&
        lastPages.every((lp, idx) => lp.html === snap.pages[idx]?.html && lp.id === snap.pages[idx]?.id);
      const isSameLayerId = lastLayerId === snap.selectedLayerId;
      const isSamePageIndex = lastPageIndex === snap.activePageIndex;
      const isSameMultiIds = lastMultiIds.length === snap.multiSelectedIds.length &&
        lastMultiIds.every((id, idx) => id === snap.multiSelectedIds[idx]);

      if (isSamePages && isSameLayerId && isSamePageIndex && isSameMultiIds) {
        return;
      }
    }

    const nextHistory = [...prev.slice(-(MAX_HISTORY - 1)), snap];
    historyRef.current = nextHistory;
    redoStackRef.current = [];
    setHistoryState(nextHistory);
    setRedoStackState([]);
  };

  const applySnapshot = (targetSnap) => {
    window.__isApplyingHistory = true;
    const targetPages = Array.isArray(targetSnap) ? targetSnap : targetSnap.pages;
    const targetLayerId = Array.isArray(targetSnap) ? null : targetSnap.selectedLayerId;
    const targetPageIndex = Array.isArray(targetSnap) ? activePageIndexRef.current : targetSnap.activePageIndex;
    const targetMultiIds = Array.isArray(targetSnap) ? new Set() : new Set(targetSnap.multiSelectedIds || []);

    pagesRef.current = targetPages;
    selectedLayerIdRef.current = targetLayerId;
    if (targetPageIndex !== undefined && targetPageIndex !== null && targetPageIndex >= 0) {
      activePageIndexRef.current = targetPageIndex;
    }
    multiSelectedIdsRef.current = targetLayerId ? new Set([targetLayerId]) : targetMultiIds;

    prevSelectedLayerIdRef.current = targetLayerId;
    prevMultiSelectedIdsRef.current = targetMultiIds;

    setPages(targetPages);
    if (targetPageIndex !== undefined && targetPageIndex !== null && targetPageIndex >= 0) {
      setActivePageIndex(targetPageIndex);
    }

    // Restore selection state exactly as captured in the snapshot (Figma style)
    if (targetLayerId) {
      setSelectedLayerId(targetLayerId);
      setMultiSelectedIds(new Set([targetLayerId]));
    } else {
      setSelectedLayerId(null);
      setMultiSelectedIds(targetMultiIds);
    }

    const rebind = () => {
      if (targetLayerId) {
        window.dispatchEvent(new CustomEvent('rebind-selection-overlay', { detail: { layerId: targetLayerId } }));
      }
    };
    requestAnimationFrame(() => {
      window.__isApplyingHistory = false;
      window.dispatchEvent(new CustomEvent('sync-layers-panel'));
      rebind();
      setTimeout(rebind, 30);
      setTimeout(rebind, 100);
    });
  };

  const undo = () => {
    // While drawing with the Pen, Undo removes the last point only
    if (window.__penPointHistory?.undo?.()) return;
    const currentHistory = historyRef.current;
    if (currentHistory.length === 0) return;

    lastBurstRef.current = { key: null, time: 0 };
    isUndoRedoActiveRef.current = true;
    // Undo/redo must ALWAYS repaint the canvas
    window.__skipCanvasUpdateForPage = -1;

    const currentSnap = {
      pages: (pagesRef.current || []).map(p => ({ ...p })),
      selectedLayerId: selectedLayerIdRef.current,
      activePageIndex: activePageIndexRef.current,
      multiSelectedIds: Array.from(multiSelectedIdsRef.current || [])
    };

    const prevSnap = currentHistory[currentHistory.length - 1];
    const nextHistory = currentHistory.slice(0, -1);
    const nextRedo = [currentSnap, ...redoStackRef.current];

    historyRef.current = nextHistory;
    redoStackRef.current = nextRedo;
    setHistoryState(nextHistory);
    setRedoStackState(nextRedo);

    applySnapshot(prevSnap);
  };

  const redo = () => {
    // While drawing with the Pen, Redo brings back the last removed point
    if (window.__penPointHistory?.redo?.()) return;
    const currentRedo = redoStackRef.current;
    if (currentRedo.length === 0) return;

    lastBurstRef.current = { key: null, time: 0 };
    isUndoRedoActiveRef.current = true;
    // Undo/redo must ALWAYS repaint the canvas
    window.__skipCanvasUpdateForPage = -1;

    const currentSnap = {
      pages: (pagesRef.current || []).map(p => ({ ...p })),
      selectedLayerId: selectedLayerIdRef.current,
      activePageIndex: activePageIndexRef.current,
      multiSelectedIds: Array.from(multiSelectedIdsRef.current || [])
    };

    const nextSnap = currentRedo[0];
    const nextRedo = currentRedo.slice(1);
    const nextHistory = [...historyRef.current, currentSnap];

    redoStackRef.current = nextRedo;
    historyRef.current = nextHistory;
    setRedoStackState(nextRedo);
    setHistoryState(nextHistory);

    applySnapshot(nextSnap);
  };

  return {
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
  };
};
