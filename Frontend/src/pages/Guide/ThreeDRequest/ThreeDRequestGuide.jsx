import React from 'react';
import ThreeDRequestPage, { threeDRequestPageSections } from './ThreeDRequestPage';

export const threeDRequestGuideSections = [
  ...threeDRequestPageSections
];

export default function ThreeDRequestGuide({ selectedSubItem }) {
  if (threeDRequestPageSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ThreeDRequestPage selectedSubItem={selectedSubItem} />;
  }
  return null;
}
