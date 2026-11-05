import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const threeDLightingEnvironmentSections = [
  {
    id: '3d-lighting-environment-main',
    title: 'Lighting & Environment',
    icon: <Icon icon="lucide:sun" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Environment
      {
        id: '3d-env-hdr-presets',
        label: 'Studio HDR Environment Presets',
        group: 'Environment',
        groupIcon: <Icon icon="lucide:sun" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-env-custom-upload',
        label: 'Custom HDR / EXR Upload',
        group: 'Environment',
        groupIcon: <Icon icon="lucide:sun" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-env-exposure-blur',
        label: 'Exposure, Intensity & Background Blur',
        group: 'Environment',
        groupIcon: <Icon icon="lucide:sun" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Lights & Shadows
      {
        id: '3d-lights-studio-setup',
        label: 'Multi-Light Studio Setup',
        group: 'Lights & Shadows',
        groupIcon: <Icon icon="lucide:sparkles" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-lights-compass',
        label: 'Light Direction Compass (N, S, E, W)',
        group: 'Lights & Shadows',
        groupIcon: <Icon icon="lucide:sparkles" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-lights-shadows',
        label: 'Cast Shadows & Softness',
        group: 'Lights & Shadows',
        groupIcon: <Icon icon="lucide:sparkles" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Floor & Reflections
      {
        id: '3d-floor-presets',
        label: 'Floor Presets & Shadow Catchers',
        group: 'Floor & Ground',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: '3d-floor-reflections',
        label: 'Floor Reflections & Opacity',
        group: 'Floor & Ground',
        groupIcon: <Icon icon="lucide:square" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ThreeDLightingEnvironment({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

