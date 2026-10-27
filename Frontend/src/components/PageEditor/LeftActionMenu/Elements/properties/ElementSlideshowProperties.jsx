/**
 * ElementSlideshowProperties.jsx
 * Full-featured Slideshow Property Inspector adapter for FlipiBook
 */
import React from 'react';
import SlideshowEditor from './slideshowEditor';

export default function ElementSlideshowProperties({
  selectedElement,
  selectedElementProps,
  updateElementAttribute,
  activePageIndex,
  selectedLayerId,
  effectiveFolder,
  effectiveBook,
  effectiveVId,
  currentPageVId,
  onDeleteLayer
}) {
  const getSelectedElement = () => {
    if (selectedElement && typeof selectedElement.getAttribute === 'function') {
      return selectedElement.closest?.('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]') || selectedElement;
    }
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const base = editorDoc.getElementById(selectedLayerId);
    return base?.closest?.('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]') || base;
  };

  const el = getSelectedElement();

  const handleUpdate = (newHtml) => {
    window.__skipCanvasUpdateForPage = activePageIndex;
    if (typeof newHtml === 'string') {
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
    } else {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const targetNode = el || editorDoc.getElementById(selectedLayerId);
      if (!targetNode) return;
      const svgRoot = targetNode.ownerSVGElement || targetNode.closest?.('svg') || editorDoc.querySelector('svg');
      if (svgRoot) {
        const serializer = new XMLSerializer();
        const html = serializer.serializeToString(svgRoot);
        updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
      }
    }
  };

  return (
    <div className="w-full">
      <SlideshowEditor
        selectedElement={el}
        activePageIndex={activePageIndex}
        currentPageVId={currentPageVId || selectedElementProps?.pageVId || ''}
        onUpdate={handleUpdate}
        isOpen={true}
        flipbookName={effectiveBook}
        flipbookVId={effectiveVId}
        folderName={effectiveFolder}
        opacity={selectedElementProps?.opacity !== undefined ? Math.round(parseFloat(selectedElementProps.opacity) * 100) : 100}
        onUpdateOpacity={(newOpacity) => {
          updateElementAttribute(activePageIndex, selectedLayerId, 'opacity', (newOpacity / 100).toString());
        }}
        onDeleteLayer={onDeleteLayer}
      />
    </div>
  );
}
