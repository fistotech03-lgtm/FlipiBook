import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutAnalyticsSections = [
  {
    id: 'analytics-main',
    title: 'Analytics',
    icon: <Icon icon="famicons:analytics" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'analytics-overview', label: 'Analytics Overview' }
    ]
  }
];

export default function LayoutAnalytics({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

