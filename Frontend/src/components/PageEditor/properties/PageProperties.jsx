import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ColorPicker, { parseGradient, generateGradientString } from '../../Color';
import { ScrubPercentInput } from './controls/propertiesShared';

export const getDocumentInfo = (w, h) => {
  const roundedW = Math.round(w || 210);
  const roundedH = Math.round(h || 297);
  const minDim = Math.min(roundedW, roundedH);
  const maxDim = Math.max(roundedW, roundedH);

  let formatName = 'Custom Sheet';
  if (Math.abs(minDim - 210) <= 3 && Math.abs(maxDim - 297) <= 3) {
    formatName = 'A4';
  } else if (Math.abs(minDim - 297) <= 3 && Math.abs(maxDim - 420) <= 3) {
    formatName = 'A3';
  } else if (Math.abs(minDim - 148) <= 3 && Math.abs(maxDim - 210) <= 3) {
    formatName = 'A5';
  } else if (Math.abs(minDim - 216) <= 3 && Math.abs(maxDim - 279) <= 3) {
    formatName = 'Letter';
  } else if (Math.abs(minDim - 216) <= 3 && Math.abs(maxDim - 356) <= 3) {
    formatName = 'Legal';
  } else if (Math.abs(minDim - 99) <= 3 && Math.abs(maxDim - 210) <= 3) {
    formatName = 'DL';
  } else if (Math.abs(roundedW - roundedH) <= 3) {
    formatName = 'Square';
  }

  let orientationName = 'Portrait';
  if (roundedW > roundedH) {
    orientationName = 'Landscape';
  } else if (roundedW === roundedH) {
    orientationName = 'Square';
  }

  return {
    format: formatName,
    orientation: orientationName,
    dimensions: `${roundedW} x ${roundedH} mm`
  };
};

const resolveOverlayElement = (overlay, pages, activePageIndex) => {
  if (overlay) return overlay;
  if (!pages || !pages[activePageIndex]) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pages[activePageIndex]?.html || '', 'image/svg+xml');
    return doc.querySelector('[data-name="Overlay"]');
  } catch (e) {
    console.error('Error parsing overlay in PageProperties', e);
    return null;
  }
};

const buildOverlayBackgroundString = (effectiveOverlay) => {
  const currentBg = effectiveOverlay?.getAttribute('fill') || '#FFFFFF';
  const fillType = effectiveOverlay?.getAttribute('fill-type') || 'solid';

  if (fillType === 'gradient' || currentBg.toLowerCase().includes('url(#')) {
    const stopsJson = effectiveOverlay?.getAttribute('fill-stops');
    try {
      const stops = stopsJson ? JSON.parse(stopsJson) : [];
      const gType = effectiveOverlay?.getAttribute('fill-gradient-type') || 'linear';
      if (stops.length > 0) {
        return generateGradientString(
          gType.charAt(0).toUpperCase() + gType.slice(1),
          stops.map((s) => ({ ...s, opacity: (s.opacity !== undefined ? s.opacity : 1) * 100 })),
          parseInt(effectiveOverlay?.getAttribute('fill-angle') || '0', 10),
          parseInt(effectiveOverlay?.getAttribute('fill-radius') || '100', 10)
        );
      }
    } catch (e) {
      console.error('Error parsing fill-stops in PageProperties', e);
    }
  }

  return currentBg;
};

const extractPageColors = (pages, activePageIndex) => {
  const colors = new Set();
  const currentPage = pages?.[activePageIndex];
  if (currentPage?.html) {
    const hexMatches = currentPage.html.match(/#[0-9A-Fa-f]{6}\b/g) || [];
    hexMatches.forEach((c) => colors.add(c.toUpperCase()));
    const hex3Matches = currentPage.html.match(/#[0-9A-Fa-f]{3}\b/g) || [];
    hex3Matches.forEach((c) => colors.add(c.toUpperCase()));
  }
  if (typeof document !== 'undefined') {
    const pageEl =
      document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`) ||
      document.querySelector('.page-svg-container');
    if (pageEl) {
      pageEl.querySelectorAll('*').forEach((el) => {
        ['fill', 'stroke', 'color'].forEach((attr) => {
          const val = el.getAttribute(attr);
          if (val && val.startsWith('#')) colors.add(val.toUpperCase());
        });
        if (el.style) {
          ['fill', 'stroke', 'color', 'backgroundColor'].forEach((prop) => {
            const val = el.style[prop];
            if (val && val.startsWith('#')) colors.add(val.toUpperCase());
          });
        }
      });
    }
  }
  colors.add('#DADBE8');
  colors.add('#FFFFFF');
  colors.add('#000000');
  return Array.from(colors).slice(0, 12);
};

const getCanvaSwatchBackground = (canvaColor, canvaOpacity) => {
  if (!canvaColor.startsWith('#')) return canvaColor;
  let hex = canvaColor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${canvaOpacity})`;
};

const ColorPropertyRow = ({
  label,
  swatchBackground,
  hexValue,
  isGradient = false,
  opacity,
  isPickerOpen,
  onTogglePicker,
  onClosePicker,
  onHexChange,
  onColorChange,
  onOpacityChange,
  pickerColor,
  colorsOnPage,
  disableGradient = false,
  title
}) => {
  const opacityPct = Math.round(opacity * 100);

  return (
    <div className="flex flex-col gap-[0.35vw]">
      <span className="text-[0.82vw] font-medium text-gray-800">{label}</span>
      <div className="flex items-center gap-[0.6vw]">
        <button
          type="button"
          onClick={onTogglePicker}
          className="w-[3.6vw] h-[2vw] rounded-[0.4vw] border border-gray-300 shadow-2xs cursor-pointer flex-shrink-0 relative overflow-hidden transition-transform hover:scale-105"
          style={{ background: swatchBackground }}
          title={title}
        />
        <div className="flex-1 h-[2vw] rounded-[0.4vw] border border-gray-300 bg-white flex items-center justify-between px-[0.7vw] hover:border-gray-400 transition-colors">
          {isGradient ? (
            <span
              onClick={onTogglePicker}
              className="text-[0.8vw] font-medium text-gray-700 cursor-pointer flex-1 truncate"
            >
              Gradient
            </span>
          ) : (
            <input
              type="text"
              value={hexValue}
              onChange={onHexChange}
              className="text-[0.8vw] font-medium text-gray-800 outline-none bg-transparent w-[5.5vw] uppercase"
              maxLength={7}
            />
          )}
          <ScrubPercentInput
            value={opacityPct}
            onChange={(clamped) => onOpacityChange(clamped / 100)}
          />
        </div>
      </div>

      {isPickerOpen && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '25vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200 relative">
            <ColorPicker
              color={pickerColor}
              colorsOnPage={colorsOnPage}
              disableGradient={disableGradient}
              onChange={onColorChange}
              opacity={opacityPct}
              onOpacityChange={(newOp) => onOpacityChange(newOp / 100)}
              onClose={onClosePicker}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const PageProperties = ({
  pages,
  overlay,
  activePageIndex,
  updateElementAttribute,
  baseWidth,
  baseHeight
}) => {
  const [isPageColorPickerOpen, setIsPageColorPickerOpen] = useState(false);
  const [isCanvaColorPickerOpen, setIsCanvaColorPickerOpen] = useState(false);

  const [canvaColor, setCanvaColor] = useState(() => {
    return localStorage.getItem('editor_canva_color') || '#E6E7E7';
  });
  const [canvaOpacity, setCanvaOpacity] = useState(() => {
    const saved = localStorage.getItem('editor_canva_opacity');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [canvaColorHex, setCanvaColorHex] = useState(canvaColor);

  useEffect(() => {
    setCanvaColorHex(canvaColor);
  }, [canvaColor]);

  const effectiveOverlay = resolveOverlayElement(overlay, pages, activePageIndex);
  const currentBg = effectiveOverlay?.getAttribute('fill') || '#FFFFFF';
  const fillType = effectiveOverlay?.getAttribute('fill-type') || 'solid';
  const rawOpacity = effectiveOverlay?.getAttribute('fill-opacity');
  const pageOpacity = rawOpacity !== null && rawOpacity !== undefined ? parseFloat(rawOpacity) : 1;

  const currentBgStr = buildOverlayBackgroundString(effectiveOverlay);
  const isPageGradient = fillType === 'gradient' || currentBgStr.includes('gradient') || currentBg.toLowerCase().includes('url(#');

  const [pageColorHex, setPageColorHex] = useState(currentBg.startsWith('#') ? currentBg : '#FFFFFF');

  useEffect(() => {
    if (currentBg.startsWith('#')) {
      setPageColorHex(currentBg);
    }
  }, [currentBg]);

  const handlePageColorChange = (newVal) => {
    if (newVal.includes('gradient')) {
      const parsed = parseGradient(newVal);
      if (parsed) {
        updateElementAttribute(activePageIndex, 'Overlay', {
          'fill-type': 'gradient',
          'fill-gradient-type': parsed.type.toLowerCase(),
          'fill-stops': JSON.stringify(parsed.stops.map((s) => ({
            color: s.color,
            offset: s.offset,
            opacity: s.opacity / 100
          }))),
          'fill-angle': (parsed.angle || 0).toString(),
          'fill-radius': (parsed.radius || 100).toString(),
          'fill': newVal
        });
      }
    } else {
      updateElementAttribute(activePageIndex, 'Overlay', {
        'fill-type': 'solid',
        'fill': newVal
      });
      if (newVal.startsWith('#')) setPageColorHex(newVal);
    }
  };

  const handlePageOpacityChange = (newOpacity) => {
    updateElementAttribute(activePageIndex, 'Overlay', {
      'fill-opacity': newOpacity.toString()
    });
  };

  const handlePageHexInput = (e) => {
    const val = e.target.value;
    setPageColorHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      handlePageColorChange(val);
    }
  };

  const handleCanvaColorChange = (newColor) => {
    setCanvaColor(newColor);
    setCanvaColorHex(newColor);
    localStorage.setItem('editor_canva_color', newColor);
    window.dispatchEvent(new CustomEvent('editor-canva-color-changed', {
      detail: { color: newColor, opacity: canvaOpacity }
    }));
  };

  const handleCanvaOpacityChange = (newOpacity) => {
    setCanvaOpacity(newOpacity);
    localStorage.setItem('editor_canva_opacity', newOpacity.toString());
    window.dispatchEvent(new CustomEvent('editor-canva-color-changed', {
      detail: { color: canvaColor, opacity: newOpacity }
    }));
  };

  const handleCanvaHexInput = (e) => {
    const val = e.target.value;
    setCanvaColorHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      handleCanvaColorChange(val);
    }
  };

  const info = getDocumentInfo(baseWidth, baseHeight);
  const pageColors = useMemo(() => extractPageColors(pages, activePageIndex), [pages, activePageIndex]);

  return (
    <div className="bg-white px-[1.2vw] pt-[1.1vw] pb-[1.5vw] flex flex-col gap-[1.5vw] flex-1 select-none">
      {/* ── Page Properties Section ── */}
      <div className="flex flex-col gap-[1vw]">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Page Properties</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        <ColorPropertyRow
          label="Page Color"
          swatchBackground={currentBgStr}
          hexValue={pageColorHex}
          isGradient={isPageGradient}
          opacity={pageOpacity}
          isPickerOpen={isPageColorPickerOpen}
          onTogglePicker={() => {
            setIsCanvaColorPickerOpen(false);
            setIsPageColorPickerOpen((prev) => !prev);
          }}
          onClosePicker={() => setIsPageColorPickerOpen(false)}
          onHexChange={handlePageHexInput}
          onColorChange={handlePageColorChange}
          onOpacityChange={handlePageOpacityChange}
          pickerColor={currentBgStr}
          colorsOnPage={pageColors}
          title="Change page color"
        />

        <ColorPropertyRow
          label="Canva Color"
          swatchBackground={getCanvaSwatchBackground(canvaColor, canvaOpacity)}
          hexValue={canvaColorHex}
          isGradient={canvaColor.includes('gradient')}
          opacity={canvaOpacity}
          isPickerOpen={isCanvaColorPickerOpen}
          onTogglePicker={() => {
            setIsPageColorPickerOpen(false);
            setIsCanvaColorPickerOpen((prev) => !prev);
          }}
          onClosePicker={() => setIsCanvaColorPickerOpen(false)}
          onHexChange={handleCanvaHexInput}
          onColorChange={handleCanvaColorChange}
          onOpacityChange={handleCanvaOpacityChange}
          pickerColor={canvaColor}
          colorsOnPage={pageColors}
          disableGradient={true}
          title="Change canva color"
        />
      </div>

      {/* ── Document Info Section ── */}
      <div className="flex flex-col gap-[0.8vw]">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Document info</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>
        <div className="bg-white rounded-[0.5vw] border border-gray-200 p-[0.9vw] shadow-2xs flex flex-col gap-[0.7vw]">
          <div className="flex justify-between items-center text-[0.8vw]">
            <span className="text-gray-500 font-medium">Format</span>
            <span className="text-gray-900 font-semibold">{info.format}</span>
          </div>
          <div className="flex justify-between items-center text-[0.8vw]">
            <span className="text-gray-500 font-medium">Orientation</span>
            <span className="text-gray-900 font-semibold">{info.orientation}</span>
          </div>
          <div className="flex justify-between items-center text-[0.8vw]">
            <span className="text-gray-500 font-medium">Dimensions</span>
            <span className="text-gray-900 font-semibold">{info.dimensions}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageProperties;
