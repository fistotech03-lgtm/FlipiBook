import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutBookAppearanceSections = [
  {
    id: 'book-appearance-main',
    title: 'Book Appearance',
    icon: <Icon icon="basil:book-open-outline" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'book-appearance-overview', label: 'Book Appearance Overview' }
    ]
  }
];

export default function LayoutBookAppearance({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

