import { useEffect, useRef } from 'react';

const CENTER_PLAY_SVG = `<svg width="50%" height="50%" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 2px;"><polygon points="7 4 19 12 7 20 7 4"/></svg>`;
const CENTER_PAUSE_SVG = `<svg width="50%" height="50%" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;

/**
 * Custom hook to render and sync custom HTML5 video controls overlays,
 * progress bars, play/pause, volume, seek, and fullscreen handlers.
 */
export const useVideoControls = ({ setSelectedLayerId, selectedLayerId, activePageIndex, updateElementAttribute }) => {
  const selectedLayerIdRef = useRef(selectedLayerId);
  useEffect(() => {
    selectedLayerIdRef.current = selectedLayerId;
    document.querySelectorAll('.custom-video-overlay').forEach(b => {
      if (b._updateSelectionVisibility) b._updateSelectionVisibility();
    });
  }, [selectedLayerId]);

  useEffect(() => {
    // Inject global styles for the video overlay and progress bar
    const thumbStyleId = 'global-custom-video-progress-style';
    if (!document.getElementById(thumbStyleId)) {
      const ts = document.createElement('style');
      ts.id = thumbStyleId;
      ts.textContent = `
        .custom-video-overlay {
          opacity: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.85) 100%) !important;
          transition: opacity 0.22s ease !important;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .custom-video-overlay.video-is-hovered,
        .custom-video-overlay:hover,
        .video-container:hover > .custom-video-overlay,
        #temp-fs-wrapper:hover .custom-video-overlay {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        .custom-video-overlay button {
          outline: none !important;
          box-shadow: none !important;
        }
        .custom-video-overlay button:hover {
          transform: scale(1.08);
          opacity: 1 !important;
        }
        .custom-video-overlay button:active {
          transform: scale(0.95);
        }
        .custom-center-play-btn {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          border-radius: 50% !important;
          background: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(4px) !important;
          -webkit-backdrop-filter: blur(4px) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.5) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45) !important;
          color: #ffffff !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: none !important;
          opacity: 0;
          z-index: 15 !important;
        }
        .custom-center-play-btn.animate-flash {
          animation: ytCenterPulse 550ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
        }
        @keyframes ytCenterPulse {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.65);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          55% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.35);
          }
        }
      `;
      document.head.appendChild(ts);
    }

    let intervalId;
    const renderVideoControls = () => {
      // Disable native controls globally
      document.querySelectorAll('[data-page-index] video, foreignObject video').forEach(v => {
        if (!v.hasAttribute('data-custom-ctrl-active')) {
          v.controls = false;
          v.removeAttribute('controls');
        }
      });

      const videos = document.querySelectorAll('.page-svg-container video, #temp-fs-wrapper video');
      videos.forEach(video => {
        // Skip re-rendering while video is inside fullscreen wrapper
        if (video.closest('#temp-fs-wrapper')) {
          return;
        }

        const fo = video.closest('foreignObject');
        const videoGroup = fo ? fo.closest('[data-is-video-group="true"]') : null;
        const liveEl = videoGroup || (fo ? (fo.closest('[id]') || fo) : (video.closest('[id]') || video));
        const layerId = liveEl?.id || fo?.id || video.id;
        if (!layerId) return;

        // Ensure video is properly wrapped in a standard HTML .video-container
        let mountPoint = video.parentElement;
        if (mountPoint && mountPoint.tagName.toLowerCase() === 'foreignobject') {
          let container = mountPoint.querySelector('.video-container');
          if (!container) {
            container = document.createElement('div');
            container.className = 'video-container';
            Object.assign(container.style, {
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
            });
            mountPoint.insertBefore(container, video);
            container.appendChild(video);
          }
          mountPoint = container;
        }
        if (!mountPoint) return;

        if (mountPoint.style) {
          mountPoint.style.position = 'relative';
        }

        // APPLY CUSTOM VIDEO PROPERTIES
        const pbSpeedStr = video.getAttribute('data-playback-speed');
        if (pbSpeedStr) {
          const pbSpeed = parseFloat(pbSpeedStr.replace('x', ''));
          if (!isNaN(pbSpeed)) video.playbackRate = pbSpeed;
        }

        if (!video.hasAttribute('data-video-props-applied')) {
          video.setAttribute('data-video-props-applied', 'true');

          const defVolStr = video.getAttribute('data-default-volume');
          if (defVolStr) {
            video.volume = parseInt(defVolStr, 10) / 100;
          }

          const startTimeAttr = video.getAttribute('data-start-time');
          let sTime = 0;
          if (startTimeAttr) {
            const parts = startTimeAttr.split(':').map(Number);
            if (parts.length === 3) sTime = parts[0] * 3600 + parts[1] * 60 + parts[2];
            else if (parts.length === 2) sTime = parts[0] * 60 + parts[1];
          }
          const endTimeAttr = video.getAttribute('data-end-time');
          let eTime = Infinity;
          if (endTimeAttr) {
            const parts = endTimeAttr.split(':').map(Number);
            if (parts.length === 3) eTime = parts[0] * 3600 + parts[1] * 60 + parts[2];
            else if (parts.length === 2) eTime = parts[0] * 60 + parts[1];
          }
          video._startTime = sTime;
          video._endTime = eTime;

          if (sTime > 0) {
            video.currentTime = sTime;
          }

          video.addEventListener('timeupdate', () => {
            if (video._startTime > 0 && video.currentTime < video._startTime - 0.5) {
              video.currentTime = video._startTime;
            }
            if (video._endTime < Infinity && video.currentTime >= video._endTime) {
              if (video.loop) {
                video.currentTime = video._startTime;
              } else {
                video.pause();
              }
            }
          });

          const resumeBehavior = video.getAttribute('data-resume-behavior');
          if (resumeBehavior === "Start from Beginning") {
            video.addEventListener('play', () => {
              if (video._wasPaused) {
                video.currentTime = video._startTime || 0;
              }
              video._wasPaused = false;
            });
            video.addEventListener('pause', () => {
              video._wasPaused = true;
            });
          }

          const playVideoWhile = video.getAttribute('data-play-video-while');
          if (video._prevPlayVideoWhile !== playVideoWhile) {
            video._prevPlayVideoWhile = playVideoWhile;
            if (playVideoWhile === "Auto Play While on Page" || playVideoWhile === "Auto Play on Page Open") {
              video.play().catch(() => { });
            } else if (playVideoWhile === "Click to Play" || playVideoWhile === "Manual (Click to Play)") {
              video.pause();
            }
          }
        }

        const ctrlId = `custom-ctrl-${layerId}`;
        let bar = document.getElementById(ctrlId);

        // Remove any duplicate or stale overlays in the container
        mountPoint.querySelectorAll('.custom-video-overlay').forEach(existing => {
          if (existing !== bar) {
            if (existing._cleanup) existing._cleanup();
            existing.remove();
          }
        });

        // If bar exists but points to a different video, recreate it
        if (bar && bar._video !== video) {
          if (bar._cleanup) bar._cleanup();
          bar.remove();
          bar = null;
        }

        const showPlayPause = video.getAttribute('data-show-play-pause') !== 'false';
        const showSkipButton = video.getAttribute('data-show-skip-button') !== 'false';
        const showProgressBar = video.getAttribute('data-show-progress-bar') !== 'false';
        const showLoopButton = video.getAttribute('data-show-loop-button') !== 'false';
        const showFullscreenButton = video.getAttribute('data-show-fullscreen-button') !== 'false';
        const showVolumeControl = video.getAttribute('data-show-volume-control') !== 'false';
        const showDownloadButton = video.getAttribute('data-show-download-button') !== 'false';
        const showControls = video.getAttribute('data-show-controls') !== 'false';

        if (bar) {
          const repBtn = bar.querySelector('.custom-repeat-btn');
          if (repBtn) repBtn.style.opacity = video.loop ? '1' : '0.5';

          const progC = bar.querySelector('.custom-prog-container');
          const volBtn = bar.querySelector('.custom-vol-btn');
          const rewindBtn = bar.querySelector('.custom-rewind-btn');
          const forwardBtn = bar.querySelector('.custom-forward-btn');
          const playBtn = bar.querySelector('.custom-play-btn');
          const centerPlayBtn = bar.querySelector('.custom-center-play-btn');
          const fsBtn = bar.querySelector('.custom-fs-btn');
          const dlBtn = bar.querySelector('.custom-download-btn');

          if (volBtn) volBtn.style.display = showVolumeControl ? 'flex' : 'none';
          if (rewindBtn) rewindBtn.style.display = showSkipButton ? 'flex' : 'none';
          if (forwardBtn) forwardBtn.style.display = showSkipButton ? 'flex' : 'none';
          if (playBtn) playBtn.style.display = showPlayPause ? 'flex' : 'none';
          if (repBtn) repBtn.style.display = showLoopButton ? 'flex' : 'none';
          if (fsBtn) fsBtn.style.display = showFullscreenButton ? 'flex' : 'none';
          if (dlBtn) dlBtn.style.display = showDownloadButton ? 'flex' : 'none';
          if (progC) progC.style.display = showProgressBar ? 'flex' : 'none';

          if (bar._updateSelectionVisibility) bar._updateSelectionVisibility();
          if (bar._updateLayout) bar._updateLayout();
        }

        if (!bar) {
          video.controls = false;
          video.removeAttribute('controls');
          video.setAttribute('data-custom-ctrl-active', 'true');

          if (!window._videoHoverTrackerAdded) {
            window._videoHoverTrackerAdded = true;
            window.addEventListener('pointermove', (e) => {
              document.querySelectorAll('.custom-video-overlay').forEach(b => {
                const rect = b.getBoundingClientRect();
                const isInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                  e.clientY >= rect.top && e.clientY <= rect.bottom;
                if (isInside) {
                  b.classList.add('video-is-hovered');
                } else {
                  b.classList.remove('video-is-hovered');
                }
              });
            });
          }

          bar = document.createElement('div');
          bar.id = ctrlId;
          bar._video = video;
          bar.className = 'custom-video-overlay' + (video.paused ? ' is-paused' : '');
          Object.assign(bar.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            zIndex: '20',
            pointerEvents: 'none',
            overflow: 'hidden',
            userSelect: 'none',
          });

          // Mount-level instant hover tracking
          if (!bar._hoverBound) {
            bar._hoverBound = true;
            let hideTimeout = null;
            const resetHideTimeout = () => {
              if (hideTimeout) clearTimeout(hideTimeout);
              if (!video.paused) {
                hideTimeout = setTimeout(() => {
                  bar.classList.remove('video-is-hovered');
                }, 2500);
              }
            };

            const onMountEnter = () => {
              bar.classList.add('video-is-hovered');
              resetHideTimeout();
            };
            const onMountMove = () => {
              bar.classList.add('video-is-hovered');
              resetHideTimeout();
            };
            const onMountLeave = () => {
              if (hideTimeout) clearTimeout(hideTimeout);
              bar.classList.remove('video-is-hovered');
            };

            mountPoint.addEventListener('pointerenter', onMountEnter);
            mountPoint.addEventListener('pointermove', onMountMove);
            mountPoint.addEventListener('pointerleave', onMountLeave);

            bar._onMountEnter = onMountEnter;
            bar._onMountMove = onMountMove;
            bar._onMountLeave = onMountLeave;
            bar._clearHideTimeout = () => { if (hideTimeout) clearTimeout(hideTimeout); };
          }

          // Top Right: Volume (Previous thin stroke 0.8 style, big icon)
          const topContainer = document.createElement('div');
          topContainer.className = 'custom-top-container';
          Object.assign(topContainer.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            pointerEvents: 'none',
            flexShrink: '0',
          });

          const volumeBtn = document.createElement('button');
          volumeBtn.className = 'custom-vol-btn';
          Object.assign(volumeBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showVolumeControl ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            opacity: '0.85',
            flexShrink: '0',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
            transition: 'all 0.15s ease',
          });

          const VOL_ON_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
          const VOL_OFF_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

          const updateVolumeIcon = () => {
            volumeBtn.innerHTML = (video.muted || video.volume === 0) ? VOL_OFF_SVG : VOL_ON_SVG;
          };
          updateVolumeIcon();

          volumeBtn.onclick = (e) => {
            e.stopPropagation();
            const isMuted = !video.muted;
            video.muted = isMuted;
            if (isMuted) video.setAttribute('muted', '');
            else video.removeAttribute('muted');
            updateVolumeIcon();
            if (setSelectedLayerId) setSelectedLayerId(layerId);
          };
          video.addEventListener('volumechange', updateVolumeIcon);
          topContainer.appendChild(volumeBtn);

          // Center: Previous clean icon + "3s" text style, NO bubble background, with YouTube-style center Play/Pause pulse
          const centerContainer = document.createElement('div');
          centerContainer.className = 'custom-center-container';
          Object.assign(centerContainer.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0 4%',
            flexGrow: '1',
            minHeight: '0',
            pointerEvents: 'auto',
            boxSizing: 'border-box',
            cursor: 'pointer',
            position: 'relative',
          });

          const REWIND_ICON = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>`;
          const FORWARD_ICON = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>`;

          const leftSlot = document.createElement('div');
          Object.assign(leftSlot.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: '1 1 0%',
            minWidth: '0',
            pointerEvents: 'none',
          });

          const rewindBtn = document.createElement('button');
          rewindBtn.className = 'custom-rewind-btn';
          Object.assign(rewindBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showSkipButton ? 'flex' : 'none',
            alignItems: 'center',
            gap: '2px',
            pointerEvents: 'auto',
            flexShrink: '0',
            opacity: '0.9',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            transition: 'all 0.15s ease',
          });
          rewindBtn.innerHTML = `<span class="skip-svg-wrap" style="display:flex;align-items:center;">${REWIND_ICON}</span><span class="skip-text" style="white-space:nowrap;line-height:1;margin-left:2px;">3s</span>`;
          rewindBtn.onclick = (e) => {
            e.stopPropagation();
            video.currentTime = Math.max(0, video.currentTime - 3);
            if (setSelectedLayerId) setSelectedLayerId(layerId);
          };
          leftSlot.appendChild(rewindBtn);

          // Center Slot & YouTube-style center Play/Pause flash indicator
          const centerSlot = document.createElement('div');
          Object.assign(centerSlot.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flex: '0 0 auto',
            pointerEvents: 'none',
          });

          const centerPlayBtn = document.createElement('div');
          centerPlayBtn.className = 'custom-center-play-btn';
          centerSlot.appendChild(centerPlayBtn);

          const triggerCenterFlash = (action) => {
            centerPlayBtn.innerHTML = action === 'play' ? CENTER_PLAY_SVG : CENTER_PAUSE_SVG;
            centerPlayBtn.classList.remove('animate-flash');
            void centerPlayBtn.offsetWidth; // Force DOM reflow to restart animation
            centerPlayBtn.classList.add('animate-flash');
          };

          // Allow clicking anywhere in the center zone to toggle play/pause with YouTube flash
          centerContainer.onclick = (e) => {
            e.stopPropagation();
            const willPlay = video.paused;
            if (willPlay) {
              video.play().catch(() => {});
              triggerCenterFlash('play');
            } else {
              video.pause();
              triggerCenterFlash('pause');
            }
            if (setSelectedLayerId) setSelectedLayerId(layerId);
          };

          const rightSlot = document.createElement('div');
          Object.assign(rightSlot.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: '1 1 0%',
            minWidth: '0',
            pointerEvents: 'none',
          });

          const forwardBtn = document.createElement('button');
          forwardBtn.className = 'custom-forward-btn';
          Object.assign(forwardBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showSkipButton ? 'flex' : 'none',
            alignItems: 'center',
            gap: '2px',
            pointerEvents: 'auto',
            flexShrink: '0',
            opacity: '0.9',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            transition: 'all 0.15s ease',
          });
          forwardBtn.innerHTML = `<span class="skip-text" style="white-space:nowrap;line-height:1;margin-right:2px;">3s</span><span class="skip-svg-wrap" style="display:flex;align-items:center;">${FORWARD_ICON}</span>`;
          forwardBtn.onclick = (e) => {
            e.stopPropagation();
            video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 3);
            if (setSelectedLayerId) setSelectedLayerId(layerId);
          };
          rightSlot.appendChild(forwardBtn);

          centerContainer.appendChild(leftSlot);
          centerContainer.appendChild(centerSlot);
          centerContainer.appendChild(rightSlot);

          // Bottom Bar: Play, Progress, Time, Repeat, Download, Fullscreen
          const bottomContainer = document.createElement('div');
          bottomContainer.className = 'custom-bottom-container';
          Object.assign(bottomContainer.style, {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            flexShrink: '0',
          });

          const PLAY_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
          const PAUSE_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

          const playBtn = document.createElement('button');
          playBtn.className = 'custom-play-btn';
          Object.assign(playBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showPlayPause ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            flexShrink: '0',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
            transition: 'all 0.15s ease',
          });

          const onPlay = () => {
            playBtn.innerHTML = PAUSE_SVG;
            bar.classList.remove('is-paused');
          };
          const onPause = () => {
            playBtn.innerHTML = PLAY_SVG;
            bar.classList.add('is-paused');
          };
          playBtn.innerHTML = video.paused ? PLAY_SVG : PAUSE_SVG;

          video.addEventListener('play', onPlay);
          video.addEventListener('pause', onPause);

          playBtn.onclick = (e) => {
            e.stopPropagation();
            const willPlay = video.paused;
            if (willPlay) {
              video.play().catch(() => {});
              triggerCenterFlash('play');
            } else {
              video.pause();
              triggerCenterFlash('pause');
            }
            if (setSelectedLayerId) setSelectedLayerId(layerId);
          };

          // Progress Bar
          const progContainer = document.createElement('div');
          progContainer.className = 'custom-prog-container';
          Object.assign(progContainer.style, {
            flex: '1 1 0%',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
            position: 'relative',
            cursor: 'pointer',
            pointerEvents: 'auto',
            display: showProgressBar ? 'flex' : 'none',
            alignItems: 'center',
            transition: 'height 0.15s ease',
          });

          const progFill = document.createElement('div');
          Object.assign(progFill.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            bottom: '0',
            width: '0%',
            background: '#ffffff',
            borderRadius: '2px',
            pointerEvents: 'none',
          });
          progContainer.appendChild(progFill);

          // Time Display
          const timeWrapper = document.createElement('div');
          timeWrapper.className = 'custom-time-wrapper';
          Object.assign(timeWrapper.style, {
            display: 'flex',
            alignItems: 'center',
            flexShrink: '0',
            pointerEvents: 'none',
          });

          const timeDisplay = document.createElement('span');
          timeDisplay.className = 'custom-time-display';
          Object.assign(timeDisplay.style, {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#ffffff',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          });
          timeDisplay.textContent = "00:00 / 00:00";
          timeWrapper.appendChild(timeDisplay);

          const formatTime = (sec) => {
            if (isNaN(sec)) return "00:00";
            const m = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = Math.floor(sec % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
          };

          const onTimeUpdate = () => {
            if (video.duration) {
              const pct = (video.currentTime / video.duration) * 100;
              progFill.style.width = `${pct}%`;
              timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }
          };
          video.addEventListener('timeupdate', onTimeUpdate);
          video.addEventListener('loadedmetadata', onTimeUpdate);
          onTimeUpdate();

          progContainer.onpointerdown = (e) => {
            e.stopPropagation();
            const rect = progContainer.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (video.duration) video.currentTime = pct * video.duration;

            const onMove = (me) => {
              const p = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
              if (video.duration) video.currentTime = p * video.duration;
            };
            const onUp = () => {
              document.removeEventListener('pointermove', onMove);
              document.removeEventListener('pointerup', onUp);
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);

            if (setSelectedLayerId) setSelectedLayerId(layerId);
          };

          // Repeat Button (Previous stroke-width 0.8 style, big icon)
          const REPEAT_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`;
          const repeatBtn = document.createElement('button');
          repeatBtn.className = 'custom-repeat-btn';
          Object.assign(repeatBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showLoopButton ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            flexShrink: '0',
            opacity: video.loop ? '1' : '0.5',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
            transition: 'all 0.15s ease',
          });
          repeatBtn.innerHTML = REPEAT_SVG;
          repeatBtn.onclick = (e) => {
            e.stopPropagation();
            video.loop = !video.loop;
            if (video.loop) video.setAttribute('loop', '');
            else video.removeAttribute('loop');
            repeatBtn.style.opacity = video.loop ? '1' : '0.5';
            if (setSelectedLayerId) setSelectedLayerId(layerId);
            if (typeof updateElementAttribute === 'function') {
              const pageContainer = video.closest('.page-svg-container');
              const pIdx = pageContainer ? parseInt(pageContainer.getAttribute('data-page-index'), 10) : (typeof activePageIndex !== 'undefined' ? activePageIndex : 0);
              updateElementAttribute(pIdx, layerId, { loop: video.loop });
            }
          };

          // Download Button (Previous stroke-width 0.8 style, big icon)
          const DOWNLOAD_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
          const dlBtn = document.createElement('button');
          dlBtn.className = 'custom-download-btn';
          Object.assign(dlBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showDownloadButton ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            flexShrink: '0',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
            transition: 'all 0.15s ease',
          });
          dlBtn.innerHTML = DOWNLOAD_SVG;
          dlBtn.onclick = async (e) => {
            e.stopPropagation();
            const sourceUrl = video.src || video.querySelector('source')?.src;
            if (sourceUrl) {
              try {
                dlBtn.style.opacity = '0.5';
                dlBtn.style.pointerEvents = 'none';
                const response = await fetch(sourceUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = sourceUrl.split('/').pop() || 'video.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
              } catch (err) {
                console.error("Failed to download video, falling back to direct link", err);
                const a = document.createElement('a');
                a.href = sourceUrl;
                a.download = sourceUrl.split('/').pop() || 'video.mp4';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              } finally {
                dlBtn.style.opacity = '1';
                dlBtn.style.pointerEvents = 'auto';
              }
            }
          };

          // Fullscreen Button (Previous stroke-width 0.8 style, big icon)
          const FS_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
          const EXIT_FS_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;

          const fsBtn = document.createElement('button');
          fsBtn.className = 'custom-fs-btn';
          Object.assign(fsBtn.style, {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: showFullscreenButton ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            flexShrink: '0',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
            transition: 'all 0.15s ease',
          });

          const updateFsIcon = () => {
            const inFs = !!(document.fullscreenElement || document.getElementById('temp-fs-wrapper'));
            fsBtn.innerHTML = inFs ? EXIT_FS_SVG : FS_SVG;
          };
          updateFsIcon();
          document.addEventListener('fullscreenchange', updateFsIcon);

          // Fullscreen Exit Cleanup Helper
          const exitFsCleanup = () => {
            const fsWrapper = document.getElementById('temp-fs-wrapper');
            if (!fsWrapper) return;

            if (fsWrapper._onFsMouseMove) {
              fsWrapper.removeEventListener('mousemove', fsWrapper._onFsMouseMove);
            }
            if (fsWrapper._fsHideTimeout) {
              clearTimeout(fsWrapper._fsHideTimeout);
            }

            const wasPlaying = !video.paused;
            const vp = fsWrapper._vPlaceholder;
            const bp = fsWrapper._bPlaceholder;

            if (vp && vp.parentNode) {
              vp.parentNode.insertBefore(video, vp);
              vp.remove();
            }
            if (bp && bp.parentNode) {
              bp.parentNode.insertBefore(bar, bp);
              bp.remove();
            }

            if (video._origWidth !== undefined) video.style.width = video._origWidth;
            if (video._origHeight !== undefined) video.style.height = video._origHeight;
            if (video._origObjectFit !== undefined) video.style.objectFit = video._origObjectFit;

            fsWrapper.remove();
            updateFsIcon();
            updateResponsiveLayout();

            if (wasPlaying) video.play().catch(() => { });
          };

          fsBtn.onclick = (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement && !document.getElementById('temp-fs-wrapper')) {
              let fsWrapper = document.getElementById('temp-fs-wrapper');
              if (!fsWrapper) {
                fsWrapper = document.createElement('div');
                fsWrapper.id = 'temp-fs-wrapper';
                Object.assign(fsWrapper.style, {
                  position: 'fixed',
                  top: '0',
                  left: '0',
                  width: '100vw',
                  height: '100vh',
                  background: '#000000',
                  zIndex: '9999999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                });
              }

              // Create positioning container for video + overlay inside fullscreen
              const fsContainer = document.createElement('div');
              fsContainer.className = 'fs-video-container';
              Object.assign(fsContainer.style, {
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000000',
              });

              const vPlaceholder = document.createComment('video-placeholder');
              const bPlaceholder = document.createComment('bar-placeholder');

              video.parentElement.insertBefore(vPlaceholder, video);
              bar.parentElement.insertBefore(bPlaceholder, bar);

              const wasPlaying = !video.paused;

              video._origWidth = video.style.width;
              video._origHeight = video.style.height;
              video._origObjectFit = video.style.objectFit;

              video.style.width = '100%';
              video.style.height = '100%';
              video.style.objectFit = 'contain';

              fsContainer.appendChild(video);
              fsContainer.appendChild(bar);
              fsWrapper.innerHTML = '';
              fsWrapper.appendChild(fsContainer);
              document.body.appendChild(fsWrapper);

              fsWrapper._vPlaceholder = vPlaceholder;
              fsWrapper._bPlaceholder = bPlaceholder;

              // Immediately scale to fullscreen monitor dimensions
              updateResponsiveLayout();

              // Auto-hide controls during playback in fullscreen
              let fsHideTimeout = null;
              const onFsMouseMove = () => {
                bar.classList.add('video-is-hovered');
                if (fsHideTimeout) clearTimeout(fsHideTimeout);
                if (!video.paused) {
                  fsHideTimeout = setTimeout(() => {
                    bar.classList.remove('video-is-hovered');
                  }, 2500);
                }
              };
              fsWrapper.addEventListener('mousemove', onFsMouseMove);
              fsWrapper._onFsMouseMove = onFsMouseMove;
              fsWrapper._fsHideTimeout = fsHideTimeout;

              const reqFs = fsWrapper.requestFullscreen || fsWrapper.webkitRequestFullscreen;
              if (reqFs) {
                reqFs.call(fsWrapper).then(() => {
                  updateFsIcon();
                  updateResponsiveLayout();
                  if (wasPlaying) video.play().catch(() => { });
                }).catch(err => {
                  console.error("Fullscreen request failed", err);
                  exitFsCleanup();
                });
              }
            } else {
              if (document.exitFullscreen) document.exitFullscreen();
              else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
              else exitFsCleanup();
            }
          };

          const handleFsChange = () => {
            const isFs = !!document.fullscreenElement;
            updateFsIcon();
            if (!isFs) {
              exitFsCleanup();
            } else {
              updateResponsiveLayout();
            }
          };
          document.addEventListener('fullscreenchange', handleFsChange);
          document.addEventListener('webkitfullscreenchange', handleFsChange);

          const disableFullScreen = video.getAttribute('data-disable-fullscreen') === 'true';

          bottomContainer.appendChild(playBtn);
          bottomContainer.appendChild(progContainer);
          bottomContainer.appendChild(timeWrapper);
          bottomContainer.appendChild(repeatBtn);
          bottomContainer.appendChild(dlBtn);
          if (!disableFullScreen) {
            bottomContainer.appendChild(fsBtn);
          }

          bar.appendChild(topContainer);
          bar.appendChild(centerContainer);
          bar.appendChild(bottomContainer);

          // ── Proportional 150mm Baseline Scaling Engine ──
          // At baseline width = 150mm: minimum clean big size.
          // When width increases > 150mm: controls increase in size.
          // When width < 150mm: controls scale down to fit whatever frame size perfectly!
          // When in Fullscreen: scales to high-res monitor pixels!
          const updateResponsiveLayout = () => {
            const inFs = !!(bar.closest('#temp-fs-wrapper') || document.fullscreenElement);

            if (inFs) {
              // High-resolution monitor fullscreen scaling
              const scrW = window.innerWidth || 1920;
              const fsScale = Math.max(1.0, Math.min(1.8, scrW / 1200));

              const playSize = Math.round(44 * fsScale);
              const volumeSize = Math.round(38 * fsScale);
              const skipIconSize = Math.round(36 * fsScale);
              const skipFontSize = Math.round(20 * fsScale);
              const toolIconSize = Math.round(32 * fsScale);
              const timeFontSize = Math.round(16 * fsScale);
              const padX = Math.round(24 * fsScale);
              const padY = Math.round(18 * fsScale);
              const gap = Math.round(16 * fsScale);
              const progHeight = Math.round(7 * fsScale);

              bar.style.padding = `${padY}px ${padX}px`;
              bottomContainer.style.gap = `${gap}px`;
              progContainer.style.height = `${progHeight}px`;

              playBtn.style.width = `${playSize}px`;
              playBtn.style.height = `${playSize}px`;
              volumeBtn.style.width = `${volumeSize}px`;
              volumeBtn.style.height = `${volumeSize}px`;
              repeatBtn.style.width = `${toolIconSize}px`;
              repeatBtn.style.height = `${toolIconSize}px`;
              dlBtn.style.width = `${toolIconSize}px`;
              dlBtn.style.height = `${toolIconSize}px`;
              fsBtn.style.width = `${toolIconSize}px`;
              fsBtn.style.height = `${toolIconSize}px`;

              timeDisplay.style.fontSize = `${timeFontSize}px`;
              rewindBtn.style.fontSize = `${skipFontSize}px`;
              forwardBtn.style.fontSize = `${skipFontSize}px`;

              const rIconWrap = rewindBtn.querySelector('.skip-svg-wrap');
              if (rIconWrap) {
                rIconWrap.style.width = `${skipIconSize}px`;
                rIconWrap.style.height = `${skipIconSize}px`;
              }
              const fIconWrap = forwardBtn.querySelector('.skip-svg-wrap');
              if (fIconWrap) {
                fIconWrap.style.width = `${skipIconSize}px`;
                fIconWrap.style.height = `${skipIconSize}px`;
              }

              const centerPlaySize = Math.round(72 * fsScale);
              centerPlayBtn.style.width = `${centerPlaySize}px`;
              centerPlayBtn.style.height = `${centerPlaySize}px`;

              // Show all controls in fullscreen
              dlBtn.style.display = 'flex';
              repeatBtn.style.display = 'flex';
              timeWrapper.style.display = 'flex';
              centerContainer.style.display = 'flex';
              rewindBtn.style.display = 'flex';
              forwardBtn.style.display = 'flex';
              return;
            }

            // Normal Canvas Mode (SVG user coordinates / millimeters)
            const foEl = video.closest('foreignObject');
            let rawW = foEl ? parseFloat(foEl.getAttribute('width')) : 0;
            let rawH = foEl ? parseFloat(foEl.getAttribute('height')) : 0;
            if (!rawW || isNaN(rawW)) rawW = mountPoint.offsetWidth || 150;
            if (!rawH || isNaN(rawH)) rawH = mountPoint.offsetHeight || (rawW * 9 / 16);

            // Factor in crop bounds if active
            const grp = video.closest('g') || foEl;
            const cStr = grp ? grp.getAttribute('data-crop-data') : null;
            const cropped = video.getAttribute('data-object-fit') === 'Crop' || (grp && grp.getAttribute('data-object-fit') === 'Crop');
            let effW = rawW;
            let effH = rawH;
            if (cropped && cStr && cStr !== 'null') {
              try {
                const cJson = JSON.parse(cStr);
                if (cJson.width) effW = rawW * (parseFloat(cJson.width) / 100);
                if (cJson.height) effH = rawH * (parseFloat(cJson.height) / 100);
              } catch { /* ignored */ }
            }

            // 150mm width baseline scale
            const baseW = 150;
            const hRatio = (effH > 0 && effW > 0) ? (effH / (effW * 0.55)) : 1.0;
            const hClamped = Math.min(1.0, Math.max(0.45, hRatio));
            const s = Math.max(0.35, (effW / baseW) * hClamped);

            const playSize = Math.max(6, Math.round(12 * s));
            const volumeSize = Math.max(5, Math.round(10 * s));
            const skipIconSize = Math.max(4.5, Math.round(8.5 * s));
            const skipFontSize = Math.max(3.2, (5.2 * s).toFixed(1));
            const toolIconSize = Math.max(4.5, Math.round(7.5 * s));
            const timeFontSize = Math.max(2.6, (3.8 * s).toFixed(1));
            const padX = Math.max(2, Math.round(5 * s));
            const padY = Math.max(2, Math.round(4 * s));
            const gap = Math.max(1.5, Math.round(3 * s));
            const progHeight = Math.max(1.5, Math.round(2.2 * s));

            bar.style.padding = `${padY}px ${padX}px`;
            bottomContainer.style.gap = `${gap}px`;
            progContainer.style.height = `${progHeight}px`;

            playBtn.style.width = `${playSize}px`;
            playBtn.style.height = `${playSize}px`;

            volumeBtn.style.width = `${volumeSize}px`;
            volumeBtn.style.height = `${volumeSize}px`;

            repeatBtn.style.width = `${toolIconSize}px`;
            repeatBtn.style.height = `${toolIconSize}px`;

            dlBtn.style.width = `${toolIconSize}px`;
            dlBtn.style.height = `${toolIconSize}px`;

            fsBtn.style.width = `${toolIconSize}px`;
            fsBtn.style.height = `${toolIconSize}px`;

            timeDisplay.style.fontSize = `${timeFontSize}px`;

            // Center Rewind / Forward button sizes
            rewindBtn.style.fontSize = `${skipFontSize}px`;
            const rIconWrap = rewindBtn.querySelector('.skip-svg-wrap');
            if (rIconWrap) {
              rIconWrap.style.width = `${skipIconSize}px`;
              rIconWrap.style.height = `${skipIconSize}px`;
            }

            forwardBtn.style.fontSize = `${skipFontSize}px`;
            const fIconWrap = forwardBtn.querySelector('.skip-svg-wrap');
            if (fIconWrap) {
              fIconWrap.style.width = `${skipIconSize}px`;
              fIconWrap.style.height = `${skipIconSize}px`;
            }

            const centerPlaySize = Math.max(16, Math.round(26 * s));
            centerPlayBtn.style.width = `${centerPlaySize}px`;
            centerPlayBtn.style.height = `${centerPlaySize}px`;

            // Adaptive button visibility so controls always look clean and fit the frame
            const isCompact = effW < 110;
            const isVeryCompact = effW < 75;
            const isExtremelyCompact = effW < 35;

            const curDl = video.getAttribute('data-show-download-button') !== 'false';
            const curLoop = video.getAttribute('data-show-loop-button') !== 'false';
            const curSkip = video.getAttribute('data-show-skip-button') !== 'false';

            dlBtn.style.display = (curDl && !isCompact) ? 'flex' : 'none';
            repeatBtn.style.display = (curLoop && !isCompact) ? 'flex' : 'none';
            timeWrapper.style.display = isVeryCompact ? 'none' : 'flex';
            centerContainer.style.display = isExtremelyCompact ? 'none' : 'flex';
            if (isVeryCompact) {
              rewindBtn.style.display = 'none';
              forwardBtn.style.display = 'none';
            } else {
              rewindBtn.style.display = curSkip ? 'flex' : 'none';
              forwardBtn.style.display = curSkip ? 'flex' : 'none';
            }
          };

          bar._updateLayout = updateResponsiveLayout;
          const ro = new ResizeObserver(() => updateResponsiveLayout());
          ro.observe(mountPoint);

          mountPoint.appendChild(bar);
          updateResponsiveLayout();

          bar._cleanup = () => {
            document.removeEventListener('fullscreenchange', updateFsIcon);
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
            if (ro) ro.disconnect();
            if (bar._hoverBound && mountPoint) {
              mountPoint.removeEventListener('pointerenter', bar._onMountEnter);
              mountPoint.removeEventListener('pointermove', bar._onMountMove);
              mountPoint.removeEventListener('pointerleave', bar._onMountLeave);
              if (bar._clearHideTimeout) bar._clearHideTimeout();
            }
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onTimeUpdate);
            video.removeEventListener('volumechange', updateVolumeIcon);
            video.removeAttribute('data-custom-ctrl-active');
          };
        }

        // Object Fit & Crop Box Sync
        const groupEl = video.closest('g') || video.closest('foreignObject');
        const cropStr = groupEl ? groupEl.getAttribute('data-crop-data') : null;
        const isCropped = video.getAttribute('data-object-fit') === 'Crop' || (groupEl && groupEl.getAttribute('data-object-fit') === 'Crop');
        if (isCropped && cropStr && cropStr !== 'null') {
          try {
            const crop = JSON.parse(cropStr);
            const t = parseFloat(crop.top) || 0;
            const l = parseFloat(crop.left) || 0;
            const w = parseFloat(crop.width) || 100;
            const h = parseFloat(crop.height) || 100;
            bar.style.top = t + '%';
            bar.style.bottom = Math.max(0, 100 - (t + h)) + '%';
            bar.style.left = l + '%';
            bar.style.right = Math.max(0, 100 - (l + w)) + '%';
            bar.style.width = 'auto';
            bar.style.height = 'auto';
          } catch { /* ignored */ }
        } else {
          bar.style.top = '0';
          bar.style.bottom = '0';
          bar.style.left = '0';
          bar.style.right = '0';
          bar.style.width = '100%';
          bar.style.height = '100%';
        }

        // Selection Visibility Function:
        // Controls ONLY show when this video element is SELECTED (or in Fullscreen mode)!
        const updateSelectionVisibility = () => {
          const inFs = !!(video.closest('#temp-fs-wrapper') || document.fullscreenElement);
          const curSel = selectedLayerIdRef.current;
          const isSelected = inFs || (
            curSel && (
              curSel === layerId ||
              (videoGroup && curSel === videoGroup.id) ||
              (fo && curSel === fo.id) ||
              curSel === video.id ||
              (liveEl && (liveEl.id === curSel || liveEl.contains?.(document.getElementById(curSel))))
            )
          ) || !!(
            document.getElementById(`overlay-poly-selected-${layerId}`) ||
            (videoGroup && document.getElementById(`overlay-poly-selected-${videoGroup.id}`)) ||
            (fo && document.getElementById(`overlay-poly-selected-${fo.id}`))
          );

          if (!inFs && !isSelected) {
            bar.style.display = 'none';
            bar.classList.remove('video-is-hovered');
          } else {
            const shouldShowControls = video.getAttribute('data-show-controls') !== 'false';
            const sp = video.getAttribute('data-show-play-pause') !== 'false';
            const sf = video.getAttribute('data-show-fullscreen-button') !== 'false';
            const sd = video.getAttribute('data-show-download-button') !== 'false';
            bar.style.display = (shouldShowControls || sp || sf || sd) ? 'flex' : 'none';
          }
        };

        bar._updateSelectionVisibility = updateSelectionVisibility;
        updateSelectionVisibility();
      });

      // Cleanup orphan controls in the DOM (skip if in fullscreen)
      document.querySelectorAll('[id^="custom-ctrl-"]').forEach(bar => {
        if (bar.closest('#temp-fs-wrapper') || document.fullscreenElement) {
          return;
        }
        const layerId = bar.id.replace('custom-ctrl-', '');
        try {
          const video = document.getElementById(layerId)?.querySelector('video') || document.querySelector(`[id="${layerId}"] video`);
          if (!video || !document.body.contains(video)) {
            if (bar._cleanup) bar._cleanup();
            bar.remove();
          }
        } catch {
          if (bar._cleanup) bar._cleanup();
          bar.remove();
        }
      });
    };

    intervalId = setInterval(renderVideoControls, 500);
    return () => clearInterval(intervalId);
  }, [setSelectedLayerId, selectedLayerId, activePageIndex, updateElementAttribute]);
};
