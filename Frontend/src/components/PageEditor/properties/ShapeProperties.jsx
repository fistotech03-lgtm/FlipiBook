import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { handleScrubHelper } from './Color';
import Color from './Color';
import CornerRadius from './CornerRadius';
import Effect from './Effect';
import { ElementSlider } from '../LeftActionMenu/Elements/properties/ElementUIControls';
import { MaskIcon, FlattenIcon } from '../mainEditor/components/editorIcons';
import {
  Trash2,
  Edit2,
  ArrowRightLeft,
  Plus
} from 'lucide-react';
import ImageAdjustModal from '../LeftActionMenu/Elements/properties/ImageAdjustModal';
import { DEFAULT_FRAME_IMAGE } from '../LeftActionMenu/Elements/utils/imageFramingUtils';
import { getShapeCornerDefaults, buildCornerRadiusPath } from '../LeftActionMenu/Elements/utils/shapeElementUtils';
import { PropertySlider } from './propertiesShared';

// ShapeAppearanceControls export for backwards compatibility
export const ShapeAppearanceControls = ({
  backgroundColor,
  setBackgroundColor,
  activeColorPicker,
  setActiveColorPicker,
  colorsOnPage,
  radius,
  setRadius,
  isRadiusLinked,
  setIsRadiusLinked,
  hideCornerRadius = false,
  activeEffects,
  setActiveEffects,
  effectSettings,
  setEffectSettings,
  openSubSection,
  setOpenSubSection,
  showDetailedPicker,
  setShowDetailedPicker,
  isShape = true
}) => {
  return (
    <div className="flex flex-col gap-[1.7vw]">
      <Color
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        colorsOnPage={colorsOnPage}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        noAccordion={true}
      />
      {!hideCornerRadius && (
        <CornerRadius
          noAccordion={true}
          radius={radius}
          setRadius={setRadius}
          isRadiusLinked={isRadiusLinked}
          setIsRadiusLinked={setIsRadiusLinked}
        />
      )}
      <Effect
        noAccordion={true}
        isShape={isShape}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        activeEffects={activeEffects}
        setActiveEffects={setActiveEffects}
        effectSettings={effectSettings}
        setEffectSettings={setEffectSettings}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
      />
    </div>
  );
};

const ShapeProperties = ({
  selectedElementProps,
  activePageIndex,
  selectedLayerId,
  updateElementAttribute,
  activeMainTool: _activeMainTool,
  hideCornerRadius = false
}) => {
  const [openSubSection, setOpenSubSection] = useState('color');

  // UI states for Color
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showStrokeSettings, setShowStrokeSettings] = useState(false);
  const [isStrokeStyleOpen, setIsStrokeStyleOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [strokeSettingsPos, setStrokeSettingsPos] = useState({ top: 0, right: 0 });
  const [isDashPosOpen, setIsDashPosOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);

  // Image Masking / Framing state
  const [slotImage, setSlotImage] = useState(null);
  const [slotOriginalImage, setSlotOriginalImage] = useState(null);
  const [slotImageName, setSlotImageName] = useState('Image Name .jpg');
  const [slotImageMeta, setSlotImageMeta] = useState('1920 X 1080 • 24MB');
  const [slotRotation, setSlotRotation] = useState(0);
  const [isMaskEnabled, setIsMaskEnabled] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const fileInputRef = useRef(null);
  const adjustStateRef = useRef({
    isAdjusting: false,
    slotId: null,
    isPanning: false,
    startX: 0,
    startY: 0,
    matrix: null,
    rotateStr: '',
    imgNode: null,
    bbox: null,
    startMatrix: null,
    path: null
  });

  const colorsOnPage = useMemo(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const elements = doc.querySelectorAll('[data-fill-color], [data-stroke-color]');
    const colors = new Set();
    elements.forEach(el => {
      const fill = el.getAttribute('data-fill-color');
      const stroke = el.getAttribute('data-stroke-color');
      if (fill && fill !== 'none' && fill !== '#' && !fill.includes('gradient')) colors.add(fill.toUpperCase());
      if (stroke && stroke !== 'none' && stroke !== '#' && !stroke.includes('gradient')) colors.add(stroke.toUpperCase());
    });
    colors.add('#FFFFFF');
    colors.add('#000000');
    return Array.from(colors).slice(0, 12);
  }, []);

  // Determine Shape Kind
  const isCircleShape = Boolean(
    selectedElementProps?.['data-shape-id'] === 'true-circle' ||
    selectedElementProps?.['data-shape-title'] === 'Circle' ||
    selectedElementProps?.['data-name'] === 'Circle' ||
    selectedElementProps?.name === 'Circle' ||
    selectedElementProps?.tagName?.toLowerCase() === 'circle'
  );

  const isDiamondShape = Boolean(
    !isCircleShape &&
    (
      selectedElementProps?.['data-shape-id'] === 'rounded-diamond' ||
      selectedElementProps?.['data-shape-title'] === 'Diamond' ||
      selectedElementProps?.['data-name'] === 'Diamond' ||
      selectedElementProps?.name === 'Diamond' ||
      selectedElementProps?.['data-shape-type'] === 'diamond' ||
      (selectedElementProps?.d && (
        selectedElementProps.d.includes('50 10 L 90') ||
        selectedElementProps.d.includes('50,10 L 90') ||
        selectedElementProps.d.includes('50 12') ||
        selectedElementProps.d.includes('50 88') ||
        selectedElementProps.d.includes('85 43') ||
        selectedElementProps.d.includes('15 57')
      ))
    )
  );

  const isSquareShape = Boolean(
    !isDiamondShape &&
    !isCircleShape &&
    (
      selectedElementProps?.['data-shape-id'] === 'sharp-square' ||
      selectedElementProps?.['data-shape-title'] === 'Square' ||
      selectedElementProps?.['data-name'] === 'Square' ||
      selectedElementProps?.name === 'Square' ||
      selectedElementProps?.['data-shape-type'] === 'square' ||
      (selectedElementProps?.['data-shape-type'] === 'polygon' && parseInt(selectedElementProps['data-count']) === 4) ||
      (selectedElementProps?.['data-shape-type'] === 'rectangle' && (
        (selectedElementProps?.d && (selectedElementProps.d.includes('14 14') || selectedElementProps.d.includes('14,14'))) ||
        selectedElementProps?.['data-shape-title'] === 'Square'
      ))
    )
  );

  const is4SidedShape = isSquareShape || isDiamondShape;

  const rawShapeType = selectedElementProps?.['data-shape-type'] ||
    selectedElementProps?.innerTagName ||
    (selectedElementProps?.tagName?.toLowerCase() === 'rect' ? 'rectangle' :
      (selectedElementProps?.tagName?.toLowerCase() === 'circle' || selectedElementProps?.tagName?.toLowerCase() === 'ellipse' ? 'ellipse' :
        (selectedElementProps?.tagName?.toLowerCase() === 'line' ? 'line' :
          (selectedElementProps?.tagName?.toLowerCase() === 'polygon' ? 'polygon' : 'vector-path'))));

  const shapeType = is4SidedShape ? 'polygon' : (rawShapeType || 'vector-path');

  // DOM sync helper
  const syncDomChanges = useCallback(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    window.__skipCanvasUpdateForPage = activePageIndex;
    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }
    if (svgRoot) {
      const cloneSvg = svgRoot.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
    }
  }, [selectedLayerId, activePageIndex, updateElementAttribute]);

  // Mask / Framing Detection and Listeners
  useEffect(() => {
    const handleShapeMaskToggled = (e) => {
      if (!e.detail || !e.detail.layerId || e.detail.layerId === selectedLayerId) {
        const enabled = Boolean(e.detail?.enabled);
        setIsMaskEnabled(enabled);
        if (!enabled) {
          setSlotImage(null);
          setSlotOriginalImage(null);
          setSlotRotation(0);
        } else if (e.detail?.url) {
          setSlotImage(e.detail.url);
          setSlotOriginalImage(e.detail.url);
        }
      }
    };
    window.addEventListener('shape-mask-toggled', handleShapeMaskToggled);
    return () => window.removeEventListener('shape-mask-toggled', handleShapeMaskToggled);
  }, [selectedLayerId]);

  useEffect(() => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    const hasMaskEnabledAttr = selectedElement.getAttribute('data-mask-enabled') === 'true' ||
      selectedElement.querySelector('[data-mask-enabled="true"]') !== null ||
      (selectedElement.getAttribute('fill') && selectedElement.getAttribute('fill').includes('url(#pattern-')) ||
      selectedElement.querySelector('[fill*="url(#pattern-"]') !== null ||
      Boolean(selectedElementProps?.['data-mask-enabled'] === 'true') ||
      Boolean(selectedElementProps?.['data-masked-image-url']);

    setIsMaskEnabled(Boolean(hasMaskEnabledAttr));
    if (!hasMaskEnabledAttr) {
      setSlotImage(null);
      setSlotOriginalImage(null);
      setSlotRotation(0);
    }

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }

    if (shapeEl) {
      const fill = shapeEl.getAttribute('fill') || '';
      if (fill.includes('url(')) {
        const match = fill.match(/url\(['"]?#([^)'"]+)['"]?\)/);
        if (match && match[1]) {
          const patternId = match[1];
          const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${patternId}"]`) || doc.getElementById(patternId);
          if (pattern) {
            const imgNode = pattern.querySelector('image, img');
            if (imgNode) {
              const newHref = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href');
              if (newHref) {
                setSlotImage(newHref);
                setIsMaskEnabled(true);
                const savedName = shapeEl.getAttribute('data-slot-image-name') || selectedElement.getAttribute('data-slot-image-name');
                if (savedName) setSlotImageName(savedName);
                const savedMeta = shapeEl.getAttribute('data-slot-image-meta') || selectedElement.getAttribute('data-slot-image-meta');
                if (savedMeta) setSlotImageMeta(savedMeta);
                const savedOrig = shapeEl.getAttribute('data-slot-original-url') || selectedElement.getAttribute('data-slot-original-url');
                setSlotOriginalImage(savedOrig || newHref);
                const tf = imgNode.getAttribute('transform') || '';
                const rMatch = tf.match(/rotate\(([-0-9.]+)/);
                if (rMatch) setSlotRotation(parseFloat(rMatch[1]));
              }
            }
          }
        }
      } else if (selectedElementProps?.['data-masked-image-url']) {
        setSlotImage(selectedElementProps['data-masked-image-url']);
        setSlotOriginalImage(selectedElementProps['data-masked-image-url']);
        setIsMaskEnabled(true);
      }
    }
  }, [selectedLayerId, selectedElementProps]);

  // Image Mask Handlers
  const handleRemoveMask = () => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }

    if (shapeEl) {
      shapeEl.removeAttribute('data-mask-enabled');
      const patternMatch = (shapeEl.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
      if (patternMatch && patternMatch[1]) {
        const pat = (svgRoot || selectedElement).querySelector(`pattern[id="${patternMatch[1]}"]`);
        if (pat) pat.remove();
      }
      const origFill = shapeEl.getAttribute('data-original-fill') || '#3194FC';
      shapeEl.setAttribute('fill', origFill);
      shapeEl.removeAttribute('data-pattern-id');
      shapeEl.removeAttribute('data-masked-image-url');
      shapeEl.removeAttribute('data-slot-image-name');
      shapeEl.removeAttribute('data-slot-image-meta');
      shapeEl.removeAttribute('data-slot-original-url');
    }

    selectedElement.removeAttribute('data-mask-enabled');
    selectedElement.removeAttribute('data-slot-image-name');
    selectedElement.removeAttribute('data-slot-image-meta');
    selectedElement.removeAttribute('data-slot-original-url');
    setSlotImage(null);
    setSlotOriginalImage(null);
    setSlotImageName('Image Name .jpg');
    setSlotImageMeta('300 X 300 • 24MB');
    setSlotRotation(0);
    setIsMaskEnabled(false);

    window.__skipCanvasUpdateForPage = activePageIndex;
    if (svgRoot) {
      const cloneSvg = svgRoot.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, {
        '__dom_sync__': html,
        'data-mask-enabled': 'false',
        'data-masked-image-url': null,
        'fill': selectedElementProps?.['data-original-fill'] || '#3194FC'
      });
    }
    window.dispatchEvent(new CustomEvent('shape-mask-toggled', { detail: { layerId: selectedLayerId, enabled: false } }));
  };

  const handleDeleteImage = () => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }

    if (shapeEl) {
      const patternMatch = (shapeEl.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
      if (patternMatch && patternMatch[1]) {
        const pat = (svgRoot || selectedElement).querySelector(`pattern[id="${patternMatch[1]}"]`);
        if (pat) pat.remove();
      }
      const origFill = shapeEl.getAttribute('data-original-fill') || '#3194FC';
      shapeEl.setAttribute('fill', origFill);
      shapeEl.removeAttribute('data-pattern-id');
      shapeEl.removeAttribute('data-masked-image-url');
      shapeEl.removeAttribute('data-slot-image-name');
      shapeEl.removeAttribute('data-slot-image-meta');
      shapeEl.removeAttribute('data-slot-original-url');
      shapeEl.removeAttribute('data-slot-crop-data');
      shapeEl.removeAttribute('data-slot-fix-type');
      shapeEl.removeAttribute('data-slot-opacity');
      shapeEl.removeAttribute('data-slot-filters');
      shapeEl.setAttribute('data-mask-enabled', 'true');
    }

    selectedElement.removeAttribute('data-slot-image-name');
    selectedElement.removeAttribute('data-slot-image-meta');
    selectedElement.removeAttribute('data-slot-original-url');
    selectedElement.removeAttribute('data-slot-crop-data');
    selectedElement.removeAttribute('data-slot-fix-type');
    selectedElement.removeAttribute('data-slot-opacity');
    selectedElement.removeAttribute('data-slot-filters');
    selectedElement.setAttribute('data-mask-enabled', 'true');

    setSlotImage(null);
    setSlotOriginalImage(null);
    setSlotImageName('Image Name .jpg');
    setSlotImageMeta('300 X 300 • 24MB');
    setSlotRotation(0);
    setIsMaskEnabled(true);

    window.__skipCanvasUpdateForPage = activePageIndex;
    if (svgRoot) {
      const cloneSvg = svgRoot.cloneNode(true);
      cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(el => el.remove());
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(cloneSvg);
      updateElementAttribute(activePageIndex, selectedLayerId, {
        '__dom_sync__': html,
        'data-masked-image-url': null,
        'fill': selectedElementProps?.['data-original-fill'] || '#3194FC'
      });
    }
  };

  const applyImageMask = useCallback((
    dataUrl,
    name = null,
    sizeStr = null,
    originalDataUrl = null
  ) => {
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }
    if (!shapeEl) return;

    shapeEl.setAttribute('data-mask-enabled', 'true');
    selectedElement.setAttribute('data-mask-enabled', 'true');
    if (!shapeEl.hasAttribute('data-original-fill')) {
      shapeEl.setAttribute('data-original-fill', shapeEl.getAttribute('fill') || '#3194FC');
    }
    setIsMaskEnabled(true);

    const svgRoot = selectedElement.closest('svg') || doc.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"] svg`) || doc.querySelector('svg');
    let defs = svgRoot ? svgRoot.querySelector('defs') : selectedElement.querySelector('defs');
    if (!defs && svgRoot) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svgRoot.insertBefore(defs, svgRoot.firstChild);
    } else if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      selectedElement.insertBefore(defs, selectedElement.firstChild);
    }

    const patternId = `pattern-${selectedLayerId}`;
    let pattern = defs.querySelector(`pattern[id="${patternId}"]`);
    if (!pattern) {
      pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', patternId);
      defs.appendChild(pattern);
    }
    pattern.setAttribute('patternUnits', 'objectBoundingBox');
    pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '1');
    pattern.setAttribute('height', '1');
    pattern.removeAttribute('x');
    pattern.removeAttribute('y');
    pattern.removeAttribute('patternTransform');
    pattern.removeAttribute('viewBox');

    shapeEl.setAttribute('fill', `url(#${patternId})`);
    if (selectedElement !== shapeEl) {
      selectedElement.setAttribute('fill', `url(#${patternId})`);
    }

    const img = new window.Image();
    img.onload = () => {
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      const dims = `${imgW} X ${imgH}`;
      const meta = `${dims} • ${sizeStr || '24MB'}`;
      if (name) setSlotImageName(name);
      setSlotImageMeta(meta);

      const origToSave = originalDataUrl || dataUrl;
      setSlotOriginalImage(origToSave);

      if (shapeEl) {
        if (name) shapeEl.setAttribute('data-slot-image-name', name);
        shapeEl.setAttribute('data-slot-image-meta', meta);
        shapeEl.setAttribute('data-slot-original-url', origToSave);
      }
      if (selectedElement) {
        if (name) selectedElement.setAttribute('data-slot-image-name', name);
        selectedElement.setAttribute('data-slot-image-meta', meta);
        selectedElement.setAttribute('data-slot-original-url', origToSave);
      }

      let bbox = { width: 100, height: 100, x: 0, y: 0 };
      try {
        bbox = shapeEl.getBBox();
      } catch (e) { }
      if (bbox.width === 0 || bbox.height === 0) bbox = { width: 100, height: 100, x: 0, y: 0 };

      const slotW = bbox.width;
      const slotH = bbox.height;

      const scale = Math.max(slotW / imgW, slotH / imgH);
      const finalW = imgW * scale;
      const finalH = imgH * scale;

      const tx_user = (slotW - finalW) / 2;
      const ty_user = (slotH - finalH) / 2;

      let imageNode = pattern.querySelector('image, img');
      if (!imageNode) {
        imageNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        pattern.appendChild(imageNode);
      }

      imageNode.setAttribute('width', imgW);
      imageNode.setAttribute('height', imgH);
      imageNode.removeAttribute('preserveAspectRatio');
      imageNode.removeAttribute('x');
      imageNode.removeAttribute('y');

      const existingTf = imageNode.getAttribute('transform') || '';
      let rotateStr = '';
      const rMatch = existingTf.match(/rotate\([^)]+\)/);
      if (rMatch) rotateStr = rMatch[0] + ' ';

      imageNode.setAttribute('transform', `${rotateStr}matrix(${scale} 0 0 ${scale} ${tx_user} ${ty_user})`);
      imageNode.setAttribute('href', dataUrl);
      imageNode.setAttribute('xlink:href', dataUrl);

      setSlotImage(dataUrl);

      window.__skipCanvasUpdateForPage = activePageIndex;
      let rootSvg = selectedElement.closest('svg') || doc.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"] svg`) || doc.querySelector('svg');
      if (rootSvg) {
        const cloneSvg = rootSvg.cloneNode(true);
        cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer, .selection-overlay-layer').forEach(el => el.remove());
        const serializer = new XMLSerializer();
        const html = serializer.serializeToString(cloneSvg);
        updateElementAttribute(activePageIndex, selectedLayerId, {
          '__dom_sync__': html,
          'fill': `url(#${patternId})`,
          'data-masked-image-url': dataUrl
        });
      }
    };
    img.src = dataUrl;
  }, [selectedLayerId, activePageIndex, updateElementAttribute]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only Image formats are allowed for shapes.');
      e.target.value = '';
      return;
    }

    const name = file.name || 'Image Name .jpg';
    setSlotImageName(name);

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      : `${Math.round(file.size / 1024)}KB`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setSlotOriginalImage(dataUrl);
      applyImageMask(dataUrl, name, sizeStr, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveAdjustedImage = ({ croppedUrl, originalUrl }) => {
    const origUrlToKeep = originalUrl || slotOriginalImage || croppedUrl;
    setSlotOriginalImage(origUrlToKeep);

    const img = new window.Image();
    img.onload = () => {
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const dims = `${imgW} X ${imgH}`;
      const sizePart = slotImageMeta?.includes('•') ? slotImageMeta.split('•')[1].trim() : '24MB';
      const meta = `${dims} • ${sizePart}`;
      setSlotImageMeta(meta);

      applyImageMask(croppedUrl, slotImageName, meta, origUrlToKeep);
    };
    img.src = croppedUrl;

    setShowAdjustModal(false);
  };

  const updateRotation = (angle, skipSync = false) => {
    setSlotRotation(angle);
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const selectedElement = doc.getElementById(selectedLayerId);
    if (!selectedElement) return;

    let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
    if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
      shapeEl = selectedElement;
    }
    if (!shapeEl) return;

    const patternMatch = (shapeEl.getAttribute('fill') || '').match(/url\(['"]?#([^)'"]+)['"]?\)/);
    if (!patternMatch || !patternMatch[1]) return;
    const patternId = patternMatch[1];

    let svgRoot = selectedElement;
    while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') {
      svgRoot = svgRoot.parentElement;
    }
    const pattern = (svgRoot || selectedElement).querySelector(`pattern[id="${patternId}"]`) || doc.getElementById(patternId);
    if (!pattern) return;

    let bbox = { x: 0, y: 0, width: 100, height: 100 };
    try { bbox = shapeEl.getBBox(); } catch (e) { }
    const cx = bbox.width / 2;
    const cy = bbox.height / 2;

    const pcu = pattern.getAttribute('patternContentUnits');
    const imgNode = pattern.querySelector('image, img');
    if (!imgNode) return;

    let tf = imgNode.getAttribute('transform') || '';
    let m = [1, 0, 0, 1, 0, 0];
    const mMatch = tf.match(/matrix\(([^)]+)\)/);
    if (mMatch) {
      m = mMatch[1].split(/[ ,]+/).map(parseFloat);
    }

    if (pcu !== 'userSpaceOnUse') {
      m[0] = m[0] * bbox.width;
      m[2] = m[2] * bbox.width;
      m[1] = m[1] * bbox.height;
      m[3] = m[3] * bbox.height;
      m[4] = m[4] * bbox.width;
      m[5] = m[5] * bbox.height;
      pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');
      pattern.removeAttribute('patternTransform');
    }

    const matrixStr = `matrix(${m.join(' ')})`;
    if (angle !== 0) {
      imgNode.setAttribute('transform', `rotate(${angle}, ${cx}, ${cy}) ${matrixStr}`.trim());
    } else {
      imgNode.setAttribute('transform', matrixStr);
    }

    if (!skipSync) syncDomChanges();
  };

  const hasUploadedImage = Boolean(slotImage && slotImage !== DEFAULT_FRAME_IMAGE);

  // Shape Corner Radius
  const CORNER_RADIUS_SHAPE_IDS = [
    'rounded-rectangle',
    'single-corner-radius-rectangle',
    'same-side-corner-rectangle',
    'cut-corner-rectangle',
    'rounded-diamond',
    'sharp-square',
    'rectangle',
    'rect'
  ];

  const CORNER_RADIUS_SHAPE_TITLES = [
    'rectangle',
    'smooth-rectangle',
    'rounded rectangle',
    'single corner',
    'same side corner',
    'cut corner',
    'diamond',
    'square'
  ];

  const currentShapeId = (selectedElementProps?.['data-shape-id'] || '').toLowerCase().trim();
  const currentShapeTitle = (selectedElementProps?.['data-shape-title'] || selectedElementProps?.['data-name'] || selectedElementProps?.name || '').toLowerCase().trim();

  const isCornerRadiusShape = Boolean(
    CORNER_RADIUS_SHAPE_IDS.includes(currentShapeId) ||
    CORNER_RADIUS_SHAPE_TITLES.some(t => currentShapeTitle.includes(t)) ||
    selectedElementProps?.tagName?.toLowerCase() === 'rect' ||
    selectedElementProps?.['data-shape-type'] === 'rectangle' ||
    selectedElementProps?.['data-shape-type'] === 'square' ||
    selectedElementProps?.['data-shape-type'] === 'diamond' ||
    is4SidedShape ||
    selectedElementProps?.['data-tl'] !== undefined ||
    selectedElementProps?.rx !== undefined
  );

  const isCircleOrLine = isCircleShape || shapeType === 'ellipse' || shapeType === 'circle' || shapeType === 'line';
  const shouldHideCornerRadius = hideCornerRadius || isCircleOrLine || !isCornerRadiusShape;

  const shapeCornerId = selectedElementProps?.['data-shape-id'] || (() => {
    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId);
      return el?.getAttribute('data-shape-id') || el?.querySelector('[data-shape-id]')?.getAttribute('data-shape-id');
    } catch (e) { return null; }
  })();
  const shapeCornerTitle = selectedElementProps?.['data-shape-title'] || selectedElementProps?.['data-name'] || selectedElementProps?.name || (() => {
    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId);
      return el?.getAttribute('data-shape-title') || el?.getAttribute('data-name');
    } catch (e) { return null; }
  })();
  const cornerShapeDefaults = getShapeCornerDefaults(shapeCornerId, shapeCornerTitle);

  const radius = {
    tl: parseInt(selectedElementProps?.['data-tl'] !== undefined ? selectedElementProps['data-tl'] : (cornerShapeDefaults ? cornerShapeDefaults.tl : (selectedElementProps?.rx || 0))),
    tr: parseInt(selectedElementProps?.['data-tr'] !== undefined ? selectedElementProps['data-tr'] : (cornerShapeDefaults ? cornerShapeDefaults.tr : (selectedElementProps?.rx || 0))),
    bl: parseInt(selectedElementProps?.['data-bl'] !== undefined ? selectedElementProps['data-bl'] : (cornerShapeDefaults ? cornerShapeDefaults.bl : (selectedElementProps?.rx || 0))),
    br: parseInt(selectedElementProps?.['data-br'] !== undefined ? selectedElementProps['data-br'] : (cornerShapeDefaults ? cornerShapeDefaults.br : (selectedElementProps?.rx || 0)))
  };
  const isRadiusLinked = selectedElementProps?.['data-corner-linked'] !== undefined
    ? selectedElementProps['data-corner-linked'] !== 'false'
    : (cornerShapeDefaults ? cornerShapeDefaults.linked : true);

  const handleSetRadius = (updater) => {
    const next = typeof updater === 'function' ? updater(radius) : updater;
    const updates = {};
    updates['data-tl'] = (next.tl || 0).toString();
    updates['data-tr'] = (next.tr || 0).toString();
    updates['data-bl'] = (next.bl || 0).toString();
    updates['data-br'] = (next.br || 0).toString();

    const maxR = Math.max(next.tl || 0, next.tr || 0, next.bl || 0, next.br || 0);
    updates['rx'] = maxR.toString();
    updates['ry'] = maxR.toString();

    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId);
      if (el) {
        let target = el;
        if (el.tagName?.toLowerCase() === 'g') {
          const inner = el.querySelector('path, polygon, rect, circle, ellipse, line');
          if (inner) target = inner;
        }

        el.setAttribute('data-tl', updates['data-tl']);
        el.setAttribute('data-tr', updates['data-tr']);
        el.setAttribute('data-bl', updates['data-bl']);
        el.setAttribute('data-br', updates['data-br']);
        el.setAttribute('rx', updates['rx']);
        el.setAttribute('ry', updates['ry']);
        if (target !== el) {
          target.setAttribute('data-tl', updates['data-tl']);
          target.setAttribute('data-tr', updates['data-tr']);
          target.setAttribute('data-bl', updates['data-bl']);
          target.setAttribute('data-br', updates['data-br']);
          target.setAttribute('rx', updates['rx']);
          target.setAttribute('ry', updates['ry']);
        }

        if (isCornerRadiusShape || cornerShapeDefaults) {
          const defaults = cornerShapeDefaults || getShapeCornerDefaults(
            target.getAttribute('data-shape-id') || el.getAttribute('data-shape-id'),
            target.getAttribute('data-shape-title') || el.getAttribute('data-shape-title')
          );
          let x = parseFloat(target.getAttribute('x') || el.getAttribute('x') || (defaults ? defaults.x : 10));
          let y = parseFloat(target.getAttribute('y') || el.getAttribute('y') || (defaults ? defaults.y : 10));
          let w = parseFloat(target.getAttribute('width') || el.getAttribute('width') || (defaults ? defaults.w : 80));
          let h = parseFloat(target.getAttribute('height') || el.getAttribute('height') || (defaults ? defaults.h : 80));

          if (target.tagName?.toLowerCase() === 'rect') {
            const limitR = Math.min(w / 2, h / 2);
            const tl = Math.min(next.tl || 0, limitR);
            const tr = Math.min(next.tr || 0, limitR);
            const bl = Math.min(next.bl || 0, limitR);
            const br = Math.min(next.br || 0, limitR);

            if (tl === tr && tr === bl && bl === br) {
              target.setAttribute('rx', tl);
              target.setAttribute('ry', tl);
            } else {
              const d = buildCornerRadiusPath(x, y, w, h, tl, tr, br, bl);
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              Array.from(target.attributes).forEach(a => path.setAttribute(a.name, a.value));
              path.setAttribute('d', d);
              path.setAttribute('data-shape-type', 'rectangle');
              if (target.parentNode) target.parentNode.replaceChild(path, target);
              target = path;
              updates['d'] = d;
            }
          } else {
            const newPathData = buildCornerRadiusPath(x, y, w, h, next.tl || 0, next.tr || 0, next.br || 0, next.bl || 0);
            target.setAttribute('d', newPathData);
            updates['d'] = newPathData;
          }
        }

        window.__skipCanvasUpdateForPage = activePageIndex;
        let svgRoot = el;
        while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') svgRoot = svgRoot.parentElement;
        if (svgRoot) {
          const cloneSvg = svgRoot.cloneNode(true);
          cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(e => e.remove());
          const serializer = new XMLSerializer();
          const html = serializer.serializeToString(cloneSvg);
          updateElementAttribute(activePageIndex, selectedLayerId, { ...updates, '__dom_sync__': html });
          return;
        }
      }
    } catch (e) {
      console.error('Error updating corner radius live:', e);
    }

    updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  const handleSetIsRadiusLinked = (val) => {
    if (val) {
      const maxR = Math.max(radius.tl || 0, radius.tr || 0, radius.bl || 0, radius.br || 0);
      handleSetRadius({ tl: maxR, tr: maxR, bl: maxR, br: maxR });
      updateElementAttribute(activePageIndex, selectedLayerId, {
        'data-corner-linked': 'true',
        'data-tl': maxR.toString(),
        'data-tr': maxR.toString(),
        'data-bl': maxR.toString(),
        'data-br': maxR.toString(),
        'rx': maxR.toString(),
        'ry': maxR.toString()
      });
    } else {
      updateElementAttribute(activePageIndex, selectedLayerId, 'data-corner-linked', 'false');
    }
  };

  // Shape Parameter live updates (Sides/Points, Ratio, Corner)
  const updateAttr = (attribute, value) => {
    try {
      const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = doc.getElementById(selectedLayerId) || doc.querySelector(`[data-name="${selectedLayerId}"]`);
      if (el) {
        let targetShape = el;
        if (el.tagName?.toLowerCase() === 'g') {
          const inner = el.querySelector('path, polygon, rect, circle, ellipse, line');
          if (inner) targetShape = inner;
        }

        el.setAttribute(attribute, value);
        if (targetShape !== el) {
          targetShape.setAttribute(attribute, value);
        }

        if (['data-count', 'data-ratio', 'data-radius'].includes(attribute)) {
          const sType = targetShape.getAttribute('data-shape-type') || el.getAttribute('data-shape-type') || (shapeType === 'polygon' || shapeType === 'star' ? shapeType : null);
          if (sType === 'polygon' || sType === 'star') {
            let cx = parseFloat(targetShape.getAttribute('data-cx') || el.getAttribute('data-cx') || 0);
            let cy = parseFloat(targetShape.getAttribute('data-cy') || el.getAttribute('data-cy') || 0);
            let rx = parseFloat(targetShape.getAttribute('data-rx') || el.getAttribute('data-rx') || 0);
            const count = parseInt(attribute === 'data-count' ? value : (targetShape.getAttribute('data-count') || el.getAttribute('data-count') || (sType === 'polygon' ? (is4SidedShape ? 4 : 3) : 5)));
            const cr = parseFloat(attribute === 'data-radius' ? value : (targetShape.getAttribute('data-radius') || el.getAttribute('data-radius') || 0));
            const ratioVal = parseFloat(attribute === 'data-ratio' ? value : (targetShape.getAttribute('data-ratio') || el.getAttribute('data-ratio') || 40));

            if (!cx && !cy) { cx = 50; cy = 50; }
            if (!rx || rx <= 0) { rx = 42; }

            targetShape.setAttribute('data-cx', cx.toString());
            targetShape.setAttribute('data-cy', cy.toString());
            targetShape.setAttribute('data-rx', rx.toString());
            if (el !== targetShape) {
              el.setAttribute('data-cx', cx.toString());
              el.setAttribute('data-cy', cy.toString());
              el.setAttribute('data-rx', rx.toString());
            }

            const pts = [];
            if (sType === 'polygon') {
              for (let i = 0; i < count; i++) {
                const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
                pts.push({ x: cx + rx * Math.cos(angle), y: cy + rx * Math.sin(angle) });
              }
            } else if (sType === 'star') {
              const ratio = ratioVal / 100;
              const ri = rx * ratio;
              const sides = count * 2;
              for (let i = 0; i < sides; i++) {
                const r = (i % 2 === 0) ? rx : ri;
                const angle = (Math.PI / count) * i - Math.PI / 2;
                pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
              }
            }

            let pathData = "";
            if (cr > 0 && pts.length > 2) {
              const cornerPoints = pts.map((curr, i) => {
                const prev = pts[(i + pts.length - 1) % pts.length];
                const next = pts[(i + 1) % pts.length];
                const d1 = { x: curr.x - prev.x, y: curr.y - prev.y };
                const d2 = { x: next.x - curr.x, y: next.y - curr.y };
                const l1 = Math.hypot(d1.x, d1.y) || 1;
                const l2 = Math.hypot(d2.x, d2.y) || 1;
                const limit = Math.max(0, Math.min(cr, l1 / 2, l2 / 2));
                return {
                  limit,
                  q: { x: curr.x, y: curr.y },
                  p1: { x: curr.x - (d1.x / l1) * limit, y: curr.y - (d1.y / l1) * limit },
                  p2: { x: curr.x + (d2.x / l2) * limit, y: curr.y + (d2.y / l2) * limit }
                };
              });
              cornerPoints.forEach((cp, i) => {
                if (i === 0) pathData += `M ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                else pathData += ` L ${cp.p1.x.toFixed(2)} ${cp.p1.y.toFixed(2)}`;
                if (cp.limit > 0) {
                  pathData += ` Q ${cp.q.x.toFixed(2)} ${cp.q.y.toFixed(2)}, ${cp.p2.x.toFixed(2)} ${cp.p2.y.toFixed(2)}`;
                }
              });
              pathData += " Z";
            } else {
              pathData = `M ${pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ')} Z`;
            }

            targetShape.setAttribute('d', pathData);
            if (el !== targetShape && el.tagName?.toLowerCase() !== 'g') {
              el.setAttribute('d', pathData);
            }
          }
        }

        window.__skipCanvasUpdateForPage = activePageIndex;
        let svgRoot = el;
        while (svgRoot && svgRoot.tagName?.toLowerCase() !== 'svg') svgRoot = svgRoot.parentElement;
        if (svgRoot) {
          const cloneSvg = svgRoot.cloneNode(true);
          cloneSvg.querySelectorAll('[data-highlight-id], #ghost-layer').forEach(e => e.remove());
          const serializer = new XMLSerializer();
          const html = serializer.serializeToString(cloneSvg);
          updateElementAttribute(activePageIndex, selectedLayerId, { [attribute]: value, '__dom_sync__': html });
          return;
        }
      }
    } catch (e) {
      console.error('Error updating shape parameter live:', e);
    }

    updateElementAttribute(activePageIndex, selectedLayerId, attribute, value);
  };

  // Color State
  const rawFill = selectedElementProps?.['data-masked-image-url']
    ? (selectedElementProps?.['data-original-fill'] || '#d0ccff')
    : (selectedElementProps?.fill || '#000000');
  const safeFill = (!rawFill || rawFill === 'inherit')
    ? (selectedElementProps?.['data-fill-color'] || '#000000')
    : rawFill;

  const rawStroke = selectedElementProps?.['data-stroke-color'] || selectedElementProps?.stroke;
  const safeStroke = (!rawStroke || rawStroke === 'inherit')
    ? (selectedElementProps?.['data-stroke-color'] || 'none')
    : rawStroke;

  const rawStrokeWeight = parseFloat(selectedElementProps?.['data-stroke-width'] || selectedElementProps?.['stroke-width'] || selectedElementProps?.strokeWidth || 0);
  const safeStrokeWeight = isNaN(rawStrokeWeight) ? 0 : rawStrokeWeight;

  const backgroundColor = {
    fill: safeFill,
    fillOpacity: selectedElementProps?.opacity ? parseFloat(selectedElementProps.opacity) * 100 : 100,
    stroke: safeStroke,
    strokeOpacity: selectedElementProps?.['stroke-opacity'] ? parseFloat(selectedElementProps['stroke-opacity']) * 100 : 100,
    fillType: selectedElementProps?.['fill-type'] || 'solid',
    fillGradientType: selectedElementProps?.['fill-gradient-type'] || 'linear',
    fillStops: selectedElementProps?.['fill-stops'],
    fillAngle: parseFloat(selectedElementProps?.['fill-angle'] || 0),
    fillRadius: parseFloat(selectedElementProps?.['fill-radius'] || 100),
    strokeType: selectedElementProps?.['stroke-type'] || 'solid',
    strokeGradientType: selectedElementProps?.['stroke-gradient-type'] || 'linear',
    strokeStops: selectedElementProps?.['stroke-stops'],
    strokeAngle: parseFloat(selectedElementProps?.['stroke-angle'] || 0),
    strokeRadius: parseFloat(selectedElementProps?.['stroke-radius'] || 100),
    strokeWeight: safeStrokeWeight,
    strokeDashStyle: ((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) && (selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) !== 'none') ? 'Dashed' : 'Solid',
    strokeDasharrayValue: selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray,
    strokeDashLength: parseInt(((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) === 'none' ? '10,10' : ((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) || '10,10')).split(',')[0]) || 10,
    strokeDashGap: parseInt((((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) === 'none' ? '10,10' : ((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) || '10,10')).split(',')[1] || ((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) === 'none' ? '10,10' : ((selectedElementProps?.['stroke-dasharray'] || selectedElementProps?.['data-stroke-dasharray'] || selectedElementProps?.strokeDasharray) || '10,10')).split(',')[0])) || 10,
    strokeLinecap: selectedElementProps?.['stroke-linecap'] || 'butt',
    strokePosition: selectedElementProps?.['data-stroke-position'] || 'Outside',
  };

  const handleSetBackgroundColor = (updater) => {
    const next = typeof updater === 'function' ? updater(backgroundColor) : updater;

    const updates = {};
    if (backgroundColor.fill !== next.fill) {
      if (selectedElementProps?.['data-masked-image-url']) {
        updates['data-original-fill'] = next.fill;
      } else {
        updates['fill'] = next.fill;
      }
    }
    if (backgroundColor.fillOpacity !== next.fillOpacity) updates['opacity'] = (next.fillOpacity / 100).toString();
    if (backgroundColor.stroke !== next.stroke) {
      updates['stroke'] = next.stroke;
      updates['data-stroke-color'] = next.stroke;
    }
    if (backgroundColor.strokeOpacity !== next.strokeOpacity) updates['stroke-opacity'] = (next.strokeOpacity / 100).toString();
    if (backgroundColor.strokeWeight !== next.strokeWeight || backgroundColor.strokePosition !== next.strokePosition) {
      const sw = next.strokeWeight || 0;
      const pos = next.strokePosition || 'Outside';
      updates['data-stroke-width'] = sw.toString();
      updates['data-stroke-position'] = pos;
      updates['vector-effect'] = 'non-scaling-stroke';
      if (pos === 'Outside') {
        updates['stroke-width'] = (sw * 2).toString();
        updates['strokeWidth'] = (sw * 2).toString();
        updates['paint-order'] = 'stroke fill';
      } else if (pos === 'Inside') {
        updates['stroke-width'] = (sw * 2).toString();
        updates['strokeWidth'] = (sw * 2).toString();
        updates['paint-order'] = 'fill stroke';
      } else {
        updates['stroke-width'] = sw.toString();
        updates['strokeWidth'] = sw.toString();
        updates['paint-order'] = 'normal';
      }
    }
    if (backgroundColor.strokeDashStyle !== next.strokeDashStyle || backgroundColor.strokeDashLength !== next.strokeDashLength || backgroundColor.strokeDashGap !== next.strokeDashGap || backgroundColor.strokeDasharrayValue !== next.strokeDasharrayValue) {
      if (next.strokeDashStyle === 'none' || next.strokeDashStyle === 'Solid') {
        updates['stroke-dasharray'] = 'none';
      } else {
        updates['stroke-dasharray'] = next.strokeDasharrayValue || `${next.strokeDashLength || 10},${next.strokeDashGap || 10}`;
      }
    }
    if (backgroundColor.strokePosition !== next.strokePosition) updates['data-stroke-position'] = next.strokePosition;
    if (backgroundColor.strokeLinecap !== next.strokeLinecap) {
      updates['stroke-linecap'] = next.strokeLinecap;
      updates['stroke-linejoin'] = next.strokeLinecap === 'round' ? 'round' : 'miter';
    }
    if (backgroundColor.fillType !== next.fillType) updates['fill-type'] = next.fillType;
    if (backgroundColor.fillGradientType !== next.fillGradientType) updates['fill-gradient-type'] = next.fillGradientType;
    if (backgroundColor.fillStops !== next.fillStops) updates['fill-stops'] = next.fillStops;
    if (backgroundColor.fillAngle !== next.fillAngle) updates['fill-angle'] = next.fillAngle;
    if (backgroundColor.fillRadius !== next.fillRadius) updates['fill-radius'] = next.fillRadius;

    if (backgroundColor.strokeType !== next.strokeType) updates['stroke-type'] = next.strokeType;
    if (backgroundColor.strokeGradientType !== next.strokeGradientType) updates['stroke-gradient-type'] = next.strokeGradientType;
    if (backgroundColor.strokeStops !== next.strokeStops) updates['stroke-stops'] = next.strokeStops;
    if (backgroundColor.strokeAngle !== next.strokeAngle) updates['stroke-angle'] = next.strokeAngle;
    if (backgroundColor.strokeRadius !== next.strokeRadius) updates['stroke-radius'] = next.strokeRadius;

    // Direct live DOM updates for fluid feedback
    const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const liveEl = doc.getElementById(selectedLayerId) || document.getElementById(selectedLayerId);
    if (liveEl) {
      Object.entries(updates).forEach(([k, v]) => {
        if (v === 'none' && (k === 'fill' || k === 'stroke')) {
          liveEl.setAttribute(k, 'none');
        } else {
          liveEl.setAttribute(k, v);
          if (k === 'paint-order') liveEl.style.paintOrder = v;
        }
      });
      const childShapes = liveEl.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
      childShapes.forEach(child => {
        if (updates['vector-effect']) child.setAttribute('vector-effect', updates['vector-effect']);
        if (updates['paint-order']) {
          child.setAttribute('paint-order', updates['paint-order']);
          child.style.paintOrder = updates['paint-order'];
        }
        if (updates['stroke-linecap']) child.setAttribute('stroke-linecap', updates['stroke-linecap']);
        if (updates['stroke-linejoin']) child.setAttribute('stroke-linejoin', updates['stroke-linejoin']);
      });
    }

    if (Object.keys(updates).length > 0) {
      updateElementAttribute(activePageIndex, selectedLayerId, updates);
    }
  };

  // Effects State
  const activeEffects = [];
  if (selectedElementProps?.['data-effect-drop-shadow'] === 'true') activeEffects.push('Drop Shadow');
  if (selectedElementProps?.['data-effect-inner-shadow'] === 'true') activeEffects.push('Inner Shadow');
  if (selectedElementProps?.['data-effect-blur'] === 'true') activeEffects.push('Blur');

  const handleSetActiveEffects = (updater) => {
    const currentActive = [];
    if (selectedElementProps?.['data-effect-drop-shadow'] === 'true') currentActive.push('Drop Shadow');
    if (selectedElementProps?.['data-effect-inner-shadow'] === 'true') currentActive.push('Inner Shadow');
    if (selectedElementProps?.['data-effect-blur'] === 'true') currentActive.push('Blur');

    const next = typeof updater === 'function' ? updater(currentActive) : updater;
    const updates = {};
    const hasDropShadow = next.includes('Drop Shadow');
    const hasInnerShadow = next.includes('Inner Shadow');
    const hasBlur = next.includes('Blur');

    if ((selectedElementProps?.['data-effect-drop-shadow'] === 'true') !== hasDropShadow) updates['data-effect-drop-shadow'] = hasDropShadow ? 'true' : 'false';
    if ((selectedElementProps?.['data-effect-inner-shadow'] === 'true') !== hasInnerShadow) updates['data-effect-inner-shadow'] = hasInnerShadow ? 'true' : 'false';
    if ((selectedElementProps?.['data-effect-blur'] === 'true') !== hasBlur) updates['data-effect-blur'] = hasBlur ? 'true' : 'false';

    if (Object.keys(updates).length > 0) updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  const effectSettings = {
    'Drop Shadow': {
      x: parseInt(selectedElementProps?.['data-effect-drop-shadow-x'] || 2),
      y: parseInt(selectedElementProps?.['data-effect-drop-shadow-y'] || 2),
      blur: parseInt(selectedElementProps?.['data-effect-drop-shadow-blur'] || 0),
      spread: parseInt(selectedElementProps?.['data-effect-drop-shadow-spread'] || 0),
      color: selectedElementProps?.['data-effect-drop-shadow-color'] || '#000000',
      opacity: parseInt(selectedElementProps?.['data-effect-drop-shadow-opacity'] || 35),
    },
    'Inner Shadow': {
      x: parseInt(selectedElementProps?.['data-effect-inner-shadow-x'] || 2),
      y: parseInt(selectedElementProps?.['data-effect-inner-shadow-y'] || 2),
      blur: parseInt(selectedElementProps?.['data-effect-inner-shadow-blur'] || 0),
      spread: parseInt(selectedElementProps?.['data-effect-inner-shadow-spread'] || 0),
      color: selectedElementProps?.['data-effect-inner-shadow-color'] || '#000000',
      opacity: parseInt(selectedElementProps?.['data-effect-inner-shadow-opacity'] || 35),
    },
    'Blur': {
      blur: parseFloat(selectedElementProps?.['data-effect-blur-value'] !== undefined ? selectedElementProps['data-effect-blur-value'] : (selectedElementProps?.['data-effect-blur-blur'] || 0.3)),
      spread: parseInt(selectedElementProps?.['data-effect-blur-spread'] || 0),
      clipContent: selectedElementProps?.['data-effect-blur-clip'] === 'true'
    }
  };

  const handleSetEffectSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;
    if (!next) return;
    const updates = {};
    ['Drop Shadow', 'Inner Shadow'].forEach(type => {
      const prefix = type === 'Drop Shadow' ? 'drop-shadow' : 'inner-shadow';
      if (next[type] && effectSettings[type]) {
        if (next[type].x !== undefined && effectSettings[type].x !== next[type].x) updates[`data-effect-${prefix}-x`] = next[type].x.toString();
        if (next[type].y !== undefined && effectSettings[type].y !== next[type].y) updates[`data-effect-${prefix}-y`] = next[type].y.toString();
        if (next[type].blur !== undefined && effectSettings[type].blur !== next[type].blur) updates[`data-effect-${prefix}-blur`] = next[type].blur.toString();
        if (next[type].spread !== undefined && effectSettings[type].spread !== next[type].spread) updates[`data-effect-${prefix}-spread`] = next[type].spread.toString();
        if (next[type].color !== undefined && effectSettings[type].color !== next[type].color) updates[`data-effect-${prefix}-color`] = next[type].color;
        if (next[type].opacity !== undefined && effectSettings[type].opacity !== next[type].opacity) updates[`data-effect-${prefix}-opacity`] = next[type].opacity.toString();
      }
    });

    if (next['Blur'] && effectSettings['Blur']) {
      if (next['Blur'].blur !== undefined && effectSettings['Blur'].blur !== next['Blur'].blur) updates[`data-effect-blur-value`] = next['Blur'].blur.toString();
      if (next['Blur'].spread !== undefined && effectSettings['Blur'].spread !== next['Blur'].spread) updates[`data-effect-blur-spread`] = next['Blur'].spread.toString();
      if (next['Blur'].clipContent !== undefined && effectSettings['Blur'].clipContent !== next['Blur'].clipContent) updates[`data-effect-blur-clip`] = next['Blur'].clipContent ? 'true' : 'false';
    }

    if (Object.keys(updates).length > 0) updateElementAttribute(activePageIndex, selectedLayerId, updates);
  };

  return (
    <div className="relative flex flex-col gap-[1.7vw] w-full max-w-[25vw] pb-[2vw] font-sans select-none">

      {/* ===================== HEADER ===================== */}
      <div className="flex items-center gap-[0.8vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-wider">Shape Properties</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      {/* ===================== MASKING & FLATTEN ACTIONS ===================== */}
      <div className="flex flex-col gap-[0.6vw]">
        <div className="grid grid-cols-2 gap-[0.7vw]">
          {/* Mask Button */}
          <button
            type="button"
            onClick={() => {
              if (isMaskEnabled || hasUploadedImage) {
                handleRemoveMask();
              } else {
                window.dispatchEvent(new CustomEvent('trigger-mask'));
              }
            }}
            className={`flex items-center justify-center gap-[0.45vw] h-[2.2vw] px-[0.7vw] rounded-[0.45vw] border transition-all cursor-pointer shadow-2xs font-medium text-[0.8vw] ${
              Boolean(isMaskEnabled || hasUploadedImage || selectedElementProps?.['data-mask-enabled'] === 'true' || selectedElementProps?.['data-masked-image-url'])
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
            title={Boolean(isMaskEnabled || hasUploadedImage || selectedElementProps?.['data-mask-enabled'] === 'true' || selectedElementProps?.['data-masked-image-url']) ? 'Click to Unmask' : 'Use as Mask'}
          >
            <MaskIcon size="1.05vw" className={Boolean(isMaskEnabled || hasUploadedImage || selectedElementProps?.['data-mask-enabled'] === 'true' || selectedElementProps?.['data-masked-image-url']) ? 'text-indigo-600' : 'text-gray-600'} />
            <span className="truncate">{Boolean(isMaskEnabled || hasUploadedImage || selectedElementProps?.['data-mask-enabled'] === 'true' || selectedElementProps?.['data-masked-image-url']) ? 'Unmask' : 'Masking'}</span>
          </button>

          {/* Flatten Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('trigger-flatten'));
            }}
            className="flex items-center justify-center gap-[0.45vw] h-[2.2vw] px-[0.7vw] rounded-[0.45vw] border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer shadow-2xs font-medium text-[0.8vw]"
            title="Flatten shape to vector path and edit points"
          >
            <FlattenIcon size="1.05vw" className="text-gray-600" />
            <span className="truncate">Flatten</span>
          </button>
        </div>
      </div>

      {/* ===================== IMAGE MASKING / FRAMING SECTION ===================== */}
      {shapeType !== 'line' && (isMaskEnabled || hasUploadedImage) && (
        <div className="flex flex-col gap-[0.9vw]" data-image-slots="true">
          {/* Dashed Add Images button shown before upload */}
          {!hasUploadedImage && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  handleFileChange({ target: { files } });
                }
              }}
              className="w-full py-[1vw] border-2 border-dashed border-gray-300 rounded-[0.55vw] flex items-center justify-center gap-[0.5vw] text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer font-medium text-[0.85vw]"
            >
              <Plus size="1vw" />
              <span>Add Images</span>
            </div>
          )}

          {/* Uploaded Image Preview Card */}
          {hasUploadedImage && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleFileChange({ target: { files } });
                  }
                }}
                className="flex items-center justify-between p-[0.6vw] px-[0.75vw] bg-white border border-gray-200 rounded-[0.55vw] shadow-2xs"
              >
                {/* Left Section: Thumbnail + Meta (moveable grip removed) */}
                <div className="flex items-center gap-[0.6vw] min-w-0 flex-1">
                  <div
                    className="relative w-[3.8vw] h-[2.8vw] rounded-[0.45vw] overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 flex items-center justify-center shadow-2xs group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    title="Click to replace image"
                  >
                    <img
                      src={slotImage || DEFAULT_FRAME_IMAGE}
                      alt={slotImageName || 'Image Name .jpg'}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer">
                      <ArrowRightLeft size="0.75vw" strokeWidth={1.8} className="text-white mb-[0.1vw]" />
                      <span className="text-[0.52vw] font-medium text-white tracking-wide">Replace</span>
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1 py-[0.1vw]">
                    <span className="text-[0.8vw] font-semibold text-gray-800 truncate" title={slotImageName || 'Image Name .jpg'}>
                      {slotImageName || 'Image Name .jpg'}
                    </span>
                    <span className="text-[0.68vw] text-gray-400 font-medium truncate" title={slotImageMeta || '300 X 300 • 24MB'}>
                      {slotImageMeta || '300 X 300 • 24MB'}
                    </span>
                  </div>
                </div>

                {/* Right Actions: Edit pencil & Delete Trash */}
                <div className="flex items-center gap-[0.3vw] shrink-0 ml-[0.4vw]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdjustModal(true);
                    }}
                    className="p-[0.3vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-[0.35vw] transition-colors cursor-pointer"
                    title="Edit Image Adjustment"
                  >
                    <Edit2 size="0.95vw" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage();
                    }}
                    className="p-[0.3vw] text-[#e02424] hover:text-red-700 hover:bg-red-50 rounded-[0.35vw] transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 size="0.95vw" />
                  </button>
                </div>
              </div>

              <PropertySlider
                label="Rotation"
                value={slotRotation}
                onChange={(val) => updateRotation(val, true)}
                onPointerUp={syncDomChanges}
                min={-180}
                max={180}
                unit="°"
              />
            </>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* ===================== SHAPE PARAMETERS (Polygon / Star) ===================== */}
      {(shapeType === 'polygon' || shapeType === 'star') && (
        <div className="flex flex-col gap-[0.85vw]">
          <div className="flex items-center gap-[0.8vw] mb-[0.25vw]">
            <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">Shape Parameters</span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </div>
          <div className="flex flex-col gap-[0.4vw]">
            <PropertySlider
              label={shapeType === 'polygon' ? "Sides" : "Points"}
              value={parseInt(selectedElementProps?.['data-count'] || (shapeType === 'polygon' ? (is4SidedShape ? 4 : 3) : 5))}
              onChange={(val) => updateAttr('data-count', val.toString())}
              min={3}
              max={shapeType === 'polygon' ? 50 : 24}
            />
            <PropertySlider
              label="Ratio"
              value={
                shapeType === 'star'
                  ? Math.round(parseFloat(selectedElementProps?.['data-ratio'] !== undefined ? selectedElementProps['data-ratio'] : 40))
                  : 0
              }
              onChange={(val) => updateAttr('data-ratio', val)}
              disabled={shapeType === 'polygon'}
            />
            <PropertySlider
              label="Corner"
              value={Math.round(parseFloat(
                selectedElementProps?.['data-radius'] !== undefined ? selectedElementProps['data-radius'] : 0
              ))}
              onChange={(val) => updateAttr('data-radius', val)}
              max={50}
            />
          </div>
        </div>
      )}

      {/* ===================== APPEARANCE: COLOR ===================== */}
      <Color
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        backgroundColor={backgroundColor}
        setBackgroundColor={handleSetBackgroundColor}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        showStrokeSettings={showStrokeSettings}
        setShowStrokeSettings={setShowStrokeSettings}
        isStrokeStyleOpen={isStrokeStyleOpen}
        setIsStrokeStyleOpen={setIsStrokeStyleOpen}
        dropdownPos={dropdownPos}
        setDropdownPos={setDropdownPos}
        strokeSettingsPos={strokeSettingsPos}
        setStrokeSettingsPos={setStrokeSettingsPos}
        isDashPosOpen={isDashPosOpen}
        setIsDashPosOpen={setIsDashPosOpen}
        activePopup={activePopup}
        setActivePopup={setActivePopup}
        colorsOnPage={colorsOnPage}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        hideFill={shapeType === 'line'}
        noAccordion={true}
      />

      {/* ===================== APPEARANCE: CORNER RADIUS ===================== */}
      {!shouldHideCornerRadius && (
        <CornerRadius
          openSubSection={openSubSection}
          setOpenSubSection={setOpenSubSection}
          radius={radius}
          setRadius={handleSetRadius}
          isRadiusLinked={isRadiusLinked}
          setIsRadiusLinked={handleSetIsRadiusLinked}
          tagName={selectedElementProps?.tagName || 'rect'}
          noAccordion={true}
        />
      )}

      {/* ===================== APPEARANCE: EFFECTS ===================== */}
      <Effect
        isShape={true}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        activeEffects={activeEffects}
        setActiveEffects={handleSetActiveEffects}
        effectSettings={effectSettings}
        setEffectSettings={handleSetEffectSettings}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
        noAccordion={true}
      />

      {/* ===================== IMAGE ADJUST MODAL ===================== */}
      {showAdjustModal && (
        <ImageAdjustModal
          isOpen={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          imageSrc={slotOriginalImage || slotImage || DEFAULT_FRAME_IMAGE}
          initialFixType="Fit"
          initialOpacity={100}
          initialFilters={null}
          initialCrop={null}
          frameAspectRatio={(() => {
            const doc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
            const selectedElement = doc.getElementById(selectedLayerId);
            if (selectedElement) {
              try {
                let shapeEl = selectedElement.querySelector('path, polygon, rect, circle, ellipse');
                if (!shapeEl && ['path', 'polygon', 'rect', 'circle', 'ellipse'].includes(selectedElement.tagName?.toLowerCase())) {
                  shapeEl = selectedElement;
                }
                if (shapeEl) {
                  const bbox = shapeEl.getBBox();
                  if (bbox.width && bbox.height) {
                    return bbox.width / bbox.height;
                  }
                }
              } catch (e) { }
            }
            return 1;
          })()}
          onSave={handleSaveAdjustedImage}
        />
      )}

      {/* CUSTOM CSS */}
      <style>{`
        .hide-opacity-bar .space-y-\\[1vw\\] > div:nth-child(2) {
          display: none !important;
        }
        input[type='range'] {
          position: relative;
        }
        input[type='range']::before {
          content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 1.1vw;
          width: 1.1vw;
          border-radius: 50%;
          background: #ffffff;
          border: 0.1vw solid #e5e7eb;
          box-shadow: 0 0.1vw 0.3vw rgba(0,0,0,0.1);
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        input[type='range'].blue-thumb::-webkit-slider-thumb {
          background: #6366f1;
          border-color: #6366f1;
          height: 0.8vw;
          width: 0.8vw;
        }
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

export { ShapeProperties as ElementShapesProperties };
export default ShapeProperties;
