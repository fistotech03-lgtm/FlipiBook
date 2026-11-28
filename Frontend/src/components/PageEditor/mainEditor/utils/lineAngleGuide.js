/**
 * lineAngleGuide.js — live straightness guide while drawing a line.
 *
 * - Near 0° / 45° / 90° / 135° (± SNAP_DEG) the end point snaps to the exact angle and a
 *   magenta highlight is drawn over the line itself (no full-page guide).
 * - A badge next to the cursor always shows the current angle (magenta = perfectly straight).
 * - Shift forces a snap to the nearest 45° step; Ctrl/Cmd disables snapping.
 *
 * The guide is a fixed, pointer-events:none SVG in client coordinates, so it never touches the
 * page SVG (nothing to clean out of saved HTML) and stays crisp at any zoom.
 */

const SNAP_DEG = 3;
// Same look as the smart guides (smartGuides.js): magenta 1px line, dark badge
const GUIDE_COLOR = '#E6007A';
const BADGE_DARK = 'rgba(40, 40, 40, 0.95)';
const LAYER_ID = 'fbe-line-angle-guide';

/**
 * Snap a line end point. Angles are measured in SCREEN space (what the user sees), so the result
 * is straight on screen even if the page has a non-uniform transform.
 * @returns {{ end: {x,y}, snapped: boolean, angle: number }} local end point + displayed angle (0–359)
 */
export const snapLineEnd = (start, pt, ctm, { shiftKey = false, disableSnap = false } = {}) => {
  const dx = pt.x - start.x;
  const dy = pt.y - start.y;
  const toScreenVec = (x, y) => (ctm ? { x: ctm.a * x + ctm.c * y, y: ctm.b * x + ctm.d * y } : { x, y });
  const sv = toScreenVec(dx, dy);
  const len = Math.hypot(sv.x, sv.y);
  if (len < 0.5) return { end: { x: pt.x, y: pt.y }, snapped: false, angle: 0 };

  const rawDeg = (Math.atan2(-sv.y, sv.x) * 180) / Math.PI; // screen angle, y up
  const nearest = Math.round(rawDeg / 45) * 45;
  const diff = Math.abs(rawDeg - nearest);
  const shouldSnap = !disableSnap && (shiftKey || diff <= SNAP_DEG);

  let angleDeg = rawDeg;
  let end = { x: pt.x, y: pt.y };
  if (shouldSnap) {
    angleDeg = nearest;
    const rad = (nearest * Math.PI) / 180;
    // keep the projected length along the snapped direction (feels natural under the cursor)
    const proj = sv.x * Math.cos(rad) + sv.y * -Math.sin(rad);
    const sx = proj * Math.cos(rad);
    const sy = -proj * Math.sin(rad);
    // screen vector -> local vector
    if (ctm) {
      const det = ctm.a * ctm.d - ctm.b * ctm.c || 1;
      end = {
        x: start.x + (ctm.d * sx - ctm.c * sy) / det,
        y: start.y + (-ctm.b * sx + ctm.a * sy) / det,
      };
    } else {
      end = { x: start.x + sx, y: start.y + sy };
    }
  }
  // Direction from start to end, 0–359° (0 = right, 90 = up, 180 = left, 270 = down)
  let shown = ((angleDeg % 360) + 360) % 360;
  if (shown >= 359.95) shown = 0;
  return { end, snapped: shouldSnap, angle: shown };
};

const getLayer = () => {
  let layer = document.getElementById(LAYER_ID);
  if (!layer) {
    layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    layer.id = LAYER_ID;
    layer.setAttribute('style', 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483646;overflow:visible');
    layer.innerHTML = `
      <line id="${LAYER_ID}-line" stroke="${GUIDE_COLOR}" stroke-width="2" stroke-linecap="round" />
      <g id="${LAYER_ID}-badge">
        <rect rx="4" ry="4" height="20" />
        <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="0.3" fill="#fff" dominant-baseline="central" text-anchor="middle"></text>
      </g>`;
    document.body.appendChild(layer);
  }
  return layer;
};

/**
 * Draw / update the guide. `startClient` / `endClient` are client (screen) points of the line.
 */
export const showLineAngleGuide = ({ startClient, endClient, snapped, angle, cursor }) => {
  if (typeof document === 'undefined' || !startClient || !endClient) return;
  const layer = getLayer();
  const line = layer.querySelector(`#${LAYER_ID}-line`);
  const badge = layer.querySelector(`#${LAYER_ID}-badge`);
  const badgeRect = badge.querySelector('rect');
  const badgeText = badge.querySelector('text');

  // Straight indicator: when snapped, highlight just the line itself (start → end), no full-page guide
  if (snapped) {
    line.setAttribute('x1', startClient.x);
    line.setAttribute('y1', startClient.y);
    line.setAttribute('x2', endClient.x);
    line.setAttribute('y2', endClient.y);
    line.style.display = '';
  } else {
    line.style.display = 'none';
  }

  // Angle badge next to the cursor
  const label = `${Number.isInteger(angle) ? angle : angle.toFixed(1)}°`;
  const w = Math.max(32, 8 + label.length * 7);
  const at = cursor || endClient;
  const bx = at.x + 14;
  const by = at.y + 14;
  badgeRect.setAttribute('x', bx);
  badgeRect.setAttribute('y', by);
  badgeRect.setAttribute('width', w);
  badgeRect.setAttribute('fill', snapped ? GUIDE_COLOR : BADGE_DARK);
  badgeText.setAttribute('x', bx + w / 2);
  badgeText.setAttribute('y', by + 10);
  badgeText.textContent = label;
  layer.style.display = '';
};

export const clearLineAngleGuide = () => {
  if (typeof document === 'undefined') return;
  document.getElementById(LAYER_ID)?.remove();
};

// Safety net: never leave the guide on screen after the gesture ends (released outside the canvas,
// window blur, cancelled pointer).
if (typeof window !== 'undefined' && !window.__fbeLineGuideCleanup) {
  window.__fbeLineGuideCleanup = true;
  ['mousedown', 'pointerdown', 'mouseup', 'pointerup', 'pointercancel', 'blur'].forEach((t) => window.addEventListener(t, clearLineAngleGuide, true));
}
