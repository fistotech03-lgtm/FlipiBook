import React from 'react';
import LayoutBackground, { layoutBackgroundSections } from './LayoutBackground';
import LayoutDesign, { layoutDesignSections } from './LayoutDesign';
import LayoutSettings, { layoutSettingsSections } from './LayoutSettings';
import LayoutBookAppearance, { layoutBookAppearanceSections } from './LayoutBookAppearance';
import LayoutLeadForm, { layoutLeadFormSections } from './LayoutLeadForm';
import LayoutVisibilityPrivacy, { layoutVisibilityPrivacySections } from './LayoutVisibilityPrivacy';
import LayoutAnalytics, { layoutAnalyticsSections } from './LayoutAnalytics';
import LayoutBranding, { layoutBrandingSections } from './LayoutBranding';

export const layoutEditorGuideSections = [
  ...layoutBackgroundSections,
  ...layoutDesignSections,
  ...layoutSettingsSections,
  ...layoutBookAppearanceSections,
  ...layoutLeadFormSections,
  ...layoutVisibilityPrivacySections,
  ...layoutAnalyticsSections,
  ...layoutBrandingSections
];

export default function LayoutEditorGuide({ selectedSubItem }) {
  if (layoutBackgroundSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutBackground selectedSubItem={selectedSubItem} />;
  }
  if (layoutDesignSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutDesign selectedSubItem={selectedSubItem} />;
  }
  if (layoutSettingsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutSettings selectedSubItem={selectedSubItem} />;
  }
  if (layoutBookAppearanceSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutBookAppearance selectedSubItem={selectedSubItem} />;
  }
  if (layoutLeadFormSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutLeadForm selectedSubItem={selectedSubItem} />;
  }
  if (layoutVisibilityPrivacySections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutVisibilityPrivacy selectedSubItem={selectedSubItem} />;
  }
  if (layoutAnalyticsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutAnalytics selectedSubItem={selectedSubItem} />;
  }
  if (layoutBrandingSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <LayoutBranding selectedSubItem={selectedSubItem} />;
  }
  return null;
}
