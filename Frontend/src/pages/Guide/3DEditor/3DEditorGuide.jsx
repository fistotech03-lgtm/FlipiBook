import React from 'react';
import ThreeDStudioCreateUpload, { threeDStudioCreateUploadSections } from './ThreeDStudioCreateUpload';
import ThreeDStudioMaterialTexture, { threeDStudioMaterialTextureSections } from './ThreeDStudioMaterialTexture';
import ThreeDStudioLightingEnvironments, { threeDStudioLightingEnvironmentsSections } from './ThreeDStudioLightingEnvironments';
import ThreeDStudioRenderSaveExport, { threeDStudioRenderSaveExportSections } from './ThreeDStudioRenderSaveExport';

export const threeDStudioEditorSections = [
  ...threeDStudioCreateUploadSections,
  ...threeDStudioMaterialTextureSections,
  ...threeDStudioLightingEnvironmentsSections,
  ...threeDStudioRenderSaveExportSections
];

export default function ThreeDStudioEditorGuide({ selectedSubItem }) {
  if (threeDStudioCreateUploadSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDStudioCreateUpload selectedSubItem={selectedSubItem} />;
  }
  if (threeDStudioMaterialTextureSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDStudioMaterialTexture selectedSubItem={selectedSubItem} />;
  }
  if (threeDStudioLightingEnvironmentsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDStudioLightingEnvironments selectedSubItem={selectedSubItem} />;
  }
  if (threeDStudioRenderSaveExportSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDStudioRenderSaveExport selectedSubItem={selectedSubItem} />;
  }
  return null;
}
