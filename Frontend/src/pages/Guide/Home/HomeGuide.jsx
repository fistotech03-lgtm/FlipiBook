import React from 'react';
import HomeHome, { homeHomeSections } from './HomeHome';
import HomeExplore, { homeExploreSections } from './HomeExplore';
import HomeFeature, { homeFeatureSections } from './HomeFeature';
import HomePricing, { homePricingSections } from './HomePricing';
import HomeForum, { homeForumSections } from './HomeForum';
import HomeHelp, { homeHelpSections } from './HomeHelp';

export const homeGuideSections = [
  ...homeHomeSections,
  ...homeExploreSections,
  ...homeFeatureSections,
  ...homePricingSections,
  ...homeForumSections,
  ...homeHelpSections
];

export default function HomeGuide({ selectedSubItem }) {
  if (homeHomeSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <HomeHome selectedSubItem={selectedSubItem} />;
  }
  if (homeExploreSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <HomeExplore selectedSubItem={selectedSubItem} />;
  }
  if (homeFeatureSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <HomeFeature selectedSubItem={selectedSubItem} />;
  }
  if (homePricingSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <HomePricing selectedSubItem={selectedSubItem} />;
  }
  if (homeForumSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <HomeForum selectedSubItem={selectedSubItem} />;
  }
  if (homeHelpSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <HomeHelp selectedSubItem={selectedSubItem} />;
  }
  return null;
}
