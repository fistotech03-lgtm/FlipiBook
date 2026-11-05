import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Box } from 'lucide-react';

export const myFlipbook3DModelsSections = [
  {
    id: 'add-3d-models-main',
    title: 'Add 3D Models',
    icon: <Box className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'import-3d-model', label: 'Import 3D Model' },
      { id: '3d-studio-editor', label: '3D Studio Editor' },
      { id: 'sample-3d-models', label: 'Sample 3D Models' }
    ]
  }
];

export default function MyFlipbook3DModels({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

