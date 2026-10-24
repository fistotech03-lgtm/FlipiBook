import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import arViewImg from '../../assets/Home/final-images/ar-integration/ar-integration.webp';

export default function ArIntegrationSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="relative w-full bg-white font-poppins overflow-hidden"
    >
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
            <h2 className="text-[26px] sm:text-[44px] md:text-[48px] lg:text-[3.8vw] font-semibold text-[#2B3037] leading-[1.12] sm:leading-[1.08] tracking-tight">
              <span className="block">See Products</span>
              <span className="text-[#EC5137] block mt-0.5 sm:mt-1 lg:mt-[0.3vw]">in Real Space</span>
            </h2>
          </motion.div>

          {/* 3. Divider line under headline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-20 sm:w-36 lg:w-[12vw] h-[1px] bg-[#d2d5d8] mb-2 sm:mb-3.5 lg:mb-[1.8vw] origin-left"
          ></motion.div>

          {/* 4. Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.85, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11.5px] sm:text-[15px] md:text-[16px] lg:text-[0.92vw] text-[#69707D] font-normal leading-[1.55] sm:leading-[1.6] max-w-[340px] sm:max-w-[540px] lg:max-w-[24vw] mb-4 sm:mb-5 lg:mb-[3.2vw] text-left"
          >
            Bring your products to life with AR. Scan the QR code from your flipbook and view 3D models in your space.
          </motion.p>

          {/* 5. Three Circular Badges Row: For Tablet (sm to lg), icon is placed to the RIGHT of text (flex-row-reverse). Mobile & Desktop keep standard vertical stack */}
          <div className="flex items-start justify-start gap-4 sm:gap-6 md:gap-8 lg:gap-[2.6vw] w-full">
            
            {/* Badge 1: Realistic 3D Models */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-start text-center sm:text-left lg:text-left gap-2 sm:gap-3 lg:gap-0"
            >
              <div
                className="w-10 h-10 sm:w-13 sm:h-13 lg:w-[3.6vw] lg:h-[3.6vw] rounded-full flex items-center justify-center text-[#EC5137] sm:mb-0 lg:mb-2 shrink-0"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="energy-icons:cube-20" className="w-4 h-4 sm:w-6 sm:h-6 lg:w-[1.6vw] lg:h-[1.6vw]" />
              </div>
              <div className="flex flex-col items-center sm:items-start lg:items-start text-center sm:text-left lg:text-left">
                <span className="text-[11.5px] sm:text-[14px] md:text-[15px] lg:text-[0.88vw] font-semibold text-[#1C1D21] leading-tight">
                  Realistic
                </span>
                <span className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[0.72vw] text-[#858585] leading-tight mt-0.5 sm:mt-1 font-normal">
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
              className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-start text-center sm:text-left lg:text-left gap-2 sm:gap-3 lg:gap-0"
            >
              <div
                className="w-10 h-10 sm:w-13 sm:h-13 lg:w-[3.6vw] lg:h-[3.6vw] rounded-full flex items-center justify-center text-[#EC5137] sm:mb-0 lg:mb-2 shrink-0"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="carbon:carbon-for-mobile" className="w-4 h-4 sm:w-6 sm:h-6 lg:w-[1.6vw] lg:h-[1.6vw]" />
              </div>
              <div className="flex flex-col items-center sm:items-start lg:items-start text-center sm:text-left lg:text-left">
                <span className="text-[11.5px] sm:text-[14px] md:text-[15px] lg:text-[0.88vw] font-semibold text-[#1C1D21] leading-tight">
                  View at
                </span>
                <span className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[0.72vw] text-[#858585] leading-tight mt-0.5 sm:mt-1 font-normal">
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
              className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-start text-center sm:text-left lg:text-left gap-2 sm:gap-3 lg:gap-0"
            >
              <div
                className="w-10 h-10 sm:w-13 sm:h-13 lg:w-[3.6vw] lg:h-[3.6vw] rounded-full flex items-center justify-center text-[#EC5137] sm:mb-0 lg:mb-2 shrink-0"
                style={{ backgroundColor: 'rgba(236, 81, 55, 0.10)' }}
              >
                <Icon icon="andrsrxn:rotate-3d" className="w-4 h-4 sm:w-6 sm:h-6 lg:w-[1.6vw] lg:h-[1.6vw]" />
              </div>
              <div className="flex flex-col items-center sm:items-start lg:items-start text-center sm:text-left lg:text-left">
                <span className="text-[11.5px] sm:text-[14px] md:text-[15px] lg:text-[0.88vw] font-semibold text-[#1C1D21] leading-tight">
                  360°
                </span>
                <span className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[0.72vw] text-[#858585] leading-tight mt-0.5 sm:mt-1 font-normal">
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