import React, { useEffect, useRef } from 'react';
import FlipbookFileCreate, { flipbookFileCreateSections } from './FlipbookFileCreate';
import FlipbookFileUpload, { flipbookFileUploadSections } from './FlipbookFileUpload';
import FlipbookBuildScratch, { flipbookBuildScratchSections } from './FlipbookBuildScratch';
import FlipbookTemplate, { flipbookTemplateSections } from './FlipbookTemplate';
import CustomScrollbar from '../../../components/CustomScrollbar';

export const flipbookGuideSections = [
  ...flipbookFileCreateSections,
  ...flipbookFileUploadSections,
  ...flipbookBuildScratchSections,
  ...flipbookTemplateSections
];

export default function FlipbookGuide({ selectedSubItem }) {
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
        <FlipbookFileCreate id="flipbook-file-create" />
        <FlipbookFileUpload id="flipbook-use-file-upload" />
        <FlipbookBuildScratch id="flipbook-build-from-scratch" />
        <FlipbookTemplate id="flipbook-use-template" />
      </div>
    </CustomScrollbar>
  );
}
