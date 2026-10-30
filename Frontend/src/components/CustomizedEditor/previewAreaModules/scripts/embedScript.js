export const getEmbedScript = () => `
  <script>
    (function() {
      const initEmbedControls = () => {
        // Universal click handler for Embed Controls in preview
        document.addEventListener('click', function(e) {
          // 1. Open Website button handler
          const openBtn = e.target.closest ? e.target.closest('.embed-open-btn, [data-embed-action="open-website"]') : null;
          if (openBtn) {
            e.preventDefault();
            e.stopPropagation();

            let href = openBtn.getAttribute('href') || openBtn.dataset?.href;
            if (!href || href === '#' || href.startsWith('javascript:')) {
              const frameGroup = openBtn.closest('[data-type="embed-frame"]');
              if (frameGroup) {
                href = frameGroup.getAttribute('data-url') || frameGroup.getAttribute('data-custom-code') || '';
              }
            }

            if (href && href !== '#' && !href.startsWith('javascript:')) {
              let targetUrl = String(href).trim();
              if (targetUrl.startsWith('<')) {
                const match = targetUrl.match(/src=["']([^"']*)["']/i);
                if (match && match[1]) targetUrl = match[1];
              }

              if (targetUrl && !/^https?:\\/\\//i.test(targetUrl)) {
                targetUrl = 'https://' + targetUrl;
              }

              let behavior = openBtn.getAttribute('target') || '';
              if (!behavior) {
                const frameGroup = openBtn.closest('[data-type="embed-frame"]');
                const bAttr = frameGroup ? frameGroup.getAttribute('data-behavior') : '';
                behavior = (bAttr === 'Open in - New Tab') ? '_blank' : '_top';
              }

              if (behavior === '_top' || behavior === '_self' || behavior === 'current') {
                try {
                  window.top.location.href = targetUrl;
                } catch (err) {
                  window.open(targetUrl, '_top');
                }
              } else {
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
              }
            }
            return;
          }

          // 2. Fullscreen button handler
          const fsBtn = e.target.closest ? e.target.closest('.embed-fullscreen-btn, [data-embed-action="fullscreen"]') : null;
          if (fsBtn) {
            e.preventDefault();
            e.stopPropagation();

            const root = fsBtn.closest('.embed-root-container') || (fsBtn.closest('foreignObject') ? fsBtn.closest('foreignObject').firstElementChild : null);
            if (!root) return;

            const isFs = !!(
              document.fullscreenElement ||
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement
            );

            if (isFs) {
              if (document.exitFullscreen) document.exitFullscreen();
              else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
              else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
              else if (document.msExitFullscreen) document.msExitFullscreen();
            } else {
              const reqFs = root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen;
              if (reqFs) {
                reqFs.call(root).catch(function() {
                  const iframe = root.querySelector('iframe');
                  const iframeReq = iframe && (iframe.requestFullscreen || iframe.webkitRequestFullscreen);
                  if (iframeReq) {
                    iframeReq.call(iframe).catch(function() {
                      openFixedFsModal(root);
                    });
                  } else {
                    openFixedFsModal(root);
                  }
                });
              } else {
                openFixedFsModal(root);
              }
            }
            return;
          }
        }, true);

        // Fallback fullscreen modal overlay if browser policy restricts native fullscreen in preview
        function openFixedFsModal(root) {
          const existing = document.getElementById('embed-modal-fs');
          if (existing) existing.remove();

          const iframe = root.querySelector('iframe');
          const src = iframe ? (iframe.getAttribute('src') || '') : '';
          const srcdoc = iframe ? (iframe.getAttribute('srcdoc') || '') : '';

          const modal = document.createElement('div');
          modal.id = 'embed-modal-fs';
          modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000000;z-index:9999999;display:flex;flex-direction:column;';

          const modalIframe = document.createElement('iframe');
          modalIframe.style.cssText = 'width:100%;height:100%;border:none;flex:1;background:transparent;';
          modalIframe.setAttribute('allowfullscreen', 'true');
          modalIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
          if (src) modalIframe.src = src;
          else if (srcdoc) modalIframe.srcdoc = srcdoc;

          const closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.title = 'Exit Full screen';
          closeBtn.innerHTML = '<svg class="svg-icon-override" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 13px !important; height: 13px !important; display:inline-block;"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg><span style="color:#fff;font-size:12px;font-weight:600;margin-left:6px;">Exit Full screen</span>';
          closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;z-index:10000000;display:inline-flex;align-items:center;padding:6px 12px;background:rgba(15,23,42,0.85);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
          closeBtn.onclick = function() { modal.remove(); };

          const escHandler = function(e) {
            if (e.key === 'Escape') {
              modal.remove();
              document.removeEventListener('keydown', escHandler);
            }
          };
          document.addEventListener('keydown', escHandler);

          modal.appendChild(modalIframe);
          modal.appendChild(closeBtn);
          document.body.appendChild(modal);
        }

        // Keep fullscreen button icons and tooltips in sync
        const updateFsButtonStates = () => {
          const isFs = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
          );

          document.querySelectorAll('.embed-fullscreen-btn').forEach(btn => {
            const enterIcon = btn.querySelector('.embed-fs-icon-enter');
            const exitIcon = btn.querySelector('.embed-fs-icon-exit');
            const fsText = btn.querySelector('.embed-fs-text');
            if (isFs) {
              if (enterIcon) enterIcon.style.display = 'none';
              if (exitIcon) exitIcon.style.display = 'inline-block';
              if (fsText) fsText.textContent = 'Exit Full screen';
              btn.setAttribute('title', 'Exit Full screen');
            } else {
              if (enterIcon) enterIcon.style.display = 'inline-block';
              if (exitIcon) exitIcon.style.display = 'none';
              if (fsText) fsText.textContent = 'Full screen';
              btn.setAttribute('title', 'Full screen');
            }
          });
        };

        document.addEventListener('fullscreenchange', updateFsButtonStates);
        document.addEventListener('webkitfullscreenchange', updateFsButtonStates);
        document.addEventListener('mozfullscreenchange', updateFsButtonStates);
        document.addEventListener('MSFullscreenChange', updateFsButtonStates);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmbedControls);
      } else {
        initEmbedControls();
      }
    })();
  </script>
`;

export default getEmbedScript;

