import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import SmartOrbitVisual from './SmartOrbitVisual';
import PumpImage from '../../assets/Home/Pump-image.png';

// Smart Solutions for Modern Industries Section Component
const SmartSolutionsSection = () => {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen sm:min-h-0 sm:h-auto lg:h-[100vh] bg-white font-sans py-8 sm:py-6 lg:py-[1.2vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col justify-between items-center overflow-hidden">

      {/* Top FEATURES Tag */}
      <div className="w-full flex items-center justify-between pointer-events-none select-none z-10 pt-1 lg:pt-[0.4vw]">
        <div className="flex items-center gap-3 lg:gap-[0.6vw]">
          <span className="text-xs lg:text-[0.68vw] font-bold tracking-[0.25em] text-[#35363A] uppercase">
            FEATURES
          </span>
          <div className="w-8 lg:w-[2.4vw] h-[1.5px] lg:h-[0.1vw] bg-[#35363A]/40"></div>
        </div>
      </div>

      {/* 1. BACKGROUND HEADING WITH TEXT SMOKE GRADIENT FADE + 3D MODEL VIEWER */}
      <div className="relative w-full flex justify-center pointer-events-none select-none z-0 lg:-mt-[1.2vw]">
        <div className="relative w-full flex flex-col sm:flex-row items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl sm:text-5xl md:text-6xl lg:text-[6.2vw] font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-b from-[#cbd5e1] via-[#e2e8f0]/90 to-white/10 text-center leading-tight w-full"
          >
            IT STARTS WITH A CLICK
          </motion.h2>

          {/* 3D Model Viewer in Rage Italic / #EC5137 */}
          <motion.span
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="sm:absolute static mt-1 sm:mt-2 md:mt-3 lg:mt-0 left-[62%] sm:left-[61%] lg:left-[61vw] lg:top-[5.5vw] sm:-bottom-3 md:-bottom-4 lg:bottom-auto font-rage italic text-lg sm:text-3xl md:text-4xl lg:text-[2.2vw] text-[#EC5137] tracking-wide pointer-events-none select-none z-20 whitespace-nowrap"
          >
            3D Model Viewer
          </motion.span>
        </div>
      </div>

      {/* 2. CENTER & RIGHT MAIN CONTENT CONTAINER (Flex Row for Desktop) */}
      <div
        className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between lg:gap-[3vw] my-2 sm:my-2 lg:my-0"
      >

        {/* CENTER 3D MODEL & CIRCULAR ORBIT NAVIGATION */}
        <div className="relative w-full lg:w-[50vw] flex items-center justify-center min-h-[190px] sm:min-h-[260px] lg:h-[26vw] py-1 sm:py-2 lg:py-0">

          {/* Lively Animated Vector Orbit with Moving Lines, Popping Badges & Floating Icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[88vw] sm:w-[72vw] md:w-[68vw] lg:w-[37.5vw] h-auto lg:top-[6.1vw] pointer-events-none top-[-3vw] sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-[52%] z-10 select-none drop-shadow-[0_10px_20px_rgba(236,81,55,0.18)]"
          >
            <SmartOrbitVisual />
          </motion.div>

          {/* Center 3D Motor Image */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 w-[58vw] sm:w-[33vw] md:w-[31vw] lg:w-[25.5vw] flex flex-col items-center justify-center pt-4 sm:pt-6 md:pt-8 lg:pt-[2.2vw] lg:-mt-[4.55vw]"
          >
            <img
              src={PumpImage}
              alt="Industrial Machinery Motor 3D Model"
              className="w-full h-auto lg:w-[25.5vw] object-contain drop-shadow-[0_1.5vw_2vw_rgba(0,0,0,0.18)] hover:scale-105 transition-transform duration-700"
            />

            {/* Soft Ground Shadow */}
            <div className="w-[85%] h-2.5 sm:h-3 lg:h-[0.9vw] bg-black/15 rounded-full filter blur-md -mt-2 lg:-mt-[0.4vw] pointer-events-none" />
          </motion.div>
        </div>

        {/* RIGHT SIDE TEXT CONTENT */}
        <div
          className="w-full lg:w-[33vw] flex flex-col justify-center space-y-2.5 sm:space-y-2.5 lg:space-y-[0.8vw] text-center lg:text-left items-center lg:items-start z-10 px-4 lg:px-0 mt-6 sm:mt-6 lg:mt-0"
        >
          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-4xl lg:text-[2.7vw] font-bold text-gray-900 leading-[1.15] tracking-tight font-sans"
          >
            Smart Solutions for <br className="hidden sm:block" />
            Modern Industries
          </motion.h2>

          {/* Thin Black Accent Line under heading */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-10 lg:w-[2.2vw] h-[2.5px] lg:h-[0.2vw] bg-gray-900 rounded-full my-1 lg:my-[0.2vw] origin-left"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-base lg:text-[1.05vw] text-gray-500 font-normal leading-relaxed w-full max-w-md lg:w-[28vw]"
          >
            Turn static pages into immersive, interactive digital experiences that engage, respond and feel alive with every interaction.
          </motion.p>
        </div>
      </div>

      {/* 3. BOTTOM FEATURE CARDS (Individual Animated on Scroll with Delays) */}
      <div
        className="relative z-10 w-full max-w-xl lg:max-w-none lg:w-[88vw] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-3.5 lg:gap-[1.5vw] mt-6 sm:mt-6 lg:mt-0 mb-4 sm:mb-4 lg:mb-[0.5vw] px-2 lg:px-0"
      >
        {/* CARD 1: Immersive 3D */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="group bg-white hover:bg-[#1C1D21] p-2.5 sm:p-4 lg:p-[0.75vw] w-full sm:w-full lg:w-[27vw] rounded-xl lg:rounded-[0.75vw] border border-gray-100/80 hover:border-[#1C1D21] shadow-sm hover:shadow-xl hover:shadow-black/10 flex items-center gap-2.5 lg:gap-[0.75vw] transition-all duration-300"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-[2.5vw] lg:h-[2.5vw] bg-[#1C1D21] text-white group-hover:bg-white group-hover:text-[#1C1D21] rounded-lg sm:rounded-xl lg:rounded-[0.5vw] flex items-center justify-center shadow-sm shrink-0 transition-colors duration-300">
            <Icon icon="lucide:box" className="w-4.5 h-4.5 sm:w-6 sm:h-6 lg:w-[1.35vw] lg:h-[1.35vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-xs sm:text-[17px] lg:text-[0.92vw] font-bold text-gray-900 group-hover:text-white mb-0.5 sm:mb-1 transition-colors duration-300">
              Immersive 3D
            </h3>
            <p className="text-[10.5px] sm:text-[14px] lg:text-[0.72vw] text-gray-500 group-hover:text-gray-300 leading-[1.4] transition-colors duration-300 max-w-[200px] sm:max-w-none lg:max-w-[15.5vw]">
              Add depth with realistic models and smooth page-turn effects.
            </p>
          </div>
        </motion.div>

        {/* CARD 2: Interactive Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="group bg-white hover:bg-[#1C1D21] p-2.5 sm:p-4 lg:p-[0.75vw] w-full sm:w-full lg:w-[27vw] rounded-xl lg:rounded-[0.75vw] border border-gray-100/80 hover:border-[#1C1D21] shadow-sm hover:shadow-xl hover:shadow-black/10 flex items-center gap-2.5 lg:gap-[0.75vw] transition-all duration-300"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-[2.5vw] lg:h-[2.5vw] bg-[#1C1D21] text-white group-hover:bg-white group-hover:text-[#1C1D21] rounded-lg sm:rounded-xl lg:rounded-[0.5vw] flex items-center justify-center shadow-sm shrink-0 transition-colors duration-300">
            <Icon icon="mdi:cursor-default-click-outline" className="w-4.5 h-4.5 sm:w-6 sm:h-6 lg:w-[1.35vw] lg:h-[1.35vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-xs sm:text-[17px] lg:text-[0.92vw] font-bold text-gray-900 group-hover:text-white mb-0.5 sm:mb-1 transition-colors duration-300">
              Interactive Elements
            </h3>
            <p className="text-[10.5px] sm:text-[14px] lg:text-[0.72vw] text-gray-500 group-hover:text-gray-300 leading-[1.4] transition-colors duration-300 max-w-[200px] sm:max-w-none lg:max-w-[15.5vw]">
              Engage your users with rich interactive digital content.
            </p>
          </div>
        </motion.div>

        {/* CARD 3: Publish Anywhere */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="group bg-white hover:bg-[#1C1D21] p-2.5 sm:p-4 lg:p-[0.75vw] w-full sm:w-full lg:w-[27vw] rounded-xl lg:rounded-[0.75vw] border border-gray-100/80 hover:border-[#1C1D21] shadow-sm hover:shadow-xl hover:shadow-black/10 flex items-center gap-2.5 lg:gap-[0.75vw] transition-all duration-300"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-[2.5vw] lg:h-[2.5vw] bg-[#1C1D21] text-white group-hover:bg-white group-hover:text-[#1C1D21] rounded-lg sm:rounded-xl lg:rounded-[0.5vw] flex items-center justify-center shadow-sm shrink-0 transition-colors duration-300">
            <Icon icon="clarity:world-line" className="w-4.5 h-4.5 sm:w-6 sm:h-6 lg:w-[1.35vw] lg:h-[1.35vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-xs sm:text-[17px] lg:text-[0.92vw] font-bold text-gray-900 group-hover:text-white mb-0.5 sm:mb-1 transition-colors duration-300">
              Publish Anywhere
            </h3>
            <p className="text-[10.5px] sm:text-[14px] lg:text-[0.72vw] text-gray-500 group-hover:text-gray-300 leading-[1.4] transition-colors duration-300 max-w-[200px] sm:max-w-none lg:max-w-[15.5vw]">
              Share and publish seamlessly across all platforms & devices.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartSolutionsSection;
