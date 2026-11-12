import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const threeDHotspotsAnimationSections = [
  {
    id: '3d-hotspots-animation-main',
    title: 'Hotspots & Animations',
    icon: <Icon icon="solar:map-point-add-bold-duotone" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Hotspots
      {
        id: '3d-hotspots-add',
        label: 'Add 3D Pin onto Model Surface',
        group: 'Hotspots',
        groupIcon: <Icon icon="solar:map-point-add-bold-duotone" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-hotspots-edit',
        label: 'Titles, Descriptions & Links',
        group: 'Hotspots',
        groupIcon: <Icon icon="solar:map-point-add-bold-duotone" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-hotspots-manage',
        label: 'Position Reprojection & Delete',
        group: 'Hotspots',
        groupIcon: <Icon icon="solar:map-point-add-bold-duotone" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Animation
      {
        id: '3d-animation-playback',
        label: 'Embedded Model Animation Playback',
        group: 'Animations',
        groupIcon: <Icon icon="solar:play-bold" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-animation-controls',
        label: 'Play, Pause & Track Inspection',
        group: 'Animations',
        groupIcon: <Icon icon="solar:play-bold" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ThreeDHotspotsAnimation({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

