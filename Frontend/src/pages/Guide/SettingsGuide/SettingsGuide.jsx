import React from 'react';
import SettingsAccount, { settingsAccountSections } from './SettingsAccount';
import SettingsNotifications, { settingsNotificationsSections } from './SettingsNotifications';
import SettingsSystemBilling, { settingsSystemBillingSections } from './SettingsSystemBilling';

export const settingsGuideSections = [
  ...settingsAccountSections,
  ...settingsNotificationsSections,
  ...settingsSystemBillingSections
];

export default function SettingsGuide({ selectedSubItem }) {
  if (settingsAccountSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <SettingsAccount selectedSubItem={selectedSubItem} />;
  }
  if (settingsNotificationsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <SettingsNotifications selectedSubItem={selectedSubItem} />;
  }
  if (settingsSystemBillingSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <SettingsSystemBilling selectedSubItem={selectedSubItem} />;
  }
  return null;
}

