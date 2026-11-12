import React, { useEffect, useRef } from 'react';
import ThreeDStudioCreateUpload, { threeDStudioCreateUploadSections } from './ThreeDStudioCreateUpload';
import ThreeDStudioMaterialTexture, { threeDStudioMaterialTextureSections } from './ThreeDStudioMaterialTexture';
import ThreeDStudioLightingEnvironments, { threeDStudioLightingEnvironmentsSections } from './ThreeDStudioLightingEnvironments';
import ThreeDStudioRenderSaveExport, { threeDStudioRenderSaveExportSections } from './ThreeDStudioRenderSaveExport';
import CustomScrollbar from '../../../components/CustomScrollbar';

export const threeDStudioEditorSections = [
  ...threeDStudioCreateUploadSections,
  ...threeDStudioMaterialTextureSections,
  ...threeDStudioLightingEnvironmentsSections,
  ...threeDStudioRenderSaveExportSections
];

export default function ThreeDStudioEditorGuide({ selectedSubItem }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!selectedSubItem) return;
    const targetElement = document.getElementById(selectedSubItem);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSubItem]);

  return (
    <CustomScrollbar
      ref={containerRef}
      color="#d1d5db"
      hoverColor="#9ca3af"
      width="0.25vw"
      className="w-full h-full"
    >
      <div className="w-full flex flex-col divide-y divide-gray-200">
        <ThreeDStudioCreateUpload id="3d-studio-create-upload" />
        <ThreeDStudioMaterialTexture id="3d-studio-material-texture" />
        <ThreeDStudioLightingEnvironments id="3d-studio-lighting-environments" />
        <ThreeDStudioRenderSaveExport id="3d-studio-render-save-export" />
      </div>
    </CustomScrollbar>
  );
}
