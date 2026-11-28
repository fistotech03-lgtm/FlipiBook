import { loadGoogleFont } from '../properties/TextProperties';
import editCacheManager from './EditCacheManager';

export const TRANSLATE_LANGUAGES = [
  { code: 'tam_Taml', name: 'Tamil', native: 'தமிழ்' },
  { code: 'hin_Deva', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tel_Telu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mal_Mlym', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'kan_Knda', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ben_Beng', name: 'Bengali', native: 'বাংলা' },
  { code: 'mar_Deva', name: 'Marathi', native: 'मराठी' },
  { code: 'guj_Gujr', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pan_Guru', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ory_Orya', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'urd_Arab', name: 'Urdu', native: 'اردو' }
];

export const FONT_FOR_LANGUAGE = {
  'tam_Taml': 'Noto Sans Tamil',
  'hin_Deva': 'Noto Sans Devanagari',
  'mar_Deva': 'Noto Sans Devanagari',
  'san_Deva': 'Noto Sans Devanagari',
  'tel_Telu': 'Noto Sans Telugu',
  'kan_Knda': 'Noto Sans Kannada',
  'mal_Mlym': 'Noto Sans Malayalam',
  'ben_Beng': 'Noto Sans Bengali',
  'guj_Gujr': 'Noto Sans Gujarati',
  'pan_Guru': 'Noto Sans Gurmukhi',
  'ory_Orya': 'Noto Sans Oriya',
  'urd_Arab': 'Noto Naskh Arabic'
};

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('flipibook-inline-translate-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'flipibook-inline-translate-style';
    styleEl.textContent = `
      @keyframes spinTranslateBadge {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeInTranslateBadge {
        from { opacity: 0; transform: translate(-50%, 6px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      .inline-translating-pulse {
        opacity: 0.45 !important;
        filter: blur(0.4px) !important;
        background: rgba(107, 114, 128, 0.16) !important;
        border-radius: 4px !important;
        outline: 1.5px dashed rgba(107, 114, 128, 0.6) !important;
        transition: all 0.2s ease !important;
        user-select: none !important;
        pointer-events: none !important;
      }
      .translating-element-pulse {
        opacity: 0.45 !important;
        filter: blur(0.4px) !important;
        pointer-events: none !important;
        user-select: none !important;
        transition: opacity 0.2s ease !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

function showSpinnerBadge(targetRect, langName) {
  if (typeof document === 'undefined') return null;
  ensureStyles();

  // Remove any lingering spinner badge
  const existing = document.getElementById('inline-translate-spinner-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'inline-translate-spinner-badge';
  badge.style.position = 'fixed';
  badge.style.left = `${Math.max(60, targetRect.left + (targetRect.width / 2))}px`;
  badge.style.top = `${Math.max(50, targetRect.top - 42)}px`;
  badge.style.transform = 'translate(-50%, 0)';
  badge.style.zIndex = '999999';
  badge.style.pointerEvents = 'none';

  badge.innerHTML = `
    <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(17, 24, 39, 0.95); color:#ffffff; padding:6px 14px; border-radius:20px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:12px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.18); backdrop-filter:blur(8px); animation:fadeInTranslateBadge 0.2s ease-out; white-space:nowrap;">
      <svg style="animation:spinTranslateBadge 0.75s linear infinite; width:14px; height:14px; flex-shrink:0;" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-linecap="round" stroke-opacity="0.3"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"></path>
      </svg>
      <span>Translating to ${langName}...</span>
    </div>
  `;

  document.body.appendChild(badge);
  return badge;
}

function showNoticeBadge(targetRect, message) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('inline-translate-spinner-badge');
  if (existing) existing.remove();

  const rect = targetRect && (targetRect.width > 0 || targetRect.height > 0)
    ? targetRect
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };

  const badge = document.createElement('div');
  badge.id = 'inline-translate-spinner-badge';
  badge.style.position = 'fixed';
  badge.style.left = `${Math.max(80, rect.left + (rect.width / 2))}px`;
  badge.style.top = `${Math.max(50, rect.top - 42)}px`;
  badge.style.transform = 'translate(-50%, 0)';
  badge.style.zIndex = '999999';
  badge.style.pointerEvents = 'none';
  badge.innerHTML = `
    <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(153, 27, 27, 0.95); color:#ffffff; padding:6px 14px; border-radius:20px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:12px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.2); white-space:nowrap;">
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(badge);
  setTimeout(() => {
    if (badge.parentNode) badge.remove();
  }, 3000);
}

/**
 * Checks whether selected text appears to be non-English Indic script without English words.
 */
function isNonEnglishIndicText(text) {
  if (!text) return false;
  const hasIndic = /[\u0900-\u0D7F]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  return hasIndic && !hasLatin;
}

export function isEditableTextField(el) {
  if (!el || !el.isConnected) return false;
  if (el.readOnly || el.disabled) return false;
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') {
    const t = (el.type || 'text').toLowerCase();
    return t === 'text' || t === 'search' || t === 'url' || t === '';
  }
  return false;
}

/**
 * Proportionally distributes translated words across N ordered phrase fragments.
 */
function distributeWordsAcrossBoxes(words, weights) {
  const n = weights.length;
  if (n <= 0) return [];
  if (n === 1) return [words.join(' ')];
  if (!words || words.length === 0) return Array(n).fill('');

  const m = words.length;
  if (m < n) {
    return words.map((w) => w).concat(Array(n - m).fill(''));
  }

  const totalW = weights.reduce((a, b) => a + b, 0) || n;
  const counts = [];
  let remainingWords = m;
  let remainingW = totalW;

  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      counts.push(remainingWords);
    } else {
      const remSlots = n - 1 - i;
      const maxAllow = remainingWords - remSlots;
      let ideal = Math.round(remainingWords * (weights[i] / remainingW));
      ideal = Math.max(1, Math.min(maxAllow, ideal));
      counts.push(ideal);
      remainingWords -= ideal;
      remainingW -= weights[i];
    }
  }

  const parts = [];
  let cursor = 0;
  for (const c of counts) {
    parts.push(words.slice(cursor, cursor + c).join(' '));
    cursor += c;
  }
  return parts;
}

/**
 * Translates either the currently highlighted text range or the specified layer element(s).
 */
export async function executeInlineTranslation({
  targetLang = 'tam_Taml',
  layerId = null,
  layerIds = null,
  activePageIndex = 0,
  saveModifiedPageHtml = null,
  onStart = null,
  onComplete = null,
  onError = null
}) {
  ensureStyles();
  const langObj = TRANSLATE_LANGUAGES.find(l => l.code === targetLang) || TRANSLATE_LANGUAGES[0];
  const langName = `${langObj.name} (${langObj.native})`;

  let textToTranslate = '';
  let rangeToReplace = null;
  let targetContainer = null;
  let targetElement = null;
  let translatingWrapper = null;
  let spinnerBadge = null;
  const multiBoxItems = [];
  const multiClusters = [];

  try {
    // 0. Check if an editable <input> or <textarea> is focused or recently active (e.g. CustomizedEditor fields)
    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    let editableField = null;
    let fieldSelStart = null;
    let fieldSelEnd = null;

    if (isEditableTextField(activeEl)) {
      editableField = activeEl;
      fieldSelStart = activeEl.selectionStart;
      fieldSelEnd = activeEl.selectionEnd;
    } else if (
      typeof window !== 'undefined' &&
      window.__lastEditableSelection &&
      isEditableTextField(window.__lastEditableSelection.el) &&
      Date.now() - window.__lastEditableSelection.timestamp < 120000
    ) {
      editableField = window.__lastEditableSelection.el;
      fieldSelStart = window.__lastEditableSelection.start;
      fieldSelEnd = window.__lastEditableSelection.end;
    }

    if (editableField) {
      const fullVal = editableField.value || '';
      const hasSlice =
        typeof fieldSelStart === 'number' &&
        typeof fieldSelEnd === 'number' &&
        fieldSelStart !== fieldSelEnd;
      const sliceText = hasSlice ? fullVal.slice(fieldSelStart, fieldSelEnd).trim() : fullVal.trim();

      if (!sliceText) {
        const msg = 'Please enter or select text in the field to translate.';
        showNoticeBadge(editableField.getBoundingClientRect(), msg);
        if (onError) onError(msg);
        return false;
      }
      if (isNonEnglishIndicText(sliceText)) {
        const msg = 'Only English to Indian language translation is enabled. Please select English text.';
        showNoticeBadge(editableField.getBoundingClientRect(), msg);
        if (onError) onError(msg);
        return false;
      }

      if (onStart) onStart();
      targetContainer = editableField;
      editableField.classList.add('translating-element-pulse');
      const fieldRect = editableField.getBoundingClientRect();
      spinnerBadge = showSpinnerBadge(
        fieldRect && (fieldRect.width > 0 || fieldRect.height > 0)
          ? fieldRect
          : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 },
        langName
      );

      const res = await fetch('/api/myflipibook/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sliceText,
          src_lang: 'eng_Latn',
          tgt_lang: targetLang
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || !data.translatedText) {
        throw new Error(data.message || 'Translation service did not return translated text');
      }

      const translatedText = data.translatedText;
      const fontName = FONT_FOR_LANGUAGE[targetLang];
      if (fontName) loadGoogleFont(fontName);

      const nextVal = hasSlice
        ? fullVal.slice(0, fieldSelStart) + translatedText + fullVal.slice(fieldSelEnd)
        : translatedText;

      const proto = editableField.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(editableField, nextVal);
      } else {
        editableField.value = nextVal;
      }
      editableField.dispatchEvent(new Event('input', { bubbles: true }));
      editableField.classList.remove('translating-element-pulse');
      window.__lastEditableSelection = null;

      if (onComplete) onComplete(translatedText);
      return true;
    }

    // 1. Check if user actively highlighted a range with mouse
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const r = sel.getRangeAt(0);
      const str = r.toString().trim();
      if (str.length > 0) {
        textToTranslate = str;
        rangeToReplace = r;
        targetContainer = r.commonAncestorContainer.nodeType === 1 
          ? r.commonAncestorContainer 
          : r.commonAncestorContainer.parentElement;
      }
    }

    // 2. If no active DOM range (and NOT explicitly multi-selecting multiple boxes), check window.__lastTextSelection
    const hasExplicitMulti = (Array.isArray(layerIds) && layerIds.length > 1) ||
      (typeof window !== 'undefined' && Array.isArray(window.__multiSelectedIds) && window.__multiSelectedIds.length > 1);
    if (!textToTranslate && !hasExplicitMulti && window.__lastTextSelection && window.__lastTextSelection.text) {
      const saved = window.__lastTextSelection;
      const targetEl = document.getElementById(saved.elementId);
      if (targetEl) {
        const editableDiv = targetEl.querySelector('[contenteditable="true"]') || targetEl.querySelector('div') || targetEl;
        textToTranslate = saved.text.trim();
        targetContainer = editableDiv;
        targetElement = targetEl;
      }
    }

    // 3. If still no range text, check multi-selected boxes / group / single layer
    if (!textToTranslate) {
      const candidateIds = Array.isArray(layerIds) && layerIds.length > 0
        ? layerIds
        : (typeof window !== 'undefined' && Array.isArray(window.__multiSelectedIds) && window.__multiSelectedIds.length > 1
          ? window.__multiSelectedIds
          : (layerId || (typeof window !== 'undefined' && window.__selectedLayerId)
            ? [layerId || window.__selectedLayerId]
            : []));

      const leafBoxes = [];
      const seenLeaf = new Set();
      for (const cid of candidateIds) {
        const el = cid ? document.getElementById(cid) : null;
        if (!el) continue;
        const tag = el.tagName.toLowerCase();
        if (tag === 'g') {
          el.querySelectorAll('foreignObject, text').forEach((child) => {
            if (!seenLeaf.has(child)) {
              seenLeaf.add(child);
              leafBoxes.push(child);
            }
          });
        } else if (tag === 'foreignobject' || tag === 'text') {
          if (!seenLeaf.has(el)) {
            seenLeaf.add(el);
            leafBoxes.push(el);
          }
        }
      }

      const validLeaves = leafBoxes.map((el) => {
        const tag = el.tagName.toLowerCase();
        const containerEl = tag === 'foreignobject' ? (el.querySelector('div') || el) : el;
        const rawTxt = (tag === 'foreignobject' ? (containerEl.innerText || el.textContent) : el.textContent || '').replace(/\s+/g, ' ').trim();
        const r = el.getBoundingClientRect();
        const fs = parseFloat(window.getComputedStyle(containerEl).fontSize) || 14;
        const groupParent = el.parentElement?.closest('g[id]');
        const groupId = groupParent ? groupParent.id : '';
        return { el, tag, containerEl, rawTxt, r, fs, groupId };
      }).filter((item) => item.rawTxt.length > 0);

      if (validLeaves.length > 1) {
        // Sort in visual reading order (top-to-bottom row grouping by y, then left-to-right x)
        const byY = [...validLeaves].sort((a, b) => a.r.top - b.r.top);
        const rows = [];
        for (const item of byY) {
          const prev = rows.length > 0 ? rows[rows.length - 1][0] : null;
          if (prev && Math.abs(item.r.top - prev.r.top) <= Math.min(item.fs, prev.fs) * 0.55) {
            rows[rows.length - 1].push(item);
          } else {
            rows.push([item]);
          }
        }
        const ordered = [];
        rows.forEach((row) => {
          row.sort((a, b) => a.r.left - b.r.left);
          ordered.push(...row);
        });

        // Partition into clusters: combine ONLY adjacent short incomplete fragments (<=4 words, no terminal .!? before end)
        // such as "How We" + "Work" or "WHY" + "CHOOSE" + "US", while keeping independent blocks ("About Us" + paragraph) separate!
        const wordLeaves = ordered.filter((it) => !/^[?!.,;:]+$/.test(it.rawTxt) && !isNonEnglishIndicText(it.rawTxt) && /[A-Za-z]/.test(it.rawTxt));
        const punctLeaves = ordered.filter((it) => /^[?!]+$/.test(it.rawTxt));
        const usedPunct = new Set();

        const isShortFragment = (it) => {
          const words = it.rawTxt.split(/\s+/).filter(Boolean);
          return words.length > 0 && words.length <= 4;
        };
        const endsSentence = (txt) => /[.!?:;]$/.test(txt.trim());

        let idx = 0;
        while (idx < wordLeaves.length) {
          const first = wordLeaves[idx];
          const cluster = [first];
          if (isShortFragment(first) && !endsSentence(first.rawTxt)) {
            let j = idx + 1;
            while (j < wordLeaves.length && cluster.length < 5) {
              const prev = cluster[cluster.length - 1];
              const cand = wordLeaves[j];
              const sameGroup = Boolean(prev.groupId && cand.groupId && prev.groupId === cand.groupId);
              const closeVert = Math.abs(cand.r.top - prev.r.bottom) <= 45 && Math.abs(cand.r.left - prev.r.left) <= 180;
              const sameLine = Math.abs(cand.r.top - prev.r.top) <= Math.min(prev.fs, cand.fs) * 0.55 && (cand.r.left - prev.r.right) <= 120;
              if (isShortFragment(cand) && (sameGroup || closeVert || sameLine) && cand.rawTxt.toLowerCase() !== prev.rawTxt.toLowerCase()) {
                cluster.push(cand);
                j++;
                if (endsSentence(cand.rawTxt)) break;
              } else {
                break;
              }
            }
          }

          let query = cluster.map((it) => it.rawTxt).join(' ').trim();
          const alphaOnly = query.replace(/[^A-Za-z\s]/g, '').trim();
          if (alphaOnly && alphaOnly === alphaOnly.toUpperCase() && alphaOnly.split(/\s+/).length >= 2) {
            query = query.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
          } else if (query === 'US') {
            query = 'Us';
          }

          let stripTrailingPunct = '';
          if (cluster.length >= 1 && !/[?!]$/.test(query)) {
            const cMaxR = Math.max(...cluster.map((c) => c.r.right));
            const cMinT = Math.min(...cluster.map((c) => c.r.top));
            const cMaxB = Math.max(...cluster.map((c) => c.r.bottom));
            for (const pp of punctLeaves) {
              if (usedPunct.has(pp)) continue;
              if (pp.r.left >= cMaxR - 30 && pp.r.left <= cMaxR + 180 && pp.r.top >= cMinT - 40 && pp.r.top <= cMaxB + 50) {
                query += pp.rawTxt;
                stripTrailingPunct = pp.rawTxt;
                usedPunct.add(pp);
                break;
              }
            }
          }

          multiClusters.push({ items: cluster, query, stripTrailingPunct });
          multiBoxItems.push(...cluster);
          idx += cluster.length;
        }

        if (multiClusters.length > 0) {
          textToTranslate = multiClusters.map((c) => c.query).join('\n');
          targetElement = multiBoxItems[0].el;
          targetContainer = multiBoxItems[0].containerEl;
        }
      } else if (validLeaves.length === 1) {
        targetElement = validLeaves[0].el;
        targetContainer = validLeaves[0].containerEl;
        textToTranslate = validLeaves[0].rawTxt;
      }
    }

    if (!textToTranslate) {
      const msg = 'Please select a word, sentence, or text layer to translate.';
      showNoticeBadge(null, msg);
      if (onError) onError(msg);
      return false;
    }

    if (isNonEnglishIndicText(textToTranslate)) {
      const rect = rangeToReplace ? rangeToReplace.getBoundingClientRect() : targetContainer?.getBoundingClientRect();
      const msg = 'Only English to Indian language translation is enabled. Please select English text.';
      showNoticeBadge(rect, msg);
      if (onError) onError(msg);
      return false;
    }

    if (onStart) onStart();

    // 4. Apply the visual "disable feel" and show the spinner
    let rect = null;
    if (rangeToReplace) {
      rect = rangeToReplace.getBoundingClientRect();
      // Wrap range with temporary pulse span
      const wrapper = document.createElement('span');
      wrapper.className = 'inline-translating-pulse';
      try {
        rangeToReplace.surroundContents(wrapper);
        translatingWrapper = wrapper;
      } catch (e) {
        // Fallback for complex ranges: extract and append
        const fragment = rangeToReplace.extractContents();
        wrapper.appendChild(fragment);
        rangeToReplace.insertNode(wrapper);
        translatingWrapper = wrapper;
      }
    } else if (multiBoxItems.length > 1) {
      multiBoxItems.forEach((it) => it.containerEl?.classList.add('translating-element-pulse'));
      const left = Math.min(...multiBoxItems.map((it) => it.r.left));
      const top = Math.min(...multiBoxItems.map((it) => it.r.top));
      const right = Math.max(...multiBoxItems.map((it) => it.r.right));
      const bottom = Math.max(...multiBoxItems.map((it) => it.r.bottom));
      rect = { left, top, width: right - left, height: bottom - top };
    } else if (targetContainer) {
      rect = targetContainer.getBoundingClientRect();
      targetContainer.classList.add('translating-element-pulse');
    }

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      rect = { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    }

    spinnerBadge = showSpinnerBadge(rect, langName);

    // 5. Call Backend Translation API (using batch texts array when multiple clusters exist)
    const requestPayload = multiClusters.length > 0
      ? { texts: multiClusters.map((c) => c.query), src_lang: 'eng_Latn', tgt_lang: targetLang }
      : { text: textToTranslate, src_lang: 'eng_Latn', tgt_lang: targetLang };

    const res = await fetch('/api/myflipibook/translate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    const translationsArr = Array.isArray(data.translations) ? data.translations : (data.translatedText ? [data.translatedText] : []);
    if (!data.success || translationsArr.length === 0) {
      throw new Error(data.message || 'Translation service did not return translated text');
    }

    const translatedText = translationsArr[0] || '';

    // 6. Ensure Google Font for target Indic script is loaded
    const fontName = FONT_FOR_LANGUAGE[targetLang];
    if (fontName) {
      loadGoogleFont(fontName);
    }

    const appendIndicFallback = (el) => {
      if (!el || !fontName) return;
      const computed = window.getComputedStyle(el).fontFamily || '';
      const existing = el.style.fontFamily || computed;
      if (existing && !existing.toLowerCase().includes(fontName.toLowerCase())) {
        const generic = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
        const parts = existing.split(',').map((p) => p.trim()).filter(Boolean);
        const idx = parts.findIndex((p) => generic.has(p.replace(/['"]/g, '').toLowerCase()));
        if (idx >= 0) {
          parts.splice(idx, 0, `'${fontName}'`);
        } else {
          parts.push(`'${fontName}'`, 'sans-serif');
        }
        el.style.fontFamily = parts.join(', ');
      } else if (!existing) {
        el.style.fontFamily = `'${fontName}', sans-serif`;
      }
    };

    // Helper to replace text inside nested styled leaves (or SVG <text>/<tspan>) without stripping styles
    const replaceTextPreservingLeafStyle = (rootEl, newText) => {
      if (!rootEl) return;
      if (rootEl.tagName?.toLowerCase() === 'text') {
        const tspans = Array.from(rootEl.querySelectorAll('tspan'));
        if (tspans.length > 1) {
          // Wrap words evenly across existing tspan rows so multi-line SVG <text> stays inside its original box width!
          const origLines = tspans.map((ts) => (ts.textContent || '').trim()).filter(Boolean);
          const weights = tspans.map((ts) => Math.max(1, (ts.textContent || '').trim().split(/\s+/).filter(Boolean).length));
          const words = newText.trim().split(/\s+/).filter(Boolean);
          const wrappedParts = origLines.length > 1
            ? distributeWordsAcrossBoxes(words, weights.slice(0, origLines.length))
            : [newText];
          tspans.forEach((ts, idx) => {
            ts.textContent = idx < wrappedParts.length ? wrappedParts[idx] : '';
            appendIndicFallback(ts);
          });
        } else if (tspans.length === 1) {
          tspans[0].textContent = newText;
          appendIndicFallback(tspans[0]);
        } else {
          rootEl.textContent = newText;
        }
        appendIndicFallback(rootEl);
        return;
      }
      const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) {
        if (n.nodeValue && n.nodeValue.trim()) {
          textNodes.push(n);
        }
      }
      if (textNodes.length > 0) {
        textNodes[0].nodeValue = newText;
        for (let i = 1; i < textNodes.length; i++) {
          textNodes[i].nodeValue = '';
        }
        const hostEl = textNodes[0].parentElement || rootEl;
        appendIndicFallback(hostEl);
      } else {
        rootEl.textContent = newText;
      }
      appendIndicFallback(rootEl);
      if (rootEl.style) {
        rootEl.style.whiteSpace = 'pre-wrap';
        rootEl.style.overflowWrap = 'break-word';
      }
    };

    // 7. In-place replace translated text (preserving existing font, weight/bold, color, and box bounds)
    if (translatingWrapper) {
      const translatedSpan = document.createElement('span');
      translatedSpan.textContent = translatedText;
      const parentEl = translatingWrapper.parentElement;
      if (parentEl && fontName) {
        const parentFF = window.getComputedStyle(parentEl).fontFamily;
        if (parentFF) {
          translatedSpan.style.fontFamily = parentFF;
        }
        appendIndicFallback(translatedSpan);
      } else if (fontName) {
        translatedSpan.style.fontFamily = `'${fontName}', sans-serif`;
      }
      translatingWrapper.replaceWith(translatedSpan);
    } else if (multiClusters.length > 0) {
      multiClusters.forEach((clusterObj, cIdx) => {
        let clusterTrans = (translationsArr[cIdx] || clusterObj.query || '').trim();
        if (clusterObj.stripTrailingPunct && clusterTrans.endsWith(clusterObj.stripTrailingPunct)) {
          clusterTrans = clusterTrans.slice(0, -clusterObj.stripTrailingPunct.length).trimEnd();
        }
        if (clusterObj.items.length === 1) {
          const item = clusterObj.items[0];
          replaceTextPreservingLeafStyle(item.containerEl, clusterTrans);
          item.containerEl.classList.remove('translating-element-pulse');
        } else {
          const words = clusterTrans.split(/\s+/).filter(Boolean);
          const weights = clusterObj.items.map((it) => {
            const wc = it.rawTxt.split(/\s+/).filter(Boolean).length;
            return Math.max(1, wc * 10 + (it.fs >= 24 ? 1 : 0));
          });
          const parts = distributeWordsAcrossBoxes(words, weights);
          clusterObj.items.forEach((it, idx) => {
            replaceTextPreservingLeafStyle(it.containerEl, parts[idx] ?? '');
            it.containerEl.classList.remove('translating-element-pulse');
          });
        }
      });
    } else if (targetContainer) {
      replaceTextPreservingLeafStyle(targetContainer, translatedText);
      targetContainer.classList.remove('translating-element-pulse');
    }

    // 8. Re-measure text bounding box & trigger autosave
    const boxesToMeasure = multiBoxItems.length > 1
      ? multiBoxItems.map((it) => it.el.closest('foreignObject')).filter(Boolean)
      : [targetContainer?.closest('foreignObject') || targetElement?.closest('foreignObject')].filter(Boolean);

    if (boxesToMeasure.length > 0) {
      boxesToMeasure.forEach((foEl) => {
        const div = foEl.querySelector('div') || foEl;
        div.dispatchEvent(new Event('input', { bubbles: true }));
      });
      editCacheManager.scheduleInputMeasurement((el, highlightType) => {
        window.dispatchEvent(new CustomEvent('redraw-selection-highlight', { detail: { element: el, type: highlightType } }));
      });
    }

    if (multiBoxItems.length > 1) {
      window.dispatchEvent(new CustomEvent('redraw-selection-highlight', {
        detail: { element: multiBoxItems[0].el, type: 'selected' }
      }));
    }

    // Find the enclosing SVG to persist changes
    const svgRoot = (targetContainer || targetElement)?.closest('svg') || document.querySelector('.page-svg-container svg');
    const container = (targetContainer || targetElement)?.closest('.page-svg-container');
    const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;

    if (saveModifiedPageHtml && svgRoot) {
      saveModifiedPageHtml(pageIdx, svgRoot);
    }

    // Clear saved selection so it doesn't re-trigger stale text
    window.__savedTextSelection = null;
    window.__lastTextSelection = null;

    if (onComplete) onComplete(translatedText);
    return true;
  } catch (err) {
    console.error('[Inline Translation] Error:', err);

    // Revert visual loading state on error
    if (translatingWrapper) {
      // Unwrap
      const parent = translatingWrapper.parentNode;
      while (translatingWrapper.firstChild) {
        parent.insertBefore(translatingWrapper.firstChild, translatingWrapper);
      }
      translatingWrapper.remove();
    }
    if (targetContainer) {
      targetContainer.classList.remove('translating-element-pulse');
    }
    multiBoxItems.forEach((it) => it.containerEl?.classList.remove('translating-element-pulse'));

    if (spinnerBadge) {
      spinnerBadge.remove();
      spinnerBadge = null;
    }

    const errMsg = err.message || 'Translation failed. Please try again.';
    showNoticeBadge(targetContainer?.getBoundingClientRect?.(), errMsg);
    if (onError) onError(errMsg);
    return false;
  } finally {
    if (spinnerBadge) {
      spinnerBadge.remove();
    }
  }
}
