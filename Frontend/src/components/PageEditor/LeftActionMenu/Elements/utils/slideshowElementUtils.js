/**
 * slideshowElementUtils.js
 * Isolated utilities for Slideshow Elements in FlipiBook
 */

const defaultSampleImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80', name: 'Slide 1', heading: '', subtext: '' },
  { id: 2, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', name: 'Slide 2', heading: '', subtext: '' },
  { id: 3, url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', name: 'Slide 3', heading: '', subtext: '' }
];

const defaultSlideshowSettings = {
  autoPlay: true,
  speed: 3,
  infiniteLoop: true,
  showArrows: true,
  showDots: true,
  imageFitType: 'Fill All',
  transitionEffect: 'Linear',
  dragToSlide: false,
  dotColor: '#4F46E5',
  dotOpacity: 100,
  dotStyle: 1,
  dotButtonSize: 100,
  navIconColor: '#4F46E5',
  navIconOpacity: 100,
  navStyle: 1,
  navButtonSize: 100,
  autoSlide: true,
  bgColor: '#000000',
  bgOpacity: 100,
  strokeColor: '#9ca3af',
  strokeOpacity: 100,
  strokeAlignment: 'Center',
  strokeWidth: 1,
  strokeLineStyle: 'Solid',
  strokeDashLength: 8,
  strokeDashGap: 4,
  strokeLineCorner: 'Rounded',
};

export const escapeXml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const isElementSlideshow = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'slideshow' ||
    el.getAttribute('data-is-slideshow') === 'true' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('slideshow-'))
  );
};

export const get3DCoverflowSvg = (uniqueId = Date.now(), transformAttr = '') => {
  const dataJson = escapeXml(JSON.stringify({ settings: defaultSlideshowSettings, images: defaultSampleImages }));
  const img0 = escapeXml(defaultSampleImages[0].url);
  const img1 = escapeXml(defaultSampleImages[1].url);
  const img2 = escapeXml(defaultSampleImages[2].url);

  return `
    <g id="slideshow-${uniqueId}" data-type="slideshow" data-is-slideshow="true" data-active-index="0" data-slideshow="${dataJson}" cursor="pointer" ${transformAttr}>
      <defs>
        <pattern id="slideshow-pattern-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(40, 0)" width="130" height="140" viewBox="0 0 130 140">
          <image href="${img0}" xlink:href="${img0}" x="0" y="0" width="130" height="140" preserveAspectRatio="xMidYMid slice" />
          <g class="overlay-text-group"></g>
        </pattern>
        <pattern id="slideshow-pattern-center-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(40, 0)" width="130" height="140" viewBox="0 0 130 140">
          <image href="${img0}" xlink:href="${img0}" x="0" y="0" width="130" height="140" preserveAspectRatio="xMidYMid slice" />
          <g class="overlay-text-group"></g>
        </pattern>
        <pattern id="slideshow-pattern-left-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(0, 8)" width="80" height="124">
          <image href="${img2}" xlink:href="${img2}" x="0" y="0" width="80" height="124" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-right-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(120, 8)" width="110" height="124">
          <image href="${img1}" xlink:href="${img1}" x="0" y="0" width="110" height="124" preserveAspectRatio="xMidYMid slice" />
        </pattern>
      </defs>
      <rect class="slideshow-container-bg" x="-5" y="-5" width="220" height="150" rx="12" fill="transparent" />
      <rect x="0" y="8" width="80" height="124" rx="10" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-left-${uniqueId})" style="transform: perspective(400px) rotateY(25deg); transform-origin: 100% 50%; transform-box: fill-box; transition: all 0.3s ease;"/>
      <rect x="120" y="8" width="110" height="124" rx="10" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-right-${uniqueId})" style="transform: perspective(400px) rotateY(-22deg); transform-origin: 0% 50%; transform-box: fill-box; transition: all 0.3s ease;"/>
      <rect x="40" y="0" width="130" height="140" rx="12" stroke="#9ca3af" stroke-width="2" fill="url(#slideshow-pattern-center-${uniqueId})" style="transform: perspective(400px) rotateY(0deg); transform-origin: 50% 50%; transform-box: fill-box; transition: all 0.3s ease;"/>
      <rect class="bbox-anchor" x="-5" y="-5" width="220" height="150" fill="transparent" />
    </g>
  `.trim();
};

export const getFlatGallerySvg = (uniqueId = Date.now(), transformAttr = '') => {
  const dataJson = escapeXml(JSON.stringify({ settings: defaultSlideshowSettings, images: defaultSampleImages }));
  const img0 = escapeXml(defaultSampleImages[0].url);
  const img1 = escapeXml(defaultSampleImages[1].url);
  const img2 = escapeXml(defaultSampleImages[2].url);

  return `
    <g id="slideshow-${uniqueId}" data-type="slideshow" data-is-slideshow="true" data-style="flat" data-active-index="0" data-slideshow="${dataJson}" cursor="pointer" ${transformAttr}>
      <defs>
        <pattern id="slideshow-pattern-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(50, 0)" width="110" height="140" viewBox="0 0 110 140">
          <image href="${img0}" xlink:href="${img0}" x="0" y="0" width="110" height="140" preserveAspectRatio="xMidYMid slice" />
          <g class="overlay-text-group"></g>
        </pattern>
        <pattern id="slideshow-pattern-center-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(50, 0)" width="110" height="140" viewBox="0 0 110 140">
          <image href="${img0}" xlink:href="${img0}" x="0" y="0" width="110" height="140" preserveAspectRatio="xMidYMid slice" />
          <g class="overlay-text-group"></g>
        </pattern>
        <pattern id="slideshow-pattern-left-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(0, 0)" width="46" height="140">
          <image href="${img2}" xlink:href="${img2}" x="0" y="0" width="46" height="140" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-right-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(164, 0)" width="46" height="140">
          <image href="${img1}" xlink:href="${img1}" x="0" y="0" width="46" height="140" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-thumb-0-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(0, 150)" width="34" height="24">
          <image href="${img1}" xlink:href="${img1}" x="0" y="0" width="34" height="24" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-thumb-1-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(44, 150)" width="34" height="24">
          <image href="${img2}" xlink:href="${img2}" x="0" y="0" width="34" height="24" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-thumb-2-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(88, 150)" width="34" height="24">
          <image href="${img0}" xlink:href="${img0}" x="0" y="0" width="34" height="24" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-thumb-3-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(132, 150)" width="34" height="24">
          <image href="${img1}" xlink:href="${img1}" x="0" y="0" width="34" height="24" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id="slideshow-pattern-thumb-4-${uniqueId}" patternUnits="userSpaceOnUse" patternTransform="translate(176, 150)" width="34" height="24">
          <image href="${img2}" xlink:href="${img2}" x="0" y="0" width="34" height="24" preserveAspectRatio="xMidYMid slice" />
        </pattern>
      </defs>
      <rect class="slideshow-container-bg" x="-5" y="-5" width="220" height="200" rx="12" fill="transparent" />
      <rect class="main-frame" x="0" y="0" width="46" height="140" rx="6" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-left-${uniqueId})" style="opacity: 0.5; transition: all 0.3s ease;"/>
      <rect class="main-frame" x="164" y="0" width="46" height="140" rx="6" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-right-${uniqueId})" style="opacity: 0.5; transition: all 0.3s ease;"/>
      <rect class="main-frame" x="50" y="0" width="110" height="140" rx="8" stroke="#9ca3af" stroke-width="2" fill="url(#slideshow-pattern-center-${uniqueId})" style="transition: all 0.3s ease; box-shadow: 0 0 10px rgba(0,0,0,0.5);"/>
      
      <rect class="thumb-frame" x="0" y="150" width="34" height="24" rx="2" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-thumb-0-${uniqueId})" />
      <rect class="thumb-frame" x="44" y="150" width="34" height="24" rx="2" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-thumb-1-${uniqueId})" />
      <rect class="thumb-frame" x="88" y="150" width="34" height="24" rx="2" stroke="#0ea5e9" stroke-width="2" fill="url(#slideshow-pattern-thumb-2-${uniqueId})" />
      <rect class="thumb-frame" x="132" y="150" width="34" height="24" rx="2" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-thumb-3-${uniqueId})" />
      <rect class="thumb-frame" x="176" y="150" width="34" height="24" rx="2" stroke="#9ca3af" stroke-width="1" fill="url(#slideshow-pattern-thumb-4-${uniqueId})" />
      <rect class="bbox-anchor" x="-5" y="-5" width="220" height="200" fill="transparent" />
    </g>
  `.trim();
};

export function createSlideshowElementNode(styleId = 'coverflow', cx = 200, cy = 150) {
  const uniqueId = Date.now();
  const svgString = styleId === 'flat' ? getFlatGallerySvg(uniqueId) : get3DCoverflowSvg(uniqueId);
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgString}</svg>`, 'image/svg+xml');
  const el = doc.querySelector(`g#slideshow-${uniqueId}`) || doc.firstElementChild?.firstElementChild;
  if (el) {
    el.setAttribute('transform', `translate(${Math.round(cx - 110)}, ${Math.round(cy - 75)})`);
    el.setAttribute('data-name', 'Slideshow');
    el.setAttribute('data-slideshow-title', styleId === 'flat' ? 'Flat Gallery' : '3D Coverflow');
    el.setAttribute('data-type', 'slideshow');
    el.setAttribute('data-is-slideshow', 'true');
    return document.importNode(el, true);
  }
  return null;
}


export const update3FrameSlideshow = (el, images = [], activeIdx = 0, settings = {}) => {
  if (!el) return;
  const uniqueId = el.id.replace('slideshow-', '') || Date.now();
  let defs = el.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    el.insertBefore(defs, el.firstChild);
  }

  const len = images.length;
  let leftIndex = -1, centerIndex = -1, rightIndex = -1;
  if (len > 0) {
    centerIndex = activeIdx % len;
    if (len >= 2) rightIndex = (activeIdx + 1) % len;
    if (len >= 3) leftIndex = (activeIdx - 1 + len) % len;
  }

  const rects = el.querySelectorAll('rect:not([fill="transparent"]):not(.bbox-anchor):not(.slideshow-container-bg)');
  const leftRect = rects[0];
  const rightRect = rects[1];
  const centerRect = rects[2];

  const slideStyle = el.getAttribute('data-style');
  if (slideStyle === 'flat') {
    if (centerRect) {
      centerRect.setAttribute('x', '50');
      centerRect.setAttribute('y', '0');
      centerRect.setAttribute('width', '110');
      centerRect.setAttribute('height', '140');
      centerRect.setAttribute('style', 'transition: all 0.3s ease; box-shadow: 0 0 10px rgba(0,0,0,0.5);');
    }
    if (leftRect) {
      leftRect.setAttribute('x', '0');
      leftRect.setAttribute('y', '0');
      leftRect.setAttribute('width', '46');
      leftRect.setAttribute('height', '140');
      leftRect.setAttribute('style', 'opacity: 0.5; transition: all 0.3s ease;');
    }
    if (rightRect) {
      rightRect.setAttribute('x', '164');
      rightRect.setAttribute('y', '0');
      rightRect.setAttribute('width', '46');
      rightRect.setAttribute('height', '140');
      rightRect.setAttribute('style', 'opacity: 0.5; transition: all 0.3s ease;');
    }
  } else {
    // 3D Coverflow
    if (centerRect) {
      centerRect.setAttribute('x', '40');
      centerRect.setAttribute('y', '0');
      centerRect.setAttribute('width', '130');
      centerRect.setAttribute('height', '140');
      centerRect.setAttribute('style', 'transform: perspective(400px) rotateY(0deg); transform-origin: 50% 50%; transform-box: fill-box; transition: all 0.3s ease;');
    }
    if (leftRect) {
      leftRect.setAttribute('x', '0');
      leftRect.setAttribute('y', '8');
      leftRect.setAttribute('width', '80');
      leftRect.setAttribute('height', '124');
      leftRect.setAttribute('style', 'transform: perspective(400px) rotateY(25deg); transform-origin: 100% 50%; transform-box: fill-box; transition: all 0.3s ease;');
    }
    if (rightRect) {
      rightRect.setAttribute('x', '120');
      rightRect.setAttribute('y', '8');
      rightRect.setAttribute('width', '110');
      rightRect.setAttribute('height', '124');
      rightRect.setAttribute('style', 'transform: perspective(400px) rotateY(-22deg); transform-origin: 0% 50%; transform-box: fill-box; transition: all 0.3s ease;');
    }
  }

  let bboxAnchor = el.querySelector('.bbox-anchor');
  if (!bboxAnchor) {
    bboxAnchor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bboxAnchor.setAttribute('class', 'bbox-anchor');
    bboxAnchor.setAttribute('fill', 'transparent');
    el.appendChild(bboxAnchor);
  }
  const pad = 5;
  const baseW = slideStyle === 'flat' ? 210 : 210;
  const baseH = slideStyle === 'flat' ? 190 : 140;

  bboxAnchor.setAttribute('x', (-pad).toString());
  bboxAnchor.setAttribute('y', (-pad).toString());
  bboxAnchor.setAttribute('width', (baseW + pad * 2).toString());
  bboxAnchor.setAttribute('height', (baseH + pad * 2).toString());

  // Apply Container Background behind all frames and controls
  let containerBg = el.querySelector('.slideshow-container-bg');
  if (!containerBg) {
    containerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    containerBg.setAttribute('class', 'slideshow-container-bg');
    if (defs && defs.nextSibling) {
      el.insertBefore(containerBg, defs.nextSibling);
    } else {
      el.insertBefore(containerBg, el.firstChild);
    }
  } else {
    if (defs && defs.nextSibling && defs.nextSibling !== containerBg) {
      el.insertBefore(containerBg, defs.nextSibling);
    }
  }

  const sColor = settings.strokeColor || '#9ca3af';
  const sWidth = settings.strokeWidth !== undefined ? settings.strokeWidth : 1;
  const sOpacity = (settings.strokeOpacity !== undefined ? settings.strokeOpacity : 100) / 100;
  let sDash = 'none';
  if (settings.strokeLineStyle === 'Dotted') {
    sDash = '2,3';
  } else if (settings.strokeLineStyle === 'Dashed') {
    sDash = `${settings.strokeDashLength || 8},${settings.strokeDashGap || 4}`;
  }
  const sCap = settings.strokeLineCorner === 'Rounded' ? 'round' : 'square';
  const sJoin = settings.strokeLineCorner === 'Rounded' ? 'round' : 'miter';
  const sAlign = settings.strokeAlignment || 'Center';
  let alignOffset = 0;
  if (sAlign === 'Inside') alignOffset = sWidth / 2;
  else if (sAlign === 'Outside') alignOffset = -sWidth / 2;

  containerBg.setAttribute('x', (-pad + alignOffset).toString());
  containerBg.setAttribute('y', (-pad + alignOffset).toString());
  containerBg.setAttribute('width', (baseW + pad * 2 - alignOffset * 2).toString());
  containerBg.setAttribute('height', (baseH + pad * 2 - alignOffset * 2).toString());

  const bgCornerRadius = settings.strokeLineCorner === 'Square' ? 0 : 12;
  containerBg.setAttribute('rx', bgCornerRadius.toString());
  containerBg.setAttribute('ry', bgCornerRadius.toString());

  const bgColor = settings.bgColor || '#000000';
  const bgOpacity = (settings.bgOpacity !== undefined ? settings.bgOpacity : 100) / 100;

  if (bgColor === 'transparent' || bgColor === 'none' || bgOpacity === 0) {
    containerBg.setAttribute('fill', 'none');
    containerBg.setAttribute('fill-opacity', '0');
    containerBg.style.fill = 'none';
    containerBg.style.fillOpacity = '0';
  } else {
    containerBg.setAttribute('fill', bgColor);
    containerBg.setAttribute('fill-opacity', bgOpacity.toString());
    containerBg.style.fill = bgColor;
    containerBg.style.fillOpacity = bgOpacity.toString();
  }

  // Stroke / styling on container frame and cards
  [containerBg, centerRect, leftRect, rightRect].forEach(r => {
    if (r) {
      if (sColor === 'transparent' || sColor === 'none' || sWidth === 0 || sOpacity === 0) {
        r.setAttribute('stroke', 'none');
        r.setAttribute('stroke-width', '0');
      } else {
        r.setAttribute('stroke', sColor);
        r.setAttribute('stroke-width', sWidth.toString());
        r.setAttribute('stroke-opacity', sOpacity.toString());
        if (sDash !== 'none') r.setAttribute('stroke-dasharray', sDash);
        else r.removeAttribute('stroke-dasharray');
        r.setAttribute('stroke-linecap', sCap);
        r.setAttribute('stroke-linejoin', sJoin);
      }
    }
  });

  const applyFrameImage = (rect, imgIdx, prefix) => {
    if (!rect) return;
    const imgObj = imgIdx >= 0 ? images[imgIdx] : null;
    const url = imgObj?.url || (typeof imgObj === 'string' ? imgObj : null);

    if (!url) {
      if (prefix === 'center' && len === 0) {
        rect.setAttribute('fill', `url(#slideshow-pattern-${uniqueId})`);
      } else {
        rect.setAttribute('fill', prefix === 'center' ? '#ffffff' : '#f3f4f6');
      }
      return;
    }

    const patternId = `slideshow-pattern-${prefix}-${uniqueId}`;
    let pattern = defs.querySelector(`#${patternId}`);
    if (!pattern) {
      pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      pattern.setAttribute('id', patternId);
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      const imgNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      imgNode.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      imgNode.setAttribute('x', '0');
      imgNode.setAttribute('y', '0');
      pattern.appendChild(imgNode);
      const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      textGroup.setAttribute('class', 'overlay-text-group');
      pattern.appendChild(textGroup);
      defs.appendChild(pattern);
    }

    const pWidth = rect.getAttribute('width') || '130';
    const pHeight = rect.getAttribute('height') || '140';
    pattern.setAttribute('width', pWidth);
    pattern.setAttribute('height', pHeight);
    pattern.setAttribute('viewBox', `0 0 ${pWidth} ${pHeight}`);

    const imgNode = pattern.querySelector('image');
    if (imgNode) {
      imgNode.setAttribute('href', url);
      try { imgNode.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url); } catch (e) {}
      imgNode.setAttribute('width', pWidth);
      imgNode.setAttribute('height', pHeight);
    }

    // Text overlay if present
    const textGroup = pattern.querySelector('.overlay-text-group');
    if (textGroup) {
      textGroup.innerHTML = '';
      if (prefix === 'center' && imgObj) {
        const fFam = imgObj.fontFamily || 'Arial';
        const fSize = imgObj.fontSize || 16;
        const pW = parseFloat(pWidth) || 130;
        const pH = parseFloat(pHeight) || 140;
        const centerX = pW / 2;
        const centerY = pH / 2;
        const hasHeading = Boolean(imgObj.heading);
        const hasSubtext = Boolean(imgObj.subtext);

        if (hasHeading) {
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', centerX.toString());
          t.setAttribute('y', (hasSubtext ? centerY - 10 : centerY).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('dominant-baseline', 'central');
          t.setAttribute('fill', 'white');
          t.setAttribute('font-size', `${fSize}px`);
          t.setAttribute('font-family', `'${fFam}', sans-serif`);
          t.setAttribute('font-weight', 'bold');
          t.setAttribute('style', 'text-shadow: 1px 1px 2px rgba(0,0,0,0.8); pointer-events: none;');
          t.textContent = imgObj.heading;
          textGroup.appendChild(t);
        }
        if (hasSubtext) {
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', centerX.toString());
          t.setAttribute('y', (hasHeading ? centerY + 14 : centerY).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('dominant-baseline', 'central');
          t.setAttribute('fill', 'white');
          t.setAttribute('font-size', `${Math.max(8, fSize * 0.6)}px`);
          t.setAttribute('font-family', `'${fFam}', sans-serif`);
          t.setAttribute('style', 'text-shadow: 1px 1px 2px rgba(0,0,0,0.8); pointer-events: none;');
          t.textContent = imgObj.subtext;
          textGroup.appendChild(t);
        }
      }
    }

    pattern.setAttribute('patternTransform', `translate(${rect.getAttribute('x') || 0}, ${rect.getAttribute('y') || 0})`);
    rect.setAttribute('fill', `url(#${patternId})`);
    rect.style.fill = `url(#${patternId})`;
  };

  applyFrameImage(leftRect, leftIndex, 'left');
  applyFrameImage(rightRect, rightIndex, 'right');
  applyFrameImage(centerRect, centerIndex, 'center');

  // Also point placeholder pattern to current center image so it NEVER renders "Slideshow" placeholder
  const placeholderPattern = defs.querySelector(`#slideshow-pattern-${uniqueId}`);
  if (placeholderPattern && centerIndex >= 0) {
    const phImg = placeholderPattern.querySelector('image');
    const centerUrl = images[centerIndex]?.url || (typeof images[centerIndex] === 'string' ? images[centerIndex] : null);
    if (phImg && centerUrl) {
      phImg.setAttribute('href', centerUrl);
      try { phImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', centerUrl); } catch (e) {}
    }
    const phText = placeholderPattern.querySelector('.overlay-text-group');
    if (phText) {
      phText.innerHTML = '';
    }
  }

  el.setAttribute('data-active-index', activeIdx.toString());
};

/**
 * Global Slideshow UI, Runner, and Click Manager hooks.
 * Completely orchestrates slideshow lifecycle on canvas.
 */
