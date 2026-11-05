import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { HelpCircle } from 'lucide-react';

export const homeHelpSections = [
  {
    id: 'help-main',
    title: 'Help',
    icon: <HelpCircle className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'help-overview', label: 'Help Overview' }
    ]
  }
];

export default function HomeHelp({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

