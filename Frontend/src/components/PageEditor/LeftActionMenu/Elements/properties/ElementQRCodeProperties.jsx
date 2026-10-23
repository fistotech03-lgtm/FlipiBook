/**
 * ElementQRCodeProperties.jsx
 * Dedicated Property Inspector for QR Code Elements in FlipiBook
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Link,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  Type,
  Check
} from 'lucide-react';
import { QR_FRAMES, renderQRWithFrame } from '../utils/qrCodeElementUtils';
import { FrameVectorThumbnail } from '../categories/qrCodeCatalog';

export default function ElementQRCodeProperties({
  selectedElement,
  updateElementAttribute,
  activePageIndex,
  selectedLayerId,
  onUpdate
}) {
  const [url, setUrl] = useState('https://example.com');
  const [frame, setFrame] = useState('frame-bottom-bar');
  const [text, setText] = useState('SCAN ME');
  const [logoSrc, setLogoSrc] = useState('');
  const [logoSize, setLogoSize] = useState(22);
  const [logoBg, setLogoBg] = useState(true);
  const [isRendering, setIsRendering] = useState(false);

  const fileInputRef = useRef(null);
  const urlDebounceRef = useRef(null);
  const textDebounceRef = useRef(null);
  const lastSelectedIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
    };
  }, []);

  // Sync state from selectedElement attributes on mount or selection change
  useEffect(() => {
    if (!selectedElement) return;

    const currentId = selectedElement.id || selectedLayerId;
    if (lastSelectedIdRef.current !== currentId) {
      lastSelectedIdRef.current = currentId;

      const elUrl = selectedElement.getAttribute('data-qr-url') || 'https://example.com';
      const elFrame = selectedElement.getAttribute('data-qr-frame') || 'frame-bottom-bar';
      const elText = selectedElement.getAttribute('data-qr-text') || 'SCAN ME';
      const elLogo = selectedElement.getAttribute('data-qr-logo') || '';
      const elLogoSize = parseInt(selectedElement.getAttribute('data-qr-logo-size') || '22', 10);
      const elLogoBg = selectedElement.getAttribute('data-qr-logo-bg') !== 'false';

      setUrl(elUrl);
      setFrame(elFrame);
      setText(elText);
      setLogoSrc(elLogo);
      setLogoSize(isNaN(elLogoSize) ? 22 : elLogoSize);
      setLogoBg(elLogoBg);
    }
  }, [selectedElement, selectedLayerId]);

  // Re-render composite QR image on canvas
  const triggerCanvasUpdate = async (overrides = {}) => {
    if (!selectedElement) return;

    const nextUrl = overrides.url !== undefined ? overrides.url : url;
    const nextFrame = overrides.frame !== undefined ? overrides.frame : frame;
    const nextText = overrides.text !== undefined ? overrides.text : text;
    const nextLogo = overrides.logoSrc !== undefined ? overrides.logoSrc : logoSrc;
    const nextLogoSize = overrides.logoSize !== undefined ? overrides.logoSize : logoSize;
    const nextLogoBg = overrides.logoBg !== undefined ? overrides.logoBg : logoBg;

    setIsRendering(true);

    try {
      const rendered = await renderQRWithFrame({
        url: nextUrl,
        frame: nextFrame,
        text: nextText,
        logoSrc: nextLogo || null,
        logoSize: nextLogoSize,
        logoBg: nextLogoBg
      });

      if (rendered?.dataUrl) {
        const image = selectedElement.querySelector('image');
        const rect = selectedElement.querySelector('rect');

        const currentW = parseFloat(image?.getAttribute('width') || '120');
        const frameObj = QR_FRAMES.find((f) => f.id === nextFrame) || QR_FRAMES[0];
        const nextH = Math.round(currentW * (frameObj.ratio || 1));

        if (image) {
          image.setAttribute('href', rendered.dataUrl);
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', rendered.dataUrl);
          image.setAttribute('height', String(nextH));
        }

        if (rect) {
          rect.setAttribute('height', String(nextH));
        }

        selectedElement.setAttribute('data-qr-url', nextUrl);
        selectedElement.setAttribute('data-qr-frame', nextFrame);
        selectedElement.setAttribute('data-qr-text', nextText);
        selectedElement.setAttribute('data-qr-logo', nextLogo || '');
        selectedElement.setAttribute('data-qr-logo-size', String(nextLogoSize));
        selectedElement.setAttribute('data-qr-logo-bg', String(nextLogoBg));

        const svgRoot = selectedElement.ownerSVGElement || selectedElement.closest('svg');
        if (svgRoot && updateElementAttribute && selectedLayerId) {
          const serializer = new XMLSerializer();
          const fullSvg = serializer.serializeToString(svgRoot);
          updateElementAttribute(activePageIndex, selectedLayerId, '__dom_sync__', fullSvg);
        }
        if (typeof onUpdate === 'function') {
          onUpdate();
        }
      }
    } catch (err) {
      console.error('[QR] Failed to re-render frame:', err);
    } finally {
      setIsRendering(false);
    }
  };

  const handleUrlChange = (val) => {
    setUrl(val);
    if (urlDebounceRef.current) {
      clearTimeout(urlDebounceRef.current);
    }
    urlDebounceRef.current = setTimeout(() => {
      triggerCanvasUpdate({ url: val });
    }, 500);
  };

  const handleUrlBlur = () => {
    if (urlDebounceRef.current) {
      clearTimeout(urlDebounceRef.current);
      triggerCanvasUpdate({ url });
    }
  };

  const handleFrameChange = (frameId) => {
    setFrame(frameId);
    triggerCanvasUpdate({ frame: frameId, frameId });
  };

  const handleTextChange = (val) => {
    setText(val);
    if (textDebounceRef.current) {
      clearTimeout(textDebounceRef.current);
    }
    textDebounceRef.current = setTimeout(() => {
      triggerCanvasUpdate({ text: val });
    }, 400);
  };

  const handleTextBlur = () => {
    if (textDebounceRef.current) {
      clearTimeout(textDebounceRef.current);
      triggerCanvasUpdate({ text });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setLogoSrc(result);
        triggerCanvasUpdate({ logoSrc: result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLogoSrc('');
    triggerCanvasUpdate({ logoSrc: '' });
  };

  const handleLogoSizeChange = (val) => {
    const num = parseInt(val, 10);
    setLogoSize(num);
    triggerCanvasUpdate({ logoSize: num });
  };

  const handleLogoBgToggle = (val) => {
    setLogoBg(val);
    triggerCanvasUpdate({ logoBg: val });
  };

  return (
    <div className="flex flex-col gap-[0.8vw] p-[0.6vw] text-gray-700 custom-scrollbar text-[0.72vw]">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-[0.4vw] border-b border-gray-100">
        <span className="font-semibold text-gray-800 text-[0.82vw]">QR Code Settings</span>
        {isRendering && (
          <span className="text-[0.62vw] text-blue-500 animate-pulse font-medium">Updating...</span>
        )}
      </div>

      {/* Target URL / Content */}
      <div className="flex flex-col gap-[0.3vw]">
        <label className="text-[0.68vw] font-medium text-gray-600 flex items-center gap-[0.3vw]">
          <Link size="0.8vw" className="text-gray-400" /> Destination URL / Link
        </label>
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
                triggerCanvasUpdate({ url });
              }
            }}
            placeholder="https://yourwebsite.com"
            className="w-full bg-white border border-gray-200 rounded-[0.35vw] px-[0.5vw] py-[0.35vw] text-[0.72vw] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
          />
        </div>
      </div>

      {/* Frame Style Picker */}
      <div className="flex flex-col gap-[0.3vw]">
        <label className="text-[0.68vw] font-medium text-gray-600 flex items-center justify-between">
          <span>Frame Template</span>
          <span className="text-gray-400 text-[0.6vw]">8 Presets</span>
        </label>
        <div className="grid grid-cols-4 gap-[0.35vw] bg-gray-50/80 p-[0.4vw] rounded-[0.4vw] border border-gray-100">
          {QR_FRAMES.map((f) => {
            const isSelected = frame === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleFrameChange(f.id)}
                title={f.shortName}
                className={`relative aspect-square flex flex-col items-center justify-center p-[0.2vw] rounded-[0.3vw] border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-white shadow-xs ring-1 ring-blue-600/30'
                    : 'border-transparent hover:border-gray-300 hover:bg-white/60'
                }`}
              >
                <div className="w-[85%] h-[85%] pointer-events-none">
                  <FrameVectorThumbnail frameId={f.id} />
                </div>
                {isSelected && (
                  <div className="absolute top-[0.15vw] right-[0.15vw] bg-blue-600 rounded-full p-[0.1vw]">
                    <Check size="0.45vw" className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame CTA Text (if frame has text) */}
      {frame !== 'frame-none' && (
        <div className="flex flex-col gap-[0.3vw]">
          <label className="text-[0.68vw] font-medium text-gray-600 flex items-center gap-[0.3vw]">
            <Type size="0.8vw" className="text-gray-400" /> Frame Banner Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
                triggerCanvasUpdate({ text });
              }
            }}
            placeholder="SCAN ME"
            maxLength={20}
            className="w-full bg-white border border-gray-200 rounded-[0.35vw] px-[0.5vw] py-[0.35vw] text-[0.72vw] focus:outline-none focus:border-blue-500 uppercase font-semibold tracking-wider"
          />
        </div>
      )}

      {/* Center Logo Section */}
      <div className="flex flex-col gap-[0.4vw] pt-[0.4vw] border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-[0.68vw] font-medium text-gray-600 flex items-center gap-[0.3vw]">
            <ImageIcon size="0.8vw" className="text-gray-400" /> Center Brand Logo
          </label>
          {logoSrc && (
            <button
              onClick={handleRemoveLogo}
              className="text-red-500 hover:text-red-600 text-[0.62vw] flex items-center gap-[0.2vw] cursor-pointer"
            >
              <Trash2 size="0.65vw" /> Remove
            </button>
          )}
        </div>

        {logoSrc ? (
          <div className="flex flex-col gap-[0.4vw] bg-gray-50 p-[0.5vw] rounded-[0.35vw] border border-gray-200">
            <div className="flex items-center gap-[0.5vw]">
              <div className="w-[2vw] h-[2vw] rounded-[0.25vw] bg-white border border-gray-300 p-[0.15vw] flex items-center justify-center overflow-hidden">
                <img src={logoSrc} alt="Brand Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[0.62vw] text-gray-500 mb-[0.15vw]">
                  <span>Size</span>
                  <span>{logoSize}%</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={logoSize}
                  onChange={(e) => handleLogoSizeChange(e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <label className="flex items-center gap-[0.4vw] cursor-pointer pt-[0.2vw]">
              <input
                type="checkbox"
                checked={logoBg}
                onChange={(e) => handleLogoBgToggle(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-[0.65vw] text-gray-600">White background badge behind logo</span>
            </label>
          </div>
        ) : (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-[0.5vw] border border-dashed border-gray-300 rounded-[0.35vw] hover:border-blue-500 hover:bg-blue-50/20 text-gray-600 hover:text-blue-600 flex items-center justify-center gap-[0.4vw] transition-all cursor-pointer text-[0.68vw]"
            >
              <UploadCloud size="0.9vw" />
              <span>Upload Brand Logo (PNG, SVG)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
