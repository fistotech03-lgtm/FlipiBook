import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Sparkles } from 'lucide-react';

export const homeFeatureSections = [
  {
    id: 'feature-main',
    title: 'Feature',
    icon: <Sparkles className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'feature-overview', label: 'Feature Overview' }
    ]
  }
];

export default function HomeFeature({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

