import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const threeDCanvasExportSections = [
  {
    id: '3d-canvas-tools-main',
    title: 'Canvas Tools & Navigation',
    icon: <Icon icon="lucide:sliders-horizontal" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Viewport Modes
      {
        id: '3d-viewport-shading',
        label: 'Wireframe vs. Solid Shading',
        group: 'Viewport Modes',
        groupIcon: <Icon icon="ph:polygon-light" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-viewport-history',
        label: 'Undo & Redo (Ctrl+Z / Ctrl+Y)',
        group: 'Viewport Modes',
        groupIcon: <Icon icon="ph:polygon-light" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Gizmos
      {
        id: '3d-gizmo-select',
        label: 'Select Mode',
        group: 'Transform Gizmos',
        groupIcon: <Icon icon="clarity:cursor-arrow-line" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-gizmo-move',
        label: 'Move Gizmo (W)',
        group: 'Transform Gizmos',
        groupIcon: <Icon icon="clarity:cursor-arrow-line" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-gizmo-rotate',
        label: 'Rotate Gizmo (R)',
        group: 'Transform Gizmos',
        groupIcon: <Icon icon="clarity:cursor-arrow-line" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-gizmo-scale',
        label: 'Scale Gizmo (S)',
        group: 'Transform Gizmos',
        groupIcon: <Icon icon="clarity:cursor-arrow-line" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Navigation
      {
        id: '3d-nav-orbit',
        label: 'Orbit Navigation',
        group: 'Navigation',
        groupIcon: <Icon icon="famicons:hand-right-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-nav-pan',
        label: 'Hand / Pan Tool (H)',
        group: 'Navigation',
        groupIcon: <Icon icon="famicons:hand-right-outline" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-nav-zoom',
        label: 'Zoom In, Out & Full View',
        group: 'Navigation',
        groupIcon: <Icon icon="famicons:hand-right-outline" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  },
  {
    id: '3d-export-save-main',
    title: 'Export & Save',
    icon: <Icon icon="prime:download" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: '3d-export-glb-gltf', label: 'Export as GLB / GLTF' },
      { id: '3d-export-usdz', label: 'Export as USDZ (Apple AR)' },
      { id: '3d-save-asset-library', label: 'Save to Flipbook 3D Library' }
    ]
  }
];

export default function ThreeDCanvasExport({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

