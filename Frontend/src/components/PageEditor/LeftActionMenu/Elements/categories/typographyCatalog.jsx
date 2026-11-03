import React from 'react';
import {
  createMotionGraphicElementNode
} from '../utils/motionGraphicUtils';

import typographySvg1 from '../../../../../assets/Elements/Typography/Typography text 1.svg';
import typographySvg2 from '../../../../../assets/Elements/Typography/Tpography text 2.svg';
import typographySvg3 from '../../../../../assets/Elements/Typography/Tpography text 3.svg';
import typographySvg4 from '../../../../../assets/Elements/Typography/Tpography text 4.svg';
import typographySvg5 from '../../../../../assets/Elements/Typography/Tpography text 5.svg';

// --- 9 Motion Graphic Titles (subtopic: 'Titles') ---
export const MOTION_GRAPHIC_PRESETS = [
  {
    id: 'lottie-title-1',
    template: 'slide-split',
    name: 'Slide Split (Title 1)',
    category: 'text',
    subtopic: 'Titles',
    tag: 'Motion AE',
    bg: '#08080c',
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
    bg: '#05070e',
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
    bg: '#0d0d14',
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
    bg: '#05070e',
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
    bg: '#0a0c14',
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
    bg: '#08080c',
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
    bg: '#0b0c10',
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
    bg: '#08122c',
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
      className="w-full h-full rounded-[0.35vw] flex items-center justify-center overflow-hidden p-[0.2vw]"
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
          <rect x="8" y="13" width="34" height="24" rx="6" fill={preset.primaryColor} />
          <polygon points="22,19 31,25 22,31" fill="#FFFFFF" />
          <text x="50" y="30" fill={preset.secondaryColor} fontSize="13" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
        </svg>
      ) : preset.template === 'slide-split' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="6" y="10" width="148" height="30" rx="3" fill="#14141d" stroke={preset.secondaryColor} strokeWidth="1.5" />
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
          <text x="80" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="'Arial Black', sans-serif">{preset.text}</text>
          <text x="80" y="36" textAnchor="middle" fill={preset.secondaryColor} fontSize="8" fontWeight="700" letterSpacing="1" fontFamily="sans-serif">{preset.subText}</text>
        </svg>
      ) : preset.template === 'social-badge' ? (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="12" y="10" width="136" height="30" rx="15" fill={preset.primaryColor} />
          <text x="80" y="29" textAnchor="middle" fill={preset.secondaryColor} fontSize="11" fontWeight="800" fontFamily="sans-serif">{preset.text}</text>
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
const parseSvgToGroupNode = (rawSvg, name, targetWidth, targetHeight, cx, cy) => {
  const uniqueId = `group-typography-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return null;

  let origW = parseFloat(svgEl.getAttribute('width'));
  let origH = parseFloat(svgEl.getAttribute('height'));
  const viewBox = svgEl.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      origW = parts[2];
      origH = parts[3];
    }
  }
  if (!origW || isNaN(origW)) origW = targetWidth;
  if (!origH || isNaN(origH)) origH = targetHeight;

  const scale = targetWidth / origW;
  const renderW = targetWidth;
  const renderH = origH * scale;

  const posX = Math.round(cx - renderW / 2);
  const posY = Math.round(cy - renderH / 2);

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('id', uniqueId);
  group.setAttribute('data-type', 'group');
  group.setAttribute('data-is-element-typography', 'true');
  group.setAttribute('data-subtopic', 'Titles');
  group.setAttribute('data-name', name || 'Typography Group');
  group.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);

  // Move inner contents into group
  const innerGroup = svgEl.querySelector('g');
  if (innerGroup) {
    Array.from(innerGroup.childNodes).forEach((child) => {
      group.appendChild(document.importNode(child, true));
    });
  } else {
    Array.from(svgEl.childNodes).forEach((child) => {
      group.appendChild(document.importNode(child, true));
    });
  }

  return group;
};

// Raw SVG strings for clean vector group creation
const RAW_SVG_1 = `<svg width="1272" height="733" viewBox="0 0 1272 733" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Typography text 1">
<text id="TYPEFACE" fill="#FF5468" style="white-space: pre" xml:space="preserve" font-family="Bebas Neue" font-size="333" letter-spacing="0em"><tspan x="130.788" y="342.9">TYPEFACE</tspan></text>
<text id="Bortons" transform="translate(0 177.666) rotate(-7)" fill="#F2F2F2" style="white-space: pre" xml:space="preserve" font-family="Mr Dafoe" font-size="400" letter-spacing="0em"><tspan x="0.03125" y="392.5">Bortons</tspan></text>
<path id="Vector" d="M427 583.691C537 551.691 697 536.691 837 543.691C697 553.691 557 576.691 429 597.691C407 601.691 409 589.691 427 583.691Z" fill="#F2F2F2"/>
<text id="INTRODUCING" fill="#FF5468" style="white-space: pre" xml:space="preserve" font-family="Oswald" font-size="32" font-weight="bold" letter-spacing="0em"><tspan x="534.359" y="37.964">INTRODUCING</tspan></text>
<g id="Group 10440">
<text id="FONT DUO SCRIPT &#38; SANS SERIF + SWASH" fill="#FF5468" style="white-space: pre" xml:space="preserve" font-family="Oswald" font-size="25" font-weight="bold" letter-spacing="0em"><tspan x="399.087" y="675.8">FONT DUO SCRIPT &#38; SANS SERIF + SWASH</tspan></text>
<text id="YOUR STUDIO NAME" fill="#FF5468" style="white-space: pre" xml:space="preserve" font-family="Oswald" font-size="25" font-weight="bold" letter-spacing="0em"><tspan x="509.451" y="716.8">YOUR STUDIO NAME</tspan></text>
</g>
</g>
</svg>`;

const RAW_SVG_2 = `<svg width="1391" height="741" viewBox="0 0 1391 741" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Tpography text 2">
<text id="MASTERPIECE" fill="#D14B45" style="white-space: pre" xml:space="preserve" font-family="Bebas Neue" font-size="337" letter-spacing="0em"><tspan x="0.108398" y="524.101">MASTERPIECE</tspan></text>
<text id="Mind" transform="translate(459 423.124) rotate(-8)" fill="#2B2B2B" style="white-space: pre" xml:space="preserve" font-family="Mr Dafoe" font-size="230" letter-spacing="0em"><tspan x="0.487305" y="225.475">Mind</tspan></text>
<text id="Master" transform="translate(364 65.6445) rotate(-6)" fill="white" style="white-space: pre" xml:space="preserve" font-family="Mr Dafoe" font-size="250" letter-spacing="0em"><tspan x="0.157227" y="245.125">Master</tspan></text>
</g>
</svg>`;

const RAW_SVG_3 = `<svg width="1234" height="515" viewBox="0 0 1234 515" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Tpography text 3">
<text id="2015 TOM HARDY AS MAX" fill="#D14B45" style="white-space: pre" xml:space="preserve" font-family="Oswald" font-size="32" font-weight="bold" letter-spacing="0em"><tspan x="430.281" y="505.964">2015 TOM HARDY AS MAX</tspan></text>
<text id="MADMAX" fill="#F65761" style="white-space: pre" xml:space="preserve" font-family="Bebas Neue" font-size="300" letter-spacing="0em"><tspan x="192.496" y="270">MADMAX</tspan></text>
<text id="FURY ROAD!" transform="translate(0 179.704) rotate(-3)" fill="white" style="white-space: pre" xml:space="preserve" font-family="Kaushan Script" font-size="201" letter-spacing="0em"><tspan x="0.14209" y="218.059">FURY ROAD!</tspan></text>
</g>
</svg>`;

const RAW_SVG_5 = `<svg width="1123" height="2197" viewBox="0 0 1123 2197" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Tpography text 5">
<text id="FOR DESIGNERS" fill="#232323" style="white-space: pre" xml:space="preserve" font-family="Playfair Display" font-size="120" font-weight="bold" letter-spacing="0em"><tspan x="81.1484" y="2166.86">FOR DESIGNERS</tspan></text>
<text id="FONTS" fill="#232323" style="white-space: pre" xml:space="preserve" font-family="Playfair Display" font-size="300" font-weight="bold" letter-spacing="0em"><tspan x="59.4375" y="2036.65">FONTS</tspan></text>
<text id="FREE" fill="#FF7A00" style="white-space: pre" xml:space="preserve" font-family="Playfair Display" font-size="386" font-weight="bold" letter-spacing="0em"><tspan x="69.0107" y="1800.88">FREE</tspan></text>
<text id="25" fill="#FF7A00" style="white-space: pre" xml:space="preserve" font-family="Playfair Display" font-size="1230" font-weight="bold" letter-spacing="-0.07em"><tspan x="0.360535" y="1331.06">25</tspan></text>
<text id="fresh" transform="translate(217 1178.32) rotate(-6)" fill="#232323" stroke="#232323" style="white-space: pre" stroke-width="10" stroke-linejoin="round" xml:space="preserve" font-family="Kaushan Script" font-size="320" letter-spacing="0em"><tspan x="0.125" y="346.72">fresh</tspan></text>
</g>
</svg>`;

export const TYPOGRAPHY_SVG_PRESETS = [
  {
    id: 'typography-svg-1',
    name: 'Typeface Bortons',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: typographySvg1,
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#1a1a24] rounded-[0.35vw]">
        <img
          src={typographySvg1}
          alt="Typeface Bortons"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgToGroupNode(RAW_SVG_1, 'Typeface Bortons', 95, 55, cx, cy)
  },
  {
    id: 'typography-svg-2',
    name: 'Masterpiece Mind',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: typographySvg2,
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#1a1a24] rounded-[0.35vw]">
        <img
          src={typographySvg2}
          alt="Masterpiece Mind"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgToGroupNode(RAW_SVG_2, 'Masterpiece Mind', 95, 50, cx, cy)
  },
  {
    id: 'typography-svg-3',
    name: 'MadMax Fury Road',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: typographySvg3,
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#1a1a24] rounded-[0.35vw]">
        <img
          src={typographySvg3}
          alt="MadMax Fury Road"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgToGroupNode(RAW_SVG_3, 'MadMax Fury Road', 95, 40, cx, cy)
  },
  {
    id: 'typography-svg-4',
    name: 'Typography Poster',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: typographySvg4,
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#FAF8F5] rounded-[0.35vw]">
        <img
          src={typographySvg4}
          alt="Typography Poster"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => {
      // SVG 4 is composed of paths - fetch/parse and insert as a group
      const uniqueId = `group-typography-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('id', uniqueId);
      group.setAttribute('data-type', 'group');
      group.setAttribute('data-is-element-typography', 'true');
      group.setAttribute('data-subtopic', 'Titles');
      group.setAttribute('data-name', 'Typography Poster');
      const scale = 80 / 672;
      const posX = Math.round(cx - 80 / 2);
      const posY = Math.round(cy - (661 * scale) / 2);
      group.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
      
      // Load svg paths dynamically or from DOM
      fetch(typographySvg4)
        .then(res => res.text())
        .then(svgText => {
          const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
          const paths = doc.querySelectorAll('path');
          paths.forEach(p => group.appendChild(document.importNode(p, true)));
        })
        .catch(() => {});

      return group;
    }
  },
  {
    id: 'typography-svg-5',
    name: 'Fresh Fonts 25',
    category: 'text',
    subtopic: 'Typography',
    type: 'group',
    tag: 'Typography',
    src: typographySvg5,
    renderPreview: () => (
      <div className="w-full h-full flex items-center justify-center p-[0.3vw] bg-[#F7F7F8] rounded-[0.35vw]">
        <img
          src={typographySvg5}
          alt="Fresh Fonts 25"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    ),
    insert: (cx, cy) => parseSvgToGroupNode(RAW_SVG_5, 'Fresh Fonts 25', 55, 108, cx, cy)
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
