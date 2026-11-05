import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Palette, Library, Share2 } from 'lucide-react';

export const myShelfGuideSections = [
  {
    id: 'myshelf-themes',
    title: 'Shelf Customization & Themes',
    icon: <Palette className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'shelf-overview', label: 'My Shelf Overview' },
      { id: 'shelf-themes-styles', label: 'Shelf Themes & Wooden Styles' },
      { id: 'decor-plants-lights', label: 'Decorations, Plants & Lamps' }
    ]
  },
  {
    id: 'shelf-books-management',
    title: 'Placing & Ordering Books',
    icon: <Library className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'add-books-shelf', label: 'Organizing Books on Shelves' },
      { id: 'reorder-shelf-books', label: 'Rearranging Books on Planks' },
      { id: 'shelf-book-cover', label: 'Customizing Book Spines & Covers' }
    ]
  },
  {
    id: 'shelf-sharing-presentation',
    title: 'Showcase & Public Sharing',
    icon: <Share2 className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'shelf-share-link', label: 'Public Shelf Link & Embedding' },
      { id: 'shelf-embed-website', label: 'Embed Bookshelf Widget on Website' }
    ]
  }
];

export default function MyShelfGuide({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
