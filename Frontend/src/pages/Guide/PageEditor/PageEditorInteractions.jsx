import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const pageEditorInteractionsSections = [
  {
    id: 'interaction-creation-tools',
    title: 'Interaction Tools',
    icon: <Icon icon="hugeicons:touch-interaction-01" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'interaction-select-tool', label: 'Select Tool' },
      { id: 'interaction-frame-tool', label: 'Frame Tool' },
      { id: 'interaction-hotspot-tool', label: 'Hotspot Tool' }
    ]
  },
  {
    id: 'interaction-action-types',
    title: 'Interaction Action Types',
    icon: <Icon icon="material-symbols:ads-click-rounded" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'action-open-link', label: 'Open Link' },
      { id: 'action-whatsapp', label: 'WhatsApp' },
      { id: 'action-email', label: 'Email' },
      { id: 'action-call', label: 'Call' },
      { id: 'action-navigate-to', label: 'Navigate to Page' },
      { id: 'action-3d-viewer', label: '3D Viewer' },
      { id: 'action-popup', label: 'Popup Modal' },
      { id: 'action-slideshow', label: 'Slideshow' },
      { id: 'action-zoom', label: 'Zoom' },
      { id: 'action-download', label: 'Download File' },
      { id: 'action-audio', label: 'Audio Playback' },
      { id: 'action-info-box', label: 'Info Box' }
    ]
  }
];

export default function PageEditorInteractions({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

