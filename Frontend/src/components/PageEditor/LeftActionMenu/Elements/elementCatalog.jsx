import React from 'react';
import { Icon } from '@iconify/react';

// Categories matching editor design
export const ELEMENT_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'lucide:layout-grid' },
  { id: 'text', name: 'Text', icon: 'lucide:type' },
  { id: 'shapes', name: 'Shapes', icon: 'lucide:shapes' },
  { id: 'buttons', name: 'Buttons', icon: 'lucide:mouse-pointer-click' },
  { id: 'tables', name: 'Tables', icon: 'lucide:table' },
  { id: 'image', name: 'Image', icon: 'lucide:image' },
  { id: 'masking', name: 'Masking', icon: 'tabler:mask' },
  { id: 'slideshow', name: 'Slideshow', icon: 'lucide:presentation' },
  { id: 'qr-code', name: 'QR Code', icon: 'lucide:qr-code' },
  { id: 'google-maps', name: 'Google Maps', icon: 'lucide:map-pin' },
  { id: 'decorators', name: 'Decorators', icon: 'lucide:sparkles' },
  { id: 'embeds', name: '3rd-Party Embeds', icon: 'lucide:code-2' },
];

/**
 * Embeds an Iconify icon as an SVG image element with a guaranteed transparent hit area.
 * Ensures the icon renders reliably as vector SVG across all browsers while having a
 * robust bounding box for clicking, dragging, and selection overlays.
 */
export function createSvgIconGroup(name, iconName, cx, cy, size = 44) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${cx - size / 2}, ${cy - size / 2})`);
  g.setAttribute('data-name', name);
  g.setAttribute('data-type', 'icon');

  const [prefix, icon] = iconName.includes(':') ? iconName.split(':') : ['fluent-emoji-flat', iconName];
  const imgUrl = `https://api.iconify.design/${prefix}/${icon}.svg`;

  // Transparent hit area to guarantee crisp click, drag, and selection bounding box
  const hitRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  hitRect.setAttribute('x', '0');
  hitRect.setAttribute('y', '0');
  hitRect.setAttribute('width', String(size));
  hitRect.setAttribute('height', String(size));
  hitRect.setAttribute('fill', 'transparent');
  hitRect.setAttribute('pointer-events', 'all');
  g.appendChild(hitRect);

  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  img.setAttribute('x', '0');
  img.setAttribute('y', '0');
  img.setAttribute('width', String(size));
  img.setAttribute('height', String(size));
  img.setAttribute('href', imgUrl);
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgUrl);
  img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  img.setAttribute('pointer-events', 'none');
  g.appendChild(img);

  return g;
}

// Rich Element Catalog with items, render previews, and SVG insert generators
export const ELEMENT_ITEMS = [
  // --- Basic Geometric Shapes ---
  {
    id: 'shape-rect',
    name: 'Rectangle',
    category: 'shapes',
    type: 'shape-rect',
    renderPreview: () => (
      <div className="w-[2.5vw] h-[2.5vw] bg-[#ef4444] rounded-[0.35vw] shadow-xs" />
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      el.setAttribute('x', String(cx - 25));
      el.setAttribute('y', String(cy - 25));
      el.setAttribute('width', '50');
      el.setAttribute('height', '50');
      el.setAttribute('rx', '4');
      el.setAttribute('fill', '#ef4444');
      el.setAttribute('data-name', 'Red Square');
      return el;
    }
  },
  {
    id: 'shape-circle',
    name: 'Circle',
    category: 'shapes',
    type: 'shape-circle',
    renderPreview: () => (
      <div className="w-[2.5vw] h-[2.5vw] bg-[#f97316] rounded-full shadow-xs" />
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      el.setAttribute('cx', String(cx));
      el.setAttribute('cy', String(cy));
      el.setAttribute('rx', '25');
      el.setAttribute('ry', '25');
      el.setAttribute('fill', '#f97316');
      el.setAttribute('data-name', 'Orange Circle');
      return el;
    }
  },
  {
    id: 'shape-triangle',
    name: 'Triangle',
    category: 'shapes',
    type: 'shape-triangle',
    renderPreview: () => (
      <svg viewBox="0 0 40 40" className="w-[2.5vw] h-[2.5vw]">
        <polygon points="20,4 38,36 2,36" fill="#3b82f6" rx="2" />
      </svg>
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', `M ${cx} ${cy - 25} L ${cx + 25} ${cy + 25} L ${cx - 25} ${cy + 25} Z`);
      el.setAttribute('fill', '#3b82f6');
      el.setAttribute('data-shape-type', 'polygon');
      el.setAttribute('data-name', 'Blue Triangle');
      return el;
    }
  },

  // --- Vector Graphic Illustrations ---
  {
    id: 'gfx-plant',
    name: 'Potted Plant',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:potted-plant" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Potted Plant', 'fluent-emoji-flat:potted-plant', cx, cy, 44)
  },
  {
    id: 'gfx-laptop',
    name: 'Laptop',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:laptop" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Laptop', 'fluent-emoji-flat:laptop', cx, cy, 44)
  },
  {
    id: 'gfx-lightbulb',
    name: 'Idea Bulb',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:light-bulb" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Light Bulb', 'fluent-emoji-flat:light-bulb', cx, cy, 44)
  },
  {
    id: 'gfx-ribbon',
    name: 'Ribbon Banner',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <svg viewBox="0 0 100 40" className="w-[2.7vw] h-[1.4vw]">
        <path d="M10 5 L90 5 L80 20 L90 35 L10 35 L20 20 Z" fill="#ef4444" />
        <rect x="20" y="2" width="60" height="36" rx="3" fill="#f87171" />
      </svg>
    ),
    insert: (cx, cy) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${cx - 40}, ${cy - 15})`);
      g.innerHTML = `
        <path d="M5 5 L75 5 L67 17 L75 29 L5 29 L13 17 Z" fill="#ef4444" />
        <rect x="15" y="2" width="50" height="30" rx="3" fill="#f87171" />
      `;
      g.setAttribute('data-name', 'Ribbon Banner');
      return g;
    }
  },
  {
    id: 'gfx-target',
    name: 'Bullseye Target',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:bullseye" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Target Bullseye', 'fluent-emoji-flat:bullseye', cx, cy, 44)
  },
  {
    id: 'gfx-gear',
    name: 'Cog Gear',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:gear" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Gear', 'fluent-emoji-flat:gear', cx, cy, 44)
  },
  {
    id: 'gfx-arrow-right',
    name: 'Arrow Right',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <svg viewBox="0 0 40 40" className="w-[2.3vw] h-[2.3vw]" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="20" x2="33" y2="20" />
        <polyline points="23 10 33 20 23 30" />
      </svg>
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', `M ${cx - 20} ${cy} L ${cx + 20} ${cy} M ${cx + 10} ${cy - 10} L ${cx + 20} ${cy} L ${cx + 10} ${cy + 10}`);
      el.setAttribute('stroke', '#1e293b');
      el.setAttribute('stroke-width', '3');
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('data-name', 'Arrow Right');
      return el;
    }
  },
  {
    id: 'gfx-arrow-curve',
    name: 'Curved Arrow',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <svg viewBox="0 0 40 40" className="w-[2.3vw] h-[2.3vw]" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 32 Q 12 12 32 12" />
        <polyline points="22 5 32 12 24 20" />
      </svg>
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', `M ${cx - 15} ${cy + 15} Q ${cx - 10} ${cy - 15} ${cx + 15} ${cy - 15} M ${cx + 5} ${cy - 22} L ${cx + 15} ${cy - 15} L ${cx + 7} ${cy - 7}`);
      el.setAttribute('stroke', '#ef4444');
      el.setAttribute('stroke-width', '3');
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('data-name', 'Curved Arrow');
      return el;
    }
  },
  {
    id: 'gfx-arrow-trend',
    name: 'Growth Trend',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <svg viewBox="0 0 40 40" className="w-[2.3vw] h-[2.3vw]" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 32 Q 20 30 32 8" strokeDasharray="3 3" />
        <polyline points="24 8 32 8 32 16" strokeDasharray="none" />
      </svg>
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', `M ${cx - 15} ${cy + 15} Q ${cx} ${cy + 12} ${cx + 15} ${cy - 15}`);
      el.setAttribute('stroke', '#1e293b');
      el.setAttribute('stroke-width', '2.5');
      el.setAttribute('stroke-dasharray', '3 3');
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('data-name', 'Growth Trend');
      return el;
    }
  },
  {
    id: 'gfx-avatar',
    name: 'Profile Avatar',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-color:person-support-24" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('User Avatar', 'fluent-color:person-support-24', cx, cy, 48)
  },
  {
    id: 'gfx-chart',
    name: 'Bar Chart',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:bar-chart" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Bar Chart', 'fluent-emoji-flat:bar-chart', cx, cy, 44)
  },
  {
    id: 'gfx-board',
    name: 'Presentation',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-color:board-split-24" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Presentation Board', 'fluent-color:board-split-24', cx, cy, 48)
  },
  {
    id: 'gfx-doc-check',
    name: 'Doc Check',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-color:document-checkmark-24" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Verified Document', 'fluent-color:document-checkmark-24', cx, cy, 48)
  },
  {
    id: 'gfx-handshake',
    name: 'Partnership',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-emoji-flat:handshake" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Handshake', 'fluent-emoji-flat:handshake', cx, cy, 44)
  },
  {
    id: 'gfx-dots',
    name: 'Halftone Dots',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <svg viewBox="0 0 40 40" className="w-[2.5vw] h-[2.5vw]" fill="#3b82f6">
        <circle cx="8" cy="8" r="1" />
        <circle cx="16" cy="8" r="1.5" />
        <circle cx="24" cy="8" r="2" />
        <circle cx="32" cy="8" r="2.5" />
        <circle cx="16" cy="16" r="1.5" />
        <circle cx="24" cy="16" r="2" />
        <circle cx="32" cy="16" r="2.5" />
        <circle cx="24" cy="24" r="2" />
        <circle cx="32" cy="24" r="2.5" />
        <circle cx="32" cy="32" r="2.5" />
      </svg>
    ),
    insert: (cx, cy) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${cx - 20}, ${cy - 20})`);
      g.setAttribute('fill', '#3b82f6');
      g.innerHTML = `
        <circle cx="8" cy="8" r="1" /><circle cx="16" cy="8" r="1.5" /><circle cx="24" cy="8" r="2" /><circle cx="32" cy="8" r="2.5" />
        <circle cx="16" cy="16" r="1.5" /><circle cx="24" cy="16" r="2" /><circle cx="32" cy="16" r="2.5" />
        <circle cx="24" cy="24" r="2" /><circle cx="32" cy="24" r="2.5" /><circle cx="32" cy="32" r="2.5" />
      `;
      g.setAttribute('data-name', 'Halftone Dots');
      return g;
    }
  },
  {
    id: 'gfx-medal',
    name: 'Award Badge',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <Icon icon="fluent-color:ribbon-star-24" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Award Medal', 'fluent-color:ribbon-star-24', cx, cy, 48)
  },
  {
    id: 'gfx-badge-new',
    name: 'NEW Badge',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <div className="bg-[#ef4444] text-white text-[0.65vw] font-black px-[0.7vw] py-[0.25vw] rounded-full shadow-xs">
        NEW
      </div>
    ),
    insert: (cx, cy) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${cx - 25}, ${cy - 12})`);
      g.innerHTML = `
        <rect width="50" height="24" rx="12" fill="#ef4444" />
        <text x="25" y="16" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="sans-serif">NEW</text>
      `;
      g.setAttribute('data-name', 'NEW Badge');
      return g;
    }
  },
  {
    id: 'gfx-badge-sale',
    name: 'SALE Tag',
    category: 'shapes',
    type: 'vector-gfx',
    renderPreview: () => (
      <div className="bg-[#10b981] text-white text-[0.65vw] font-black px-[0.7vw] py-[0.25vw] rounded-[0.35vw] shadow-xs">
        SALE
      </div>
    ),
    insert: (cx, cy) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${cx - 25}, ${cy - 12})`);
      g.innerHTML = `
        <rect width="50" height="24" rx="4" fill="#10b981" />
        <text x="25" y="16" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="sans-serif">SALE</text>
      `;
      g.setAttribute('data-name', 'SALE Tag');
      return g;
    }
  },

  // --- Text Presets ---
  {
    id: 'text-heading',
    name: 'Add Heading',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <span className="text-[1.1vw] font-extrabold text-gray-800">Heading</span>
    ),
    insert: (cx, cy) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy));
      t.setAttribute('font-size', '28');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('fill', '#111827');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = 'Add a Heading';
      t.setAttribute('data-name', 'Heading');
      return t;
    }
  },
  {
    id: 'text-subheading',
    name: 'Add Subheading',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <span className="text-[0.88vw] font-semibold text-gray-600">Subheading</span>
    ),
    insert: (cx, cy) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy));
      t.setAttribute('font-size', '18');
      t.setAttribute('font-weight', '600');
      t.setAttribute('fill', '#4b5563');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = 'Add a subheading';
      t.setAttribute('data-name', 'Subheading');
      return t;
    }
  },
  {
    id: 'text-paragraph',
    name: 'Paragraph Text',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <span className="text-[0.72vw] text-gray-500">Body text...</span>
    ),
    insert: (cx, cy) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy));
      t.setAttribute('font-size', '14');
      t.setAttribute('fill', '#6b7280');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = 'Add a little bit of body text';
      t.setAttribute('data-name', 'Paragraph Text');
      return t;
    }
  },

  // --- Buttons Category ---
  {
    id: 'btn-primary',
    name: 'Primary Button',
    category: 'buttons',
    type: 'button',
    renderPreview: () => (
      <div className="bg-black text-white text-[0.68vw] font-semibold px-[0.85vw] py-[0.35vw] rounded-[0.45vw]">
        Button
      </div>
    ),
    insert: (cx, cy) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${cx - 45}, ${cy - 16})`);
      g.innerHTML = `
        <rect width="90" height="32" rx="6" fill="#111827" />
        <text x="45" y="20" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle" font-family="sans-serif">Click Here</text>
      `;
      g.setAttribute('data-name', 'Primary Button');
      return g;
    }
  },
  {
    id: 'btn-pill',
    name: 'Pill CTA',
    category: 'buttons',
    type: 'button',
    renderPreview: () => (
      <div className="bg-[#ea543a] text-white text-[0.68vw] font-semibold px-[0.95vw] py-[0.35vw] rounded-full">
        Explore
      </div>
    ),
    insert: (cx, cy) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${cx - 45}, ${cy - 16})`);
      g.innerHTML = `
        <rect width="90" height="32" rx="16" fill="#ea543a" />
        <text x="45" y="20" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle" font-family="sans-serif">Explore</text>
      `;
      g.setAttribute('data-name', 'Pill CTA Button');
      return g;
    }
  },

  // --- Frames / Masking ---
  {
    id: 'frame-free',
    name: 'Interactive Frame',
    category: 'masking',
    type: 'frame',
    renderPreview: () => (
      <div className="w-[2.5vw] h-[2.5vw] border-2 border-dashed border-gray-400 rounded-[0.45vw] flex items-center justify-center">
        <Icon icon="iconoir:frame-alt" className="w-[1.4vw] h-[1.4vw] text-gray-500" />
      </div>
    ),
    insert: (cx, cy) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      el.setAttribute('x', String(cx - 40));
      el.setAttribute('y', String(cy - 40));
      el.setAttribute('width', '80');
      el.setAttribute('height', '80');
      el.setAttribute('fill', 'transparent');
      el.setAttribute('stroke', '#ea543a');
      el.setAttribute('stroke-width', '1.5');
      el.setAttribute('data-interaction', 'open-link');
      el.setAttribute('data-interaction-value', '');
      el.setAttribute('data-name', 'Free Frame');
      return el;
    }
  },

  // --- QR Code ---
  {
    id: 'qr-sample',
    name: 'QR Code',
    category: 'qr-code',
    type: 'qr',
    renderPreview: () => (
      <Icon icon="lucide:qr-code" className="w-[2.5vw] h-[2.5vw] text-gray-800" />
    ),
    insert: (cx, cy) => createSvgIconGroup('QR Code', 'lucide:qr-code', cx, cy, 60)
  },

  // --- Google Maps Pin ---
  {
    id: 'map-pin',
    name: 'Map Location',
    category: 'google-maps',
    type: 'map',
    renderPreview: () => (
      <Icon icon="fluent-color:location-24" className="w-[2.5vw] h-[2.5vw]" />
    ),
    insert: (cx, cy) => createSvgIconGroup('Map Pin', 'fluent-color:location-24', cx, cy, 48)
  },
];
