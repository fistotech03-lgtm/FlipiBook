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
      onClick={() => onInsert && onInsert(item)}
      draggable={true}
      onDragStart={handleDragStart}
      title={`Click to add or drag to place ${item.name}`}
      className="w-full aspect-square bg-white border border-gray-200 hover:border-[#ea543a] hover:shadow-md rounded-[0.55vw] p-[0.45vw] flex flex-col items-center justify-between cursor-grab active:cursor-grabbing transition-all duration-150 hover:-translate-y-0.5 active:scale-95 group overflow-hidden box-border"
    >
      <div className="w-full flex-1 min-h-0 min-w-0 flex items-center justify-center overflow-hidden pointer-events-none">
        {item.renderPreview ? item.renderPreview() : null}
      </div>
      <span className="text-[0.65vw] font-medium text-gray-600 group-hover:text-[#ea543a] truncate w-full text-center mt-[0.2vh] flex-shrink-0 pointer-events-none">
        {item.name}
      </span>
    </button>
  );
}

export default React.memo(ElementGridCard);
