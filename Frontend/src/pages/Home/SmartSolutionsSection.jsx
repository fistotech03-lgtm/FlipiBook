import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import exampleSvg from '../../assets/Home/example svg.svg';
import PumpImage from '../../assets/Home/Pump-image.png';

export default function SmartSolutionsSection() {
  return (
    <section className="relative w-full bg-[#fdfdfd] font-poppins py-12 lg:py-[5vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col justify-between items-center overflow-hidden border-t border-gray-100">
      
      {/* Top Header Tag */}
      <div className="w-full mx-auto flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
            FEATURES
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-400"></div>
        </div>
      </div>

      {/* 1. Large Background Heading with Text Gradient Fade + Red Accent Badge "3D Model Viewer" */}
      <div className="relative w-full mx-auto flex items-center justify-between pointer-events-none select-none z-0 mb-4 lg:mb-2">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-4xl lg:text-[5vw] font-black tracking-wider uppercase text-gray-200/90 leading-tight"
        >
          IT STARTS WITH A CLICK
        </motion.h2>

        <span className="font-serif italic text-sm sm:text-base lg:text-[1.1vw] text-[#ea7233] font-semibold tracking-wide">
          3D Model Viewer
        </span>
      </div>

      {/* 2. Center Content: Orbit 3D Motor Diagram + Right Text */}
      <div className="relative z-10 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6 lg:my-8">
        
        {/* Left Diagram with Motor & Orbit Categories (col-span-7) */}
        <div className="lg:col-span-7 relative flex items-center justify-center min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
          {/* Orbit Background SVG */}
          <img
            src={exampleSvg}
            alt="Industry Orbit"
            className="absolute w-[95%] sm:w-[85%] lg:w-[78%] h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
          />

          {/* Center 3D Motor */}
          <div className="relative z-10 w-[70%] sm:w-[58%] lg:w-[55%] flex flex-col items-center justify-center">
            <img
              src={PumpImage}
              alt="Industrial Machinery Motor 3D Model"
              className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-700"
            />
            {/* Soft Shadow below Motor */}
            <div className="w-[80%] h-4 bg-black/15 rounded-full filter blur-md -mt-3 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Headline and Narrative Text (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-3 lg:space-y-[1vw]">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.6vw] font-bold text-[#1b222c] leading-[1.15] tracking-tight">
            Smart Solutions for <br />
            Modern Industries
          </h2>

          <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed max-w-[400px]">
            Turn static pages into immersive, interactive digital experiences that engage, respond and feel alive with every interaction.
          </p>
        </div>

      </div>

      {/* 3. Bottom 3 Feature Cards */}
      <div className="relative z-10 w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mt-4">
        {/* Card 1 */}
        <div className="bg-white p-4 lg:p-[1.2vw] rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow duration-300">
          <div className="w-10 h-10 lg:w-[2.8vw] lg:h-[2.8vw] bg-black text-white rounded-lg flex items-center justify-center shrink-0">
            <Icon icon="lucide:box" className="w-5 h-5 lg:w-[1.4vw] lg:h-[1.4vw]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm lg:text-[0.95vw] font-bold text-[#1b222c] mb-0.5">Immersive 3D</h3>
            <p className="text-xs lg:text-[0.78vw] text-gray-500 leading-snug">
              Add depth with realistic models and smooth page-turn effects.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 lg:p-[1.2vw] rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow duration-300">
          <div className="w-10 h-10 lg:w-[2.8vw] lg:h-[2.8vw] bg-black text-white rounded-lg flex items-center justify-center shrink-0">
            <Icon icon="mdi:cursor-default-click-outline" className="w-5 h-5 lg:w-[1.4vw] lg:h-[1.4vw]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm lg:text-[0.95vw] font-bold text-[#1b222c] mb-0.5">Interactive Elements</h3>
            <p className="text-xs lg:text-[0.78vw] text-gray-500 leading-snug">
              Engage your users with rich interactive content.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 lg:p-[1.2vw] rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow duration-300">
          <div className="w-10 h-10 lg:w-[2.8vw] lg:h-[2.8vw] bg-black text-white rounded-lg flex items-center justify-center shrink-0">
            <Icon icon="clarity:world-line" className="w-5 h-5 lg:w-[1.4vw] lg:h-[1.4vw]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm lg:text-[0.95vw] font-bold text-[#1b222c] mb-0.5">Publish Anywhere</h3>
            <p className="text-xs lg:text-[0.78vw] text-gray-500 leading-snug">
              Share and publish across all platforms and devices.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
