/**
 * audioCatalog.jsx
 * Audio Presets Catalog for FlipiBook Elements Panel
 * Uses the Audio Element UI templates from Audio.jsx
 */
import React from 'react';
import { AUDIO_TEMPLATES, createAudioElementNode, getAudioSvgCode } from '../utils/audioElementUtils';

/**
 * AudioPreview
 * Renders the accurate vector SVG preview matching each Audio player template
 */
export const AudioPreview = ({ template }) => {
  const tpl = template;
  const svgContent = getAudioSvgCode(tpl, `preview-${tpl.id}`);

  return (
    <div className="w-full h-full flex items-center justify-center p-[0.2vw] pointer-events-none select-none">
      <svg
        viewBox={`0 0 ${tpl.width || 360} ${tpl.height || 100}`}
        className="w-full h-auto max-h-[2.8vw] pointer-events-none select-none transition-transform duration-200 group-hover:scale-105 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
        preserveAspectRatio="xMidYMid meet"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export const AUDIO_ITEMS = AUDIO_TEMPLATES.map((tpl) => ({
  id: `audio-${tpl.id}`,
  name: tpl.name,
  category: 'audio',
  type: 'audio',
  template: tpl,
  renderPreview: () => <AudioPreview template={tpl} />,
  insert: (cx, cy) => createAudioElementNode(tpl, cx, cy),
  getSvgString: (isDrag) => getAudioSvgCode(tpl, Date.now())
}));

export default AUDIO_ITEMS;
