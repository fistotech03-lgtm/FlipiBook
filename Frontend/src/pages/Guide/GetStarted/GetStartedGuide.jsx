import React from 'react';
import GetStartedAuth, { getStartedAuthSections } from './GetStartedAuth';

export const getStartedGuideSections = [
  ...getStartedAuthSections
];

export default function GetStartedGuide({ selectedSubItem }) {
  if (getStartedAuthSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <GetStartedAuth selectedSubItem={selectedSubItem} />;
  }
  return null;
}
