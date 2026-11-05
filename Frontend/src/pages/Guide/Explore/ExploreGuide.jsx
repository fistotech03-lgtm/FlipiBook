import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const exploreGuideSections = [
  {
    id: 'explore-books-section',
    title: 'Explore Books',
    icon: <Icon icon="lucide:book-open" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Search & Sorting
      {
        id: 'explore-books-search',
        label: 'Search by Title & Author',
        group: 'Search & Sorting',
        groupIcon: <Icon icon="lucide:search" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-sort',
        label: 'Sort by (Popular, Viewed, Newest)',
        group: 'Search & Sorting',
        groupIcon: <Icon icon="lucide:search" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-favs-only',
        label: 'View Favorites Only',
        group: 'Search & Sorting',
        groupIcon: <Icon icon="lucide:search" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Filter Books By
      {
        id: 'explore-books-category',
        label: 'Category Filters',
        group: 'Filter Books By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-type',
        label: 'Flipbook Type (2D vs. 3D)',
        group: 'Filter Books By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-pages',
        label: 'Page Count Range',
        group: 'Filter Books By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-publish-date',
        label: 'Publish Date Filters',
        group: 'Filter Books By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Book Card Actions
      {
        id: 'explore-books-read-view',
        label: 'Read & Interactive Flip View',
        group: 'Card Actions',
        groupIcon: <Icon icon="lucide:mouse-pointer-click" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-shelf-favorites',
        label: 'Add to Favorites & My Shelf',
        group: 'Card Actions',
        groupIcon: <Icon icon="lucide:mouse-pointer-click" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-books-share-download',
        label: 'Share, Embed & Download',
        group: 'Card Actions',
        groupIcon: <Icon icon="lucide:mouse-pointer-click" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  },
  {
    id: 'explore-creators-section',
    title: 'Explore Creators',
    icon: <Icon icon="lucide:users" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Search & Discovery
      {
        id: 'explore-creators-search',
        label: 'Search Creators by Name & Bio',
        group: 'Discovery',
        groupIcon: <Icon icon="lucide:search" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-creators-stats',
        label: 'Creator Stats & Rating Cards',
        group: 'Discovery',
        groupIcon: <Icon icon="lucide:search" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Filter Creators By
      {
        id: 'explore-creators-industry',
        label: 'Industry Filters',
        group: 'Filter Creators By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-creators-type',
        label: 'Creator Type (Individual / Agency)',
        group: 'Filter Creators By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-creators-location',
        label: 'Location (Country, State, City)',
        group: 'Filter Creators By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-creators-expertise',
        label: 'Service & Expertise',
        group: 'Filter Creators By',
        groupIcon: <Icon icon="flowbite:filter-outline" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Engagement
      {
        id: 'explore-creators-follow',
        label: 'Follow / Unfollow Creators',
        group: 'Engagement',
        groupIcon: <Icon icon="lucide:user-check" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'explore-creators-profile-modal',
        label: 'Creator Profile & Portfolio Modal',
        group: 'Engagement',
        groupIcon: <Icon icon="lucide:user-check" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ExploreGuide({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
