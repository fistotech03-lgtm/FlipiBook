/**
 * penDefaults.js — paint used for new Pen / Pencil paths (edited in the right sidebar while the
 * Pen tool is active, before anything is selected). Kept per browser for convenience.
 */
const KEY = 'fbe_pen_defaults';
const FALLBACK = { fill: 'none', stroke: '#000000', strokeWidth: '1.5', opacity: '1' };

let current = null;

export const getPenDefaults = () => {
  if (current) return current;
  current = { ...FALLBACK };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') current = { ...current, ...saved };
  } catch { /* storage unavailable */ }
  return current;
};

export const setPenDefaults = (patch) => {
  current = { ...getPenDefaults(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('pen-defaults-changed', { detail: current }));
};

/** Applies the defaults to a freshly created pen / pencil <path>. */
export const applyPenDefaults = (path) => {
  const d = getPenDefaults();
  path.setAttribute('fill', d.fill || 'none');
  path.setAttribute('stroke', d.stroke || '#000000');
  // Real width: pen / pencil paths are open, so "Outside"/"Inside" alignment (drawn at 2× and half
  // masked away) can't work — the doubled stroke showed while drawing. Centre stroke = exact value.
  const sw = parseFloat(d.strokeWidth) > 0 ? parseFloat(d.strokeWidth) : 1.5;
  path.setAttribute('data-stroke-width', String(sw));
  path.setAttribute('stroke-width', String(sw));
  path.setAttribute('data-stroke-position', 'Center');
  path.setAttribute('paint-order', 'normal');
  if (d.stroke && d.stroke !== 'none') path.setAttribute('data-stroke-color', d.stroke);
  if (d.opacity && d.opacity !== '1') path.setAttribute('opacity', d.opacity);
};
