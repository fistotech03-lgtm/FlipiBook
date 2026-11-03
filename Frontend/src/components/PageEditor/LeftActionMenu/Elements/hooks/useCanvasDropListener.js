import { useEffect } from 'react';
import { getElementItemById } from '../elementCatalog';

/**
 * useCanvasDropListener
 * Listens for external canvas drag-drop events and inserts elements at the dropped coordinates
 */
export function useCanvasDropListener(onInsert) {
  useEffect(() => {
    const handleAddElementEvent = (e) => {
      const { pageIndex, elementId, dropPoint } = e.detail || {};
      const item = getElementItemById(elementId);
      if (!item) return;

      if (typeof onInsert === 'function') {
        onInsert(item, dropPoint?.x, dropPoint?.y, pageIndex);
      }
    };

    window.addEventListener('add-element-to-editor', handleAddElementEvent);
    return () => {
      window.removeEventListener('add-element-to-editor', handleAddElementEvent);
    };
  }, [onInsert]);
}

export default useCanvasDropListener;
