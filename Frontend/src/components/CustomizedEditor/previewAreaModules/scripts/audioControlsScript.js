export const getAudioControlsScript = () => `  <script>
    (function() {
      // Audio controller for all [data-type="audio-frame"] elements in Flipbook Preview / Reader mode
      const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00';
        const m = Math.floor(timeInSeconds / 60);
        const s = Math.floor(timeInSeconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
      };

      const parseDurationTextToDisplay = (text) => {
        if (!text) return null;
        const match = text.match(/(\\d+):(\\d+)/);
        if (match) {
          const m = parseInt(match[1], 10);
          const s = match[2];
          return m + ':' + s;
        }
        return null;
      };

      const getTemplatePlayIconSvg = (templateId, color, filterId) => {
        const fAttr = filterId ? 'filter="url(#' + filterId + ')"' : '';
        switch (templateId) {
          case 'audio-icon':
            return '<polygon points="20 16 32 24 20 32" fill="' + color + '" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" />';
          case 'glassmorphism':
            return '<polygon points="7 4 17 11 7 18 7 4" fill="' + color + '" />';
          case 'cyber-blue':
            return '<polygon points="7 4 17 11 7 18 7 4" fill="' + color + '" ' + fAttr + ' />';
          case 'forest-moss':
          case 'silver-mono':
            return '<polygon points="5 3 13 8 5 13 5 3" fill="' + color + '" />';
          case 'sunset-vibrant':
          case 'cyberpunk-wide':
          default:
            return '<polygon points="5 3 14 9 5 15 5 3" fill="' + color + '" ' + fAttr + ' />';
        }
      };

      const getTemplatePauseIconSvg = (templateId, color, filterId) => {
        const fAttr = filterId ? 'filter="url(#' + filterId + ')"' : '';
        switch (templateId) {
          case 'audio-icon':
            return '<rect x="20" y="16" width="4" height="16" rx="1" fill="' + color + '" /><rect x="28" y="16" width="4" height="16" rx="1" fill="' + color + '" />';
          case 'glassmorphism':
            return '<rect x="6" y="4" width="3.5" height="14" rx="1" fill="' + color + '" /><rect x="13" y="4" width="3.5" height="14" rx="1" fill="' + color + '" />';
          case 'cyber-blue':
            return '<rect x="6" y="4" width="3.5" height="14" rx="1" fill="' + color + '" ' + fAttr + ' /><rect x="13" y="4" width="3.5" height="14" rx="1" fill="' + color + '" ' + fAttr + ' />';
          case 'forest-moss':
          case 'silver-mono':
            return '<rect x="4" y="3.5" width="2.5" height="10" rx="0.8" fill="' + color + '" /><rect x="8.5" y="3.5" width="2.5" height="10" rx="0.8" fill="' + color + '" />';
          case 'sunset-vibrant':
          case 'cyberpunk-wide':
          default:
            return '<rect x="5" y="4" width="3.5" height="11" rx="1" fill="' + color + '" ' + fAttr + ' /><rect x="11.5" y="4" width="3.5" height="11" rx="1" fill="' + color + '" ' + fAttr + ' />';
        }
      };

      const initAudioFrames = () => {
        const frames = document.querySelectorAll('[data-type="audio-frame"], g[id^="audio-"]');
        frames.forEach(frame => {
          if (frame._audioInitialized) return;
          frame._audioInitialized = true;

          const tplId = frame.getAttribute('data-audio-template') || 'sunset-vibrant';
          const filterEl = frame.querySelector('defs filter');
          const filterId = filterEl ? filterEl.id : '';
          const iconColor = frame.getAttribute('data-icon-color') || '#ffffff';

          let src = frame.getAttribute('data-audio-src') || frame.getAttribute('data-interaction-value') || '';
          if (!src) return;

          // Resolve relative or uploads paths
          if (typeof src === 'string' && (src.startsWith('/storage/') || src.startsWith('/uploads/'))) {
            try {
              if (window.parent && typeof window.parent.resolveUploadsPath === 'function') {
                src = window.parent.resolveUploadsPath(src);
              } else if (!src.startsWith('http')) {
                src = (window.parent?.location?.origin || window.location.origin) + src;
              }
            } catch (_) {}
          }

          const audio = new Audio(src);
          frame._audioInstance = audio;

          // Speed
          const speedAttr = frame.getAttribute('data-audio-speed');
          if (speedAttr) {
            const spd = parseFloat(speedAttr);
            if (!isNaN(spd)) audio.playbackRate = spd;
          }

          // Volume
          const volAttr = frame.getAttribute('data-audio-volume');
          let currentVolume = volAttr !== null ? parseFloat(volAttr) : 0.8;
          if (isNaN(currentVolume)) currentVolume = 0.8;
          audio.volume = Math.max(0, Math.min(1, currentVolume));

          // Mute state
          let isMuted = frame.getAttribute('data-audio-muted') === 'true';
          audio.muted = isMuted;

          // Loop state
          let isLooping = frame.getAttribute('data-audio-loop') === 'true' || frame.getAttribute('data-control-loop') === 'true';
          const behaviour = frame.getAttribute('data-audio-behaviour') || '';
          if (behaviour === 'Loop on Page') isLooping = true;
          audio.loop = isLooping;

          // Skip seconds
          const skipSecAttr = frame.getAttribute('data-skip-seconds');
          const skipSeconds = parseInt(skipSecAttr, 10) || 5;

          // Total duration element
          const totalEl = frame.querySelector('.audio-total-time');
          const durTextAttr = frame.getAttribute('data-audio-duration-text');
          if (totalEl && durTextAttr) {
            const parsed = parseDurationTextToDisplay(durTextAttr);
            if (parsed) totalEl.textContent = parsed;
          }

          // UI update helpers
          const updatePlayPauseIcon = (playing) => {
            const iconContainer = frame.querySelector('.play-pause-icon');
            if (!iconContainer) return;
            iconContainer.innerHTML = playing
              ? getTemplatePauseIconSvg(tplId, iconColor, filterId)
              : getTemplatePlayIconSvg(tplId, iconColor, filterId);
          };

          const updateMuteIcon = (muted) => {
            const volIcon = frame.querySelector('.volume-icon');
            if (!volIcon) return;
            if (muted) {
              volIcon.innerHTML = '<rect x="-4" y="-4" width="28" height="28" fill="transparent"></rect><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="' + iconColor + '"></polygon><line x1="18" y1="8" x2="14" y2="16" stroke="' + iconColor + '" stroke-width="2" stroke-linecap="round"></line><line x1="14" y1="8" x2="18" y2="16" stroke="' + iconColor + '" stroke-width="2" stroke-linecap="round"></line>';
            } else {
              volIcon.innerHTML = '<rect x="-4" y="-4" width="28" height="28" fill="transparent"></rect><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="' + iconColor + '"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="' + iconColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>';
            }
          };

          const updateLoopIcon = (looping) => {
            const loopIcon = frame.querySelector('.loop-icon');
            if (loopIcon) {
              loopIcon.style.opacity = looping ? '1' : '0.45';
            }
          };

          const updateProgressUi = (curTime, dur) => {
            const curEl = frame.querySelector('.audio-current-time');
            if (curEl) curEl.textContent = formatTime(curTime);
            const progressFill = frame.querySelector('.progress-fill');
            const progressKnob = frame.querySelector('.progress-knob');
            if (progressFill && progressKnob && dur && isFinite(dur) && dur > 0) {
              const progressBg = frame.querySelector('.progress-bg');
              const bgX = progressBg ? parseFloat(progressBg.getAttribute('x') || '0') : 0;
              const maxWidth = progressBg ? parseFloat(progressBg.getAttribute('width') || '100') : 100;
              const ratio = Math.min(1, Math.max(0, curTime / dur));
              const fillWidth = ratio * maxWidth;
              progressFill.setAttribute('width', fillWidth.toString());
              progressKnob.setAttribute('cx', (bgX + fillWidth).toString());
            }
          };

          const updateVolumeUi = (volRatio) => {
            const volFill = frame.querySelector('.volume-fill');
            const volKnob = frame.querySelector('.volume-knob');
            const volBg = frame.querySelector('.volume-bg');
            if (volFill && volKnob && volBg) {
              const bgX = parseFloat(volBg.getAttribute('x') || '0');
              const bgWidth = parseFloat(volBg.getAttribute('width') || '50');
              const fillW = volRatio * bgWidth;
              volFill.setAttribute('width', fillW.toString());
              volKnob.setAttribute('cx', (bgX + fillW).toString());
            }
          };

          // Audio event listeners
          const handleDuration = () => {
            const dur = audio.duration;
            if (totalEl && dur && isFinite(dur) && dur > 0) {
              totalEl.textContent = formatTime(dur);
            } else if (dur === Infinity) {
              audio.currentTime = 1e101;
              const onTime = () => {
                audio.removeEventListener('timeupdate', onTime);
                audio.currentTime = 0;
                if (totalEl && isFinite(audio.duration) && audio.duration > 0) {
                  totalEl.textContent = formatTime(audio.duration);
                }
              };
              audio.addEventListener('timeupdate', onTime);
            }
          };

          audio.addEventListener('loadedmetadata', handleDuration);
          audio.addEventListener('durationchange', handleDuration);
          audio.addEventListener('canplay', handleDuration);
          audio.addEventListener('loadeddata', handleDuration);
          if (audio.readyState >= 1) handleDuration();

          audio.ontimeupdate = () => {
            updateProgressUi(audio.currentTime, audio.duration);
          };

          audio.onplay = () => {
            updatePlayPauseIcon(true);
          };

          audio.onpause = () => {
            updatePlayPauseIcon(false);
          };

          audio.onended = () => {
            updatePlayPauseIcon(false);
            if (!audio.loop) {
              updateProgressUi(0, audio.duration);
            }
          };

          // Apply initial UI
          updateVolumeUi(currentVolume);
          updateMuteIcon(isMuted);
          updateLoopIcon(isLooping);
          updatePlayPauseIcon(false);

          // Interactive controls handlers
          const togglePlay = () => {
            if (audio.paused) {
              // Pause other playing audios on the page
              document.querySelectorAll('[data-type="audio-frame"], g[id^="audio-"]').forEach(other => {
                if (other !== frame && other._audioInstance && !other._audioInstance.paused) {
                  other._audioInstance.pause();
                }
              });
              audio.play().catch(e => console.warn('Audio play failed:', e));
            } else {
              audio.pause();
            }
          };

          const handleSeek = (e) => {
            const progGroup = frame.querySelector('.progress-group');
            if (!progGroup || !audio.duration || !isFinite(audio.duration)) return;
            const bg = progGroup.querySelector('.progress-bg') || progGroup.querySelector('rect:not([fill="transparent"])');
            if (!bg) return;
            const rect = bg.getBoundingClientRect();
            if (rect.width <= 0) return;
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            audio.currentTime = ratio * audio.duration;
            updateProgressUi(audio.currentTime, audio.duration);
          };

          const handleVolumeChange = (e) => {
            const volSlider = frame.querySelector('.volume-slider-part');
            if (!volSlider) return;
            const bg = volSlider.querySelector('.volume-bg') || volSlider.querySelector('rect:not([fill="transparent"])');
            if (!bg) return;
            const rect = bg.getBoundingClientRect();
            if (rect.width <= 0) return;
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            audio.volume = ratio;
            if (ratio > 0 && audio.muted) {
              audio.muted = false;
              updateMuteIcon(false);
            }
            updateVolumeUi(ratio);
          };

          // Setup hitboxes and styles
          ['.play-pause-btn', '.play-pause-icon', '.prev-icon', '.next-icon', '.loop-icon', '.volume-icon', '.volume-slider-part', '.progress-group'].forEach(sel => {
            const el = frame.querySelector(sel);
            if (el) {
              el.style.pointerEvents = 'all';
              el.style.cursor = 'pointer';
            }
          });

          // Canvas element click listener
          frame.addEventListener('click', (e) => {
            const target = e.target;

            // Play / Pause
            if (target.closest('.play-pause-btn') || target.closest('.play-pause-icon')) {
              e.preventDefault();
              e.stopPropagation();
              togglePlay();
              return;
            }

            // Skip backward
            if (target.closest('.prev-icon')) {
              e.preventDefault();
              e.stopPropagation();
              audio.currentTime = Math.max(0, audio.currentTime - skipSeconds);
              updateProgressUi(audio.currentTime, audio.duration);
              return;
            }

            // Skip forward
            if (target.closest('.next-icon')) {
              e.preventDefault();
              e.stopPropagation();
              if (audio.duration && isFinite(audio.duration)) {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + skipSeconds);
                updateProgressUi(audio.currentTime, audio.duration);
              }
              return;
            }

            // Progress bar
            if (target.closest('.progress-group')) {
              e.preventDefault();
              e.stopPropagation();
              handleSeek(e);
              return;
            }

            // Volume slider
            if (target.closest('.volume-slider-part')) {
              e.preventDefault();
              e.stopPropagation();
              handleVolumeChange(e);
              return;
            }

            // Volume / Mute
            if (target.closest('.volume-icon')) {
              e.preventDefault();
              e.stopPropagation();
              audio.muted = !audio.muted;
              updateMuteIcon(audio.muted);
              return;
            }

            // Loop button
            if (target.closest('.loop-icon')) {
              e.preventDefault();
              e.stopPropagation();
              audio.loop = !audio.loop;
              updateLoopIcon(audio.loop);
              return;
            }
          });

          // Drag scrubbing for progress and volume
          frame.addEventListener('pointerdown', (e) => {
            const prog = e.target.closest('.progress-group');
            if (prog) {
              e.stopPropagation();
              handleSeek(e);
              const onMove = (me) => handleSeek(me);
              const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
              };
              window.addEventListener('pointermove', onMove);
              window.addEventListener('pointerup', onUp);
              return;
            }

            const vol = e.target.closest('.volume-slider-part');
            if (vol) {
              e.stopPropagation();
              handleVolumeChange(e);
              const onMove = (me) => handleVolumeChange(me);
              const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
              };
              window.addEventListener('pointermove', onMove);
              window.addEventListener('pointerup', onUp);
              return;
            }
          });

          // Behaviour Handling: Auto Play on Page Open, Play on Hover, Play on Click
          if (behaviour === 'Auto Play on Page Open') {
            audio.play().catch(() => {});
          } else if (behaviour === 'Play on Hover') {
            frame.addEventListener('mouseenter', () => {
              audio.play().catch(() => {});
            });
            frame.addEventListener('mouseleave', () => {
              audio.pause();
            });
          }
        });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioFrames);
      } else {
        initAudioFrames();
      }
      setTimeout(initAudioFrames, 300);
      setTimeout(initAudioFrames, 1000);
    })();
  </script>`;

export default getAudioControlsScript;
