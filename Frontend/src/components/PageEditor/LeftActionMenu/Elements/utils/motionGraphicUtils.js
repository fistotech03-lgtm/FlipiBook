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
  fontSize = 17,
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
          pointer-events: none;
        }

        #typography-${uniqueId} .cyber-inner-stroke {
          animation: cyber-trim-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          pointer-events: none;
        }

        #typography-${uniqueId} .cyber-text {
          animation: cyber-text-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
          font-family: '${fontFamily.replace(/"/g, '')}', sans-serif;
          font-size: ${fontSize}px;
          font-weight: 700;
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
          pointer-events: none;
        }

        #typography-${uniqueId} .flipi-text-a {
          display: inline-block;
          animation: flipi-text-top-${uniqueId} ${duration}ms infinite cubic-bezier(0.16, 1, 0.3, 1);
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
          pointer-events: none;
        }

        #typography-${uniqueId} .box-title-a {
          display: inline-block;
          animation: box-slide-down-${uniqueId} ${duration}ms infinite cubic-bezier(0.833, 0.833, 0.167, 0.167);
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

  const estWidth = preset.template === 'flipi-split' ? 230 : (preset.template === 'youtube-channel' ? 220 : 200);
  const estHeight = preset.template === 'flipi-split' ? 66 : 56;
  const posX = Math.round(cx - estWidth / 2);
  const posY = Math.round(cy - estHeight / 2);

  g.setAttribute('transform', `translate(${posX}, ${posY})`);
  g.setAttribute('data-name', 'Typography');
  g.setAttribute('data-preset-title', preset.name || 'Motion Graphic');

  return document.importNode(g, true);
};
