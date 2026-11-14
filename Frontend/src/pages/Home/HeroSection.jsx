import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import heropage1Img from '../../assets/Home/heropage_1.webp';

export default function HeroSection({ navigate }) {
  return (
    <section className="relative w-full bg-[#fdfdfd] min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] lg:h-[calc(100vh-7vh)] flex flex-col justify-between pt-3 sm:pt-4 lg:pt-3 pb-6 sm:pb-8 lg:pb-4 px-4 sm:px-8 lg:px-[5.5vw] font-poppins overflow-hidden">
      
      {/* Top Tag: IDC FOR ALL INDUSTRY and line */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-3.5 pt-2 sm:pt-3 lg:pt-2 mb-3 sm:mb-4 lg:mb-2 flex-shrink-0"
      >
        <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
          IDC FOR ALL INDUSTRY
        </span>
        <div className="w-12 sm:w-16 lg:w-[3.6vw] h-[1.5px] bg-[#35363A]"></div>
      </motion.div>

      {/* Main 2-Column Grid - Viewport Responsive */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 xl:gap-8 items-center lg:-mt-6">
        
        {/* Left Column: Headings, description & buttons */}
        <div className="lg:col-span-5 flex flex-col justify-start text-left items-start z-10 pt-0 sm:pt-1 -mt-1 sm:-mt-2 lg:-mt-14 xl:-mt-16">
          
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-[2.8vw] xl:text-[3.2vw] font-bold text-[#1a1a1a] leading-[1.12] tracking-tight uppercase"
          >
            INTERACTIVE DIGITAL <br />
            <span className="text-[#EC5137] tracking-tight">CATALOGUE</span>
          </motion.h1>

          {/* Subheading: Single Line WITH IMMERSIVE EXPERIENCE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full mt-2.5 sm:mt-3.5 lg:mt-3 flex flex-col items-start"
          >
            {/* Extended red line with WITH positioned at the right under CATALOGUE */}
            <div className="flex items-center gap-3 w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[16vw] xl:max-w-[17vw]">
              <div className="flex-1 h-[1.5px] bg-[#EC5137]"></div>
              <span className="text-[11px] sm:text-xs lg:text-[0.78vw] font-semibold text-[#555555] uppercase tracking-wider flex-shrink-0">
                WITH
              </span>
            </div>

            {/* IMMERSIVE EXPERIENCE */}
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[1.85vw] xl:text-[2.1vw] font-bold text-[#555555] tracking-tight uppercase mt-3.5 sm:mt-4 lg:mt-3.5">
              IMMERSIVE EXPERIENCE
            </h2>
          </motion.div>

          {/* Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-sm md:text-[14.5px] lg:text-[0.82vw] xl:text-[0.86vw] font-normal text-[#666666] leading-[165%] max-w-[480px] lg:max-w-[25vw] text-left mt-6 sm:mt-8 lg:mt-7 xl:mt-8"
          >
            Turn your PDF into an interactive digital catalogue with FlipiBook. Add product videos, 3D models, and clickable links so customers can see how your products work, explore the details, and contact your team. Share your catalogue through a single link.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 lg:mt-14 xl:mt-16 flex-wrap"
          >
            {/* View Live Demo Button */}
            <button
              onClick={() => {
                const el = document.getElementById('interactive-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ borderRadius: '15px' }}
              className="group flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 lg:px-[1.4vw] lg:py-[0.62vw] bg-white hover:bg-[#141b24] border border-gray-200 hover:border-[#141b24] text-[#35363A] hover:text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(20,27,36,0.22)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#35363A] group-hover:bg-[#EC5137] text-white flex items-center justify-center transition-colors duration-300">
                <Icon icon="ic:round-play-arrow" className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
              </div>
              <span className="font-semibold">View Live Demo</span>
            </button>

            {/* My Flipbook Button */}
            <button
              onClick={() => navigate && navigate('/my-flipbooks')}
              style={{ borderRadius: '15px' }}
              className="group flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 lg:px-[1.4vw] lg:py-[0.62vw] bg-[#141b24] hover:bg-[#EC5137] text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_6px_18px_rgba(20,27,36,0.25)] hover:shadow-[0_8px_22px_rgba(236,81,55,0.35)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span className="font-semibold">My Flipbook</span>
              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </motion.div>

        </div>

        {/* Right Column: 3D Studio Showcase Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex flex-col items-center lg:items-end justify-center relative w-full mt-4 lg:mt-0"
        >
          <div className="w-full relative flex items-center justify-center lg:justify-end">
            <img
              src={heropage1Img}
              alt="Interactive Digital Catalogue 3D Studio"
              className="w-full max-w-[540px] sm:max-w-[680px] lg:max-w-[52vw] xl:max-w-[54vw] max-h-[50vh] sm:max-h-[56vh] lg:max-h-[75vh] xl:max-h-[78vh] object-contain select-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.06)]"
            />
          </div>

          {/* Three Feature Taglines directly under image */}
          <div className="w-full flex justify-center lg:justify-end mt-2 lg:mt-3 pr-2">
            <span className="text-[10px] sm:text-xs lg:text-[0.72vw] font-semibold text-[#555555] tracking-[0.16em] uppercase">
              • INTERACTIVE &nbsp; • IMMERSIVE &nbsp; • INTELLIGENT
            </span>
          </div>
        </motion.div>

      </div>

    </section>
  );
}
