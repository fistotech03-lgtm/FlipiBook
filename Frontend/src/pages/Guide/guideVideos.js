/**
 * Centralized Video Configuration for Guide Pages
 * 
 * You can paste either:
 *  1. A full YouTube URL (e.g. "https://www.youtube.com/watch?v=EQ_dfVNY40U" or "https://youtu.be/EQ_dfVNY40U")
 *  2. Or just the 11-character video ID (e.g. "EQ_dfVNY40U")
 */

export const GUIDE_VIDEOS = {
  // Get Started
  getStartedAuth: 'EQ_dfVNY40U',

  // Profile & Account
  profile: 'EQ_dfVNY40U',
  account: 'EQ_dfVNY40U',
  billingInvoice: 'EQ_dfVNY40U',
  support: 'EQ_dfVNY40U',

  // Flipbook
  flipbookFileCreate: 'EQ_dfVNY40U',
  flipbookFileUpload: 'EQ_dfVNY40U',
  flipbookBuildScratch: 'EQ_dfVNY40U',
  flipbookTemplate: 'EQ_dfVNY40U',

  // Customization
  customBgTheme: 'EQ_dfVNY40U',
  customLayoutSettings: 'EQ_dfVNY40U',
  customLeadForm: 'EQ_dfVNY40U',
  customVisibilityPrivacy: 'EQ_dfVNY40U',
  customPreviewShareExport: 'EQ_dfVNY40U',
  customDevicesViewports: 'EQ_dfVNY40U',

  // 3D Studio Editor
  threeDStudioCreateUpload: 'EQ_dfVNY40U',
  threeDStudioMaterialTexture: 'EQ_dfVNY40U',
  threeDStudioLightingEnvironments: 'EQ_dfVNY40U',
  threeDStudioRenderSaveExport: 'EQ_dfVNY40U',

  // 3D Request
  threeDRequest: 'EQ_dfVNY40U',

  // Explore & Forum
  explore: 'EQ_dfVNY40U',
  forum: 'EQ_dfVNY40U',

  // Page Editor
  pageSettings: 'EQ_dfVNY40U',
  pageMedia: 'EQ_dfVNY40U',
  pageShapesGrid: 'EQ_dfVNY40U',
  pageMapsQr: 'EQ_dfVNY40U',
  pageTypographySlideshow: 'EQ_dfVNY40U',
  pageTables: 'EQ_dfVNY40U',
  pageAudioButtons: 'EQ_dfVNY40U',
  pageTemplates: 'EQ_dfVNY40U',
  pageInteractionsCall: 'EQ_dfVNY40U',
  pageInteractions3dAr: 'EQ_dfVNY40U',
  pageInteractionsPopup: 'EQ_dfVNY40U',
  pageAnimations: 'EQ_dfVNY40U',
  pageHotspots: 'EQ_dfVNY40U',
};

/**
 * Extracts a clean 11-character YouTube video ID whether a full link or ID is passed.
 */
export function getYoutubeVideoId(input) {
  if (!input || typeof input !== 'string') return 'EQ_dfVNY40U';
  const trimmed = input.trim();

  // Match youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }

  // If already an 11-char ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed || 'EQ_dfVNY40U';
}

