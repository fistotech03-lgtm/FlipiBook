import React from 'react';
import { Icon } from '@iconify/react';

/**
 * Standard BrandLogo component across all Flipbook layouts.
 * - If a custom logo is uploaded, it renders the logo image (with filters, opacity, crop, url).
 * - If logo is enabled in settings but no custom logo is uploaded, it renders a predefined "YOUR LOGO" placeholder box.
 */
const BrandLogo = ({
    logoSettings,
    settings,
    isTablet = false,
    className = '',
    style = {},
    logoObjectFit = 'contain',
    logoCropStyle = {},
    theme = 'light',
    onClick
}) => {
    // Check if logo is enabled in settings
    const isLogoEnabled = settings?.brandingProfile?.logo !== false;
    if (!isLogoEnabled) return null;

    const hasCustomLogo = Boolean(logoSettings?.src);

    if (hasCustomLogo) {
        const adj = logoSettings?.adjustments || {};
        const exposure = adj.exposure || 0;
        const contrast = adj.contrast || 0;
        const saturation = adj.saturation || 0;
        const temperature = adj.temperature || 0;
        const tint = adj.tint || 0;
        const highlights = (adj.highlights || 0) / 5;
        const shadows = (adj.shadows || 0) / 5;
        const filterStr = `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) hue-rotate(${tint}deg) sepia(${temperature > 0 ? temperature : 0}%) brightness(${100 + highlights}%) contrast(${100 + shadows}%)`;

        const imgStyle = {
            objectFit: logoObjectFit,
            filter: filterStr,
            opacity: (logoSettings?.opacity ?? 100) / 100,
            ...logoCropStyle,
            ...style
        };

        const imgEl = (
            <img
                src={logoSettings.src}
                alt="Brand Logo"
                className={`${className || (isTablet ? 'h-[1.5vw]' : 'h-[2vw]')} w-auto transition-all duration-300`}
                style={imgStyle}
            />
        );

        if (logoSettings?.url) {
            return (
                <a
                    href={logoSettings.url.startsWith('http') ? logoSettings.url : `https://${logoSettings.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-all hover:scale-105"
                    onClick={onClick}
                >
                    {imgEl}
                </a>
            );
        }

        return (
            <div className="inline-flex items-center" onClick={onClick}>
                {imgEl}
            </div>
        );
    }

    // Predefined "YOUR LOGO" Placeholder Box
    const [autoTheme, setAutoTheme] = React.useState(theme);
    const boxRef = React.useRef(null);

    React.useEffect(() => {
        const updateAutoTheme = () => {
            if (!boxRef.current) return;
            let el = boxRef.current.parentElement;
            let bg = 'transparent';
            while (el && el !== document.body) {
                const style = window.getComputedStyle(el);
                if (style && style.backgroundColor && style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    bg = style.backgroundColor;
                    break;
                }
                el = el.parentElement;
            }

            // Also check CSS variables on root / documentElement
            if (bg === 'transparent') {
                const rootBg = getComputedStyle(document.documentElement).getPropertyValue('--toolbar-bg').trim();
                if (rootBg) bg = rootBg;
            }

            if (bg !== 'transparent') {
                let r = 255, g = 255, b = 255;
                if (bg.startsWith('#')) {
                    let hex = bg.replace('#', '').trim();
                    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
                    if (hex.length === 6) {
                        r = parseInt(hex.substring(0, 2), 16);
                        g = parseInt(hex.substring(2, 4), 16);
                        b = parseInt(hex.substring(4, 6), 16);
                    }
                } else if (bg.startsWith('rgb')) {
                    const match = bg.match(/\d+/g);
                    if (match && match.length >= 3) {
                        r = parseInt(match[0], 10);
                        g = parseInt(match[1], 10);
                        b = parseInt(match[2], 10);
                    }
                }
                const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
                setAutoTheme(lum > 0.6 ? 'gray' : 'light');
            }
        };

        updateAutoTheme();
        const timer = setTimeout(updateAutoTheme, 50);
        return () => clearTimeout(timer);
    });

    const isDarkTheme = autoTheme === 'dark' || autoTheme === 'gray';
    const borderClass = isDarkTheme ? 'border-gray-400/50' : 'border-white/40';
    const bgClass = isDarkTheme ? 'bg-black/5 hover:bg-black/10' : 'bg-white/15';
    const textClass = isDarkTheme ? 'text-gray-600' : 'text-white/75';

    return (
        <div
            ref={boxRef}
            className={`flex items-center justify-center gap-[0.35vw] px-[0.8vw] rounded-[0.3vw] border border-dashed ${borderClass} ${bgClass} ${textClass} select-none transition-all ${className ? '' : (isTablet ? 'h-[2vw]' : 'h-[2.5vw]')}`}
            style={{
                backdropFilter: 'blur(4px)',
                ...style
            }}
            title="Your Logo"
            onClick={onClick}
        >
            <Icon
                icon="lucide:image"
                className={`${isTablet ? 'w-[0.85vw] h-[0.85vw]' : 'w-[1.05vw] h-[1.05vw]'} ${textClass}`}
            />
            <span
                className={`${isTablet ? 'text-[0.62vw]' : 'text-[0.75vw]'} font-semibold tracking-wider uppercase ${textClass} whitespace-nowrap`}
            >
                YOUR LOGO
            </span>
        </div>
    );
};

export default BrandLogo;
