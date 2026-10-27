const mongoose = require('mongoose');

/**
 * Base media item stored in gallery arrays
 */
const baseMediaItemSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    convertedName: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    size: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * User details image item (includes type: 'profile', 'company_logo', etc.)
 */
const userDetailImageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'profile',
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    convertedName: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    size: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * 3D Texture item (includes category)
 */
const textureItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: 'general',
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    convertedName: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    size: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * 1. userdetails section
 */
const userDetailsSectionSchema = new mongoose.Schema(
  {
    images: {
      type: [userDetailImageSchema],
      default: []
    }
  },
  { _id: false }
);

/**
 * 2. pageEditorgallery section
 */
const pageEditorGallerySectionSchema = new mongoose.Schema(
  {
    images: {
      type: [baseMediaItemSchema],
      default: []
    },
    video: {
      type: [baseMediaItemSchema],
      default: [],
      alias: 'videos'
    },
    gif: {
      type: [baseMediaItemSchema],
      default: [],
      alias: 'gifs'
    }
  },
  { _id: false }
);

/**
 * 3. CustomizationGallery section
 */
const customizationGallerySectionSchema = new mongoose.Schema(
  {
    images: {
      type: [baseMediaItemSchema],
      default: []
    },
    videos: {
      type: [baseMediaItemSchema],
      default: []
    }
  },
  { _id: false }
);

/**
 * 4. 3DGallery section
 */
const threeDGallerySectionSchema = new mongoose.Schema(
  {
    models: {
      type: [baseMediaItemSchema],
      default: []
    },
    texture: {
      type: [textureItemSchema],
      default: []
    },
    snapshot: {
      type: [baseMediaItemSchema],
      default: []
    }
  },
  { _id: false }
);

/**
 * Main UserGallery Schema
 */
const userGallerySchema = new mongoose.Schema(
  {
    userObjectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
      index: true
    },
    userID: {
      type: String,
      trim: true,
      index: true
    },
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },

    // 1. userdetails
    userdetails: {
      type: userDetailsSectionSchema,
      default: () => ({ images: [] })
    },

    // 2. pageEditorgallery
    pageEditorgallery: {
      type: pageEditorGallerySectionSchema,
      default: () => ({ images: [], video: [], gif: [] }),
      alias: 'pageEditorGallery'
    },

    // 3. CustomizationGallery
    CustomizationGallery: {
      type: customizationGallerySectionSchema,
      default: () => ({ images: [], videos: [] }),
      alias: 'customizationGallery'
    },

    // 4. 3DGallery
    '3DGallery': {
      type: threeDGallerySectionSchema,
      default: () => ({ models: [], texture: [], snapshot: [] }),
      alias: 'threeDGallery'
    }
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userGallerySchema.index({ userObjectID: 1 });
userGallerySchema.index({ userID: 1 });
userGallerySchema.index({ emailId: 1 });

module.exports =
  (mongoose.models.userGallery || mongoose.models.UserGallery) ||
  mongoose.model('userGallery', userGallerySchema, 'userGallery');
