import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { jsPDF } from "jspdf";
import JSZip from "jszip";

export default function CameraBottomTray({
  snapshots = [],
  onDeleteSnapshot,
  onRenameSnapshot,
  onExportSnapshots,
  onCaptureSnapshot,
  isCapturing = false,
  modelName = "Model",
  onExportingChange,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [quality, setQuality] = useState("Medium");
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [fileType, setFileType] = useState("PNG");
  const [isFileTypeOpen, setIsFileTypeOpen] = useState(false);
  const [exportWithLabel, setExportWithLabel] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const qualityDropdownRef = useRef(null);
  const fileTypeDropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lastSelectedIdRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null); // { x, y, snap }
  const contextMenuRef = useRef(null);

  // Auto-select latest snapshot or all by default if newly captured
  useEffect(() => {
    if (snapshots.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(snapshots.map((s) => s.id)));
    }
  }, [snapshots]);

  // Click outside listener for dropdowns & context menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        qualityDropdownRef.current &&
        !qualityDropdownRef.current.contains(e.target)
      ) {
        setIsQualityOpen(false);
      }
      if (
        fileTypeDropdownRef.current &&
        !fileTypeDropdownRef.current.contains(e.target)
      ) {
        setIsFileTypeOpen(false);
      }
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", () => setContextMenu(null), true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", () => setContextMenu(null), true);
    };
  }, []);

  const handleToggleSelect = (id, e, index) => {
    e.stopPropagation();
    const isShift = Boolean(e.shiftKey);

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (isShift && lastSelectedIdRef.current) {
        // Find range from last selected card to clicked card
        const lastIndex = snapshots.findIndex((s) => s.id === lastSelectedIdRef.current);
        const currentIndex = index !== undefined ? index : snapshots.findIndex((s) => s.id === id);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          const rangeItems = snapshots.slice(start, end + 1);

          // Standard multi-select behavior:
          // If the clicked card is already selected, unselect range; otherwise select range.
          const shouldSelect = !prev.has(id);
          rangeItems.forEach((snap) => {
            if (shouldSelect) {
              next.add(snap.id);
            } else {
              next.delete(snap.id);
            }
          });

          lastSelectedIdRef.current = id;
          return next;
        }
      }

      // Normal toggle single selection
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      lastSelectedIdRef.current = id;
      return next;
    });
  };

  const handleStartRename = (snap, e) => {
    e.stopPropagation();
    setEditingId(snap.id);
    setEditingTitle(snap.title || "Top Angle");
  };

  const handleSaveRename = (id) => {
    if (editingTitle.trim()) {
      onRenameSnapshot?.(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const isAllSelected = snapshots.length > 0 && selectedIds.size === snapshots.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < snapshots.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      lastSelectedIdRef.current = null;
    } else {
      setSelectedIds(new Set(snapshots.map((s) => s.id)));
      lastSelectedIdRef.current = snapshots[snapshots.length - 1]?.id || null;
    }
  };

  // Delete all selected snapshots
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => {
      onDeleteSnapshot?.(id);
    });
    setSelectedIds(new Set());
    lastSelectedIdRef.current = null;
    setContextMenu(null);
  };

  // Single card download (e.g. from right-click context menu)
  const handleDownloadSingle = async (snap) => {
    setContextMenu(null);
    if (!snap || isExporting) return;
    setIsExporting(true);
    onExportingChange?.(true, "Preparing snapshot download...");
    try {
      const rendered = await renderSnapshotWithTitle(snap, fileType.toLowerCase(), quality);
      const cleanName = (modelName || "model").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
      const titleSlug = (snap.title || "angle").replace(/\s+/g, "_");
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const dateTimeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const ext = fileType.toLowerCase() === "jpeg" ? "jpg" : fileType.toLowerCase();

      const link = document.createElement("a");
      link.href = rendered.dataUrl;
      link.download = `${cleanName}_${titleSlug}_${dateTimeStr}.${ext}`;
      link.click();
    } catch (err) {
      console.error("Failed to download snapshot:", err);
    } finally {
      setIsExporting(false);
      onExportingChange?.(false);
    }
  };

  // Handle right-click on snapshot card
  const handleCardContextMenu = (e, snap) => {
    e.preventDefault();
    e.stopPropagation();
    // Position menu clamped to viewport
    const menuWidth = 140;
    const menuHeight = 90;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY - menuHeight, window.innerHeight - menuHeight - 10);
    setContextMenu({ x, y: Math.max(10, y), snap });
  };

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollability, { passive: true });
      window.addEventListener("resize", checkScrollability);
      return () => {
        el.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [snapshots]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  // Helper to load image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Helper to render image with the card title badge burned onto the export
  const renderSnapshotWithTitle = async (snap, format = "png", exportQuality = quality) => {
    const img = await loadImage(snap.dataUrl);
    let origW = img.naturalWidth || 1920;
    let origH = img.naturalHeight || 1080;

    // Quality target pixel bounds
    const qualityScaleMap = {
      Low: 1920,
      Medium: 2560,
      High: 3840,
      Ultra: 4096,
    };
    const targetDim = qualityScaleMap[exportQuality] || 3840;
    const currentMax = Math.max(origW, origH);
    
    // Scale up if user chooses higher quality than initial preview
    let w = origW;
    let h = origH;
    if (targetDim > currentMax) {
      const scale = targetDim / currentMax;
      w = Math.round(origW * scale);
      h = Math.round(origH * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Enable high quality bicubic interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (format === "jpg" || format === "jpeg") {
      ctx.fillStyle = snap.solidColor || "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.drawImage(img, 0, 0, w, h);

    const titleText = (snap.title || "").trim();
    if (exportWithLabel && titleText) {
      ctx.save();
      const fontSize = Math.max(16, Math.round(h * 0.022));
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const paddingX = Math.round(fontSize * 0.75);
      const paddingY = Math.round(fontSize * 0.38);
      const textMetrics = ctx.measureText(titleText);
      const textWidth = textMetrics.width;
      const badgeWidth = textWidth + paddingX * 2;
      const badgeHeight = fontSize + paddingY * 2;
      const margin = Math.round(h * 0.025);
      const badgeX = margin;
      const badgeY = h - margin - badgeHeight;
      const radius = Math.round(badgeHeight * 0.3);

      // Sleek rounded badge with subtle shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(23, 32, 44, 0.82)";

      ctx.beginPath();
      ctx.moveTo(badgeX + radius, badgeY);
      ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
      ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight);
      ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
      ctx.lineTo(badgeX, badgeY + radius);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
      ctx.closePath();
      ctx.fill();

      // Card title text in white
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";
      ctx.fillText(titleText, badgeX + paddingX, badgeY + badgeHeight / 2 + 1);
      ctx.restore();
    }

    const mime = format === "jpg" || format === "jpeg" ? "image/jpeg" : "image/png";
    // 0.98 ensures visually lossless output for JPG, avoiding compression artifacts
    const dataUrl = canvas.toDataURL(mime, format === "jpg" || format === "jpeg" ? 0.98 : 1.0);
    return { dataUrl, width: w, height: h };
  };

  // Internal export handler
  const handleExportClick = async () => {
    const toExport = snapshots.filter((s) => selectedIds.has(s.id));
    if (toExport.length === 0 || isExporting) return;

    if (onExportSnapshots) {
      onExportSnapshots({ selectedSnapshots: toExport, quality, fileType });
      return;
    }

    setIsExporting(true);
    onExportingChange?.(true, toExport.length > 1 ? `Exporting ${toExport.length} snapshots...` : "Preparing snapshot download...");
    const cleanName = (modelName || "model")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const fmt = fileType.toLowerCase();

    // Format DATE_TIME as YYYYMMDD_HHmmss (e.g. 20261112_180630)
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateTimeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    try {
      if (toExport.length === 1) {
        const snap = toExport[0];
        const filename = `${cleanName}_${(snap.title || "angle").replace(/\s+/g, "_")}_${dateTimeStr}`;
        const rendered = await renderSnapshotWithTitle(snap, fmt, quality);

        if (fmt === "pdf") {
          const orientation = rendered.width >= rendered.height ? "l" : "p";
          const pdf = new jsPDF({
            orientation,
            unit: "px",
            format: [rendered.width, rendered.height],
            compress: true
          });
          pdf.addImage(rendered.dataUrl, "PNG", 0, 0, rendered.width, rendered.height, undefined, "FAST");
          pdf.save(`${filename}.pdf`);
        } else if (fmt === "jpg" || fmt === "jpeg") {
          const link = document.createElement("a");
          link.href = rendered.dataUrl;
          link.download = `${filename}.jpg`;
          link.click();
        } else {
          // PNG
          const link = document.createElement("a");
          link.href = rendered.dataUrl;
          link.download = `${filename}.png`;
          link.click();
        }
      } else {
        // Multi-image export
        if (fmt === "pdf") {
          let pdf = null;
          for (let i = 0; i < toExport.length; i++) {
            const snap = toExport[i];
            const rendered = await renderSnapshotWithTitle(snap, "png", quality);
            const orientation = rendered.width >= rendered.height ? "l" : "p";
            if (i === 0) {
              pdf = new jsPDF({
                orientation,
                unit: "px",
                format: [rendered.width, rendered.height],
                compress: true
              });
              pdf.addImage(rendered.dataUrl, "PNG", 0, 0, rendered.width, rendered.height, undefined, "FAST");
            } else {
              pdf.addPage([rendered.width, rendered.height], orientation);
              pdf.addImage(rendered.dataUrl, "PNG", 0, 0, rendered.width, rendered.height, undefined, "FAST");
            }
          }
          if (pdf) {
            pdf.save(`${cleanName}_${fmt.toUpperCase()}_${dateTimeStr}.pdf`);
          }
        } else {
          // Zip
          const zip = new JSZip();
          const folder = zip.folder(`${cleanName}_saved_angles`);
          for (let i = 0; i < toExport.length; i++) {
            const snap = toExport[i];
            const titleSlug = (snap.title || `angle_${i + 1}`).replace(/\s+/g, "_");
            const rendered = await renderSnapshotWithTitle(snap, fmt, quality);
            const isJpg = fmt === "jpg" || fmt === "jpeg";
            const base64Data = rendered.dataUrl.replace(isJpg ? /^data:image\/jpeg;base64,/ : /^data:image\/png;base64,/, "");
            folder.file(`${titleSlug}_${i + 1}.${isJpg ? "jpg" : "png"}`, base64Data, { base64: true });
          }
          const content = await zip.generateAsync({ type: "blob" });
          const zipUrl = URL.createObjectURL(content);
          const link = document.createElement("a");
          link.href = zipUrl;
          // Format: {MODEL_NAME}_{FORMAT}_{DATE_TIME}.zip
          link.download = `${cleanName}_${fmt.toUpperCase()}_${dateTimeStr}.zip`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(zipUrl), 10000);
        }
      }
    } catch (err) {
      console.error("Failed to export angle snapshots:", err);
    } finally {
      setIsExporting(false);
      onExportingChange?.(false);
    }
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] flex flex-col font-sans select-none transition-all duration-300 ease-in-out ${
        isMinimized ? "py-[0.45vw] px-[1.2vw]" : "px-[1.4vw] py-[0.75vw] gap-[0.7vw]"
      }`}
    >
      {/* ── FLOATING "SAVE CURRENT ANGLE" BUTTON DIRECTLY ABOVE THE TRAY ── */}
      {onCaptureSnapshot && (
        <div className="absolute bottom-full right-[1.2vw] mb-[0.75vw] z-40 pointer-events-auto">
          <button
            type="button"
            disabled={isCapturing}
            onClick={() => onCaptureSnapshot && onCaptureSnapshot({ quality })}
            className="flex items-center gap-[0.55vw] px-[1.1vw] py-[0.55vw] bg-[#17202C] hover:bg-[#253243] text-white rounded-[0.5vw] shadow-xl border border-[#17202C] text-[0.8vw] font-bold transition-all cursor-pointer active:scale-95 group shrink-0"
            title="Save current camera viewport angle"
          >
            <Icon
              icon={isCapturing ? "line-md:loading-loop" : "hugeicons:tick-02"}
              className="w-[1.15vw] h-[1.15vw] text-white group-hover:scale-110 transition-transform"
            />
            <span>{isCapturing ? "Saving Angle..." : "Save Current Angle"}</span>
          </button>
        </div>
      )}
      {/* ── TOP HEADER / CONTROLS ROW ── */}
      <div className="flex items-center justify-between gap-[1vw]">
        {/* Left: Title & Count & Select All */}
        <div className="flex items-center gap-[0.8vw]">
          {/* Minimize / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="flex items-center gap-[0.35vw] px-[0.55vw] py-[0.25vw] rounded-[0.4vw] bg-gray-100/90 hover:bg-orange-50 hover:text-[#EC5137] text-gray-700 transition-all cursor-pointer shadow-2xs group"
            title={isMinimized ? "Expand Saved Angles Tray" : "Minimize Tray"}
          >
            <Icon
              icon="heroicons:chevron-up-20-solid"
              className={`w-[0.9vw] h-[0.9vw] text-gray-500 group-hover:text-[#EC5137] transition-transform duration-200 ${
                isMinimized ? "rotate-0" : "rotate-180"
              }`}
            />
            <span className="text-[0.72vw] font-medium">
              {isMinimized ? "Expand" : "Minimize"}
            </span>
          </button>

          <div className="flex items-center gap-[0.45vw]">
            <h3 className="text-[0.84vw] font-semibold text-gray-900 tracking-normal whitespace-nowrap">
              Saved Angles Preview
            </h3>
            <span className="inline-flex items-center text-[0.66vw] font-medium px-[0.45vw] py-[0.12vw] rounded-full bg-orange-50 text-[#EC5137] border border-orange-200/60 leading-none whitespace-nowrap">
              {snapshots.length} {snapshots.length === 1 ? "Angle" : "Angles"}
            </span>
          </div>

          {!isMinimized && snapshots.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-[0.35vw] px-[0.6vw] py-[0.25vw] rounded-[0.4vw] bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer group"
              title={isAllSelected ? "Unselect all angles" : "Select all angles"}
            >
              {isAllSelected ? (
                <Icon
                  icon="ant-design:check-circle-filled"
                  className="w-[0.85vw] h-[0.85vw] text-[#EC5137] shrink-0"
                />
              ) : isPartiallySelected ? (
                <Icon
                  icon="ant-design:minus-circle-filled"
                  className="w-[0.85vw] h-[0.85vw] text-[#EC5137] shrink-0"
                />
              ) : (
                <div className="w-[0.8vw] h-[0.8vw] rounded-full border-[1.5px] border-gray-300 bg-white group-hover:border-gray-400 shrink-0" />
              )}
              <span className="text-[0.7vw] font-medium whitespace-nowrap">
                {isAllSelected ? "Unselect All" : "Select All"}
              </span>
              <span className="text-[0.64vw] text-gray-400 font-normal whitespace-nowrap">
                ({selectedIds.size}/{snapshots.length})
              </span>
            </button>
          )}

          {/* Delete Selected Button (Only trash icon) */}
          {!isMinimized && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center justify-center p-[0.32vw] rounded-[0.4vw] bg-white border border-red-200 hover:border-red-400 text-red-600 hover:bg-red-50 transition-all shadow-2xs cursor-pointer group"
              title={`Delete ${selectedIds.size} selected ${selectedIds.size === 1 ? 'angle' : 'angles'}`}
            >
              <Icon
                icon="heroicons:trash-20-solid"
                className="w-[0.9vw] h-[0.9vw] text-red-500 group-hover:scale-110 transition-transform shrink-0"
              />
            </button>
          )}
        </div>

        {/* Right: Controls (Quality, Type, Export With Label, Export) */}
        <div className="flex items-center gap-[0.75vw]">
          {/* Export with Label toggle */}
          <div className="flex items-center gap-[0.35vw]">
            <span className="text-[0.72vw] font-medium text-gray-600 whitespace-nowrap">
              Export with label
            </span>
            <button
              type="button"
              onClick={() => setExportWithLabel((prev) => !prev)}
              role="switch"
              aria-checked={exportWithLabel}
              className={`relative inline-flex h-[1.1vw] w-[2vw] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                exportWithLabel ? "bg-[#EC5137]" : "bg-gray-200"
              }`}
              title={exportWithLabel ? "Label will appear on exported image" : "Label will not appear on exported image"}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[0.88vw] w-[0.88vw] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  exportWithLabel ? "translate-x-[0.9vw]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Quality dropdown */}
          <div className="flex items-center gap-[0.35vw] relative" ref={qualityDropdownRef}>
            <span className="text-[0.72vw] font-medium text-gray-600 whitespace-nowrap">Quality</span>
            <button
              type="button"
              onClick={() => setIsQualityOpen((prev) => !prev)}
              className="flex items-center justify-between gap-[0.5vw] px-[0.6vw] py-[0.24vw] bg-white border border-gray-200 rounded-[0.4vw] text-[0.72vw] font-medium text-gray-700 min-w-[5.2vw] hover:border-gray-300 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{quality}</span>
              <Icon
                icon="heroicons:chevron-down-20-solid"
                className={`w-[0.75vw] h-[0.75vw] text-gray-400 transition-transform ${
                  isQualityOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isQualityOpen && (
              <div className="absolute right-0 bottom-full mb-[0.25vw] bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.2vw] min-w-[6.2vw] animate-in fade-in slide-in-from-bottom-1 duration-150">
                {["Low", "Medium", "High", "Ultra"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuality(q);
                      setIsQualityOpen(false);
                    }}
                    className={`w-full text-left px-[0.7vw] py-[0.28vw] text-[0.72vw] hover:bg-gray-50 transition-colors cursor-pointer ${
                      quality === q ? "font-semibold text-[#EC5137]" : "text-gray-700 font-normal"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type dropdown */}
          <div className="flex items-center gap-[0.35vw] relative" ref={fileTypeDropdownRef}>
            <span className="text-[0.72vw] font-medium text-gray-600 whitespace-nowrap">Type</span>
            <button
              type="button"
              onClick={() => setIsFileTypeOpen((prev) => !prev)}
              className="flex items-center justify-between gap-[0.5vw] px-[0.6vw] py-[0.24vw] bg-white border border-gray-200 rounded-[0.4vw] text-[0.72vw] font-medium text-gray-700 min-w-[4.8vw] hover:border-gray-300 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{fileType}</span>
              <Icon
                icon="heroicons:chevron-down-20-solid"
                className={`w-[0.75vw] h-[0.75vw] text-gray-400 transition-transform ${
                  isFileTypeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFileTypeOpen && (
              <div className="absolute right-0 bottom-full mb-[0.25vw] bg-white border border-gray-200 rounded-[0.45vw] shadow-xl z-50 py-[0.2vw] min-w-[5.5vw] animate-in fade-in slide-in-from-bottom-1 duration-150">
                {["PNG", "JPG", "PDF"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFileType(t);
                      setIsFileTypeOpen(false);
                    }}
                    className={`w-full text-left px-[0.7vw] py-[0.28vw] text-[0.72vw] hover:bg-gray-50 transition-colors cursor-pointer ${
                      fileType === t ? "font-semibold text-[#EC5137]" : "text-gray-700 font-normal"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            type="button"
            disabled={selectedIds.size === 0 || isExporting}
            onClick={handleExportClick}
            className={`flex items-center gap-[0.35vw] px-[0.95vw] py-[0.26vw] rounded-[0.4vw] text-[0.74vw] font-medium text-white transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              selectedIds.size === 0 || isExporting
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-[#EC5137] hover:bg-[#d9442a]"
            }`}
          >
            <Icon
              icon={isExporting ? "line-md:loading-loop" : "solar:export-linear"}
              className="w-[0.88vw] h-[0.88vw]"
            />
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </button>
        </div>
      </div>

      {/* ── SNAPSHOT CARDS SCROLLABLE ROW (Hidden when minimized) ── */}
      {!isMinimized && (
        <div className="relative flex items-center w-full min-h-[8.5vw] animate-in fade-in duration-200">
          {snapshots.length === 0 ? (
            <div className="w-full h-[8.5vw] rounded-[0.6vw] border-2 border-dashed border-gray-200/90 bg-gray-50/50 flex flex-col items-center justify-center gap-[0.35vw] text-gray-400">
              <Icon icon="solar:camera-outline" className="w-[1.6vw] h-[1.6vw] text-gray-300" />
              <span className="text-[0.75vw] font-medium">
                No saved angles yet. Click "Save Current Angle" on the canvas to add one.
              </span>
            </div>
          ) : (
            <>
              {/* Scroll Left Arrow Circle Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  className="absolute left-[-0.6vw] top-1/2 -translate-y-1/2 w-[1.7vw] h-[1.7vw] rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-md flex items-center justify-center text-[#EC5137] transition-all cursor-pointer active:scale-90 z-20"
                  title="Scroll previous"
                >
                  <Icon
                    icon="heroicons:arrow-left-20-solid"
                    className="w-[1vw] h-[1vw]"
                  />
                </button>
              )}

              {/* Cards Container */}
              <div
                ref={scrollContainerRef}
                className="flex items-center gap-[1vw] overflow-x-auto overflow-y-hidden w-full py-[0.4vw] px-[0.2vw] custom-bottom-scroll scroll-smooth"
              >
                {snapshots.map((snap, index) => {
                  const isSelected = selectedIds.has(snap.id);
                  const isEditing = editingId === snap.id;

                  return (
                    <div
                      key={snap.id}
                      onClick={(e) => handleToggleSelect(snap.id, e, index)}
                      onContextMenu={(e) => handleCardContextMenu(e, snap)}
                      className={`relative flex flex-col shrink-0 w-[11.2vw] bg-white rounded-[0.55vw] overflow-hidden border-2 transition-all duration-200 cursor-pointer group shadow-2xs ${
                        isSelected
                          ? "border-[#EC5137] ring-2 ring-[#EC5137]/15 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Card Selection Checkmark (Top Left) */}
                      <div className="absolute top-[0.4vw] left-[0.4vw] z-10">
                        {isSelected ? (
                          <div className="w-[1.1vw] h-[1.1vw] rounded-full bg-[#EC5137] text-white flex items-center justify-center shadow-xs">
                            <Icon
                              icon="heroicons:check-20-solid"
                              className="w-[0.8vw] h-[0.8vw]"
                            />
                          </div>
                        ) : (
                          <div className="w-[1.1vw] h-[1.1vw] rounded-full border border-gray-400 bg-white/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Card Delete Button (Top Right) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSnapshot?.(snap.id);
                        }}
                        className="absolute top-[0.4vw] right-[0.4vw] w-[1.1vw] h-[1.1vw] rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow-xs"
                        title="Delete angle"
                      >
                        <Icon
                          icon="heroicons:trash-20-solid"
                          className="w-[0.75vw] h-[0.75vw]"
                        />
                      </button>

                      {/* Image Preview Thumbnail */}
                      <div className="w-full h-[5.6vw] bg-[#f0f2f5] overflow-hidden flex items-center justify-center relative">
                        <img
                          src={snap.dataUrl}
                          alt={snap.title || "Camera angle preview"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Card Bottom: Title & Rename Action */}
                      <div className="flex items-center justify-between px-[0.55vw] py-[0.35vw] bg-white border-t border-gray-100">
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSaveRename(snap.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(snap.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[0.72vw] font-medium text-gray-800 bg-gray-50 border border-[#EC5137] rounded px-[0.3vw] py-[0.1vw] outline-none w-full mr-[0.3vw]"
                          />
                        ) : (
                          <span className="text-[0.72vw] font-medium text-gray-700 truncate">
                            {snap.title || "Top Angle"}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleStartRename(snap, e)}
                          className="text-gray-400 hover:text-gray-700 transition-colors p-[0.15vw] cursor-pointer ml-[0.2vw] shrink-0"
                          title="Rename angle"
                        >
                          <Icon
                            icon="mdi:rename"
                            className="w-[0.9vw] h-[0.9vw]"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scroll Right Arrow Circle Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={handleScrollRight}
                  className="absolute right-[-0.6vw] top-1/2 -translate-y-1/2 w-[1.7vw] h-[1.7vw] rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-md flex items-center justify-center text-[#EC5137] transition-all cursor-pointer active:scale-90 z-20"
                  title="Scroll next"
                >
                  <Icon
                    icon="heroicons:arrow-right-20-solid"
                    className="w-[1vw] h-[1vw]"
                  />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CARD RIGHT-CLICK CONTEXT MENU (Download, Delete) ── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200/90 rounded-[0.5vw] shadow-xl py-[0.25vw] min-w-[7.5vw] flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Download Action */}
          <button
            type="button"
            onClick={() => handleDownloadSingle(contextMenu.snap)}
            className="flex items-center gap-[0.45vw] px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-gray-700 hover:bg-[#fff5f3] hover:text-[#EC5137] cursor-pointer transition-colors text-left"
          >
            <Icon icon="solar:download-minimalistic-linear" className="w-[0.9vw] h-[0.9vw] text-gray-500 hover:text-[#EC5137]" />
            <span>Download</span>
          </button>

          {/* Delete Action */}
          <button
            type="button"
            onClick={() => {
              const snapId = contextMenu.snap?.id;
              setContextMenu(null);
              if (snapId) {
                onDeleteSnapshot?.(snapId);
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  next.delete(snapId);
                  return next;
                });
              }
            }}
            className="flex items-center gap-[0.45vw] px-[0.7vw] py-[0.38vw] text-[0.74vw] font-medium text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors text-left border-t border-gray-100"
          >
            <Icon icon="heroicons:trash-20-solid" className="w-[0.85vw] h-[0.85vw] text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      )}

      <style>{`
        .custom-bottom-scroll::-webkit-scrollbar {
          height: 0.28vw;
        }
        .custom-bottom-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .custom-bottom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
