import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const homeForumSections = [
  {
    id: 'forum-main',
    title: 'Forum',
    icon: <MessageSquare className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'forum-overview', label: 'Forum Overview' }
    ]
  }
];

export default function HomeForum({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

