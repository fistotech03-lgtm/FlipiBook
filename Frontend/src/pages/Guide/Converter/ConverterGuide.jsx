import React from 'react';
import ConverterImage, { converterImageSections } from './ConverterImage';
import ConverterVideo, { converterVideoSections } from './ConverterVideo';
import Converter3DModel, { converter3DModelSections } from './Converter3DModel';

export const converterGuideSections = [
  ...converterImageSections,
  ...converterVideoSections,
  ...converter3DModelSections
];

export default function ConverterGuide({ selectedSubItem }) {
  if (converterImageSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ConverterImage selectedSubItem={selectedSubItem} />;
  }
  if (converterVideoSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ConverterVideo selectedSubItem={selectedSubItem} />;
  }
  if (converter3DModelSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <Converter3DModel selectedSubItem={selectedSubItem} />;
  }
  return null;
}
