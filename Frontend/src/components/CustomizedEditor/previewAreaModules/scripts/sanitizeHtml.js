export const sanitizeHtmlForPreview = (rawHtml) => {
    if (!rawHtml) return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        const rootSvg = doc.querySelector('svg');
        if (rootSvg) {
            const w = rootSvg.getAttribute('width');
            const h = rootSvg.getAttribute('height');
            const vb = rootSvg.getAttribute('viewBox');
            if (!vb && w && h && !w.includes('%') && !h.includes('%')) {
                const nw = parseFloat(w);
                const nh = parseFloat(h);
                if (!isNaN(nw) && !isNaN(nh)) {
                    rootSvg.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
                }
            }
            rootSvg.setAttribute('width', '100%');
            rootSvg.setAttribute('height', '100%');
        }

        doc.querySelectorAll('iframe').forEach(iframe => {
            const fo = iframe.closest('foreignObject');
            const hideControls = (fo && fo.getAttribute('data-show-controls') === 'false') || iframe.getAttribute('data-show-controls') === 'false';

            const currentStyle = iframe.getAttribute('style') || '';
            if (currentStyle) {
                const cleanedStyle = currentStyle.replace(/pointer-events\s*:\s*none\s*(?:!important)?\s*;?/gi, '');
                iframe.setAttribute('style', cleanedStyle + (cleanedStyle.endsWith(';') || !cleanedStyle ? '' : ';') + ' pointer-events: auto !important;');
            }

            const src = iframe.getAttribute('src') || '';
            if (hideControls && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                try {
                    const url = new URL(src);
                    url.searchParams.set('controls', '0');
                    iframe.setAttribute('src', url.toString());
                } catch (e) {
                    iframe.setAttribute('src', src.includes('controls=') ? src.replace(/controls=[^&"']+/i, 'controls=0') : `${src}${src.includes('?') ? '&' : '?'}controls=0`);
                }
            }

            iframe.setAttribute('allowfullscreen', 'true');
            const allow = iframe.getAttribute('allow') || '';
            if (!allow) {
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
            } else if (!allow.includes('fullscreen')) {
                iframe.setAttribute('allow', `${allow}; fullscreen`);
            }
        });

        return doc.body.innerHTML || rawHtml;
    } catch (e) {
        return rawHtml;
    }
};

export default sanitizeHtmlForPreview;
