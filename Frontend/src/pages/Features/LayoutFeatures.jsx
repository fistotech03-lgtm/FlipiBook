import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import heroBg from '../../assets/Features/Converter/Feature.webp';

export default function LayoutFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO BANNER
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroBg}
                alt="FlipiBook Interactive Layout Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-[3vw] py-[2vw]">
              <div className="max-w-[40vw]">
                <div className="flex items-center gap-[0.5vw] mb-[0.8vw]">
                  <span className="text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    INTERACTIVE LAYOUT
                  </span>
                  <span className="w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                <h1 className="text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-[1.12]">
                  Customizing Your <br />
                  <span className="text-[#EA580C]">Unique Layout</span>
                </h1>

                <p className="mt-[0.9vw] text-[0.86vw] text-[#64748B] leading-relaxed max-w-[34vw]">
                  Customize themes, viewports, page transition sounds, and custom control bars to give viewers an unforgettable reading experience.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-[0.6vw] mt-[1.4vw]">
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Multiple Viewports
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <section className="relative w-full py-16 bg-[#FBFBFC]">
          <div className="max-w-[92vw] mx-auto px-4">
            <button
              onClick={() => navigate('/features')}
              className="inline-flex items-center gap-2 text-sm text-[#EC5137] font-semibold hover:underline mb-6 cursor-pointer"
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back to Features
            </button>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#111827] tracking-tight mb-4">
              Fully Tailored Flipbook Layouts
            </h2>
            <p className="text-base text-[#64748B] max-w-3xl leading-relaxed">
              Personalize background wallpapers, book shadows, flip animation speed, audio effects, and UI navigation bars to match your brand's unique identity.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
