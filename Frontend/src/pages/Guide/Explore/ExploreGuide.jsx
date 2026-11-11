import React from 'react';
import ExploreSection, { exploreSections } from './ExploreSection';

export const exploreGuideSections = [
  ...exploreSections
];

export default function ExploreGuide({ selectedSubItem }) {
  if (exploreSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ExploreSection selectedSubItem={selectedSubItem} />;
  }
  return null;
}
