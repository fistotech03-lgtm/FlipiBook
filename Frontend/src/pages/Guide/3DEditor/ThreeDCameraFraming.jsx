import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const threeDCameraFramingSections = [
  {
    id: '3d-camera-framing-main',
    title: 'Camera & Scene Framing',
    icon: <Icon icon="lucide:camera" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Camera Angles
      {
        id: '3d-cam-views',
        label: 'Front, Top, Right & Perspective Views',
        group: 'Camera Angles',
        groupIcon: <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-cam-projection',
        label: 'Perspective vs. Orthographic',
        group: 'Camera Angles',
        groupIcon: <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-cam-reset',
        label: 'Reset Camera & Center View',
        group: 'Camera Angles',
        groupIcon: <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Background
      {
        id: '3d-bg-transparent',
        label: 'Transparent Background',
        group: 'Scene Background',
        groupIcon: <Icon icon="lucide:image" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-bg-color-image',
        label: 'Solid Color & Custom Image',
        group: 'Scene Background',
        groupIcon: <Icon icon="lucide:image" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Framing & Snapshot
      {
        id: '3d-framing-aspect',
        label: 'Aspect Ratio & Frame Presets',
        group: 'Framing & Snapshots',
        groupIcon: <Icon icon="lucide:scan" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-framing-snapshot',
        label: 'Capture High-Res Snapshot',
        group: 'Framing & Snapshots',
        groupIcon: <Icon icon="lucide:scan" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ThreeDCameraFraming({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

