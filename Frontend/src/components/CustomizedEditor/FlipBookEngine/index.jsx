/**
 * FlipBookEngine/index.jsx
 * ─────────────────────────────────────────────────────────────
 * Modular FlipBook engine orchestrating Turn.js 4 (primary 60fps GPU compositor)
 * and React-PageFlip (fallback), with virtual sliding-window memory management
 * and high-performance raster/vector rendering.
 *
 * External dependencies (served from /public/lib/ — no CDN needed):
 *   /lib/jquery.min.js
 *   /lib/turn.min.js
 */

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import HTMLFlipBook from "react-pageflip";
import {
  PageWindowManager,
  saveAllPagesToIDB,
  getPageFromIDB,
} from "../../../utils/customizedEditor/pageWindowStore";
import { usePageBuilderWorker } from "../../../hooks/usePageBuilderWorker";
import {
  getCachedRaster,
  clearRasterCache,
  subscribeRasterCache,
} from "../../../utils/customizedEditor/pageRasterCache";

import FlipPage from "./FlipPage";
import FlipBookStyles from "./FlipBookStyles";
import CloneUnderlay from "./CloneUnderlay";
import ActiveSpreadOverlay from "./ActiveSpreadOverlay";
import CornerHotspots from "./CornerHotspots";
import {
  extractPageTexture,
  cleanStaticHtml,
  buildPageDoc,
  loadScript,
  checkTurnReady,
  afterNextFrame,
  SHEET_STYLE_DEFAULTS,
  stripEditorVideoControls,
} from "./utils/flipBookHelpers";

/**
 * Transparent sheet look, from the sheet's Book Appearance options (sheetData):
 *   texture: frosted glass (only texture)
 *   blur (px, 0–20, default 1) · haze (%, 0–100, default 36) · tint (hex, default #f3f4f6)
 *   textureIntensity (%, 0–100, default 100) · textureSize (%, 50–300, default 100)
 * Applied as CSS variables on the sheet's .fbe-sheet-fiber layer (see FlipBookStyles).
 */
const hexToRgb = (hex) => {
  const m = String(hex || "")
    .trim()
    .replace("#", "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const n = parseInt(full, 16);
  return Number.isNaN(n) || full.length !== 6
    ? [243, 244, 246]
    : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const applySheetStyle = (layerEl, sheetData = {}) => {
  if (!layerEl) return;
  const sd = {
    ...SHEET_STYLE_DEFAULTS,
    ...Object.fromEntries(
      Object.entries(sheetData || {}).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    ),
  };
  const [r, g, b] = hexToRgb(sd.tint);
  layerEl.setAttribute("data-texture", "frosted");
  layerEl.style.setProperty(
    "--sheet-blur",
    `${Math.max(0, Number(sd.blur) || 0)}px`,
  );
  layerEl.style.setProperty(
    "--sheet-haze",
    `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, (Number(sd.haze) || 0) / 100))})`,
  );
  layerEl.style.setProperty(
    "--sheet-texture-opacity",
    String(Math.min(1, Math.max(0, (Number(sd.textureIntensity) || 0) / 100))),
  );
  layerEl.style.setProperty(
    "--sheet-texture-scale",
    String(Math.max(0.2, (Number(sd.textureSize) || 100) / 100)),
  );
};

const FlipBookEngine = forwardRef(function FlipBookEngine(
  {
    pages = [],
    v_id = null, // Book ID — enables virtual sliding window + IDB per-page storage
    width = 400,
    height = 500,
    flipTime = 850,
    hardCovers = false,
    startPage = 0,
    onFlip,
    onTurning,
    autoplay = false,
    autoplayDuration = 3000,
    useMouseEvents = true,
    cornerEnable = true,
    makeFirstLastPageHard = false,
    selectCustomHardPages = false,
    customHardPages = [],
    cornerRadius = "0px",
    style = {},
    className = "",
    buildPageDoc: externalBuildPageDoc,
    activeLayout,
    flipStyle,
    textureStyle,
    pageOpacity,
    singlePage = false,
    hardCoverZoom,
    onBookReady,
    bookShadow = 'none', // box-shadow string from Book Appearance → Drop Shadow ('none' = off)
    bookShadowFilter = 'none', // same shadow as a drop-shadow() filter, used only while a peel/turn runs
  },
  ref,
) {
  // Shadow used while peeling/turning, derived from the resting box-shadow so both look identical.
  // In drop-shadow() the blur value is a standard deviation (renders ~2x wider than the same value in
  // box-shadow), so it is halved. box-shadow "x y blur spread color" → drop-shadow(x y blur/2 color).
  const turnShadowFilter = useMemo(() => {
    if (!bookShadow || bookShadow === "none") return "none";
    const m = String(bookShadow).trim().match(/^(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?\s+(.+)$/);
    if (!m) return bookShadowFilter && bookShadowFilter !== "none" ? bookShadowFilter : "none";
    const [, x, y, blur, , color] = m;
    return `drop-shadow(${x}px ${y}px ${parseFloat(blur) / 2}px ${color})`;
  }, [bookShadow, bookShadowFilter]);

  const containerRef = useRef(null); // DOM node for outer wrapper
  const bookEl = useRef(null); // DOM node for turn.js
  const reactFlipRef = useRef(null); // ref for react-pageflip
  const onFlipRef = useRef(onFlip); // always-current onFlip — avoids stale closure in turn.js
  const onTurningRef = useRef(onTurning);
  // Corner drag → centre the book as soon as the user grabs a page (not only on release)
  const lastPeelRef = useRef(null); // pageObject from the latest corner 'start'
  const queuedFlipRef = useRef(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(() =>
    Boolean(typeof window !== "undefined" && window.jQuery?.fn?.turn),
  );
  const [ready, setReady] = useState(() =>
    Boolean(typeof window !== "undefined" && window.jQuery?.fn?.turn),
  );
  const [isFlipping, setIsFlipping] = useState(false);
  const buildPageDocRef = useRef(externalBuildPageDoc || buildPageDoc);
  useEffect(() => {
    buildPageDocRef.current = externalBuildPageDoc || buildPageDoc;
  }, [externalBuildPageDoc]);

  // Global Google Fonts Preloader: Preloads all fonts used across pages into document head
  // so pages during peel/flip render with the exact font immediately without fallback flicker
  useEffect(() => {
    if (!pages || pages.length === 0) return;
    const fontsToLoad = new Set();
    pages.forEach((p) => {
      const html = p.html || p.content || "";
      if (!html) return;
      const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
      const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
      const dataFontRegex =
        /data-(?:[^"'>]*font-family|font)\s*=\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = cssRegex.exec(html)) !== null) {
        let f = match[1] || match[2];
        if (f) f = f.split(",")[0].replace(/['"]/g, "").trim();
        if (
          f &&
          !["sans-serif", "serif", "monospace", "inherit", "initial"].includes(
            f.toLowerCase(),
          )
        )
          fontsToLoad.add(f);
      }
      while ((match = attrRegex.exec(html)) !== null) {
        let f = match[1].split(",")[0].replace(/['"]/g, "").trim();
        if (
          f &&
          !["sans-serif", "serif", "monospace", "inherit", "initial"].includes(
            f.toLowerCase(),
          )
        )
          fontsToLoad.add(f);
      }
      while ((match = dataFontRegex.exec(html)) !== null) {
        let f = match[1].split(",")[0].replace(/['"]/g, "").trim();
        if (
          f &&
          !["sans-serif", "serif", "monospace", "inherit", "initial"].includes(
            f.toLowerCase(),
          )
        )
          fontsToLoad.add(f);
      }
    });
    if (fontsToLoad.size > 0) {
      const fontId = "flipibook-global-fonts-preview";
      let link = document.getElementById(fontId);
      if (!link) {
        link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      const fontArray = Array.from(fontsToLoad)
        .map((f) => f.replace(/['"]/g, "").trim())
        .filter(Boolean);
      const fontFamilies = fontArray
        .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`)
        .join("&");
      link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
    }
  }, [pages]);

  /* ── Virtual Sliding Window (Strategy 1) ──────────────────────────────
   * PageWindowManager keeps only WINDOW_SIZE pages in RAM.
   * When v_id is available, all pages are saved to IDB individually and
   * loaded on demand as the user flips or jumps.
   * When v_id is null (preview mode), falls back to full pages in memory.
   * ─────────────────────────────────────────────────────────────────────*/
  const windowManagerRef = useRef(null);
  const [isWindowLoading, setIsWindowLoading] = useState(false);

  // Initialise / re-initialise the window manager when v_id or pages change
  useEffect(() => {
    if (!v_id || pages.length === 0) return;

    const isNewBook =
      !windowManagerRef.current || windowManagerRef.current.v_id !== v_id;
    if (isNewBook) {
      windowManagerRef.current?.dispose();
      windowManagerRef.current = new PageWindowManager(
        v_id,
        pages.length,
        pages,
      );
      // Persist all pages to IDB in background (batched, non-blocking)
      saveAllPagesToIDB(v_id, pages);
    } else {
      // On page update (edit/auto-save): update window manager's in-memory copy
      const mgr = windowManagerRef.current;
      mgr.totalPages = pages.length;
      pages.forEach((page, idx) => {
        if (mgr.isInWindow(idx)) mgr.updatePage(idx, page);
      });
    }
  }, [v_id, pages]);

  // Cleanup on unmount
  useEffect(() => () => windowManagerRef.current?.dispose(), []);

  /* ── Web Worker for page-building (Strategy 2) ─────────────────────── */
  const { buildDoc: workerBuildDoc } = usePageBuilderWorker(
    typeof import.meta !== "undefined"
      ? import.meta.env?.VITE_BACKEND_URL || ""
      : "",
  );
  const [currentPage, setCurrentPage] = useState(startPage);
  const [isTurning, setIsTurning] = useState(false);
  const isFlippingRef = useRef(false);
  const turnInProgressRef = useRef(false); // true between Turn.js 'turning' and 'turned'
  const liveControlRef = useRef(null); // set by ActiveSpreadOverlay: { freeze() }
  const [cloneUnderlay, setCloneUnderlay] = useState({
    left: null,
    right: null,
  });

  const [mobileShadowSide, setMobileShadowSide] = useState("left");
  const prevPageRef = useRef(currentPage);
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Subscribe to background WebP rasterization updates for legacy Turn.js fallback if active
  useEffect(() => {
    const unsubscribe = subscribeRasterCache((pageKey, url) => {
      try {
        const pageNum = Number(pageKey);
        const staticBg =
          staticBgElementsMapRef.current.get(pageNum) ||
          bookEl.current?.querySelector(`.p${pageKey} .fbe-static-bg`);
        if (staticBg) {
          staticBg.setAttribute("data-loaded", "true");
          staticBg.removeAttribute("data-placeholder");
          staticBg.removeAttribute("data-loading");
          const existingImg = staticBg.querySelector("img");
          if (!existingImg || existingImg.src !== url) {
            staticBg.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:fill;display:block;pointer-events:none;" alt="Page ${pageKey}" />`;
          }
        }
      } catch (_) {}
    });
    return unsubscribe;
  }, []);

  const [spreadView, setSpreadView] = useState(() => {
    if (singlePage) return [startPage + 1];
    const initialTurnPage = startPage + 1;
    if (initialTurnPage % 2 !== 0) {
      return [initialTurnPage - 1, initialTurnPage];
    } else {
      return [initialTurnPage, initialTurnPage + 1];
    }
  });

  // Guarantee the active spread overlay is never revealed with stale iframes:
  // Only remove flipping state AFTER React has committed the new spreadView to the DOM
  useLayoutEffect(() => {
    isFlippingRef.current = false;
    setIsTurning(false);
    if (containerRef.current)
      containerRef.current.classList.remove(
        "fbe-is-dragging",
        "fbe-is-turning",
        "fbe-is-flipping",
      );
    if (bookEl.current)
      bookEl.current.classList.remove(
        "fbe-is-dragging",
        "fbe-is-turning",
        "fbe-is-flipping",
      );
    document
      .querySelectorAll(".fbe-is-dragging, .fbe-is-turning, .fbe-is-flipping")
      .forEach((el) =>
        el.classList.remove(
          "fbe-is-dragging",
          "fbe-is-turning",
          "fbe-is-flipping",
        ),
      );
  }, [spreadView]);

  const leftIdx = singlePage
    ? null
    : spreadView[0] > 0
      ? spreadView[0] - 1
      : null;
  const rightIdx = singlePage
    ? spreadView[0] > 0
      ? spreadView[0] - 1
      : 0
    : spreadView[1] > 0
      ? spreadView[1] - 1
      : null;

  const isInteractiveHtml = useCallback((rawHtml) => {
    if (!rawHtml || typeof rawHtml !== "string") return false;
    return /<video|<audio|<iframe|data-type=["'](video|audio|embed|form|link|slideshow|map)|slideshow|map-root-container|map-stage|flipibook-swiper|data-interaction|hotspot|data-scrollable=["']true|class=["'][^"']*interactive|<a\s+href|data-animation|data-text-effect/i.test(
      rawHtml,
    );
  }, []);

  const hasInteractiveRight = Boolean(
    rightIdx !== null &&
    rightIdx >= 0 &&
    pages[rightIdx] &&
    isInteractiveHtml(pages[rightIdx].html || pages[rightIdx].content),
  );

  useEffect(() => {
    if (!pages || pages.length === 0) return;

    const getNextSolidPage = (startIndex, direction) => {
      let idx = startIndex;
      while (idx >= 0 && idx < pages.length) {
        if (!pages[idx].isTransparentSheet && !pages[idx].isPad) {
          return { page: pages[idx], index: idx };
        }
        idx += direction;
      }
      return null;
    };

    let leftInfo = null;
    let rightInfo = null;

    if (
      leftIdx !== null &&
      leftIdx >= 0 &&
      pages[leftIdx]?.isTransparentSheet
    ) {
      leftInfo = getNextSolidPage(leftIdx - 1, -1);
      if (leftInfo) {
        const blurPercent = pages[leftIdx].sheetData?.blur ?? 100;
        leftInfo.blurPx = (blurPercent / 100) * 20;
      }
    }
    if (
      rightIdx !== null &&
      rightIdx < pages.length &&
      pages[rightIdx]?.isTransparentSheet
    ) {
      rightInfo = getNextSolidPage(rightIdx + 1, 1);
      if (rightInfo) {
        const blurPercent = pages[rightIdx].sheetData?.blur ?? 100;
        rightInfo.blurPx = (blurPercent / 100) * 20;
      }
    }

    setCloneUnderlay((prev) => {
      if (!leftInfo && !rightInfo && !prev.left && !prev.right) return prev;
      return { left: leftInfo, right: rightInfo };
    });
  }, [currentPage, pages, singlePage, leftIdx, rightIdx]);

  /* ── High-Performance Texture Renderer for 60fps GPU Turns ─────────── */
  const applyPageVisual = useCallback(
    (staticBgEl, rawContent, pageNum) => {
      if (!staticBgEl) return;
      // Transparent sheets are clear film: never show the white loading box / spinner. An empty
      // sheet stays empty; a sheet with an image shows just that image.
      if (staticBgEl.getAttribute("data-sheet") === "true") {
        const sheetHtml = stripEditorVideoControls((rawContent || "").trim());
        if (staticBgEl.__fbeSheetHtml !== sheetHtml) {
          staticBgEl.__fbeSheetHtml = sheetHtml;
          staticBgEl.innerHTML = sheetHtml
            ? `<div style="position:absolute;inset:0;pointer-events:none;">${sheetHtml}</div>`
            : "";
        }
        staticBgEl.setAttribute("data-loaded", "true");
        staticBgEl.removeAttribute("data-placeholder");
        staticBgEl.removeAttribute("data-loading");
        staticBgEl.removeAttribute("data-unloaded");
        return;
      }
      const isSkeleton =
        !rawContent ||
        !rawContent.trim() ||
        rawContent.includes("generateSkeletonPageSvg") ||
        rawContent.includes("data-skeleton") ||
        rawContent.includes("createDefaultPageData") ||
        rawContent.includes("fbe-skeleton");

      if (isSkeleton) {
        const hasCompleteImg =
          staticBgEl.querySelector("img")?.complete &&
          staticBgEl.querySelector("img")?.naturalWidth > 0;
        if (
          hasCompleteImg ||
          (staticBgEl.getAttribute("data-loaded") === "true" &&
            !staticBgEl.getAttribute("data-placeholder"))
        ) {
          return;
        }
        staticBgEl.setAttribute("data-placeholder", "true");
        staticBgEl.setAttribute("data-loading", "true");
        staticBgEl.removeAttribute("data-loaded");
        staticBgEl.innerHTML = `
                <div class="fbe-page-loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.98);z-index:2;pointer-events:none;">
                    <div class="fbe-spinner" style="width:28px;height:28px;border:2.5px solid rgba(234,114,51,0.2);border-top-color:#ea7233;border-radius:50%;animation:fbe-spin 0.7s linear infinite;"></div>
                </div>
            `;
        return;
      }

      const cached = getCachedRaster(pageNum, v_id);
      const texture =
        cached || (rawContent ? extractPageTexture(rawContent, pageNum) : null);
      if (texture) {
        const existingImg = staticBgEl.querySelector("img");
        if (existingImg) {
          const rawCurrent = (
            existingImg.getAttribute("src") ||
            existingImg.src ||
            ""
          ).split("?")[0];
          const rawTexture = (texture || "").split("?")[0];
          const isSame =
            rawCurrent === rawTexture ||
            (rawCurrent.endsWith(`/${pageNum}.webp`) &&
              rawTexture.endsWith(`/${pageNum}.webp`)) ||
            (rawCurrent.includes(`/pages/${pageNum}.webp`) &&
              rawTexture.includes(`/pages/${pageNum}.webp`)) ||
            (rawCurrent.includes(`/webp_page/${pageNum}.webp`) &&
              rawTexture.includes(`/webp_page/${pageNum}.webp`));

          if (isSame) {
            const isImgLoaded =
              existingImg.complete && existingImg.naturalWidth > 0;
            if (isImgLoaded) {
              staticBgEl.setAttribute("data-loaded", "true");
              staticBgEl.removeAttribute("data-placeholder");
              staticBgEl.removeAttribute("data-loading");
              const loader = staticBgEl.querySelector(".fbe-page-loader");
              if (loader) loader.style.display = "none";
              existingImg.style.opacity = "1";

              const cleanSvg =
                rawContent && !isSkeleton ? cleanStaticHtml(rawContent) : "";
              let vectorBg = staticBgEl.querySelector(".fbe-vector-bg");
              if (cleanSvg) {
                if (!vectorBg) {
                  vectorBg = document.createElement("div");
                  vectorBg.className = "fbe-vector-bg";
                  vectorBg.style.cssText =
                    "position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;";
                  staticBgEl.appendChild(vectorBg);
                }
                // Only rewrite when content changed — rewriting recreates live map/embed iframes (reload glitch)
                if (vectorBg.__fbeSvg !== cleanSvg) {
                  vectorBg.__fbeSvg = cleanSvg;
                  vectorBg.innerHTML = `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-bg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>${cleanSvg}`;
                }
              } else if (vectorBg) {
                vectorBg.remove();
              }
              return;
            }
            return;
          }

          const preloaderImg = new Image();
          preloaderImg.decoding = "async";
          preloaderImg.onload = () => {
            if (preloaderImg.naturalWidth > 0) {
              existingImg.src = texture;
              existingImg.style.opacity = "1";
              staticBgEl.setAttribute("data-loaded", "true");
              staticBgEl.removeAttribute("data-placeholder");
              staticBgEl.removeAttribute("data-loading");
              const loader = staticBgEl.querySelector(".fbe-page-loader");
              if (loader) loader.style.display = "none";

              const cleanSvg =
                rawContent && !isSkeleton ? cleanStaticHtml(rawContent) : "";
              let vectorBg = staticBgEl.querySelector(".fbe-vector-bg");
              if (cleanSvg) {
                if (!vectorBg) {
                  vectorBg = document.createElement("div");
                  vectorBg.className = "fbe-vector-bg";
                  vectorBg.style.cssText =
                    "position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;";
                  staticBgEl.appendChild(vectorBg);
                }
                // Only rewrite when content changed — rewriting recreates live map/embed iframes (reload glitch)
                if (vectorBg.__fbeSvg !== cleanSvg) {
                  vectorBg.__fbeSvg = cleanSvg;
                  vectorBg.innerHTML = `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-bg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>${cleanSvg}`;
                }
              } else if (vectorBg) {
                vectorBg.remove();
              }
            }
          };
          preloaderImg.onerror = () => {
            if (rawContent && !isSkeleton) {
              const cleanSvg = cleanStaticHtml(rawContent);
              staticBgEl.innerHTML =
                `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-bg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>` +
                cleanSvg;
              staticBgEl.setAttribute("data-loaded", "true");
              staticBgEl.removeAttribute("data-placeholder");
              staticBgEl.removeAttribute("data-loading");
            }
          };
          preloaderImg.src = texture;
          return;
        }
        staticBgEl.setAttribute("data-loading", "true");
        staticBgEl.setAttribute("data-placeholder", "true");
        const cleanSvg =
          rawContent && !isSkeleton ? cleanStaticHtml(rawContent) : "";
        staticBgEl.innerHTML = `
                <div class="fbe-page-loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.98);z-index:3;pointer-events:none;">
                    <div class="fbe-spinner" style="width:28px;height:28px;border:2.5px solid rgba(234,114,51,0.2);border-top-color:#ea7233;border-radius:50%;animation:fbe-spin 0.7s linear infinite;"></div>
                </div>
                <img 
                    src="${texture}" 
                    onload="const p=this.parentElement;if(p){const l=p.querySelector('.fbe-page-loader');if(l)l.style.display='none';p.setAttribute('data-loaded','true');p.removeAttribute('data-placeholder');p.removeAttribute('data-loading');}this.style.opacity='1';" 
                    onerror="const p=this.parentElement;if(p){const l=p.querySelector('.fbe-page-loader');if(l)l.style.display='none';p.setAttribute('data-loaded','true');p.removeAttribute('data-placeholder');p.removeAttribute('data-loading');}this.style.display='none';" 
                    style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:1;opacity:0;"
                    alt="Page ${pageNum}" 
                    decoding="async" 
                />
                ${cleanSvg ? `<div class="fbe-vector-bg" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;"><style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-bg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>${cleanSvg}</div>` : ""}
            `;
        const insertedVectorBg = staticBgEl.querySelector(".fbe-vector-bg");
        if (insertedVectorBg) insertedVectorBg.__fbeSvg = cleanSvg;
        const newlyInsertedImg = staticBgEl.querySelector("img");
        if (
          newlyInsertedImg &&
          newlyInsertedImg.complete &&
          newlyInsertedImg.naturalWidth > 0
        ) {
          const loader = staticBgEl.querySelector(".fbe-page-loader");
          if (loader) loader.style.display = "none";
          staticBgEl.setAttribute("data-loaded", "true");
          staticBgEl.removeAttribute("data-placeholder");
          staticBgEl.removeAttribute("data-loading");
          newlyInsertedImg.style.opacity = "1";
        }
        return;
      }

      if (isSkeleton || !rawContent || !rawContent.trim()) {
        staticBgEl.setAttribute("data-placeholder", "true");
        staticBgEl.setAttribute("data-loading", "true");
        staticBgEl.removeAttribute("data-loaded");
        staticBgEl.innerHTML = `
                <div class="fbe-page-loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.98);z-index:2;pointer-events:none;">
                    <div class="fbe-spinner" style="width:28px;height:28px;border:2.5px solid rgba(234,114,51,0.2);border-top-color:#ea7233;border-radius:50%;animation:fbe-spin 0.7s linear infinite;"></div>
                </div>
            `;
        return;
      }

      const cleanSvg = cleanStaticHtml(rawContent);
      // Skip identical rewrites so live map/embed iframes inside the page are not recreated
      if (
        staticBgEl.__fbeSvg === cleanSvg &&
        staticBgEl.getAttribute("data-loaded") === "true" &&
        !staticBgEl.querySelector(":scope > img, :scope > .fbe-page-loader")
      )
        return;
      staticBgEl.__fbeSvg = cleanSvg;
      staticBgEl.innerHTML =
        `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-bg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>` +
        cleanSvg;
      staticBgEl.setAttribute("data-loaded", "true");
      staticBgEl.removeAttribute("data-placeholder");
      staticBgEl.removeAttribute("data-loading");
    },
    [v_id],
  );

  const prewarmedSetRef = useRef(new Set());
  // GPU Texture Pre-warmer: Pre-decodes upcoming/preceding 2 pages in background so turns are instant
  useEffect(() => {
    if (!pages || pages.length === 0) return;
    const radius = 4;
    const start = Math.max(0, currentPage - radius);
    const end = Math.min(pages.length - 1, currentPage + radius);

    for (let i = start; i <= end; i++) {
      const p = pages[i];
      if (!p || p.isPad || p.isPlaceholder) continue;
      const rawContent = p.html || p.content || "";
      if (
        !rawContent ||
        rawContent.includes("generateSkeletonPageSvg") ||
        rawContent.includes("data-skeleton") ||
        rawContent.includes("createDefaultPageData")
      )
        continue;
      const texture =
        getCachedRaster(i + 1, v_id) || extractPageTexture(rawContent, i + 1);
      if (texture && !prewarmedSetRef.current.has(texture)) {
        prewarmedSetRef.current.add(texture);
        const img = new Image();
        img.decoding = "async";
        img.src = texture;
      }
    }
  }, [currentPage, pages, v_id]);

  useEffect(() => {
    if (!singlePage) return;

    const lastPageLogical =
      pages.length - (pages[pages.length - 1]?.isPad ? 2 : 1);
    const prev = prevPageRef.current;
    const current = currentPage;

    setMobileShadowSide((currentSide) => {
      if (current === 0) return "left";
      if (current >= lastPageLogical) return "right";
      if (current > prev) return "left";
      if (current < prev) return currentSide;
      return currentSide;
    });

    prevPageRef.current = current;
  }, [currentPage, singlePage, pages]);

  // Keep the ref in sync every render so turn.js always calls the latest onFlip
  useEffect(() => {
    onFlipRef.current = onFlip;
  }, [onFlip]);
  useEffect(() => {
    onTurningRef.current = onTurning;
  }, [onTurning]);

  const isProgrammaticRef = useRef(false);

  // Helper to focus the active iframe after a page turn, preventing the "first click is swallowed" bug
  const refocusActiveIframe = useCallback((logicalPage) => {
    try {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      )
        return;
      const wrapper = document.querySelector(".fbe-wrapper");
      if (!wrapper) return;

      const p1 = logicalPage + 1;
      const p2 = logicalPage + 2;
      const iframes = wrapper.querySelectorAll(
        `iframe[title="Page ${p1}"], iframe[title="Page ${p2}"]`,
      );

      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        iframe.focus();
        if (iframe.contentWindow) iframe.contentWindow.focus();
      }
    } catch (err) {}
  }, []);

  /* ── Engine-selection logic ── */
  const useFullTurnJs = true;
  const hasPages = Boolean(pages && pages.length > 0);
  const showingTurnJs = ready && useFullTurnJs && hasPages;
  const showingReactFlip = ready && !useFullTurnJs && hasPages;

  const augmentedPages = useMemo(() => {
    const arr = [...pages];
    return arr;
  }, [pages]);

  /* ── Memoize pages for react-pageflip to prevent iframe reloads ── */
  const memoizedReactPages = useMemo(() => {
    if (!showingReactFlip) return null;
    return augmentedPages.map((page, i) => {
      let isHardPage = false;

      if (makeFirstLastPageHard) {
        if (i === 0) isHardPage = true;
        if (augmentedPages.length % 2 === 0) {
          if (i === augmentedPages.length - 1) isHardPage = true;
        }
      }

      if (selectCustomHardPages) {
        if ((customHardPages || []).includes(i)) isHardPage = true;
        if (page.isPad && i > 0 && (customHardPages || []).includes(i - 1))
          isHardPage = true;
      }

      if (!makeFirstLastPageHard && !selectCustomHardPages && hardCovers) {
        if (i === 0) isHardPage = true;
        if (augmentedPages.length % 2 === 0) {
          if (i === augmentedPages.length - 1) isHardPage = true;
        }
      }

      let startX = 0;
      let startY = 0;

      // Back-cover styling only for a real final page. With an odd page count a transparent pad is
      // appended, so the real last page is a right-hand page of a spread and needs its normal spine shadow.
      const isLastPage = i === augmentedPages.length - 1 && i % 2 === 1 && !page.isPad;
      const directionClass = i % 2 === 0 ? "right" : "left";

      let sheetStyles = {};
      if (page.isTransparentSheet) {
        sheetStyles = {
          backgroundColor: "transparent",
          transform: "translateZ(0)",
        };
      } else {
        sheetStyles = {
          backgroundColor: page.isPad ? "transparent" : "#fff",
          opacity: pageOpacity,
        };
      }

      return (
        <FlipPage
          key={i}
          pageNum={i + 1}
          html={page.html || page.content}
          isPad={!!page.isPad}
          isTransparentSheet={!!page.isTransparentSheet}
          textureStyle={textureStyle}
          singlePage={singlePage}
          directionClass={directionClass}
          data-page-index={i}
          data-density={isHardPage ? "hard" : "soft"}
          className={`fbe-react-page fbe-react-page--${directionClass} ${i === 0 ? "fbe-page--first" : ""} ${isLastPage ? "fbe-page--last" : ""}`}
          style={{
            ...sheetStyles,
          }}
          onMouseDown={(e) => {
            startX = e.clientX;
            startY = e.clientY;
          }}
          onMouseUp={(e) => {
            if (e.target.closest(".fbe-drag-overlay")) return;
            const diffX = Math.abs(e.clientX - startX);
            const diffY = Math.abs(e.clientY - startY);
            if (diffX < 10 && diffY < 10) {
              e.stopPropagation();
            }
          }}
          onClick={(e) => {
            if (e.target.closest(".fbe-drag-overlay")) return;
            e.stopPropagation();
          }}
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showingReactFlip,
    augmentedPages,
    makeFirstLastPageHard,
    selectCustomHardPages,
    customHardPages,
    hardCovers,
    cornerRadius,
    textureStyle,
    singlePage,
    pageOpacity,
  ]);

  /* ── High-Speed DOM Preloader from IndexedDB (Bypasses React Re-renders) ── */
  const preloadPageToDom = useCallback(
    (pageNum) => {
      if (pageNum < 1 || pageNum > augmentedPages.length) return;
      const pageIdx = pageNum - 1;

      let staticBg = staticBgElementsMapRef.current.get(pageNum);
      if (!staticBg && bookEl.current) {
        const pageEl = bookEl.current.querySelector(`.p${pageNum}`);
        staticBg = pageEl?.querySelector(".fbe-static-bg");
        if (staticBg) staticBgElementsMapRef.current.set(pageNum, staticBg);
      }
      if (!staticBg) return;

      const existingImg = staticBg.querySelector("img");
      const isAlreadyLoaded =
        staticBg.getAttribute("data-loaded") === "true" &&
        !staticBg.getAttribute("data-placeholder");
      if (
        isAlreadyLoaded ||
        (existingImg &&
          (existingImg.complete ||
            staticBg.getAttribute("data-loaded") === "true"))
      )
        return;

      const memPage = augmentedPages[pageIdx];
      const memContent = memPage?.html || memPage?.content || "";
      const memIsPlaceholder =
        !memContent ||
        memPage?.isPlaceholder ||
        memContent.includes("generateSkeletonPageSvg") ||
        memContent.includes("data-skeleton") ||
        memContent.includes("createDefaultPageData");
      const memTexture = memIsPlaceholder
        ? null
        : getCachedRaster(pageNum, v_id) ||
          extractPageTexture(memContent, pageNum) ||
          memPage?.imageUrl;
      if (memTexture || memIsPlaceholder) {
        applyPageVisual(staticBg, memContent, pageNum);
        renderedContentMapRef.current.set(
          pageNum,
          `${pageNum}:${memTexture || ""}:${memContent.length}:${memPage?.sheetData ? JSON.stringify(memPage.sheetData) : ""}`,
        );
        return;
      }

      if (!v_id) {
        // No IDB store in this mode: render straight from in-memory content
        if (memContent) {
          applyPageVisual(staticBg, memContent, pageNum);
          renderedContentMapRef.current.set(
            pageNum,
            `${pageNum}::${memContent.length}:${memPage?.sheetData ? JSON.stringify(memPage.sheetData) : ""}`,
          );
        }
        return;
      }

      getPageFromIDB(v_id, pageIdx)
        .then((pageData) => {
          if (!pageData) return;
          const content = pageData.html || pageData.content || "";
          const idbIsPlaceholder =
            !content ||
            pageData.isPlaceholder ||
            content.includes("generateSkeletonPageSvg") ||
            content.includes("data-skeleton") ||
            content.includes("createDefaultPageData");
          const texture = idbIsPlaceholder
            ? null
            : getCachedRaster(pageNum, v_id) ||
              extractPageTexture(content, pageNum) ||
              pageData.imageUrl;
          if (staticBg) {
            applyPageVisual(staticBg, content, pageNum);
            renderedContentMapRef.current.set(
              pageNum,
              `${pageNum}:${texture || ""}:${content.length}:${pageData.sheetData ? JSON.stringify(pageData.sheetData) : ""}`,
            );
            return;
          }
          if (content && !idbIsPlaceholder && staticBg) {
            applyPageVisual(staticBg, content, pageNum);
            renderedContentMapRef.current.set(
              pageNum,
              `${pageNum}::${content.length}:${pageData.sheetData ? JSON.stringify(pageData.sheetData) : ""}`,
            );
          }
        })
        .catch(() => {});
    },
    [v_id, augmentedPages, applyPageVisual],
  );

  /* ── Smooth turns: keep page-building work OFF the animation ──────────────────────────
   * Rewriting a page's static content is a 10–20ms main-thread task. Doing it for ±4 pages at
   * the instant a turn starts (and again as it lands) caused a dropped frame on every turn.
   *  - ensureRevealedLoaded(): at turn start, only the spread being revealed (normally a no-op,
   *    because the idle preloader has already built it).
   *  - scheduleIdlePreload(): the wider ±4 window, built one page per idle slice, and never while
   *    a turn/peel is animating. */
  const preloadPageToDomRef = useRef(preloadPageToDom);
  preloadPageToDomRef.current = preloadPageToDom;
  const pageCountRef = useRef(augmentedPages.length);
  pageCountRef.current = augmentedPages.length;
  const idlePreloadRef = useRef({ queue: [], handle: null });

  const spreadOf = (pageNum) => {
    const leftP = pageNum % 2 === 0 ? pageNum : pageNum - 1;
    return [leftP, leftP + 1];
  };

  // "Cold" pages keep their static content display:none, so when Turn.js inserts them into the
  // DOM at turn start (its pagesInDOM window slides by a spread) no heavy style recalc is forced.
  // Pages within one spread of the current view are "warm" (rendered) — warmed during idle time.
  const setPageWarm = (pageNum, warm) => {
    let staticBg = staticBgElementsMapRef.current.get(pageNum);
    if (!staticBg && bookEl.current) {
      staticBg = bookEl.current.querySelector(`.p${pageNum} .fbe-static-bg`);
      if (staticBg) staticBgElementsMapRef.current.set(pageNum, staticBg);
    }
    if (!staticBg) return;
    const want = warm ? "" : "none";
    if (staticBg.style.display !== want) staticBg.style.display = want;
  };
  const applyWarmWindow = (centerPageNum) => {
    const total = pageCountRef.current;
    const [leftP, rightP] = spreadOf(centerPageNum);
    for (let p = 1; p <= total; p++)
      setPageWarm(p, p >= leftP - 2 && p <= rightP + 2);
  };

  // Page lying directly under a transparent sheet on the same side (right sheets: next page on the
  // right; a sheet's back on the left: previous page on the left). -1 if none.
  const pagesRef = useRef(augmentedPages);
  pagesRef.current = augmentedPages;
  const pageUnderSheet = (sheetIdx) => {
    const list = pagesRef.current;
    if (!list[sheetIdx]?.isTransparentSheet) return -1;
    const step = sheetIdx % 2 === 0 ? 2 : -2;
    let j = sheetIdx + step;
    while (j >= 0 && j < list.length && list[j]?.isTransparentSheet) j += step;
    return j >= 0 && j < list.length && !list[j]?.isPad ? j : -1;
  };

  // Mark the page lying under a transparent sheet so its Turn.js wrapper stays rendered (CSS):
  //  - fbe-under-sheet       → the sheet is on the current spread (always rendered)
  //  - fbe-under-sheet-near  → the sheet is on the previous/next spread (rendered only while turning)
  // Pages under sheets further away are left to Turn.js, so e.g. the cover view never shows them.
  const markUnderSheetRef = useRef(() => {});
  markUnderSheetRef.current = () => {
    const book = bookEl.current;
    if (!book) return;
    const list = pagesRef.current;
    const spreadOfIdx = (i) => (singlePage ? i : Math.floor((i + 1) / 2));
    const viewIdx = [leftIdx, rightIdx].find(
      (i) => i !== null && i !== undefined && i >= 0,
    );
    const cur = viewIdx === undefined ? 0 : spreadOfIdx(viewIdx);
    const always = new Set(),
      near = new Set();
    list.forEach((p, i) => {
      if (!p?.isTransparentSheet) return;
      const under = pageUnderSheet(i);
      if (under < 0) return;
      const delta = spreadOfIdx(i) - cur;
      const onRight = singlePage || i % 2 === 0;
      if (delta === 0) always.add(under);
      // Only an adjacent sheet that a turn will actually REVEAL over its page: a right-side sheet in
      // the next spread (turning forward) or a left-side sheet in the previous spread (turning back).
      // Forcing others kept a moving page's old slot visible mid-turn (ghost page on the left).
      else if ((onRight && delta === 1) || (!onRight && delta === -1))
        near.add(under);
    });
    book.querySelectorAll("[data-page-num]").forEach((el) => {
      const i = Number(el.getAttribute("data-page-num")) - 1;
      el.classList.toggle("fbe-under-sheet", always.has(i));
      el.classList.toggle(
        "fbe-under-sheet-near",
        !always.has(i) && near.has(i),
      );
    });
  };
  useLayoutEffect(() => {
    markUnderSheetRef.current();
  }, [leftIdx, rightIdx, augmentedPages, singlePage, ready]);
  // Re-apply each sheet's texture settings live when Book Appearance options change (no book rebuild)
  useLayoutEffect(() => {
    const book = bookEl.current;
    if (!book) return;
    book.querySelectorAll(".fbe-sheet-fiber").forEach((layer) => {
      const pageEl = layer.closest("[data-page-num]");
      const idx = pageEl
        ? Number(pageEl.getAttribute("data-page-num")) - 1
        : -1;
      if (augmentedPages[idx]?.isTransparentSheet)
        applySheetStyle(layer, augmentedPages[idx].sheetData);
    });
  }, [augmentedPages, ready]);

  const ensureRevealedLoaded = useCallback((pageNum) => {
    const total = pageCountRef.current;
    spreadOf(pageNum).forEach((p) => {
      if (p < 1 || p > total) return;
      setPageWarm(p, true);
      preloadPageToDomRef.current(p);
      // A revealed transparent sheet shows the page under it — make sure that page is ready too
      const under = pageUnderSheet(p - 1);
      if (under >= 0) {
        setPageWarm(under + 1, true);
        preloadPageToDomRef.current(under + 1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleIdlePreload = useCallback((centerPageNum) => {
    const total = pageCountRef.current;
    const [leftP, rightP] = spreadOf(centerPageNum);
    const queue = [
      leftP,
      rightP,
      rightP + 1,
      rightP + 2,
      leftP - 1,
      leftP - 2,
      rightP + 3,
      rightP + 4,
      leftP - 3,
      leftP - 4,
    ].filter((p) => p >= 1 && p <= total);
    const st = idlePreloadRef.current;
    st.queue = queue;
    st.center = centerPageNum;
    st.warmDone = false;
    if (st.handle) return;
    const hasIdle =
      typeof window !== "undefined" &&
      typeof window.requestIdleCallback === "function";
    const schedule = () => {
      st.handle = hasIdle
        ? window.requestIdleCallback(run, { timeout: 1500 })
        : setTimeout(() => run(null), 150);
    };
    const run = (deadline) => {
      st.handle = null;
      if (
        !st.warmDone &&
        !turnInProgressRef.current &&
        !isFlippingRef.current
      ) {
        applyWarmWindow(st.center);
        st.warmDone = true;
      }
      while (st.queue.length) {
        // Never compete with an animating turn/peel — try again later
        if (turnInProgressRef.current || isFlippingRef.current) break;
        if (
          deadline
            ? !deadline.didTimeout && deadline.timeRemaining() < 8
            : false
        )
          break;
        preloadPageToDomRef.current(st.queue.shift());
        if (!deadline) break; // timer fallback: one page per tick
      }
      if (st.queue.length || !st.warmDone) schedule();
    };
    schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      const st = idlePreloadRef.current;
      if (st.handle) {
        if (typeof window.cancelIdleCallback === "function") {
          try {
            window.cancelIdleCallback(st.handle);
          } catch (_) {}
        }
        clearTimeout(st.handle);
      }
      st.queue = [];
    },
    [],
  );

  useEffect(() => {
    if (!ready) return;
    scheduleIdlePreload(Math.max(1, currentPage + 1));
  }, [currentPage, ready, v_id, scheduleIdlePreload]);

  /* ── Load Scripts from local /public/lib/ (no CDN) ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!window.jQuery) await loadScript("/lib/jquery.min.js");
        if (!window.jQuery?.fn?.turn || window._turnJsVersion !== 4) {
          await loadScript("/lib/turn.min.js?v=5.6-fbe");
        }
        if (alive) {
          setScriptsLoaded(true);
          setReady(true);
        }
      } catch (err) {
        console.error("[FlipBookEngine] Script load failed:", err);
      }
    })();

    const handleGlobalMouseUp = () => {
      if (containerRef.current)
        containerRef.current.classList.remove("fbe-is-dragging");
      if (bookEl.current) bookEl.current.classList.remove("fbe-is-dragging");
      document
        .querySelectorAll(".fbe-is-dragging")
        .forEach((el) => el.classList.remove("fbe-is-dragging"));
      document
        .querySelectorAll(".fbe-wrapper iframe, .fbe-book iframe")
        .forEach((el) => {
          el.style.pointerEvents = "auto";
        });
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);

    return () => {
      alive = false;
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, []);

  /* ── Preload Google Fonts into Parent Document for Static Background ── */
  useEffect(() => {
    const fontsToLoad = new Set();
    augmentedPages.forEach((page) => {
      const html = page.html || page.content || "";
      const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
      const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = cssRegex.exec(html)) !== null) {
        let f = match[1] || match[2];
        if (f) f = f.split(",")[0].replace(/['"]/g, "").trim();
        if (
          f &&
          !["sans-serif", "serif", "monospace", "inherit"].includes(
            f.toLowerCase(),
          )
        )
          fontsToLoad.add(f);
      }
      while ((match = attrRegex.exec(html)) !== null) {
        let f = match[1].split(",")[0].replace(/['"]/g, "").trim();
        if (
          f &&
          !["sans-serif", "serif", "monospace", "inherit"].includes(
            f.toLowerCase(),
          )
        )
          fontsToLoad.add(f);
      }
    });

    if (fontsToLoad.size > 0) {
      const fontList = Array.from(fontsToLoad)
        .map((f) => f.replace(/\s+/g, "+"))
        .join("|");
      const href = `https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap`;

      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    }
  }, [augmentedPages]);

  /* ── Turn.js — "sheet" paper-curl for COVER PAGES only ── */
  const renderedContentMapRef = useRef(new Map());
  const staticBgElementsMapRef = useRef(new Map());

  const structureKey = React.useMemo(() => {
    return [
      augmentedPages.length,
      singlePage ? "1" : "0",
      makeFirstLastPageHard ? "1" : "0",
      selectCustomHardPages ? "1" : "0",
      (customHardPages || []).join(","),
      hardCovers ? "1" : "0",
      flipStyle,
      flipTime,
      cornerRadius,
      useMouseEvents ? "1" : "0",
      textureStyle?.backgroundImage || "",
      textureStyle?.backgroundColor || "",
    ].join(":");
  }, [
    augmentedPages.length,
    singlePage,
    makeFirstLastPageHard,
    selectCustomHardPages,
    customHardPages,
    hardCovers,
    flipStyle,
    flipTime,
    cornerRadius,
    useMouseEvents,
    textureStyle?.backgroundImage,
    textureStyle?.backgroundColor,
  ]);

  useEffect(() => {
    if (
      !ready ||
      !bookEl.current ||
      !pages.length ||
      !window.jQuery?.fn?.turn ||
      !useFullTurnJs
    )
      return;

    const $ = window.jQuery;
    const $book = $(bookEl.current);

    try {
      $book
        .find("*")
        .addBack()
        .each(function () {
          const elData = $(this).data();
          if (elData && elData.effect && elData.effect.handle) {
            clearInterval(elData.effect.handle);
            delete elData.effect;
          }
          try {
            $(this).turn("stop");
          } catch (_) {}
        });
      const oldData = $book.data();
      if (oldData && oldData.pages) {
        for (let k in oldData.pages) delete oldData.pages[k];
      }
      $book.turn("destroy");
    } catch (_) {
      /* noop */
    }
    $book.off();
    $book.removeData();
    $book.empty();

    renderedContentMapRef.current.clear();
    staticBgElementsMapRef.current.clear();
    turnInProgressRef.current = false;

    const augmented = augmentedPages;
    const initPage = Math.max(1, currentPage + 1);

    const pageFragment = document.createDocumentFragment();
    augmented.forEach((page, i) => {
      const pageDiv = document.createElement("div");

      // Hard by the Book Appearance rules (first/last page, custom pages, default hard covers)
      const hardByRule = (k) => {
        if (k < 0 || k >= augmented.length) return false;
        if (makeFirstLastPageHard) {
          if (k === 0) return true;
          if (augmented.length % 2 === 0 && k === augmented.length - 1) return true;
        }
        if (selectCustomHardPages) {
          if ((customHardPages || []).some((hp) => Number(hp) === k)) return true;
          if (augmented[k]?.isPad && k > 0 && (customHardPages || []).some((hp) => Number(hp) === k - 1)) return true;
        }
        if (!makeFirstLastPageHard && !selectCustomHardPages && hardCovers) {
          if (k === 0) return true;
          if (augmented.length % 2 === 0 && k === augmented.length - 1) return true;
        }
        return false;
      };
      // Front and back of a sheet turn together (Turn.js sheets: pages 1–2, 3–4, …), so a page is hard
      // if it OR the other side of its sheet is hard — otherwise e.g. the back of a hard cover (page 2)
      // would bend like soft paper when turned back.
      const sheetPartner = i % 2 === 0 ? i + 1 : i - 1;
      const isPageHard = hardByRule(i) || hardByRule(sheetPartner);

      const isFirst = i === 0;
      // Real final page only (see note above) — a page followed by the odd-count pad is an inner page.
      const isLast = i === augmented.length - 1 && i % 2 === 1 && !augmented[i]?.isPad;
      const positionClass =
        `${isFirst ? "fbe-page--first" : ""} ${isLast ? "fbe-page--last" : ""}`.trim();
      const directionClass = i % 2 === 0 ? "right" : "left";
      const pageNum = i + 1;

      if (isPageHard) {
        pageDiv.className = `hard cover fbe-page fbe-page--${directionClass} ${positionClass} p${pageNum}`;
        pageDiv.setAttribute("data-density", "hard");
        pageDiv.style.backgroundColor = page.isTransparentSheet
          ? "transparent"
          : "#ffffff";
        pageDiv.style.borderRadius =
          directionClass === "right"
            ? `0 ${cornerRadius} ${cornerRadius} 0`
            : `${cornerRadius} 0 0 ${cornerRadius}`;
      } else {
        pageDiv.className = `fbe-page fbe-page--soft fbe-page--${directionClass} ${positionClass} p${pageNum}`;
        pageDiv.style.backgroundColor = page.isTransparentSheet
          ? "transparent"
          : "#ffffff";
        pageDiv.style.borderRadius =
          directionClass === "right"
            ? `0 ${cornerRadius} ${cornerRadius} 0`
            : `${cornerRadius} 0 0 ${cornerRadius}`;
      }
      pageDiv.setAttribute("data-page-num", pageNum);

      if (page.isTransparentSheet) {
        pageDiv.style.backgroundColor = "transparent"; // look comes from the sheet layer (haze/tint/texture)
        pageDiv.style.transform = "translateZ(0)";
      }

      if (!page.isPad) {
        const inner = document.createElement("div");
        inner.className = "fbe-inner";
        inner.style.cssText =
          "position:relative;width:100%;height:100%;overflow:hidden;background:#ffffff;";
        if (page.isTransparentSheet)
          inner.style.backgroundColor = "transparent";

        const staticBg = document.createElement("div");
        staticBg.className = "fbe-static-bg";
        const bgStyleColor = page.isTransparentSheet ? "transparent" : "#fff";
        staticBg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:${bgStyleColor};pointer-events:none;border-radius:inherit;`;
        if (page.isTransparentSheet)
          staticBg.setAttribute("data-sheet", "true");

        const rawContent = page.html || page.content || "";
        const hasRealContent =
          rawContent &&
          !rawContent.includes("generateSkeletonPageSvg") &&
          !rawContent.includes("data-skeleton") &&
          !rawContent.includes("createDefaultPageData") &&
          rawContent.trim().length > 20;
        const initTexture = hasRealContent
          ? extractPageTexture(rawContent, pageNum) || page.imageUrl || ""
          : "";
        renderedContentMapRef.current.set(
          pageNum,
          `${pageNum}:${initTexture}:${rawContent.length}:${page.sheetData ? JSON.stringify(page.sheetData) : ""}`,
        );

        const shouldWarmUp = pageNum <= 4 || Math.abs(pageNum - initPage) <= 3;
        if (shouldWarmUp) {
          applyPageVisual(staticBg, rawContent || initTexture, pageNum);
        } else {
          staticBg.setAttribute("data-unloaded", "true");
          staticBg.setAttribute("data-loading", "true");
          staticBg.setAttribute("data-placeholder", "true");
        }
        staticBgElementsMapRef.current.set(pageNum, staticBg);
        {
          const initLeft = initPage % 2 === 0 ? initPage : initPage - 1;
          if (pageNum < initLeft - 2 || pageNum > initLeft + 3)
            staticBg.style.display = "none";
        }
        if (page.isTransparentSheet) {
          // Vellum / fibre-paper look for transparent sheets (texture defined in FlipBookStyles)
          const fiber = document.createElement("div");
          fiber.className = "fbe-sheet-fiber";
          applySheetStyle(fiber, page.sheetData);
          inner.appendChild(fiber);
        }
        inner.appendChild(staticBg);

        if (
          !page.isTransparentSheet &&
          textureStyle &&
          (textureStyle.backgroundImage !== "none" ||
            textureStyle.backgroundColor)
        ) {
          const textureOverlay = document.createElement("div");
          textureOverlay.className = "fbe-texture-overlay";
          Object.assign(textureOverlay.style, {
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            borderRadius: "inherit",
            ...textureStyle,
          });
          inner.appendChild(textureOverlay);
        }

        // Spine shadow: drawn by .fbe-inner::before/::after in FlipBookStyles (curls with the paper)
        pageDiv.appendChild(inner);
      } else {
        pageDiv.style.cssText =
          "opacity:0;pointer-events:none;background:transparent;";
      }

      pageFragment.appendChild(pageDiv);
    });
    bookEl.current.appendChild(pageFragment);

    const totalPages = augmented.length;
    $book.turn({
      width: singlePage ? width : width * 2,
      height,
      display: singlePage ? "single" : "double",
      duration: typeof flipTime === "number" && flipTime > 50 ? flipTime : 850,
      acceleration: true,
      gradients: true,
      cornerSize: useMouseEvents ? 100 : 0,
      elevation: 50,
      pages: totalPages,
      page: initPage,
      autoCenter: false,
      when: {
        start: (e, pageObject, corner) => {
          if (!useMouseEvents && corner) {
            e.preventDefault();
            return false;
          }
          if (corner) lastPeelRef.current = pageObject || null;
          if (corner) {
            // Warm the pages about to be revealed as soon as a corner drag begins
            if (pageObject?.next) ensureRevealedLoaded(pageObject.next);
            // Freeze live pages (slide/audio/video) and put them on the paper BEFORE the overlay hides
            liveControlRef.current?.freeze();
            isFlippingRef.current = true;
            setIsTurning(true);
            if (containerRef.current)
              containerRef.current.classList.add(
                "fbe-is-dragging",
                "fbe-is-turning",
                "fbe-is-flipping",
              );
            if (bookEl.current)
              bookEl.current.classList.add(
                "fbe-is-dragging",
                "fbe-is-turning",
                "fbe-is-flipping",
              );
          }

          if (!singlePage && augmented.length % 2 !== 0) {
            if (
              pageObject &&
              pageObject.page === augmented.length &&
              (corner === "r" || corner === "tr" || corner === "br")
            ) {
              e.preventDefault();
            }
          }
        },
        end: (e, pageObject, turned) => {
          // Turn.js also fires end(turned=false) as housekeeping at the start of a turn and just
          // before 'turned'. Treating that as "cancelled" dropped the turning classes mid-turn for
          // a frame (overlay/spine-shadow flash). Only a peel released WITHOUT turning cleans up here.
          if (!turned && turnInProgressRef.current) return;
          lastPeelRef.current = null;
          // Peel released without turning: ease the drag nudge back
          if (!turned) resetDragNudge(400);
          isFlippingRef.current = false;
          if (!turned) {
            setIsTurning(false);
            if (containerRef.current)
              containerRef.current.classList.remove(
                "fbe-is-dragging",
                "fbe-is-turning",
                "fbe-is-flipping",
              );
            if (bookEl.current)
              bookEl.current.classList.remove(
                "fbe-is-dragging",
                "fbe-is-turning",
                "fbe-is-flipping",
              );
          }
        },
        turning: (e, turnPage, view) => {
          if (
            !singlePage &&
            augmented.length % 2 !== 0 &&
            turnPage > augmented.length
          ) {
            e.preventDefault();
            return false;
          }
          liveControlRef.current?.freeze();
          turnInProgressRef.current = true;
          isFlippingRef.current = true;
          setIsTurning(true);
          if (containerRef.current)
            containerRef.current.classList.add(
              "fbe-is-turning",
              "fbe-is-flipping",
            );
          if (bookEl.current)
            bookEl.current.classList.add("fbe-is-turning", "fbe-is-flipping");

          ensureRevealedLoaded(turnPage);
          // Dark backing under the spine (CSS) — only while a two-page spread is (or is becoming) visible
          // Off as soon as a turn heads to a lone cover, or it shows beside the cover while the page lifts away
          if (bookEl.current && Array.isArray(view))
            bookEl.current.toggleAttribute(
              "data-spread",
              !singlePage && view[0] > 0 && view[1] > 0,
            );

          let logical = turnPage - 1;
          if (!singlePage && Array.isArray(view) && view.length >= 2) {
            if (view[0] > 0) logical = view[0] - 1;
            else if (view[1] > 0) logical = view[1] - 1;
          } else if (!singlePage && turnPage > 1) {
            logical = turnPage % 2 === 0 ? turnPage - 1 : turnPage - 2;
          }
          if (onTurningRef.current) onTurningRef.current({ data: logical });
          // Layout centring starts now (CSS: translate 0.85s, same easing). Ease the drag nudge out
          // with the IDENTICAL duration/curve so the two cancel out exactly — no wobble or re-centre.
          document.documentElement.style.setProperty("--fbe-nudge-dur", "850ms");
          resetDragNudge(850);
        },
        turned: (_e, turnPage, view) => {
          lastPeelRef.current = null;
          turnInProgressRef.current = false;
          isFlippingRef.current = false;
          const activeView =
            view ||
            (singlePage
              ? [turnPage]
              : turnPage % 2 === 0
                ? [turnPage, turnPage + 1]
                : [turnPage - 1, turnPage]);
          if (bookEl.current)
            bookEl.current.toggleAttribute(
              "data-spread",
              !singlePage && activeView[0] > 0 && activeView[1] > 0,
            );

          let logical = turnPage - 1;
          if (
            !singlePage &&
            Array.isArray(activeView) &&
            activeView.length >= 2
          ) {
            if (activeView[0] > 0) logical = activeView[0] - 1;
            else if (activeView[1] > 0) logical = activeView[1] - 1;
          } else if (!singlePage && turnPage > 1) {
            logical = turnPage % 2 === 0 ? turnPage - 1 : turnPage - 2;
          }

          prevStartPageRef.current = logical;
          scheduleIdlePreload(turnPage);

          setSpreadView((prev) => {
            if (
              prev &&
              prev[0] === activeView[0] &&
              prev[1] === activeView[1]
            ) {
              setIsTurning(false);
              if (containerRef.current)
                containerRef.current.classList.remove(
                  "fbe-is-dragging",
                  "fbe-is-turning",
                  "fbe-is-flipping",
                );
              if (bookEl.current)
                bookEl.current.classList.remove(
                  "fbe-is-dragging",
                  "fbe-is-turning",
                  "fbe-is-flipping",
                );
              return prev;
            }
            return activeView;
          });
          setCurrentPage(logical);
          // Notify the parent (editor-wide re-render) one frame after the turn lands,
          // so it doesn't compete with the overlay/static swap in the same frame
          afterNextFrame(() => {
            if (onFlipRef.current) onFlipRef.current({ data: logical });
          }, 50);

          if (queuedFlipRef.current) {
            const queued = queuedFlipRef.current;
            queuedFlipRef.current = null;
            setTimeout(() => {
              if (queued === "next") flipNextFn();
              else if (queued === "prev") flipPrevFn();
            }, 40);
          }
        },
      },
    });

    // When useMouseEvents is false, we prevent corner drag & peeling via cornerSize: 0 and start event cancellation
    // rather than calling $book.turn("disable", true), which would disable manual buttons and programmatic navigation.
    [initPage, initPage + 1, initPage + 2].forEach((p) => preloadPageToDom(p));
    markUnderSheetRef.current();

    if (typeof onBookReady === "function") {
      requestAnimationFrame(() => {
        setTimeout(() => {
          onBookReady();
        }, 80);
      });
    }

    // No automatic corner peel on load — the corner only peels when the user hovers it.

    return () => {
      try {
        $book
          .find("*")
          .addBack()
          .each(function () {
            const elData = $(this).data();
            if (elData && elData.effect) {
              if (elData.effect.handle) clearInterval(elData.effect.handle);
              if (elData.effect.raf) cancelAnimationFrame(elData.effect.raf);
              delete elData.effect;
            }
            try {
              $(this).turn("stop");
            } catch (_) {}
          });
        $book.turn("destroy");
      } catch (_) {
        /* noop */
      }
      $book.off();
      $book.removeData();
      $book.empty();
      staticBgElementsMapRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, scriptsLoaded, structureKey, useFullTurnJs]);

  // In-place content update effect for Turn.js pages (no teardown, zero freeze)
  useEffect(() => {
    if (!ready || !bookEl.current || !window.jQuery || !useFullTurnJs) return;
    const $book = window.jQuery(bookEl.current);
    const isTurnReady = checkTurnReady($book);
    if (!isTurnReady) return;

    augmentedPages.forEach((page, i) => {
      const pageNum = i + 1;
      const currentContent = page.html || page.content || "";
      const hasRealCurrentContent =
        currentContent &&
        !currentContent.includes("generateSkeletonPageSvg") &&
        !currentContent.includes("data-skeleton") &&
        !currentContent.includes("createDefaultPageData") &&
        currentContent.trim().length > 20;
      const textureUrl = hasRealCurrentContent
        ? extractPageTexture(currentContent, pageNum) || page.imageUrl || ""
        : "";
      const sheetKey = page.sheetData ? JSON.stringify(page.sheetData) : "";
      const contentSig = `${pageNum}:${textureUrl}:${currentContent.length}:${sheetKey}`;
      const prevSig = renderedContentMapRef.current.get(pageNum);

      if (prevSig === contentSig) return;

      let staticBg = staticBgElementsMapRef.current.get(pageNum);
      if (!staticBg) {
        const pageEl = bookEl.current.querySelector(`.p${pageNum}`);
        staticBg = pageEl?.querySelector(".fbe-static-bg");
        if (staticBg) staticBgElementsMapRef.current.set(pageNum, staticBg);
      }

      if (staticBg) {
        const isNearCurrent = Math.abs(pageNum - (currentPage + 1)) <= 3;
        const isPlaceholderDom =
          staticBg.getAttribute("data-placeholder") === "true" ||
          staticBg.getAttribute("data-loading") === "true";
        if (
          isNearCurrent ||
          staticBg.getAttribute("data-loaded") === "true" ||
          (isPlaceholderDom && hasRealCurrentContent)
        ) {
          renderedContentMapRef.current.set(pageNum, contentSig);
          applyPageVisual(staticBg, currentContent || textureUrl, pageNum);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [augmentedPages, ready, useFullTurnJs, applyPageVisual]);

  /* ── Handle Window / Container Resize & Display Mode dynamically ── */
  useEffect(() => {
    if (ready && bookEl.current && window.jQuery?.fn?.turn && useFullTurnJs) {
      try {
        const $book = window.jQuery(bookEl.current);
        const isTurnReady = checkTurnReady($book);
        if (!isTurnReady) return;
        const wantedDisplay = singlePage ? "single" : "double";
        if ($book.turn("display") !== wantedDisplay) {
          $book.turn("display", wantedDisplay);
        }
        $book.turn("size", singlePage ? width : width * 2, height);
      } catch (e) {
        /* ignore */
      }
    }
  }, [width, height, singlePage, ready, useFullTurnJs]);

  // Gradual centring while a cover corner is dragged (like FlipHTML5): the book slides toward
  // its centred position in proportion to how far the page has been pulled. Applied as an extra
  // `translate` on the engine wrapper; when the turn is released the layout's own centring
  // takes over while this nudge eases back to 0 (same duration/easing), so the motion stays continuous.
  const CENTER_EASE = "cubic-bezier(0.45, 0, 0.2, 1)";
  const dragNudgeRef = useRef(null); // { pressX, deltaLocal, span }
  const resetDragNudge = useCallback((ms) => {
    const box = containerRef.current;
    dragNudgeRef.current = null;
    // Nav arrows (layouts read these CSS vars) ease back in step with the book
    const root = document.documentElement;
    if (root.style.getPropertyValue("--fbe-arrow-nudge")) {
      root.style.setProperty("--fbe-nudge-dur", `${ms || 0}ms`);
      root.style.removeProperty("--fbe-arrow-nudge");
    }
    if (!box || !box.style.translate) return;
    box.style.transition = ms ? `translate ${ms}ms ${CENTER_EASE}` : "none";
    box.style.translate = "";
  }, []);

  useEffect(() => {
    const el = bookEl.current;
    const box = containerRef.current;
    if (!el || !box || singlePage) return undefined;

    // Half-page centring units: front cover alone = -1, back cover alone = +1, open spread = 0
    const centerUnits = (logical, total) => {
      if (logical <= 0) return -1;
      if (logical >= total - 1 && total % 2 === 0) return 1;
      return 0;
    };
    const pointX = (ev) => (ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX);

    const onMove = (ev) => {
      const d = dragNudgeRef.current;
      if (!d) return;
      const progress = Math.min(1, Math.abs(pointX(ev) - d.pressX) / d.span);
      box.style.transition = "none";
      box.style.translate = `${d.deltaLocal * progress}px 0`;
      // Arrows: move outward when the book opens up to a spread, inward when it closes to a cover
      const root = document.documentElement;
      root.style.setProperty("--fbe-nudge-dur", "0s");
      root.style.setProperty("--fbe-arrow-nudge", `${d.arrowSpread * progress}px`);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("touchmove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
      window.removeEventListener("touchend", onUp, true);
    };

    const onPress = (ev) => {
      const po = lastPeelRef.current;
      if (!po || !po.next) return;
      let currentLogical = 0;
      try {
        const v = window.jQuery(el).turn("view") || [];
        currentLogical = v[0] > 0 ? v[0] - 1 : (v.find((p) => p > 0) || 1) - 1;
      } catch (_) { return; }
      const total = augmentedPages.length;
      const n = po.next;
      const targetLogical = n <= 1 ? 0 : n % 2 === 0 ? n - 1 : n - 2;
      const units = centerUnits(targetLogical, total) - centerUnits(currentLogical, total);
      if (!units) return;
      const rect = el.getBoundingClientRect();
      const scale = el.offsetWidth ? rect.width / el.offsetWidth : 1;
      const halfPageScreen = rect.width / 4; // book shows two pages
      // Slide toward the centred spread (front cover → book moves right; verified in a real browser drag)
      const curAbs = Math.abs(centerUnits(currentLogical, total));
      const tgtAbs = Math.abs(centerUnits(targetLogical, total));
      dragNudgeRef.current = {
        arrowSpread: (curAbs - tgtAbs) * halfPageScreen,
        pressX: pointX(ev),
        deltaLocal: (units * halfPageScreen) / (scale || 1),
        span: Math.max(1, rect.width * 0.85),
      };
      window.addEventListener("mousemove", onMove, true);
      window.addEventListener("touchmove", onMove, { capture: true, passive: true });
      window.addEventListener("mouseup", onUp, true);
      window.addEventListener("touchend", onUp, true);
    };

    el.addEventListener("mousedown", onPress, true);
    el.addEventListener("touchstart", onPress, { capture: true, passive: true });
    return () => {
      onUp();
      el.removeEventListener("mousedown", onPress, true);
      el.removeEventListener("touchstart", onPress, true);
    };
  }, [singlePage, ready, augmentedPages.length]);

  // If a requested turn did not start (end of book, blocked), undo the freeze + turning state
  const settleIfNoTurn = useCallback(($book) => {
    let animating = false;
    try {
      animating = $book.turn("animating");
    } catch (_) {}
    if (animating || turnInProgressRef.current) return;
    liveControlRef.current?.release();
    isFlippingRef.current = false;
    setIsTurning(false);
    if (containerRef.current)
      containerRef.current.classList.remove(
        "fbe-is-dragging",
        "fbe-is-turning",
        "fbe-is-flipping",
      );
    if (bookEl.current)
      bookEl.current.classList.remove(
        "fbe-is-dragging",
        "fbe-is-turning",
        "fbe-is-flipping",
      );
  }, []);

  const flipNextFn = useCallback(() => {
    if (document.activeElement) document.activeElement.blur();

    if (
      !singlePage &&
      pages.length % 2 !== 0 &&
      currentPage >= pages.length - 2
    ) {
      return;
    }

    if (showingTurnJs && bookEl.current && window.jQuery) {
      const $book = window.jQuery(bookEl.current);
      const isTurnReady = checkTurnReady($book);
      if (isTurnReady) {
        // Fast flipping (same as the Home TurnBook): start the next turn right away even while
        // one is still animating — Turn.js runs overlapping turns smoothly — instead of queuing
        // it until the current turn ends (which made rapid clicks feel slow / get dropped).
        queuedFlipRef.current = null;
        isProgrammaticRef.current = true;
        liveControlRef.current?.freeze();
        setIsTurning(true);
        $book.turn("next");
        settleIfNoTurn($book);
      }
    } else if (showingReactFlip && reactFlipRef.current) {
      setIsTurning(true);
      reactFlipRef.current.pageFlip().flipNext();
    }
    setTimeout(() => (isProgrammaticRef.current = false), 50);
  }, [
    showingTurnJs,
    showingReactFlip,
    pages.length,
    singlePage,
    currentPage,
    settleIfNoTurn,
  ]);

  const flipPrevFn = useCallback(() => {
    if (document.activeElement) document.activeElement.blur();

    if (showingTurnJs && bookEl.current && window.jQuery) {
      const $book = window.jQuery(bookEl.current);
      const isTurnReady = checkTurnReady($book);
      if (isTurnReady) {
        // Fast flipping (same as the Home TurnBook): start the next turn right away even while
        // one is still animating — Turn.js runs overlapping turns smoothly — instead of queuing
        // it until the current turn ends (which made rapid clicks feel slow / get dropped).
        queuedFlipRef.current = null;
        isProgrammaticRef.current = true;
        liveControlRef.current?.freeze();
        setIsTurning(true);
        $book.turn("previous");
        settleIfNoTurn($book);
      }
    } else if (showingReactFlip && reactFlipRef.current) {
      setIsTurning(true);
      reactFlipRef.current.pageFlip().flipPrev();
    }
    setTimeout(() => (isProgrammaticRef.current = false), 50);
  }, [showingTurnJs, showingReactFlip, settleIfNoTurn]);

  const flipToPageFn = useCallback(
    (idx) => {
      isProgrammaticRef.current = true;
      const wantedPage = idx + 1;
      if (showingTurnJs && bookEl.current && window.jQuery) {
        const $book = window.jQuery(bookEl.current);
        const isTurnReady = checkTurnReady($book);
        if (isTurnReady) {
          if ($book.turn("animating")) {
            try {
              $book.find(".turn-page").each(function () {
                try {
                  window.jQuery(this).flip("hide");
                } catch (_) {}
              });
              $book.turn("stop");
            } catch (_) {}
          }
          liveControlRef.current?.freeze();
          setIsTurning(true);
          $book.turn("page", wantedPage);
        }
      } else if (reactFlipRef.current) {
        setIsTurning(true);
        reactFlipRef.current.pageFlip().turnToPage(idx);
      }
      setTimeout(() => (isProgrammaticRef.current = false), 50);
    },
    [showingTurnJs],
  );

  useImperativeHandle(
    ref,
    () => ({
      flipNext: flipNextFn,
      flipPrev: flipPrevFn,
      flipToPage: flipToPageFn,
      getCurrentPageIndex: () => currentPage,
      isAnimating: () =>
        isFlippingRef.current ||
        (bookEl.current &&
          window.jQuery &&
          window.jQuery(bookEl.current).turn("animating")),
      pageFlip: () => ({
        flipNext: flipNextFn,
        flipPrev: flipPrevFn,
        turnToPage: flipToPageFn,
        getCurrentPageIndex: () => currentPage + 1,
        isAnimating: () =>
          isFlippingRef.current ||
          (bookEl.current &&
            window.jQuery &&
            window.jQuery(bookEl.current).turn("animating")),
      }),
    }),
    [flipNextFn, flipPrevFn, flipToPageFn, currentPage],
  );

  /* ── Sync turn.js when target/start page changes externally (thumbnails, direct jump) ── */
  const prevStartPageRef = useRef(startPage);
  useEffect(() => {
    if (!showingTurnJs || !bookEl.current || !window.jQuery) return;
    if (prevStartPageRef.current === startPage) return;
    prevStartPageRef.current = startPage;

    const $book = window.jQuery(bookEl.current);
    const isTurnReady = checkTurnReady($book);
    if (!isTurnReady) return;

    const totalP = augmentedPages.length || pages.length;
    if (totalP === 0) return;
    const wantedPage = Math.max(1, Math.min(totalP, startPage + 1));

    const currentView = $book.turn("view");
    if (Array.isArray(currentView) && currentView.includes(wantedPage)) {
      setCurrentPage(startPage);
      return;
    }

    const currentTurnPage = $book.turn("page");
    if (currentTurnPage === wantedPage) {
      setCurrentPage(startPage);
      return;
    }

    if ($book.turn("animating")) {
      try {
        $book.find(".turn-page").each(function () {
          try {
            window.jQuery(this).flip("hide");
          } catch (_) {}
        });
        $book.turn("stop");
      } catch (_) {}
    }

    setIsTurning(true);
    $book.turn("page", wantedPage);
    setCurrentPage(startPage);
  }, [startPage, showingTurnJs, augmentedPages.length, pages.length]);

  /* ── Sync turn.js size when width/height change dynamically ── */
  useEffect(() => {
    if (!showingTurnJs || !bookEl.current || !window.jQuery) return;
    const $book = window.jQuery(bookEl.current);
    const isTurnReady = checkTurnReady($book);
    if (isTurnReady) {
      $book.turn("size", singlePage ? width : width * 2, height);
    }
  }, [width, height, singlePage, showingTurnJs]);

  /* ── Sync react-pageflip size when width/height change dynamically ── */
  useEffect(() => {
    if (!showingReactFlip || !reactFlipRef.current) return;
    const pageFlip = reactFlipRef.current.pageFlip();
    if (pageFlip && typeof pageFlip.update === "function") {
      pageFlip.update();
    }
  }, [width, height, showingReactFlip]);

  /* ── Sync react-pageflip when startPage changes externally ── */
  const prevReactStartPageRef = useRef(startPage);
  useEffect(() => {
    if (!showingReactFlip || !reactFlipRef.current) return;
    if (prevReactStartPageRef.current === startPage) return;
    prevReactStartPageRef.current = startPage;
    const pageFlip = reactFlipRef.current.pageFlip();
    if (!pageFlip) return;
    const cur = pageFlip.getCurrentPageIndex();
    if (cur !== startPage && !isFlippingRef.current) {
      try {
        pageFlip.turnToPage(startPage);
        setCurrentPage(startPage);
      } catch (_) {}
    }
  }, [startPage, showingReactFlip]);

  /* ── Autoplay ── */
  useEffect(() => {
    if (!autoplay || !ready) return;
    const timer = setInterval(flipNextFn, autoplayDuration);
    return () => clearInterval(timer);
  }, [autoplay, autoplayDuration, ready, flipNextFn]);

  useEffect(() => {
    if (v_id) {
      clearRasterCache(v_id);
    }
  }, [v_id]);

  const bookTransition = `transform ${typeof flipTime === "number" && flipTime >= 200 ? Math.min(1000, flipTime) : 850}ms ease`;

  const handleContainerMouseLeave = () => {
    if (!bookEl.current || isFlippingRef.current) return;
    if (
      bookEl.current.classList.contains("fbe-is-dragging") ||
      bookEl.current.classList.contains("fbe-is-turning") ||
      bookEl.current.classList.contains("fbe-is-flipping")
    )
      return;

    if (window.jQuery && bookEl.current) {
      const $ = window.jQuery;
      const $book = $(bookEl.current);
      if ($book.turn("animating")) return;

      $book.find(".turn-page").each(function () {
        const pageData = $(this).data("f");
        if (pageData && !$(this).flip("isTurning")) {
          try {
            $(this).flip("hideFoldedPage", true);
          } catch (err) {}
        }
      });
    }
  };

  /* ── Render ── */
  return (
    <div
      ref={containerRef}
      className={`fbe-wrapper ${className} ${isTurning ? "fbe-is-turning fbe-is-flipping" : ""}`}
      data-single-page={singlePage}
      data-mobile-shadow={mobileShadowSide}
      onMouseLeave={handleContainerMouseLeave}
      style={{
        width: singlePage ? width : width * 2,
        height,
        position: "relative",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
        opacity: pageOpacity ?? 1,
      }}
    >
      <FlipBookStyles cornerRadius={cornerRadius} />


      {/* Loading indicator */}
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            zIndex: 10,
          }}
        >
          <div
            className="fbe-spinner"
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(224, 71, 82, 0.2)",
              borderTopColor: "#E04752",
              borderRadius: "50%",
              animation: "fbe-spin 0.7s linear infinite",
            }}
          />
        </div>
      )}

      {/* ── CLONE UNDERLAY for Transparent Sheets ── */}
      <CloneUnderlay
        showingTurnJs={showingTurnJs}
        showingReactFlip={showingReactFlip}
        singlePage={singlePage}
        width={width}
        height={height}
        hardCoverZoom={hardCoverZoom}
        cloneUnderlay={cloneUnderlay}
        buildPageDoc={buildPageDoc}
        externalBuildPageDoc={externalBuildPageDoc}
      />
      {/* ── TURN.JS ENGINE — centering wrapper ── */}
      {showingTurnJs && (
        <div
          style={{
            width: singlePage ? width : width * 2,
            height,
            position: "relative",
            transition: bookTransition,
            zIndex: 5,
          }}
          onPointerDownCapture={(e) => {
            if (
              !singlePage &&
              pages.length % 2 !== 0 &&
              currentPage >= pages.length - 2
            ) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              if (clickX > rect.width / 2) {
                e.stopPropagation();
              }
            }
          }}
        >
          {/* Book drop shadow: a static box-shadow behind each half that actually has a page in the
              current spread (never on an empty half). Static, so it is not re-drawn during turns —
              a drop-shadow filter on this container cost ~30fps on the first turn. */}
          {bookShadow && bookShadow !== "none" &&
            (singlePage
              ? [["single", 0, rightIdx]]
              : [["left", 0, leftIdx], ["right", width, rightIdx]]
            ).map(([side, left, idx]) => {
              const hasPage = idx !== null && idx !== undefined && idx >= 0 && idx < pages.length && !pages[idx]?.isPad;
              return (
                <div
                  key={`fbe-book-shadow-${side}`}
                  aria-hidden="true"
                  className="fbe-book-shadow"
                  style={{
                    position: "absolute",
                    top: 0,
                    left,
                    width,
                    height,
                    boxShadow: bookShadow,
                    borderRadius:
                      side === "single" ? cornerRadius
                        : side === "left" ? `${cornerRadius} 0 0 ${cornerRadius}`
                        : `0 ${cornerRadius} ${cornerRadius} 0`,
                    opacity: hasPage ? 1 : 0,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              );
            })}
          <div
            ref={bookEl}
            className="fbe-book"
            style={{
              width: singlePage ? width : width * 2,
              height,
              position: "relative",
              background: "transparent",
              margin: 0,
              // While peeling/turning, the shadow becomes a drop-shadow of the real (curling) pages — see
              // FlipBookStyles. Layer is prepared up-front so the first turn doesn't pay for creating it.
              "--fbe-book-shadow-filter": turnShadowFilter,
              willChange: turnShadowFilter !== "none" ? "filter" : undefined,
            }}
          />
        </div>
      )}

      {/* ── REACT-PAGEFLIP CANVAS ENGINE (Fallback Engine) ── */}
      {showingReactFlip && (
        <div
          style={
            hardCoverZoom
              ? {
                  transform: `scale(${hardCoverZoom.scale})`,
                  transformOrigin: "0 0",
                }
              : {}
          }
          className="fbe-react-wrapper"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              background: "transparent",
              transition: bookTransition,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HTMLFlipBook
              key={`react-flip-${v_id || "preview"}-${augmentedPages.length}`}
              ref={reactFlipRef}
              renderOnlyPageLengthChange={true}
              width={width}
              height={height}
              size={"stretch"}
              minWidth={100}
              maxWidth={4000}
              minHeight={100}
              maxHeight={4000}
              drawShadow={flipStyle !== "Fast Flip"}
              useMouseEvents={useMouseEvents}
              flippingTime={
                typeof flipTime === "number" && flipTime >= 200
                  ? Math.min(1200, flipTime)
                  : 850
              }
              startPage={Number(activeLayout) === 1 ? currentPage : startPage}
              showCover={true}
              usePortrait={singlePage}
              autoCenter={false}
              clickEventForward={false}
              onChangeState={(e) => {
                const isBusy = e.data !== "read";
                setIsFlipping(isBusy);
                isFlippingRef.current = isBusy;
                const wrapper =
                  containerRef.current ||
                  document.querySelector(".fbe-react-wrapper");
                if (wrapper) {
                  if (isBusy)
                    wrapper.classList.add("fbe-is-turning", "fbe-is-flipping");
                  else
                    wrapper.classList.remove(
                      "fbe-is-turning",
                      "fbe-is-flipping",
                    );
                }
              }}
              style={{
                background: "transparent",
                width: "100%",
                height: "100%",
              }}
              onFlip={(e) => {
                const logical = e.data;
                setCurrentPage(logical);
                setIsFlipping(false);
                isFlippingRef.current = false;
                if (onFlipRef.current) onFlipRef.current({ data: logical });

                const wrapper =
                  containerRef.current ||
                  document.querySelector(".fbe-react-wrapper");
                if (wrapper)
                  wrapper.classList.remove(
                    "fbe-is-dragging",
                    "fbe-is-turning",
                    "fbe-is-flipping",
                  );
                document
                  .querySelectorAll(
                    ".fbe-is-dragging, .fbe-is-turning, .fbe-is-flipping",
                  )
                  .forEach((el) => {
                    el.classList.remove(
                      "fbe-is-dragging",
                      "fbe-is-turning",
                      "fbe-is-flipping",
                    );
                  });

                refocusActiveIframe(logical);
              }}
            >
              {memoizedReactPages}
            </HTMLFlipBook>
          </div>
        </div>
      )}

      {/* ── Active Spread Interactive Overlay ── */}
      <ActiveSpreadOverlay
        ready={ready}
        isTurning={isTurning}
        singlePage={singlePage}
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        pages={pages}
        leftIdx={leftIdx}
        rightIdx={rightIdx}
        buildPageDocRef={buildPageDocRef}
        flipNextFn={flipNextFn}
        flipPrevFn={flipPrevFn}
        bookEl={bookEl}
        liveControlRef={liveControlRef}
      />

      {/* Corner Hotspots for non-TurnJS engines */}
      <CornerHotspots
        ready={ready}
        singlePage={singlePage}
        showingTurnJs={showingTurnJs}
        rightIdx={rightIdx}
        leftIdx={leftIdx}
        pagesCount={pages.length}
        flipNextFn={flipNextFn}
        flipPrevFn={flipPrevFn}
      />
    </div>
  );
});

const MemoizedFlipBookEngine = React.memo(FlipBookEngine);

export default MemoizedFlipBookEngine;
