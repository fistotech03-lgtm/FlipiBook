export const TemplateIcon = () => (
  <svg width="0.9vw" height="0.9vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

export const ClearIcon = () => (
  <svg width="0.9vw" height="0.9vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

export const DeleteIcon = () => (
  <svg width="0.9vw" height="0.9vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const MenuOption = ({ icon, label, onClick, color = "text-gray-700", hoverColor = "hover:bg-gray-50" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-[0.6vw] px-[0.8vw] py-[0.5vw] text-[0.75vw] font-medium transition-colors rounded-[0.4vw] text-left cursor-pointer ${color} ${hoverColor}`}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

// Mask icon: circle with left half filled, right half outline (exact match to Figma / mockup)
export const MaskIcon = ({ size = "1.1vw", className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ minWidth: size, minHeight: size }}
  >
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 2 A 8 8 0 0 0 10 18 Z" fill="currentColor" />
  </svg>
);

// Flatten icon: arrow down into base lines (exact match to Figma / mockup)
export const FlattenIcon = ({ size = "1.1vw", className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ minWidth: size, minHeight: size }}
  >
    <path 
      d="M10 2.5V10.5M10 10.5L6.5 7M10 10.5L13.5 7" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M3.5 13.5H16.5" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
    />
    <path 
      d="M5 16.5H15" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
    />
  </svg>
);

