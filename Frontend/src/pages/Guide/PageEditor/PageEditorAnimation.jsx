import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const pageEditorAnimationSections = [
  {
    id: 'animation-motion-effects',
    title: 'Animation',
    icon: <Icon icon="tdesign:animation-1" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'anim-object-animation', label: 'Object Animations' },
      { id: 'anim-text-effects', label: 'Cascading Text Effects' },
      { id: 'anim-triggers-timing', label: 'Triggers, Timing & Easing' }
    ]
  }
];

export default function PageEditorAnimation({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

