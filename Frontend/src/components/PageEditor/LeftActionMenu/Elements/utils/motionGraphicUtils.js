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
  primaryColor = '#FF0033',
  secondaryColor = '#FFFFFF',
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
          animation: cyber-text-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          animation-play-state: running;
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
          display: inline-block;
          margin: 0;
          padding: 0;
          will-change: transform, opacity;
        }
      </style>

      <rect 
        class="motion-click-boundary" 
        x="0" 
        y="0" 
        width="${width}" 
        height="${height}" 
        rx="${rx}" 
        ry="${rx}" 
        fill="rgba(8, 10, 16, 0.65)" 
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
        stroke="${primaryColor}" 
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
          <span class="motion-text-content cyber-text">${text}</span>
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
  primaryColor = '#F3F2F3',
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
        fill="rgba(10, 12, 18, 0.7)" 
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
      <foreignObject x="38" y="4" width="${width - 44}" height="28" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content flipi-text-a">${text}</span>
        </div>
      </foreignObject>

      <!-- Text B: Bottom Half with HTML overflow:hidden -->
      <foreignObject x="38" y="32" width="${width - 44}" height="32" style="pointer-events: none;">
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
  secondaryColor = '#FFFFFF',
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
        fill="rgba(12, 12, 16, 0.75)" 
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
  secondaryColor = '#FFFFFF',
  fontSize = 21,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 3600,
  isTranslate = false
}) => {
  const transformAttr = isTranslate ? ' transform="translate(50, 50)"' : '';
  const width = 220;
  const height = 54;
  const charSteps = Math.max(1, text.length);

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
        fill="rgba(10, 10, 14, 0.7)" 
        pointer-events="all" 
      />

      <!-- YouTube Red Curved Badge centered at (10, 14) -->
      <g class="yt-logo-box" transform="translate(10, 14)">
        <rect 
          x="0" 
          y="0" 
          width="36" 
          height="26" 
          rx="7" 
          ry="7" 
          fill="${primaryColor}" 
        />
        <polygon 
          points="14,7 14,19 24,13" 
          fill="${secondaryColor}" 
        />
      </g>

      <!-- Channel Name Typewriter Reveal -->
      <foreignObject x="54" y="0" width="${width - 60}" height="${height}" style="overflow: visible; pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; pointer-events: none;">
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
  primaryColor = '#FFFFFF',
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
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="rgba(10, 10, 14, 0.7)" pointer-events="all" />
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
// 6. Swap Bar Title  (Title_7.json - 210f @ 29.97fps)
//    Accent bars spin in (-158deg -> 0), two words slide toward the bar from
//    opposite sides, underline trims on.
// --------------------------------------------------------------------------
export const createSwapBarSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#FFFFFF',
  secondaryColor = '#3BF4FF',
  fontSize = 22,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 7000,
  isTranslate = false
}) => {
  const width = 300, height = 60;
  const ease = 'cubic-bezier(0.33, 0, 0.17, 1)';
  const css = `
        @keyframes sb-bar-a-${uniqueId} {
          0% { transform: rotate(-158deg) scaleY(0); }
          17% { transform: rotate(0deg) scaleY(1); }
          88% { transform: rotate(0deg) scaleY(1); }
          98%, 100% { transform: rotate(158deg) scaleY(0); }
        }
        @keyframes sb-bar-b-${uniqueId} {
          0%, 6% { transform: rotate(-158deg) scaleY(0); }
          17% { transform: rotate(0deg) scaleY(1); }
          88% { transform: rotate(0deg) scaleY(1); }
          96%, 100% { transform: rotate(158deg) scaleY(0); }
        }
        @keyframes sb-word-l-${uniqueId} {
          0%, 15% { transform: translateX(110%); opacity: 0; }
          17% { opacity: 1; }
          33% { transform: translateX(0); opacity: 1; }
          84% { transform: translateX(0); opacity: 1; }
          96%, 100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes sb-word-r-${uniqueId} {
          0%, 15% { transform: translateX(-110%); opacity: 0; }
          17% { opacity: 1; }
          33% { transform: translateX(0); opacity: 1; }
          84% { transform: translateX(0); opacity: 1; }
          96%, 100% { transform: translateX(-110%); opacity: 0; }
        }
        @keyframes sb-line-${uniqueId} {
          0%, 16% { stroke-dasharray: 0 100; stroke-dashoffset: 0; }
          33% { stroke-dasharray: 100 0; stroke-dashoffset: 0; }
          84% { stroke-dasharray: 100 0; stroke-dashoffset: 0; }
          96%, 100% { stroke-dasharray: 0 100; stroke-dashoffset: -100; }
        }
        #typography-${uniqueId} .sb-bar { fill: ${secondaryColor}; transform-box: fill-box; transform-origin: center center; pointer-events: none; }
        #typography-${uniqueId} .sb-bar-a { animation: sb-bar-a-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .sb-bar-b { animation: sb-bar-b-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; opacity: 0.55; }
        #typography-${uniqueId} .sb-line { animation: sb-line-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; pointer-events: none; }
        #typography-${uniqueId} .sb-word {
          display: inline-block; white-space: nowrap !important; line-height: 1;
          font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 900; letter-spacing: 0.01em;
          color: ${primaryColor}; fill: ${primaryColor}; text-transform: uppercase; will-change: transform, opacity;
        }
        #typography-${uniqueId} .sb-word-l { animation: sb-word-l-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .sb-word-r { animation: sb-word-r-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }`;
  const half = (width - 18) / 2;
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="rgba(10, 10, 14, 0.7)" pointer-events="all" />
      <rect class="sb-bar sb-bar-b" x="${width / 2 - 1}" y="8" width="3" height="${height - 16}" />
      <rect class="sb-bar sb-bar-a" x="${width / 2 - 4}" y="8" width="6" height="${height - 16}" />
      <foreignObject x="6" y="6" width="${half}" height="${height - 18}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-end; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content sb-word sb-word-l">${text}</span>
        </div>
      </foreignObject>
      <foreignObject x="${width / 2 + 8}" y="6" width="${half}" height="${height - 18}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; pointer-events: none;">
          <span class="motion-text-subcontent sb-word sb-word-r">${subText}</span>
        </div>
      </foreignObject>
      <line class="sb-line" x1="12" y1="${height - 8}" x2="${width - 12}" y2="${height - 8}" pathLength="100" stroke="${secondaryColor}" stroke-width="2" stroke-linecap="round" />`;
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
  primaryColor = '#FFFFFF',
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
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="rgba(10, 10, 14, 0.7)" pointer-events="all" />
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
//    A square spins open (width first, then height, -169deg -> 0) and the
//    words rise up through it.
// --------------------------------------------------------------------------
export const createSquareOpenSvg = ({
  uniqueId = Date.now(),
  text = 'FLIPIBOOK',
  subText = 'ANIMATION',
  primaryColor = '#FFFFFF',
  secondaryColor = '#3BF4FF',
  fontSize = 20,
  fontFamily = '"Arial Black", Impact, sans-serif',
  duration = 6500,
  isTranslate = false
}) => {
  const width = 150, height = 110;
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
          fill: rgba(255, 0, 102, 0.18); stroke: ${secondaryColor}; stroke-width: 2.5;
          transform-box: fill-box; transform-origin: center center; pointer-events: none;
          animation: sq-box-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }
        #typography-${uniqueId} .sq-win { overflow: hidden; }
        #typography-${uniqueId} .sq-a, #typography-${uniqueId} .sq-b {
          display: inline-block; white-space: nowrap !important; line-height: 1.1; text-transform: uppercase;
          color: ${primaryColor}; fill: ${primaryColor}; will-change: transform, opacity;
        }
        #typography-${uniqueId} .sq-a { font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 900; letter-spacing: 0.02em; animation: sq-word-a-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }
        #typography-${uniqueId} .sq-b { font-family: Arial, Helvetica, sans-serif; font-size: ${Math.round(fontSize * 0.62)}px; font-weight: 400; letter-spacing: 0.14em; color: ${secondaryColor}; fill: ${secondaryColor}; animation: sq-word-b-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running; }`;
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="rgba(10, 10, 14, 0.7)" pointer-events="all" />
      <rect class="sq-box" x="8" y="8" width="${width - 16}" height="${height - 16}" />
      <foreignObject x="14" y="14" width="${width - 28}" height="${height - 28}" style="pointer-events: none;">
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
  isTranslate = false
}) => {
  const width = 250, height = 90;
  const S = 0.3;                 // comp px -> svg px
  const ox = 49, oy = 45;        // badge centre in svg px
  const inPct = Math.min(60, (1533 / duration) * 100);   // 46 frames @30fps
  const p = (f) => +((f / 46) * inPct).toFixed(2);       // frame -> keyframe %
  const ease = 'cubic-bezier(0.3, 0, 0.3, 1)';
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
          fill: ${secondaryColor}; stroke: ${primaryColor}; stroke-width: 3;
          transform-box: fill-box; transform-origin: center center; pointer-events: none;
          animation: sb-pill-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }
        #typography-${uniqueId} .sb-badge { fill: ${primaryColor}; stroke: ${secondaryColor}; stroke-width: 4; pointer-events: none; }
        #typography-${uniqueId} .sb-f { fill: ${secondaryColor}; pointer-events: none; }
        #typography-${uniqueId} .sb-label {
          display: inline-block; white-space: nowrap !important; line-height: 1;
          font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: 500; letter-spacing: 0.02em;
          color: ${primaryColor}; fill: ${primaryColor}; text-transform: uppercase; will-change: transform;
          animation: sb-label-${uniqueId} ${duration}ms infinite ${ease}; animation-play-state: running;
        }`;
  const body = `
      <rect class="motion-click-boundary" x="0" y="0" width="${width}" height="${height}" rx="12" ry="12" fill="rgba(8, 10, 16, 0.55)" pointer-events="all" />
      <g transform="translate(${ox} ${oy}) scale(${S})">
        <!-- white pill (612x82, r18) grows from its centre, sits behind the badge -->
        <rect class="sb-pill" x="29" y="-31" width="612" height="82" rx="18" ry="18" />
        <!-- badge: 184px rounded square rotated 45deg, with the "f" kept upright -->
        <g class="sb-move"><g class="sb-pop">
          <rect class="sb-badge" x="-92" y="-92" width="184" height="184" rx="44" ry="44" transform="rotate(45)" />
          <path class="sb-f" transform="translate(-60 -62) scale(5.2)" d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.4v3.2h2.8V21h3.2z" />
        </g></g>
      </g>
      <!-- label clipped to the pill window -->
      <foreignObject x="${ox + 29 * S}" y="${oy - 31 * S}" width="${612 * S}" height="${82 * S}" style="pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-start; padding-left: 44px; box-sizing: border-box; overflow: hidden; pointer-events: none;">
          <span class="motion-text-content sb-label">${text}</span>
        </div>
      </foreignObject>`;
  return buildMotionGroup({ uniqueId, template: 'social-badge', text, primaryColor, secondaryColor, fontSize, fontFamily, isTranslate, css, body });
};

// --------------------------------------------------------------------------
// Universal Motion Graphic Dispatcher
// --------------------------------------------------------------------------
export const createMotionGraphicSvg = ({
  template = 'cyber-frame',
  uniqueId = Date.now(),
  text = 'ANIMATION',
  subText = '',
  primaryColor = '#FF0033',
  secondaryColor = '#FFFFFF',
  glowIntensity = 6,
  fontSize = 18,
  fontFamily = 'Roboto, sans-serif',
  duration = 4700,
  isTranslate = false
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
        isTranslate
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
      return createSocialBadgeSvg({ uniqueId, text: text === 'ANIMATION' ? 'FACEBOOK' : text, primaryColor: primaryColor === '#FF0033' ? '#0E34A8' : primaryColor, secondaryColor, fontSize, fontFamily, duration, isTranslate });
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
    'swap-bar': [300, 60],
    'bar-sweep': [250, 68],
    'square-open': [150, 110],
    'social-badge': [250, 90]
  };
  const [estWidth, estHeight] = TEMPLATE_SIZES[preset.template] || [200, 56];
  const posX = Math.round(cx - estWidth / 2);
  const posY = Math.round(cy - estHeight / 2);

  g.setAttribute('transform', `translate(${posX}, ${posY})`);
  g.setAttribute('data-name', 'Typography');
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
  const textColor1 =
    el.getAttribute('data-text-color-1') ||
    el.getAttribute('data-primary-text-color') ||
    el.getAttribute('data-primary-color') ||
    '#0f291e';

  const textColor2 =
    el.getAttribute('data-text-color-2') ||
    el.getAttribute('data-secondary-text-color') ||
    el.getAttribute('data-secondary-color') ||
    '#0f291e';

  const strokeColor =
    el.getAttribute('data-stroke-color') ||
    el.getAttribute('data-object-1-color') ||
    el.getAttribute('data-primary-color') ||
    '#00E5FF';

  const backgroundColor =
    el.getAttribute('data-bg-color') ||
    el.getAttribute('data-object-3-color') ||
    'rgba(8, 10, 16, 0.65)';

  const object1Color = textColor1;
  const object2Color = textColor2;
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
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.textContent = updates.primaryText;
    });
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
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.color = val;
      sp.style.fill = val;
    });
  }

  if (updates.strokeColor !== undefined) {
    el.setAttribute('data-stroke-color', updates.strokeColor);
    const strokeEls = el.querySelectorAll('.box-accent-frame, .cyber-glow-stroke, .cyber-inner-stroke, .flipi-slash-accent');
    strokeEls.forEach((node) => {
      node.setAttribute('stroke', updates.strokeColor);
      node.style.stroke = updates.strokeColor;
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
    const obj1 = el.querySelectorAll('.box-accent-frame, .cyber-glow-stroke, .flipi-slash-accent, .yt-logo-box rect');
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
    const obj2 = el.querySelectorAll('.cyber-inner-stroke, .yt-logo-box polygon');
    obj2.forEach((node) => {
      if (node.tagName.toLowerCase() === 'polygon') {
        node.setAttribute('fill', updates.object2Color);
      } else {
        node.setAttribute('stroke', updates.object2Color);
      }
    });
  }

  if (updates.object3Color !== undefined) {
    el.setAttribute('data-object-3-color', updates.object3Color);
    const obj3 = el.querySelectorAll('.motion-click-boundary');
    obj3.forEach((node) => {
      node.setAttribute('fill', updates.object3Color);
    });
  }

  if (updates.primaryFontSize !== undefined) {
    el.setAttribute('data-font-size', String(updates.primaryFontSize));
    const primarySpans = el.querySelectorAll('.motion-text-content, .flipi-text-a, .box-title-a, .yt-title-text, .cyber-text');
    primarySpans.forEach((sp) => {
      sp.style.fontSize = `${updates.primaryFontSize}px`;
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
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.fontSize = `${updates.secondaryFontSize}px`;
    });
  }

  if (updates.secondaryFontFamily !== undefined) {
    el.setAttribute('data-secondary-font-family', updates.secondaryFontFamily);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.fontFamily = `'${updates.secondaryFontFamily}', sans-serif`;
    });
  }

  if (updates.secondaryFontWeight !== undefined) {
    el.setAttribute('data-secondary-font-weight', updates.secondaryFontWeight);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.fontWeight = updates.secondaryFontWeight.toLowerCase().includes('bold') ? '700' : '400';
    });
  }

  if (updates.secondaryTextAlign !== undefined) {
    el.setAttribute('data-secondary-text-align', updates.secondaryTextAlign);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.textAlign = updates.secondaryTextAlign;
    });
  }

  if (updates.secondaryLetterSpacing !== undefined) {
    el.setAttribute('data-secondary-letter-spacing', updates.secondaryLetterSpacing);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.letterSpacing = updates.secondaryLetterSpacing === 'Auto' ? 'normal' : updates.secondaryLetterSpacing;
    });
  }

  if (updates.secondaryLineHeight !== undefined) {
    el.setAttribute('data-secondary-line-height', updates.secondaryLineHeight);
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.lineHeight = updates.secondaryLineHeight === 'Auto' ? 'normal' : updates.secondaryLineHeight;
    });
  }

  if (updates.secondaryIsBold !== undefined) {
    el.setAttribute('data-secondary-is-bold', String(updates.secondaryIsBold));
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.fontWeight = updates.secondaryIsBold ? '700' : '400';
    });
  }

  if (updates.secondaryIsStrikethrough !== undefined) {
    el.setAttribute('data-secondary-is-strikethrough', String(updates.secondaryIsStrikethrough));
    const secSpans = el.querySelectorAll('.motion-text-subcontent, .flipi-text-b, .box-title-b');
    secSpans.forEach((sp) => {
      sp.style.textDecoration = updates.secondaryIsStrikethrough ? 'line-through' : 'none';
    });
  }
};