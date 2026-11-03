/**
 * Default configurations for customized editor components
 */

const DEFAULT_BRANDING = {
  logoSettings: {
    src: '',
    url: '',
    type: 'Fit',
    opacity: 100,
    cropData: null,
    adjustments: {
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0
    }
  },
  watermarkSettings: {
    src: '',
    type: 'Fit',
    opacity: 64,
    position: 'Bottom Right',
    cropData: null,
    adjustments: {
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0
    }
  },
  preloaderSettings: {
    layout: 'spinner',
    text: 'Loading Flipbook Please Wait....',
    font: 'Poppins',
    bgColor: '#D6E0F4',
    textColor: '#ffffff',
    spinnerColor: '#3B3C8A',
    showPercentage: false
  }
};

const DEFAULT_BACKGROUND = {
  style: 'Solid',
  color: '#FFFFFF',
  opacity: 100,
  gradient: 'linear-gradient(90deg, #FFFFFF 0%, #D1D5DB 100%)',
  gradientType: 'linear',
  gradientAngle: 90,
  gradientRadius: 50,
  gradientStops: [
    { offset: 0, color: '#FFFFFF', opacity: 100 },
    { offset: 100, color: '#D1D5DB', opacity: 100 }
  ],
  image: '',
  video: '',
  fit: 'Cover',
  cropData: null,
  adjustments: {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0
  },
  reactBitType: '',
  animation: '',
  savedSolidColor: '',
  savedNonThemeSettings: null,
  applyDynamicColor: true
};

const DEFAULT_MENUBAR = {
  navigation: {
    addTextToIcons: false,
    addTextToIconsSettings: {
      font: 'Arial'
    },
    nextPrevButtons: true,
    mouseWheel: true,
    dragToTurn: true,
    pageQuickAccess: true,
    tableOfContents: true,
    tocSettings: {
      addSearch: true,
      addPageNumber: true,
      addSerialNumberHeading: true,
      addSerialNumberSubheading: true,
      content: []
    },
    pageThumbnails: true,
    bookmark: true,
    bookmarkSettings: {
      icon: 'default',
      font: 'Poppins',
      color: '#C45A5A',
      shape: 1,
      style: 1,
      items: []
    },
    startEndNav: true
  },
  viewing: {
    zoom: true,
    zoomSettings: {
      maximumZoom: 4,
      twoClickToZoom: true
    },
    fullScreen: true
  },
  interaction: {
    search: true,
    gallery: true,
    gallerySettings: {
      imageFitType: 'Fill All',
      images: [],
      transitionEffect: 'Linear',
      primaryColor: '#5d57cfff',
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
    profile: true
  }
};

const DEFAULT_LAYOUTS = {
  layoutStyle: 1,
  layoutColors: {
    toolbarColor: {
      primary: '',
      secondary: ''
    },
    popupColor: {
      primary: '',
      secondary: ''
    }
  }
};

const DEFAULT_BOOK_APPEARANCE = {
  makeFirstLastPageHard: false,
  selectCustomHardPages: false,
  hardCover: false,
  customHardPages: [],
  transparentSheets: [],
  flipStyle: 'Classic Flip',
  flipSpeed: 'Slow',
  corner: 'Sharp',
  dropShadow: {
    position: 'Bottom Right',
    strength: 35,
    softness: 35,
    color: '#000000'
  }
};

const DEFAULT_LEAD_FORM = {
  enabled: false,
  formTitle: 'Request More Information',
  leadText: 'Tell us about your requirements and our team will reach out.',
  buttonText: 'Request Callback',
  fields: [],
  appearance: {
    timing: 'before',
    afterSeconds: 30,
    afterPages: 4,
    allowSkip: true,
    skipBehavior: 'never',
    fontStyle: 'Arial',
    textFill: '#3E4491',
    textStroke: '#',
    bgFill: '#FFFFFF',
    bgStroke: '#',
    btnFill: '#4A3AFF',
    btnStroke: '#',
    btnText: '#FFFFFF'
  }
};

const DEFAULT_VISIBILITY = {
  shareId: '',
  access: 'public',
  password: '',
  accessKey: '',
  isPasswordSaved: false,
  otp: null,
  inviteOnly: {
    autoExpire: {
      enabled: false,
      days: '0 Days',
      time: '5 Mins',
      duration: '5 Mins',
      grantedAt: null
    },
    emails: [],
    domains: []
  }
};

const DEFAULT_FLIPBOOK_INFO = {
  category: '',
  language: '',
  tags: [],
  quotes: '“Bring your content to life with a real, interactive experience”',
  about: '',
  publisher: '',
  publishedAt: null,
  width: null,
  height: null,
  templateId: '',
  orientation: 'horizontal'
};

const crypto = require('crypto');

const getDefaultSettings = () => ({
  FlipbookInfo: { ...DEFAULT_FLIPBOOK_INFO },
  Branding: JSON.parse(JSON.stringify(DEFAULT_BRANDING)),
  Background: JSON.parse(JSON.stringify(DEFAULT_BACKGROUND)),
  MenuBar: JSON.parse(JSON.stringify(DEFAULT_MENUBAR)),
  Layouts: JSON.parse(JSON.stringify(DEFAULT_LAYOUTS)),
  BookAppearance: JSON.parse(JSON.stringify(DEFAULT_BOOK_APPEARANCE)),
  leadForm: JSON.parse(JSON.stringify(DEFAULT_LEAD_FORM)),
  Visibility: {
    ...JSON.parse(JSON.stringify(DEFAULT_VISIBILITY)),
    shareId: crypto.randomBytes(8).toString('hex')
  },
  otherSetup: {}
});

module.exports = {
  DEFAULT_BRANDING,
  DEFAULT_BACKGROUND,
  DEFAULT_MENUBAR,
  DEFAULT_LAYOUTS,
  DEFAULT_BOOK_APPEARANCE,
  DEFAULT_LEAD_FORM,
  DEFAULT_VISIBILITY,
  DEFAULT_FLIPBOOK_INFO,
  getDefaultSettings
};
