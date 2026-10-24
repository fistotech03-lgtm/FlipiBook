/**
 * kineticTypographyUtils.js
 * Isolated utilities for Kinetic Typography in FlipiBook
 */

export const KINETIC_ANIMATION_KEYFRAMES = {
  'slide-up': `
    @keyframes kinetic-anim {
      0%, 100% { transform: translateY(115%); opacity: 0; }
      25%, 75% { transform: translateY(0%); opacity: 1; }
    }
  `,
  'slide-down': `
    @keyframes kinetic-anim {
      0%, 100% { transform: translateY(-115%); opacity: 0; }
      25%, 75% { transform: translateY(0%); opacity: 1; }
    }
  `,
  'pop-bounce': `
    @keyframes kinetic-anim {
      0%, 100% { transform: scale(0.2) translateY(20px); opacity: 0; }
      28% { transform: scale(1.12) translateY(-3px); opacity: 1; }
      42%, 75% { transform: scale(1) translateY(0); opacity: 1; }
    }
  `,
  'wave-float': `
    @keyframes kinetic-anim {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
  `,
  'pulse-glow': `
    @keyframes kinetic-anim {
      0%, 100% { transform: scale(0.96); opacity: 0.8; }
      50% { transform: scale(1.05); filter: drop-shadow(0 0 10px currentColor); opacity: 1; }
    }
  `,
  'flip-3d': `
    @keyframes kinetic-anim {
      0%, 100% { transform: perspective(350px) rotateX(-90deg); opacity: 0; }
      25%, 75% { transform: perspective(350px) rotateX(0deg); opacity: 1; }
    }
  `
};

export const calculateKineticDimensions = (words = [], fontSize = 34, bgPadding = 12) => {
  const lineArray = Array.isArray(words) ? words : (typeof words === 'string' ? words.split('\n') : []);
  const lines = lineArray.map(l => (typeof l === 'string' ? l.trim() : '')).filter(Boolean);
  if (lines.length === 0) {
    return { width: 140, height: 60 };
  }
  const maxLen = Math.max(...lines.map(l => l.length), 1);
  const pad = typeof bgPadding === 'number' ? bgPadding : 12;
  const charWidth = fontSize * 0.65;
  const width = Math.round(maxLen * charWidth + (pad * 2) + 20);
  const height = Math.round(lines.length * (fontSize * 1.25) + (pad * 2) + 12);
  return {
    width: Math.max(70, width),
    height: Math.max(40, height)
  };
};

export const cleanKeyframesFromCss = (cssStr) => {
  if (!cssStr) return '';
  let result = cssStr;
  let safety = 0;
  while (safety < 20) {
    safety++;
    const match = result.match(/@keyframes\s+kinetic-anim[^{]*\{/);
    if (!match) break;
    const startIdx = match.index;
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < result.length; i++) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      result = result.slice(0, startIdx).trim() + '\n' + result.slice(endIdx + 1).trim();
    } else {
      break;
    }
  }
  result = result.replace(/\b(?:0%|25%|28%|42%|50%|75%|100%)[^{]*\{[^}]*\}(?:\s*\})?/g, '');
  return result.trim();
};

export const createKineticSvg = ({
  uniqueId = Date.now(),
  words = ['CODING', 'KINETIC', 'TYPE'],
  animType = 'slide-up',
  duration = 3800,
  stagger = 50,
  baseDelay = 100,
  fontFamily = 'Inter',
  fontSize = 34,
  fontWeight = '800',
  textColor = '#FFFFFF',
  bgColor = '#090D16',
  bgPadding = 12,
  bgRadius = 8,
  isTranslate = false
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const fontImport = fontFamily === 'Inter'
    ? `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&amp;display=swap');`
    : `@import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@700;800&amp;display=swap');`;

  let currentDelay = baseDelay;
  const wordsMarkup = words.map((word) => {
    const charsMarkup = word.split('').map((char) => {
      const charDelay = currentDelay;
      currentDelay += stagger;
      return `<span class="slide char" style="--delay: ${charDelay}ms; color: ${textColor}; -webkit-text-fill-color: ${textColor};">${char === ' ' ? '&nbsp;' : char}</span>`;
    }).join('');
    return `<div class="word">${charsMarkup}</div>`;
  }).join('');

  const animKeyframe = KINETIC_ANIMATION_KEYFRAMES[animType] || KINETIC_ANIMATION_KEYFRAMES['slide-up'];
  const scopedKeyframes = animKeyframe.replace(/@keyframes kinetic-anim/g, `@keyframes kinetic-anim-${uniqueId}`);

  const { width: estWidth, height: estHeight } = calculateKineticDimensions(words, fontSize, bgPadding);
  const wordsText = words.join('\n');
  const isClippedSlide = animType === 'slide-up' || animType === 'slide-down';

  return `
    <g id="typography-${uniqueId}" data-type="text" data-typography-type="kinetic" data-is-element-typography="true" data-animation-style="${animType}" data-animation-duration="${duration}" data-animation-stagger="${stagger}" data-bg-color="${bgColor}" data-bg-radius="${bgRadius}" data-bg-padding="${bgPadding}" data-text-color="${textColor}" data-font-family="${fontFamily}" data-font-size="${fontSize}" data-font-weight="${fontWeight}" data-kinetic-text="${wordsText}" cursor="pointer"${transformAttr} style="--stroke-width: 0px; --stroke-color: #000000; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">
      <style>
        ${fontImport}
        #typography-${uniqueId} .kinetic-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: ${estWidth}px;
          height: ${estHeight}px;
          user-select: none;
          box-sizing: border-box;
          padding: ${bgPadding}px;
          text-align: center;
        }
        #typography-${uniqueId} .word {
          overflow: ${isClippedSlide ? 'hidden' : 'visible'};
          display: flex;
          justify-content: center;
          align-items: center;
          line-height: 1.18;
          margin: 0;
          padding: 1px 2px;
        }
        #typography-${uniqueId} span.slide,
        #typography-${uniqueId} span.char {
          display: inline-block;
          margin: 0px;
          font-family: '${fontFamily}', sans-serif;
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          text-transform: uppercase;
          color: ${textColor};
          -webkit-text-fill-color: ${textColor};
          stroke-width: var(--stroke-width, 0px);
          -webkit-text-stroke-width: var(--stroke-width, 0px);
          -webkit-text-stroke-color: var(--stroke-color, #000000);
          paint-order: stroke fill;
          animation: kinetic-anim-${uniqueId} ${duration}ms infinite cubic-bezier(0.77, 0, 0.175, 1);
          animation-delay: var(--delay, 0ms);
          animation-fill-mode: both;
          transform: skewX(var(--skew-angle, 0deg));
          filter: drop-shadow(var(--shadow-x, 0px) var(--shadow-y, 0px) 0px rgba(0,0,0,0.5));
          will-change: transform, opacity;
        }
        ${scopedKeyframes}
      </style>
      <rect class="kinetic-bg typography-bg" x="0" y="0" width="${estWidth}" height="${estHeight}" rx="${bgRadius}" ry="${bgRadius}" fill="${bgColor}" pointer-events="all" />
      <foreignObject width="${estWidth}" height="${estHeight}" x="0" y="0" pointer-events="none" style="overflow: visible;">
        <div xmlns="http://www.w3.org/1999/xhtml" class="kinetic-container">
          ${wordsMarkup}
        </div>
      </foreignObject>
    </g>
  `;
};

export const createKineticElementNode = (preset, cx, cy) => {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  const words = preset.words || ['CODING', 'KINETIC', 'TYPE'];
  const fontSize = preset.fontSize || 34;
  const bgPadding = preset.bgPadding || 12;
  const bgRadius = preset.bgRadius || 8;

  const svgXml = createKineticSvg({
    uniqueId,
    words,
    animType: preset.animType || 'slide-up',
    duration: preset.duration || 3800,
    stagger: preset.stagger || 50,
    fontFamily: preset.fontFamily || 'Inter',
    fontSize,
    textColor: preset.textColor || '#FFFFFF',
    bgColor: preset.bg || '#090D16',
    bgPadding,
    bgRadius
  });

  const parser = new DOMParser();
  let doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgXml}</svg>`, 'image/svg+xml');
  let g = doc.querySelector(`g#typography-${uniqueId}`);
  if (!g) {
    const htmlDoc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svgXml}</svg>`, 'text/html');
    g = htmlDoc.querySelector(`g#typography-${uniqueId}`);
  }
  if (!g) return null;

  const { width: estWidth, height: estHeight } = calculateKineticDimensions(words, fontSize, bgPadding);
  const posX = Math.round(cx - estWidth / 2);
  const posY = Math.round(cy - estHeight / 2);

  g.setAttribute('transform', `translate(${posX}, ${posY})`);
  g.setAttribute('data-name', preset.name || 'Kinetic Typography');

  return document.importNode(g, true);
};
