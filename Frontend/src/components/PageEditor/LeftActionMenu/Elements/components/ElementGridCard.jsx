import React, { useRef } from 'react';

/**
 * ElementGridCard
 * Renders an individual draggable & clickable element card in the Add Elements grid
 */
export function ElementGridCard({ item, onInsert }) {
  if (!item) return null;

  const previewRef = useRef(null);

  const handleDragStart = (e) => {
    let ghostWidth = 60;
    let ghostHeight = 60;

    if (previewRef.current) {
      const visualEl = previewRef.current.querySelector('svg') || previewRef.current.firstElementChild || previewRef.current;
      const visualRect = visualEl ? visualEl.getBoundingClientRect() : previewRef.current.getBoundingClientRect();
      ghostWidth = Math.max(36, Math.round(visualRect.width || 60));
      ghostHeight = Math.max(36, Math.round(visualRect.height || 60));
    }

    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'element',
        elementId: item.id,
        dragWidth: ghostWidth,
        dragHeight: ghostHeight,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';

    // Customize the drag preview ghost so only the element itself is dragged (excluding outer card and name)
    if (previewRef.current && e.dataTransfer.setDragImage) {
      try {
        const previewEl = previewRef.current;
        const visualEl = previewEl.querySelector('svg') || previewEl.firstElementChild || previewEl;

        // Create an isolated ghost container rendered inside the viewport bounds behind the document
        // (Chrome requires elements to be in-viewport to rasterize setDragImage, z-index -99999 hides it)
        const ghost = document.createElement('div');
        ghost.style.position = 'fixed';
        ghost.style.top = '0px';
        ghost.style.left = '0px';
        ghost.style.width = `${ghostWidth}px`;
        ghost.style.height = `${ghostHeight}px`;
        ghost.style.margin = '0';
        ghost.style.padding = '0';
        ghost.style.border = 'none';
        ghost.style.outline = 'none';
        ghost.style.borderRadius = '0';
        ghost.style.boxShadow = 'none';
        ghost.style.background = 'transparent';
        ghost.style.backgroundColor = 'transparent';
        ghost.style.display = 'flex';
        ghost.style.alignItems = 'center';
        ghost.style.justifyContent = 'center';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '-99999';
        ghost.style.opacity = '0.99';

        // Clone only the visual element (SVG, icon, or preview graphic)
        const clone = visualEl.cloneNode(true);
        if (clone.style) {
          clone.style.margin = '0';
          clone.style.padding = '0';
          clone.style.border = 'none';
          clone.style.outline = 'none';
          clone.style.borderRadius = '0';
          clone.style.boxShadow = 'none';
          clone.style.background = 'transparent';
          clone.style.backgroundColor = 'transparent';
          clone.style.transform = 'none';
        }

        // If SVG, ensure clean width/height and viewBox
        if (clone.tagName && clone.tagName.toLowerCase() === 'svg') {
          clone.setAttribute('width', `${ghostWidth}`);
          clone.setAttribute('height', `${ghostHeight}`);
          clone.style.width = `${ghostWidth}px`;
          clone.style.height = `${ghostHeight}px`;
          clone.style.maxWidth = 'none';
          clone.style.maxHeight = 'none';
        }

        ghost.appendChild(clone);
        document.body.appendChild(ghost);

        e.dataTransfer.setDragImage(ghost, ghostWidth / 2, ghostHeight / 2);

        // Clean up ghost after drag begins or on dragend
        const cleanupGhost = () => {
          if (ghost && ghost.parentNode) {
            ghost.remove();
          }
          window.removeEventListener('dragend', cleanupGhost);
        };
        window.addEventListener('dragend', cleanupGhost, { once: true });
        setTimeout(cleanupGhost, 1000);
      } catch (err) {
        console.warn('[ElementGridCard] Failed to set drag image:', err);
      }
    }

    // Dispatch in next animation frame so the browser can initialize native drag session & ghost image first
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('element-drag-start', { detail: { item } }));
    });
  };

  const handleDragEnd = () => {
    window.dispatchEvent(new CustomEvent('element-drag-end', { detail: { item } }));
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onInsert) onInsert(item);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={`Click to add or drag to place ${item.name}`}
      className="w-full flex flex-col items-center group cursor-grab active:cursor-grabbing select-none focus:outline-none"
    >
      {/* Icon Card Box */}
      <div className="w-full aspect-square bg-white border border-gray-200 group-hover:border-[#ea543a] group-hover:shadow-md rounded-2xl p-[0.1vw] flex items-center justify-center transition-all duration-150 group-hover:-translate-y-0.5 active:scale-95 box-border overflow-hidden">
        <div
          ref={previewRef}
          className="w-full h-full flex items-center justify-center pointer-events-none bg-transparent"
        >
          {item.renderPreview ? item.renderPreview() : null}
        </div>
      </div>

      {/* Label outside below card */}
      <span className="text-[0.66vw] font-medium text-gray-700 group-hover:text-[#ea543a] truncate w-full text-center mt-[0.4vh] px-[0.1vw] flex-shrink-0 pointer-events-none transition-colors">
        {item.name}
      </span>
    </button>
  );
}

export default React.memo(ElementGridCard);
