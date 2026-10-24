import React from 'react';
import { Icon } from '@iconify/react';

export const DEFAULT_MAP_DATA = {
  name: 'Google Maps Location',
  address: 'Location Details',
  rating: '4.8',
  reviews: '500+',
  category: 'Location',
  phone: '',
  image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=80',
  location: 'Coimbatore, Tamil Nadu',
  gallery: [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80'
  ]
};

export const MAP_TEMPLATES = [
  {
    id: 'actions',
    name: 'Quick Actions',
    description: 'Bottom sheet with Directions, Call & Share buttons',
    badge: 'Popular'
  },
  {
    id: 'callout',
    name: 'Pin Callout',
    description: 'Interactive map marker with floating speech bubble',
    badge: 'Clean'
  },
  {
    id: 'gallery',
    name: 'Photo Gallery',
    description: 'Bottom sheet with studio photos & View Details CTA',
    badge: 'Detailed'
  },
  {
    id: 'carousel',
    name: 'Location Carousel',
    description: 'Floating location card with next button & dots',
    badge: 'Compact'
  },
  {
    id: 'none',
    name: 'Map Only',
    description: 'Pure interactive map with no card overlay',
    badge: 'Minimal'
  }
];

export const escapeXml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const getActiveCanvasDimensions = () => {
  let pw = 297, ph = 210;
  try {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const svgRoot = editorDoc.querySelector('.flipbook-page-container svg') || 
                    editorDoc.querySelector('.flipbook-page svg') || 
                    editorDoc.querySelector('.page-svg-container svg') || 
                    editorDoc.querySelector('svg[viewBox]');
    if (svgRoot && svgRoot.getAttribute('viewBox')) {
      const vb = svgRoot.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number);
      if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
        pw = vb[2];
        ph = vb[3];
      }
    }
  } catch (e) {}
  return { pw, ph };
};

export const getMapDimensions = (pw, ph) => {
  let targetW, targetH;
  if (pw > ph) {
    // Landscape canvas (e.g. 297 x 210)
    targetW = Math.round(pw * 0.55);
    targetH = Math.round(targetW * (230 / 240));
    if (targetH > ph * 0.82) {
      targetH = Math.round(ph * 0.80);
      targetW = Math.round(targetH * (240 / 230));
    }
  } else {
    // Portrait canvas (e.g. 210 x 297)
    targetW = Math.round(pw * 0.78);
    targetH = Math.round(targetW * (230 / 240));
    if (targetH > ph * 0.58) {
      targetH = Math.round(ph * 0.55);
      targetW = Math.round(targetH * (240 / 230));
    }
  }

  targetW = Math.max(180, Math.min(targetW, pw - (pw > 400 ? 40 : 16)));
  targetH = Math.max(180, Math.min(targetH, ph - (ph > 400 ? 40 : 16)));

  const posX = Math.round((pw - targetW) / 2);
  const posY = Math.round((ph - targetH) / 2);

  return { targetW, targetH, posX, posY };
};

export const generateOverlayHtml = (style, data = {}) => {
  if (style === 'none' || style === 'plain') {
    return '';
  }

  const name = escapeXml(data.name || DEFAULT_MAP_DATA.name);
  const address = escapeXml(data.address || DEFAULT_MAP_DATA.address);
  const rating = escapeXml(data.rating || DEFAULT_MAP_DATA.rating);
  const reviews = escapeXml(data.reviews || DEFAULT_MAP_DATA.reviews);
  const category = escapeXml(data.category || DEFAULT_MAP_DATA.category);
  const phone = escapeXml(data.phone || DEFAULT_MAP_DATA.phone);
  const image = escapeXml(data.image || DEFAULT_MAP_DATA.image);
  const location = data.location || DEFAULT_MAP_DATA.location;
  const gallery = data.gallery || DEFAULT_MAP_DATA.gallery;

  const directionsUrl = `https://maps.google.com/maps?daddr=${encodeURIComponent(location)}`;
  const shareUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
  const shortName = name.split(' ')[0] || 'Location';

  if (style === 'actions') {
    return `
      <!-- Compact Floating Action Card -->
      <div class="map-card-overlay map-card-actions" style="position: absolute; bottom: 5px; left: 6px; right: 6px; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(4px); border-radius: 6px; padding: 3px 5px 3.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; pointer-events: auto; z-index: 10; box-sizing: border-box;">
        <div class="map-biz-row" style="display: flex; align-items: center; gap: 3.5px; min-width: 0;">
          <img class="map-biz-img" src="${image}" alt="${name}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&amp;auto=format&amp;fit=crop&amp;q=80';" style="width: 15px; height: 15px; min-width: 15px; min-height: 15px; border-radius: 2.5px; object-fit: cover; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);" />
          <div class="map-biz-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            <div class="map-nowrap map-biz-name" data-nowrap="true" style="font-weight: 700; font-size: 6px; color: #111827; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${name}</div>
            <div class="map-biz-meta" style="display: flex; align-items: center; gap: 2px; margin-top: 0.5px; line-height: 1; font-size: 4.8px; color: #6b7280;">
              <span class="map-biz-star" style="color: #f59e0b; font-size: 5px;">★</span>
              <span class="map-biz-rating" style="font-weight: 700; color: #111827;">${rating}</span>
              <span class="map-biz-reviews">(${reviews})</span>
              <span style="color: #9ca3af;">•</span>
              <span class="map-nowrap map-biz-addr" data-nowrap="true" style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; max-width: 75px;">${address}</span>
            </div>
          </div>
        </div>
        <div class="map-actions-row" style="display: flex; gap: 2.5px; width: 100%; box-sizing: border-box; margin-top: 2.5px;">
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="map-nowrap map-action-btn map-action-btn-primary" data-nowrap="true" style="flex: 1.15; display: flex; align-items: center; justify-content: center; gap: 2px; background: #00828a; color: #ffffff; padding: 2px 3px; border-radius: 3px; font-size: 5px; font-weight: 600; text-decoration: none; cursor: pointer; box-shadow: 0 1px 2px rgba(0,130,138,0.25); white-space: nowrap !important; overflow: hidden; min-width: 0;">
            <svg class="svg-icon-override" width="5.5" height="5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span class="map-nowrap map-btn-text" data-nowrap="true" style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;">Directions</span>
          </a>
          <a href="tel:${phone}" class="map-nowrap map-action-btn map-action-btn-secondary" data-nowrap="true" style="flex: 0.85; display: flex; align-items: center; justify-content: center; gap: 2px; background: #e0f4f5; color: #00828a; padding: 2px 3px; border-radius: 3px; font-size: 5px; font-weight: 600; text-decoration: none; cursor: pointer; white-space: nowrap !important; overflow: hidden; min-width: 0;">
            <svg class="svg-icon-override" width="5.5" height="5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span class="map-nowrap map-btn-text" data-nowrap="true" style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;">Call</span>
          </a>
          <a href="${shareUrl}" target="_blank" rel="noopener noreferrer" class="map-nowrap map-action-btn map-action-btn-secondary" data-nowrap="true" style="flex: 0.85; display: flex; align-items: center; justify-content: center; gap: 2px; background: #e0f4f5; color: #00828a; padding: 2px 3px; border-radius: 3px; font-size: 5px; font-weight: 600; text-decoration: none; cursor: pointer; white-space: nowrap !important; overflow: hidden; min-width: 0;">
            <svg class="svg-icon-override" width="5.5" height="5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span class="map-nowrap map-btn-text" data-nowrap="true" style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;">Share</span>
          </a>
        </div>
      </div>
    `;
  }

  if (style === 'callout') {
    return `
      <!-- Tooltip Speech Bubble -->
      <div class="map-card-overlay map-card-callout" style="position: absolute; top: 6%; left: 50%; transform: translateX(-50%); width: 85%; max-width: 125px; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(4px); border-radius: 5px; padding: 2px 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; pointer-events: auto; z-index: 10; box-sizing: border-box;">
        <div class="map-biz-row" style="display: flex; align-items: center; gap: 3px;">
          <img class="map-biz-img" src="${image}" alt="${name}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&amp;auto=format&amp;fit=crop&amp;q=80';" style="width: 14px; height: 14px; min-width: 14px; min-height: 14px; border-radius: 2px; object-fit: cover; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);" />
          <div class="map-biz-info" style="flex: 1; min-width: 0;">
            <div class="map-nowrap map-biz-name" data-nowrap="true" style="font-weight: 700; font-size: 5.5px; color: #111827; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${name}</div>
            <div class="map-nowrap map-biz-addr" data-nowrap="true" style="font-size: 4.5px; color: #4b5563; margin-top: 0.5px; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;">${address}</div>
            <div class="map-biz-meta" style="display: flex; align-items: center; gap: 1.5px; margin-top: 0.5px; font-size: 4.5px;">
              <span class="map-biz-star" style="color: #f59e0b; font-size: 4.8px; line-height: 1;">★</span>
              <span class="map-biz-rating" style="font-weight: 700; color: #111827;">${rating}</span>
              <span class="map-biz-reviews" style="color: #6b7280;">(${reviews})</span>
            </div>
          </div>
        </div>
        <div class="map-callout-arrow" style="position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 3.5px solid transparent; border-right: 3.5px solid transparent; border-top: 3px solid #ffffff;"></div>
      </div>

      <!-- Center Pin Marker -->
      <div class="map-center-pin" style="position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 2px; background: rgba(255, 255, 255, 0.95); border-radius: 999px; padding: 1px 4px 1px 2.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.22); pointer-events: none; z-index: 5; white-space: nowrap !important; max-width: 80%;">
        <div class="map-badge-icon" style="width: 8px; height: 8px; border-radius: 999px; background: #fee2e2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg class="svg-icon-override" width="5.5" height="5.5" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>
        </div>
        <span class="map-nowrap map-biz-name" data-nowrap="true" style="font-size: 5px; font-weight: 700; color: #111827; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;">${shortName}</span>
      </div>
    `;
  }

  if (style === 'gallery') {
    const galleryItems = Array.isArray(gallery) ? gallery : DEFAULT_MAP_DATA.gallery;
    return `
      <!-- Photo Gallery Bottom Sheet -->
      <div class="map-card-overlay map-card-gallery" style="position: absolute; bottom: 5px; left: 6px; right: 6px; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(4px); border-radius: 6px; padding: 3px 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; pointer-events: auto; z-index: 10; box-sizing: border-box;">
        <div class="map-biz-row" style="display: flex; align-items: center; gap: 3.5px; margin-bottom: 2px;">
          <img class="map-biz-img" src="${image}" alt="${name}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&amp;auto=format&amp;fit=crop&amp;q=80';" style="width: 14px; height: 14px; min-width: 14px; min-height: 14px; border-radius: 2px; object-fit: cover; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.08);" />
          <div class="map-biz-info" style="flex: 1; min-width: 0;">
            <div class="map-nowrap map-biz-name" data-nowrap="true" style="font-weight: 700; font-size: 5.5px; color: #111827; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${name}</div>
            <div class="map-nowrap map-biz-addr" data-nowrap="true" style="font-size: 4.5px; color: #4b5563; margin-top: 0.5px; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;">${address}</div>
          </div>
        </div>
        <div class="map-gallery-strip" style="display: flex; gap: 2px; width: 100%; box-sizing: border-box; margin-bottom: 2px;">
          ${galleryItems.slice(0, 3).map((img, i) => `
            <img key="${i}" class="map-gallery-thumb" src="${img}" alt="Preview ${i+1}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&amp;auto=format&amp;fit=crop&amp;q=80';" style="flex: 1; height: 11px; border-radius: 2px; object-fit: cover; min-width: 0;" />
          `).join('')}
        </div>
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="map-nowrap map-action-btn map-action-btn-primary" data-nowrap="true" style="display: block; width: 100%; text-align: center; background: #00828a; color: #ffffff; padding: 2px 0; border-radius: 3px; font-size: 5px; font-weight: 600; text-decoration: none; cursor: pointer; box-shadow: 0 1px 2px rgba(0,130,138,0.25); white-space: nowrap !important;">
          View Details
        </a>
      </div>
    `;
  }

  // carousel style
  return `
    <!-- Floating Card -->
    <div class="map-card-overlay map-card-carousel" style="position: absolute; bottom: 5px; left: 6px; right: 6px; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(4px); border-radius: 6px; padding: 2.5px 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; pointer-events: auto; z-index: 10; box-sizing: border-box;">
      <div class="map-biz-row" style="display: flex; align-items: center; gap: 3.5px;">
        <img class="map-biz-img" src="${image}" alt="${name}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&amp;auto=format&amp;fit=crop&amp;q=80';" style="width: 14px; height: 14px; min-width: 14px; min-height: 14px; border-radius: 2.5px; object-fit: cover; flex-shrink: 0; display: block; box-shadow: 0 1px 2px rgba(0,0,0,0.08);" />
        <div class="map-biz-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
          <div class="map-nowrap map-biz-name" data-nowrap="true" style="font-weight: 700; font-size: 5.5px; color: #111827; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; line-height: 1.1;">${name}</div>
          <div class="map-biz-meta" style="display: flex; align-items: center; gap: 1.5px; margin-top: 0.5px; font-size: 4.5px; color: #6b7280;">
            <span class="map-biz-star" style="color: #f59e0b; font-size: 4.8px; line-height: 1;">★</span>
            <span class="map-biz-rating" style="font-weight: 700; color: #111827;">${rating}</span>
            <span class="map-biz-reviews">(${reviews})</span>
            <span style="color: #9ca3af;">•</span>
            <span class="map-nowrap map-biz-addr" data-nowrap="true" style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; max-width: 70px;">${address}</span>
          </div>
        </div>
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="width: 12px; height: 12px; border-radius: 999px; border: 1px solid #00828a; display: flex; align-items: center; justify-content: center; color: #00828a; text-decoration: none; flex-shrink: 0; cursor: pointer;">
          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      </div>
    </div>
  `;
};

export const getMapSvgCode = (templateId = 'actions', isClick = false, customData = {}) => {
  const uniqueId = Date.now();
  const data = { ...DEFAULT_MAP_DATA, ...customData };
  const loc = data.location || 'Coimbatore, Tamil Nadu';
  const defaultUrl = `https://maps.google.com/maps?q=${encodeURIComponent(loc)}&t=&z=13&ie=UTF8&iwloc=near&output=embed`;

  const { pw, ph } = getActiveCanvasDimensions();
  const { targetW, targetH, posX, posY } = getMapDimensions(pw, ph);

  const transformAttr = isClick ? ` transform="translate(${posX}, ${posY})"` : '';
  const overlayHtml = generateOverlayHtml(templateId, data);
  const galleryJson = escapeXml(JSON.stringify(data.gallery || DEFAULT_MAP_DATA.gallery));

  return `
    <g id="map-${uniqueId}" 
       data-type="map" 
       data-map-style="${templateId}"
       data-business-name="${escapeXml(data.name)}"
       data-business-address="${escapeXml(data.address)}"
       data-business-rating="${escapeXml(data.rating)}"
       data-business-reviews="${escapeXml(data.reviews)}"
       data-business-category="${escapeXml(data.category)}"
       data-business-phone="${escapeXml(data.phone)}"
       data-business-image="${escapeXml(data.image)}"
       data-business-gallery="${galleryJson}"
       data-location="${escapeXml(loc)}"
       data-source-type="Location"
       data-url="${defaultUrl.replace(/&/g, '&amp;')}"
       cursor="pointer"${transformAttr}>
      <foreignObject x="0" y="0" width="${targetW}" height="${targetH}" style="overflow: hidden; border-radius: 8px;">
        <div xmlns="http://www.w3.org/1999/xhtml" class="map-root-container" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);">
          <iframe src="${defaultUrl.replace(/&/g, '&amp;')}" width="100%" height="100%" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none; margin: 0; padding: 0; display: block;" allowfullscreen="" loading="lazy"></iframe>
          <div class="map-overlay-wrapper" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;">
            ${overlayHtml}
          </div>
        </div>
      </foreignObject>
      <rect x="0" y="0" width="${targetW}" height="${targetH}" rx="8" fill="transparent" pointer-events="all" />
    </g>
  `;
};

export const isElementMap = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'map' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('map-'))
  );
};

export function createMapElementNode(templateId = 'actions', customData = {}, cx = 200, cy = 150) {
  const svgString = getMapSvgCode(templateId, true, customData);
  const parser = new DOMParser();
  let doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgString}</svg>`, 'image/svg+xml');
  let el = doc.querySelector('g[data-type="map"]') || doc.querySelector('g[id^="map-"]');
  if (!el && doc.querySelector('parsererror')) {
    doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgString}</svg>`, 'text/html');
    el = doc.querySelector('g[data-type="map"]') || doc.querySelector('g[id^="map-"]');
  }
  if (el) {
    const fo = el.querySelector('foreignObject');
    const fw = fo ? (parseFloat(fo.getAttribute('width')) || 200) : 200;
    const fh = fo ? (parseFloat(fo.getAttribute('height')) || 150) : 150;
    el.setAttribute('transform', `translate(${Math.round(cx - fw / 2)}, ${Math.round(cy - fh / 2)})`);
    el.setAttribute('data-type', 'map');
    el.setAttribute('data-map-style', templateId);
    return document.importNode(el, true);
  }
  return null;
}
