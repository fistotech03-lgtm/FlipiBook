import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Trash2, ChevronDown, ChevronsLeft, Upload } from "lucide-react";
import axios from "axios";
import PremiumDropdown from "../../components/PremiumDropdown";
import AlertModal from "../../../AlertModal";
import {
  AdjustmentSlider,
  ImageCropOverlay,
  CustomColorPicker,
} from "../../AppearanceShared";
import ReplaceMediaModal from "../../../PageEditor/modals/ReplaceMediaModal";
import { useAuth } from "../../../../context/AuthContext";
import { fontFamilies } from "../../utils/fontConstants";
import { getLogoAnimationStyle } from "../../components/PreloaderOverlay";

const Branding = ({
  logoSettings,
  onUpdateLogo,
  watermarkSettings,
  onUpdateWatermark,
  preloaderSettings,
  onUpdatePreloader,
  onBack,
  folder,
  flipbookName,
  v_id,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const watermarkFileInputRef = useRef(null);
  const platformWatermarkFileInputRef = useRef(null);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const [showPreloaderBgColorPicker, setShowPreloaderBgColorPicker] =
    useState(false);
  const [showPreloaderTextColorPicker, setShowPreloaderTextColorPicker] =
    useState(false);
  const [showPreloaderSpinnerColorPicker, setShowPreloaderSpinnerColorPicker] =
    useState(false);
  const galleryInputRef = useRef(null);
  const [galleryTarget, setGalleryTarget] = useState(null); // 'logo', 'watermark', or null
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showCropOverlay, setShowCropOverlay] = useState(false);
  const [showWatermarkCropOverlay, setShowWatermarkCropOverlay] =
    useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replaceTarget, setReplaceTarget] = useState(null); // 'logo' | 'watermark' | null
  const [showLogoAdjustments, setShowLogoAdjustments] = useState(false);
  const [showPreloaderModal, setShowPreloaderModal] = useState(false);
  const [tempPreloaderSettings, setTempPreloaderSettings] = useState({});
  const panelRef = useRef(null);
  const [modalLeft, setModalLeft] = useState("calc(37.5vw + 12px)");

  useEffect(() => {
    const updateModalPosition = () => {
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        if (rect.right > 0) {
          setModalLeft(`${rect.right + 12}px`);
        }
      }
    };
    if (showPreloaderModal) {
      updateModalPosition();
      requestAnimationFrame(updateModalPosition);
    }
    window.addEventListener("resize", updateModalPosition);
    return () => window.removeEventListener("resize", updateModalPosition);
  }, [showPreloaderModal]);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showAnimDropdown, setShowAnimDropdown] = useState(false);
  const styleDropdownRef = useRef(null);
  const animDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target)) {
        setShowStyleDropdown(false);
      }
      if (animDropdownRef.current && !animDropdownRef.current.contains(e.target)) {
        setShowAnimDropdown(false);
      }
    };
    if (showStyleDropdown || showAnimDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStyleDropdown, showAnimDropdown]);

  const handleOpenPreloaderModal = () => {
    const cur = preloaderSettings || {};
    const existingOption = cur.displayOption || (
      cur.layout === "logo-only"
        ? "logo-only"
        : (cur.logo ? "both" : "preloader-only")
    );
    const rawText = cur.text;
    const resolvedText = (!rawText ||
      rawText === "Loading Modal Please Wait...." ||
      rawText === "Loading Flipbook Please Wait...." ||
      rawText === "Preparing Flipbook...")
        ? "Preparing Flipibook"
        : rawText;

    setTempPreloaderSettings({
      enabled: true,
      isCustom: cur.isCustom === true,
      displayOption: existingOption,
      layout: cur.layout === "logo-only" ? "spinner" : (cur.layout || "spinner"),
      logoAnimation: cur.logoAnimation || "fade",
      spinnerColor: (!cur.spinnerColor || cur.spinnerColor === "#3B3C8A") ? "#E04752" : cur.spinnerColor,
      bgColor: (!cur.bgColor || cur.bgColor === "#D6E0F4") ? "#22252A" : cur.bgColor,
      textColor: cur.textColor || "#ffffff",
      showPercentage: false,
      showText: cur.showText !== undefined ? cur.showText : true,
      textPosition: cur.textPosition || "bottom",
      logoSize: cur.logoSize !== undefined ? cur.logoSize : 100,
      font: cur.font || "Poppins",
      fontSize: cur.fontSize || "14",
      logo: cur.logo || "",
      text: resolvedText,
    });
    setShowPreloaderModal(true);
  };
  // Load gallery images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem("customized_editor_gallery");
    if (savedImages) {
      try {
        setUploadedImages(JSON.parse(savedImages));
      } catch (e) {
        console.error("Failed to load gallery images", e);
      }
    }
  }, []);

  // Save gallery images to localStorage when updated
  useEffect(() => {
    if (uploadedImages.length > 0) {
      try {
        localStorage.setItem(
          "customized_editor_gallery",
          JSON.stringify(uploadedImages),
        );
      } catch (e) {
        console.warn(
          "localStorage quota exceeded for branding gallery images",
          e,
        );
      }
    }
  }, [uploadedImages]);

  const [localGallerySelected, setLocalGallerySelected] = useState(null);

  const [logoResolution, setLogoResolution] = useState("");
  const [logoFileSize, setLogoFileSize] = useState("");
  const [watermarkResolution, setWatermarkResolution] = useState("");
  const [watermarkFileSize, setWatermarkFileSize] = useState("");
  const [platformWatermarkResolution, setPlatformWatermarkResolution] = useState("");
  const [platformWatermarkFileSize, setPlatformWatermarkFileSize] = useState("");

  const formatBytes = (bytes, decimals = 1) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  useEffect(() => {
    if (!logoSettings?.src) {
      setLogoResolution("");
      setLogoFileSize("");
      return;
    }
    const img = new Image();
    img.src = logoSettings.src;
    img.onload = () => {
      setLogoResolution(`${img.naturalWidth} x ${img.naturalHeight}`);
    };

    if (logoSettings.src.startsWith("data:")) {
      const base64str = logoSettings.src.split(",")[1];
      if (base64str) {
        const bytes = Math.round(base64str.length * (3 / 4));
        setLogoFileSize(formatBytes(bytes, 1));
      }
    } else if (logoSettings.src.startsWith("blob:")) {
      fetch(logoSettings.src)
        .then((res) => res.blob())
        .then((blob) => setLogoFileSize(formatBytes(blob.size, 1)))
        .catch(() => setLogoFileSize("Unknown Size"));
    } else {
      fetch(logoSettings.src, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            const contentLength = res.headers.get("content-length");
            if (contentLength) {
              setLogoFileSize(formatBytes(parseInt(contentLength, 10), 1));
            } else {
              setLogoFileSize("Unknown Size");
            }
          } else {
            setLogoFileSize("Unknown Size");
          }
        })
        .catch(() => {
          setLogoFileSize("Unknown Size");
        });
    }
  }, [logoSettings?.src]);

  useEffect(() => {
    if (!watermarkSettings?.src) {
      setWatermarkResolution("");
      setWatermarkFileSize("");
      return;
    }
    const img = new Image();
    img.src = watermarkSettings.src;
    img.onload = () => {
      setWatermarkResolution(`${img.naturalWidth} x ${img.naturalHeight}`);
    };

    if (watermarkSettings.src.startsWith("data:")) {
      const base64str = watermarkSettings.src.split(",")[1];
      if (base64str) {
        const bytes = Math.round(base64str.length * (3 / 4));
        setWatermarkFileSize(formatBytes(bytes, 1));
      }
    } else if (watermarkSettings.src.startsWith("blob:")) {
      fetch(watermarkSettings.src)
        .then((res) => res.blob())
        .then((blob) => setWatermarkFileSize(formatBytes(blob.size, 1)))
        .catch(() => setWatermarkFileSize("Unknown Size"));
    } else {
      fetch(watermarkSettings.src, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            const contentLength = res.headers.get("content-length");
            if (contentLength) {
              setWatermarkFileSize(formatBytes(parseInt(contentLength, 10), 1));
            } else {
              setWatermarkFileSize("Unknown Size");
            }
          } else {
            setWatermarkFileSize("Unknown Size");
          }
        })
        .catch(() => {
          setWatermarkFileSize("Unknown Size");
        });
    }
  }, [watermarkSettings?.src]);

  const platformWatermark = watermarkSettings?.platformWatermark;

  useEffect(() => {
    if (!platformWatermark?.src) {
      setPlatformWatermarkResolution("");
      setPlatformWatermarkFileSize("");
      return;
    }
    const img = new Image();
    img.src = platformWatermark.src;
    img.onload = () => {
      setPlatformWatermarkResolution(`${img.naturalWidth} X ${img.naturalHeight}`);
    };

    if (platformWatermark.src.startsWith("data:")) {
      const base64str = platformWatermark.src.split(",")[1];
      if (base64str) {
        const bytes = Math.round(base64str.length * (3 / 4));
        setPlatformWatermarkFileSize(formatBytes(bytes, 1));
      }
    } else if (platformWatermark.src.startsWith("blob:")) {
      fetch(platformWatermark.src)
        .then((res) => res.blob())
        .then((blob) => setPlatformWatermarkFileSize(formatBytes(blob.size, 1)))
        .catch(() => setPlatformWatermarkFileSize("Unknown Size"));
    } else {
      fetch(platformWatermark.src, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            const contentLength = res.headers.get("content-length");
            if (contentLength) {
              setPlatformWatermarkFileSize(formatBytes(parseInt(contentLength, 10), 1));
            } else {
              setPlatformWatermarkFileSize("Unknown Size");
            }
          } else {
            setPlatformWatermarkFileSize("Unknown Size");
          }
        })
        .catch(() => {
          setPlatformWatermarkFileSize("Unknown Size");
        });
    }
  }, [platformWatermark?.src]);

  const uploadCustomizedAsset = async (file, assetType) => {
    try {
      if (file) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        const formData = new FormData();
        formData.append("action", "upload");
        formData.append("file", file);
        if (user?.emailId || user?.email)
          formData.append("emailId", user?.emailId || user?.email);
        if (user?.userId || user?._id || user?.id)
          formData.append("userId", user?.userId || user?._id || user?.id);
        if (user?.userID) formData.append("customUserId", user?.userID);
        formData.append("assetType", assetType);
        formData.append("folderName", folder || "My_Flipbooks");
        formData.append(
          "flipbookName",
          flipbookName || v_id || "Untitled Document",
        );
        if (v_id) formData.append("v_id", v_id);
        if (assetType === "logo" && logoSettings?.src) {
          formData.append("oldSrc", logoSettings.src);
        } else if (assetType === "watermark" && watermarkSettings?.src) {
          formData.append("oldSrc", watermarkSettings.src);
        } else if (assetType === "platformWatermark" && watermarkSettings?.platformWatermark?.src) {
          formData.append("oldSrc", watermarkSettings.platformWatermark.src);
        }

        const res = await axios.post(
          `${backendUrl}/api/flipbook/branding`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );
        if (res.data?.url) {
          return res.data.url;
        }
      }
    } catch (err) {
      console.warn(`[Branding] ${assetType} upload warning:`, err);
    }
    return null;
  };

  const handleLogoReplace = async (file) => {
    if (!file) return;
    const uploadedUrl = await uploadCustomizedAsset(file, "logo");
    if (uploadedUrl) {
      onUpdateLogo({
        ...logoSettings,
        src: uploadedUrl,
        opacity: logoSettings?.opacity ?? 100,
        adjustments: logoSettings?.adjustments ?? {
          exposure: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
        },
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateLogo({
        ...logoSettings,
        src: event.target.result,
        opacity: logoSettings?.opacity ?? 100,
        adjustments: logoSettings?.adjustments ?? {
          exposure: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePreloaderLogoReplace = async (file) => {
    if (!file) return;
    const uploadedUrl = await uploadCustomizedAsset(file, "preloaderLogo");
    if (uploadedUrl) {
      setTempPreloaderSettings((prev) => ({
        ...prev,
        logo: uploadedUrl,
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setTempPreloaderSettings((prev) => ({
        ...prev,
        logo: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePlatformWatermarkReplace = async (file) => {
    if (!file) return;
    const uploadedUrl = await uploadCustomizedAsset(file, "platformWatermark");
    const fileName = file?.name || "Image Name.jpg";
    if (uploadedUrl) {
      onUpdateWatermark({
        ...watermarkSettings,
        platformWatermark: {
          ...(watermarkSettings?.platformWatermark || {}),
          src: uploadedUrl,
          name: fileName,
          opacity: watermarkSettings?.platformWatermark?.opacity ?? 100,
        },
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateWatermark({
        ...watermarkSettings,
        platformWatermark: {
          ...(watermarkSettings?.platformWatermark || {}),
          src: event.target.result,
          name: fileName,
          opacity: watermarkSettings?.platformWatermark?.opacity ?? 100,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkReplace = async (file) => {
    if (!file) return;
    const uploadedUrl = await uploadCustomizedAsset(file, "watermark");
    if (uploadedUrl) {
      onUpdateWatermark({
        ...watermarkSettings,
        src: uploadedUrl,
        opacity: watermarkSettings?.opacity ?? 64,
        position: watermarkSettings?.position || "Bottom Right",
        adjustments: watermarkSettings?.adjustments ?? {
          exposure: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
        },
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateWatermark({
        ...watermarkSettings,
        src: event.target.result,
        opacity: watermarkSettings?.opacity ?? 64,
        position: watermarkSettings?.position || "Bottom Right",
        adjustments: watermarkSettings?.adjustments ?? {
          exposure: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  // Logo Handlers
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadedUrl = await uploadCustomizedAsset(file, "logo");
      if (uploadedUrl) {
        onUpdateLogo({
          ...logoSettings,
          src: uploadedUrl,
          opacity: logoSettings?.opacity ?? 100,
          adjustments: logoSettings?.adjustments ?? {
            exposure: 0,
            contrast: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            highlights: 0,
            shadows: 0,
          },
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo({
          ...logoSettings,
          src: reader.result,
          opacity: logoSettings?.opacity ?? 100,
          adjustments: logoSettings?.adjustments ?? {
            exposure: 0,
            contrast: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            highlights: 0,
            shadows: 0,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmRemoveLogo = () => {
    setDeleteTarget("logo");
  };

  const deleteBrandingAsset = async (assetType) => {
    const isLogo = assetType === "logo";
    const isPlatform = assetType === "platformWatermark";
    const targetSettings = isLogo
      ? logoSettings
      : isPlatform
      ? watermarkSettings?.platformWatermark
      : watermarkSettings;
    const targetSrc = targetSettings?.src;

    if (targetSrc) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        await axios.post(
          `${backendUrl}/api/flipbook/branding`,
          {
            action: "delete",
            userId: user?.userId || user?._id || user?.id,
            customUserId: user?.userID,
            emailId: user?.emailId || user?.email,
            v_id: v_id,
            assetType: assetType,
            src: targetSrc,
            folderName: folder || "My_Flipbooks",
            flipbookName: flipbookName || v_id || "Untitled Document",
          },
          { withCredentials: true },
        );
      } catch (err) {
        console.warn(`[Branding] ${assetType} delete asset warning:`, err);
      }
    }

    if (isLogo) {
      onUpdateLogo({
        src: "",
        url: "",
        type: "Fit",
        opacity: 100,
        cropData: null,
        adjustments: {
          exposure: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
        },
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setDeleteTarget(null);
    } else if (isPlatform) {
      onUpdateWatermark({
        ...watermarkSettings,
        platformWatermark: {
          src: "",
          url: "",
          opacity: 100,
          name: "",
        },
      });
      if (platformWatermarkFileInputRef.current)
        platformWatermarkFileInputRef.current.value = "";
      setDeleteTarget(null);
    } else {
      onUpdateWatermark({
        ...watermarkSettings,
        src: "",
        type: "Fit",
        opacity: 64,
        position: "Bottom Right",
        cropData: null,
        adjustments: {
          exposure: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
        },
      });
      if (watermarkFileInputRef.current)
        watermarkFileInputRef.current.value = "";
      setDeleteTarget(null);
    }
  };

  const removeLogo = () => {
    deleteBrandingAsset("logo");
  };

  const removeWatermark = () => {
    deleteBrandingAsset("watermark");
  };

  const removePlatformWatermark = () => {
    deleteBrandingAsset("platformWatermark");
  };

  const handleAdjustmentChange = (key, value) => {
    onUpdateLogo({
      ...logoSettings,
      adjustments: {
        ...(logoSettings?.adjustments || {}),
        [key]: value,
      },
    });
  };

  const getLogoFilterStr = () => {
    const adj = logoSettings?.adjustments || {};
    const exposure = adj.exposure || 0;
    const contrast = adj.contrast || 0;
    const saturation = adj.saturation || 0;
    const temperature = adj.temperature || 0;
    const tint = adj.tint || 0;
    const highlights = (adj.highlights || 0) / 5;
    const shadows = (adj.shadows || 0) / 5;
    return `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) hue-rotate(${tint}deg) sepia(${temperature > 0 ? temperature : 0}%) brightness(${100 + highlights}%) contrast(${100 + shadows}%)`;
  };

  const getWatermarkFilterStr = () => {
    const adj = watermarkSettings?.adjustments || {};
    const exposure = adj.exposure || 0;
    const contrast = adj.contrast || 0;
    const saturation = adj.saturation || 0;
    const temperature = adj.temperature || 0;
    const tint = adj.tint || 0;
    const highlights = (adj.highlights || 0) / 5;
    const shadows = (adj.shadows || 0) / 5;
    return `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) hue-rotate(${tint}deg) sepia(${temperature > 0 ? temperature : 0}%) brightness(${100 + highlights}%) contrast(${100 + shadows}%)`;
  };

  const handleModalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newImageData = { id: Date.now(), url: event.target.result };
      setUploadedImages((prev) => [newImageData, ...prev]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Default Logo View
  return (
    <div ref={panelRef} className="flex flex-col h-full bg-transparent font-sans">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-[1.2vw] pt-[1.1vw] pb-[0.5vw] flex-shrink-0">
        <div className="flex items-center gap-[0.75vw] text-gray-800">
          <Icon icon="lucide:gem" className="w-[1.2vw] h-[1.2vw] text-black" />
          <h2 className="text-[1vw] font-semibold text-gray-900">Branding</h2>
        </div>
        <button
          onClick={onBack}
          className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-90"
        >
          <ChevronsLeft className="w-[1.2vw] h-[1.2vw]" strokeWidth={2.2} />
        </button>
      </div>

      <style>{`
        .custom-range-slider { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
        .custom-range-slider::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
        .custom-range-slider::-webkit-slider-runnable-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
        .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #4D47FF; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4); margin-top: -0.4vw; cursor: pointer; transition: box-shadow 0.15s ease; position: relative; z-index: 2; }
        .custom-range-slider::-webkit-slider-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6); }
        .custom-range-slider::-moz-range-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
        .custom-range-slider::-moz-range-thumb { height: 1vw; width: 1vw; border-radius: 50%; background: #4D47FF; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4); cursor: pointer; }
        .custom-range-slider::-moz-range-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6); }
      `}</style>

      <div
        className="flex-1 overflow-y-auto px-[1.2vw] pt-[0.25vw] pb-[3vw] flex flex-col gap-[0.8vw] hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Upload your Logo Header */}
        <div className="mb-[0.5vw]">
          <div className="flex items-center gap-[0.5vw]">
            <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap mb-[0.75vw]">
              Upload your Logo
            </span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1"> </div>
            {logoSettings?.src && (
              <button
                onClick={() => setShowCropOverlay(true)}
                className="flex items-center justify-center h-[1.8vw] px-[0.8vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.75vw] font-medium rounded-[0.4vw] border border-gray-200 transition-colors shadow-sm"
              >
                Crop
              </button>
            )}
          </div>
          {/* Split Upload / Drop Zone */}
          {logoSettings?.src ? (
            <div className="flex flex-col gap-[0.75vw]">
              <div
                className="flex items-center gap-[1vw]"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    handleFileChange({ target: { files: [file] } });
                  }
                }}
              >
                {/* Thumbnail */}
                <div className="relative w-[8.5vw] h-[6vw] rounded-[0.4vw] overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                  <img
                    src={logoSettings.src}
                    alt="Thumbnail"
                    className={`w-full h-full ${logoSettings?.cropData ? "object-cover" : "object-contain"}`}
                    style={{
                      opacity: (logoSettings?.opacity ?? 100) / 100,
                      filter: getLogoFilterStr(),
                      ...(() => {
                        const cd = logoSettings?.cropData;
                        return cd && cd.inset
                          ? {
                              clipPath: cd.inset,
                              WebkitClipPath: cd.inset,
                              transform: `translate(${cd.offX}%, ${cd.offY}%) scale(${cd.scale})`,
                              transformOrigin: "center center",
                            }
                          : {};
                      })(),
                    }}
                  />
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col flex-1 gap-[0.4vw] py-[0.2vw]">
                  <div className="flex flex-col gap-[0.1vw]">
                    <span
                      className="text-[0.9vw] font-medium text-gray-700 truncate w-[10vw]"
                      title="Logo"
                    >
                      Logo
                    </span>
                    <span className="text-[0.75vw] text-gray-400">
                      {logoResolution && logoFileSize
                        ? `${logoResolution} • ${logoFileSize}`
                        : logoFileSize || logoResolution || "Loading size..."}
                    </span>
                  </div>

                  <div className="flex items-center gap-[0.5vw]">
                    <button
                      onClick={() => setReplaceTarget("logo")}
                      className="px-[0.75vw] py-[0.4vw] bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 text-[0.75vw] font-semibold rounded-[0.4vw] border border-gray-200 cursor-pointer transition-colors"
                    >
                      Replace image
                    </button>
                    <button
                      onClick={confirmRemoveLogo}
                      className="p-[0.45vw] bg-[#f3f4f6] hover:bg-[#fee2e2] text-gray-500 hover:text-red-500 rounded-[0.4vw] border border-gray-200 cursor-pointer transition-colors"
                    >
                      <Trash2 size="0.95vw" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="flex items-center gap-[1vw] py-[0.5vw]">
                <span className="text-[0.75vw] font-semibold text-gray-700 whitespace-nowrap">
                  Opacity :
                </span>
                <div className="flex-1 flex items-center h-[1.5vw]">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={logoSettings?.opacity ?? 100}
                    onChange={(e) =>
                      onUpdateLogo({
                        ...logoSettings,
                        opacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer custom-range-slider"
                    style={{
                      backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${logoSettings?.opacity ?? 100}%, #E2E8F0 ${logoSettings?.opacity ?? 100}%, #E2E8F0 100%)`,
                    }}
                  />
                </div>
                <div className="px-[0.6vw] py-[0.3vw] bg-white border border-gray-200 rounded-[0.4vw] text-[0.75vw] font-semibold text-gray-700 min-w-[3vw] text-center shadow-sm">
                  {logoSettings?.opacity ?? 100}%
                </div>
              </div>

              {/* Collapsible Adjustment Section */}
              <div className="flex flex-col">
                <div
                  onClick={() => setShowLogoAdjustments(!showLogoAdjustments)}
                  className={`w-full flex items-center justify-between px-[1vw] py-[1vw] bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${showLogoAdjustments ? "rounded-t-[0.75vw] border-b-0" : "rounded-[0.75vw]"}`}
                >
                  <span className="text-[0.75vw] font-semibold text-gray-700">
                    Adjustments
                  </span>
                  <ChevronDown
                    size="0.95vw"
                    className={`text-gray-500 transition-transform duration-200 ${showLogoAdjustments ? "rotate-180" : ""}`}
                  />
                </div>

                {showLogoAdjustments && (
                  <div className="space-y-[0.1vw] border border-gray-200 rounded-b-[0.75vw] bg-white p-[0.5vw]">
                    <AdjustmentSlider
                      label="Exposure"
                      value={logoSettings?.adjustments?.exposure || 0}
                      onChange={(val) =>
                        handleAdjustmentChange("exposure", val)
                      }
                      onReset={() => handleAdjustmentChange("exposure", 0)}
                    />
                    <AdjustmentSlider
                      label="Contrast"
                      value={logoSettings?.adjustments?.contrast || 0}
                      onChange={(val) =>
                        handleAdjustmentChange("contrast", val)
                      }
                      onReset={() => handleAdjustmentChange("contrast", 0)}
                    />
                    <AdjustmentSlider
                      label="Saturation"
                      value={logoSettings?.adjustments?.saturation || 0}
                      onChange={(val) =>
                        handleAdjustmentChange("saturation", val)
                      }
                      onReset={() => handleAdjustmentChange("saturation", 0)}
                    />
                    <AdjustmentSlider
                      label="Temperature"
                      value={logoSettings?.adjustments?.temperature || 0}
                      onChange={(val) =>
                        handleAdjustmentChange("temperature", val)
                      }
                      onReset={() => handleAdjustmentChange("temperature", 0)}
                    />
                    <AdjustmentSlider
                      label="Tint"
                      value={logoSettings?.adjustments?.tint || 0}
                      onChange={(val) => handleAdjustmentChange("tint", val)}
                      onReset={() => handleAdjustmentChange("tint", 0)}
                    />
                    <AdjustmentSlider
                      label="Highlights"
                      value={logoSettings?.adjustments?.highlights || 0}
                      onChange={(val) =>
                        handleAdjustmentChange("highlights", val)
                      }
                      onReset={() => handleAdjustmentChange("highlights", 0)}
                    />
                    <AdjustmentSlider
                      label="Shadows"
                      value={logoSettings?.adjustments?.shadows || 0}
                      onChange={(val) => handleAdjustmentChange("shadows", val)}
                      onReset={() => handleAdjustmentChange("shadows", 0)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[0.75vw] mb-[1vw] ">
              {/* Drag & Drop Box */}
              <div
                onClick={() => setReplaceTarget("logo")}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    handleFileChange({ target: { files: [file] } });
                  }
                }}
                className="w-full h-[6.8vw] border-2 border-dashed border-gray-300 rounded-[0.75vw] bg-white p-[0.8vw] flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#ff5722] hover:bg-orange-50/20 group shadow-sm"
              >
                <div className="flex items-center gap-[0.3vw] text-[0.75vw]">
                  <span className="text-gray-500 font-medium">Drag & Drop or</span>
                  <span className="text-[#ff5722] font-semibold hover:underline">Upload</span>
                </div>
                <div className="my-[0.35vw] text-gray-400 group-hover:text-[#ff5722] transition-colors">
                  <Upload size="1.2vw" />
                </div>
                <span className="text-[0.65vw] text-gray-400 font-medium">
                  Supported File Format : JPG, PNG
                </span>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />

          {/* Platform Watermark Section */}
          <div className="mb-[0.5vw]">
            <div className="flex items-center gap-[0.5vw] mt-[1.5vw]">
              <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">
                Platform Watermark
              </span>
              <div className="h-[0.0925vw] bg-gray-200 flex-1"> </div>
            </div>
          </div>

          {platformWatermark?.src ? (
            <div className="flex flex-col gap-[0.75vw] mb-[0.8vw]">
              <div className="flex items-center gap-[1vw]">
                {/* Thumbnail */}
                <div className="relative w-[8.5vw] h-[6vw] rounded-[0.4vw] overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                  <img
                    src={platformWatermark.src}
                    alt="Platform Watermark Thumbnail"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col flex-1 gap-[0.4vw] py-[0.2vw]">
                  <div className="flex flex-col gap-[0.1vw]">
                    <span className="text-[0.9vw] font-medium text-gray-700 truncate w-[10vw]">
                      {platformWatermark.name || "Image Name .jpg"}
                    </span>
                    <span className="text-[0.75vw] text-gray-400">
                      {platformWatermarkResolution && platformWatermarkFileSize
                        ? `${platformWatermarkResolution} • ${platformWatermarkFileSize}`
                        : platformWatermarkFileSize ||
                          platformWatermarkResolution ||
                          "1920 X 1080 • 24MB"}
                    </span>
                  </div>
                  <div className="flex items-center gap-[0.5vw]">
                    <button
                      onClick={() => setReplaceTarget("platformWatermark")}
                      className="px-[0.75vw] py-[0.4vw] bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 text-[0.75vw] font-semibold rounded-[0.4vw] border border-gray-200 cursor-pointer transition-colors"
                    >
                      Replace Image
                    </button>
                    <button
                      onClick={() => setDeleteTarget("platformWatermark")}
                      className="p-[0.45vw] bg-[#f3f4f6] hover:bg-[#fee2e2] text-gray-500 hover:text-red-500 rounded-[0.4vw] border border-gray-200 cursor-pointer transition-colors"
                      title="Delete Platform Watermark"
                    >
                      <Trash2 size="0.95vw" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="flex flex-col gap-[0.4vw] pt-[0.2vw]">
                <style>{`
                  .custom-range-slider-orange { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
                  .custom-range-slider-orange::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
                  .custom-range-slider-orange::-webkit-slider-runnable-track { height: 0.15vw; border-radius: 0.1vw; background: inherit; }
                  .custom-range-slider-orange::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #FF5722; cursor: pointer; position: relative; z-index: 2; margin-top: -0.42vw; box-shadow: 0 0.1vw 0.3vw rgba(255,87,34,0.3); }
                  .custom-range-slider-orange::-moz-range-track { height: 0.15vw; border-radius: 0.1vw; background: inherit; }
                  .custom-range-slider-orange::-moz-range-thumb { height: 1vw; width: 1vw; border-radius: 50%; background: #FF5722; cursor: pointer; border: none; }
                `}</style>
                <div className="flex items-center gap-[0.5vw]">
                  <span className="text-[0.85vw] text-gray-800">
                    Opacity :
                  </span>
                  <div className="px-[0.2vw] py-[0.1vw] bg-white border border-gray-100 rounded-[0.2vw] text-[0.8vw] font-medium text-gray-800 shadow-sm min-w-[2.5vw] text-center">
                    {platformWatermark?.opacity ?? 100}%
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={platformWatermark?.opacity ?? 100}
                  onChange={(e) => {
                    const newOpacity = parseInt(e.target.value, 10);
                    onUpdateWatermark({
                      ...watermarkSettings,
                      platformWatermark: {
                        ...(watermarkSettings?.platformWatermark || {}),
                        opacity: isNaN(newOpacity) ? 100 : newOpacity,
                      },
                    });
                  }}
                  className="w-full cursor-pointer custom-range-slider-orange mt-[0.2vw]"
                  style={{
                    backgroundImage: `linear-gradient(to right, #FF5722 0%, #FF5722 ${platformWatermark?.opacity ?? 100}%, #E2E8F0 ${platformWatermark?.opacity ?? 100}%, #E2E8F0 100%)`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[0.75vw] mb-[1vw]">
              {/* Drag & Drop Box */}
              <div
                onClick={() => setReplaceTarget("platformWatermark")}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    handlePlatformWatermarkReplace(file);
                  }
                }}
                className="w-full h-[6.8vw] border-2 border-dashed border-gray-300 rounded-[0.75vw] bg-white p-[0.8vw] flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#ff5722] hover:bg-orange-50/20 group shadow-sm"
              >
                <div className="flex items-center gap-[0.3vw] text-[0.75vw]">
                  <span className="text-gray-500 font-medium">Drag & Drop or</span>
                  <span className="text-[#ff5722] font-semibold hover:underline">Upload</span>
                </div>
                <div className="my-[0.35vw] text-gray-400 group-hover:text-[#ff5722] transition-colors">
                  <Upload size="1.2vw" />
                </div>
                <span className="text-[0.65vw] text-gray-400 font-medium">
                  Supported File Format : JPG, PNG
                </span>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={platformWatermarkFileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handlePlatformWatermarkReplace(file);
              }
            }}
            className="hidden"
            accept="image/*"
          />

          {/* Page Watermark Section */}
          <div className="mb-[0.5vw]">
            <div className="flex items-center gap-[0.5vw] mt-[1.5vw]">
              <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">
                Page Watermark
              </span>
              <div className="h-[0.0925vw] bg-gray-200 flex-1"> </div>
              {watermarkSettings?.src && (
                <button
                  onClick={() => setShowWatermarkCropOverlay(true)}
                  className="flex items-center justify-center h-[1.8vw] px-[0.8vw] bg-white hover:bg-gray-50 text-gray-700 text-[0.75vw] font-medium rounded-[0.4vw] border border-gray-200 transition-colors shadow-sm"
                >
                  Crop
                </button>
              )}
            </div>
          </div>
          {/* Select Image Type Dropdown */}
          <div className="flex items-center justify-between mb-[0.8vw] px-[0.2vw]">
            <span className="text-[0.8vw] font-medium text-gray-700">
              Select the Image type :
            </span>
            <select
              value={watermarkSettings?.type || "Fit"}
              onChange={(e) =>
                onUpdateWatermark({
                  ...watermarkSettings,
                  type: e.target.value,
                })
              }
              className="px-[0.8vw] py-[0.35vw] bg-white border border-gray-300 rounded-[0.4vw] text-[0.78vw] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="Fit">Fit</option>
              <option value="Fill">Fill</option>
              <option value="Stretch">Stretch</option>
            </select>
          </div>

          {watermarkSettings?.src ? (
            <div className="flex flex-col gap-[0.5vw]">
              <div className="flex items-center gap-[1vw]">
                {/* Thumbnail */}
                <div className="relative w-[8.5vw] h-[6vw] rounded-[0.4vw] overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                  <img
                    src={watermarkSettings.src}
                    alt="Watermark Thumbnail"
                    className="w-full h-full object-contain"
                    style={{
                      filter: getWatermarkFilterStr(),
                      ...(() => {
                        const cd = watermarkSettings?.cropData;
                        return cd && cd.inset
                          ? {
                              clipPath: cd.inset,
                              WebkitClipPath: cd.inset,
                              transform: `translate(${cd.offX}%, ${cd.offY}%) scale(${cd.scale})`,
                              transformOrigin: "center center",
                            }
                          : {};
                      })(),
                    }}
                  />
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col flex-1 gap-[0.4vw] py-[0.2vw]">
                  <div className="flex flex-col gap-[0.1vw]">
                    <span className="text-[0.9vw] font-medium text-gray-700 truncate w-[10vw]">
                      Watermark
                    </span>
                    <span className="text-[0.75vw] text-gray-400">
                      {watermarkResolution && watermarkFileSize
                        ? `${watermarkResolution} • ${watermarkFileSize}`
                        : watermarkFileSize ||
                          watermarkResolution ||
                          "Loading size..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-[0.5vw]">
                    <button
                      onClick={() => setReplaceTarget("watermark")}
                      className="px-[0.75vw] py-[0.4vw] bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 text-[0.75vw] font-semibold rounded-[0.4vw] border border-gray-200 cursor-pointer transition-colors"
                    >
                      Replace image
                    </button>
                    <button
                      onClick={() => setDeleteTarget("watermark")}
                      className="p-[0.45vw] bg-[#f3f4f6] hover:bg-[#fee2e2] text-gray-500 hover:text-red-500 rounded-[0.4vw] border border-gray-200 cursor-pointer transition-colors"
                    >
                      <Trash2 size="0.95vw" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[0.75vw] mb-[1vw]">
              {/* Drag & Drop Box */}
              <div
                onClick={() => setReplaceTarget("watermark")}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    handleWatermarkReplace(file);
                  }
                }}
                className="w-full h-[6.8vw] border-2 border-dashed border-gray-300 rounded-[0.75vw] bg-white p-[0.8vw] flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#ff5722] hover:bg-orange-50/20 group shadow-sm"
              >
                <div className="flex items-center gap-[0.3vw] text-[0.75vw]">
                  <span className="text-gray-500 font-medium">Drag & Drop or</span>
                  <span className="text-[#ff5722] font-semibold hover:underline">Upload</span>
                </div>
                <div className="my-[0.35vw] text-gray-400 group-hover:text-[#ff5722] transition-colors">
                  <Upload size="1.2vw" />
                </div>
                <span className="text-[0.65vw] text-gray-400 font-medium">
                  Supported File Format : JPG, PNG
                </span>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={watermarkFileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleWatermarkReplace(file);
              }
            }}
            className="hidden"
            accept="image/*"
          />{" "}
          {/* Watermark Options */}
          {watermarkSettings?.src && (
            <div className="flex gap-[2vw] pt-[1.5vw] pb-[1vw]">
              <style>{`
              .custom-range-slider-orange { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
              .custom-range-slider-orange::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
              .custom-range-slider-orange::-webkit-slider-runnable-track { height: 0.15vw; border-radius: 0.1vw; background: inherit; }
              .custom-range-slider-orange::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #FF5722; cursor: pointer; position: relative; z-index: 2; margin-top: -0.42vw; box-shadow: 0 0.1vw 0.3vw rgba(255,87,34,0.3); }
              .custom-range-slider-orange::-moz-range-track { height: 0.15vw; border-radius: 0.1vw; background: inherit; }
              .custom-range-slider-orange::-moz-range-thumb { height: 1vw; width: 1vw; border-radius: 50%; background: #FF5722; cursor: pointer; border: none; }
            `}</style>

              {/* Left Column: Sliders */}
              <div className="flex-1 flex flex-col gap-[1vw]">
                {/* Scale */}
                <div className="flex flex-col gap-[0.4vw]">
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="text-[0.85vw] text-gray-800">Scale :</span>
                    <div className="px-[0.2vw] py-[0.1vw] bg-white border border-gray-100 rounded-[0.2vw] text-[0.8vw] font-medium text-gray-800 shadow-sm min-w-[2.5vw] text-center">
                      {watermarkSettings?.scale ?? 100}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={watermarkSettings?.scale ?? 100}
                    onChange={(e) =>
                      onUpdateWatermark({
                        ...watermarkSettings,
                        scale: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer custom-range-slider-orange mt-[0.2vw]"
                    style={{
                      backgroundImage: `linear-gradient(to right, #FF5722 0%, #FF5722 ${(watermarkSettings?.scale ?? 100) / 2}%, #E2E8F0 ${(watermarkSettings?.scale ?? 100) / 2}%, #E2E8F0 100%)`,
                    }}
                  />
                </div>

                {/* Rotate */}
                <div className="flex flex-col gap-[0.4vw]">
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="text-[0.85vw] text-gray-800">
                      Rotate :
                    </span>
                    <div className="px-[0.2vw] py-[0.1vw] bg-white border border-gray-100 rounded-[0.2vw] text-[0.8vw] font-medium text-gray-800 shadow-sm min-w-[2.5vw] text-center">
                      {watermarkSettings?.rotate ?? 0}&deg;
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={watermarkSettings?.rotate ?? 0}
                    onChange={(e) =>
                      onUpdateWatermark({
                        ...watermarkSettings,
                        rotate: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer custom-range-slider-orange mt-[0.2vw]"
                    style={{
                      backgroundImage: `linear-gradient(to right, #FF5722 0%, #FF5722 ${(watermarkSettings?.rotate ?? 0) / 3.6}%, #E2E8F0 ${(watermarkSettings?.rotate ?? 0) / 3.6}%, #E2E8F0 100%)`,
                    }}
                  />
                </div>

                {/* Opacity */}
                <div className="flex flex-col gap-[0.4vw]">
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="text-[0.85vw] text-gray-800">
                      Opacity :
                    </span>
                    <div className="px-[0.2vw] py-[0.1vw] bg-white border border-gray-100 rounded-[0.2vw] text-[0.8vw] font-medium text-gray-800 shadow-sm min-w-[2.5vw] text-center">
                      {watermarkSettings?.opacity ?? 100}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={watermarkSettings?.opacity ?? 100}
                    onChange={(e) =>
                      onUpdateWatermark({
                        ...watermarkSettings,
                        opacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer custom-range-slider-orange mt-[0.2vw]"
                    style={{
                      backgroundImage: `linear-gradient(to right, #FF5722 0%, #FF5722 ${watermarkSettings?.opacity ?? 100}%, #E2E8F0 ${watermarkSettings?.opacity ?? 100}%, #E2E8F0 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Right Column: 3x3 Position Anchor Grid */}
              <div className="flex-[1.1] flex flex-col gap-[0.45vw]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.85vw] text-gray-800">
                    Position :
                  </span>
                  <span className="text-[0.68vw] font-medium text-gray-500">
                    {watermarkSettings?.type === "Fill" || watermarkSettings?.type === "Stretch"
                      ? "Full Page"
                      : watermarkSettings?.position || "Bottom Right"}
                  </span>
                </div>
                <div
                  className={`grid grid-cols-3 gap-[0.35vw] p-[0.45vw] bg-gray-50 border border-gray-200 rounded-[0.5vw] h-[7.5vw] ${
                    watermarkSettings?.type === "Fill" || watermarkSettings?.type === "Stretch"
                      ? "opacity-45 pointer-events-none"
                      : ""
                  }`}
                >
                  {[
                    "Top Left",
                    "Top Center",
                    "Top Right",
                    "Middle Left",
                    "Center",
                    "Middle Right",
                    "Bottom Left",
                    "Bottom Center",
                    "Bottom Right",
                  ].map((pos) => {
                    const isSelected = (watermarkSettings?.position || "Bottom Right") === pos;
                    return (
                      <button
                        key={pos}
                        type="button"
                        title={pos}
                        onClick={() =>
                          onUpdateWatermark({
                            ...watermarkSettings,
                            position: pos,
                            positionX: 0,
                            positionY: 0,
                          })
                        }
                        className={`rounded-[0.3vw] flex items-center justify-center border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#4D47FF] border-[#4D47FF] text-white shadow-xs"
                            : "bg-white border-gray-200 hover:border-[#4D47FF]/60 hover:bg-indigo-50/40 text-gray-400"
                        }`}
                      >
                        <span
                          className={`w-[0.45vw] h-[0.45vw] rounded-full ${
                            isSelected ? "bg-white" : "bg-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Preloader Customization Section */}
          <div className="flex items-center gap-[1vw] mb-[0.5vw] mt-[1.5vw]">
            <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">
              Preloaded Customization
            </span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1"> </div>
          </div>

          {/* Don't show preparing flipibook preloader Toggle */}
          <div className="flex items-center justify-between mb-[0.8vw] px-[0.2vw]">
            <div className="flex flex-col pr-2">
              <span className="text-[0.82vw] font-medium text-gray-800">
                Don't show preparing flipibook preloader
              </span>
              <span className="text-[0.68vw] text-gray-500">
                Disable preloader screen when viewing flipbook
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preloaderSettings?.enabled === false}
              onClick={() => {
                const newEnabled = preloaderSettings?.enabled === false ? true : false;
                const updated = {
                  ...(preloaderSettings || {}),
                  enabled: newEnabled,
                };
                onUpdatePreloader(updated);
                setTempPreloaderSettings((prev) => ({ ...prev, enabled: newEnabled }));
              }}
              className={`w-[2.2vw] h-[1.2vw] rounded-full p-[0.1vw] transition-colors focus:outline-none cursor-pointer flex-shrink-0 ${
                preloaderSettings?.enabled === false
                  ? "bg-[#4A3AFF]"
                  : "bg-gray-200 border border-gray-300"
              }`}
            >
              <div
                className={`w-[1vw] h-[1vw] rounded-full bg-white shadow-sm transition-transform ${
                  preloaderSettings?.enabled === false
                    ? "translate-x-[1vw]"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Interactive Preloader Preview Box */}
          {(() => {
            const displayPreloader = preloaderSettings || {};
            const isCustom = displayPreloader?.isCustom === true;
            const darkBg = "#22252A";
            const whiteText = "#ffffff";
            const defaultSpinner = "#E04752";

            const displayOption = displayPreloader?.displayOption || (
              displayPreloader?.layout === "logo-only"
                ? "logo-only"
                : (displayPreloader?.logo ? "both" : "preloader-only")
            );

            // Logo animation (enabled for logo-only and both)
            const logoAnim = displayPreloader?.logoAnimation || "fade";
            const animStyle = getLogoAnimationStyle(logoAnim);
            const rawDisplayText = displayPreloader?.text;
            const displayText =
              !rawDisplayText ||
              rawDisplayText === "Loading Modal Please Wait...." ||
              rawDisplayText === "Loading Flipbook Please Wait...." ||
              rawDisplayText === "Preparing Flipbook..."
                ? "Preparing Flipibook"
                : rawDisplayText;

            const cardBg = isCustom
              ? ((!displayPreloader?.bgColor || displayPreloader.bgColor === "#D6E0F4") ? darkBg : displayPreloader.bgColor)
              : darkBg;
            const cardColor = isCustom ? (displayPreloader?.textColor || whiteText) : whiteText;

            return (
              <div
                className="relative w-full h-[9.2vw] min-h-[120px] rounded-[1vw] flex flex-col items-center justify-center shadow-md border border-white/10 group overflow-hidden flex-shrink-0"
                style={{
                  backgroundColor: cardBg,
                  color: cardColor,
                }}
              >
                <style>{`
                  @keyframes preloaderJump {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                  }
                  @keyframes preloaderSlide {
                    0%, 100% { transform: translateX(-8px); }
                    50% { transform: translateX(8px); }
                  }
                  @keyframes preloaderFade {
                    0%, 100% { opacity: 0.25; transform: scale(0.96); }
                    50% { opacity: 1; transform: scale(1.02); }
                  }
                  @keyframes preloaderPulse {
                    0%, 100% { transform: scale(0.92); }
                    50% { transform: scale(1.08); }
                  }
                `}</style>

                {/* Edit Button */}
                <button
                  onClick={handleOpenPreloaderModal}
                  className="absolute top-[0.75vw] right-[0.75vw] p-[0.4vw] rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer transition-colors flex items-center justify-center z-[40]"
                  title="Change preloader settings"
                >
                  <Icon
                    icon="lucide:edit-2"
                    className="w-[0.95vw] h-[0.95vw]"
                  />
                </button>

                {/* Badge: Default vs Custom */}
                <div className="absolute top-[0.7vw] left-[0.8vw] z-[20] flex items-center gap-1 px-[0.45vw] py-[0.12vw] rounded-full bg-white/10 text-white/90 text-[0.58vw] font-medium backdrop-blur-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${isCustom ? "bg-indigo-400" : "bg-emerald-400"}`} />
                  <span>{isCustom ? "Custom Preloader" : "Default Preloader"}</span>
                </div>

                <div className={`flex items-center gap-[0.45vw] px-[1vw] pt-2 ${displayPreloader?.textPosition === "top" ? "flex-col-reverse" : "flex-col"}`}>
                  {!isCustom ? (
                    /* DEFAULT PRELOADER DISPLAY (Dark theme with centered spinner & Preparing Flipibook) */
                    <div className={`flex items-center justify-center gap-[0.4vw] ${displayPreloader?.textPosition === "top" ? "flex-col-reverse" : "flex-col"}`}>
                      <div className="relative flex items-center justify-center">
                        <div
                          className="w-[1.6vw] h-[1.6vw] border-[2.5px] border-t-transparent rounded-full animate-spin"
                          style={{
                            borderColor: `${defaultSpinner} ${defaultSpinner} ${defaultSpinner} transparent`,
                          }}
                        />
                      </div>
                      {displayPreloader?.showText !== false && (
                        <p
                          className="text-[0.72vw] font-medium text-center tracking-wide truncate max-w-[15vw]"
                          style={{ color: cardColor, fontFamily: "Poppins" }}
                        >
                          Preparing Flipibook
                        </p>
                      )}
                    </div>
                  ) : (
                    /* CUSTOM PRELOADER DISPLAY (Based on 3 options) */
                    <>
                      {/* OPTION 1: Logo Only */}
                      {displayOption === "logo-only" ? (
                        <div className="flex flex-col items-center gap-[0.3vw]">
                          {displayPreloader?.logo ? (
                            <div style={animStyle}>
                              <img
                                src={displayPreloader.logo}
                                alt="Preloader Logo"
                                className="object-contain drop-shadow-sm transition-all"
                                style={{
                                  height: `${2.8 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw`,
                                  maxWidth: `${6 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw`,
                                }}
                              />
                            </div>
                          ) : (
                            <div style={animStyle}>
                              <div
                                className="rounded-[0.4vw] bg-white/10 flex items-center justify-center border border-white/10 transition-all"
                                style={{
                                  width: `${2.4 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw`,
                                  height: `${2.4 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw`,
                                }}
                              >
                                <span style={{ fontSize: `${1.2 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw` }}>📖</span>
                              </div>
                            </div>
                          )}
                          {displayPreloader?.showPercentage && (
                            <span className="text-[0.65vw] font-bold">45%</span>
                          )}
                        </div>
                      ) : (
                        /* OPTION 2 (Preloader Only) or OPTION 3 (Both: Static Logo + Preloader below) */
                        <div className="flex flex-col items-center justify-center gap-[0.35vw]">
                          {/* Logo shown when displayOption is 'both' */}
                          {displayOption === "both" && displayPreloader?.logo && (
                            <div className="flex items-center justify-center" style={animStyle}>
                              <img
                                src={displayPreloader.logo}
                                alt="Preloader Logo"
                                className="object-contain transition-all"
                                style={{
                                  height: `${2 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw`,
                                  maxWidth: `${5 * ((displayPreloader?.logoSize !== undefined ? displayPreloader.logoSize : 100) / 100)}vw`,
                                }}
                              />
                            </div>
                          )}

                          {/* Preloader Indicator */}
                          {displayPreloader?.layout === "bar" ? (
                            <div className="flex flex-col items-center gap-1 w-[11vw]">
                              <div className="w-full bg-gray-600/30 h-[0.35vw] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: "45%",
                                    backgroundColor:
                                      displayPreloader?.spinnerColor || "#3B3C8A",
                                  }}
                                />
                              </div>
                              {displayPreloader?.showPercentage && (
                                <span className="text-[0.6vw] font-semibold">45%</span>
                              )}
                            </div>
                          ) : displayPreloader?.layout === "dots" ? (
                            <div className="flex items-center gap-[0.35vw] py-[0.1vw]">
                              <div
                                className="w-[0.45vw] h-[0.45vw] rounded-full animate-bounce [animation-delay:-0.3s]"
                                style={{
                                  backgroundColor:
                                    displayPreloader?.spinnerColor || "#3B3C8A",
                                }}
                              />
                              <div
                                className="w-[0.45vw] h-[0.45vw] rounded-full animate-bounce [animation-delay:-0.15s]"
                                style={{
                                  backgroundColor:
                                    displayPreloader?.spinnerColor || "#3B3C8A",
                                }}
                              />
                              <div
                                className="w-[0.45vw] h-[0.45vw] rounded-full animate-bounce"
                                style={{
                                  backgroundColor:
                                    displayPreloader?.spinnerColor || "#3B3C8A",
                                }}
                              />
                              {displayPreloader?.showPercentage && (
                                <span className="text-[0.6vw] font-semibold ml-1">45%</span>
                              )}
                            </div>
                          ) : (
                            /* Circular Spinner rendered strictly below logo */
                            <div className="relative flex flex-col items-center justify-center">
                              <div
                                className="w-[1.6vw] h-[1.6vw] border-[2.5px] border-t-transparent rounded-full animate-spin"
                                style={{
                                  borderColor: `${displayPreloader?.spinnerColor || "#3B3C8A"} ${displayPreloader?.spinnerColor || "#3B3C8A"} ${displayPreloader?.spinnerColor || "#3B3C8A"} transparent`,
                                }}
                              />
                              {displayPreloader?.showPercentage && (
                                <span className="text-[0.55vw] font-bold mt-[0.15vw]">
                                  45%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {displayPreloader?.showText !== false && (
                        <p
                          className="text-[0.72vw] font-medium text-center truncate max-w-[15vw]"
                          style={{ color: cardColor, fontFamily: displayPreloader?.font || "Poppins" }}
                        >
                          {displayText}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Preloader Styles Modal */}
          {showPreloaderModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed w-[26vw] min-w-[360px] max-w-[440px] z-[9999] bg-white rounded-[0.8vw] shadow-[0_10px_35px_rgba(0,0,0,0.22)] border border-gray-200 flex flex-col overflow-hidden"
                style={{
                  top: "50%",
                  left: modalLeft,
                  transform: "translateY(-50%)",
                  maxHeight: "72vh",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100 shrink-0 bg-white">
                  <h4 className="text-[1.1vw] min-text-[16px] font-semibold text-black">
                    Preloaded Customization
                  </h4>
                  <button
                    onClick={() => {
                      setShowPreloaderModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <Icon icon="lucide:x" className="w-[1.2vw] h-[1.2vw]" />
                  </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="px-[1.2vw] py-[0.8vw] space-y-[0.8vw] overflow-y-auto flex-1 custom-scrollbar">

                  {/* Toggle: Don't show preparing flipibook preloader */}
                  <div className="flex items-center justify-between p-[0.6vw] rounded-[0.5vw] bg-gray-50 border border-gray-200">
                    <div className="flex flex-col pr-2">
                      <span className="text-[0.82vw] font-medium text-gray-800">
                        Don't show preparing flipibook preloader
                      </span>
                      <span className="text-[0.68vw] text-gray-500">
                        Disable preloader screen completely
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tempPreloaderSettings?.enabled === false}
                      onClick={() => {
                        setTempPreloaderSettings({
                          ...tempPreloaderSettings,
                          enabled: tempPreloaderSettings?.enabled === false ? true : false,
                        });
                      }}
                      className={`w-[2.2vw] h-[1.2vw] rounded-full p-[0.1vw] transition-colors focus:outline-none cursor-pointer flex-shrink-0 ${
                        tempPreloaderSettings?.enabled === false
                          ? "bg-[#4A3AFF]"
                          : "bg-gray-200 border border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-[1vw] h-[1vw] rounded-full bg-white shadow-sm transition-transform ${
                          tempPreloaderSettings?.enabled === false
                            ? "translate-x-[1vw]"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3 CUSTOM OPTIONS SEGMENTED SELECTOR */}
                  <div className="flex flex-col gap-[0.4vw]">
                    <span className="text-[0.82vw] font-semibold text-gray-800">
                      Preloader Mode (Choose one)
                    </span>
                    <div className="grid grid-cols-3 gap-[0.4vw] p-1 bg-gray-100 rounded-[0.6vw]">
                      {[
                        { id: "preloader-only", label: "Only Preloader" },
                        { id: "logo-only", label: "Only Logo" },
                        { id: "both", label: "Both" },
                      ].map((tab) => {
                        const activeOption = tempPreloaderSettings?.displayOption || (
                          tempPreloaderSettings?.layout === "logo-only"
                            ? "logo-only"
                            : (tempPreloaderSettings?.logo ? "both" : "preloader-only")
                        );
                        const isSelected = activeOption === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setTempPreloaderSettings({
                                ...tempPreloaderSettings,
                                isCustom: true,
                                displayOption: tab.id,
                                layout: tab.id === "logo-only" ? "logo-only" : (tempPreloaderSettings?.layout === "logo-only" ? "spinner" : (tempPreloaderSettings?.layout || "spinner")),
                              });
                            }}
                            className={`py-[0.55vw] px-[0.4vw] rounded-[0.4vw] transition-all cursor-pointer text-center ${
                              isSelected
                                ? "bg-white text-indigo-600 font-semibold shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <span className="text-[0.75vw]">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CONDITIONAL CONTROLS BASED ON SELECTED MODE */}
                  {(() => {
                    const activeOption = tempPreloaderSettings?.displayOption || (
                      tempPreloaderSettings?.layout === "logo-only"
                        ? "logo-only"
                        : (tempPreloaderSettings?.logo ? "both" : "preloader-only")
                    );

                    return (
                      <div className="space-y-[0.8vw]">
                        {/* 1. Preloader Style Dropdown (for 'preloader-only' and 'both') */}
                        {activeOption !== "logo-only" && (
                          <div className="flex flex-col gap-[0.35vw]">
                            <span className="text-[0.82vw] font-medium text-gray-800">
                              Preloader Style {activeOption === "both" && "(Shown below logo)"}
                            </span>
                            <div className="relative" ref={styleDropdownRef}>
                              <button
                                onClick={() => {
                                  setShowStyleDropdown(!showStyleDropdown);
                                  setShowAnimDropdown(false);
                                }}
                                className="w-full h-[2.8vw] rounded-[0.5vw] border border-gray-200 bg-white flex items-center justify-between px-[0.8vw] hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
                              >
                                <span className="text-[0.75vw] text-gray-800 font-medium">
                                  {tempPreloaderSettings?.layout === "bar"
                                    ? "Progress Bar"
                                    : tempPreloaderSettings?.layout === "dots"
                                    ? "Bouncing Dots"
                                    : "Circular Spinner"}
                                </span>
                                <Icon
                                  icon="lucide:chevron-down"
                                  className="w-[0.8vw] h-[0.8vw] text-gray-500"
                                />
                              </button>

                              {showStyleDropdown && (
                                <div className="absolute top-full mt-[0.2vw] left-0 w-full bg-white border border-gray-200 rounded-[0.4vw] shadow-lg z-[100] overflow-hidden">
                                  {[
                                    { id: "spinner", label: "Circular Spinner", icon: "lucide:loader-2" },
                                    { id: "bar", label: "Progress Bar", icon: "lucide:minus" },
                                    { id: "dots", label: "Bouncing Dots", icon: "lucide:more-horizontal" },
                                  ].map((styleItem) => (
                                    <div
                                      key={styleItem.id}
                                      className={`px-[0.8vw] py-[0.5vw] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
                                        (tempPreloaderSettings?.layout || "spinner") === styleItem.id
                                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                                          : "text-gray-700"
                                      }`}
                                      onClick={() => {
                                        setTempPreloaderSettings({
                                          ...tempPreloaderSettings,
                                          layout: styleItem.id,
                                        });
                                        setShowStyleDropdown(false);
                                      }}
                                    >
                                      <span className="text-[0.75vw]">
                                        {styleItem.label}
                                      </span>
                                      <Icon
                                        icon={styleItem.icon}
                                        className="w-[0.9vw] h-[0.9vw]"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. Logo Upload Box (for 'logo-only' and 'both') */}
                        {activeOption !== "preloader-only" && (
                          <div className="flex flex-col gap-[0.35vw]">
                            <div className="flex items-center justify-between">
                              <span className="text-[0.82vw] font-medium text-gray-800">
                                Preloader Logo
                              </span>
                              {tempPreloaderSettings?.logo && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempPreloaderSettings({
                                      ...tempPreloaderSettings,
                                      logo: "",
                                    });
                                  }}
                                  className="text-[0.7vw] text-red-500 hover:text-red-700 cursor-pointer"
                                  title="Remove logo"
                                >
                                  Remove Logo
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => setReplaceTarget("preloaderLogo")}
                              className="h-[3.2vw] min-h-[44px] rounded-[0.5vw] border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center gap-[0.4vw] text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                            >
                              {tempPreloaderSettings?.logo ? (
                                <img
                                  src={tempPreloaderSettings.logo}
                                  alt="Preloader Logo"
                                  className="h-[2.4vw] max-w-[6vw] object-contain"
                                />
                              ) : (
                                <>
                                  <Icon
                                    icon="lucide:plus"
                                    className="w-[1vw] h-[1vw]"
                                  />
                                  <span className="text-[0.8vw]">Upload Preloader Logo</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Logo Size Slider (when in logo-only or both mode) */}
                        {activeOption !== "preloader-only" && (
                          <div className="flex flex-col gap-[0.35vw]">
                            <div className="flex items-center justify-between">
                              <span className="text-[0.82vw] font-medium text-gray-800">
                                Logo Size
                              </span>
                              <span className="text-[0.72vw] font-semibold text-gray-700 bg-gray-100 px-[0.4vw] py-[0.1vw] rounded-[0.2vw]">
                                {tempPreloaderSettings?.logoSize ?? 100}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={40}
                              max={200}
                              step={1}
                              value={tempPreloaderSettings?.logoSize ?? 100}
                              onChange={(e) =>
                                setTempPreloaderSettings({
                                  ...tempPreloaderSettings,
                                  logoSize: parseInt(e.target.value) || 100,
                                })
                              }
                              className="w-full cursor-pointer custom-range-slider mt-[0.1vw]"
                              style={{
                                backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${(((tempPreloaderSettings?.logoSize ?? 100) - 40) / 160) * 100}%, #E2E8F0 ${(((tempPreloaderSettings?.logoSize ?? 100) - 40) / 160) * 100}%, #E2E8F0 100%)`,
                              }}
                            />
                          </div>
                        )}

                        {/* 3. Logo Animation Dropdown (for 'logo-only' and 'both') */}
                        {activeOption !== "preloader-only" && (
                          <div className="flex flex-col gap-[0.35vw]">
                            <span className="text-[0.82vw] font-medium text-gray-800">
                              Logo Animation Style
                            </span>
                            <div className="relative" ref={animDropdownRef}>
                              <button
                                onClick={() => {
                                  setShowAnimDropdown(!showAnimDropdown);
                                  setShowStyleDropdown(false);
                                }}
                                className="w-full h-[2.8vw] rounded-[0.5vw] border border-gray-200 bg-white flex items-center justify-between px-[0.8vw] hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
                              >
                                <div className="flex items-center gap-[0.5vw]">
                                  <Icon icon="lucide:activity" className="w-[1vw] h-[1vw] text-indigo-600" />
                                  <span className="text-[0.78vw] font-medium text-gray-800 capitalize">
                                    {(tempPreloaderSettings?.logoAnimation || "fade") === "slide"
                                      ? "Left to Right"
                                      : (tempPreloaderSettings?.logoAnimation || "fade") === "bounce"
                                      ? "Jumping (Bounce)"
                                      : (tempPreloaderSettings?.logoAnimation || "fade") === "pulse"
                                      ? "Pulse (Zoom)"
                                      : (tempPreloaderSettings?.logoAnimation || "fade") === "none"
                                      ? "None (Static)"
                                      : "Fade In & Out"}
                                  </span>
                                </div>
                                <Icon icon="lucide:chevron-down" className="w-[0.8vw] h-[0.8vw] text-gray-500" />
                              </button>

                              {showAnimDropdown && (
                                <div className="absolute top-full mt-[0.2vw] left-0 w-full bg-white border border-gray-200 rounded-[0.4vw] shadow-lg z-[100] overflow-hidden">
                                  {[
                                    { id: "fade", label: "Fade In & Out", desc: "Smooth opacity breathing" },
                                    { id: "bounce", label: "Jumping (Bounce)", desc: "Vertical jumping" },
                                    { id: "slide", label: "Left to Right", desc: "Horizontal glide" },
                                    { id: "pulse", label: "Pulse", desc: "Scale pulse" },
                                    { id: "none", label: "None (Static)", desc: "No animation" },
                                  ].map((animItem) => (
                                    <div
                                      key={animItem.id}
                                      className={`px-[0.8vw] py-[0.5vw] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
                                        (tempPreloaderSettings?.logoAnimation || "fade") === animItem.id
                                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                                          : "text-gray-700"
                                      }`}
                                      onClick={() => {
                                        setTempPreloaderSettings({
                                          ...tempPreloaderSettings,
                                          logoAnimation: animItem.id,
                                        });
                                        setShowAnimDropdown(false);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-[0.75vw]">{animItem.label}</span>
                                        <span className="text-[0.62vw] text-gray-400">{animItem.desc}</span>
                                      </div>
                                      {(tempPreloaderSettings?.logoAnimation || "fade") === animItem.id && (
                                        <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw] text-indigo-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Preloader text */}
                  <div className="flex flex-col gap-[0.4vw]">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.85vw] font-medium text-gray-800">
                        Preloader text
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTempPreloaderSettings({
                            ...tempPreloaderSettings,
                            showText: tempPreloaderSettings?.showText === false ? true : false,
                          })
                        }
                        className={`w-[2.2vw] h-[1.2vw] rounded-full p-[0.1vw] transition-colors focus:outline-none cursor-pointer ${
                          tempPreloaderSettings?.showText !== false
                            ? "bg-[#4A3AFF]"
                            : "bg-gray-200 border border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-[1vw] h-[1vw] rounded-full bg-white shadow-sm transition-transform ${
                            tempPreloaderSettings?.showText !== false
                              ? "translate-x-[1vw]"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    {tempPreloaderSettings?.showText !== false && (
                      <>
                        <input
                          type="text"
                          placeholder="Preparing Flipibook"
                          value={
                            (!tempPreloaderSettings?.text ||
                             tempPreloaderSettings.text === "Loading Modal Please Wait...." ||
                             tempPreloaderSettings.text === "Loading Flipbook Please Wait...." ||
                             tempPreloaderSettings.text === "Preparing Flipbook...")
                              ? "Preparing Flipibook"
                              : tempPreloaderSettings.text
                          }
                          onChange={(e) =>
                            setTempPreloaderSettings({
                              ...tempPreloaderSettings,
                              text: e.target.value,
                            })
                          }
                          className="w-full px-[0.8vw] py-[0.5vw] bg-white border border-gray-200 rounded-[0.4vw] text-[0.8vw] focus:outline-none focus:border-indigo-500 text-gray-700"
                        />
                        <div className="grid grid-cols-2 gap-[0.5vw] mt-[0.2vw]">
                          <PremiumDropdown
                            options={fontFamilies}
                            value={tempPreloaderSettings?.font || "Poppins"}
                            onChange={(val) =>
                              setTempPreloaderSettings({
                                ...tempPreloaderSettings,
                                font: val,
                              })
                            }
                            width="100%"
                            isFont={true}
                          />
                          <PremiumDropdown
                            options={["10", "12", "14", "16", "18", "20", "24"]}
                            value={tempPreloaderSettings?.fontSize || "14"}
                            onChange={(val) =>
                              setTempPreloaderSettings({
                                ...tempPreloaderSettings,
                                fontSize: val,
                              })
                            }
                            width="100%"
                          />
                        </div>

                        {/* Position option: switch between Top and Bottom */}
                        <div className="flex items-center justify-between pt-[0.2vw]">
                          <span className="text-[0.78vw] font-medium text-gray-700">
                            Position
                          </span>
                          <div className="flex items-center gap-[0.2vw] p-[0.15vw] bg-gray-100 rounded-[0.4vw]">
                            <button
                              type="button"
                              onClick={() =>
                                setTempPreloaderSettings({
                                  ...tempPreloaderSettings,
                                  textPosition: "top",
                                })
                              }
                              className={`flex items-center gap-[0.25vw] px-[0.7vw] py-[0.25vw] rounded-[0.3vw] text-[0.72vw] font-medium transition-all cursor-pointer ${
                                tempPreloaderSettings?.textPosition === "top"
                                  ? "bg-white text-indigo-600 shadow-xs"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <Icon icon="lucide:arrow-up" className="w-[0.75vw] h-[0.75vw]" />
                              <span>Top</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setTempPreloaderSettings({
                                  ...tempPreloaderSettings,
                                  textPosition: "bottom",
                                })
                              }
                              className={`flex items-center gap-[0.25vw] px-[0.7vw] py-[0.25vw] rounded-[0.3vw] text-[0.72vw] font-medium transition-all cursor-pointer ${
                                (tempPreloaderSettings?.textPosition || "bottom") === "bottom"
                                  ? "bg-white text-indigo-600 shadow-xs"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <Icon icon="lucide:arrow-down" className="w-[0.75vw] h-[0.75vw]" />
                              <span>Bottom</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Preloader Colors */}
                  <div className="flex flex-col gap-[0.6vw]">
                    <span className="text-[0.85vw] font-medium text-gray-800">
                      Preloader Colors
                    </span>

                    {/* Text Color */}
                    <div className="flex items-center gap-[1vw]">
                      <span className="text-[0.8vw] font-medium text-gray-800 w-[5vw]">
                        Text Color :
                      </span>
                      <div
                        className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-gray-200 cursor-pointer shadow-sm hover:border-indigo-400"
                        style={{
                          backgroundColor:
                            tempPreloaderSettings?.textColor || "#1E293B",
                        }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPickerPos({
                            x: Math.min(
                              window.innerWidth - 260,
                              rect.left + 260,
                            ),
                            y: rect.top,
                          });
                          setShowPreloaderTextColorPicker(true);
                        }}
                      />
                      <div className="flex-1 flex items-center justify-between border border-gray-300 rounded-[0.4vw] px-[0.6vw] py-[0.4vw] bg-white">
                        <input
                          type="text"
                          value={(
                            tempPreloaderSettings?.textColor || "#1E293B"
                          ).toUpperCase()}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith("#")) val = "#" + val;
                            setTempPreloaderSettings((prev) => ({
                              ...prev,
                              textColor: val,
                            }));
                          }}
                          className="text-[0.8vw] text-gray-600 font-mono bg-transparent w-full outline-none"
                        />
                        <span className="text-[0.8vw] text-gray-500 font-mono ml-2">
                          100%
                        </span>
                      </div>
                    </div>

                    {/* Bg Color */}
                    <div className="flex items-center gap-[1vw]">
                      <span className="text-[0.8vw] font-medium text-gray-800 w-[5vw]">
                        Bg Color :
                      </span>
                      <div
                        className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-gray-200 cursor-pointer shadow-sm hover:border-indigo-400"
                        style={{
                          backgroundColor:
                            tempPreloaderSettings?.bgColor || "#D6E0F4",
                        }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPickerPos({
                            x: Math.min(
                              window.innerWidth - 260,
                              rect.left + 260,
                            ),
                            y: rect.top,
                          });
                          setShowPreloaderBgColorPicker(true);
                        }}
                      />
                      <div className="flex-1 flex items-center justify-between border border-gray-300 rounded-[0.4vw] px-[0.6vw] py-[0.4vw] bg-white">
                        <input
                          type="text"
                          value={(
                            tempPreloaderSettings?.bgColor || "#D6E0F4"
                          ).toUpperCase()}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith("#")) val = "#" + val;
                            setTempPreloaderSettings((prev) => ({
                              ...prev,
                              bgColor: val,
                            }));
                          }}
                          className="text-[0.8vw] text-gray-600 font-mono bg-transparent w-full outline-none"
                        />
                        <span className="text-[0.8vw] text-gray-500 font-mono ml-2">
                          100%
                        </span>
                      </div>
                    </div>

                    {/* Accent Color - only shown for preloader-only and both (hidden for logo-only) */}
                    {(tempPreloaderSettings?.displayOption || (tempPreloaderSettings?.layout === "logo-only" ? "logo-only" : (tempPreloaderSettings?.logo ? "both" : "preloader-only"))) !== "logo-only" && (
                      <div className="flex items-center gap-[1vw]">
                        <span className="text-[0.8vw] font-medium text-gray-800 w-[5vw]">
                          Accent :
                        </span>
                        <div
                          className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-gray-200 cursor-pointer shadow-sm hover:border-indigo-400"
                          style={{
                            backgroundColor:
                              (!tempPreloaderSettings?.spinnerColor || tempPreloaderSettings.spinnerColor === "#3B3C8A")
                                ? "#E04752"
                                : tempPreloaderSettings.spinnerColor,
                          }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setPickerPos({
                              x: Math.min(
                                window.innerWidth - 260,
                                rect.left + 260,
                              ),
                              y: rect.top,
                            });
                            setShowPreloaderSpinnerColorPicker(true);
                          }}
                        />
                        <div className="flex-1 flex items-center justify-between border border-gray-300 rounded-[0.4vw] px-[0.6vw] py-[0.4vw] bg-white">
                          <input
                            type="text"
                            value={(
                              (!tempPreloaderSettings?.spinnerColor || tempPreloaderSettings.spinnerColor === "#3B3C8A")
                                ? "#E04752"
                                : tempPreloaderSettings.spinnerColor
                            ).toUpperCase()}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (!val.startsWith("#")) val = "#" + val;
                              setTempPreloaderSettings((prev) => ({
                                ...prev,
                                spinnerColor: val,
                              }));
                            }}
                            className="text-[0.8vw] text-gray-600 font-mono bg-transparent w-full outline-none"
                          />
                          <span className="text-[0.8vw] text-gray-500 font-mono ml-2">
                            100%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Modal Preview Card (Shown below properties) */}
                  {(() => {
                    const currentOption = tempPreloaderSettings?.displayOption || (
                      tempPreloaderSettings?.layout === "logo-only"
                        ? "logo-only"
                        : (tempPreloaderSettings?.logo ? "both" : "preloader-only")
                    );
                    const modalLogoAnim = tempPreloaderSettings?.logoAnimation || "fade";
                    const modalAnimStyle = getLogoAnimationStyle(modalLogoAnim);
                    const modalBg = (!tempPreloaderSettings?.bgColor || tempPreloaderSettings.bgColor === "#D6E0F4")
                      ? "#22252A"
                      : tempPreloaderSettings.bgColor;
                    const modalColor = tempPreloaderSettings?.textColor || "#ffffff";
                    const modalSpinner = (!tempPreloaderSettings?.spinnerColor || tempPreloaderSettings.spinnerColor === "#3B3C8A")
                      ? "#E04752"
                      : tempPreloaderSettings.spinnerColor;
                    const modalLogoScale = ((tempPreloaderSettings?.logoSize !== undefined ? tempPreloaderSettings.logoSize : 100) / 100);
                    const previewRaw = tempPreloaderSettings?.text;
                    const previewText = (!previewRaw ||
                      previewRaw === "Loading Modal Please Wait...." ||
                      previewRaw === "Loading Flipbook Please Wait...." ||
                      previewRaw === "Preparing Flipbook...")
                        ? "Preparing Flipibook"
                        : previewRaw;

                    return (
                      <div className="flex flex-col gap-[0.35vw] pt-[0.2vw]">
                        <span className="text-[0.82vw] font-medium text-gray-800">Preview</span>
                        <div
                          className="relative w-full h-[6.5vw] min-h-[90px] rounded-[0.6vw] flex flex-col items-center justify-center border border-gray-700/30 overflow-hidden shadow-inner"
                          style={{ backgroundColor: modalBg, color: modalColor }}
                        >
                          <div className={`flex items-center gap-[0.3vw] ${tempPreloaderSettings?.textPosition === "top" ? "flex-col-reverse" : "flex-col"}`}>
                            {currentOption === "logo-only" ? (
                              <div className="flex flex-col items-center gap-[0.2vw]">
                                {tempPreloaderSettings?.logo ? (
                                  <div style={modalAnimStyle}>
                                    <img
                                      src={tempPreloaderSettings.logo}
                                      alt="Preloader Logo"
                                      className="object-contain drop-shadow-sm transition-all"
                                      style={{
                                        height: `${2 * modalLogoScale}vw`,
                                        maxWidth: `${5 * modalLogoScale}vw`,
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div style={modalAnimStyle}>
                                    <div
                                      className="rounded-[0.3vw] bg-white/10 flex items-center justify-center transition-all"
                                      style={{
                                        width: `${1.8 * modalLogoScale}vw`,
                                        height: `${1.8 * modalLogoScale}vw`,
                                      }}
                                    >
                                      <span style={{ fontSize: `${1 * modalLogoScale}vw` }}>📖</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-[0.25vw]">
                                {currentOption === "both" && tempPreloaderSettings?.logo && (
                                  <div className="flex items-center justify-center" style={modalAnimStyle}>
                                    <img
                                      src={tempPreloaderSettings.logo}
                                      alt="Preloader Logo"
                                      className="object-contain transition-all"
                                      style={{
                                        height: `${1.6 * modalLogoScale}vw`,
                                        maxWidth: `${4 * modalLogoScale}vw`,
                                      }}
                                    />
                                  </div>
                                )}
                                {tempPreloaderSettings?.layout === "bar" ? (
                                  <div className="w-[8vw] bg-gray-600/30 h-[0.3vw] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: "50%", backgroundColor: modalSpinner }} />
                                  </div>
                                ) : tempPreloaderSettings?.layout === "dots" ? (
                                  <div className="flex items-center gap-[0.3vw]">
                                    <div className="w-[0.4vw] h-[0.4vw] rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: modalSpinner }} />
                                    <div className="w-[0.4vw] h-[0.4vw] rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: modalSpinner }} />
                                    <div className="w-[0.4vw] h-[0.4vw] rounded-full animate-bounce" style={{ backgroundColor: modalSpinner }} />
                                  </div>
                                ) : (
                                  <div
                                    className="w-[1.2vw] h-[1.2vw] border-[2px] border-t-transparent rounded-full animate-spin"
                                    style={{ borderColor: `${modalSpinner} ${modalSpinner} ${modalSpinner} transparent` }}
                                  />
                                )}
                              </div>
                            )}
                            {tempPreloaderSettings?.showText !== false && (
                              <p
                                className="text-[0.68vw] font-medium text-center truncate max-w-[12vw]"
                                style={{
                                  color: modalColor,
                                  fontFamily: tempPreloaderSettings?.font || "Poppins",
                                }}
                              >
                                {previewText}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Fixed Footer */}
                <div className="px-[1.2vw] py-[0.8vw] border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      const defaultSettings = {
                        enabled: true,
                        isCustom: false,
                        displayOption: "preloader-only",
                        text: "Preparing Flipibook",
                        layout: "spinner",
                        logoAnimation: "fade",
                        spinnerColor: "#E04752",
                        bgColor: "#22252A",
                        textColor: "#ffffff",
                        showPercentage: false,
                        showText: true,
                        textPosition: "bottom",
                        logoSize: 100,
                        logo: "",
                      };
                      setTempPreloaderSettings(defaultSettings);
                    }}
                    className="px-[0.6vw] py-[0.35vw] text-[0.72vw] text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                  >
                    Reset to Default
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreloaderModal(false)}
                      className="px-[0.8vw] py-[0.4vw] rounded-[0.4vw] border border-gray-300 text-[0.78vw] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const isReset = tempPreloaderSettings?.isCustom === false;
                        onUpdatePreloader({
                          ...(preloaderSettings || {}),
                          ...(tempPreloaderSettings || {}),
                          isCustom: !isReset,
                        });
                        setShowPreloaderModal(false);
                      }}
                      className="px-[1vw] py-[0.4vw] rounded-[0.4vw] bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white text-[0.78vw] font-semibold cursor-pointer shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>

        {/* Gallery Modal */}
        {galleryTarget && (
          <div
            className="fixed z-[1000] bg-white border border-gray-100 rounded-[12px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
              width: "320px",
              height: "540px",
              top: "50%",
              left: "24vw",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="text-ms font-semibold text-gray-900">
                Image Gallery
              </h2>
              <button
                onClick={() => {
                  setGalleryTarget(null);
                  setLocalGallerySelected(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-4 py-2">
              <h3 className="text-[13px] font-semibold text-gray-900 mb-1">
                Upload your {galleryTarget === "logo" ? "Logo" : "Watermark"}
              </h3>
              <p className="text-[11px] text-gray-400 mb-4">
                <span>You Can Reuse The File Which Is Uploaded In Gallery</span>
                <span className="text-red-500">*</span>
              </p>
              <div
                onClick={() => galleryInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    handleModalFileUpload({ target: { files: [file] } });
                  }
                }}
                className="w-full h-[12vh] rounded-2xl flex flex-col items-center justify-center bg-white hover:bg-indigo-50  transition-all cursor-pointer group "
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%239ca3af' stroke-width='2' stroke-dasharray='6%2c4' stroke-linecap='square'/%3e%3c/svg%3e\")",
                }}
              >
                <p className="text-[0.9vw] text-gray-600 font-semibold mb-[0.5vw]">
                  Drag & Drop or{" "}
                  <span className="text-[#4F46E5] font-semibold">Upload</span>
                </p>
                <Icon
                  icon="lucide:upload"
                  className="w-[1.2vw] h-[1.2vw] text-gray-400 mb-2"
                />
                <div className="flex flex-col items-center">
                  <span className="text-[0.7vw] font-semibold text-gray-500">
                    Supported File
                  </span>
                  <span className="text-[0.7vw] font-semibold text-gray-500">
                    Image, Video, Audio, GIF, SVG
                  </span>
                </div>
              </div>
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleModalFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="custom-scrollbar overflow-y-auto max-h-[250px] px-4 py-2 flex-1">
              <h3 className="text-[13px] font-semibold text-gray-900 mb-1">
                Uploaded {galleryTarget === "logo" ? "Logos" : "Watermarks"}
              </h3>
              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map((img, index) => (
                    <div
                      key={img.id || index}
                      className="group cursor-pointer flex flex-col items-center"
                      onClick={() => setLocalGallerySelected(img)}
                    >
                      <div
                        className={`aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${localGallerySelected?.url === img.url ? "border-indigo-600 shadow-md scale-[1.02]" : "hover:border-indigo-400 border-gray-100"}`}
                      >
                        <img
                          src={img.url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No uploaded images yet</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t flex justify-end gap-2 bg-white mt-auto">
              <button
                onClick={() => {
                  setGalleryTarget(null);
                  setLocalGallerySelected(null);
                }}
                className="flex-1 h-8 border border-gray-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-gray-50"
              >
                <Icon icon="lucide:x" className="w-4 h-4" /> Close
              </button>
              <button
                onClick={() => {
                  if (localGallerySelected && galleryTarget) {
                    if (galleryTarget === "logo") {
                      onUpdateLogo({
                        ...logoSettings,
                        src: localGallerySelected.url,
                        url: localGallerySelected.url,
                      });
                    } else if (galleryTarget === "watermark") {
                      onUpdateWatermark({
                        ...watermarkSettings,
                        src: localGallerySelected.url,
                      });
                    }
                    setGalleryTarget(null);
                    setLocalGallerySelected(null);
                  }
                }}
                disabled={!localGallerySelected}
                className={`flex-1 h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${localGallerySelected ? "bg-black text-white hover:bg-zinc-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <Icon icon="lucide:check" className="w-4 h-4" /> Place
              </button>
            </div>
          </div>
        )}

        {/* Crop Overlay */}
        {showCropOverlay && logoSettings?.src && (
          <ImageCropOverlay
            imageSrc={logoSettings.src}
            element={null}
            onSave={(cropData) => {
              onUpdateLogo({ ...logoSettings, cropData });
              setShowCropOverlay(false);
            }}
            onCancel={() => setShowCropOverlay(false)}
          />
        )}

        {showWatermarkCropOverlay && watermarkSettings?.src && (
          <ImageCropOverlay
            imageSrc={watermarkSettings.src}
            element={null}
            onSave={(cropData) => {
              onUpdateWatermark({ ...watermarkSettings, cropData });
              setShowWatermarkCropOverlay(false);
            }}
            onCancel={() => setShowWatermarkCropOverlay(false)}
          />
        )}

        {showPreloaderBgColorPicker && (
          <CustomColorPicker
            color={
              tempPreloaderSettings?.bgColor || "#22252A"
            }
            onChange={(color) => {
              setTempPreloaderSettings((prev) => ({
                ...prev,
                bgColor: color,
              }));
            }}
            onClose={() => setShowPreloaderBgColorPicker(false)}
            position={pickerPos}
          />
        )}

        {showPreloaderTextColorPicker && (
          <CustomColorPicker
            color={
              tempPreloaderSettings?.textColor || "#ffffff"
            }
            onChange={(color) => {
              setTempPreloaderSettings((prev) => ({
                ...prev,
                textColor: color,
              }));
            }}
            onClose={() => setShowPreloaderTextColorPicker(false)}
            position={pickerPos}
          />
        )}

        {showPreloaderSpinnerColorPicker && (
          <CustomColorPicker
            color={
              tempPreloaderSettings?.spinnerColor || "#E04752"
            }
            onChange={(color) => {
              setTempPreloaderSettings((prev) => ({
                ...prev,
                spinnerColor: color,
              }));
            }}
            onClose={() => setShowPreloaderSpinnerColorPicker(false)}
            position={pickerPos}
          />
        )}

        {replaceTarget && (
          <ReplaceMediaModal
            show={!!replaceTarget}
            size="small"
            titleText="Add Image"
            buttonText="Add Image"
            onClose={() => setReplaceTarget(null)}
            onReplace={(file) => {
              if (replaceTarget === "logo") {
                handleLogoReplace(file);
              } else if (replaceTarget === "platformWatermark") {
                handlePlatformWatermarkReplace(file);
              } else if (replaceTarget === "watermark") {
                handleWatermarkReplace(file);
              } else if (replaceTarget === "preloaderLogo") {
                handlePreloaderLogoReplace(file);
              }
            }}
            mediaType="image"
          />
        )}

        <AlertModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget === "logo") removeLogo();
            else if (deleteTarget === "platformWatermark") removePlatformWatermark();
            else if (deleteTarget === "watermark") removeWatermark();
          }}
          type="warning"
          title="Delete Image"
          message="Are you sure you want to delete this image? This action cannot be undone."
          showCancel={true}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

export const BrandingPanel = Branding;
export { Branding };
export default BrandingPanel;
