import { CommonDropBox } from "../components/CommonDropBox";
import { GlbThumbnail } from "../components/GlbPreview";
import { Icon } from "@iconify/react";

/** Interaction editor — 3D Viewer: pick / upload the 3D model. */
const ThreeDViewerAction = ({
  activePageIndex,
  interactionType = "3d-viewer",
  item,
  openDropdownId,
  resolvedValue,
  setActive3DGalleryItem,
  setAlertState,
  setCurrent3DItem,
  setIs3DModalOpen,
  setItemValueOverrides,
  setOpenDropdownId,
  updateElementAttribute,
}) => {
  let fileMeta = null;
  try {
    if (
      resolvedValue &&
      resolvedValue.startsWith("{")
    ) {
      fileMeta = JSON.parse(resolvedValue);
    }
  } catch {}

  return (
    <div
      className="flex-1 min-w-0 flex flex-col gap-[1vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[0.8vw] text-gray-900 font-medium tracking-wide">
        {fileMeta
          ? (interactionType === "ar-view" ? "AR Model Preview" : "3D Model Preview")
          : "Upload 3D Model"}
      </span>

      {(() => {
        const handle3DFileSelect = (file) => {
          if (
            file &&
            (file.name.endsWith(".glb") ||
              file.name.endsWith(".gltf")) &&
            updateElementAttribute
          ) {
            const objectUrl =
              URL.createObjectURL(file);
            const storedVal = JSON.stringify({
              name: file.name,
              displayName: file.name,
              type: "model/gltf-binary",
              size: file.size,
              data: objectUrl,
              hotspots: [],
            });
            setItemValueOverrides((prev) => ({
              ...prev,
              [item.id]: storedVal,
            }));
            const targetIdx =
              item.pageIndex !== undefined
                ? item.pageIndex
                : activePageIndex;
            const defaultConfig = JSON.stringify({
              shadowStrength: 35,
              shadowSoftness: 35,
              autoRotate: true,
              autoRotateSpeed: 1.5,
              lockMaxZoom: true,
              maxZoom: 4.5,
              bgType: "Solid",
              bgColor: "#000000",
              customBg: true,
              enableAR: true,
              qrText: "Scan Me",
              qrColor: "#000000",
              qrBgType: "Solid",
              qrBgColor: "#ffffff",
              qrLevel: "L",
              qrDotType: "square",
              qrCornerSquareType: "square",
              qrCornerDotType: "square",
              qrLogo: null,
              topText: "You can Rotate 3D Model",
              bottomText: file.name || "3D Model",
            });
            updateElementAttribute(
              targetIdx,
              item.id,
              {
                "data-interaction": interactionType,
                "data-interaction-value":
                  storedVal,
                "data-interaction-config":
                  defaultConfig,
              },
            );
          }
        };

        return (
          <>
            {/* Hidden file input */}
            <input
              type="file"
              id={`3d-upload-${item.id}`}
              className="hidden"
              accept=".glb,.gltf"
              onChange={(e) =>
                handle3DFileSelect(
                  e.target.files?.[0],
                )
              }
            />

            {!fileMeta ? (
              <div className="flex flex-row w-full gap-[0.5vw] items-stretch">
                <div className="flex-1 h-[11vh]">
                  <CommonDropBox
                    id={`3d-upload-${item.id}`}
                    accept=".glb,.gltf"
                    onFileSelect={
                      handle3DFileSelect
                    }
                    fileMeta={fileMeta}
                    hideInput={true}
                    boxClassName="w-full h-[11vh] border-2 border-dashed border-[#8A94A6] rounded-[0.6vw] bg-[#F8F9FA] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all p-[0.3vw]"
                    emptyIcon="prime:upload"
                    subText="File Format : GLB"
                  />
                </div>
                <div
                  className="w-[6vw] h-[11vh] rounded-[0.6vw] flex flex-col items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive3DGalleryItem({ ...item, _interactionType: interactionType });
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80')",
                    }}
                  />
                  <div className="absolute inset-0 bg-[#0A0F1C] opacity-60 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] to-transparent opacity-80" />
                  <div className="z-10 flex flex-col items-center gap-[0.5vh]">
                    <Icon
                      icon="clarity:image-gallery-solid"
                      className="text-white text-[1.4vw]"
                    />
                    <span className="text-[0.8vw] font-medium text-white tracking-wide">
                      Gallery
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full gap-[1.2vh]">
                <div
                  className="w-full h-[18vh] border border-gray-200 rounded-[0.5vw] shadow-sm relative group bg-white flex items-center justify-center overflow-hidden cursor-default"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <div className="absolute inset-0 overflow-hidden rounded-[0.5vw] flex items-center justify-center">
                    <div className="absolute inset-0 bg-white z-0" />
                    {fileMeta?.data ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
                        <GlbThumbnail
                          dataUrl={fileMeta.data}
                        />
                      </div>
                    ) : (
                      <Icon
                        icon="gis:cube-3d"
                        className="text-[#5145F6] text-[2vw] relative z-10"
                      />
                    )}
                  </div>

                  {/* Hover Menu Overlay */}
                  <div
                    className={`absolute inset-0 transition-opacity z-20 pointer-events-none ${openDropdownId === "3d-menu-" + item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    {/* 3 dots menu */}
                    <div className="absolute top-[0.4vh] right-[0.2vw] pointer-events-auto">
                      <div
                        className="p-[0.2vw] cursor-pointer bg-white/50 rounded-full hover:bg-white/80 transition-colors backdrop-blur-sm"
                        data-dropdown-trigger="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId ===
                              `3d-menu-${item.id}`
                              ? null
                              : `3d-menu-${item.id}`,
                          );
                        }}
                      >
                        <Icon
                          icon="bi:three-dots-vertical"
                          className="text-gray-800 drop-shadow-sm text-[1.2vw]"
                        />
                      </div>

                      {openDropdownId ===
                        `3d-menu-${item.id}` && (
                        <div
                          data-dropdown-menu="true"
                          className="absolute top-[100%] right-0 mt-[0.5vh] w-[9.5vw] bg-white rounded-[0.4vw] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 py-[0.4vh] flex flex-col z-50"
                        >
                          <div
                            className="flex items-center gap-[0.5vw] px-[0.8vw] py-[0.6vh] hover:bg-gray-50 cursor-pointer transition-colors group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                null,
                              );
                              document
                                .getElementById(
                                  `3d-upload-${item.id}`,
                                )
                                ?.click();
                            }}
                          >
                            <Icon
                              icon="lucide:replace"
                              className="text-gray-800 text-[1.1vw] group-hover:text-black"
                            />
                            <span className="text-[0.75vw] text-gray-700 font-medium group-hover:text-gray-900">
                              Replace
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-[0.5vw] px-[0.8vw] py-[0.6vh] hover:bg-gray-50 cursor-pointer transition-colors group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                null,
                              );
                              if (!fileMeta) {
                                setAlertState({
                                  isOpen: true,
                                  title:
                                    "Action Required",
                                  message:
                                    "Please Place Interaction Before Edit Your Model",
                                  type: "warning",
                                });
                                return;
                              }
                              if (
                                fileMeta.data &&
                                fileMeta.data.startsWith(
                                  "blob:",
                                )
                              ) {
                                setAlertState({
                                  isOpen: true,
                                  title:
                                    "Save Required",
                                  message:
                                    "Please save your flipbook to continue editing the 3D model.",
                                  type: "warning",
                                  showCancel: true,
                                  confirmText:
                                    "Save and Go",
                                  cancelText:
                                    "Cancel",
                                  onConfirm:
                                    () => {
                                      setAlertState(
                                        (
                                          prev,
                                        ) => ({
                                          ...prev,
                                          isOpen: false,
                                        }),
                                      );
                                      window.dispatchEvent(
                                        new CustomEvent(
                                          "trigger-manual-save",
                                        ),
                                      );
                                      const handleSaved =
                                        () => {
                                          window.removeEventListener(
                                            "flipbook-saved",
                                            handleSaved,
                                          );
                                          setTimeout(
                                            () => {
                                              const editorDoc =
                                                document.getElementById(
                                                  "main-flipbook-editor",
                                                )
                                                  ?.contentDocument ||
                                                document;
                                              const activeContainer =
                                                editorDoc.querySelector(
                                                  `.page-svg-container[data-page-index="${activePageIndex}"]`,
                                                );
                                              const liveEl =
                                                activeContainer
                                                  ? activeContainer.querySelector(
                                                      `[id="${CSS.escape(item.id)}"]`,
                                                    )
                                                  : editorDoc.getElementById(
                                                      item.id,
                                                    );
                                              if (
                                                liveEl
                                              ) {
                                                const newVal =
                                                  liveEl.getAttribute(
                                                    "data-interaction-value",
                                                  );
                                                try {
                                                  const newMeta =
                                                    JSON.parse(
                                                      newVal,
                                                    );
                                                  localStorage.setItem(
                                                    "tempThreedEditModel",
                                                    JSON.stringify(
                                                      {
                                                        url: newMeta.data,
                                                        name: newMeta.name,
                                                        type:
                                                          newMeta.type ||
                                                          "glb",
                                                      },
                                                    ),
                                                  );
                                                  const editUrl =
                                                    newMeta.v_id
                                                      ? `/editor/threed_editor/${newMeta.v_id}`
                                                      : "/editor/threed_editor";
                                                  window.open(
                                                    editUrl,
                                                    "_blank",
                                                  );
                                                } catch {}
                                              }
                                            },
                                            200,
                                          );
                                        };
                                      window.addEventListener(
                                        "flipbook-saved",
                                        handleSaved,
                                      );
                                    },
                                });
                                return;
                              }
                              localStorage.setItem(
                                "tempThreedEditModel",
                                JSON.stringify({
                                  url: fileMeta.data,
                                  name: fileMeta.name,
                                  type:
                                    fileMeta.type ||
                                    "glb",
                                }),
                              );
                              const editUrl =
                                fileMeta.v_id
                                  ? `/editor/threed_editor/${fileMeta.v_id}`
                                  : "/editor/threed_editor";
                              window.open(
                                editUrl,
                                "_blank",
                              );
                            }}
                          >
                            <Icon
                              icon="lucide:settings-2"
                              className="text-gray-800 text-[1.1vw] group-hover:text-black"
                            />
                            <span className="text-[0.75vw] text-gray-700 font-medium group-hover:text-gray-900">
                              3D Edit
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-[0.5vw] px-[0.8vw] py-[0.6vh] hover:bg-gray-50 cursor-pointer transition-colors group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                null,
                              );
                              setActive3DGalleryItem({
                                ...item,
                                _interactionType: interactionType,
                              });
                            }}
                          >
                            <Icon
                              icon="clarity:image-gallery-solid"
                              className="text-gray-800 text-[1.1vw] group-hover:text-black"
                            />
                            <span className="text-[0.75vw] text-gray-700 font-medium group-hover:text-gray-900">
                              3D Gallery
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-[0.5vw] px-[0.8vw] py-[0.6vh] hover:bg-red-50 cursor-pointer transition-colors group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                null,
                              );
                              setItemValueOverrides(
                                (prev) => ({
                                  ...prev,
                                  [item.id]: null,
                                }),
                              );
                              if (
                                updateElementAttribute
                              ) {
                                const targetIdx =
                                  item.pageIndex !==
                                  undefined
                                    ? item.pageIndex
                                    : activePageIndex;
                                updateElementAttribute(
                                  targetIdx,
                                  item.id,
                                  {
                                    "data-interaction":
                                      interactionType,
                                    "data-interaction-value":
                                      "",
                                  },
                                );
                              }
                            }}
                          >
                            <Icon
                              icon="ic:round-clear"
                              className="text-[#EF4444] text-[1.1vw] group-hover:text-red-600"
                            />
                            <span className="text-[0.75vw] text-[#EF4444] font-medium group-hover:text-red-600">
                              Clear
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="w-full h-[4.5vh] border border-gray-200 rounded-[0.5vw] shadow-sm bg-white flex items-center justify-center gap-[0.6vw] hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      fileMeta &&
                      fileMeta.data
                    ) {
                      const itemWithType = item && typeof item.getAttribute === "function"
                        ? item
                        : { ...item, "data-interaction": interactionType, _interactionType: interactionType };
                      if (item && typeof item.setAttribute === "function") {
                        item.setAttribute("data-interaction", interactionType);
                      }
                      setCurrent3DItem(itemWithType);
                      setIs3DModalOpen(true);
                    }
                  }}
                >
                  <Icon
                    icon="bx:edit"
                    className="text-black text-[1.3vw]"
                  />
                  <span className="text-[0.9vw] font-medium text-black tracking-wide">
                    {interactionType === "ar-view" ? "AR Popup View" : "Edit Popup View"}
                  </span>
                </button>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};

export default ThreeDViewerAction;
