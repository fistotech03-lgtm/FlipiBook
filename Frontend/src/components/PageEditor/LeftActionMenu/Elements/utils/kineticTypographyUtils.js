/**
 * kineticTypographyUtils.js
 * Retained helper functions for backwards compatibility and text inspection
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
