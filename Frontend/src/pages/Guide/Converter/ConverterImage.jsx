import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const converterImageSections = [
  {
    id: 'converter-image-main',
    title: 'Image',
    icon: <Icon icon="solar:gallery-bold-duotone" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'converter-image-overview', label: 'Image Overview' },
      { id: 'converter-image-formats', label: 'Format Selection (WEBP, PNG, JPG)' },
      { id: 'converter-image-compression', label: 'Compression Levels' },
      { id: 'converter-image-bg-removal', label: 'AI Background Removal & Compare' }
    ]
  }
];

export default function ConverterImage({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
