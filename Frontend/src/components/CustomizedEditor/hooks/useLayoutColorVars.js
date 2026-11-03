import { useMemo } from 'react';
import { LAYOUT_DEFAULT_COLORS } from '../utils/layoutColors';

/**
 * useLayoutColorVars
 * Builds the CSS variables and custom color definitions for the active flipbook layout theme.
 *
 * @param {number|string} layoutSettings - Current layout ID (1 - 9)
 * @param {Object} layoutColors - Custom user color overrides keyed by layout ID
 * @returns {string} - Combined CSS custom properties string
 */
export const useLayoutColorVars = (layoutSettings, layoutColors = {}) => {
  return useMemo(() => {
    const activeIdx = layoutSettings || 1;
    const defaults = LAYOUT_DEFAULT_COLORS[activeIdx] || [];
    const saved = layoutColors[activeIdx] || [];

    const mergedColors = defaults.map((c) => {
      const savedItem = saved.find((s) => s && s.id === c.id);
      return {
        ...c,
        ...(savedItem ? savedItem : {}),
      };
    });

    const vars = mergedColors
      .map((c, i) => {
        const hex = c.hex || '#ffffff';
        const op = 0.4 + (Math.max(0, Math.min(1, (c.opacity ?? 100) / 100)) * 0.6);
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 0;
        const b = parseInt(hex.slice(5, 7), 16) || 0;

        const varName = c.id || `layout-color-${i}`;
        return `--${varName}: ${hex}; --${varName}-opacity: ${op}; --${varName}-rgb: ${r},${g},${b};`;
      })
      .join(' ');

    // Derive --dropdown-icon from --dropdown-text at 70% opacity IF not already present
    const hasExplicitIcon = mergedColors.some((c) => c.id === 'dropdown-icon');
    const textColor = mergedColors.find((c) => c.id === 'dropdown-text');
    if (!hasExplicitIcon && textColor) {
      const hex = textColor.hex || '#ffffff';
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return vars + ` --dropdown-icon: ${hex}; --dropdown-icon-opacity: 0.7; --dropdown-icon-rgb: ${r},${g},${b};`;
    }

    return vars;
  }, [layoutSettings, layoutColors]);
};

export default useLayoutColorVars;
