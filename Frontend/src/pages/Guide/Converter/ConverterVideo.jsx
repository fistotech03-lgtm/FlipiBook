import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const converterVideoSections = [
  {
    id: 'converter-video-main',
    title: 'Video',
    icon: <Icon icon="solar:videocamera-record-bold-duotone" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'converter-video-overview', label: 'Video Overview' },
      { id: 'converter-video-formats', label: 'Target Video Formats (MP4, WEBM)' },
      { id: 'converter-video-compression', label: 'Resolution & Compression' },
      { id: 'converter-video-preview', label: 'Playback Preview & Download' }
    ]
  }
];

export default function ConverterVideo({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
