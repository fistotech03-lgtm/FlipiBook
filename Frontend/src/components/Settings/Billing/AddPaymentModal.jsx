import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const AddPaymentModal = ({ isOpen, onClose, onSave, userName = 'Luffy' }) => {
  const [paymentType, setPaymentType] = useState('card'); // 'card', 'upi', 'netbanking'
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState(userName);
  const [upiId, setUpiId] = useState('luffy@okaxis');
  const [setAsDefaultPayment, setSetAsDefaultPayment] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave?.({
      paymentType,
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
      upiId,
      setAsDefaultPayment,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-[1vw]"
    >
      <div
        className="w-full max-w-[34vw] bg-white rounded-[1vw] shadow-xl border border-gray-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-[1.6vw] pt-[1.35vw] pb-[0.8vw] border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-[0.65vw]">
              <div className="mt-[0.1vw] text-[#EC5137]">
                <Icon icon="lucide:credit-card" className="w-[1.15vw] h-[1.15vw]" strokeWidth="2.2" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[1.15vw] font-semibold text-gray-800 leading-tight">
                  Add Payment Method
                </h2>
                <p className="text-[0.72vw] text-gray-500 mt-[0.2vw] font-normal">
                  Add a new payment method for future subscription payments.
                </p>
              </div>
            </div>

            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100"
            >
              <Icon icon="lucide:x" className="w-[0.95vw] h-[0.95vw]" strokeWidth="2.2" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="px-[1.6vw] pb-[1.4vw] pt-[1vw] flex flex-col gap-[0.95vw]">
          {/* Payment Type Selection Tabs */}
          <div className="grid grid-cols-3 gap-[0.7vw]">
            {/* Option 1: Card */}
            <button
              type="button"
              onClick={() => setPaymentType('card')}
              className={`flex items-center gap-[0.55vw] p-[0.65vw] rounded-[0.55vw] border text-left transition-all cursor-pointer ${
                paymentType === 'card'
                  ? 'border-[#EC5137] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] bg-[#FDF2F0] flex items-center justify-center shrink-0">
                <Icon icon="bi:credit-card" className="w-[1vw] h-[1vw] text-[#EC5137]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.76vw] font-medium text-gray-800 leading-tight">Card</span>
                <span className="text-[0.62vw] text-gray-400 mt-[0.1vw] truncate font-normal">Credit / Debit</span>
              </div>
            </button>

            {/* Option 2: UPI */}
            <button
              type="button"
              onClick={() => setPaymentType('upi')}
              className={`flex items-center gap-[0.55vw] p-[0.65vw] rounded-[0.55vw] border text-left transition-all cursor-pointer ${
                paymentType === 'upi'
                  ? 'border-[#EC5137] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                <Icon icon="thesvg-color:upi" className="w-[1.05vw] h-[1.05vw]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.76vw] font-medium text-gray-800 leading-tight">UPI</span>
                <span className="text-[0.62vw] text-gray-400 mt-[0.1vw] truncate font-normal">GPay, Paytm, etc.</span>
              </div>
            </button>

            {/* Option 3: Net Banking */}
            <button
              type="button"
              onClick={() => setPaymentType('netbanking')}
              className={`flex items-center gap-[0.55vw] p-[0.65vw] rounded-[0.55vw] border text-left transition-all cursor-pointer ${
                paymentType === 'netbanking'
                  ? 'border-[#EC5137] bg-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                <Icon icon="fluent:building-bank-24-filled" className="w-[1.05vw] h-[1.05vw] text-gray-700" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.76vw] font-medium text-gray-800 leading-tight">Net Banking</span>
                <span className="text-[0.62vw] text-gray-400 mt-[0.1vw] truncate font-normal">All major banks</span>
              </div>
            </button>
          </div>

          {/* Conditional Fields: Card vs UPI */}
          {paymentType === 'upi' ? (
            /* UPI ID Field */
            <div className="flex flex-col gap-[0.3vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="luffy@okaxis"
                className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
              />
              <p className="text-[0.66vw] text-gray-400 mt-[0.1vw] font-normal">
                Enter your UPI ID to set up automatic subscription payments.
              </p>
            </div>
          ) : (
            /* Card Fields */
            <>
              {/* Card Number Field */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">Card Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-[0.75vw] text-gray-400 flex items-center pointer-events-none">
                    <Icon icon="lucide:credit-card" className="w-[0.9vw] h-[0.9vw]" strokeWidth="2" />
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-[2.2vw] pr-[7.2vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
                  />
                  {/* Card Brand Logos */}
                  <div className="absolute right-[0.75vw] flex items-center gap-[0.3vw] pointer-events-none">
                    <Icon icon="logos:visa" className="w-[1.25vw] h-[0.7vw] object-contain" />
                    <Icon icon="logos:mastercard" className="w-[1.05vw] h-[0.7vw] object-contain" />
                    <Icon icon="logos:amex" className="w-[1.1vw] h-[0.7vw] object-contain" />
                  </div>
                </div>
              </div>

              {/* Expiry Date & CVV Row */}
              <div className="grid grid-cols-2 gap-[0.85vw]">
                {/* Expiry Date */}
                <div className="flex flex-col gap-[0.3vw]">
                  <label className="text-[0.74vw] font-medium text-gray-700">Expiry Date</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM / YY"
                      className="w-full px-[0.85vw] pr-[2.2vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
                    />
                    <div className="absolute right-[0.75vw] text-gray-400 flex items-center pointer-events-none">
                      <Icon icon="lucide:calendar" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2" />
                    </div>
                  </div>
                </div>

                {/* CVV */}
                <div className="flex flex-col gap-[0.3vw]">
                  <label className="text-[0.74vw] font-medium text-gray-700">CVV</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="w-full px-[0.85vw] pr-[2.4vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
                    />
                    <div className="absolute right-[0.75vw] flex items-center gap-[0.25vw]">
                      <Icon icon="lucide:lock" className="w-[0.8vw] h-[0.8vw] text-gray-400" strokeWidth="2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cardholder Name Field */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">Cardholder Name</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Luffy"
                  className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
                />
              </div>
            </>
          )}

          {/* Checkbox: Set as default payment method */}
          <div className="flex items-start gap-[0.5vw] pt-[0.1vw]">
            <button
              type="button"
              onClick={() => setSetAsDefaultPayment(!setAsDefaultPayment)}
              className={`w-[0.95vw] h-[0.95vw] rounded-[0.25vw] flex items-center justify-center shrink-0 mt-[0.1vw] transition-colors cursor-pointer ${
                setAsDefaultPayment
                  ? 'bg-[#EC5137] text-white'
                  : 'border border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {setAsDefaultPayment && <Icon icon="lucide:check" className="w-[0.7vw] h-[0.7vw] stroke-[3.5]" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[0.74vw] font-medium text-gray-800 leading-tight">
                Set as default payment method
              </span>
              <span className="text-[0.66vw] text-gray-400 mt-[0.1vw] font-normal">
                This method will be used for all future subscription payments
              </span>
            </div>
          </div>

          {/* Informational Blue Banner (Shown when UPI is selected) */}
          {paymentType === 'upi' && (
            <div className="flex items-center gap-[0.55vw] bg-[#EEF4FF] border border-[#D0E1FD] rounded-[0.55vw] px-[0.85vw] py-[0.6vw] mt-[0.2vw]">
              <Icon icon="solar:lock-keyhole-bold" className="w-[0.95vw] h-[0.95vw] text-[#3B82F6] shrink-0" />
              <p className="text-[0.66vw] text-[#475569] leading-tight font-normal">
                Your payment method will be linked only after successful authorization.
              </p>
            </div>
          )}

          {/* Action Buttons: Cancel & Add Payment Method */}
          <div className="flex items-center justify-end gap-[0.65vw] pt-[0.4vw]">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-[0.35vw] px-[1.05vw] py-[0.48vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-[0.76vw] font-medium text-gray-700 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Icon icon="lucide:x" className="w-[0.8vw] h-[0.8vw] text-gray-500" strokeWidth="2.2" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-[0.38vw] px-[1.2vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.76vw] font-medium shadow-xs transition-all cursor-pointer"
            >
              <Icon icon="lucide:credit-card" className="w-[0.8vw] h-[0.8vw]" strokeWidth="2.2" />
              <span>Add Payment Method</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;

