import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function BuildYourDreamCta({ onOpenCreateModal }) {
  const idcGradientStyle = {
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(102, 102, 102, 0) 70.93%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    opacity: 0.64
  };

  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-50px 0px -50px 0px" }} transition={{ duration: 0.8 }} className="relative w-full bg-transparent font-poppins pt-12 pb-8 sm:pt-14 sm:pb-10 lg:pt-[4vw] lg:pb-[2.5vw] px-6 sm:px-12 lg:px-[4.5vw] overflow-hidden flex items-center justify-center min-h-[200px] lg:min-h-[12vw]">
      
      {/* Watermark IDC in background - Centered horizontally and vertically */}
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 0.64, scale: 1 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={idcGradientStyle}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[26vw] sm:text-[22vw] md:text-[19vw] lg:text-[17vw] font-black select-none pointer-events-none z-0 tracking-tighter leading-none inline-block whitespace-nowrap"
      >
        IDC
      </motion.span>

      <div className="relative z-10 w-full mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6 sm:gap-8 lg:gap-[3vw]">
        
        {/* Left Side: Headline with divider line */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col text-center md:text-left items-center md:items-start"
        >
          <div className="flex items-center gap-3.5 mb-2 sm:mb-2.5 lg:mb-[0.6vw]">
            <span className="text-lg sm:text-2xl lg:text-[1.85vw] font-medium text-[#111111] tracking-tight whitespace-nowrap">
              Let&apos;s Build Your Dream
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="hidden sm:block w-24 md:w-32 lg:w-[8vw] h-[1.5px] lg:h-[0.1vw] bg-[#d1d5db] origin-left"
            />
          </div>

          <h2 className="text-[34px] sm:text-4xl lg:text-[2.8vw] font-extrabold tracking-tight leading-tight">
            <span className="text-[#000000]">I</span>
            <span className="text-[#454545]">nteractive </span>
            <span className="text-[#000000]">D</span>
            <span className="text-[#454545]">igital </span>
            <span className="text-[#000000]">C</span>
            <span className="text-[#454545]">atalogue</span>
          </h2>
        </motion.div>

        {/* Right Side: Narrative + Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex flex-col items-center md:items-end text-center md:text-right space-y-4 lg:space-y-[1vw] max-w-[420px] lg:max-w-[28vw]"
        >
          <p className="text-xs sm:text-[15px] lg:text-[1.05vw] text-[#444444] font-normal leading-relaxed">
            Turn your static content into an immersive digital experience with 3D, animations, and smart interactions.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 lg:gap-[0.8vw] pt-1 lg:pt-[0.3vw]">
            <button
              onClick={() => onOpenCreateModal && onOpenCreateModal()}
              className="flex items-center gap-2 lg:gap-[0.5vw] px-4 sm:px-5 py-2 sm:py-2.5 lg:px-[1.5vw] lg:py-[0.7vw] bg-[#0f1115] hover:bg-black text-white rounded-lg lg:rounded-[0.5vw] font-semibold text-xs sm:text-sm lg:text-[0.9vw] shadow-md transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Icon icon="material-symbols:book-ribbon" className="w-4 h-4 lg:w-[1.1vw] lg:h-[1.1vw] text-white" />
              <span>Create Flipbook</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('interactive-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 lg:gap-[0.5vw] px-4 sm:px-5 py-2 sm:py-2.5 lg:px-[1.5vw] lg:py-[0.7vw] bg-white border border-[#d1d5db] hover:border-gray-400 text-[#1f2937] rounded-lg lg:rounded-[0.5vw] font-semibold text-xs sm:text-sm lg:text-[0.9vw] shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Icon icon="basil:video-outline" className="w-4 h-4 lg:w-[1.1vw] lg:h-[1.1vw] text-[#1f2937]" />
              <span>Demo video</span>
            </button>
          </div>
        </motion.div>

      </div>

    </motion.section>
  );
}
