import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const layoutLeadFormSections = [
  {
    id: 'lead-form-main',
    title: 'Lead Form',
    icon: <Icon icon="fluent:form-multiple-24-regular" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'lead-form-overview', label: 'Lead Form Overview' }
    ]
  }
];

export default function LayoutLeadForm({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

