import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import arViewImg from '../../assets/Home/AR-img.png';

export default function ArIntegrationSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="relative w-full bg-white font-poppins overflow-hidden"
    >
      {/* Background Watermark Text on Top Right */}
      <div className="hidden lg:block absolute top-6 sm:top-7 right-[3vw] xl:right-[4vw] pointer-events-none select-none z-0 text-right">
        <h2 className="text-[3.2vw] xl:text-[3.6vw] font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-b from-[#cbd5e1] via-[#e2e8f0]/90 to-white/10 leading-none block">
          AUGMENTED REALITY
        </h2>
        <span
          className="italic text-2xl sm:text-3xl lg:text-[2.2vw] text-[#EC5137] tracking-wide block -mt-2 xl:-mt-3 mr-6"
          style={{ fontFamily: "'Rage Italic', 'Rage', cursive" }}
        >
          View in your space
        </span>
      </div>

      {/* 2-Column Layout */}
      <div className="w-full flex flex-col lg:flex-row items-stretch justify-between">
        
        {/* Left Column: Content with exact matching proportions */}
        <div className="w-full lg:w-[48%] xl:w-[46%] flex flex-col justify-start text-left items-start pt-6 sm:pt-8 lg:pt-[4.5vw] pb-3 sm:pb-3 lg:pb-[4.5vw] px-6 sm:px-12 lg:pl-[6.2vw] lg:pr-2 z-10 shrink-0">
          
          {/* 1. Top Header Tag: AR INTEGRATION with horizontal rule */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 sm:gap-4 mb-2.5 sm:mb-4 lg:mb-[2.2vw]"
          >
            <span className="text-[10px] sm:text-[13px] lg:text-[0.82vw] font-semibold tracking-[0.22em] text-[#35363A] uppercase">
              AR INTEGRATION
            </span>
            <div className="w-8 sm:w-14 lg:w-[3.4vw] h-[1.5px] bg-[#35363A]/40"></div>
          </motion.div>

          {/* 2. Headline: Left-aligned across all breakpoints */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.95, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mb-2 sm:mb-3 lg:mb-[1.6vw] text-left w-full"
          >
            <h2 className="text-[34px] xs:text-[36px] sm:text-[45px] lg:text-[3.2vw] xl:text-[3.4vw] font-bold text-[#2B3037] leading-[1.12] sm:leading-[1.1] tracking-tight uppercase">
              <span className="block">VISUALIZE PRODUCTS</span>
              <span className="block mt-0.5 sm:mt-1">
                IN YOUR <span className="text-[#EC5137]">REAL SPACE,</span>
              </span>
              <span className="text-[#EC5137] block mt-0.5 sm:mt-1">IN REAL TIME.</span>
            </h2>
          </motion.div>

          {/* 4. Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.85, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11.5px] sm:text-[14px] md:text-[15px] lg:text-[0.88vw] text-[#69707D] font-normal leading-[1.65] max-w-[340px] sm:max-w-[500px] lg:max-w-[26vw] mb-4 sm:mb-5 lg:mb-[2vw] text-left"
          >
            Help customers visualize your products in their own surroundings. Scan the QR code in your FlipiBook catalogue to place and explore a 3D product model using augmented reality.
          </motion.p>

          {/* CTA Button: Try the AR Experience */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.85, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 sm:mb-7 lg:mb-[2.6vw]"
          >
            <button
              type="button"
              style={{ borderRadius: '12px' }}
              className="inline-flex items-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 bg-[#EC5137] hover:bg-[#d8442c] text-white text-xs sm:text-sm lg:text-[0.88vw] font-medium shadow-[0_6px_20px_rgba(236,81,55,0.35)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>Try the AR Experience</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4 lg:w-[1vw] lg:h-[1vw]" />
            </button>
          </motion.div>

          {/* 5. Three Circular Badges Row */}
          <div className="flex items-start justify-start gap-4 sm:gap-6 md:gap-8 lg:gap-[2.6vw] w-full">
            
            {/* Badge 1: Realistic 3D Models */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[3.2vw] lg:h-[3.2vw] rounded-full flex items-center justify-center text-[#EC5137] shrink-0"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="lucide:box" className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-[1.4vw] lg:h-[1.4vw]" />
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-[11.5px] sm:text-[13px] md:text-[14px] lg:text-[0.84vw] font-bold text-[#1C1D21] leading-tight">
                  Realistic
                </span>
                <span className="text-[10px] sm:text-[11.5px] md:text-[12px] lg:text-[0.72vw] text-[#858585] leading-tight mt-0.5 font-normal">
                  3D Models
                </span>
              </div>
            </motion.div>

            {/* Badge 2: View at Actual Size */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[3.2vw] lg:h-[3.2vw] rounded-full flex items-center justify-center text-[#EC5137] shrink-0"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="lucide:smartphone" className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-[1.4vw] lg:h-[1.4vw]" />
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-[11.5px] sm:text-[13px] md:text-[14px] lg:text-[0.84vw] font-bold text-[#1C1D21] leading-tight">
                  View at
                </span>
                <span className="text-[10px] sm:text-[11.5px] md:text-[12px] lg:text-[0.72vw] text-[#858585] leading-tight mt-0.5 font-normal">
                  Actual Size
                </span>
              </div>
            </motion.div>

            {/* Badge 3: 360° Interaction */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[3.2vw] lg:h-[3.2vw] rounded-full flex items-center justify-center text-[#EC5137] shrink-0"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="teenyicons:360-outline" className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-[1.4vw] lg:h-[1.4vw]" />
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-[11.5px] sm:text-[13px] md:text-[14px] lg:text-[0.84vw] font-bold text-[#1C1D21] leading-tight">
                  360°
                </span>
                <span className="text-[10px] sm:text-[11.5px] md:text-[12px] lg:text-[0.72vw] text-[#858585] leading-tight mt-0.5 font-normal">
                  Interaction
                </span>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Right Column: Docked to bottom right without cropping or overflow */}
        <div className="w-full lg:w-[52%] xl:w-[54%] flex items-end justify-center lg:justify-end self-end pointer-events-none select-none mt-2 sm:mt-1 md:-mt-4 lg:mt-0 px-2 sm:px-6 lg:px-0">
          <img
            src={arViewImg}
            alt="AR Real Space Experience"
            className="w-full max-w-[480px] sm:max-w-[560px] md:max-w-[620px] lg:max-w-none h-auto block object-contain object-bottom"
          />
        </div>

      </div>

    </motion.section>
  );
}