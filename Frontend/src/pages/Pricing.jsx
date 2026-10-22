import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import BannerImage from '../assets/pricing/Banner-image.png';
import { Icon } from '@iconify/react';
import { 
  CreditCard, 
  RotateCw, 
  ChevronDown, 
  ArrowRight, 
  Minus, 
  Receipt 
} from 'lucide-react';
import InvoiceModal from './Pricing/InvoiceModal';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const isAnnual = billingCycle === 'annual';

  // Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoicePlan, setInvoicePlan] = useState('standard');

  const openInvoiceForPlan = (planKey) => {
    setInvoicePlan(planKey);
    setIsInvoiceOpen(true);
  };

  // State for exclusive FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // default first item open

  const toggleFaqCard = (idx) => {
    setOpenFaqIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#ea7233] selection:text-white w-full overflow-x-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="pt-8 sm:pt-12 lg:pt-14 pb-6 sm:pb-8 lg:pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-full mx-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#232733] leading-tight">
            Plans built for the way <span className="text-[#ea7233]">your work</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed">
            Choose the right plan for your needs and create stunning interactive digital catalogues with ease.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-2 pb-1 flex justify-center items-center">
            <div className="bg-slate-100 p-1 sm:p-1.5 rounded-xl inline-flex items-center gap-1 shadow-inner border border-slate-200">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                  !isAnnual
                    ? 'bg-[#181e29] text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 bg-transparent'
                }`}
              >
                Monthly billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isAnnual
                    ? 'bg-[#181e29] text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 bg-white'
                }`}
              >
                <span>Annual billing</span>
                <span className="bg-[#ff3b30] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Trust Badges & Quick Invoice Trigger */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ea7233] text-white flex items-center justify-center shadow-sm shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span>No credit card required</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ea7233] text-white flex items-center justify-center shadow-sm shrink-0">
                <RotateCw className="w-3.5 h-3.5" />
              </div>
              <span>Easy upgrade anytime</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ea7233] text-white flex items-center justify-center shadow-sm shrink-0">
                <Icon icon="hugeicons:tick-01" className="w-3.5 h-3.5" />
              </div>
              <span>Secure &amp; reliable</span>
            </div>

            <button
              type="button"
              onClick={() => openInvoiceForPlan('standard')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-[#ea7233]/40 text-[#ea7233] hover:bg-[#ea7233] hover:text-white transition-all font-semibold shadow-xs cursor-pointer group"
              title="Preview official Flipibook invoice for your business"
            >
              <Receipt className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Preview Invoice</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. PRICING CARDS SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* CARD 1: FREE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 lg:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Top Icon */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Icon icon="carbon:cube" className="w-6 h-6 text-slate-700" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-slate-900 mb-1.5">Free</h3>
              <p className="text-gray-600 text-sm mb-5 min-h-[40px]">
                Perfect for individuals and small business getting started.
              </p>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {isAnnual ? '$15.99' : '$19.99'}
                </span>
                <span className="text-slate-500 font-medium text-xs sm:text-sm">/month</span>
              </div>

              {/* Action Button */}
              <div className="space-y-2 mb-6">
                <Link
                  to="/signup"
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-[#ea7233] text-[#ea7233] font-bold text-sm text-center block hover:bg-orange-50 transition-colors"
                >
                  Get Started
                </Link>
                <button
                  type="button"
                  onClick={() => openInvoiceForPlan('free')}
                  className="w-full py-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#ea7233]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">What&apos;s included :</p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Create up to 5 flipbooks/month</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Basic templates</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Add images, videos &amp; links</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Share via link or embed</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 2: STANDARD (MOST POPULAR) */}
          <div className="relative bg-[#fff7f2] border-2 border-[#ea7233] rounded-2xl p-6 sm:p-7 lg:p-8 shadow-md flex flex-col justify-between">
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 right-6 bg-[#ea7233] text-white shadow-sm px-3 py-1 rounded-full flex items-center gap-1.5">
              <Icon icon="fa6-solid:crown" className="w-3 h-3 text-white" />
              <span className="text-[11px] font-bold tracking-wide uppercase">Most Popular</span>
            </div>

            <div>
              {/* Top Icon */}
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Icon icon="bi:people" className="w-6 h-6 text-[#ea7233]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-slate-900 mb-1.5">Standard</h3>
              <p className="text-gray-600 text-sm mb-5 min-h-[40px]">
                Ideal for growing teams and businesses with advanced needs.
              </p>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {isAnnual ? '$31.99' : '$39.99'}
                </span>
                <span className="text-slate-600 font-medium text-xs sm:text-sm">/month</span>
              </div>

              {/* Action Button */}
              <div className="space-y-2 mb-6">
                <Link
                  to="/signup"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#ea7233] hover:bg-[#d65a1c] text-white font-bold text-sm text-center block shadow-md shadow-orange-500/20 transition-all"
                >
                  Upgrade Now
                </Link>
                <button
                  type="button"
                  onClick={() => openInvoiceForPlan('standard')}
                  className="w-full py-1.5 px-3 rounded-lg text-[#ea7233] hover:bg-orange-100/60 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#ea7233]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2 border-t border-orange-200/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">What&apos;s included :</p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Create up to 5 flipbooks/month</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Premium templates</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Custom branding (logo, colors)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Team collaboration (up to 5 users)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Custom domain</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 3: PREMIUM */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 lg:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Top Icon */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Icon icon="bi:building" className="w-6 h-6 text-slate-700" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-slate-900 mb-1.5">Premium</h3>
              <p className="text-gray-600 text-sm mb-5 min-h-[40px]">
                For large organizations with custom requirements.
              </p>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {isAnnual ? '$79.99' : '$99.99'}
                </span>
                <span className="text-slate-500 font-medium text-xs sm:text-sm">/month</span>
              </div>

              {/* Action Button */}
              <div className="space-y-2 mb-6">
                <Link
                  to="/signup"
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-[#ea7233] text-[#ea7233] font-bold text-sm text-center block hover:bg-orange-50 transition-colors"
                >
                  Go Premium
                </Link>
                <button
                  type="button"
                  onClick={() => openInvoiceForPlan('premium')}
                  className="w-full py-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#ea7233]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">What&apos;s included :</p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Unlimited flipbooks</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>All premium features</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Team collaboration (unlimited users)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Advanced analytics &amp; reports</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>API access &amp; integrations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-4 h-4 text-[#ea7233] shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. FEATURE COMPARISON TABLE */}
      {/* ------------------------------------------------------------- */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            FEATURE COMPARISON
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Compare Plans &amp; <span className="text-[#ea7233]">Features</span>
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Explore what each plan includes and find the one that fits your flipbook creation and publishing needs.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse min-w-[640px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 divide-x divide-slate-200">
                <th className="w-1/4 bg-[#111827] text-white font-bold text-center py-3.5 px-4 sm:px-6 text-sm sm:text-base">
                  Features
                </th>
                <th className="w-1/4 bg-[#edf4ff] text-[#1e293b] font-bold text-center py-3.5 px-4 sm:px-6 text-sm sm:text-base">
                  Free
                </th>
                <th className="w-1/4 bg-[#fff0e6] text-center py-3.5 px-4 sm:px-6">
                  <div className="font-bold text-[#ea7233] text-sm sm:text-base">Standard</div>
                  <div className="text-xs text-[#ea7233]/80 font-medium mt-0.5">
                    {isAnnual ? '$31.99 /month' : '$39.99 /month'}
                  </div>
                </th>
                <th className="w-1/4 bg-[#fff8eb] text-center py-3.5 px-4 sm:px-6">
                  <div className="font-bold text-[#854d0e] text-sm sm:text-base">Premium</div>
                  <div className="text-xs text-[#854d0e]/80 font-medium mt-0.5">
                    {isAnnual ? '$79.99 /month' : '$99.99 /month'}
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700 font-medium">
              
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">Number of Flipbooks</td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-600">Up to 5</td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">Page view (Monthly)</td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-600">1,000</td>
                <td className="py-3 px-4 sm:px-6 text-center font-semibold text-slate-800">10,000</td>
                <td className="py-3 px-4 sm:px-6 text-center font-semibold text-slate-800">Unlimited</td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">3D page Flip effect</td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">
                  Interactive Elements <br/> <span className="text-xs text-slate-500 font-normal">(Links, Video, Audio, etc.)</span>
                </td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-600">Basic</td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">Product Catalogue Templates</td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-600">Basic</td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">Analytics &amp; Insights</td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-600">Basic</td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 7 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">Remove Flipbook Branding</td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-400">
                  <Minus className="w-4 h-4 mx-auto text-slate-300" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 8 */}
              <tr className="hover:bg-slate-50/60 transition-colors divide-x divide-slate-200">
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 bg-[#F9FAFB]">Custom Domain</td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-400">
                  <Minus className="w-4 h-4 mx-auto text-slate-300" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center text-slate-400">
                  <Minus className="w-4 h-4 mx-auto text-slate-300" />
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <Icon icon="hugeicons:tick-01" className="w-6 h-6 text-[#16a34a] mx-auto stroke-[2.5]" />
                </td>
              </tr>

            </tbody>

            {/* Table Footer Buttons */}
            <tfoot className="border-t border-slate-200">
              <tr className="divide-x divide-slate-200">
                <td className="py-4 px-4 sm:px-6 bg-[#F9FAFB]"></td>
                <td className="py-4 px-3 sm:px-4 text-center bg-slate-50/50">
                  <Link
                    to="/signup"
                    className="inline-block py-2 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm transition-all shadow-xs"
                  >
                    Get Started
                  </Link>
                </td>
                <td className="py-4 px-3 sm:px-4 text-center bg-slate-50/50">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl bg-[#ea7233] hover:bg-[#d65a1c] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <span>Upgrade Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
                <td className="py-4 px-3 sm:px-4 text-center bg-slate-50/50">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <span>Go Premium</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. FREQUENTLY ASKED QUESTIONS SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#fdf4ee] w-full">
        <div className="max-w-5xl mx-auto">
          {/* FAQ Title Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked <span className="text-[#ea7233]">Questions</span>
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Everything you need to know about our pricing, features and support.
            </p>
          </div>

          {/* 2-Column FAQ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* FAQ Item 1 */}
            <div 
              onClick={() => toggleFaqCard(0)}
              className={`bg-white rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all border cursor-pointer select-none ${openFaqIndex === 0 ? 'border-[#ea7233]/40 shadow-sm' : 'border-orange-100'} flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-full text-left font-bold text-base sm:text-lg flex items-center justify-between gap-3 transition-colors ${
                    openFaqIndex === 0 ? 'text-[#ea7233]' : 'text-slate-900 hover:text-[#ea7233]'
                  }`}
                >
                  <span>Can I try Flipbook for free?</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openFaqIndex === 0 ? 'rotate-180 text-[#ea7233]' : 'text-slate-400'}`} />
                </div>
                {openFaqIndex === 0 && (
                  <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                    Yes. You can start with our free plan and explore the basic features before upgrading to a paid plan.
                  </p>
                )}
              </div>
            </div>

            {/* FAQ Item 2 */}
            <div 
              onClick={() => toggleFaqCard(1)}
              className={`bg-white rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all border cursor-pointer select-none ${openFaqIndex === 1 ? 'border-[#ea7233]/40 shadow-sm' : 'border-orange-100'} flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-full text-left font-bold text-base sm:text-lg flex items-center justify-between gap-3 transition-colors ${
                    openFaqIndex === 1 ? 'text-[#ea7233]' : 'text-slate-900 hover:text-[#ea7233]'
                  }`}
                >
                  <span>Can I add videos and links to my catalogue?</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openFaqIndex === 1 ? 'rotate-180 text-[#ea7233]' : 'text-slate-400'}`} />
                </div>
                {openFaqIndex === 1 && (
                  <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                    Yes. You can add videos, product links, buttons, images, and other interactive elements to make your catalogue more engaging.
                  </p>
                )}
              </div>
            </div>

            {/* FAQ Item 3 */}
            <div 
              onClick={() => toggleFaqCard(2)}
              className={`bg-white rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all border cursor-pointer select-none ${openFaqIndex === 2 ? 'border-[#ea7233]/40 shadow-sm' : 'border-orange-100'} flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-full text-left font-bold text-base sm:text-lg flex items-center justify-between gap-3 transition-colors ${
                    openFaqIndex === 2 ? 'text-[#ea7233]' : 'text-slate-900 hover:text-[#ea7233]'
                  }`}
                >
                  <span>Can I change my plan later?</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openFaqIndex === 2 ? 'rotate-180 text-[#ea7233]' : 'text-slate-400'}`} />
                </div>
                {openFaqIndex === 2 && (
                  <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                    Yes. You can upgrade or change your plan whenever your business needs change. Your account and existing catalogues remain available.
                  </p>
                )}
              </div>
            </div>

            {/* FAQ Item 4 */}
            <div 
              onClick={() => toggleFaqCard(3)}
              className={`bg-white rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all border cursor-pointer select-none ${openFaqIndex === 3 ? 'border-[#ea7233]/40 shadow-sm' : 'border-orange-100'} flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-full text-left font-bold text-base sm:text-lg flex items-center justify-between gap-3 transition-colors ${
                    openFaqIndex === 3 ? 'text-[#ea7233]' : 'text-slate-900 hover:text-[#ea7233]'
                  }`}
                >
                  <span>Do you provide support for Enterprise plans?</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openFaqIndex === 3 ? 'rotate-180 text-[#ea7233]' : 'text-slate-400'}`} />
                </div>
                {openFaqIndex === 3 && (
                  <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                    Yes. Enterprise customers receive priority support and dedicated assistance based on their business requirements.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. READY TO GET STARTED CTA BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg min-h-[200px] sm:min-h-[250px] flex items-center justify-center p-6 sm:p-10 border border-slate-200/60 group">
          
          {/* Banner Image Background */}
          <img 
            src={BannerImage} 
            alt="Ready to get started banner" 
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
          />

          {/* Center Banner Content */}
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#2D3139] leading-tight">
              Ready to <br />
              <span className="text-[#F55316]">get started?</span>
            </h2>

            <p className="text-[#4A5568] text-xs sm:text-sm md:text-base max-w-md mx-auto font-medium leading-relaxed">
              Create engaging, interactive catalogues and <br className="hidden sm:block" />
              bring your products to life.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                to="/contact"
                className="bg-[#F55316] hover:bg-[#e04509] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <Footer />

      {/* ------------------------------------------------------------- */}
      {/* INVOICE MODAL POPUP */}
      {/* ------------------------------------------------------------- */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        defaultPlan={invoicePlan}
        isAnnual={isAnnual}
      />

    </div>
  );
};

export default Pricing;
