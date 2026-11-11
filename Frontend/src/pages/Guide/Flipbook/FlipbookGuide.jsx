import React from 'react';
import FlipbookFileCreate, { flipbookFileCreateSections } from './FlipbookFileCreate';
import FlipbookFileUpload, { flipbookFileUploadSections } from './FlipbookFileUpload';
import FlipbookBuildScratch, { flipbookBuildScratchSections } from './FlipbookBuildScratch';
import FlipbookTemplate, { flipbookTemplateSections } from './FlipbookTemplate';

export const flipbookGuideSections = [
  ...flipbookFileCreateSections,
  ...flipbookFileUploadSections,
  ...flipbookBuildScratchSections,
  ...flipbookTemplateSections
];

export default function FlipbookGuide({ selectedSubItem }) {
  if (flipbookFileCreateSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <FlipbookFileCreate selectedSubItem={selectedSubItem} />;
  }
  if (flipbookFileUploadSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <FlipbookFileUpload selectedSubItem={selectedSubItem} />;
  }
  if (flipbookBuildScratchSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <FlipbookBuildScratch selectedSubItem={selectedSubItem} />;
  }
  if (flipbookTemplateSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <FlipbookTemplate selectedSubItem={selectedSubItem} />;
  }
  return null;
}
