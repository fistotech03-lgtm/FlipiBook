import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const pageEditorCanvasToolbarSections = [
  {
    id: 'canvas-toolbar-controls',
    title: 'Canvas & Top Toolbar',
    icon: <Icon icon="lucide:sliders-horizontal" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'toolbar-history', label: 'Undo & Redo History' },
      { id: 'toolbar-alignment', label: 'Object Alignment & Distribution' },
      { id: 'toolbar-mask-flatten', label: 'Masking & Flattening' },
      { id: 'toolbar-zoom-view', label: 'Zoom & Viewport Navigation' },
      { id: 'toolbar-rulers-guides', label: 'Rulers, Guides & Snapping' }
    ]
  }
];

export default function PageEditorCanvasToolbar({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

