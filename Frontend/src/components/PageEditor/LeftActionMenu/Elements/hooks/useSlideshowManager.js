import { useEffect, useRef } from 'react';
import Swiper from 'swiper/bundle';
import {
  getSwiperConfig,
  getNavIconSvg,
  renderNavIconToButton,
  renderSwiperSlidesHtml,
  defaultSampleImages,
  RingBuffer,
  RAFThrottler
} from '../utils/slideshowElementUtils';

/**
 * High-Performance Reactive Slideshow Manager Powered Exclusively by Swiper.js
 * 
 * Configured for navigation-button-only slide progression:
 * 1. Automatic initialization of Swiper instances on canvas mount.
 * 2. Slides advance ONLY via the navigation buttons (prev / next buttons).
 * 3. NO auto-sliding and NO sync back to the properties panel, ensuring the user's
 *    slide selection in properties is never disrupted.
 * 4. Clean lifecycle destruction on element remove.
 */
export const useSlideshowManager = () => {
  const activeSwipersRef = useRef(new Map());

  useEffect(() => {
    const activeSwipers = activeSwipersRef.current;

    // Helper: Initialize or update Swiper instance on an element
    const initOrUpdateSwiper = (el) => {
      if (!el || !document.contains(el)) return;
      const swiperContainer = el.querySelector('.swiper');
      if (!swiperContainer) return;

      const dataStr = el.getAttribute('data-slideshow');
      let data = {};
      try {
        data = dataStr ? JSON.parse(dataStr) : {};
      } catch (e) {
        data = {};
      }
      const settings = data.settings || {};
      const effect = (settings.transitionEffect || el.getAttribute('data-style') || 'coverflow').toLowerCase();

      const speedSec = Number(settings.speed) || 3;
      const isAuto = speedSec > 0 && Boolean(settings.autoSlide ?? settings.autoPlay ?? false);

      // Check if instance already exists
      let swiper = activeSwipers.get(el.id || el);
      if (swiper && !swiper.destroyed) {
        // If swiper container is detached from document or mismatch with live container, destroy stale instance
        if (!swiper.el || !document.contains(swiper.el) || swiper.el !== swiperContainer) {
          try { swiper.destroy(true, true); } catch (e) {}
          activeSwipers.delete(el.id || el);
          swiper = null;
          el._swiperInstance = null;
        } else if (swiper.params?.effect !== effect || swiper.params?.loop !== (settings.infiniteLoop !== false) || (!swiper.autoplay && isAuto)) {
          // Effect, loop, or autoplay module changed -> destroy old and create new
          try { swiper.destroy(true, true); } catch (e) {}
          activeSwipers.delete(el.id || el);
          swiper = null;
          el._swiperInstance = null;
        } else {
          try {
            swiper.params.loop = settings.infiniteLoop !== false;
            if (isAuto) {
              if (!swiper.params.autoplay || typeof swiper.params.autoplay !== 'object') {
                swiper.params.autoplay = { delay: speedSec * 1000, disableOnInteraction: false };
              } else {
                swiper.params.autoplay.delay = speedSec * 1000;
              }
              if (swiper.autoplay) {
                try { swiper.autoplay.start(); } catch (err) {}
              }
            } else {
              swiper.params.autoplay = false;
              if (swiper.autoplay) {
                try { swiper.autoplay.stop(); } catch (err) {}
              }
            }
            swiper.params.allowTouchMove = false;
            swiper.params.watchOverflow = false;

            const prevBtn = swiperContainer.querySelector('.swiper-button-prev');
            const nextBtn = swiperContainer.querySelector('.swiper-button-next');
            const navStyle = settings.navStyle || 1;
            const showArrows = settings.showArrows !== false && settings.showNav !== false;

            if (prevBtn) {
              renderNavIconToButton(prevBtn, navStyle, 'left', settings.navIconColor || '#ffffff');
              if (showArrows) {
                prevBtn.style.setProperty('display', 'flex', 'important');
                prevBtn.style.setProperty('visibility', 'visible', 'important');
              } else {
                prevBtn.style.setProperty('display', 'none', 'important');
              }
            }
            if (nextBtn) {
              renderNavIconToButton(nextBtn, navStyle, 'right', settings.navIconColor || '#ffffff');
              if (showArrows) {
                nextBtn.style.setProperty('display', 'flex', 'important');
                nextBtn.style.setProperty('visibility', 'visible', 'important');
              } else {
                nextBtn.style.setProperty('display', 'none', 'important');
              }
            }

            swiper.update();
            return;
          } catch (e) {
            try { swiper.destroy(true, true); } catch (err) {}
            swiper = null;
          }
        }
      }

      if (!swiper || swiper.destroyed) {
        if (swiperContainer.swiper) {
          try { swiperContainer.swiper.destroy(true, true); } catch (e) {}
        }

        // Clean any stale classes left by previous Swiper instance
        swiperContainer.classList.remove('swiper-initialized', 'swiper-horizontal', 'swiper-backface-hidden');

        // Ensure navigation buttons and pagination container exist in DOM
        let prevBtn = swiperContainer.querySelector('.swiper-button-prev');
        if (!prevBtn) {
          prevBtn = document.createElement('div');
          prevBtn.className = 'swiper-button-prev';
          swiperContainer.appendChild(prevBtn);
        }
        let nextBtn = swiperContainer.querySelector('.swiper-button-next');
        if (!nextBtn) {
          nextBtn = document.createElement('div');
          nextBtn.className = 'swiper-button-next';
          swiperContainer.appendChild(nextBtn);
        }
        let pagEl = swiperContainer.querySelector('.swiper-pagination');
        if (!pagEl) {
          pagEl = document.createElement('div');
          pagEl.className = 'swiper-pagination';
          swiperContainer.appendChild(pagEl);
        }

        // Remove any Swiper lock or disabled classes that hide the buttons
        prevBtn.classList.remove('swiper-button-lock', 'swiper-button-disabled');
        nextBtn.classList.remove('swiper-button-lock', 'swiper-button-disabled');
        pagEl.classList.remove('swiper-pagination-lock');

        const navStyle = settings.navStyle || 1;
        const showArrows = settings.showArrows !== false && settings.showNav !== false;
        const showDots = settings.showDots !== false;

        swiperContainer.classList.toggle('hide-nav-arrows', !showArrows);
        swiperContainer.classList.toggle('hide-pagination-dots', !showDots);

        prevBtn.innerHTML = getNavIconSvg(navStyle, 'left');
        nextBtn.innerHTML = getNavIconSvg(navStyle, 'right');
        renderNavIconToButton(prevBtn, navStyle, 'left', settings.navIconColor || '#ffffff');
        renderNavIconToButton(nextBtn, navStyle, 'right', settings.navIconColor || '#ffffff');

        if (showArrows) {
          prevBtn.style.setProperty('display', 'flex', 'important');
          prevBtn.style.setProperty('visibility', 'visible', 'important');
          prevBtn.style.setProperty('opacity', '1', 'important');
          nextBtn.style.setProperty('display', 'flex', 'important');
          nextBtn.style.setProperty('visibility', 'visible', 'important');
          nextBtn.style.setProperty('opacity', '1', 'important');
        } else {
          prevBtn.style.setProperty('display', 'none', 'important');
          nextBtn.style.setProperty('display', 'none', 'important');
        }

        if (showDots) {
          pagEl.style.setProperty('display', 'flex', 'important');
          pagEl.style.setProperty('visibility', 'visible', 'important');
          pagEl.style.setProperty('opacity', '1', 'important');
        } else {
          pagEl.style.setProperty('display', 'none', 'important');
        }

        const baseImages = (data.images && data.images.length > 0) ? data.images : defaultSampleImages;
        const isLoop = settings.infiniteLoop !== false;

        // Ensure wrapper has enough clean slides for seamless Swiper v11 loop mode
        const wrapper = swiperContainer.querySelector('.swiper-wrapper');
        if (wrapper) {
          wrapper.querySelectorAll('.swiper-slide-duplicate').forEach(n => n.remove());
          const currentCount = wrapper.querySelectorAll('.swiper-slide').length;
          const targetCount = isLoop ? Math.max(18, baseImages.length * Math.ceil(18 / baseImages.length)) : baseImages.length;
          if (currentCount < targetCount || wrapper.children.length === 0) {
            wrapper.innerHTML = renderSwiperSlidesHtml(baseImages, isLoop);
          }
        }

        const config = getSwiperConfig(effect, settings, baseImages.length);
        config.allowTouchMove = false;
        config.watchOverflow = false;
        config.pagination = showDots ? {
          el: pagEl,
          clickable: true,
          renderBullet: (index, className) => {
            if (index >= baseImages.length) return '';
            const numText = (settings.dotStyle === 12) ? `${index + 1}` : '';
            return `<span class="${className}">${numText}</span>`;
          }
        } : false;
        config.navigation = {
          nextEl: nextBtn,
          prevEl: prevBtn,
          addIcons: false,
          lockClass: 'swiper-button-never-lock'
        };

        try {
          swiper = new Swiper(swiperContainer, config);
          el._swiperInstance = swiper;
          if (el.id) activeSwipers.set(el.id, swiper);

          // Clear any inline backgrounds so CSS variables dictate colors reactively
          const bullets = swiperContainer.querySelectorAll('.swiper-pagination-bullet');
          bullets.forEach((b) => {
            b.style.removeProperty('background');
            b.style.removeProperty('border');
          });

          // DSA: Throttle slideChange events through RAFThrottler and calculate realIdx with RingBuffer
          const slideChangeThrottler = new RAFThrottler((realIdx) => {
            el.setAttribute('data-active-index', realIdx.toString());

            const curBullets = swiperContainer.querySelectorAll('.swiper-pagination-bullet');
            curBullets.forEach((b, idx) => {
              b.classList.toggle('swiper-pagination-bullet-active', idx === realIdx);
              b.style.removeProperty('background');
            });
          });

          swiper.on('slideChange', () => {
            const uniqueLen = baseImages.length || 1;
            const realIdx = RingBuffer.canonicalIndex(swiper.realIndex, uniqueLen);
            slideChangeThrottler.trigger(realIdx);
          });

          swiper.on('destroy', () => {
            slideChangeThrottler.cancel();
          });

          // Perform post-mount layout pass to ensure slides are perfectly centered in SVG viewport
          const syncCenter = () => {
            if (swiper && !swiper.destroyed) {
              swiper.update();
              const desiredIdx = Number(el.getAttribute('data-active-index')) || 0;
              const uniqueLen = baseImages.length || 1;
              const canonical = RingBuffer.canonicalIndex(desiredIdx, uniqueLen);
              if (swiper.params?.loop) {
                swiper.slideToLoop(canonical, 0, false);
              } else {
                swiper.slideTo(canonical, 0, false);
              }
            }
          };

          requestAnimationFrame(syncCenter);
          setTimeout(syncCenter, 50);
          setTimeout(syncCenter, 150);
        } catch (err) {
          console.warn('[useSlideshowManager] Swiper init error:', err);
        }
      }
    };

    // Initialize all existing slideshow elements
    const initAll = () => {
      const slideshows = document.querySelectorAll('[data-is-slideshow="true"], [data-type="slideshow"]');
      slideshows.forEach(el => initOrUpdateSwiper(el));
    };

    initAll();

    // ── Dedicated Navigation Button Pointer/Click Interception ─────────────────
    let lastNavTriggerTime = 0;
    let navPointerDownTarget = null;
    let navPointerDownTime = 0;

    const triggerSlide = (btn, isPrev, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const slideshowEl = btn.closest('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]')
        || btn.closest('foreignObject')?.parentElement;
      let swiper = btn.closest('.swiper')?.swiper
        || slideshowEl?._swiperInstance
        || activeSwipers.get(slideshowEl?.id);

      if ((!swiper || swiper.destroyed || !swiper.el || !document.contains(swiper.el)) && slideshowEl) {
        initOrUpdateSwiper(slideshowEl);
        swiper = slideshowEl._swiperInstance || activeSwipers.get(slideshowEl.id);
      }

      if (swiper && !swiper.destroyed) {
        // Prevent 3D glitching: do not interrupt active transition
        if (swiper.animating) return;
        const now = Date.now();
        const speed = swiper.params?.speed || 350;
        if (now - lastNavTriggerTime < speed) return;
        lastNavTriggerTime = now;

        if (isPrev) {
          swiper.slidePrev(speed);
        } else {
          swiper.slideNext(speed);
        }
      }
    };

    const handleNavigationClick = (e) => {
      const prevBtn = e.target.closest?.('.swiper-button-prev, [data-action="prev"]');
      if (prevBtn) {
        triggerSlide(prevBtn, true, e);
        return;
      }

      const nextBtn = e.target.closest?.('.swiper-button-next, [data-action="next"]');
      if (nextBtn) {
        triggerSlide(nextBtn, false, e);
        return;
      }

      const bullet = e.target.closest?.('.swiper-pagination-bullet');
      if (bullet) {
        e.preventDefault();
        e.stopPropagation();
        const swiperContainer = bullet.closest('.swiper');
        let swiper = swiperContainer?.swiper;
        if (!swiper || swiper.destroyed || !swiper.el || !document.contains(swiper.el)) {
          const slideshowEl = bullet.closest('[data-is-slideshow="true"], [data-type="slideshow"], g[id^="slideshow-"]')
            || bullet.closest('foreignObject')?.parentElement;
          if (slideshowEl) {
            initOrUpdateSwiper(slideshowEl);
            swiper = slideshowEl._swiperInstance || activeSwipers.get(slideshowEl.id);
          }
        }
        if (swiper && !swiper.destroyed) {
          if (swiper.animating) return;
          const bullets = Array.from(bullet.parentElement?.querySelectorAll('.swiper-pagination-bullet') || []);
          const index = bullets.indexOf(bullet);
          if (index !== -1) {
            const speed = swiper.params?.speed || 350;
            if (swiper.params?.loop) {
              swiper.slideToLoop(index, speed);
            } else {
              swiper.slideTo(index, speed);
            }
          }
        }
        return;
      }
    };

    const handleNavPointerDown = (e) => {
      const btn = e.target.closest?.('.swiper-button-prev, .swiper-button-next, [data-action="prev"], [data-action="next"]');
      if (btn) {
        navPointerDownTarget = btn;
        navPointerDownTime = Date.now();
        e.stopPropagation();
        return;
      }
      if (e.target.closest?.('.swiper-pagination, .swiper-pagination-bullet, [data-slideshow-nav]')) {
        e.stopPropagation();
      }
    };

    const handleNavPointerUp = (e) => {
      if (navPointerDownTarget) {
        const btn = e.target.closest?.('.swiper-button-prev, .swiper-button-next, [data-action="prev"], [data-action="next"]');
        const timeDiff = Date.now() - navPointerDownTime;
        if (btn && btn === navPointerDownTarget && timeDiff < 600) {
          const isPrev = Boolean(btn.matches('.swiper-button-prev, [data-action="prev"]') || btn.closest('.swiper-button-prev, [data-action="prev"]'));
          triggerSlide(btn, isPrev, e);
        }
        navPointerDownTarget = null;
      }
    };

    const handleReinit = (e) => {
      const id = e?.detail?.id;
      if (id) {
        const el = document.getElementById(id);
        if (el) initOrUpdateSwiper(el);
      } else {
        initAll();
      }
    };

    // ── DOM Mutation Observer for added/removed slideshow elements ────────────
    const observer = new MutationObserver((mutations) => {
      let needsScan = false;
      mutations.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.getAttribute?.('data-is-slideshow') === 'true' || node.querySelector?.('[data-is-slideshow="true"]')) {
                needsScan = true;
              }
            }
          });
          m.removedNodes.forEach(node => {
            if (node.nodeType === 1 && node.id && activeSwipers.has(node.id)) {
              const swiper = activeSwipers.get(node.id);
              if (swiper && !swiper.destroyed) {
                try { swiper.destroy(true, true); } catch (e) {}
              }
              activeSwipers.delete(node.id);
            }
          });
        } else if (m.type === 'attributes' && m.attributeName === 'data-slideshow') {
          initOrUpdateSwiper(m.target);
        }
      });

      if (needsScan) {
        initAll();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-slideshow', 'data-style']
    });

    document.addEventListener('pointerdown', handleNavPointerDown, true);
    document.addEventListener('mousedown', handleNavPointerDown, true);
    document.addEventListener('pointerup', handleNavPointerUp, true);
    document.addEventListener('mouseup', handleNavPointerUp, true);
    document.addEventListener('click', handleNavigationClick, true);
    window.addEventListener('slideshow-reinit-needed', handleReinit);

    return () => {
      observer.disconnect();
      document.removeEventListener('pointerdown', handleNavPointerDown, true);
      document.removeEventListener('mousedown', handleNavPointerDown, true);
      document.removeEventListener('pointerup', handleNavPointerUp, true);
      document.removeEventListener('mouseup', handleNavPointerUp, true);
      document.removeEventListener('click', handleNavigationClick, true);
      window.removeEventListener('slideshow-reinit-needed', handleReinit);
      activeSwipers.forEach(swiper => {
        if (swiper && !swiper.destroyed) {
          try { swiper.destroy(true, true); } catch (e) {}
        }
      });
      activeSwipers.clear();
    };
  }, []);
};
