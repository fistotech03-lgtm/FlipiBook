import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Icon, addIcon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useConfirm } from "../../../context/ConfirmationContext";
import SidebarItem from "./SidebarItem";
import FlipbookInfoModal from "../../FlipbookInfoModal";
import { BackgroundIcon } from "../AppearanceShared";

// Register background icon with NO inside gray color shade (fully transparent interior)
addIcon('andrsrxn:background', {
  width: 24,
  height: 24,
  body: '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.68 21.32h2.64c3.77 0 5.66 0 6.83-1.17s1.17-3.06 1.17-6.83v-2.64c0-3.77 0-5.66-1.17-6.83s-3.06-1.17-6.83-1.17h-2.64c-3.77 0-5.66 0-6.83 1.17s-1.17 3.06-1.17 6.83v2.64c0 3.77 0 5.66 1.17 6.83s3.06 1.17 6.83 1.17m-7.64-9.4l9.23 9.24M3.9 3.8l16.28 16.28M11.75 2.86l9.2 9.2"/>'
});

const AttachedCurve = ({ position }) => {
  const isTop = position.includes("top");
  const isLeft = position.includes("left");

  const containerStyle = {
    position: "absolute",
    width: "1vw",
    height: "1.5vw",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: 1998,
    ...(isTop ? { top: "-0.8vw" } : { bottom: "-0.8vw" }),
    ...(isLeft ? { left: "0" } : { right: "0" }),
  };

  const circleStyle = {
    position: "absolute",
    width: "1.5vw",
    height: "1.6vw",
    borderRadius: "60%",
    boxShadow: "0 0 0 2vw #ffffff",
    ...(isTop ? { top: "-0.8vw" } : { bottom: "-0.8vw" }),
    ...(isLeft ? { right: "-0.8vw" } : { left: "-0.8vw" }),
  };

  return (
    <div style={containerStyle}>
      <div style={circleStyle} />
    </div>
  );
};

const Sidebar = ({
  bookName,
  setBookName,
  activeSubView,
  setActiveSubView,
  isPanelCollapsed,
  setIsPanelCollapsed,
  pageCount,
  onSave,
  currentBook,
  setCurrentBook,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { folder, v_id } = useParams();
  const confirm = useConfirm();
  const { hasUnsavedChanges, isAutoSaveEnabled } = useOutletContext() || {};
  const [openSection, setOpenSection] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleGoToPageEditor = async () => {
    if (hasUnsavedChanges) {
      if (!isAutoSaveEnabled) {
        const ok = await confirm({
          title: "Leave Site?",
          message: "Changes you made may not be saved.",
          confirmText: "Leave",
          cancelText: "Stay",
          type: "danger",
        });
        if (!ok) return;
      } else {
        if (onSave) {
          try {
            await onSave();
          } catch (e) {
            console.warn(
              "Auto-save before navigating to page editor failed:",
              e,
            );
          }
        }
      }
    }
    const isFolId = (val) =>
      Boolean(
        val &&
        typeof val === "string" &&
        (val.startsWith("fol_") ||
          /^[0-9a-fA-F]{12,24}$/.test(val) ||
          val === "fol_default" ||
          val === "default"),
      );
    const folderVId =
      currentBook?.folder_v_id ||
      currentBook?.folder_id ||
      (folder && isFolId(folder) ? folder : "default");
    const path = folderVId
      ? `/editor/${encodeURIComponent(folderVId)}/${v_id}`
      : `/editor/${v_id}`;
    navigate(path);
  };

  const getParentSection = (subView) => {
    if (!subView) return null;
    if (subView === "logo" || subView === "profile") return "branding";
    if (["background", "layout", "bookappearance"].includes(subView))
      return "appearance";
    if (
      ["menubar", "othersetup", "leadform", "visibility", "statistic"].includes(
        subView,
      )
    )
      return subView;
    return null;
  };

  const parentSection = getParentSection(activeSubView);

  const [tabTop, setTabTop] = useState(154);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);
  const bookNameInputRef = useRef(null);
  const hasMovedRef = useRef(false);
  const isManuallyPositioned = useRef(false); // true after user drags to a custom position

  const [allBooks, setAllBooks] = useState([]);
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);

  // Fetch all user books for title uniqueness validation (matching main editor behavior)
  useEffect(() => {
    const fetchBooks = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      try {
        const res = await axios.get(`${backendUrl}/api/flipbook/list`, {
          params: {
            ...(user?.userId || user?._id || user?.id
              ? { userId: user?.userId || user?._id || user?.id }
              : {}),
            ...(user?.userID ? { customUserId: user?.userID } : {}),
            ...(user?.emailId || user?.email
              ? { emailId: user?.emailId || user?.email }
              : {}),
          },
          withCredentials: true,
        });
        if (res.data && res.data.books) {
          setAllBooks(res.data.books);
        }
      } catch (err) {
        console.error("Error fetching books for validation:", err);
      }
    };
    fetchBooks();
  }, [user]);

  const checkDuplicate = (name) => {
    if (!name || !name.trim()) return false;
    const isDup = allBooks.some((b) => {
      const bTitle = b.title || b.flipbookName || b.realName || "";
      return (
        bTitle.toLowerCase() === name.trim().toLowerCase() &&
        (v_id
          ? b.v_id !== v_id && b.id !== v_id
          : b.realName !== currentBook?.flipbookName)
      );
    });
    setIsNameDuplicate(isDup);
    return isDup;
  };

  // Synchronize openSection with activeSubView
  useEffect(() => {
    const parent = getParentSection(activeSubView);
    if (parent) {
      setOpenSection(parent);
    }
    // Reset manual positioning when switching to a new sub-view
    isManuallyPositioned.current = false;
  }, [activeSubView]);

  // Dynamic Tab Positioning — skipped if user has manually dragged the tab
  useEffect(() => {
    const updateTabPos = () => {
      if (isDragging || isManuallyPositioned.current || !sidebarRef.current)
        return;

      let anchor = null;

      // 1. Try to find the visible active sub-nav item
      const subNav = sidebarRef.current.querySelector(".active-sub-nav");
      if (subNav) {
        const subNavParent = subNav.closest(".overflow-hidden");
        // Check if the accordion container is expanded (max-h > 0)
        if (subNavParent && !subNavParent.classList.contains("max-h-0")) {
          anchor = subNav;
        }
      }

      // 2. Fallback: Find the parent section button (it now has a section-specific ID)
      if (!anchor && parentSection) {
        anchor = sidebarRef.current.querySelector(`#section-${parentSection}`);
      }

      // 3. Last fallback: any active sidebar item
      if (!anchor) {
        anchor = sidebarRef.current.querySelector(".active-sidebar-item");
      }

      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const parentRect = sidebarRef.current.getBoundingClientRect();
        const relativeTop = rect.top - parentRect.top + rect.height / 2 - 24;
        setTabTop(relativeTop);
      }
    };

    updateTabPos();
    const timer = setTimeout(updateTabPos, 300); // Wait for accordion transition

    window.addEventListener("resize", updateTabPos);
    return () => {
      window.removeEventListener("resize", updateTabPos);
      clearTimeout(timer);
    };
  }, [activeSubView, openSection, isDragging, parentSection]);

  const tabConfigs = {
    logo: { icon: "fluent-mdl2:verified-brand", top: 154 },
    profile: { icon: "lucide:user", top: 206 },
    background: {
      icon: "andrsrxn:background",
      customComponent: <BackgroundIcon className="w-[1.3vw] h-[1.3vw]" />,
      top: 326,
    },
    layout: { icon: "lucide:layout-panel-left", top: 378 },
    bookappearance: { icon: "basil:book-open-outline", top: 430 },
    menubar: { icon: "fluent:layout-row-two-settings-24-regular", top: 482 },
    othersetup: { icon: "qlementine-icons:page-setup-16", top: 534 },
    leadform: { icon: "fluent:form-multiple-24-regular", top: 586 },
    visibility: { icon: "si:lock-line", top: 638 },
    statistic: { icon: "famicons:analytics", top: 690 },
  };

  const activeTab = tabConfigs[activeSubView];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sidebarRef.current) return;
      hasMovedRef.current = true;
      isManuallyPositioned.current = true; // user is setting a custom position
      const rect = sidebarRef.current.getBoundingClientRect();
      const newTop = e.clientY - rect.top;
      setTabTop(Math.max(10, Math.min(newTop, rect.height - 60)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // If user just clicked (no drag movement), toggle the panel
      if (!hasMovedRef.current) {
        setIsPanelCollapsed((prev) => !prev);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={sidebarRef}
      className="w-[16.25vw] h-full bg-[#ffffff] border-r border-gray-200 flex flex-col relative z-30 overflow-visible select-none text-gray-800"
    >
      {/* Draggable Tab Handle and Full-height Line — only visible when sub-panel is collapsed */}
      {activeSubView && activeTab && isPanelCollapsed && (
        <div className="absolute left-full top-0 -w-[3vw] h-full pointer-events-none z-50">
          {/* The full-height vertical line (0.25vw wide) */}
          <div className="absolute left-[-1px] top-0 w-[0.25vw] h-full bg-[#ffffff] pointer-events-auto select-none shadow-[0.1vw_0_0.5vw_rgba(0,0,0,0.1)]" />

          {/* The Draggable icon itself - repositioned to overlap with the line */}
          <div
            onMouseDown={handleMouseDown}
            className={`absolute flex items-stretch rounded-r-[0.6vw] cursor-pointer shadow-[0.2vw_0_1vw_rgba(0,0,0,0.15)] pointer-events-auto select-none group ${
              isDragging ? "cursor-grabbing scale-100" : "cursor-grab"
            }`}
            style={{
              top: `${tabTop}px`,
              left: "-0.2vw",
              transition: isDragging
                ? "none"
                : "top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.1s ease",
            }}
          >
            <AttachedCurve position="top-left" />
            <AttachedCurve position="bottom-left" />
            {/* Internal overflow-hidden container for icons/background */}
            <div className="flex items-stretch rounded-r-[0.6vw] overflow-hidden min-h-[2.6vw] bg-[#ffffff]">
              {/* Connector strip to ensure no gap with the line */}
              <div className="w-[0.25vw] h-full bg-[#ffffff] flex-shrink-0" />
              <div className="w-[2.6vw] h-[2.6vw] bg-[#ffffff] text-gray-800 flex items-center justify-center select-none">
                {activeTab.customComponent || <Icon icon={activeTab.icon} className="w-[1.3vw] h-[1.3vw]" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Title Header Section */}
      <div className="px-[1vw] py-[0.75vw] shrink-0 border-b border-gray-100">
        {isLoading ? (
          <div className="flex flex-col gap-[0.4vw] animate-pulse">
            <div className="h-[0.9vw] bg-gray-200/75 rounded-[0.25vw] w-3/4"></div>
            <div className="h-[0.7vw] bg-gray-100 rounded-[0.2vw] w-1/3 mt-[0.1vw]"></div>
          </div>
        ) : (
          <div className="flex flex-col justify-center min-w-0">
            <div
              className={`flex items-center gap-[0.35vw] min-w-0 w-full ${isNameDuplicate ? "text-red-500" : ""}`}
            >
              <span className="text-[0.72vw] text-gray-500 font-medium tracking-wide shrink-0 select-none">
                Book :
              </span>
              <input
                ref={bookNameInputRef}
                type="text"
                value={bookName}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  setBookName(val);
                  checkDuplicate(val);
                }}
                onBlur={() => {
                  if (isNameDuplicate) {
                    alert(
                      "Book name already exists. Please choose a different name.",
                    );
                    if (bookNameInputRef.current)
                      bookNameInputRef.current.select();
                  } else if (onSave) {
                    onSave();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isNameDuplicate) {
                      alert(
                        "Book name already exists. Please choose a different name.",
                      );
                      if (bookNameInputRef.current)
                        bookNameInputRef.current.select();
                    } else {
                      e.target.blur();
                      if (onSave) onSave();
                    }
                  }
                }}
                className={`text-[0.88vw] font-medium bg-transparent border border-transparent hover:border-gray-300 focus:border-indigo-400 focus:bg-gray-50 rounded-[0.3vw] px-[0.3vw] py-[0.1vw] -ml-[0.3vw] focus:ring-0 focus:outline-none w-full leading-snug tracking-tight truncate transition-all duration-150 ${isNameDuplicate ? "text-red-500 placeholder-red-400" : "text-gray-900 placeholder-gray-400"}`}
                placeholder="Name of the Book"
              />
            </div>

            <div className="flex items-center mt-[0.3vw]">
              <span className="text-[0.72vw] text-gray-500 font-medium tracking-wide">
                Pages : {pageCount || 10}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto pt-[0.5vw] custom-scrollbar px-[0.2vw] flex flex-col">
        {isLoading ? (
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="flex flex-col px-[0.75vw] py-[0.25vw]">
                <div className="w-full flex items-center gap-[1vw] p-[0.75vw] rounded-[0.75vw] bg-gray-100/70 border border-gray-200/60 animate-pulse">
                  <div className="w-[1.25vw] h-[1.25vw] bg-gray-200/80 rounded-[0.35vw] shrink-0" />
                  <div className="h-[0.85vw] bg-gray-200/80 rounded-[0.35vw] flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <SidebarItem
              id="section-info"
              icon="fluent:info-24-regular"
              label="Flipbook Info"
              isActive={isInfoModalOpen}
              onClick={() => setIsInfoModalOpen(true)}
              hasDropdown={false}
            />

            <SidebarItem
              id="section-background"
              icon={<BackgroundIcon />}
              label="Background"
              isActive={activeSubView === "background"}
              onClick={() => setActiveSubView("background")}
              hasDropdown={false}
            />

            <SidebarItem
              id="section-layout"
              icon="lucide:layout-panel-left"
              label="Layout Design"
              isActive={activeSubView === "layout"}
              onClick={() => setActiveSubView("layout")}
              hasDropdown={false}
            />

            <SidebarItem
              id="section-menubar"
              icon="fluent:layout-row-two-settings-24-regular"
              label="Layout Settings"
              isActive={activeSubView === "menubar"}
              onClick={() => setActiveSubView("menubar")}
              hasDropdown={false}
            />

            <SidebarItem
              id="section-bookappearance"
              icon="basil:book-open-outline"
              label="Book Appearance"
              isActive={activeSubView === "bookappearance"}
              onClick={() => setActiveSubView("bookappearance")}
              hasDropdown={false}
            />

            <SidebarItem
              id="section-leadform"
              icon="fluent:form-multiple-24-regular"
              label="Lead Form"
              isActive={activeSubView === "leadform"}
              onClick={() => setActiveSubView("leadform")}
              hasDropdown={false}
            />

            <SidebarItem
              id="section-visibility"
              icon="si:lock-line"
              label="Visibility & Privacy"
              isActive={activeSubView === "visibility"}
              onClick={() => setActiveSubView("visibility")}
              hasDropdown={false}
            />

            <div className="w-[calc(100%-2vw)] h-[1px] bg-gray-200 mx-[1vw] my-[0.5vh]"></div>

            <SidebarItem
              id="section-branding"
              icon="fluent-mdl2:verified-brand"
              label="Branding"
              isActive={
                activeSubView === "branding" || activeSubView === "logo"
              }
              onClick={() => setActiveSubView("logo")}
              hasDropdown={false}
            />
          </>
        )}
      </div>
      {/* Go to Page Editor Button */}
      <div className="px-[1vw] py-[2vh] border-t border-gray-100 mt-auto bg-[#ffffff]">
        {isLoading ? (
          <div className="w-full h-[2.5vw] bg-gray-100 rounded-[0.6vw] animate-pulse"></div>
        ) : (
          <button
            onClick={handleGoToPageEditor}
            className="w-full bg-[#1a2332] text-white hover:bg-[#253245] py-[1.2vh] rounded-[0.6vw] text-[0.8vw] font-semibold flex items-center justify-center gap-[0.8vw] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.18)] cursor-pointer"
          >
            <ArrowUpRight size="1.2vw" className="rotate-0 text-white" />
            <span>Go to Page Editor</span>
          </button>
        )}
      </div>
      {/* Flipbook Information Modal */}
      <FlipbookInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        currentBook={
          currentBook || { flipbookName: bookName, pageCount: pageCount }
        }
        onSaveSuccess={(data) => {
          if (data?.bookName) setBookName(data.bookName);
          if (setCurrentBook) {
            setCurrentBook((prev) => ({
              ...(prev || {}),
              flipbookName: data?.bookName || prev?.flipbookName,
              quotes: data?.quotes,
              about: data?.about,
              category: data?.category,
              language: data?.language,
              thumbnail: data?.coverPicture?.url || prev?.thumbnail,
              coverPicture: data?.coverPicture || prev?.coverPicture,
              meta: {
                ...(prev?.meta || {}),
                quotes: data?.quotes,
                about: data?.about,
                category: data?.category,
                language: data?.language,
                coverPicture: data?.coverPicture || prev?.meta?.coverPicture,
              },
              settings: {
                ...(prev?.settings || {}),
                othersetup: {
                  ...(prev?.settings?.othersetup || {}),
                  coverPicture:
                    data?.coverPicture ||
                    prev?.settings?.othersetup?.coverPicture,
                },
              },
            }));
          }
        }}
      />
    </div>
  );
};

export default Sidebar;
