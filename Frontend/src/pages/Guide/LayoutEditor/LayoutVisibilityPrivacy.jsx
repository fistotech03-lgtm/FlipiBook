import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutVisibilityPrivacySections = [
  {
    id: 'visibility-privacy-main',
    title: 'Visibility & Privacy',
    icon: <Icon icon="si:lock-line" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'public', label: 'Public' },
      { id: 'private', label: 'Private' },
      { id: 'password-protect', label: 'Password Protect' },
      { id: 'invite-only-access', label: 'Invite Only Access' }
    ]
  }
];

export default function LayoutVisibilityPrivacy({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

