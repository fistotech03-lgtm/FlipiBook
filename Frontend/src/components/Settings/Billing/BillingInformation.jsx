import React from 'react';
import { Icon } from '@iconify/react';

const BillingInformation = ({
  billingName = 'Luffy',
  billingCompany = 'EduVision Creatives',
  billingEmail = 'luffyonepiece@gmail.com',
  billingAddress,
  billingCity,
  billingState,
  billingPostalCode,
  selectedCountryName = 'India',
  billingGstin,
  fullAddress = [],
  onEdit,
}) => {
  return (
    <div className="w-full h-full bg-white border border-gray-100 rounded-[0.9vw] p-[1.3vw] shadow-xs flex flex-col justify-between">
      <div className="flex flex-col h-full">
        {/* Header: Icon + Title & Edit details Button */}
        <div className="flex items-start justify-between gap-[1vw] mb-[0.2vw]">
          <div>
            <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
              <Icon icon="solar:document-text-bold" className="w-[1.1vw] h-[1.1vw] text-[#EC5137]" />
              <h2 className="text-[0.92vw] font-bold text-gray-900">Billing Information</h2>
            </div>
            <p className="text-[0.72vw] text-gray-400 pl-[1.65vw] font-normal">
              Your billing details will be used for invoice and tax purposes
            </p>
          </div>

          {/* Edit Details Button */}
          <button
            type="button"
            onClick={onEdit}
            className="h-[2.15vw] flex items-center gap-[0.35vw] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-[0.78vw] font-medium px-[0.95vw] rounded-[0.55vw] shadow-xs transition-colors cursor-pointer active:scale-[0.98] whitespace-nowrap"
          >
            <Icon icon="lucide:pencil" className="w-[0.78vw] h-[0.78vw] text-gray-500" strokeWidth="2.2" />
            <span>Edit details</span>
          </button>
        </div>

        {/* Gray Sub-Container with 2-Column Fields Grid */}
        <div className="flex-1 w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.65vw] p-[1.1vw] grid grid-cols-2 gap-x-[1.6vw] gap-y-[0.75vw] items-start content-between shadow-xs mt-[1.1vw]">
          {/* Left Column 1: Billing Name */}
          <div className="flex flex-col">
            <span className="text-[0.70vw] text-gray-400 font-normal">Billing Name</span>
            <span className="text-[0.80vw] font-medium text-gray-800 mt-[0.1vw]">
              {billingName}
            </span>
          </div>

          {/* Right Column 1: Billing Address */}
          <div className="flex flex-col row-span-2">
            <span className="text-[0.70vw] text-gray-400 font-normal">Billing Address</span>
            <div className="text-[0.80vw] font-medium text-gray-800 mt-[0.1vw] leading-snug">
              {billingAddress && billingAddress !== '123, Anna Nagar' ? (
                <>
                  <div>{billingAddress}</div>
                  <div>
                    {billingCity}, {billingState} - {billingPostalCode}
                  </div>
                  <div>{selectedCountryName}</div>
                </>
              ) : (
                fullAddress.map((line, idx) => <div key={idx}>{line}</div>)
              )}
            </div>
          </div>

          {/* Left Column 2: Company Name */}
          <div className="flex flex-col">
            <span className="text-[0.70vw] text-gray-400 font-normal">Company Name (Optional)</span>
            <span className="text-[0.80vw] font-medium text-gray-800 mt-[0.1vw]">
              {billingCompany}
            </span>
          </div>

          {/* Left Column 3: Billing Email */}
          <div className="flex flex-col">
            <span className="text-[0.70vw] text-gray-400 font-normal">Billing Email</span>
            <span className="text-[0.80vw] font-medium text-gray-800 mt-[0.1vw]">
              {billingEmail}
            </span>
          </div>

          {/* Right Column 2: GSTIN */}
          <div className="flex flex-col">
            <span className="text-[0.70vw] text-gray-400 font-normal">GSTIN (Optional)</span>
            <span className="text-[0.80vw] font-medium text-gray-800 mt-[0.1vw]">
              {billingGstin || 'Not provided'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingInformation;

