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
  Receipt,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import InvoiceModal from './InvoiceModal';

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

  const faqItems = [
    {
      q: 'Can I try FlipiBook for free?',
      a: 'Yes! Our Free plan provides full access to core visual editing, 3D flip effects, and up to 5 flipbooks with no credit card required.'
    },
    {
      q: 'Can I add interactive videos, links, and 3D models?',
      a: 'Yes. You can embed YouTube/Vimeo videos, clickable external links, shopping hotspots, and realistic GLB/OBJ 3D models directly on pages.'
    },
    {
      q: 'Can I change or upgrade my plan anytime?',
      a: 'Absolutely. You can upgrade, downgrade, or switch billing cycles anytime from your account settings. Prorated adjustments are applied automatically.'
    },
    {
      q: 'Do you support custom domains and white-labeling?',
      a: 'Yes! Standard and Premium plans allow you to remove FlipiBook branding, add your own custom domain, and upload custom logos and viewer colors.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), PayPal, and direct corporate wire invoices for Premium annual plans.'
    },
    {
      q: 'Is there a discount for annual billing?',
      a: 'Yes. By choosing annual billing, you save 20% compared to month-to-month billing across all paid plans.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-[#ec5137] selection:text-white w-full overflow-x-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="pt-[3vw] pb-[2vw] px-[4vw] text-center max-w-[85vw] mx-auto">
        <div className="max-w-[65vw] mx-auto space-y-[0.8vw]">

          {/* Main Title */}
          <h1 className="text-[2.8vw] font-bold tracking-tight text-gray-800 leading-tight">
            Plans built for the way <span className="text-[#ec5137]">you work</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-[0.9vw] font-medium max-w-[36vw] mx-auto leading-relaxed">
            Choose the right plan for your workflow and create stunning, interactive digital flipbooks and product catalogs with ease.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-[0.8vw] pb-[0.4vw] flex justify-center items-center">
            <div className="bg-[#f1f3f7] p-[0.25vw] rounded-[0.6vw] inline-flex items-center gap-[0.25vw] border border-gray-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-[1.2vw] py-[0.42vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all duration-200 cursor-pointer ${
                  !isAnnual
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 bg-transparent'
                }`}
              >
                Monthly billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-[1.2vw] py-[0.42vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all duration-200 flex items-center gap-[0.4vw] cursor-pointer ${
                  isAnnual
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 bg-transparent'
                }`}
              >
                <span>Annual billing</span>
                <span className="bg-[#ec5137] text-white text-[0.62vw] font-semibold px-[0.45vw] py-[0.1vw] rounded-full uppercase tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Trust Badges & Quick Invoice Trigger */}
          <div className="pt-[0.6vw] flex flex-wrap items-center justify-center gap-[1.8vw] text-[0.78vw] font-medium text-gray-500">
            <div className="flex items-center gap-[0.4vw]">
              <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-[#fff1ee] text-[#ec5137] border border-[#fecaca] flex items-center justify-center shrink-0">
                <CreditCard className="w-[0.85vw] h-[0.85vw]" />
              </div>
              <span>No credit card required</span>
            </div>

            <div className="flex items-center gap-[0.4vw]">
              <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-[#fff1ee] text-[#ec5137] border border-[#fecaca] flex items-center justify-center shrink-0">
                <RotateCw className="w-[0.85vw] h-[0.85vw]" />
              </div>
              <span>Easy upgrade anytime</span>
            </div>

            <div className="flex items-center gap-[0.4vw]">
              <div className="w-[1.6vw] h-[1.6vw] rounded-full bg-[#fff1ee] text-[#ec5137] border border-[#fecaca] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-[0.85vw] h-[0.85vw]" />
              </div>
              <span>Secure 256-bit encryption</span>
            </div>

            <button
              type="button"
              onClick={() => openInvoiceForPlan('standard')}
              className="flex items-center gap-[0.35vw] px-[0.85vw] py-[0.35vw] rounded-full bg-white border border-gray-300 text-gray-700 hover:border-[#ec5137] hover:text-[#ec5137] transition-all font-medium shadow-xs cursor-pointer group active:scale-[0.98]"
              title="Preview official FlipiBook invoice for your business"
            >
              <Receipt className="w-[0.8vw] h-[0.8vw] text-[#ec5137] transition-transform group-hover:scale-110" />
              <span>Preview Sample Invoice</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. PRICING CARDS SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="py-[1.5vw] px-[4vw] max-w-[85vw] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5vw] items-stretch">
          
          {/* CARD 1: FREE */}
          <div className="bg-white border border-gray-200 rounded-[1vw] p-[1.8vw] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Top Icon */}
              <div className="w-[2.8vw] h-[2.8vw] rounded-[0.6vw] bg-gray-100 border border-gray-200 flex items-center justify-center mb-[1vw] text-gray-700">
                <Icon icon="carbon:cube" className="w-[1.4vw] h-[1.4vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.25vw] font-semibold text-gray-800 mb-[0.2vw]">Free</h3>
              <p className="text-gray-500 text-[0.74vw] font-normal mb-[1vw] leading-relaxed">
                Perfect for individuals and small creators getting started with digital publications.
              </p>

              {/* Price */}
              <div className="mb-[1.2vw] flex items-baseline gap-[0.3vw]">
                <span className="text-[2.2vw] font-bold text-gray-800 tracking-tight leading-tight">
                  $0
                </span>
                <span className="text-gray-400 font-normal text-[0.78vw]">/ forever</span>
              </div>

              {/* Action Button */}
              <div className="space-y-[0.4vw] mb-[1.5vw]">
                <Link
                  to="/signup"
                  className="w-full py-[0.52vw] px-[1vw] rounded-[0.5vw] border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-medium text-[0.82vw] text-center block shadow-xs transition-all"
                >
                  Get Started Free
                </Link>
                <button
                  type="button"
                  onClick={() => openInvoiceForPlan('free')}
                  className="w-full py-[0.3vw] px-[0.8vw] text-gray-400 hover:text-gray-700 font-medium text-[0.72vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.75vw] h-[0.75vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.6vw] pt-[0.6vw] border-t border-gray-100">
                <p className="text-[0.76vw] font-medium text-gray-700">What&apos;s included:</p>
                <ul className="space-y-[0.55vw] text-[0.74vw] text-gray-600 font-normal">
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Create up to 5 flipbooks</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Basic templates gallery</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Add images, videos &amp; links</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Share via direct URL or iframe embed</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Standard reader analytics</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Community &amp; email support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 2: STANDARD (MOST POPULAR) */}
          <div className="relative bg-gradient-to-b from-[#fffaf8] to-white border-2 border-[#ec5137] rounded-[1vw] p-[1.8vw] shadow-md hover:shadow-lg transition-all flex flex-col justify-between ring-2 ring-[#ec5137]/10">
            {/* Most Popular Badge */}
            <div className="absolute top-[1vw] right-[1vw] bg-[#ec5137] text-white px-[0.6vw] py-[0.18vw] rounded-full flex items-center gap-[0.25vw] shadow-xs">
              <Icon icon="fa6-solid:crown" className="w-[0.7vw] h-[0.7vw]" />
              <span className="text-[0.65vw] font-medium tracking-wide">Most Popular</span>
            </div>

            <div>
              {/* Top Icon */}
              <div className="w-[2.8vw] h-[2.8vw] rounded-[0.6vw] bg-[#fff1ee] border border-[#fecaca] flex items-center justify-center mb-[1vw] text-[#ec5137]">
                <Icon icon="bi:people" className="w-[1.4vw] h-[1.4vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.25vw] font-semibold text-gray-800 mb-[0.2vw]">Standard</h3>
              <p className="text-gray-500 text-[0.74vw] font-normal mb-[1vw] leading-relaxed">
                Ideal for growing teams and businesses with advanced branding and 3D requirements.
              </p>

              {/* Price */}
              <div className="mb-[1.2vw]">
                <div className="flex items-baseline gap-[0.3vw]">
                  <span className="text-[2.2vw] font-bold text-gray-800 tracking-tight leading-tight">
                    {isAnnual ? '$31.99' : '$39.99'}
                  </span>
                  <span className="text-gray-400 font-normal text-[0.78vw]">/ month</span>
                </div>
                {isAnnual && (
                  <span className="text-[0.66vw] text-emerald-600 font-medium block mt-[0.15vw]">
                    Billed annually ($383.88/yr) • Save $96
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-[0.4vw] mb-[1.5vw]">
                <Link
                  to="/signup"
                  className="w-full py-[0.52vw] px-[1vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.82vw] text-center block shadow-xs transition-all"
                >
                  Upgrade to Standard
                </Link>
                <button
                  type="button"
                  onClick={() => openInvoiceForPlan('standard')}
                  className="w-full py-[0.3vw] px-[0.8vw] text-[#ec5137] hover:underline font-medium text-[0.72vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.75vw] h-[0.75vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.6vw] pt-[0.6vw] border-t border-orange-100">
                <p className="text-[0.76vw] font-medium text-gray-700">What&apos;s included:</p>
                <ul className="space-y-[0.55vw] text-[0.74vw] text-gray-700 font-normal">
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Create up to 25 flipbooks / month</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>All premium templates &amp; 3D effects</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Custom branding (logo, colors, watermark removal)</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Advanced reader analytics &amp; heatmaps</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Team collaboration (up to 5 users)</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Password protection &amp; domain restriction</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Priority email &amp; live support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 3: PREMIUM */}
          <div className="bg-white border border-gray-200 rounded-[1vw] p-[1.8vw] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Top Icon */}
              <div className="w-[2.8vw] h-[2.8vw] rounded-[0.6vw] bg-gray-100 border border-gray-200 flex items-center justify-center mb-[1vw] text-gray-700">
                <Icon icon="bi:building" className="w-[1.4vw] h-[1.4vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.25vw] font-semibold text-gray-800 mb-[0.2vw]">Premium</h3>
              <p className="text-gray-500 text-[0.74vw] font-normal mb-[1vw] leading-relaxed">
                For organizations with custom requirements, high publication volume, and dedicated SLA.
              </p>

              {/* Price */}
              <div className="mb-[1.2vw]">
                <div className="flex items-baseline gap-[0.3vw]">
                  <span className="text-[2.2vw] font-bold text-gray-800 tracking-tight leading-tight">
                    {isAnnual ? '$79.99' : '$99.99'}
                  </span>
                  <span className="text-gray-400 font-normal text-[0.78vw]">/ month</span>
                </div>
                {isAnnual && (
                  <span className="text-[0.66vw] text-emerald-600 font-medium block mt-[0.15vw]">
                    Billed annually ($959.88/yr) • Save $240
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-[0.4vw] mb-[1.5vw]">
                <Link
                  to="/signup"
                  className="w-full py-[0.52vw] px-[1vw] rounded-[0.5vw] bg-gray-900 hover:bg-black active:scale-[0.98] text-white font-medium text-[0.82vw] text-center block shadow-xs transition-all"
                >
                  Go Premium
                </Link>
                <button
                  type="button"
                  onClick={() => openInvoiceForPlan('premium')}
                  className="w-full py-[0.3vw] px-[0.8vw] text-gray-400 hover:text-gray-700 font-medium text-[0.72vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.75vw] h-[0.75vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.6vw] pt-[0.6vw] border-t border-gray-100">
                <p className="text-[0.76vw] font-medium text-gray-700">What&apos;s included:</p>
                <ul className="space-y-[0.55vw] text-[0.74vw] text-gray-600 font-normal">
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Unlimited flipbooks &amp; unlimited pageviews</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>All interactive 3D models &amp; AR inspection</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Team collaboration (unlimited users)</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Custom domain &amp; white-label hosting</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>API access &amp; custom webhook integrations</span>
                  </li>
                  <li className="flex items-start gap-[0.5vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className="w-[0.95vw] h-[0.95vw] text-[#ec5137] shrink-0 mt-[0.1vw]" />
                    <span>Dedicated account manager &amp; 99.9% SLA</span>
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
      <section className="py-[3vw] px-[4vw] max-w-[85vw] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-[1.8vw]">
          <h2 className="text-[1.5vw] font-bold text-gray-800 tracking-tight leading-tight">
            Compare Plans &amp; <span className="text-[#ec5137]">Features</span>
          </h2>
          <p className="text-gray-500 mt-[0.25vw] text-[0.78vw] font-normal max-w-[40vw] mx-auto">
            Explore what each plan includes and find the one that fits your publication needs.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-[1vw] border border-gray-200 shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-200 divide-x divide-gray-100">
                <th className="w-1/4 bg-[#f8f9fa] text-gray-700 font-semibold py-[0.85vw] px-[1.2vw] text-[0.82vw]">
                  Features &amp; Capabilities
                </th>
                <th className="w-1/4 bg-white text-gray-800 font-semibold text-center py-[0.85vw] px-[1vw] text-[0.85vw]">
                  Free
                </th>
                <th className="w-1/4 bg-[#fff8f6] text-center py-[0.85vw] px-[1vw]">
                  <div className="font-semibold text-[#ec5137] text-[0.85vw]">Standard</div>
                  <div className="text-[0.68vw] text-gray-400 font-normal mt-[0.1vw]">
                    {isAnnual ? '$31.99 /month' : '$39.99 /month'}
                  </div>
                </th>
                <th className="w-1/4 bg-[#f8f9fa] text-center py-[0.85vw] px-[1vw]">
                  <div className="font-semibold text-gray-800 text-[0.85vw]">Premium</div>
                  <div className="text-[0.68vw] text-gray-400 font-normal mt-[0.1vw]">
                    {isAnnual ? '$79.99 /month' : '$99.99 /month'}
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 text-[0.76vw] text-gray-600 font-normal">
              
              {/* Row 1 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Number of Flipbooks</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-600">Up to 5</td>
                <td className="py-[0.65vw] px-[1vw] text-center font-medium text-gray-800">Up to 25 / month</td>
                <td className="py-[0.65vw] px-[1vw] text-center font-medium text-gray-800">Unlimited</td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Monthly Page Impressions</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-600">1,000 views</td>
                <td className="py-[0.65vw] px-[1vw] text-center font-medium text-gray-800">50,000 views</td>
                <td className="py-[0.65vw] px-[1vw] text-center font-medium text-gray-800">Unlimited</td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Realistic 3D Page Turn Effect</td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">
                  Interactive Media (Links, Video, Audio)
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-600">Basic links</td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">3D Model Orbit &amp; AR Mode</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Watermark Removal &amp; Custom Branding</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 7 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Password Protection &amp; Domain Whitelisting</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 8 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Custom Domain (CNAME)</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center">
                  <Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" />
                </td>
              </tr>

              {/* Row 9 */}
              <tr className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-100">
                <td className="py-[0.65vw] px-[1.2vw] font-medium text-gray-800 bg-[#f8f9fa]">Dedicated Account Manager &amp; SLA</td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center text-gray-400">
                  <Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" />
                </td>
                <td className="py-[0.65vw] px-[1vw] text-center font-medium text-[#16A34A]">
                  24/7 Priority SLA
                </td>
              </tr>

            </tbody>

            {/* Table Footer Buttons */}
            <tfoot className="border-t border-gray-200">
              <tr className="divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.2vw] bg-[#f8f9fa]"></td>
                <td className="py-[0.85vw] px-[1vw] text-center bg-white">
                  <Link
                    to="/signup"
                    className="inline-block py-[0.42vw] px-[1vw] rounded-[0.5vw] border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-[0.78vw] transition-all shadow-xs active:scale-[0.98]"
                  >
                    Get Started Free
                  </Link>
                </td>
                <td className="py-[0.85vw] px-[1vw] text-center bg-[#fff8f6]">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-[0.3vw] py-[0.42vw] px-[1.1vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs"
                  >
                    <span>Upgrade Now</span>
                    <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
                  </Link>
                </td>
                <td className="py-[0.85vw] px-[1vw] text-center bg-[#f8f9fa]">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-[0.3vw] py-[0.42vw] px-[1.1vw] rounded-[0.5vw] bg-gray-900 hover:bg-black active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs"
                  >
                    <span>Go Premium</span>
                    <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
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
      <section className="py-[3.5vw] px-[4vw] bg-[#f8f9fa] border-t border-b border-gray-200 w-full">
        <div className="max-w-[75vw] mx-auto">
          {/* FAQ Title Header */}
          <div className="text-center mb-[2vw]">
            <h2 className="text-[1.5vw] font-bold text-gray-800 tracking-tight leading-tight">
              Frequently Asked <span className="text-[#ec5137]">Questions</span>
            </h2>
            <p className="text-gray-500 mt-[0.25vw] text-[0.78vw] font-normal">
              Everything you need to know about our billing, features, and plan access.
            </p>
          </div>

          {/* 2-Column FAQ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1vw]">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div 
                  key={idx}
                  onClick={() => toggleFaqCard(idx)}
                  className={`bg-white rounded-[0.75vw] border transition-all cursor-pointer select-none p-[1.1vw] shadow-xs hover:border-gray-300 ${
                    isOpen ? 'border-[#ec5137]/40 ring-1 ring-[#ec5137]/10' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-[0.8vw]">
                    <span className={`text-[0.84vw] font-medium transition-colors ${
                      isOpen ? 'text-[#ec5137]' : 'text-gray-800 hover:text-[#ec5137]'
                    }`}>
                      {item.q}
                    </span>
                    <ChevronDown className={`w-[0.95vw] h-[0.95vw] shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#ec5137]' : ''
                    }`} />
                  </div>
                  {isOpen && (
                    <p className="mt-[0.55vw] pt-[0.45vw] border-t border-gray-100 text-gray-600 text-[0.74vw] font-normal leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. READY TO GET STARTED CTA BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="py-[3vw] px-[4vw] max-w-[85vw] mx-auto">
        <div className="relative rounded-[1vw] overflow-hidden shadow-sm min-h-[16vw] flex items-center justify-center p-[2vw] border border-gray-200 group bg-white">
          
          {/* Banner Image Background */}
          <img 
            src={BannerImage} 
            alt="Ready to get started banner" 
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
          />

          {/* Center Banner Content */}
          <div className="relative z-10 text-center max-w-[36vw] mx-auto space-y-[0.6vw]">
            <h2 className="text-[2vw] font-bold tracking-tight text-gray-800 leading-tight">
              Ready to <span className="text-[#ec5137]">get started?</span>
            </h2>

            <p className="text-gray-600 text-[0.82vw] font-normal leading-relaxed max-w-[28vw] mx-auto">
              Create engaging, interactive publications and catalogs, and bring your designs to life today.
            </p>

            <div className="pt-[0.4vw] flex justify-center">
              <Link
                to="/signup"
                className="bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.82vw] px-[1.4vw] py-[0.52vw] rounded-full shadow-xs transition-all flex items-center gap-[0.4vw]"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-[0.85vw] h-[0.85vw]" />
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
