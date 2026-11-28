import React, { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Model3DPreviewModal from './Interaction3DPreview';
import Model3DEditor from './Model3DEditor';

const DEFAULT_3D_SETTINGS = {
  shadowStrength: 80,
  shadowSoftness: 80,
  lightIntensity: 1,
  addShadow: true,
  autoRotate: true,
  autoRotateSpeed: 1.5,
  lockMaxZoom: true,
  maxZoom: 4.5,
  limitHorizontalRotation: false,
  leftRotationLimit: 180,
  rightRotationLimit: 180,
  limitVerticalRotation: false,
  upperViewLimit: 180,
  lowerViewLimit: 180,
  limitZoom: false,
  limitZoomIn: 80,
  limitZoomOut: 80,
  enablePan: true,
  initialRotation: { x: 0, y: 0, z: 0 },
  modelScale: 1,
  arHorizontalSurface: true,
  arVerticalSurface: true,
  bgType: 'Solid',
  bgColor: '#ffffff',
  customBg: false,
  enableAR: true,
  qrText: 'Scan Me',
  qrColor: '#000000',
  qrBgType: 'Solid',
  qrBgColor: '#ffffff',
  qrLevel: 'M',
  qrDotType: 'square',
  qrCornerSquareType: 'square',
  qrCornerDotType: 'square',
  qrLogo: null,
  topText: '',
};

/**
 * Unified 3D Interaction Popup Settings Modal combining the live 3D Preview
 * (left) and Model3DEditor controls (right) in a single centered modal.
 */
const Interaction3DSettingsModal = ({
  isOpen,
  onClose,
  isARInteraction = false,
  dataUrl,
  vId,
  hotspots,
  activeHotspotId,
  onHotspotClick,
  shadowStrength, setShadowStrength,
  shadowSoftness, setShadowSoftness,
  lightIntensity, setLightIntensity,
  addShadow, setAddShadow,
  autoRotate, setAutoRotate,
  autoRotateSpeed, setAutoRotateSpeed,
  lockMaxZoom, setLockMaxZoom,
  maxZoom, setMaxZoom,
  limitHorizontalRotation, setLimitHorizontalRotation,
  leftRotationLimit, setLeftRotationLimit,
  rightRotationLimit, setRightRotationLimit,
  limitVerticalRotation, setLimitVerticalRotation,
  upperViewLimit, setUpperViewLimit,
  lowerViewLimit, setLowerViewLimit,
  limitZoom, setLimitZoom,
  limitZoomIn, setLimitZoomIn,
  limitZoomOut, setLimitZoomOut,
  enablePan, setEnablePan,
  initialRotation, setInitialRotation,
  modelScale, setModelScale,
  arHorizontalSurface, setArHorizontalSurface,
  arVerticalSurface, setArVerticalSurface,
  bgType, setBgType,
  bgColor, setBgColor,
  customBg, setCustomBg,
  enableAR, setEnableAR,
  qrText, setQrText,
  qrColor, setQrColor,
  qrBgType, setQrBgType,
  qrBgColor, setQrBgColor,
  qrLevel, setQrLevel,
  qrDotType, setQrDotType,
  qrCornerSquareType, setQrCornerSquareType,
  qrCornerDotType, setQrCornerDotType,
  qrLogo, setQrLogo,
  topText, setTopText,
  bottomText, setBottomText,
}) => {
  const snapshotRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      snapshotRef.current = {
        shadowStrength,
        shadowSoftness,
        lightIntensity,
        addShadow,
        autoRotate,
        autoRotateSpeed,
        lockMaxZoom,
        maxZoom,
        limitHorizontalRotation,
        leftRotationLimit,
        rightRotationLimit,
        limitVerticalRotation,
        upperViewLimit,
        lowerViewLimit,
        limitZoom,
        limitZoomIn,
        limitZoomOut,
        enablePan,
        initialRotation,
        modelScale,
        arHorizontalSurface,
        arVerticalSurface,
        bgType,
        bgColor,
        customBg,
        enableAR,
        qrText,
        qrColor,
        qrBgType,
        qrBgColor,
        qrLevel,
        qrDotType,
        qrCornerSquareType,
        qrCornerDotType,
        qrLogo,
        topText,
        bottomText,
      };
    }
    // Capture snapshot only when modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const applyValues = (vals) => {
    setShadowStrength(vals.shadowStrength);
    setShadowSoftness(vals.shadowSoftness);
    setLightIntensity?.(vals.lightIntensity);
    setAddShadow?.(vals.addShadow);
    setAutoRotate(vals.autoRotate);
    setAutoRotateSpeed(vals.autoRotateSpeed);
    setLockMaxZoom(vals.lockMaxZoom);
    setMaxZoom(vals.maxZoom);
    setLimitHorizontalRotation?.(vals.limitHorizontalRotation);
    setLeftRotationLimit?.(vals.leftRotationLimit);
    setRightRotationLimit?.(vals.rightRotationLimit);
    setLimitVerticalRotation?.(vals.limitVerticalRotation);
    setUpperViewLimit?.(vals.upperViewLimit);
    setLowerViewLimit?.(vals.lowerViewLimit);
    setLimitZoom?.(vals.limitZoom);
    setLimitZoomIn?.(vals.limitZoomIn);
    setLimitZoomOut?.(vals.limitZoomOut);
    setEnablePan?.(vals.enablePan);
    setInitialRotation?.(vals.initialRotation);
    setModelScale?.(vals.modelScale);
    setArHorizontalSurface?.(vals.arHorizontalSurface);
    setArVerticalSurface?.(vals.arVerticalSurface);
    setBgType(vals.bgType);
    setBgColor(vals.bgColor);
    setCustomBg(vals.customBg);
    setEnableAR(vals.enableAR);
    setQrText(vals.qrText);
    setQrColor(vals.qrColor);
    setQrBgType(vals.qrBgType);
    setQrBgColor(vals.qrBgColor);
    setQrLevel(vals.qrLevel);
    setQrDotType(vals.qrDotType);
    setQrCornerSquareType(vals.qrCornerSquareType);
    setQrCornerDotType(vals.qrCornerDotType);
    setQrLogo(vals.qrLogo);
    setTopText(vals.topText);
    if (vals.bottomText !== undefined) {
      setBottomText(vals.bottomText);
    }
  };

  const handleReset = () => {
    applyValues(DEFAULT_3D_SETTINGS);
  };

  const handleCancel = () => {
    if (snapshotRef.current) {
      applyValues(snapshotRef.current);
    }
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-[1.5vw]"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-[78vw] h-full max-h-[84vh] bg-white rounded-[1vw] shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Body: Left Preview + Right Editor */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Side: Header + Preview */}
          <div className="flex-1 min-w-0 flex flex-col p-[1.5vw] pb-[0.8vw] bg-white">
            <div className="flex items-start justify-between mb-[0.9vw]">
              <div>
                <h2 className="text-[1.15vw] font-bold text-gray-900 leading-tight">3D Model Settings</h2>
                <p className="text-[0.76vw] text-gray-400 mt-[0.15vw]">
                  Customize your interactive model experience.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[0.4vw] text-[0.78vw] font-semibold text-gray-700 mb-[0.5vw]">
              <Icon icon="lucide:eye" className="w-[0.95vw] h-[0.95vw] text-gray-600" />
              <span>Preview</span>
            </div>

            <div className="flex-1 min-h-0">
              <Model3DPreviewModal
                isOpen={isOpen}
                dataUrl={dataUrl}
                shadowStrength={shadowStrength}
                shadowSoftness={shadowSoftness}
                lightIntensity={lightIntensity}
                addShadow={addShadow}
                autoRotate={autoRotate}
                autoRotateSpeed={autoRotateSpeed}
                lockMaxZoom={lockMaxZoom}
                maxZoom={maxZoom}
                limitHorizontalRotation={limitHorizontalRotation}
                leftRotationLimit={leftRotationLimit}
                rightRotationLimit={rightRotationLimit}
                limitVerticalRotation={limitVerticalRotation}
                upperViewLimit={upperViewLimit}
                lowerViewLimit={lowerViewLimit}
                limitZoom={limitZoom}
                limitZoomIn={limitZoomIn}
                limitZoomOut={limitZoomOut}
                enablePan={enablePan}
                initialRotation={initialRotation}
                modelScale={modelScale}
                arHorizontalSurface={arHorizontalSurface}
                arVerticalSurface={arVerticalSurface}
                bgType={bgType}
                bgColor={bgColor}
                customBg={customBg}
                enableAR={enableAR}
                setBgColor={setBgColor}
                qrText={qrText}
                qrColor={qrColor}
                qrBgType={qrBgType}
                qrBgColor={qrBgColor}
                qrLevel={qrLevel}
                qrDotType={qrDotType}
                qrCornerSquareType={qrCornerSquareType}
                qrCornerDotType={qrCornerDotType}
                qrLogo={qrLogo}
                topText={topText}
                bottomText={bottomText}
                vId={vId}
                hotspots={hotspots}
                activeHotspotId={activeHotspotId}
                onHotspotClick={onHotspotClick}
              />
            </div>
          </div>

          {/* Right Side: Editor Controls */}
          <div className="w-[23vw] shrink-0 border-l border-gray-200 bg-[#fbfbfb] flex flex-col min-h-0 overflow-hidden">
            <Model3DEditor
              embeddedInModal={true}
              isARInteraction={isARInteraction}
              onClose={onClose}
              shadowStrength={shadowStrength} setShadowStrength={setShadowStrength}
              shadowSoftness={shadowSoftness} setShadowSoftness={setShadowSoftness}
              lightIntensity={lightIntensity} setLightIntensity={setLightIntensity}
              addShadow={addShadow} setAddShadow={setAddShadow}
              autoRotate={autoRotate} setAutoRotate={setAutoRotate}
              autoRotateSpeed={autoRotateSpeed} setAutoRotateSpeed={setAutoRotateSpeed}
              lockMaxZoom={lockMaxZoom} setLockMaxZoom={setLockMaxZoom}
              maxZoom={maxZoom} setMaxZoom={setMaxZoom}
              limitHorizontalRotation={limitHorizontalRotation} setLimitHorizontalRotation={setLimitHorizontalRotation}
              leftRotationLimit={leftRotationLimit} setLeftRotationLimit={setLeftRotationLimit}
              rightRotationLimit={rightRotationLimit} setRightRotationLimit={setRightRotationLimit}
              limitVerticalRotation={limitVerticalRotation} setLimitVerticalRotation={setLimitVerticalRotation}
              upperViewLimit={upperViewLimit} setUpperViewLimit={setUpperViewLimit}
              lowerViewLimit={lowerViewLimit} setLowerViewLimit={setLowerViewLimit}
              limitZoom={limitZoom} setLimitZoom={setLimitZoom}
              limitZoomIn={limitZoomIn} setLimitZoomIn={setLimitZoomIn}
              limitZoomOut={limitZoomOut} setLimitZoomOut={setLimitZoomOut}
              enablePan={enablePan} setEnablePan={setEnablePan}
              initialRotation={initialRotation} setInitialRotation={setInitialRotation}
              modelScale={modelScale} setModelScale={setModelScale}
              arHorizontalSurface={arHorizontalSurface} setArHorizontalSurface={setArHorizontalSurface}
              arVerticalSurface={arVerticalSurface} setArVerticalSurface={setArVerticalSurface}
              bgType={bgType} setBgType={setBgType}
              bgColor={bgColor} setBgColor={setBgColor}
              customBg={customBg} setCustomBg={setCustomBg}
              enableAR={enableAR} setEnableAR={setEnableAR}
              qrText={qrText} setQrText={setQrText}
              qrColor={qrColor} setQrColor={setQrColor}
              qrBgType={qrBgType} setQrBgType={setQrBgType}
              qrBgColor={qrBgColor} setQrBgColor={setQrBgColor}
              qrLevel={qrLevel} setQrLevel={setQrLevel}
              qrDotType={qrDotType} setQrDotType={setQrDotType}
              qrCornerSquareType={qrCornerSquareType} setQrCornerSquareType={setQrCornerSquareType}
              qrCornerDotType={qrCornerDotType} setQrCornerDotType={setQrCornerDotType}
              qrLogo={qrLogo} setQrLogo={setQrLogo}
              topText={topText} setTopText={setTopText}
              bottomText={bottomText} setBottomText={setBottomText}
              dataUrl={dataUrl}
              vId={vId}
              hotspots={hotspots}
              activeHotspotId={activeHotspotId}
              onHotspotClick={onHotspotClick}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-[1.5vw] py-[0.85vw] border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-[0.9vw] py-[0.45vw] rounded-[0.45vw] border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[0.78vw] font-medium flex items-center gap-[0.4vw] transition-colors cursor-pointer"
          >
            <Icon icon="lucide:rotate-ccw" className="w-[0.9vw] h-[0.9vw]" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-[0.65vw]">
            <button
              type="button"
              onClick={handleCancel}
              className="px-[1.1vw] py-[0.45vw] rounded-[0.45vw] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[0.78vw] font-medium flex items-center gap-[0.35vw] transition-colors cursor-pointer"
            >
              <Icon icon="lucide:x" className="w-[0.9vw] h-[0.9vw]" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-[1.2vw] py-[0.45vw] rounded-[0.45vw] bg-gray-900 hover:bg-black text-white text-[0.78vw] font-medium flex items-center gap-[0.35vw] transition-colors shadow-xs cursor-pointer"
            >
              <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interaction3DSettingsModal;
