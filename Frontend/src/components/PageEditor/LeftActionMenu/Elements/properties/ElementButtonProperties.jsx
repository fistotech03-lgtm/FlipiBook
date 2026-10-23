import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, Type, MousePointerClick, Sliders } from 'lucide-react';
import ColorPicker from '../../../../ColorPicker';

const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-[0.75vw] mb-[0.5vw]">
    {icon && <span className="text-[#EA543A]">{icon}</span>}
    <h2 className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-wider">{title}</h2>
    <div className="h-[0.0925vw] bg-gray-200 flex-1"> </div>
  </div>
);

export const ElementButtonProperties = ({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  updateElementAttribute
}) => {
  const getSelectedElement = () => {
    if (selectedElement && typeof selectedElement.getAttribute === 'function') {
      return selectedElement.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]') || selectedElement;
    }
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const base = editorDoc.getElementById(selectedLayerId);
    return base?.closest?.('[data-is-element-button="true"], [data-type="button"], g[id^="button-"]') || base;
  };

  const el = getSelectedElement();

  // Helper to extract initial values
  const getInitialText = (node) => node?.getAttribute('data-text') || node?.querySelector('text')?.textContent || 'Button';
  const getInitialFill = (node) => {
    return node?.getAttribute('data-fill-color') ||
      node?.querySelector('.btn-main-poly, rect.btn-bg, rect, polygon, path')?.getAttribute('fill') ||
      '#EA543A';
  };
  const getInitialTextColor = (node) => node?.querySelector('text')?.getAttribute('fill') || '#FFFFFF';
  const getInitialFontSize = (node) => parseFloat(node?.querySelector('text')?.getAttribute('font-size') || '15');
  const getInitialFontWeight = (node) => node?.querySelector('text')?.getAttribute('font-weight') || '700';
  const getInitialStroke = (node) => {
    const shape = node?.querySelector('.btn-main-poly, rect.btn-bg, rect, polygon, path');
    const s = shape?.getAttribute('stroke');
    return (s && s !== 'none') ? s : '#1E2538';
  };
  const getInitialStrokeWidth = (node) => {
    const shape = node?.querySelector('.btn-main-poly, rect.btn-bg, rect, polygon, path');
    return parseFloat(shape?.getAttribute('stroke-width') || '0');
  };
  const getInitialRx = (node) => {
    const rect = node?.querySelector('rect.btn-bg, rect');
    return parseFloat(rect?.getAttribute('rx') || '8');
  };
  const getInitialAction = (node) => node?.getAttribute('data-interaction') || 'open-link';
  const getInitialLink = (node) => node?.getAttribute('data-interaction-value') || '';
  const getInitialAccentColor = (node) => node?.getAttribute('data-accent-color') || '#A855F7';

  // Component States
  const [btnText, setBtnText] = useState(getInitialText(el));
  const [btnFill, setBtnFill] = useState(getInitialFill(el));
  const [btnTextColor, setBtnTextColor] = useState(getInitialTextColor(el));
  const [btnFontSize, setBtnFontSize] = useState(getInitialFontSize(el));
  const [btnFontWeight, setBtnFontWeight] = useState(getInitialFontWeight(el));
  const [btnStroke, setBtnStroke] = useState(getInitialStroke(el));
  const [btnStrokeWidth, setBtnStrokeWidth] = useState(getInitialStrokeWidth(el));
  const [btnRx, setBtnRx] = useState(getInitialRx(el));
  const [btnAction, setBtnAction] = useState(getInitialAction(el));
  const [btnLink, setBtnLink] = useState(getInitialLink(el));
  const [btnAccentColor, setBtnAccentColor] = useState(getInitialAccentColor(el));
  const [activePicker, setActivePicker] = useState(null);

  // Sync state whenever selected element changes
  useEffect(() => {
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    setBtnText(getInitialText(currentEl));
    setBtnFill(getInitialFill(currentEl));
    setBtnTextColor(getInitialTextColor(currentEl));
    setBtnFontSize(getInitialFontSize(currentEl));
    setBtnFontWeight(getInitialFontWeight(currentEl));
    setBtnStroke(getInitialStroke(currentEl));
    setBtnStrokeWidth(getInitialStrokeWidth(currentEl));
    setBtnRx(getInitialRx(currentEl));
    setBtnAction(getInitialAction(currentEl));
    setBtnLink(getInitialLink(currentEl));
    setBtnAccentColor(getInitialAccentColor(currentEl));
  }, [selectedLayerId, selectedElement]);

  const syncDOM = () => {
    const currentEl = getSelectedElement();
    if (!currentEl || !updateElementAttribute) return;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const svgRoot = currentEl.ownerSVGElement || currentEl.closest?.('svg') || editorDoc.querySelector('svg');
    if (svgRoot) {
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(svgRoot);
      const targetId = currentEl.id || selectedLayerId;
      window.__skipCanvasUpdateForPage = activePageIndex;
      updateElementAttribute(activePageIndex, targetId, '__dom_sync__', html);
    }
  };

  const handleTextChange = (newText) => {
    setBtnText(newText);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    currentEl.setAttribute('data-text', newText);
    const textNode = currentEl.querySelector('text');
    if (textNode) {
      textNode.textContent = newText;
    }
    syncDOM();
  };

  const handleFillChange = (newColor) => {
    setBtnFill(newColor);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    currentEl.setAttribute('data-fill-color', newColor);
    const mainShape = currentEl.querySelector('.btn-main-poly, rect.btn-bg, rect');
    if (mainShape) {
      mainShape.setAttribute('fill', newColor);
      if (mainShape.style) mainShape.style.fill = newColor;
    }
    syncDOM();
  };

  const handleTextColorChange = (newColor) => {
    setBtnTextColor(newColor);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    const textNode = currentEl.querySelector('text');
    if (textNode) {
      textNode.setAttribute('fill', newColor);
      textNode.style.fill = newColor;
    }
    syncDOM();
  };

  const handleFontSizeChange = (newSize) => {
    const parsed = Math.max(6, Math.min(60, Number(newSize) || 14));
    setBtnFontSize(parsed);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    const textNode = currentEl.querySelector('text');
    if (textNode) {
      textNode.setAttribute('font-size', parsed);
      textNode.style.fontSize = `${parsed}px`;
    }
    syncDOM();
  };

  const handleFontWeightChange = (newWeight) => {
    setBtnFontWeight(newWeight);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    const textNode = currentEl.querySelector('text');
    if (textNode) {
      textNode.setAttribute('font-weight', newWeight);
      textNode.style.fontWeight = newWeight;
    }
    syncDOM();
  };

  const handleStrokeColorChange = (newColor) => {
    setBtnStroke(newColor);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    const mainShape = currentEl.querySelector('.btn-main-poly, rect.btn-bg, rect');
    if (mainShape) {
      mainShape.setAttribute('stroke', newColor);
      if (btnStrokeWidth === 0) {
        setBtnStrokeWidth(2);
        mainShape.setAttribute('stroke-width', 2);
      }
    }
    syncDOM();
  };

  const handleStrokeWidthChange = (newWidth) => {
    const parsed = Math.max(0, Math.min(20, Number(newWidth) || 0));
    setBtnStrokeWidth(parsed);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    const mainShape = currentEl.querySelector('.btn-main-poly, rect.btn-bg, rect');
    if (mainShape) {
      mainShape.setAttribute('stroke-width', parsed);
      if (parsed > 0 && (!btnStroke || btnStroke === 'none')) {
        mainShape.setAttribute('stroke', '#1E2538');
        setBtnStroke('#1E2538');
      } else if (parsed === 0) {
        mainShape.setAttribute('stroke', 'none');
      }
    }
    syncDOM();
  };

  const handleRxChange = (newRx) => {
    const parsed = Math.max(0, Math.min(50, Number(newRx) || 0));
    setBtnRx(parsed);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    const rect = currentEl.querySelector('rect.btn-bg, rect');
    if (rect) {
      rect.setAttribute('rx', parsed);
    }
    syncDOM();
  };

  const handleAccentColorChange = (newColor) => {
    setBtnAccentColor(newColor);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    currentEl.setAttribute('data-accent-color', newColor);
    const leftAccent = currentEl.querySelector('.btn-accent-left');
    const rightAccent = currentEl.querySelector('.btn-accent-right');
    if (leftAccent) leftAccent.setAttribute('fill', newColor);
    if (rightAccent) rightAccent.setAttribute('fill', newColor);
    syncDOM();
  };

  const handleLinkChange = (newLink) => {
    setBtnLink(newLink);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    currentEl.setAttribute('data-interaction-value', newLink);
    syncDOM();
  };

  const handleActionChange = (newAction) => {
    setBtnAction(newAction);
    const currentEl = getSelectedElement();
    if (!currentEl) return;
    currentEl.setAttribute('data-interaction', newAction);
    syncDOM();
  };

  const shapeType = el?.getAttribute('data-button-shape');
  const isRibbon = shapeType === 'ribbon';
  const hasRect = !!el?.querySelector('rect.btn-bg, rect');

  return (
    <div className="w-full flex flex-col gap-[0.8vw] font-sans text-gray-800">
      
      {/* 1. Button Content Section */}
      <div className="flex flex-col p-[1vw] bg-white border border-gray-200 rounded-[0.75vw] shadow-sm">
        <SectionHeader title="Button Label" icon={<Type size="0.9vw" />} />
        
        <div className="flex flex-col gap-[0.4vw]">
          <span className="text-[0.75vw] font-medium text-gray-500">Label Text:</span>
          <input
            type="text"
            value={btnText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full p-[0.6vw] text-[0.85vw] font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-[0.5vw] outline-none focus:border-[#EA543A] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-[0.6vw] mt-[0.6vw]">
          <div className="flex flex-col gap-[0.3vw]">
            <span className="text-[0.75vw] font-medium text-gray-500">Font Size:</span>
            <div className="flex items-center gap-[0.3vw] border border-gray-300 rounded-[0.4vw] px-[0.4vw] py-[0.3vw] bg-gray-50">
              <input
                type="number"
                min="8"
                max="60"
                value={btnFontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-full text-[0.8vw] font-semibold bg-transparent outline-none text-gray-800"
              />
              <span className="text-[0.65vw] text-gray-400 font-mono">px</span>
            </div>
          </div>

          <div className="flex flex-col gap-[0.3vw]">
            <span className="text-[0.75vw] font-medium text-gray-500">Weight:</span>
            <select
              value={btnFontWeight}
              onChange={(e) => handleFontWeightChange(e.target.value)}
              className="w-full p-[0.35vw] text-[0.8vw] font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-[0.4vw] outline-none cursor-pointer"
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">SemiBold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">ExtraBold (800)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Interactive Action / Link Section */}
      <div className="flex flex-col p-[1vw] bg-white border border-gray-200 rounded-[0.75vw] shadow-sm">
        <SectionHeader title="Button Interaction" icon={<MousePointerClick size="0.9vw" />} />
        
        <div className="flex flex-col gap-[0.5vw]">
          <div className="flex flex-col gap-[0.3vw]">
            <span className="text-[0.75vw] font-medium text-gray-500">Click Action:</span>
            <select
              value={btnAction}
              onChange={(e) => handleActionChange(e.target.value)}
              className="w-full p-[0.5vw] text-[0.8vw] font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-[0.5vw] outline-none cursor-pointer"
            >
              <option value="open-link">Open Web Link (URL)</option>
              <option value="go-to-page">Navigate to Page</option>
              <option value="call-phone">Call Phone Number</option>
              <option value="send-email">Send Email</option>
            </select>
          </div>

          <div className="flex flex-col gap-[0.3vw] mt-[0.3vw]">
            <span className="text-[0.75vw] font-medium text-gray-500">
              {btnAction === 'open-link' ? 'Destination URL:' :
               btnAction === 'go-to-page' ? 'Page Number:' :
               btnAction === 'call-phone' ? 'Phone Number:' : 'Email Address:'}
            </span>
            <div className="flex items-center gap-[0.4vw] border border-gray-300 rounded-[0.5vw] p-[0.4vw] bg-gray-50 focus-within:border-[#EA543A] focus-within:bg-white transition-colors">
              <Link size="0.85vw" className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={btnLink}
                onChange={(e) => handleLinkChange(e.target.value)}
                placeholder={
                  btnAction === 'open-link' ? 'https://example.com' :
                  btnAction === 'go-to-page' ? '1' :
                  btnAction === 'call-phone' ? '+1 (555) 000-0000' : 'contact@example.com'
                }
                className="w-full text-[0.8vw] bg-transparent outline-none text-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Button Appearance Section */}
      <div className="flex flex-col p-[1vw] bg-white border border-gray-200 rounded-[0.75vw] shadow-sm">
        <SectionHeader title="Colors & Style" icon={<Sliders size="0.9vw" />} />
        
        {/* Button Background Color */}
        <div className="flex items-center gap-[1vw] py-[0.4vw]">
          <span className="text-[0.8vw] font-semibold text-gray-600 w-[7vw] flex-shrink-0 select-none">
            Button Color:
          </span>
          <div className="flex-grow flex items-center gap-[0.6vw]">
            <div
              className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-200 flex-shrink-0 cursor-pointer shadow-sm"
              style={{ background: btnFill }}
              onClick={() => setActivePicker(activePicker === 'fill' ? null : 'fill')}
            />
            {activePicker === 'fill' && createPortal(
              <div className="fixed z-[5000]" style={{ top: '50%', right: '19.5vw', transform: 'translateY(-50%)' }}>
                <ColorPicker
                  color={btnFill}
                  onChange={handleFillChange}
                  onClose={() => setActivePicker(null)}
                  disableGradient={false}
                />
              </div>,
              document.body
            )}
            <input
              type="text"
              value={btnFill}
              onChange={(e) => handleFillChange(e.target.value)}
              className="flex-1 p-[0.3vw] text-[0.75vw] border border-gray-300 rounded-[0.4vw] uppercase font-mono"
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-[1vw] py-[0.4vw]">
          <span className="text-[0.8vw] font-semibold text-gray-600 w-[7vw] flex-shrink-0 select-none">
            Text Color:
          </span>
          <div className="flex-grow flex items-center gap-[0.6vw]">
            <div
              className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-200 flex-shrink-0 cursor-pointer shadow-sm"
              style={{ background: btnTextColor }}
              onClick={() => setActivePicker(activePicker === 'text' ? null : 'text')}
            />
            {activePicker === 'text' && createPortal(
              <div className="fixed z-[5000]" style={{ top: '50%', right: '19.5vw', transform: 'translateY(-50%)' }}>
                <ColorPicker
                  color={btnTextColor}
                  onChange={handleTextColorChange}
                  onClose={() => setActivePicker(null)}
                  disableGradient={true}
                />
              </div>,
              document.body
            )}
            <input
              type="text"
              value={btnTextColor}
              onChange={(e) => handleTextColorChange(e.target.value)}
              className="flex-1 p-[0.3vw] text-[0.75vw] border border-gray-300 rounded-[0.4vw] uppercase font-mono"
            />
          </div>
        </div>

        {/* Accent Color (for Ribbon) */}
        {isRibbon && (
          <div className="flex items-center gap-[1vw] py-[0.4vw]">
            <span className="text-[0.8vw] font-semibold text-gray-600 w-[7vw] flex-shrink-0 select-none">
              Ribbon Accent:
            </span>
            <div className="flex-grow flex items-center gap-[0.6vw]">
              <div
                className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-200 flex-shrink-0 cursor-pointer shadow-sm"
                style={{ background: btnAccentColor }}
                onClick={() => setActivePicker(activePicker === 'accent' ? null : 'accent')}
              />
              {activePicker === 'accent' && createPortal(
                <div className="fixed z-[5000]" style={{ top: '50%', right: '19.5vw', transform: 'translateY(-50%)' }}>
                  <ColorPicker
                    color={btnAccentColor}
                    onChange={handleAccentColorChange}
                    onClose={() => setActivePicker(null)}
                    disableGradient={true}
                  />
                </div>,
                document.body
              )}
              <input
                type="text"
                value={btnAccentColor}
                onChange={(e) => handleAccentColorChange(e.target.value)}
                className="flex-1 p-[0.3vw] text-[0.75vw] border border-gray-300 rounded-[0.4vw] uppercase font-mono"
              />
            </div>
          </div>
        )}

        {/* Border / Stroke Options */}
        <div className="flex items-center gap-[1vw] py-[0.4vw]">
          <span className="text-[0.8vw] font-semibold text-gray-600 w-[7vw] flex-shrink-0 select-none">
            Border:
          </span>
          <div className="flex-grow flex items-center gap-[0.6vw]">
            <div
              className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-200 flex-shrink-0 cursor-pointer shadow-sm"
              style={{ background: btnStrokeWidth > 0 ? btnStroke : 'transparent' }}
              onClick={() => setActivePicker(activePicker === 'stroke' ? null : 'stroke')}
            />
            {activePicker === 'stroke' && createPortal(
              <div className="fixed z-[5000]" style={{ top: '50%', right: '19.5vw', transform: 'translateY(-50%)' }}>
                <ColorPicker
                  color={btnStroke}
                  onChange={handleStrokeColorChange}
                  onClose={() => setActivePicker(null)}
                  disableGradient={true}
                />
              </div>,
              document.body
            )}
            <div className="flex items-center gap-[0.3vw] border border-gray-300 rounded-[0.4vw] px-[0.4vw] py-[0.3vw] bg-gray-50 flex-1">
              <input
                type="number"
                min="0"
                max="20"
                value={btnStrokeWidth}
                onChange={(e) => handleStrokeWidthChange(e.target.value)}
                className="w-full text-[0.75vw] font-semibold bg-transparent outline-none text-gray-800"
              />
              <span className="text-[0.65vw] text-gray-400 font-mono">px</span>
            </div>
          </div>
        </div>

        {/* Corner Radius (for Rect / Pill buttons) */}
        {hasRect && (
          <div className="flex items-center gap-[1vw] py-[0.4vw]">
            <span className="text-[0.8vw] font-semibold text-gray-600 w-[7vw] flex-shrink-0 select-none">
              Corner Radius:
            </span>
            <div className="flex-grow flex items-center gap-[0.6vw]">
              <div className="flex items-center gap-[0.3vw] border border-gray-300 rounded-[0.4vw] px-[0.4vw] py-[0.3vw] bg-gray-50 flex-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={btnRx}
                  onChange={(e) => handleRxChange(e.target.value)}
                  className="w-full text-[0.75vw] font-semibold bg-transparent outline-none text-gray-800"
                />
                <span className="text-[0.65vw] text-gray-400 font-mono">px</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ElementButtonProperties;
