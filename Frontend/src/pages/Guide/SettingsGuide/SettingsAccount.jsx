import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const settingsAccountSections = [
  {
    id: 'settings-account-main',
    title: 'Account',
    icon: <Icon icon="iconamoon:profile" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'settings-account-overview', label: 'Account Overview' },
      { id: 'settings-account-password', label: 'Password & Security' },
      { id: 'settings-account-sessions', label: 'Active Sessions' }
    ]
  }
];

export default function SettingsAccount({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

