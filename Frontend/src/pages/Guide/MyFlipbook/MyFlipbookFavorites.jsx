import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Heart } from 'lucide-react';

export const myFlipbookFavoritesSections = [
  {
    id: 'favorites-main',
    title: 'Favorites',
    icon: <Heart className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'favorites-overview', label: 'Favorites Overview' }
    ]
  }
];

export default function MyFlipbookFavorites({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

