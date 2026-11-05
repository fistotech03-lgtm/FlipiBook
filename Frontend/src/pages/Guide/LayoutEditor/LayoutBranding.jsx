import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutBrandingSections = [
  {
    id: 'branding-main',
    title: 'Branding',
    icon: <Icon icon="fluent-mdl2:verified-brand" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'branding-overview', label: 'Branding Overview' }
    ]
  }
];

export default function LayoutBranding({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

