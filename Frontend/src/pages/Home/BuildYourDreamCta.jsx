import React from 'react';
import { Icon } from '@iconify/react';

export default function BuildYourDreamCta({ onOpenCreateModal }) {
  const idcGradientStyle = {
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(102, 102, 102, 0) 70.93%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    opacity: 0.64
  };

  return (
    <section className="relative w-full bg-transparent font-poppins pt-16 pb-16 lg:pt-[5vw] lg:pb-[5vw] px-6 sm:px-12 lg:px-[4.5vw] overflow-hidden flex items-center justify-center min-h-[260px] lg:min-h-[16vw]">
      
      {/* Watermark IDC in background - Centered horizontally and vertically */}
      <span
        style={idcGradientStyle}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[26vw] sm:text-[22vw] md:text-[19vw] lg:text-[17vw] font-black select-none pointer-events-none z-0 tracking-tighter leading-none inline-block whitespace-nowrap"
      >
        IDC
      </span>

      <div className="relative z-10 w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-[3vw]">
        
        {/* Left Side: Headline with divider line */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-3.5 mb-2 sm:mb-2.5 lg:mb-[0.6vw]">
            <span className="text-xl sm:text-2xl lg:text-[1.85vw] font-medium text-[#111111] tracking-tight whitespace-nowrap">
              Let&apos;s Build Your Dream
            </span>
            <div className="hidden sm:block w-24 md:w-32 lg:w-[8vw] h-[1.5px] lg:h-[0.1vw] bg-[#d1d5db]" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.8vw] font-extrabold tracking-tight leading-tight">
            <span className="text-[#000000]">I</span>
            <span className="text-[#454545]">nteractive </span>
            <span className="text-[#000000]">D</span>
            <span className="text-[#454545]">igital </span>
            <span className="text-[#000000]">C</span>
            <span className="text-[#454545]">atalogue</span>
          </h2>
        </div>

        {/* Right Side: Narrative + Action Buttons */}
        <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-4 lg:space-y-[1vw] max-w-[420px] lg:max-w-[28vw]">
          <p className="text-sm sm:text-[15px] lg:text-[1.05vw] text-[#444444] font-normal leading-relaxed">
            Turn your static content into an immersive digital experience with 3D, animations, and smart interactions.
          </p>

          <div className="flex items-center gap-3 lg:gap-[0.8vw] pt-1 lg:pt-[0.3vw]">
            <button
              onClick={() => onOpenCreateModal && onOpenCreateModal()}
              className="flex items-center gap-2 lg:gap-[0.5vw] px-5 py-2.5 lg:px-[1.5vw] lg:py-[0.7vw] bg-[#0f1115] hover:bg-black text-white rounded-lg lg:rounded-[0.5vw] font-semibold text-xs sm:text-sm lg:text-[0.9vw] shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Icon icon="material-symbols:book-ribbon" className="w-4 h-4 lg:w-[1.1vw] lg:h-[1.1vw] text-white" />
              <span>Create Flipbook</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('interactive-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 lg:gap-[0.5vw] px-5 py-2.5 lg:px-[1.5vw] lg:py-[0.7vw] bg-white border border-[#d1d5db] hover:border-gray-400 text-[#1f2937] rounded-lg lg:rounded-[0.5vw] font-semibold text-xs sm:text-sm lg:text-[0.9vw] shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Icon icon="basil:video-outline" className="w-4 h-4 lg:w-[1.1vw] lg:h-[1.1vw] text-[#1f2937]" />
              <span>Demo video</span>
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
