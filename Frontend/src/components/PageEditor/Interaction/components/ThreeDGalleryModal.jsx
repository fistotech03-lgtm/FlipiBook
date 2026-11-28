import ModelGalleryModal from "../../../ThreedEditor/Components/ModelGalleryModal";
import axios from "axios";
import { resolveUploadsPath } from "../../../../utils/assets/assetUtils";

/** 3D model gallery modal. */
const ThreeDGalleryModal = ({
  active3DGalleryItem,
  activePageIndex,
  setActive3DGalleryItem,
  setItemValueOverrides,
  updateElementAttribute,
}) => (
  <ModelGalleryModal
    isOpen={!!active3DGalleryItem}
    onClose={() => setActive3DGalleryItem(null)}
    hideDelete={true}
    onSelectModel={async (model) => {
      if (!active3DGalleryItem) return;
      const currentItem = active3DGalleryItem;
      setActive3DGalleryItem(null); // Close modal immediately

      const rawUrl = model.url || "";
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || "")
        .trim()
        .replace(/\/+$/, "");

      // Normalize URL: resolve paths and ensure it points to active backendUrl if pointing to local ports
      let fullUrl = rawUrl;
      if (
        fullUrl.startsWith("http://localhost:") ||
        fullUrl.startsWith("http://127.0.0.1:")
      ) {
        fullUrl = fullUrl.replace(
          /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i,
          backendUrl,
        );
      } else {
        fullUrl = resolveUploadsPath(fullUrl);
      }
      if (fullUrl.startsWith("/") && !fullUrl.startsWith("//")) {
        fullUrl = `${backendUrl}${fullUrl}`;
      }

      let objectUrl = null;
      let blobSize = model.size || 0;

      // Attempt to fetch model as a blob (first via fetch, then axios fallback)
      if (fullUrl) {
        try {
          const response = await fetch(fullUrl);
          if (response.ok) {
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            blobSize = blob.size;
          }
        } catch (fetchErr) {
          try {
            const axiosRes = await axios.get(fullUrl, {
              responseType: "blob",
            });
            if (axiosRes && axiosRes.data) {
              objectUrl = URL.createObjectURL(axiosRes.data);
              blobSize = axiosRes.data.size || blobSize;
            }
          } catch (axiosErr) {
            console.warn(
              "Could not fetch gallery model as blob, using direct URL:",
              axiosErr,
            );
          }
        }
      }

      // Fetch latest model details including hotspots if modelId is present
      let modelHotspots = Array.isArray(model.hotspots)
        ? model.hotspots
        : [];
      let modelDisplayName = model.displayName || model.name || "3D Model";
      const modelId = model.modelId || model.v_id;
      if (modelId) {
        try {
          const detailRes = await axios.get(
            `${backendUrl}/api/3d-models/get-model/${modelId}`,
          );
          if (detailRes.data) {
            if (Array.isArray(detailRes.data.hotspots)) {
              modelHotspots = detailRes.data.hotspots;
            }
            if (detailRes.data.displayName) {
              modelDisplayName = detailRes.data.displayName;
            }
          }
        } catch (e) {
          console.warn("Could not fetch detailed model metadata:", e);
        }
      }

      const storedVal = JSON.stringify({
        name: model.name || "model.glb",
        displayName: modelDisplayName,
        v_id: modelId || null,
        modelId: modelId || null,
        sourceModelId: modelId || null,
        type: model.type || "model/gltf-binary",
        size: blobSize || model.size || 0,
        data: objectUrl || fullUrl,
        url: fullUrl,
        fromGallery: true,
        hotspots: modelHotspots,
      });

      setItemValueOverrides((prev) => ({
        ...prev,
        [currentItem.id]: storedVal,
      }));
      const targetIdx =
        currentItem.pageIndex !== undefined
          ? currentItem.pageIndex
          : activePageIndex;
      const galleryModelName = modelDisplayName;
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
        bottomText: galleryModelName,
      });
      if (updateElementAttribute) {
        const interactionType = currentItem?._interactionType || (currentItem?.["data-interaction"] === "ar-view" ? "ar-view" : "3d-viewer");
        updateElementAttribute(targetIdx, currentItem.id, {
          "data-interaction": interactionType,
          "data-interaction-value": storedVal,
          "data-interaction-config": defaultConfig,
        });
      }
    }}
  />
);

export default ThreeDGalleryModal;
