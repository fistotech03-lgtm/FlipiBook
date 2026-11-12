import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, AlertCircle, Loader2, X, Copy, Check } from 'lucide-react';
import { Icon } from '@iconify/react';
import ColorPicker from '../../../properties/ColorPicker';
import { DEFAULT_MAP_DATA, MAP_TEMPLATES, generateOverlayHtml, escapeXml } from '../utils/mapElementUtils';
import { ElementToggle, ElementDropdown, ElementSlider } from './ElementUIControls';
import { handleScrubHelper } from '../../../properties/propertiesShared';

// Section header matching editor design standards
const SectionHeader = ({ title, rightElement }) => (
  <div className="flex items-center gap-[0.8vw]">
    <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
    {rightElement}
    <div className="flex-1 h-[1px] bg-gray-200" />
  </div>
);

// Exact ColorBox matching user screenshot and Color.jsx
const ColorBoxRow = ({
  title,
  color,
  opacity = 100,
  onOpenPicker,
  onChange,
  onOpacityChange,
  isActive = false,
  titleRight,
}) => {
  const isTransparent = !color || color === 'none' || color === 'transparent';
  const displayColor = (() => {
    if (isTransparent) return '#';
    if (typeof color === 'string' && color.includes('gradient')) return 'Gradient';
    return typeof color === 'string' ? (color.startsWith('#') ? color.toUpperCase() : '#' + color.toUpperCase()) : '#000000';
  })();

  return (
    <div className="flex flex-col gap-[0.5vw]">
      {title && (
        <div className="flex items-center gap-[0.8vw] mb-[0.1vw]">
          <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">{title}</span>
          {titleRight}
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>
      )}
      <div className="flex items-center gap-[0.6vw]">
        {/* Swatch (3.6vw x 2.1vw rounded rectangle matching user screenshot) */}
        <div
          onClick={onOpenPicker}
          className={`w-[3.6vw] h-[2.1vw] rounded-[0.45vw] border border-gray-300 shadow-2xs cursor-pointer flex-shrink-0 relative overflow-hidden transition-transform hover:scale-105 ${
            isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
          }`}
          title={`Change ${title || 'color'}`}
        >
          <div
            className="w-full h-full"
            style={{ background: isTransparent ? '#ffffff' : color }}
          />
          {isTransparent && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45 pointer-events-none" />
          )}
        </div>

        {/* Input box */}
        <div className="flex-1 h-[2.1vw] rounded-[0.45vw] border border-gray-300 bg-white flex items-center justify-between px-[0.75vw] hover:border-gray-400 focus-within:border-indigo-400 transition-colors shadow-2xs">
          <input
            type="text"
            value={displayColor}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || val === '#') {
                onChange('none');
              } else {
                const finalVal = val.startsWith('#') ? val : '#' + val;
                onChange(finalVal);
              }
            }}
            className="text-[0.8vw] font-mono font-medium text-gray-800 outline-none bg-transparent flex-1 uppercase"
            maxLength={9}
          />
          <div
            className="flex items-center cursor-ew-resize select-none px-[0.2vw] hover:bg-gray-50 rounded"
            onPointerDown={(e) => {
              const currentPct = Math.round(parseFloat(opacity !== undefined ? opacity : 100));
              handleScrubHelper(e, currentPct, (val) => {
                const num = parseInt(val);
                const clamped = Math.min(Math.max(num, 0), 100);
                onOpacityChange(clamped);
              });
            }}
            title="Drag horizontally to adjust opacity"
          >
            <span className="text-[0.8vw] font-medium text-gray-700">
              {Math.round(parseFloat(opacity !== undefined ? opacity : 100))}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: update or inject zoom parameter into a Google Maps URL
const updateUrlZoom = (url, zoomLevel) => {
  if (!url) return url;
  if (/([?&]z=)\d+/i.test(url)) {
    return url.replace(/([?&]z=)\d+/i, `$1${zoomLevel}`);
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}z=${zoomLevel}`;
};

// Helper: extract zoom level from a URL, with fallback
const extractUrlZoom = (url, fallback = 11) => {
  if (!url) return fallback;
  const match = url.match(/[?&]z=(\d+)/i);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val >= 1 && val <= 21) return val;
  }
  return fallback;
};

// Toggle Switch matching exact reference design
const Toggle = ElementToggle;

// Custom Select Dropdown matching exact reference design
const CustomSelect = ElementDropdown;

const THEME_OPTIONS = [
  { value: 'Light Theme', label: 'Light Theme' },
  { value: 'Dark Theme', label: 'Dark Theme' }
];

const ElementMapProperties = ({ selectedElement, onUpdate, updateElementAttribute, activePageIndex, selectedLayerId }) => {
  // --- 1. Map Source Settings ---
  const [sourceType, setSourceType] = useState('Location'); // 'Location' | 'URL' | 'Embed Code'
  const [location, setLocation] = useState('Gandhipuram, Coimbatore, Tamil Nadu');
  const [locationInput, setLocationInput] = useState('Gandhipuram, Coimbatore, Tamil Nadu');
  const [urlInput, setUrlInput] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [zoom, setZoom] = useState(11);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // --- 2. Map Layout Template ---
  const [layoutStyle, setLayoutStyle] = useState('none'); // default to 'carousel' matching mockup

  // --- 3. Button Color State & Open in Map Toggle ---
  const [buttonColor, setButtonColor] = useState('#000000');
  const [buttonOpacity, setButtonOpacity] = useState(100);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showOpenMapBtn, setShowOpenMapBtn] = useState(true);

  // --- 4. Theme State (Light and Dark) ---
  const [theme, setTheme] = useState('Light Theme'); // 'Light Theme' | 'Dark Theme'

  // --- 5. Place Details State ---
  const [businessName, setBusinessName] = useState(DEFAULT_MAP_DATA.name);
  const [businessAddress, setBusinessAddress] = useState(DEFAULT_MAP_DATA.address);
  const [businessRating, setBusinessRating] = useState(DEFAULT_MAP_DATA.rating);
  const [businessReviews, setBusinessReviews] = useState(DEFAULT_MAP_DATA.reviews);
  const [businessCategory, setBusinessCategory] = useState(DEFAULT_MAP_DATA.category);
  const [businessPhone, setBusinessPhone] = useState(DEFAULT_MAP_DATA.phone);
  const [businessImage, setBusinessImage] = useState(DEFAULT_MAP_DATA.image);

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);

  const isDarkTheme = String(theme).toLowerCase().includes('dark');

  // Colors on page for ColorPicker
  const colorsOnPageList = useMemo(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const elements = doc.querySelectorAll('[data-fill-color], [data-stroke-color], [fill], [stroke]');
    const colors = new Set();
    elements.forEach(el => {
      const fill = el.getAttribute('data-fill-color') || el.getAttribute('fill');
      const stroke = el.getAttribute('data-stroke-color') || el.getAttribute('stroke');
      if (fill && fill !== 'none' && fill !== '#' && !fill.includes('gradient')) colors.add(fill.toUpperCase());
      if (stroke && stroke !== 'none' && stroke !== '#' && !stroke.includes('gradient')) colors.add(stroke.toUpperCase());
    });
    colors.add('#000000');
    colors.add('#FFFFFF');
    colors.add('#00828A');
    colors.add('#EC5137');
    return Array.from(colors).slice(0, 12);
  }, [selectedElement]);

  // Helper: parse user-provided Map URL into an embeddable format
  const parseMapUrl = (raw, zoomLevel = zoom) => {
    if (!raw || !raw.trim()) return '';
    const trimmed = raw.trim();

    // If an iframe tag was pasted into URL input by accident
    const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) return iframeMatch[1];

    // Already a Google Maps embed URL
    if (trimmed.includes('output=embed') || trimmed.includes('/maps/embed')) {
      return trimmed;
    }

    // Google Maps place URL: /maps/place/PlaceName/...
    const placeMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/i);
    if (placeMatch && placeMatch[1]) {
      const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=${zoomLevel}&ie=UTF8&iwloc=near&output=embed`;
    }

    // Google Maps search URL: /maps/search/Query/...
    const searchMatch = trimmed.match(/\/maps\/search\/([^/@?]+)/i);
    if (searchMatch && searchMatch[1]) {
      const query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoomLevel}&ie=UTF8&iwloc=near&output=embed`;
    }

    // Google Maps query param: ?q=...
    try {
      const urlObj = new URL(trimmed);
      const q = urlObj.searchParams.get('q');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=${zoomLevel}&ie=UTF8&iwloc=near&output=embed`;
      }
    } catch (e) {}

    // Generic http/https URL: append output=embed if google maps
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      if (trimmed.includes('maps.google.com')) {
        const sep = trimmed.includes('?') ? '&' : '?';
        return `${trimmed}${sep}output=embed`;
      }
      return trimmed;
    }

    // Fallback: search query
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=${zoomLevel}&ie=UTF8&iwloc=near&output=embed`;
  };

  // Helper: extract iframe src from embed code
  const parseEmbedCode = (code) => {
    if (!code || !code.trim()) return '';
    const trimmed = code.trim();
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
    return parseMapUrl(trimmed);
  };

  // Universal updater that keeps canvas DOM & attributes in sync
  const updateMapData = (updatedFields = {}) => {
    const nextStyle = updatedFields.style !== undefined ? updatedFields.style : layoutStyle;
    const nextZoom = updatedFields.zoom !== undefined ? updatedFields.zoom : zoom;
    let nextUrl = updatedFields.url !== undefined ? updatedFields.url : iframeUrl;
    if (nextUrl) {
      nextUrl = updateUrlZoom(nextUrl, nextZoom);
    }
    const nextSourceType = updatedFields.sourceType !== undefined ? updatedFields.sourceType : sourceType;
    const nextLocation = updatedFields.location !== undefined ? updatedFields.location : location;
    const nextName = updatedFields.name !== undefined ? updatedFields.name : businessName;
    const nextAddress = updatedFields.address !== undefined ? updatedFields.address : businessAddress;
    const nextRating = updatedFields.rating !== undefined ? updatedFields.rating : businessRating;
    const nextReviews = updatedFields.reviews !== undefined ? updatedFields.reviews : businessReviews;
    const nextCategory = updatedFields.category !== undefined ? updatedFields.category : businessCategory;
    const nextPhone = updatedFields.phone !== undefined ? updatedFields.phone : businessPhone;
    const nextImage = updatedFields.image !== undefined ? updatedFields.image : businessImage;
    const nextTheme = updatedFields.theme !== undefined ? updatedFields.theme : theme;
    const nextButtonColor = updatedFields.buttonColor !== undefined ? updatedFields.buttonColor : buttonColor;
    const nextShowOpenMapBtn = updatedFields.showOpenMapBtn !== undefined ? updatedFields.showOpenMapBtn : showOpenMapBtn;

    if (nextUrl) setIframeUrl(nextUrl);

    if (selectedElement) {
      selectedElement.setAttribute('data-map-style', nextStyle);
      selectedElement.setAttribute('data-zoom', String(nextZoom));
      selectedElement.setAttribute('data-url', nextUrl);
      selectedElement.setAttribute('data-source-type', nextSourceType);
      selectedElement.setAttribute('data-location', nextLocation);
      selectedElement.setAttribute('data-business-name', nextName);
      selectedElement.setAttribute('data-business-address', nextAddress);
      selectedElement.setAttribute('data-business-rating', nextRating);
      selectedElement.setAttribute('data-business-reviews', nextReviews);
      selectedElement.setAttribute('data-business-category', nextCategory);
      selectedElement.setAttribute('data-business-phone', nextPhone);
      selectedElement.setAttribute('data-business-image', nextImage);
      selectedElement.setAttribute('data-theme', nextTheme);
      selectedElement.setAttribute('data-button-color', nextButtonColor);
      selectedElement.setAttribute('data-show-open-map-btn', nextShowOpenMapBtn ? 'true' : 'false');

      if (updatedFields.rawUrl !== undefined) selectedElement.setAttribute('data-raw-url', updatedFields.rawUrl);
      if (updatedFields.embedCode !== undefined) selectedElement.setAttribute('data-embed-code', updatedFields.embedCode);

      const fo = selectedElement.querySelector('foreignObject');

      // Rebuild inner foreignObject container with fresh overlay & theme
      const overlayHtml = generateOverlayHtml(nextStyle, {
        name: nextName,
        address: nextAddress,
        rating: nextRating,
        reviews: nextReviews,
        category: nextCategory,
        phone: nextPhone,
        image: nextImage,
        location: nextLocation,
        theme: nextTheme,
        buttonColor: nextButtonColor
      });

      if (fo) {
        const foW = parseFloat(fo.getAttribute('width')) || 180;
        const foH = parseFloat(fo.getAttribute('height')) || 135;
        const baseW = 360;
        const scale = foW / baseW;
        const innerW = baseW;
        const innerH = Math.round(foH / scale);

        const isDark = String(nextTheme).toLowerCase().includes('dark');
        const filterStyle = isDark ? 'filter: invert(90%) hue-rotate(180deg) contrast(95%);' : '';

        fo.setAttribute('data-type', 'map');
        fo.setAttribute('style', 'overflow: hidden; border-radius: 0px;');
        fo.innerHTML = `
          <div xmlns="http://www.w3.org/1999/xhtml" class="map-root-container" style="position: relative; width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; border-radius: 0px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);">
            <div class="map-stage" style="position: absolute; top: 0; left: 0; width: ${innerW}px; height: ${innerH}px; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden;">
              <iframe src="${nextUrl.replace(/&/g, '&amp;')}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; pointer-events: none; margin: 0; padding: 0; display: block; ${filterStyle}" allowfullscreen="" loading="lazy"></iframe>
              <div class="map-overlay-wrapper" style="position: absolute; inset: 0; pointer-events: none;">
                ${overlayHtml}
              </div>
            </div>
          </div>
        `;
      }

      if (onUpdate) {
        onUpdate(selectedElement.outerHTML);
      }
      if (updateElementAttribute && selectedLayerId !== undefined) {
        let node = selectedElement;
        let lastSvg = null;
        while (node) {
          if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
          node = node.parentElement;
        }
        if (lastSvg) {
          const cloneSvg = lastSvg.cloneNode(true);
          cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
          const serializer = new XMLSerializer();
          const html = serializer.serializeToString(cloneSvg);
          updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
        }
      }
    }
  };

  // Helper to apply fetched Google Maps details to state & preview
  const applyFetchedDetails = (data, rawUrlVal = '', type = 'URL') => {
    const details = data.details || {};
    const isGeneric = !details.name || /^google\s*maps?(\s*location)?$/i.test(details.name.trim()) || details.name === 'Location';

    let newName = businessName;
    if (!isGeneric && details.name) {
      newName = details.name;
    } else if (type === 'Location' && locationInput.trim()) {
      newName = locationInput.trim();
    } else if (data.place && !/^google\s*maps?(\s*location)?$/i.test(data.place.trim()) && data.place !== 'Location') {
      newName = data.place;
    }

    let newAddress = businessAddress;
    if (!isGeneric && details.address) {
      newAddress = details.address;
    } else if (details.coords) {
      newAddress = `Coordinates: ${details.coords}`;
    } else if (newName && newName !== 'Location') {
      newAddress = newName;
    }

    const newRating = details.rating && details.rating !== '4.8' ? details.rating : (businessRating || '4.9');
    const newReviews = details.reviews && details.reviews !== '500+' ? details.reviews : (businessReviews || '1500');
    const newCategory = details.category && details.category !== 'Location' ? details.category : (businessCategory || 'City in Tamil Nadu');
    const newPhone = details.phone || businessPhone;
    const newImage = details.image || businessImage;

    setBusinessName(newName);
    setBusinessAddress(newAddress);
    setBusinessRating(newRating);
    setBusinessReviews(newReviews);
    setBusinessCategory(newCategory);
    setBusinessPhone(newPhone);
    if (newImage) setBusinessImage(newImage);
    setLocation(newName);

    // Pick the URL safely: never allow wrapping URLs into q=https...
    let finalEmbedUrl = iframeUrl;
    if (type === 'Embed Code') {
      finalEmbedUrl = parseEmbedCode(rawUrlVal || embedCode) || iframeUrl;
    } else if (data.embedUrl && !data.embedUrl.includes('q=https') && !data.embedUrl.includes('q=http')) {
      finalEmbedUrl = data.embedUrl;
    } else if (type === 'Location' && newName) {
      finalEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(newName)}&t=&z=${zoom}&ie=UTF8&iwloc=near&output=embed`;
    }

    setIframeUrl(finalEmbedUrl);

    const updatePayload = {
      url: finalEmbedUrl,
      sourceType: type,
      location: newName,
      name: newName,
      address: newAddress,
      rating: newRating,
      reviews: newReviews,
      category: newCategory,
      phone: newPhone,
      image: newImage,
      theme,
      buttonColor
    };

    if (type === 'URL' && rawUrlVal) updatePayload.rawUrl = rawUrlVal;
    if (type === 'Embed Code' && rawUrlVal) updatePayload.embedCode = rawUrlVal;

    updateMapData(updatePayload);
  };

  // Helper to fetch place details from Google Maps via backend or Nominatim
  const fetchPlaceDetails = async (queryOrUrl, targetSourceType = 'URL') => {
    if (!queryOrUrl || !queryOrUrl.trim()) return null;
    setIsLoadingUrl(true);
    setErrorMessage('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/flipbook/resolve-map-url?url=${encodeURIComponent(queryOrUrl.trim())}`);
      const data = await res.json();
      if (data && data.success) {
        applyFetchedDetails(data, queryOrUrl.trim(), targetSourceType);
        return data;
      }
    } catch (e) {
      // Backend resolution fallback
    } finally {
      setIsLoadingUrl(false);
    }
    return null;
  };

  // Sync state with selected element on canvas
  useEffect(() => {
    const defaultUrl = `https://maps.google.com/maps?q=${encodeURIComponent('Gandhipuram, Coimbatore, Tamil Nadu')}&t=&z=14&ie=UTF8&iwloc=near&output=embed`;

    if (selectedElement) {
      const url = selectedElement.getAttribute('data-url') || defaultUrl;
      const savedType = selectedElement.getAttribute('data-source-type');
      const savedLocation = selectedElement.getAttribute('data-location');
      const savedRawUrl = selectedElement.getAttribute('data-raw-url');
      const savedEmbed = selectedElement.getAttribute('data-embed-code');

      const savedStyle = selectedElement.getAttribute('data-map-style');
      const savedZoomAttr = selectedElement.getAttribute('data-zoom');
      const savedName = selectedElement.getAttribute('data-business-name');
      const savedAddress = selectedElement.getAttribute('data-business-address');
      const savedRating = selectedElement.getAttribute('data-business-rating');
      const savedReviews = selectedElement.getAttribute('data-business-reviews');
      const savedCategory = selectedElement.getAttribute('data-business-category');
      const savedPhone = selectedElement.getAttribute('data-business-phone');
      const savedImage = selectedElement.getAttribute('data-business-image');
      const savedTheme = selectedElement.getAttribute('data-theme') || 'Light Theme';
      const savedButtonColor = selectedElement.getAttribute('data-button-color') || '#000000';
      const savedShowOpenMapBtn = selectedElement.getAttribute('data-show-open-map-btn');

      let parsedZoom = savedZoomAttr ? parseInt(savedZoomAttr, 10) : extractUrlZoom(url, 11);
      if (isNaN(parsedZoom) || parsedZoom < 1 || parsedZoom > 20) parsedZoom = 11;
      if (!savedZoomAttr && (url.includes('z=13') || url.includes('z=12'))) {
        parsedZoom = 11;
      }
      setZoom(parsedZoom);

      const effectiveUrl = updateUrlZoom(url, parsedZoom);
      setIframeUrl(effectiveUrl);

      if (savedStyle) {
        setLayoutStyle(savedStyle);
      }
      if (savedName && !savedName.toLowerCase().includes('fisto')) {
        setBusinessName(savedName);
      } else {
        setBusinessName('Gandhipuram');
      }
      if (savedAddress && !savedAddress.toLowerCase().includes('fisto')) {
        setBusinessAddress(savedAddress);
      } else {
        setBusinessAddress('Coimbatore, Tamil Nadu, India');
      }
      if (savedRating) setBusinessRating(savedRating);
      if (savedReviews) setBusinessReviews(savedReviews);
      if (savedCategory) setBusinessCategory(savedCategory);
      if (savedPhone) setBusinessPhone(savedPhone);
      if (savedImage) setBusinessImage(savedImage);
      if (savedTheme) setTheme(savedTheme);
      if (savedButtonColor) setButtonColor(savedButtonColor);
      if (savedShowOpenMapBtn !== null) setShowOpenMapBtn(savedShowOpenMapBtn !== 'false');

      if (savedType) {
        setSourceType(savedType);
      }
      if (savedLocation) {
        setLocation(savedLocation);
        setLocationInput(savedLocation);
      } else if (savedName) {
        setLocation(savedName);
        setLocationInput(savedName);
      } else {
        setLocation('Gandhipuram, Coimbatore, Tamil Nadu');
        setLocationInput('Gandhipuram, Coimbatore, Tamil Nadu');
      }

      if (!savedLocation && !savedName && url.includes('maps.google.com') && url.includes('q=')) {
        try {
          const parsed = new URL(url);
          const q = parsed.searchParams.get('q');
          if (q) {
            const dec = decodeURIComponent(q);
            setLocation(dec);
            setLocationInput(dec);
          }
        } catch (e) {}
      }

      if (savedRawUrl) {
        setUrlInput(savedRawUrl);
      } else if (url && !url.includes('Gandhipuram') && !url.includes('Coimbatore')) {
        setUrlInput(url);
      }

      if (savedEmbed) {
        setEmbedCode(savedEmbed);
      }

      const fo = selectedElement.querySelector('foreignObject');
      const isDark = String(savedTheme).toLowerCase().includes('dark');
      const filterStyle = isDark ? 'filter: invert(90%) hue-rotate(180deg) contrast(95%);' : '';

      if (fo) {
        const foW = parseFloat(fo.getAttribute('width')) || 180;
        const foH = parseFloat(fo.getAttribute('height')) || 135;
        const baseW = 360;
        const scale = foW / baseW;
        const innerW = baseW;
        const innerH = Math.round(foH / scale);

        fo.setAttribute('data-type', 'map');
        fo.setAttribute('style', 'overflow: hidden; border-radius: 0px;');

        const effectiveStyle = savedStyle || layoutStyle || 'none';
        const freshOverlayHtml = generateOverlayHtml(effectiveStyle, {
          name: (savedName && !savedName.toLowerCase().includes('fisto')) ? savedName : 'Gandhipuram',
          address: (savedAddress && !savedAddress.toLowerCase().includes('fisto')) ? savedAddress : 'Coimbatore, Tamil Nadu, India',
          rating: savedRating || businessRating || DEFAULT_MAP_DATA.rating,
          reviews: savedReviews || businessReviews || DEFAULT_MAP_DATA.reviews,
          category: savedCategory || businessCategory || DEFAULT_MAP_DATA.category,
          phone: savedPhone || businessPhone || DEFAULT_MAP_DATA.phone,
          image: savedImage || businessImage || DEFAULT_MAP_DATA.image,
          location: savedLocation || location,
          theme: savedTheme,
          buttonColor: savedButtonColor,
          showOpenMapBtn: savedShowOpenMapBtn !== null ? savedShowOpenMapBtn !== 'false' : showOpenMapBtn
        });

        const cleanUrl = updateUrlZoom((url || defaultUrl).replace(/&amp;/g, '&'), parsedZoom).replace(/&/g, '&amp;');

        fo.innerHTML = `
          <div xmlns="http://www.w3.org/1999/xhtml" class="map-root-container" style="position: relative; width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; border-radius: 0px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);">
            <div class="map-stage" style="position: absolute; top: 0; left: 0; width: ${innerW}px; height: ${innerH}px; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden;">
              <iframe src="${cleanUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; pointer-events: none; margin: 0; padding: 0; display: block; ${filterStyle}" allowfullscreen="" loading="lazy"></iframe>
              <div class="map-overlay-wrapper" style="position: absolute; inset: 0; pointer-events: none;">
                ${freshOverlayHtml}
              </div>
            </div>
          </div>
        `;

        if (onUpdate) {
          onUpdate(selectedElement.outerHTML);
        }
        if (updateElementAttribute && selectedLayerId !== undefined) {
          let node = selectedElement;
          let lastSvg = null;
          while (node) {
            if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
            node = node.parentElement;
          }
          if (lastSvg) {
            const cloneSvg = lastSvg.cloneNode(true);
            cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
            const serializer = new XMLSerializer();
            const html = serializer.serializeToString(cloneSvg);
            updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
          }
        }
      }
    } else {
      setIframeUrl(defaultUrl);
    }
  }, [selectedElement]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Location search input handler
  const handleLocationInputChange = async (e) => {
    const value = e.target.value;
    setLocationInput(value);
    setErrorMessage('');

    // Check if coordinates
    const isCoordinateRegex = /^[-+]?\d{1,2}(\.\d+)?\s*,\s*[-+]?\d{1,3}(\.\d+)?$/;
    if (isCoordinateRegex.test(value.trim())) {
      setSuggestions([{
        display_name: value.trim(),
        isCoordinate: true
      }]);
      setShowSuggestions(true);
      return;
    }

    if (value.length > 1) {
      try {
        // First prioritize Indian locations, then append global results if needed
        const [indiaRes, globalRes] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`).then(r => r.json()).catch(() => []),
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`).then(r => r.json()).catch(() => [])
        ]);

        const inResults = Array.isArray(indiaRes) ? indiaRes : [];
        const globResults = Array.isArray(globalRes) ? globalRes : [];

        // Deduplicate: Indian locations first, followed by others
        const seenIds = new Set(inResults.map(item => item.place_id));
        const combined = [...inResults];
        for (const item of globResults) {
          if (!seenIds.has(item.place_id)) {
            seenIds.add(item.place_id);
            combined.push(item);
          }
        }

        const results = combined.slice(0, 7);
        results.push({
          display_name: value.trim(),
          isCustomQuery: true
        });
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([{ display_name: value.trim(), isCustomQuery: true }]);
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const placeName = suggestion.display_name;
    const isDirect = suggestion.isCoordinate || suggestion.isCustomQuery;
    const parts = placeName.split(',');
    const mainTitle = isDirect ? suggestion.display_name : parts[0].trim();
    const secondaryAddress = isDirect ? mainTitle : (parts.slice(1, 4).join(',').trim() || mainTitle);
    const categoryName = suggestion.type ? (suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1).replace(/_/g, ' ')) : 'Location';

    setLocationInput(mainTitle);
    setLocation(mainTitle);
    setBusinessName(mainTitle);
    setBusinessAddress(secondaryAddress);
    setBusinessCategory(categoryName);
    setShowSuggestions(false);
    setErrorMessage('');

    const newUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mainTitle)}&t=&z=${zoom}&ie=UTF8&iwloc=near&output=embed`;
    setIframeUrl(newUrl);
    updateMapData({
      url: newUrl,
      sourceType: 'Location',
      location: mainTitle,
      name: mainTitle,
      address: secondaryAddress,
      category: categoryName
    });

    fetchPlaceDetails(mainTitle, 'Location');
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    setErrorMessage('');
    const query = locationInput.trim();
    if (!query) return;

    const newUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoom}&ie=UTF8&iwloc=near&output=embed`;
    setBusinessName(query);
    setLocation(query);
    setBusinessAddress(query);
    setIframeUrl(newUrl);

    updateMapData({
      url: newUrl,
      sourceType: 'Location',
      location: query,
      name: query,
      address: query
    });

    fetchPlaceDetails(query, 'Location');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;
    setErrorMessage('');
    const trimmed = urlInput.trim();
    setIsLoadingUrl(true);

    try {
      const data = await fetchPlaceDetails(trimmed, 'URL');
      if (data && data.success) {
        setIsLoadingUrl(false);
        return;
      }
    } catch (e) {
      // url parse fallback
    } finally {
      setIsLoadingUrl(false);
    }

    const processed = parseMapUrl(trimmed);
    if (processed) {
      updateMapData({ url: processed, sourceType: 'URL', rawUrl: trimmed });
    } else {
      setErrorMessage("Could not parse map URL. Please paste a valid Google Maps link.");
    }
  };

  const handleApplyEmbedCode = async () => {
    if (!embedCode.trim()) return;
    setErrorMessage('');
    const trimmed = embedCode.trim();

    const extracted = parseEmbedCode(trimmed);
    if (!extracted) {
      setErrorMessage("Could not extract map URL. Please paste a valid <iframe> embed code.");
      return;
    }

    // Extract place name or coords from pb parameter if present
    let extractedName = '';
    const pbPlaceMatch = extracted.match(/!2s([^!&]+)/);
    if (pbPlaceMatch && pbPlaceMatch[1]) {
      extractedName = decodeURIComponent(pbPlaceMatch[1].replace(/\+/g, ' '));
    }
    const pbLat = extracted.match(/!3d(-?\d+\.\d+)/);
    const pbLng = extracted.match(/!2d(-?\d+\.\d+)/);
    const coords = (pbLat && pbLng) ? `${pbLat[1]}, ${pbLng[1]}` : '';

    const newName = extractedName || businessName || 'Location';
    const newAddress = coords ? `Coordinates: ${coords}` : (extractedName || businessAddress || 'Location Details');

    if (extractedName) {
      setBusinessName(extractedName);
      setLocation(extractedName);
      setBusinessAddress(newAddress);
    }
    setIframeUrl(extracted);

    updateMapData({
      url: extracted,
      sourceType: 'Embed Code',
      embedCode: trimmed,
      name: newName,
      address: newAddress,
      location: newName
    });

    setIsLoadingUrl(true);
    try {
      await fetchPlaceDetails(extracted, 'Embed Code');
    } catch (e) {
      // embed error handled
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Handle Theme Change ('Light Theme' | 'Dark Theme')
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updateMapData({ theme: newTheme });
  };

  // Handle Button Color Change
  const handleButtonColorChange = (newColor) => {
    setButtonColor(newColor);
    updateMapData({ buttonColor: newColor });
  };

  const handleButtonOpacityChange = (newOpacity) => {
    setButtonOpacity(newOpacity);
  };

  // Handle Zoom Change (1 - 20)
  const handleZoomChange = (newZoom) => {
    const val = Math.max(1, Math.min(20, Math.round(Number(newZoom) || 11)));
    setZoom(val);
    const updatedUrl = updateUrlZoom(iframeUrl, val);
    setIframeUrl(updatedUrl);
    updateMapData({ url: updatedUrl, zoom: val });
  };

  // Handle Open in Map Button Toggle
  const handleToggleOpenMapBtn = (newVal) => {
    setShowOpenMapBtn(newVal);
    updateMapData({ showOpenMapBtn: newVal });
  };

  return (
    <div className="relative flex flex-col gap-[1.7vw] w-full max-w-[25vw] pb-[2vw] font-sans select-none">
      {/* ===================== HEADER ===================== */}
      <div className="flex items-center gap-[0.8vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-wider">Map Properties</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      {/* ===================== 1. MAP SOURCE ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <SectionHeader title="Map Source" />

        {/* Source Switcher Tabs */}
        <div className="grid grid-cols-3 gap-[0.4vw] p-[0.2vw] bg-gray-100 rounded-[0.45vw]">
          {['Location', 'URL', 'Embed Code'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSourceType(type);
                setErrorMessage('');
              }}
              className={`h-[1.9vw] rounded-[0.35vw] text-[0.8vw] font-medium transition-all ${
                sourceType === type ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 1.1 Location Search Input */}
        {sourceType === 'Location' && (
          <div className="relative w-full mt-[0.1vw]" ref={wrapperRef}>
            <div className="w-full h-[2.1vw] flex items-center border border-gray-300 rounded-[0.45vw] bg-white px-[0.6vw] shadow-2xs hover:border-gray-400 focus-within:border-indigo-400 transition-colors">
              <Search size="0.85vw" className="text-gray-400 flex-shrink-0 mr-[0.4vw]" />
              <input
                type="text"
                value={locationInput}
                onChange={handleLocationInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (locationInput.trim() && locationInput.trim() !== location) {
                    handleSearchSubmit();
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search Location..."
                className="flex-1 h-full text-[0.8vw] font-medium text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[0.5vw] shadow-xl max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                {suggestions.map((suggestion, index) => {
                  const isDirect = suggestion.isCoordinate || suggestion.isCustomQuery;
                  const parts = suggestion.display_name.split(',');
                  const mainText = isDirect ? suggestion.display_name : parts[0];
                  const secondaryText = isDirect ? (suggestion.isCoordinate ? 'Coordinates' : 'Search on Google Maps') : parts.slice(1, 4).join(',').trim();

                  return (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex flex-col px-3 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <span className="text-[0.78vw] font-semibold text-gray-900 truncate">{mainText}</span>
                      {secondaryText && (
                        <span className="text-[0.68vw] text-gray-500 truncate">{secondaryText}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 1.2 URL Input */}
        {sourceType === 'URL' && (
          <div className="w-full flex flex-col gap-[0.3vw] mt-[0.1vw]">
            <span className="text-[0.72vw] text-gray-500 font-medium">Source URL</span>
            <div className={`flex h-[2.1vw] border ${errorMessage ? 'border-red-400' : 'border-gray-300'} rounded-[0.45vw] overflow-hidden focus-within:border-indigo-400 transition-colors bg-white shadow-2xs`}>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setErrorMessage('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyUrl();
                }}
                onBlur={handleApplyUrl}
                placeholder="e.g. https://maps.app.goo.gl/..."
                className="flex-1 px-[0.75vw] text-[0.8vw] font-medium outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                disabled={isLoadingUrl}
              />
              {isLoadingUrl && (
                <div className="flex items-center pr-[0.4vw]">
                  <Loader2 size="0.85vw" className="animate-spin text-indigo-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (urlInput) {
                    navigator.clipboard.writeText(urlInput.startsWith('http') ? urlInput : 'https://' + urlInput);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 1500);
                  }
                }}
                className="px-[0.6vw] flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 border-l border-gray-200 cursor-pointer"
                title={copiedUrl ? 'Copied!' : 'Copy Link'}
              >
                {copiedUrl ? (
                  <Check className="w-[0.85vw] h-[0.85vw] text-green-600" />
                ) : (
                  <Copy className="w-[0.85vw] h-[0.85vw]" />
                )}
              </button>
            </div>
            {errorMessage && (
              <div className="p-[0.35vw] bg-red-50 border border-red-200 rounded-[0.4vw] text-[0.7vw] text-red-600 flex items-start gap-[0.25vw] mt-[0.1vw]">
                <AlertCircle size="0.75vw" className="text-red-500 flex-shrink-0 mt-[0.05vw]" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* 1.3 Embed Code Textarea */}
        {sourceType === 'Embed Code' && (
          <div className="w-full flex flex-col gap-[0.3vw] mt-[0.1vw]">
            <span className="text-[0.72vw] text-gray-500 font-medium">HTML Embed Code</span>
            <textarea
              value={embedCode}
              onChange={(e) => {
                setEmbedCode(e.target.value);
                setErrorMessage('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyEmbedCode();
                }
              }}
              onBlur={handleApplyEmbedCode}
              placeholder="Paste HTML code here"
              rows={3}
              className={`w-full border ${errorMessage ? 'border-red-400' : 'border-gray-300'} rounded-[0.45vw] p-[0.6vw] text-[0.8vw] font-mono text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 bg-white h-[5.5vw] resize-none shadow-2xs transition-colors`}
              disabled={isLoadingUrl}
            />
            {errorMessage && (
              <div className="p-[0.35vw] bg-red-50 border border-red-200 rounded-[0.4vw] text-[0.7vw] text-red-600 flex items-start gap-[0.25vw] mt-[0.1vw]">
                <AlertCircle size="0.75vw" className="text-red-500 flex-shrink-0 mt-[0.05vw]" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================== 2. ZOOM LEVEL ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <SectionHeader title="Zoom Level" />
        <div className="flex items-center gap-[0.8vw]">
          <div className="flex-1">
            <ElementSlider
              value={zoom}
              onChange={handleZoomChange}
              min={1}
              max={20}
              step={1}
            />
          </div>
          <div className="flex items-center gap-[0.25vw] h-[2.1vw]">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 1)}
              disabled={zoom <= 1}
              className="w-[1.8vw] h-full flex items-center justify-center bg-gray-100 rounded-[0.4vw] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="text-[1vw] leading-none mb-[0.1vw]">-</span>
            </button>
            <span className="w-[2.2vw] text-center font-mono font-medium text-[0.8vw] text-gray-800">
              {zoom}
            </span>
            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 1)}
              disabled={zoom >= 20}
              className="w-[1.8vw] h-full flex items-center justify-center bg-gray-100 rounded-[0.4vw] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="text-[0.9vw] leading-none mb-[0.1vw]">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== 3. LIVE MAP PREVIEW ===================== */}
      <div className="relative w-full aspect-[4/3] rounded-[0.6vw] border border-gray-300 overflow-hidden shadow-2xs bg-slate-100 select-none group">
        {iframeUrl ? (
          <div className="relative w-full h-full overflow-hidden">
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
                pointerEvents: 'none',
                filter: isDarkTheme ? 'invert(90%) hue-rotate(180deg) contrast(95%)' : 'none'
              }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map Preview"
            />
            {/* Card Overlay with Theme & Button Color */}
            <div
              className="absolute inset-0 pointer-events-none"
              dangerouslySetInnerHTML={{
                __html: generateOverlayHtml(layoutStyle, {
                  name: businessName,
                  address: businessAddress,
                  rating: businessRating,
                  reviews: businessReviews,
                  category: businessCategory,
                  phone: businessPhone,
                  image: businessImage,
                  location: location,
                  theme: theme,
                  buttonColor: buttonColor,
                  showOpenMapBtn: showOpenMapBtn
                })
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[0.75vw]">
            Enter location to view map
          </div>
        )}
      </div>

      {/* ===================== 4. BUTTON COLOR ===================== */}
      {layoutStyle && layoutStyle !== 'none' && layoutStyle !== 'plain' && (
        <ColorBoxRow
          title="Button Color"
          color={buttonColor}
          opacity={buttonOpacity}
          onOpenPicker={() => setActiveColorPicker(activeColorPicker === 'buttonColor' ? null : 'buttonColor')}
          onChange={handleButtonColorChange}
          onOpacityChange={handleButtonOpacityChange}
          isActive={activeColorPicker === 'buttonColor'}
        />
      )}

      {/* ===================== 5. THEME ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <SectionHeader title="Theme" />
        <div className="relative w-full">
          <CustomSelect
            value={theme}
            onChange={handleThemeChange}
            options={THEME_OPTIONS}
          />
        </div>
      </div>

      {/* ===================== COLOR PICKER PORTAL ===================== */}
      {activeColorPicker === 'buttonColor' && layoutStyle && layoutStyle !== 'none' && layoutStyle !== 'plain' && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              color={buttonColor}
              opacity={buttonOpacity}
              onOpacityChange={handleButtonOpacityChange}
              onChange={handleButtonColorChange}
              onClose={() => setActiveColorPicker(null)}
              disableGradient={true}
              colorsOnPage={colorsOnPageList}
            />
          </div>
        </div>,
        document.body
      )}

      {/* CUSTOM CSS matching ShapeProperties */}
      <style>{`
        .no-spin::-webkit-inner-spin-button, .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        body.is-scrubbing, body.is-scrubbing * {
          cursor: none !important;
          user-select: none !important;
        }
        .hide-cursor, .hide-cursor * {
          cursor: none !important;
        }
        .virtual-scrub-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 100000;
          width: 2vw;
          height: 2vw;
          margin-left: -1vw;
          margin-top: -1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0.1vw 0.2vw rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};

export default ElementMapProperties;


