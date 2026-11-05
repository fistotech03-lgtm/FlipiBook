import React from 'react';
import ThreeDModelHierarchy, { threeDModelHierarchySections } from './ThreeDModelHierarchy';
import ThreeDMaterialsTextures, { threeDMaterialsTexturesSections } from './ThreeDMaterialsTextures';
import ThreeDLightingEnvironment, { threeDLightingEnvironmentSections } from './ThreeDLightingEnvironment';
import ThreeDCameraFraming, { threeDCameraFramingSections } from './ThreeDCameraFraming';
import ThreeDHotspotsAnimation, { threeDHotspotsAnimationSections } from './ThreeDHotspotsAnimation';
import ThreeDCanvasExport, { threeDCanvasExportSections } from './ThreeDCanvasExport';

export const threeDEditorGuideSections = [
  ...threeDModelHierarchySections,
  ...threeDMaterialsTexturesSections,
  ...threeDLightingEnvironmentSections,
  ...threeDCameraFramingSections,
  ...threeDHotspotsAnimationSections,
  ...threeDCanvasExportSections
];

export default function ThreeDEditorGuide({ selectedSubItem }) {
  if (threeDModelHierarchySections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDModelHierarchy selectedSubItem={selectedSubItem} />;
  }
  if (threeDMaterialsTexturesSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDMaterialsTextures selectedSubItem={selectedSubItem} />;
  }
  if (threeDLightingEnvironmentSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDLightingEnvironment selectedSubItem={selectedSubItem} />;
  }
  if (threeDCameraFramingSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDCameraFraming selectedSubItem={selectedSubItem} />;
  }
  if (threeDHotspotsAnimationSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDHotspotsAnimation selectedSubItem={selectedSubItem} />;
  }
  if (threeDCanvasExportSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDCanvasExport selectedSubItem={selectedSubItem} />;
  }
  return null;
}
