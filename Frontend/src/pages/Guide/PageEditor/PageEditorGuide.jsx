import React from 'react';
import PageSettings, { pageSettingsSections } from './PageSettings';
import PageMedia, { pageMediaSections } from './PageMedia';
import PageShapesGrid, { pageShapesGridSections } from './PageShapesGrid';
import PageMapsQr, { pageMapsQrSections } from './PageMapsQr';
import PageTypographySlideshow, { pageTypographySlideshowSections } from './PageTypographySlideshow';
import PageTables, { pageTablesSections } from './PageTables';
import PageAudioButtons, { pageAudioButtonsSections } from './PageAudioButtons';
import PageTemplates, { pageTemplatesSections } from './PageTemplates';
import PageInteractionsCall, { pageInteractionsCallSections } from './PageInteractionsCall';
import PageInteractions3dAr, { pageInteractions3dArSections } from './PageInteractions3dAr';
import PageInteractionsPopup, { pageInteractionsPopupSections } from './PageInteractionsPopup';
import PageAnimations, { pageAnimationsSections } from './PageAnimations';
import PageHotspots, { pageHotspotsSections } from './PageHotspots';

export const pageEditorSections = [
  ...pageSettingsSections,
  ...pageMediaSections,
  ...pageShapesGridSections,
  ...pageMapsQrSections,
  ...pageTypographySlideshowSections,
  ...pageTablesSections,
  ...pageAudioButtonsSections,
  ...pageTemplatesSections,
  ...pageInteractionsCallSections,
  ...pageInteractions3dArSections,
  ...pageInteractionsPopupSections,
  ...pageAnimationsSections,
  ...pageHotspotsSections
];

export default function PageEditorGuide({ selectedSubItem }) {
  if (pageSettingsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageSettings selectedSubItem={selectedSubItem} />;
  }
  if (pageMediaSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageMedia selectedSubItem={selectedSubItem} />;
  }
  if (pageShapesGridSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageShapesGrid selectedSubItem={selectedSubItem} />;
  }
  if (pageMapsQrSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageMapsQr selectedSubItem={selectedSubItem} />;
  }
  if (pageTypographySlideshowSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageTypographySlideshow selectedSubItem={selectedSubItem} />;
  }
  if (pageTablesSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageTables selectedSubItem={selectedSubItem} />;
  }
  if (pageAudioButtonsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageAudioButtons selectedSubItem={selectedSubItem} />;
  }
  if (pageTemplatesSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageTemplates selectedSubItem={selectedSubItem} />;
  }
  if (pageInteractionsCallSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageInteractionsCall selectedSubItem={selectedSubItem} />;
  }
  if (pageInteractions3dArSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageInteractions3dAr selectedSubItem={selectedSubItem} />;
  }
  if (pageInteractionsPopupSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageInteractionsPopup selectedSubItem={selectedSubItem} />;
  }
  if (pageAnimationsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageAnimations selectedSubItem={selectedSubItem} />;
  }
  if (pageHotspotsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageHotspots selectedSubItem={selectedSubItem} />;
  }
  return null;
}
