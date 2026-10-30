const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      default: '',
      index: true
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      default: ''
    },
    displayName: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: null
    },
    about: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: ''
    },
    industryType: {
      type: String,
      default: ''
    },
    mobile: {
      type: String,
      default: ''
    },
    countryCode: {
      type: String,
      default: '+91'
    },
    company_logo_url: {
      type: String,
      default: ''
    },
    avatarBgColor: {
      type: String,
      default: '#E8D4C8'
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'INDIA'
    },
    pincode: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    socials: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      whatsapp: { type: String, default: '' }
    },
    visibilitySettings: {
      showInExplore: { type: Boolean, default: true },
      showContact: { type: Boolean, default: true },
      showAddress: { type: Boolean, default: true },
      showSocial: { type: Boolean, default: true }
    },
    followers: {
      type: [String],
      default: []
    },
    following: {
      type: [String],
      default: []
    },
    myShelf: {
      shelfCount: {
        type: Number,
        default: 1
      },
      folders: [
        {
          _id: false,
          folderName: {
            type: String,
            default: ''
          },
          shelf_design: {
            type: Number,
            default: 1
          },
          books: [
            {
              _id: false,
              row: {
                type: Number,
                default: 1
              },
              order: {
                type: Number,
                default: 1
              },
              v_id: {
                type: String,
                required: true
              }
            }
          ]
        }
      ]
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

// Asynchronous non-blocking backup mirror hook
profileSchema.post('save', function (doc) {
  try {
    const backupService = require('../backupService');
    backupService.syncProfile(doc);
  } catch (_) {}
});

profileSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    try {
      const backupService = require('../backupService');
      backupService.syncProfile(doc);
    } catch (_) {}
  }
});

module.exports = (mongoose.models.profile || mongoose.models.Profile) || mongoose.model('profile', profileSchema, 'Profiles');

