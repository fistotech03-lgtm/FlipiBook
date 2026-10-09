import React, { forwardRef, useMemo } from 'react';

/**
 * Color Presets for quick and easy usage
 */
const COLOR_PRESETS = {
    // Brand / Orange
    orange: { thumb: '#ea543a', hover: '#d94830' },
    brand: { thumb: '#ea543a', hover: '#d94830' },

    // Dark / Slate Navy (Sidebar)
    dark: { thumb: '#2c3749', hover: '#3c4b63' },
    slate: { thumb: '#2c3749', hover: '#3c4b63' },
    navy: { thumb: '#1f293d', hover: '#2e3d57' },

    // Grays
    gray: { thumb: '#9ca3af', hover: '#6b7280' },
    grey: { thumb: '#9ca3af', hover: '#6b7280' },
    default: { thumb: '#9ca3af', hover: '#6b7280' },
    light: { thumb: '#d1d5db', hover: '#9ca3af' },

    // Blue / Sky
    blue: { thumb: '#38bdf8', hover: '#0284c7' },
    sky: { thumb: '#38bdf8', hover: '#0284c7' },
    indigo: { thumb: '#6366f1', hover: '#4f46e5' },

    // Green / Emerald
    green: { thumb: '#10b981', hover: '#059669' },
    emerald: { thumb: '#10b981', hover: '#059669' },

    // Red / Rose
    red: { thumb: '#ef4444', hover: '#dc2626' },
    rose: { thumb: '#f43f5e', hover: '#e11d48' },

    // Purple / Violet
    purple: { thumb: '#8b5cf6', hover: '#7c3aed' },
    violet: { thumb: '#8b5cf6', hover: '#7c3aed' },

    // Yellow / Amber
    yellow: { thumb: '#f59e0b', hover: '#d97706' },
    amber: { thumb: '#f59e0b', hover: '#d97706' },

    // White / Glass
    white: { thumb: 'rgba(255, 255, 255, 0.4)', hover: 'rgba(255, 255, 255, 0.7)' },
};

/**
 * Resolves color and hover color from presets or raw CSS color strings
 */
export const resolveScrollbarColors = (color = '#9ca3af', customHoverColor) => {
    if (!color) return { thumb: '#9ca3af', hover: customHoverColor || '#6b7280' };

    const lower = String(color).toLowerCase().trim();
    if (COLOR_PRESETS[lower]) {
        return {
            thumb: COLOR_PRESETS[lower].thumb,
            hover: customHoverColor || COLOR_PRESETS[lower].hover
        };
    }

    return {
        thumb: color,
        hover: customHoverColor || color
    };
};

/**
 * Utility helper to get inline style object for any standard element
 * Example: <div style={getScrollbarStyle('#ea543a', { width: '4px' })}>
 */
export const getScrollbarStyle = (color = '#9ca3af', options = {}) => {
    const {
        hoverColor,
        trackColor = 'transparent',
        width = '0.35vw',
        borderRadius = '1vw'
    } = options;

    const resolved = resolveScrollbarColors(color, hoverColor);
    const parsedWidth = typeof width === 'number' ? `${width}px` : width;

    return {
        '--custom-scrollbar-thumb': resolved.thumb,
        '--custom-scrollbar-thumb-hover': resolved.hover,
        '--custom-scrollbar-track': trackColor,
        '--custom-scrollbar-width': parsedWidth,
        '--custom-scrollbar-radius': borderRadius,
    };
};

/**
 * CustomScrollbar Component
 * 
 * Reusable scroll container with customizable thumb and track colors.
 * 
 * @param {string} color - Scrollbar thumb color. Can be a preset ('orange', 'dark', 'gray', 'blue', etc.) or any hex/rgb ('#ea543a', '#2c3749')
 * @param {string} hoverColor - Optional hover state color
 * @param {string} trackColor - Track background color (default 'transparent')
 * @param {string|number} width - Scrollbar width/thickness (default '0.35vw' or e.g. '6px')
 * @param {string} borderRadius - Border radius of thumb/track (default '1vw')
 * @param {string} direction - 'vertical' (default), 'horizontal', 'both', or 'none'
 * @param {string} as - HTML element tag (default 'div')
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
const CustomScrollbar = forwardRef(function CustomScrollbar(
    {
        children,
        color = '#9ca3af',
        thumbColor,
        hoverColor,
        thumbHoverColor,
        trackColor = 'transparent',
        width = '0.35vw',
        size,
        borderRadius = '1vw',
        radius,
        direction = 'vertical',
        as: Component = 'div',
        className = '',
        style = {},
        ...restProps
    },
    ref
) {
    const effectiveColor = thumbColor || color;
    const effectiveHover = thumbHoverColor || hoverColor;
    const effectiveWidth = size || width;
    const effectiveRadius = radius || borderRadius;

    const scrollbarStyles = useMemo(() => {
        return getScrollbarStyle(effectiveColor, {
            hoverColor: effectiveHover,
            trackColor,
            width: effectiveWidth,
            borderRadius: effectiveRadius
        });
    }, [effectiveColor, effectiveHover, trackColor, effectiveWidth, effectiveRadius]);

    const directionClasses = useMemo(() => {
        switch (direction) {
            case 'vertical':
                return 'overflow-y-auto overflow-x-hidden';
            case 'horizontal':
                return 'overflow-x-auto overflow-y-hidden';
            case 'both':
                return 'overflow-auto';
            case 'none':
                return '';
            default:
                return 'overflow-y-auto overflow-x-hidden';
        }
    }, [direction]);

    return (
        <Component
            ref={ref}
            className={`custom-scrollbar-wrapper custom-scrollbar ${directionClasses} ${className}`.trim()}
            style={{
                ...scrollbarStyles,
                ...style
            }}
            {...restProps}
        >
            {children}
        </Component>
    );
});

export default CustomScrollbar;
