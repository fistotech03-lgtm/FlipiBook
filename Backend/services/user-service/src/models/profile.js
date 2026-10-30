const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
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
    avatarBgColor: {
      type: String,
      default: '#E8D4C8'
    },
    bannerBg: {
      type: {
        type: String,
        default: 'gradient'
      },
      value: {
        type: String,
        default: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)'
      }
    },
    about: {
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
    companyLogo: {
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
    companyEmail: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    services: {
      type: [String],
      default: []
    },
    address1: {
      type: String,
      default: ''
    },
    address2: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    pincode: {
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
    socials: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
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
    const backupService = require('../../../../shared/backupService');
    backupService.syncProfile(doc);
  } catch (_) {}
});

profileSchema.post('findOneAndUpdate', function (doc) {
  if (doc) {
    try {
      const backupService = require('../../../../shared/backupService');
      backupService.syncProfile(doc);
    } catch (_) {}
  }
});

module.exports = (mongoose.models.profile || mongoose.models.Profile) || mongoose.model('profile', profileSchema, 'Profiles');
