import React, { useMemo } from 'react';

/**
 * High-performance, lightweight PageThumbnail component.
 * Renders page SVG/HTML content using pure DOM elements with transform scaling,
 * avoiding the heavy memory overhead of browser iframes (~10-20MB per iframe context).
 */
const PageThumbnail = React.memo(({ html, index, scale = 0.15, baseWidth = 400, baseHeight = 566 }) => {
    const cleanHtml = useMemo(() => {
        return (html || '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9ca3af">Video</div>')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9ca3af">Frame</div>')
            .replace(/<img\b([^>]*src=['"]https:\/\/codia-f2c\.s3\.us-west-1\.amazonaws\.com\/[^'"]*['"])([^>]*)>/gi, '<img $1 crossOrigin="anonymous" $2>');
    }, [html]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-white select-none pointer-events-none">
            <div
                className="absolute left-1/2 top-1/2"
                style={{
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: 'center center',
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`
                }}
            >
                <div
                    className="w-full h-full overflow-hidden bg-white relative"
                    style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}
                    dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
            </div>
        </div>
    );
});

export default PageThumbnail;
