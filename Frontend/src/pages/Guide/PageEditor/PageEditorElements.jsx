import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const pageEditorElementsSections = [
  {
    id: 'elements-catalog',
    title: 'Elements Catalog',
    icon: <Icon icon="ph:diamonds-four" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'element-typography', label: 'Typography & Titles' },
      { id: 'element-buttons', label: 'Interactive Buttons' },
      { id: 'element-shapes', label: 'Decorative Shapes' },
      { id: 'element-image-framing', label: 'Image Framing & Masks' },
      { id: 'element-embeds', label: 'Web & Video Embeds' },
      { id: 'element-qrcode', label: 'Dynamic QR Codes' },
      { id: 'element-maps', label: 'Interactive Maps' },
      { id: 'element-tables', label: 'Dynamic Tables' },
      { id: 'element-audio', label: 'Audio Elements' },
      { id: 'element-slideshow', label: 'Slideshow & Sliders' }
    ]
  },
  {
    id: 'templates-styles-icons',
    title: 'Templates & Design Assets',
    icon: <Icon icon="lucide:layout-template" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'asset-templates', label: 'Page Layout Templates' },
      { id: 'asset-styles', label: 'Global Color & Text Styles' },
      { id: 'asset-icons', label: 'Icon Library & Search' }
    ]
  }
];

export default function PageEditorElements({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

