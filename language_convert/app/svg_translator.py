import re
import html
import unicodedata
from html.parser import HTMLParser
from typing import Tuple, List, Dict, Any, Optional
from app.engine import IndicTransEngine

LANG_FONT_MAP: Dict[str, str] = {
    "tam_Taml": "Noto Sans Tamil",
    "mal_Mlym": "Noto Sans Malayalam",
    "tel_Telu": "Noto Sans Telugu",
    "kan_Knda": "Noto Sans Kannada",
    "hin_Deva": "Noto Sans Devanagari",
    "mar_Deva": "Noto Sans Devanagari",
    "san_Deva": "Noto Sans Devanagari",
    "npi_Deva": "Noto Sans Devanagari",
    "mai_Deva": "Noto Sans Devanagari",
    "gom_Deva": "Noto Sans Devanagari",
    "brx_Deva": "Noto Sans Devanagari",
    "doi_Deva": "Noto Sans Devanagari",
    "kas_Deva": "Noto Sans Devanagari",
    "snd_Deva": "Noto Sans Devanagari",
    "ben_Beng": "Noto Sans Bengali",
    "asm_Beng": "Noto Sans Bengali",
    "mni_Beng": "Noto Sans Bengali",
    "guj_Gujr": "Noto Sans Gujarati",
    "pan_Guru": "Noto Sans Gurmukhi",
    "ory_Orya": "Noto Sans Oriya",
    "urd_Arab": "Noto Naskh Arabic",
    "kas_Arab": "Noto Naskh Arabic",
    "snd_Arab": "Noto Naskh Arabic",
}

BLOCK_TAGS = {
    "div", "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "li", "ul", "ol", "td", "th", "tr", "thead", "tbody", "tfoot", "table",
    "blockquote", "section", "article", "header", "footer", "caption",
    "figcaption", "dt", "dd", "pre", "address"
}

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "param", "source", "track", "wbr"
}

SKIP_CONTAINER_TAGS = {"script", "style", "svg", "iframe", "video", "audio", "canvas"}


class _TextNode:
    __slots__ = ("text",)

    def __init__(self, text: str):
        self.text = text


class _ElementNode:
    __slots__ = ("tag", "attrs", "children", "self_closing")

    def __init__(self, tag: str, attrs: List[Tuple[str, Optional[str]]], self_closing: bool = False):
        self.tag = tag.lower()
        self.attrs = attrs
        self.children: List[Any] = []
        self.self_closing = self_closing


class _XhtmlFragmentParser(HTMLParser):
    """Lossless HTML/XHTML fragment tree builder for <foreignObject> contents."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = _ElementNode("__root__", [])
        self.stack: List[_ElementNode] = [self.root]

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        t = tag.lower()
        node = _ElementNode(t, attrs, self_closing=(t in VOID_TAGS))
        self.stack[-1].children.append(node)
        if t not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        t = tag.lower()
        node = _ElementNode(t, attrs, self_closing=True)
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag: str):
        t = tag.lower()
        if t in VOID_TAGS:
            return
        for idx in range(len(self.stack) - 1, 0, -1):
            if self.stack[idx].tag == t:
                del self.stack[idx:]
                break

    def handle_data(self, data: str):
        if data:
            self.stack[-1].children.append(_TextNode(data))


def _serialize_nodes(nodes: List[Any]) -> str:
    parts: List[str] = []
    for node in nodes:
        if isinstance(node, _TextNode):
            parts.append(html.escape(node.text, quote=False))
        elif isinstance(node, _ElementNode):
            attr_str = ""
            if node.attrs:
                formatted_attrs = []
                for k, v in node.attrs:
                    if v is None:
                        formatted_attrs.append(k)
                    else:
                        formatted_attrs.append(f'{k}="{html.escape(v, quote=True)}"')
                attr_str = " " + " ".join(formatted_attrs)
            if node.self_closing or node.tag in VOID_TAGS:
                parts.append(f"<{node.tag}{attr_str}/>")
            else:
                inner = _serialize_nodes(node.children)
                parts.append(f"<{node.tag}{attr_str}>{inner}</{node.tag}>")
    return "".join(parts)


def _extract_plain_text(nodes: List[Any]) -> str:
    buf: List[str] = []
    for node in nodes:
        if isinstance(node, _TextNode):
            buf.append(node.text)
        elif isinstance(node, _ElementNode):
            if node.tag == "br":
                buf.append(" ")
            elif node.tag not in SKIP_CONTAINER_TAGS:
                buf.append(_extract_plain_text(node.children))
    return "".join(buf)


def _unwrap_single_inline_container(nodes: List[Any]) -> Optional[_ElementNode]:
    meaningful = [
        n for n in nodes
        if not (isinstance(n, _TextNode) and not n.text.strip())
    ]
    if len(meaningful) != 1 or not isinstance(meaningful[0], _ElementNode):
        return None
    curr = meaningful[0]
    if curr.tag in BLOCK_TAGS or curr.tag in VOID_TAGS or curr.tag in SKIP_CONTAINER_TAGS:
        return None
    while True:
        inner_meaningful = [
            c for c in curr.children
            if not (isinstance(c, _TextNode) and not c.text.strip())
        ]
        if (
            len(inner_meaningful) == 1
            and isinstance(inner_meaningful[0], _ElementNode)
            and inner_meaningful[0].tag not in BLOCK_TAGS
            and inner_meaningful[0].tag not in VOID_TAGS
            and inner_meaningful[0].tag not in SKIP_CONTAINER_TAGS
        ):
            curr = inner_meaningful[0]
        else:
            break
    return curr


def _is_skippable_text(text: str) -> bool:
    if not text:
        return True
    t = text.strip()
    if not t:
        return True
    if not re.search(r"[A-Za-z]", t):
        return True
    if re.fullmatch(r"(https?://\S+|www\.\S+|mailto:\S+|tel:\S+|@\S+|\S+@\S+\.\S+)", t, re.IGNORECASE):
        return True
    if " " not in t and re.match(r"^(https?://|www\.)", t, re.IGNORECASE):
        return True
    return False


_MULTI_SENT_SPLIT_RE = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9"\'\(\[])')


def _split_sentences(text: str) -> List[str]:
    """Splits multi-sentence paragraphs into clean sentences while preserving abbreviations/URLs."""
    t = re.sub(r'\s+', ' ', (text or '')).strip()
    if not t or len(t.split()) < 10:
        return [t] if t else []
    parts = [p.strip() for p in _MULTI_SENT_SPLIT_RE.split(t) if p.strip()]
    return parts if len(parts) > 1 else [t]


def _extract_single_fragment_text(p: Dict[str, Any]) -> Optional[str]:
    """Returns plain text if patch is a single short text block/line, else None."""
    if p['kind'] == 'text':
        if p['type'] == 'direct':
            return p['original']
        if p['type'] == 'list' and len(p['lines']) == 1:
            return p['lines'][0]['clean']
        return None
    if p['kind'] == 'foreignObject' and len(p['segments']) == 1:
        return p['segments'][0]['clean']
    return None


def _is_bold_weight(fw: str) -> bool:
    fw_l = (fw or "").strip().lower()
    if fw_l in ("bold", "bolder"):
        return True
    try:
        return float(fw_l) >= 600
    except Exception:
        return False


def _is_light_weight(fw: str) -> bool:
    fw_l = (fw or "").strip().lower()
    if fw_l in ("light", "lighter"):
        return True
    try:
        return float(fw_l) <= 350
    except Exception:
        return False


def _estimate_text_width(text: str, font_size: float, font_weight: str = "") -> float:
    """
    Estimates visual SVG pixel advance width for Latin and Indic scripts so text
    wraps and scales reliably inside its enclosing box.
    """
    if not text or font_size <= 0:
        return 0.0
    weight_mult = 1.07 if _is_bold_weight(font_weight) else (0.94 if _is_light_weight(font_weight) else 1.0)
    total = 0.0
    for ch in text:
        if ch == " ":
            total += 0.28
            continue
        code = ord(ch)
        cat = unicodedata.category(ch)
        if 0x0900 <= code <= 0x0D7F:
            if cat in ("Mn", "Me", "Cf"):
                total += 0.16
            elif cat == "Mc":
                total += 0.56
            else:
                total += 0.88
        elif ch in "iljtfrI1.,:;!'|()[]":
            total += 0.30
        elif ch in "WMwmOQGDHNRABCEKPSTUVXYZ":
            total += 0.68
        else:
            total += 0.52
    return total * font_size * weight_mult


def _wrap_by_width(text: str, max_width: float, font_size: float, font_weight: str = "") -> List[str]:
    words = text.split()
    if not words:
        return [text] if text else []
    lines: List[str] = []
    curr: List[str] = []
    curr_w = 0.0
    space_w = _estimate_text_width(" ", font_size, font_weight)
    for w in words:
        ww = _estimate_text_width(w, font_size, font_weight)
        needed = space_w if curr else 0.0
        if (curr_w + needed + ww <= max_width) or not curr:
            curr.append(w)
            curr_w += needed + ww
        else:
            lines.append(" ".join(curr))
            curr = [w]
            curr_w = ww
    if curr:
        lines.append(" ".join(curr))
    return lines


def _extract_attr(tag_str: str, attr_name: str, default: str = "") -> str:
    m = re.search(rf'\b{attr_name}=(["\'])(.*?)\1', tag_str, re.IGNORECASE)
    if m:
        return m.group(2)
    style_m = re.search(r'\bstyle=(["\'])(.*?)\1', tag_str, re.IGNORECASE)
    if style_m:
        css_m = re.search(rf'(?:^|;)\s*{attr_name}\s*:\s*([^;]+)', style_m.group(2), re.IGNORECASE)
        if css_m:
            return css_m.group(1).strip()
    return default


def _parse_float_px(val: str, default: Optional[float] = None) -> Optional[float]:
    if not val:
        return default
    m = re.search(r'([\d\.]+)', str(val))
    return float(m.group(1)) if m else default


def _set_or_update_svg_attr(tag_str: str, attr_name: str, new_val: str) -> str:
    attr_re = re.compile(rf'\b{attr_name}=(["\'])(.*?)\1', re.IGNORECASE)
    if attr_re.search(tag_str):
        return attr_re.sub(f'{attr_name}="{new_val}"', tag_str, count=1)
    # Insert right before closing '>'
    return tag_str[:-1] + f' {attr_name}="{new_val}">'


_GENERIC_CSS_FONTS = {"sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif", "ui-serif"}


def _merge_font_family(orig_ff: str, indic_font: str) -> str:
    """Preserves original font-family order first and inserts indic_font before any generic fallback."""
    parts = [p.strip() for p in orig_ff.split(",") if p.strip()]
    if any(indic_font.lower() in p.lower() for p in parts):
        return orig_ff
    quoted_indic = f"'{indic_font}'"
    inserted = False
    merged: List[str] = []
    for p in parts:
        clean_token = p.strip("'\"").lower()
        if not inserted and clean_token in _GENERIC_CSS_FONTS:
            merged.append(quoted_indic)
            inserted = True
        merged.append(p)
    if not inserted:
        merged.append(quoted_indic)
        merged.append("sans-serif")
    return ", ".join(merged)


def _append_indic_font_to_tag(tag_str: str, indic_font: str) -> str:
    """Preserves exact original font-family first and adds indic_font as fallback for Indic glyphs."""
    ff_attr_re = re.compile(r'\bfont-family=(["\'])(.*?)\1', re.IGNORECASE)
    m = ff_attr_re.search(tag_str)
    if m:
        orig_ff = m.group(2).strip()
        updated_ff = _merge_font_family(orig_ff, indic_font)
        if updated_ff != orig_ff:
            tag_str = ff_attr_re.sub(f'font-family="{html.escape(updated_ff, quote=True)}"', tag_str, count=1)
    else:
        tag_str = _set_or_update_svg_attr(tag_str, "font-family", f"'{indic_font}', Poppins, sans-serif")

    # Also update inline style font-family if present
    style_re = re.compile(r'\bstyle=(["\'])(.*?)\1', re.IGNORECASE)
    sm = style_re.search(tag_str)
    if sm:
        css = sm.group(2)
        css_ff = re.search(r'(font-family\s*:\s*)([^;]+)', css, re.IGNORECASE)
        if css_ff:
            updated_css_ff = _merge_font_family(css_ff.group(2).strip(), indic_font)
            if updated_css_ff != css_ff.group(2).strip():
                new_css = css[:css_ff.start(2)] + updated_css_ff + css[css_ff.end(2):]
                tag_str = style_re.sub(f'style={sm.group(1)}{new_css}{sm.group(1)}', tag_str, count=1)

    # Clear non-zero positive letter-spacing on translated Indic <text> so Indic ligatures render cleanly
    ls_re = re.compile(r'\bletter-spacing=(["\'])(.*?)\1', re.IGNORECASE)
    lm = ls_re.search(tag_str)
    if lm:
        val = lm.group(2).strip().lower()
        num = _parse_float_px(val, 0.0)
        if num and num > 0:
            tag_str = ls_re.sub('letter-spacing="0em"', tag_str, count=1)
    return tag_str


def _parse_path_bbox(d_str: str) -> Optional[Tuple[float, float, float, float]]:
    """Extracts approximate (x1, y1, x2, y2) bounding box from an SVG path d string."""
    if not d_str:
        return None
    tokens = re.findall(r'[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', d_str)
    xs: List[float] = []
    ys: List[float] = []
    cx, cy = 0.0, 0.0
    sx, sy = 0.0, 0.0
    cmd = ""
    i = 0
    n = len(tokens)

    def _is_num(idx: int) -> bool:
        return idx < n and not tokens[idx].isalpha()

    while i < n:
        tok = tokens[i]
        if tok.isalpha():
            cmd = tok
            i += 1
            if cmd in ("Z", "z"):
                cx, cy = sx, sy
            continue
        if not cmd:
            i += 1
            continue
        c_up = cmd.upper()
        rel = cmd.islower()
        if c_up in ("M", "L", "T"):
            if i + 1 < n and _is_num(i) and _is_num(i + 1):
                x, y = float(tokens[i]), float(tokens[i + 1])
                if rel:
                    x += cx
                    y += cy
                cx, cy = x, y
                if c_up == "M":
                    sx, sy = x, y
                    cmd = "l" if rel else "L"
                xs.append(x)
                ys.append(y)
                i += 2
            else:
                i += 1
        elif c_up == "H":
            x = float(tokens[i])
            if rel:
                x += cx
            cx = x
            xs.append(x)
            ys.append(cy)
            i += 1
        elif c_up == "V":
            y = float(tokens[i])
            if rel:
                y += cy
            cy = y
            xs.append(cx)
            ys.append(y)
            i += 1
        elif c_up == "C":
            if i + 5 < n and all(_is_num(i + k) for k in range(6)):
                for k in (0, 2, 4):
                    px, py = float(tokens[i + k]), float(tokens[i + k + 1])
                    if rel:
                        px += cx
                        py += cy
                    xs.append(px)
                    ys.append(py)
                nx, ny = float(tokens[i + 4]), float(tokens[i + 5])
                if rel:
                    nx += cx
                    ny += cy
                cx, cy = nx, ny
                i += 6
            else:
                i += 1
        elif c_up in ("S", "Q"):
            if i + 3 < n and all(_is_num(i + k) for k in range(4)):
                for k in (0, 2):
                    px, py = float(tokens[i + k]), float(tokens[i + k + 1])
                    if rel:
                        px += cx
                        py += cy
                    xs.append(px)
                    ys.append(py)
                nx, ny = float(tokens[i + 2]), float(tokens[i + 3])
                if rel:
                    nx += cx
                    ny += cy
                cx, cy = nx, ny
                i += 4
            else:
                i += 1
        elif c_up == "A":
            if i + 6 < n and all(_is_num(i + k) for k in range(7)):
                nx, ny = float(tokens[i + 5]), float(tokens[i + 6])
                if rel:
                    nx += cx
                    ny += cy
                cx, cy = nx, ny
                xs.append(nx)
                ys.append(ny)
                i += 7
            else:
                i += 1
        else:
            i += 1

    if not xs or not ys:
        return None
    return (min(xs), min(ys), max(xs), max(ys))


def _extract_shape_boxes(svg_content: str, vb_w: float, vb_h: float) -> Tuple[List[Tuple[float, float, float, float]], float]:
    """Extracts bounding boxes of card/container shapes and detects dominant template scale."""
    boxes: List[Tuple[float, float, float, float]] = []
    detected_scale = 1.0

    # Detect Figma export scale (e.g. scale(0.35273...) mapping 595x842 -> 210x297)
    scale_matches = re.findall(r'scale\((0\.\d+)\)', svg_content)
    if scale_matches:
        for sm in scale_matches:
            sv = float(sm)
            if 0.1 < sv < 0.9:
                detected_scale = sv
                break

    design_w = vb_w / detected_scale if detected_scale != 1.0 else vb_w
    design_h = vb_h / detected_scale if detected_scale != 1.0 else vb_h

    for rm in re.finditer(r'<rect\b([^>]*)>', svg_content, re.IGNORECASE):
        attrs = rm.group(1)
        lower_a = attrs.lower()
        if 'data-type="background"' in lower_a or 'data-name="overlay"' in lower_a or 'data-type="shield"' in lower_a:
            continue
        x = _parse_float_px(_extract_attr(rm.group(0), "x"), 0.0) or 0.0
        y = _parse_float_px(_extract_attr(rm.group(0), "y"), 0.0) or 0.0
        w = _parse_float_px(_extract_attr(rm.group(0), "width"), 0.0) or 0.0
        h = _parse_float_px(_extract_attr(rm.group(0), "height"), 0.0) or 0.0
        if w >= 35 and h >= 18:
            if w >= design_w * 0.92 and h >= design_h * 0.92:
                continue
            boxes.append((x, y, x + w, y + h))

    for pm in re.finditer(r'<path\b([^>]*)>', svg_content, re.IGNORECASE):
        attrs = pm.group(1)
        lower_a = attrs.lower()
        if 'data-type="image"' in lower_a or 'data-type="background"' in lower_a:
            continue
        d_m = re.search(r'\bd=(["\'])(.*?)\1', attrs, re.DOTALL)
        if not d_m:
            continue
        bbox = _parse_path_bbox(d_m.group(2))
        if bbox:
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            if w >= 40 and h >= 22 and not (w >= design_w * 0.92 and h >= design_h * 0.92):
                boxes.append(bbox)

    return boxes, detected_scale


def _find_group_spans(svg_content: str) -> List[Tuple[int, int, str]]:
    """Finds balanced <g ...>...</g> element spans whose data-type is 'group'."""
    spans: List[Tuple[int, int, str]] = []
    tag_re = re.compile(r'<(/?)g\b([^>]*)>', re.IGNORECASE)
    stack: List[Tuple[int, str]] = []
    for m in tag_re.finditer(svg_content):
        is_close = bool(m.group(1))
        attrs = m.group(2) or ""
        if not is_close:
            if attrs.rstrip().endswith("/"):
                continue
            stack.append((m.start(), attrs))
        else:
            if stack:
                s_idx, s_attrs = stack.pop()
                if re.search(r'\bdata-type=(["\'])group\1', s_attrs, re.IGNORECASE):
                    spans.append((s_idx, m.end(), s_attrs))
    return spans


def _distribute_words(words: List[str], weights: List[int]) -> List[str]:
    """Partitions translated words cleanly across K text boxes proportionally to original weights."""
    k = len(weights)
    if k == 0:
        return []
    if k == 1:
        return [" ".join(words)]
    if not words:
        return [""] * k

    n = len(words)
    if n < k:
        # Fewer target words than boxes (e.g. 'Table Of' + 'Contents' -> 1 word):
        # keep translated words in main/heaviest box and empty secondary connector boxes.
        best_idx = max(range(k), key=lambda idx: weights[idx])
        out = [""] * k
        out[best_idx] = " ".join(words)
        return out

    total_w = sum(weights) or k
    counts = [1] * k
    remaining = n - k
    if remaining > 0:
        raw_extra = [(weights[i] / total_w) * remaining for i in range(k)]
        floors = [int(x) for x in raw_extra]
        for i in range(k):
            counts[i] += floors[i]
        leftover = remaining - sum(floors)
        if leftover > 0:
            order = sorted(range(k), key=lambda i: raw_extra[i] - floors[i], reverse=True)
            for i in order[:leftover]:
                counts[i] += 1

    out = []
    pos = 0
    for c in counts:
        out.append(" ".join(words[pos : pos + c]))
        pos += c
    return out


class SvgPageTranslator:
    def __init__(self, engine: IndicTransEngine):
        self.engine = engine

    @staticmethod
    def _wrap_words(text: str, max_chars: int) -> List[str]:
        words = text.split()
        if not words:
            return [text] if text else []
        lines = []
        curr = []
        curr_len = 0
        for w in words:
            word_len = len(w)
            space_needed = 1 if curr else 0
            if curr_len + word_len + space_needed <= max_chars or not curr:
                curr.append(w)
                curr_len += word_len + space_needed
            else:
                lines.append(" ".join(curr))
                curr = [w]
                curr_len = word_len
        if curr:
            lines.append(" ".join(curr))
        return lines

    def _collect_fo_segments(
        self,
        parent: _ElementNode,
        segments: List[Dict[str, Any]],
        collected_units: List[str]
    ):
        i = 0
        children = parent.children
        while i < len(children):
            child = children[i]
            if isinstance(child, _ElementNode):
                if child.tag in SKIP_CONTAINER_TAGS:
                    i += 1
                    continue
                if child.tag in BLOCK_TAGS or child.tag == "br":
                    if child.tag in BLOCK_TAGS:
                        self._collect_fo_segments(child, segments, collected_units)
                    i += 1
                    continue

            start_idx = i
            while i < len(children):
                c = children[i]
                if isinstance(c, _ElementNode) and (
                    c.tag in BLOCK_TAGS or c.tag == "br" or c.tag in SKIP_CONTAINER_TAGS
                ):
                    break
                i += 1
            end_idx = i

            run_nodes = children[start_idx:end_idx]
            raw_text = _extract_plain_text(run_nodes)
            clean_text = " ".join(raw_text.split())
            if not _is_skippable_text(clean_text):
                leading_ws = " " if raw_text and raw_text[0].isspace() else ""
                trailing_ws = " " if raw_text and len(raw_text) > 1 and raw_text[-1].isspace() else ""
                inline_wrapper = _unwrap_single_inline_container(run_nodes)
                segments.append({
                    "parent": parent,
                    "start": start_idx,
                    "end": end_idx,
                    "clean": clean_text,
                    "leading_ws": leading_ws,
                    "trailing_ws": trailing_ws,
                    "inline_wrapper": inline_wrapper,
                })
                collected_units.append(clean_text)

    @staticmethod
    def _compute_text_bounds(
        x0: float,
        y0: float,
        orig_fs: float,
        orig_w: float,
        text_anchor: str,
        shape_boxes: List[Tuple[float, float, float, float]],
        all_text_anchors: List[Tuple[float, float, float]],
        page_w: float,
        page_h: float,
        has_local_rotation: bool = False,
    ) -> Tuple[float, float, Optional[float], Optional[float]]:
        """
        Determines (available_width, available_bottom_y, next_below_y, next_below_top) for a <text> element
        based on any enclosing card/shape box, neighboring text elements, and page edges.
        """
        if has_local_rotation:
            return max(30.0, max(orig_w * 1.25, orig_fs * 4.8)), y0 + orig_fs * 1.5, None, None

        ta = (text_anchor or "").strip().lower()
        # Locate tightest enclosing shape box containing the anchor point
        enclosing: Optional[Tuple[float, float, float, float]] = None
        best_area = float("inf")
        for bx1, by1, bx2, by2 in shape_boxes:
            if (bx1 - 4 <= x0 <= bx2 + 4) and (by1 - 4 <= y0 <= by2 + 4):
                area = (bx2 - bx1) * (by2 - by1)
                if area < best_area:
                    best_area = area
                    enclosing = (bx1, by1, bx2, by2)

        # Find nearest right-side text neighbor on same row and nearest below text in same column
        right_neighbor_x: Optional[float] = None
        next_below_y: Optional[float] = None
        next_below_fs: float = orig_fs
        for tx, ty, tfs in all_text_anchors:
            if abs(tx - x0) < 0.5 and abs(ty - y0) < 0.5:
                continue
            if abs(ty - y0) < max(orig_fs, tfs) * 0.75 and tx > x0 + 5.0:
                if right_neighbor_x is None or tx < right_neighbor_x:
                    right_neighbor_x = tx
            if ty > y0 + 2.0 and abs(tx - x0) < max(80.0, orig_w * 0.9):
                if next_below_y is None or ty < next_below_y:
                    next_below_y = ty
                    next_below_fs = tfs

        if enclosing is not None:
            bx1, by1, bx2, by2 = enclosing
            pad_x = max(8.0, min(18.0, (bx2 - bx1) * 0.05))
            if ta in ("middle", "center"):
                avail_w = max(orig_w, 2.0 * min(x0 - bx1, bx2 - x0) - pad_x)
            elif ta in ("end", "right"):
                avail_w = max(orig_w, (x0 - bx1) - pad_x)
            else:
                avail_w = max(orig_w, (bx2 - x0) - pad_x)
            avail_bottom = by2 - 10.0
        else:
            if ta in ("middle", "center"):
                avail_w = max(orig_w * 1.15, min(2.0 * min(x0, page_w - x0) - 16.0, max(orig_w * 1.35, orig_fs * 6.0)))
            elif ta in ("end", "right"):
                avail_w = max(orig_w * 1.15, min(x0 - 12.0, max(orig_w * 1.35, orig_fs * 6.0)))
            else:
                slack_cap = max(orig_w * 1.35, orig_fs * 5.5)
                avail_w = max(orig_w, min(page_w - x0 - 12.0, slack_cap))
            avail_bottom = page_h - 12.0

        if right_neighbor_x is not None and ta not in ("end", "right", "middle", "center"):
            avail_w = min(avail_w, max(orig_w, right_neighbor_x - x0 - 8.0))

        next_below_top = (next_below_y - next_below_fs * 0.8) if next_below_y is not None else None
        return max(20.0, avail_w), avail_bottom, next_below_y, next_below_top

    def translate_svg_page(
        self,
        svg_content: str,
        src_lang: str,
        tgt_lang: str
    ) -> Tuple[str, int]:
        """
        Parses an SVG flipbook page, extracts text from BOTH <text>/<tspan> and <foreignObject>,
        translates coherently using IndicTrans2, fits translated text cleanly inside previous
        boxes/cards, and preserves bold/weight/italic/color/alignment properties accurately.
        """
        if not svg_content:
            return svg_content, 0

        vb_m = re.search(r'\bviewBox=(["\'])\s*[\d\.\-]+\s+[\d\.\-]+\s+([\d\.]+)\s+([\d\.]+)\s*\1', svg_content)
        vb_w = float(vb_m.group(2)) if vb_m else 210.0
        vb_h = float(vb_m.group(3)) if vb_m else 297.0
        shape_boxes, design_scale = _extract_shape_boxes(svg_content, vb_w, vb_h)
        design_w = vb_w / design_scale if design_scale != 1.0 else vb_w
        design_h = vb_h / design_scale if design_scale != 1.0 else vb_h

        text_pattern = re.compile(r'(<text\b[^>]*>)(.*?)(</text>)', re.DOTALL | re.IGNORECASE)
        tspan_pattern = re.compile(r'<tspan\b([^>]*)>(.*?)</tspan>', re.DOTALL | re.IGNORECASE)
        fo_pattern = re.compile(r'(<foreignObject\b[^>]*>)(.*?)(</foreignObject>)', re.DOTALL | re.IGNORECASE)

        collected_units: List[str] = []
        parsed_patches: List[Dict[str, Any]] = []
        all_text_anchors: List[Tuple[float, float, float]] = []

        # Collect anchor positions of all <text> blocks first for collision/neighbor awareness
        raw_text_matches = list(text_pattern.finditer(svg_content))
        for tm in raw_text_matches:
            opening = tm.group(1)
            body = tm.group(2)
            fs = _parse_float_px(_extract_attr(opening, "font-size"), 14.0) or 14.0
            first_ts = tspan_pattern.search(body)
            ax = _parse_float_px(_extract_attr(first_ts.group(0), "x") if first_ts else _extract_attr(opening, "x"), 0.0) or 0.0
            ay = _parse_float_px(_extract_attr(first_ts.group(0), "y") if first_ts else _extract_attr(opening, "y"), 0.0) or 0.0
            all_text_anchors.append((ax, ay, fs))

        # 1A. Extract <text>...</text> blocks
        for tm in raw_text_matches:
            opening = tm.group(1)
            body = tm.group(2)
            closing = tm.group(3)
            full_span = tm.span()

            orig_fs = _parse_float_px(_extract_attr(opening, "font-size"), 14.0) or 14.0
            orig_fw = _extract_attr(opening, "font-weight", "")
            text_anchor = _extract_attr(opening, "text-anchor", "")
            has_local_rotation = bool(re.search(r'\btransform=[^>]*\b(matrix|rotate)\(', opening, re.IGNORECASE))

            tspans = list(tspan_pattern.finditer(body))
            if not tspans:
                raw = re.sub(r'<[^>]+>', '', body).strip()
                clean = html.unescape(" ".join(raw.split()))
                x0 = _parse_float_px(_extract_attr(opening, "x"), 0.0) or 0.0
                y0 = _parse_float_px(_extract_attr(opening, "y"), 0.0) or 0.0
                orig_w = _estimate_text_width(clean, orig_fs, orig_fw)
                parsed_patches.append({
                    'kind': 'text',
                    'span': full_span,
                    'opening': opening,
                    'closing': closing,
                    'type': 'direct',
                    'original': clean,
                    'orig_fs': orig_fs,
                    'orig_fw': orig_fw,
                    'text_anchor': text_anchor,
                    'has_local_rotation': has_local_rotation,
                    'x0': x0,
                    'y0': y0,
                    'orig_w': orig_w,
                })
                if not _is_skippable_text(clean):
                    collected_units.append(clean)
            else:
                items = []
                for m in tspans:
                    attrs = m.group(1)
                    content = m.group(2)
                    x_m = re.search(r'\bx=[\"\']([\d\.\-]+)[\"\']', attrs)
                    y_m = re.search(r'\by=[\"\']([\d\.\-]+)[\"\']', attrs)
                    clean_attrs = re.sub(r'\s*(x|y)=[\"\'][^\"\']*[\"\']', '', attrs).strip()
                    items.append({
                        'x': float(x_m.group(1)) if x_m else None,
                        'y': float(y_m.group(1)) if y_m else None,
                        'content': content,
                        'clean_attrs': clean_attrs,
                    })

                lines = []
                curr_line = []
                curr_y = None
                for it in items:
                    y = it['y']
                    if curr_y is None or (y is not None and abs(y - curr_y) > 2.0):
                        if curr_line:
                            lines.append(curr_line)
                        curr_line = [it]
                        curr_y = y
                    else:
                        curr_line.append(it)
                if curr_line:
                    lines.append(curr_line)

                line_y_vals = [l[0]['y'] for l in lines if l[0]['y'] is not None]
                dy_est = (line_y_vals[1] - line_y_vals[0]) if len(line_y_vals) >= 2 else (orig_fs * 1.35)
                is_bullet_list = any(
                    re.match(r'^\s*([•\-\*]|\d+[\.\)])\s+', ''.join(it['content'] for it in l).strip())
                    for l in lines
                )
                is_spaced_list = len(lines) >= 2 and dy_est > orig_fs * 1.72
                is_list = is_bullet_list or is_spaced_list or len(lines) == 1

                if is_list:
                    line_entries = []
                    max_orig_w = 0.0
                    for l in lines:
                        raw_line = ''.join(it['content'] for it in l)
                        clean_line = html.unescape(" ".join(raw_line.split()))
                        x = l[0]['x']
                        y = l[0]['y']
                        line_attrs = l[0]['clean_attrs'] if len(l) == 1 else ''
                        line_fw = _extract_attr(f'<tspan {line_attrs}>', "font-weight", orig_fw) if line_attrs else orig_fw
                        line_fs = _parse_float_px(_extract_attr(f'<tspan {line_attrs}>', "font-size"), orig_fs) or orig_fs
                        max_orig_w = max(max_orig_w, _estimate_text_width(clean_line, line_fs, line_fw))
                        line_entries.append({
                            'x': x,
                            'y': y,
                            'clean': clean_line,
                            'attrs': line_attrs,
                        })
                        if not _is_skippable_text(clean_line):
                            collected_units.append(clean_line)

                    x0 = line_entries[0]['x'] if line_entries and line_entries[0]['x'] is not None else 0.0
                    y0 = line_entries[0]['y'] if line_entries and line_entries[0]['y'] is not None else 0.0
                    parsed_patches.append({
                        'kind': 'text',
                        'span': full_span,
                        'opening': opening,
                        'closing': closing,
                        'type': 'list',
                        'lines': line_entries,
                        'orig_fs': orig_fs,
                        'orig_fw': orig_fw,
                        'text_anchor': text_anchor,
                        'has_local_rotation': has_local_rotation,
                        'x0': x0,
                        'y0': y0,
                        'orig_w': max_orig_w,
                    })
                else:
                    line_texts = [html.unescape(" ".join(''.join(it['content'] for it in l).split())) for l in lines]
                    full_para = " ".join(t for t in line_texts if t)
                    line_y_coords = [l[0]['y'] for l in lines if l[0]['y'] is not None]
                    y0 = line_y_coords[0] if line_y_coords else 0.0
                    dy = (line_y_coords[1] - line_y_coords[0]) if len(line_y_coords) > 1 else (orig_fs * 1.35)
                    x0 = lines[0][0]['x'] if lines[0][0]['x'] is not None else 0.0
                    max_orig_w = max((_estimate_text_width(lt, orig_fs, orig_fw) for lt in line_texts), default=120.0)
                    uniform_attrs = items[0]['clean_attrs'] if items and all(it['clean_attrs'] == items[0]['clean_attrs'] for it in items) else ''

                    parsed_patches.append({
                        'kind': 'text',
                        'span': full_span,
                        'opening': opening,
                        'closing': closing,
                        'type': 'paragraph',
                        'full_para': full_para,
                        'x0': x0,
                        'y0': y0,
                        'dy': dy,
                        'num_lines': len(lines),
                        'orig_fs': orig_fs,
                        'orig_fw': orig_fw,
                        'text_anchor': text_anchor,
                        'has_local_rotation': has_local_rotation,
                        'orig_w': max_orig_w,
                        'uniform_attrs': uniform_attrs,
                    })
                    if not _is_skippable_text(full_para):
                        collected_units.append(full_para)

        # 1B. Extract <foreignObject>...</foreignObject> blocks (Plain Book text boxes, tables, etc.)
        for fm in fo_pattern.finditer(svg_content):
            opening = fm.group(1)
            body = fm.group(2)
            closing = fm.group(3)
            full_span = fm.span()

            lower_open = opening.lower()
            lower_body = body.lower()
            if (
                'data-type="map"' in lower_open
                or "data-type='map'" in lower_open
                or 'data-type="embed-frame"' in lower_open
                or 'slideshow-foreign-object' in lower_open
                or '<iframe' in lower_body
                or '<video' in lower_body
                or '<audio' in lower_body
            ):
                continue

            parser = _XhtmlFragmentParser()
            parser.feed(body)
            parser.close()

            segments: List[Dict[str, Any]] = []
            self._collect_fo_segments(parser.root, segments, collected_units)
            if segments:
                parsed_patches.append({
                    'kind': 'foreignObject',
                    'span': full_span,
                    'opening': opening,
                    'closing': closing,
                    'root': parser.root,
                    'segments': segments,
                    'x0': _parse_float_px(_extract_attr(opening, "x"), 0.0) or 0.0,
                    'y0': _parse_float_px(_extract_attr(opening, "y"), 0.0) or 0.0,
                    'orig_fs': _parse_float_px(_extract_attr(opening, "font-size"), 14.0) or 14.0,
                })

        # 1C. Detect split-sentence heading groups (<g data-type="group"> or closely stacked fragments,
        # such as "How We" + "Work" or "WHY" + "CHOOSE" + "US") + attach adjacent "?" / "!" glyphs.
        group_phrases: List[Dict[str, Any]] = []
        grouped_patch_ids: set = set()
        group_spans = _find_group_spans(svg_content)
        # Process outermost named phrase groups first (skipping inner wrapper <g data-name="Group"> if outer matched)
        group_spans.sort(key=lambda gs: (gs[0], -(gs[1] - gs[0])))

        # Standalone punctuation glyphs (e.g. a giant "?" right beside "WHY CHOOSE US")
        standalone_punct_patches: List[Tuple[Dict[str, Any], str]] = []
        for p in parsed_patches:
            raw_t = _extract_single_fragment_text(p)
            if raw_t and raw_t.strip() in ("?", "!"):
                standalone_punct_patches.append((p, raw_t.strip()))

        def _try_register_fragment_group(candidate_patches: List[Dict[str, Any]]) -> bool:
            if not (2 <= len(candidate_patches) <= 5):
                return False
            if any(id(p) in grouped_patch_ids for p in candidate_patches):
                return False
            frags = []
            for p in candidate_patches:
                txt = _extract_single_fragment_text(p)
                if not txt or _is_skippable_text(txt) or len(txt.split()) > 4:
                    return False
                frags.append((p, txt))
            if len({t.lower() for _, t in frags}) != len(frags):
                return False

            ys = [p.get('y0', 0.0) for p, _ in frags]
            xs = [p.get('x0', 0.0) for p, _ in frags]
            if (max(ys) - min(ys)) > 160.0 or (max(xs) - min(xs)) > 400.0:
                return False

            # Sort visual reading order: group into rows by y, then sort left-to-right by x
            frags_y_sorted = sorted(frags, key=lambda item: item[0].get('y0', 0.0))
            rows: List[List[Tuple[Dict[str, Any], str]]] = []
            for p, txt in frags_y_sorted:
                py = p.get('y0', 0.0)
                pfs = p.get('orig_fs', 14.0)
                prev_p = rows[-1][0][0] if rows else None
                same_row = False
                if prev_p is not None:
                    dy = abs(py - prev_p.get('y0', 0.0))
                    # Stacked lines differ by more than 45% of the smaller font size (e.g. 20px vs 36px tight-leading heading)
                    same_row = dy <= min(pfs, prev_p.get('orig_fs', 14.0)) * 0.45
                if same_row:
                    rows[-1].append((p, txt))
                else:
                    rows.append([(p, txt)])
            ordered_frags: List[Tuple[Dict[str, Any], str]] = []
            for r in rows:
                r.sort(key=lambda item: item[0].get('x0', 0.0))
                ordered_frags.extend(r)

            # Skip if non-final fragments end with terminal sentence punctuation
            if any(txt.rstrip()[-1] in ".!?" for _, txt in ordered_frags[:-1] if txt.rstrip()):
                return False

            combined_text = " ".join(txt for _, txt in ordered_frags).strip()
            if len(combined_text.split()) > 12:
                return False

            # Attach adjacent standalone "?" or "!" glyph so the model translates full question/exclamation grammar
            strip_trailing_punct = ""
            if not combined_text.endswith(("?", "!")):
                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)
                for pp, pch in standalone_punct_patches:
                    px, py = pp.get('x0', 0.0), pp.get('y0', 0.0)
                    if (min_x - 30.0) <= px <= (max_x + 280.0) and (min_y - 50.0) <= py <= (max_y + 80.0):
                        combined_text = f"{combined_text}{pch}"
                        strip_trailing_punct = pch
                        break

            for p, _ in ordered_frags:
                grouped_patch_ids.add(id(p))
            group_phrases.append({
                'ordered_frags': ordered_frags,
                'combined': combined_text,
                'strip_trailing_punct': strip_trailing_punct,
            })
            return True

        for gs, ge, g_attrs in group_spans:
            inside_patches = [p for p in parsed_patches if gs <= p['span'][0] and p['span'][1] <= ge]
            _try_register_fragment_group(inside_patches)

        # Fallback: spatial proximity grouping for ungrouped short fragments stacked/aligned closely
        ungrouped_short = [
            p for p in parsed_patches
            if id(p) not in grouped_patch_ids
            and _extract_single_fragment_text(p) is not None
            and not _is_skippable_text(_extract_single_fragment_text(p) or "")
            and len((_extract_single_fragment_text(p) or "").split()) <= 4
        ]
        if len(ungrouped_short) >= 2:
            visited: set = set()
            for p_seed in ungrouped_short:
                if id(p_seed) in visited or id(p_seed) in grouped_patch_ids:
                    continue
                cluster = [p_seed]
                visited.add(id(p_seed))
                changed = True
                while changed and len(cluster) < 4:
                    changed = False
                    for cand in ungrouped_short:
                        if id(cand) in visited or id(cand) in grouped_patch_ids:
                            continue
                        if any(
                            (
                                abs(cand.get('y0', 0.0) - cp.get('y0', 0.0)) <= 48.0
                                and abs(cand.get('x0', 0.0) - cp.get('x0', 0.0)) <= 65.0
                            ) or (
                                abs(cand.get('y0', 0.0) - cp.get('y0', 0.0)) <= 10.0
                                and abs(cand.get('x0', 0.0) - cp.get('x0', 0.0)) <= 130.0
                            )
                            for cp in cluster
                        ):
                            cluster.append(cand)
                            visited.add(id(cand))
                            changed = True
                if len(cluster) >= 2:
                    _try_register_fragment_group(cluster)

        # Rebuild standalone units excluding grouped fragments
        standalone_units: List[str] = []
        for p in parsed_patches:
            if id(p) in grouped_patch_ids:
                continue
            if p['kind'] == 'text':
                if p['type'] == 'direct' and not _is_skippable_text(p['original']):
                    standalone_units.append(p['original'])
                elif p['type'] == 'list':
                    for le in p['lines']:
                        if not _is_skippable_text(le['clean']):
                            standalone_units.append(le['clean'])
                elif p['type'] == 'paragraph' and not _is_skippable_text(p['full_para']):
                    standalone_units.append(p['full_para'])
            elif p['kind'] == 'foreignObject':
                for seg in p['segments']:
                    standalone_units.append(seg['clean'])

        group_queries = [gp['combined'] for gp in group_phrases]
        unique_units = list(dict.fromkeys(standalone_units + group_queries))
        if not unique_units:
            return svg_content, 0

        # Expand long multi-sentence paragraphs into per-sentence queries so NMT keeps context sharp & fast
        unit_sentences_map: Dict[str, List[str]] = {}
        flat_sentences: List[str] = []
        for u in unique_units:
            sents = _split_sentences(u)
            unit_sentences_map[u] = sents
            flat_sentences.extend(sents)

        # Normalize isolated ALL-CAPS pronoun "US" and ALL-CAPS multi-word headings (e.g. "WHY CHOOSE US?" -> "Why Choose Us?")
        norm_for_engine: Dict[str, str] = {}
        for s_item in dict.fromkeys(flat_sentences):
            us = re.sub(r'\s+([?!.,])', r'\1', s_item.strip())
            alpha_part = re.sub(r'[^A-Za-z\s]', '', us).strip()
            if us == "US":
                norm_for_engine[s_item] = "Us"
            elif alpha_part and alpha_part.isupper() and len(alpha_part.split()) >= 2:
                norm_for_engine[s_item] = us.title()
            else:
                norm_for_engine[s_item] = us
        engine_queries = list(dict.fromkeys(norm_for_engine.values()))

        # 2. Batch translate all unique sentences & combined phrases
        translations = self.engine.translate_batch(
            sentences=engine_queries,
            src_lang=src_lang,
            tgt_lang=tgt_lang
        )
        engine_map = dict(zip(engine_queries, translations))
        trans_map: Dict[str, str] = {}
        for u in unique_units:
            translated_sents = [engine_map[norm_for_engine[s_item]] for s_item in unit_sentences_map[u]]
            trans_map[u] = " ".join(ts.strip() for ts in translated_sents if ts and ts.strip())

        # Map each split-phrase group's combined translation back onto its constituent boxes
        patch_trans_override: Dict[int, str] = {}
        for gp in group_phrases:
            combined_trans = trans_map.get(gp['combined'], gp['combined']).strip()
            strip_p = gp.get('strip_trailing_punct', '')
            if strip_p and combined_trans.endswith(strip_p):
                # Avoid rendering duplicate "?" / "!" next to standalone punctuation graphic
                combined_trans = combined_trans[:-len(strip_p)].rstrip()
            t_words = combined_trans.split()
            frags = gp['ordered_frags']
            # Weight primarily by original word count and secondarily font prominence for connector collapse
            weights = [max(1, len(txt.split()) * 10 + (1 if p.get('orig_fs', 14.0) >= 24 else 0)) for p, txt in frags]
            parts = _distribute_words(t_words, weights)
            for (p, _), part_txt in zip(frags, parts):
                patch_trans_override[id(p)] = part_txt

        indic_font = LANG_FONT_MAP.get(tgt_lang, "Noto Sans Tamil")

        # 3. Reconstruct SVG elements cleanly fitted within their boxes
        parsed_patches.sort(key=lambda p: p['span'][0], reverse=True)
        modified_svg = svg_content

        for patch in parsed_patches:
            start_idx, end_idx = patch['span']
            opening = patch['opening']
            closing = patch['closing']

            if patch['kind'] == 'text':
                b_type = patch['type']
                orig_fs = patch['orig_fs']
                orig_fw = patch['orig_fw']
                ta = patch['text_anchor']
                has_local_rotation = patch.get('has_local_rotation', False)
                x0 = patch['x0']
                y0 = patch['y0']
                orig_w = patch['orig_w']

                avail_w, avail_bottom, next_below_y, next_below_top = self._compute_text_bounds(
                    x0, y0, orig_fs, orig_w, ta, shape_boxes, all_text_anchors, design_w, design_h,
                    has_local_rotation=has_local_rotation,
                )

                if b_type == 'direct':
                    orig = patch['original']
                    if id(patch) not in patch_trans_override and orig not in trans_map:
                        continue
                    trans = patch_trans_override[id(patch)] if id(patch) in patch_trans_override else trans_map[orig]
                    trans_w = _estimate_text_width(trans, orig_fs, orig_fw)
                    new_opening = _append_indic_font_to_tag(opening, indic_font)
                    if trans_w > avail_w and trans_w > 0:
                        new_fs = max(6.0, round(orig_fs * (avail_w / trans_w) * 0.94, 2))
                        new_opening = _set_or_update_svg_attr(new_opening, "font-size", str(new_fs))
                    escaped_trans = html.escape(trans, quote=False)
                    new_block = f"{new_opening}{escaped_trans}{closing}"
                    modified_svg = modified_svg[:start_idx] + new_block + modified_svg[end_idx:]

                elif b_type == 'list':
                    lines_data = patch['lines']
                    any_translated = (id(patch) in patch_trans_override) or any(le['clean'] in trans_map for le in lines_data)
                    if not any_translated:
                        continue

                    new_opening = _append_indic_font_to_tag(opening, indic_font)

                    # Single-line heading/label (may translate 2 words into 3-4 words)
                    if len(lines_data) == 1:
                        le = lines_data[0]
                        trans = patch_trans_override[id(patch)] if id(patch) in patch_trans_override else trans_map.get(le['clean'], le['clean'])
                        trans_w = _estimate_text_width(trans, orig_fs, orig_fw)
                        x_str = f' x="{le["x"]}"' if le["x"] is not None else ''
                        y_val = le["y"] if le["y"] is not None else y0
                        extra = f' {le["attrs"]}' if le.get("attrs") else ''

                        if trans_w <= avail_w:
                            new_tspans = [f'<tspan{x_str} y="{y_val}"{extra}>{html.escape(trans, quote=False)}</tspan>']
                        else:
                            fit_scale = (avail_w / trans_w) * 0.94
                            words = trans.split()
                            can_wrap = False
                            if fit_scale < 0.72 and len(words) >= 2 and not has_local_rotation:
                                mid = len(words) // 2
                                best_split = (" ".join(words[:mid]), " ".join(words[mid:]))
                                best_max = float("inf")
                                for sp in range(1, len(words)):
                                    l1 = " ".join(words[:sp])
                                    l2 = " ".join(words[sp:])
                                    mw = max(_estimate_text_width(l1, orig_fs, orig_fw), _estimate_text_width(l2, orig_fs, orig_fw))
                                    if mw < best_max:
                                        best_max = mw
                                        best_split = (l1, l2)
                                line_scale = min(0.84, (avail_w / max(1.0, best_max)) * 0.94)
                                new_fs = max(6.5, round(orig_fs * line_scale, 2))
                                dy_line = round(new_fs * 1.15, 2)
                                y1 = round(y_val - dy_line * 0.25, 2)
                                y2 = round(y1 + dy_line, 2)
                                fits_bottom = (y2 <= avail_bottom)
                                clears_below = (next_below_top is None) or ((y2 + 2.0) <= next_below_top)
                                can_wrap = fits_bottom and clears_below and (new_fs > orig_fs * fit_scale * 1.1)

                            if can_wrap:
                                new_opening = _set_or_update_svg_attr(new_opening, "font-size", str(new_fs))
                                new_tspans = [
                                    f'<tspan{x_str} y="{y1}"{extra}>{html.escape(best_split[0], quote=False)}</tspan>',
                                    f'<tspan{x_str} y="{y2}"{extra}>{html.escape(best_split[1], quote=False)}</tspan>',
                                ]
                            else:
                                new_fs = max(6.0, round(orig_fs * fit_scale, 2))
                                new_opening = _set_or_update_svg_attr(new_opening, "font-size", str(new_fs))
                                new_tspans = [f'<tspan{x_str} y="{y_val}"{extra}>{html.escape(trans, quote=False)}</tspan>']
                    else:
                        # Multi-line bullet list: keep uniform font-size scaled cleanly to fit widest item
                        min_scale = 1.0
                        for le in lines_data:
                            val = trans_map.get(le['clean'], le['clean'])
                            w_est = _estimate_text_width(val, orig_fs, orig_fw)
                            if w_est > avail_w:
                                min_scale = min(min_scale, (avail_w / w_est) * 0.94)
                        if min_scale < 0.99:
                            new_fs = max(6.0, round(orig_fs * min_scale, 2))
                            new_opening = _set_or_update_svg_attr(new_opening, "font-size", str(new_fs))

                        new_tspans = []
                        for le in lines_data:
                            clean_l = le['clean']
                            x_str = f' x="{le["x"]}"' if le["x"] is not None else ''
                            y_str = f' y="{le["y"]}"' if le["y"] is not None else ''
                            extra = f' {le["attrs"]}' if le.get("attrs") else ''
                            val = trans_map.get(clean_l, clean_l)
                            new_tspans.append(f'<tspan{x_str}{y_str}{extra}>{html.escape(val, quote=False)}</tspan>')

                    new_inner = "".join(new_tspans)
                    new_block = f"{new_opening}{new_inner}{closing}"
                    modified_svg = modified_svg[:start_idx] + new_block + modified_svg[end_idx:]

                elif b_type == 'paragraph':
                    orig_para = patch['full_para']
                    if orig_para not in trans_map:
                        continue
                    trans_para = trans_map[orig_para]
                    new_opening = _append_indic_font_to_tag(opening, indic_font)

                    dy = patch['dy']
                    orig_num_lines = patch['num_lines']
                    orig_bottom = y0 + max(0, orig_num_lines - 1) * dy
                    # Keep paragraph inside both its original height (+ small margin) and enclosing shape box
                    max_bottom = min(avail_bottom, orig_bottom + dy * 0.85)
                    if next_below_y is not None:
                        max_bottom = min(max_bottom, next_below_y - orig_fs * 1.1)
                    max_bottom = max(y0 + orig_fs, max_bottom)

                    best_fs = orig_fs
                    best_dy = dy
                    best_lines = _wrap_by_width(trans_para, avail_w, orig_fs, orig_fw)

                    # Iteratively fit font-size & line-spacing until paragraph fits cleanly inside box width & height
                    s = 1.0
                    while s >= 0.54:
                        cand_fs = orig_fs * s
                        cand_dy = max(cand_fs * 1.24, dy * (0.72 + 0.28 * s))
                        cand_lines = _wrap_by_width(trans_para, avail_w, cand_fs, orig_fw)
                        cand_bottom = y0 + max(0, len(cand_lines) - 1) * cand_dy
                        widest = max((_estimate_text_width(cl, cand_fs, orig_fw) for cl in cand_lines), default=0.0)
                        if widest <= avail_w * 1.02 and cand_bottom <= max_bottom:
                            best_fs = cand_fs
                            best_dy = cand_dy
                            best_lines = cand_lines
                            break
                        best_fs = cand_fs
                        best_dy = cand_dy
                        best_lines = cand_lines
                        s -= 0.04

                    if best_fs < orig_fs * 0.99:
                        new_opening = _set_or_update_svg_attr(new_opening, "font-size", str(round(best_fs, 2)))

                    extra_attr = f' {patch["uniform_attrs"]}' if patch.get("uniform_attrs") else ''
                    new_tspans = []
                    for idx, w_line in enumerate(best_lines):
                        curr_y = round(y0 + idx * best_dy, 2)
                        escaped_line = html.escape(w_line, quote=False)
                        new_tspans.append(f'<tspan x="{x0}" y="{curr_y}"{extra_attr}>{escaped_line}</tspan>')

                    new_inner = "".join(new_tspans)
                    new_block = f"{new_opening}{new_inner}{closing}"
                    modified_svg = modified_svg[:start_idx] + new_block + modified_svg[end_idx:]

            elif patch['kind'] == 'foreignObject':
                total_orig_text = []
                total_trans_text = []

                for seg in reversed(patch['segments']):
                    orig_clean = seg['clean']
                    total_orig_text.append(orig_clean)
                    translated = patch_trans_override[id(patch)] if id(patch) in patch_trans_override else trans_map.get(orig_clean, orig_clean)
                    total_trans_text.append(translated)
                    final_text = f"{seg['leading_ws']}{translated}{seg['trailing_ws']}"

                    wrapper = seg.get('inline_wrapper')
                    if wrapper is not None:
                        wrapper.children = [_TextNode(final_text)]
                    else:
                        parent = seg['parent']
                        s_i = seg['start']
                        e_i = seg['end']
                        parent.children[s_i:e_i] = [_TextNode(final_text)]

                # Preserve original box dimensions and auto-fit text inside the <foreignObject> box
                updated_opening = _append_indic_font_to_tag(opening, indic_font)
                fo_w = _parse_float_px(_extract_attr(updated_opening, "width"))
                fo_h = _parse_float_px(_extract_attr(updated_opening, "height"))
                fo_fs = _parse_float_px(_extract_attr(updated_opening, "font-size"))

                # Ensure inner <div> wraps cleanly inside original box width instead of overflowing horizontally
                def _fit_div_styles(node: Any, font_scale: float):
                    if isinstance(node, _ElementNode):
                        if node.tag in ("div", "p", "span"):
                            new_attrs = []
                            has_style = False
                            for k, v in node.attrs:
                                if k.lower() == "style" and v is not None:
                                    has_style = True
                                    css = v
                                    # Insert Indic fallback font BEFORE generic sans-serif/serif so Indic glyphs resolve first
                                    ff_m = re.search(r'(font-family\s*:\s*)([^;]+)', css, re.IGNORECASE)
                                    if ff_m:
                                        merged_ff = _merge_font_family(ff_m.group(2).strip(), indic_font)
                                        if merged_ff != ff_m.group(2).strip():
                                            css = css[:ff_m.start(2)] + merged_ff + css[ff_m.end(2):]
                                    # Replace nowrap / pre / max-content so translated text wraps inside box
                                    if "white-space: pre;" in css or "white-space:pre;" in css or "white-space: nowrap" in css:
                                        css = re.sub(r'white-space\s*:\s*(pre|nowrap)(\s*!important)?', 'white-space: pre-wrap !important', css, flags=re.IGNORECASE)
                                    if "width: max-content" in css:
                                        css = re.sub(r'width\s*:\s*max-content(\s*!important)?', 'width: 100% !important', css, flags=re.IGNORECASE)
                                    if "overflow-wrap: normal" in css:
                                        css = re.sub(r'overflow-wrap\s*:\s*normal(\s*!important)?', 'overflow-wrap: break-word !important', css, flags=re.IGNORECASE)
                                    if font_scale < 0.99:
                                        fs_m = re.search(r'(font-size\s*:\s*)([\d\.]+)(pt|px|em|rem|%)', css, re.IGNORECASE)
                                        if fs_m:
                                            scaled = round(float(fs_m.group(2)) * font_scale, 2)
                                            css = css[:fs_m.start(2)] + f"{scaled}{fs_m.group(3)}" + css[fs_m.end(3):]
                                    new_attrs.append((k, css))
                                else:
                                    new_attrs.append((k, v))
                            if has_style:
                                node.attrs = new_attrs
                        for ch in node.children:
                            _fit_div_styles(ch, font_scale)

                # Estimate if text inside <foreignObject> needs font-size scaling to fit (fo_w, fo_h)
                font_scale = 1.0
                orig_joined = " ".join(total_orig_text)
                trans_joined = " ".join(total_trans_text)
                if fo_w and fo_h and fo_fs and orig_joined:
                    px_fs = fo_fs * 1.333 if "pt" in _extract_attr(updated_opening, "font-size").lower() else fo_fs
                    est_lines = len(_wrap_by_width(trans_joined, max(40.0, fo_w - 8.0), px_fs))
                    est_h = est_lines * px_fs * 1.25
                    if est_h > fo_h * 1.02:
                        font_scale = max(0.62, min(0.95, (fo_h / est_h) ** 0.55))
                        fs_attr = _extract_attr(updated_opening, "font-size")
                        unit_m = re.search(r'[\d\.]+(pt|px|em|rem)', fs_attr, re.IGNORECASE)
                        unit = unit_m.group(1) if unit_m else "pt"
                        updated_opening = _set_or_update_svg_attr(updated_opening, "font-size", f"{round(fo_fs * font_scale, 2)}{unit}")

                _fit_div_styles(patch['root'], font_scale)

                new_body = _serialize_nodes(patch['root'].children)
                new_block = f"{updated_opening}{new_body}{closing}"
                modified_svg = modified_svg[:start_idx] + new_block + modified_svg[end_idx:]

        # 4. Inject target Indic Google Font (full 100..900 variable weight range so bold/medium/light render accurately)
        font_url_param = indic_font.replace(" ", "+")
        weight_param = "wght@400..700" if indic_font == "Noto Naskh Arabic" else "wght@100..900"
        indic_font_import = (
            f"@import url('https://fonts.googleapis.com/css2?family={font_url_param}:{weight_param}&display=swap');"
        )
        style_tag = f'<style id="indic-fonts-style"><![CDATA[\n{indic_font_import}\n]]></style>'
        if 'id="indic-fonts-style"' not in modified_svg:
            if "<defs>" in modified_svg:
                modified_svg = modified_svg.replace("<defs>", f"<defs>{style_tag}", 1)
            else:
                svg_open_m = re.search(r'<svg\b[^>]*>', modified_svg, re.IGNORECASE)
                if svg_open_m:
                    ins_pos = svg_open_m.end()
                    modified_svg = modified_svg[:ins_pos] + f"<defs>{style_tag}</defs>" + modified_svg[ins_pos:]

        return modified_svg, len(unique_units)
