/**
 * preloadUtils.js
 * Eagerly preloads and warms up editor bundles in the background
 * to eliminate lazy-load delays, blank screen flashes, and compile pauses.
 */
export const preloadEditorComponents = () => {
  try {
    import("../Layouts/EditorLayout");
    import("../components/CustomizedEditor/CustomizedEditor");
    import("../components/PageEditor/PageEditor");
  } catch (e) {
    // Non-blocking warmup
  }
};

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => preloadEditorComponents(), { timeout: 3000 });
  } else {
    setTimeout(preloadEditorComponents, 1200);
  }
}
