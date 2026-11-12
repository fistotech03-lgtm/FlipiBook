import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { Icon } from '@iconify/react';

export const profileGuideSections = [
  {
    id: 'profile-type-section',
    title: 'Profile Type',
    icon: <Icon icon="lucide:user-cog" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      {
        id: 'profile-type-individual',
        label: 'Individual (Personal Showcase & Bio)',
        group: 'Profile Types',
        groupIcon: <Icon icon="lucide:user" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-type-freelancer',
        label: 'Freelancer (Brand, Experience & Services)',
        group: 'Profile Types',
        groupIcon: <Icon icon="lucide:briefcase" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-type-agency',
        label: 'Agency (Team Size & Specializations)',
        group: 'Profile Types',
        groupIcon: <Icon icon="lucide:building-2" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-type-company',
        label: 'Company (Logo, Domain & Corporate Size)',
        group: 'Profile Types',
        groupIcon: <Icon icon="lucide:building" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  },
  {
    id: 'profile-header-section',
    title: 'Profile Header & Banner',
    icon: <Icon icon="lucide:image" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      {
        id: 'profile-avatar-crop',
        label: 'Avatar Upload & Image Cropper',
        group: 'Media & Branding',
        groupIcon: <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-cover-banner',
        label: 'Cover Banner & Color Presets',
        group: 'Media & Branding',
        groupIcon: <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-display-badge',
        label: 'Display Name, Username & Badges',
        group: 'Media & Branding',
        groupIcon: <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  },
  {
    id: 'profile-details-section',
    title: 'Personal & Professional Details',
    icon: <Icon icon="lucide:file-text" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Personal Details
      {
        id: 'profile-personal-info',
        label: 'Name, Email & Bio Tagline',
        group: 'Personal Details',
        groupIcon: <Icon icon="lucide:user" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Professional Details
      {
        id: 'profile-professional-industry',
        label: 'Industry Classification',
        group: 'Professional Details',
        groupIcon: <Icon icon="lucide:trending-up" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-professional-contact',
        label: 'Phone with Worldwide Validation',
        group: 'Professional Details',
        groupIcon: <Icon icon="lucide:trending-up" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-professional-services',
        label: 'Services Offered & Custom Tags',
        group: 'Professional Details',
        groupIcon: <Icon icon="lucide:trending-up" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  },
  {
    id: 'profile-address-social-section',
    title: 'Address & Social Connectivity',
    icon: <Icon icon="lucide:share-2" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      // Address Information
      {
        id: 'profile-address-location',
        label: 'Street, Country, State & City',
        group: 'Address',
        groupIcon: <Icon icon="lucide:map-pin" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-address-pincode',
        label: 'Postal / ZIP Code',
        group: 'Address',
        groupIcon: <Icon icon="lucide:map-pin" className="w-[0.8vw] h-[0.8vw]" />
      },

      // Social Media
      {
        id: 'profile-social-channels',
        label: 'Social Accounts (LinkedIn, IG, etc.)',
        group: 'Social & Visibility',
        groupIcon: <Icon icon="lucide:globe" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-visibility-controls',
        label: 'Explore Visibility & Contact Privacy',
        group: 'Social & Visibility',
        groupIcon: <Icon icon="lucide:globe" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  },
  {
    id: 'profile-idc-activity-section',
    title: 'Your IDC & Activity',
    icon: <Icon icon="lucide:layout-grid" className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      {
        id: 'profile-idc-catalog',
        label: 'Published Flipbook Grid & Showcase',
        group: 'Identity Catalog',
        groupIcon: <Icon icon="lucide:book-open" className="w-[0.8vw] h-[0.8vw]" />
      },
      {
        id: 'profile-activity-log',
        label: 'Recent Edits, Views & Interactions',
        group: 'Activity Log',
        groupIcon: <Icon icon="lucide:activity" className="w-[0.8vw] h-[0.8vw]" />
      }
    ]
  }
];

export default function ProfileGuide({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}
