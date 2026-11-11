import React from 'react';
import ForumSection, { forumSections } from './ForumSection';

export const forumGuideSections = [
  ...forumSections
];

export default function ForumGuide({ selectedSubItem }) {
  if (forumSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ForumSection selectedSubItem={selectedSubItem} />;
  }
  return null;
}
