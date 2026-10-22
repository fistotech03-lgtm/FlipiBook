import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Calendar, 
  CreditCard, 
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Icon } from '@iconify/react';

const PLAN_DETAILS = {
  free: {
    name: 'Free Starter Plan',
    badge: 'Starter',
    monthlyPrice: 19.99,
    annualPrice: 15.99,
    description: 'Perfect for individuals and small business getting started.',
    features: [
      'Up to 5 flipbooks / month',
      'Basic templates & standard export',
      'Add images, videos & interactive links',
      'Share via direct link or iframe embed',
      'Community & email support'
    ]
  },
  standard: {
    name: 'Standard Pro Plan',
    badge: 'Most Popular',
    monthlyPrice: 39.99,
    annualPrice: 31.99,
    description: 'Ideal for growing teams and businesses with advanced needs.',
    features: [
      'Up to 25 flipbooks / month',
      'Premium templates & 3D realistic flip effect',
      'Custom branding (logo, colors, watermark removal)',
      'Advanced reader analytics & engagement metrics',
      'Team collaboration (up to 5 users)',
      'Priority email & chat support'
    ]
  },
  premium: {
    name: 'Enterprise Premium Plan',
    badge: 'Enterprise',
    monthlyPrice: 99.99,
    annualPrice: 79.99,
    description: 'For large organizations with custom requirements and high volume.',
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
  const unitMonthlyPrice = isAnnualSelected ? currentPlan.annualPrice : currentPlan.monthlyPrice;
  const totalMonths = isAnnualSelected ? 12 : 1;
  const subtotal = Number((unitMonthlyPrice * totalMonths).toFixed(2));
  const discount = isAnnualSelected ? Number((currentPlan.monthlyPrice * 12 - subtotal).toFixed(2)) : 0;
  const tax = Number((subtotal * 0.08).toFixed(2)); // 8% sales tax
  const total = Number((subtotal + tax).toFixed(2));

  const invoiceNumber = `INV-${new Date().getFullYear()}-${selectedPlan.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#ea7233]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Sample Invoice Preview</h3>
                <p className="text-xs text-slate-500">Official FlipiBook subscription quotation &amp; receipt</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Plan Switcher Bar */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Plan Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['free', 'standard', 'premium'].map((planKey) => (
                <button
                  key={planKey}
                  type="button"
                  onClick={() => setSelectedPlan(planKey)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    selectedPlan === planKey
                      ? 'bg-white text-[#ea7233] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {planKey}
                </button>
              ))}
            </div>

            {/* Cycle Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  !isAnnualSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  isAnnualSelected
                    ? 'bg-[#ea7233] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${isAnnualSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#ea7233]'}`}>-20%</span>
              </button>
            </div>
          </div>

          {/* Invoice Document Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
            {/* Top Info: Brand & Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                    Flipi<span className="text-[#ea7233]">Book</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Proforma
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Next-Gen Interactive Digital Flipbook &amp; 3D Catalogues</p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5">
                <p className="font-mono font-bold text-slate-800 text-sm">{invoiceNumber}</p>
                <p className="text-slate-500">Issued: <span className="font-medium text-slate-700">{invoiceDate}</span></p>
                <p className="text-slate-500">Due: <span className="font-medium text-slate-700">{dueDate}</span></p>
              </div>
            </div>

            {/* Billed From & Billed To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed From</p>
                <p className="font-bold text-slate-800">FlipiBook Media Technologies Inc.</p>
                <p className="text-slate-600">548 Market St, Suite 2900</p>
                <p className="text-slate-600">San Francisco, CA 94104, USA</p>
                <p className="text-slate-500 mt-1">support@flipibook.com</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To (Sample)</p>
                <p className="font-bold text-slate-800">Your Organization / Studio</p>
                <p className="text-slate-600">Enterprise Workspace Account</p>
                <p className="text-slate-600">VAT / Tax ID: US-948102934-EX</p>
                <p className="text-slate-500 mt-1">billing@yourdomain.com</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Item &amp; Description</th>
                    <th className="py-2.5 px-3 text-center">Period</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{currentPlan.name}</div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{currentPlan.description}</p>
                      {isAnnualSelected && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Annual plan discount (Save ~20%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">
                      {isAnnualSelected ? '12 Months' : '1 Month'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-mono">
                      ${unitMonthlyPrice.toFixed(2)}/mo
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                      ${subtotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
              <div className="space-y-2 text-xs max-w-sm">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#ea7233]" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  All subscriptions include secure cloud hosting, SSL encryption, automatic updates, and dedicated customer assistance.
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                    <span>Annual Savings</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono text-slate-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-900 text-slate-900 font-bold text-sm">
                  <span>Total Due</span>
                  <span className="font-mono text-base text-[#ea7233]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* What's Included Preview */}
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ea7233]" />
                <span>Features included in {currentPlan.name}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {currentPlan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ea7233] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Questions? Contact us at <a href="mailto:billing@flipibook.com" className="text-[#ea7233] font-medium hover:underline">billing@flipibook.com</a>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Close
              </button>
              <a
                href="/signup"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#ea7233] hover:bg-[#d65a1c] transition-all shadow-md shadow-orange-500/20"
              >
                <span>Subscribe to {selectedPlan}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
