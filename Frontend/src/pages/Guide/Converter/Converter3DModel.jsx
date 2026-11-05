import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const converter3DModelSections = [
  {
    id: 'converter-3dmodel-main',
    title: '3DModel',
    icon: <Icon icon="solar:box-bold-duotone" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'converter-3dmodel-overview', label: '3DModel Overview' },
      { id: 'converter-3dmodel-formats', label: 'Format Conversion (GLB, OBJ, FBX, USDZ)' },
      { id: 'converter-3dmodel-compression', label: 'Compression & Optimization' },
      { id: 'converter-3dmodel-preview', label: '3D Orbit Preview & Stats' }
    ]
  }
];

export default function Converter3DModel({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
