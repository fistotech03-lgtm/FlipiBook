export const initAnimationRunner = function(doc) {
  // Re-initialization is allowed as doc.write wipes the body but doc object might persist
  doc.__animationRunnerInitialized = true;  const WAAPI_ANIMATIONS = {
    'none': [],
    'fade-in': [{ opacity: 0 }, { opacity: 1 }],
    'fade-out': [{ opacity: 1 }, { opacity: 0 }],
    'blur-in': [{ filter: 'blur(20px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 }],
    'focus-in': [{ filter: 'blur(12px)', opacity: 0, scale: '1.2' }, { filter: 'blur(0)', opacity: 1, scale: '1' }],
    'glass-reveal': [{ opacity: 0, backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)' }, { opacity: 1, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' }],
    'perspective-in': [{ transform: 'perspective(400px) rotateX(-60deg) translateZ(-500px)', opacity: 0 }, { transform: 'perspective(400px) rotateX(0deg) translateZ(0)', opacity: 1 }],
    'slide-up': [{ translate: '0 100px', opacity: 0 }, { translate: '0 0', opacity: 1 }],
    'slide-down': [{ translate: '0 -100px', opacity: 0 }, { translate: '0 0', opacity: 1 }],
    'slide-left': [{ translate: '100px 0', opacity: 0 }, { translate: '0 0', opacity: 1 }],
    'slide-right': [{ translate: '-100px 0', opacity: 0 }, { translate: '0 0', opacity: 1 }],
    'back-in-up': [{ translate: '0 500px', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
    'back-in-down': [{ translate: '0 -500px', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
    'back-in-left': [{ translate: '-500px 0', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
    'back-in-right': [{ translate: '500px 0', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
    'zoom-in': [{ scale: '0', opacity: 0 }, { scale: '1', opacity: 1 }],
    'zoom-out': [{ scale: '1', opacity: 1 }, { scale: '0', opacity: 0 }],
    'zoom-in-up': [{ scale: '0.1', translate: '0 100px', opacity: 0 }, { scale: '1', translate: '0 0', opacity: 1 }],
    'zoom-in-down': [{ scale: '0.1', translate: '0 -100px', opacity: 0 }, { scale: '1', translate: '0 0', opacity: 1 }],
    'rotate-in': [{ rotate: '-200deg', scale: '0', opacity: 0 }, { rotate: '0deg', scale: '1', opacity: 1 }],
    'rotate-in-down-left': [{ rotate: '-45deg', transformOrigin: 'left bottom', opacity: 0 }, { rotate: '0deg', transformOrigin: 'left bottom', opacity: 1 }],
    'rotate-in-up-right': [{ rotate: '-90deg', transformOrigin: 'right bottom', opacity: 0 }, { rotate: '0deg', transformOrigin: 'right bottom', opacity: 1 }],
    'bounce-in': [{ scale: '0.3', opacity: 0 }, { scale: '1.1', opacity: 0.8, offset: 0.5 }, { scale: '0.9', opacity: 1, offset: 0.7 }, { scale: '1', opacity: 1 }],
    'bounce-out': [{ scale: '1', opacity: 1 }, { scale: '1.1', opacity: 0.8, offset: 0.2 }, { scale: '0.3', opacity: 0, offset: 1 }],
    'flip-in': [{ transform: 'perspective(400px) rotateX(90deg)', opacity: 0 }, { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 }],
    'flip-in-y': [{ transform: 'perspective(400px) rotateY(90deg)', opacity: 0 }, { transform: 'perspective(400px) rotateY(0deg)', opacity: 1 }],
    'roll-in': [{ translate: '-100px 0', rotate: '-120deg', opacity: 0 }, { translate: '0 0', rotate: '0deg', opacity: 1 }],
    'pulse': [{ scale: '1' }, { scale: '1.1', offset: 0.5 }, { scale: '1' }],
    'heartbeat': [{ scale: '1' }, { scale: '1.3', offset: 0.14 }, { scale: '1', offset: 0.28 }, { scale: '1.3', offset: 0.42 }, { scale: '1', offset: 0.7 }],
    'float': [{ translate: '0 0' }, { translate: '0 -15px', offset: 0.5 }, { translate: '0 0' }],
    'neon-glow': [{ filter: 'brightness(1) drop-shadow(0 0 0px rgba(79, 70, 229, 0))' }, { filter: 'brightness(1.5) drop-shadow(0 0 10px rgba(79, 70, 229, 0.8))', offset: 0.5 }, { filter: 'brightness(1) drop-shadow(0 0 0px rgba(79, 70, 229, 0))' }],
    'tada': [{ scale: '1', rotate: '0deg' }, { scale: '0.9', rotate: '-3deg', offset: 0.1 }, { scale: '0.9', rotate: '-3deg', offset: 0.2 }, { scale: '1.1', rotate: '3deg', offset: 0.3 }, { scale: '1.1', rotate: '-3deg', offset: 0.4 }, { scale: '1.1', rotate: '3deg', offset: 0.5 }, { scale: '1.1', rotate: '-3deg', offset: 0.6 }, { scale: '1.1', rotate: '3deg', offset: 0.7 }, { scale: '1.1', rotate: '-3deg', offset: 0.8 }, { scale: '1.1', rotate: '3deg', offset: 0.9 }, { scale: '1', rotate: '0deg' }],
    'rubber-band': [{ scale: '1 1' }, { scale: '1.25 0.75', offset: 0.3 }, { scale: '0.75 1.25', offset: 0.4 }, { scale: '1.15 0.85', offset: 0.5 }, { scale: '0.95 1.05', offset: 0.65 }, { scale: '1.05 0.95', offset: 0.75 }, { scale: '1 1' }],
    'jello': [{ transform: 'skew(0,0)' }, { transform: 'skew(-12.5deg, -12.5deg)', offset: 0.22 }, { transform: 'skew(6.25deg, 6.25deg)', offset: 0.33 }, { transform: 'skew(-3.125deg, -3.125deg)', offset: 0.44 }, { transform: 'skew(1.5625deg, 1.5625deg)', offset: 0.55 }, { transform: 'skew(-0.78deg, -0.78deg)', offset: 0.66 }, { transform: 'skew(0.39deg, 0.39deg)', offset: 0.77 }, { transform: 'skew(-0.2deg, -0.2deg)', offset: 0.88 }, { transform: 'skew(0,0)' }],
    'swing': [{ rotate: '0deg' }, { rotate: '15deg', offset: 0.2 }, { rotate: '-10deg', offset: 0.4 }, { rotate: '5deg', offset: 0.6 }, { rotate: '-5deg', offset: 0.8 }, { rotate: '0deg' }],
    'wobble': [{ translate: '0 0', rotate: '0deg' }, { translate: '-25% 0', rotate: '-5deg', offset: 0.15 }, { translate: '20% 0', rotate: '3deg', offset: 0.3 }, { translate: '-15% 0', rotate: '-3deg', offset: 0.45 }, { translate: '10% 0', rotate: '2deg', offset: 0.6 }, { translate: '-5% 0', rotate: '-1deg', offset: 0.75 }, { translate: '0 0', rotate: '0deg' }],
    'glitch': [{ translate: '0' }, { translate: '-2px 2px', offset: 0.2 }, { translate: '2px -2px', offset: 0.4 }, { translate: '-2px 2px', offset: 0.6 }, { translate: '2px -2px', offset: 0.8 }, { translate: '0' }],
  };

  const LOOP_ANIMATIONS = ['pulse', 'tada', 'rubber-band', 'jello', 'heartbeat', 'glitch', 'neon-glow', 'swing', 'wobble', 'float'];

  const getWaapiEase = (name) => {
    const map = {
      'Linear': 'linear',
      'Smooth': 'ease-in-out',
      'Ease In': 'ease-in',
      'Ease Out': 'ease-out',
      'Ease In & Out': 'ease-in-out',
      'Bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };
    return map[name] || 'linear';
  };

  const runAnim = (el, type, settings) => {
    if (!type || !WAAPI_ANIMATIONS[type] || type === 'none') {
        if (el.__currentAnimation) {
            el.__currentAnimation.cancel();
            el.__currentAnimation = null;
        }
        return;
    }
    
    if (el.__currentAnimation) {
      el.__currentAnimation.cancel();
    }

    const duration = ((parseFloat(settings?.duration || 1)) / (parseFloat(settings?.speed || 1))) * 1000;
    const delay = (parseFloat(settings?.delay || 0)) * 1000;
    const easing = getWaapiEase(settings?.easing || 'Linear');
    let iterations = 1;
    let isLoop = LOOP_ANIMATIONS.includes(type) || settings?.isAlways;

    if (isLoop) {
        iterations = Infinity;
    } else if (settings?.repeat) {
        if (settings.repeat === 'Infinite') {
            iterations = Infinity;
            isLoop = true;
        }
        else if (settings.repeat === 'Once') iterations = 1;
        else if (settings.repeat === 'Twice') iterations = 2;
        else if (settings.repeat === 'Thrice') iterations = 3;
        else if (settings.repeat === 'None') iterations = 1;
        else {
            const parsed = parseInt(settings.repeat);
            if (!isNaN(parsed) && parsed > 0) iterations = parsed;
        }
    }

    try {
      let cx = 0, cy = 0;
      let useMathOrigin = false;
      let cachedBBox = { x: 0, y: 0, width: 0, height: 0 };
      const isSVG = el.namespaceURI === 'http://www.w3.org/2000/svg' || el.ownerSVGElement !== undefined;
      if (isSVG) {
          try {
              cachedBBox = el.getBBox();
              cx = cachedBBox.x + cachedBBox.width / 2;
              cy = cachedBBox.y + cachedBBox.height / 2;
              useMathOrigin = true;
              el.style.transformOrigin = '0 0';
          } catch(e) {
              el.style.transformBox = 'fill-box';
              el.style.transformOrigin = 'center';
          }
      }
      if (el.__originalTransform === undefined) {
          let baseTransform = window.getComputedStyle(el).transform;
          if (!baseTransform || baseTransform === 'none') {
              const transformAttr = el.getAttribute('transform');
              if (transformAttr) {
                  try {
                      const dummy = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                      dummy.setAttribute('transform', transformAttr);
                      if (dummy.transform.baseVal) {
                          dummy.transform.baseVal.consolidate();
                          if (dummy.transform.baseVal.numberOfItems > 0) {
                              const m = dummy.transform.baseVal.getItem(0).matrix;
                              baseTransform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.e}, ${m.f})`;
                          }
                      }
                  } catch(e) {}
              }
          }
          el.__originalTransform = (!baseTransform || baseTransform === 'none') ? '' : baseTransform;
      }

      const baseTransform = el.__originalTransform;
      const shadowCaster = el.previousElementSibling?.classList?.contains('svg-drop-shadow-caster') ? el.previousElementSibling : null;

      const finalKeyframes = WAAPI_ANIMATIONS[type].map(kf => {
          const newKf = { ...kf };
          let transformParts = [];
          if (newKf.translate) { transformParts.push(`translate(${String(newKf.translate).split(' ').join(',')})`); delete newKf.translate; }
          if (newKf.rotate) { const r = String(newKf.rotate).trim(); transformParts.push(`rotate(${r === '0' ? '0deg' : r})`); delete newKf.rotate; }
          if (newKf.scale !== undefined) { transformParts.push(`scale(${String(newKf.scale).split(' ').join(',')})`); delete newKf.scale; }
          if (newKf.skew) { const parts = String(newKf.skew).split(',').map(p => p.trim() === '0' ? '0deg' : p.trim()); transformParts.push(`skew(${parts.join(',')})`); delete newKf.skew; }
          
          let combinedKfTransform = newKf.transform || '';
          if (transformParts.length > 0) { combinedKfTransform = `${combinedKfTransform} ${transformParts.join(' ')}`.trim(); }
          
          if (baseTransform || useMathOrigin) {
              if (combinedKfTransform) {
                  if (useMathOrigin) {
                      let px = cx; let py = cy;
                      if (newKf.transformOrigin) {
                          const origin = newKf.transformOrigin;
                          if (origin.includes('left')) px = cachedBBox.x;
                          if (origin.includes('right')) px = cachedBBox.x + cachedBBox.width;
                          if (origin.includes('top')) py = cachedBBox.y;
                          if (origin.includes('bottom')) py = cachedBBox.y + cachedBBox.height;
                          delete newKf.transformOrigin;
                      }
                      newKf.transform = `${baseTransform} translate(${px}px, ${py}px) ${combinedKfTransform} translate(-${px}px, -${py}px)`;
                  } else {
                      newKf.transform = `${baseTransform} ${combinedKfTransform}`;
                  }
              } else {
                  newKf.transform = baseTransform;
              }
          } else if (combinedKfTransform) {
              newKf.transform = combinedKfTransform;
          }
          return newKf;
      });

      el.setAttribute('data-is-animating', 'true');
      const animSettings = { duration, delay, easing, fill: isLoop ? 'none' : 'forwards', iterations };
      const anim = el.animate(finalKeyframes, animSettings);

      let shadowAnim = null;
      if (shadowCaster) {
          if (shadowCaster.__currentAnimation) {
              try { shadowCaster.__currentAnimation.cancel(); } catch(err) {}
          }
          shadowCaster.setAttribute('data-is-animating', 'true');
          shadowAnim = shadowCaster.animate(finalKeyframes, animSettings);
      }

      const cleanup = () => {
        el.removeAttribute('data-is-animating');
        if (shadowCaster) shadowCaster.removeAttribute('data-is-animating');
        if (el.__currentAnimation === anim) el.__currentAnimation = null;
        if (shadowCaster && shadowCaster.__currentAnimation === shadowAnim) shadowCaster.__currentAnimation = null;
      };
      anim.onfinish = cleanup;
      anim.oncancel = cleanup;

      el.__currentAnimation = anim;
      if (shadowCaster) shadowCaster.__currentAnimation = shadowAnim;
    } catch (e) {
      console.error("Animation error", e);
    }
  };

  const handleTrigger = () => {
    doc.querySelectorAll('[data-animation-intent="true"]').forEach(el => {
        const trigger = el.getAttribute('data-animation-trigger');
        
        // 1. While Opening
        if (trigger === 'While Opening') {
            const type = el.getAttribute('data-animation-open-type');
            if (type && type !== 'none') {
                const everyVisit = el.getAttribute('data-animation-open-every-visit') !== 'false';
                
                if (!everyVisit) {
                    const runKey = `anim_run_${el.id || el.getAttribute('data-name')}`;
                    if (sessionStorage.getItem(runKey)) return;
                    sessionStorage.setItem(runKey, 'true');
                }

                const settingsStr = JSON.stringify({
                   type,
                   duration: el.getAttribute('data-animation-open-duration'),
                   speed: el.getAttribute('data-animation-open-speed'),
                   delay: el.getAttribute('data-animation-open-delay'),
                   easing: el.getAttribute('data-animation-open-easing'),
                   repeat: el.getAttribute('data-animation-open-repeat')
                });

                const hasChanged = el.__lastOpenSettings !== settingsStr;
                if (!everyVisit && el.__animOpened && !hasChanged) return;
                
                runAnim(el, type, {
                  duration: el.getAttribute('data-animation-open-duration'),
                  speed: el.getAttribute('data-animation-open-speed'),
                  delay: el.getAttribute('data-animation-open-delay'),
                  easing: el.getAttribute('data-animation-open-easing'),
                  repeat: el.getAttribute('data-animation-open-repeat')
                });
                
                el.__animOpened = true;
                el.__lastOpenSettings = settingsStr;
            } else {
                runAnim(el, 'none'); // Cleanup
            }
        }
        
        // 2. On Page - Always
        else if (trigger === 'On Page' && el.getAttribute('data-animation-action') === 'Always') {
            const type = el.getAttribute('data-animation-interact-type');
            if (type && type !== 'none') {
                const settingsStr = JSON.stringify({
                  type,
                  duration: el.getAttribute('data-animation-interact-duration'),
                  speed: el.getAttribute('data-animation-interact-speed'),
                  delay: el.getAttribute('data-animation-interact-delay'),
                  easing: el.getAttribute('data-animation-interact-easing'),
                  repeat: el.getAttribute('data-animation-interact-repeat')
                });

                if (el.__lastAlwaysSettings === settingsStr) return;

                runAnim(el, type, {
                  duration: el.getAttribute('data-animation-interact-duration'),
                  speed: el.getAttribute('data-animation-interact-speed'),
                  delay: el.getAttribute('data-animation-interact-delay'),
                  easing: el.getAttribute('data-animation-interact-easing'),
                  repeat: el.getAttribute('data-animation-interact-repeat'),
                  isAlways: true
                });
                el.__lastAlwaysSettings = settingsStr;
            } else {
                runAnim(el, 'none');
                el.__lastAlwaysSettings = null;
            }
        }

        // 3. On Page - Click/Hover
        else if (trigger === 'On Page') {
            const action = el.getAttribute('data-animation-action');
            if (action === 'Click') {
                if (!el.__clickBound) {
                    el.__clickBound = true;
                    el.style.cursor = 'pointer';
                    el.addEventListener('click', (e) => {
                        if (el.getAttribute('data-animation-trigger') !== 'On Page' || el.getAttribute('data-animation-action') !== 'Click') return;
                        if (el.__currentAnimation && el.__currentAnimation.playState === 'running') return;
                        e.stopPropagation();
                        const type = el.getAttribute('data-animation-interact-type');
                        runAnim(el, type, {
                            duration: el.getAttribute('data-animation-interact-duration'),
                            speed: el.getAttribute('data-animation-interact-speed'),
                            delay: el.getAttribute('data-animation-interact-delay'),
                            easing: el.getAttribute('data-animation-interact-easing'),
                            repeat: el.getAttribute('data-animation-interact-repeat')
                        });
                    });
                }
            } else if (action === 'Hover') {
                if (!el.__hoverBound) {
                    el.__hoverBound = true;
                    el.addEventListener('mouseenter', () => {
                        if (el.getAttribute('data-animation-trigger') !== 'On Page' || el.getAttribute('data-animation-action') !== 'Hover') return;
                        if (el.__currentAnimation && el.__currentAnimation.playState === 'running') return;
                        const type = el.getAttribute('data-animation-interact-type');
                        runAnim(el, type, {
                            duration: el.getAttribute('data-animation-interact-duration'),
                            speed: el.getAttribute('data-animation-interact-speed'),
                            delay: el.getAttribute('data-animation-interact-delay'),
                            easing: el.getAttribute('data-animation-interact-easing'),
                            repeat: el.getAttribute('data-animation-interact-repeat')
                        });
                    });
                }
            }
            // If it was "Always" but now it's "Click", Always loop should stop
            if (el.__lastAlwaysSettings) {
                runAnim(el, 'none');
                el.__lastAlwaysSettings = null;
            }
        }
        
        // 4. Default if trigger is unknown or none
        else {
            runAnim(el, 'none');
            el.__lastAlwaysSettings = null;
        }
    });
  };

  const observer = new MutationObserver((mutations) => {
    let shouldTrigger = false;
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.attributeName.startsWith('data-animation-')) {
        shouldTrigger = true;
      }
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        shouldTrigger = true;
      }
    });
    if (shouldTrigger) handleTrigger();
  });

  observer.observe(doc.body, {
    childList: true,
    subtree: true,
    attributes: true
  });

  // Listen for re-trigger messages (for flipbook flips)
  window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'RETRIGGER_ANIMATIONS') {
          // Only reset entrance state if everyVisit is enabled
          doc.querySelectorAll('[data-animation-trigger="While Opening"]').forEach(el => {
              const everyVisit = el.getAttribute('data-animation-open-every-visit') !== 'false';
              if (everyVisit) {
                  el.__animOpened = false;
                  el.__lastOpenSettings = null;
              }
          });
          handleTrigger();
      }
  });

  handleTrigger();
};

const getWebPDuration = (arrayBuffer) => {
  const data = new DataView(arrayBuffer);
  if (data.byteLength < 12) return 0;
  const riff = String.fromCharCode(data.getUint8(0), data.getUint8(1), data.getUint8(2), data.getUint8(3));
  const webp = String.fromCharCode(data.getUint8(8), data.getUint8(9), data.getUint8(10), data.getUint8(11));
  if (riff !== 'RIFF' || webp !== 'WEBP') return 0;

  let offset = 12;
  let totalDuration = 0;
  while (offset < data.byteLength) {
    if (offset + 8 > data.byteLength) break;
    const chunkId = String.fromCharCode(data.getUint8(offset), data.getUint8(offset+1), data.getUint8(offset+2), data.getUint8(offset+3));
    const chunkSize = data.getUint32(offset + 4, true);
    
    if (chunkId === 'ANMF') {
      if (offset + 8 + 15 <= data.byteLength) {
        const durationBytes = [data.getUint8(offset + 8 + 12), data.getUint8(offset + 8 + 13), data.getUint8(offset + 8 + 14)];
        const duration = durationBytes[0] | (durationBytes[1] << 8) | (durationBytes[2] << 16);
        totalDuration += duration;
      }
    }
    offset += 8 + chunkSize + (chunkSize % 2 !== 0 ? 1 : 0);
  }
  return totalDuration;
};

const patchAnimationLoops = (base64Data, maxLoops) => {
  if (base64Data.startsWith('data:image/webp;base64,')) {
    const b64 = base64Data.split(',')[1];
    const binStr = atob(b64);
    const uint8 = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) uint8[i] = binStr.charCodeAt(i);
    
    const data = new DataView(uint8.buffer);
    if (data.byteLength < 12) return base64Data;
    const riff = String.fromCharCode(uint8[0], uint8[1], uint8[2], uint8[3]);
    const webp = String.fromCharCode(uint8[8], uint8[9], uint8[10], uint8[11]);
    if (riff !== 'RIFF' || webp !== 'WEBP') return base64Data;
  
    let offset = 12;
    while (offset < uint8.length) {
      if (offset + 8 > uint8.length) break;
      const chunkId = String.fromCharCode(uint8[offset], uint8[offset+1], uint8[offset+2], uint8[offset+3]);
      const chunkSize = data.getUint32(offset + 4, true);
      
      if (chunkId === 'ANIM' && chunkSize >= 6) {
        const repeats = maxLoops === Infinity ? 0 : Math.max(0, maxLoops);
        uint8[offset + 12] = repeats & 0xFF;
        uint8[offset + 13] = (repeats >> 8) & 0xFF;
        
        let binary = '';
        for (let k = 0; k < uint8.length; k++) binary += String.fromCharCode(uint8[k]);
        return 'data:image/webp;base64,' + btoa(binary);
      }
      offset += 8 + chunkSize + (chunkSize % 2 !== 0 ? 1 : 0);
    }
    return base64Data;
  }

  if (!base64Data.startsWith('data:image/gif;base64,')) return base64Data;
  const b64 = base64Data.split(',')[1];
  const binStr = atob(b64);
  const uint8 = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) uint8[i] = binStr.charCodeAt(i);
  
  const netscape = [0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30]; // "NETSCAPE2.0"
  for (let i = 0; i < uint8.length - 19; i++) {
    let match = true;
    for (let j = 0; j < netscape.length; j++) {
      if (uint8[i + j] !== netscape[j]) { match = false; break; }
    }
    if (match && uint8[i-3] === 0x21 && (uint8[i-2] === 0xFF || uint8[i-2] === 0xFE) && uint8[i-1] === 0x0B) {
      if (uint8[i+11] === 0x03 && uint8[i+12] === 0x01) {
        if (maxLoops === 1) {
          uint8[i-2] = 0xFE; // Convert Application Extension to Comment Extension (browser will ignore loop instruction)
        } else {
          uint8[i-2] = 0xFF; // Restore Application Extension if it was previously patched
          const repeats = maxLoops === Infinity ? 0 : Math.max(0, maxLoops - 1);
          uint8[i+13] = repeats & 0xFF; // LSB
          uint8[i+14] = (repeats >> 8) & 0xFF; // MSB
        }
        
        let binary = '';
        for (let k = 0; k < uint8.byteLength; k++) binary += String.fromCharCode(uint8[k]);
        return 'data:image/gif;base64,' + btoa(binary);
      }
    }
  }
  return base64Data;
};

export const initGifRunner = function(doc) {
  const images = doc.querySelectorAll('image, img');
  const gifElements = doc.querySelectorAll('[data-loop-count]');
  // console.log("[initGifRunner] Checking document:", doc.location?.href);
  // console.log("[initGifRunner] Total images found:", images.length);
  // console.log("[initGifRunner] Found GIF elements with data-loop-count:", gifElements.length);
  
  if (gifElements.length === 0 && images.length > 0) {
      // console.log("[initGifRunner] Images found, but none have data-loop-count. First image HTML:", images[0].outerHTML);
  }
  
  gifElements.forEach(el => {
    const playWhile = el.getAttribute('data-play-gif-while');
    const loopCount = el.getAttribute('data-loop-count');
    const customLoop = parseInt(el.getAttribute('data-custom-loop-count')) || 1;
    // console.log("[initGifRunner] Checking GIF element:", { loopCount, customLoop, playWhile });

    // Find the actual image element
    const img = el.tagName.toLowerCase() === 'image' || el.tagName.toLowerCase() === 'img' ? el : el.querySelector('image, img');
    if (!img) {
      // console.log("[initGifRunner] No img/image tag found inside element");
      return;
    }

    const originalSrc = img.getAttribute('data-original-src') || img.getAttribute('href') || img.src || img.getAttribute('xlink:href');
    if (!originalSrc || (!originalSrc.toLowerCase().includes('.gif') && !originalSrc.toLowerCase().startsWith('data:image/gif') && !originalSrc.toLowerCase().includes('.webp') && !originalSrc.toLowerCase().startsWith('data:image/webp'))) {
      // console.log("[initGifRunner] Src is not a GIF/WebP or is empty:", originalSrc);
      return;
    }

    // Save the original src so we can restart it later
    if (!img.hasAttribute('data-original-src')) {
      img.setAttribute('data-original-src', originalSrc);
    }

    // Handle precise loop counts
    let maxLoops = Infinity;
    if (loopCount === 'Once') maxLoops = 1;
    else if (loopCount === 'Twice') maxLoops = 2;
    else if (loopCount === 'Thrice') maxLoops = 3;
    else if (loopCount === 'Custom') maxLoops = customLoop;

    const freezeGif = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";
      tempImg.onload = () => {
        canvas.width = tempImg.naturalWidth || tempImg.width || 100;
        canvas.height = tempImg.naturalHeight || tempImg.height || 100;
        ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
        try {
          const staticSrc = canvas.toDataURL('image/png');
          if (img.tagName.toLowerCase() === 'image') {
            img.setAttribute('href', staticSrc);
            try { img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", staticSrc); } catch(e){}
          } else {
            img.src = staticSrc;
          }
        } catch(e) {
          // If CORS prevents canvas read, we can't easily freeze it natively without a proxy
          console.warn("Could not freeze GIF due to CORS", e);
        }
      };
      if (originalSrc.startsWith('data:')) {
        tempImg.src = originalSrc;
      } else {
        const separator = originalSrc.includes('?') ? '&' : '?';
        tempImg.src = `${originalSrc}${separator}cb=${Date.now()}`;
      }
    };

    const playGif = () => {
      // Reload gif to restart animation from frame 1
      let freshSrc = originalSrc;
      if (originalSrc.startsWith('data:')) {
        // Natively patch the GIF/WebP binary so the browser perfectly controls the loop!
        freshSrc = patchAnimationLoops(originalSrc, maxLoops);
      } else {
        const separator = originalSrc.includes('?') ? '&' : '?';
        freshSrc = `${originalSrc}${separator}t=${Date.now()}`;
      }
      
      if (img.tagName.toLowerCase() === 'image') {
        if (originalSrc.startsWith('data:')) {
           img.setAttribute('href', '');
           void img.offsetWidth; // force reflow
        }
        img.setAttribute('href', freshSrc);
        try { img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", freshSrc); } catch(e){}
      } else {
        if (originalSrc.startsWith('data:')) {
           img.src = '';
           void img.offsetWidth; // force reflow
        }
        img.src = freshSrc;
      }
    };

    const currentLoopSetting = `${loopCount}-${customLoop}-${playWhile}`;
    const isNewSetting = el.__lastLoopSetting !== currentLoopSetting;
    
    if (playWhile === 'Manual (Click to play)') {
      if (!el.__gifBound) {
        freezeGif();
        el.__isPlaying = false;
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (el.__isPlaying) {
            freezeGif();
            el.__isPlaying = false;
          } else {
            playGif();
            el.__isPlaying = true;
            el.__gifStartTime = Date.now();
          }
        });
        el.__gifBound = true;
      } else if (isNewSetting) {
        // If switched to manual from autoplay, freeze it
        freezeGif();
        el.__isPlaying = false;
        if (el.__gifTimeout) clearTimeout(el.__gifTimeout);
      }
    } else {
      // Autoplay while on page
      if (!el.__gifBound || isNewSetting) {
        if (maxLoops === Infinity || maxLoops === 0 || originalSrc.startsWith('data:')) {
            playGif();
            el.__gifStartTime = Date.now();
        }
        el.__isPlaying = true;
        el.__gifBound = true;
      }
    }

    el.__lastLoopSetting = currentLoopSetting;

    if (maxLoops !== Infinity && maxLoops > 0) {
      if (originalSrc.startsWith('data:')) {
          // Base64 GIFs are now handled natively by the browser via binary patching in playGif.
          // No need for gifuct-js parsing or manual timeouts!
          return;
      }
      if (isNewSetting || !el.__hasGifTimeoutSetup) {
        let fetchUrl = originalSrc;
        if (!originalSrc.startsWith('data:')) {
          const separator = originalSrc.includes('?') ? '&' : '?';
          fetchUrl = `${originalSrc}${separator}cb=${Date.now()}`;
        }
        fetch(fetchUrl)
          .then(resp => resp.arrayBuffer())
          .then(buff => {
            const dataView = new DataView(buff);
            let isWebp = false;
            if (dataView.byteLength >= 12) {
              const riff = String.fromCharCode(dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3));
              const webp = String.fromCharCode(dataView.getUint8(8), dataView.getUint8(9), dataView.getUint8(10), dataView.getUint8(11));
              if (riff === 'RIFF' && webp === 'WEBP') isWebp = true;
            }
            
            const finishSetup = (totalDuration, lastFrameDelay) => {
              // DEBUG OVERLAY: Show the gif count on screen
              let overlay = el.parentNode ? el.parentNode.querySelector('.debug-gif-overlay') : null;
              if (el.parentNode && !overlay) {
                  overlay = document.createElement('div');
                  overlay.className = 'debug-gif-overlay';
                  overlay.style.position = 'absolute';
                  overlay.style.top = '0px';
                  overlay.style.left = '0px';
                  overlay.style.background = 'rgba(255, 0, 0, 0.8)';
                  overlay.style.color = 'white';
                  overlay.style.padding = '4px 8px';
                  overlay.style.zIndex = '9999';
                  overlay.style.fontSize = '12px';
                  overlay.style.fontWeight = 'bold';
                  overlay.style.pointerEvents = 'none';
                  overlay.style.borderRadius = '0 0 5px 0';
                  el.parentNode.appendChild(overlay);
              }
              if (overlay) {
                  overlay.innerText = `Target Loops: ${maxLoops} | Time: ${totalDuration * maxLoops}ms`;
              }

              // Sync start time by re-triggering the GIF exactly now
              if (playWhile !== 'Manual (Click to play)') {
                 playGif();
                 el.__gifStartTime = Date.now();
                 el.__isPlaying = true;
                 
                 if (el.__gifTimeout) clearTimeout(el.__gifTimeout);
                 
                 // Target the exact midpoint of the last frame's display time
                 const freezeTime = (totalDuration * maxLoops) - (lastFrameDelay / 2);
                 const elapsed = el.__gifStartTime ? (Date.now() - el.__gifStartTime) : 0;
                 const remainingTime = Math.max(0, freezeTime - elapsed);
                 
                 el.__gifTimeout = setTimeout(() => {
                   if (el.__isPlaying !== false) {
                      freezeGif();
                      el.__isPlaying = false;
                      if (overlay) overlay.innerText += " (FROZEN)";
                   }
                 }, remainingTime);
                 el.__hasGifTimeoutSetup = true;
              }
            };

            if (isWebp) {
              const totalDuration = getWebPDuration(buff);
              if (totalDuration > 0) {
                 // For WebP, assume last frame delay is around 100ms for midpoint calculation
                 finishSetup(totalDuration, 100);
              }
            } else {
              import('gifuct-js').then(({ parseGIF, decompressFrames }) => {
                const gif = parseGIF(buff);
                const frames = decompressFrames(gif, true);
                const totalDuration = frames.reduce((sum, frame) => {
                  const delay = (!frame.delay || frame.delay <= 20) ? 100 : frame.delay;
                  return sum + delay;
                }, 0);
                const lastFrame = frames[frames.length - 1];
                const lastFrameDelay = (!lastFrame.delay || lastFrame.delay <= 20) ? 100 : lastFrame.delay;
                finishSetup(totalDuration, lastFrameDelay);
              }).catch(err => {
                console.warn("gifuct-js not installed. Run 'npm install gifuct-js' for exact loop counts.", err);
              });
            }
          })
          .catch(err => console.error("Error parsing Animation for loop count", err));
      }
    } else {
       if (playWhile !== 'Manual (Click to play)') {
          if (el.__gifTimeout) {
            clearTimeout(el.__gifTimeout);
            el.__gifTimeout = null;
          }
          el.__hasGifTimeoutSetup = false;
       }
    }
  });

  // Listen for PAGE_TURNED to restart GIFs when the page becomes visible
  if (doc.defaultView && !doc.__gifPageTurnBound) {
    doc.__gifPageTurnBound = true;
    doc.defaultView.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'PAGE_TURNED') {
        const visiblePages = e.data.visiblePages || [];
        // Only restart if the page is now visible. We can check if any GIF is in the viewport,
        // or just re-init everything and let the logic handle it.
        // The safest approach is to re-run initGifRunner so that the GIFs play again.
        // We will clear __lastLoopSetting so it thinks it's a new setting and restarts.
        const gifs = doc.querySelectorAll('[data-loop-count]');
        let shouldRestart = false;
        
        // Find if this iframe corresponds to a visible page
        // Usually the page number is injected as window._pageNumber by PreviewArea script
        const pageNum = doc.defaultView._pageNumber;
        if (pageNum !== undefined && visiblePages.includes(pageNum)) {
           shouldRestart = true;
        } else if (pageNum === undefined) {
           // Fallback if _pageNumber is not available
           shouldRestart = true;
        }

        if (shouldRestart) {
           gifs.forEach(el => {
              el.__lastLoopSetting = null; // force restart
           });
           initGifRunner(doc);
        }
      }
    });
  }
};

/* ==========================================================================
 * TEXT EFFECTS RUNNER  (scroll-triggered cascading text effects)
 * --------------------------------------------------------------------------
 * Added WITHOUT touching initAnimationRunner / initGifRunner above.
 *
 * Usage (call once, next to initAnimationRunner(doc)):
 *
 *     import { initAnimationRunner, initTextEffectsRunner } from './AnimationRunner';
 *     initAnimationRunner(doc);
 *     initTextEffectsRunner(doc);
 *
 * Markup:   <h1 data-text-effect="wave">Wave</h1>
 *
 * Optional attributes
 *   data-text-effect-speed="0.25"     seconds  (default 0.25)
 *   data-text-effect-step="0.1"       seconds  (default 0.1)
 *   data-text-effect-color="#fff"     text colour (default: element's own colour)
 *
 * It is self-contained: no Splitting / ScrollOut / Open Props needed.
 *  - Splitting  -> teSplitText()           (words / chars + CSS index variables)
 *  - ScrollOut  -> IntersectionObserver    (data-scroll="in" | "out")
 *  - Open Props -> fallbacks in TE_BASE_CSS (override with your own variables)
 * All CSS is scoped to [data-text-effect="..."] so it cannot clash with the page.
 * ========================================================================== */

const TE_STYLE_ID = 'te-text-effects-style';

const TE_BASE_CSS = `
[data-text-effect] {
  --te-speed: 0s;
  --te-step: 0s;
  --te-color: #f8f9fa;
  --te-color-dim: color-mix(in srgb, var(--te-color) 25%, transparent);
  --te-color-half: color-mix(in srgb, var(--te-color) 50%, transparent);
  --te-shade: var(--gray-9, #212529);
  --te-ease-1: var(--ease-elastic-1, cubic-bezier(0.34, 1.56, 0.64, 1));
  --te-ease-5: var(--ease-elastic-5, cubic-bezier(0.2, 2.2, 0.45, 1));
  --te-font-size: 1em;
}
@media (prefers-reduced-motion: no-preference) {
  [data-text-effect] { --te-speed: 0.25s; --te-step: 0.1s; }
}

/* Splitting base styles (scoped) */
[data-text-effect] .word,
[data-text-effect] .char { display: inline-block; }
[data-text-effect] .char { position: relative; }
[data-text-effect] .char:before,
[data-text-effect] .char:after {
  content: attr(data-char);
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  transition: inherit;
  user-select: none;
}

/* Util */
:where([data-text-effect][data-scroll], [data-text-effect] [data-scroll]) .char {
  transition: all var(--te-speed) calc((var(--char-index) + 1) * var(--te-step));
}

/* Used by replay(): snap to the "out" state without animating */
[data-text-effect][data-te-reset],
[data-text-effect][data-te-reset] *,
[data-text-effect][data-te-reset] *:before,
[data-text-effect][data-te-reset] *:after {
  transition: none !important;
  animation: none !important;
}
`;

// "&" is replaced by the effect's root selector: [data-text-effect="<name>"]
const TE_EFFECT_CSS = {
  slots: `
& {
  --color: var(--te-color);
  --speed: 0.5s;
  --delay: var(--te-speed);
  --size: var(--te-font-size);
  height: calc(var(--size) * 3);
  overflow: hidden;
}
& .char {
  text-transform: uppercase;
  color: var(--color);
  animation: te-slots var(--speed) var(--delay) infinite linear;
  text-shadow: 0 calc(var(--size) * -1) 0 var(--color),
    0 calc(var(--size) * -2) 0 var(--color),
    0 calc(var(--size) * -3) 0 var(--color),
    0 calc(var(--size) * 1) 0 var(--color),
    0 calc(var(--size) * 2) 0 var(--color),
    0 calc(var(--size) * 3) 0 var(--color);
}
& .char:nth-of-type(odd) {
  animation: te-slots calc(var(--speed) * 0.75) var(--delay) infinite linear reverse;
}
@keyframes te-slots { to { transform: translate(0, calc(var(--size) * -1)); } }
`,

  carousel: `
& { height: var(--te-font-size); width: var(--te-font-size); text-transform: uppercase; }
& .word { transform-style: preserve-3d; transform: rotateX(-24deg) rotateY(0); height: 100%; width: 100%; }
& .char {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotateY(calc(((360 / var(--char-total)) * var(--char-index)) * 1deg)) translate(var(--te-font-size), 0);
}
& [data-scroll="in"] { animation: te-carousel-spin calc(var(--te-speed) * 8) infinite linear reverse; }
@keyframes te-carousel-spin { to { transform: rotateX(-24deg) rotateY(360deg); } }
`,

  bloat: `
& { display: grid; grid-auto-rows: auto; }
& .word { display: grid; grid-template-columns: repeat(var(--chars, 5), auto); }
& [data-scroll="in"] .char {
  animation-delay: calc(var(--te-speed) + (var(--word-index) * var(--te-step)));
  animation-name: te-bloat;
  animation-timing-function: ease-out;
  animation-duration: calc(2 * var(--te-speed));
}
& .char {
  --offset: calc((var(--char-index) - var(--word-start, 0)) - var(--center, 2));
  transform: translate(0, 0);
}
@keyframes te-bloat { 50% { transform: translate(calc(var(--offset) * 150%), 0); } }
`,

  roulette: `
& { position: relative; }
& [data-scroll="in"] { animation: te-roulette calc(var(--te-speed) * 8) var(--te-speed) infinite linear; }
& .word { height: var(--te-font-size); width: var(--te-font-size); }
& .char {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(calc((var(--char-index) * (360 / var(--char-total)) * 1deg))) translate(0, -150%);
}
@keyframes te-roulette { to { transform: rotate(-360deg); } }
`,

  hinged: `
& .char { --rotation: -180deg; transform-origin: 0 100%; transform: rotate(var(--rotation)); }
& [data-scroll="in"] .char { --rotation: 0deg; }
`,

  mexiwave: `
& [data-scroll="in"] .char { animation: te-mexiwave var(--te-speed) calc(var(--char-index) * var(--te-step)) ease; }
@keyframes te-mexiwave { 50% { transform: translate(0, -50%); } }
`,

  enter: `
& .char { opacity: var(--opacity, 1); transform: translateY(var(--y, 0%)); }
& [data-scroll="out"] { --opacity: 0; --y: -150%; }
`,

  random: `
& .char { transition: transform var(--te-speed) calc((var(--char-index) + 1) * var(--te-speed)); }
& [data-scroll="out"] .char { transform: translate(calc(var(--x) * 1%), calc(var(--y) * 1%)); }
`,

  swapsies: `
& .char { transform: translateX(var(--translate)); }
& .char:nth-of-type(even) { --translate: -100%; }
& .char:nth-of-type(odd) { --translate: 100%; }
& [data-scroll="in"] .char { animation: te-swapsies 0.5s calc(var(--char-index) * var(--te-step)) both; }
@keyframes te-swapsies {
  25% { transform: translate(var(--translate), var(--translate)); }
  75% { transform: translate(0, var(--translate)); }
  100% { transform: translate(0, 0); }
}
`,

  fading: `
& [data-scroll="out"] .char { opacity: 0; }
`,

  flipping: `
& [data-scroll='out'] .char { transform: rotateX(360deg); }
`,

  slide: `
& .char {
  transition: opacity var(--te-step), transform var(--te-speed);
  transition-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step));
}
& [data-scroll='out'] .char { opacity: 0; transform: translate(-300%, 0) skewX(20deg); }
`,

  karaoke: `
& .char { color: var(--te-color-dim); }
& .char:after {
  color: var(--te-color);
  visibility: visible;
  clip-path: inset(0 calc((100 - (var(--reveal, 1) * 100)) * 1%) 0 0);
}
& [data-scroll="out"] .char:after { --reveal: 0; }
`,

  filling: `
& .char { color: var(--te-color-dim); }
& .char:after {
  color: var(--te-color);
  visibility: visible;
  clip-path: inset(calc((100 - (var(--reveal, 1) * 100)) * 1%) 0 0 0);
}
& [data-scroll="out"] .char:after { --reveal: 0; }
`,

  blocks: `
& [data-scroll='out'] .char { --show: 0; }
& [data-scroll] { overflow: hidden; position: relative; }
& .char { opacity: var(--show); transition: opacity 0s calc(var(--te-speed) * 2); }
& [data-scroll="in"] .char { --show: 1; }
& [data-scroll="in"]:after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--te-color);
  animation: te-blocks calc(var(--te-speed) * 2) calc((var(--te-speed) * 2) * 0.5) both;
  visibility: visible;
}
@keyframes te-blocks {
  0% { transform: translate(-110%, 0); }
  45%, 55% { transform: translate(0, 0); }
  100% { transform: translate(110%, 0); }
}
`,

  scaling: `
& [data-scroll="out"] .char { transform: scale(0); }
`,

  turning: `
& [data-scroll="out"] .char { transform: rotateY(90deg); }
`,

  folding: `
& .word { transform-style: preserve-3d; perspective: var(--te-font-size); }
& .char {
  transform-style: preserve-3d;
  transform: rotateX(calc((90 - (var(--show, 1) * 90)) * 1deg));
  transform-origin: 50% 100%;
}
& [data-scroll="out"] .char { --show: 0; }
`,

  bulge: `
& [data-scroll="in"] .char {
  animation-name: te-bulge;
  animation-duration: var(--te-speed);
  animation-delay: calc(var(--te-speed) + (var(--char-index) * var(--te-step)));
}
@keyframes te-bulge { 50% { transform: scale(1.5); } }
`,

  perspective: `
&, & .word { transform-style: preserve-3d; perspective: 100vmax; perspective-origin: 50% 200%; }
& .char {
  transition: transform var(--te-speed) calc(var(--te-speed) + var(--char-index) * var(--te-step)),
              opacity var(--te-step) calc(var(--te-speed) + var(--char-index) * var(--te-step));
}
& [data-scroll="out"] .char { opacity: 0; transform: translate3d(-10%, -10%, -90vmax); }
`,

  zipping: `
& .char {
  transition: transform var(--te-speed) calc(var(--te-speed) + var(--char-index) * var(--te-step)),
              opacity calc(var(--te-step) * 0.5) calc(var(--te-speed) + var(--char-index) * var(--te-step));
}
& [data-scroll="out"] .char { opacity: 0; transform: translateY(var(--y, -100%)) scale(0); }
& .char:nth-of-type(even) { --y: 100%; }
`,

  spinning: `
& [data-scroll="out"] .char { transform: rotateY(-360deg); }
`,

  tumbling: `
& .char { transition-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step)); }
& [data-scroll='out'] .char { opacity: 0; transform: translate(-500%, 0%) rotate(-1080deg) scale(1); }
& .char, & .char:after {
  animation-duration: calc(var(--te-speed) * 4);
  animation-fill-mode: both;
  animation-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step));
}
& [data-scroll="in"] .char { animation-name: te-tumbling; animation-timing-function: linear; color: transparent; }
& [data-scroll="in"] .char:after { animation-name: te-tumbling-after; }
& .char:after { color: var(--te-color); visibility: visible; }
@keyframes te-tumbling { 0% { transform: translateX(-500%); } }
@keyframes te-tumbling-after {
  0% { opacity: 0; transform: translateY(0) rotate(0deg); }
  25% { opacity: 1; transform: translateY(-50%) rotate(360deg); }
  50% { transform: translateY(0) rotate(360deg); }
  75% { transform: translateY(-25%) rotate(720deg); }
  100% { transform: translateY(0%) rotate(720deg); }
}
`,

  bubbling: `
& .char {
  transform-origin: 50% 85%;
  transition-timing-function: var(--te-ease-5);
  transition-delay: calc(var(--te-speed) + var(--delay, 0) * var(--te-step));
}
& .char:nth-of-type(1) { --delay: 3; }
& .char:nth-of-type(2) { --delay: 2; }
& .char:nth-of-type(3) { --delay: 5; }
& .char:nth-of-type(4) { --delay: 8; }
& .char:nth-of-type(5) { --delay: 7; }
& .char:nth-of-type(6) { --delay: 6; }
& .char:nth-of-type(7) { --delay: 1; }
& .char:nth-of-type(8) { --delay: 4; }
& [data-scroll="out"] .char { transform: scale(0.35); }
`,

  swinging: `
& .char {
  transform-origin: calc((var(--char-total) - var(--char-index)) * 100%) calc(100% * -4);
  transition-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step));
}
& [data-scroll="out"] .char { opacity: 0; transform: rotate(90deg); }
`,

  rolling: `
& .char {
  transition: transform calc(var(--te-speed) * 2), opacity calc(var(--te-step) * 2);
  transition-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step));
  transition-timing-function: var(--te-ease-1);
}
& [data-scroll="out"] .char { opacity: 0; transform: translate(-500%, 0) rotate(-1080deg); }
`,

  blowing: `
& .char {
  animation-duration: calc(var(--te-speed) * 4);
  animation-fill-mode: both;
  transform-origin: 0 100%;
  animation-delay: calc(var(--char-index) * (var(--te-step) * 0.25));
}
& [data-scroll="in"] .char { animation-name: te-blowing; }
@keyframes te-blowing {
  50%, 60%, 70% { transform: skewX(-35deg); }
  55%, 65%, 75% { transform: skewX(-40deg); }
}
`,

  meeting: `
& .char { transform-origin: var(--origin, 100% 0); }
& .char:nth-of-type(odd) { --origin: 0 100%; }
& [data-scroll="out"] .char { transform: rotate(-180deg); }
`,

  conveyor: `
& .char {
  transform-origin: 0 100%;
  animation-duration: calc(var(--te-step) * 4);
  animation-fill-mode: both;
  animation-timing-function: linear;
  animation-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step));
  transition: none;
}
& [data-scroll="in"] .char { animation-name: te-conveyor; }
@keyframes te-conveyor {
  0% { transform: translate(calc((var(--char-total) - (var(--char-total) - var(--char-index))) * -100%), 0) rotate(-180deg) translate(calc((var(--char-total) - var(--char-index)) * -100%), 0); }
  40% { transform: translate(calc((var(--char-total) - (var(--char-total) - var(--char-index))) * -100%), 0) rotate(-180deg) translate(0, 0); }
  50% { transform: translate(calc((var(--char-total) - (var(--char-total) - var(--char-index))) * -100%), 0) rotate(0deg) translate(0, 0); }
  100% { transform: translate(0, 0) rotate(0deg) translate(0, 0); }
}
`,

  cascade: `
& .char {
  animation-duration: calc(var(--te-speed) * 4);
  animation-fill-mode: both;
  animation-delay: calc((var(--char-total) - var(--char-index)) * var(--te-step));
}
& [data-scroll="in"] .char { animation-name: te-cascade; }
@keyframes te-cascade {
  0% { opacity: 0; transform: translate(-300%, -300%); }
  10% { transform: translate(-200%, -300%); }
  30% { transform: translate(-200%, -200%); }
  50% { opacity: 1; transform: translate(-100%, -200%); }
  70% { transform: translate(-100%, -100%); }
  90% { transform: translate(0%, -100%); }
  100% { transform: translate(0, 0); }
}
`,

  tossing: `
& .char {
  animation-duration: calc(var(--te-speed) * 2);
  animation-fill-mode: both;
  animation-delay: calc(var(--char-index) * var(--te-step));
}
& [data-scroll="in"] .char { animation-name: te-tossing; }
@keyframes te-tossing {
  0% { transform: translateY(0) rotate(0deg) scale(1); }
  75% { transform: translateY(-50%) rotate(360deg) scale(1.1); }
  100% { transform: translateY(0) rotateY(360deg) scale(1); }
}
`,

  wave: `
& .char {
  animation-duration: calc(var(--te-speed) * 8);
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-delay: calc((var(--char-index) * var(--te-step)) * -1);
}
& [data-scroll="in"] .char { animation-name: te-wave; }
@keyframes te-wave { 25% { transform: translateY(-75%); } }
`,

  rising: `
& .char {
  opacity: calc(1 - var(--hide, 0));
  transform: translate(calc(var(--hide, 0) * -150%), calc(var(--hide, 0) * 300%));
  transition-property: transform, opacity;
  transition-duration: calc(var(--te-speed) * 2), calc(var(--te-speed) * 0.5);
}
& [data-scroll="out"] { --hide: 1; }
`,

  twirl: `
& .char {
  animation-duration: calc(var(--te-speed) * 2);
  animation-fill-mode: both;
  animation-delay: calc(var(--char-index) * var(--te-step));
  animation-timing-function: var(--te-ease-5);
}
& [data-scroll="in"] .char { animation-name: te-twirl; }
@keyframes te-twirl {
  0% { opacity: 0; transform: translateY(200%) rotateY(0deg); }
  25% { opacity: 1; }
  100% { transform: translateY(0%) rotateY(360deg); }
}
`,

  backflip: `
& { transform-style: preserve-3d; perspective: var(--te-font-size); }
& .char {
  color: transparent;
  transform-style: preserve-3d;
  perspective: var(--te-font-size);
  transition-duration: calc(var(--te-speed) * 3);
  transition-timing-function: var(--te-ease-5);
}
& [data-scroll="out"] .char { opacity: 0; transform: translateY(500%) scale(0); }
& .char:after {
  transform-style: preserve-3d;
  visibility: visible;
  color: var(--te-color);
  animation-duration: calc(var(--te-speed) * 3);
  animation-delay: calc(var(--char-index) * var(--te-step));
  animation-fill-mode: both;
}
& [data-scroll="in"] .char:after { animation-name: te-backflip-after; }
@keyframes te-backflip-after {
  0%, 40% { transform: rotateX(0deg); }
  100% { transform: rotateX(360deg); }
}
`,

  jump: `
& .word { clip-path: inset(-100% 0 0 0); }
& .char { transition-timing-function: var(--te-ease-5); }
& [data-scroll="out"] .char { transform: translateY(100%); }
`,

  glare: `
& {
  -webkit-text-fill-color: transparent;
  clip-path: inset(0 0 0 100%);
  transition: clip-path var(--te-speed) var(--te-speed);
  background: linear-gradient(55deg, transparent 33%, var(--te-color), transparent 66%) 0 0 / 200% 100%, var(--te-color-dim);
  -webkit-background-clip: text;
  background-clip: text;
}
&[data-scroll="in"] {
  clip-path: inset(0 0 0 0);
  animation: te-glare calc(4 * var(--te-speed)) infinite linear;
}
@keyframes te-glare {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 200% 0, 0 0; }
}
`,

  expanding: `
& { position: relative; }
& .word:not(:first-of-type) {
  position: absolute;
  transform: translateY(calc(var(--expansion-position, 0) * (var(--reveal, 0)) * 100%));
  inset: 0;
  -webkit-text-stroke: calc(var(--te-font-size) * 0.05) var(--te-color-half);
  color: transparent;
  transition: transform var(--te-speed) calc(var(--expansion-index, 0) * var(--te-step));
  transition-timing-function: var(--te-ease-1);
}
& .word[data-scroll="in"] { --reveal: 1; }
`,

  /* The demo wrapped this one in a perspective wrapper element. To avoid adding
     wrapper elements to your page, perspective() is used inside the transform. */
  falling: `
& {
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: perspective(calc(var(--te-font-size) * 2)) translateY(50%) rotateX(calc((1 - var(--reveal, 0)) * 65deg)) translateY(-50%);
  transition: transform var(--te-speed) calc(var(--te-speed) + (7 * var(--te-step)));
}
& .word { transform-style: preserve-3d; perspective: 100000vmin; }
& .char { display: inline-block; transform-style: preserve-3d; color: transparent; }
& .char:before {
  transform-style: preserve-3d;
  color: var(--te-shade);
  opacity: var(--reveal, 0);
  visibility: visible;
  transition: opacity var(--te-speed) calc(var(--char-index) * var(--te-step));
}
& .char:after {
  transform-style: preserve-3d;
  color: var(--te-color);
  visibility: visible;
  transform: rotateX(calc((1 - var(--reveal, 0)) * -45deg))
    translate3d(0, calc((1 - var(--reveal, 0)) * -200%), calc((1 - var(--reveal, 0)) * 30vmin));
  display: inline-block;
}
&[data-scroll="out"], & [data-scroll="out"], & [data-scroll="out"] .char:before, & [data-scroll="out"] .char:after { --reveal: 0; }
&[data-scroll="in"], & [data-scroll="in"], & [data-scroll="in"] .char:before, & [data-scroll="in"] .char:after { --reveal: 1; }
`,

  scrolled: `
& {
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: perspective(calc(var(--te-font-size) * 3)) translateY(50%) rotateX(45deg) translateY(-50%);
  transition: transform var(--te-speed) calc(var(--te-speed) + (8 * var(--te-step)));
}
&[data-scroll="in"] {
  transform: perspective(calc(var(--te-font-size) * 3)) translateY(50%) rotateX(0deg) translateY(-50%);
}
& .char { transition-property: opacity, transform; transition-duration: var(--te-step), var(--te-speed); }
& [data-scroll="out"] .char { transform: translateY(200%); opacity: 0; }
`,

  bloom: `
& { --clip: 150; position: relative; }
& [data-scroll="out"] { --clip: 0; }
& .word {
  --path: circle(calc(var(--clip, 0) * 1%) at var(--origin, 50% 50%));
  transition: clip-path calc(var(--te-speed) * 3) calc(var(--te-speed) * 2) ease-in;
  clip-path: var(--path);
}
&:before {
  content: attr(data-word);
  position: absolute;
  color: color-mix(in srgb, var(--te-color) 5%, transparent);
  inset: 0;
}
`,
  'bloom-north':      '& { --origin: 50% 0; }',
  'bloom-north-east': '& { --origin: 100% 0; }',
  'bloom-east':       '& { --origin: 100% 50%; }',
  'bloom-south-east': '& { --origin: 100% 100%; }',
  'bloom-south':      '& { --origin: 50% 100%; }',
  'bloom-south-west': '& { --origin: 0% 100%; }',
  'bloom-west':       '& { --origin: 0% 50%; }',
  'bloom-north-west': '& { --origin: 0% 0%; }',

  stream: `
& { text-transform: uppercase; letter-spacing: 0.2ch; }
& .char {
  --speed: calc(var(--te-speed) * 3);
  --delay: calc(0.65s + (var(--char-index) * 0.03s));
  --shadow: hsl(0, 0%, 46%);
  transition: none;
  color: hsl(6, 89%, 100%);
  opacity: 0;
}
&[data-scroll=in] .char {
  animation: te-stream-shadow var(--speed) var(--delay),
             te-stream-alpha var(--speed) var(--delay) both,
             te-stream-color var(--speed) var(--delay) both,
             te-stream-scale var(--speed) var(--delay);
}
@keyframes te-stream-alpha { 25%, 100% { opacity: 1; } }
@keyframes te-stream-scale { 25%, 75% { scale: 1.25; } }
@keyframes te-stream-color {
  0%, 75% { color: hsl(6 89% 100%); }
  100% { color: hsl(6 89% 42%); }
}
@keyframes te-stream-shadow {
  25%, 75% {
    text-shadow:
      1px 2px 0px var(--shadow), 2px 4px 0px var(--shadow), 3px 6px 0px var(--shadow),
      4px 8px 0px var(--shadow), 5px 10px 0px var(--shadow), 6px 12px 0px var(--shadow),
      7px 14px 0px var(--shadow), 8px 16px 0px var(--shadow), 9px 18px 0px var(--shadow),
      10px 20px 0px var(--shadow);
  }
}
`,

  reflective: `
& { position: relative; line-height: 0.8; }
& .char { transform: translateY(110%); letter-spacing: 0.15ch; }
& [data-scroll=in] .char {
  animation: te-reflective-jump
    calc(var(--te-speed) * 1.25)
    calc(0.5s + (var(--char-index) - ((var(--char-total) / var(--word-total)) * var(--word-index))) * (1.25 * var(--te-step)))
    cubic-bezier(0, 1.4, 1, 1.6)
    both;
}
& > span:first-of-type .word { clip-path: inset(-50% 0 0 0); }
& > span:last-of-type .word {
  position: absolute;
  clip-path: inset(0 0 -50% 0);
  top: 100%;
  width: 100%;
  left: 0;
  transform: rotateX(180deg);
  mask: linear-gradient(transparent, black);
  -webkit-mask: linear-gradient(transparent, black);
}
@keyframes te-reflective-jump { to { transform: translateY(0%); } }
`,

  glitch: `
& [data-scroll=in] .char {
  --split: 0;
  --shift: 0;
  --shadow: 0;
  color: transparent;
  animation: te-glitch 1s calc(var(--char-index) * 0.1s) 2 ease-in-out alternate-reverse;
  position: relative;
  transition: none;
}
& .char:before, & .char:after {
  content: attr(data-char);
  position: absolute;
  top: 0%;
  left: 0%;
  height: 100%;
  width: 100%;
  color: var(--te-color);
  visibility: visible;
  -webkit-clip-path: var(--clip);
  clip-path: var(--clip);
}
& .char:before { --clip: inset(calc((95 - var(--split)) * 1%) 0 0 0); }
& .char:after {
  transform: translate(calc(var(--shift) * 1%), 0);
  --clip: inset(0 0 calc(var(--split) * 1%) 0);
  text-shadow: calc(var(--shadow) * 1px) calc(var(--shadow) * 1px) #000;
}
@keyframes te-glitch {
  0% { --split: 20; --shift: 20; --shadow: -4; }
  5% { --split: 30; --shift: 20; --shadow: -4; }
  10% { --split: 80; --shift: 10; --shadow: -4; }
  15% { --split: 55; --shift: 10; --shadow: -4; }
  20%, 50% { --split: 0; --shift: 0; --shadow: 0; }
  100% { --split: 0; --shift: 0; --shadow: 0; }
}
`,

  glitchy: `
& .char {
  --speed: calc(var(--te-speed) * 0.75);
  color: transparent;
  position: relative;
  transition: none;
}
& [data-scroll=in] .char:after {
  --txt: attr(data-char);
  content: var(--txt);
  animation-duration: var(--speed);
  animation-name: te-glitchy;
  animation-fill-mode: backwards;
  animation-iteration-count: calc(1 + var(--char-index));
  animation-delay: 0.5s;
  animation-timing-function: steps(1);
  color: var(--te-color);
  position: absolute;
  inset: 0;
  visibility: visible;
}
@keyframes te-glitchy {
  0%   { content: var(--char-0); }
  10%  { content: var(--char-1); }
  20%  { content: var(--char-2); }
  30%  { content: var(--char-3); }
  40%  { content: var(--char-4); }
  50%  { content: var(--char-5); }
  60%  { content: var(--char-6); }
  70%  { content: var(--char-7); }
  80%  { content: var(--char-8); }
  90%  { content: var(--char-9); }
  100% { content: var(--char-0); }
}
`,

  strikethrough: `
& .word {
  --start: 23%;
  --end: 43%;
  --progress: 0%;
  transition: clip-path var(--te-speed) calc(0.5s + var(--te-speed));
  text-transform: uppercase;
  font-style: italic;
  clip-path: polygon(0 0, 0 var(--start), var(--progress) var(--start), var(--progress) var(--end), 0 var(--end), 0 100%, 100% 100%, 100% 0);
}
& [data-scroll=in] { --progress: 100%; }
`,

  taste: `
& {
  --red: hsl(5, 87%, 45%);
  --orange: hsl(31, 88%, 46%);
  --yellow: hsl(65, 52%, 58%);
  --green: hsl(168, 95%, 28%);
  --blue: hsl(217, 81%, 42%);
  --purple: hsl(250, 72%, 46%);
  position: relative;
  text-transform: lowercase;
  letter-spacing: -0.1ch;
}
& > span:first-of-type { color: transparent; }
& > span:nth-of-type(3) { -webkit-text-stroke: 2px var(--red); }
& > span:not(:first-of-type) {
  --color: red;
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(0, calc((var(--word-index) - 1) * var(--step, 0)));
  z-index: calc(var(--word-total) - var(--word-index));
}
& [data-scroll=in].word { --step: 8%; }
& .char { color: var(--color, red); transition: none; }
& .word { transition: transform var(--te-speed) calc(0.5s + var(--te-speed)); }
& > span:nth-of-type(3) { --color: white; }
& > span:nth-of-type(5) { --color: var(--red); }
& > span:nth-of-type(7) { --color: var(--orange); }
& > span:nth-of-type(9) { --color: var(--yellow); }
& > span:nth-of-type(11) { --color: var(--green); }
& > span:nth-of-type(13) { --color: var(--blue); }
& > span:nth-of-type(15) { --color: var(--purple); }
`,
};

/** Every effect name you can put in data-text-effect="..." */
export const TEXT_EFFECT_NAMES = Object.keys(TE_EFFECT_CSS);

// Effects whose root selector is not simply [data-text-effect="<name>"]
const TE_ROOT_SELECTOR = { bloom: '[data-text-effect^="bloom"]' };
// Effects designed around one word repeated N times (text is repeated for you)
const TE_REPEAT = { taste: 8, bloat: 5, expanding: 5 };
// Effects that look best with a trailing separator so the ring has a gap
const TE_RING = ['carousel', 'roulette'];
// Effects applied to the element itself (no per-word targets needed)
const TE_NO_SPLIT = ['glare'];
// Effects whose CSS also reads data-scroll on the root element itself
const TE_OBSERVE_SELF = ['falling', 'scrolled', 'glare', 'stream'];

const TE_GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');
const TE_OWN_ATTRS = ['data-text-effect', 'data-text-effect-speed', 'data-text-effect-step', 'data-text-effect-color'];

const teBuildCss = () =>
  TE_BASE_CSS +
  Object.entries(TE_EFFECT_CSS)
    .map(([name, css]) => css.split('&').join(TE_ROOT_SELECTOR[name] || `[data-text-effect="${name}"]`))
    .join('\n');

const teRandomInRange = (min, max) =>
  Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));

const teInjectStyle = (doc) => {
  if (doc.getElementById(TE_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = TE_STYLE_ID;
  style.textContent = teBuildCss();
  (doc.head || doc.documentElement).appendChild(style);
};

/**
 * Splitting-style splitter. Walks text nodes (keeps nested elements such as the
 * two <span>s used by "reflective") and builds:
 *   <span class="word" data-word style="--word-index">
 *     <span class="char" data-char style="--char-index">x</span> ...
 * plus <span class="whitespace"> </span> between words, and sets
 * --word-total / --char-total on the root.
 */
const teSplitText = (root, doc) => {
  let wordIndex = 0;
  let charIndex = 0;
  const isBlank = (n) => !n || (n.nodeType === 3 && !n.textContent.trim());

  const makeSpace = () => {
    const ws = doc.createElement('span');
    ws.className = 'whitespace';
    ws.textContent = ' ';
    return ws;
  };

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 1) { walk(child); return; }
      if (child.nodeType !== 3) return;

      const text = child.textContent;
      const words = text.split(/\s+/).filter(Boolean);
      if (!words.length) return;

      const frag = doc.createDocumentFragment();
      if (/^\s/.test(text) && !isBlank(child.previousSibling)) frag.appendChild(makeSpace());

      words.forEach((w, i) => {
        if (i > 0) frag.appendChild(makeSpace());
        const wordEl = doc.createElement('span');
        wordEl.className = 'word';
        wordEl.setAttribute('data-word', w);
        wordEl.style.setProperty('--word-index', String(wordIndex++));
        Array.from(w).forEach((ch) => {
          const c = doc.createElement('span');
          c.className = 'char';
          c.setAttribute('data-char', ch);
          c.style.setProperty('--char-index', String(charIndex++));
          c.textContent = ch;
          wordEl.appendChild(c);
        });
        frag.appendChild(wordEl);
      });

      if (/\s$/.test(text) && !isBlank(child.nextSibling)) frag.appendChild(makeSpace());
      node.replaceChild(frag, child);
    });
  };

  walk(root);
  root.style.setProperty('--word-total', String(wordIndex));
  root.style.setProperty('--char-total', String(charIndex));
  return wordIndex;
};

const teSetProp = (el, name, value) => {
  el.style.setProperty(name, value);
  (el.__teProps = el.__teProps || []).push(name);
};

/** Effect-specific JS (the CSS needs a few per-character / per-word values). */
const teApplyExtras = (el, name) => {
  if (name === 'glitchy') {
    el.querySelectorAll('.char').forEach((c) => {
      for (let g = 0; g < 10; g++) {
        c.style.setProperty(`--char-${g}`, `"${TE_GLITCH_CHARS[Math.floor(Math.random() * TE_GLITCH_CHARS.length)]}"`);
      }
    });
  }
  if (name === 'random') {
    el.querySelectorAll('.char').forEach((c) => {
      c.style.setProperty('--x', teRandomInRange(-1000, 1000));
      c.style.setProperty('--y', teRandomInRange(-1000, 1000));
    });
  }
  if (name === 'expanding') {
    el.querySelectorAll('.word').forEach((word, index) => {
      const exp = (index % 2) + 1;
      if (index !== 0) {
        word.style.setProperty('--expansion-position', index > 2.5 ? exp : exp * -1);
        word.style.setProperty('--expansion-index', exp);
      }
    });
  }
  if (name === 'bloat') {
    el.querySelectorAll('.word').forEach((word) => {
      const chars = word.querySelectorAll('.char');
      word.style.setProperty('--chars', chars.length);
      word.style.setProperty('--center', Math.floor(chars.length / 2));
      word.style.setProperty('--word-start', chars.length ? chars[0].style.getPropertyValue('--char-index') : 0);
    });
  }
  if (name.indexOf('bloom') === 0) {
    if (!el.hasAttribute('data-word')) {
      el.setAttribute('data-word', el.__teText);
      el.__teAttrs.push('data-word');
    }
  }
};

const teTeardown = (el, state) => {
  (el.__teTargets || []).forEach((t) => {
    state.io.unobserve(t);
    t.removeAttribute('data-scroll');
  });
  el.removeAttribute('data-scroll');
  // Only restore the original markup if our split markup is still there
  if (el.__teOriginalHTML !== undefined && el.querySelector('.word')) {
    el.innerHTML = el.__teOriginalHTML;
  }
  (el.__teProps || []).forEach((p) => el.style.removeProperty(p));
  (el.__teAttrs || []).forEach((a) => el.removeAttribute(a));
  ['--word-total', '--char-total'].forEach((p) => el.style.removeProperty(p));
  if (el.__teAddedRole) el.removeAttribute('role');
  if (el.__teAddedLabel) el.removeAttribute('aria-label');
  ['__teName', '__teText', '__teOriginalHTML', '__teTargets', '__teProps', '__teAttrs',
    '__teHasWords', '__teAddedRole', '__teAddedLabel'].forEach((k) => { delete el[k]; });
  state.els.delete(el);
};

const teProcess = (el, doc, state) => {
  const name = (el.getAttribute('data-text-effect') || '').trim().toLowerCase();

  if (el.__teName) {
    const upToDate = el.__teName === name && (!el.__teHasWords || el.querySelector('.word'));
    if (upToDate) return;
    teTeardown(el, state);
  }
  if (!TE_EFFECT_CSS[name]) return;

  const win = doc.defaultView || window;

  // Read the element's own colour BEFORE we change anything
  const color = el.getAttribute('data-text-effect-color') || win.getComputedStyle(el).color;

  el.__teOriginalHTML = el.innerHTML;
  el.__teProps = [];
  el.__teAttrs = [];

  const originalText = (el.textContent || '').replace(/\s+/g, ' ').trim();
  let text = originalText;
  if (TE_REPEAT[name] && text.split(' ').length === 1) {
    text = Array(TE_REPEAT[name]).fill(text).join(' ');
  }
  if (TE_RING.includes(name) && text && !text.endsWith('•')) text += '•';
  el.__teText = text;

  let wordCount = 0;
  if (!TE_NO_SPLIT.includes(name) && text) {
    if (name === 'reflective') {
      el.textContent = '';
      for (let i = 0; i < 2; i++) {
        const s = doc.createElement('span');
        s.textContent = text;
        el.appendChild(s);
      }
    } else if (text !== originalText) {
      el.textContent = text;
    }
    wordCount = teSplitText(el, doc);
  }
  el.__teHasWords = wordCount > 0;

  // Colour / timing
  if (color) teSetProp(el, '--te-color', color);
  const speed = parseFloat(el.getAttribute('data-text-effect-speed'));
  const step = parseFloat(el.getAttribute('data-text-effect-step'));
  if (!isNaN(speed)) teSetProp(el, '--te-speed', `${speed}s`);
  if (!isNaN(step)) teSetProp(el, '--te-step', `${step}s`);

  teApplyExtras(el, name);

  // Accessibility: the split markup is meaningless to screen readers
  if (originalText) {
    if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', originalText); el.__teAddedLabel = true; }
    if (!el.hasAttribute('role')) { el.setAttribute('role', 'img'); el.__teAddedRole = true; }
  }

  // Scroll targets (same list ScrollOut used: .word + the root for a few effects)
  const targets = Array.from(el.querySelectorAll('.word'));
  if (TE_OBSERVE_SELF.includes(name) || TE_NO_SPLIT.includes(name)) targets.push(el);
  el.__teTargets = targets;
  targets.forEach((t) => {
    t.setAttribute('data-scroll', 'out');
    state.io.observe(t);
  });

  el.__teName = name;
  state.els.add(el);
};

/**
 * Re-run every effect from its hidden state (used when a flipbook page turns,
 * or you can call the returned `replay()` yourself).
 */
const teReplay = (doc, state) => {
  state.els.forEach((el) => {
    const targets = el.__teTargets || [];
    el.setAttribute('data-te-reset', '');
    targets.forEach((t) => { state.io.unobserve(t); t.setAttribute('data-scroll', 'out'); });
    void el.offsetWidth; // commit the "out" state with transitions disabled
    el.removeAttribute('data-te-reset');
    void el.offsetWidth;
    targets.forEach((t) => state.io.observe(t)); // observe() re-fires -> "in" if visible
  });
};

export const initTextEffectsRunner = function (doc) {
  // Re-initialisation is allowed (doc.write wipes the body but the doc object may persist)
  if (doc.__textEffectsState) {
    const old = doc.__textEffectsState;
    Array.from(old.els).forEach((el) => teTeardown(el, old));
    old.io.disconnect();
    old.mo.disconnect();
    if (old.win && old.onMessage) old.win.removeEventListener('message', old.onMessage);
  }

  const win = doc.defaultView || window;
  teInjectStyle(doc);

  const state = { els: new Set(), win };

  state.io = new win.IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.setAttribute('data-scroll', entry.isIntersecting ? 'in' : 'out'));
  }, { threshold: 0 });

  const scan = () => {
    teInjectStyle(doc);
    // Drop elements that were removed or lost their attribute
    Array.from(state.els).forEach((el) => {
      if (!el.isConnected || !el.hasAttribute('data-text-effect')) teTeardown(el, state);
    });
    doc.querySelectorAll('[data-text-effect]').forEach((el) => teProcess(el, doc, state));
  };

  state.mo = new win.MutationObserver(scan);
  state.mo.observe(doc.body || doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: TE_OWN_ATTRS,
  });

  // Flipbook / page-turn support (mirrors the messages the other runners use)
  state.onMessage = (e) => {
    if (!e.data) return;
    if (e.data.type === 'RETRIGGER_ANIMATIONS') {
      teReplay(doc, state);
    } else if (e.data.type === 'PAGE_TURNED') {
      const pageNum = win._pageNumber;
      const visible = e.data.visiblePages || [];
      if (pageNum === undefined || visible.includes(pageNum)) teReplay(doc, state);
    }
  };
  win.addEventListener('message', state.onMessage);

  doc.__textEffectsState = state;
  scan();

  return {
    replay: () => teReplay(doc, state),
    refresh: scan,
    destroy: () => {
      Array.from(state.els).forEach((el) => teTeardown(el, state));
      state.io.disconnect();
      state.mo.disconnect();
      win.removeEventListener('message', state.onMessage);
      const s = doc.getElementById(TE_STYLE_ID);
      if (s) s.remove();
      delete doc.__textEffectsState;
    },
  };
};
