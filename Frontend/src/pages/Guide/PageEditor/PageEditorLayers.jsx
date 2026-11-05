import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Layers } from 'lucide-react';

export const pageEditorLayersSections = [
  {
    id: 'pages-layers-management',
    title: 'Pages & Layers',
    icon: <Layers className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'manage-pages', label: 'Page Management (Add, Reorder, Delete)' },
      { id: 'page-background', label: 'Page Background Styling' },
      { id: 'manage-layers', label: 'Layer Hierarchy & Stacking' },
      { id: 'layer-groups-locks', label: 'Grouping, Locking & Visibility' }
    ]
  }
];

export default function PageEditorLayers({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

