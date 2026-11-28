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
  const base = (w && typeof w === 'object') ? { ...w, src: w.src || '' } : {
    src: '',
    opacity: 64,
    position: 'Bottom Right'
  };
  if (!base.platformWatermark) {
    base.platformWatermark = {
      src: '',
      opacity: 100,
      name: '',
      size: '',
      resolution: ''
    };
  }
  return base;
};

export const createDefaultPreloaderSettings = (currentBook, locationState) => {
  const cb = currentBook?.Customized_Settings?.Branding || currentBook?.settings?.Branding || currentBook?.settings || {};
  const p = cb.preloaderSettings || cb.preloader || locationState?.preloaderSettings || locationState?.preloader;
  const defaults = {
    enabled: true,
    isCustom: false,
    displayOption: 'preloader-only', // 'preloader-only' | 'logo-only' | 'both'
    text: 'Preparing Flipibook',
    layout: 'spinner',
    logoAnimation: 'fade',
    spinnerColor: '#E04752',
    bgColor: '#22252A',
    textColor: '#ffffff',
    showPercentage: false,
    showText: true,
    textPosition: 'bottom', // 'top' | 'bottom'
    logoSize: 100, // percentage 40 - 200
    logo: '',
  };
  if (p && typeof p === 'object' && Object.keys(p).length > 0) {
    const rawText = p.text;
    const resolvedText = (!rawText || rawText === 'Loading Modal Please Wait....' || rawText === 'Loading Flipbook Please Wait....' || rawText === 'Preparing Flipbook...') ? 'Preparing Flipibook' : rawText;
    const resolvedDisplayOption = p.displayOption || (p.layout === 'logo-only' ? 'logo-only' : (p.logo ? 'both' : 'preloader-only'));
    const resolvedBgColor = (!p.bgColor || p.bgColor === '#D6E0F4') ? '#22252A' : p.bgColor;
    const resolvedSpinnerColor = (!p.spinnerColor || p.spinnerColor === '#3B3C8A') ? '#E04752' : p.spinnerColor;
    return {
      ...defaults,
      ...p,
      isCustom: p.isCustom !== undefined ? p.isCustom : true,
      displayOption: resolvedDisplayOption,
      enabled: p.enabled !== undefined ? p.enabled : true,
      showText: p.showText !== undefined ? p.showText : true,
      textPosition: p.textPosition || 'bottom',
      logoSize: p.logoSize !== undefined ? p.logoSize : 100,
      text: resolvedText,
      layout: p.layout === 'logo-only' ? 'spinner' : (p.layout || 'spinner'),
      logoAnimation: p.logoAnimation || 'fade',
      bgColor: resolvedBgColor,
      textColor: p.textColor || '#ffffff',
      spinnerColor: resolvedSpinnerColor,
    };
  }
  return defaults;
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
      bgSoundEnabled: false,
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
    bgSoundEnabled: false,
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

export const createDefaultLeadFormSettings = (currentBook, locationState) => {
  const loaded = currentBook?.Customized_Settings?.leadForm || 
                 currentBook?.settings?.leadForm || 
                 currentBook?.settings?.leadform || 
                 locationState?.leadForm || 
                 locationState?.leadform;

  if (loaded) {
    return {
      enabled: Boolean(loaded.enabled),
      leadText: loaded.leadText || 'Share your information to get personalized updates.',
      formTitle: loaded.formTitle || 'Get in Touch',
      buttonText: loaded.buttonText || 'SUBMIT',
      selectedTemplateId: loaded.selectedTemplateId || 'contact-form',
      fields: Array.isArray(loaded.fields) ? loaded.fields : [
        { id: '1', type: 'name', placeholder: 'Enter your Name' },
        { id: '2', type: 'email', placeholder: 'Enter your Gmail' },
        { id: '3', type: 'feedback', placeholder: 'Enter your Feedback' }
      ],
      appearance: {
        enabled: loaded.appearance?.enabled !== undefined ? Boolean(loaded.appearance.enabled) : false,
        timing: loaded.appearance?.timing || 'after-pages',
        afterPages: loaded.appearance?.afterPages || 1,
        afterSeconds: loaded.appearance?.afterSeconds || 30,
        allowSkip: loaded.appearance?.allowSkip !== undefined ? Boolean(loaded.appearance.allowSkip) : true,
        skipBehavior: loaded.appearance?.skipBehavior || 'never',
        fontStyle: loaded.appearance?.fontStyle || 'Poppins',
        textFill: loaded.appearance?.textFill || '#3E4491',
        textStroke: loaded.appearance?.textStroke || '',
        bgFill: loaded.appearance?.bgFill || '#ffffffff',
        bgStroke: loaded.appearance?.bgStroke || '',
        btnFill: loaded.appearance?.btnFill || '#3E4491',
        btnStroke: loaded.appearance?.btnStroke || '',
        btnText: loaded.appearance?.btnText || 'white'
      },
      enquiryButton: {
        enabled: loaded.enquiryButton?.enabled !== undefined ? Boolean(loaded.enquiryButton.enabled) : false,
        showText: loaded.enquiryButton?.showText !== undefined ? Boolean(loaded.enquiryButton.showText) : true,
        text: loaded.enquiryButton?.text || 'Enquiry Now',
        icon: loaded.enquiryButton?.icon || 'lucide:message-square',
        bgFill: loaded.enquiryButton?.bgFill || '#E05638',
        bgOpacity: loaded.enquiryButton?.bgOpacity ?? 100,
        textColor: loaded.enquiryButton?.textColor || '#FFFFFF',
        textOpacity: loaded.enquiryButton?.textOpacity ?? 100,
        iconColor: loaded.enquiryButton?.iconColor || '#FFFFFF',
        iconOpacity: loaded.enquiryButton?.iconOpacity ?? 100,
        position: loaded.enquiryButton?.position || 'bottom-right'
      },
      leadNotification: loaded.leadNotification || {}
    };
  }

  return {
    enabled: false,
    leadText: 'Share your information to get personalized updates.',
    formTitle: 'Get in Touch',
    buttonText: 'SUBMIT',
    selectedTemplateId: 'contact-form',
    fields: [
      { id: '1', type: 'name', placeholder: 'Enter your Name' },
      { id: '2', type: 'email', placeholder: 'Enter your Gmail' },
      { id: '3', type: 'feedback', placeholder: 'Enter your Feedback' }
    ],
    appearance: {
      enabled: false,
      timing: 'after-pages',
      afterPages: 1,
      afterSeconds: 30,
      allowSkip: true,
      skipBehavior: 'never',
      fontStyle: 'Poppins',
      textFill: '#3E4491',
      textStroke: '',
      bgFill: '#ffffffff',
      bgStroke: '',
      btnFill: '#3E4491',
      btnStroke: '',
      btnText: 'white'
    },
    enquiryButton: {
      enabled: false,
      showText: true,
      text: 'Enquiry Now',
      icon: 'lucide:message-square',
      bgFill: '#E05638',
      bgOpacity: 100,
      textColor: '#FFFFFF',
      textOpacity: 100,
      iconColor: '#FFFFFF',
      iconOpacity: 100,
      position: 'bottom-right'
    },
    leadNotification: {}
  };
};

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
