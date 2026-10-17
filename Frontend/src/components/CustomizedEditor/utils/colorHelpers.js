/**
 * Color Helper Utilities for CustomizedEditor
 * Generates tint, shade, luminance checks, and contrast-safe text colors.
 */

export const getTint = (hex, weight = 0.8) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.round(r + (255 - r) * weight);
  g = Math.round(g + (255 - g) * weight);
  b = Math.round(b + (255 - b) * weight);
  const toHex = (x) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const getShade = (hex, weight = 0.6) => {
  if (!hex || hex === 'transparent' || typeof hex !== 'string') return hex;
  let c = hex.startsWith('#') ? hex.substring(1).toUpperCase() : hex.toUpperCase();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return hex;
  let r = parseInt(c.slice(0, 2), 16);
  let g = parseInt(c.slice(2, 4), 16);
  let b = parseInt(c.slice(4, 6), 16);
  r = Math.round(r * (1 - weight));
  g = Math.round(g * (1 - weight));
  b = Math.round(b * (1 - weight));
  const toHex = (x) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const isLightColor = (hex) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return false;
  let c = hex.substring(1).toUpperCase();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
};

export const ensureDarkText = (hex) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  let c = hex.substring(1).toUpperCase();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return hex;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance > 0.45) return getShade(hex, 0.5);
  return hex;
};
