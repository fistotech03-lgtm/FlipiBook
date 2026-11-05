import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Compass } from 'lucide-react';

export const homeExploreSections = [
  {
    id: 'explore-main',
    title: 'Explore',
    icon: <Compass className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'explore-overview', label: 'Explore Overview' }
    ]
  }
];

export default function HomeExplore({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

