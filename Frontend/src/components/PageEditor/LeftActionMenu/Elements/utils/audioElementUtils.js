/**
 * audioElementUtils.js
 * Isolated utilities for Audio Elements in FlipiBook
 */

export const isElementAudio = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'audio-frame' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('audio-'))
  );
};

export const AUDIO_OPTIONS = [
  {
    id: 'audio-player',
    name: 'Audio Player Bar',
    width: 420,
    height: 60,
    svg: `<g data-type="audio-frame" data-fill-color="#ffffff" data-fill-opacity="1">
  <defs>
    <clipPath id="vol-clip-CLIP_ID">
      <rect class="vol-clip-rect" x="355" y="0" width="0" height="60" />
    </clipPath>
  </defs>
  <style>
    .vol-clip-rect { transition: width 0.3s ease-in-out; }
    g[data-type="audio-frame"]:hover .vol-clip-rect { width: 105px; }
    .volume-slider-part { opacity: 0; transition: opacity 0.3s ease-in-out; clip-path: url(#vol-clip-CLIP_ID); }
    g[data-type="audio-frame"]:hover .volume-slider-part { opacity: 1; }
    .loop-icon { transform: translate(375px, 22px) scale(0.75); transition: transform 0.3s ease-in-out; }
    g[data-type="audio-frame"]:hover .loop-icon { transform: translate(460px, 22px) scale(0.75); }
    .audio-fill-layer { width: 420px; transition: width 0.3s ease-in-out; }
    g[data-type="audio-frame"]:hover .audio-fill-layer { width: 500px; }
  </style>
  <rect class="audio-fill-layer" x="0" y="0" width="420" height="60" rx="30" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5"></rect>
  <g class="audio-content-group" pointer-events="none">
    <g class="prev-icon" transform="translate(25, 18)" style="opacity: 0.5; pointer-events: none; cursor: default;">
      <rect x="0" y="0" width="24" height="24" fill="transparent"></rect>
      <polygon points="11 12 20 5 20 19" fill="#222"></polygon>
      <polygon points="4 12 13 5 13 19" fill="#222"></polygon>
    </g>
    <g class="play-pause-btn" pointer-events="none">
      <circle class="play-pause-bg" cx="70" cy="30" r="20" fill="#222" />
      <g class="play-pause-icon" transform="translate(58, 19)">
        <polygon points="7 4 17 11 7 18 7 4" fill="#ffffff"></polygon>
      </g>
    </g>
    <g class="next-icon" transform="translate(91, 18)" style="opacity: 0.5; pointer-events: none; cursor: default;">
      <rect x="0" y="0" width="24" height="24" fill="transparent"></rect>
      <polygon points="4 5 13 12 4 19" fill="#222"></polygon>
      <polygon points="11 5 20 12 11 19" fill="#222"></polygon>
    </g>
    <text class="audio-current-time" x="125" y="34" font-family="sans-serif" font-size="13" fill="#222" font-weight="500">0:00</text>
    <g class="progress-group" pointer-events="none">
      <rect x="160" y="15" width="125" height="30" fill="transparent"></rect>
      <rect class="progress-bg" x="160" y="28" width="125" height="4" rx="2" fill="#e5e7eb" pointer-events="none"></rect>
      <rect class="progress-fill" x="160" y="28" width="0" height="4" rx="2" fill="#222" pointer-events="none"></rect>
      <circle class="progress-knob" cx="160" cy="30" r="6.5" fill="#222" stroke="#ffffff" stroke-width="2.5" pointer-events="none"></circle>
    </g>
    <text class="audio-total-time" x="295" y="34" font-family="sans-serif" font-size="13" fill="#222" font-weight="500">0:00</text>
  </g>
  <rect class="svg-image-stroke-overlay" x="0" y="0" width="420" height="60" rx="30" fill="transparent" pointer-events="all" />
</g>`
  },
  {
    id: 'audio-icon',
    name: 'Compact Audio Pill',
    width: 96,
    height: 48,
    svg: `<g data-type="audio-frame" data-fill-color="#ffffff" data-fill-opacity="1">
  <rect class="audio-fill-layer" x="0" y="0" width="96" height="48" rx="12" fill="#ffffff" stroke="#737373" stroke-width="2" opacity="1" pointer-events="none"></rect>
  <g class="audio-content-group" pointer-events="none">
    <g class="prev-icon" transform="translate(11, 0)" style="opacity: 0.5; pointer-events: none;">
      <polygon points="15 24 21 18 21 30" fill="#737373"></polygon>
      <polygon points="9 24 15 18 15 30" fill="#737373"></polygon>
    </g>
    <g class="play-pause-icon" transform="translate(24, 0)">
      <polygon points="20 16 32 24 20 32" fill="#737373" stroke="#737373" stroke-width="2" stroke-linejoin="round"></polygon>
    </g>
    <g class="next-icon" transform="translate(37, 0)" style="opacity: 0.5; pointer-events: none;">
      <polygon points="33 24 27 18 27 30" fill="#737373"></polygon>
      <polygon points="39 24 33 18 33 30" fill="#737373"></polygon>
    </g>
  </g>
  <rect class="svg-image-stroke-overlay" x="0" y="0" width="96" height="48" rx="12" fill="transparent" pointer-events="all" />
</g>`
  }
];

export function createAudioElementNode(optionId = 'audio-player', cx = 105, cy = 148) {
  const opt = AUDIO_OPTIONS.find((o) => o.id === optionId) || AUDIO_OPTIONS[0];
  const uniqueId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const rawSvg = opt.svg.replace(/CLIP_ID/g, uniqueId);

  const scale = opt.id === 'audio-icon' ? 0.35 : 0.25;
  const w = (opt.width || 420) * scale;
  const h = (opt.height || 60) * scale;
  const x = Math.round(cx - w / 2);
  const y = Math.round(cy - h / 2);

  const parser = new DOMParser();
  let doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rawSvg}</svg>`, 'image/svg+xml');
  let el = doc.querySelector('g[data-type="audio-frame"]') || doc.querySelector('g[id^="audio-"]');
  if (!el && doc.querySelector('parsererror')) {
    doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rawSvg}</svg>`, 'text/html');
    el = doc.querySelector('g[data-type="audio-frame"]') || doc.querySelector('g[id^="audio-"]');
  }

  if (el) {
    el.setAttribute('id', uniqueId);
    el.setAttribute('data-type', 'audio-frame');
    el.setAttribute('cursor', 'pointer');
    el.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
    return document.importNode(el, true);
  }
  return null;
}
