import React from 'react';
import { Icon } from '@iconify/react';

const PaymentMethod = ({ defaultMethod = 'visa', onSetDefault, onAddNew }) => {
  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm flex flex-col justify-between">
      <div className="flex flex-col h-full">
        {/* Header: Icon + Title & Add New Button */}
        <div className="flex items-start justify-between gap-[1vw] mb-[0.2vw]">
          <div>
            <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
              <Icon icon="solar:card-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
              <h2 className="text-[0.98vw] font-medium text-gray-800">Payment Method</h2>
            </div>
            <p className="text-[0.72vw] text-gray-500 pl-[1.65vw] font-normal">
              Manage payment methods used for subscription renewals
            </p>
          </div>

          {/* Add New Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-[0.35vw] bg-[#222428] hover:bg-[#151618] active:scale-[0.98] text-white text-[0.78vw] font-medium px-[0.9vw] py-[0.42vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Icon icon="lucide:plus" className="w-[0.8vw] h-[0.8vw]" strokeWidth="2.2" />
            <span>Add New</span>
          </button>
        </div>

        {/* Payment Method Rows Container */}
        <div className="flex-1 flex flex-col justify-between gap-[0.75vw] mt-[1.1vw]">
          {/* Row 1: Visa Ending in 4242 */}
          <div className="w-full flex-1 min-h-[4.2vw] bg-[#f8f9fa] hover:bg-gray-100/70 border border-[#f0f2f5] rounded-[0.75vw] px-[1.1vw] py-[0.8vw] flex items-center justify-between shadow-xs transition-colors">
            {/* Left: Card Brand Logo + Details */}
            <div className="flex items-center gap-[0.85vw]">
              <div className="w-[3.6vw] h-[2.2vw] rounded-[0.4vw] bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs px-[0.3vw]">
                <Icon icon="logos:visa" className="w-[2.2vw] h-[1.1vw] object-contain" />
              </div>

              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800 leading-tight">
                  Visa ending in 4242
                </span>
                <span className="text-[0.72vw] text-gray-400 mt-[0.15vw] font-normal">
                  Expires 08/2028
                </span>
              </div>
            </div>

            {/* Right: Default Badge / Button & Three Dots Menu */}
            <div className="flex items-center gap-[0.9vw]">
              {defaultMethod === 'visa' ? (
                <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-flex items-center justify-center leading-normal">
                  Default
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetDefault?.('visa')}
                  className="text-[#2563EB] hover:text-[#1d4ed8] text-[0.74vw] font-medium transition-colors cursor-pointer"
                >
                  Set as default
                </button>
              )}

              <button
                type="button"
                className="text-gray-500 hover:text-gray-800 p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:more-horizontal" className="w-[1vw] h-[1vw]" strokeWidth="2.2" />
              </button>
            </div>
          </div>

          {/* Row 2: Mastercard Ending in 4242 */}
          <div className="w-full flex-1 min-h-[4.2vw] bg-[#f8f9fa] hover:bg-gray-100/70 border border-[#f0f2f5] rounded-[0.75vw] px-[1.1vw] py-[0.8vw] flex items-center justify-between shadow-xs transition-colors">
            {/* Left: Card Brand Logo + Details */}
            <div className="flex items-center gap-[0.85vw]">
              <div className="w-[3.6vw] h-[2.2vw] rounded-[0.4vw] bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs px-[0.3vw]">
                <Icon icon="logos:mastercard" className="w-[2vw] h-[1.2vw] object-contain" />
              </div>

              <div className="flex flex-col">
                <span className="text-[0.85vw] font-medium text-gray-800 leading-tight">
                  Mastercard ending in 4242
                </span>
                <span className="text-[0.72vw] text-gray-400 mt-[0.15vw] font-normal">
                  Expires 08/2028
                </span>
              </div>
            </div>

            {/* Right: Default Badge / Button & Three Dots Menu */}
            <div className="flex items-center gap-[0.9vw]">
              {defaultMethod === 'mastercard' ? (
                <span className="bg-[#DCFCE7] text-[#16A34A] text-[0.68vw] font-medium px-[0.75vw] py-[0.18vw] rounded-full inline-flex items-center justify-center leading-normal">
                  Default
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetDefault?.('mastercard')}
                  className="text-[#2563EB] hover:text-[#1d4ed8] text-[0.74vw] font-medium transition-colors cursor-pointer"
                >
                  Set as default
                </button>
              )}

              <button
                type="button"
                className="text-gray-500 hover:text-gray-800 p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:more-horizontal" className="w-[1vw] h-[1vw]" strokeWidth="2.2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;

