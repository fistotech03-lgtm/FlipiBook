import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Images } from 'lucide-react';

export const myFlipbookGallerySections = [
  {
    id: 'gallery-main',
    title: 'Gallery',
    icon: <Images className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'gallery-overview', label: 'Gallery Overview' }
    ]
  }
];

export default function MyFlipbookGallery({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

