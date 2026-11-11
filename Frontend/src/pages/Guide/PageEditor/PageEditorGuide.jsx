import React, { useEffect, useRef } from 'react';
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
import CustomScrollbar from '../../../components/CustomScrollbar';

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
        <PageSettings id="page-editor-settings" />
        <PageMedia id="page-editor-media" />
        <PageShapesGrid id="page-editor-shapes-grid" />
        <PageMapsQr id="page-editor-maps-qr" />
        <PageTypographySlideshow id="page-editor-typography-slideshow" />
        <PageTables id="page-editor-tables" />
        <PageAudioButtons id="page-editor-audio-buttons" />
        <PageTemplates id="page-editor-templates" />
        <PageInteractionsCall id="page-editor-interactions-call" />
        <PageInteractions3dAr id="page-editor-interactions-3d-ar" />
        <PageInteractionsPopup id="page-editor-interactions-popup" />
        <PageAnimations id="page-editor-animations" />
        <PageHotspots id="page-editor-hotspots" />
      </div>
    </CustomScrollbar>
  );
}
