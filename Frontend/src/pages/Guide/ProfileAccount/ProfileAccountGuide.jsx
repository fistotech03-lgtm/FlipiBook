import React from 'react';
import ProfileSection, { profileSections } from './ProfileSection';
import AccountSection, { accountSections } from './AccountSection';
import BillingInvoiceSection, { billingInvoiceSections } from './BillingInvoiceSection';
import SupportSection, { supportSections } from './SupportSection';

export const profileAccountGuideSections = [
  ...profileSections,
  ...accountSections,
  ...billingInvoiceSections,
  ...supportSections
];

export default function ProfileAccountGuide({ selectedSubItem }) {
  if (profileSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <ProfileSection selectedSubItem={selectedSubItem} />;
  }
  if (accountSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <AccountSection selectedSubItem={selectedSubItem} />;
  }
  if (billingInvoiceSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <BillingInvoiceSection selectedSubItem={selectedSubItem} />;
  }
  if (supportSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <SupportSection selectedSubItem={selectedSubItem} />;
  }
  return null;
}
