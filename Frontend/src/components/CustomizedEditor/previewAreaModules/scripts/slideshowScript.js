export const getSlideshowScript = () => `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
  <style>
    .flipibook-swiper-container {
      width: 100% !important;
      height: 100% !important;
      position: relative;
      overflow: hidden !important;
      user-select: none;
    }
    .flipibook-swiper-container .swiper-wrapper {
      display: flex !important;
      align-items: center !important;
      width: 100% !important;
      height: 100% !important;
    }
    .flipibook-swiper-container .swiper-slide {
      background-position: center;
      background-size: cover;
      display: flex !important;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    .flipibook-swiper-container.swiper-effect-coverflow .swiper-slide {
      width: 80% !important;
      height: 100% !important;
      border-radius: inherit !important;
      overflow: hidden;
      box-shadow: none !important;
    }
    .flipibook-swiper-container.swiper-effect-cards .swiper-slide {
      width: 85% !important;
      height: 100% !important;
      border-radius: inherit !important;
      overflow: hidden;
      box-shadow: none !important;
    }
    /* Flip Slide Dimensions & 3D Centered Frame */
    .flipibook-swiper-container.swiper-effect-flip {
      perspective: 1200px !important;
    }
    .flipibook-swiper-container.swiper-effect-flip .swiper-wrapper {
      width: 100% !important;
      height: 100% !important;
      transform-style: preserve-3d !important;
    }
    .flipibook-swiper-container.swiper-effect-flip .swiper-slide {
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      padding: 14px 44px 26px 44px !important;
      background: transparent !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      transform-style: preserve-3d !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .flipibook-swiper-container.swiper-effect-flip .swiper-slide img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      border-radius: 10px !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45) !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      display: block !important;
    }
    .flipibook-swiper-container.swiper-effect-flip .swiper-slide .swiper-slide-caption {
      left: 44px !important;
      right: 44px !important;
      bottom: 26px !important;
      border-bottom-left-radius: 10px !important;
      border-bottom-right-radius: 10px !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
    }
    .flipibook-swiper-container.swiper-effect-flip .swiper-slide-shadow-flip,
    .flipibook-swiper-container.swiper-effect-flip .swiper-slide-shadow-left,
    .flipibook-swiper-container.swiper-effect-flip .swiper-slide-shadow-right {
      left: 44px !important;
      right: 44px !important;
      top: 14px !important;
      bottom: 26px !important;
      border-radius: 10px !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
    }
    /* Cube & Fade Slide Dimensions */
    .flipibook-swiper-container.swiper-effect-cube .swiper-slide,
    .flipibook-swiper-container.swiper-effect-fade .swiper-slide {
      width: 100% !important;
      height: 100% !important;
    }
    .flipibook-swiper-container .swiper-slide img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .flipibook-swiper-container .swiper-slide-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 6px 14px 28px 14px !important;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%);
      color: #ffffff;
      text-align: center;
      pointer-events: none;
    }
    .flipibook-swiper-container .swiper-button-prev,
    .flipibook-swiper-container .swiper-button-next {
      position: absolute !important;
      width: calc(28px * var(--nav-scale, 0.7)) !important;
      height: calc(28px * var(--nav-scale, 0.7)) !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border-radius: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s ease, opacity 0.2s ease !important;
      z-index: 35 !important;
      color: var(--swiper-navigation-color, #ffffff) !important;
      opacity: var(--nav-opacity, 1) !important;
      margin-top: calc(-14px * var(--nav-scale, 0.7)) !important;
      top: 50% !important;
      visibility: visible !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }
    .flipibook-swiper-container .swiper-button-prev {
      left: 8px !important;
      right: auto !important;
    }
    .flipibook-swiper-container .swiper-button-next {
      right: 8px !important;
      left: auto !important;
    }
    /* Prevent Swiper button lock from hiding manual navigation buttons */
    .flipibook-swiper-container .swiper-button-prev.swiper-button-lock,
    .flipibook-swiper-container .swiper-button-next.swiper-button-lock,
    .flipibook-swiper-container .swiper-button-prev.swiper-button-disabled,
    .flipibook-swiper-container .swiper-button-next.swiper-button-disabled {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      cursor: pointer !important;
      pointer-events: auto !important;
    }
    .flipibook-swiper-container .swiper-pagination.swiper-pagination-lock,
    .flipibook-swiper-container .swiper-pagination.swiper-pagination-disabled {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    .flipibook-swiper-container .swiper-button-prev:hover,
    .flipibook-swiper-container .swiper-button-next:hover {
      background: transparent !important;
      border-color: transparent !important;
      box-shadow: none !important;
      transform: scale(1.15) !important;
    }
    .flipibook-swiper-container .swiper-button-prev:active,
    .flipibook-swiper-container .swiper-button-next:active {
      transform: scale(0.92) !important;
    }
    .flipibook-swiper-container .swiper-button-prev *,
    .flipibook-swiper-container .swiper-button-next * {
      pointer-events: none !important;
    }
    .flipibook-swiper-container .swiper-button-prev svg,
    .flipibook-swiper-container .swiper-button-next svg {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
      display: block !important;
      color: inherit !important;
      filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.8)) !important;
      pointer-events: none !important;
    }
    /* Style 1 (lucide:chevron) and Style 12 (lucide:arrow): stroke-based icons */
    .flipibook-swiper-container[data-nav-style="1"] .swiper-button-prev svg,
    .flipibook-swiper-container[data-nav-style="1"] .swiper-button-next svg,
    .flipibook-swiper-container[data-nav-style="12"] .swiper-button-prev svg,
    .flipibook-swiper-container[data-nav-style="12"] .swiper-button-next svg {
      fill: none !important;
      stroke: currentColor !important;
    }
    /* Styles 2-11: fill-based icons */
    .flipibook-swiper-container:not([data-nav-style="1"]):not([data-nav-style="12"]) .swiper-button-prev svg,
    .flipibook-swiper-container:not([data-nav-style="1"]):not([data-nav-style="12"]) .swiper-button-next svg {
      fill: currentColor !important;
      stroke: none !important;
    }
    .flipibook-swiper-container .swiper-button-prev svg [fill="#ffffff"],
    .flipibook-swiper-container .swiper-button-next svg [fill="#ffffff"] {
      fill: #ffffff !important;
      stroke: none !important;
    }
    .flipibook-swiper-container .swiper-button-prev::after,
    .flipibook-swiper-container .swiper-button-next::after {
      display: none !important;
    }
    .flipibook-swiper-container .swiper-button-prev:has(svg)::after,
    .flipibook-swiper-container .swiper-button-next:has(svg)::after {
      display: none !important;
    }
    .flipibook-swiper-container .swiper-pagination {
      bottom: 8px !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      z-index: 25 !important;
      pointer-events: auto !important;
    }
    .flipibook-swiper-container.swiper-effect-coverflow .swiper-pagination,
    .flipibook-swiper-container.swiper-effect-cards .swiper-pagination {
      bottom: 8px !important;
    }
    .flipibook-swiper-container .swiper-pagination-bullet {
      width: calc(8px * var(--dot-scale, 0.7)) !important;
      height: calc(8px * var(--dot-scale, 0.7)) !important;
      border-radius: 50% !important;
      background: var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important;
      border: none !important;
      opacity: calc(var(--dot-opacity, 1) * 0.4) !important;
      margin: 0 !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .flipibook-swiper-container .swiper-pagination-bullet:hover {
      opacity: 0.75 !important;
      transform: scale(1.15) !important;
    }
    .flipibook-swiper-container .swiper-pagination-bullet-active,
    .flipibook-swiper-container .swiper-pagination-bullet.swiper-pagination-bullet-active,
    .flipibook-swiper-container[data-dot-style] .swiper-pagination-bullet.swiper-pagination-bullet-active,
    .flipibook-swiper-container[data-dot-style] .swiper-pagination-bullet-active {
      background: var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important;
      opacity: var(--dot-opacity, 1) !important;
      border-color: transparent !important;
    }
    /* Navigation & Pagination Visibility Overrides */
    .flipibook-swiper-container.hide-nav-arrows .swiper-button-prev,
    .flipibook-swiper-container.hide-nav-arrows .swiper-button-next,
    .flipibook-swiper-container .swiper-button-prev[style*="display: none"],
    .flipibook-swiper-container .swiper-button-next[style*="display: none"] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .flipibook-swiper-container.hide-pagination-dots .swiper-pagination,
    .flipibook-swiper-container .swiper-pagination[style*="display: none"] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    /* Custom Dot Styles */
    .flipibook-swiper-container[data-dot-style="1"] .swiper-pagination-bullet { border-radius: 50% !important; width: calc(8px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="1"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="1"] .swiper-pagination-bullet.swiper-pagination-bullet-active { border-radius: 50% !important; width: calc(8px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; transform: scale(1.35) !important; }
    .flipibook-swiper-container[data-dot-style="2"] .swiper-pagination-bullet { border-radius: 9999px !important; width: calc(8px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="2"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="2"] .swiper-pagination-bullet.swiper-pagination-bullet-active { width: calc(20px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; border-radius: 9999px !important; transform: scale(1) !important; }
    .flipibook-swiper-container[data-dot-style="3"] .swiper-pagination-bullet { border-radius: 2px !important; width: calc(8px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="3"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="3"] .swiper-pagination-bullet.swiper-pagination-bullet-active { border-radius: 2px !important; width: calc(8px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; transform: scale(1.25) !important; }
    .flipibook-swiper-container[data-dot-style="4"] .swiper-pagination-bullet { border-radius: 50% !important; background: transparent !important; border: 1.5px solid var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; opacity: 0.6 !important; width: calc(8px * var(--dot-scale, 0.7)) !important; height: calc(8px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="4"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="4"] .swiper-pagination-bullet.swiper-pagination-bullet-active { background: var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; opacity: 1 !important; border: 1.5px solid transparent !important; transform: scale(1.25) !important; }
    .flipibook-swiper-container[data-dot-style="5"] .swiper-pagination-bullet { border-radius: 1px !important; width: calc(12px * var(--dot-scale, 0.7)) !important; height: calc(3.5px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="5"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="5"] .swiper-pagination-bullet.swiper-pagination-bullet-active { width: calc(20px * var(--dot-scale, 0.7)) !important; height: calc(3.5px * var(--dot-scale, 0.7)) !important; border-radius: 1px !important; }
    .flipibook-swiper-container[data-dot-style="6"] .swiper-pagination-bullet { border-radius: 1px !important; transform: rotate(45deg) !important; width: calc(7px * var(--dot-scale, 0.7)) !important; height: calc(7px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="6"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="6"] .swiper-pagination-bullet.swiper-pagination-bullet-active { transform: rotate(45deg) scale(1.25) !important; }
    .flipibook-swiper-container[data-dot-style="7"] .swiper-pagination-bullet { border-radius: 50% !important; background: transparent !important; border: 1.5px solid var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; opacity: 0.45 !important; width: calc(9px * var(--dot-scale, 0.7)) !important; height: calc(9px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="7"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="7"] .swiper-pagination-bullet.swiper-pagination-bullet-active { background: radial-gradient(circle, var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) 42%, transparent 48%) !important; border: 1.5px solid var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; border-color: var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; opacity: 1 !important; transform: scale(1.3) !important; }
    .flipibook-swiper-container[data-dot-style="8"] .swiper-pagination-bullet { border-radius: 3px !important; width: calc(15px * var(--dot-scale, 0.7)) !important; height: calc(5px * var(--dot-scale, 0.7)) !important; opacity: calc(var(--dot-opacity, 1) * 0.35) !important; }
    .flipibook-swiper-container[data-dot-style="8"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="8"] .swiper-pagination-bullet.swiper-pagination-bullet-active { width: calc(18px * var(--dot-scale, 0.7)) !important; height: calc(5px * var(--dot-scale, 0.7)) !important; border-radius: 3px !important; transform: scale(1.15) !important; }
    .flipibook-swiper-container[data-dot-style="9"] .swiper-pagination-bullet { width: calc(4.5px * var(--dot-scale, 0.7)) !important; height: calc(4.5px * var(--dot-scale, 0.7)) !important; border-radius: 50% !important; opacity: calc(var(--dot-opacity, 1) * 0.3) !important; }
    .flipibook-swiper-container[data-dot-style="9"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="9"] .swiper-pagination-bullet.swiper-pagination-bullet-active { width: calc(4.5px * var(--dot-scale, 0.7)) !important; height: calc(4.5px * var(--dot-scale, 0.7)) !important; border-radius: 50% !important; transform: scale(1.4) !important; }
    .flipibook-swiper-container[data-dot-style="10"] .swiper-pagination-bullet { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%) !important; border-radius: 0 !important; width: calc(10px * var(--dot-scale, 0.7)) !important; height: calc(10px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="10"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="10"] .swiper-pagination-bullet.swiper-pagination-bullet-active { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%) !important; border-radius: 0 !important; width: calc(10px * var(--dot-scale, 0.7)) !important; height: calc(10px * var(--dot-scale, 0.7)) !important; transform: scale(1.25) !important; }
    .flipibook-swiper-container[data-dot-style="11"] .swiper-pagination-bullet { clip-path: polygon(50% 15%, 65% 0%, 85% 0%, 100% 15%, 100% 40%, 50% 90%, 0% 40%, 0% 15%, 15% 0%, 35% 0%) !important; border-radius: 0 !important; width: calc(10px * var(--dot-scale, 0.7)) !important; height: calc(10px * var(--dot-scale, 0.7)) !important; }
    .flipibook-swiper-container[data-dot-style="11"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="11"] .swiper-pagination-bullet.swiper-pagination-bullet-active { clip-path: polygon(50% 15%, 65% 0%, 85% 0%, 100% 15%, 100% 40%, 50% 90%, 0% 40%, 0% 15%, 15% 0%, 35% 0%) !important; border-radius: 0 !important; width: calc(10px * var(--dot-scale, 0.7)) !important; height: calc(10px * var(--dot-scale, 0.7)) !important; transform: scale(1.25) !important; }
    .flipibook-swiper-container[data-dot-style="12"] .swiper-pagination-bullet { width: calc(15px * var(--dot-scale, 0.7)) !important; height: calc(15px * var(--dot-scale, 0.7)) !important; border-radius: 50% !important; font-size: calc(8.5px * var(--dot-scale, 0.7)) !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; background: transparent !important; color: var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; border: 1px solid var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; opacity: 0.55 !important; font-weight: 700 !important; }
    .flipibook-swiper-container[data-dot-style="12"] .swiper-pagination-bullet-active, .flipibook-swiper-container[data-dot-style="12"] .swiper-pagination-bullet.swiper-pagination-bullet-active { background: var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; color: #ffffff !important; border: 1px solid var(--swiper-pagination-color, var(--swiper-theme-color, #3b82f6)) !important; opacity: 1 !important; transform: scale(1.1) !important; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script>
    (function() {
      function getSwiperConfig(effectName, settings) {
        var norm = String(effectName || 'coverflow').toLowerCase();
        var speedSec = Number(settings.speed) || 3;
        var loop = settings.infiniteLoop !== false;
        var autoPlay = settings.autoSlide === true || settings.autoPlay === true;
        var isAuto = speedSec > 0 && autoPlay;

        var baseConfig = {
          grabCursor: false,
          allowTouchMove: false,
          loop: loop,
          loopPreventsSliding: true,
          preventInteractionOnTransition: true,
          loopAdditionalSlides: 2,
          speed: 350,
          watchOverflow: false,
          autoplay: isAuto ? {
            delay: speedSec * 1000,
            disableOnInteraction: false
          } : false,
          observer: true,
          observeParents: true,
          resizeObserver: true
        };

        if (norm === 'cube') {
          baseConfig.effect = 'cube';
          baseConfig.slidesPerView = 1;
          baseConfig.cubeEffect = {
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94
          };
        } else if (norm === 'cards') {
          baseConfig.effect = 'cards';
          baseConfig.slidesPerView = 'auto';
          baseConfig.cardsEffect = {
            slideShadows: true,
            perSlideOffset: 8,
            perSlideRotate: 2
          };
        } else if (norm === 'flip') {
          baseConfig.effect = 'flip';
          baseConfig.slidesPerView = 1;
          baseConfig.flipEffect = {
            slideShadows: true,
            limitRotation: true
          };
        } else if (norm === 'fade') {
          baseConfig.effect = 'fade';
          baseConfig.slidesPerView = 1;
          baseConfig.fadeEffect = {
            crossFade: true
          };
        } else {
          baseConfig.effect = 'coverflow';
          baseConfig.centeredSlides = true;
          baseConfig.slidesPerView = 'auto';
          baseConfig.loopAdditionalSlides = 0;
          baseConfig.loopAddBlankSlides = true;
          baseConfig.coverflowEffect = {
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
          };
        }
        return baseConfig;
      }

      function initSwipers() {
        if (typeof Swiper === 'undefined') {
          setTimeout(initSwipers, 100);
          return;
        }

        var elements = document.querySelectorAll('[data-slideshow], [data-is-slideshow="true"]');
        elements.forEach(function(el) {
          if (el.dataset.swiperInitialized) return;
          var container = el.querySelector('.swiper');
          if (!container) return;
          el.dataset.swiperInitialized = 'true';

          try {
            var dataStr = el.getAttribute('data-slideshow') || el.dataset.slideshow;
            var data = dataStr ? JSON.parse(dataStr) : {};
            var settings = data.settings || {};
            var effect = (settings.transitionEffect || el.getAttribute('data-style') || 'coverflow').toLowerCase();

            var imagesList = (data.images && data.images.length > 0) ? data.images : [];
            var uniqueLen = imagesList.length || 3;
            var activeIdx = Number(el.getAttribute('data-active-index')) || 0;

            var config = getSwiperConfig(effect, settings);
            config.initialSlide = activeIdx;

            if (settings.showDots !== false) {
              var pagEl = container.querySelector('.swiper-pagination');
              if (pagEl) {
                config.pagination = {
                  el: pagEl,
                  clickable: true,
                  renderBullet: function(index, className) {
                    if (index >= uniqueLen) return '';
                    var numText = (settings.dotStyle === 12) ? (index + 1) : '';
                    return '<span class="' + className + '">' + numText + '</span>';
                  }
                };
              }
            }

            if (settings.showArrows !== false) {
              var prevBtn = container.querySelector('.swiper-button-prev');
              var nextBtn = container.querySelector('.swiper-button-next');
              if (prevBtn && nextBtn) {
                config.navigation = { nextEl: nextBtn, prevEl: prevBtn };
                if (!prevBtn.querySelector('svg')) {
                  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;"><polyline points="15 18 9 12 15 6"></polyline></svg>';
                }
                if (!nextBtn.querySelector('svg')) {
                  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;"><polyline points="9 18 15 12 9 6"></polyline></svg>';
                }
              }
            }

            var readerSwiper = new Swiper(container, config);
            requestAnimationFrame(function() {
              if (readerSwiper && !readerSwiper.destroyed) {
                readerSwiper.update();
                if (activeIdx > 0) {
                  if (readerSwiper.params && readerSwiper.params.loop) {
                    readerSwiper.slideToLoop(activeIdx, 0, false);
                  } else {
                    readerSwiper.slideTo(activeIdx, 0, false);
                  }
                }
              }
            });
            setTimeout(function() {
              if (readerSwiper && !readerSwiper.destroyed) {
                readerSwiper.update();
              }
            }, 100);
            readerSwiper.on('slideChange', function() {
              var realIdx = ((readerSwiper.realIndex % uniqueLen) + uniqueLen) % uniqueLen;
              var bullets = container.querySelectorAll('.swiper-pagination-bullet');
              bullets.forEach(function(b, idx) {
                if (idx === realIdx) {
                  b.classList.add('swiper-pagination-bullet-active');
                } else {
                  b.classList.remove('swiper-pagination-bullet-active');
                }
              });
            });
          } catch (err) {
            console.warn('[Reader Slideshow] Swiper init error:', err);
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwipers);
      } else {
        initSwipers();
      }
      setTimeout(initSwipers, 500);
      setTimeout(initSwipers, 1500);
    })();
  </script>`;

export default getSlideshowScript;
