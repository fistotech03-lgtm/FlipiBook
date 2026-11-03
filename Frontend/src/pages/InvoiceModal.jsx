import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Printer, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Download,
  Building2,
  Mail,
  Globe,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Icon } from '@iconify/react';

const PLAN_DETAILS = {
  free: {
    name: 'Free Starter Plan',
    code: 'FRE',
    badge: 'Starter',
    monthlyPrice: 0.00,
    annualPrice: 0.00,
    description: 'Perfect for individuals and small creators getting started with digital publications.',
    buttonText: 'Get Started Free',
    features: [
      'Create up to 5 flipbooks',
      'Basic templates gallery',
      'Add images, videos & interactive links',
      'Share via direct URL or iframe embed',
      'Standard reader analytics',
      'Community & email support'
    ]
  },
  standard: {
    name: 'Standard Pro Plan',
    code: 'STA',
    badge: 'Most Popular',
    monthlyPrice: 39.99,
    annualPrice: 31.99,
    description: 'Ideal for growing teams and businesses with advanced branding and 3D requirements.',
    buttonText: 'Subscribe to Standard',
    features: [
      'Up to 25 flipbooks / month',
      'Premium templates & 3D realistic flip effect',
      'Custom branding & watermark removal',
      'Advanced reader analytics & heatmaps',
      'Team collaboration (up to 5 users)',
      'Password protection & domain restriction',
      'Priority email & live support'
    ]
  },
  premium: {
    name: 'Enterprise Premium Plan',
    code: 'PRE',
    badge: 'Enterprise',
    monthlyPrice: 99.99,
    annualPrice: 79.99,
    description: 'For organizations with custom requirements, high publication volume, and dedicated SLA.',
    buttonText: 'Subscribe to Premium',
    features: [
      'Unlimited flipbooks & unlimited views',
      'All premium & 3D interactive features',
      'Team collaboration (unlimited users)',
      'Advanced analytics, custom reports & API access',
      'Custom domain & white-label publishing',
      'Dedicated account manager & 24/7 SLA support'
    ]
  }
};

export default function InvoiceModal({ isOpen, onClose, defaultPlan = 'standard', isAnnual = false }) {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [billingPeriod, setBillingPeriod] = useState(isAnnual ? 'annual' : 'monthly');

  useEffect(() => {
    if (defaultPlan) setSelectedPlan(defaultPlan);
  }, [defaultPlan]);

  useEffect(() => {
    setBillingPeriod(isAnnual ? 'annual' : 'monthly');
  }, [isAnnual]);

  if (!isOpen) return null;

  const currentPlan = PLAN_DETAILS[selectedPlan] || PLAN_DETAILS.standard;
  const isAnnualSelected = billingPeriod === 'annual';
  const isFreePlan = selectedPlan === 'free';

  const unitMonthlyPrice = isFreePlan ? 0 : (isAnnualSelected ? currentPlan.annualPrice : currentPlan.monthlyPrice);
  const totalMonths = (isAnnualSelected && !isFreePlan) ? 12 : 1;
  const subtotal = Number((unitMonthlyPrice * totalMonths).toFixed(2));
  const discount = (!isFreePlan && isAnnualSelected) ? Number((currentPlan.monthlyPrice * 12 - subtotal).toFixed(2)) : 0;
  const tax = isFreePlan ? 0 : Number((subtotal * 0.08).toFixed(2)); // 8% sales tax
  const total = Number((subtotal + tax).toFixed(2));

  const invoiceNumber = `INV-2026-${currentPlan.code}-2796`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex flex-col bg-slate-900/85 backdrop-blur-md overflow-hidden font-sans">
        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .print-a4-page {
              position: static !important;
              width: 210mm !important;
              min-height: 297mm !important;
              max-width: 210mm !important;
              padding: 16mm 18mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              background: white !important;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
          }
        `}</style>

        {/* ------------------------------------------------------------- */}
        {/* TOP TOOLBAR (A4 DOCUMENT VIEWER CONTROLS) - HIDDEN ON PRINT */}
        {/* ------------------------------------------------------------- */}
        <header className="no-print bg-[#1e2229] border-b border-slate-700/80 px-4 sm:px-6 py-2.5 flex items-center justify-between text-white shrink-0 z-20 shadow-md">
          {/* Left: Document Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ec5137]/20 border border-[#ec5137]/40 flex items-center justify-center text-[#ec5137]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Invoice Preview</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  A4 View (210 × 297 mm)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Official FlipiBook quotation &amp; billing summary</p>
            </div>
          </div>

          {/* Center: Interactive Plan & Cycle Switchers */}
          <div className="flex items-center gap-2.5">
            {/* Plan Selector */}
            <div className="bg-slate-800/90 p-1 rounded-lg border border-slate-700 flex items-center gap-1">
              {['free', 'standard', 'premium'].map((planKey) => {
                const isSelected = selectedPlan === planKey;
                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => setSelectedPlan(planKey)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ec5137] text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {planKey}
                  </button>
                );
              })}
            </div>

            {/* Cycle Selector */}
            <div className="bg-slate-800/90 p-1 rounded-lg border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                disabled={isFreePlan}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  isFreePlan ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  !isAnnualSelected
                    ? 'bg-slate-200 text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                disabled={isFreePlan}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  isFreePlan ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isAnnualSelected
                    ? 'bg-[#ec5137] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${isAnnualSelected ? 'bg-white/20 text-white' : 'bg-[#ec5137]/30 text-[#ec5137]'}`}>
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Print A4 Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#ec5137] hover:bg-[#d94229] transition-all shadow-sm shadow-[#ec5137]/30 cursor-pointer"
            >
              <span>{currentPlan.buttonText}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* DESK / CANVAS WRAPPER - SCROLLABLE CONTAINER */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto px-4 py-8 sm:py-10 flex justify-center custom-scrollbar">
          
          {/* ----------------------------------------------------------- */}
          {/* AUTHENTIC A4 DOCUMENT PAPER SHEET */}
          {/* Dimensions: 794px × 1123px (standard A4 at 96 DPI, 210x297mm) */}
          {/* ----------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            id="invoice-a4-sheet"
            className="print-a4-page w-full max-w-[794px] min-h-[1123px] bg-white text-slate-800 shadow-[0_12px_45px_rgba(0,0,0,0.35)] border border-slate-300/80 rounded-[3px] p-10 sm:p-14 flex flex-col justify-between"
          >
            {/* TOP PORTION OF A4 */}
            <div className="space-y-7">

              {/* 1. Header: Brand + Official Document Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
                {/* Brand Logo & Slogan */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                      Flipi<span className="text-[#ec5137]">Book</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                      Proforma
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Next-Gen Interactive Digital Flipbook &amp; 3D Catalogues
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cloud Publishing Platform &bull; www.flipibook.com
                  </p>
                </div>

                {/* Invoice Meta */}
                <div className="text-left sm:text-right space-y-1">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-mono">
                    {invoiceNumber}
                  </h1>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p><span className="text-slate-400 font-normal">Invoice Date:</span> <span className="font-semibold text-slate-800">{invoiceDate}</span></p>
                    <p><span className="text-slate-400 font-normal">Payment Due:</span> <span className="font-semibold text-slate-800">{dueDate}</span></p>
                    <p><span className="text-slate-400 font-normal">Payment Terms:</span> <span className="font-semibold text-slate-800">Net 14 Days</span></p>
                  </div>
                </div>
              </div>

              {/* 2. Billing Parties: Billed From & Billed To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-lg border border-slate-200/90 text-xs">
                {/* Vendor Info */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#ec5137]" />
                    <span>Vendor / Billed By</span>
                  </p>
                  <p className="font-bold text-slate-900 text-sm">FlipiBook Media Technologies Inc.</p>
                  <p className="text-slate-600">548 Market St, Suite 2900</p>
                  <p className="text-slate-600">San Francisco, CA 94104, United States</p>
                  <div className="pt-1 text-[11px] text-slate-500 space-y-0.5">
                    <p>Tax ID / VAT: <span className="font-mono font-medium text-slate-700">US-948102934-EX</span></p>
                    <p>Billing Inquiry: <span className="text-[#ec5137] font-medium">billing@flipibook.com</span></p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Icon icon="lucide:user-check" className="w-3 h-3 text-[#ec5137]" />
                    <span>Customer / Billed To</span>
                  </p>
                  <p className="font-bold text-slate-900 text-sm">Your Organization / Studio</p>
                  <p className="text-slate-600">Enterprise Workspace Account</p>
                  <p className="text-slate-600">Account ID: <span className="font-mono text-slate-700 font-medium">ACC-FLIPI-84920</span></p>
                  <div className="pt-1 text-[11px] text-slate-500 space-y-0.5">
                    <p>Client VAT / Tax: <span className="font-mono font-medium text-slate-700">US-SAMPLE-TAX-ID</span></p>
                    <p>Account Email: <span className="font-medium text-slate-700">billing@yourdomain.com</span></p>
                  </div>
                </div>
              </div>

              {/* 3. Items & Services Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Item &amp; Description</th>
                      <th className="py-3 px-4 text-center">Frequency</th>
                      <th className="py-3 px-4 text-right">Unit Rate</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">01</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-[13px]">{currentPlan.name}</div>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{currentPlan.description}</p>
                        {!isFreePlan && isAnnualSelected && (
                          <span className="inline-block mt-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            20% Annual Prepay Savings Applied
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                        {isFreePlan ? 'Forever' : (isAnnualSelected ? '12 Months' : '1 Month')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-mono">
                        {isFreePlan ? '$0.00' : `$${unitMonthlyPrice.toFixed(2)}/mo`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. Features & Quota Inclusions Card */}
              <div className="bg-[#fffaf8] p-4 rounded-lg border border-[#fecaca]/90">
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Icon icon="teenyicons:sparkles-outline" className="w-3.5 h-3.5 text-[#ec5137]" />
                  <span>Quota &amp; Features Included in {currentPlan.name}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-700">
                  {currentPlan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Icon icon="teenyicons:tick-circle-solid" className="w-3.5 h-3.5 text-[#ec5137] shrink-0" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Totals & Terms Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                {/* Left Terms & Guarantee */}
                <div className="space-y-3 text-xs max-w-sm text-slate-600">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#ec5137]" />
                    <span>30-Day Money-Back Guarantee</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    All FlipiBook plans include 256-bit SSL encryption, automated global CDN delivery, continuous cloud updates, and 30-day no-risk cancellation guarantee.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200/80 space-y-1">
                    <p><span className="font-semibold text-slate-700">Payment Methods:</span> Credit Cards (Visa, MC, Amex), PayPal, Direct Bank Transfer.</p>
                    <p><span className="font-semibold text-slate-700">Status:</span> Official Proforma Quotation (Valid for 14 days).</p>
                  </div>
                </div>

                {/* Right Totals Box */}
                <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200/80 text-emerald-600 font-medium">
                      <span>Annual Discount (20%)</span>
                      <span className="font-mono">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span>Estimated Tax ({isFreePlan ? '0%' : '8%'})</span>
                    <span className="font-mono text-slate-900 font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 text-slate-900 font-bold">
                    <span className="text-sm">Total Due</span>
                    <span className="font-mono text-xl text-[#ec5137]">${total.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM PORTION OF A4: FORMAL INVOICE FOOTER */}
            <div className="pt-8 border-t border-slate-200 text-[11px] text-slate-400 space-y-2 mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="font-medium text-slate-600">
                  Thank you for choosing FlipiBook Media Technologies Inc.
                </p>
                <p className="font-mono text-slate-400">
                  Page 1 of 1 &bull; Proforma Document
                </p>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                This document is a computer-generated proforma quotation and receipt voucher. For questions or enterprise PO procurement, contact <a href="mailto:billing@flipibook.com" className="text-[#ec5137] hover:underline font-medium">billing@flipibook.com</a>.
              </p>
            </div>

          </motion.div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FOOTER BAR (QUICK ACTIONS) - HIDDEN ON PRINT */}
        {/* ------------------------------------------------------------- */}
        <footer className="no-print bg-[#1e2229] border-t border-slate-700/80 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 shrink-0 z-20 shadow-lg">
          <div>
            Need custom enterprise SLA or purchase order? Email us at <a href="mailto:sales@flipibook.com" className="text-[#ec5137] font-medium hover:underline">sales@flipibook.com</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-white bg-[#ec5137] hover:bg-[#d94229] transition-all shadow-md shadow-[#ec5137]/30 cursor-pointer"
            >
              <span>{currentPlan.buttonText}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </footer>

      </div>
    </AnimatePresence>
  );
}
