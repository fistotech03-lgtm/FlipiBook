import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const pageEditorToolsSections = [
  {
    id: 'editing-tools-main',
    title: 'Editing Tools',
    icon: <Icon icon="tabler:edit" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Upload Tools
      {
        id: 'tool-upload-local',
        label: 'Upload Files via Local Directory',
        group: 'Upload',
        groupIcon: <Icon icon="prime:upload" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-upload-gallery',
        label: 'Browse by Gallery',
        group: 'Upload',
        groupIcon: <Icon icon="prime:upload" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-upload-url',
        label: 'Import via URL',
        group: 'Upload',
        groupIcon: <Icon icon="prime:upload" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Selection Tools
      {
        id: 'tool-select-standard',
        label: 'Select Tool',
        group: 'Selection',
        groupIcon: <Icon icon="clarity:cursor-arrow-line" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-select-direct',
        label: 'Direct Select Tool',
        group: 'Selection',
        groupIcon: <Icon icon="clarity:cursor-arrow-line" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Pen & Vector Tools
      {
        id: 'tool-pen',
        label: 'Pen Tool',
        group: 'Pen & Vectors',
        groupIcon: <Icon icon="streamline-cyber:pen-tool" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-pencil',
        label: 'Pencil Tool',
        group: 'Pen & Vectors',
        groupIcon: <Icon icon="streamline-cyber:pen-tool" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Typography & Text
      {
        id: 'tool-text-add',
        label: 'Add Text & Headings',
        group: 'Typography',
        groupIcon: <Icon icon="mi:text" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-text-formatting',
        label: 'Formatting, Fonts & Alignment',
        group: 'Typography',
        groupIcon: <Icon icon="mi:text" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-text-styling',
        label: 'Colors, Spacing & Background',
        group: 'Typography',
        groupIcon: <Icon icon="mi:text" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Shapes & Vectors
      {
        id: 'tool-shape-rectangle',
        label: 'Rectangle',
        group: 'Shapes',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-shape-circle',
        label: 'Circle',
        group: 'Shapes',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-shape-polygon',
        label: 'Polygon',
        group: 'Shapes',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-shape-line',
        label: 'Line',
        group: 'Shapes',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'tool-shape-star',
        label: 'Star',
        group: 'Shapes',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function PageEditorTools({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
