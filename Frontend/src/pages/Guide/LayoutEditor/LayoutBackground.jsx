import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutBackgroundSections = [
  {
    id: 'background-main',
    title: 'Background',
    icon: <Icon icon="andrsrxn:background" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'background', label: 'Background' },
      { id: 'themes', label: 'Themes' },
      { id: 'animation', label: 'Animation' }
    ]
  }
];

export default function LayoutBackground({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

