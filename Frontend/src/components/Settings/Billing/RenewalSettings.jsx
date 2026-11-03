import React from 'react';
import { Icon } from '@iconify/react';

const RenewalSettings = ({
  autoRenew = true,
  onToggleAutoRenew,
  nextRenewalDate = 'Apr 29, 2027',
  currentPlan = 'Pro Plan (Yearly)',
}) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-[1vw] p-[1.5vw] shadow-sm mb-[1.5vw]">
      {/* Header: Icon + Title & Subtitle */}
      <div className="flex items-start justify-between mb-[1.3vw]">
        <div>
          <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
            <Icon icon="solar:restart-bold" className="w-[1.1vw] h-[1.1vw] text-[#4b5563]" />
            <h2 className="text-[0.98vw] font-medium text-gray-800">Renewal Settings</h2>
          </div>
          <p className="text-[0.72vw] text-gray-500 pl-[1.65vw] font-normal">
            Manage your subscription renewal preferences
          </p>
        </div>
      </div>

      {/* Inner Card / Details Container */}
      <div className="w-full bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] p-[1.1vw] flex items-center justify-between shadow-xs">
        {/* Left: Crown icon + Auto-Renewal title + toggle + description */}
        <div className="flex items-center gap-[0.9vw]">
          <div className="w-[2.8vw] h-[2.8vw] rounded-[0.6vw] bg-[#FFF8EC] border border-[#FFE8BF] flex items-center justify-center shrink-0 shadow-xs">
            <Icon icon="solar:crown-bold" className="w-[1.5vw] h-[1.5vw] text-[#F59E0B]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-[0.75vw]">
              <h4 className="text-[0.85vw] font-medium text-gray-800 leading-none">Auto-Renewal</h4>

              {/* Switch Toggle */}
              <button
                type="button"
                onClick={onToggleAutoRenew}
                className="relative inline-flex items-center w-[2.6vw] h-[1.5vw] shrink-0 cursor-pointer focus:outline-none"
              >
                {/* Track */}
                <span
                  className={`w-[2.3vw] h-[1vw] rounded-full transition-colors duration-200 ease-in-out ${
                    autoRenew ? 'bg-[#EC5137]' : 'bg-gray-200'
                  }`}
                />

                {/* Circular Button with Centered White Checkmark */}
                <span
                  className={`absolute top-1/2 -translate-y-1/2 w-[1.35vw] h-[1.35vw] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.18)] flex items-center justify-center transition-transform duration-200 ease-in-out ${
                    autoRenew ? 'translate-x-[1.15vw] bg-[#EC5137]' : 'translate-x-0 bg-white'
                  }`}
                >
                  {autoRenew ? (
                    <Icon icon="lucide:check" className="w-[0.75vw] h-[0.75vw] text-white stroke-[3.5]" />
                  ) : null}
                </span>
              </button>
            </div>

            <p className="text-[0.72vw] text-gray-500 mt-[0.3vw] font-normal">
              Automatically renew your subscription at the end of each billing cycle
            </p>
          </div>
        </div>

        {/* Right: Next Renewal Date & Current Plan */}
        <div className="flex items-center">
          {/* Next Renewal Date */}
          <div className="flex flex-col justify-center px-[1.8vw]">
            <span className="text-[0.7vw] text-gray-400 font-normal">Next Renewal Date</span>
            <div className="flex items-center gap-[0.4vw] text-gray-700 mt-[0.25vw]">
              <Icon icon="lucide:calendar-clock" className="w-[0.9vw] h-[0.9vw] text-[#4b5563] shrink-0" strokeWidth="2" />
              <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">
                {nextRenewalDate}
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-[2vw] w-[1px] bg-gray-200 shrink-0" />

          {/* Current Plan */}
          <div className="flex flex-col justify-center pl-[1.8vw]">
            <span className="text-[0.7vw] text-gray-400 font-normal">Current Plan</span>
            <div className="flex items-center gap-[0.4vw] text-gray-700 mt-[0.25vw]">
              <Icon icon="solar:crown-bold" className="w-[0.9vw] h-[0.9vw] text-[#F59E0B] shrink-0" />
              <span className="text-[0.78vw] font-medium text-gray-800 whitespace-nowrap">
                {currentPlan}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalSettings;

