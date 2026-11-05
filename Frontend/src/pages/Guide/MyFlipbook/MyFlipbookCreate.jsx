import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { BookOpen } from 'lucide-react';

export const myFlipbookCreateSections = [
  {
    id: 'create-flipbooks-main',
    title: 'Create Flipbooks',
    icon: <BookOpen className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'create-flipbook', label: 'Create Flipbook' },
      { id: 'start-from-scratch', label: 'Start from Scratch' },
      { id: 'use-a-template', label: 'Use a Template' }
    ]
  }
];

export default function MyFlipbookCreate({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

