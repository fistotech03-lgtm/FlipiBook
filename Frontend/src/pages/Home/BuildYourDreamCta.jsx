import React from 'react';
import { Icon } from '@iconify/react';

export default function BuildYourDreamCta({ onOpenCreateModal }) {
  const idcGradientStyle = {
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(102, 102, 102, 0) 70.93%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  return (
    <section className="relative w-full bg-transparent font-poppins pt-6 pb-16 lg:pt-8 lg:pb-20 px-6 sm:px-12 lg:px-20 overflow-hidden border-t border-gray-100 flex items-center justify-center min-h-[220px]">
      
      {/* Watermark IDC in background - Centered horizontally and vertically */}
      <div
        style={idcGradientStyle}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[26vw] sm:text-[22vw] md:text-[19vw] lg:text-[17vw] font-black select-none pointer-events-none z-0 tracking-tighter leading-none"
      >
        IDC
      </div>

      <div className="relative z-10 w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* Left Side: Headline with divider line */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-3.5 mb-2 sm:mb-2.5">
            <span className="text-xl sm:text-2xl lg:text-[28px] font-medium text-[#111111] tracking-tight whitespace-nowrap">
              Let&apos;s Build Your Dream
            </span>
            <div className="hidden sm:block w-24 md:w-32 lg:w-44 h-[1.5px] bg-[#d1d5db]" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-tight">
            <span className="text-[#000000]">I</span>
            <span className="text-[#454545]">nteractive </span>
            <span className="text-[#000000]">D</span>
            <span className="text-[#454545]">igital </span>
            <span className="text-[#000000]">C</span>
            <span className="text-[#454545]">atalogue</span>
          </h2>
        </div>

        {/* Right Side: Narrative + Action Buttons */}
        <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-4 max-w-[420px]">
          <p className="text-xs sm:text-[13px] text-[#555555] font-normal leading-relaxed">
            Turn your static content into an immersive digital experience with 3D, animations, and smart interactions.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onOpenCreateModal && onOpenCreateModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0f1115] hover:bg-black text-white rounded-lg font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Icon icon="material-symbols:book-ribbon" className="w-4 h-4 text-white" />
              <span>Create Flipbook</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('interactive-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#d1d5db] hover:border-gray-400 text-[#1f2937] rounded-lg font-semibold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Icon icon="basil:video-outline" className="w-4 h-4 text-[#1f2937]" />
              <span>Demo video</span>
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
