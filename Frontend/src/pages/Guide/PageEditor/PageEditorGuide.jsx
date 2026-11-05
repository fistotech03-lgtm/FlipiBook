import React from 'react';
import PageEditorLayers, { pageEditorLayersSections } from './PageEditorLayers';
import PageEditorProperties, { pageEditorPropertiesSections } from './PageEditorProperties';
import PageEditorTools, { pageEditorToolsSections } from './PageEditorTools';
import PageEditorElements, { pageEditorElementsSections } from './PageEditorElements';
import PageEditorInteractions, { pageEditorInteractionsSections } from './PageEditorInteractions';
import PageEditorAnimation, { pageEditorAnimationSections } from './PageEditorAnimation';
import PageEditorCanvasToolbar, { pageEditorCanvasToolbarSections } from './PageEditorCanvasToolbar';

export const pageEditorGuideSections = [
  ...pageEditorLayersSections,
  ...pageEditorPropertiesSections,
  ...pageEditorToolsSections,
  ...pageEditorElementsSections,
  ...pageEditorInteractionsSections,
  ...pageEditorAnimationSections,
  ...pageEditorCanvasToolbarSections
];

export default function PageEditorGuide({ selectedSubItem }) {
  if (pageEditorLayersSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorLayers selectedSubItem={selectedSubItem} />;
  }
  if (pageEditorPropertiesSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorProperties selectedSubItem={selectedSubItem} />;
  }
  if (pageEditorToolsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorTools selectedSubItem={selectedSubItem} />;
  }
  if (pageEditorElementsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorElements selectedSubItem={selectedSubItem} />;
  }
  if (pageEditorInteractionsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorInteractions selectedSubItem={selectedSubItem} />;
  }
  if (pageEditorAnimationSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorAnimation selectedSubItem={selectedSubItem} />;
  }
  if (pageEditorCanvasToolbarSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <PageEditorCanvasToolbar selectedSubItem={selectedSubItem} />;
  }
  return null;
}
