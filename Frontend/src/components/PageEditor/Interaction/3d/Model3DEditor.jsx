import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import QRCodeStyling from 'qr-code-styling';
import ColorPicker from '../../../Color';
import axios from 'axios';
import ControlsTab from './tabs/ControlsTab';
import VisualsTab from './tabs/VisualsTab';
import ModelTab from './tabs/ModelTab';
import ARViewTab from './tabs/ARViewTab';

export const CustomQRCode = React.forwardRef(({ 
    value,  
    size = 256, 
    margin,
    fgColor = '#000000', 
    bgColor = '#ffffff', 
    dotType = 'square', 
    cornerSquareType = 'square', 
    cornerDotType = 'square', 
    level = 'M', 
    logo = '',
    style = {}
}, ref) => {
    const containerRef = useRef(null);
    const qrStylingRef = useRef(null);

    useEffect(() => {
        const qrCode = new QRCodeStyling({
            type: 'svg',
            width: size,
            height: size,
            data: value || 'https://google.com',
            margin: margin !== undefined ? margin : Math.max(2, Math.round(size * 0.05)),
            dotsOptions: {
                color: fgColor,
                type: dotType
            },
            backgroundOptions: {
                color: bgColor === 'transparent' ? 'rgba(0,0,0,0)' : bgColor
            },
            cornersSquareOptions: {
                color: fgColor,
                type: cornerSquareType
            },
            cornersDotOptions: {
                color: fgColor,
                type: cornerDotType
            },
            qrOptions: {
                errorCorrectionLevel: level
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: Math.round(size * 0.03),
                hideBackgroundDots: true
            },
            image: logo || undefined
        });

        qrStylingRef.current = qrCode;

        if (containerRef.current) {
            containerRef.current.innerHTML = '';
            qrCode.append(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    useEffect(() => {
        if (!qrStylingRef.current) return;

        const animFrame = requestAnimationFrame(() => {
            qrStylingRef.current.update({
                type: 'svg',
                width: size,
                height: size,
                data: value || 'https://google.com',
                margin: margin !== undefined ? margin : Math.max(2, Math.round(size * 0.05)),
                dotsOptions: {
                    color: fgColor,
                    type: dotType
                },
                backgroundOptions: {
                    color: bgColor === 'transparent' ? 'rgba(0,0,0,0)' : bgColor
                },
                cornersSquareOptions: {
                    color: fgColor,
                    type: cornerSquareType
                },
                cornersDotOptions: {
                    color: fgColor,
                    type: cornerDotType
                },
                qrOptions: {
                    errorCorrectionLevel: level
                },
                imageOptions: {
                    crossOrigin: 'anonymous',
                    margin: Math.round(size * 0.03),
                    hideBackgroundDots: true
                },
                image: logo || undefined
            });
        });

        return () => cancelAnimationFrame(animFrame);
    }, [value, size, margin, fgColor, bgColor, dotType, cornerSquareType, cornerDotType, level, logo]);

    React.useImperativeHandle(ref, () => ({
        download: async (options = {}) => {
            if (qrStylingRef.current) {
                try {
                    const ext = options.extension || 'png';
                    const downloadSize = options.size || 1024;
                    const resolvedBgColor = bgColor === 'transparent' ? 'rgba(0,0,0,0)' : bgColor;

                    qrStylingRef.current.update({
                        type: ext === 'svg' ? 'svg' : 'canvas',
                        width: downloadSize,
                        height: downloadSize,
                        data: value || 'https://google.com',
                        margin: margin !== undefined ? margin : Math.max(2, Math.round(downloadSize * 0.05)),
                        dotsOptions: {
                            color: fgColor,
                            type: dotType
                        },
                        backgroundOptions: {
                            color: resolvedBgColor
                        },
                        cornersSquareOptions: {
                            color: fgColor,
                            type: cornerSquareType
                        },
                        cornersDotOptions: {
                            color: fgColor,
                            type: cornerDotType
                        },
                        qrOptions: {
                            errorCorrectionLevel: level || 'L'
                        },
                        imageOptions: {
                            crossOrigin: 'anonymous',
                            margin: Math.round(downloadSize * 0.03),
                            hideBackgroundDots: true
                        },
                        image: logo || undefined
                    });

                    await qrStylingRef.current.download({
                        name: options.name || 'ar-qr-code',
                        extension: ext
                    });

                    qrStylingRef.current.update({ type: 'svg' });
                } catch (e) {
                    console.error('Error downloading QR code via qr-code-styling:', e);
                }
            }
        }
    }));

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden" style={style}>
            <style dangerouslySetInnerHTML={{ __html: `
                .qr-styling-container-fisto canvas,
                .qr-styling-container-fisto svg {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                    display: block !important;
                }
            ` }} />
            <div 
                ref={containerRef} 
                className="qr-styling-container-fisto flex items-center justify-center w-full h-full"
            />
        </div>
    );
});

import { usePageEditorState } from '../../../../store/hooks';

const Model3DEditor = (props) => {
  const redux = usePageEditorState();

  const onClose = props.onClose;
  const shadowStrength = props.shadowStrength !== undefined ? props.shadowStrength : redux.shadowStrength;
  const setShadowStrength = props.setShadowStrength || ((val) => redux.set3DInspectorField('shadowStrength', val));
  const shadowSoftness = props.shadowSoftness !== undefined ? props.shadowSoftness : redux.shadowSoftness;
  const setShadowSoftness = props.setShadowSoftness || ((val) => redux.set3DInspectorField('shadowSoftness', val));
  const lightIntensity = props.lightIntensity !== undefined ? props.lightIntensity : (redux.lightIntensity ?? 1);
  const setLightIntensity = props.setLightIntensity || ((val) => redux.set3DInspectorField('lightIntensity', val));
  const addShadow = props.addShadow !== undefined ? props.addShadow : (redux.addShadow ?? true);
  const setAddShadow = props.setAddShadow || ((val) => redux.set3DInspectorField('addShadow', val));
  const autoRotate = props.autoRotate !== undefined ? props.autoRotate : redux.autoRotate;
  const setAutoRotate = props.setAutoRotate || ((val) => redux.set3DInspectorField('autoRotate', val));
  const autoRotateSpeed = props.autoRotateSpeed !== undefined ? props.autoRotateSpeed : redux.autoRotateSpeed;
  const setAutoRotateSpeed = props.setAutoRotateSpeed || ((val) => redux.set3DInspectorField('autoRotateSpeed', val));
  const lockMaxZoom = props.lockMaxZoom !== undefined ? props.lockMaxZoom : redux.lockMaxZoom;
  const setLockMaxZoom = props.setLockMaxZoom || ((val) => redux.set3DInspectorField('lockMaxZoom', val));
  const maxZoom = props.maxZoom !== undefined ? props.maxZoom : redux.maxZoom;
  const setMaxZoom = props.setMaxZoom || ((val) => redux.set3DInspectorField('maxZoom', val));
  const limitHorizontalRotation = props.limitHorizontalRotation !== undefined ? props.limitHorizontalRotation : (redux.limitHorizontalRotation ?? false);
  const setLimitHorizontalRotation = props.setLimitHorizontalRotation || ((val) => redux.set3DInspectorField('limitHorizontalRotation', val));
  const leftRotationLimit = props.leftRotationLimit !== undefined ? props.leftRotationLimit : (redux.leftRotationLimit ?? 180);
  const setLeftRotationLimit = props.setLeftRotationLimit || ((val) => redux.set3DInspectorField('leftRotationLimit', val));
  const rightRotationLimit = props.rightRotationLimit !== undefined ? props.rightRotationLimit : (redux.rightRotationLimit ?? 180);
  const setRightRotationLimit = props.setRightRotationLimit || ((val) => redux.set3DInspectorField('rightRotationLimit', val));
  const limitVerticalRotation = props.limitVerticalRotation !== undefined ? props.limitVerticalRotation : (redux.limitVerticalRotation ?? false);
  const setLimitVerticalRotation = props.setLimitVerticalRotation || ((val) => redux.set3DInspectorField('limitVerticalRotation', val));
  const upperViewLimit = props.upperViewLimit !== undefined ? props.upperViewLimit : (redux.upperViewLimit ?? 180);
  const setUpperViewLimit = props.setUpperViewLimit || ((val) => redux.set3DInspectorField('upperViewLimit', val));
  const lowerViewLimit = props.lowerViewLimit !== undefined ? props.lowerViewLimit : (redux.lowerViewLimit ?? 180);
  const setLowerViewLimit = props.setLowerViewLimit || ((val) => redux.set3DInspectorField('lowerViewLimit', val));
  const limitZoom = props.limitZoom !== undefined ? props.limitZoom : (redux.limitZoom ?? false);
  const setLimitZoom = props.setLimitZoom || ((val) => redux.set3DInspectorField('limitZoom', val));
  const limitZoomIn = props.limitZoomIn !== undefined ? props.limitZoomIn : (redux.limitZoomIn ?? 80);
  const setLimitZoomIn = props.setLimitZoomIn || ((val) => redux.set3DInspectorField('limitZoomIn', val));
  const limitZoomOut = props.limitZoomOut !== undefined ? props.limitZoomOut : (redux.limitZoomOut ?? 80);
  const setLimitZoomOut = props.setLimitZoomOut || ((val) => redux.set3DInspectorField('limitZoomOut', val));
  const enablePan = props.enablePan !== undefined ? props.enablePan : (redux.enablePan ?? true);
  const setEnablePan = props.setEnablePan || ((val) => redux.set3DInspectorField('enablePan', val));
  const initialRotation = props.initialRotation !== undefined ? props.initialRotation : (redux.initialRotation ?? { x: 0, y: 0, z: 0 });
  const setInitialRotation = props.setInitialRotation || ((val) => redux.set3DInspectorField('initialRotation', val));
  const modelScale = props.modelScale !== undefined ? props.modelScale : (redux.modelScale ?? 1);
  const setModelScale = props.setModelScale || ((val) => redux.set3DInspectorField('modelScale', val));
  const arHorizontalSurface = props.arHorizontalSurface !== undefined ? props.arHorizontalSurface : (redux.arHorizontalSurface ?? true);
  const setArHorizontalSurface = props.setArHorizontalSurface || ((val) => redux.set3DInspectorField('arHorizontalSurface', val));
  const arVerticalSurface = props.arVerticalSurface !== undefined ? props.arVerticalSurface : (redux.arVerticalSurface ?? true);
  const setArVerticalSurface = props.setArVerticalSurface || ((val) => redux.set3DInspectorField('arVerticalSurface', val));
  const bgType = props.bgType !== undefined ? props.bgType : redux.bgType;
  const setBgType = props.setBgType || ((val) => redux.set3DInspectorField('bgType', val));
  const bgColor = props.bgColor !== undefined ? props.bgColor : redux.bgColor;
  const setBgColor = props.setBgColor || ((val) => redux.set3DInspectorField('bgColor', val));
  const customBg = props.customBg !== undefined ? props.customBg : redux.customBg;
  const setCustomBg = props.setCustomBg || ((val) => redux.set3DInspectorField('customBg', val));
  const enableAR = props.enableAR !== undefined ? props.enableAR : redux.enableAR;
  const setEnableAR = props.setEnableAR || ((val) => redux.set3DInspectorField('enableAR', val));
  const qrText = props.qrText !== undefined ? props.qrText : redux.qrText;
  const setQrText = props.setQrText || ((val) => redux.set3DInspectorField('qrText', val));
  const qrColor = props.qrColor !== undefined ? props.qrColor : redux.qrColor;
  const setQrColor = props.setQrColor || ((val) => redux.set3DInspectorField('qrColor', val));
  const qrBgType = props.qrBgType !== undefined ? props.qrBgType : redux.qrBgType;
  const setQrBgType = props.setQrBgType || ((val) => redux.set3DInspectorField('qrBgType', val));
  const qrBgColor = props.qrBgColor !== undefined ? props.qrBgColor : redux.qrBgColor;
  const setQrBgColor = props.setQrBgColor || ((val) => redux.set3DInspectorField('qrBgColor', val));
  const qrLevel = props.qrLevel !== undefined ? props.qrLevel : redux.qrLevel;
  const setQrLevel = props.setQrLevel || ((val) => redux.set3DInspectorField('qrLevel', val));
  const qrDotType = props.qrDotType !== undefined ? props.qrDotType : redux.qrDotType;
  const setQrDotType = props.setQrDotType || ((val) => redux.set3DInspectorField('qrDotType', val));
  const qrCornerSquareType = props.qrCornerSquareType !== undefined ? props.qrCornerSquareType : redux.qrCornerSquareType;
  const setQrCornerSquareType = props.setQrCornerSquareType || ((val) => redux.set3DInspectorField('qrCornerSquareType', val));
  const qrCornerDotType = props.qrCornerDotType !== undefined ? props.qrCornerDotType : redux.qrCornerDotType;
  const setQrCornerDotType = props.setQrCornerDotType || ((val) => redux.set3DInspectorField('qrCornerDotType', val));
  const qrLogo = props.qrLogo !== undefined ? props.qrLogo : redux.qrLogo;
  const setQrLogo = props.setQrLogo || ((val) => redux.set3DInspectorField('qrLogo', val));
  const topText = props.topText !== undefined ? props.topText : redux.topText;
  const setTopText = props.setTopText || ((val) => redux.set3DInspectorField('topText', val));
  const bottomText = props.bottomText !== undefined ? props.bottomText : redux.bottomText;
  const setBottomText = props.setBottomText || ((val) => redux.set3DInspectorField('bottomText', val));
  const dataUrl = props.dataUrl !== undefined ? props.dataUrl : redux.preview3DDataUrl;
  const vId = props.vId !== undefined ? props.vId : redux.current3DVId;
  const hotspots = props.hotspots !== undefined ? props.hotspots : redux.current3DHotspots;
  const activeHotspotId = props.activeHotspotId !== undefined ? props.activeHotspotId : redux.active3DHotspotId;
  const onHotspotClick = props.onHotspotClick || ((hs) => redux.setActive3DHotspotId(hs?.id || null));
  const [localHotspots, setLocalHotspots] = useState(hotspots || []);

  useEffect(() => {
    if (Array.isArray(hotspots) && hotspots.length > 0) {
      setLocalHotspots(hotspots);
    }
  }, [hotspots]);

  useEffect(() => {
    if (typeof dataUrl === 'string' && dataUrl.startsWith('{')) {
      try {
        const parsed = JSON.parse(dataUrl);
        if (Array.isArray(parsed.hotspots) && parsed.hotspots.length > 0) {
          setLocalHotspots(parsed.hotspots);
        }
      } catch {}
    }
  }, [dataUrl]);

  useEffect(() => {
    if (vId) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      axios.get(`${backendUrl}/api/3d-models/get-model/${vId}`)
        .then(res => {
          if (res.data && Array.isArray(res.data.hotspots) && res.data.hotspots.length > 0) {
            setLocalHotspots(res.data.hotspots);
          }
        })
        .catch(err => console.error("Failed to load hotspots in Model3DEditor:", err));
    }
  }, [vId]);

  useEffect(() => {
    if (bgColor === '#000000') {
      setBgColor('#ffffff');
    }
  }, []); // Only run once on mount

  const qrThemes = [
    { name: 'Classic Black', fg: '#000000', bg: '#ffffff', dotType: 'square', cornerSquareType: 'square', cornerDotType: 'square' },
    { name: 'Ocean Blue', fg: '#EC5137', bg: '#ffffff', dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot' },
    { name: 'Forest Green', fg: '#2E7D32', bg: '#ffffff', dotType: 'classy', cornerSquareType: 'square', cornerDotType: 'square' },
    { name: 'Red Accent', fg: '#D32F2F', bg: '#ffffff', dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot' },
    { name: 'Dark Mode', fg: '#ffffff', bg: '#1a1a1a', dotType: 'square', cornerSquareType: 'square', cornerDotType: 'square' },
  ];

  const safeQrValue = React.useMemo(() => {
    if (!dataUrl && !vId) return qrText || "Scan Me";
    
    let resolvedVId = vId || null;
    if (!resolvedVId && typeof dataUrl === 'string' && dataUrl.startsWith('{')) {
      try {
        const parsed = JSON.parse(dataUrl);
        if (parsed.v_id) resolvedVId = parsed.v_id;
        if (parsed.vId) resolvedVId = parsed.vId;
      } catch {}
    }

    if (resolvedVId) {
      return `${window.location.origin}/ar-view?id=${resolvedVId}`;
    }

    if (dataUrl && (dataUrl.startsWith('data:') || dataUrl.startsWith('blob:'))) {
      return "AR View unavailable for local/unsaved models.";
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    let resolvedUrl = dataUrl;
    if (typeof dataUrl === 'string' && dataUrl.startsWith('/')) {
      resolvedUrl = `${backendUrl}${dataUrl}`;
    } else {
      try {
        resolvedUrl = new URL(dataUrl, window.location.href).href;
      } catch {
        resolvedUrl = dataUrl;
      }
    }
    return `${window.location.origin}/ar-view?url=${encodeURIComponent(resolvedUrl)}`;
  }, [dataUrl, qrText, vId]);

  const mainQrRef = useRef(null);
  const [activeTab, setActiveTab] = useState('controls');
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const isARInteraction = !!props.isARInteraction;

  useEffect(() => {
    if (isARInteraction && activeTab === 'ar') {
      setActiveTab('controls');
    }
  }, [isARInteraction, activeTab]);

  const [showDotTypeDropdown, setShowDotTypeDropdown] = useState(false);
  const [showQrCornerSquareTypeDropdown, setShowQrCornerSquareTypeDropdown] = useState(false);
  const [showQrCornerDotTypeDropdown, setShowQrCornerDotTypeDropdown] = useState(false);
  const [showBgTypeDropdown, setShowBgTypeDropdown] = useState(false);
  const [showQrBgTypeDropdown, setShowQrBgTypeDropdown] = useState(false);
  const [showQrColorPicker, setShowQrColorPicker] = useState(false);
  const [showQrBgColorPicker, setShowQrBgColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const [bgPickerPos, setBgPickerPos] = useState({ top: 0, left: 0 });
  const [qrColorPickerPos, setQrColorPickerPos] = useState({ top: 0, left: 0 });
  const [qrBgColorPickerPos, setQrBgColorPickerPos] = useState({ top: 0, left: 0 });
  const [dropdownDir, setDropdownDir] = useState({});

  const toggleDropdown = (e, key, isOpen, setIsOpen) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollParent = e.currentTarget.closest('.model3d-custom-scrollbar');
      const containerBottom = scrollParent ? scrollParent.getBoundingClientRect().bottom : window.innerHeight;
      const containerTop = scrollParent ? scrollParent.getBoundingClientRect().top : 0;
      const spaceBelow = containerBottom - rect.bottom;
      const spaceAbove = rect.top - containerTop;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      setDropdownDir((prev) => ({ ...prev, [key]: openUp ? 'up' : 'down' }));
    }
    setIsOpen(!isOpen);
  };

  const handleOpenPicker = (e, setPickerPos, setShowPicker, toggle = false, currentState = false) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pickerW = 270;
    const pickerH = 290;
    const openUp = window.innerHeight - rect.bottom < pickerH && rect.top > pickerH;
    const top = openUp
      ? Math.max(12, rect.top - pickerH - 8)
      : Math.min(window.innerHeight - pickerH - 12, rect.bottom + 8);
    const left = Math.max(12, Math.min(window.innerWidth - pickerW - 12, rect.left - 180));
    setPickerPos({ top, left });
    setShowPicker(toggle ? !currentState : true);
  };

  const renderPortalColorPicker = (isOpen, pos, onClosePicker, color, onChangeColor) => {
    if (!isOpen || typeof document === 'undefined') return null;
    return createPortal(
      <>
        <div className="fixed inset-0 z-[9998] cursor-default" onClick={onClosePicker} />
        <div
          className="fixed z-[9999]"
          style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <ColorPicker
            color={color}
            onChange={onChangeColor}
            hidePalette={true}
            onClose={onClosePicker}
          />
        </div>
      </>,
      document.body
    );
  };

  const applyTheme = (idx) => {
    setActiveThemeIdx(idx);
    const theme = qrThemes[idx];
    setQrColor(theme.fg);
    setQrBgColor(theme.bg);
    setQrBgType('Solid');
    setQrDotType(theme.dotType);
    setQrCornerSquareType(theme.cornerSquareType);
    setQrCornerDotType(theme.cornerDotType);
  };

  return (
    <div className={`w-full font-sans text-gray-800 relative ${props.embeddedInModal ? 'h-full flex flex-col min-h-0' : 'pb-[1.5vw]'}`}>
      <style>{`
        .model3d-range-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 0.25vw;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .model3d-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 0.95vw;
          height: 0.95vw;
          border-radius: 50%;
          background: #ffffff;
          border: 0.14vw solid #EC5137;
          box-shadow: 0 0.1vw 0.35vw rgba(236, 81, 55, 0.35);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .model3d-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.08);
          box-shadow: 0 0.15vw 0.5vw rgba(236, 81, 55, 0.5);
        }
        .model3d-custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .model3d-custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .model3d-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .model3d-custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .model3d-custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Action Buttons (hidden when embedded in unified modal) */}
      {!props.embeddedInModal && (
        <div className="sticky top-0 z-10 bg-[#fbfbfb] pt-[1.5vw] pb-[1vw] px-[1.5vw] flex gap-[0.75vw] border-b border-gray-100 shadow-sm">
          <button 
            className="flex-1 bg-[#EC5137] hover:bg-[#d8442c] text-white font-semibold h-[2.5vw] rounded-[0.5vw] flex items-center justify-center gap-[0.5vw] transition-colors shadow-sm cursor-pointer"
            onClick={onClose}
          >
            <Icon icon="lucide:check" className="text-[1vw]" />
            <span className="text-[0.85vw]">Save Changes</span>
          </button>
          <button 
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold h-[2.5vw] rounded-[0.5vw] border border-gray-300 flex items-center justify-center gap-[0.5vw] transition-colors shadow-sm cursor-pointer"
            onClick={onClose}
          >
            <Icon icon="lucide:x" className="text-[1vw]" />
            <span className="text-[0.85vw]">Close</span>
          </button>
        </div>
      )}

      {/* Top Pill Tabs */}
      <div className="shrink-0 z-10 bg-[#fbfbfb] px-[1.2vw] pt-[1vw] pb-[0.75vw] border-b border-gray-100">
        <div className="flex items-center justify-between gap-[0.35vw] bg-gray-100/80 p-[0.25vw] rounded-[0.65vw]">
          {[
            { id: 'controls', label: 'Controls' },
            { id: 'visuals', label: 'Visuals' },
            { id: 'model', label: 'Model' },
            ...(!isARInteraction ? [{ id: 'ar', label: 'AR View' }] : []),
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-[0.35vw] px-[0.45vw] rounded-[0.45vw] text-[0.74vw] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#EC5137] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`px-[1.2vw] space-y-[1.1vw] pt-[1vw] ${props.embeddedInModal ? 'flex-1 min-h-0 overflow-y-auto model3d-custom-scrollbar pb-[1.5vw]' : ''}`}>
        {activeTab === 'controls' && (
          <ControlsTab
            limitHorizontalRotation={limitHorizontalRotation}
            setLimitHorizontalRotation={setLimitHorizontalRotation}
            leftRotationLimit={leftRotationLimit}
            setLeftRotationLimit={setLeftRotationLimit}
            rightRotationLimit={rightRotationLimit}
            setRightRotationLimit={setRightRotationLimit}
            limitVerticalRotation={limitVerticalRotation}
            setLimitVerticalRotation={setLimitVerticalRotation}
            upperViewLimit={upperViewLimit}
            setUpperViewLimit={setUpperViewLimit}
            lowerViewLimit={lowerViewLimit}
            setLowerViewLimit={setLowerViewLimit}
            limitZoom={limitZoom}
            setLimitZoom={setLimitZoom}
            limitZoomIn={limitZoomIn}
            setLimitZoomIn={setLimitZoomIn}
            limitZoomOut={limitZoomOut}
            setLimitZoomOut={setLimitZoomOut}
            enablePan={enablePan}
            setEnablePan={setEnablePan}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            autoRotateSpeed={autoRotateSpeed}
            setAutoRotateSpeed={setAutoRotateSpeed}
          />
        )}

        {activeTab === 'visuals' && (
          <VisualsTab
            lightIntensity={lightIntensity}
            setLightIntensity={setLightIntensity}
            addShadow={addShadow}
            setAddShadow={setAddShadow}
            shadowStrength={shadowStrength}
            setShadowStrength={setShadowStrength}
            shadowSoftness={shadowSoftness}
            setShadowSoftness={setShadowSoftness}
            bgType={bgType}
            setBgType={setBgType}
            bgColor={bgColor}
            setBgColor={setBgColor}
            customBg={customBg}
            setCustomBg={setCustomBg}
            showBgTypeDropdown={showBgTypeDropdown}
            setShowBgTypeDropdown={setShowBgTypeDropdown}
            showBgColorPicker={showBgColorPicker}
            setShowBgColorPicker={setShowBgColorPicker}
            bgPickerPos={bgPickerPos}
            setBgPickerPos={setBgPickerPos}
            dropdownDir={dropdownDir}
            toggleDropdown={toggleDropdown}
            handleOpenPicker={handleOpenPicker}
            renderPortalColorPicker={renderPortalColorPicker}
          />
        )}

        {activeTab === 'model' && (
          <ModelTab
            initialRotation={initialRotation}
            setInitialRotation={setInitialRotation}
            modelScale={modelScale}
            setModelScale={setModelScale}
            arHorizontalSurface={arHorizontalSurface}
            setArHorizontalSurface={setArHorizontalSurface}
            arVerticalSurface={arVerticalSurface}
            setArVerticalSurface={setArVerticalSurface}
            topText={topText}
            setTopText={setTopText}
            bottomText={bottomText}
            setBottomText={setBottomText}
            localHotspots={localHotspots}
            activeHotspotId={activeHotspotId}
            onHotspotClick={onHotspotClick}
          />
        )}

        {activeTab === 'ar' && !isARInteraction && (
          <ARViewTab
            CustomQRCode={CustomQRCode}
            mainQrRef={mainQrRef}
            enableAR={enableAR}
            setEnableAR={setEnableAR}
            safeQrValue={safeQrValue}
            qrText={qrText}
            setQrText={setQrText}
            qrThemes={qrThemes}
            activeThemeIdx={activeThemeIdx}
            applyTheme={applyTheme}
            qrColor={qrColor}
            setQrColor={setQrColor}
            qrBgType={qrBgType}
            setQrBgType={setQrBgType}
            qrBgColor={qrBgColor}
            setQrBgColor={setQrBgColor}
            qrLevel={qrLevel}
            setQrLevel={setQrLevel}
            qrDotType={qrDotType}
            setQrDotType={setQrDotType}
            qrCornerSquareType={qrCornerSquareType}
            setQrCornerSquareType={setQrCornerSquareType}
            qrCornerDotType={qrCornerDotType}
            setQrCornerDotType={setQrCornerDotType}
            qrLogo={qrLogo}
            setQrLogo={setQrLogo}
            showQrColorPicker={showQrColorPicker}
            setShowQrColorPicker={setShowQrColorPicker}
            showQrBgColorPicker={showQrBgColorPicker}
            setShowQrBgColorPicker={setShowQrBgColorPicker}
            qrColorPickerPos={qrColorPickerPos}
            setQrColorPickerPos={setQrColorPickerPos}
            qrBgColorPickerPos={qrBgColorPickerPos}
            setQrBgColorPickerPos={setQrBgColorPickerPos}
            showQrBgTypeDropdown={showQrBgTypeDropdown}
            setShowQrBgTypeDropdown={setShowQrBgTypeDropdown}
            showDotTypeDropdown={showDotTypeDropdown}
            setShowDotTypeDropdown={setShowDotTypeDropdown}
            showQrCornerSquareTypeDropdown={showQrCornerSquareTypeDropdown}
            setShowQrCornerSquareTypeDropdown={setShowQrCornerSquareTypeDropdown}
            showQrCornerDotTypeDropdown={showQrCornerDotTypeDropdown}
            setShowQrCornerDotTypeDropdown={setShowQrCornerDotTypeDropdown}
            dropdownDir={dropdownDir}
            toggleDropdown={toggleDropdown}
            handleOpenPicker={handleOpenPicker}
            renderPortalColorPicker={renderPortalColorPicker}
          />
        )}
      </div>
    </div>
  );
};

export default Model3DEditor;
