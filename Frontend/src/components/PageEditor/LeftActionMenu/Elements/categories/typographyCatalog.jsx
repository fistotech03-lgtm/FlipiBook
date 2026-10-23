import React from 'react';
import { createKineticElementNode } from '../utils/kineticTypographyUtils';
import { createMotionGraphicElementNode } from '../utils/motionGraphicUtils';

export const MOTION_GRAPHIC_PRESETS = [
  {
    id: 'lottie-neon-cyber-frame',
    template: 'cyber-frame',
    name: 'Cyber Frame',
    category: 'text',
    tag: 'Motion AE',
    bg: '#05070e',
    text: 'ANIMATION',
    subText: '',
    primaryColor: '#FF0033',
    secondaryColor: '#FFFFFF',
    glowIntensity: 18,
    fontSize: 28,
    fontFamily: 'Roboto, sans-serif',
    duration: 4700
  },
  {
    id: 'lottie-flipi-slash-title',
    template: 'flipi-split',
    name: 'Flipi Slash',
    category: 'text',
    tag: 'Motion AE',
    bg: '#0a0c14',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#F3F2F3',
    secondaryColor: '#FFC600',
    glowIntensity: 0,
    fontSize: 24,
    fontFamily: 'Impact, sans-serif',
    duration: 4500
  },
  {
    id: 'lottie-box-counter-slide',
    template: 'box-reveal',
    name: 'Dual Box',
    category: 'text',
    tag: 'Motion AE',
    bg: '#08080c',
    text: 'FLIPIBOOK',
    subText: 'ANIMATION',
    primaryColor: '#FF1E27',
    secondaryColor: '#FFFFFF',
    glowIntensity: 0,
    fontSize: 20,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 4000
  },
  {
    id: 'lottie-youtube-channel-intro',
    template: 'youtube-channel',
    name: 'YouTube Intro',
    category: 'text',
    tag: 'Motion AE',
    bg: '#0b0c10',
    text: 'FLIPIBOOK',
    subText: '',
    primaryColor: '#FF0024',
    secondaryColor: '#FFFFFF',
    glowIntensity: 0,
    fontSize: 21,
    fontFamily: '"Arial Black", Impact, sans-serif',
    duration: 3600
  }
];

export const KINETIC_PRESETS = [
  {
    id: 'kinetic-slide-up',
    name: 'Kinetic Slide',
    category: 'text',
    tag: 'Kinetic',
    bg: '#0F172A',
    textColor: '#FFFFFF',
    fontFamily: 'Inter',
    words: ['CODING', 'KINETIC', 'TYPE'],
    animType: 'slide-up',
    duration: 3800,
    stagger: 50,
    fontSize: 34
  },
  {
    id: 'kinetic-neon-pulse',
    name: 'Neon Pulse',
    category: 'text',
    tag: 'Kinetic',
    bg: '#090D16',
    textColor: '#00F0FF',
    fontFamily: 'Inter',
    words: ['CYBER', 'NEON', 'PULSE'],
    animType: 'pulse-glow',
    duration: 2600,
    stagger: 60,
    fontSize: 34
  },
  {
    id: 'kinetic-pop-bounce',
    name: 'Pop Bounce',
    category: 'text',
    tag: 'Kinetic',
    bg: '#18181B',
    textColor: '#FBBF24',
    fontFamily: 'Poppins',
    words: ['MOTION', 'BOUNCE', 'POP'],
    animType: 'pop-bounce',
    duration: 3200,
    stagger: 45,
    fontSize: 34
  },
  {
    id: 'kinetic-wave-flow',
    name: 'Harmonic Wave',
    category: 'text',
    tag: 'Kinetic',
    bg: '#064E3B',
    textColor: '#34D399',
    fontFamily: 'Inter',
    words: ['SMOOTH', 'RHYTHMIC', 'FLOW'],
    animType: 'wave-float',
    duration: 2400,
    stagger: 70,
    fontSize: 34
  },
  {
    id: 'kinetic-flip-3d',
    name: '3D Flip',
    category: 'text',
    tag: 'Kinetic',
    bg: '#31104B',
    textColor: '#E879F9',
    fontFamily: 'Inter',
    words: ['FUTURE', 'DIMENSION', '3D'],
    animType: 'flip-3d',
    duration: 3600,
    stagger: 55,
    fontSize: 34
  },
  {
    id: 'kinetic-slide-down',
    name: 'Top Drop',
    category: 'text',
    tag: 'Kinetic',
    bg: '#1E1B4B',
    textColor: '#818CF8',
    fontFamily: 'Inter',
    words: ['CREATIVE', 'DESIGN', 'STUDIO'],
    animType: 'slide-down',
    duration: 3600,
    stagger: 50,
    fontSize: 34
  }
];

export const POSTER_PRESETS = [
  {
    id: 'poster-comic',
    name: 'Comic Poster',
    category: 'text',
    tag: 'Poster',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-[0.2vw] bg-[#FDF6E2] rounded-[0.35vw]">
        <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text x="80" y="34" textAnchor="middle" fontFamily="'Bangers', Impact, sans-serif" fontSize="24" fill="#D32F2F" stroke="#000" strokeWidth="1.2">GOOD THINGS</text>
          <text x="80" y="68" textAnchor="middle" fontFamily="'Bangers', Impact, sans-serif" fontSize="34" fill="#FBC02D" stroke="#000" strokeWidth="1.5">FEARLESS</text>
        </svg>
      </div>
    ),
    insert: (cx, cy) => {
      const uniqueId = Date.now();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `typography-${uniqueId}`);
      g.setAttribute('data-type', 'text');
      g.setAttribute('data-is-element-typography', 'true');
      g.setAttribute('data-name', 'Comic Poster');
      g.setAttribute('transform', `translate(${cx - 100}, ${cy - 50})`);
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('style', '--stroke-width: 2px; --shadow-x: 3px; --shadow-y: 3px; --skew-angle: 0deg;');
      g.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Bangers&amp;display=swap');
          #typography-${uniqueId} text {
            font-family: 'Bangers', cursive;
            letter-spacing: 0.05em;
            stroke-width: var(--stroke-width, 2px);
            -webkit-text-stroke-width: var(--stroke-width, 2px);
            filter: drop-shadow(var(--shadow-x, 3px) var(--shadow-y, 3px) 0px #000000);
            transform: skewX(var(--skew-angle, 0deg));
          }
        </style>
        <text x="100" y="40" font-size="34" font-family="Bangers" fill="#D32F2F" stroke="#000000" text-anchor="middle">GOOD THINGS</text>
        <text x="100" y="80" font-size="46" font-family="Bangers" fill="#FBC02D" stroke="#000000" text-anchor="middle">FEARLESS</text>
      `;
      return g;
    }
  },
  {
    id: 'poster-hiring',
    name: "We're Hiring",
    category: 'text',
    tag: 'Script',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-[0.2vw] bg-[#F0F7FF] rounded-[0.35vw]">
        <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text x="80" y="35" textAnchor="middle" fontFamily="'Satisfy', cursive" fontSize="30" fill="#025EE8">We're</text>
          <text x="80" y="68" textAnchor="middle" fontFamily="'Satisfy', cursive" fontSize="36" fill="#025EE8">Hiring!</text>
        </svg>
      </div>
    ),
    insert: (cx, cy) => {
      const uniqueId = Date.now();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `typography-${uniqueId}`);
      g.setAttribute('data-type', 'text');
      g.setAttribute('data-is-element-typography', 'true');
      g.setAttribute('data-name', "We're Hiring");
      g.setAttribute('transform', `translate(${cx - 75}, ${cy - 45})`);
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('style', '--stroke-width: 0px; --shadow-x: 2px; --shadow-y: 2px; --skew-angle: 0deg;');
      g.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Satisfy&amp;display=swap');
          #typography-${uniqueId} text {
            font-family: 'Satisfy', cursive;
            stroke-width: var(--stroke-width, 0px);
            filter: drop-shadow(var(--shadow-x, 2px) var(--shadow-y, 2px) 0px rgba(0,0,0,0.15));
            transform: skewX(var(--skew-angle, 0deg));
          }
        </style>
        <text x="75" y="35" font-size="34" font-family="Satisfy" fill="#025EE8" text-anchor="middle">We're</text>
        <text x="75" y="72" font-size="38" font-family="Satisfy" fill="#025EE8" text-anchor="middle">Hiring!</text>
      `;
      return g;
    }
  },
  {
    id: 'poster-free-shipping',
    name: 'Free Shipping',
    category: 'text',
    tag: 'Badge',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-[0.2vw] bg-[#FFF8F0] rounded-[0.35vw]">
        <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text x="80" y="34" textAnchor="middle" fontFamily="'Oswald', Impact, sans-serif" fontWeight="700" fontSize="28" fill="#E60012" stroke="#FFD700" strokeWidth="2">FREE</text>
          <text x="80" y="68" textAnchor="middle" fontFamily="'Oswald', Impact, sans-serif" fontWeight="700" fontSize="28" fill="#FFD700" stroke="#FFD700" strokeWidth="1">SHIPPING</text>
        </svg>
      </div>
    ),
    insert: (cx, cy) => {
      const uniqueId = Date.now();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `typography-${uniqueId}`);
      g.setAttribute('data-type', 'text');
      g.setAttribute('data-is-element-typography', 'true');
      g.setAttribute('data-name', 'Free Shipping');
      g.setAttribute('transform', `translate(${cx - 80}, ${cy - 45})`);
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('style', '--stroke-width: 3px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;');
      g.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&amp;display=swap');
          #typography-${uniqueId} text {
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            stroke-width: var(--stroke-width, 3px);
            -webkit-text-stroke-width: var(--stroke-width, 3px);
            paint-order: stroke fill;
          }
        </style>
        <text x="80" y="38" font-size="34" font-family="Oswald" font-weight="700" fill="#E60012" stroke="#FFD700" text-anchor="middle">FREE</text>
        <text x="80" y="78" font-size="34" font-family="Oswald" font-weight="700" fill="#FFD700" stroke="#FFD700" text-anchor="middle">SHIPPING</text>
      `;
      return g;
    }
  },
  {
    id: 'poster-golden-hour',
    name: 'Golden Hour',
    category: 'text',
    tag: 'Serif',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-[0.2vw] bg-[#FAF5EB] rounded-[0.35vw]">
        <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text x="80" y="35" textAnchor="middle" fontFamily="'Courier New', Courier, monospace" fontWeight="700" fontSize="24" fill="#DAA520">GOLDEN</text>
          <text x="80" y="68" textAnchor="middle" fontFamily="'Courier New', Courier, monospace" fontWeight="700" fontSize="24" fill="#DAA520">HOUR</text>
        </svg>
      </div>
    ),
    insert: (cx, cy) => {
      const uniqueId = Date.now();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `typography-${uniqueId}`);
      g.setAttribute('data-type', 'text');
      g.setAttribute('data-is-element-typography', 'true');
      g.setAttribute('data-name', 'Golden Hour');
      g.setAttribute('transform', `translate(${cx - 75}, ${cy - 45})`);
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('style', '--stroke-width: 0px; --shadow-x: 2px; --shadow-y: 2px; --skew-angle: 0deg;');
      g.innerHTML = `
        <style>
          #typography-${uniqueId} text {
            font-family: 'Courier New', Courier, monospace;
            stroke-width: var(--stroke-width, 0px);
            filter: drop-shadow(var(--shadow-x, 2px) var(--shadow-y, 2px) 0px rgba(0,0,0,0.25));
            transform: skewX(var(--skew-angle, 0deg));
          }
        </style>
        <text x="75" y="35" font-size="34" font-family="Courier New" fill="#DAA520" stroke="#000000" text-anchor="middle">GOLDEN</text>
        <text x="75" y="75" font-size="34" font-family="Courier New" fill="#DAA520" stroke="#000000" text-anchor="middle">HOUR</text>
      `;
      return g;
    }
  },
  {
    id: 'poster-holiday',
    name: 'Holiday',
    category: 'text',
    tag: 'Luxury',
    renderPreview: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-[0.2vw] bg-[#0F172A] rounded-[0.35vw]">
        <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text x="80" y="50" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="32" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2">Holiday</text>
        </svg>
      </div>
    ),
    insert: (cx, cy) => {
      const uniqueId = Date.now();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `typography-${uniqueId}`);
      g.setAttribute('data-type', 'text');
      g.setAttribute('data-is-element-typography', 'true');
      g.setAttribute('data-name', 'Holiday');
      g.setAttribute('transform', `translate(${cx - 70}, ${cy - 35})`);
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('style', '--stroke-width: 3px; --shadow-x: 2px; --shadow-y: 2px; --skew-angle: 0deg;');
      g.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&amp;display=swap');
          #typography-${uniqueId} text {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            stroke-width: var(--stroke-width, 3px);
            -webkit-text-stroke-width: var(--stroke-width, 3px);
            stroke-linejoin: round;
            paint-order: stroke fill;
            filter: drop-shadow(var(--shadow-x, 2px) var(--shadow-y, 2px) 0px rgba(0,0,0,0.25));
            transform: skewX(var(--skew-angle, 0deg));
          }
        </style>
        <text x="70" y="45" font-size="34" font-family="Playfair Display" font-weight="700" fill="#FFFFFF" stroke="#38BDF8" text-anchor="middle">Holiday</text>
      `;
      return g;
    }
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
            <text x="0" y="20" fill={preset.primaryColor} fontSize="11" fontFamily="Arial, sans-serif">{preset.text}</text>
            <text x="0" y="38" fill={preset.primaryColor} fontSize="16" fontFamily="Impact, sans-serif">{preset.subText}</text>
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
      ) : (
        <svg viewBox="0 0 160 50" className="w-[90%] h-[90%]" preserveAspectRatio="xMidYMid meet">
          <rect x="6" y="6" width="148" height="38" rx="8" fill="none" stroke={preset.primaryColor} strokeWidth="2.5" />
          <text x="80" y="29" textAnchor="middle" fill={preset.primaryColor} fontSize="12" fontWeight="700" fontFamily="'Roboto', sans-serif" letterSpacing="1">{preset.text}</text>
        </svg>
      )}
    </div>
  );
};

// Helper to format kinetic typography preview
const renderKineticPreview = (preset) => {
  return (
    <div
      className="w-full h-full rounded-[0.35vw] flex flex-col items-center justify-center gap-[0.1vw] overflow-hidden p-[0.2vw]"
      style={{ backgroundColor: preset.bg }}
    >
      {preset.words.map((w, idx) => (
        <span
          key={idx}
          className="text-[0.62vw] font-black uppercase tracking-wider leading-none truncate"
          style={{ color: preset.textColor }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};

// Unified Typography Items Export
export const TYPOGRAPHY_ITEMS = [
  // --- Standard Heading, Subheading, Body, Bullet & Numbered Lists ---
  {
    id: 'text-heading',
    name: 'Add Heading',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <svg viewBox="0 0 100 36" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <text x="50" y="24" textAnchor="middle" fontSize="16" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">Heading</text>
      </svg>
    ),
    insert: (cx, cy) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy));
      t.setAttribute('font-size', '28');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('fill', '#111827');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = 'Add a Heading';
      t.setAttribute('data-name', 'Heading');
      t.setAttribute('data-type', 'text');
      return t;
    }
  },
  {
    id: 'text-subheading',
    name: 'Add Subheading',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <svg viewBox="0 0 110 36" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <text x="55" y="23" textAnchor="middle" fontSize="13" fontWeight="600" fill="#4B5563" fontFamily="Inter, sans-serif">Subheading</text>
      </svg>
    ),
    insert: (cx, cy) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy));
      t.setAttribute('font-size', '18');
      t.setAttribute('font-weight', '600');
      t.setAttribute('fill', '#4b5563');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = 'Add a subheading';
      t.setAttribute('data-name', 'Subheading');
      t.setAttribute('data-type', 'text');
      return t;
    }
  },
  {
    id: 'text-paragraph',
    name: 'Paragraph Text',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <svg viewBox="0 0 110 36" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <text x="55" y="22" textAnchor="middle" fontSize="11" fill="#6B7280" fontFamily="Inter, sans-serif">Paragraph text</text>
      </svg>
    ),
    insert: (cx, cy) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', String(cx));
      t.setAttribute('y', String(cy));
      t.setAttribute('font-size', '14');
      t.setAttribute('fill', '#6b7280');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = 'Add a little bit of body text';
      t.setAttribute('data-name', 'Paragraph Text');
      t.setAttribute('data-type', 'text');
      return t;
    }
  },
  {
    id: 'text-bullet-list',
    name: 'Bullet List',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <svg viewBox="0 0 100 42" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <circle cx="18" cy="11" r="2.5" fill="#4B5563" />
        <rect x="26" y="9" width="56" height="4" rx="2" fill="#9CA3AF" />
        <circle cx="18" cy="21" r="2.5" fill="#4B5563" />
        <rect x="26" y="19" width="46" height="4" rx="2" fill="#9CA3AF" />
        <circle cx="18" cy="31" r="2.5" fill="#4B5563" />
        <rect x="26" y="29" width="50" height="4" rx="2" fill="#9CA3AF" />
      </svg>
    ),
    insert: (cx, cy) => {
      const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      const uniqueId = Date.now();
      fo.setAttribute('id', `text-list-${uniqueId}`);
      fo.setAttribute('data-type', 'text');
      fo.setAttribute('data-name', 'Bullet List');
      fo.setAttribute('data-sizing-mode', 'auto-height');
      fo.setAttribute('data-text-align', 'left');
      fo.setAttribute('data-list-type', 'disc');
      fo.setAttribute('x', String(cx - 90));
      fo.setAttribute('y', String(cy - 40));
      fo.setAttribute('width', '200');
      fo.setAttribute('height', '84');
      fo.setAttribute('overflow', 'visible');
      const div = document.createElement('div');
      div.className = 'flipbook-text-inner';
      div.style.width = '100%';
      div.style.minHeight = '100%';
      div.style.color = '#1f2937';
      div.style.fontFamily = "'Inter', sans-serif";
      div.style.fontSize = '14px';
      div.style.lineHeight = '1.6';
      div.style.textAlign = 'left';
      div.style.padding = '0px';
      div.style.margin = '0';
      div.style.boxSizing = 'border-box';
      div.innerHTML = '• First bullet item<br/>• Second bullet item<br/>• Third bullet item';
      fo.appendChild(div);
      return fo;
    }
  },
  {
    id: 'text-numbered-list',
    name: 'Numbered List',
    category: 'text',
    type: 'text',
    renderPreview: () => (
      <svg viewBox="0 0 100 42" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <text x="16" y="14" fontSize="9" fontWeight="700" fill="#4B5563" textAnchor="middle" fontFamily="sans-serif">1.</text>
        <rect x="26" y="9" width="56" height="4" rx="2" fill="#9CA3AF" />
        <text x="16" y="24" fontSize="9" fontWeight="700" fill="#4B5563" textAnchor="middle" fontFamily="sans-serif">2.</text>
        <rect x="26" y="19" width="46" height="4" rx="2" fill="#9CA3AF" />
        <text x="16" y="34" fontSize="9" fontWeight="700" fill="#4B5563" textAnchor="middle" fontFamily="sans-serif">3.</text>
        <rect x="26" y="29" width="50" height="4" rx="2" fill="#9CA3AF" />
      </svg>
    ),
    insert: (cx, cy) => {
      const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      const uniqueId = Date.now();
      fo.setAttribute('id', `text-list-${uniqueId}`);
      fo.setAttribute('data-type', 'text');
      fo.setAttribute('data-name', 'Numbered List');
      fo.setAttribute('data-sizing-mode', 'auto-height');
      fo.setAttribute('data-text-align', 'left');
      fo.setAttribute('data-list-type', 'decimal');
      fo.setAttribute('x', String(cx - 90));
      fo.setAttribute('y', String(cy - 40));
      fo.setAttribute('width', '200');
      fo.setAttribute('height', '84');
      fo.setAttribute('overflow', 'visible');
      const div = document.createElement('div');
      div.className = 'flipbook-text-inner';
      div.style.width = '100%';
      div.style.minHeight = '100%';
      div.style.color = '#1f2937';
      div.style.fontFamily = "'Inter', sans-serif";
      div.style.fontSize = '14px';
      div.style.lineHeight = '1.6';
      div.style.textAlign = 'left';
      div.style.padding = '0px';
      div.style.margin = '0';
      div.style.boxSizing = 'border-box';
      div.innerHTML = '1. First list item<br/>2. Second list item<br/>3. Third list item';
      fo.appendChild(div);
      return fo;
    }
  },

  // --- Motion Graphic Titles (After Effects) ---
  ...MOTION_GRAPHIC_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'text',
    type: 'text',
    renderPreview: () => renderMotionGraphicPreview(preset),
    insert: (cx, cy) => createMotionGraphicElementNode(preset, cx, cy)
  })),

  // --- Kinetic Animated Typography ---
  ...KINETIC_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'text',
    type: 'text',
    renderPreview: () => renderKineticPreview(preset),
    insert: (cx, cy) => createKineticElementNode(preset, cx, cy)
  })),

  // --- Styled Poster Presets ---
  ...POSTER_PRESETS
];
