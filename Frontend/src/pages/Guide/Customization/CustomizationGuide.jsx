import React from 'react';
import CustomBgTheme, { customBgThemeSections } from './CustomBgTheme';
import CustomLayoutSettings, { customLayoutSettingsSections } from './CustomLayoutSettings';
import CustomLeadForm, { customLeadFormSections } from './CustomLeadForm';
import CustomVisibilityPrivacy, { customVisibilityPrivacySections } from './CustomVisibilityPrivacy';
import CustomPreviewShareExport, { customPreviewShareExportSections } from './CustomPreviewShareExport';
import CustomDevicesViewports, { customDevicesViewportsSections } from './CustomDevicesViewports';

export const customizationGuideSections = [
  ...customBgThemeSections,
  ...customLayoutSettingsSections,
  ...customLeadFormSections,
  ...customVisibilityPrivacySections,
  ...customPreviewShareExportSections,
  ...customDevicesViewportsSections
];

export default function CustomizationGuide({ selectedSubItem }) {
  if (customBgThemeSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <CustomBgTheme selectedSubItem={selectedSubItem} />;
  }
  if (customLayoutSettingsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <CustomLayoutSettings selectedSubItem={selectedSubItem} />;
  }
  if (customLeadFormSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <CustomLeadForm selectedSubItem={selectedSubItem} />;
  }
  if (customVisibilityPrivacySections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <CustomVisibilityPrivacy selectedSubItem={selectedSubItem} />;
  }
  if (customPreviewShareExportSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <CustomPreviewShareExport selectedSubItem={selectedSubItem} />;
  }
  if (customDevicesViewportsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <CustomDevicesViewports selectedSubItem={selectedSubItem} />;
  }
  return null;
}
