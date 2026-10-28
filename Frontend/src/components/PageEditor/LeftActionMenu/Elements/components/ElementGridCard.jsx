import React from 'react';

/**
 * ElementGridCard
 * Renders an individual draggable & clickable element card in the Add Elements grid
 */
export function ElementGridCard({ item, onInsert }) {
  if (!item) return null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'element',
        elementId: item.id,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
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
      title={`Click to add or drag to place ${item.name}`}
      className="w-full flex flex-col items-center group cursor-grab active:cursor-grabbing select-none focus:outline-none"
    >
      {/* Icon Card Box */}
      <div className="w-full aspect-square bg-white border border-gray-200 group-hover:border-[#ea543a] group-hover:shadow-md rounded-2xl p-[0.1vw] flex items-center justify-center transition-all duration-150 group-hover:-translate-y-0.5 active:scale-95 box-border overflow-hidden">
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          {item.renderPreview ? item.renderPreview() : null}
        </div>
      </div>

      {/* Label outside below card */}
      <span className="text-[0.72vw] font-medium text-gray-700 group-hover:text-[#ea543a] truncate w-full text-center mt-[0.5vh] px-[0.1vw] flex-shrink-0 pointer-events-none transition-colors">
        {item.name}
      </span>
    </button>
  );
}

export default React.memo(ElementGridCard);
