import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const settingsSystemBillingSections = [
  {
    id: 'settings-system-billing-main',
    title: 'System & Billing',
    icon: <Icon icon="tdesign:bill" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'settings-billing-invoice', label: 'Billing & Invoice' },
      { id: 'settings-support', label: 'Support' }
    ]
  }
];

export default function SettingsSystemBilling({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

