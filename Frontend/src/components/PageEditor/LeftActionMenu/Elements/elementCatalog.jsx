import { SHAPE_ITEMS } from './categories/shapesCatalog.jsx';
import { TYPOGRAPHY_ITEMS } from './categories/typographyCatalog.jsx';
import { BUTTON_ITEMS } from './categories/buttonsCatalog.jsx';
import { FRAMING_ITEMS } from './categories/imageFramingCatalog.jsx';
import { TABLE_ITEMS } from './categories/tableCatalog.jsx';
import { QR_ITEMS } from './categories/qrCodeCatalog.jsx';
import { MAP_ITEMS } from './categories/mapCatalog.jsx';
import { EMBED_ITEMS } from './categories/embedsCatalog.jsx';
import { SLIDESHOW_ITEMS } from './categories/slideshowCatalog.jsx';
import { DECORATOR_ITEMS } from './categories/decoratorsCatalog.jsx';
import { AUDIO_ITEMS } from './categories/audioCatalog.jsx';
import React from 'react';
import { Icon } from '@iconify/react';

// Categories matching editor design
export const ELEMENT_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'lucide:layout-grid' },
  { id: 'text', name: 'Text', icon: 'lucide:type' },
  { id: 'shapes', name: 'Shapes', icon: 'lucide:shapes' },
  { id: 'buttons', name: 'Buttons', icon: 'lucide:mouse-pointer-click' },
  { id: 'tables', name: 'Tables', icon: 'lucide:table' },
  { id: 'masking', name: 'Image Framing & Masking', icon: 'tabler:mask' },
  { id: 'slideshow', name: 'Slideshow', icon: 'lucide:presentation' },
  { id: 'qr-code', name: 'QR Code', icon: 'lucide:qr-code' },
  { id: 'google-maps', name: 'Google Maps', icon: 'lucide:map-pin' },
  { id: 'decorators', name: 'Decorators', icon: 'lucide:sparkles' },
  { id: 'embeds', name: '3rd-Party Embeds', icon: 'lucide:code-2' },
  { id: 'audio', name: 'Audio', icon: 'lucide:music' },
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
  // --- Professional SVG Vector Shapes (33 Curated Shapes) ---
  ...SHAPE_ITEMS,

  // --- Professional Typography & Kinetic Motion Graphics ---
  ...TYPOGRAPHY_ITEMS,

  // --- Professional Buttons & Interactive CTAs ---
  ...BUTTON_ITEMS,

  // --- 40+ SVG Image Framing & Masking Elements ---
  ...FRAMING_ITEMS,

  // --- Rich Table & Data Grid Elements ---
  ...TABLE_ITEMS,

  // --- Professional QR Code Presets (8 Custom Vector Frames) ---
  ...QR_ITEMS,

  // --- Google Maps Location Cards ---
  ...MAP_ITEMS,

  // --- 3rd-Party Web Embeds ---
  ...EMBED_ITEMS,

  // --- Slideshow & Interactive Carousels ---
  ...SLIDESHOW_ITEMS,

  // --- Animated Motion Decorators ---
  ...DECORATOR_ITEMS,

  // --- Interactive Audio Players ---
  ...AUDIO_ITEMS,
];

import { ElementSearchIndex } from './helpers/ElementSearchIndex';

// Pre-indexed Search Structure and Hash Maps for O(1) lookup & fast inverted-index searching
export const elementSearchIndex = new ElementSearchIndex(ELEMENT_ITEMS, ELEMENT_CATEGORIES);

/**
 * O(1) Constant Time Element Lookup by ID
 */
export function getElementItemById(id) {
  return elementSearchIndex.getById(id);
}

/**
 * Inverted Index + Memoized Search
 */
export function searchElementCatalog(query = '', categoryId = 'all') {
  return elementSearchIndex.search(query, categoryId);
}



