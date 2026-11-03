export const defaultToc = {
  addSearch: true,
  addPageNumber: true,
  addSerialNumberHeading: true,
  addSerialNumberSubheading: true,
  content: []
};

export const defaultBookmark = {
  icon: 'default',
  font: 'Poppins',
  color: '#C45A5A',
  shape: 1,
  style: 1,
  items: []
};

export const createDefaultLogoSettings = (currentBook, locationState) => {
  const cb = currentBook?.Customized_Settings?.Branding || currentBook?.settings?.Branding || currentBook?.settings || {};
  const l = cb.logoSettings || cb.logo || locationState?.logoSettings || locationState?.logo;
  if (l && typeof l === 'object') return l;
  return {
    src: '',
    url: '',
    type: 'Fit',
    opacity: 100,
    adjustments: { exposure: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0 }
  };
};

export const createDefaultWatermarkSettings = (currentBook, locationState) => {
  const cb = currentBook?.Customized_Settings?.Branding || currentBook?.settings?.Branding || currentBook?.settings || {};
  const w = cb.watermarkSettings || cb.watermark || locationState?.watermarkSettings || locationState?.watermark;
  if (w && typeof w === 'object') return { ...w, src: w.src || '' };
  return {
    src: '',
    opacity: 64,
    position: 'Bottom Right'
  };
};

export const createDefaultPreloaderSettings = (currentBook, locationState) => {
  const cb = currentBook?.Customized_Settings?.Branding || currentBook?.settings?.Branding || currentBook?.settings || {};
  const p = cb.preloaderSettings || cb.preloader || locationState?.preloaderSettings || locationState?.preloader;
  if (p && typeof p === 'object' && Object.keys(p).length > 0) return p;
  return {};
};

export const createDefaultProfileSettings = (currentBook, locationState) => {
  const cb = currentBook?.Customized_Settings?.Branding || currentBook?.settings?.Branding || currentBook?.settings || {};
  const pr = cb.profileSettings || cb.profile || locationState?.profileSettings || locationState?.profile;
  if (pr && typeof pr === 'object') return pr;
  return {
    name: '',
    about: '',
    contacts: [
      { id: '1', type: 'email', value: '' },
      { id: '2', type: 'phone', value: '' }
    ]
  };
};

export const createDefaultBackgroundSettings = (currentBook, locationState) => {
  const bg = currentBook?.Customized_Settings?.Background || currentBook?.settings?.Background || locationState?.backgroundSettings || locationState?.background;
  if (bg && typeof bg === 'object') {
    let finalBg = { ...bg, applyDynamicColor: bg.applyDynamicColor ?? true };
    if (finalBg.color === '#DADBE8' || finalBg.color === '#E2E4F0' || finalBg.color === '#dadbe8' || finalBg.color === '#e2e4f0') {
      finalBg.color = '#D9D9D9';
    }
    return finalBg;
  }
  return {
    color: '#D9D9D9',
    style: 'Solid',
    gradient: 'linear-gradient(to bottom, #b363f1ff, #a855f7)',
    image: '',
    fit: 'Cover',
    opacity: 100,
    animation: 'None',
    reactBitType: null,
    applyDynamicColor: true
  };
};

export const createDefaultAppearanceSettings = (currentBook, locationState) => {
  const app = currentBook?.Customized_Settings?.BookAppearance || currentBook?.settings?.BookAppearance || locationState?.bookAppearanceSettings || locationState?.appearance;
  if (app && typeof app === 'object') return app;
  return {
    texture: 'Plain White',
    hardCover: false,
    grainIntensity: 20,
    warmth: 0,
    textureScale: 0,
    opacity: 100,
    flipStyle: 'Classic Flip',
    flipSpeed: 'medium',
    corner: 'Sharp',
    dropShadow: {
      active: true,
      color: '#4f4f4fff',
      opacity: 50,
      xAxis: 0,
      yAxis: 0,
      blur: 0,
      spread: 0
    },
    instructions: 'first'
  };
};

export const createDefaultLayoutSettings = (currentBook, locationState) => {
  const lStyle = currentBook?.Customized_Settings?.Layouts?.layoutStyle || currentBook?.settings?.Layouts?.layoutStyle || locationState?.layoutSettings;
  return lStyle !== undefined ? lStyle : 1;
};

export const createDefaultLayoutColors = (currentBook, locationState) => {
  const lColors = currentBook?.Customized_Settings?.Layouts?.layoutColors || currentBook?.settings?.Layouts?.layoutColors || locationState?.layoutColors;
  return (lColors && typeof lColors === 'object') ? lColors : {};
};

export const createDefaultMenuBarSettings = () => ({
  navigation: {
    nextPrevButtons: true,
    mouseWheel: false,
    dragToTurn: true,
    pageQuickAccess: true,
    tableOfContents: true,
    tocSettings: defaultToc,
    pageThumbnails: true,
    bookmark: false,
    bookmarkSettings: defaultBookmark,
    startEndNav: true,
  },
  viewing: {
    zoom: true,
    zoomSettings: {
      maximumZoom: 4,
      twoClickToZoom: true
    },
    fullScreen: true,
  },
  interaction: {
    search: true,
    notes: true,
    gallery: true,
    gallerySettings: {
      imageFitType: 'Fill All',
      images: [],
      transitionEffect: 'Linear',
      primaryColor: '#4F46E5',
      secondaryColor: '#9CA3AF',
      bgColor: '#FFFFFF',
      navigationIconType: 'Chevron',
      autoPlay: true,
      speed: 2,
      infiniteLoop: true,
      showDots: true
    }
  },
  media: {
    autoFlip: true,
    autoFlipSettings: {
      duration: 4,
      countdown: false
    },
    backgroundAudio: true,
    audio: true,
    audioSettings: {
      flipSound: 'Soft Paper Flip',
      pageSpecificSound: false,
      bgSound: 'BG Sound 1',
      bgSoundFile: '',
      customBgSounds: []
    }
  },
  shareExport: {
    share: true,
    download: true
  },
  brandingProfile: {
    logo: true,
    profile: true,
  },
  tocSettings: defaultToc
});

export const createDefaultOtherSetupSettings = () => ({
  toolbar: {
    displayMode: 'icon',
    addTextBelowIcons: false,
    addSearchOnTop: true,
    textProperties: { font: 'Poppins', fill: '#ffffffff', stroke: '#' },
    toolbarColor: { fill: '#3E4491', stroke: '#' },
    iconsColor: { fill: '#ffffff', stroke: '#' },
    processBar: { fill: '#ffffffff', stroke: '#' },
    autoFlipEnabled: false,
    autoFlipDuration: 2,
    addForwardFlipCountdownLine: true,
    nextFlipCountdown: true,
    maximumZoom: 1,
    twoClickToZoom: true,
  },
  sound: {
    flipSound: 'Soft Paper Flip',
    flipSoundEnabled: true,
    pageSpecificSound: false,
    bgSound: 'BG Sound 1',
    customBgSounds: [],
    bgSoundFile: null
  },
  gallery: {
    autoPlay: true,
    speed: 2,
    infiniteLoop: true,
    showDots: true,
    dotColor: '#4F46E5',
    imageFitType: 'Fill All',
    transitionEffect: 'Linear',
    dragToSlide: false,
    images: [],
  },
});

export const createDefaultLeadFormSettings = () => ({
  enabled: false,
  leadText: 'Share your information to get personalized updates.',
  fields: [
    { id: '1', type: 'name', placeholder: 'Enter your Name' },
    { id: '2', type: 'email', placeholder: 'Enter your Gmail' },
    { id: '3', type: 'feedback', placeholder: 'Enter your Feedback' }
  ],
  appearance: {
    timing: 'after-pages',
    afterPages: 4,
    allowSkip: true,
    fontStyle: 'Poppins',
    textFill: '#3E4491',
    textStroke: '',
    bgFill: '#ffffffff',
    bgStroke: '',
    btnFill: '#3E4491',
    btnStroke: '',
    btnText: 'white'
  }
});

export const createDefaultVisibilitySettings = () => ({
  type: 'Public',
  password: '',
  inviteOnly: {
    allowReAccess: true,
    notifyOnView: true,
    autoExpire: {
      enabled: false,
      duration: '0 Hr 5 Min'
    }
  }
});

export const createDefaultShareSettings = () => ({
  shareId: '',
  access: 'public'
});
