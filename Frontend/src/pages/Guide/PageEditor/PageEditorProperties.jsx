import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const pageEditorPropertiesSections = [
  {
    id: 'properties-styling',
    title: 'Properties & Styles',
    icon: <Icon icon="lucide:palette" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'prop-transform', label: 'Transform (Position & Dimensions)' },
      { id: 'prop-colors-stroke', label: 'Colors, Gradients & Strokes' },
      { id: 'prop-corner-effects', label: 'Corner Radius, Shadows & Effects' },
      { id: 'prop-3d-model', label: '3D Model Configuration & AR' }
    ]
  }
];

export default function PageEditorProperties({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

