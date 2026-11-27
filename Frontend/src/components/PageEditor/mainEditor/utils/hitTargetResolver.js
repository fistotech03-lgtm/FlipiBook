/**
 * Shared hierarchy-aware target resolution for canvas HOVER and CLICK.
 *
 * Rule: the hover box always outlines exactly what a click at that point would select.
 *
 * Group hierarchy (Figma-style), user groups only (Group action / Ctrl+G → id "group-…"):
 *   - nothing in the group selected           → the OUTERMOST group
 *   - the group (or something in it) selected → one level below the lowest common
 *     ancestor (LCA) of the selection and the pointer, i.e. the next level down.
 *
 * Algorithms:
 *   - LCA via ancestor Set: O(depth) to build the selection's ancestor set, O(depth) to walk
 *     the pointer's chain → O(d) per call, no repeated closest()/contains() scans.
 *   - Gap hit-test (empty space inside content — between petals, grouped shapes, letters):
 *     exact ORIENTED bounding-box test. The pointer is mapped into each element's own space
 *     with the inverse screen CTM (includes rotate/scale/translate) and compared with its
 *     untransformed getBBox(). getBoundingClientRect() is NOT used: for rotated content it is
 *     the axis-aligned box around the rotated shape, so pointing NEAR rotated content hit it.
 *   - Per-animation-frame memo (WeakMap) of inverse matrices + bboxes: mousemove fires several
 *     times per frame, each element is measured at most once per frame, no leaks on removal.
 */

export const USER_GROUP_SELECTOR = 'g[data-type="group"][id^="group-"]';

const isUserGroup = (el) =>
  !!el && el.tagName?.toLowerCase() === 'g' &&
  el.getAttribute?.('data-type') === 'group' &&
  typeof el.id === 'string' && el.id.startsWith('group-');

const isUsable = (el) =>
  el.getAttribute?.('data-locked') !== 'true' && el.getAttribute?.('data-hidden') !== 'true';

/** Ancestor user-groups of `node`, outermost → innermost (stops at the svg). O(depth). */
const getGroupChain = (node, svg) => {
  const chain = [];
  let cur = node;
  while (cur && cur !== svg) {
    if (isUserGroup(cur)) chain.push(cur);
    cur = cur.parentElement;
  }
  return chain.reverse();
};

/** Ancestor-or-self set of the selection; only a selected GROUP counts as its own context. */
const getSelectionContextSet = (selEl, svg) => {
  const set = new Set();
  let cur = isUserGroup(selEl) ? selEl : selEl.parentElement;
  while (cur && cur !== svg) { set.add(cur); cur = cur.parentElement; }
  return set;
};

/**
 * Group-aware target for a leaf element (what a click on `leaf` selects).
 * Returns null when the leaf is not inside a user group (caller falls back to normal picking).
 */
export const resolveGroupTarget = (leaf, svg, selectedId) => {
  if (!leaf || !svg) return null;
  const chain = getGroupChain(leaf, svg);
  if (!chain.length) return null;
  const outer = chain[0];
  if (outer === leaf || !isUsable(outer)) return null;

  const selEl = selectedId ? svg.querySelector(`[id="${CSS.escape(selectedId)}"]`) : null;
  if (!selEl || !outer.contains(selEl)) return outer;

  const selCtx = getSelectionContextSet(selEl, svg);
  // LCA: deepest group in the pointer's chain that is also a context of the selection.
  let ctx = outer;
  for (let i = chain.length - 1; i >= 0; i--) {
    if (selCtx.has(chain[i])) { ctx = chain[i]; break; }
  }

  // Next level down: the direct child of ctx that contains the leaf.
  let c = leaf;
  while (c.parentElement && c.parentElement !== ctx) c = c.parentElement;
  if (c.parentElement !== ctx || !c.id || !isUsable(c)) return ctx;
  return c;
};

// ── Exact (rotation-aware) point-in-box test ──────────────────────────────────
let obbCache = new WeakMap();
let rafPending = false;
const scheduleCacheReset = () => {
  if (rafPending || typeof requestAnimationFrame === 'undefined') return;
  rafPending = true;
  requestAnimationFrame(() => { obbCache = new WeakMap(); rafPending = false; });
};

const getOBB = (el) => {
  const cached = obbCache.get(el);
  if (cached !== undefined) return cached || null;
  let entry = null;
  try {
    const ctm = el.getScreenCTM?.();
    const box = el.getBBox?.();
    if (ctm && box && box.width > 0 && box.height > 0) {
      const inv = ctm.inverse();
      // on-screen area = local area × |det(CTM)| = local area / |det(inverse)|
      const det = Math.abs(inv.a * inv.d - inv.b * inv.c) || 1;
      entry = { inv, box, screenArea: (box.width * box.height) / det };
    }
  } catch { /* not rendered / not an SVG graphics element */ }
  obbCache.set(el, entry || false);
  scheduleCacheReset();
  return entry;
};

/** True when (clientX, clientY) lies inside the element's rotated box (no padding). */
export const pointInElementBox = (el, clientX, clientY) => {
  const obb = el && getOBB(el);
  if (!obb) return false;
  const { inv, box } = obb;
  const x = inv.a * clientX + inv.c * clientY + inv.e;
  const y = inv.b * clientX + inv.d * clientY + inv.f;
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
};

const isPickable = (el) => {
  if (!el || !el.id || !isUsable(el)) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === 'style' || tag === 'defs' || tag === 'svg') return false;
  const name = el.getAttribute('data-name') || '';
  const type = el.getAttribute('data-type');
  if (name === 'Overlay' || name === 'Document Shield' || name.includes('PDF Background')) return false;
  if (type === 'background' || type === 'shield' || type === 'pdf-vector-layer' || type === 'frame') return false;
  if (el.getAttribute('data-page-background') === 'true' || el.getAttribute('data-is-background') === 'true') return false;
  if (el.id === 'ghost-layer' || el.id.includes('overlay-poly-') || el.classList?.contains('selection-overlay-layer')) return false;
  return true;
};

const isPageRoot = (el) =>
  el.getAttribute?.('data-type') === 'frame' || /^Page\s*\d+$/i.test(el.getAttribute?.('data-name') || '');

/**
 * Stroke-only graphics (lines, polylines, vector paths with no fill): their box is mostly empty
 * space, so they only count when the pointer is ON the stroke (± a few screen px), not anywhere
 * inside their bounding box.
 */
const isStrokeOnly = (el) => {
  const tag = el.tagName?.toLowerCase();
  if (tag === 'line' || tag === 'polyline') return true;
  if (tag !== 'path') return false;
  const fill = (el.getAttribute('fill') || '').trim().toLowerCase();
  const noFill = fill === 'none' || fill === 'transparent' || fill === 'rgba(0,0,0,0)' || el.getAttribute('fill-opacity') === '0';
  return noFill && el.getAttribute('data-mask-enabled') !== 'true';
};

const STROKE_HIT_TOLERANCE_PX = 5;

/** Screen-space distance from point p to segment a–b. */
const distToSegment = (p, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/**
 * True when the pointer is on (or within a few screen px of) the element's stroke.
 * Pure geometry in screen space (no isPointInStroke: it ignores non-scaling strokes and Safari
 * rejects DOMPoint), so it behaves the same in every browser and at every zoom.
 */
export const pointNearStroke = (el, clientX, clientY, tolerancePx = STROKE_HIT_TOLERANCE_PX) => {
  let ctm;
  try { ctm = el.getScreenCTM(); } catch { ctm = null; }
  if (!ctm) return false;
  const toScreen = (x, y) => ({ x: ctm.a * x + ctm.c * y + ctm.e, y: ctm.b * x + ctm.d * y + ctm.f });
  const p = { x: clientX, y: clientY };

  // Half the visible stroke width on screen (non-scaling strokes are already in screen px)
  const sw = parseFloat(el.getAttribute('data-stroke-width') || el.getAttribute('stroke-width') || '1') || 1;
  const scale = Math.sqrt(Math.abs(ctm.a * ctm.d - ctm.b * ctm.c)) || 1;
  const nonScaling = (el.getAttribute('vector-effect') || '').includes('non-scaling-stroke');
  const reach = tolerancePx + (nonScaling ? sw : sw * scale) / 2;

  const tag = el.tagName?.toLowerCase();
  if (tag === 'line') {
    const num = (n) => parseFloat(el.getAttribute(n)) || 0;
    return distToSegment(p, toScreen(num('x1'), num('y1')), toScreen(num('x2'), num('y2'))) <= reach;
  }

  // Paths / polylines: sample along the geometry, test each small segment
  if (typeof el.getTotalLength !== 'function') return false;
  let total;
  try { total = el.getTotalLength(); } catch { return false; }
  if (!(total > 0)) return false;
  // quick reject: outside the (padded) screen box
  try {
    const r = el.getBoundingClientRect();
    if (clientX < r.left - reach || clientX > r.right + reach || clientY < r.top - reach || clientY > r.bottom + reach) return false;
  } catch { /* ignore */ }
  const steps = Math.max(8, Math.min(400, Math.ceil((total * scale) / 3)));
  let prev = null;
  for (let i = 0; i <= steps; i++) {
    let lp;
    try { lp = el.getPointAtLength((total * i) / steps); } catch { return false; }
    const sp = toScreen(lp.x, lp.y);
    if (prev && distToSegment(p, prev, sp) <= reach) return true;
    prev = sp;
  }
  return false;
};

/** Pickable element whose rotated box contains the point (and is not a near-full-page wrapper). */
const boxHit = (el, clientX, clientY, maxArea) => {
  if (!isPickable(el)) return false;
  // Stroke-only graphics hit on their stroke only (works for 0-height horizontal / vertical lines too)
  if (isStrokeOnly(el)) return pointNearStroke(el, clientX, clientY);
  const obb = getOBB(el);
  if (!obb) return false;
  if (maxArea && obb.screenArea >= maxArea) return false; // full-page wrappers are not gap targets
  return pointInElementBox(el, clientX, clientY);
};

/** Topmost direct child of `parent` hit by the point (last in DOM = painted on top). */
const topmostChildAt = (parent, clientX, clientY, maxArea) => {
  const kids = parent.children;
  for (let i = kids.length - 1; i >= 0; i--) {
    if (boxHit(kids[i], clientX, clientY, maxArea)) return kids[i];
  }
  return null;
};

/**
 * Gap hit-test: what a click selects when the pointer is over EMPTY space inside content.
 * Same hierarchy as resolveGroupTarget: start at page level, then descend one level for
 * every group that is (or contains) the selection's context.
 */
export const findElementAtPoint = (svg, clientX, clientY, selectedId = null) => {
  if (!svg) return null;
  const svgRect = svg.getBoundingClientRect();
  const maxArea = svgRect.width * svgRect.height * 0.9; // 90% of the page on screen

  // Page level, topmost first: elements directly under <svg>, with the page-root frame's
  // children expanded in its place.
  let hit = null;
  const top = svg.children;
  for (let i = top.length - 1; i >= 0 && !hit; i--) {
    const c = top[i];
    if (isPageRoot(c)) {
      if (isUsable(c)) hit = topmostChildAt(c, clientX, clientY, maxArea);
    } else if (boxHit(c, clientX, clientY, maxArea)) {
      hit = c;
    }
  }
  if (!hit) return null;

  const selEl = selectedId ? svg.querySelector(`[id="${CSS.escape(selectedId)}"]`) : null;
  if (!selEl) return hit;
  const selCtx = getSelectionContextSet(selEl, svg);
  while (isUserGroup(hit) && selCtx.has(hit)) {
    const child = topmostChildAt(hit, clientX, clientY, 0);
    if (!child) break;
    hit = child;
  }
  return hit;
};

/** Back-compat name used by the pointer hook: gap lookup for every element, rotation-exact. */
export const findGroupAtPoint = findElementAtPoint;

/** Drop the measurement cache immediately (after rotate / move / group / delete in the same frame). */
export const invalidateGroupCache = () => { obbCache = new WeakMap(); };
