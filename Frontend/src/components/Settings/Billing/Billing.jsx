import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Icon, addIcon } from '@iconify/react';

import CurrentSubscription from './CurrentSubscription';
import PaymentMethod from './PaymentMethod';
import BillingInformation from './BillingInformation';
import InvoiceHistory from './InvoiceHistory';
import RenewalSettings from './RenewalSettings';
import AddPaymentModal from './AddPaymentModal';
import EditBillingModal from './EditBillingModal';

// Register the exact UPI logo icon under 'thesvg-color:upi'
addIcon('thesvg-color:upi', {
  width: 32,
  height: 32,
  body: `
    <g transform="translate(6, 2) scale(0.68)">
      <!-- Green Chevron in the background -->
      <polygon points="17,3 27,21 11,32 16,21" fill="#0A7C3E"/>
      <!-- Orange Triangle in the foreground -->
      <polygon points="10,2 21,21 4,32" fill="#F46E27"/>
    </g>
  `,
});

const Billing = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const user = context?.user || {};

  const userEmail = user?.emailId || user?.email || 'luffyonepiece@gmail.com';
  const userName = user?.displayName || user?.name || (userEmail ? userEmail.split('@')[0] : 'Luffy');
  const companyName = user?.companyName || 'EduVision Creatives';

  const fullAddress = [
    user?.address1 || '1/58 Sundram layout',
    user?.address2 || 'Ramanathapuram',
    `${user?.city || 'Coimbatore'}, ${user?.state || 'Tamil Nadu'} - ${user?.pincode || '645387'}`,
    user?.country || 'India.',
  ].filter(Boolean);

  const [defaultMethod, setDefaultMethod] = useState('visa');
  const [autoRenew, setAutoRenew] = useState(true);

  // Toast notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Modals state
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isEditBillingModalOpen, setIsEditBillingModalOpen] = useState(false);

  // Billing information state
  const [billingInfo, setBillingInfo] = useState({
    billingName: userName || 'Luffy',
    billingCompany: companyName || 'EduVision Creatives',
    billingEmail: userEmail || 'luffyonepiece@gmail.com',
    billingAddress: '123, Anna Nagar',
    selectedCountryCode: 'IN',
    billingState: 'Tamil Nadu',
    billingCity: 'Madurai',
    billingPostalCode: '625020',
    billingGstin: 'luffy@okaxis',
    selectedCountryName: 'India',
  });

  const handleSavePaymentMethod = (paymentData) => {
    if (paymentData.setAsDefaultPayment) {
      setDefaultMethod(paymentData.paymentType === 'upi' ? 'upi' : 'visa');
    }
    setIsAddPaymentModalOpen(false);
    showToast('Payment method added successfully!');
  };

  const handleSaveBillingInfo = (updatedData) => {
    setBillingInfo((prev) => ({
      ...prev,
      ...updatedData,
    }));
    setIsEditBillingModalOpen(false);
    showToast('Billing information updated successfully!');
  };

  const handleSetDefaultMethod = (method) => {
    setDefaultMethod(method);
    showToast('Default payment method updated!');
  };

  const handleToggleAutoRenew = () => {
    const nextVal = !autoRenew;
    setAutoRenew(nextVal);
    showToast(nextVal ? 'Auto-renewal enabled' : 'Auto-renewal disabled');
  };

  return (
    <div className="w-full flex flex-col p-[1.5vw] font-sans relative">
      {/* Toast Notification (Matching Account/Account.jsx style) */}
      {notification.show && (
        <div
          className={`fixed top-[2vw] right-[2vw] z-50 flex items-center gap-[0.6vw] px-[1.1vw] py-[0.75vw] rounded-[0.6vw] shadow-lg border text-[0.8vw] font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'error'
              ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
              : 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'
          }`}
        >
          <Icon
            icon={notification.type === 'error' ? 'solar:danger-circle-bold' : 'solar:check-circle-bold'}
            className="w-[1.1vw] h-[1.1vw] shrink-0"
          />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Title & Subtitle + Need Help Banner */}
      <div className="flex items-start justify-between gap-[2vw] mb-[1.8vw]">
        <div>
          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight leading-tight">
            Billing and Invoice
          </h1>
          <p className="text-[0.74vw] text-gray-500 mt-[0.25vw] font-normal">
            Manage your subscription, payment methods, billing details and invoices.
          </p>
        </div>

        {/* Right: Need help with billing ? Box */}
        <div className="flex items-center gap-[0.85vw] bg-[#FDF2F0] border border-[#FDE5E1] rounded-[0.75vw] px-[1vw] py-[0.6vw] shadow-xs shrink-0">
          <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-[#E54D38] flex items-center justify-center shrink-0 shadow-xs">
            <Icon icon="lucide:headphones" className="w-[1.1vw] h-[1.1vw] text-white" strokeWidth="2.2" />
          </div>

          <div className="flex flex-col pr-[0.6vw]">
            <h4 className="text-[0.82vw] font-medium text-gray-800 leading-tight">
              Need help with billing ?
            </h4>
            <p className="text-[0.68vw] text-gray-500 mt-[0.15vw] leading-tight font-normal">
              Get support for payment, invoices or subscription.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/settings/support')}
            className="flex items-center gap-[0.35vw] bg-[#E54D38] hover:bg-[#d63f2b] active:scale-[0.98] text-white text-[0.78vw] font-medium px-[0.95vw] py-[0.45vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Contact Support</span>
            <Icon icon="lucide:arrow-right" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2.2" />
          </button>
        </div>
      </div>

      {/* 1. Current Subscription Card */}
      <CurrentSubscription
        planName="Pro Plan"
        isActive={true}
        description="All premium features, unlimited flipibooks and more"
        nextBillingDate="14 Oct 2027"
        paymentStatus="Paid"
        currency="₹"
        price="4,999"
        interval="/ year"
        onManagePlan={() => navigate('/settings/billing')}
        onViewAllPlans={() => navigate('/home')}
      />

      {/* 2. Two Column Grid: Payment Method & Billing Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.2vw] mb-[1.5vw] items-stretch">
        <PaymentMethod
          defaultMethod={defaultMethod}
          onSetDefault={handleSetDefaultMethod}
          onAddNew={() => setIsAddPaymentModalOpen(true)}
        />

        <BillingInformation
          billingName={billingInfo.billingName}
          billingCompany={billingInfo.billingCompany}
          billingEmail={billingInfo.billingEmail}
          billingAddress={billingInfo.billingAddress}
          billingCity={billingInfo.billingCity}
          billingState={billingInfo.billingState}
          billingPostalCode={billingInfo.billingPostalCode}
          selectedCountryName={billingInfo.selectedCountryName}
          billingGstin={billingInfo.billingGstin}
          fullAddress={fullAddress}
          onEdit={() => setIsEditBillingModalOpen(true)}
        />
      </div>

      {/* 3. Invoice History Section */}
      <InvoiceHistory
        onDownload={(invoice) => showToast(`Downloading ${invoice.id}...`)}
        onViewAll={() => showToast('Showing all invoices')}
      />

      {/* 4. Renewal Settings Section */}
      <RenewalSettings
        autoRenew={autoRenew}
        onToggleAutoRenew={handleToggleAutoRenew}
        nextRenewalDate="Apr 29, 2027"
        currentPlan="Pro Plan (Yearly)"
      />

      {/* 5. Add Payment Method Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onSave={handleSavePaymentMethod}
        userName={userName}
      />

      {/* 6. Edit Billing Information Modal */}
      <EditBillingModal
        isOpen={isEditBillingModalOpen}
        onClose={() => setIsEditBillingModalOpen(false)}
        onSave={handleSaveBillingInfo}
        initialData={billingInfo}
      />
    </div>
  );
};

export default Billing;

