const mongoose = require('mongoose');

const customizedSettingsSchema = new mongoose.Schema(
  {
    // Primary user access identifier (only userID)
    userID: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },

    // Association with Flipbook
    v_id: {
      type: String,
      required: true,
      index: true
    },
    flipbookName: {
      type: String,
      trim: true
    },
    folderName: {
      type: String,
      default: 'default'
    },

    // 1. Flipbook Information & Metadata
    FlipbookInfo: {
      category: { type: String, default: '' },
      language: { type: String, default: '' },
      tags: [{ type: String }],
      quotes: { type: String, default: '“Bring your content to life with a real, interactive experience”' },
      about: { type: String, default: '' },
      publisher: { type: String, default: '' },
      publishedAt: { type: Date, default: null },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
      templateId: { type: String, default: '' },
      orientation: { type: String, default: 'horizontal' }
    },

    // 2. Branding (Logo, Watermark, Preloader)
    Branding: {
      logoSettings: {
        src: { type: String, default: '' },
        url: { type: String, default: '' },
        type: { type: String, default: 'Fit' },
        opacity: { type: Number, default: 100 },
        cropData: { type: mongoose.Schema.Types.Mixed, default: null },
        adjustments: {
          exposure: { type: Number, default: 0 },
          contrast: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          temperature: { type: Number, default: 0 },
          tint: { type: Number, default: 0 },
          highlights: { type: Number, default: 0 },
          shadows: { type: Number, default: 0 }
        }
      },
      watermarkSettings: {
        src: { type: String, default: '' },
        type: { type: String, default: 'Fit' },
        opacity: { type: Number, default: 64 },
        position: { type: String, default: 'Bottom Right' },
        cropData: { type: mongoose.Schema.Types.Mixed, default: null },
        adjustments: {
          exposure: { type: Number, default: 0 },
          contrast: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          temperature: { type: Number, default: 0 },
          tint: { type: Number, default: 0 },
          highlights: { type: Number, default: 0 },
          shadows: { type: Number, default: 0 }
        }
      },
      preloaderSettings: {
        layout: { type: String, default: 'spinner' },
        text: { type: String, default: 'Loading Flipbook Please Wait....' },
        font: { type: String, default: 'Poppins' },
        bgColor: { type: String, default: '#D6E0F4' },
        textColor: { type: String, default: '#ffffff' },
        spinnerColor: { type: String, default: '#3B3C8A' },
        showPercentage: { type: Boolean, default: false }
      }
    },

    // 3. Background (Solid, Gradient, Image, Video, Animation, ReactBits)
    Background: {
      style: { type: String, default: 'Solid' },
      color: { type: String, default: '#FFFFFF' },
      opacity: { type: Number, default: 100, min: 0, max: 100 },
      gradient: {
        type: String,
        default: 'linear-gradient(90deg, #FFFFFF 0%, #D1D5DB 100%)'
      },
      gradientType: { type: String, default: 'linear' },
      gradientAngle: { type: Number, default: 90 },
      gradientRadius: { type: Number, default: 50 },
      gradientStops: {
        type: [
          {
            offset: { type: Number, min: 0, max: 100 },
            color: { type: String },
            opacity: { type: Number, default: 100, min: 0, max: 100 }
          }
        ],
        default: [
          { offset: 0, color: '#FFFFFF', opacity: 100 },
          { offset: 100, color: '#D1D5DB', opacity: 100 }
        ]
      },
      image: { type: String, default: '' },
      video: { type: String, default: '' },
      fit: { type: String, default: 'Cover' },
      cropData: { type: mongoose.Schema.Types.Mixed, default: null },
      adjustments: {
        exposure: { type: Number, default: 0 },
        contrast: { type: Number, default: 0 },
        saturation: { type: Number, default: 0 },
        temperature: { type: Number, default: 0 },
        tint: { type: Number, default: 0 },
        highlights: { type: Number, default: 0 },
        shadows: { type: Number, default: 0 }
      },
      reactBitType: { type: String, default: '' },
      animation: { type: String, default: '' },
      savedSolidColor: { type: String, default: '' },
      savedNonThemeSettings: { type: mongoose.Schema.Types.Mixed, default: null },
      applyDynamicColor: { type: Boolean, default: true }
    },

    // 4. MenuBar (Navigation, Viewing, Interaction, Media, Export)
    MenuBar: {
      navigation: {
        addTextToIcons: { type: Boolean, default: false },
        addTextToIconsSettings: {
          font: { type: String, default: 'Arial' }
        },
        nextPrevButtons: { type: Boolean, default: true },
        mouseWheel: { type: Boolean, default: true },
        dragToTurn: { type: Boolean, default: true },
        pageQuickAccess: { type: Boolean, default: true },
        tableOfContents: { type: Boolean, default: true },
        tocSettings: {
          addSearch: { type: Boolean, default: true },
          addPageNumber: { type: Boolean, default: true },
          addSerialNumberHeading: { type: Boolean, default: true },
          addSerialNumberSubheading: { type: Boolean, default: true },
          content: [{ type: mongoose.Schema.Types.Mixed }]
        },
        pageThumbnails: { type: Boolean, default: true },
        bookmark: { type: Boolean, default: true },
        bookmarkSettings: {
          icon: { type: String, default: 'default' },
          font: { type: String, default: 'Poppins' },
          color: { type: String, default: '#C45A5A' },
          shape: { type: Number, default: 1 },
          style: { type: Number, default: 1 },
          items: [{ type: mongoose.Schema.Types.Mixed }]
        },
        startEndNav: { type: Boolean, default: true }
      },
      viewing: {
        zoom: { type: Boolean, default: true },
        zoomSettings: {
          maximumZoom: { type: Number, default: 4 },
          twoClickToZoom: { type: Boolean, default: true }
        },
        fullScreen: { type: Boolean, default: true }
      },
      interaction: {
        search: { type: Boolean, default: true },
        gallery: { type: Boolean, default: true },
        gallerySettings: {
          imageFitType: { type: String, default: 'Fill All' },
          images: [{ type: mongoose.Schema.Types.Mixed }],
          transitionEffect: { type: String, default: 'Linear' },
          primaryColor: { type: String, default: '#5d57cfff' },
          secondaryColor: { type: String, default: '#9CA3AF' },
          bgColor: { type: String, default: '#FFFFFF' },
          navigationIconType: { type: String, default: 'Chevron' },
          autoPlay: { type: Boolean, default: true },
          speed: { type: Number, default: 2 },
          infiniteLoop: { type: Boolean, default: true },
          showDots: { type: Boolean, default: true }
        }
      },
      media: {
        autoFlip: { type: Boolean, default: true },
        autoFlipSettings: {
          duration: { type: Number, default: 4 },
          countdown: { type: Boolean, default: false }
        },
        audio: { type: Boolean, default: true },
        audioSettings: {
          flipSound: { type: String, default: 'Soft Paper Flip' },
          pageSpecificSound: { type: Boolean, default: false },
          bgSound: { type: String, default: 'BG Sound 1' },
          bgSoundFile: { type: String, default: '' },
          customBgSounds: [{ type: mongoose.Schema.Types.Mixed }]
        }
      },
      shareExport: {
        share: { type: Boolean, default: true },
        download: { type: Boolean, default: true }
      },
      brandingProfile: {
        logo: { type: Boolean, default: true },
        profile: { type: Boolean, default: true }
      }
    },

    // 5. Layouts
    Layouts: {
      layoutStyle: { type: mongoose.Schema.Types.Mixed, default: 1 },
      layoutColors: {
        toolbarColor: {
          primary: { type: String, default: '' },
          secondary: { type: String, default: '' }
        },
        popupColor: {
          primary: { type: String, default: '' },
          secondary: { type: String, default: '' }
        }
      }
    },

    // 6. Book Appearance (Flip Style, Hardcover, Drop Shadow)
    BookAppearance: {
      makeFirstLastPageHard: { type: Boolean, default: false },
      selectCustomHardPages: { type: Boolean, default: false },
      hardCover: { type: Boolean, default: false },
      customHardPages: [{ type: mongoose.Schema.Types.Mixed }],
      transparentSheets: [
        {
          id: { type: mongoose.Schema.Types.Mixed },
          page: { type: String, default: 'Page 1' },
          image: { type: String, default: null },
          imageName: { type: String, default: null },
          imageSize: { type: String, default: null },
          scale: { type: Number, default: 100 },
          rotate: { type: Number, default: 0 },
          opacity: { type: Number, default: 100 },
          offsetX: { type: Number, default: 0 },
          offsetY: { type: Number, default: 0 },
          isExpanded: { type: Boolean, default: true }
        }
      ],
      flipStyle: { type: String, default: 'Classic Flip' },
      flipSpeed: { type: String, default: 'Slow' },
      corner: { type: String, default: 'Sharp' },
      dropShadow: {
        position: { type: String, default: 'Bottom Right' },
        strength: { type: Number, default: 35 },
        softness: { type: Number, default: 35 },
        color: { type: String, default: '#000000' }
      }
    },

    // 7. Lead Capture Form
    leadForm: {
      enabled: { type: Boolean, default: false },
      formTitle: { type: String, default: 'Request More Information' },
      leadText: {
        type: String,
        default: 'Tell us about your requirements and our team will reach out.'
      },
      buttonText: { type: String, default: 'Request Callback' },
      fields: [{ type: mongoose.Schema.Types.Mixed }],
      appearance: {
        timing: { type: String, default: 'before' },
        afterSeconds: { type: Number, default: 30 },
        afterPages: { type: Number, default: 4 },
        allowSkip: { type: Boolean, default: true },
        skipBehavior: { type: String, default: 'never' },
        fontStyle: { type: String, default: 'Arial' },
        textFill: { type: String, default: '#3E4491' },
        textStroke: { type: String, default: '#' },
        bgFill: { type: String, default: '#FFFFFF' },
        bgStroke: { type: String, default: '#' },
        btnFill: { type: String, default: '#4A3AFF' },
        btnStroke: { type: String, default: '#' },
        btnText: { type: String, default: '#FFFFFF' }
      }
    },

    // 8. Visibility & Access Protection
    Visibility: {
      shareId: {
        type: String,
        index: true
      },
      access: {
        type: String,
        enum: [
          'public',
          'private',
          'password',
          'invite_only',
          'Public',
          'Private',
          'Password Protect',
          'Invite Only Access'
        ],
        default: 'public'
      },
      password: { type: String, default: '' },
      accessKey: { type: String, default: '' },
      isPasswordSaved: { type: Boolean, default: false },
      otp: { type: String, default: null },
      inviteOnly: {
        autoExpire: {
          enabled: { type: Boolean, default: false },
          days: { type: String, default: '0 Days' },
          time: { type: String, default: '5 Mins' },
          duration: { type: String, default: '5 Mins' },
          grantedAt: { type: Date, default: null }
        },
        emails: [{ type: mongoose.Schema.Types.Mixed }],
        domains: [{ type: mongoose.Schema.Types.Mixed }]
      }
    },

    // 9. Extra extensible options (e.g. Analytics, SEO, RTL)
    otherSetup: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

// Compound index to guarantee fast, unique lookup strictly by userID and flipbook v_id
customizedSettingsSchema.index({ userID: 1, v_id: 1 }, { unique: true });

// Asynchronous non-blocking backup mirror hook
customizedSettingsSchema.post('save', function (doc) {
  try {
    const backupService = require('../../../../shared/backupService');
    backupService.syncCustomizedSettings(doc);
  } catch (_) {}
});

customizedSettingsSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    try {
      const backupService = require('../../../../shared/backupService');
      backupService.syncCustomizedSettings(doc);
    } catch (_) {}
  }
});

module.exports =
  (mongoose.models.customizedSettings || mongoose.models.CustomizedSettings) ||
  mongoose.model('customizedSettings', customizedSettingsSchema);
