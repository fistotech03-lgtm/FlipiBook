import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutDesignSections = [
  {
    id: 'layout-design-main',
    title: 'Layout Design',
    icon: <Icon icon="lucide:layout-panel-left" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'layout-design', label: 'Layout Design' },
      { id: 'layout-color-customization', label: 'Layout Color Customization' }
    ]
  }
];

export default function LayoutDesign({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

