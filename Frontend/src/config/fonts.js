/**
 * fonts.js — THE single font registry for the whole app.
 *
 * Every font picker, the @font-face injector, the Google Fonts loader, the vector-text converter
 * and the saved / exported page font block read from this file.
 *
 * ── To add a font, add ONE entry to FONTS below ──────────────────────────────────────────────
 *   System font (already on every OS, nothing to load):
 *     { family: 'Arial', source: 'system' }
 *
 *   Google font (list ONLY weights Google really has for it — a weight it doesn't have makes Google
 *   reject the request and the font silently falls back):
 *     { family: 'Inter', source: 'google', weights: [300, 400, 500, 600, 700] }
 *     { family: 'Bangers', source: 'google' }                     // single-weight font → no weights
 *
 *   Local font file (put the file in /public/lib/Fonts):
 *     { family: 'Alinsa', source: 'local', faces: [{ file: 'alinsa.ttf' }] }
 *     { family: 'Maxwell', source: 'local', faces: [{ file: 'maxwell/LIGHT.ttf', weight: 300 }, …] }
 *     Variable font: { file: 'X-VariableFont_wght.ttf', weight: '100 900' }
 *     Italic face:   { file: 'X-Italic.ttf', weight: 400, style: 'italic' }
 *
 *   hidden: true  → loaded everywhere but not shown in font dropdowns.
 */

const LOCAL_DIR = '/lib/Fonts/';
const W_ALL = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export const FONTS = [
  // ── System ──────────────────────────────────────────────────────────────────────────────
  { family: 'Arial', source: 'system' },
  { family: 'Arial Black', source: 'system' },
  { family: 'Helvetica', source: 'system' },
  { family: 'Times New Roman', source: 'system' },
  { family: 'Courier New', source: 'system' },
  { family: 'Georgia', source: 'system' },
  { family: 'Verdana', source: 'system' },
  { family: 'Impact', source: 'system' },

  // ── Google ──────────────────────────────────────────────────────────────────────────────
  { family: 'Outfit', source: 'google', weights: W_ALL },
  { family: 'Inter', source: 'google', weights: W_ALL },
  { family: 'Roboto', source: 'google', weights: [100, 300, 400, 500, 700, 900] },
  { family: 'Montserrat', source: 'google', weights: W_ALL },
  { family: 'Playfair Display', source: 'google', weights: [400, 500, 600, 700, 800, 900] },
  { family: 'Raleway', source: 'google', weights: W_ALL },
  { family: 'Ubuntu', source: 'google', weights: [300, 400, 500, 700] },
  { family: 'Bangers', source: 'google' },
  { family: 'Bebas Neue', source: 'google' },
  { family: 'Mr Dafoe', source: 'google' },
  { family: 'Kaushan Script', source: 'google' },

  // ── Local files (/public/lib/Fonts) ─────────────────────────────────────────────────────
  {
    family: 'Poppins', source: 'local', faces: [
      ['Thin', 100], ['ExtraLight', 200], ['Light', 300], ['Regular', 400], ['Medium', 500],
      ['SemiBold', 600], ['Bold', 700], ['ExtraBold', 800], ['Black', 900],
    ].flatMap(([n, w]) => [
      { file: `Poppins/Poppins-${n}.ttf`, weight: w },
      { file: `Poppins/Poppins-${n === 'Regular' ? '' : n}Italic.ttf`, weight: w, style: 'italic' },
    ]),
  },
  {
    family: 'Lato', source: 'local', faces: [
      ['Thin', 100], ['Light', 300], ['Regular', 400], ['Bold', 700], ['Black', 900],
    ].flatMap(([n, w]) => [
      { file: `Lato/Lato-${n}.ttf`, weight: w },
      { file: `Lato/Lato-${n === 'Regular' ? '' : n}Italic.ttf`, weight: w, style: 'italic' },
    ]),
  },
  {
    family: 'Open Sans', source: 'local', faces: [
      { file: 'Open_Sans/OpenSans-VariableFont_wdth,wght.ttf', weight: '300 800' },
      { file: 'Open_Sans/OpenSans-Italic-VariableFont_wdth,wght.ttf', weight: '300 800', style: 'italic' },
    ],
  },
  { family: 'Oswald', source: 'local', faces: [{ file: 'Oswald/Oswald-VariableFont_wght.ttf', weight: '200 700' }] },
  {
    family: 'Merriweather', source: 'local', faces: [
      { file: 'Merriweather/Merriweather-VariableFont_opsz,wdth,wght.ttf', weight: '300 900' },
      { file: 'Merriweather/Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf', weight: '300 900', style: 'italic' },
    ],
  },
  {
    family: 'Public Sans', source: 'local', faces: [
      { file: 'Public_Sans/PublicSans-VariableFont_wght.ttf', weight: '100 900' },
      { file: 'Public_Sans/PublicSans-Italic-VariableFont_wght.ttf', weight: '100 900', style: 'italic' },
    ],
  },
  {
    family: 'Lora', source: 'local', faces: [
      { file: 'Lora/Lora-VariableFont_wght.ttf', weight: '400 700' },
      { file: 'Lora/Lora-Italic-VariableFont_wght.ttf', weight: '400 700', style: 'italic' },
    ],
  },
  {
    family: 'Cabin', source: 'local', faces: [
      { file: 'Cabin/Cabin-VariableFont_wdth,wght.ttf', weight: '400 700' },
      { file: 'Cabin/Cabin-Italic-VariableFont_wdth,wght.ttf', weight: '400 700', style: 'italic' },
    ],
  },
  { family: 'Allura', source: 'local', faces: [{ file: 'Allura/Allura-Regular.ttf' }] },
  { family: 'Parisienne', source: 'local', faces: [{ file: 'Parisienne/Parisienne-Regular.ttf' }] },
  { family: 'Satisfy', source: 'local', faces: [{ file: 'Satisfy/Satisfy-Regular.ttf' }] },
  { family: 'Designer_Signature', source: 'local', faces: [{ file: 'designer_signature/Designer_Signature.otf' }] },

  // Display / decorative
  { family: 'Alinsa', source: 'local', faces: [{ file: 'alinsa.ttf' }] },
  { family: 'Anaconda Wildstyle', source: 'local', faces: [{ file: 'AnacondaWildstyle_PERSONAL_USE_ONLY.otf' }] },
  { family: 'Arina', source: 'local', faces: [{ file: 'arina.ttf' }] },
  { family: 'Atop', source: 'local', faces: [{ file: 'Atop 400.ttf' }] },
  { family: 'Chillink', source: 'local', faces: [{ file: 'Chillink.ttf' }] },
  { family: 'Chuner', source: 'local', faces: [{ file: 'ChunerDemo-BF69e73d11e80b2.otf' }] },
  { family: 'Cowra', source: 'local', faces: [{ file: 'CowraFreeRegular-R9316.ttf' }] },
  { family: 'Duskfall', source: 'local', faces: [{ file: 'Duskfall.ttf' }] },
  { family: 'Fragor', source: 'local', faces: [{ file: 'Fragor-DemoVersion-Regular.ttf' }] },
  { family: 'Gendy', source: 'local', faces: [{ file: 'Gendy.otf' }] },
  { family: 'Gleeful Bubble', source: 'local', faces: [{ file: 'Gleeful-Bubble-Regular.ttf' }] },
  { family: 'Handrich', source: 'local', faces: [{ file: 'handrichregular-1j2pv.ttf' }] },
  { family: 'Hepab', source: 'local', faces: [{ file: 'HepabDemoVersion-Regular.ttf' }] },
  {
    family: 'Highrise', source: 'local', faces: [
      { file: 'highrisedemo-400.otf', weight: 400 },
      { file: 'highrisedemo-bold-700.otf', weight: 700 },
    ],
  },
  { family: 'Highrise Condensed', source: 'local', faces: [{ file: 'highrisedemo-condensed-400.otf' }] },
  { family: 'Jagot', source: 'local', faces: [{ file: 'Jagot-Regular.ttf' }] },
  { family: 'Ketchup Manis', source: 'local', faces: [{ file: 'KetchupManisDemoRegular-xRn1q.ttf' }] },
  { family: 'Margin', source: 'local', faces: [{ file: 'Margin DEMO.otf' }] },
  {
    family: 'Maxwell', source: 'local', faces: [
      { file: 'maxwell/MAXWELL LIGHT.ttf', weight: 300 },
      { file: 'maxwell/MAXWELL REGULAR.ttf', weight: 400 },
      { file: 'maxwell/MAXWELL BOLD.ttf', weight: 700 },
    ],
  },
  { family: 'Melrank', source: 'local', faces: [{ file: 'melrank.otf' }] },
  { family: 'Micksu', source: 'local', faces: [{ file: 'Micksu.ttf' }] },
  { family: 'Moldin', source: 'local', faces: [{ file: 'Moldin Demo.otf' }] },
  { family: 'Neoza', source: 'local', faces: [{ file: 'neoza.otf' }] },
  { family: 'Norveza', source: 'local', faces: [{ file: 'NorvezaDEMO-BF6a96d44d3be2a.ttf' }] },
  { family: 'Patty Press', source: 'local', faces: [{ file: 'Patty Press.ttf' }] },
  { family: 'Picturama', source: 'local', faces: [{ file: 'picturamafounderpersonalregular-x3xzd.otf' }] },
  { family: 'Qizzle Floof', source: 'local', faces: [{ file: 'QizzlefloofdemoRegular-m23Wj.otf' }] },
  { family: 'Rilvan', source: 'local', faces: [{ file: 'Rilvan-Regular-Exfont0cca.otf' }] },
  { family: 'Roba', source: 'local', faces: [{ file: 'Roba-Regular.ttf' }] },
  { family: 'Rotten', source: 'local', faces: [{ file: 'Rotten.ttf' }] },
  { family: 'Splatink', source: 'local', faces: [{ file: 'Splatink.otf' }] },
  { family: 'Yang Bagus', source: 'local', faces: [{ file: 'Yang Bagus.ttf' }] },
];

/** Default font for new text. */
export const DEFAULT_FONT = 'Outfit';

/* ──────────────────────────── Derived data (no need to edit below) ──────────────────────────── */

/** Every font-face file of the local fonts, with its URL and format. */
export const LOCAL_FONT_FACES = FONTS
  .filter((f) => f.source === 'local')
  .flatMap((f) => f.faces.map((face) => ({
    family: f.family,
    weight: face.weight,
    style: face.style,
    url: encodeURI(LOCAL_DIR + face.file),
    format: face.file.toLowerCase().endsWith('.otf') ? 'opentype' : 'truetype',
  })));

/** All family names shown in font dropdowns (registry order). */
export const FONT_FAMILIES = FONTS.filter((f) => !f.hidden).map((f) => f.family);

/** Display / decorative local fonts only (kept for older imports). */
export const CUSTOM_FONT_FAMILIES = Array.from(new Set(
  FONTS.filter((f) => f.source === 'local' && !f.hidden).map((f) => f.family)
));

/** First family name of a CSS font-family value, unquoted: "'Open Sans', sans-serif" → "Open Sans". */
export const cleanFontFamily = (value) => String(value || '').split(',')[0].replace(/['"]/g, '').trim();

const GENERIC = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inherit', 'initial', 'unset', '-apple-system']);

/** Registry entry for a family (case-insensitive), or null. */
export const getFont = (family) => {
  const name = cleanFontFamily(family).toLowerCase();
  return FONTS.find((f) => f.family.toLowerCase() === name) || null;
};

/** CSS font-family value with fallback: "Open Sans" → "'Open Sans', sans-serif". */
export const fontStack = (family) => `'${cleanFontFamily(family) || DEFAULT_FONT}', sans-serif`;

/** Google Fonts css2 URL for one family. Unknown families request the default weight only (always valid). */
export const googleFontUrl = (family) => {
  const name = cleanFontFamily(family);
  const entry = getFont(name);
  const weights = entry?.weights?.length ? `:wght@${entry.weights.join(';')}` : '';
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}${weights}&display=swap`;
};

/** @font-face rules for local fonts; pass window.location.origin for absolute URLs (saved/exported pages). */
export const buildCustomFontFaceCss = (origin = '') => LOCAL_FONT_FACES.map((f) => (
  `@font-face { font-family: '${f.family}'; src: url('${origin}${f.url}') format('${f.format}');`
  + `${f.weight ? ` font-weight: ${f.weight};` : ''}${f.style ? ` font-style: ${f.style};` : ''} font-display: swap; }`
)).join('\n');

/** <link> tags for the Google fonts in `families` (default: all registry Google fonts) — for exported HTML. */
export const buildGoogleFontLinks = (families = null) => {
  const list = families
    ? Array.from(new Set(families.map(cleanFontFamily))).filter((f) => {
      const e = getFont(f);
      return f && !GENERIC.has(f.toLowerCase()) && (!e || e.source === 'google');
    })
    : FONTS.filter((f) => f.source === 'google').map((f) => f.family);
  return list.map((f) => `<link href="${googleFontUrl(f)}" rel="stylesheet">`).join('\n');
};

/**
 * Make sure a font is available in `doc`. System fonts: nothing. Local fonts: @font-face already
 * injected at startup. Google / unknown fonts: one <link> per family (one bad family can't break others).
 */
export const loadFont = (family, doc = typeof document !== 'undefined' ? document : null) => {
  const name = cleanFontFamily(family);
  if (!doc || !name || GENERIC.has(name.toLowerCase())) return;
  const entry = getFont(name);
  if (entry && entry.source !== 'google') {
    if (entry.source === 'local') injectFonts(doc);
    return;
  }
  const id = `google-font-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (doc.getElementById(id)) return;
  const link = doc.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = googleFontUrl(name);
  doc.head.appendChild(link);
};

/** Back-compat alias. */
export const loadGoogleFont = loadFont;

/** Load every font used inside an HTML string or DOM subtree (font-family attributes and styles). */
export const loadFontsUsedIn = (htmlOrNode, doc) => {
  const raw = typeof htmlOrNode === 'string' ? htmlOrNode : (htmlOrNode?.outerHTML || '');
  if (!raw.includes('font-family')) return;
  const html = raw.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
  const re = /font-family\s*[:=]\s*(?:"([^"]+)"|'([^']+)'|([^;"'>]+))/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    String(m[1] || m[2] || m[3] || '').split(',')
      .forEach((f) => loadFont(f, doc));
  }
};

/**
 * Register every registry font in `doc` (idempotent): local @font-face rules + Google stylesheets.
 * Called once at app start, so any font in the registry renders everywhere (canvas, edit mode,
 * pickers, previews) without waiting for a picker to load it.
 */
export function injectFonts(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc?.head) return;
  if (!doc.getElementById('custom-fonts-style')) {
    const style = doc.createElement('style');
    style.id = 'custom-fonts-style';
    style.textContent = buildCustomFontFaceCss();
    doc.head.appendChild(style);
  }
  if (!doc.__fbeGoogleFontsInjected) {
    doc.__fbeGoogleFontsInjected = true;
    FONTS.filter((f) => f.source === 'google').forEach((f) => loadFont(f.family, doc));
  }
}

/** Back-compat alias. */
export const injectCustomFonts = injectFonts;

/**
 * Numeric weights a family really has (e.g. [400] for a single-weight display font), or null when
 * the font isn't in the registry (unknown → let the UI offer every weight).
 * System fonts: regular + bold. Variable local fonts ('300 800') expand to every 100 step.
 */
export const getFontWeights = (family) => {
  const entry = getFont(family);
  if (!entry) return null;
  if (entry.source === 'system') return [400, 700];
  if (entry.source === 'google') return entry.weights?.length ? [...entry.weights] : [400];
  const set = new Set();
  entry.faces.filter((f) => f.style !== 'italic').forEach((f) => {
    if (typeof f.weight === 'string') {
      const [lo, hi] = f.weight.split(' ').map(Number);
      for (let w = Math.ceil(lo / 100) * 100; w <= hi; w += 100) set.add(w);
    } else set.add(f.weight || 400);
  });
  return Array.from(set).sort((a, b) => a - b);
};

/** Font file URL for a family/weight (local fonts only), or null. Used by the vector-text converter. */
export const getCustomFontUrl = (fontFamily, fontWeight = 'normal', fontStyle = 'normal') => {
  const fam = cleanFontFamily(fontFamily).toLowerCase();
  let faces = LOCAL_FONT_FACES.filter((f) => f.family.toLowerCase() === fam);
  if (!faces.length) return null;
  const wantItalic = fontStyle === 'italic';
  const styled = faces.filter((f) => (f.style === 'italic') === wantItalic);
  if (styled.length) faces = styled;
  const w = fontWeight === 'bold' ? 700 : (parseInt(fontWeight, 10) || 400);
  const dist = (f) => {
    if (typeof f.weight === 'string') {
      const [lo, hi] = f.weight.split(' ').map(Number);
      return w >= lo && w <= hi ? 0 : Math.min(Math.abs(w - lo), Math.abs(w - hi));
    }
    return Math.abs((f.weight || 400) - w);
  };
  return faces.reduce((a, b) => (dist(b) < dist(a) ? b : a)).url;
};

export default FONT_FAMILIES;
