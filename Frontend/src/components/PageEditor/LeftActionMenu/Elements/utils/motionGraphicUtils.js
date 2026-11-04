/**
 * Isolated motionGraphicUtils.js for FlipiBook
 * High-performance, cross-browser SVG Motion Graphics Titles
 */

// --------------------------------------------------------------------------
// 1. Cyber Trim Frame
// --------------------------------------------------------------------------
export const createCyberFrameSvg = ({
  uniqueId = Date.now(),
  text = 'ANIMATION',
  primaryColor = '#000000',
  secondaryColor = '#FF0033',
  glowIntensity = 6,
  fontSize = 15,
  fontFamily = 'Roboto, sans-serif',
  duration = 4700,
  isTranslate = false
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const width = 188;
  const height = 56;
  const rx = 14;
  const perimeter = 480;

  const letters = Array.from(text);
  const letterCount = letters.length;
  const letterStaggerMs = letterCount > 1 ? Math.min(60, 450 / letterCount) : 0;

  const letterKeyframes = letters.map((_, i) => {
    const delayMs = i * letterStaggerMs;
    return `
        #typography-${uniqueId} .cyber-char-${i} {
          animation: cyber-text-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-delay: ${delayMs}ms;
          animation-play-state: running;
        }`;
  }).join('');

  return `
    <g id="typography-${uniqueId}" 
       data-type="text" 
       data-typography-type="motion-graphic" 
       data-is-element-typography="true"
       data-motion-template="cyber-frame"
       data-text="${text}" 
       data-primary-color="${primaryColor}" 
       data-secondary-color="${secondaryColor}" 
       data-font-size="${fontSize}" 
       data-font-family="${fontFamily}" 
       cursor="pointer"${transformAttr} 
       style="--stroke-width: 0px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">
      
      <defs>
        <filter id="glow-${uniqueId}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity}" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>
        @keyframes cyber-trim-${uniqueId} {
          0% { stroke-dasharray: 0 ${perimeter}; stroke-dashoffset: 0; opacity: 0; }
          12% { opacity: 1; }
          26% { stroke-dasharray: ${perimeter} 0; stroke-dashoffset: 0; }
          62% { stroke-dasharray: ${perimeter} 0; stroke-dashoffset: 0; opacity: 1; }
          75% { stroke-dasharray: 0 ${perimeter}; stroke-dashoffset: -${perimeter}; opacity: 0; }
          100% { stroke-dasharray: 0 ${perimeter}; stroke-dashoffset: -${perimeter}; opacity: 0; }
        }

        @keyframes cyber-text-${uniqueId} {
          0% { transform: translateY(8px); opacity: 0; }
          6% { opacity: 1; }
          22% { transform: translateY(0px); opacity: 1; }
          68% { transform: translateY(0px); opacity: 1; }
          82% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(8px); opacity: 0; }
        }

        #typography-${uniqueId} .cyber-glow-stroke {
          animation: cyber-trim-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-play-state: running;
          pointer-events: none;
        }

        #typography-${uniqueId} .cyber-inner-stroke {
          animation: cyber-trim-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-play-state: running;
          pointer-events: none;
        }

        #typography-${uniqueId} .cyber-text {
          font-family: '${fontFamily.replace(/"/g, '')}', sans-serif;
          font-size: ${fontSize}px;
          font-weight: 600;
          letter-spacing: 0.094em;
          text-transform: uppercase;
          text-align: center;
          color: ${primaryColor};
          fill: ${primaryColor};
          pointer-events: none;
          white-space: nowrap !important;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0 10px;
          box-sizing: border-box;
          max-width: 100%;
        }

        #typography-${uniqueId} .cyber-char {
          display: inline-block;
          will-change: transform, opacity;
        }
        ${letterKeyframes}
      </style>

      <rect 
        class="motion-click-boundary" 
        x="0" 
        y="0" 
        width="${width}" 
        height="${height}" 
        rx="${rx}" 
        ry="${rx}" 
        fill="none" 
        pointer-events="all" 
      />

      <rect 
        class="cyber-glow-stroke" 
        x="4" 
        y="4" 
        width="${width - 8}" 
        height="${height - 8}" 
        rx="${rx - 2}" 
        ry="${rx - 2}" 
        fill="transparent" 
        stroke="${secondaryColor}" 
        stroke-width="3.5" 
        filter="url(#glow-${uniqueId})" 
      />

      <rect 
        class="cyber-inner-stroke" 
        x="4" 
        y="4" 
        width="${width - 8}" 
        height="${height - 8}" 
        rx="${rx - 2}" 
        ry="${rx - 2}" 
        fill="transparent" 
        stroke="${secondaryColor}" 
        stroke-width="1.2" 
        stroke-linecap="round" 
      />

      <foreignObject x="0" y="0" width="${width}" height="${height}" style="overflow: visible; pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; pointer-events: none; box-sizing: border-box;">
          <span class="motion-text-content cyber-text">${letters.map((char, i) => `<span class="cyber-char cyber-char-${i}">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</span>
        </div>
      </foreignObject>
    </g>
  `;
};

// --------------------------------------------------------------------------
// 2. Flipi Slash Reveal
// --------------------------------------------------------------------------
export const createFlipiSlashSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#000000',
  secondaryColor = '#FFC600',
  fontSize = 20,
  fontFamily = 'Impact, Arial, sans-serif',
  duration = 4500,
  isTranslate = false
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const width = 230;
  const height = 66;

  return `
    <g id="typography-${uniqueId}" 
       data-type="text" 
       data-typography-type="motion-graphic" 
       data-is-element-typography="true"
       data-motion-template="flipi-split"
       data-text="${text}" 
       data-subtext="${subText}"
       data-primary-color="${primaryColor}" 
       data-secondary-color="${secondaryColor}" 
       data-font-size="${fontSize}" 
       data-font-family="${fontFamily}" 
       cursor="pointer"${transformAttr} 
       style="--stroke-width: 0px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">

      <style>
        @keyframes flipi-line-trim-${uniqueId} {
          0% { stroke-dasharray: 0 120; stroke-dashoffset: 60; opacity: 0; }
          10% { opacity: 1; }
          28% { stroke-dasharray: 120 0; stroke-dashoffset: 0; }
          70% { stroke-dasharray: 120 0; stroke-dashoffset: 0; opacity: 1; }
          85% { stroke-dasharray: 0 120; stroke-dashoffset: -60; opacity: 0; }
          100% { stroke-dasharray: 0 120; stroke-dashoffset: -60; opacity: 0; }
        }

        @keyframes flipi-text-top-${uniqueId} {
          0% { transform: translateY(-34px); opacity: 0; }
          8% { opacity: 0; }
          12% { opacity: 1; }
          28% { transform: translateY(0); opacity: 1; }
          72% { transform: translateY(0); opacity: 1; }
          88% { transform: translateY(-34px); opacity: 0; }
          100% { transform: translateY(-34px); opacity: 0; }
        }

        @keyframes flipi-text-bottom-${uniqueId} {
          0% { transform: translateY(34px); opacity: 0; }
          6% { opacity: 1; }
          24% { transform: translateY(0); opacity: 1; }
          72% { transform: translateY(0); opacity: 1; }
          88% { transform: translateY(34px); opacity: 0; }
          100% { transform: translateY(34px); opacity: 0; }
        }

        #typography-${uniqueId} .flipi-slash-accent {
          animation: flipi-line-trim-${uniqueId} ${duration}ms infinite cubic-bezier(0.16, 1, 0.3, 1);
          animation-play-state: running;
          pointer-events: none;
        }

        #typography-${uniqueId} .flipi-text-a {
          display: inline-block;
          animation: flipi-text-top-${uniqueId} ${duration}ms infinite cubic-bezier(0.16, 1, 0.3, 1);
          animation-play-state: running;
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${Math.round(fontSize * 0.72)}px;
          font-weight: 400;
          letter-spacing: 0em;
          color: ${primaryColor};
          fill: ${primaryColor};
          text-transform: uppercase;
          white-space: nowrap !important;
          line-height: 1;
          will-change: transform, opacity;
        }

        #typography-${uniqueId} .flipi-text-b {
          display: inline-block;
          animation: flipi-text-bottom-${uniqueId} ${duration}ms infinite cubic-bezier(0.16, 1, 0.3, 1);
          animation-play-state: running;
          font-family: Impact, "Arial Black", sans-serif;
          font-size: ${fontSize}px;
          font-weight: 400;
          letter-spacing: 0em;
          color: ${primaryColor};
          fill: ${primaryColor};
          text-transform: uppercase;
          white-space: nowrap !important;
          line-height: 1;
          will-change: transform, opacity;
        }
      </style>

      <rect 
        class="motion-click-boundary" 
        x="0" 
        y="0" 
        width="${width}" 
        height="${height}" 
        rx="8" 
        ry="8" 
        fill="none" 
        pointer-events="all" 
      />

      <line 
        class="flipi-slash-accent" 
        x1="22" 
        y1="54" 
        x2="34" 
        y2="12" 
        stroke="${secondaryColor}" 
        stroke-width="3.8" 
        stroke-linecap="round" 
      />

      <!-- Text A: Top Half with HTML overflow:hidden -->
      <foreignObject x="40" y="4" width="${width - 44}" height="28" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content flipi-text-a">${text}</span>
        </div>
      </foreignObject>

      <!-- Text B: Bottom Half with HTML overflow:hidden -->
      <foreignObject x="35" y="32" width="${width - 39}" height="32" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none;">
          <span class="motion-text-subcontent flipi-text-b">${subText}</span>
        </div>
      </foreignObject>
    </g>
  `;
};

// --------------------------------------------------------------------------
// 3. Dual Box Reveal
// --------------------------------------------------------------------------
export const createBoxRevealSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#FF1E27',
  secondaryColor = '#000000',
  fontSize = 17,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 4000,
  isTranslate = false
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const width = 210;
  const height = 62;
  const perimeter = (width + height) * 2;

  return `
    <g id="typography-${uniqueId}" 
       data-type="text" 
       data-typography-type="motion-graphic" 
       data-is-element-typography="true"
       data-motion-template="box-reveal"
       data-text="${text}" 
       data-subtext="${subText}"
       data-primary-color="${primaryColor}" 
       data-secondary-color="${secondaryColor}" 
       data-font-size="${fontSize}" 
       data-font-family="${fontFamily}" 
       cursor="pointer"${transformAttr} 
       style="--stroke-width: 0px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">

      <style>
        @keyframes box-trim-${uniqueId} {
          0% { stroke-dasharray: 0 ${perimeter}; stroke-dashoffset: 0; opacity: 0; }
          12% { opacity: 1; }
          28% { stroke-dasharray: ${perimeter} 0; stroke-dashoffset: 0; }
          72% { stroke-dasharray: ${perimeter} 0; stroke-dashoffset: 0; opacity: 1; }
          86% { stroke-dasharray: 0 ${perimeter}; stroke-dashoffset: -${perimeter}; opacity: 0; }
          100% { stroke-dasharray: 0 ${perimeter}; stroke-dashoffset: -${perimeter}; opacity: 0; }
        }

        @keyframes box-slide-down-${uniqueId} {
          0% { transform: translateY(-30px); opacity: 0; }
          8% { opacity: 0; }
          14% { opacity: 1; }
          30% { transform: translateY(0); opacity: 1; }
          72% { transform: translateY(0); opacity: 1; }
          86% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(30px); opacity: 0; }
        }

        @keyframes box-slide-up-${uniqueId} {
          0% { transform: translateY(30px); opacity: 0; }
          8% { opacity: 0; }
          14% { opacity: 1; }
          30% { transform: translateY(0); opacity: 1; }
          72% { transform: translateY(0); opacity: 1; }
          86% { transform: translateY(-30px); opacity: 0; }
          100% { transform: translateY(-30px); opacity: 0; }
        }

        #typography-${uniqueId} .box-accent-frame {
          animation: box-trim-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-play-state: running;
          pointer-events: none;
        }

        #typography-${uniqueId} .box-title-a {
          display: inline-block;
          animation: box-slide-down-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-play-state: running;
          font-family: Impact, "Arial Black", sans-serif;
          font-size: ${fontSize}px;
          font-weight: 900;
          letter-spacing: 0em;
          color: ${secondaryColor};
          fill: ${secondaryColor};
          text-transform: uppercase;
          white-space: nowrap !important;
          line-height: 1;
          will-change: transform, opacity;
        }

        #typography-${uniqueId} .box-title-b {
          display: inline-block;
          animation: box-slide-up-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-play-state: running;
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${Math.round(fontSize * 0.72)}px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: ${primaryColor};
          fill: ${primaryColor};
          text-transform: uppercase;
          white-space: nowrap !important;
          line-height: 1;
          will-change: transform, opacity;
        }
      </style>

      <rect 
        class="motion-click-boundary" 
        x="0" 
        y="0" 
        width="${width}" 
        height="${height}" 
        rx="6" 
        ry="6" 
        fill="none" 
        pointer-events="all" 
      />

      <rect 
        class="box-accent-frame" 
        x="3" 
        y="3" 
        width="${width - 6}" 
        height="${height - 6}" 
        rx="4" 
        ry="4" 
        fill="transparent" 
        stroke="${primaryColor}" 
        stroke-width="2.6" 
      />

      <foreignObject x="0" y="4" width="${width}" height="${Math.round(height / 2)}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content box-title-a">${text}</span>
        </div>
      </foreignObject>

      <foreignObject x="0" y="${Math.round(height / 2)}" width="${width}" height="${Math.round(height / 2)}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; pointer-events: none;">
          <span class="motion-text-subcontent box-title-b">${subText}</span>
        </div>
      </foreignObject>
    </g>
  `;
};

// --------------------------------------------------------------------------
// 4. YouTube Channel Intro
// --------------------------------------------------------------------------
export const createYouTubeChannelSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  primaryColor = '#FF0024',
  secondaryColor = '#000000',
  fontSize = 21,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 3600,
  isTranslate = false,
  iconName = 'Play',
  iconHtml = '',
  iconViewBox = '0 0 24 24',
  iconColor = '#FFFFFF',
  iconBgColor = ''
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const width = 220;
  const height = 54;
  const charSteps = Math.max(1, text.length);
  const activeIconBg = iconBgColor || primaryColor;
  const activeIconColor = iconColor || '#FFFFFF';

  // SVG inner content for the icon
  let innerIconSvgMarkup = `<polygon points="15,6 15,20 25,13" fill="${activeIconColor}" />`;
  if (iconHtml) {
    innerIconSvgMarkup = `
      <svg class="yt-custom-icon" viewBox="${iconViewBox}" x="8" y="3" width="20" height="20" fill="none" stroke="${activeIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
        ${iconHtml}
      </svg>
    `;
  }

  return `
    <g id="typography-${uniqueId}" 
       data-type="text" 
       data-typography-type="motion-graphic" 
       data-is-element-typography="true"
       data-motion-template="youtube-channel"
       data-text="${text}" 
       data-primary-color="${primaryColor}" 
       data-secondary-color="${secondaryColor}" 
       data-font-size="${fontSize}" 
       data-font-family="${fontFamily}" 
       data-icon-name="${iconName}"
       data-icon-html="${encodeURIComponent(iconHtml)}"
       data-icon-viewbox="${iconViewBox}"
       data-icon-color="${activeIconColor}"
       data-icon-bg-color="${activeIconBg}"
       cursor="pointer"${transformAttr} 
       style="--stroke-width: 0px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">

      <style>
        @keyframes yt-logo-spring-${uniqueId} {
          0% { transform: scale(0) rotate(-29deg); opacity: 0; }
          14% { transform: scale(1.18) rotate(5deg); opacity: 1; }
          24% { transform: scale(0.96) rotate(-2deg); opacity: 1; }
          32% { transform: scale(1) rotate(0deg); opacity: 1; }
          76% { transform: scale(1) rotate(0deg); opacity: 1; }
          88% { transform: scale(0) rotate(18deg); opacity: 0; }
          100% { transform: scale(0) rotate(18deg); opacity: 0; }
        }

        @keyframes yt-typing-${uniqueId} {
          0%, 18% { width: 0%; }
          48%, 78% { width: 100%; }
          88%, 100% { width: 0%; }
        }

        #typography-${uniqueId} .yt-logo-box {
          animation: yt-logo-spring-${uniqueId} ${duration}ms infinite cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation-play-state: running;
          transform-box: fill-box;
          transform-origin: center center;
          pointer-events: none;
          flex-shrink: 0;
        }

        #typography-${uniqueId} .yt-typewriter-container {
          display: inline-flex;
          align-items: center;
          overflow: hidden;
          white-space: nowrap;
          animation: yt-typing-${uniqueId} ${duration}ms steps(${charSteps}, end) infinite;
          animation-play-state: running;
        }

        #typography-${uniqueId} .yt-title-text {
          display: inline-block;
          font-family: "Arial Black", Arial, Impact, sans-serif;
          font-size: ${fontSize}px;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: ${secondaryColor};
          fill: ${secondaryColor};
          text-transform: uppercase;
          pointer-events: none;
          white-space: nowrap !important;
          line-height: 1;
        }
      </style>

      <rect 
        class="motion-click-boundary" 
        x="0" 
        y="0" 
        width="${width}" 
        height="${height}" 
        rx="27" 
        ry="27" 
        fill="none" 
        pointer-events="all" 
      />

      <!-- Centered Flex Container with YouTube Badge + Text -->
      <foreignObject x="0" y="0" width="${width}" height="${height}" style="overflow: visible; pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; pointer-events: none;">
          <svg class="yt-logo-box" viewBox="0 0 36 26" width="36" height="26" style="overflow: visible;">
            <rect 
              x="0" 
              y="0" 
              width="36" 
              height="26" 
              rx="7" 
              ry="7" 
              fill="${activeIconBg}" 
            />
            ${innerIconSvgMarkup}
          </svg>
          <div class="yt-typewriter-container">
            <span class="motion-text-content yt-title-text">${text}</span>
          </div>
        </div>
      </foreignObject>
    </g>
  `;
};

// --------------------------------------------------------------------------
// Shared wrapper for templates 5-8 (same <g> contract as templates 1-4)
// --------------------------------------------------------------------------
const buildMotionGroup = ({
  uniqueId, template, text, subText = '', primaryColor, secondaryColor,
  fontSize, fontFamily, isTranslate, css, body
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const subAttr = subText !== '' ? `\n       data-subtext="${subText}"` : '';
  return `
    <g id="typography-${uniqueId}" 
       data-type="text" 
       data-typography-type="motion-graphic" 
       data-is-element-typography="true"
       data-motion-template="${template}"
       data-text="${text}"${subAttr}
       data-primary-color="${primaryColor}" 
       data-secondary-color="${secondaryColor}" 
       data-font-size="${fontSize}" 
       data-font-family="${fontFamily}" 
       cursor="pointer"${transformAttr} 
       style="--stroke-width: 0px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">
      <style>${css}</style>
      ${body}
    </g>
  `;
};

// --------------------------------------------------------------------------
// 5. Slide Split Title  (Title_1.json - 159f @ 29.97fps)
//    Title halves slide in from left/right, accent bar wipes in, subtitle
//    slides inside the bar.
// --------------------------------------------------------------------------
export const createSlideSplitSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#000000',
  secondaryColor = '#3BF4FF',
  fontSize = 26,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 5300,
  isTranslate = false
}) => {
  const width = 240, height = 78;
  const mid = Math.ceil(text.length / 2);
  const left = text.slice(0, mid), right = text.slice(mid);
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const css = `
        @keyframes ss-left-${uniqueId} {
          0% { transform: translateX(-110%); opacity: 0; }
          2% { opacity: 1; }
          24% { transform: translateX(0); opacity: 1; }
          84% { transform: translateX(0); opacity: 1; }
          98%, 100% { transform: translateX(-110%); opacity: 0; }
        }
        @keyframes ss-right-${uniqueId} {
          0% { transform: translateX(110%); opacity: 0; }
          2% { opacity: 1; }
          24% { transform: translateX(0); opacity: 1; }
          84% { transform: translateX(0); opacity: 1; }
          98%, 100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes ss-bar-${uniqueId} {
          0%, 3% { transform: scaleX(0); }
          21% { transform: scaleX(1); }
          86% { transform: scaleX(1); }
          98%, 100% { transform: scaleX(0); }
        }
        @keyframes ss-sub-${uniqueId} {
          0%, 6% { transform: translateX(-110%); opacity: 0; }
          8% { opacity: 1; }
          24% { transform: translateX(0); opacity: 1; }
          84% { transform: translateX(0); opacity: 1; }
          96%, 100% { transform: translateX(-110%); opacity: 0; }
        }
        #typography-${uniqueId} .ss-half { overflow: hidden; display: inline-block; }
        #typography-${uniqueId} .ss-title {
          display: inline-block; white-space: nowrap !important; line-height: 1.05;
          font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 900;
          letter-spacing: 0.01em; color: ${primaryColor}; fill: ${primaryColor};
          text-transform: uppercase; will-change: transform, opacity;
        }
        #typography-${uniqueId} .ss-title-l { animation: ss-left-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .ss-title-r { animation: ss-right-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .ss-bar {
          width: 100%; height: 100%; background: ${secondaryColor}; transform-origin: left center;
          overflow: hidden; display: flex; align-items: center; justify-content: center;
          animation: ss-bar-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }
        #typography-${uniqueId} .ss-sub-wrap { overflow: hidden; }
        #typography-${uniqueId} .ss-sub {
          display: inline-block; white-space: nowrap !important; line-height: 1;
          font-family: Arial, Helvetica, sans-serif; font-size: ${Math.round(fontSize * 0.5)}px;
          font-weight: 400; letter-spacing: 0.12em; color: #0b0b0e; fill: #0b0b0e;
          text-transform: uppercase; will-change: transform, opacity;
          animation: ss-sub-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }`;
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="none" pointer-events="all" />
      <foreignObject x="10" y="6" width="${width - 20}" height="40" style="overflow: visible; pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none;">
          <span class="ss-half"><span class="motion-text-content ss-title ss-title-l">${left}</span></span><span class="ss-half"><span class="ss-title ss-title-r">${right}</span></span>
        </div>
      </foreignObject>
      <foreignObject x="12" y="50" width="${width - 24}" height="20" style="overflow: visible; pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; pointer-events: none;">
          <div class="ss-bar"><span class="ss-sub-wrap"><span class="motion-text-subcontent ss-sub">${subText}</span></span></div>
        </div>
      </foreignObject>`;
  return buildMotionGroup({ uniqueId, template: 'slide-split', text, subText, primaryColor, secondaryColor, fontSize, fontFamily, isTranslate, css, body });
};

// --------------------------------------------------------------------------
// 6. Swap Bar Title
//    Left and right text slide out from behind a center vertical accent bar.
// --------------------------------------------------------------------------
export const createSwapBarSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#E6007A',
  secondaryColor = '#E6007A',
  fontSize = 24,
  fontFamily = 'Georgia, "Times New Roman", serif',
  duration = 4500,
  isTranslate = false
}) => {
  const width = 420, height = 56;
  const barWidth = 6;
  const barHeight = Math.round(fontSize * 1.35);
  const barX = Math.round((width - barWidth) / 2);
  const barY = Math.round((height - barHeight) / 2);
  const half = barX - 10;
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  const css = `
        @keyframes sb-bar-grow-${uniqueId} {
          0%, 6% { transform: scaleY(0); opacity: 0; }
          16% { transform: scaleY(1); opacity: 1; }
          84% { transform: scaleY(1); opacity: 1; }
          94%, 100% { transform: scaleY(0); opacity: 0; }
        }
        @keyframes sb-word-l-${uniqueId} {
          0%, 14% { transform: translateX(102%) scale(0.3); opacity: 0; }
          18% { opacity: 1; }
          34% { transform: translateX(0) scale(1); opacity: 1; }
          80% { transform: translateX(0) scale(1); opacity: 1; }
          94%, 100% { transform: translateX(102%) scale(0.3); opacity: 0; }
        }
        @keyframes sb-word-r-${uniqueId} {
          0%, 14% { transform: translateX(-102%) scale(0.3); opacity: 0; }
          18% { opacity: 1; }
          34% { transform: translateX(0) scale(1); opacity: 1; }
          80% { transform: translateX(0) scale(1); opacity: 1; }
          94%, 100% { transform: translateX(-102%) scale(0.3); opacity: 0; }
        }
        #typography-${uniqueId} .sb-bar {
          fill: ${secondaryColor};
          transform-box: fill-box;
          transform-origin: center center;
          pointer-events: none;
          animation: sb-bar-grow-${uniqueId} ${duration}ms infinite ${ease};
          animation-play-state: running;
        }
        #typography-${uniqueId} .sb-word {
          display: inline-block;
          white-space: nowrap !important;
          line-height: 1;
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          will-change: transform, opacity;
        }
        #typography-${uniqueId} .sb-word-l {
          color: ${primaryColor};
          fill: ${primaryColor};
          transform-origin: right center;
          animation: sb-word-l-${uniqueId} ${duration}ms infinite ${ease};
          animation-play-state: running;
        }
        #typography-${uniqueId} .sb-word-r {
          color: #000000;
          fill: #000000;
          transform-origin: left center;
          animation: sb-word-r-${uniqueId} ${duration}ms infinite ${ease};
          animation-play-state: running;
        }`;

  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="4" ry="4" fill="none" pointer-events="all" />
      <foreignObject x="8" y="0" width="${half}" height="${height}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-end; overflow: hidden; pointer-events: none; padding-right: 14px; box-sizing: border-box;">
          <span class="motion-text-content sb-word sb-word-l">${text}</span>
        </div>
      </foreignObject>
      <rect class="sb-bar" x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="1" ry="1" />
      <foreignObject x="${barX + barWidth}" y="0" width="${half}" height="${height}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none; padding-left: 14px; box-sizing: border-box;">
          <span class="motion-text-subcontent sb-word sb-word-r">${subText}</span>
        </div>
      </foreignObject>`;

  return buildMotionGroup({ uniqueId, template: 'swap-bar', text, subText, primaryColor, secondaryColor, fontSize, fontFamily, isTranslate, css, body });
};

// --------------------------------------------------------------------------
// 7. Bar Sweep Title  (Title_24.json - 240f @ 29.97fps)
//    Thin bars sweep right -> left while spinning (-385deg -> -20deg),
//    then two lines slide in left -> right.
// --------------------------------------------------------------------------
export const createBarSweepSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#000000',
  secondaryColor = '#3BF4FF',
  fontSize = 24,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 8000,
  isTranslate = false
}) => {
  const width = 250, height = 68;
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  // 5 staggered bars (3-frame stagger in the AE file ~ 1.25% of the loop)
  const bars = [0, 1, 2, 3, 4];
  const barKeyframes = bars.map((i) => {
    const s = i * 1.25;
    return `
        @keyframes bs-bar-${i}-${uniqueId} {
          0%, ${s}% { transform: translateX(${width}px) rotate(-385deg) scaleY(0); opacity: 0; }
          ${s + 2}% { opacity: 1; }
          ${s + 28}% { transform: translateX(0) rotate(-20deg) scaleY(1); opacity: 1; }
          ${s + 40}% { transform: translateX(0) rotate(-20deg) scaleY(1); opacity: 0; }
          100% { transform: translateX(0) rotate(-20deg) scaleY(1); opacity: 0; }
        }`;
  }).join('');
  const barRules = bars.map((i) =>
    `#typography-${uniqueId} .bs-bar-${i} { animation: bs-bar-${i}-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; opacity: ${1 - i * 0.12}; }`
  ).join('\n        ');
  const css = `${barKeyframes}
        @keyframes bs-line-a-${uniqueId} {
          0%, 26% { transform: translateX(-110%); opacity: 0; }
          28% { opacity: 1; }
          40% { transform: translateX(0); opacity: 1; }
          86% { transform: translateX(0); opacity: 1; }
          97%, 100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes bs-line-b-${uniqueId} {
          0%, 29% { transform: translateX(-110%); opacity: 0; }
          31% { opacity: 1; }
          43% { transform: translateX(0); opacity: 1; }
          86% { transform: translateX(0); opacity: 1; }
          99%, 100% { transform: translateX(110%); opacity: 0; }
        }
        #typography-${uniqueId} .bs-bar { fill: ${secondaryColor}; transform-box: fill-box; transform-origin: center center; pointer-events: none; }
        ${barRules}
        #typography-${uniqueId} .bs-a, #typography-${uniqueId} .bs-b {
          display: inline-block; white-space: nowrap !important; line-height: 1; color: ${primaryColor}; fill: ${primaryColor};
          text-transform: uppercase; will-change: transform, opacity;
        }
        #typography-${uniqueId} .bs-a { font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 900; letter-spacing: 0.02em; animation: bs-line-a-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .bs-b { font-family: Arial, Helvetica, sans-serif; font-size: ${Math.round(fontSize * 0.8)}px; font-weight: 400; letter-spacing: 0.1em; animation: bs-line-b-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }`;
  const barSvg = bars.map((i) =>
    `<rect class="bs-bar bs-bar-${i}" x="${14 + i * 3}" y="${height / 2 - 20}" width="${i === 0 ? 3 : 2}" height="40" />`
  ).join('\n      ');
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="none" pointer-events="all" />
      ${barSvg}
      <foreignObject x="40" y="6" width="${width - 48}" height="32" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content bs-a">${text}</span>
        </div>
      </foreignObject>
      <foreignObject x="40" y="38" width="${width - 48}" height="24" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none;">
          <span class="motion-text-subcontent bs-b">${subText}</span>
        </div>
      </foreignObject>`;
  return buildMotionGroup({ uniqueId, template: 'bar-sweep', text, subText, primaryColor, secondaryColor, fontSize, fontFamily, isTranslate, css, body });
};

// --------------------------------------------------------------------------
// 8. Square Open Title  (Title_25.json - 195f @ 29.97fps)
//    A square frame with filled pastel box spins open (-169deg -> 0) and the
//    words rise up through it.
// --------------------------------------------------------------------------
export const createSquareOpenSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#000000',
  secondaryColor = '#3BF4FF',
  fontSize = 24,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 6500,
  isTranslate = false
}) => {
  const width = 230, height = 96;
  const ease = 'cubic-bezier(0.17, 1, 0.333, 1)';
  const css = `
        @keyframes sq-box-${uniqueId} {
          0% { transform: rotate(-169deg) scale(0, 0); }
          11% { transform: rotate(0deg) scale(1, 0); }
          25% { transform: rotate(0deg) scale(1, 1); }
          86% { transform: rotate(0deg) scale(1, 1); }
          100% { transform: rotate(0deg) scale(0, 0); }
        }
        @keyframes sq-word-a-${uniqueId} {
          0%, 12% { transform: translateY(120%); opacity: 0; }
          14% { opacity: 1; }
          27% { transform: translateY(0); opacity: 1; }
          82% { transform: translateY(0); opacity: 1; }
          94%, 100% { transform: translateY(-120%); opacity: 0; }
        }
        @keyframes sq-word-b-${uniqueId} {
          0%, 14% { transform: translateY(120%); opacity: 0; }
          16% { opacity: 1; }
          29% { transform: translateY(0); opacity: 1; }
          82% { transform: translateY(0); opacity: 1; }
          96%, 100% { transform: translateY(-120%); opacity: 0; }
        }
        #typography-${uniqueId} .sq-box {
          fill: none; stroke: ${secondaryColor}; stroke-width: 3.5;
          transform-box: fill-box; transform-origin: center center; pointer-events: none;
          animation: sq-box-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }
        #typography-${uniqueId} .sq-win { overflow: hidden; }
        #typography-${uniqueId} .sq-a, #typography-${uniqueId} .sq-b {
          display: inline-block; white-space: nowrap !important; line-height: 1.1; text-transform: uppercase;
          will-change: transform, opacity;
        }
        #typography-${uniqueId} .sq-a {
          font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 900; letter-spacing: 0.04em;
          color: ${primaryColor}; fill: ${primaryColor};
          animation: sq-word-a-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }
        #typography-${uniqueId} .sq-b {
          font-family: Arial, Helvetica, sans-serif; font-size: ${Math.round(fontSize * 0.7)}px; font-weight: 700;
          letter-spacing: 0.22em; color: ${secondaryColor}; fill: ${secondaryColor};
          animation: sq-word-b-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }`;
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="4" ry="4" fill="none" pointer-events="all" />
      <rect class="sq-box" x="8" y="8" width="${width - 16}" height="${height - 16}" rx="2" ry="2" />
      <foreignObject x="10" y="10" width="${width - 20}" height="${height - 20}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; pointer-events: none;">
          <div class="sq-win"><span class="motion-text-content sq-a">${text}</span></div>
          <div class="sq-win"><span class="motion-text-subcontent sq-b">${subText}</span></div>
        </div>
      </foreignObject>`;
  return buildMotionGroup({ uniqueId, template: 'square-open', text, subText, primaryColor, secondaryColor, fontSize, fontFamily, isTranslate, css, body });
};

// --------------------------------------------------------------------------
// 9. Social Badge  (facebook.json - 46f @ 30fps)
//    Rounded diamond badge spins/pops in (630deg -> 360deg, overshoot to 123%),
//    slides left while a white pill grows out of it, then the label slides in
//    inside the pill. Loops with a hold + exit.
// --------------------------------------------------------------------------
export const createSocialBadgeSvg = ({
  uniqueId = Date.now(),
  text = 'FACEBOOK',
  primaryColor = '#0E34A8',
  secondaryColor = '#FFFFFF',
  fontSize = 18,
  fontFamily = '"Expletus Sans", Arial, sans-serif',
  duration = 4200,
  isTranslate = false,
  iconName = 'Facebook',
  iconHtml = '',
  iconViewBox = '0 0 24 24',
  iconColor = '#FFFFFF',
  iconBgColor = ''
}) => {
  const width = 250, height = 90;
  const S = 0.3;                 // comp px -> svg px
  const ox = 49, oy = 45;        // badge centre in svg px
  const inPct = Math.min(60, (1533 / duration) * 100);   // 46 frames @30fps
  const p = (f) => +((f / 46) * inPct).toFixed(2);       // frame -> keyframe %
  const ease = 'cubic-bezier(0.3, 0, 0.3, 1)';
  const activeIconBg = iconBgColor || primaryColor;
  const activeIconColor = iconColor || '#FFFFFF';

  let innerIconMarkup = `<path class="sb-f" transform="translate(-60 -62) scale(5.2)" d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.4v3.2h2.8V21h3.2z" fill="${activeIconColor}" />`;
  if (iconHtml) {
    innerIconMarkup = `
      <g class="sb-custom-icon" transform="translate(-55 -55)">
        <svg viewBox="${iconViewBox}" width="110" height="110" fill="none" stroke="${activeIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
          ${iconHtml}
        </svg>
      </g>
    `;
  }

  const css = `
        @keyframes sb-pop-${uniqueId} {
          0% { transform: rotate(630deg) scale(0); }
          ${p(6)}% { transform: rotate(427.5deg) scale(1.23); }
          ${p(8)}% { transform: rotate(360deg) scale(1.23); }
          ${p(11)}% { transform: rotate(360deg) scale(1); }
          ${p(14)}% { transform: rotate(360deg) scale(1.12); }
          ${p(18)}% { transform: rotate(360deg) scale(1); }
          88% { transform: rotate(360deg) scale(1); }
          98%, 100% { transform: rotate(360deg) scale(0); }
        }
        @keyframes sb-move-${uniqueId} {
          0%, ${p(14)}% { transform: translateX(334px); }
          ${p(23)}%, 88% { transform: translateX(0); }
          98%, 100% { transform: translateX(334px); }
        }
        @keyframes sb-pill-${uniqueId} {
          0%, ${p(14)}% { transform: scaleX(0); }
          ${p(24)}%, 86% { transform: scaleX(1); }
          96%, 100% { transform: scaleX(0); }
        }
        @keyframes sb-label-${uniqueId} {
          0%, ${p(29)}% { transform: translateX(-180px); }
          ${p(40)}%, 82% { transform: translateX(0); }
          94%, 100% { transform: translateX(-180px); }
        }
        #typography-${uniqueId} .sb-move { animation: sb-move-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .sb-pop  { animation: sb-pop-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .sb-pill {
          fill: ${activeIconBg}; stroke: ${secondaryColor}; stroke-width: 3;
          transform-box: fill-box; transform-origin: center center; pointer-events: none;
          animation: sb-pill-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }
        #typography-${uniqueId} .sb-badge { fill: ${activeIconBg}; stroke: ${secondaryColor}; stroke-width: 4; pointer-events: none; }
        #typography-${uniqueId} .sb-f { fill: ${activeIconColor}; pointer-events: none; }
        #typography-${uniqueId} .sb-label {
          display: inline-block; white-space: nowrap !important; line-height: 1;
          font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 500; letter-spacing: 0.02em;
          color: #FFFFFF; fill: #FFFFFF; text-transform: uppercase; will-change: transform;
          animation: sb-label-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }`;
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="12" ry="12" fill="none" pointer-events="all" />
      <g transform="translate(${ox} ${oy}) scale(${S})">
        <!-- white pill (612x82, r18) grows from its centre, sits behind the badge -->
        <rect class="sb-pill" x="29" y="-31" width="612" height="82" rx="18" ry="18" />
        <!-- badge: 184px rounded square rotated 45deg, with the "f" kept upright -->
        <g class="sb-move"><g class="sb-pop">
          <rect class="sb-badge" x="-92" y="-92" width="184" height="184" rx="44" ry="44" transform="rotate(45)" />
          ${innerIconMarkup}
        </g></g>
      </g>
      <!-- label clipped to the pill window -->
      <foreignObject x="${ox + 29 * S}" y="${oy - 31 * S}" width="${612 * S}" height="${82 * S}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; padding-left: 44px; box-sizing: border-box; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content sb-label">${text}</span>
        </div>
      </foreignObject>`;

  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  return `
    <g id="typography-${uniqueId}" 
       data-type="text" 
       data-typography-type="motion-graphic" 
       data-is-element-typography="true"
       data-motion-template="social-badge"
       data-text="${text}"
       data-primary-color="${primaryColor}" 
       data-secondary-color="${secondaryColor}" 
       data-font-size="${fontSize}" 
       data-font-family="${fontFamily}"
       data-icon-name="${iconName}"
       data-icon-html="${encodeURIComponent(iconHtml)}"
       data-icon-viewbox="${iconViewBox}"
       data-icon-color="${activeIconColor}"
       data-icon-bg-color="${activeIconBg}"
       cursor="pointer"${transformAttr} 
       style="--stroke-width: 0px; --shadow-x: 0px; --shadow-y: 0px; --skew-angle: 0deg;">
      <style>${css}</style>
      ${body}
    </g>
  `;
};

// --------------------------------------------------------------------------
// Universal Motion Graphic Dispatcher
// --------------------------------------------------------------------------
export const createMotionGraphicSvg = ({
  template = 'cyber-frame',
  uniqueId = Date.now(),
  text = 'ANIMATION',
  subText = '',
  primaryColor = '#000000',
  secondaryColor = '#FF0033',
  glowIntensity = 6,
  fontSize = 18,
  fontFamily = 'Roboto, sans-serif',
  duration = 4700,
  isTranslate = false,
  iconName,
  iconHtml,
  iconViewBox,
  iconColor,
  iconBgColor
}) => {
  switch (template) {
    case 'cyber-frame':
      return createCyberFrameSvg({
        uniqueId,
        text,
        primaryColor,
        secondaryColor,
        glowIntensity,
        fontSize,
        fontFamily,
        duration,
        isTranslate
      });
    case 'flipi-split':
      return createFlipiSlashSvg({
        uniqueId,
        text,
        subText: subText || 'ANIMATION',
        primaryColor,
        secondaryColor,
        fontSize,
        fontFamily,
        duration,
        isTranslate
      });
    case 'box-reveal':
      return createBoxRevealSvg({
        uniqueId,
        text,
        subText: subText || 'ANIMATION',
        primaryColor,
        secondaryColor,
        fontSize,
        fontFamily,
        duration,
        isTranslate
      });
    case 'youtube-channel':
      return createYouTubeChannelSvg({
        uniqueId,
        text,
        primaryColor,
        secondaryColor,
        fontSize,
        fontFamily,
        duration,
        isTranslate,
        iconName: iconName || 'Play',
        iconHtml,
        iconViewBox,
        iconColor,
        iconBgColor
      });
    case 'slide-split':
      return createSlideSplitSvg({ uniqueId, text, subText: subText || 'ANIMATION', primaryColor, secondaryColor, fontSize, fontFamily, duration, isTranslate });
    case 'swap-bar':
      return createSwapBarSvg({ uniqueId, text, subText: subText || 'ANIMATION', primaryColor, secondaryColor, fontSize, fontFamily, duration, isTranslate });
    case 'bar-sweep':
      return createBarSweepSvg({ uniqueId, text, subText: subText || 'ANIMATION', primaryColor, secondaryColor, fontSize, fontFamily, duration, isTranslate });
    case 'square-open':
      return createSquareOpenSvg({ uniqueId, text, subText: subText || 'ANIMATION', primaryColor, secondaryColor, fontSize, fontFamily, duration, isTranslate });
    case 'social-badge':
      return createSocialBadgeSvg({
        uniqueId,
        text: text === 'ANIMATION' ? 'FACEBOOK' : text,
        primaryColor: primaryColor === '#FF0033' ? '#0E34A8' : primaryColor,
        secondaryColor,
        fontSize,
        fontFamily,
        duration,
        isTranslate,
        iconName: iconName || 'Facebook',
        iconHtml,
        iconViewBox,
        iconColor,
        iconBgColor
      });
    default:
      return createCyberFrameSvg({
        uniqueId,
        text,
        primaryColor,
        secondaryColor,
        glowIntensity,
        fontSize,
        fontFamily,
        duration,
        isTranslate
      });
  }
};

export const createMotionGraphicElementNode = (preset, cx, cy) => {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  const svgXml = createMotionGraphicSvg({
    template: preset.template,
    uniqueId,
    text: preset.text,
    subText: preset.subText,
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    glowIntensity: preset.glowIntensity,
    fontSize: preset.fontSize,
    fontFamily: preset.fontFamily,
    duration: preset.duration
  });

  const parser = new DOMParser();
  let doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgXml}</svg>`, 'image/svg+xml');
  let g = doc.querySelector(`g#typography-${uniqueId}`);
  if (!g) {
    const htmlDoc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svgXml}</svg>`, 'text/html');
    g = htmlDoc.querySelector(`g#typography-${uniqueId}`);
  }
  if (!g) return null;

  const TEMPLATE_SIZES = {
    'cyber-frame': [188, 56],
    'flipi-split': [230, 66],
    'box-reveal': [200, 56],
    'youtube-channel': [220, 54],
    'slide-split': [240, 78],
    'swap-bar': [420, 56],
    'bar-sweep': [250, 68],
    'square-open': [230, 96],
    'social-badge': [250, 90]
  };
  const [estWidth, estHeight] = TEMPLATE_SIZES[preset.template] || [200, 56];

  // Scale down titles so they drop onto the canvas at a neat, balanced Canva-like proportion
  let scale = 1;
  const maxInitialWidth = 90;
  if (estWidth > maxInitialWidth) {
    scale = maxInitialWidth / estWidth;
  }

  const renderW = estWidth * scale;
  const renderH = estHeight * scale;
  const posX = Math.round(cx - renderW / 2);
  const posY = Math.round(cy - renderH / 2);

  const titleName = preset.name ? `Title - ${preset.name.replace(/\s*\([^)]*\)/g, '').trim()}` : 'Title';
  g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
  g.setAttribute('data-name', titleName);
  g.setAttribute('data-preset-title', preset.name || 'Motion Graphic');
  g.setAttribute('data-subtopic', 'Titles');

  return document.importNode(g, true);
};

// --------------------------------------------------------------------------
// Helper methods for ElementTitlesProperties
// --------------------------------------------------------------------------

export const MOTION_GRAPHIC_TEMPLATES = [
  { id: 'cyber-frame', name: 'Cyber Frame' },
  { id: 'flipi-split', name: 'Flipi Slash' },
  { id: 'box-reveal', name: 'Dual Box' },
  { id: 'youtube-channel', name: 'YouTube Intro' },
  { id: 'slide-split', name: 'Slide Split' },
  { id: 'swap-bar', name: 'Swap Bar' },
  { id: 'bar-sweep', name: 'Bar Sweep' },
  { id: 'square-open', name: 'Square Open' },
  { id: 'social-badge', name: 'Social Badge' }
];

export const getMotionGraphicProperties = (el) => {
  if (!el) {
    return {
      animation: 'Infinity',
      speed: 80,
      primaryText: 'Animation',
      secondaryText: 'Animation',
      primaryTextColor: '#0f291e',
      secondaryTextColor: '#0f291e',
      object1Color: '#000000',
      object2Color: '#000000',
      object3Color: '#000000',
      primaryFontSize: 24,
      primaryFontFamily: 'Impact',
      primaryFontWeight: 'bold',
      secondaryFontSize: 18,
      secondaryFontFamily: 'Roboto',
      secondaryFontWeight: 'normal'
    };
  }

  const animation = el.getAttribute('data-animation-mode') || 'Infinite';
  const customCount = el.getAttribute('data-animation-custom-count') || '';
  const rawSpeed = el.getAttribute('data-speed');
  const speed = rawSpeed !== null ? parseInt(rawSpeed, 10) : 80;

  // Primary Text & Color
  const primaryText =
    el.getAttribute('data-text') ||
    el.querySelector('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text')?.textContent ||
    'Animation';

  let primaryTextColor =
    el.getAttribute('data-primary-text-color') ||
    el.getAttribute('data-primary-color') ||
    '#0f291e';

  // Secondary Text & Color
  const secondaryText =
    el.getAttribute('data-subtext') ||
    el.querySelector('.motion-text-subcontent, .flipi-text-b, .box-title-b')?.textContent ||
    'Animation';

  let secondaryTextColor =
    el.getAttribute('data-secondary-text-color') ||
    el.getAttribute('data-secondary-color') ||
    '#0f291e';

  // Object Colors / Strokes / Backgrounds
  const textColor1 = primaryTextColor;
  const textColor2 = secondaryTextColor;

  const strokeColor =
    el.getAttribute('data-stroke-color') ||
    el.getAttribute('data-secondary-color') ||
    el.getAttribute('data-object-1-color') ||
    el.getAttribute('data-primary-color') ||
    '#00E5FF';

  const backgroundColor =
    el.getAttribute('data-bg-color') ||
    el.getAttribute('data-object-3-color') ||
    'transparent';

  const object1Color = strokeColor;
  const object2Color = strokeColor;
  const object3Color = strokeColor;

  // Font properties
  const primaryFontSize = parseInt(el.getAttribute('data-font-size') || '24', 10);
  const primaryFontFamily = el.getAttribute('data-font-family') || 'Poppins';
  const primaryFontWeight = el.getAttribute('data-font-weight') || 'Semi Bold';
  const primaryLetterSpacing = el.getAttribute('data-letter-spacing') || 'Auto';
  const primaryLineHeight = el.getAttribute('data-line-height') || 'Auto';
  const primaryTextAlign = el.getAttribute('data-text-align') || 'center';
  const primaryIsBold = el.getAttribute('data-is-bold') === 'true' || primaryFontWeight.toLowerCase().includes('bold');
  const primaryIsStrikethrough = el.getAttribute('data-is-strikethrough') === 'true';
  const primaryIsList = el.getAttribute('data-is-list') === 'true';

  const secondaryFontSize = parseInt(el.getAttribute('data-secondary-font-size') || '24', 10);
  const secondaryFontFamily = el.getAttribute('data-secondary-font-family') || 'Poppins';
  const secondaryFontWeight = el.getAttribute('data-secondary-font-weight') || 'Semi Bold';
  const secondaryLetterSpacing = el.getAttribute('data-secondary-letter-spacing') || 'Auto';
  const secondaryLineHeight = el.getAttribute('data-secondary-line-height') || 'Auto';
  const secondaryTextAlign = el.getAttribute('data-secondary-text-align') || 'center';
  const secondaryIsBold = el.getAttribute('data-secondary-is-bold') === 'true' || secondaryFontWeight.toLowerCase().includes('bold');
  const secondaryIsStrikethrough = el.getAttribute('data-secondary-is-strikethrough') === 'true';
  const secondaryIsList = el.getAttribute('data-secondary-is-list') === 'true';

  const motionTemplate = el.getAttribute('data-motion-template') || '';

  // Icon properties for templates with logo/icon support
  let rawIconHtml = el.getAttribute('data-icon-html') || '';
  let decodedIconHtml = '';
  if (rawIconHtml) {
    try {
      decodedIconHtml = decodeURIComponent(rawIconHtml);
    } catch {
      decodedIconHtml = rawIconHtml;
    }
  }
  const iconName = el.getAttribute('data-icon-name') || (motionTemplate === 'youtube-channel' ? 'Play' : (motionTemplate === 'social-badge' ? 'Facebook' : 'Heart'));
  const iconHtml = decodedIconHtml;
  const iconViewBox = el.getAttribute('data-icon-viewbox') || '0 0 24 24';
  const iconColor = el.getAttribute('data-icon-color') || '#FFFFFF';
  const iconBgColor = el.getAttribute('data-icon-bg-color') || (motionTemplate === 'youtube-channel' ? '#FF0024' : (motionTemplate === 'social-badge' ? '#0E34A8' : '#000000'));

  return {
    animation,
    customCount,
    speed,
    primaryText,
    secondaryText,
    primaryTextColor,
    secondaryTextColor,
    textColor1,
    textColor2,
    strokeColor,
    backgroundColor,
    object1Color,
    object2Color,
    object3Color,
    iconName,
    iconHtml,
    iconViewBox,
    iconColor,
    iconBgColor,
    primaryFontSize,
    primaryFontFamily,
    primaryFontWeight,
    primaryLetterSpacing,
    primaryLineHeight,
    primaryTextAlign,
    primaryIsBold,
    primaryIsStrikethrough,
    primaryIsList,
    secondaryFontSize,
    secondaryFontFamily,
    secondaryFontWeight,
    secondaryLetterSpacing,
    secondaryLineHeight,
    secondaryTextAlign,
    secondaryIsBold,
    secondaryIsStrikethrough,
    secondaryIsList
  };
};

export const updateMotionGraphicAttributes = (el, updates = {}) => {
  if (!el) return;

  if (updates.animation !== undefined || updates.customCount !== undefined) {
    const anim = updates.animation !== undefined ? updates.animation : (el.getAttribute('data-animation-mode') || 'Infinite');
    el.setAttribute('data-animation-mode', anim);

    let countStr = 'infinite';
    if (anim === 'Once') countStr = '1';
    else if (anim === 'Twice') countStr = '2';
    else if (anim === 'Thrice') countStr = '3';
    else if (anim === 'Infinite') countStr = 'infinite';
    else if (anim === 'Custom') {
      const c = updates.customCount !== undefined ? updates.customCount : el.getAttribute('data-animation-custom-count');
      if (c) el.setAttribute('data-animation-custom-count', String(c));
      countStr = c && !isNaN(parseInt(c, 10)) ? String(parseInt(c, 10)) : '1';
    }

    const styles = el.querySelectorAll('style');
    styles.forEach((st) => {
      // Replace existing iteration count in animation shorthand or add/update it
      st.textContent = st.textContent.replace(/(animation:\s*[^;]+?)(\s+(?:infinite|[0-9]+))(\s+cubic-bezier|\s+ease|\s+linear|\s*;)/gi, (m, p1, oldIter, p2) => {
        return `${p1} ${countStr}${p2}`;
      });
      // Also ensure animation-iteration-count property if present or update
      if (st.textContent.includes('animation-iteration-count:')) {
        st.textContent = st.textContent.replace(/animation-iteration-count:\s*[^;]+;/gi, `animation-iteration-count: ${countStr};`);
      }
    });
  }

  if (updates.iconName !== undefined) {
    el.setAttribute('data-icon-name', updates.iconName);
  }

  if (updates.iconViewBox !== undefined) {
    el.setAttribute('data-icon-viewbox', updates.iconViewBox);
  }

  if (updates.iconHtml !== undefined) {
    el.setAttribute('data-icon-html', encodeURIComponent(updates.iconHtml || ''));
    const template = el.getAttribute('data-motion-template');
    const curIconColor = updates.iconColor || el.getAttribute('data-icon-color') || '#FFFFFF';
    const curViewBox = updates.iconViewBox || el.getAttribute('data-icon-viewbox') || '0 0 24 24';

    if (template === 'youtube-channel') {
      const logoBox = el.querySelector('.yt-logo-box');
      if (logoBox) {
        // remove existing polygon or custom icon
        const existingPoly = logoBox.querySelector('polygon');
        const existingCustom = logoBox.querySelector('.yt-custom-icon');
        if (existingPoly) existingPoly.remove();
        if (existingCustom) existingCustom.remove();

        if (updates.iconHtml) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            `<svg xmlns="http://www.w3.org/2000/svg" class="yt-custom-icon" viewBox="${curViewBox}" x="8" y="3" width="20" height="20" fill="none" stroke="${curIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">${updates.iconHtml}</svg>`,
            'image/svg+xml'
          );
          const newSvg = doc.querySelector('.yt-custom-icon');
          if (newSvg) {
            // Adopt node into target ownerDocument
            const adopted = el.ownerDocument ? el.ownerDocument.importNode(newSvg, true) : newSvg;
            logoBox.appendChild(adopted);
          }
        } else {
          // Restore default YouTube play polygon
          const poly = (el.ownerDocument || document).createElementNS('http://www.w3.org/2000/svg', 'polygon');
          poly.setAttribute('points', '15,6 15,20 25,13');
          poly.setAttribute('fill', curIconColor);
          logoBox.appendChild(poly);
        }
      }
    } else if (template === 'social-badge') {
      const sbPop = el.querySelector('.sb-pop');
      if (sbPop) {
        const existingF = sbPop.querySelector('.sb-f');
        const existingCustom = sbPop.querySelector('.sb-custom-icon');
        if (existingF) existingF.remove();
        if (existingCustom) existingCustom.remove();

        if (updates.iconHtml) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            `<g xmlns="http://www.w3.org/2000/svg" class="sb-custom-icon" transform="translate(-55 -55)"><svg viewBox="${curViewBox}" width="110" height="110" fill="none" stroke="${curIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">${updates.iconHtml}</svg></g>`,
            'image/svg+xml'
          );
          const newG = doc.querySelector('.sb-custom-icon');
          if (newG) {
            const adopted = el.ownerDocument ? el.ownerDocument.importNode(newG, true) : newG;
            sbPop.appendChild(adopted);
          }
        } else {
          // Restore default Facebook "f"
          const p = (el.ownerDocument || document).createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('class', 'sb-f');
          p.setAttribute('transform', 'translate(-60 -62) scale(5.2)');
          p.setAttribute('d', 'M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.4v3.2h2.8V21h3.2z');
          p.setAttribute('fill', curIconColor);
          sbPop.appendChild(p);
        }
      }
    }
  }

  if (updates.iconColor !== undefined) {
    el.setAttribute('data-icon-color', updates.iconColor);
    // YouTube play polygon or custom icon strokes/fills
    const ytPoly = el.querySelector('.yt-logo-box polygon');
    if (ytPoly) ytPoly.setAttribute('fill', updates.iconColor);

    const ytCustom = el.querySelector('.yt-custom-icon');
    if (ytCustom) {
      ytCustom.setAttribute('stroke', updates.iconColor);
      ytCustom.style.stroke = updates.iconColor;
      ytCustom.querySelectorAll('path, circle, line, rect, polyline, polygon').forEach((shape) => {
        const curFill = shape.getAttribute('fill');
        if (curFill && curFill !== 'none') shape.setAttribute('fill', updates.iconColor);
        shape.setAttribute('stroke', updates.iconColor);
      });
    }

    // Social badge f or custom icon
    const sbF = el.querySelector('.sb-f');
    if (sbF) {
      sbF.setAttribute('fill', updates.iconColor);
      sbF.style.fill = updates.iconColor;
    }

    const sbCustom = el.querySelector('.sb-custom-icon');
    if (sbCustom) {
      const innerSvg = sbCustom.querySelector('svg');
      if (innerSvg) {
        innerSvg.setAttribute('stroke', updates.iconColor);
        innerSvg.style.stroke = updates.iconColor;
      }
      sbCustom.querySelectorAll('path, circle, line, rect, polyline, polygon').forEach((shape) => {
        const curFill = shape.getAttribute('fill');
        if (curFill && curFill !== 'none') shape.setAttribute('fill', updates.iconColor);
        shape.setAttribute('stroke', updates.iconColor);
      });
    }
  }

  if (updates.iconBgColor !== undefined) {
    el.setAttribute('data-icon-bg-color', updates.iconBgColor);
    // YouTube logo box rect
    const ytRect = el.querySelector('.yt-logo-box rect');
    if (ytRect) {
      ytRect.setAttribute('fill', updates.iconBgColor);
      ytRect.style.fill = updates.iconBgColor;
    }

    // Social badge diamond badge & pill
    const sbBadge = el.querySelector('.sb-badge');
    if (sbBadge) {
      sbBadge.setAttribute('fill', updates.iconBgColor);
      sbBadge.style.fill = updates.iconBgColor;
    }
    const sbPill = el.querySelector('.sb-pill');
    if (sbPill) {
      sbPill.setAttribute('fill', updates.iconBgColor);
      sbPill.style.fill = updates.iconBgColor;
    }
  }

  if (updates.speed !== undefined) {
    el.setAttribute('data-speed', String(updates.speed));
    // Apply speed adjustment to style animations (standard duration ~ 4500ms scaled inversely)
    const factor = Math.max(0.1, updates.speed / 100);
    const styles = el.querySelectorAll('style');
    styles.forEach((st) => {
      st.textContent = st.textContent.replace(/animation:\s*([a-zA-Z0-9_-]+)\s+([0-9.]+)ms/g, (match, animName, dur) => {
        const origDur = parseFloat(dur);
        const newDur = Math.round(origDur / factor);
        return `animation: ${animName} ${newDur}ms`;
      });
    });
  }

  if (updates.primaryText !== undefined) {
    el.setAttribute('data-text', updates.primaryText);
    const cyberText = el.querySelector('.cyber-text');
    if (cyberText) {
      const letters = Array.from(updates.primaryText);
      cyberText.innerHTML = letters
        .map((char, i) => `<span class="cyber-char cyber-char-${i}">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');
    } else {
      const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text');
      primarySpans.forEach((sp) => {
        sp.textContent = updates.primaryText;
      });
    }
  }

  if (updates.secondaryText !== undefined) {
    el.setAttribute('data-subtext', updates.secondaryText);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.textContent = updates.secondaryText;
    });
  }

  if (updates.textColor1 !== undefined || updates.primaryTextColor !== undefined) {
    const val = updates.textColor1 !== undefined ? updates.textColor1 : updates.primaryTextColor;
    el.setAttribute('data-text-color-1', val);
    el.setAttribute('data-primary-text-color', val);
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.color = val;
      sp.style.fill = val;
    });
  }

  if (updates.textColor2 !== undefined || updates.secondaryTextColor !== undefined) {
    const val = updates.textColor2 !== undefined ? updates.textColor2 : updates.secondaryTextColor;
    el.setAttribute('data-text-color-2', val);
    el.setAttribute('data-secondary-text-color', val);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.color = val;
      sp.style.fill = val;
    });
  }

  if (updates.strokeColor !== undefined) {
    el.setAttribute('data-stroke-color', updates.strokeColor);
    el.setAttribute('data-secondary-color', updates.strokeColor);
    const strokeEls = el.querySelectorAll('.box-accent-frame, .cyber-glow-stroke, .cyber-inner-stroke, .flipi-slash-accent, .sq-box, .bs-bar, .sb-bar, .ss-bar, .sb-pill, .sb-badge, .yt-logo-box rect');
    strokeEls.forEach((node) => {
      if (node.tagName.toLowerCase() === 'rect' && node.parentElement?.classList.contains('yt-logo-box')) {
        node.setAttribute('fill', updates.strokeColor);
      } else if (node.classList?.contains('ss-bar')) {
        node.style.background = updates.strokeColor;
      } else if (node.classList?.contains('bs-bar') || node.classList?.contains('sb-bar')) {
        node.setAttribute('fill', updates.strokeColor);
        node.style.fill = updates.strokeColor;
      } else if (node.classList?.contains('sb-pill') || node.classList?.contains('sb-badge')) {
        node.setAttribute('stroke', updates.strokeColor);
        node.style.stroke = updates.strokeColor;
      } else {
        node.setAttribute('stroke', updates.strokeColor);
        node.style.stroke = updates.strokeColor;
      }
    });
  }

  if (updates.backgroundColor !== undefined) {
    el.setAttribute('data-bg-color', updates.backgroundColor);
    const bgEls = el.querySelectorAll('.motion-click-boundary');
    bgEls.forEach((node) => {
      node.setAttribute('fill', updates.backgroundColor);
      node.style.fill = updates.backgroundColor;
    });
  }

  if (updates.object1Color !== undefined) {
    el.setAttribute('data-object-1-color', updates.object1Color);
    el.setAttribute('data-primary-color', updates.object1Color);
    const obj1 = el.querySelectorAll('.box-accent-frame, .cyber-glow-stroke, .flipi-slash-accent, .yt-logo-box rect, .sq-box');
    obj1.forEach((node) => {
      if (node.tagName.toLowerCase() === 'rect' && node.parentElement?.classList.contains('yt-logo-box')) {
        node.setAttribute('fill', updates.object1Color);
      } else {
        node.setAttribute('stroke', updates.object1Color);
      }
    });
  }

  if (updates.object2Color !== undefined) {
    el.setAttribute('data-object-2-color', updates.object2Color);
    el.setAttribute('data-secondary-color', updates.object2Color);
    const obj2 = el.querySelectorAll('.cyber-inner-stroke, .yt-logo-box polygon, .sq-b');
    obj2.forEach((node) => {
      if (node.tagName.toLowerCase() === 'polygon') {
        node.setAttribute('fill', updates.object2Color);
      } else if (node.classList?.contains('sq-b')) {
        node.style.color = updates.object2Color;
        node.style.fill = updates.object2Color;
      } else {
        node.setAttribute('stroke', updates.object2Color);
      }
    });
  }

  if (updates.object3Color !== undefined) {
    el.setAttribute('data-object-3-color', updates.object3Color);
    const obj3 = el.querySelectorAll('.motion-click-boundary, .sq-box');
    obj3.forEach((node) => {
      if (node.classList?.contains('sq-box')) {
        node.setAttribute('fill', updates.object3Color);
        node.style.fill = updates.object3Color;
      } else {
        node.setAttribute('fill', updates.object3Color);
      }
    });
  }

  if (updates.primaryFontSize !== undefined) {
    el.setAttribute('data-font-size', String(updates.primaryFontSize));
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.fontSize = `${updates.primaryFontSize}pt`;
    });
  }

  if (updates.primaryFontFamily !== undefined) {
    el.setAttribute('data-font-family', updates.primaryFontFamily);
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.fontFamily = `'${updates.primaryFontFamily}', sans-serif`;
    });
  }

  if (updates.primaryFontWeight !== undefined) {
    el.setAttribute('data-font-weight', updates.primaryFontWeight);
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.fontWeight = updates.primaryFontWeight.toLowerCase().includes('bold') ? '700' : '400';
    });
  }

  if (updates.primaryTextAlign !== undefined) {
    el.setAttribute('data-text-align', updates.primaryTextAlign);
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.textAlign = updates.primaryTextAlign;
    });
  }

  if (updates.primaryLetterSpacing !== undefined) {
    el.setAttribute('data-letter-spacing', updates.primaryLetterSpacing);
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.letterSpacing = updates.primaryLetterSpacing === 'Auto' ? 'normal' : updates.primaryLetterSpacing;
    });
  }

  if (updates.primaryLineHeight !== undefined) {
    el.setAttribute('data-line-height', updates.primaryLineHeight);
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.lineHeight = updates.primaryLineHeight === 'Auto' ? 'normal' : updates.primaryLineHeight;
    });
  }

  if (updates.primaryIsBold !== undefined) {
    el.setAttribute('data-is-bold', String(updates.primaryIsBold));
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.fontWeight = updates.primaryIsBold ? '700' : '400';
    });
  }

  if (updates.primaryIsStrikethrough !== undefined) {
    el.setAttribute('data-is-strikethrough', String(updates.primaryIsStrikethrough));
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.textDecoration = updates.primaryIsStrikethrough ? 'line-through' : 'none';
    });
  }

  if (updates.secondaryFontSize !== undefined) {
    el.setAttribute('data-secondary-font-size', String(updates.secondaryFontSize));
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.fontSize = `${updates.secondaryFontSize}pt`;
    });
  }

  if (updates.secondaryFontFamily !== undefined) {
    el.setAttribute('data-secondary-font-family', updates.secondaryFontFamily);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.fontFamily = `'${updates.secondaryFontFamily}', sans-serif`;
    });
  }

  if (updates.secondaryFontWeight !== undefined) {
    el.setAttribute('data-secondary-font-weight', updates.secondaryFontWeight);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.fontWeight = updates.secondaryFontWeight.toLowerCase().includes('bold') ? '700' : '400';
    });
  }

  if (updates.secondaryTextAlign !== undefined) {
    el.setAttribute('data-secondary-text-align', updates.secondaryTextAlign);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.textAlign = updates.secondaryTextAlign;
    });
  }

  if (updates.secondaryLetterSpacing !== undefined) {
    el.setAttribute('data-secondary-letter-spacing', updates.secondaryLetterSpacing);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.letterSpacing = updates.secondaryLetterSpacing === 'Auto' ? 'normal' : updates.secondaryLetterSpacing;
    });
  }

  if (updates.secondaryLineHeight !== undefined) {
    el.setAttribute('data-secondary-line-height', updates.secondaryLineHeight);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.lineHeight = updates.secondaryLineHeight === 'Auto' ? 'normal' : updates.secondaryLineHeight;
    });
  }

  if (updates.secondaryIsBold !== undefined) {
    el.setAttribute('data-secondary-is-bold', String(updates.secondaryIsBold));
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.fontWeight = updates.secondaryIsBold ? '700' : '400';
    });
  }

  if (updates.secondaryIsStrikethrough !== undefined) {
    el.setAttribute('data-secondary-is-strikethrough', String(updates.secondaryIsStrikethrough));
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b, .sq-b');
    secSpans.forEach((sp) => {
      sp.style.textDecoration = updates.secondaryIsStrikethrough ? 'line-through' : 'none';
    });
  }
};