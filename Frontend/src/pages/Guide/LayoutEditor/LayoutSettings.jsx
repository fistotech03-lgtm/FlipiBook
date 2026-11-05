import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutSettingsSections = [
  {
    id: 'layout-settings-main',
    title: 'Layout Settings',
    icon: <Icon icon="fluent:layout-row-two-settings-24-regular" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'navigation', label: 'Navigation' },
      { id: 'viewing', label: 'Viewing' },
      { id: 'interaction-tools', label: 'Interaction Tools' },
      { id: 'audio-controls', label: 'Audio Controls' },
      { id: 'share-export', label: 'Share & Export' },
      { id: 'branding-profile', label: 'Branding & Profile' }
    ]
  }
];

export default function LayoutSettings({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

