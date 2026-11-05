import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Folder } from 'lucide-react';

export const myFlipbookFoldersSections = [
  {
    id: 'your-folders-main',
    title: 'Your Folders',
    icon: <Folder className="w-[0.95vw] h-[0.95vw] fill-current" />,
    items: [
      { id: 'your-folders-overview', label: 'Your Folders Overview' }
    ]
  }
];

export default function MyFlipbookFolders({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

