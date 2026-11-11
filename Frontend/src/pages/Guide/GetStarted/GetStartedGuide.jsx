import React, { useEffect, useRef } from 'react';
import GetStartedAuth, { getStartedAuthSections } from './GetStartedAuth';
import CustomScrollbar from '../../../components/CustomScrollbar';

export const getStartedGuideSections = [
  ...getStartedAuthSections
];

export default function GetStartedGuide({ selectedSubItem }) {
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
        <GetStartedAuth id="get-started-auth" />
      </div>
    </CustomScrollbar>
  );
}
