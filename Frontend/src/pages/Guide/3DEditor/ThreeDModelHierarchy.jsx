import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const threeDModelHierarchySections = [
  {
    id: '3d-model-hierarchy-main',
    title: '3D Model & Hierarchy',
    icon: <Icon icon="mage:box-3d" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Model Management
      {
        id: '3d-model-tree',
        label: 'Model Tree & Mesh Outliner',
        group: 'Model Management',
        groupIcon: <Icon icon="lucide:layers" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-model-parts',
        label: 'Rename, Add & Delete Models',
        group: 'Model Management',
        groupIcon: <Icon icon="lucide:layers" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-model-xray',
        label: 'X-Ray & Part Visibility',
        group: 'Model Management',
        groupIcon: <Icon icon="lucide:layers" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Position & Transforms
      {
        id: '3d-transform-position',
        label: 'Position (X, Y, Z Coordinates)',
        group: 'Position & Transforms',
        groupIcon: <Icon icon="iconamoon:move-thin" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-transform-rotation',
        label: 'Rotation (Pitch, Yaw, Roll)',
        group: 'Position & Transforms',
        groupIcon: <Icon icon="iconamoon:move-thin" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-transform-scale',
        label: 'Uniform & Axis Scale',
        group: 'Position & Transforms',
        groupIcon: <Icon icon="iconamoon:move-thin" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-transform-reset',
        label: 'Reset Transform to Default',
        group: 'Position & Transforms',
        groupIcon: <Icon icon="iconamoon:move-thin" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Model View & Helpers
      {
        id: '3d-view-autorotate',
        label: 'Auto-Rotation (Speed & Axis)',
        group: 'View Helpers',
        groupIcon: <Icon icon="hugeicons:rotate-01" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-view-grid-axis',
        label: 'Grid Lines & Coordinate Axes',
        group: 'View Helpers',
        groupIcon: <Icon icon="hugeicons:rotate-01" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ThreeDModelHierarchy({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

