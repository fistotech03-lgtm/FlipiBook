/**
 * Default Plans and Storage Template for FlipiBook
 */
const DEFAULT_PLANS = [
  {
    planId: 'free',
    name: 'Free Plan',
    description: 'Perfect for exploring and creating your first digital flipbooks.',
    tier: 1,
    price: 0,
    currency: 'USD',
    billingCycle: 'free',
    storage: {
      maxStorage: 300 * 1024 * 1024, // 300 MB
      formattedStorage: '300 MB'
    },
    limits: {
      maxFlipbooks: 5
    },
    features: {
      customBranding: false,
      passwordProtection: false,
      leadForm: false,
      customDomain: false,
      analytics: false,
      downloadPdf: true,
      removeWatermark: false,
      prioritySupport: false
    },
    isActive: true,
    isPopular: false,
    sortOrder: 1
  },
  {
    planId: 'starter',
    name: 'Starter Plan',
    description: 'Essential tools and expanded storage for growing creators.',
    tier: 2,
    price: 9,
    currency: 'USD',
    billingCycle: 'monthly',
    storage: {
      maxStorage: 2 * 1024 * 1024 * 1024, // 2 GB
      formattedStorage: '2 GB'
    },
    limits: {
      maxFlipbooks: 25
    },
    features: {
      customBranding: true,
      passwordProtection: false,
      leadForm: false,
      customDomain: false,
      analytics: true,
      downloadPdf: true,
      removeWatermark: true,
      prioritySupport: false
    },
    isActive: true,
    isPopular: false,
    sortOrder: 2
  },
  {
    planId: 'pro',
    name: 'Pro Plan',
    description: 'Advanced customizations, password security, and lead generation.',
    tier: 3,
    price: 29,
    currency: 'USD',
    billingCycle: 'monthly',
    storage: {
      maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB
      formattedStorage: '10 GB'
    },
    limits: {
      maxFlipbooks: 100
    },
    features: {
      customBranding: true,
      passwordProtection: true,
      leadForm: true,
      customDomain: false,
      analytics: true,
      downloadPdf: true,
      removeWatermark: true,
      prioritySupport: true
    },
    isActive: true,
    isPopular: true,
    sortOrder: 3
  },
  {
    planId: 'enterprise',
    name: 'Enterprise Plan',
    description: 'High-capacity storage, custom domains, and dedicated priority support.',
    tier: 4,
    price: 99,
    currency: 'USD',
    billingCycle: 'monthly',
    storage: {
      maxStorage: 50 * 1024 * 1024 * 1024, // 50 GB
      formattedStorage: '50 GB'
    },
    limits: {
      maxFlipbooks: -1 // Unlimited
    },
    features: {
      customBranding: true,
      passwordProtection: true,
      leadForm: true,
      customDomain: true,
      analytics: true,
      downloadPdf: true,
      removeWatermark: true,
      prioritySupport: true
    },
    isActive: true,
    isPopular: false,
    sortOrder: 4
  }
];

module.exports = {
  DEFAULT_PLANS
};
