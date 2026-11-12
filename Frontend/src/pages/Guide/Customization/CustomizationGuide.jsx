import React, { useEffect, useRef } from 'react';
import CustomBgTheme, { customBgThemeSections } from './CustomBgTheme';
import CustomLayoutSettings, { customLayoutSettingsSections } from './CustomLayoutSettings';
import CustomLeadForm, { customLeadFormSections } from './CustomLeadForm';
import CustomVisibilityPrivacy, { customVisibilityPrivacySections } from './CustomVisibilityPrivacy';
import CustomPreviewShareExport, { customPreviewShareExportSections } from './CustomPreviewShareExport';
import CustomDevicesViewports, { customDevicesViewportsSections } from './CustomDevicesViewports';
import CustomScrollbar from '../../../components/CustomScrollbar';

export const customizationGuideSections = [
  ...customBgThemeSections,
  ...customLayoutSettingsSections,
  ...customLeadFormSections,
  ...customVisibilityPrivacySections,
  ...customPreviewShareExportSections,
  ...customDevicesViewportsSections
];

export default function CustomizationGuide({ selectedSubItem }) {
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
        <CustomBgTheme id="custom-bg-theme-layouts" />
        <CustomLayoutSettings id="custom-layout-settings" />
        <CustomLeadForm id="custom-lead-form" />
        <CustomVisibilityPrivacy id="custom-visibility-privacy" />
        <CustomPreviewShareExport id="custom-preview-share-export" />
        <CustomDevicesViewports id="custom-devices-viewports" />
      </div>
    </CustomScrollbar>
  );
}
