import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { Icon } from '@iconify/react';
import { getVisualBBox } from '../mainEditor/utils/geometryUtils';
import { handleScrubHelper } from './Color';

export const DimensionInput = ({ targetId, targetAttr, value, readOnly, onChange, className }) => {
  const [localVal, setLocalVal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [liveVal, setLiveVal] = useState(null);

  useEffect(() => {
    if (!targetId || readOnly) {
      setLiveVal(null);
      return;
    }

    let frameId;
    const poll = () => {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = editorDoc.getElementById(targetId);
      if (el && typeof el.getBBox === 'function') {
        try {
          let bbox;
          if (el.getAttribute('data-is-hotspot') === 'true') {
            bbox = { x: 0, y: 0, width: 52, height: 52 };
          } else {
            bbox = getVisualBBox(el);
          }
          let rawVal = 0;
          let m = [1, 0, 0, 1, 0, 0];
          const transform = el.getAttribute('transform');
          if (transform) {
            try {
              const domM = new DOMMatrix(transform);
              m = [domM.a, domM.b, domM.c, domM.d, domM.e, domM.f];
            } catch {
              if (transform.includes('matrix')) {
                const match = transform.match(/matrix\(([^)]+)\)/);
                if (match) {
                  const parsedM = match[1].split(/[\s,]+/).map(parseFloat);
                  if (parsedM.length === 6) m = parsedM;
                }
              }
            }
          }

          if (targetAttr === 'width') rawVal = bbox.width * Math.abs(m[0]);
          else if (targetAttr === 'height') rawVal = bbox.height * Math.abs(m[3]);
          else if (targetAttr === 'x') rawVal = bbox.x * m[0] + (m[0] < 0 ? bbox.width * m[0] : 0) + m[4];
          else if (targetAttr === 'y') rawVal = bbox.y * m[3] + (m[3] < 0 ? bbox.height * m[3] : 0) + m[5];

          if (el.tagName === 'circle' && (!transform || !transform.includes('matrix'))) {
            const r = parseFloat(el.getAttribute('r')) || 0;
            if (targetAttr === 'width' || targetAttr === 'height') rawVal = r * 2;
            else if (targetAttr === 'x') rawVal = (parseFloat(el.getAttribute('cx')) || 0) - r;
            else if (targetAttr === 'y') rawVal = (parseFloat(el.getAttribute('cy')) || 0) - r;
          }

          const finalLiveVal = Number(rawVal.toFixed(1)).toString();
          setLiveVal((prev) => (prev !== finalLiveVal ? finalLiveVal : prev));
        } catch { /* ignore */ }
      } else {
        setLiveVal(null);
      }
      frameId = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(frameId);
  }, [targetId, targetAttr, readOnly]);

  const displayValue = isEditing ? localVal : (liveVal !== null ? liveVal : value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
      return;
    }
    const allowedControlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (allowedControlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (e.key === '-' && (targetAttr === 'x' || targetAttr === 'y')) {
      if (e.target.value.includes('-')) e.preventDefault();
      return;
    }
    if (e.key === '.') {
      if (e.target.value.includes('.')) e.preventDefault();
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (targetAttr === 'x' || targetAttr === 'y') {
      val = val.replace(/[^0-9.-]/g, '');
    } else {
      val = val.replace(/[^0-9.]/g, '');
    }
    setLocalVal(val);
  };

  return (
    <input
      className={className}
      value={displayValue}
      readOnly={readOnly}
      disabled={readOnly}
      tabIndex={readOnly ? -1 : 0}
      onFocus={() => {
        if (readOnly) return;
        setIsEditing(true);
        setLocalVal(displayValue);
      }}
      onBlur={() => {
        if (readOnly) return;
        setIsEditing(false);
        if (localVal !== '' && localVal !== (liveVal !== null ? liveVal : value).toString()) {
          onChange(localVal);
        }
      }}
      onChange={(e) => {
        if (readOnly) return;
        handleChange(e);
      }}
      onKeyDown={(e) => {
        if (readOnly) return;
        handleKeyDown(e);
      }}
    />
  );
};

const TransformProperties = ({
  selectedLayerId,
  selectedElementProps,
  isDimensionDisabled,
  updatePosition,
  updateDimensionWithScale,
  convertValue,
  flipbookDimensions,
  onRotate,
  onFlipH,
  onFlipV
}) => {
  const [isAspectLocked, setIsAspectLocked] = useState(false);
  const [liveRotation, setLiveRotation] = useState(0);
  const [localRotation, setLocalRotation] = useState(0);
  const [isEditingRotation, setIsEditingRotation] = useState(false);
  const [isScrubbingRotate, setIsScrubbingRotate] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartAngle = useRef(0);
  const hasRotatedMoved = useRef(false);

  // Sync aspect locked state with DOM element attribute
  useEffect(() => {
    if (!selectedLayerId) return;
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const el = editorDoc.getElementById(selectedLayerId);
    if (el) {
      setIsAspectLocked(el.getAttribute('data-aspect-locked') === 'true');
    }
  }, [selectedLayerId]);

  const handleToggleAspectLock = () => {
    if (isDimensionDisabled) return;
    setIsAspectLocked((prev) => {
      const next = !prev;
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = editorDoc.getElementById(selectedLayerId);
      if (el) {
        if (next) {
          el.setAttribute('data-aspect-locked', 'true');
        } else {
          el.removeAttribute('data-aspect-locked');
        }
      }
      return next;
    });
  };

  // Helper to extract rotation from DOM element matrix
  const getElementRotation = (el) => {
    if (!el) return 0;
    try {
      const transform = el.getAttribute('transform');
      if (transform) {
        let m = [1, 0, 0, 1, 0, 0];
        try {
          const domM = new DOMMatrix(transform);
          m = [domM.a, domM.b, domM.c, domM.d, domM.e, domM.f];
        } catch {
          const match = transform.match(/matrix\(([^)]+)\)/);
          if (match) {
            const parsed = match[1].split(/[\s,]+/).map(parseFloat);
            if (parsed.length === 6) m = parsed;
          }
        }
        const isFlipH = el.getAttribute('data-flip-h') === 'true';
        const isFlipV = el.getAttribute('data-flip-v') === 'true';
        let angle = Math.round(Math.atan2(m[1], m[0]) * (180 / Math.PI));
        if (isFlipH && !isFlipV) {
          angle = Math.round(Math.atan2(-m[1], -m[0]) * (180 / Math.PI));
        }
        return ((angle % 360) + 360) % 360;
      }
    } catch { /* ignore */ }
    return 0;
  };

  // Poll live rotation from the selected DOM element
  useEffect(() => {
    if (!selectedLayerId || isDimensionDisabled) {
      setLiveRotation(0);
      return;
    }

    let frameId;
    const poll = () => {
      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const el = editorDoc.getElementById(selectedLayerId);
      if (el) {
        const rot = getElementRotation(el);
        if (!isEditingRotation && !isScrubbingRotate) {
          setLiveRotation(rot);
        }
      }
      frameId = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(frameId);
  }, [selectedLayerId, isDimensionDisabled, isEditingRotation, isScrubbingRotate]);

  // Helper to get live visual position
  const getLivePosition = () => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const el = editorDoc.getElementById(selectedLayerId);
    if (el) {
      try {
        const bbox = getVisualBBox(el);
        const transform = el.getAttribute('transform');
        let m = [1, 0, 0, 1, 0, 0];
        if (transform && transform.includes('matrix')) {
          const match = transform.match(/matrix\(([^)]+)\)/);
          if (match) {
            const parsed = match[1].split(/[\s,]+/).map(parseFloat);
            if (parsed.length === 6) m = parsed;
          }
        }
        const x = bbox.x * m[0] + (m[0] < 0 ? bbox.width * m[0] : 0) + m[4];
        const y = bbox.y * m[3] + (m[3] < 0 ? bbox.height * m[3] : 0) + m[5];
        return { x, y };
      } catch { /* ignore */ }
    }
    return {
      x: parseFloat(selectedElementProps?.x) || 0,
      y: parseFloat(selectedElementProps?.y) || 0,
    };
  };

  // Helper to get live visual dimensions
  const getLiveDimensions = () => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    const el = editorDoc.getElementById(selectedLayerId);
    if (el) {
      try {
        const bbox = getVisualBBox(el);
        const transform = el.getAttribute('transform');
        let m = [1, 0, 0, 1, 0, 0];
        if (transform && transform.includes('matrix')) {
          const match = transform.match(/matrix\(([^)]+)\)/);
          if (match) {
            const parsed = match[1].split(/[\s,]+/).map(parseFloat);
            if (parsed.length === 6) m = parsed;
          }
        }
        const w = bbox.width * Math.abs(m[0]);
        const h = bbox.height * Math.abs(m[3]);
        return {
          w: w > 0 ? w : (parseFloat(selectedElementProps?.w) || flipbookDimensions?.width || 100),
          h: h > 0 ? h : (parseFloat(selectedElementProps?.h) || flipbookDimensions?.height || 100),
        };
      } catch { /* ignore */ }
    }
    return {
      w: parseFloat(selectedElementProps?.w) || flipbookDimensions?.width || 100,
      h: parseFloat(selectedElementProps?.h) || flipbookDimensions?.height || 100,
    };
  };

  // Increments / Decrements for Position X & Y
  const handleDecrementX = () => {
    if (isDimensionDisabled) return;
    const { x } = getLivePosition();
    updatePosition((x - 1).toString(), 'x');
  };

  const handleIncrementX = () => {
    if (isDimensionDisabled) return;
    const { x } = getLivePosition();
    updatePosition((x + 1).toString(), 'x');
  };

  const handleDecrementY = () => {
    if (isDimensionDisabled) return;
    const { y } = getLivePosition();
    updatePosition((y - 1).toString(), 'y');
  };

  const handleIncrementY = () => {
    if (isDimensionDisabled) return;
    const { y } = getLivePosition();
    updatePosition((y + 1).toString(), 'y');
  };

  // Dimension changes with aspect ratio lock support
  const handleWidthChange = (val) => {
    const newW = parseFloat(val);
    if (isNaN(newW) || newW <= 0) return;
    if (isAspectLocked) {
      const { w, h } = getLiveDimensions();
      if (w > 0 && h > 0) {
        const ratio = h / w;
        const newH = Number((newW * ratio).toFixed(1));
        updateDimensionWithScale({ width: newW, height: newH });
        return;
      }
    }
    updateDimensionWithScale(newW.toString(), 'width');
  };

  const handleHeightChange = (val) => {
    const newH = parseFloat(val);
    if (isNaN(newH) || newH <= 0) return;
    if (isAspectLocked) {
      const { w, h } = getLiveDimensions();
      if (w > 0 && h > 0) {
        const ratio = w / h;
        const newW = Number((newH * ratio).toFixed(1));
        updateDimensionWithScale({ width: newW, height: newH });
        return;
      }
    }
    updateDimensionWithScale(newH.toString(), 'height');
  };

  const handleDecrementW = () => {
    if (isDimensionDisabled) return;
    const { w, h } = getLiveDimensions();
    const newW = Math.max(1, Number((w - 1).toFixed(1)));
    if (isAspectLocked && w > 0 && h > 0) {
      const newH = Number(((newW / w) * h).toFixed(1));
      updateDimensionWithScale({ width: newW, height: newH });
    } else {
      updateDimensionWithScale(newW.toString(), 'width');
    }
  };

  const handleIncrementW = () => {
    if (isDimensionDisabled) return;
    const { w, h } = getLiveDimensions();
    const newW = Number((w + 1).toFixed(1));
    if (isAspectLocked && w > 0 && h > 0) {
      const newH = Number(((newW / w) * h).toFixed(1));
      updateDimensionWithScale({ width: newW, height: newH });
    } else {
      updateDimensionWithScale(newW.toString(), 'width');
    }
  };

  const handleDecrementH = () => {
    if (isDimensionDisabled) return;
    const { w, h } = getLiveDimensions();
    const newH = Math.max(1, Number((h - 1).toFixed(1)));
    if (isAspectLocked && w > 0 && h > 0) {
      const newW = Number(((newH / h) * w).toFixed(1));
      updateDimensionWithScale({ width: newW, height: newH });
    } else {
      updateDimensionWithScale(newH.toString(), 'height');
    }
  };

  const handleIncrementH = () => {
    if (isDimensionDisabled) return;
    const { w, h } = getLiveDimensions();
    const newH = Number((h + 1).toFixed(1));
    if (isAspectLocked && w > 0 && h > 0) {
      const newW = Number(((newH / h) * w).toFixed(1));
      updateDimensionWithScale({ width: newW, height: newH });
    } else {
      updateDimensionWithScale(newH.toString(), 'height');
    }
  };

  // Pointer scrub sliders for X, Y, Width, and Height (referencing CornerRadius scrub in Image properties)
  const handleScrubX = (e) => {
    if (isDimensionDisabled || e.target.tagName === 'INPUT') return;
    const { x } = getLivePosition();
    handleScrubHelper(e, x, (newVal) => {
      const val = Number(parseFloat(newVal).toFixed(1));
      updatePosition(val.toString(), 'x');
    }, 4);
  };

  const handleScrubY = (e) => {
    if (isDimensionDisabled || e.target.tagName === 'INPUT') return;
    const { y } = getLivePosition();
    handleScrubHelper(e, y, (newVal) => {
      const val = Number(parseFloat(newVal).toFixed(1));
      updatePosition(val.toString(), 'y');
    }, 4);
  };

  const handleScrubW = (e) => {
    if (isDimensionDisabled || e.target.tagName === 'INPUT') return;
    const { w, h } = getLiveDimensions();
    handleScrubHelper(e, w, (newVal) => {
      const newW = Math.max(1, Number(parseFloat(newVal).toFixed(1)));
      if (isAspectLocked && w > 0 && h > 0) {
        const newH = Math.max(1, Number(((newW / w) * h).toFixed(1)));
        updateDimensionWithScale({ width: newW, height: newH });
      } else {
        updateDimensionWithScale(newW.toString(), 'width');
      }
    }, 4);
  };

  const handleScrubH = (e) => {
    if (isDimensionDisabled || e.target.tagName === 'INPUT') return;
    const { w, h } = getLiveDimensions();
    handleScrubHelper(e, h, (newVal) => {
      const newH = Math.max(1, Number(parseFloat(newVal).toFixed(1)));
      if (isAspectLocked && w > 0 && h > 0) {
        const newW = Math.max(1, Number(((newH / h) * w).toFixed(1)));
        updateDimensionWithScale({ width: newW, height: newH });
      } else {
        updateDimensionWithScale(newH.toString(), 'height');
      }
    }, 4);
  };

  // Rotation dispatching
  const applyRotate = (angle, isFinal) => {
    if (onRotate) {
      onRotate(angle, isFinal);
    } else if (typeof window.editorRotate === 'function') {
      window.editorRotate(angle, isFinal);
    } else {
      window.dispatchEvent(new CustomEvent('editor-rotate', { detail: { angle, isFinal } }));
    }
  };

  const handleRotationBlur = () => {
    setIsEditingRotation(false);
    let val = parseInt(localRotation);
    if (isNaN(val)) val = 0;
    const wrappedVal = ((val % 360) + 360) % 360;
    setLiveRotation(wrappedVal);
    setLocalRotation(wrappedVal);
    applyRotate(wrappedVal, true);
  };

  // Scrub rotation horizontally with mouse drag
  const handleRotateMouseDown = (e) => {
    if (isDimensionDisabled) return;
    e.stopPropagation();
    e.preventDefault();
    setIsScrubbingRotate(true);
    hasRotatedMoved.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartAngle.current = liveRotation !== null ? liveRotation : 0;
    document.body.style.cursor = 'ew-resize';
  };

  useEffect(() => {
    if (!isScrubbingRotate) return;
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      if (Math.abs(deltaX) > 2) hasRotatedMoved.current = true;
      let newAngle = Math.round(dragStartAngle.current + deltaX);
      newAngle = ((newAngle % 360) + 360) % 360;
      setLiveRotation(newAngle);
      applyRotate(newAngle, false);
    };
    const handleMouseUp = () => {
      setIsScrubbingRotate(false);
      document.body.style.cursor = 'default';
      if (hasRotatedMoved.current) {
        applyRotate(liveRotation, true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbingRotate, liveRotation]);

  // Flip handlers
  const handleFlipH = () => {
    if (isDimensionDisabled) return;
    if (onFlipH) {
      onFlipH();
    } else if (typeof window.editorFlip === 'function') {
      window.editorFlip('h');
    } else {
      window.dispatchEvent(new CustomEvent('editor-flip', { detail: { direction: 'h' } }));
    }
  };

  const handleFlipV = () => {
    if (isDimensionDisabled) return;
    if (onFlipV) {
      onFlipV();
    } else if (typeof window.editorFlip === 'function') {
      window.editorFlip('v');
    } else {
      window.dispatchEvent(new CustomEvent('editor-flip', { detail: { direction: 'v' } }));
    }
  };

  return (
    <div className="bg-white px-[1.2vw] pt-[1.1vw] pb-[0.9vw] border-b border-gray-100 flex-shrink-0 select-none">
      {/* ── Title Header ── */}
      <div className="flex items-center gap-[0.8vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Transform</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      <div className="mt-[1vw] space-y-[0.6vw]">
        {/* ── Row 1: Position X & Size W ── */}
        <div className="flex items-center justify-between">
          {/* Position X */}
          <div className="flex items-center">
            <span className="text-[0.82vw] font-medium text-gray-800 w-[3.8vw]">Position</span>
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleDecrementX}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronLeft size="0.8vw" />
            </button>
            <div
              onPointerDown={handleScrubX}
              title="Drag horizontally to adjust X or type value"
              className={`w-[4.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-between px-[0.5vw] cursor-ew-resize select-none transition-colors ${
                isDimensionDisabled ? 'bg-gray-100/60 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-[#eaecee]'
              }`}
            >
              <span className="text-gray-800 font-semibold text-[0.78vw] cursor-ew-resize select-none">X</span>
              <DimensionInput
                targetId={selectedLayerId}
                targetAttr="x"
                className={`w-full text-right outline-none text-[0.8vw] font-medium cursor-text ${
                  isDimensionDisabled ? 'text-gray-400 cursor-not-allowed bg-transparent' : 'text-gray-700 bg-transparent'
                }`}
                value={convertValue(selectedElementProps?.x || 0)}
                readOnly={isDimensionDisabled}
                onChange={(val) => updatePosition(val, 'x')}
              />
            </div>
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleIncrementX}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronRight size="0.8vw" />
            </button>
          </div>

          {/* Size W */}
          <div className="flex items-center">
            <div className="flex items-center gap-[0.2vw] w-[3.4vw]">
              <span className="text-[0.82vw] font-medium text-gray-800">Size</span>
              <button
                type="button"
                onClick={handleToggleAspectLock}
                className={`p-[0.1vw] rounded transition-colors ${
                  isAspectLocked ? 'text-gray-900 bg-gray-200/80 hover:bg-gray-300/80' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                } ${isDimensionDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                title={isAspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
              >
                {isAspectLocked ? (
                  <Lock size="0.75vw" className="text-gray-900" />
                ) : (
                  <Unlock size="0.75vw" className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleDecrementW}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronLeft size="0.8vw" />
            </button>
            <div
              onPointerDown={handleScrubW}
              title={isAspectLocked ? "Drag horizontally to adjust Width and Height proportionally or type value" : "Drag horizontally to adjust Width or type value"}
              className={`w-[4.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-between px-[0.5vw] cursor-ew-resize select-none transition-colors ${
                isDimensionDisabled ? 'bg-gray-100/60 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-[#eaecee]'
              }`}
            >
              <span className="text-gray-800 font-semibold text-[0.78vw] cursor-ew-resize select-none">W</span>
              <DimensionInput
                targetId={selectedLayerId}
                targetAttr="width"
                className={`w-full text-right outline-none text-[0.8vw] font-medium cursor-text ${
                  isDimensionDisabled ? 'text-gray-400 cursor-not-allowed bg-transparent' : 'text-gray-700 bg-transparent'
                }`}
                value={convertValue(selectedElementProps?.w || flipbookDimensions?.width)}
                readOnly={isDimensionDisabled}
                onChange={handleWidthChange}
              />
            </div>
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleIncrementW}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronRight size="0.8vw" />
            </button>
          </div>
        </div>

        {/* ── Row 2: Position Y & Size H ── */}
        <div className="flex items-center justify-between">
          {/* Position Y */}
          <div className="flex items-center">
            <div className="w-[3.8vw]" />
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleDecrementY}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronLeft size="0.8vw" />
            </button>
            <div
              onPointerDown={handleScrubY}
              title="Drag horizontally to adjust Y or type value"
              className={`w-[4.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-between px-[0.5vw] cursor-ew-resize select-none transition-colors ${
                isDimensionDisabled ? 'bg-gray-100/60 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-[#eaecee]'
              }`}
            >
              <span className="text-gray-800 font-semibold text-[0.78vw] cursor-ew-resize select-none">Y</span>
              <DimensionInput
                targetId={selectedLayerId}
                targetAttr="y"
                className={`w-full text-right outline-none text-[0.8vw] font-medium cursor-text ${
                  isDimensionDisabled ? 'text-gray-400 cursor-not-allowed bg-transparent' : 'text-gray-700 bg-transparent'
                }`}
                value={convertValue(selectedElementProps?.y || 0)}
                readOnly={isDimensionDisabled}
                onChange={(val) => updatePosition(val, 'y')}
              />
            </div>
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleIncrementY}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronRight size="0.8vw" />
            </button>
          </div>

          {/* Size H */}
          <div className="flex items-center">
            <div className="w-[3.4vw]" />
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleDecrementH}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronLeft size="0.8vw" />
            </button>
            <div
              onPointerDown={handleScrubH}
              title={isAspectLocked ? "Drag horizontally to adjust Height and Width proportionally or type value" : "Drag horizontally to adjust Height or type value"}
              className={`w-[4.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-between px-[0.5vw] cursor-ew-resize select-none transition-colors ${
                isDimensionDisabled ? 'bg-gray-100/60 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-[#eaecee]'
              }`}
            >
              <span className="text-gray-800 font-semibold text-[0.78vw] cursor-ew-resize select-none">H</span>
              <DimensionInput
                targetId={selectedLayerId}
                targetAttr="height"
                className={`w-full text-right outline-none text-[0.8vw] font-medium cursor-text ${
                  isDimensionDisabled ? 'text-gray-400 cursor-not-allowed bg-transparent' : 'text-gray-700 bg-transparent'
                }`}
                value={convertValue(selectedElementProps?.h || flipbookDimensions?.height)}
                readOnly={isDimensionDisabled}
                onChange={handleHeightChange}
              />
            </div>
            <button
              type="button"
              disabled={isDimensionDisabled}
              onClick={handleIncrementH}
              className={`w-[0.8vw] h-[1.8vw] flex items-center justify-center transition-colors ${
                isDimensionDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-black cursor-pointer'
              }`}
            >
              <ChevronRight size="0.8vw" />
            </button>
          </div>
        </div>

        {/* ── Row 3: Rotate & Flips ── */}
        <div className="flex items-center justify-between pt-[0.2vw]">
          {/* Left: Rotate */}
          <div className="flex items-center">
            <span className="text-[0.82vw] font-medium text-gray-800 w-[3.8vw]">Rotate :</span>
            <div className="w-[0.8vw]" />
            <div
              onMouseDown={handleRotateMouseDown}
              title="Drag horizontally to rotate or type angle"
              className={`w-[4.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-between px-[0.5vw] cursor-ew-resize ${
                isDimensionDisabled ? 'bg-gray-100/60 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-[#eaecee]'
              }`}
            >
              <Icon icon="icon-park-outline:rotate" width="1.05vw" height="1.05vw" className="text-gray-800 flex-shrink-0" />
              <input
                type="text"
                disabled={isDimensionDisabled}
                value={isEditingRotation ? localRotation : (liveRotation !== null ? liveRotation : 0)}
                onFocus={() => {
                  if (isDimensionDisabled) return;
                  setIsEditingRotation(true);
                  setLocalRotation(liveRotation !== null ? liveRotation : 0);
                }}
                onBlur={handleRotationBlur}
                onChange={(e) => {
                  if (isDimensionDisabled) return;
                  const val = e.target.value.replace(/[^0-9-]/g, '');
                  setLocalRotation(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRotationBlur();
                    e.target.blur();
                  }
                }}
                className="w-full text-right font-medium text-[0.8vw] text-gray-700 bg-transparent outline-none disabled:text-gray-400 cursor-text"
              />
            </div>
            <div className="w-[0.8vw]" />
          </div>

          {/* Right: Flip Horizontal & Flip Vertical */}
          <div className="flex items-center">
            <div className="w-[3.4vw] flex items-center">
              <button
                type="button"
                onClick={handleFlipH}
                disabled={isDimensionDisabled}
                title="Flip Horizontal"
                className={`w-[1.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-center transition-colors ${
                  isDimensionDisabled ? 'bg-gray-100/60 text-gray-300 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-gray-200 active:bg-gray-300 text-gray-800 cursor-pointer shadow-2xs'
                }`}
              >
                <Icon icon="vaadin:flip-h" width="1.05vw" height="1.05vw" />
              </button>
            </div>
            <div className="w-[0.8vw]" />
            <div className="w-[4.8vw] flex items-center">
              <button
                type="button"
                onClick={handleFlipV}
                disabled={isDimensionDisabled}
                title="Flip Vertical"
                className={`w-[1.8vw] h-[1.8vw] rounded-[0.35vw] flex items-center justify-center transition-colors ${
                  isDimensionDisabled ? 'bg-gray-100/60 text-gray-300 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-gray-200 active:bg-gray-300 text-gray-800 cursor-pointer shadow-2xs'
                }`}
              >
                <Icon icon="vaadin:flip-v" width="1.05vw" height="1.05vw" />
              </button>
            </div>
            <div className="w-[0.8vw]" />
          </div>
        </div>
      </div>
      <style>{`
        .virtual-scrub-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 0.2vw 0.4vw rgba(0,0,0,0.4));
        }
        body.is-scrubbing * {
          cursor: ew-resize !important;
          user-select: none !important;
        }
      `}</style>
    </div>
  );
};

export default TransformProperties;

