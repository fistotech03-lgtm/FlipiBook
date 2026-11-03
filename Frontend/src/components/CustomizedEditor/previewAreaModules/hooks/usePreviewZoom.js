import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export const usePreviewZoom = ({
  zoom = 1.0,
  activeDevice = 'Desktop',
  containerRef,
  screenRef,
  baseDimensions,
  isSinglePage,
  isTurnJs,
  isSidebarOpen,
  settings,
  bookRef,
  isFlippingRef,
  useNativeFullscreen = false
}) => {
  const [deviceZoom, setDeviceZoom] = useState({ Desktop: zoom, Tablet: zoom, Mobile: zoom });
  const manualZoom = deviceZoom[activeDevice] ?? zoom;

  const setManualZoom = useCallback((val) => {
    setDeviceZoom(prev => {
      let newZoom = typeof val === 'function' ? val(prev[activeDevice] ?? zoom) : val;
      return { ...prev, [activeDevice]: newZoom };
    });
  }, [activeDevice, zoom]);

  const manualZoomRef = useRef(manualZoom);
  useEffect(() => { manualZoomRef.current = manualZoom; }, [manualZoom]);

  const [interactionZoom, setInteractionZoom] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [fitScale, setFitScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [actualPhysicalZoom, setActualPhysicalZoom] = useState(1);
  const [WIDTH, setWIDTH] = useState(400);
  const [HEIGHT, setHEIGHT] = useState(566);

  const currentZoom = useMemo(() => manualZoom * (activeDevice === 'Desktop' ? 1 : fitScale), [manualZoom, fitScale, activeDevice]);

  useEffect(() => {
    setManualZoom(zoom);
  }, [zoom, setManualZoom]);

  // Keyboard zoom & pinch-to-zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        setManualZoom(prev => {
          if (e.key === '0') return 1;
          const newZoom = (e.key === '=' || e.key === '+') ? prev + 0.05 : prev - 0.05;
          return Math.max(0.5, Math.min(newZoom, 4));
        });
      }
    };

    let pinchStartDist = null;
    let pinchStartZoom = 1;

    const getPinchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const isInsideFlipbook = e.target.closest?.('.turn-book, #turn-book, [data-turn-book], .flipbook-magazine-wrapper, .fbe-book');
        if (!isInsideFlipbook) return;
        pinchStartDist = getPinchDist(e.touches);
        pinchStartZoom = manualZoomRef.current ?? 1;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStartDist !== null) {
        e.preventDefault();
        const dist = getPinchDist(e.touches);
        const ratio = dist / pinchStartDist;
        const newZoom = Math.max(0.5, Math.min(pinchStartZoom * ratio, 4));
        setManualZoom(newZoom);
      }
    };

    const handleTouchEnd = () => {
      pinchStartDist = null;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, setManualZoom]);

  // Wheel zoom / flip
  useEffect(() => {
    const handleWheel = (e) => {
      if (!settings?.navigation?.mouseWheel) return;

      const target = e.target;
      const isInsideFlipbook = target.closest?.('.turn-book, #turn-book, [data-turn-book], .flipbook-magazine-wrapper, .fbe-book, .fbe-wrapper, [data-fbe]');
      if (!isInsideFlipbook) return;

      if (Math.abs(e.deltaY) < 10) return;

      if (isFlippingRef?.current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      if (e.deltaY > 0) {
        bookRef.current?.pageFlip()?.flipNext();
      } else if (e.deltaY < 0) {
        bookRef.current?.pageFlip()?.flipPrev();
      }

      if (isFlippingRef) {
        isFlippingRef.current = true;
        setTimeout(() => {
          if (isFlippingRef) isFlippingRef.current = false;
        }, 300);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [settings?.navigation?.mouseWheel, bookRef, isFlippingRef]);

  // ResizeObserver for fitting dimensions
  useEffect(() => {
    if (!screenRef.current) {
      setFitScale(1);
      return;
    }

    let rafId = null;

    const computeFitScale = () => {
      const screen = screenRef.current;
      if (!screen) return;

      const { clientWidth, clientHeight } = screen;
      if (!clientWidth || !clientHeight) return;

      const isCurrentlyFullscreen = (document.fullscreenElement === containerRef.current) || isFullscreen;

      const wFactor = 0.70;
      const hFactor = 0.80;

      const availableW = clientWidth * wFactor;
      const availableH = clientHeight * hFactor;

      const baseZoom = manualZoom;
      const availablePageW = isSinglePage ? availableW : availableW / 2;
      const availablePageH = availableH;

      const baseW = (baseDimensions && Number.isFinite(baseDimensions.width) && baseDimensions.width > 0) ? baseDimensions.width : 210;
      const baseH = (baseDimensions && Number.isFinite(baseDimensions.height) && baseDimensions.height > 0) ? baseDimensions.height : 297;

      const scaleX = availablePageW / baseW;
      const scaleY = availablePageH / baseH;
      const scale = Math.min(scaleX, scaleY);

      const physicalZoom = Number.isFinite(baseZoom) && baseZoom > 0 ? baseZoom : 1;

      if (Number.isFinite(scale) && scale > 0) {
        const newW = Math.round(baseW * scale * physicalZoom);
        const newH = Math.round(baseH * scale * physicalZoom);
        if (newW > 10 && newH > 10) {
          setWIDTH(prev => (Math.abs(prev - newW) >= 2 ? newW : prev));
          setHEIGHT(prev => (Math.abs(prev - newH) >= 2 ? newH : prev));
          setActualPhysicalZoom(prev => (Math.abs(prev - physicalZoom) > 0.01 ? physicalZoom : prev));
        }
      }
    };

    const scheduleCompute = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computeFitScale);
    };

    const observer = new ResizeObserver(scheduleCompute);
    observer.observe(screenRef.current);

    const onFSChange = () => {
      scheduleCompute();
    };
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);

    scheduleCompute();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
    };
  }, [activeDevice, isSidebarOpen, isFullscreen, zoom, manualZoom, interactionZoom, baseDimensions?.width, baseDimensions?.height, isTurnJs, isSinglePage, screenRef, containerRef]);

  const handleZoomIn = useCallback(() => setManualZoom(prev => Math.min(prev + 0.05, 2)), [setManualZoom]);
  const handleZoomOut = useCallback(() => setManualZoom(prev => Math.max(prev - 0.05, 0.5)), [setManualZoom]);

  const handleFullScreen = useCallback(() => {
    if (!isFullscreen) {
      if (useNativeFullscreen && containerRef.current) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [useNativeFullscreen, isFullscreen, containerRef]);

  useEffect(() => {
    if (!useNativeFullscreen) return;
    const onFSChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, [useNativeFullscreen, containerRef]);

  return {
    manualZoom,
    setManualZoom,
    manualZoomRef,
    currentZoom,
    fitScale,
    interactionZoom,
    setInteractionZoom,
    activeTooltip,
    setActiveTooltip,
    isFullscreen,
    setIsFullscreen,
    actualPhysicalZoom,
    WIDTH,
    HEIGHT,
    handleZoomIn,
    handleZoomOut,
    handleFullScreen
  };
};

export default usePreviewZoom;
