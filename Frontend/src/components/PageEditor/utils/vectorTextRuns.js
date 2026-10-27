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
  'backgroundColor'
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
export function getSelectionCharacterOffsets(rootDiv) {
  if (!rootDiv) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const range = sel.getRangeAt(0);
  if (!rootDiv.contains(range.commonAncestorContainer)) return null;

  try {
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(rootDiv);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    const len = range.toString().length;
    const end = start + len;

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

  let currentPos = 0;
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;

  function traverse(node) {
    if (startNode && endNode) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent.length;
      if (!startNode && currentPos + len >= start) {
        startNode = node;
        startOffset = Math.max(0, start - currentPos);
      }
      if (!endNode && currentPos + len >= end) {
        endNode = node;
        endOffset = Math.max(0, end - currentPos);
      }
      currentPos += len;
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === 'br') {
        if (!startNode && currentPos + 1 >= start) {
          startNode = node.parentNode;
          startOffset = Array.from(node.parentNode.childNodes).indexOf(node);
        }
        if (!endNode && currentPos + 1 >= end) {
          endNode = node.parentNode;
          endOffset = Array.from(node.parentNode.childNodes).indexOf(node) + 1;
        }
        currentPos += 1;
        return;
      }
      for (const child of node.childNodes) {
        traverse(child);
      }
    }
  }

  traverse(rootDiv);

  if (startNode && endNode) {
    try {
      const newRange = document.createRange();
      newRange.setStart(startNode, startOffset);
      newRange.setEnd(endNode, endOffset);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // Fallback
    }
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

  // Restore selection on the modified range
  rootDiv.focus();
  setSelectionCharacterOffsets(rootDiv, s, e);

  return true;
}

// ── Global Selection Tracking for Sidebar Interactions ────────────────────────
if (typeof window !== 'undefined' && !window.__vectorTextRunsTrackingInitialized) {
  window.__vectorTextRunsTrackingInitialized = true;

  const updateSelectionState = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

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
    }
  };

  document.addEventListener('selectionchange', updateSelectionState);
  document.addEventListener('mouseup', updateSelectionState);
  document.addEventListener('keyup', updateSelectionState);
}
