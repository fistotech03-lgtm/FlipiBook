/**
 * vectorTextRuns.js
 * 
 * Vector-Studio styled text runs engine for rich inline text editing in FlipiBook.
 * Implements per-character style runs, stable character-range selection tracking,
 * and surgical style patch application based on Vector-Studio's text-runs.js architecture.
 */

// Shared CSS property mappings matching Vector-Studio RUN_KEYS
export const RUN_KEYS = [
  'color',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textDecoration',
  'textTransform',
  'letterSpacing',
  'backgroundColor',
  'strokeColor',
  'strokeWidth'
];

/**
 * Normalizes CSS attribute names and values
 */
export function normalizeStylePatch(attribute, value) {
  const patch = {};
  if (!attribute || value === undefined || value === null) return patch;

  switch (attribute) {
    case 'fill':
    case 'color':
      patch.color = value;
      break;
    case 'stroke':
    case 'strokeColor':
    case 'textStrokeColor':
    case '-webkit-text-stroke-color':
      patch.strokeColor = value;
      break;
    case 'strokeWidth':
    case 'textStrokeWidth':
    case '-webkit-text-stroke-width': {
      let v = value;
      if (typeof v === 'number') v = `${v}px`;
      else {
        const s = String(v).trim();
        if (!s.includes('px') && !s.includes('em') && !s.includes('pt') && s !== '') {
          v = `${s}px`;
        } else {
          v = s;
        }
      }
      patch.strokeWidth = v;
      break;
    }
    case 'fontSize': {
      let v = value;
      if (typeof v === 'number') v = `${v}pt`;
      else {
        const s = String(v).trim();
        if (!s.includes('pt') && !s.includes('px') && !s.includes('em') && !s.includes('%')) {
          v = `${s}pt`;
        } else {
          v = s;
        }
      }
      patch.fontSize = v;
      break;
    }
    case 'fontFamily': {
      let ff = String(value).replace(/['"]/g, '').split(',')[0].trim();
      patch.fontFamily = `'${ff.replace(/["']/g, '')}', sans-serif`;
      break;
    }
    case 'fontWeight': {
      const wMap = {
        'thin': '100', '100': '100',
        'light': '300', '300': '300',
        'normal': '400', 'regular': '400', '400': '400',
        'medium': '500', '500': '500',
        'semibold': '600', 'semi bold': '600', '600': '600',
        'bold': '700', '700': '700',
        'extrabold': '800', 'extra bold': '800', '800': '800',
        'black': '900', '900': '900'
      };
      const wStr = String(value).toLowerCase().trim();
      patch.fontWeight = wMap[wStr] || (wStr === 'bold' ? '700' : (wStr === 'normal' ? '400' : String(value)));
      break;
    }
    case 'fontStyle':
      patch.fontStyle = value;
      break;
    case 'textDecoration':
      patch.textDecoration = value;
      break;
    case 'textTransform':
      patch.textTransform = value;
      break;
    case 'letterSpacing':
      patch.letterSpacing = typeof value === 'number' ? `${value}px` : String(value);
      break;
    case 'backgroundColor':
    case 'highlight':
      patch.backgroundColor = value;
      break;
    default:
      patch[attribute] = value;
  }
  return patch;
}

/**
 * Extracts per-character runs from an HTML container element.
 * Recursively inspects DOM nodes and style inheritances.
 * Returns array of { char: string, style: object }
 */
export function parseHtmlToRuns(rootDiv) {
  if (!rootDiv) return [];
  const chars = [];

  function walk(node, currentStyle) {
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      for (let i = 0; i < text.length; i++) {
        chars.push({
          char: text[i],
          style: { ...currentStyle }
        });
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') {
        chars.push({ char: '\n', style: { ...currentStyle } });
        return;
      }

      // Compute style overrides for this element
      const nextStyle = { ...currentStyle };
      const s = node.style;

      if (tag === 'b' || tag === 'strong') nextStyle.fontWeight = '700';
      if (tag === 'i' || tag === 'em') nextStyle.fontStyle = 'italic';
      if (tag === 'u') nextStyle.textDecoration = 'underline';
      if (tag === 's' || tag === 'strike' || tag === 'del') nextStyle.textDecoration = 'line-through';

      if (s) {
        if (s.color) nextStyle.color = s.color;
        if (s.fontSize) nextStyle.fontSize = s.fontSize;
        if (s.fontFamily) nextStyle.fontFamily = s.fontFamily.replace(/"/g, "'");
        if (s.fontWeight) nextStyle.fontWeight = s.fontWeight;
        if (s.fontStyle) nextStyle.fontStyle = s.fontStyle;
        if (s.textDecoration) nextStyle.textDecoration = s.textDecoration;
        if (s.textTransform) nextStyle.textTransform = s.textTransform;
        if (s.letterSpacing) nextStyle.letterSpacing = s.letterSpacing;
        if (s.backgroundColor) nextStyle.backgroundColor = s.backgroundColor;
        const sColor = s.webkitTextStrokeColor || (s.getPropertyValue && s.getPropertyValue('-webkit-text-stroke-color'));
        if (sColor) nextStyle.strokeColor = sColor;
        const sWidth = s.webkitTextStrokeWidth || (s.getPropertyValue && s.getPropertyValue('-webkit-text-stroke-width'));
        if (sWidth) nextStyle.strokeWidth = sWidth;
      }

      node.childNodes.forEach((child) => walk(child, nextStyle));

      // Append newline for block-level elements if not ending with one
      if (['div', 'p'].includes(tag) && node !== rootDiv && chars.length > 0 && chars[chars.length - 1].char !== '\n') {
        chars.push({ char: '\n', style: { ...currentStyle } });
      }
    }
  }

  // Base style from rootDiv
  const baseStyle = {};
  if (rootDiv.style) {
    if (rootDiv.style.color) baseStyle.color = rootDiv.style.color;
    if (rootDiv.style.fontSize) baseStyle.fontSize = rootDiv.style.fontSize;
    if (rootDiv.style.fontFamily) baseStyle.fontFamily = rootDiv.style.fontFamily.replace(/"/g, "'");
    if (rootDiv.style.fontWeight) baseStyle.fontWeight = rootDiv.style.fontWeight;
    if (rootDiv.style.fontStyle) baseStyle.fontStyle = rootDiv.style.fontStyle;
    if (rootDiv.style.textDecoration) baseStyle.textDecoration = rootDiv.style.textDecoration;
    if (rootDiv.style.textTransform) baseStyle.textTransform = rootDiv.style.textTransform;
    if (rootDiv.style.letterSpacing) baseStyle.letterSpacing = rootDiv.style.letterSpacing;
    const baseSColor = rootDiv.style.webkitTextStrokeColor || (rootDiv.style.getPropertyValue && rootDiv.style.getPropertyValue('-webkit-text-stroke-color'));
    if (baseSColor) baseStyle.strokeColor = baseSColor;
    const baseSWidth = rootDiv.style.webkitTextStrokeWidth || (rootDiv.style.getPropertyValue && rootDiv.style.getPropertyValue('-webkit-text-stroke-width'));
    if (baseSWidth) baseStyle.strokeWidth = baseSWidth;
  }

  rootDiv.childNodes.forEach((child) => walk(child, baseStyle));
  return chars;
}

/**
 * Checks if two character style objects are identical
 */
export function areStylesEqual(s1, s2) {
  if (s1 === s2) return true;
  if (!s1 || !s2) return false;
  for (const k of RUN_KEYS) {
    if ((s1[k] || '') !== (s2[k] || '')) return false;
  }
  return true;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Serializes character runs into clean, minimal HTML.
 * Coalesces consecutive characters with the same styles into single <span> elements.
 */
export function runsToHtml(chars, baseStyle = {}) {
  if (!chars || chars.length === 0) return '';

  let html = '';
  let currentRunText = '';
  let currentRunStyle = null;

  const flushCurrentRun = () => {
    if (!currentRunText) return;
    const escaped = escapeHtml(currentRunText);

    // If style differs from baseStyle, wrap in span
    const hasDiff = currentRunStyle && RUN_KEYS.some((k) => (currentRunStyle[k] || '') !== (baseStyle[k] || ''));

    if (hasDiff) {
      const cssRules = [];
      if (currentRunStyle.color) cssRules.push(`color: ${currentRunStyle.color}`);
      if (currentRunStyle.fontSize) cssRules.push(`font-size: ${currentRunStyle.fontSize}`);
      if (currentRunStyle.fontFamily) cssRules.push(`font-family: ${String(currentRunStyle.fontFamily).replace(/"/g, "'")}`);
      if (currentRunStyle.fontWeight) cssRules.push(`font-weight: ${currentRunStyle.fontWeight}`);
      if (currentRunStyle.fontStyle) cssRules.push(`font-style: ${currentRunStyle.fontStyle}`);
      if (currentRunStyle.textDecoration) cssRules.push(`text-decoration: ${currentRunStyle.textDecoration}`);
      if (currentRunStyle.textTransform) cssRules.push(`text-transform: ${currentRunStyle.textTransform}`);
      if (currentRunStyle.letterSpacing) cssRules.push(`letter-spacing: ${currentRunStyle.letterSpacing}`);
      if (currentRunStyle.backgroundColor) cssRules.push(`background-color: ${currentRunStyle.backgroundColor}`);
      if (currentRunStyle.strokeColor) {
        cssRules.push(`-webkit-text-stroke-color: ${currentRunStyle.strokeColor}`);
        if (!currentRunStyle.strokeWidth && (!baseStyle.strokeWidth || baseStyle.strokeWidth === '0px' || baseStyle.strokeWidth === '0')) {
          cssRules.push(`-webkit-text-stroke-width: 1px`);
        }
      }
      if (currentRunStyle.strokeWidth) {
        cssRules.push(`-webkit-text-stroke-width: ${currentRunStyle.strokeWidth}`);
      }

      const safeStyle = cssRules.join('; ').replace(/"/g, "'");
      html += `<span style="${safeStyle}">${escaped}</span>`;
    } else {
      html += escaped;
    }

    currentRunText = '';
    currentRunStyle = null;
  };

  for (let i = 0; i < chars.length; i++) {
    const item = chars[i];
    if (item.char === '\n') {
      flushCurrentRun();
      html += '<br/>';
      continue;
    }

    if (!currentRunStyle || areStylesEqual(item.style, currentRunStyle)) {
      currentRunText += item.char;
      currentRunStyle = item.style;
    } else {
      flushCurrentRun();
      currentRunText = item.char;
      currentRunStyle = item.style;
    }
  }

  flushCurrentRun();
  return html;
}

/**
 * Computes exact character offsets [start, end) of the current selection inside rootDiv.
 */
/**
 * Character offsets MUST be counted exactly like parseHtmlToRuns counts characters:
 * text = 1 per char, <br> = 1 ('\n'), and a block (<div>/<p>, not the root) adds a '\n' after it
 * unless the text already ends with one. Range.toString() skips <br> / block breaks, so offsets taken
 * from it drifted one character left per preceding line break (styling & re-selection landed on the
 * wrong characters).
 */
function walkCharPositions(rootDiv, visit) {
  let pos = 0;
  let lastChar = '';
  let stop = false;
  const walk = (node) => {
    if (stop || !node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      if (visit({ type: 'text', node, pos }) === false) { stop = true; return; }
      const t = node.textContent;
      pos += t.length;
      if (t.length) lastChar = t[t.length - 1];
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') {
      if (visit({ type: 'br', node, pos }) === false) { stop = true; return; }
      pos += 1;
      lastChar = '\n';
      return;
    }
    const kids = node.childNodes;
    for (let i = 0; i < kids.length; i++) {
      if (visit({ type: 'child', node, index: i, pos }) === false) { stop = true; return; }
      walk(kids[i]);
      if (stop) return;
    }
    if (visit({ type: 'end', node, pos }) === false) { stop = true; return; }
    if ((tag === 'div' || tag === 'p') && node !== rootDiv && pos > 0 && lastChar !== '\n') {
      pos += 1;
      lastChar = '\n';
    }
  };
  walk(rootDiv);
  return pos;
}

/** Offset (parseHtmlToRuns units) of a DOM boundary point (container, offset) inside rootDiv. */
export function boundaryToCharOffset(rootDiv, container, offset) {
  let result = null;
  walkCharPositions(rootDiv, (step) => {
    if (step.type === 'text' && step.node === container) {
      result = step.pos + Math.min(offset, step.node.textContent.length);
      return false;
    }
    if (step.type === 'child' && step.node === container && step.index === offset) {
      result = step.pos;
      return false;
    }
    if (step.type === 'end' && step.node === container) {
      result = step.pos;
      return false;
    }
    return true;
  });
  return result;
}

export function getSelectionCharacterOffsets(rootDiv) {
  if (!rootDiv) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const range = sel.getRangeAt(0);
  if (!rootDiv.contains(range.commonAncestorContainer)) return null;

  try {
    const a = boundaryToCharOffset(rootDiv, range.startContainer, range.startOffset);
    const b = boundaryToCharOffset(rootDiv, range.endContainer, range.endOffset);
    if (a === null || b === null) return null;
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    if (start === end) return null;
    return { start, end, text: range.toString() };
  } catch {
    return null;
  }
}

/**
 * Restores the browser selection across exact character offsets [start, end) in rootDiv.
 */
export function setSelectionCharacterOffsets(rootDiv, start, end) {
  if (!rootDiv || start === undefined || end === undefined) return;
  const sel = window.getSelection();
  if (!sel) return;

  // Same counting rules as parseHtmlToRuns (see walkCharPositions)
  const toBoundary = (k, isEnd) => {
    let res = null;
    walkCharPositions(rootDiv, (step) => {
      if (step.type === 'text') {
        const len = step.node.textContent.length;
        const inside = isEnd ? (k > step.pos && k <= step.pos + len) : (k >= step.pos && k < step.pos + len);
        if (inside) { res = [step.node, k - step.pos]; return false; }
      } else if (step.type === 'br') {
        const parent = step.node.parentNode;
        const idx = Array.prototype.indexOf.call(parent.childNodes, step.node);
        if (!isEnd && k === step.pos) { res = [parent, idx]; return false; }
        if (isEnd && k === step.pos + 1) { res = [parent, idx + 1]; return false; }
      }
      return true;
    });
    if (!res) res = [rootDiv, rootDiv.childNodes.length];
    return res;
  };

  const [startNode, startOffset] = toBoundary(Math.min(start, end), false);
  const [endNode, endOffset] = toBoundary(Math.max(start, end), true);
  try {
    const newRange = document.createRange();
    newRange.setStart(startNode, startOffset);
    newRange.setEnd(endNode, endOffset);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch {
    // Fallback: leave the current selection untouched
  }
}

/**
 * Applies a style patch to a character range [start, end) inside rootDiv.
 * Cleanly updates runs, regenerates minimal HTML, and maintains selection.
 */
export function applyStyleToCharacterRange(rootDiv, start, end, attribute, value) {
  if (!rootDiv) return false;
  const chars = parseHtmlToRuns(rootDiv);
  if (!chars || chars.length === 0) return false;

  const len = chars.length;
  const s = Math.max(0, Math.min(len, start));
  const e = Math.max(s, Math.min(len, end));
  if (s >= e) return false;

  const patch = normalizeStylePatch(attribute, value);

  // Apply patch to the characters in [s, e)
  for (let i = s; i < e; i++) {
    Object.assign(chars[i].style, patch);
  }

  // Base style for root
  const baseStyle = {};
  if (rootDiv.style) {
    if (rootDiv.style.color) baseStyle.color = rootDiv.style.color;
    if (rootDiv.style.fontSize) baseStyle.fontSize = rootDiv.style.fontSize;
    if (rootDiv.style.fontFamily) baseStyle.fontFamily = rootDiv.style.fontFamily;
    if (rootDiv.style.fontWeight) baseStyle.fontWeight = rootDiv.style.fontWeight;
    if (rootDiv.style.fontStyle) baseStyle.fontStyle = rootDiv.style.fontStyle;
    if (rootDiv.style.textDecoration) baseStyle.textDecoration = rootDiv.style.textDecoration;
    if (rootDiv.style.textTransform) baseStyle.textTransform = rootDiv.style.textTransform;
    if (rootDiv.style.letterSpacing) baseStyle.letterSpacing = rootDiv.style.letterSpacing;
  }

  const newHtml = runsToHtml(chars, baseStyle);
  rootDiv.innerHTML = newHtml;
  // A flex-column container turns every styled <span> into its own line (breaks justify).
  try {
    if (typeof window !== 'undefined' && window.getComputedStyle(rootDiv).display.includes('flex')) {
      rootDiv.style.setProperty('display', 'block', 'important');
      rootDiv.style.removeProperty('flex-direction');
      rootDiv.style.removeProperty('justify-content');
    }
  } catch { /* ignore */ }

  // Restore selection on the modified range — but don't pull focus away from a panel
  // input / dropdown / picker the user is currently interacting with.
  const ae = typeof document !== 'undefined' ? document.activeElement : null;
  const userInControl = ae && ae !== rootDiv && !rootDiv.contains(ae) && ae !== document.body &&
    (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable || ae.tagName === 'BUTTON');
  if (!userInControl) {
    rootDiv.focus();
    setSelectionCharacterOffsets(rootDiv, s, e);
  }

  return true;
}

// ── Global Selection Tracking for Sidebar Interactions ────────────────────────
if (typeof window !== 'undefined' && !window.__vectorTextRunsTrackingInitialized) {
  window.__vectorTextRunsTrackingInitialized = true;

  const updateSelectionState = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    if (sel.isCollapsed) {
      // Caret placed inside the text being edited with nothing selected: drop the old range so
      // the next style change (font, size, color…) applies to the whole text box.
      const n = sel.anchorNode;
      const el = n && (n.nodeType === 1 ? n : n.parentElement);
      if (el && el.closest && el.closest('[contenteditable="true"]')) {
        window.__savedTextSelection = null;
        window.__lastTextSelection = null;
      }
      return;
    }

    const r = sel.getRangeAt(0);
    const container = r.commonAncestorContainer.nodeType === 1
      ? r.commonAncestorContainer
      : r.commonAncestorContainer.parentElement;

    const editableDiv = container?.closest('[contenteditable="true"]');
    if (!editableDiv) return;

    const fo = editableDiv.closest('foreignObject') || editableDiv.closest('[id]');
    if (!fo || !fo.id) return;

    const offsets = getSelectionCharacterOffsets(editableDiv);
    if (offsets && offsets.start !== offsets.end) {
      window.__savedTextSelection = {
        elementId: fo.id,
        start: offsets.start,
        end: offsets.end,
        text: offsets.text,
        timestamp: Date.now()
      };
      // Durable copy: survives the end of inline editing (panel / color-picker interactions)
      // and is only cleared when the user presses on the canvas again.
      window.__lastTextSelection = { ...window.__savedTextSelection };
    }
  };

  document.addEventListener('selectionchange', updateSelectionState);
  document.addEventListener('mouseup', updateSelectionState);
  document.addEventListener('keyup', updateSelectionState);
}
