import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ChevronDown, Lock } from "lucide-react";
import { Icon } from "@iconify/react";
import "react-phone-input-2/lib/style.css";

import AlertModal from "../../AlertModal";
import { resolveUploadsPath, getAssetBaseUrl } from "../../../utils/assets/assetUtils";
import { motion, AnimatePresence } from "framer-motion";
import HotspotCustomizationPopup from "./HotspotCustomizationPopup";
import { generateHotspotSVG, generateButtonSVG } from "./hotspotSvgUtils";
import { useAuth } from "../../../context/AuthContext";
import { ActionDropdown } from "./components/ActionDropdown";
import { detectTypeFromElement } from "./utils/elementTypeDetection";
import { useInteractionAudio } from "./hooks/useInteractionAudio";
import NavigateToAction from "./actions/NavigateToAction";
import InfoBoxAction from "./actions/InfoBoxAction";
import DownloadAction from "./actions/DownloadAction";
import AudioAction from "./actions/AudioAction";
import CallAction from "./actions/CallAction";
import SlideshowAction from "./actions/SlideshowAction";
import PopupAction from "./actions/PopupAction";
import ThreeDViewerAction from "./3d/ThreeDViewerAction";
import ZoomAction from "./actions/ZoomAction";
import OpenLinkAction from "./actions/OpenLinkAction";
import WhatsAppAction from "./actions/WhatsAppAction";
import EmailAction from "./actions/EmailAction";
import PopupExtraOptions from "./actions/PopupExtraOptions";
import PopupTemplateGalleryModal from "./components/PopupTemplateGalleryModal";
import ThreeDGalleryModal from "./components/ThreeDGalleryModal";
import SlideshowGalleryModal from "./components/SlideshowGalleryModal";











const InteractionPanel = ({
  selectedElementProps,
  activePageIndex,
  selectedLayerId,
  setSelectedLayerId,
  setMultiSelectedIds,
  updateElementAttribute,
  deleteLayer,
  pages,
  onCustomizePopup,
  setIs3DModalOpen,
  setCurrent3DItem,
  v_id: v_idProp,
  folderName: folderNameProp,
  flipbookName: flipbookNameProp,
}) => {
  const { user } = useAuth();
  const { folder: paramFolder, v_id: paramVId } = useParams() || {};
  const location = useLocation() || {};

  const effectiveVId =
    v_idProp ||
    paramVId ||
    location?.state?.v_id ||
    location?.state?.flipbook_v_id;
  const effectiveFolder =
    folderNameProp ||
    paramFolder ||
    location?.state?.folderName ||
    "My_Flipbooks";
  const effectiveBook =
    flipbookNameProp || location?.state?.flipbookName || "Untitled Flipbook";
  const [activeTemplateSelectionId, setActiveTemplateSelectionId] =
    useState(null);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    showCancel: false,
    confirmText: "Okay",
    cancelText: "Cancel",
    onConfirm: null,
  });
  const [openCardIds, setOpenCardIds] = useState({});
  const openCardIdsRef = useRef(openCardIds);
  openCardIdsRef.current = openCardIds;
  const [activeLayerId, setActiveLayerId] = useState(selectedLayerId || null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const prevActivePageIndexRef = useRef(activePageIndex);
  useEffect(() => {
    if (prevActivePageIndexRef.current !== activePageIndex) {
      prevActivePageIndexRef.current = activePageIndex;
      setExpandedCardId(null);
      setOpenDropdownId(null);
    }
  }, [activePageIndex]);

  // Sync activeLayerId and expandedCardId when selectedLayerId changes externally (e.g. canvas selection)
  useEffect(() => {
    if (selectedLayerId) {
      setActiveLayerId(selectedLayerId);
      setExpandedCardId(selectedLayerId);
    } else {
      setActiveLayerId(null);
      setExpandedCardId(null);
    }
  }, [selectedLayerId]);
  // Immediate local override for action type so card header updates without waiting for pages re-sync
  const [cardActionOverrides, setCardActionOverrides] = useState({});
  const [active3DGalleryItem, setActive3DGalleryItem] = useState(null);
  const [isSlideshowGalleryOpen, setIsSlideshowGalleryOpen] = useState(false);
  const [isCompressingInteractionSlideshow, setIsCompressingInteractionSlideshow] = useState(false);
  const [activeSlideshowItem, setActiveSlideshowItem] = useState(null);
  const [editingHotspotId, setEditingHotspotId] = useState(null);
  const [slideshowDragIdx, setSlideshowDragIdx] = useState(null);
  const [slideshowDragOverIdx, setSlideshowDragOverIdx] = useState(null);

  // Immediate local overrides for input values and triggers to eliminate dropdown lag and system hang
  const [itemValueOverrides, setItemValueOverrides] = useState({});
  const [, setItemTriggerOverrides] = useState({});
  const [localInputValues, setLocalInputValues] = useState({});
  const [dropdownDirectionOverrides, setDropdownDirectionOverrides] = useState(
    {},
  );
  const [uploadingItems, setUploadingItems] = useState({});

  const {
    activeAudioRef,
    audioPlaybackTimes,
    audioProgressPercent,
    audioSourceMode,
    handleAudioSeek,
    handleCancelRecording,
    handleSaveRecordedAudio,
    handleStartRecording,
    handleStopRecording,
    handleTogglePauseResumeRecording,
    handleTogglePlayAudio,
    isRecordingPaused,
    playingAudioId,
    recordedDataMap,
    recordedPreviewPlaying,
    recordingItemId,
    recordingMillis,
    recordingWaveform,
    setAudioSourceMode,
    setPlayingAudioId,
  } = useInteractionAudio({
    activePageIndex,
    effectiveBook,
    effectiveFolder,
    effectiveVId,
    setItemValueOverrides,
    setUploadingItems,
    updateElementAttribute,
    user,
  });
  const [, setTooltipSettingsOverrides] = useState({});
  const [linkBehaviorOverrides, setLinkBehaviorOverrides] = useState({});
  const [whatsappMessageOverrides, setWhatsappMessageOverrides] = useState({});
  const [highlightOverrides, setHighlightOverrides] = useState({});
  const [popupCustomHtmlOverrides, setPopupCustomHtmlOverrides] = useState({});

  const resolveSlideshowImageUrl = (img) => {
    if (!img) return "";
    const raw = typeof img === "string" ? img : img.data || img.url || "";
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

    if (
      raw.startsWith("../assets/") ||
      raw.startsWith("assets/") ||
      raw.startsWith("./assets/")
    ) {
      const cleanAsset = raw.replace(/^(\.\.\/|\.\/)+/, "");
      const sanitizedEmail = (user?.emailId || user?.email || "").replace(
        /[@.]/g,
        "_",
      );
      const userFolder = user?.userId || user?.userID || sanitizedEmail;
      const baseUrl = getAssetBaseUrl(
        userFolder,
        effectiveFolder,
        effectiveBook,
      );
      return `${baseUrl}${cleanAsset}`;
    }

    return resolveUploadsPath(raw);
  };















  // Clear itemValueOverrides upon save to force reloading from new absolute URLs
  useEffect(() => {
    const handleSaveComplete = () => {
      setItemValueOverrides({});
    };
    window.addEventListener("flipbook-saved", handleSaveComplete);
    return () =>
      window.removeEventListener("flipbook-saved", handleSaveComplete);
  }, []);

  const actionTypes = [
    { id: "open-link", label: "Open Link", icon: "ph:link-bold" },
    { id: "whatsapp", label: "WhatsApp", icon: "ic:outline-whatsapp" },
    { id: "email", label: "Email", icon: "ic:outline-mail" },
    { id: "call", label: "Call", icon: "fluent:call-24-regular" },
    { id: "navigate-to", label: "Navigate to", icon: "iconoir:page-search" },
    { id: "3d-viewer", label: "3D Viewer", icon: "mage:box-3d" },
    { id: "ar-view", label: "AR View", icon: "mdi:augmented-reality" },
    { id: "popup", label: "Popup", icon: "carbon:popup" },
    { id: "slideshow", label: "Slideshow", icon: "clarity:image-gallery-line" },
    { id: "zoom", label: "Zoom", icon: "fluent:zoom-in-32-regular" },
    { id: "download", label: "Download", icon: "mynaui:download" },
    { id: "audio", label: "Audio", icon: "lucide:volume-2" },
    { id: "info-box", label: "Info Box", icon: "fontisto:info" },
  ];

  const panelStateRef = useRef({
    updateElementAttribute,
    activePageIndex,
    pages,
    actionTypes,
  });
  useEffect(() => {
    panelStateRef.current = {
      updateElementAttribute,
      activePageIndex,
      pages,
      actionTypes,
    };
  });

  // Cached DOMParser DOMs for all pages to avoid expensive re-parsing on every render
  const parsedPagesDOMsRef = useRef({});

  // Keep track of the previously selected layer ID to prevent override flashes
  const prevLayerIdRef = useRef(selectedLayerId);

  // Sync activeLayerId on canvas selection
  useEffect(() => {
    if (selectedLayerId) {
      setActiveLayerId(selectedLayerId);
      if (selectedElementProps) {
        const interactionType = selectedElementProps["data-interaction"];
        if (interactionType) {
          setOpenCardIds((prev) => {
            if (!prev[selectedLayerId]) {
              return { ...prev, [selectedLayerId]: true };
            }
            return prev;
          });
        }
      }

      setExpandedCardId(selectedLayerId);
    } else {
      setActiveLayerId(null);
      setExpandedCardId(null);
    }

    // ONLY clear temporary local overrides if the user actually clicked a DIFFERENT element
    if (prevLayerIdRef.current !== selectedLayerId) {
      setItemValueOverrides({});
      setItemTriggerOverrides({});
      setLocalInputValues({});
      setTooltipSettingsOverrides({});
      setLinkBehaviorOverrides({});
      setWhatsappMessageOverrides({});
      prevLayerIdRef.current = selectedLayerId;
    }
  }, [selectedLayerId, selectedElementProps]);

  // Listen for the event fired by the "Add Interaction" badge on the canvas
  useEffect(() => {
    const handleAddInteraction = (e) => {
      const elementId = e.detail?.elementId;
      if (elementId) {
        setOpenCardIds((prev) => ({
          ...prev,
          [elementId]: true,
        }));
        setExpandedCardId(elementId);
        setActiveLayerId(elementId);

        const { updateElementAttribute, activePageIndex, pages, actionTypes } =
          panelStateRef.current;
        if (updateElementAttribute) {
          let existingType = "open-link";
          let existingVal = "";
          const page = pages?.[activePageIndex];
          if (page && page.html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(page.html, "image/svg+xml");
            const el = doc.getElementById(elementId);
            if (el) {
              existingType = el.getAttribute("data-interaction") || "open-link";
              existingVal = el.getAttribute("data-interaction-value") || "";
            }
          }

          updateElementAttribute(activePageIndex, elementId, {
            "data-interaction": existingType,
            "data-interaction-value": existingVal,
          });

          const foundAction = actionTypes.find((a) => a.id === existingType);
          if (foundAction) {
            window.dispatchEvent(
              new CustomEvent("update-interaction-badge", {
                detail: {
                  elementId: elementId,
                  actionType: foundAction,
                },
              }),
            );
          }
        }
      }
    };
    window.addEventListener("add-free-frame", handleAddInteraction);
    return () =>
      window.removeEventListener("add-free-frame", handleAddInteraction);
  }, []);

  // Listen for event to auto open accordion for an invalid interaction on save
  useEffect(() => {
    const handleOpenAccordion = (e) => {
      const elementId = e.detail?.elementId;
      if (elementId) {
        setOpenCardIds((prev) => ({
          ...prev,
          [elementId]: true,
        }));
        setExpandedCardId(elementId);
        setActiveLayerId(elementId);

        // Scroll the accordion card into view and focus the input
        setTimeout(() => {
          const cardEl =
            document.querySelector(
              `[data-interaction-card-id="${elementId}"]`,
            ) || document.getElementById(`interaction-card-${elementId}`);
          if (cardEl) {
            if (cardEl.scrollIntoView) {
              cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            if (e.detail?.field === "whatsapp-message") {
              const msgInput = cardEl.querySelector(
                'input[placeholder*="question"], input[placeholder*="Hello"], input[placeholder*="message"]',
              );
              if (msgInput && msgInput.focus) {
                msgInput.focus();
                return;
              }
            }
            const inputEl = cardEl.querySelector(
              'input:not([type="hidden"]), select, textarea',
            );
            if (inputEl && inputEl.focus) {
              inputEl.focus();
            }
          }
        }, 150);
      }
    };
    window.addEventListener("open-interaction-accordion", handleOpenAccordion);
    return () =>
      window.removeEventListener(
        "open-interaction-accordion",
        handleOpenAccordion,
      );
  }, []);

  // Listen for popup customization updates to immediately refresh preview
  useEffect(() => {
    const handlePopupCustomHtmlUpdate = (e) => {
      if (e.detail && e.detail.elementId) {
        setPopupCustomHtmlOverrides((prev) => ({
          ...prev,
          [e.detail.elementId]: e.detail.customHtml,
        }));
      }
    };
    window.addEventListener(
      "update-popup-custom-html",
      handlePopupCustomHtmlUpdate,
    );
    return () =>
      window.removeEventListener(
        "update-popup-custom-html",
        handlePopupCustomHtmlUpdate,
      );
  }, []);

  // Sync existing interactions from the page HTML into openCardIds when page loads or changes
  useEffect(() => {
    if (!pages || pages.length === 0) return;
    const page = pages[activePageIndex];
    if (!page || !page.html) return;

    let doc;
    const cached = parsedPagesDOMsRef.current[activePageIndex];
    if (cached && cached.html === page.html && cached.doc) {
      doc = cached.doc;
    } else {
      try {
        const parser = new DOMParser();
        doc = parser.parseFromString(page.html, "image/svg+xml");
        parsedPagesDOMsRef.current[activePageIndex] = { html: page.html, doc };
      } catch {
        return;
      }
    }

    const interactEls = doc.querySelectorAll("[data-interaction]");
    const newlyFoundIds = [];
    interactEls.forEach((el) => {
      const type = el.getAttribute("data-interaction");
      if (el.id && type && type !== "none") {
        newlyFoundIds.push(el.id);
      }
    });

    setOpenCardIds((prev) => {
      let hasChanges = false;
      const next = { ...prev };
      newlyFoundIds.forEach((id) => {
        if (!next[id]) {
          next[id] = true;
          hasChanges = true;
        }
      });
      // Do NOT prune selectedLayerId to prevent infinite loop ping-pong with selection effects
      Object.keys(prev).forEach((id) => {
        if (id !== selectedLayerId && prev[id] && !newlyFoundIds.includes(id)) {
          const existsInOtherPage = pages.some(
            (p, idx) =>
              idx !== activePageIndex &&
              p?.html &&
              (p.html.includes(`id="${id}"`) || p.html.includes(`id='${id}'`)),
          );
          if (!existsInOtherPage) {
            delete next[id];
            hasChanges = true;
          }
        }
      });
      return hasChanges ? next : prev;
    });

    // Newly found interactive elements are tracked in openCardIds
  }, [pages, activePageIndex, selectedLayerId]);

  // Listen for interaction-removed event to immediately close and clean up card state
  useEffect(() => {
    const handleInteractionRemoved = (e) => {
      const id = e.detail?.id;
      if (!id) return;
      setOpenCardIds((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setItemValueOverrides((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setCardActionOverrides((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };
    window.addEventListener("interaction-removed", handleInteractionRemoved);
    return () =>
      window.removeEventListener(
        "interaction-removed",
        handleInteractionRemoved,
      );
  }, []);

  // Broadcast visual badge state (icon/checkmark) updates to MainEditor canvas whenever elements exist, page changes, or selection changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const editorDoc =
        document.getElementById("main-flipbook-editor")?.contentDocument ||
        document;
      const elements = Array.from(
        editorDoc.querySelectorAll("[data-interaction]"),
      );
      elements.forEach((el) => {
        const actionId = el.getAttribute("data-interaction");
        if (actionId) {
          const found = actionTypes.find((a) => a.id === actionId);
          if (found) {
            window.dispatchEvent(
              new CustomEvent("update-interaction-badge", {
                detail: {
                  elementId: el.id,
                  actionType: found,
                },
              }),
            );
          }
        }
      });
    }, 40);

    return () => clearTimeout(timer);
  }, [pages, activePageIndex, selectedLayerId]);

  // Close action dropdown when clicking anywhere outside it (including canvas area)
  useEffect(() => {
    if (!openDropdownId) return;
    const handleGlobalMouseDown = (e) => {
      // If the click is NOT inside a dropdown trigger or the dropdown menu, close it
      if (
        !e.target.closest("[data-dropdown-trigger]") &&
        !e.target.closest("[data-dropdown-menu]")
      ) {
        setOpenDropdownId(null);
      }
    };
    // Use window + mousedown + capture:true so it fires before any canvas stopPropagation
    window.addEventListener("mousedown", handleGlobalMouseDown, true);
    return () =>
      window.removeEventListener("mousedown", handleGlobalMouseDown, true);
  }, [openDropdownId]);

  // Close expanded card when clicking anywhere outside it (including canvas or empty panel space)
  useEffect(() => {
    if (!expandedCardId) return;

    const handleOutsideClick = (e) => {
      // Don't close if clicking inside an interaction card, or the selected element's
      // "No interaction added / Add Interaction" status card (otherwise pressing the button
      // deselects the element and the click never reaches it)
      if (e.target.closest("[data-interaction-card-id]") || e.target.closest("[data-interaction-status-card]")) {
        return;
      }
      // Pressing on the selected element itself (e.g. to drag/move it) or on its selection
      // outline/handles must not deselect it — otherwise the selection box vanishes after the move.
      const selectedNode = expandedCardId ? document.getElementById(expandedCardId) : null;
      if (
        (selectedNode && selectedNode.contains(e.target)) ||
        e.target.closest(".selection-overlay-layer") ||
        e.target.closest('[id^="highlight-overlay"]') ||
        e.target.closest(".resize-handle") ||
        e.target.closest('[id^="resize-handle-"]') ||
        e.target.closest('[id^="rotate-handle-"]')
      ) {
        return;
      }
      // Don't close if clicking inside open modals, popups, or dropdown menus/triggers
      if (
        e.target.closest("[data-dropdown-menu]") ||
        e.target.closest("[data-dropdown-trigger]") ||
        e.target.closest('[role="dialog"]') ||
        e.target.closest(".media-gallery-popup") ||
        e.target.closest(".hotspot-customization-popup")
      ) {
        return;
      }
      setExpandedCardId(null);
      if (setSelectedLayerId) {
        setSelectedLayerId(null);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [expandedCardId, setSelectedLayerId]);


  // Scans SVG DOM strictly for the active page to retrieve all active/added interaction cards
  const interactiveElementsList = React.useMemo(() => {
    if (!pages || pages.length === 0) return [];

    // Pre-populate/update the cache for all pages that changed
    pages.forEach((page, i) => {
      if (page && page.html) {
        const cached = parsedPagesDOMsRef.current[i];
        if (!cached || cached.html !== page.html) {
          try {
            const parser = new DOMParser();
            parsedPagesDOMsRef.current[i] = {
              html: page.html,
              doc: parser.parseFromString(page.html, "image/svg+xml"),
            };
          } catch (e) {
            console.error("DOM Cache Parse failed", e);
          }
        }
      }
    });

    const activeCached = parsedPagesDOMsRef.current[activePageIndex];
    const editorDoc =
      document.getElementById("main-flipbook-editor")?.contentDocument ||
      document;
    const activeContainer = editorDoc.querySelector(
      `.page-svg-container[data-page-index="${activePageIndex}"]`,
    );

    // Helper to identify dedicated Audio Player elements (which belong to Elements, not Interactions)
    const isAudioPlayerElement = (el) => {
      if (!el) return false;
      return (
        el.getAttribute?.("data-type") === "audio-frame" ||
        (typeof el.getAttribute === "function" &&
          el.getAttribute("id")?.startsWith("audio-")) ||
        (typeof el.closest === "function" &&
          el.closest('[data-type="audio-frame"], g[id^="audio-"]') !== null)
      );
    };

    // Collect all element IDs strictly on the active page that have interactions or open cards
    const candidateIds = new Set();
    if (activeCached && activeCached.doc) {
      activeCached.doc.querySelectorAll("[data-interaction]").forEach((el) => {
        if (isAudioPlayerElement(el)) return;
        const type = el.getAttribute("data-interaction");
        if (el.id && type && type !== "none") candidateIds.add(el.id);
      });
    }
    if (activeContainer) {
      activeContainer.querySelectorAll("[data-interaction]").forEach((el) => {
        if (isAudioPlayerElement(el)) return;
        const type = el.getAttribute("data-interaction");
        if (el.id && type && type !== "none") {
          // If activeCached already knows about this element and it does NOT have an interaction in the cached doc,
          // then the activeContainer DOM is just stale (waiting for React to flush)!
          if (activeCached?.doc?.getElementById(el.id)) {
            const cachedType = activeCached.doc
              .getElementById(el.id)
              .getAttribute("data-interaction");
            if (!cachedType || cachedType === "none") {
              return;
            }
          }
          candidateIds.add(el.id);
        }
      });
    }
    Object.keys(openCardIds).forEach((id) => {
      if (openCardIds[id]) {
        // Only include if it actually belongs to the active page and is not an Audio Player element
        const cachedEl = activeCached?.doc?.getElementById(id);
        const liveEl = activeContainer?.querySelector(
          `[id="${CSS.escape(id)}"]`,
        );
        const targetCandidate = cachedEl || liveEl;
        if (targetCandidate && !isAudioPlayerElement(targetCandidate)) {
          candidateIds.add(id);
        }
      }
    });

    if (candidateIds.size === 0) return [];

    const list = [];

    candidateIds.forEach((id) => {
      let foundEl = null;

      // 1. Check active page cached DOM first (guaranteed in sync with React state `pages`)
      if (activeCached && activeCached.doc) {
        const el = activeCached.doc.getElementById(id);
        if (el) {
          foundEl = el;
        }
      }

      // 2. Fallback to active page live DOM if not found in cache
      if (!foundEl && activeContainer) {
        const liveEl = activeContainer.querySelector(
          `[id="${CSS.escape(id)}"]`,
        );
        if (liveEl) {
          foundEl = liveEl;
        }
      }

      if (foundEl) {
        if (isAudioPlayerElement(foundEl)) {
          return;
        }
        // If this element or any of its parent layers is hidden, hide its interaction card from the right side!
        const isElementOrLayerHidden = () => {
          if (foundEl.getAttribute("data-hidden") === "true") return true;
          if (
            foundEl.getAttribute("style")?.includes("display:none") ||
            foundEl.getAttribute("style")?.includes("display: none")
          )
            return true;
          if (foundEl.style?.display === "none") return true;
          if (typeof foundEl.closest === "function") {
            const hiddenAncestor = foundEl.closest(
              '[data-hidden="true"], [style*="display:none"], [style*="display: none"]',
            );
            if (hiddenAncestor) return true;
          }
          const checkLayers = (list) => {
            if (!list) return false;
            for (const l of list) {
              if (l.id === id) {
                return l.visible === false;
              }
              if (l.children && l.children.length > 0) {
                if (l.visible === false) {
                  const hasTarget = (children) =>
                    children.some(
                      (c) =>
                        c.id === id || (c.children && hasTarget(c.children)),
                    );
                  if (hasTarget(l.children)) return true;
                }
                const found = checkLayers(l.children);
                if (found) return true;
              }
            }
            return false;
          };
          return checkLayers(pages[activePageIndex]?.layers);
        };

        if (isElementOrLayerHidden()) {
          return;
        }

        // Check if this element or any parent layer is locked
        const isElementOrLayerLocked = () => {
          if (foundEl.getAttribute("data-locked") === "true") return true;
          if (typeof foundEl.closest === "function") {
            const lockedAncestor = foundEl.closest('[data-locked="true"]');
            if (lockedAncestor) return true;
          }
          const checkLayers = (list) => {
            if (!list) return false;
            for (const l of list) {
              if (l.id === id) {
                return l.locked === true;
              }
              if (l.children && l.children.length > 0) {
                if (l.locked === true) {
                  const hasTarget = (children) =>
                    children.some(
                      (c) =>
                        c.id === id || (c.children && hasTarget(c.children)),
                    );
                  if (hasTarget(l.children)) return true;
                }
                const found = checkLayers(l.children);
                if (found) return true;
              }
            }
            return false;
          };
          return checkLayers(pages[activePageIndex]?.layers);
        };

        const isLocked = isElementOrLayerLocked();

        const interactionType = foundEl.getAttribute("data-interaction");
        if (
          !openCardIds[id] &&
          (!interactionType || interactionType === "none")
        ) {
          return;
        }

        const info = detectTypeFromElement(foundEl, id);

        const imageEl = foundEl.querySelector("image");
        const isHotspot =
          foundEl.getAttribute("data-is-hotspot") === "true" ||
          ((foundEl.getAttribute("data-type") === "icon" ||
            foundEl.getAttribute("data-type") === "hotspot") &&
            imageEl &&
            imageEl.getAttribute("width") === "52");

        const isInteractiveButton =
          isHotspot &&
          (foundEl.getAttribute("data-preset-id") === "interactive-button" ||
            (foundEl.querySelector("rect") !== null &&
              (foundEl.querySelector("text") !== null ||
                foundEl.querySelector('[data-type="text"]') !== null)));

        let hotspotIconSrc = null;
        if (!isInteractiveButton) {
          hotspotIconSrc = foundEl.getAttribute("data-hotspot-icon-src");
          if (!hotspotIconSrc && isHotspot && imageEl) {
            hotspotIconSrc = imageEl.getAttribute("href");
          }
        }

        let hotspotHtml = null;
        let hotspotBBox = "0 0 48 48";
        let previewHtml = null;
        let previewBBox = null;

        if (isInteractiveButton) {
          hotspotHtml = foundEl.innerHTML;
          const textEl =
            foundEl.querySelector("text") ||
            foundEl.querySelector('[data-type="text"]');
          const btnLabel = textEl ? textEl.textContent.trim() : "Button";
          const rectEl = foundEl.querySelector("rect");
          const bgCol =
            foundEl.getAttribute("data-bg-color") ||
            (rectEl
              ? rectEl.getAttribute("fill") || rectEl.style.fill
              : "#359CFD") ||
            "#359CFD";
          const textCol =
            foundEl.getAttribute("data-icon-color") ||
            (textEl
              ? textEl.getAttribute("fill") || textEl.style.fill
              : "#FFFFFF") ||
            "#FFFFFF";
          const pathEl = foundEl.querySelector("path");
          const imgEl = foundEl.querySelector("image");
          const hasIcon = !!(pathEl || imgEl);
          const btnIconSrc = imgEl ? imgEl.getAttribute("href") : null;
          const btnIconCol = pathEl
            ? pathEl.getAttribute("stroke") || textCol
            : textCol;

          let btnIconPlacement = "Front";
          if (hasIcon && textEl) {
            const iconX = imgEl
              ? parseFloat(imgEl.getAttribute("x") || 0)
              : pathEl
                ? pathEl.parentElement?.tagName?.toLowerCase() === "g" &&
                  pathEl.parentElement
                    .getAttribute("transform")
                    ?.includes("translate")
                  ? parseFloat(
                      pathEl.parentElement
                        .getAttribute("transform")
                        .match(/translate\(([^,\s)]+)/)?.[1] || 0,
                    )
                  : 0
                : 0;
            const textX = parseFloat(textEl.getAttribute("x") || 0);
            if (iconX > textX) btnIconPlacement = "Back";
          }

          // Generate a normalized, stable button preview so adjusting the button on canvas doesn't resize or distort the sidebar preview box
          previewHtml = generateButtonSVG(
            btnLabel,
            bgCol,
            textCol,
            hasIcon,
            btnIconCol,
            btnIconPlacement,
            80,
            32,
            4,
            14,
            btnIconSrc,
          );
          previewBBox = "0 0 80 32";
          hotspotBBox = "0 0 80 32";
        } else if (isHotspot) {
          hotspotHtml = foundEl.innerHTML;
          const rectMatch = hotspotHtml.match(
            /<rect[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/,
          );
          if (rectMatch) {
            hotspotBBox = `0 0 ${rectMatch[1]} ${rectMatch[2]}`;
          }
        }

        list.push({
          id: foundEl.id,
          tagName: foundEl.tagName,
          dataName: foundEl.getAttribute("data-name"),
          label: info.name,
          actionId: foundEl.getAttribute("data-interaction") || "open-link",
          value: foundEl.getAttribute("data-interaction-value") || "",
          customPopupHtml:
            foundEl.getAttribute("data-interaction-popup-custom-html") || null,
          popupAnimation:
            foundEl.getAttribute("data-interaction-popup-animation") ||
            "Fade in",
          popupSpeed:
            foundEl.getAttribute("data-interaction-popup-speed") || "Medium",
          tooltipSettings: foundEl.getAttribute("data-tooltip-settings") || "",
          trigger: foundEl.getAttribute("data-interaction-trigger") || "click",
          linkBehavior:
            foundEl.getAttribute("data-interaction-link-behavior") || "current",
          zoomTargetId: foundEl.getAttribute("data-zoom-target") || null,
          zoomLevel: foundEl.getAttribute("data-zoom-level") || "2X",
          isLocked: isLocked,
          isHotspot: isHotspot,
          isInteractiveButton: isInteractiveButton,
          "data-show-highlight": foundEl.getAttribute("data-show-highlight"),
          hotspotIconSrc: hotspotIconSrc,
          hotspotHtml: hotspotHtml,
          hotspotBBox: hotspotBBox,
          previewHtml: previewHtml,
          previewBBox: previewBBox,
          presetId: foundEl.getAttribute("data-preset-id") || null,
          bgColor: foundEl.getAttribute("data-bg-color") || null,
          iconColor: foundEl.getAttribute("data-icon-color") || null,
        });
      }
    });

    return list;
  }, [pages, openCardIds, activePageIndex]);

  // Automatically close accordion and dropdown when an element is locked
  useEffect(() => {
    if (expandedCardId) {
      const currentItem = interactiveElementsList.find(
        (i) => i.id === expandedCardId,
      );
      if (currentItem?.isLocked) {
        setExpandedCardId(null);
      }
    }
    if (openDropdownId) {
      const currentItem = interactiveElementsList.find(
        (i) => i.id === openDropdownId,
      );
      if (currentItem?.isLocked) {
        setOpenDropdownId(null);
      }
    }
  }, [expandedCardId, openDropdownId, interactiveElementsList]);


  const selectedEl = React.useMemo(() => {
    if (!selectedLayerId) return null;
    const editorDoc =
      document.getElementById("main-flipbook-editor")?.contentDocument ||
      document;
    const activeContainer = editorDoc.querySelector(
      `.page-svg-container[data-page-index="${activePageIndex}"]`,
    );
    return activeContainer
      ? activeContainer.querySelector(`[id="${CSS.escape(selectedLayerId)}"]`)
      : editorDoc.getElementById(selectedLayerId);
  }, [selectedLayerId, activePageIndex, pages]);

  const selectedElName = React.useMemo(() => {
    if (!selectedLayerId) return null;
    if (selectedEl) {
      return (
        selectedEl.getAttribute("data-name") || selectedEl.id || selectedLayerId
      );
    }
    if (selectedElementProps) {
      return selectedElementProps["data-name"] || selectedLayerId;
    }
    return selectedLayerId;
  }, [selectedLayerId, selectedEl, selectedElementProps]);

  const isPageOrRootElement = React.useCallback((el, idStr) => {
    if (!el && !idStr) return true;
    const id = idStr || el?.id || "";
    const name = el?.getAttribute?.("data-name") || "";
    const dataType = el?.getAttribute?.("data-type") || "";
    if (dataType && ['icon', 'shape', 'button', 'text', 'image', 'video', 'audio', 'qrcode', 'table', 'table-frame', 'embed', 'embed-frame', 'map', 'slideshow', 'hotspot', 'decorator', 'group'].includes(dataType)) {
      return false;
    }
    if (dataType === "frame") return true;
    if (el?.tagName?.toLowerCase() === "svg") return true;
    if (/^(page|slide)\s*\d+/i.test(name) || name === "Overlay") return true;
    if (/^(page|slide)-/i.test(id) || id === "Overlay") return true;
    if (
      el?.parentElement?.tagName?.toLowerCase() === "svg" &&
      el?.tagName?.toLowerCase() === "g"
    ) {
      return !dataType && !id.startsWith('icon-') && !id.startsWith('shape-') && !id.startsWith('text-') && !id.startsWith('image-');
    }
    return false;
  }, []);

  const isRealElementSelected =
    selectedLayerId && !isPageOrRootElement(selectedEl, selectedLayerId);

  const isAudioElementSelected = React.useMemo(() => {
    if (selectedElementProps?.isAudio) return true;
    if (
      selectedLayerId &&
      (selectedLayerId.startsWith("audio-") ||
        selectedLayerId.includes("audio-frame"))
    )
      return true;
    if (selectedEl) {
      if (selectedEl.getAttribute("data-type") === "audio-frame") return true;
      if (
        typeof selectedEl.closest === "function" &&
        selectedEl.closest('[data-type="audio-frame"], g[id^="audio-"]')
      )
        return true;
    }
    return false;
  }, [selectedElementProps, selectedLayerId, selectedEl]);

  const isConvertedDocument = React.useMemo(() => {
    return Boolean(
      pages &&
      pages.some(
        (p) =>
          p?.html &&
          (p.html.includes('data-name="PDF Background"') ||
            p.html.includes("PDF Background") ||
            p.html.includes("pdf-vector-layer") ||
            p.html.includes("Document Shield")),
      ),
    );
  }, [pages]);

  const hasInteraction = React.useMemo(() => {
    if (!selectedLayerId) return false;
    if (openCardIds[selectedLayerId]) return true;
    if (
      selectedElementProps &&
      selectedElementProps["data-interaction"] &&
      selectedElementProps["data-interaction"] !== "none"
    )
      return true;
    if (selectedEl) {
      const type = selectedEl.getAttribute("data-interaction");
      const intent = selectedEl.getAttribute("data-interaction-intent");
      if ((type && type !== "none") || intent === "true") return true;
    }
    return false;
  }, [selectedLayerId, openCardIds, selectedElementProps, selectedEl]);

  const handleAddInteractionToSelected = () => {
    const targetId = selectedLayerId;
    if (!targetId || isAudioElementSelected) return;

    setOpenCardIds((prev) => ({ ...prev, [targetId]: true }));
    setExpandedCardId(targetId);
    setActiveLayerId(targetId);

    if (updateElementAttribute) {
      updateElementAttribute(activePageIndex, targetId, {
        "data-interaction": "open-link",
        "data-interaction-value": "",
      });
    }

    window.dispatchEvent(
      new CustomEvent("update-interaction-badge", {
        detail: {
          elementId: targetId,
          actionType: {
            id: "open-link",
            label: "Open Link",
            icon: "ph:link-bold",
          },
        },
      }),
    );
  };

  return (
    <div className="flex flex-col gap-[2vh] px-[1.5vw] pt-[1.8vh] pb-[5vw] w-full">
      {/* Selected Element Interaction Status Card (ONLY if selected AND not added yet, hidden for converted documents and audio elements) */}
      {!isConvertedDocument &&
        isRealElementSelected &&
        !isAudioElementSelected &&
        !hasInteraction && (
          <div data-interaction-status-card="true" className="p-[0.65vw] rounded-[0.6vw] border border-[#EC5137]/25 bg-gradient-to-r from-[#EC5137]/[0.06] via-white to-white hover:border-[#EC5137]/45 shadow-2xs flex items-center justify-between gap-[0.8vw] transition-all">
            <div className="flex items-center gap-[0.65vw] min-w-0 flex-1">
              <div className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] flex items-center justify-center flex-shrink-0 bg-[#EC5137]/10 text-[#EC5137] border border-[#EC5137]/15">
                <Icon
                  icon="hugeicons:touch-interaction-01"
                  width="1.15vw"
                  height="1.15vw"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className="text-[0.82vw] font-semibold text-gray-900 truncate leading-tight"
                  title={selectedElName}
                >
                  {selectedElName}
                </span>
                <span className="text-[0.68vw] text-gray-500 font-medium whitespace-nowrap flex items-center gap-[0.3vw] mt-[0.15vh]">
                  <span className="w-[0.35vw] h-[0.35vw] rounded-full bg-amber-400 flex-shrink-0" />
                  No interaction added
                </span>
              </div>
            </div>

            <button
              onClick={handleAddInteractionToSelected}
              className="flex-shrink-0 h-[1.85vw] px-[0.85vw] bg-[#EC5137] hover:bg-[#d6442c] text-white rounded-[0.4vw] text-[0.74vw] font-medium flex items-center gap-[0.3vw] shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Icon icon="lucide:plus" width="0.85vw" height="0.85vw" />
              <span>Add Interaction</span>
            </button>
          </div>
        )}

      {/* Interactions in this Page Section */}
      <div className="space-y-[1.5vh] mt-[0.5vh]">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">
            Interactions in this Page
          </span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        {/* Interaction List */}
        <div className="flex flex-col gap-[0.7vh] pb-[2vh]">
          {interactiveElementsList.length > 0 ? (
            interactiveElementsList.map((item) => {
              const isLocked = Boolean(item.isLocked);
              const resolvedActionId =
                cardActionOverrides[item.id] || item.actionId;
              const isExpanded = !isLocked && expandedCardId === item.id;
              const isCollapsed = !isExpanded;
              const isDropdownOpen = !isLocked && openDropdownId === item.id;
              // Use local override (immediate) if available, else fall back to item.actionId from pages
              const currentAction =
                actionTypes.find((a) => a.id === resolvedActionId) ||
                actionTypes[0];
              // Respect trigger and value local overrides to bypass DOM parsing lag
              const resolvedValue =
                itemValueOverrides[item.id] !== undefined
                  ? itemValueOverrides[item.id]
                  : item.value;
              const isSelected = Boolean(
                !isLocked && selectedLayerId && activeLayerId === item.id,
              );

              const isFreeFrameTarget =
                item.dataName === "Free Frame" ||
                item.id?.startsWith("free-frame") ||
                (item.tagName?.toLowerCase() === "rect" && !item.isHotspot);
              const isHotspotTarget =
                item.isHotspot ||
                item.dataName?.toLowerCase().includes("hotspot") ||
                item.id?.startsWith("hotspot");

              let targetTypeBadge = null;
              if (isFreeFrameTarget) {
                targetTypeBadge = {
                  label: "Frame",
                  bg: "bg-blue-50 text-blue-600 border-blue-200",
                };
              } else if (isHotspotTarget) {
                targetTypeBadge = {
                  label: "Hotspot",
                  bg: "bg-purple-50 text-purple-600 border-purple-200",
                };
              } else if (item.isInteractiveButton) {
                targetTypeBadge = {
                  label: "Button",
                  bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
                };
              } else if (item.label && item.label !== item.id) {
                const shortLabel = item.label.split(" ")[0];
                targetTypeBadge = {
                  label: shortLabel,
                  bg: "bg-gray-100 text-gray-700 border-gray-200",
                };
              }

              const selectItemAndHighlight = () => {
                if (isLocked) return;
                const targetIdx =
                  item.pageIndex !== undefined
                    ? item.pageIndex
                    : activePageIndex;
                setActiveLayerId(item.id);
                if (setSelectedLayerId) setSelectedLayerId(item.id);
                if (setMultiSelectedIds)
                  setMultiSelectedIds(new Set([item.id]));
                window.dispatchEvent(
                  new CustomEvent("select-layer", {
                    detail: { layerId: item.id, ids: [item.id] },
                  }),
                );
                window.dispatchEvent(
                  new CustomEvent("rebind-selection-overlay", {
                    detail: { layerId: item.id },
                  }),
                );
                window.dispatchEvent(
                  new CustomEvent("force-update-selection-box", {
                    detail: { elementId: item.id },
                  }),
                );
                window.dispatchEvent(
                  new CustomEvent("blink-canvas-element", {
                    detail: { elementId: item.id, pageIndex: targetIdx },
                  }),
                );
              };

              const isCardDropdownOpen = Boolean(
                openDropdownId &&
                  (openDropdownId === item.id ||
                    (typeof openDropdownId === "string" &&
                      openDropdownId.includes(item.id))),
              );

              return (
                <div
                  key={item.id}
                  id={`interaction-card-${item.id}`}
                  data-interaction-card-id={item.id}
                  onClick={() => {
                    if (isLocked) return;
                    selectItemAndHighlight();
                  }}
                  className={`w-full mx-auto bg-white border-[0.15vw] rounded-[0.6vw] shadow-2xs flex flex-col relative transition-all duration-200 ${
                    isLocked
                      ? "border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed pointer-events-none overflow-hidden"
                      : isCardDropdownOpen || isExpanded
                        ? "overflow-visible"
                        : "overflow-hidden"
                  } ${
                    isSelected
                      ? "border-[#EC5137] shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    isCardDropdownOpen
                      ? "z-[9999]"
                      : isSelected
                        ? "z-[50]"
                        : "z-[10]"
                  }`}
                >
                  {/* Card Header / Settings */}
                  <div className="flex flex-col">
                    {/* Top Row: Icon + Dropdowns (Clicking anywhere toggles open/close) */}
                    <div
                      className={`flex items-center justify-between gap-[0.8vw] py-[0.7vw] px-[0.8vw] select-none rounded-t-[0.6vw] ${
                        isLocked ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLocked) return;
                        selectItemAndHighlight();

                        const nextExpandedId = isExpanded ? null : item.id;
                        setExpandedCardId(nextExpandedId);

                        if (isExpanded && resolvedActionId === "tooltip") {
                          window.dispatchEvent(
                            new CustomEvent("hide-tooltip-customization"),
                          );
                        }
                      }}
                    >
                      <div className="flex items-center gap-[0.8vw]">
                        {/* Dynamic Action Icon */}
                        <div
                          className="flex-shrink-0 text-[#EC5137] flex items-center"
                          title={currentAction?.label || "Interaction"}
                        >
                          <Icon
                            icon={
                              currentAction?.icon ||
                              "fluent:zoom-in-32-regular"
                            }
                            className="text-[1.15vw]"
                          />
                        </div>

                        {/* Action selector dropdown */}
                        <ActionDropdown
                          item={item}
                          currentAction={currentAction}
                          actionTypes={actionTypes}
                          isDropdownOpen={isDropdownOpen}
                          setOpenDropdownId={setOpenDropdownId}
                          updateElementAttribute={updateElementAttribute}
                          activePageIndex={activePageIndex}
                          setCardActionOverrides={setCardActionOverrides}
                          setItemValueOverrides={setItemValueOverrides}
                          setLocalInputValues={setLocalInputValues}
                          setTooltipSettingsOverrides={
                            setTooltipSettingsOverrides
                          }
                          isCollapsed={isCollapsed}
                          onExpandAccordion={() => {
                            if (isLocked) return;
                            selectItemAndHighlight();
                            setExpandedCardId(item.id);
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-[0.5vw]">
                        {isLocked && (
                          <span
                            className="text-[0.62vw] font-semibold px-[0.5vw] py-[0.12vw] rounded-full border leading-normal select-none bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-[0.2vw]"
                            title="Layer is locked"
                          >
                            <Lock size="0.6vw" /> Locked
                          </span>
                        )}
                        {targetTypeBadge && (
                          <span
                            className={`text-[0.62vw] font-semibold px-[0.55vw] py-[0.12vw] rounded-full border leading-normal select-none ${targetTypeBadge.bg}`}
                          >
                            {targetTypeBadge.label}
                          </span>
                        )}

                        {/* Collapse/Expand Toggle Chevron */}
                        <div className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors p-[0.2vw]">
                          <ChevronDown
                            size="0.85vw"
                            className={`transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Row */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transitionEnd: { overflow: "visible" },
                        }}
                        exit={{ height: 0, opacity: 0, overflow: "hidden" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-gradient-to-b from-gray-50/40 to-transparent"
                        style={
                          isCardDropdownOpen
                            ? { overflow: "visible" }
                            : undefined
                        }
                      >
                        <div className="w-full border-t border-gray-100/60"></div>

                        {item.isHotspot && (
                          <div className="px-[1.6vw] pt-[2vh] pb-[0.5vh]">
                            <div className="w-full h-[12vh] border border-gray-200 rounded-[0.5vw] bg-white flex items-center justify-center relative shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                              {/* Edit Button */}
                              <div
                                className="absolute top-[0.6vw] right-[0.6vw] w-[1.8vw] h-[1.8vw] bg-white border border-gray-200 rounded-[0.3vw] shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingHotspotId(item.id);
                                }}
                              >
                                <Icon
                                  icon="lucide:edit"
                                  className="text-gray-500 text-[0.9vw]"
                                />
                              </div>

                              {/* Icon Preview */}
                              {item.previewHtml || item.hotspotHtml ? (
                                <div className="w-[8vw] h-[4.5vw] flex items-center justify-center overflow-hidden pointer-events-none">
                                  <svg
                                    className="w-full h-full"
                                    viewBox={
                                      item.previewBBox ||
                                      item.hotspotBBox ||
                                      "0 0 48 48"
                                    }
                                    preserveAspectRatio="xMidYMid meet"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        item.previewHtml || item.hotspotHtml,
                                    }}
                                  />
                                </div>
                              ) : item.hotspotIconSrc ? (
                                <img
                                  src={item.hotspotIconSrc}
                                  alt="hotspot"
                                  className="w-[4.5vw] h-[4.5vw] object-contain pointer-events-none"
                                />
                              ) : (
                                <div className="w-[4.5vw] h-[4.5vw] flex items-center justify-center rounded-full bg-[#EFF6FF] border-[0.15vw] border-[#BFDBFE]">
                                  <Icon
                                    icon="ph:link-bold"
                                    className="text-[#3B82F6] text-[2.2vw]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex flex-col gap-[1.5vh] w-full ${resolvedActionId === "slideshow" ? "px-[1.2vw]" : "px-[1.6vw]"} ${["open-link", "whatsapp", "email", "navigate-to", "call", "slideshow", "zoom", "info-box", "download", "popup", "3d-viewer", "ar-view", "audio"].includes(resolvedActionId) ? (item.isHotspot ? "pt-[1vh] pb-[1.5vh]" : "pt-[1vh] pb-[1.5vh]") : "pt-[4vh] pb-[4vh]"}`}
                        >
                          <div className="flex items-start gap-[0.5vw] w-full">
                            {(() => {
                              if (item.isHotspot) return null;
                              if (
                                [
                                  "open-link",
                                  "whatsapp",
                                  "email",
                                  "navigate-to",
                                  "call",
                                  "slideshow",
                                  "zoom",
                                  "info-box",
                                  "download",
                                  "popup",
                                  "3d-viewer",
                                  "ar-view",
                                  "audio",
                                ].includes(resolvedActionId)
                              )
                                return null;

                              const labelMarginClass = [
                                "audio",
                                "zoom",
                              ].includes(resolvedActionId)
                                ? "mt-[3.5vh]"
                                : resolvedActionId === "tooltip"
                                  ? "mt-[1.6vh]"
                                  : resolvedActionId === "call"
                                    ? "mt-[0.1vh]"
                                    : "mt-0";

                              const hasAudioFile =
                                resolvedActionId === "audio" && !!resolvedValue;
                              const shouldStretchArrow =
                                resolvedActionId === "tooltip" || hasAudioFile;

                              return (
                                <>
                                  <div
                                    className={`flex items-center transition-all duration-300 flex-shrink-0 ${labelMarginClass}`}
                                  >
                                    <div className="h-[4vh] px-[0.8vw] bg-[#F3F4F6] rounded-[0.5vw] flex items-center justify-center max-w-[7vw] overflow-hidden">
                                      <span className="text-[0.75vw] text-gray-600 font-medium truncate">
                                        {item.label}
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    className={`flex items-center text-[#9CA3AF] transition-all duration-300 ${shouldStretchArrow ? "flex-1 mx-[0.5vw]" : "flex-shrink-0 ml-[0.5vw] mr-[0.2vw] w-[1.6vw]"} ${labelMarginClass} h-[4vh]`}
                                  >
                                    <svg
                                      width="100%"
                                      height="2"
                                      className={`${shouldStretchArrow ? "flex-1" : "w-full"} mr-[-1px]`}
                                      preserveAspectRatio="none"
                                    >
                                      <line
                                        x1="0"
                                        y1="1"
                                        x2="100%"
                                        y2="1"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 4"
                                      />
                                    </svg>
                                    <svg
                                      width="0.6vw"
                                      height="0.8vw"
                                      viewBox="0 0 8 12"
                                      fill="none"
                                      className="flex-shrink-0"
                                    >
                                      <path
                                        d="M1 2l6 4-6 4"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </div>
                                </>
                              );
                            })()}

                            {resolvedActionId === "navigate-to" ? (
                              <NavigateToAction
                                activePageIndex={activePageIndex}
                                dropdownDirectionOverrides={dropdownDirectionOverrides}
                                item={item}
                                openDropdownId={openDropdownId}
                                pages={pages}
                                resolvedValue={resolvedValue}
                                setDropdownDirectionOverrides={setDropdownDirectionOverrides}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "info-box" ? (
                              <InfoBoxAction
                                activePageIndex={activePageIndex}
                                dropdownDirectionOverrides={dropdownDirectionOverrides}
                                item={item}
                                openDropdownId={openDropdownId}
                                resolvedValue={resolvedValue}
                                setDropdownDirectionOverrides={setDropdownDirectionOverrides}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "download" ? (
                              <DownloadAction
                                activePageIndex={activePageIndex}
                                item={item}
                                openDropdownId={openDropdownId}
                                resolvedValue={resolvedValue}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                setUploadingItems={setUploadingItems}
                                updateElementAttribute={updateElementAttribute}
                                uploadingItems={uploadingItems}
                                user={user}
                              />
                            ) : resolvedActionId === "audio" ? (
                              <AudioAction
                                activeAudioRef={activeAudioRef}
                                activePageIndex={activePageIndex}
                                audioPlaybackTimes={audioPlaybackTimes}
                                audioProgressPercent={audioProgressPercent}
                                audioSourceMode={audioSourceMode}
                                effectiveBook={effectiveBook}
                                effectiveFolder={effectiveFolder}
                                effectiveVId={effectiveVId}
                                handleAudioSeek={handleAudioSeek}
                                handleCancelRecording={handleCancelRecording}
                                handleSaveRecordedAudio={handleSaveRecordedAudio}
                                handleStartRecording={handleStartRecording}
                                handleStopRecording={handleStopRecording}
                                handleTogglePauseResumeRecording={handleTogglePauseResumeRecording}
                                handleTogglePlayAudio={handleTogglePlayAudio}
                                isRecordingPaused={isRecordingPaused}
                                item={item}
                                openDropdownId={openDropdownId}
                                playingAudioId={playingAudioId}
                                recordedDataMap={recordedDataMap}
                                recordedPreviewPlaying={recordedPreviewPlaying}
                                recordingItemId={recordingItemId}
                                recordingMillis={recordingMillis}
                                recordingWaveform={recordingWaveform}
                                resolvedValue={resolvedValue}
                                setAudioSourceMode={setAudioSourceMode}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                setPlayingAudioId={setPlayingAudioId}
                                setUploadingItems={setUploadingItems}
                                updateElementAttribute={updateElementAttribute}
                                uploadingItems={uploadingItems}
                                user={user}
                              />
                            ) : resolvedActionId === "call" ? (
                              <CallAction
                                activePageIndex={activePageIndex}
                                item={item}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "slideshow" ? (
                              <SlideshowAction
                                activePageIndex={activePageIndex}
                                dropdownDirectionOverrides={dropdownDirectionOverrides}
                                isCompressingInteractionSlideshow={isCompressingInteractionSlideshow}
                                item={item}
                                itemValueOverrides={itemValueOverrides}
                                openDropdownId={openDropdownId}
                                resolveSlideshowImageUrl={resolveSlideshowImageUrl}
                                resolvedValue={resolvedValue}
                                setActiveSlideshowItem={setActiveSlideshowItem}
                                setDropdownDirectionOverrides={setDropdownDirectionOverrides}
                                setIsCompressingInteractionSlideshow={setIsCompressingInteractionSlideshow}
                                setIsSlideshowGalleryOpen={setIsSlideshowGalleryOpen}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                setSlideshowDragIdx={setSlideshowDragIdx}
                                setSlideshowDragOverIdx={setSlideshowDragOverIdx}
                                slideshowDragIdx={slideshowDragIdx}
                                slideshowDragOverIdx={slideshowDragOverIdx}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "popup" ? (
                              <PopupAction
                                activePageIndex={activePageIndex}
                                item={item}
                                onCustomizePopup={onCustomizePopup}
                                openDropdownId={openDropdownId}
                                popupCustomHtmlOverrides={popupCustomHtmlOverrides}
                                resolvedValue={resolvedValue}
                                setActiveTemplateSelectionId={setActiveTemplateSelectionId}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                setPopupCustomHtmlOverrides={setPopupCustomHtmlOverrides}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : (resolvedActionId === "3d-viewer" || resolvedActionId === "ar-view") ? (
                              <ThreeDViewerAction
                                activePageIndex={activePageIndex}
                                interactionType={resolvedActionId}
                                item={item}
                                openDropdownId={openDropdownId}
                                resolvedValue={resolvedValue}
                                setActive3DGalleryItem={setActive3DGalleryItem}
                                setAlertState={setAlertState}
                                setCurrent3DItem={setCurrent3DItem}
                                setIs3DModalOpen={setIs3DModalOpen}
                                setItemValueOverrides={setItemValueOverrides}
                                setOpenDropdownId={setOpenDropdownId}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "zoom" ? (
                              <ZoomAction
                                activePageIndex={activePageIndex}
                                item={item}
                                resolvedValue={resolvedValue}
                                setItemValueOverrides={setItemValueOverrides}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "open-link" ? (
                              <OpenLinkAction
                                activePageIndex={activePageIndex}
                                dropdownDirectionOverrides={dropdownDirectionOverrides}
                                item={item}
                                linkBehaviorOverrides={linkBehaviorOverrides}
                                localInputValues={localInputValues}
                                openDropdownId={openDropdownId}
                                resolvedValue={resolvedValue}
                                setDropdownDirectionOverrides={setDropdownDirectionOverrides}
                                setLinkBehaviorOverrides={setLinkBehaviorOverrides}
                                setLocalInputValues={setLocalInputValues}
                                setOpenDropdownId={setOpenDropdownId}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : resolvedActionId === "whatsapp" ? (
                              <WhatsAppAction
                                activePageIndex={activePageIndex}
                                dropdownDirectionOverrides={dropdownDirectionOverrides}
                                item={item}
                                linkBehaviorOverrides={linkBehaviorOverrides}
                                localInputValues={localInputValues}
                                openDropdownId={openDropdownId}
                                resolvedValue={resolvedValue}
                                setDropdownDirectionOverrides={setDropdownDirectionOverrides}
                                setLinkBehaviorOverrides={setLinkBehaviorOverrides}
                                setLocalInputValues={setLocalInputValues}
                                setOpenDropdownId={setOpenDropdownId}
                                setWhatsappMessageOverrides={setWhatsappMessageOverrides}
                                updateElementAttribute={updateElementAttribute}
                                whatsappMessageOverrides={whatsappMessageOverrides}
                              />
                            ) : resolvedActionId === "email" ? (
                              <EmailAction
                                activePageIndex={activePageIndex}
                                item={item}
                                linkBehaviorOverrides={linkBehaviorOverrides}
                                localInputValues={localInputValues}
                                resolvedValue={resolvedValue}
                                setLinkBehaviorOverrides={setLinkBehaviorOverrides}
                                setLocalInputValues={setLocalInputValues}
                                updateElementAttribute={updateElementAttribute}
                              />
                            ) : (
                              <div className="flex-1 h-[4vh] border border-gray-400 rounded-[0.5vw] flex items-center px-[0.8vw] bg-white overflow-hidden">
                                <input
                                  type="text"
                                  placeholder={
                                    resolvedActionId === "email"
                                      ? "Enter Email Address..."
                                      : "Enter URL..."
                                  }
                                  value={
                                    localInputValues[item.id] !== undefined
                                      ? localInputValues[item.id]
                                      : resolvedValue || ""
                                  }
                                  className="w-full text-[0.8vw] text-gray-700 placeholder-gray-400 bg-transparent outline-none truncate"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalInputValues((prev) => ({
                                      ...prev,
                                      [item.id]: val,
                                    }));
                                  }}
                                  onBlur={() => {
                                    const val = localInputValues[item.id];
                                    if (
                                      val !== undefined &&
                                      val !== resolvedValue
                                    ) {
                                      if (updateElementAttribute) {
                                        const targetIdx =
                                          item.pageIndex !== undefined
                                            ? item.pageIndex
                                            : activePageIndex;
                                        updateElementAttribute(
                                          targetIdx,
                                          item.id,
                                          {
                                            "data-interaction":
                                              resolvedActionId,
                                            "data-interaction-value": val,
                                          },
                                        );
                                      }
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.target.blur();
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Tooltip extra options removed */}

                          {/* Popup extra options */}
                          {resolvedActionId === "popup" && (
                            <PopupExtraOptions
                              activePageIndex={activePageIndex}
                              dropdownDirectionOverrides={dropdownDirectionOverrides}
                              item={item}
                              itemValueOverrides={itemValueOverrides}
                              openDropdownId={openDropdownId}
                              setDropdownDirectionOverrides={setDropdownDirectionOverrides}
                              setItemValueOverrides={setItemValueOverrides}
                              setOpenDropdownId={setOpenDropdownId}
                              updateElementAttribute={updateElementAttribute}
                            />
                          )}
                        </div>

                        {/* Card Footer (Highlight Component & Trash) */}
                        <div className="flex items-center justify-between select-none bg-gray-50/70 border-t border-gray-100 px-[0.8vw] py-[0.6vw] rounded-b-[0.6vw]">
                          {(() => {
                            const isHotspotItem = Boolean(
                              item.isHotspot ||
                              item.id?.toLowerCase().includes("hotspot"),
                            );
                            const isChecked =
                              !isHotspotItem &&
                              (highlightOverrides[item.id] !== undefined
                                ? highlightOverrides[item.id]
                                : item["data-show-highlight"] !== "false");

                            return (
                              <div
                                className={`flex items-center gap-[0.5vw] select-none ${
                                  isHotspotItem
                                    ? "cursor-not-allowed opacity-60"
                                    : "cursor-pointer group"
                                }`}
                                title={
                                  isHotspotItem
                                    ? "Highlight interaction is disabled for hotspots"
                                    : undefined
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isHotspotItem) return;

                                  const isCurrentlyOn =
                                    highlightOverrides[item.id] !== undefined
                                      ? highlightOverrides[item.id]
                                      : item["data-show-highlight"] !== "false"; // Default to true

                                  setHighlightOverrides((prev) => ({
                                    ...prev,
                                    [item.id]: !isCurrentlyOn,
                                  }));

                                  const targetIdx =
                                    item.pageIndex !== undefined
                                      ? item.pageIndex
                                      : activePageIndex;
                                  if (updateElementAttribute) {
                                    updateElementAttribute(targetIdx, item.id, {
                                      "data-show-highlight":
                                        (!isCurrentlyOn).toString(),
                                    });
                                  }
                                }}
                              >
                                <div
                                  className={`w-[1.1vw] h-[1.1vw] flex-shrink-0 flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? "rounded-[0.3vw] bg-[#EC5137] border-[#EC5137]"
                                      : isHotspotItem
                                        ? "rounded-[0.3vw] border-gray-200 bg-gray-100"
                                        : "rounded-[0.3vw] border-gray-300 bg-white group-hover:border-[#EC5137]"
                                  }`}
                                >
                                  {isChecked && (
                                    <Icon
                                      icon="lucide:check"
                                      className="text-white text-[0.8vw] stroke-[3]"
                                    />
                                  )}
                                </div>
                                <span
                                  className={`text-[0.8vw] font-medium transition-colors ${
                                    isChecked
                                      ? "text-gray-700"
                                      : isHotspotItem
                                        ? "text-gray-400"
                                        : "text-gray-500 group-hover:text-gray-700"
                                  }`}
                                >
                                  Highlight in preview
                                </span>
                              </div>
                            );
                          })()}

                          {/* Trash Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const targetIdx =
                                item.pageIndex !== undefined
                                  ? item.pageIndex
                                  : activePageIndex;

                              // Check if it's a Free Frame
                              const editorDoc =
                                document.getElementById("main-flipbook-editor")
                                  ?.contentDocument || document;
                              const activeContainer = editorDoc.querySelector(
                                `.page-svg-container[data-page-index="${activePageIndex}"]`,
                              );
                              const frameEl = activeContainer
                                ? activeContainer.querySelector(
                                    `[id="${CSS.escape(item.id)}"]`,
                                  )
                                : editorDoc.getElementById(item.id);
                              const isFreeFrame =
                                frameEl &&
                                (frameEl.getAttribute("data-type") ===
                                  "free-frame" ||
                                  frameEl
                                    .getAttribute("data-name")
                                    ?.toLowerCase() === "free frame");
                              const isHotspot =
                                item.isHotspot ||
                                (frameEl &&
                                  frameEl.getAttribute("data-is-hotspot") ===
                                    "true");

                              if ((isFreeFrame || isHotspot) && deleteLayer) {
                                deleteLayer(targetIdx, item.id);
                              } else {
                                if (frameEl) {
                                  frameEl.removeAttribute("data-interaction");
                                  frameEl.removeAttribute(
                                    "data-interaction-value",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-intent",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-config",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-slideshow-effect",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-slideshow-speed",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-popup-custom-html",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-popup-animation",
                                  );
                                  frameEl.removeAttribute(
                                    "data-interaction-popup-speed",
                                  );
                                  frameEl.removeAttribute(
                                    "data-tooltip-settings",
                                  );
                                }

                                if (updateElementAttribute) {
                                  updateElementAttribute(targetIdx, item.id, {
                                    "data-interaction": null,
                                    "data-interaction-value": null,
                                    "data-interaction-intent": null,
                                    "data-interaction-config": null,
                                    "data-interaction-slideshow-effect": null,
                                    "data-interaction-slideshow-speed": null,
                                    "data-interaction-popup-custom-html": null,
                                    "data-interaction-popup-animation": null,
                                    "data-interaction-popup-speed": null,
                                    "data-tooltip-settings": null,
                                  });
                                }
                                window.dispatchEvent(
                                  new CustomEvent("select-layer", {
                                    detail: { layerId: null },
                                  }),
                                );

                                setItemValueOverrides((prev) => {
                                  const next = { ...prev };
                                  delete next[item.id];
                                  return next;
                                });
                                setCardActionOverrides((prev) => {
                                  const next = { ...prev };
                                  delete next[item.id];
                                  return next;
                                });
                              }

                              setOpenCardIds((prev) => {
                                const next = { ...prev };
                                delete next[item.id];
                                return next;
                              });

                              // Fire event to notify listeners that interaction was removed
                              window.dispatchEvent(
                                new CustomEvent("interaction-removed", {
                                  detail: { id: item.id, pageIndex: targetIdx },
                                }),
                              );

                              // Fire event to reset canvas badge visual state
                              window.dispatchEvent(
                                new CustomEvent("update-interaction-badge", {
                                  detail: {
                                    elementId: item.id,
                                    actionType: null,
                                  },
                                }),
                              );
                            }}
                            className={
                              resolvedActionId === "slideshow"
                                ? "text-zinc-400 hover:text-red-400 transition-colors p-[0.2vw] cursor-pointer"
                                : "text-gray-400 hover:text-red-500 transition-colors p-[0.2vw] cursor-pointer"
                            }
                            title="Delete interaction"
                          >
                            <Icon
                              icon="lucide:trash-2"
                              className="text-[1.05vw]"
                            />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center text-[0.8vw] text-gray-400 py-[2vh]">
              No interactions on this page
            </div>
          )}
        </div>
      </div>

      {/* Popup Template Selection Gallery Modal */}
      <PopupTemplateGalleryModal
        activePageIndex={activePageIndex}
        activeTemplateSelectionId={activeTemplateSelectionId}
        interactiveElementsList={interactiveElementsList}
        itemValueOverrides={itemValueOverrides}
        onCustomizePopup={onCustomizePopup}
        setActiveTemplateSelectionId={setActiveTemplateSelectionId}
        setItemValueOverrides={setItemValueOverrides}
        setPopupCustomHtmlOverrides={setPopupCustomHtmlOverrides}
        updateElementAttribute={updateElementAttribute}
      />

      {/* 3D Gallery Modal */}
      <ThreeDGalleryModal
        active3DGalleryItem={active3DGalleryItem}
        activePageIndex={activePageIndex}
        setActive3DGalleryItem={setActive3DGalleryItem}
        setItemValueOverrides={setItemValueOverrides}
        updateElementAttribute={updateElementAttribute}
      />

      {/* Slideshow Image Gallery Modal */}
      <SlideshowGalleryModal
        activePageIndex={activePageIndex}
        activeSlideshowItem={activeSlideshowItem}
        isSlideshowGalleryOpen={isSlideshowGalleryOpen}
        itemValueOverrides={itemValueOverrides}
        setActiveSlideshowItem={setActiveSlideshowItem}
        setIsSlideshowGalleryOpen={setIsSlideshowGalleryOpen}
        setItemValueOverrides={setItemValueOverrides}
        updateElementAttribute={updateElementAttribute}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        showCancel={alertState.showCancel}
        confirmText={alertState.confirmText || "Okay"}
        cancelText={alertState.cancelText || "Cancel"}
        onConfirm={alertState.onConfirm}
      />

      {editingHotspotId &&
        (() => {
          const item = interactiveElementsList.find(
            (i) => i.id === editingHotspotId,
          );

          // Helper to get default color based on action type or icon src
          const getDefaultBgColor = (actionId, iconSrc) => {
            if (iconSrc) {
              const lowerSrc = iconSrc.toLowerCase();
              if (lowerSrc.includes("youtube") || lowerSrc.includes("yotube"))
                return "#FF0000";
              if (lowerSrc.includes("instagram"))
                return "linear-gradient(45deg, rgba(255, 221, 85, 1) 0%, rgba(255, 84, 62, 1) 50%, rgba(200, 55, 171, 1) 100%)";
              if (lowerSrc.includes("facebook")) return "#3D5A98";
              if (lowerSrc.includes("linkedin")) return "#0A66C2";
              if (lowerSrc.includes("whatsapp")) return "#25D366";
              if (lowerSrc.includes("x.svg") || lowerSrc.includes("twitter"))
                return "#000000";
              if (lowerSrc.includes("slideshow")) return "#22C55E";
              if (lowerSrc.includes("popup")) return "#14B8A6";
              if (lowerSrc.includes("call")) return "#19B2AB";
              if (lowerSrc.includes("download")) return "#F3326A";
            }
            const colorMap = {
              whatsapp: "#34A853",
              instagram:
                "linear-gradient(45deg, rgba(255, 221, 85, 1) 0%, rgba(255, 84, 62, 1) 50%, rgba(200, 55, 171, 1) 100%)",
              youtube: "#FF0000",
              email: "#F97316",
              location: "#F97316",
              facebook: "#3D5A98",
              linkedin: "#0A66C2",
              x: "#000000",
              "navigate-to": "#8B5CF6",
              slideshow: "#22C55E",
              popup: "#14B8A6",
              call: "#19B2AB",
              download: "#F3326A",
              "info-box": "#000000",
            };
            return colorMap[actionId] || "#359CFD";
          };

          return (
            <HotspotCustomizationPopup
              isOpen={true}
              onClose={() => setEditingHotspotId(null)}
              initialData={{
                preset:
                  item?.presetId ||
                  (item?.isInteractiveButton
                    ? "interactive-button"
                    : "preset3"),
                iconColor: item?.iconColor || "#FFFFFF",
                bgColor:
                  item?.bgColor ||
                  getDefaultBgColor(
                    item?.presetId || item?.actionId,
                    item?.hotspotIconSrc,
                  ),
                iconStyle: "style1",
                src: item?.hotspotIconSrc || null,
                actionId: item?.actionId,
                hotspotHtml: item?.previewHtml || item?.hotspotHtml || null,
                hotspotBBox: item?.previewBBox || item?.hotspotBBox || null,
              }}
              onSave={(data) => {
                if (!item) return;
                const html =
                  data.customHtml ||
                  generateHotspotSVG(
                    data.preset,
                    data.bgColor,
                    data.iconColor,
                    data.src,
                  );
                window.dispatchEvent(
                  new CustomEvent("update-hotspot-style", {
                    detail: {
                      id: item.id,
                      pageIndex: item.pageIndex,
                      presetId: data.preset,
                      iconSrc: data.src,
                      html: html,
                      bgColor: data.bgColor,
                      iconColor: data.iconColor,
                    },
                  }),
                );
              }}
            />
          );
        })()}
    </div>
  );
};

export default React.memo(InteractionPanel);
