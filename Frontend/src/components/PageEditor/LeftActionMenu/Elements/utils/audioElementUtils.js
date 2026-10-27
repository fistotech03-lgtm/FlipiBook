/**
 * audioElementUtils.js
 * Isolated utilities for Audio Player Elements in FlipiBook
 * Imported from Audio Player UI Templates (Audio.jsx)
 */
import sampleAudio from '../../../../../assets/Audios/bg music1.mp3';

export const isElementAudio = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'audio-frame' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('audio-')) ||
    (typeof el.closest === 'function' && el.closest('[data-type="audio-frame"], g[id^="audio-"]') !== null)
  );
};

// Audio Player UI Templates based on audio_player_ui_showcase reference designs
export const AUDIO_TEMPLATES = [
  {
    id: 'glassmorphism',
    name: 'Clean Glassmorphism',
    subtitle: 'Frosted Glass & Sleek Timeline',
    badge: 'Glassmorphism',
    width: 360,
    height: 152,
    getSvg: (uniqueId) => `
<g id="audio-${uniqueId}" data-type="audio-frame" data-audio-template="glassmorphism" data-fill-color="#ffffff" data-stroke-color="#e2e8f0" data-icon-color="#334155" data-filename="Dynamic Track.mp3" data-audio-src="${sampleAudio}" data-interaction="audio" data-interaction-value="${sampleAudio}" data-audio-duration-text="00:19 Mins" data-audio-duration-seconds="19" data-audio-size-text="614 kb" data-audio-format-text="MP3" data-audio-speed="1" data-audio-behaviour="Auto Play on Page Open" data-audio-volume="0.8" data-skip-seconds="5" data-audio-controls="true" data-control-play-pause="true" data-control-skip="true" data-control-duration="true" data-control-volume="true" data-control-loop="true" data-control-mute="true" data-fill-opacity="0.9" cursor="pointer">
  <rect class="audio-fill-layer" width="360" height="152" rx="24" fill="#ffffff" fill-opacity="0.92" stroke="#e2e8f0" stroke-width="1.5" />
  <g class="audio-content-group">
    <!-- Album Icon & Track Info -->
    <g class="audio-header-group" transform="translate(20, 18)">
      <rect x="0" y="0" width="42" height="42" rx="12" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
      <path d="M18 13v12.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V17h4v-4h-6z" fill="#475569" />
      <text class="audio-title" x="52" y="19" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#0f172a">Dynamic Track</text>
      <text class="audio-artist" x="52" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="#64748b">Artist Name</text>
    </g>

    <!-- Duration Timeline -->
    <text class="audio-current-time" x="22" y="82" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#64748b">0:00</text>
    <text class="audio-total-time" x="338" y="82" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#64748b">0:19</text>
    <g class="progress-group" pointer-events="all" cursor="pointer">
      <rect x="22" y="84" width="316" height="20" fill="transparent" />
      <rect class="progress-bg" x="22" y="90" width="316" height="4" rx="2" fill="#e2e8f0" pointer-events="none" />
      <rect class="progress-fill" x="22" y="90" width="0" height="4" rx="2" fill="#334155" pointer-events="none" />
      <circle class="progress-knob" cx="22" cy="92" r="6.5" fill="#334155" stroke="#ffffff" stroke-width="2" pointer-events="none" />
    </g>

    <!-- Controls Row -->
    <g class="loop-icon" transform="translate(22, 116)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="#475569" />
    </g>
    <g class="prev-icon" transform="translate(68, 116)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="11 18 2.5 12 11 6 11 18" fill="#475569" />
      <polygon points="19.5 18 11 12 19.5 6 19.5 18" fill="#475569" />
    </g>
    <g class="play-pause-btn" pointer-events="all" cursor="pointer">
      <rect x="120" y="104" width="40" height="40" fill="transparent" />
      <circle class="play-pause-bg" cx="140" cy="124" r="17" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
      <g class="play-pause-icon" transform="translate(131, 115)">
        <polygon points="7 4 17 11 7 18 7 4" fill="#1e293b" />
      </g>
    </g>
    <g class="next-icon" transform="translate(182, 116)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="4 6 12.5 12 4 18 4 6" fill="#475569" />
      <polygon points="12.5 6 21 12 12.5 18 12.5 6" fill="#475569" />
    </g>
    <g class="volume-group" pointer-events="all">
      <g class="volume-slider-part" pointer-events="all" transform="translate(230, 122)" cursor="pointer">
        <rect x="0" y="-8" width="60" height="20" fill="transparent" />
        <rect class="volume-bg" x="0" y="0" width="60" height="4" rx="2" fill="#e2e8f0" />
        <rect class="volume-fill" x="0" y="0" width="48" height="4" rx="2" fill="#334155" />
        <circle class="volume-knob" cx="48" cy="2" r="5" fill="#334155" stroke="#ffffff" stroke-width="1.5" />
      </g>
      <g class="volume-icon" transform="translate(308, 114)" pointer-events="all" cursor="pointer">
        <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#475569" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>
  </g>
</g>`
  },

  {
    id: 'forest-moss',
    name: 'Forest Moss (Solid)',
    subtitle: 'Deep Forest Green & Equalizer Bars',
    badge: 'Equalizer Theme',
    width: 440,
    height: 124,
    getSvg: (uniqueId) => `
<g id="audio-${uniqueId}" data-type="audio-frame" data-audio-template="forest-moss" data-fill-color="#16291a" data-stroke-color="#23422a" data-icon-color="#c9e4b7" data-filename="Forest Melody.mp3" data-audio-src="${sampleAudio}" data-interaction="audio" data-interaction-value="${sampleAudio}" data-audio-duration-text="00:19 Mins" data-audio-duration-seconds="19" data-audio-size-text="614 kb" data-audio-format-text="MP3" data-audio-speed="1" data-audio-behaviour="Auto Play on Page Open" data-audio-volume="0.8" data-skip-seconds="5" data-audio-controls="true" data-control-play-pause="true" data-control-skip="true" data-control-duration="true" data-control-volume="true" data-control-loop="true" data-control-mute="true" cursor="pointer">
  <rect class="audio-fill-layer" width="440" height="124" rx="24" fill="#16291a" stroke="#23422a" stroke-width="1.5" />
  <g class="audio-content-group">
    <!-- Album Art Frame on Left -->
    <g transform="translate(18, 18)">
      <rect x="0" y="0" width="88" height="88" rx="16" fill="#193520" fill-opacity="0.6" stroke="#52845c" stroke-width="2" />
      <g transform="translate(28, 28)">
        <rect x="0" y="0" width="32" height="32" rx="4" fill="none" stroke="#52845c" stroke-width="2" />
        <circle cx="10" cy="10" r="3" fill="#52845c" />
        <polyline points="4 26 12 18 20 24 28 14 32 18" fill="none" stroke="#52845c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>

    <!-- Header Title + Singer + Equalizer Bars -->
    <text class="audio-title" x="122" y="38" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#e0f7d0">Song title</text>
    <text class="audio-artist" x="122" y="52" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="#8aa982">Singer name</text>
    
    <!-- Equalizer Visualizer Bars -->
    <g class="wave-equalizer" transform="translate(378, 28)">
      <rect x="0" y="4" width="3.5" height="16" rx="1.75" fill="#c9e4b7" opacity="0.9" />
      <rect x="6" y="8" width="3.5" height="12" rx="1.75" fill="#c9e4b7" opacity="0.9" />
      <rect x="12" y="2" width="3.5" height="18" rx="1.75" fill="#c9e4b7" opacity="0.9" />
      <rect x="18" y="10" width="3.5" height="10" rx="1.75" fill="#c9e4b7" opacity="0.9" />
      <rect x="24" y="6" width="3.5" height="14" rx="1.75" fill="#c9e4b7" opacity="0.9" />
    </g>

    <!-- Duration Timeline -->
    <text class="audio-current-time" x="122" y="70" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="500" fill="#8aa982">0:00</text>
    <text class="audio-total-time" x="418" y="70" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="500" fill="#8aa982">0:19</text>
    <g class="progress-group" pointer-events="all" cursor="pointer">
      <rect x="122" y="72" width="296" height="18" fill="transparent" />
      <rect class="progress-bg" x="122" y="77" width="296" height="3" rx="1.5" fill="#27462c" pointer-events="none" />
      <rect class="progress-fill" x="122" y="77" width="0" height="3" rx="1.5" fill="#c9e4b7" pointer-events="none" />
      <circle class="progress-knob" cx="122" cy="78.5" r="5.5" fill="#c9e4b7" pointer-events="none" />
    </g>

    <!-- Controls Row -->
    <g class="loop-icon" transform="translate(122, 94)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="#c9e4b7" />
    </g>
    <g class="prev-icon" transform="translate(164, 94)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
      <polygon points="10 16 3 11 10 6 10 16" fill="#c9e4b7" />
      <polygon points="17 16 10 11 17 6 17 16" fill="#c9e4b7" />
    </g>
    <g class="play-pause-btn" pointer-events="all" cursor="pointer">
      <rect x="206" y="85" width="32" height="32" fill="transparent" />
      <circle class="play-pause-bg" cx="222" cy="101" r="13" fill="none" stroke="#c9e4b7" stroke-width="1.5" />
      <g class="play-pause-icon" transform="translate(216, 94)">
        <polygon points="5 3 13 8 5 13 5 3" fill="#c9e4b7" />
      </g>
    </g>
    <g class="next-icon" transform="translate(254, 94)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
      <polygon points="3 6 10 11 3 16 3 6" fill="#c9e4b7" />
      <polygon points="10 6 17 11 10 16 10 6" fill="#c9e4b7" />
    </g>
    <g class="volume-group" pointer-events="all">
      <g class="volume-slider-part" pointer-events="all" transform="translate(294, 99)" cursor="pointer">
        <rect x="0" y="-8" width="60" height="20" fill="transparent" />
        <rect class="volume-bg" x="0" y="0" width="60" height="3" rx="1.5" fill="#27462c" />
        <rect class="volume-fill" x="0" y="0" width="48" height="3" rx="1.5" fill="#c9e4b7" />
        <circle class="volume-knob" cx="48" cy="1.5" r="5" fill="#c9e4b7" />
      </g>
      <g class="volume-icon" transform="translate(390, 92)" pointer-events="all" cursor="pointer">
        <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#c9e4b7" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="#c9e4b7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>
  </g>
</g>`
  },

  {
    id: 'cyber-blue',
    name: 'Cyber Neon Blue',
    subtitle: 'Futuristic Dark & Glowing Cyan Accents',
    badge: 'Neon Glow',
    width: 360,
    height: 114,
    getSvg: (uniqueId) => `
<g id="audio-${uniqueId}" data-type="audio-frame" data-audio-template="cyber-blue" data-fill-color="#0c1421" data-stroke-color="#182840" data-icon-color="#00f2fe" data-filename="Cyber Synth.mp3" data-audio-src="${sampleAudio}" data-interaction="audio" data-interaction-value="${sampleAudio}" data-audio-duration-text="00:19 Mins" data-audio-duration-seconds="19" data-audio-size-text="614 kb" data-audio-format-text="MP3" data-audio-speed="1" data-audio-behaviour="Auto Play on Page Open" data-audio-volume="0.8" data-skip-seconds="5" data-audio-controls="true" data-control-play-pause="true" data-control-skip="true" data-control-duration="true" data-control-volume="true" data-control-loop="true" data-control-mute="true" cursor="pointer">
  <defs>
    <filter id="cyan-glow-${uniqueId}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect class="audio-fill-layer" width="360" height="114" rx="20" fill="#0c1421" stroke="#182840" stroke-width="1.5" />
  <g class="audio-content-group">
    <!-- Top Row Controls with Cyan Glow -->
    <g class="loop-icon" transform="translate(24, 24)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
    </g>
    <g class="prev-icon" transform="translate(74, 24)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="11 18 2.5 12 11 6 11 18" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
      <polygon points="19.5 18 11 12 19.5 6 19.5 18" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
    </g>
    <g class="play-pause-btn" pointer-events="all" cursor="pointer">
      <rect x="120" y="12" width="40" height="40" fill="transparent" />
      <circle class="play-pause-bg" cx="140" cy="32" r="16" fill="#00f2fe" fill-opacity="0.1" stroke="#00f2fe" stroke-width="1.5" filter="url(#cyan-glow-${uniqueId})" />
      <g class="play-pause-icon" transform="translate(132, 23)">
        <polygon points="7 4 17 11 7 18 7 4" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
      </g>
    </g>
    <g class="next-icon" transform="translate(190, 24)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="4 6 12.5 12 4 18 4 6" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
      <polygon points="12.5 6 21 12 12.5 18 12.5 6" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
    </g>
    <g class="volume-group" pointer-events="all">
      <g class="volume-slider-part" pointer-events="all" transform="translate(236, 30)" cursor="pointer">
        <rect x="0" y="-8" width="55" height="20" fill="transparent" />
        <rect class="volume-bg" x="0" y="0" width="55" height="3" rx="1.5" fill="#16273c" />
        <rect class="volume-fill" x="0" y="0" width="44" height="3" rx="1.5" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
        <circle class="volume-knob" cx="44" cy="1.5" r="5" fill="#00f2fe" stroke="#0c1421" stroke-width="1.5" filter="url(#cyan-glow-${uniqueId})" />
      </g>
      <g class="volume-icon" transform="translate(312, 22)" pointer-events="all" cursor="pointer">
        <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#00f2fe" filter="url(#cyan-glow-${uniqueId})" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="#00f2fe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="url(#cyan-glow-${uniqueId})" />
      </g>
    </g>

    <!-- Bottom Row Timeline -->
    <text class="audio-current-time" x="24" y="86" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00f2fe">0:00</text>
    <g class="progress-group" pointer-events="all" cursor="pointer">
      <rect x="64" y="72" width="230" height="22" fill="transparent" />
      <rect class="progress-bg" x="64" y="81" width="230" height="4" rx="2" fill="#16273c" pointer-events="none" />
      <rect class="progress-fill" x="64" y="81" width="0" height="4" rx="2" fill="#00f2fe" pointer-events="none" filter="url(#cyan-glow-${uniqueId})" />
      <circle class="progress-knob" cx="64" cy="83" r="7" fill="#00f2fe" stroke="#0c1421" stroke-width="2" pointer-events="none" filter="url(#cyan-glow-${uniqueId})" />
    </g>
    <text class="audio-total-time" x="336" y="86" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#67e8f9">0:19</text>
  </g>
</g>`
  },

  {
    id: 'silver-mono',
    name: 'Silver Mono Capsule',
    subtitle: 'Brushed Metallic Capsule Pill',
    badge: 'Metallic Finish',
    width: 450,
    height: 52,
    getSvg: (uniqueId) => `
<g id="audio-${uniqueId}" data-type="audio-frame" data-audio-template="silver-mono" data-fill-color="#8c8c8c" data-stroke-color="#ffffff" data-icon-color="#1e293b" data-filename="Acoustic Instrumental.mp3" data-audio-src="${sampleAudio}" data-interaction="audio" data-interaction-value="${sampleAudio}" data-audio-duration-text="00:19 Mins" data-audio-duration-seconds="19" data-audio-size-text="614 kb" data-audio-format-text="MP3" data-audio-speed="1" data-audio-behaviour="Auto Play on Page Open" data-audio-volume="0.8" data-skip-seconds="5" data-audio-controls="true" data-control-play-pause="true" data-control-skip="true" data-control-duration="true" data-control-volume="true" data-control-loop="true" data-control-mute="true" cursor="pointer">
  <defs>
    <linearGradient id="silver-grad-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b8b8b8" />
      <stop offset="50%" stop-color="#8c8c8c" />
      <stop offset="100%" stop-color="#747474" />
    </linearGradient>
  </defs>
  <rect class="audio-fill-layer" width="450" height="52" rx="26" fill="url(#silver-grad-${uniqueId})" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.45" />
  <g class="audio-content-group">
    <g class="loop-icon" transform="translate(20, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="#1e293b" />
    </g>
    <g class="prev-icon" transform="translate(54, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
      <polygon points="10 16 3 11 10 6 10 16" fill="#1e293b" />
      <polygon points="17 16 10 11 17 6 17 16" fill="#1e293b" />
    </g>
    <g class="play-pause-btn" pointer-events="all" cursor="pointer">
      <rect x="82" y="10" width="32" height="32" fill="transparent" />
      <circle class="play-pause-bg" cx="98" cy="26" r="13" fill="none" stroke="#1e293b" stroke-width="1.5" />
      <g class="play-pause-icon" transform="translate(92, 19)">
        <polygon points="5 3 13 8 5 13 5 3" fill="#1e293b" />
      </g>
    </g>
    <g class="next-icon" transform="translate(126, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
      <polygon points="3 6 10 11 3 16 3 6" fill="#1e293b" />
      <polygon points="10 6 17 11 10 16 10 6" fill="#1e293b" />
    </g>

    <!-- Duration Timeline Inlined -->
    <text class="audio-current-time" x="162" y="30" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#0f172a">0:00</text>
    <g class="progress-group" pointer-events="all" cursor="pointer">
      <rect x="194" y="16" width="90" height="20" fill="transparent" />
      <rect class="progress-bg" x="194" y="24" width="90" height="4" rx="2" fill="rgba(0,0,0,0.25)" pointer-events="none" />
      <rect class="progress-fill" x="194" y="24" width="0" height="4" rx="2" fill="#1e293b" pointer-events="none" />
      <circle class="progress-knob" cx="194" cy="26" r="5" fill="#1e293b" pointer-events="none" />
    </g>
    <text class="audio-total-time" x="294" y="30" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#0f172a">0:19</text>

    <!-- Volume -->
    <g class="volume-group" pointer-events="all">
      <g class="volume-slider-part" pointer-events="all" transform="translate(336, 24)" cursor="pointer">
        <rect x="0" y="-8" width="55" height="20" fill="transparent" />
        <rect class="volume-bg" x="0" y="0" width="55" height="4" rx="2" fill="rgba(0,0,0,0.25)" />
        <rect class="volume-fill" x="0" y="0" width="44" height="4" rx="2" fill="#1e293b" />
        <circle class="volume-knob" cx="44" cy="2" r="5" fill="#1e293b" />
      </g>
      <g class="volume-icon" transform="translate(410, 18)" pointer-events="all" cursor="pointer">
        <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#1e293b" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>
  </g>
</g>`
  },

  {
    id: 'sunset-vibrant',
    name: 'Sunset Vibrant',
    subtitle: 'Coral to Magenta Gradient with Neon Glow',
    badge: 'Vibrant Glow',
    width: 460,
    height: 54,
    getSvg: (uniqueId) => `
<g id="audio-${uniqueId}" data-type="audio-frame" data-audio-template="sunset-vibrant" data-fill-color="#ff2a55" data-stroke-color="none" data-icon-color="#ffffff" data-filename="Sunset Vibe.mp3" data-audio-src="${sampleAudio}" data-interaction="audio" data-interaction-value="${sampleAudio}" data-audio-duration-text="00:19 Mins" data-audio-duration-seconds="19" data-audio-size-text="614 kb" data-audio-format-text="MP3" data-audio-speed="1" data-audio-behaviour="Auto Play on Page Open" data-audio-volume="0.8" data-skip-seconds="5" data-audio-controls="true" data-control-play-pause="true" data-control-skip="true" data-control-duration="true" data-control-volume="true" data-control-loop="true" data-control-mute="true" cursor="pointer">
  <defs>
    <linearGradient id="sunset-grad-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff4328" />
      <stop offset="35%" stop-color="#ff2a55" />
      <stop offset="70%" stop-color="#e61972" />
      <stop offset="100%" stop-color="#c4188b" />
    </linearGradient>
  </defs>
  <rect class="audio-fill-layer" width="460" height="54" rx="27" fill="url(#sunset-grad-${uniqueId})" />
  <g class="audio-content-group">
    <!-- Controls Row -->
    <g class="loop-icon" transform="translate(18, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="#ffffff" fill-opacity="0.85" />
    </g>
    <g class="prev-icon" transform="translate(50, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="10 16 3 11 10 6 10 16" fill="#ffffff" />
      <polygon points="17 16 10 11 17 6 17 16" fill="#ffffff" />
    </g>
    <g class="play-pause-btn" transform="translate(84, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <g class="play-pause-icon">
        <polygon points="5 3 14 9 5 15 5 3" fill="#ffffff" />
      </g>
    </g>
    <g class="next-icon" transform="translate(116, 18)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="3 6 10 11 3 16 3 6" fill="#ffffff" />
      <polygon points="10 6 17 11 10 16 10 6" fill="#ffffff" />
    </g>

    <!-- Combined Inline Time -->
    <text class="audio-current-time" x="150" y="31" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#ffffff">0:00</text>
    <text class="audio-duration-separator" x="178" y="31" font-family="'Inter', sans-serif" font-size="11" fill="rgba(255,255,255,0.7)">/</text>
    <text class="audio-total-time" x="186" y="31" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="rgba(255,255,255,0.9)">0:19</text>

    <!-- Progress Bar -->
    <g class="progress-group" pointer-events="all" cursor="pointer">
      <rect x="222" y="16" width="118" height="20" fill="transparent" />
      <rect class="progress-bg" x="222" y="25" width="118" height="3" rx="1.5" fill="rgba(255,255,255,0.38)" pointer-events="none" />
      <rect class="progress-fill" x="222" y="25" width="0" height="3" rx="1.5" fill="#ffffff" pointer-events="none" />
      <circle class="progress-knob" cx="222" cy="26.5" r="5.5" fill="#ffffff" pointer-events="none" />
    </g>

    <!-- Volume Slider -->
    <g class="volume-group" pointer-events="all">
      <g class="volume-slider-part" pointer-events="all" transform="translate(356, 25)" cursor="pointer">
        <rect x="0" y="-8" width="50" height="20" fill="transparent" />
        <rect class="volume-bg" x="0" y="0" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.38)" />
        <rect class="volume-fill" x="0" y="0" width="40" height="3" rx="1.5" fill="#ffffff" />
        <circle class="volume-knob" cx="40" cy="1.5" r="5" fill="#ffffff" />
      </g>
      <g class="volume-icon" transform="translate(424, 18)" pointer-events="all" cursor="pointer">
        <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#ffffff" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>
  </g>
</g>`
  },

  {
    id: 'cyberpunk-wide',
    name: 'Cyberpunk Neon (Wide Bar)',
    subtitle: 'Pro Console Deck with Top Glow Bar',
    badge: 'Console Bar',
    width: 460,
    height: 74,
    getSvg: (uniqueId) => `
<g id="audio-${uniqueId}" data-type="audio-frame" data-audio-template="cyberpunk-wide" data-fill-color="#080d15" data-stroke-color="#162133" data-icon-color="#00f2fe" data-filename="Neon Skyline.mp3" data-audio-src="${sampleAudio}" data-interaction="audio" data-interaction-value="${sampleAudio}" data-audio-duration-text="00:19 Mins" data-audio-duration-seconds="19" data-audio-size-text="614 kb" data-audio-format-text="MP3" data-audio-speed="1" data-audio-behaviour="Auto Play on Page Open" data-audio-volume="0.8" data-skip-seconds="5" data-audio-controls="true" data-control-play-pause="true" data-control-skip="true" data-control-duration="true" data-control-volume="true" data-control-loop="true" data-control-mute="true" cursor="pointer">
  <defs>
    <filter id="wide-cyan-glow-${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect class="audio-fill-layer" width="460" height="74" rx="12" fill="#080d15" stroke="#162133" stroke-width="1.5" />
  <g class="audio-content-group">
    <!-- Top Progress Line -->
    <g class="progress-group" pointer-events="all" cursor="pointer">
      <rect x="16" y="8" width="428" height="18" fill="transparent" />
      <rect class="progress-bg" x="16" y="16" width="428" height="3" rx="1.5" fill="#0f1926" stroke="#16273c" stroke-width="0.5" pointer-events="none" />
      <rect class="progress-fill" x="16" y="16" width="0" height="3" rx="1.5" fill="#00f2fe" filter="url(#wide-cyan-glow-${uniqueId})" pointer-events="none" />
      <circle class="progress-knob" cx="16" cy="17.5" r="5.5" fill="#00f2fe" filter="url(#wide-cyan-glow-${uniqueId})" pointer-events="none" />
    </g>

    <!-- Bottom Controls: Cyan play, Purple navigation -->
    <g class="play-pause-btn" transform="translate(18, 38)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <g class="play-pause-icon">
        <polygon points="5 3 14 9 5 15 5 3" fill="#00f2fe" filter="url(#wide-cyan-glow-${uniqueId})" />
      </g>
    </g>
    <g class="prev-icon" transform="translate(52, 38)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="10 15 3 10.5 10 6 10 15" fill="#c084fc" />
      <polygon points="17 15 10 10.5 17 6 17 15" fill="#c084fc" />
    </g>
    <g class="next-icon" transform="translate(86, 38)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <polygon points="3 6 10 10.5 3 15 3 6" fill="#c084fc" />
      <polygon points="10 6 17 10.5 10 15 10 6" fill="#c084fc" />
    </g>
    <g class="loop-icon" transform="translate(120, 38)" pointer-events="all" cursor="pointer">
      <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="#c084fc" />
    </g>

    <!-- Right Controls: Numbers + Volume + Mute -->
    <text class="audio-current-time" x="250" y="51" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00f2fe">0:00</text>
    <text class="audio-duration-separator" x="280" y="51" font-family="'JetBrains Mono', monospace" font-size="11" fill="#64748b">/</text>
    <text class="audio-total-time" x="290" y="51" font-family="'JetBrains Mono', monospace" font-size="11" fill="#94a3b8">0:19</text>
    <g class="volume-group" pointer-events="all">
      <g class="volume-slider-part" pointer-events="all" transform="translate(340, 45)" cursor="pointer">
        <rect x="0" y="-8" width="60" height="20" fill="transparent" />
        <rect class="volume-bg" x="0" y="0" width="60" height="3" rx="1.5" fill="#16273c" />
        <rect class="volume-fill" x="0" y="0" width="48" height="3" rx="1.5" fill="#00f2fe" filter="url(#wide-cyan-glow-${uniqueId})" />
        <circle class="volume-knob" cx="48" cy="1.5" r="5" fill="#00f2fe" filter="url(#wide-cyan-glow-${uniqueId})" />
      </g>
      <g class="volume-icon" transform="translate(420, 38)" pointer-events="all" cursor="pointer">
        <rect x="-4" y="-4" width="24" height="24" fill="transparent" />
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#c084fc" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>
  </g>
</g>`
  }
];

// Alias for backwards compatibility
export const AUDIO_OPTIONS = AUDIO_TEMPLATES;

/**
 * Returns raw SVG string for a given audio template
 */
export function getAudioSvgCode(templateOrId, uniqueId = Date.now()) {
  const tpl = typeof templateOrId === 'object' && templateOrId !== null
    ? templateOrId
    : AUDIO_TEMPLATES.find((t) => t.id === templateOrId) || AUDIO_TEMPLATES[0];

  return typeof tpl.getSvg === 'function' ? tpl.getSvg(uniqueId) : tpl.svg;
}

/**
 * Returns an embeddable preview SVG string with responsive viewBox
 */
export function getAudioPreviewSvg(templateOrId) {
  const tpl = typeof templateOrId === 'object' && templateOrId !== null
    ? templateOrId
    : AUDIO_TEMPLATES.find((t) => t.id === templateOrId) || AUDIO_TEMPLATES[0];

  const uniqueId = `prev-${tpl.id}`;
  const innerSvg = getAudioSvgCode(tpl, uniqueId);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tpl.width} ${tpl.height}" width="100%" height="100%">${innerSvg}</svg>`;
}

/**
 * Creates and imports an Audio SVG element node into the canvas document
 */
export function createAudioElementNode(templateOrId = 'glassmorphism', cx = 105, cy = 148) {
  const opt = typeof templateOrId === 'object' && templateOrId !== null
    ? templateOrId
    : AUDIO_TEMPLATES.find((o) => o.id === templateOrId) || AUDIO_TEMPLATES[0];

  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const rawSvg = typeof opt.getSvg === 'function' ? opt.getSvg(uniqueId) : opt.svg;

  const scale = opt.id === 'audio-icon' ? 0.35 : 0.25;
  const w = (opt.width || 360) * scale;
  const h = (opt.height || 100) * scale;
  const x = Math.round(cx - w / 2);
  const y = Math.round(cy - h / 2);

  const parser = new DOMParser();
  let doc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rawSvg}</svg>`,
    'image/svg+xml'
  );
  let el = doc.querySelector('g[data-type="audio-frame"]') || doc.querySelector('g[id^="audio-"]');
  if (!el && doc.querySelector('parsererror')) {
    doc = parser.parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rawSvg}</svg>`,
      'text/html'
    );
    el = doc.querySelector('g[data-type="audio-frame"]') || doc.querySelector('g[id^="audio-"]');
  }

  if (el) {
    el.setAttribute('id', `audio-${uniqueId}`);
    el.setAttribute('data-type', 'audio-frame');
    el.setAttribute('data-name', 'Audio');
    el.setAttribute('data-audio-title', opt.name || 'Audio');
    el.setAttribute('data-audio-template', opt.id);
    el.setAttribute('cursor', 'pointer');
    el.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
    return document.importNode(el, true);
  }
  return null;
}

/**
 * Returns the Play icon SVG for a given audio template
 */
export function getTemplatePlayIconSvg(templateId = 'sunset-vibrant', color = '#ffffff', filterId = '') {
  const fAttr = filterId ? `filter="url(#${filterId})"` : '';
  switch (templateId) {
    case 'audio-icon':
      return `<polygon points="20 16 32 24 20 32" fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round" />`;
    case 'glassmorphism':
      return `<polygon points="7 4 17 11 7 18 7 4" fill="${color}" />`;
    case 'cyber-blue':
      return `<polygon points="7 4 17 11 7 18 7 4" fill="${color}" ${fAttr} />`;
    case 'forest-moss':
    case 'silver-mono':
      return `<polygon points="5 3 13 8 5 13 5 3" fill="${color}" />`;
    case 'sunset-vibrant':
    case 'cyberpunk-wide':
    default:
      return `<polygon points="5 3 14 9 5 15 5 3" fill="${color}" ${fAttr} />`;
  }
}

/**
 * Returns the Pause icon SVG for a given audio template
 */
export function getTemplatePauseIconSvg(templateId = 'sunset-vibrant', color = '#ffffff', filterId = '') {
  const fAttr = filterId ? `filter="url(#${filterId})"` : '';
  switch (templateId) {
    case 'audio-icon':
      return `<rect x="20" y="16" width="4" height="16" rx="1" fill="${color}" /><rect x="28" y="16" width="4" height="16" rx="1" fill="${color}" />`;
    case 'glassmorphism':
      return `<rect x="6" y="4" width="3.5" height="14" rx="1" fill="${color}" /><rect x="13" y="4" width="3.5" height="14" rx="1" fill="${color}" />`;
    case 'cyber-blue':
      return `<rect x="6" y="4" width="3.5" height="14" rx="1" fill="${color}" ${fAttr} /><rect x="13" y="4" width="3.5" height="14" rx="1" fill="${color}" ${fAttr} />`;
    case 'forest-moss':
    case 'silver-mono':
      return `<rect x="4" y="3.5" width="2.5" height="10" rx="0.8" fill="${color}" /><rect x="8.5" y="3.5" width="2.5" height="10" rx="0.8" fill="${color}" />`;
    case 'sunset-vibrant':
    case 'cyberpunk-wide':
    default:
      return `<rect x="5" y="4" width="3.5" height="11" rx="1" fill="${color}" ${fAttr} /><rect x="11.5" y="4" width="3.5" height="11" rx="1" fill="${color}" ${fAttr} />`;
  }
}
