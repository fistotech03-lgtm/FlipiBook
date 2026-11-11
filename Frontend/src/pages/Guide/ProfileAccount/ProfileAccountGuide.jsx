import React, { useEffect, useRef } from 'react';
import ProfileSection, { profileSections } from './ProfileSection';
import AccountSection, { accountSections } from './AccountSection';
import BillingInvoiceSection, { billingInvoiceSections } from './BillingInvoiceSection';
import SupportSection, { supportSections } from './SupportSection';
import CustomScrollbar from '../../../components/CustomScrollbar';

export const profileAccountGuideSections = [
  ...profileSections,
  ...accountSections,
  ...billingInvoiceSections,
  ...supportSections
];

export default function ProfileAccountGuide({ selectedSubItem }) {
  const containerRef = useRef(null);

  // When selectedSubItem changes (via clicking in the secondary sidebar or search),
  // smoothly scroll the corresponding section into view
  useEffect(() => {
    if (!selectedSubItem) return;

    // Find the target element with id matching selectedSubItem
    const targetElement = document.getElementById(selectedSubItem);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSubItem]);

  return (
    <CustomScrollbar
      ref={containerRef}
      color="#d1d5db"
      hoverColor="#9ca3af"
      width="0.25vw"
      className="w-full h-full"
    >
      <div className="w-full flex flex-col divide-y divide-gray-200">
        <ProfileSection id="profile-overview-setup" />
        <AccountSection id="account-overview-settings" />
        <BillingInvoiceSection id="billing-and-invoice" />
        <SupportSection id="support-help-tickets" />
      </div>
    </CustomScrollbar>
  );
}
