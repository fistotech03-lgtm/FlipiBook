import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Library } from 'lucide-react';

export const myFlipbookShelfSections = [
  {
    id: 'my-shelf-main',
    title: 'My Shelf',
    icon: <Library className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'my-shelf-overview', label: 'My Shelf Overview' }
    ]
  }
];

export default function MyFlipbookShelf({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

