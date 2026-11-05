import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Trash2 } from 'lucide-react';

export const myFlipbookTrashSections = [
  {
    id: 'trash-main',
    title: 'Trash',
    icon: <Trash2 className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'trash-overview', label: 'Trash Overview' }
    ]
  }
];

export default function MyFlipbookTrash({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

