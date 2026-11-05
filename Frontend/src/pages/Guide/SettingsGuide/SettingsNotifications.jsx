import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const settingsNotificationsSections = [
  {
    id: 'settings-notifications-main',
    title: 'Notifications',
    icon: <Icon icon="basil:notification-on-outline" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'settings-notifications-overview', label: 'Notifications Overview' },
      { id: 'settings-notifications-preferences', label: 'Email & Push Preferences' }
    ]
  }
];

export default function SettingsNotifications({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

