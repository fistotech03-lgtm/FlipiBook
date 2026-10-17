import { useEffect, useRef } from 'react';
import axios from 'axios';
import { LAYOUT_DEFAULT_COLORS } from '../utils/layoutColors';
import { getTint, isLightColor, ensureDarkText } from '../utils/colorHelpers';
import { getDominantColors, REACT_BITS_THEMES_COLORS } from '../../../utils/colorExtractor';

export const useDynamicLayoutColors = ({
  backgroundSettings,
  layoutSettings,
  setLayoutColors,
  v_id,
  user,
  folder,
  bookNameRef,
  bookName,
}) => {
  const prevBackgroundRef = useRef({
    style: backgroundSettings.style,
    image: backgroundSettings.image,
    video: backgroundSettings.video,
    reactBitType: backgroundSettings.reactBitType,
    applyDynamicColor: backgroundSettings.applyDynamicColor
  });

  useEffect(() => {
    const { style, image, video, media, reactBitType, applyDynamicColor } = backgroundSettings;
    const isDynamicEnabled = applyDynamicColor !== false;
    const activeImage = image || media;
    const activeVideo = video || media || image;
    const prev = prevBackgroundRef.current;

    // Only trigger if the background source actually changed or the toggle changed
    const sourceChanged = (style !== prev.style) || (image !== prev.image) || (video !== prev.video) || (reactBitType !== prev.reactBitType);
    const toggleChanged = (isDynamicEnabled !== prev.applyDynamicColor);

    if (sourceChanged || toggleChanged) {
      prevBackgroundRef.current = { style, image, video, reactBitType, applyDynamicColor: isDynamicEnabled };

      const isThemeActive = style === 'ReactBits' || style === 'Image' || style === 'Video' || style === 'Media';

      if (!isDynamicEnabled || !isThemeActive) {
        setLayoutColors(prevColors => {
          const updated = { ...prevColors };
          for (let i = 1; i <= 9; i++) {
            updated[i] = [...(LAYOUT_DEFAULT_COLORS[i] || [])];
          }
          delete updated.toolbarColor;
          delete updated.popupColor;
          if (v_id) {
            const userEmail = user?.emailId || user?.email;
            const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
            axios.post(`${backendUrl}/api/flipbook/update-settings`, {
              userID: user?.userID,
              emailId: userEmail,
              v_id: v_id,
              folderName: folder || 'Recent Book',
              bookName: bookNameRef?.current || bookName,
              Background: backgroundSettings,
              Layouts: {
                layoutStyle: layoutSettings,
                layoutColors: updated
              }
            }, { withCredentials: true }).catch(err => console.warn("Reset layout colors DB save warning:", err));
          }
          return updated;
        });
        return;
      }

      const applyExtractedColors = async () => {
        let extracted = null;
        if (style === 'ReactBits' && reactBitType) {
          extracted = REACT_BITS_THEMES_COLORS[reactBitType];
        } else if (activeImage) {
          extracted = await getDominantColors(activeImage, false);
        } else if (activeVideo) {
          extracted = await getDominantColors(activeVideo, true);
        }

        if (extracted) {
          const { dark, light } = extracted;

          setLayoutColors(prevColors => {
            const updated = { ...prevColors };

            // Apply to all 9 layouts
            for (let i = 1; i <= 9; i++) {
              const defaults = LAYOUT_DEFAULT_COLORS[i] || [];
              const current = updated[i] || [];

              // Ensure we have a complete list of colors based on defaults
              let layoutColorsList = defaults.map(d => {
                const s = current.find(c => c.id === d.id);
                return s ? { ...s } : { ...d };
              });

              const primaryIds = ['toolbar-bg', 'bottom-toolbar-bg', 'page-number-bg', 'toc-bg', 'dropdown-bg', 'thumbnail-outer-v2', 'thumbnail-inner-v2', 'toc-overlay'];
              const secondaryIds = ['toolbar-text-main', 'toolbar-icon', 'toc-text', 'dropdown-text', 'dropdown-icon', 'toc-icon', 'page-number-text'];
              const shadeIds = ['search-bg-v1', 'search-bg-v2', 'reset-bg'];

              layoutColorsList = layoutColorsList.map(c => {
                if (primaryIds.includes(c.id)) return { ...c, hex: dark };
                if (secondaryIds.includes(c.id)) {
                  let targetHex = light;
                  let targetOpacity = c.opacity;
                  return { ...c, hex: targetHex, opacity: targetOpacity };
                }
                if (shadeIds.includes(c.id)) return { ...c, hex: getTint(dark, 0.75) };

                if (c.id === 'search-text-v1') {
                  const isLightBar = isLightColor(dark);
                  return { ...c, hex: ensureDarkText(isLightBar ? light : dark), opacity: 100 };
                }

                return c;
              });

              updated[i] = layoutColorsList;
            }

            updated.toolbarColor = {
              primary: dark,
              secondary: light
            };
            updated.popupColor = {
              primary: dark,
              secondary: light
            };

            if (v_id) {
              const userEmail = user?.emailId || user?.email;
              const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
              axios.post(`${backendUrl}/api/flipbook/update-settings`, {
                userID: user?.userID,
                emailId: userEmail,
                v_id: v_id,
                folderName: folder || 'Recent Book',
                bookName: bookNameRef?.current || bookName,
                Background: backgroundSettings,
                Layouts: {
                  layoutStyle: layoutSettings,
                  layoutColors: updated
                }
              }, { withCredentials: true }).catch(err => console.warn("Extracted layout colors DB save warning:", err));
            }

            return updated;
          });
        }
      };

      applyExtractedColors();
    }
  }, [
    backgroundSettings.style,
    backgroundSettings.image,
    backgroundSettings.video,
    backgroundSettings.reactBitType,
    backgroundSettings.applyDynamicColor
  ]);
};
