import React from 'react';
import { Icon } from '@iconify/react';

const CurrentSubscription = ({
  planName = 'Pro Plan',
  isActive = true,
  description = 'All premium features, unlimited flipibooks and more',
  nextBillingDate = '14 Oct 2027',
  paymentStatus = 'Paid',
  currency = '₹',
  price = '4,999',
  interval = '/ year',
  onManagePlan,
  onViewAllPlans,
}) => {
  return (
    <div
      className="w-full rounded-[1vw] p-[1.5vw] text-white shadow-sm mb-[1.5vw]"
      style={{
        background: 'radial-gradient(ellipse at 50% 10%, #2a2c30 0%, #1e2023 60%, #18191b 100%)',
      }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-[0.55vw] mb-[0.2vw]">
        <Icon icon="solar:crown-bold" className="w-[1.1vw] h-[1.1vw] text-[#F59E0B] shrink-0" />
        <h2 className="text-[0.98vw] font-medium text-white">Current Subscription</h2>
      </div>
      <p className="text-[0.72vw] text-gray-400 mb-[1.3vw] pl-[1.65vw] font-normal">
        Your active subscription tier and renewal schedule
      </p>

      {/* Inner Card (Dark Grey Rounded Panel) */}
      <div className="w-full bg-[#27292c] border border-white/10 rounded-[0.75vw] px-[1.4vw] py-[1.2vw] flex items-center justify-between shadow-xs">
        {/* Section 1: Plan Details & Action Buttons */}
        <div className="flex items-center gap-[1.1vw]">
          {/* White Rounded Square Badge with Crown */}
          <div className="w-[3.4vw] h-[3.4vw] rounded-[0.75vw] bg-white flex items-center justify-center shrink-0 shadow-xs">
            <Icon icon="solar:crown-bold" className="w-[2vw] h-[2vw] text-[#F59E0B]" />
          </div>

          {/* Plan Info and Buttons */}
          <div className="flex flex-col">
            {/* Plan Title & Active Badge */}
            <div className="flex items-center gap-[0.55vw]">
              <h3 className="text-[1.15vw] font-semibold text-white tracking-tight leading-none">
                {planName}
              </h3>
              {isActive && (
                <span className="bg-[#DCFCE7]/20 text-[#4ade80] border border-[#22C55E]/30 text-[0.66vw] font-medium px-[0.6vw] py-[0.15vw] rounded-full inline-flex items-center justify-center leading-normal">
                  Active
                </span>
              )}
            </div>

            {/* Plan Features Subtitle */}
            <p className="text-[0.74vw] text-gray-400 mt-[0.35vw] mb-[0.9vw] font-normal">
              {description}
            </p>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-[1.1vw]">
              {/* Manage Plan Button */}
              <button
                type="button"
                onClick={onManagePlan}
                className="flex items-center gap-[0.35vw] bg-[#E54D38] hover:bg-[#d63f2b] active:scale-[0.98] text-white text-[0.78vw] font-medium px-[1.05vw] py-[0.45vw] rounded-full shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Manage Plan</span>
                <Icon icon="lucide:arrow-right" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2.2" />
              </button>

              {/* View All Plans Link */}
              <button
                type="button"
                onClick={onViewAllPlans}
                className="flex items-center gap-[0.3vw] text-gray-300 hover:text-white text-[0.78vw] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>View All Plans</span>
                <Icon icon="lucide:arrow-right" className="w-[0.85vw] h-[0.85vw]" strokeWidth="2.2" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Next Billing Date */}
        <div className="flex flex-col justify-center px-[2vw] border-r border-white/10 min-w-0">
          <span className="text-[0.72vw] text-gray-400 font-normal">Next Billing Date</span>
          <div className="flex items-center gap-[0.4vw] text-gray-200 mt-[0.35vw]">
            <Icon icon="lucide:calendar" className="w-[0.9vw] h-[0.9vw] text-gray-400 shrink-0" strokeWidth="2" />
            <span className="text-[0.82vw] font-medium text-white whitespace-nowrap">
              {nextBillingDate}
            </span>
          </div>
        </div>

        {/* Section 3: Payment Status */}
        <div className="flex flex-col justify-center px-[2vw] border-r border-white/10 min-w-0">
          <span className="text-[0.72vw] text-gray-400 font-normal">Payment Status</span>
          <div className="flex items-center gap-[0.4vw] mt-[0.35vw]">
            <div className="w-[0.9vw] h-[0.9vw] rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
              <Icon icon="lucide:check" className="w-[0.6vw] h-[0.6vw] text-white" strokeWidth="3.2" />
            </div>
            <span className="text-[0.82vw] font-medium text-white whitespace-nowrap">
              {paymentStatus}
            </span>
          </div>
        </div>

        {/* Section 4: Price / Interval */}
        <div className="flex flex-col items-end justify-center pl-[2vw] shrink-0">
          <div className="flex items-baseline text-white">
            <span className="text-[1.3vw] font-medium mr-[0.15vw]">{currency}</span>
            <span className="text-[1.8vw] font-bold tracking-tight">{price}</span>
          </div>
          <span className="text-[0.72vw] text-gray-400 -mt-[0.1vw] font-normal">{interval}</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentSubscription;

