import React, { useEffect, useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCodeStyling from 'qr-code-styling';
import ColorPicker from '../../../Color';
import axios from 'axios';

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

  const [bgPickerPos, setBgPickerPos] = useState('down');
  const [qrColorPickerPos, setQrColorPickerPos] = useState('down');
  const [qrBgColorPickerPos, setQrBgColorPickerPos] = useState('down');

  const handleOpenPicker = (e, setPickerPos, setShowPicker, toggle = false, currentState = false) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 320 && rect.top > 320) {
          setPickerPos('up');
      } else {
          setPickerPos('down');
      }
      setShowPicker(toggle ? !currentState : true);
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
        {/* ── TAB 3: MODEL (Model Transform + AR Placement + Text Overlays + 3D Hotspots) ── */}
        {activeTab === 'model' && (
          <div className="space-y-[1.1vw]">
            {/* Model Transform */}
            <div className="space-y-[0.75vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Model Transform</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
              </div>

              {/* Initial Rotation (Degrees) */}
              <div className="space-y-[0.4vw] pl-[0.2vw]">
                <span className="text-[0.76vw] font-medium text-gray-600 block">Initial Rotation (Degrees)</span>
                <div className="grid grid-cols-3 gap-[0.5vw]">
                  {['x', 'y', 'z'].map((axis) => (
                    <div
                      key={axis}
                      className="flex items-center justify-between bg-gray-100 rounded-[0.4vw] px-[0.55vw] h-[2vw] border border-transparent focus-within:border-[#EC5137] focus-within:bg-white transition-colors"
                    >
                      <span className="text-[0.74vw] font-semibold text-gray-800 uppercase">{axis}</span>
                      <input
                        type="number"
                        value={initialRotation?.[axis] ?? 0}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setInitialRotation({
                            x: initialRotation?.x ?? 0,
                            y: initialRotation?.y ?? 0,
                            z: initialRotation?.z ?? 0,
                            [axis]: val,
                          });
                        }}
                        className="w-[2.6vw] text-right bg-transparent outline-none text-[0.74vw] font-medium text-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Scale */}
              <div className="space-y-[0.3vw] pl-[0.2vw]">
                <span className="text-[0.76vw] font-medium text-gray-600 block">Model Scale</span>
                <div className="flex items-center gap-[0.6vw]">
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={modelScale}
                    onChange={(e) => setModelScale(parseFloat(e.target.value))}
                    className="model3d-range-slider flex-1"
                    style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${((Number(modelScale) - 0.2) / 2.8) * 100}%, #E5E7EB ${((Number(modelScale) - 0.2) / 2.8) * 100}%, #E5E7EB 100%)` }}
                  />
                  <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                    {Number(modelScale).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

            {/* AR Placement */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">AR Placement</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
              </div>

              <div className="space-y-[0.55vw] pl-[0.2vw]">
                <label
                  className="flex items-center gap-[0.55vw] cursor-pointer select-none"
                  onClick={() => setArHorizontalSurface(!arHorizontalSurface)}
                >
                  <span className={`w-[1vw] h-[1vw] rounded-[0.22vw] flex items-center justify-center border transition-colors ${arHorizontalSurface ? 'bg-[#EC5137] border-[#EC5137] text-white' : 'bg-white border-gray-300'}`}>
                    {arHorizontalSurface && <Check size="0.7vw" strokeWidth={3} />}
                  </span>
                  <span className="text-[0.76vw] font-medium text-gray-600">Horizontal Surface</span>
                </label>

                <label
                  className="flex items-center gap-[0.55vw] cursor-pointer select-none"
                  onClick={() => setArVerticalSurface(!arVerticalSurface)}
                >
                  <span className={`w-[1vw] h-[1vw] rounded-[0.22vw] flex items-center justify-center border transition-colors ${arVerticalSurface ? 'bg-[#EC5137] border-[#EC5137] text-white' : 'bg-white border-gray-300'}`}>
                    {arVerticalSurface && <Check size="0.7vw" strokeWidth={3} />}
                  </span>
                  <span className="text-[0.76vw] font-medium text-gray-600">Vertical Surface</span>
                </label>
              </div>
            </div>

            {/* Text Customization */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Text Overlays</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
              </div>

              <div className="flex flex-col gap-[0.65vw] pl-[0.2vw]">
                <div className="flex items-center gap-[0.75vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 w-[5.5vw] whitespace-nowrap flex justify-between">Pop up Text<span>:</span></span>
                  <div className="flex-1 h-[2vw] border border-gray-300 focus-within:border-[#EC5137] bg-white rounded-[0.4vw] flex items-center px-[0.6vw] gap-[0.4vw] transition-colors">
                    <input
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.76vw] text-gray-800"
                    />
                    <Icon icon="lucide:pencil" className="text-gray-400 w-[0.8vw] h-[0.8vw]" />
                  </div>
                </div>
                <div className="flex items-center gap-[0.75vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 w-[5.5vw] whitespace-nowrap flex justify-between">Modal Name<span>:</span></span>
                  <div className="flex-1 h-[2vw] border border-gray-300 focus-within:border-[#EC5137] bg-white rounded-[0.4vw] flex items-center px-[0.6vw] gap-[0.4vw] transition-colors">
                    <input
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.76vw] text-gray-800"
                    />
                    <Icon icon="lucide:pencil" className="text-gray-400 w-[0.8vw] h-[0.8vw]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Hotspots Section */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">3D Hotspots</span>
                {localHotspots && localHotspots.length > 0 && (
                  <span className="bg-orange-50 text-[#EC5137] border border-[#EC5137]/30 text-[0.68vw] font-bold px-[0.45vw] py-[0.05vw] rounded-full">
                    {localHotspots.length}
                  </span>
                )}
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
              </div>

              {(!localHotspots || localHotspots.length === 0) ? (
                <div className="py-[0.5vw] pl-[0.2vw]">
                  <span className="text-[0.74vw] text-gray-400 font-medium">No hotspots configured for this model</span>
                </div>
              ) : (
                <div className="flex flex-col gap-[0.45vw] max-h-[16vw] overflow-y-auto no-scrollbar pl-[0.2vw]">
                  {localHotspots.map((hs, i) => {
                    const isSelected = activeHotspotId != null && (
                      String(activeHotspotId) === String(hs.id) ||
                      String(activeHotspotId) === String(hs.id || `hs_${i}`) ||
                      activeHotspotId === i
                    );
                    return (
                      <div
                        key={hs.id || i}
                        onClick={() => typeof onHotspotClick === 'function' && onHotspotClick(hs, i)}
                        className={`flex items-center justify-between p-[0.55vw] rounded-[0.45vw] border bg-white transition-all cursor-pointer ${
                          isSelected ? 'border-[#EC5137] ring-1 ring-[#EC5137]/40 bg-orange-50/20' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Click to view hotspot on 3D model"
                      >
                        <div className="flex items-center gap-[0.6vw] min-w-0">
                          <div
                            className="w-[1.4vw] h-[1.4vw] rounded-full flex items-center justify-center text-white text-[0.7vw] font-bold shrink-0"
                            style={{ backgroundColor: hs.color || '#EC5137' }}
                          >
                            {i + 1}
                          </div>
                          <span className="text-[0.76vw] font-semibold text-gray-800 truncate">
                            {hs.label || `Hotspot ${i + 1}`}
                          </span>
                        </div>
                        {hs.description && (
                          <span className="text-[0.7vw] text-gray-400 truncate max-w-[8vw] shrink-0 ml-[0.5vw]">
                            {hs.description}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: VISUALS (Lighting + Add Shadow + Background Color) ── */}
        {activeTab === 'visuals' && (
          <div className="space-y-[1.1vw]">
            {/* Lighting */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Lighting</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
              </div>

              <div className="space-y-[0.3vw] pl-[0.2vw]">
                <span className="text-[0.76vw] font-medium text-gray-600 block">Light Intensity</span>
                <div className="flex items-center gap-[0.6vw]">
                  <input
                    type="range" min="0" max="2" step="0.1"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                    className="model3d-range-slider flex-1"
                    style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(Number(lightIntensity) / 2) * 100}%, #E5E7EB ${(Number(lightIntensity) / 2) * 100}%, #E5E7EB 100%)` }}
                  />
                  <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                    {Number(lightIntensity).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Shadow */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Add Shadow</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
                <div
                  className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${addShadow ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                  onClick={() => setAddShadow(!addShadow)}
                >
                  <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${addShadow ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${addShadow ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
                <div className="space-y-[0.3vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 block">Shadow Opacity</span>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range" min="0" max="100"
                      value={shadowStrength} onChange={(e) => setShadowStrength(e.target.value)}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${shadowStrength}%, #E5E7EB ${shadowStrength}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {shadowStrength}%
                    </span>
                  </div>
                </div>

                <div className="space-y-[0.3vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 block">Shadow Softness</span>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range" min="0" max="100"
                      value={shadowSoftness} onChange={(e) => setShadowSoftness(e.target.value)}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${shadowSoftness}%, #E5E7EB ${shadowSoftness}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {shadowSoftness}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Color Group */}
            <div className="space-y-[0.75vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Background Color</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
              </div>

              <div className="flex flex-col pl-[0.2vw]">
                <div className="flex items-center gap-[0.8vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 w-[4vw] flex justify-between">Type <span>:</span></span>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setShowBgTypeDropdown(!showBgTypeDropdown)}
                      className="w-full bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] py-[0.35vw] text-[0.75vw] font-semibold text-gray-700 outline-none flex items-center justify-between cursor-pointer hover:border-gray-400 transition-all"
                    >
                      <span>{bgType}</span>
                      <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform duration-200 ${showBgTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showBgTypeDropdown && (
                      <>
                        <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowBgTypeDropdown(false)} />
                        <div className="absolute top-[calc(100%+0.2vw)] left-0 w-full bg-white border border-gray-100 rounded-[0.5vw] shadow-xl z-[60] py-[0.3vw]">
                          {['Solid', 'Transparent'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setBgType(type);
                                setShowBgTypeDropdown(false);
                              }}
                              className={`w-full text-left px-[0.6vw] py-[0.4vw] text-[0.72vw] font-semibold transition-all hover:bg-gray-50 flex items-center justify-between cursor-pointer ${bgType === type ? 'text-[#EC5137]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              {type}
                              {bgType === type && <Check size="0.7vw" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {bgType === 'Solid' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: '0.75vw' }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-[0.8vw] relative"
                    >
                      <span className="text-[0.76vw] font-medium text-gray-600 w-[4vw] flex justify-between">Color <span>:</span></span>
                      <div className="flex items-center gap-[0.5vw] flex-1">
                        <button
                          onClick={(e) => handleOpenPicker(e, setBgPickerPos, setShowBgColorPicker, true, showBgColorPicker)}
                          className="w-[2vw] h-[2vw] rounded-[0.45vw] border border-gray-300 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer"
                          style={{ backgroundColor: bgColor }}
                        />
                        {showBgColorPicker && (
                          <>
                            <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowBgColorPicker(false)} />
                            <div className={`absolute right-0 z-[60] ${bgPickerPos === 'up' ? 'bottom-[calc(100%+0.5vw)]' : 'top-[calc(100%+0.5vw)]'}`}>
                              <ColorPicker
                                color={bgColor}
                                onChange={(color) => setBgColor(color)}
                                hidePalette={true}
                                onClose={() => setShowBgColorPicker(false)}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex-1 border border-gray-300 rounded-[0.45vw] h-[2vw] bg-white flex items-center justify-between px-[0.65vw]">
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            onClick={(e) => handleOpenPicker(e, setBgPickerPos, setShowBgColorPicker)}
                            className="w-full text-[0.78vw] text-gray-700 font-medium uppercase outline-none bg-transparent cursor-pointer"
                          />
                          <span className="text-[0.75vw] text-gray-400">100%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Custom Background */}
            <div className="flex items-center gap-[0.6vw]">
              <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Custom Background</span>
              <div className="h-[0.08vw] bg-gray-200 flex-1" />
              <div
                className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${customBg ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                onClick={() => setCustomBg(!customBg)}
              >
                <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${customBg ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 1: CONTROLS ── */}
        {activeTab === 'controls' && (
          <div className="space-y-[1.1vw]">
            {/* Limit Horizontal Rotation */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Limit Horizontal Rotation</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
                <div
                  className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${limitHorizontalRotation ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                  onClick={() => setLimitHorizontalRotation(!limitHorizontalRotation)}
                >
                  <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${limitHorizontalRotation ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${limitHorizontalRotation ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
                {/* Left Rotation Limit */}
                <div className="space-y-[0.3vw]">
                  <div className="flex items-center gap-[0.4vw]">
                    <Icon icon="lucide:rotate-ccw" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                    <span className="text-[0.76vw] font-medium text-gray-600">Left Rotation Limit</span>
                  </div>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={leftRotationLimit}
                      onChange={(e) => setLeftRotationLimit(Number(e.target.value))}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(leftRotationLimit / 180) * 100}%, #E5E7EB ${(leftRotationLimit / 180) * 100}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {leftRotationLimit}°
                    </span>
                  </div>
                </div>

                {/* Right Rotation Limit */}
                <div className="space-y-[0.3vw]">
                  <div className="flex items-center gap-[0.4vw]">
                    <Icon icon="lucide:rotate-cw" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                    <span className="text-[0.76vw] font-medium text-gray-600">Right Rotation Limit</span>
                  </div>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={rightRotationLimit}
                      onChange={(e) => setRightRotationLimit(Number(e.target.value))}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(rightRotationLimit / 180) * 100}%, #E5E7EB ${(rightRotationLimit / 180) * 100}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {rightRotationLimit}°
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limit Vertical Rotation */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Limit Vertical Rotation</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
                <div
                  className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${limitVerticalRotation ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                  onClick={() => setLimitVerticalRotation(!limitVerticalRotation)}
                >
                  <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${limitVerticalRotation ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${limitVerticalRotation ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
                {/* Upper View Limit */}
                <div className="space-y-[0.3vw]">
                  <div className="flex items-center gap-[0.4vw]">
                    <Icon icon="lucide:arrow-up-circle" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                    <span className="text-[0.76vw] font-medium text-gray-600">Upper View Limit</span>
                  </div>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={upperViewLimit}
                      onChange={(e) => setUpperViewLimit(Number(e.target.value))}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(upperViewLimit / 180) * 100}%, #E5E7EB ${(upperViewLimit / 180) * 100}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {upperViewLimit}°
                    </span>
                  </div>
                </div>

                {/* Lower View Limit */}
                <div className="space-y-[0.3vw]">
                  <div className="flex items-center gap-[0.4vw]">
                    <Icon icon="lucide:arrow-down-circle" className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                    <span className="text-[0.76vw] font-medium text-gray-600">Lower View Limit</span>
                  </div>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={lowerViewLimit}
                      onChange={(e) => setLowerViewLimit(Number(e.target.value))}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(lowerViewLimit / 180) * 100}%, #E5E7EB ${(lowerViewLimit / 180) * 100}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {lowerViewLimit}°
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limit Zoom */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Limit Zoom</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
                <div
                  className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${limitZoom ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                  onClick={() => setLimitZoom(!limitZoom)}
                >
                  <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${limitZoom ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className={`space-y-[0.75vw] pl-[0.2vw] transition-opacity ${limitZoom ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
                {/* Limit Zoom In */}
                <div className="space-y-[0.3vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 block">Limit Zoom In</span>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={limitZoomIn}
                      onChange={(e) => setLimitZoomIn(Number(e.target.value))}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${limitZoomIn}%, #E5E7EB ${limitZoomIn}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {limitZoomIn}%
                    </span>
                  </div>
                </div>

                {/* Limit Zoom Out */}
                <div className="space-y-[0.3vw]">
                  <span className="text-[0.76vw] font-medium text-gray-600 block">Limit Zoom Out</span>
                  <div className="flex items-center gap-[0.6vw]">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={limitZoomOut}
                      onChange={(e) => setLimitZoomOut(Number(e.target.value))}
                      className="model3d-range-slider flex-1"
                      style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${limitZoomOut}%, #E5E7EB ${limitZoomOut}%, #E5E7EB 100%)` }}
                    />
                    <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                      {limitZoomOut}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pan / Move */}
            <div className="flex items-center gap-[0.6vw]">
              <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Pan / Move</span>
              <div className="h-[0.08vw] bg-gray-200 flex-1" />
              <div
                className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${enablePan ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                onClick={() => setEnablePan(!enablePan)}
              >
                <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${enablePan ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Auto Rotate */}
            <div className="space-y-[0.65vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Auto Rotate</span>
                <div className="h-[0.08vw] bg-gray-200 flex-1" />
                <div
                  className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${autoRotate ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                  onClick={() => setAutoRotate(!autoRotate)}
                >
                  <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${autoRotate ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
                </div>
              </div>
              <div className={`space-y-[0.3vw] pl-[0.2vw] transition-opacity ${autoRotate ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
                <span className="text-[0.76vw] font-medium text-gray-600 block">Rotation Speed</span>
                <div className="flex items-center gap-[0.6vw]">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={autoRotateSpeed}
                    onChange={(e) => setAutoRotateSpeed(parseFloat(e.target.value))}
                    className="model3d-range-slider flex-1"
                    style={{ background: `linear-gradient(to right, #EC5137 0%, #EC5137 ${(autoRotateSpeed / 5) * 100}%, #E5E7EB ${(autoRotateSpeed / 5) * 100}%, #E5E7EB 100%)` }}
                  />
                  <span className="w-[3.1vw] py-[0.15vw] text-center text-[0.74vw] font-medium text-gray-700 border border-gray-200 rounded-[0.3vw] bg-white shrink-0">
                    {Number(autoRotateSpeed).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: AR VIEW ── */}
        {activeTab === 'ar' && (
          <div className="space-y-[1.2vw]">
            {/* Enable AR View */}
            <div className="space-y-[0.35vw]">
              <div className="flex items-center gap-[0.6vw]">
                <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Enable AR View</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
                <div
                  className={`w-[2.4vw] h-[1.25vw] rounded-full p-[0.12vw] cursor-pointer transition-colors relative flex items-center shrink-0 ${enableAR ? 'bg-[#EC5137]' : 'bg-gray-300'}`}
                  onClick={() => setEnableAR(!enableAR)}
                >
                  <div className={`w-[1vw] h-[1vw] bg-white rounded-full shadow-xs transform transition-transform ${enableAR ? 'translate-x-[1.15vw]' : 'translate-x-0'}`} />
                </div>
              </div>
              <span className="text-[0.72vw] text-gray-400 font-medium block">Allow user to view this model in AR</span>
            </div>

            <AnimatePresence>
              {enableAR && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="space-y-[1.2vw]"
                >
                  {/* QR Preview & Download (ImageProperties Thumbnail Card style) */}
                  <div className="flex items-center gap-[0.8vw] p-[0.7vw] bg-white rounded-[0.55vw] border border-gray-200 shadow-2xs">
                    <div
                      className="w-[5.2vw] h-[5.2vw] rounded-[0.45vw] overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center p-[0.35vw]"
                      style={{ backgroundColor: qrBgType === 'Solid' ? qrBgColor : '#f9fafb' }}
                    >
                      <CustomQRCode
                        ref={mainQrRef}
                        value={enableAR ? safeQrValue : qrText}
                        size={1024}
                        margin={4}
                        fgColor={qrColor}
                        bgColor={qrBgType === 'Solid' ? qrBgColor : 'transparent'}
                        dotType={qrDotType}
                        cornerSquareType={qrCornerSquareType}
                        cornerDotType={qrCornerDotType}
                        level={qrLevel || 'L'}
                        logo={qrLogo}
                      />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 justify-between gap-[0.55vw]">
                      <div className="flex flex-col gap-[0.15vw]">
                        <span className="text-[0.8vw] font-semibold text-gray-900 truncate">AR QR Code</span>
                        <span className="text-[0.72vw] text-gray-500 font-medium truncate">Scan to open in AR</span>
                      </div>

                      <div className="flex items-center gap-[0.4vw]">
                        <button
                          type="button"
                          onClick={() => mainQrRef.current?.download({ name: 'ar-qr-code', extension: 'png' })}
                          className="flex-1 h-[1.85vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.72vw] font-medium rounded-[0.4vw] border border-gray-300 shadow-2xs hover:border-gray-400 flex items-center justify-center gap-[0.25vw] cursor-pointer transition-colors"
                          title="Download QR Code as PNG"
                        >
                          <Icon icon="lucide:download" className="w-[0.78vw] h-[0.78vw]" />
                          <span>PNG</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => mainQrRef.current?.download({ name: 'ar-qr-code', extension: 'svg' })}
                          className="flex-1 h-[1.85vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.72vw] font-medium rounded-[0.4vw] border border-gray-300 shadow-2xs hover:border-gray-400 flex items-center justify-center gap-[0.25vw] cursor-pointer transition-colors"
                          title="Download QR Code as SVG"
                        >
                          <Icon icon="lucide:download" className="w-[0.78vw] h-[0.78vw]" />
                          <span>SVG</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Themes */}
                  <div className="space-y-[0.65vw]">
                    <div className="flex items-center gap-[0.6vw]">
                      <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">QR Themes</span>
                      <div className="flex-1 h-[1px] bg-gray-200" />
                    </div>

                    <div className="flex items-center justify-between gap-[0.4vw]">
                      {qrThemes.map((theme, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyTheme(idx)}
                          title={theme.name}
                          className={`w-[2.7vw] h-[2.7vw] border rounded-[0.45vw] flex items-center justify-center bg-white cursor-pointer transition-all shadow-2xs ${activeThemeIdx === idx ? 'border-[#EC5137] ring-1 ring-[#EC5137]/30 bg-orange-50/40' : 'border-gray-200 hover:border-gray-400'}`}
                        >
                          <div className="w-[1.8vw] h-[1.8vw] pointer-events-none">
                            <CustomQRCode
                              value="theme"
                              size={1024}
                              margin={0}
                              fgColor={theme.fg}
                              bgColor={theme.bg}
                              dotType={theme.dotType}
                              cornerSquareType={theme.cornerSquareType}
                              cornerDotType={theme.cornerDotType}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR Properties */}
                  <div className="space-y-[0.75vw]">
                    <div className="flex items-center gap-[0.6vw]">
                      <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">QR Properties</span>
                      <div className="flex-1 h-[1px] bg-gray-200" />
                    </div>

                    {/* QR Text */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">QR Text</span>
                      <div className="w-[10.8vw] h-[2vw] px-[0.6vw] bg-white border border-gray-300 focus-within:border-[#EC5137] rounded-[0.4vw] shadow-2xs flex items-center gap-[0.35vw] transition-colors">
                        <input
                          type="text"
                          placeholder="Scan Me"
                          value={qrText}
                          onChange={(e) => setQrText(e.target.value)}
                          className="flex-1 min-w-0 outline-none text-[0.76vw] text-gray-700 bg-transparent font-medium"
                        />
                        <Icon icon="lucide:pencil" className="text-gray-400 w-[0.8vw] h-[0.8vw] shrink-0" />
                      </div>
                    </div>

                    {/* QR Color */}
                    <div className="flex items-center justify-between gap-[0.6vw] relative">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">QR Color</span>
                      <div className="w-[10.8vw] flex items-center gap-[0.4vw]">
                        <button
                          type="button"
                          onClick={(e) => {
                            handleOpenPicker(e, setQrColorPickerPos, setShowQrColorPicker, true, showQrColorPicker);
                            setShowQrBgColorPicker(false);
                          }}
                          className="w-[2vw] h-[2vw] rounded-[0.4vw] overflow-hidden shrink-0 border border-gray-300 shadow-2xs cursor-pointer"
                          style={{ backgroundColor: qrColor }}
                        />
                        {showQrColorPicker && (
                          <>
                            <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrColorPicker(false)} />
                            <div className={`absolute right-0 z-[60] ${qrColorPickerPos === 'up' ? 'bottom-[calc(100%+0.4vw)]' : 'top-[calc(100%+0.4vw)]'}`}>
                              <ColorPicker
                                color={qrColor}
                                onChange={(color) => setQrColor(color)}
                                hidePalette={true}
                                onClose={() => setShowQrColorPicker(false)}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex-1 h-[2vw] border border-gray-300 rounded-[0.4vw] bg-white shadow-2xs flex items-center justify-between px-[0.55vw]">
                          <input
                            type="text"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            onClick={(e) => {
                              handleOpenPicker(e, setQrColorPickerPos, setShowQrColorPicker);
                              setShowQrBgColorPicker(false);
                            }}
                            className="w-full text-[0.74vw] text-gray-700 font-medium uppercase outline-none bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Background Type */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Background</span>
                      <div className="w-[10.8vw] relative">
                        <button
                          type="button"
                          onClick={() => setShowQrBgTypeDropdown(!showQrBgTypeDropdown)}
                          className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          <span>{qrBgType}</span>
                          <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showQrBgTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showQrBgTypeDropdown && (
                          <>
                            <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrBgTypeDropdown(false)} />
                            <div className="absolute right-0 top-full mt-[0.3vw] w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw]">
                              {['Solid', 'Transparent'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setQrBgType(type);
                                    setShowQrBgTypeDropdown(false);
                                  }}
                                  className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrBgType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                                >
                                  {type}
                                  {qrBgType === type && <Check size="0.7vw" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* BG Color */}
                    <AnimatePresence>
                      {qrBgType === 'Solid' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between gap-[0.6vw] relative overflow-visible"
                        >
                          <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">BG Color</span>
                          <div className="w-[10.8vw] flex items-center gap-[0.4vw]">
                            <button
                              type="button"
                              onClick={(e) => {
                                handleOpenPicker(e, setQrBgColorPickerPos, setShowQrBgColorPicker, true, showQrBgColorPicker);
                                setShowQrColorPicker(false);
                              }}
                              className="w-[2vw] h-[2vw] rounded-[0.4vw] overflow-hidden shrink-0 border border-gray-300 shadow-2xs cursor-pointer"
                              style={{ backgroundColor: qrBgColor === 'transparent' ? '#ffffff' : qrBgColor }}
                            />
                            {showQrBgColorPicker && (
                              <>
                                <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrBgColorPicker(false)} />
                                <div className={`absolute right-0 z-[60] ${qrBgColorPickerPos === 'up' ? 'bottom-[calc(100%+0.4vw)]' : 'top-[calc(100%+0.4vw)]'}`}>
                                  <ColorPicker
                                    color={qrBgColor}
                                    onChange={(color) => setQrBgColor(color)}
                                    hidePalette={true}
                                    onClose={() => setShowQrBgColorPicker(false)}
                                  />
                                </div>
                              </>
                            )}
                            <div className="flex-1 h-[2vw] border border-gray-300 rounded-[0.4vw] bg-white shadow-2xs flex items-center justify-between px-[0.55vw]">
                              <input
                                type="text"
                                value={qrBgColor}
                                onChange={(e) => setQrBgColor(e.target.value)}
                                onClick={(e) => {
                                  handleOpenPicker(e, setQrBgColorPickerPos, setShowQrBgColorPicker);
                                  setShowQrColorPicker(false);
                                }}
                                className="w-full text-[0.74vw] text-gray-700 font-medium uppercase outline-none bg-transparent cursor-pointer"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* QR Level */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">QR Level</span>
                      <div className="w-[10.8vw] flex items-center bg-gray-100/80 border border-gray-200 rounded-[0.4vw] p-[0.18vw] gap-[0.18vw]">
                        {[
                          { label: 'Low', value: 'L' },
                          { label: 'Med', value: 'M' },
                          { label: 'High', value: 'H' }
                        ].map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setQrLevel(level.value)}
                            className={`flex-1 py-[0.22vw] rounded-[0.3vw] text-[0.72vw] cursor-pointer font-semibold transition-all ${qrLevel === level.value ? 'bg-[#EC5137] text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dot Style */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Dot Style</span>
                      <div className="w-[10.8vw] relative">
                        <button
                          type="button"
                          onClick={() => setShowDotTypeDropdown(!showDotTypeDropdown)}
                          className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          <span className="capitalize truncate">{qrDotType.replace('-', ' ')}</span>
                          <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showDotTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showDotTypeDropdown && (
                          <>
                            <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowDotTypeDropdown(false)} />
                            <div className="absolute right-0 top-full mt-[0.3vw] w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw] max-h-[11vw] overflow-y-auto model3d-custom-scrollbar">
                              {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setQrDotType(type);
                                    setShowDotTypeDropdown(false);
                                  }}
                                  className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium capitalize transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrDotType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                                >
                                  {type.replace('-', ' ')}
                                  {qrDotType === type && <Check size="0.7vw" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Eye Frame */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Eye Frame</span>
                      <div className="w-[10.8vw] relative">
                        <button
                          type="button"
                          onClick={() => setShowQrCornerSquareTypeDropdown(!showQrCornerSquareTypeDropdown)}
                          className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          <span className="capitalize truncate">{qrCornerSquareType.replace('-', ' ')}</span>
                          <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showQrCornerSquareTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showQrCornerSquareTypeDropdown && (
                          <>
                            <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrCornerSquareTypeDropdown(false)} />
                            <div className="absolute right-0 top-full mt-[0.3vw] w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw]">
                              {['square', 'dot', 'extra-rounded'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setQrCornerSquareType(type);
                                    setShowQrCornerSquareTypeDropdown(false);
                                  }}
                                  className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium capitalize transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrCornerSquareType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                                >
                                  {type.replace('-', ' ')}
                                  {qrCornerSquareType === type && <Check size="0.7vw" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Eye Ball */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Eye Ball</span>
                      <div className="w-[10.8vw] relative">
                        <button
                          type="button"
                          onClick={() => setShowQrCornerDotTypeDropdown(!showQrCornerDotTypeDropdown)}
                          className="w-full h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] px-[0.6vw] text-[0.75vw] font-medium text-gray-700 outline-none flex items-center justify-between shadow-2xs cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          <span className="capitalize truncate">{qrCornerDotType.replace('-', ' ')}</span>
                          <ChevronDown size="0.8vw" className={`text-gray-400 transition-transform ${showQrCornerDotTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showQrCornerDotTypeDropdown && (
                          <>
                            <div className="fixed inset-0 z-[55] cursor-default" onClick={() => setShowQrCornerDotTypeDropdown(false)} />
                            <div className="absolute right-0 top-full mt-[0.3vw] w-full bg-white border border-gray-100 rounded-[0.45vw] shadow-2xl z-[60] py-[0.25vw]">
                              {['square', 'dot'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setQrCornerDotType(type);
                                    setShowQrCornerDotTypeDropdown(false);
                                  }}
                                  className={`w-full text-left px-[0.65vw] py-[0.35vw] text-[0.74vw] font-medium capitalize transition-colors hover:bg-gray-50 flex items-center justify-between cursor-pointer ${qrCornerDotType === type ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700'}`}
                                >
                                  {type.replace('-', ' ')}
                                  {qrCornerDotType === type && <Check size="0.7vw" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Add Logo */}
                    <div className="flex items-center justify-between gap-[0.6vw]">
                      <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">Add Logo</span>
                      <div className="w-[10.8vw]">
                        <label className="w-full h-[2.4vw] border border-dashed border-gray-300 rounded-[0.4vw] flex items-center justify-center gap-[0.35vw] bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer group relative overflow-hidden shadow-2xs">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setQrLogo(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {qrLogo ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white p-[0.2vw]">
                              <img
                                src={qrLogo}
                                alt="QR Logo"
                                className="h-full object-contain"
                              />
                              <div
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setQrLogo(null);
                                }}
                              >
                                <Icon icon="lucide:trash-2" className="text-white w-[1vw] h-[1vw]" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <Icon icon="lucide:upload-cloud" className="w-[0.95vw] h-[0.95vw] text-gray-400 group-hover:text-[#EC5137] transition-colors" />
                              <span className="text-[0.72vw] font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Upload Logo</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Model3DEditor;
