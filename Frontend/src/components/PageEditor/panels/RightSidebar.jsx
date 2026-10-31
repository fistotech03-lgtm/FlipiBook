import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getVisualBBox, getCanvasBounds } from '../mainEditor/utils/geometryUtils';
import { Icon } from '@iconify/react';
import {
  TransformProperties,
  PageProperties,
  ShapeProperties,
  TextElementEditor,
  ElementButtonProperties,
  ImageFramingProperties,
  ElementTableProperties,
  ElementQRCodeProperties,
  ElementMapProperties,
  ElementEmbedProperties,
  ElementSlideshowProperties,
  ElementDecoratorProperties,
  ElementAudioProperties,
  PenToolProperties,
  ImageProperties,
  TextProperties,
  VideoProperties,
  GifProperties,
  Model3DEditor,
  GroupProperties,
  UploadProperties
} from '../properties';
import AnimationPanel from './AnimationPanel';
import InteractionPanel from './InteractionPanel';
import PopupTemplateSelection from '../modals/PopupTemplateSelection';
import CustomScrollbar from '../../CustomScrollbar';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const RightSidebar = ({
  isDoublePage,
  setIsDoublePage,
  isRulerEnabled,
  setIsRulerEnabled,
  activeMainTool,
  setActiveMainTool,
  activeTopTool,
  activePageIndex,
  pages,
  setPages,
  updatePageBackground,
  selectedLayerId,
  setSelectedLayerId,
  multiSelectedIds = null,
  setMultiSelectedIds,
  updateElementAttribute,
  deleteLayer,
  onPreview,
  activePreviewDevice: activePreviewDeviceProp,
  setActivePreviewDevice: setActivePreviewDeviceProp,
  flipbookDimensions = { width: 210, height: 297 },
  isPopupEditor = false,
  onCustomizePopup,
  onApplyPopupChanges,
  onCancelPopupChanges,
  is3DModalOpen,
  setIs3DModalOpen,
  preview3DDataUrl,
  setCurrent3DItem,
  shadowStrength, setShadowStrength,
  shadowSoftness, setShadowSoftness,
  autoRotate, setAutoRotate,
  autoRotateSpeed, setAutoRotateSpeed,
  lockMaxZoom, setLockMaxZoom,
  maxZoom, setMaxZoom,
  bgType, setBgType,
  bgColor, setBgColor,
  customBg, setCustomBg,
  enableAR, setEnableAR,
  qrText, setQrText, qrColor, setQrColor, qrBgType, setQrBgType, qrBgColor, setQrBgColor, qrLevel, setQrLevel, qrDotType, setQrDotType, qrCornerSquareType, setQrCornerSquareType, qrCornerDotType, setQrCornerDotType, qrLogo, setQrLogo,
  topText, setTopText, bottomText, setBottomText,
  current3DVId,
  hotspots = [],
  activeHotspotId = null,
  onHotspotClick,
  v_id: v_idProp,
  flipbookVId: flipbookVIdProp,
  folderName: folderNameProp,
  flipbookName: flipbookNameProp,
  folder: folderProp
}) => {
  const { user } = useAuth();
  const { folder: paramFolder, v_id: paramVId } = useParams();
  const location = useLocation();

  const effectiveVId = v_idProp || flipbookVIdProp || paramVId || location.state?.v_id || location.state?.flipbook_v_id;
  const rawFolder = folderNameProp || folderProp || paramFolder || location.state?.folderName;
  const effectiveFolder = (() => {
    const VIRTUAL_FOLDERS = new Set(['recent book', 'recent', 'all books', 'all flipbooks', 'favorites', 'trash']);
    if (Array.isArray(rawFolder)) {
      const real = rawFolder.find(f => f && !VIRTUAL_FOLDERS.has(String(f).trim().toLowerCase()));
      return real ? String(real).trim() : 'My_Flipbooks';
    }
    if (rawFolder && typeof rawFolder === 'string') {
      const clean = rawFolder.trim();
      if (VIRTUAL_FOLDERS.has(clean.toLowerCase())) return 'My_Flipbooks';
      return clean || 'My_Flipbooks';
    }
    return 'My_Flipbooks';
  })();
  const effectiveBook = flipbookNameProp || location.state?.flipbookName || 'Untitled Flipbook';

  const isPdfProject = pages.some(p => p.html && (
    p.html.includes('data-name="PDF Background"') ||
    p.html.includes('PDF Background') ||
    p.html.includes('pdf-vector-layer') ||
    p.html.includes('Document Shield')
  ));
  const { width: baseWidth, height: baseHeight } = flipbookDimensions;

  const [isNodeEditActive, setIsNodeEditActive] = useState(false);

  useEffect(() => {
    const handleNodeEditChange = (e) => {
      setIsNodeEditActive(Boolean(e.detail?.active));
    };
    window.addEventListener('node-edit-mode-changed', handleNodeEditChange);
    return () => window.removeEventListener('node-edit-mode-changed', handleNodeEditChange);
  }, []);
  const [activePreviewDevice, setActivePreviewDevice] = useState(localStorage.getItem('previewDevice') || 'Desktop');
  const [dimensionUnit, setDimensionUnit] = useState('mm');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isPageBgPickerOpen, setIsPageBgPickerOpen] = useState(false);
  const unitRef = useRef(null);
  const [expandedInteraction, setExpandedInteraction] = useState('call-click');
  const [interactionTab, setInteractionTab] = useState('Call');
  const [isInteractionMenuOpen, setIsInteractionMenuOpen] = useState(false);
  const interactionMenuRef = useRef(null);

  const updatePosition = (val, targetAttr) => {
    if (activeTopTool === 'interaction' || activeTopTool === 'animation') return;
    if (!selectedElementProps) return;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const el = editorDoc.getElementById(selectedLayerId);
    if (!el) return;

    let newVal = parseFloat(val);

    const transform = el.getAttribute('transform');
    if (transform && transform.includes('matrix')) {
      const match = transform.match(/matrix\(([^)]+)\)/);
      if (match) {
        const m = match[1].split(/[\s,]+/).map(parseFloat);
        if (m.length === 6) {
          const bbox = getVisualBBox(el);
          const bounds = getCanvasBounds(el, flipbookDimensions?.width, flipbookDimensions?.height);
          const visW = bbox.width * Math.abs(m[0]);
          const visH = bbox.height * Math.abs(m[3]);

          if (targetAttr === 'x') {
            newVal = Math.max(bounds.minX, Math.min(bounds.maxX - visW, newVal));
            const offsetX = bbox.x * m[0] + (m[0] < 0 ? bbox.width * m[0] : 0);
            m[4] = newVal - offsetX;
            const matrixStr = `matrix(${m.join(', ')})`;
            el.setAttribute('transform', matrixStr);
            el.setAttribute('data-x', m[4].toString());
            updateElementAttribute(activePageIndex, selectedLayerId, {
              'transform': matrixStr,
              'data-x': m[4].toString()
            });
          } else {
            newVal = Math.max(bounds.minY, Math.min(bounds.maxY - visH, newVal));
            const offsetY = bbox.y * m[3] + (m[3] < 0 ? bbox.height * m[3] : 0);
            m[5] = newVal - offsetY;
            const matrixStr = `matrix(${m.join(', ')})`;
            el.setAttribute('transform', matrixStr);
            el.setAttribute('data-y', m[5].toString());
            updateElementAttribute(activePageIndex, selectedLayerId, {
              'transform': matrixStr,
              'data-y': m[5].toString()
            });
          }
          setTimeout(() => {
            if (typeof window.drawOverlayHighlight === 'function') {
              window.drawOverlayHighlight(el, 'selected');
            }
          }, 50);
          return;
        }
      }
    }

    if (targetAttr === 'x') {
      if (selectedElementProps.tagName === 'circle' || selectedElementProps.tagName === 'ellipse') {
        const radius = parseFloat(selectedElementProps.tagName === 'circle' ? el.getAttribute('r') : el.getAttribute('rx')) || 0;
        const valStr = (newVal + radius).toString();
        el.setAttribute('cx', valStr);
        updateElementAttribute(activePageIndex, selectedLayerId, 'cx', valStr);
      } else {
        const valStr = newVal.toString();
        el.setAttribute('x', valStr);
        updateElementAttribute(activePageIndex, selectedLayerId, 'x', valStr);
      }
    } else {
      if (selectedElementProps.tagName === 'circle' || selectedElementProps.tagName === 'ellipse') {
        const radius = parseFloat(selectedElementProps.tagName === 'circle' ? el.getAttribute('r') : el.getAttribute('ry')) || 0;
        const valStr = (newVal + radius).toString();
        el.setAttribute('cy', valStr);
        updateElementAttribute(activePageIndex, selectedLayerId, 'cy', valStr);
      } else {
        const valStr = newVal.toString();
        el.setAttribute('y', valStr);
        updateElementAttribute(activePageIndex, selectedLayerId, 'y', valStr);
      }
    }
  };

  const convertValue = (mmValue) => {
    const val = parseFloat(mmValue || 0);
    if (dimensionUnit === 'px') return Math.round(val * 96 / 25.4);
    if (dimensionUnit === 'cm') return (val / 10).toFixed(2);
    return Number(val.toFixed(1)); // mm
  };

  const updateDimensionWithScale = (val, targetAttr, extraVal, extraAttr) => {
    if (activeTopTool === 'interaction' || activeTopTool === 'animation') return;
    if (!selectedElementProps) return;

    let targetWidth = null;
    let targetHeight = null;

    if (typeof val === 'object' && val !== null) {
      if (val.width !== undefined && val.width !== null) targetWidth = parseFloat(val.width);
      if (val.height !== undefined && val.height !== null) targetHeight = parseFloat(val.height);
    } else {
      if (targetAttr === 'width') targetWidth = parseFloat(val);
      else if (targetAttr === 'height') targetHeight = parseFloat(val);

      if (extraAttr === 'width') targetWidth = parseFloat(extraVal);
      else if (extraAttr === 'height') targetHeight = parseFloat(extraVal);
    }

    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const el = editorDoc.getElementById(selectedLayerId);
    if (!el) return;

    let scaleX = 1;
    let scaleY = 1;
    let m = [1, 0, 0, 1, 0, 0];
    let hasMatrix = false;

    const transform = el.getAttribute('transform');
    if (transform && transform.includes('matrix')) {
      const match = transform.match(/matrix\(([^)]+)\)/);
      if (match) {
        const parsedM = match[1].split(/[\s,]+/).map(parseFloat);
        if (parsedM.length === 6) {
          m = parsedM;
          hasMatrix = true;
          scaleX = Math.abs(m[0]) || 1;
          scaleY = Math.abs(m[3]) || 1;
        }
      }
    }

    const tag = (selectedElementProps.tagName || el.tagName || '').toLowerCase();

    if (tag === 'line') {
      const x1 = parseFloat(el.getAttribute('x1')) || 0;
      const y1 = parseFloat(el.getAttribute('y1')) || 0;
      const x2 = parseFloat(el.getAttribute('x2')) || 0;
      const y2 = parseFloat(el.getAttribute('y2')) || 0;

      const attrsToUpdate = {};
      if (targetWidth !== null && !isNaN(targetWidth) && targetWidth > 0) {
        const unscaledVal = targetWidth / scaleX;
        const direction = x2 >= x1 ? 1 : -1;
        const newX2 = (x1 + direction * unscaledVal).toString();
        el.setAttribute('x2', newX2);
        attrsToUpdate.x2 = newX2;
      }
      if (targetHeight !== null && !isNaN(targetHeight) && targetHeight > 0) {
        const unscaledVal = targetHeight / scaleY;
        const direction = y2 >= y1 ? 1 : -1;
        const newY2 = (y1 + direction * unscaledVal).toString();
        el.setAttribute('y2', newY2);
        attrsToUpdate.y2 = newY2;
      }
      if (Object.keys(attrsToUpdate).length > 0) {
        updateElementAttribute(activePageIndex, selectedLayerId, attrsToUpdate);
      }
      return;
    }

    if (tag === 'ellipse' || (tag === 'circle' && !hasMatrix)) {
      const attrsToUpdate = {};
      if (targetWidth !== null && !isNaN(targetWidth) && targetWidth > 0) {
        const unscaledVal = targetWidth / scaleX;
        const rx = (unscaledVal / 2).toString();
        el.setAttribute('rx', rx);
        attrsToUpdate.rx = rx;
        if (tag === 'circle' && el.hasAttribute('r')) {
          el.setAttribute('r', rx);
          attrsToUpdate.r = rx;
        }
      }
      if (targetHeight !== null && !isNaN(targetHeight) && targetHeight > 0) {
        const unscaledVal = targetHeight / scaleY;
        const ry = (unscaledVal / 2).toString();
        el.setAttribute('ry', ry);
        attrsToUpdate.ry = ry;
        if (tag === 'circle' && targetWidth === null && el.hasAttribute('r')) {
          el.setAttribute('r', ry);
          attrsToUpdate.r = ry;
        }
      }
      if (Object.keys(attrsToUpdate).length > 0) {
        updateElementAttribute(activePageIndex, selectedLayerId, attrsToUpdate);
      }
      return;
    }

    if (tag === 'path' || tag === 'polygon' || tag === 'g' || tag === 'rect' || tag === 'image' || tag === 'foreignobject' || tag === 'text' || hasMatrix) {
      const bbox = getVisualBBox(el);
      if (bbox.width === 0 || bbox.height === 0) return;

      if (targetWidth !== null && !isNaN(targetWidth) && targetWidth > 0) {
        const oldWorldX = bbox.x * m[0] + (m[0] < 0 ? bbox.width * m[0] : 0) + m[4];
        const newM0 = (m[0] >= 0 ? 1 : -1) * (targetWidth / bbox.width);
        const newM4 = oldWorldX - (bbox.x * newM0 + (newM0 < 0 ? bbox.width * newM0 : 0));
        m[0] = newM0;
        m[4] = newM4;
      }

      if (targetHeight !== null && !isNaN(targetHeight) && targetHeight > 0) {
        const oldWorldY = bbox.y * m[3] + (m[3] < 0 ? bbox.height * m[3] : 0) + m[5];
        const newM3 = (m[3] >= 0 ? 1 : -1) * (targetHeight / bbox.height);
        const newM5 = oldWorldY - (bbox.y * newM3 + (newM3 < 0 ? bbox.height * newM3 : 0));
        m[3] = newM3;
        m[5] = newM5;
      }

      const matrixStr = `matrix(${m.join(', ')})`;
      el.setAttribute('transform', matrixStr);
      updateElementAttribute(activePageIndex, selectedLayerId, 'transform', matrixStr);

      setTimeout(() => {
        if (typeof window.drawOverlayHighlight === 'function') {
          window.drawOverlayHighlight(el, 'selected');
        }
      }, 50);
      return;
    }

    const attrsToUpdate = {};
    if (targetWidth !== null && !isNaN(targetWidth) && targetWidth > 0) {
      const finalW = tag === 'circle' ? (targetWidth / 2 / scaleX).toString() : (targetWidth / scaleX).toString();
      el.setAttribute('width', finalW);
      attrsToUpdate.width = finalW;
    }
    if (targetHeight !== null && !isNaN(targetHeight) && targetHeight > 0) {
      const finalH = tag === 'circle' ? (targetHeight / 2 / scaleY).toString() : (targetHeight / scaleY).toString();
      el.setAttribute('height', finalH);
      attrsToUpdate.height = finalH;
    }
    if (Object.keys(attrsToUpdate).length > 0) {
      updateElementAttribute(activePageIndex, selectedLayerId, attrsToUpdate);
    }
  };

  // Close unit dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (unitRef.current && !unitRef.current.contains(e.target)) {
        setIsUnitDropdownOpen(false);
      }
      if (interactionMenuRef.current && !interactionMenuRef.current.contains(e.target)) {
        setIsInteractionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with prop if provided, otherwise use local/localStorage
  useEffect(() => {
    if (activePreviewDeviceProp) setActivePreviewDevice(activePreviewDeviceProp);
  }, [activePreviewDeviceProp]);

  const handleDeviceChange = (device) => {
    setActivePreviewDevice(device);
    localStorage.setItem('previewDevice', device);
    window.dispatchEvent(new CustomEvent('previewDeviceChange', { detail: device }));
    setActivePreviewDeviceProp?.(device);
  };

  useEffect(() => {
    const handleGlobalDeviceChange = (e) => {
      setActivePreviewDevice(e.detail);
    };
    window.addEventListener('previewDeviceChange', handleGlobalDeviceChange);
    return () => window.removeEventListener('previewDeviceChange', handleGlobalDeviceChange);
  }, []);

  const presetColors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#4b5563', '#1f2937', '#000000',
    '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857',
    '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c',
    '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'
  ];

  const selectedElementProps = useMemo(() => {
    if (!selectedLayerId) return null;
    const page = pages[activePageIndex];
    if (page && page.html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(page.html, 'image/svg+xml');
      let el = doc.getElementById(selectedLayerId);

      // If the selected element is an internal child of a compound shape/button/audio/media group,
      // resolve to the compound container group so properties (fill, stroke, etc.) are read accurately.
      const compoundGroup = el?.closest?.(
        '[data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"], ' +
        '[data-is-element-button="true"], [data-type="button"], g[id^="button-"], ' +
        '[data-type="audio-frame"], g[id^="audio-"], ' +
        '[data-is-image-group="true"], [data-is-video-group="true"], [data-is-gif-group="true"]'
      );
      if (compoundGroup && compoundGroup !== el) {
        el = compoundGroup;
      }

      const rootId = doc.querySelector('svg > g')?.id;
      const overlayId = doc.querySelector('[data-name="Overlay"]')?.id;
      const isPageSelected = !selectedLayerId || selectedLayerId === rootId || selectedLayerId === overlayId;

      if (el && !isPageSelected) {
        let w = '0', h = '0', x = '0', y = '0', r = '0';

        // --- IMPROVED DIMENSION LOGIC: Try actual DOM first for rendered accuracy ---
        const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
        let actualEl = editorDoc.getElementById(el.id || selectedLayerId);
        const actualCompound = actualEl?.closest?.(
          '[data-is-element-shape="true"], [data-shape-type], [data-type="shape"], g[id^="shape-"], ' +
          '[data-is-element-button="true"], [data-type="button"], g[id^="button-"], ' +
          '[data-type="audio-frame"], g[id^="audio-"], ' +
          '[data-is-image-group="true"], [data-is-video-group="true"], [data-is-gif-group="true"]'
        );
        if (actualCompound && actualCompound !== actualEl) {
          actualEl = actualCompound;
        }
        let measuredFromDom = false;
        if (actualEl && typeof actualEl.getBBox === 'function') {
          try {
            const bbox = getVisualBBox(actualEl);
            let m = [1, 0, 0, 1, 0, 0];
            const transform = actualEl.getAttribute('transform');
            if (transform && transform.includes('matrix')) {
              const match = transform.match(/matrix\(([^)]+)\)/);
              if (match) {
                const parsedM = match[1].split(/[\s,]+/).map(parseFloat);
                if (parsedM.length === 6) m = parsedM;
              }
            }
            w = (bbox.width * Math.abs(m[0])).toString();
            h = (bbox.height * Math.abs(m[3])).toString();
            x = (bbox.x * m[0] + (m[0] < 0 ? bbox.width * m[0] : 0) + m[4]).toString();
            y = (bbox.y * m[3] + (m[3] < 0 ? bbox.height * m[3] : 0) + m[5]).toString();
            measuredFromDom = true;
          } catch (e) {
            console.warn("Failed to get BBox for element", e);
          }
        }

        // --- FALLBACK / OVERRIDE: Tags that have preferred source of truth ---
        if (!measuredFromDom || (parseFloat(w) === 0 && parseFloat(h) === 0)) {
          if (el.tagName === 'rect') {
            if (!el.getAttribute('transform')) {
              w = el.getAttribute('width') || w;
              h = el.getAttribute('height') || h;
              x = el.getAttribute('x') || x;
              y = el.getAttribute('y') || y;
            }
          } else if (el.tagName === 'circle') {
            const radius = parseFloat(el.getAttribute('r')) || 0;
            w = (radius * 2).toString();
            h = w;
            if (!el.getAttribute('transform')) {
              x = (parseFloat(el.getAttribute('cx') || '0') - radius).toString();
              y = (parseFloat(el.getAttribute('cy') || '0') - radius).toString();
            }
          } else if (el.tagName === 'ellipse') {
            const rx = parseFloat(el.getAttribute('rx')) || 0;
            const ry = parseFloat(el.getAttribute('ry')) || 0;
            w = (rx * 2).toString();
            h = (ry * 2).toString();
            if (!el.getAttribute('transform')) {
              x = (parseFloat(el.getAttribute('cx') || '0') - rx).toString();
              y = (parseFloat(el.getAttribute('cy') || '0') - ry).toString();
            }
          } else if (el.tagName === 'text') {
            if (!el.getAttribute('transform')) {
              x = el.getAttribute('x') || x;
              y = el.getAttribute('y') || y;
            }
          } else if (el.tagName === 'image' || el.tagName === 'path' || el.tagName === 'g') {
            if (parseFloat(w) === 0) w = el.getAttribute('width') || '0';
            if (parseFloat(h) === 0) h = el.getAttribute('height') || '0';
            if (parseFloat(x) === 0) x = el.getAttribute('x') || '0';
            if (parseFloat(y) === 0) y = el.getAttribute('y') || '0';
          }
        }

        if (el.tagName === 'rect') {
          r = el.getAttribute('rx') || '0';
        }

        let fillStyle = el.getAttribute('fill') || '#000000';
        let strokeStyle = el.getAttribute('stroke') || 'none';
        let strokeWidthStr = el.getAttribute('stroke-width') || el.getAttribute('strokeWidth') || '0';

        if (fillStyle === 'inherit' || !fillStyle) {
          const explicitFill = el.getAttribute('data-fill-color') || el.parentElement?.getAttribute('data-fill-color') || el.parentElement?.getAttribute('fill');
          if (explicitFill && explicitFill !== 'inherit') fillStyle = explicitFill;
        }
        if (strokeStyle === 'none' || strokeStyle === 'inherit' || !el.hasAttribute('stroke')) {
          const explicitStroke = el.getAttribute('data-stroke-color') || el.getAttribute('data-original-stroke') || el.parentElement?.getAttribute('data-stroke-color') || el.parentElement?.getAttribute('stroke');
          if (explicitStroke && explicitStroke !== 'none' && explicitStroke !== 'inherit') {
            strokeStyle = explicitStroke;
          }
        }
        if (strokeWidthStr === '0' || strokeWidthStr === 'inherit' || !el.hasAttribute('stroke-width')) {
          const explicitWidth = el.getAttribute('data-stroke-width') || el.parentElement?.getAttribute('data-stroke-width') || el.parentElement?.getAttribute('stroke-width') || el.parentElement?.getAttribute('strokeWidth');
          if (explicitWidth && explicitWidth !== '0') {
            strokeWidthStr = explicitWidth;
          }
        }

        if (el.tagName.toLowerCase() === 'foreignobject' && actualEl && actualEl.firstElementChild) {
          const comp = window.getComputedStyle(actualEl.firstElementChild);
          if (!el.hasAttribute('fill')) fillStyle = comp.color || fillStyle;
          if (!el.hasAttribute('stroke') && comp.webkitTextStrokeColor) strokeStyle = comp.webkitTextStrokeColor;
          if (!el.hasAttribute('stroke-width') && !el.hasAttribute('strokeWidth') && comp.webkitTextStrokeWidth) {
            strokeWidthStr = parseFloat(comp.webkitTextStrokeWidth).toString();
          }
          if (parseFloat(strokeWidthStr) === 0 || isNaN(parseFloat(strokeWidthStr)) || strokeStyle === 'transparent' || strokeStyle === 'rgba(0, 0, 0, 0)') {
            strokeStyle = 'none';
          }
        }

        const props = {
          id: el.id || selectedLayerId,
          tagName: el.tagName,
          fill: fillStyle,
          stroke: strokeStyle,
          strokeWidth: strokeWidthStr,
          strokeDasharray: el.getAttribute('stroke-dasharray') || 'none',
          opacity: el.getAttribute('opacity') || '1',
          fontSize: el.getAttribute('font-size') || '16',
          textAlign: el.getAttribute('text-anchor') || 'start',
          w: parseFloat(w),
          h: parseFloat(h),
          x: parseFloat(x),
          y: parseFloat(y),
          r: parseFloat(r),
          isGradient: fillStyle?.includes('url(#')
        };

        // Extract all custom attributes (gradients, etc.)
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('fill-') || attr.name.startsWith('stroke-') || attr.name.startsWith('data-') || attr.name === 'href' || attr.name.includes('href')) {
            props[attr.name] = attr.value;
          }
        });

        // For shapes added as SVGs wrapped in a <g>, extract inner shape properties
        if (el.tagName.toLowerCase() === 'g') {
          const innerShape = el.querySelector('path, polygon, rect, circle, ellipse, line, polyline');
          if (innerShape) {
            props.innerTagName = innerShape.tagName.toLowerCase();
            if (!props['stroke-linecap'] && innerShape.getAttribute('stroke-linecap')) {
              props['stroke-linecap'] = innerShape.getAttribute('stroke-linecap');
            }
            if (!props['stroke-linejoin'] && innerShape.getAttribute('stroke-linejoin')) {
              props['stroke-linejoin'] = innerShape.getAttribute('stroke-linejoin');
            }
            Array.from(innerShape.attributes).forEach(attr => {
              if (['data-shape-type', 'data-shape-id', 'data-shape-title', 'data-name', 'data-count', 'data-ratio', 'data-radius', 'data-cx', 'data-cy', 'data-rx', 'rx', 'data-tl', 'data-tr', 'data-bl', 'data-br', 'data-corner-linked', 'x', 'y', 'width', 'height'].includes(attr.name)) {
                props[attr.name] = attr.value;
              }
            });
            const innerD = innerShape.getAttribute('d') || '';
            const isInnerDiamond = props['data-shape-type'] === 'diamond' ||
              props['data-shape-id'] === 'rounded-diamond' ||
              (innerD && (innerD.includes('50 12') || innerD.includes('50 88') || innerD.includes('85 43') || innerD.includes('15 57')));
            if (isInnerDiamond) {
              props['data-shape-type'] = 'diamond';
            }
          }
        }

        // Add a flag for image detection
        const dataType = el.getAttribute('data-type');
        const dataName = el.getAttribute('data-name');
        const fillValue = el.getAttribute('fill') || '';

        // Detect if it's a shape filled with a pattern containing an image
        let isPatternImage = false;
        if (fillValue.startsWith('url(#')) {
          const patternId = fillValue.match(/url\(#([^)]+)\)/)?.[1];
          if (patternId) {
            // Try finding the pattern in the document
            const pattern = doc.getElementById(patternId) || doc.querySelector(`pattern[id="${patternId}"], [id="${patternId}"]`);
            if (pattern) {
              // Templates often use <use xlink:href="#imageId"> inside <pattern>
              const hasUse = pattern.querySelector('use') !== null;
              const hasImage = pattern.querySelector('image, img') !== null;
              if (hasImage || hasUse) {
                isPatternImage = true;
              }
            }
          }
        }

        // Check if it's an image or a group containing an image (very common in templates)
        const hasImageChild = el.querySelector('image, img') !== null;
        const lowerTagName = props.tagName.toLowerCase();
        const lowerId = selectedLayerId?.toLowerCase() || '';
        const lowerDataName = dataName?.toLowerCase() || '';
        const src = el.getAttribute('href') || el.getAttribute('xlink:href') || el.getAttribute('src') || '';
        const urlWithoutQuery = src.split('?')[0].toLowerCase();
        const isGifFile = urlWithoutQuery.endsWith('.gif') || dataType === 'gif' || src.toLowerCase().startsWith('data:image/gif');

        const isPdfBackground = lowerDataName.includes('pdf background') || lowerDataName.endsWith('-pdf') || lowerId.includes('background') || dataType === 'pdf-background';

        const isGif = isGifFile || lowerDataName.includes('gif') || lowerId.includes('gif') || el.getAttribute('data-is-gif-group') === 'true' || el.dataset?.mediaType === 'gif';

        const isUserGroup = lowerTagName === 'g' && (
          dataType === 'group' ||
          lowerDataName === 'group' ||
          lowerId.startsWith('group-') ||
          el.getAttribute('data-type') === 'group' ||
          (!el.getAttribute('data-is-image-group') && !el.getAttribute('data-is-video-group') && !el.getAttribute('data-is-gif-group') && dataType !== 'icon' && lowerDataName !== 'icon' && !lowerId.includes('icon'))
        ) && el.getAttribute('data-is-image-group') !== 'true' && el.getAttribute('data-is-video-group') !== 'true' && el.getAttribute('data-is-gif-group') !== 'true' && dataType !== 'icon' && lowerDataName !== 'icon' && !lowerId.includes('icon');

        const isImage = !isUserGroup && (lowerTagName.includes('image') ||
          lowerTagName === 'img' ||
          dataType === 'image' ||
          lowerDataName.includes('image') ||
          lowerId.includes('image') ||
          !!(el.getAttribute('href') || el.getAttribute('xlink:href')) ||
          (lowerTagName === 'g' && hasImageChild && el.getAttribute('data-is-image-group') === 'true') ||
          isPatternImage) && !isGif && !isPdfBackground;

        const isVideo = lowerTagName === 'video' || lowerTagName === 'iframe' || dataType === 'video' || lowerDataName.includes('video') || lowerId.includes('video') || (lowerTagName === 'foreignobject' && el.querySelector('video, iframe'));
        const isText = (lowerTagName === 'text' || lowerTagName === 'tspan' || (lowerTagName === 'foreignobject' && !isVideo)) || dataType === 'text' || lowerDataName.includes('text') || lowerId.includes('text');
        const isIcon = dataType === 'icon' || dataType === 'hotspot' || lowerDataName.includes('icon') || lowerDataName.includes('hotspot') || lowerId.includes('icon') || lowerId.includes('hotspot') || lowerTagName.includes('lucide') || el.classList.contains('lucide') || el.classList.contains('iconify');

                const isElementShape = el.getAttribute('data-is-element-shape') === 'true' ||
          el.getAttribute('data-shape-type') !== null ||
          el.getAttribute('data-type') === 'shape' ||
          (el.closest && (
            el.closest('[data-is-element-shape="true"]') !== null ||
            el.closest('[data-shape-type]') !== null ||
            el.closest('[data-type="shape"]') !== null
          )) ||
          (el.querySelector && (
            el.querySelector('[data-is-element-shape="true"]') !== null ||
            el.querySelector('[data-shape-type]') !== null ||
            el.querySelector('[data-type="shape"]') !== null
          ));

        const isElementTypography = el.getAttribute('data-is-element-typography') === 'true' ||
          el.getAttribute('data-typography-type') === 'kinetic' ||
          el.getAttribute('data-typography-type') === 'motion-graphic' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('typography-')) ||
          (el.querySelector && el.querySelector('[data-is-element-typography="true"], [data-typography-type]'));

        const buttonParent = el?.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]');
        const isElementButton = el.getAttribute('data-is-element-button') === 'true' ||
          el.getAttribute('data-type') === 'button' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('button-')) ||
          (el.querySelector && el.querySelector('[data-is-element-button="true"]')) ||
          !!buttonParent;

        const isImageFrame = el.getAttribute('data-is-image-frame') === 'true' ||
          el.getAttribute('data-type') === 'image-frame' ||
          el.getAttribute('data-frame-type') !== null ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('image-frame-'));

        const isTable = el.getAttribute('data-type') === 'table-frame' ||
          el.getAttribute('data-type') === 'table' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('table-')) ||
          (el.querySelector && el.querySelector('[data-type="table-frame"], table') !== null);

        const qrParent = el?.closest?.('[data-type="qrcode"], g[id^="qrcode-"]');
        const isQRCode = el.getAttribute('data-type') === 'qrcode' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('qrcode-')) ||
          !!qrParent;
        if (isQRCode) {
          props.qrcodeId = qrParent ? qrParent.id : selectedLayerId;
          props.isQRCode = true;
        }

        const mapParent = el?.closest?.('[data-type="map"], g[id^="map-"]');
        const isMap = el.getAttribute('data-type') === 'map' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('map-')) ||
          !!mapParent;

        const embedParent = el?.closest?.('[data-type="embed-frame"], g[id^="embed-"]');
        const isEmbed = el.getAttribute('data-type') === 'embed-frame' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('embed-')) ||
          !!embedParent;

        const isSlideshow = el.getAttribute('data-type') === 'slideshow' ||
          el.getAttribute('data-is-slideshow') === 'true' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('slideshow-'));

        const isDecorator = el.getAttribute('data-type') === 'animated-decorator' ||
          el.getAttribute('data-is-animated-decorator') === 'true' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('decorator-'));

        const audioParent = el?.closest?.('[data-type="audio-frame"], g[id^="audio-"]');
        const isAudio = el.getAttribute('data-type') === 'audio-frame' ||
          (el.getAttribute('id') && el.getAttribute('id').startsWith('audio-')) ||
          !!audioParent;
        if (isAudio) {
          props.audioId = audioParent ? audioParent.id : selectedLayerId;
          props.isAudio = true;
        }

        props.isMap = isMap;
        props.isEmbed = isEmbed;
        props.isSlideshow = isSlideshow;
        props.isDecorator = isDecorator;

        props.isTable = isTable;
        props.isQRCode = isQRCode;

        props.isElementShape = isElementShape;
        props.isElementTypography = isElementTypography;
        props.isElementButton = isElementButton;
        props.isImageFrame = isImageFrame;
        props.isUserGroup = isUserGroup &&
          !isElementShape &&
          !isElementTypography &&
          !isElementButton &&
          !isImageFrame &&
          !isTable &&
          !isQRCode &&
          !isMap &&
          !isEmbed &&
          !isSlideshow &&
          !isDecorator &&
          !isAudio;

        if (isElementButton) {
          props.buttonId = buttonParent ? buttonParent.id : (el.id?.startsWith('button-') ? el.id : selectedLayerId);
          props.isText = false;
          props.isShape = false;
          props.isElementShape = false;
        }

        props.isImage = (isElementButton || isElementShape) ? false : isImage;
        props.isText = (isElementButton || isElementShape) ? false : isText;
        props.isVideo = (isElementButton || isElementShape) ? false : isVideo;
        props.isGif = (isElementButton || isElementShape) ? false : isGif;
        props.isIcon = (isElementButton || isElementShape) ? false : isIcon;
        props.isPdfBackground = (isElementButton || isElementShape) ? false : isPdfBackground;

        return props;
      }
    }
    return null;
  }, [selectedLayerId, activePageIndex, pages[activePageIndex]?.html]);

  const selectedTextElement = useMemo(() => {
    if (!selectedLayerId) return null;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const el = editorDoc.getElementById(selectedLayerId);
    if (!el) return null;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'foreignobject') {
      return el.querySelector('[contenteditable], div, p, span') || el;
    }
    return el;
  }, [selectedLayerId]);

  const isDimensionDisabled = !selectedElementProps || selectedElementProps.isPdfBackground || activeTopTool === 'interaction' || activeTopTool === 'animation';

  return (
    <div
      className="bg-white border-l border-[#EEEEEE] flex flex-col overflow-hidden select-none flex-shrink-0 h-full"
      style={{ width: '24vw' }}
    >
      {/* ================= Popup Apply/Cancel Banner ================= */}
      {isPopupEditor && (
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-[1.5vw] flex items-center justify-between" style={{ height: '8.5vh' }}>
          <span className="text-[0.75vw] text-gray-500 font-medium flex items-center gap-[0.2vw]">
            Click <span className="text-[#22C55E] font-bold text-[0.8vw] mx-[0.1vw]">(âœ“)</span> to apply changes
          </span>
          <div className="flex items-center gap-[0.5vw]">
            <button
              onClick={onApplyPopupChanges}
              className="flex items-center justify-center w-[2vw] h-[2vw] bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-[0.4vw] transition-colors shadow-sm cursor-pointer"
              title="Apply Changes"
            >
              <Icon icon="lucide:check" width="1.1vw" strokeWidth={3} />
            </button>
            <button
              onClick={onCancelPopupChanges}
              className="flex items-center justify-center w-[2vw] h-[2vw] bg-white border border-[#EF4444] hover:bg-red-50 text-[#EF4444] rounded-[0.4vw] transition-colors shadow-sm cursor-pointer"
              title="Cancel"
            >
              <Icon icon="lucide:x" width="1.1vw" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent Transform Section (Common for all properties) */}
      {!is3DModalOpen && (
        <TransformProperties
          selectedLayerId={selectedLayerId}
          selectedElementProps={selectedElementProps}
          isDimensionDisabled={isDimensionDisabled}
          updatePosition={updatePosition}
          updateDimensionWithScale={updateDimensionWithScale}
          convertValue={convertValue}
          flipbookDimensions={flipbookDimensions}
        />
      )}

      <div className={`flex-1 flex flex-col overflow-hidden bg-white ${pages[activePageIndex]?.isHidden ? 'opacity-50 pointer-events-none' : ''}`}>
        {is3DModalOpen ? (
          <CustomScrollbar
            color="#d1d5db"
            hoverColor="#9ca3af"
            width="0.12vw"
            className="flex-1 flex flex-col"
          >
            <Model3DEditor
              onClose={() => setIs3DModalOpen(false)}
              shadowStrength={shadowStrength} setShadowStrength={setShadowStrength}
              shadowSoftness={shadowSoftness} setShadowSoftness={setShadowSoftness}
              autoRotate={autoRotate} setAutoRotate={setAutoRotate}
              autoRotateSpeed={autoRotateSpeed} setAutoRotateSpeed={setAutoRotateSpeed}
              lockMaxZoom={lockMaxZoom} setLockMaxZoom={setLockMaxZoom}
              maxZoom={maxZoom} setMaxZoom={setMaxZoom}
              bgType={bgType} setBgType={setBgType}
              bgColor={bgColor} setBgColor={setBgColor}
              customBg={customBg} setCustomBg={setCustomBg}
              enableAR={enableAR} setEnableAR={setEnableAR}
              qrText={qrText} setQrText={setQrText} qrColor={qrColor} setQrColor={setQrColor} qrBgType={qrBgType} setQrBgType={setQrBgType} qrBgColor={qrBgColor} setQrBgColor={setQrBgColor} qrLevel={qrLevel} setQrLevel={setQrLevel} qrDotType={qrDotType} setQrDotType={setQrDotType} qrCornerSquareType={qrCornerSquareType} setQrCornerSquareType={setQrCornerSquareType} qrCornerDotType={qrCornerDotType} setQrCornerDotType={setQrCornerDotType} qrLogo={qrLogo} setQrLogo={setQrLogo}
              topText={topText} setTopText={setTopText} bottomText={bottomText} setBottomText={setBottomText}
              dataUrl={preview3DDataUrl}
              vId={current3DVId}
              hotspots={hotspots}
              activeHotspotId={activeHotspotId}
              onHotspotClick={onHotspotClick}
            />
          </CustomScrollbar>
        ) : activeTopTool === 'editor' ? (
          activeMainTool === 'upload' ? (
            <UploadProperties
              activePageIndex={activePageIndex}
              setActiveMainTool={setActiveMainTool}
            />
          ) : (
            <CustomScrollbar
              color="#d1d5db"
              hoverColor="#9ca3af"
              width="0.12vw"
              className="flex-1 flex flex-col overflow-x-hidden"
            >
              {isPdfProject ? (
                <InteractionPanel
                  selectedElementProps={selectedElementProps}
                  activePageIndex={activePageIndex}
                  selectedLayerId={selectedLayerId}
                  updateElementAttribute={updateElementAttribute}
                  deleteLayer={deleteLayer}
                  pages={pages}
                  flipbookDimensions={flipbookDimensions}
                  onCustomizePopup={onCustomizePopup}
                  setIs3DModalOpen={setIs3DModalOpen}
                  setCurrent3DItem={setCurrent3DItem}
                  v_id={effectiveVId}
                  folderName={effectiveFolder}
                  flipbookName={effectiveBook}
                />
              ) : selectedElementProps ? (
                <div className="flex flex-col p-[1.5vw] gap-[1.5vw]">
                  <div className="flex flex-col gap-[1.5vw]">
                      {(selectedElementProps?.isUserGroup || (multiSelectedIds && multiSelectedIds.size > 1)) ? (
                        <GroupProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            if (selectedLayerId) return editorDoc.getElementById(selectedLayerId);
                            return null;
                          })()}
                          multiSelectedIds={multiSelectedIds}
                          isMultiSelect={multiSelectedIds && multiSelectedIds.size > 1}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const targetId = selectedLayerId || (multiSelectedIds && multiSelectedIds.size > 0 ? Array.from(multiSelectedIds)[0] : null);
                                const el = document.getElementById(targetId);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) {
                                  const canvasContent = container.querySelector('[id^="canvas-content-"]');
                                  return canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
                                }
                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(svgRoot);
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                              } else {
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', null);
                              }
                            }
                          }}
                          onDeleteLayer={() => {
                            if (multiSelectedIds && multiSelectedIds.size > 1) {
                              multiSelectedIds.forEach(id => deleteLayer?.(activePageIndex, id));
                              if (setMultiSelectedIds) setMultiSelectedIds(new Set());
                              if (setSelectedLayerId) setSelectedLayerId(null);
                            } else {
                              deleteLayer?.(activePageIndex, selectedLayerId);
                            }
                          }}
                          setSelectedLayerId={setSelectedLayerId}
                          setMultiSelectedIds={setMultiSelectedIds}
                        />
                      ) : selectedElementProps?.isImage ? (
                        <ImageProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const el = document.getElementById(selectedLayerId);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) {
                                  const canvasContent = container.querySelector('[id^="canvas-content-"]');
                                  return canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
                                }

                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(svgRoot);
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                              } else {
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', null);
                              }
                            }
                          }}
                          pages={pages}
                          currentPageVId={pages[activePageIndex]?.v_id || pages[activePageIndex]?.id || ''}
                          folderName={effectiveFolder}
                          flipbookName={effectiveBook}
                          flipbookVId={effectiveVId}
                          onDeleteLayer={() => deleteLayer?.(activePageIndex, selectedLayerId)}
                        />
                      ) : selectedElementProps?.isTable ? (
                        <ElementTableProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string' && newHtml.includes('<svg')) {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                              const el = editorDoc.getElementById(selectedLayerId) || document.getElementById(selectedLayerId);
                              if (!el) return;
                              const container = el.closest('.page-svg-container');
                              const svgRoot = container ? (container.querySelector('[id^="canvas-content-"] svg') || container.querySelector('svg')) : el.closest('svg');
                              if (svgRoot) {
                                const cloneSvg = svgRoot.cloneNode(true);
                                cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(e => e.remove());
                                cloneSvg.querySelectorAll('td[data-cell-selected], th[data-cell-selected]').forEach(td => {
                                  td.removeAttribute('data-cell-selected');
                                  td.style.removeProperty('outline');
                                  td.style.removeProperty('outline-offset');
                                  td.style.removeProperty('box-shadow');
                                });
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(cloneSvg);
                                const targetId = selectedElementProps?.audioId || selectedLayerId;
                                updateElementAttribute(activePageIndex, targetId, '__dom_sync__', html);
                              }
                            }
                          }}
                        />
                      ) : selectedElementProps?.isQRCode ? (
                        <ElementQRCodeProperties
                          selectedElement={(() => {
                            const targetId = selectedElementProps?.qrcodeId || selectedLayerId;
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            const el = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null);
                            return el?.closest?.('[data-type="qrcode"], g[id^="qrcode-"]') || el;
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedElementProps?.qrcodeId || selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            const targetId = selectedElementProps?.qrcodeId || selectedLayerId;
                            if (typeof newHtml === 'string' && newHtml.includes('<svg')) {
                              updateElementAttribute(activePageIndex, targetId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                                const el = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) {
                                  const canvasContent = container.querySelector('[id^="canvas-content-"]');
                                  return canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
                                }
                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const cloneSvg = svgRoot.cloneNode(true);
                                cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(e => e.remove());
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(cloneSvg);
                                updateElementAttribute(activePageIndex, targetId, '__dom_sync__', html);
                              }
                            }
                          }}
                        />
                      ) : selectedElementProps?.isMap ? (
                        <ElementMapProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            const el = editorDoc.getElementById(selectedLayerId);
                            return el?.closest?.('[data-type="map"], g[id^="map-"]') || el;
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            const svgRoot = (() => {
                              const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                              const el = editorDoc.getElementById(selectedLayerId);
                              if (!el) return null;
                              const container = el.closest('.page-svg-container');
                              if (container) {
                                const canvasContent = container.querySelector('[id^="canvas-content-"]');
                                return canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
                              }
                              let node = el;
                              let lastSvg = null;
                              while (node) {
                                if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                node = node.parentElement;
                              }
                              return lastSvg;
                            })();
                            if (svgRoot) {
                              const cloneSvg = svgRoot.cloneNode(true);
                              cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
                              const serializer = new XMLSerializer();
                              const html = serializer.serializeToString(cloneSvg);
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                            } else if (typeof newHtml === 'string' && newHtml.includes('<svg')) {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            }
                          }}
                        />
                      ) : selectedElementProps?.isEmbed ? (
                        <ElementEmbedProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            const base = editorDoc.getElementById(selectedLayerId);
                            return base?.closest?.('[data-type="embed-frame"], g[id^="embed-"]') || base;
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                        />
                      ) : selectedElementProps?.isSlideshow ? (
                        <ElementSlideshowProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            const base = editorDoc.getElementById(selectedLayerId);
                            return base?.closest?.('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]') || base;
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          effectiveFolder={effectiveFolder}
                          flipbookName={effectiveBook}
                          flipbookVId={effectiveVId}
                          onDeleteLayer={() => deleteLayer?.(activePageIndex, selectedLayerId)}
                        />
                      ) : selectedElementProps?.isDecorator ? (
                        <ElementDecoratorProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string' && newHtml.includes('<svg')) {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                              const el = editorDoc.getElementById(selectedLayerId) || document.getElementById(selectedLayerId);
                              if (!el) return;
                              const container = el.closest('.page-svg-container');
                              const svgRoot = container ? (container.querySelector('[id^="canvas-content-"] svg') || container.querySelector('svg')) : el.closest('svg');
                              if (svgRoot) {
                                const cloneSvg = svgRoot.cloneNode(true);
                                cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary, #ghost-layer, .selection-overlay-layer').forEach(e => e.remove());
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(cloneSvg);
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                              }
                            }
                          }}
                        />
                      ) : selectedElementProps?.isAudio ? (
                        <ElementAudioProperties
                          selectedElement={(() => {
                            const pageContainer = document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`);
                            const rawEl = pageContainer?.querySelector(`[id="${selectedLayerId}"]`) || document.getElementById(selectedLayerId);
                            return rawEl?.closest?.('[data-type="audio-frame"], g[id^="audio-"]') || rawEl;
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedElementProps?.audioId || selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          onUpdate={(newHtml) => {
                            const targetId = selectedElementProps?.audioId || selectedLayerId;
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, targetId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const el = document.getElementById(targetId);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) return container.querySelector('svg');

                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const cloneSvg = svgRoot.cloneNode(true);
                                cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(cloneSvg);
                                updateElementAttribute(activePageIndex, targetId, '__dom_sync__', html);
                              } else {
                                updateElementAttribute(activePageIndex, targetId, '__dom_sync__', null);
                              }
                            }
                          }}
                        />
                      ) : (selectedElementProps?.isButton || selectedElementProps?.isElementButton) ? (
                        <ElementButtonProperties
                          selectedElement={(() => {
                            const targetId = selectedElementProps?.buttonId || selectedLayerId;
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            const base = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null);
                            return base?.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]') || base;
                          })()}
                          selectedElementProps={selectedElementProps}
                          selectedLayerId={selectedElementProps?.buttonId || selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            const targetId = selectedElementProps?.buttonId || selectedLayerId;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, targetId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                                const el = (targetId ? editorDoc.getElementById(targetId) : null) || (targetId ? document.getElementById(targetId) : null);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) {
                                  const canvasContent = container.querySelector('[id^="canvas-content-"]');
                                  return canvasContent ? canvasContent.querySelector('svg') : container.querySelector('svg');
                                }
                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const cloneSvg = svgRoot.cloneNode(true);
                                cloneSvg.querySelectorAll('[data-highlight-id], .frame-boundary').forEach(el => el.remove());
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(cloneSvg);
                                updateElementAttribute(activePageIndex, targetId, '__dom_sync__', html);
                              }
                            }
                            window.dispatchEvent(new CustomEvent('force-update-selection-box'));
                          }}
                        />
                      ) : selectedElementProps?.isImageFrame ? (
                        <ImageFramingProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          updateElementAttribute={updateElementAttribute}
                          selectedElementProps={selectedElementProps}
                        />
                      ) : selectedElementProps?.isElementTypography ? (
                        <TextElementEditor
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          updateElementAttribute={updateElementAttribute}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                        />
                      ) : selectedElementProps?.isText ? (
                        <TextProperties
                          selectedElement={selectedTextElement}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const el = document.getElementById(selectedLayerId);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) return container.querySelector('svg');

                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(svgRoot);
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                              } else {
                                updateElementAttribute(activePageIndex);
                              }
                            }
                          }}
                          pages={pages}
                          setPages={setPages}
                          activePageIndex={activePageIndex}
                        />
                      ) : selectedElementProps?.isVideo ? (
                        <VideoProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          selectedLayerId={selectedLayerId}
                          activePageIndex={activePageIndex}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const el = document.getElementById(selectedLayerId);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) return container.querySelector('svg');

                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(svgRoot);
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                              } else {
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', null);
                              }
                            }
                          }}
                          pages={pages}
                          currentPageVId={pages[activePageIndex]?.v_id || pages[activePageIndex]?.id || ''}
                          folderName={effectiveFolder}
                          flipbookName={effectiveBook}
                          flipbookVId={effectiveVId}
                          onDeleteLayer={() => deleteLayer?.(activePageIndex, selectedLayerId)}
                        />
                      ) : selectedElementProps?.isGif ? (
                        <GifProperties
                          selectedElement={(() => {
                            const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
                            return editorDoc.getElementById(selectedLayerId);
                          })()}
                          selectedLayerId={selectedLayerId}
                          onUpdate={(newHtml) => {
                            window.__skipCanvasUpdateForPage = activePageIndex;
                            if (typeof newHtml === 'string') {
                              updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', newHtml);
                            } else {
                              const svgRoot = (() => {
                                const el = document.getElementById(selectedLayerId);
                                if (!el) return null;
                                const container = el.closest('.page-svg-container');
                                if (container) return container.querySelector('svg');

                                let node = el;
                                let lastSvg = null;
                                while (node) {
                                  if (node.tagName?.toLowerCase() === 'svg') lastSvg = node;
                                  node = node.parentElement;
                                }
                                return lastSvg;
                              })();
                              if (svgRoot) {
                                const serializer = new XMLSerializer();
                                const html = serializer.serializeToString(svgRoot);
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', html);
                              } else {
                                updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', null);
                              }
                            }
                          }}
                          pages={pages}
                          activePageIndex={activePageIndex}
                          folderName={effectiveFolder}
                          flipbookName={effectiveBook}
                          flipbookVId={effectiveVId}
                          onDeleteLayer={() => deleteLayer?.(activePageIndex, selectedLayerId)}
                        />
                      ) : (
                        <>
                          <PenToolProperties
                            isVectorPath={true}
                            isNodeEditActive={isNodeEditActive}
                            isPenChosen={activeMainTool === 'pen'}
                          />
                          <ShapeProperties
                            selectedElementProps={selectedElementProps || {
                              fill: '#6366F1',
                              opacity: '1',
                              stroke: 'none',
                              strokeWidth: '0',
                              tagName: 'g',
                              isIcon: true
                            }}
                            activePageIndex={activePageIndex}
                            selectedLayerId={selectedLayerId}
                            updateElementAttribute={updateElementAttribute}
                            activeMainTool={activeMainTool}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Page Properties (Default View) */
                  <PageProperties
                    pages={pages}
                    activePageIndex={activePageIndex}
                    updateElementAttribute={updateElementAttribute}
                    baseWidth={baseWidth}
                    baseHeight={baseHeight}
                    presetColors={presetColors}
                  />
                )}
            </CustomScrollbar>
          )
        ) : activeTopTool === 'interaction' ? (
          <InteractionPanel
            selectedElementProps={selectedElementProps}
            activePageIndex={activePageIndex}
            selectedLayerId={selectedLayerId}
            updateElementAttribute={updateElementAttribute}
            deleteLayer={deleteLayer}
            pages={pages}
            flipbookDimensions={flipbookDimensions}
            onCustomizePopup={onCustomizePopup}
            setIs3DModalOpen={setIs3DModalOpen}
            setCurrent3DItem={setCurrent3DItem}
            v_id={effectiveVId}
            folderName={effectiveFolder}
            flipbookName={effectiveBook}
          />

        ) : (
          /* Animation Mode */
          <CustomScrollbar
            color="#d1d5db"
            hoverColor="#9ca3af"
            width="0.12vw"
            className="flex-1 flex flex-col p-[1.5vw]"
          >
            <AnimationPanel
              selectedElementProps={selectedElementProps}
              flipbookDimensions={flipbookDimensions}
              selectedLayerId={selectedLayerId}
              selectedElement={(() => {
                if (!selectedLayerId) return null;
                const container = document.querySelector(`.page-svg-container [id="${selectedLayerId}"]`);
                if (container) return container;
                return document.getElementById(selectedLayerId) || null;
              })()}
              onUpdate={(elementId, attr, value) => {
                if (elementId && attr) {
                  updateElementAttribute(activePageIndex, elementId, attr, value);
                }
              }}
            />
          </CustomScrollbar>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
