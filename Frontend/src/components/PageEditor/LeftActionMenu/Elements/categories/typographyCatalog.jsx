import React from 'react';
import {
  createMotionGraphicElementNode
} from '../utils/motionGraphicUtils';
import {
  RAW_SVG_1,
  RAW_SVG_2,
  RAW_SVG_3,
  RAW_SVG_4,
  RAW_SVG_5,
  TYPOGRAPHY_PREVIEW_URIS,
  parseSvgStringToGroupNode
} from '../utils/textElementUtils';

// --- 9 Motion Graphic Titles (subtopic: 'Titles') ---
export const MOTION_GRAPHIC_PRESETS = [
  {
    id: 'lottie-title-1',
    template: 'slide-split',
    name: 'Slide Split (Title 1)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#000000',
    secondaryColor: '#FF0040',
    fontSize: 24,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 5300
  },
  {
    id: 'lottie-title-2',
    template: 'swap-bar',
    name: 'Swap Bar (Title 2)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#E6007A',
    secondaryColor: '#E6007A',
    fontSize: 24,
    fontFamily: 'Georgia, "Times New Roman", serif',
    duration: 4500
  },
  {
    id: 'lottie-title-3',
    template: 'bar-sweep',
    name: 'Bar Sweep (Title 3)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#000000',
    secondaryColor: '#FFC600',
    fontSize: 24,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 8000
  },
  {
    id: 'lottie-title-4',
    template: 'square-open',
    name: 'Square Open (Title 4)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#000000',
    secondaryColor: '#00E5FF',
    fontSize: 24,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 6500
  },
  {
    id: 'lottie-title-5',
    template: 'cyber-frame',
    name: 'Cyber Frame (Title 5)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'ANIMATION',
    subText: '',
    primaryColor: '#000000',
    secondaryColor: '#FF0033',
    glowIntensity: 18,
    fontSize: 16,
    fontFamily: 'Roboto, sans-serif',
    duration: 4700
  },
  {
    id: 'lottie-title-6',
    template: 'flipi-split',
    name: 'Flipi Slash (Title 6)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#000000',
    secondaryColor: '#FFC600',
    glowIntensity: 0,
    fontSize: 24,
    fontFamily: 'Impact, sans-serif',
    duration: 4500
  },
  {
    id: 'lottie-title-7',
    template: 'box-reveal',
    name: 'Dual Box (Title 7)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#FF1E27',
    secondaryColor: '#000000',
    glowIntensity: 0,
    fontSize: 20,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 4000
  },
  {
    id: 'lottie-title-8',
    template: 'youtube-channel',
    name: 'YouTube Intro (Title 8)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: '',
    primaryColor: '#FF0024',
    secondaryColor: '#000000',
    glowIntensity: 0,
    fontSize: 21,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 3600
  },
  {
    id: 'lottie-title-9',
    template: 'social-badge',
    name: 'Social Badge (Title 9)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#ffffff',
    text: 'FLIPIBOOK',
    subText: '',
    primaryColor: '#0E34A8',
    secondaryColor: '#FFFFFF',
    glowIntensity: 0,
    fontSize: 18,
    fontFamily: '"Expletus Sans", Arial, sans-serif',
    duration: 4200
  }
];

// Helper to format motion graphic preview
const renderMotionGraphicPreview = (preset) => {
  return (
    <div
      className="w-full h-full rounded-[0.35vw] flex items-center justify-center overflow-hidden p-[0.2vw] border border-gray-100"
      style={{ backgroundColor: preset.bg }}
    >
      {preset.template === 'flipi-split' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <line x1="18" y1="42" x2="28" y2="8" stroke={preset.secondaryColor} strokeWidth="3" strokeLinecap="round" />
          <g transform="translate(34, 0)">
            <text x="6" y="20" fill={preset.primaryColor} fontSize="11" fontFamily="Arial, sans-serif">{preset.text}</text>
            <text x="-3" y="38" fill={preset.primaryColor} fontSize="16" fontFamily="Impact, sans-serif">{preset.subText}</text>
          </g>
        </svg>
      ) : preset.template === 'box-reveal' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="6" y="6" width="148" height="38" rx="4" fill="none" stroke={preset.primaryColor} strokeWidth="2" />
          <text x="80" y="23" textAnchor="middle" fill={preset.secondaryColor} fontSize="13" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
          <text x="80" y="38" textAnchor="middle" fill={preset.primaryColor} fontSize="10" fontFamily="Arial, sans-serif">{preset.subText}</text>
        </svg>
      ) : preset.template === 'youtube-channel' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(18, 0)">
            <rect x="8" y="13" width="34" height="24" rx="6" fill={preset.primaryColor} />
            <polygon points="21,18 31,25 21,32" fill="#FFFFFF" />
            <text x="50" y="30" fill={preset.secondaryColor} fontSize="13" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
          </g>
        </svg>
      ) : preset.template === 'slide-split' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="6" y="10" width="148" height="30" rx="3" fill="#ffffff" stroke={preset.secondaryColor} strokeWidth="1.5" />
          <text x="80" y="24" textAnchor="middle" fill={preset.primaryColor} fontSize="12" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
          <text x="80" y="35" textAnchor="middle" fill={preset.secondaryColor} fontSize="8" fontFamily="Arial, sans-serif">{preset.subText}</text>
        </svg>
      ) : preset.template === 'swap-bar' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <text x="74" y="30" textAnchor="end" fill={preset.primaryColor} fontSize="11" fontFamily="'Georgia', serif" letterSpacing="1">{preset.text}</text>
          <rect x="78" y="16" width="3" height="18" fill={preset.secondaryColor} rx="0.5" />
          <text x="85" y="30" textAnchor="start" fill="#000000" fontSize="11" fontFamily="'Georgia', serif" letterSpacing="1">{preset.subText}</text>
        </svg>
      ) : preset.template === 'bar-sweep' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <line x1="10" y1="36" x2="150" y2="36" stroke={preset.secondaryColor} strokeWidth="2" />
          <text x="80" y="27" textAnchor="middle" fill={preset.primaryColor} fontSize="13" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
        </svg>
      ) : preset.template === 'square-open' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="25" y="6" width="110" height="38" rx="2" fill="none" stroke={preset.secondaryColor} strokeWidth="2" />
          <text x="80" y="24" textAnchor="middle" fill="#000000" fontSize="11" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
          <text x="80" y="36" textAnchor="middle" fill={preset.secondaryColor} fontSize="8" fontWeight="700" letterSpacing="1" fontFamily="sans-serif">{preset.subText}</text>
        </svg>
      ) : preset.template === 'social-badge' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          {/* Pill bar */}
          <rect x="28" y="15" width="124" height="20" rx="10" fill={preset.primaryColor} />
          {/* Text inside pill */}
          <text x="64" y="29" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">{preset.text}</text>
          {/* Rotated diamond badge */}
          <g transform="translate(24, 25)">
            <rect x="-14" y="-14" width="33" height="33" rx="7" fill={preset.primaryColor} stroke="#FFFFFF" strokeWidth="1" transform="rotate(45)" />
            <path d="M1 8v-5.5h1.8l.3-2.1h-2.1V-.7c0-.6.2-1 1.1-1h1.1V-3.5c-.2 0-.9-.1-1.6-.1-1.6 0-2.7 1-2.7 2.8v1.6H-3v2.1h1.9V8H1z" fill="#FFFFFF" transform="scale(0.9)" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="6" y="6" width="148" height="38" rx="8" fill="none" stroke={preset.primaryColor} strokeWidth="2.5" />
          <text x="80" y="29" textAnchor="middle" fill={preset.primaryColor} fontSize="12" fontWeight="700" fontFamily="'Roboto', sans-serif" letterSpacing="1">{preset.text}</text>
        </svg>
      )}
    </div>
  );
};

// --- SVG Typography Text Presets (subtopic: 'Typography') ---
export const TYPOGRAPHY_SVG_PRESETS = [
  {
    id: 'typography-svg-1',
    name: 'Typeface Bortons',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: TYPOGRAPHY_PREVIEW_URIS['typography-svg-1'],
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#ffffff] border border-gray-100 rounded-[0.35vw]">
        <img
          src={TYPOGRAPHY_PREVIEW_URIS['typography-svg-1']}
          alt="Typeface Bortons"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgStringToGroupNode(RAW_SVG_1, 'Typeface Bortons', 95, 55, cx, cy)
  },
  {
    id: 'typography-svg-2',
    name: 'Masterpiece Mind',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: TYPOGRAPHY_PREVIEW_URIS['typography-svg-2'],
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#ffffff] border border-gray-100 rounded-[0.35vw]">
        <img
          src={TYPOGRAPHY_PREVIEW_URIS['typography-svg-2']}
          alt="Masterpiece Mind"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgStringToGroupNode(RAW_SVG_2, 'Masterpiece Mind', 95, 50, cx, cy)
  },
  {
    id: 'typography-svg-3',
    name: 'MadMax Fury Road',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: TYPOGRAPHY_PREVIEW_URIS['typography-svg-3'],
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#ffffff] border border-gray-100 rounded-[0.35vw]">
        <img
          src={TYPOGRAPHY_PREVIEW_URIS['typography-svg-3']}
          alt="MadMax Fury Road"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgStringToGroupNode(RAW_SVG_3, 'MadMax Fury Road', 95, 40, cx, cy)
  },
  {
    id: 'typography-svg-4',
    name: 'Typography Poster',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: TYPOGRAPHY_PREVIEW_URIS['typography-svg-4'],
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#ffffff] border border-gray-100 rounded-[0.35vw]">
        <img
          src={TYPOGRAPHY_PREVIEW_URIS['typography-svg-4']}
          alt="Typography Poster"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgStringToGroupNode(RAW_SVG_4, 'Typography Poster', 80, 80, cx, cy)
  },
  {
    id: 'typography-svg-5',
    name: 'Fresh Fonts 25',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: TYPOGRAPHY_PREVIEW_URIS['typography-svg-5'],
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#ffffff] border border-gray-100 rounded-[0.35vw]">
        <img
          src={TYPOGRAPHY_PREVIEW_URIS['typography-svg-5']}
          alt="Fresh Fonts 25"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgStringToGroupNode(RAW_SVG_5, 'Fresh Fonts 25', 55, 108, cx, cy)
  }
];

// Unified Typography Items Export
export const TYPOGRAPHY_ITEMS = [
  // --- Motion Graphic Titles (subtopic: 'Titles') ---
  ...MOTION_GRAPHIC_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'text',
    subtopic: 'Titles',
    type: 'text',
    renderPreview: () => renderMotionGraphicPreview(preset),
    insert: (cx, cy) => createMotionGraphicElementNode(preset, cx, cy)
  })),

  // --- SVG Typography Text Presets (subtopic: 'Typography') ---
  ...TYPOGRAPHY_SVG_PRESETS.map((preset) => ({
    ...preset,
    subtopic: 'Typography'
  }))
];
