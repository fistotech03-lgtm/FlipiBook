/**
 * Universal PDF Builder: creates clean, multi-page PDF documents from canvases or JPEG images
 * with optional text layers for searchable, selectable text.
 * Original pure-JS implementation compatible with browser environments.
 */

const encoder = new TextEncoder();
const PT_PER_PX = 0.75; // 72 pt / 96 px

/** UTF-16BE hex for PDF hex strings */
export function utf16Hex(text) {
  let hex = '';
  for (let i = 0; i < text.length; i++) {
    hex += text.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return hex.toUpperCase();
}

/** Text-layer operators for one page: [{ text, x, baseline, width, fontSize }] */
export function buildTextLayer(fragments, pageHeightPx) {
  if (!fragments || fragments.length === 0) return '';
  const ops = ['BT', '3 Tr'];
  for (const f of fragments) {
    const text = String(f.text || '').replace(/[\u0000-\u001f\u00ad]/g, ' ');
    if (!text.trim()) continue;
    const size = Math.max(1, f.fontSize || 12);
    const width = Math.max(1, (f.width || text.length * size * 0.5) * PT_PER_PX);
    const scale = Math.max(1, Math.min(10000, (width / (text.length * size * 0.5)) * 100));
    const xPt = ((f.x || 0) * PT_PER_PX).toFixed(2);
    const yPt = (((pageHeightPx || 800) - (f.baseline || 0)) * PT_PER_PX).toFixed(2);
    ops.push(`/F1 ${size.toFixed(2)} Tf ${scale.toFixed(2)} Tz 1 0 0 1 ${xPt} ${yPt} Tm <${utf16Hex(text)}> Tj`);
  }
  ops.push('ET');
  return ops.join('\n');
}

const TO_UNICODE = `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
1 beginbfrange
<0000> <FFFF> <0000>
endbfrange
endcmap
CMapName currentdict /CMap defineresource pop
end
end`;

/**
 * Builds a PDF binary from an array of pages.
 * @param {Array<{ widthPx: number, heightPx: number, jpeg: Uint8Array, imageWidth: number, imageHeight: number, fragments?: Array }>} pages
 * @param {{ title?: string, author?: string }} [options]
 * @returns {Uint8Array}
 */
export function buildPdf(pages, { title = 'Document', author = 'Extractor' } = {}) {
  const chunks = [];
  const offsets = [];
  let length = 0;

  const push = (data) => {
    const bytes = typeof data === 'string' ? encoder.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };

  const objects = [];
  const reserve = () => {
    objects.push(null);
    return objects.length;
  };
  const define = (id, body) => {
    objects[id - 1] = body;
  };

  const pdfString = (s) =>
    `(${String(s)
      .replace(/[\\()]/g, (m) => '\\' + m)
      .replace(/[^\x20-\x7e]/g, '?')})`;

  const catalog = reserve();
  const pagesId = reserve();
  const font = reserve();
  const cidFont = reserve();
  const descriptor = reserve();
  const toUnicode = reserve();
  const info = reserve();

  define(info, `<< /Title ${pdfString(title)} /Author ${pdfString(author)} /Producer (Puter Extractor) /Creator (Puter Extractor) >>`);
  define(toUnicode, { stream: encoder.encode(TO_UNICODE) });
  define(descriptor, '<< /Type /FontDescriptor /FontName /ExtractorTextLayer /Flags 4 /FontBBox [0 -200 1000 800] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 >>');
  define(cidFont, `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /ExtractorTextLayer /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /DW 500 /CIDToGIDMap /Identity >>`);
  define(font, `<< /Type /Font /Subtype /Type0 /BaseFont /ExtractorTextLayer /Encoding /Identity-H /DescendantFonts [${cidFont} 0 R] /ToUnicode ${toUnicode} 0 R >>`);

  const kids = [];
  for (const page of pages) {
    const pageId = reserve();
    const image = reserve();
    const content = reserve();
    kids.push(pageId);

    const w = (page.widthPx * PT_PER_PX).toFixed(2);
    const h = (page.heightPx * PT_PER_PX).toFixed(2);
    const textLayerOps = buildTextLayer(page.fragments || [], page.heightPx);

    define(image, {
      dict: `/Type /XObject /Subtype /Image /Width ${page.imageWidth} /Height ${page.imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,
      stream: page.jpeg,
    });

    const streamText = `q ${w} 0 0 ${h} 0 0 cm /Im1 Do Q${textLayerOps ? '\n' + textLayerOps : ''}`;
    define(content, { stream: encoder.encode(streamText) });
    define(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im1 ${image} 0 R >> /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`);
  }

  define(pagesId, `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  define(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  push(new Uint8Array([...encoder.encode('%PDF-1.7\n%'), 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  for (let i = 0; i < objects.length; i++) {
    offsets[i] = length;
    const body = objects[i];
    if (typeof body === 'string') {
      push(`${i + 1} 0 obj\n${body}\nendobj\n`);
    } else {
      push(`${i + 1} 0 obj\n<< ${body.dict ? body.dict + ' ' : ''}/Length ${body.stream.length} >>\nstream\n`);
      push(body.stream);
      push('\nendstream\nendobj\n');
    }
  }

  const xref = length;
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`);
  push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

/**
 * Converts an HTML Canvas to JPEG Uint8Array bytes
 * @param {HTMLCanvasElement} canvas
 * @param {number} [quality=0.92]
 * @returns {Promise<Uint8Array>}
 */
export function canvasToJpegBytes(canvas, quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return reject(new Error('Canvas could not be encoded as JPEG'));
        }
        blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
      },
      'image/jpeg',
      quality
    );
  });
}
