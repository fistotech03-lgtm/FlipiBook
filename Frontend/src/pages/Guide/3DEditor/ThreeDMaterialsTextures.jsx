import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const threeDMaterialsTexturesSections = [
  {
    id: '3d-materials-textures-main',
    title: 'Materials & Textures',
    icon: <Icon icon="lucide:palette" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Material Properties
      {
        id: '3d-material-select',
        label: 'Select Mesh Part Material',
        group: 'Material Properties',
        groupIcon: <Icon icon="lucide:palette" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-material-color',
        label: 'Color Picker & Presets',
        group: 'Material Properties',
        groupIcon: <Icon icon="lucide:palette" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-material-surface',
        label: 'Roughness, Metalness & Sheen',
        group: 'Material Properties',
        groupIcon: <Icon icon="lucide:palette" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-material-opacity',
        label: 'Transparency & Transmission',
        group: 'Material Properties',
        groupIcon: <Icon icon="lucide:palette" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Texture Placement
      {
        id: '3d-texture-upload',
        label: 'Texture Map Upload',
        group: 'Texture Placement',
        groupIcon: <Icon icon="prime:upload" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-texture-tiling',
        label: 'Texture Tiling & UV Offset',
        group: 'Texture Placement',
        groupIcon: <Icon icon="prime:upload" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-texture-unwrap',
        label: 'UV Unwrapping',
        group: 'Texture Placement',
        groupIcon: <Icon icon="prime:upload" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ThreeDMaterialsTextures({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

