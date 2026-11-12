import React, { useEffect, useRef } from 'react';
import ExploreSection, { exploreSections } from './ExploreSection';
import CustomScrollbar from '../../../components/CustomScrollbar';

export const exploreGuideSections = [
  ...exploreSections
];

export default function ExploreGuide({ selectedSubItem }) {
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
        <ExploreSection id="explore-books-overview" />
      </div>
    </CustomScrollbar>
  );
}
