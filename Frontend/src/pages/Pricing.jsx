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

  // State to track clicked/active column in comparison table ('free' | 'basic' | 'premium' | 'pro')
  const [selectedCol, setSelectedCol] = useState('premium');

  // Helper for active column background highlight: slightly deeper visible warm orange tint #eeeeee
  const getColBg = (colKey, isHeader = false) => {
    if (selectedCol === colKey) {
      return 'bg-[#fff0ed] transition-colors duration-200';
    }
    return isHeader ? 'bg-[#f8f9fa] transition-colors duration-200' : 'transition-colors duration-200';
  };

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
      <section className="py-[1.5vw] px-[3vw] max-w-[90vw] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1.2vw] items-stretch">
          
          {/* CARD 1: FREE */}
          <div 
            onClick={() => setSelectedCol('free')}
            className={`border rounded-[1vw] p-[1.5vw] shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
              selectedCol === 'free'
                ? 'bg-gradient-to-b from-[#fffaf8] to-white border-2 border-[#ec5137] ring-2 ring-[#ec5137]/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div>
              {/* Top Icon */}
              <div className={`w-[2.6vw] h-[2.6vw] rounded-[0.6vw] border flex items-center justify-center mb-[0.9vw] ${
                selectedCol === 'free' ? 'bg-[#fff1ee] border-[#fecaca] text-[#ec5137]' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                <Icon icon="carbon:cube" className="w-[1.3vw] h-[1.3vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[0.2vw]">Free</h3>
              <p className="text-gray-500 text-[0.72vw] font-normal mb-[0.9vw] leading-relaxed">
                Everything you need to explore and get started with digital publications.
              </p>

              {/* Price */}
              <div className="mb-[1.1vw] flex items-baseline gap-[0.3vw]">
                <span className="text-[2vw] font-bold text-gray-800 tracking-tight leading-tight">
                  $0
                </span>
                <span className="text-gray-400 font-normal text-[0.75vw]">/ forever</span>
              </div>

              {/* Action Button */}
              <div className="space-y-[0.35vw] mb-[1.3vw]">
                <button type="button"
                  onClick={() => setSelectedCol('free')}
                  className={`w-full py-[0.5vw] px-[0.8vw] rounded-[0.5vw] font-medium text-[0.8vw] text-center block shadow-xs transition-all ${
                    selectedCol === 'free' ? 'bg-[#ec5137] hover:bg-[#d94229] text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Get Started Free
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openInvoiceForPlan('free'); }}
                  className="w-full py-[0.25vw] px-[0.6vw] text-gray-400 hover:text-gray-700 font-medium text-[0.7vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.7vw] h-[0.7vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.55vw] pt-[0.6vw] border-t border-gray-100">
                <p className="text-[0.86vw] font-semibold text-gray-900">Everything you need to get started</p>
                <ul className="space-y-[0.5vw] text-[0.72vw] text-gray-600 font-normal">
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>3 hosted flipbooks</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>500 MB shared storage</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>30 pages per flipbook</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>Starter templates &amp; page editing</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>Clickable links &amp; QR sharing</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>Branded website embedding</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>Basic view statistics</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'free' ? 'text-[#ec5137]' : 'text-gray-500'}`} />
                    <span>Explore a 3D / AR demo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 2: BASIC */}
          <div 
            onClick={() => setSelectedCol('basic')}
            className={`border rounded-[1vw] p-[1.5vw] shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
              selectedCol === 'basic'
                ? 'bg-gradient-to-b from-[#fffaf8] to-white border-2 border-[#ec5137] ring-2 ring-[#ec5137]/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div>
              {/* Top Icon */}
              <div className={`w-[2.6vw] h-[2.6vw] rounded-[0.6vw] border flex items-center justify-center mb-[0.9vw] ${
                selectedCol === 'basic' ? 'bg-[#fff1ee] border-[#fecaca] text-[#ec5137]' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                <Icon icon="bi:people" className="w-[1.3vw] h-[1.3vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[0.2vw]">Basic</h3>
              <p className="text-gray-500 text-[0.72vw] font-normal mb-[0.9vw] leading-relaxed">
                Ideal for growing creators with professional branding and custom backgrounds.
              </p>

              {/* Price */}
              <div className="mb-[1.1vw]">
                <div className="flex items-baseline gap-[0.3vw]">
                  <span className="text-[2vw] font-bold text-gray-800 tracking-tight leading-tight">
                    {isAnnual ? '$31.99' : '$39.99'}
                  </span>
                  <span className="text-gray-400 font-normal text-[0.75vw]">/ month</span>
                </div>
                {isAnnual && (
                  <span className="text-[0.64vw] text-emerald-600 font-medium block mt-[0.12vw]">
                    Billed annually ($383.88/yr) • Save $96
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-[0.35vw] mb-[1.3vw]">
                <button type="button"
                  onClick={() => setSelectedCol('basic')}
                  className={`w-full py-[0.5vw] px-[0.8vw] rounded-[0.5vw] font-medium text-[0.8vw] text-center block shadow-xs transition-all ${
                    selectedCol === 'basic' ? 'bg-[#ec5137] hover:bg-[#d94229] text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Choose Basic
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openInvoiceForPlan('standard'); }}
                  className="w-full py-[0.25vw] px-[0.6vw] text-gray-400 hover:text-gray-700 font-medium text-[0.7vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.7vw] h-[0.7vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.55vw] pt-[0.6vw] border-t border-gray-100">
                <p className="text-[0.86vw] font-semibold text-gray-900">Your brand, front and centre</p>
                <ul className="space-y-[0.5vw] text-[0.72vw] text-gray-700 font-normal">
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>15 hosted flipbooks</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>5 GB storage · 150 pages / book</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Remove FlipiBook branding</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Your logo &amp; custom backgrounds</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Video embeds, audio &amp; CTA buttons</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Password-protected publications</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Basic analytics · 1 user</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'basic' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>5 interactive 3D models</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 3: PREMIUM */}
          <div 
            onClick={() => setSelectedCol('premium')}
            className={`border rounded-[1vw] p-[1.5vw] shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
              selectedCol === 'premium'
                ? 'bg-gradient-to-b from-[#fffaf8] to-white border-2 border-[#ec5137] ring-2 ring-[#ec5137]/10'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Most Popular Badge */}
            {selectedCol === 'premium' && (
              <div className="absolute top-[0.9vw] right-[0.9vw] bg-[#ec5137] text-white px-[0.55vw] py-[0.16vw] rounded-full flex items-center gap-[0.25vw] shadow-xs">
                <Icon icon="fa6-solid:crown" className="w-[0.65vw] h-[0.65vw]" />
                <span className="text-[0.62vw] font-medium tracking-wide">Most Popular</span>
              </div>
            )}

            <div>
              {/* Top Icon */}
              <div className={`w-[2.6vw] h-[2.6vw] rounded-[0.6vw] border flex items-center justify-center mb-[0.9vw] ${
                selectedCol === 'premium' ? 'bg-[#fff1ee] border-[#fecaca] text-[#ec5137]' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                <Icon icon="bi:building" className="w-[1.3vw] h-[1.3vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[0.2vw]">Premium</h3>
              <p className="text-gray-500 text-[0.72vw] font-normal mb-[0.9vw] leading-relaxed">
                Engage customers and capture leads with advanced marketing &amp; team workflows.
              </p>

              {/* Price */}
              <div className="mb-[1.1vw]">
                <div className="flex items-baseline gap-[0.3vw]">
                  <span className="text-[2vw] font-bold text-gray-800 tracking-tight leading-tight">
                    {isAnnual ? '$79.99' : '$99.99'}
                  </span>
                  <span className="text-gray-400 font-normal text-[0.75vw]">/ month</span>
                </div>
                {isAnnual && (
                  <span className="text-[0.64vw] text-emerald-600 font-medium block mt-[0.12vw]">
                    Billed annually ($959.88/yr) • Save $240
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-[0.35vw] mb-[1.3vw]">
                <button type="button"
                  onClick={() => setSelectedCol('premium')}
                  className={`w-full py-[0.5vw] px-[0.8vw] rounded-[0.5vw] font-medium text-[0.8vw] text-center block shadow-xs transition-all flex items-center justify-center gap-[0.3vw] ${
                    selectedCol === 'premium' ? 'bg-[#ec5137] hover:bg-[#d94229] text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>Choose Premium</span>
                  <ArrowRight className="w-[0.75vw] h-[0.75vw]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openInvoiceForPlan('premium'); }}
                  className="w-full py-[0.25vw] px-[0.6vw] text-gray-400 hover:text-gray-700 font-medium text-[0.7vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.7vw] h-[0.7vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.55vw] pt-[0.6vw] border-t border-orange-100">
                <p className="text-[0.86vw] font-semibold text-gray-900">Everything in Basic, plus</p>
                <ul className="space-y-[0.5vw] text-[0.72vw] text-gray-700 font-normal">
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>75 hosted flipbooks</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>25 GB storage · 500 pages / book</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>5 users &amp; shared team folders</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>1 custom domain</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Direct video uploads</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Forms, quizzes &amp; lead capture</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Advanced engagement analytics</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'premium' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>25 models with 3D + AR</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 4: PRO */}
          <div 
            onClick={() => setSelectedCol('pro')}
            className={`border rounded-[1vw] p-[1.5vw] shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
              selectedCol === 'pro'
                ? 'bg-gradient-to-b from-[#fffaf8] to-white border-2 border-[#ec5137] ring-2 ring-[#ec5137]/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div>
              {/* Top Icon */}
              <div className={`w-[2.6vw] h-[2.6vw] rounded-[0.6vw] border flex items-center justify-center mb-[0.9vw] ${
                selectedCol === 'pro' ? 'bg-[#fff1ee] border-[#fecaca] text-[#ec5137]' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                <Icon icon="carbon:enterprise" className="w-[1.3vw] h-[1.3vw]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-[1.2vw] font-semibold text-gray-800 mb-[0.2vw]">Pro</h3>
              <p className="text-gray-500 text-[0.72vw] font-normal mb-[0.9vw] leading-relaxed">
                Scale your team and integrations with enterprise-grade security and capabilities.
              </p>

              {/* Price */}
              <div className="mb-[1.1vw]">
                <div className="flex items-baseline gap-[0.3vw]">
                  <span className="text-[2vw] font-bold text-gray-800 tracking-tight leading-tight">
                    {isAnnual ? '$159.99' : '$199.99'}
                  </span>
                  <span className="text-gray-400 font-normal text-[0.75vw]">/ month</span>
                </div>
                {isAnnual && (
                  <span className="text-[0.64vw] text-emerald-600 font-medium block mt-[0.12vw]">
                    Billed annually ($1,919.88/yr) • Save $480
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-[0.35vw] mb-[1.3vw]">
                <button type="button"
                  onClick={() => setSelectedCol('pro')}
                  className={`w-full py-[0.5vw] px-[0.8vw] rounded-[0.5vw] font-medium text-[0.8vw] text-center block shadow-xs transition-all flex items-center justify-center gap-[0.3vw] ${
                    selectedCol === 'pro' ? 'bg-[#ec5137] hover:bg-[#d94229] text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>Choose Pro</span>
                  <ArrowRight className="w-[0.75vw] h-[0.75vw]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openInvoiceForPlan('pro'); }}
                  className="w-full py-[0.25vw] px-[0.6vw] text-gray-400 hover:text-gray-700 font-medium text-[0.7vw] flex items-center justify-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <Receipt className="w-[0.7vw] h-[0.7vw]" />
                  <span>View Sample Invoice</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-[0.55vw] pt-[0.6vw] border-t border-gray-100">
                <p className="text-[0.86vw] font-semibold text-gray-900">Everything in Premium, plus</p>
                <ul className="space-y-[0.5vw] text-[0.72vw] text-gray-600 font-normal">
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>250 hosted flipbooks</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>100 GB storage · 1,000 pages / book</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>15 users included</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>5 custom domains</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Account &amp; viewer SSO</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>Developer API access</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>24-month analytics history</span>
                  </li>
                  <li className="flex items-start gap-[0.45vw]">
                    <Icon icon="teenyicons:tick-circle-solid" className={`w-[0.9vw] h-[0.9vw] shrink-0 mt-[0.1vw] ${selectedCol === 'pro' ? 'text-[#ec5137]' : 'text-gray-600'}`} />
                    <span>100 models with 3D + AR</span>
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
      <section className="py-[3vw] px-[3vw] max-w-[92vw] mx-auto">
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
        <div className="rounded-[0.8vw] border border-gray-200 shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#333333] border-b border-[#222222] divide-x divide-[#444444]">
                <th className="w-[32%] bg-[#333333] text-white font-bold py-[1.1vw] px-[1.5vw] text-[1vw]">
                  Features
                </th>
                <th 
                  onClick={() => setSelectedCol('free')}
                  className={`w-[17%] font-bold text-center py-[1.1vw] px-[1.2vw] text-[1vw] cursor-pointer select-none transition-colors duration-200 ${
                    selectedCol === 'free' ? 'bg-[#444444] text-white' : 'bg-[#333333] text-white hover:bg-[#3d3d3d]'
                  }`}
                >
                  <div className="text-white">Free</div>
                </th>
                <th 
                  onClick={() => setSelectedCol('basic')}
                  className={`w-[17%] text-center py-[1.1vw] px-[1.2vw] cursor-pointer select-none transition-colors duration-200 ${
                    selectedCol === 'basic' ? 'bg-[#444444] text-white' : 'bg-[#333333] text-white hover:bg-[#3d3d3d]'
                  }`}
                >
                  <div className="font-bold text-[0.98vw] text-white">Basic</div>
                  <div className={`text-[0.76vw] font-normal mt-[0.1vw] ${selectedCol === 'basic' ? 'text-gray-200' : 'text-gray-400'}`}>
                    {isAnnual ? '$31.99 /mo' : '$39.99 /mo'}
                  </div>
                </th>
                <th 
                  onClick={() => setSelectedCol('premium')}
                  className={`w-[17%] text-center py-[1.1vw] px-[1.2vw] cursor-pointer select-none transition-colors duration-200 ${
                    selectedCol === 'premium' ? 'bg-[#444444] text-white' : 'bg-[#333333] text-white hover:bg-[#3d3d3d]'
                  }`}
                >
                  <div className="font-bold text-[0.98vw] text-white">Premium</div>
                  <div className={`text-[0.76vw] font-normal mt-[0.1vw] ${selectedCol === 'premium' ? 'text-gray-200' : 'text-gray-400'}`}>
                    {isAnnual ? '$79.99 /mo' : '$99.99 /mo'}
                  </div>
                </th>
                <th 
                  onClick={() => setSelectedCol('pro')}
                  className={`w-[17%] text-center py-[1.1vw] px-[1.2vw] cursor-pointer select-none transition-colors duration-200 ${
                    selectedCol === 'pro' ? 'bg-[#444444] text-white' : 'bg-[#333333] text-white hover:bg-[#3d3d3d]'
                  }`}
                >
                  <div className="font-bold text-[0.98vw] text-white">Pro</div>
                  <div className={`text-[0.76vw] font-normal mt-[0.1vw] ${selectedCol === 'pro' ? 'text-gray-200' : 'text-gray-400'}`}>
                    {isAnnual ? '$159.99 /mo' : '$199.99 /mo'}
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className=" text-[0.86vw] text-gray-600 font-normal">

              {/* ---------------- SECTION 1 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  1. General &amp; Storage
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Storage Capacity</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Storage Capacity.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>500 MB</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>5 GB</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>25 GB</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>100 GB</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Number of Flipbooks</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Number of Flipbooks.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>5</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>25</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>75</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>250</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Maximum Pages per Flipbook</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Maximum Pages per Flipbook.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>50 pages</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>200 pages</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>500 pages</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>1,000 pages</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Maximum File Upload Size</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Maximum File Upload Size.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>25 MB</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>100 MB</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>500 MB</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>2 GB</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Number of Devices</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Number of Devices.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>1</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>3</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>5</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Unlimited</td>
              </tr>

              {/* ---------------- SECTION 2 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  2. File Creation &amp; Publishing
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>PDF, Word, and PowerPoint File Conversion</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for PDF, Word, and PowerPoint File Conversion.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Bulk File Conversion</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Bulk File Conversion.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Up to 5 files</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Import Files from Google Drive and Dropbox</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Import Files from Google Drive and Dropbox.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Automatic Link Detection in PDF Files</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Automatic Link Detection in PDF Files.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Flipbook Preview and Publishing</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Flipbook Preview and Publishing.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Create Flipbooks from Scratch</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Create Flipbooks from Scratch.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Branded and Locked Templates for Teams</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Branded and Locked Templates for Teams.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>

              {/* ---------------- SECTION 3 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  3. Templates &amp; Design Library
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Number of Available Templates</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Number of Available Templates.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>10 free</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>50+</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>150+</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>All (300+)</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Easy Template Customization</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Easy Template Customization.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Custom Colour Settings</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Custom Colour Settings.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Basic</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>High-Quality PDF Export</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for High-Quality PDF Export.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Standard</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>Print-Ready (300 DPI)</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Vector &amp; 300 DPI</td>
              </tr>

              {/* ---------------- SECTION 4 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  4. Branding &amp; Sharing
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Custom Subdomains</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Custom Subdomains.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>1 subdomain</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>3 subdomains</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Custom domain (CNAME)</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Custom Logo &amp; Company Profile</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Custom Logo &amp; Company Profile.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Custom Branding Watermark</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Custom Branding Watermark.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Remove Flipbook Watermark</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Remove Flipbook Watermark.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Website Embedding</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Website Embedding.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Standard embed</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Sharing (Social Media, QR Code, Direct Link)</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Sharing (Social Media, QR Code, Direct Link).
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>

              {/* ---------------- SECTION 5 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  5. Layout &amp; Design Customization
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Themes and Layouts</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Themes and Layouts.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Basic themes</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>All standard</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Custom CSS</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Customizable Lead Capture Forms</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Customizable Lead Capture Forms.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Image Gallery Pop-ups</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Image Gallery Pop-ups.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Page Flip Effects (Hard Cover, Soft Cover)</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Page Flip Effects (Hard Cover, Soft Cover).
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Soft Cover</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Customizable Auto-Turn, Thumbnail Navigation, Zoom Settings, etc.</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Customizable Auto-Turn, Thumbnail Navigation, Zoom Settings, etc..
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Basic</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>

              {/* ---------------- SECTION 6 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  6. Interactive Editor &amp; Multimedia
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Interactive Multimedia Elements (Videos, Audio, Images, GIFs, Icons)</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Interactive Multimedia Elements (Videos, Audio, Images, GIFs, Icons).
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Images only</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Image, Video, and Audio Embedding</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Image, Video, and Audio Embedding.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>YouTube only</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>YouTube/Vimeo</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Direct upload</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Customizable Pop-up Templates</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Customizable Pop-up Templates.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Standard</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Interactivity Elements (Frames, QR Code, Shapes, Grid, Text, Tables)</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Interactivity Elements (Frames, QR Code, Shapes, Grid, Text, Tables).
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Basic shapes</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Interactive Hotspots</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Interactive Hotspots.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Up to 3 / book</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Up to 25 / book</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>Unlimited</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Unlimited + API</td>
              </tr>

              {/* ---------------- SECTION 7 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  7. Analytics, Marketing &amp; Sales
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Total Flipbook Views</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Total Flipbook Views.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>1,000 views</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>50,000 views</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>250,000 views</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Unlimited</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Average Time Spent per Page</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Average Time Spent per Page.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Lead Capture Forms and Data Export</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Lead Capture Forms and Data Export.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>CSV Export</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>CSV, CRM, Webhooks</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Google Tag Manager</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Google Tag Manager.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Geolocation and Device Tracking</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Geolocation and Device Tracking.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Basic</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>

              {/* ---------------- SECTION 8 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  8. Security, Privacy &amp; Compliance
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Password-Protected Flipbooks</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Password-Protected Flipbooks.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Public and Unlisted (Link-Only) Publishing</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Public and Unlisted (Link-Only) Publishing.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Private Sharing with Specific Email Addresses</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Private Sharing with Specific Email Addresses.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Flipbook Deactivation</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Flipbook Deactivation.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>

              {/* ---------------- SECTION 9 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  9. Team Collaboration &amp; Workspaces
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Viewer and Editor Seat Management</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Viewer and Editor Seat Management.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>1 seat</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Up to 3 seats</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>Up to 5 seats</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>15 seats included</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Role-Based Access Control &amp; Permissions</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Role-Based Access Control &amp; Permissions.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Basic</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Custom Roles</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Shared Team Folders &amp; Collaborative Workspaces</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Shared Team Folders &amp; Collaborative Workspaces.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>2 folders</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>10 folders</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Unlimited</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Branded and Locked Team Templates</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Branded and Locked Team Templates.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Team Member Activity Logs</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Team Member Activity Logs.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>30 days</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Unlimited logs</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Single Sign-On (SSO) with SAML</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Single Sign-On (SSO) with SAML.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>

              {/* ---------------- SECTION 10 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  10. 3D Editor Studio
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Number of 3D Model Uploads &amp; Storage</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Number of 3D Model Uploads &amp; Storage.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>5 models</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>25 models</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>100 models</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>3D Material Customization &amp; Custom Texture Upload</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for 3D Material Customization &amp; Custom Texture Upload.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Basic</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Advanced PBR</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Lighting, Environment Settings &amp; Realistic Shadow Rendering</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Lighting, Environment Settings &amp; Realistic Shadow Rendering.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Standard HDRI</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Full Studio Controls</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>3D Scene Export and Publishing</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for 3D Scene Export and Publishing.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Multiple Export Formats (PNG, JPG, PDF, GLB, glTF)</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Multiple Export Formats (PNG, JPG, PDF, GLB, glTF).
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('basic')}`}>PNG, JPG</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>PNG, JPG, PDF, GLB</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>All Formats</td>
              </tr>

              {/* ---------------- SECTION 11 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  11. Augmented Reality (AR)
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>QR Code-Based AR Access</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for QR Code-Based AR Access.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Real-World 3D Model Placement</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Real-World 3D Model Placement.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>3D Model Rotation and Zoom</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for 3D Model Rotation and Zoom.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Interactive AR Hotspots</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Interactive AR Hotspots.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('pro')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Real-Time Shadow &amp; AR Occlusion</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Real-Time Shadow &amp; AR Occlusion.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>LiDAR Occlusion</td>
              </tr>

              {/* ---------------- SECTION 12 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  12. My Shelf – Digital Bookshelf
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Private &amp; Shared Folders</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Private &amp; Shared Folders.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>1 private folder</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>5 folders</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>20 folders</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Unlimited</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Customized Digital Bookshelf</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Customized Digital Bookshelf.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Standard theme</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Custom textures</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Check className="w-[1vw] h-[1vw] text-[#16A34A] mx-auto stroke-[2.5]" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>White-label shelf</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Flipbook Count</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Flipbook Count.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Up to 5</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Up to 25</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>Up to 75</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>Up to 250</td>
              </tr>

              {/* ---------------- SECTION 13 ---------------- */}
              <tr className="text-gray-800">
                <td className="py-[0.85vw] px-[1.5vw] font-bold text-[0.95vw] tracking-wide bg-[#eeeeee]">
                  13. Support &amp; Professional Services
                </td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
                <td className="bg-[#eeeeee]"></td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Chat Support</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Chat Support.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('free')}`}>Community</td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('basic')}`}>Standard</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>Priority</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-gray-900 cursor-pointer ${getColBg('pro')}`}>24/7 Live Chat</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Priority Ticket Support</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Priority Ticket Support.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center text-gray-600 cursor-pointer ${getColBg('basic')}`}>Standard response</td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center font-medium text-gray-800 cursor-pointer ${getColBg('premium')}`}>&lt; 4 hours SLA</td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-[#16A34A] cursor-pointer ${getColBg('pro')}`}>&lt; 1 hour SLA</td>
              </tr>
              <tr className="hover:bg-transparent transition-colors divide-x divide-gray-100">
                <td className="py-[0.85vw] px-[1.5vw] font-medium text-gray-800 border-b border-gray-100 text-[0.86vw]">
                  <div className="flex items-center justify-between gap-[0.5vw] group relative">
                    <span>Dedicated Technical Support</span>
                    <div className="relative inline-flex items-center shrink-0 group/tip">
                      <span className="w-[1.05vw] h-[1.05vw] rounded-full border border-gray-300 text-gray-400 group-hover/tip:border-gray-600 group-hover/tip:text-gray-700 flex items-center justify-center text-[0.65vw] font-medium italic cursor-default transition-colors select-none">
                        i
                      </span>
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[0.4vw] hidden group-hover/tip:flex flex-col z-50 pointer-events-none">
                        <div className="bg-[#222222] text-white text-[0.72vw] font-normal px-[0.75vw] py-[0.45vw] rounded-[0.35vw] shadow-xl whitespace-normal w-max max-w-[18vw] leading-relaxed text-left">
                          Detailed feature specifications and usage limits for Dedicated Technical Support.
                        </div>
                        <div className="w-0 h-0 border-x-[0.35vw] border-x-transparent border-t-[0.35vw] border-t-[#222222] self-center"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td onClick={() => setSelectedCol('free')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('free')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('basic')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[0.85vw] px-[1.2vw] text-center cursor-pointer ${getColBg('premium')}`}><Minus className="w-[0.9vw] h-[0.9vw] text-gray-300 mx-auto" /></td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[0.85vw] px-[1.2vw] text-center font-semibold text-[#16A34A] cursor-pointer ${getColBg('pro')}`}>Dedicated Account Mgr</td>
              </tr>

            </tbody>

            {/* Table Footer Buttons */}
            <tfoot className="border-t border-gray-200">
              <tr className="divide-x divide-gray-200">
                <td className="py-[0.85vw] px-[1.2vw] bg-[#f8f9fa]"></td>
                <td onClick={() => setSelectedCol('free')} className={`py-[1.1vw] px-[1.2vw] text-center bg-white cursor-pointer ${getColBg('free')}`}>
                  <button type="button"
                    className="inline-block py-[0.42vw] px-[1.1vw] rounded-[0.5vw] border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-[0.78vw] transition-all shadow-xs active:scale-[0.98]"
                  >
                    Get Started Free
                  </button>
                </td>
                <td onClick={() => setSelectedCol('basic')} className={`py-[1.1vw] px-[1.2vw] text-center bg-[#fff8f6] cursor-pointer ${getColBg('basic')}`}>
                  <button type="button"
                    className="inline-flex items-center justify-center gap-[0.3vw] py-[0.42vw] px-[1.2vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                </td>
                <td onClick={() => setSelectedCol('premium')} className={`py-[1.1vw] px-[1.2vw] text-center bg-[#f8f9fa] cursor-pointer ${getColBg('premium')}`}>
                  <button type="button"
                    className="inline-flex items-center justify-center gap-[0.3vw] py-[0.42vw] px-[1.2vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
                  </button>
                </td>
                <td onClick={() => setSelectedCol('pro')} className={`py-[1.1vw] px-[1.2vw] text-center bg-white cursor-pointer ${getColBg('pro')}`}>
                  <button type="button"
                    className="inline-flex items-center justify-center gap-[0.3vw] py-[0.42vw] px-[1.2vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] transition-all shadow-xs"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
                  </button>
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
                    <p className="mt-[0.55vw] pt-[0.45vw] border-t border-gray-100 text-gray-600 text-[0.86vw] font-normal leading-relaxed">
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

            <p className="text-gray-600 text-[0.95vw] font-normal leading-relaxed max-w-[28vw] mx-auto">
              Create engaging, interactive publications and catalogs, and bring your designs to life today.
            </p>

            <div className="pt-[0.4vw] flex justify-center">
              <button type="button"
                className="bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.95vw] px-[1.4vw] py-[0.52vw] rounded-full shadow-xs transition-all flex items-center gap-[0.4vw]"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-[0.85vw] h-[0.85vw]" />
              </button>
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
