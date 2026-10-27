// Backend/services/myflipibook-service/src/forum/forumConstants.js

const FORUM_MODULES = [
  {
    id: 'my-flipbooks',
    name: 'My Flipbooks',
    shortName: 'Flipbooks',
    tagline: 'PDF conversion, page flip rendering, shelf management & exports',
    description: 'Discussions and feedback related to uploading PDFs, generating SVG/Canvas previews, flip animations, shelf organization, and public/private book sharing.',
    icon: 'BookOpen',
    color: '#ec5137'
  },
  {
    id: 'page-editor',
    name: 'Page Editor',
    shortName: 'Page Editor',
    tagline: 'Canvas layout, text elements, stickers, shapes & layers',
    description: 'Inquiries and suggestions regarding 2D template canvas, font rendering, graphic assets, multi-page layout templates, and vector exporting.',
    icon: 'FileText',
    color: '#f97316'
  },
  {
    id: 'customised-editor',
    name: 'Customised Editor',
    shortName: 'Custom Editor',
    tagline: 'Branding logos, background audio, themes & security',
    description: 'Topics regarding custom reader skins, navbar and toolbar visibility, background music autoplay, password protection, and branding assets.',
    icon: 'Settings',
    color: '#ea580c'
  },
  {
    id: '3d-editor',
    name: '3D Editor',
    shortName: '3D Editor',
    tagline: '3D glTF/GLB models, PBR textures, Rapier physics & AR View',
    description: 'Discussions on importing 3D models, Blender GLB exports, texture roughness/metallic channels, Rapier rigid bodies, camera views, and AR mobile streaming.',
    icon: 'Box',
    color: '#0d9488'
  },
  {
    id: 'converter',
    name: 'Converter',
    shortName: 'Converter',
    tagline: 'Image, video and 3D model conversion & compression pipeline',
    description: 'Questions and troubleshooting for converting and compressing media formats into web-ready assets.',
    icon: 'Repeat',
    color: '#0284c7'
  },
  {
    id: 'account-workspace',
    name: 'Account & Billing',
    shortName: 'Billing',
    tagline: 'Subscription plans, workspace seats, invoices & security',
    description: 'Help with account settings, team collaboration, subscription plans, upgrade features, and billing management.',
    icon: 'CreditCard',
    color: '#7c3aed'
  }
];

const FORUM_POST_TYPES = {
  QUESTION: 'question',
  SUGGESTION: 'suggestion'
};

const FORUM_POST_STATUS = {
  UNANSWERED: 'unanswered',
  UNDER_REVIEW: 'under_review',
  ANSWERED: 'answered',
  RESOLVED: 'resolved',
  PLANNED: 'planned'
};

module.exports = {
  FORUM_MODULES,
  FORUM_POST_TYPES,
  FORUM_POST_STATUS
};
