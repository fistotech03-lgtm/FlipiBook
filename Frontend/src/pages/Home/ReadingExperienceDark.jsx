import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import bookShowImg from '../../assets/Home/final-images/features/features-image.webp';

export default function ReadingExperienceDark({ onOpenCreateModal }) {
  const features = [
    {
      id: "models",
      title: "3D Models",
      desc: "Import realistic 3D models into your flipbook pages.",
      icon: "lucide:box",
      iconClass: "w-[1.37rem] h-[1.37rem] lg:w-[1.81vw] lg:h-[1.81vw]"
    },
    {
      id: "rotate",
      title: "360° Rotate",
      desc: "Rotate and explore every model from every angle.",
      icon: "teenyicons:360-outline",
      iconClass: "w-[1.37rem] h-[1.37rem] lg:w-[1.81vw] lg:h-[1.81vw]"
    },
    {
      id: "texture",
      title: "Texture Editor",
      desc: "Apply materials, textures, and realistic surface finishes.",
      icon: "streamline-flex:texture",
      iconClass: "w-[1.37rem] h-[1.37rem] lg:w-[1.81vw] lg:h-[1.81vw]"
    },
    {
      id: "lighting",
      title: "Lighting",
      desc: "Adjust lights, shadows, reflections, and scene ambience.",
      icon: "entypo:light-up",
      iconClass: "w-[1.37rem] h-[1.37rem] lg:w-[1.81vw] lg:h-[1.81vw]"
    },
    {
      id: "background",
      title: "Background Color",
      desc: "Customize popup backgrounds to match your brand style.",
      customIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.37rem] h-[1.37rem] lg:w-[1.81vw] lg:h-[1.81vw]">
          <path d="M12 4L3 8.5L12 13L21 8.5L12 4Z" />
          <path d="M4.5 12.5L12 16.5L19.5 12.5" />
        </svg>
      )
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="w-full bg-[#252728] text-white py-10 sm:py-14 lg:py-[3.2vw] px-6 sm:px-8 md:px-10 lg:px-[5.2vw] font-poppins border-t border-gray-800 overflow-hidden relative"
    >
      <div className="w-full mx-auto flex flex-col space-y-4 sm:space-y-6 lg:space-y-[1.2vw]">
        
        {/* Top Header Tag: Left-aligned on all viewports */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-start gap-3 sm:gap-4 lg:gap-[1vw]"
        >
          <span className="text-xs lg:text-[0.72vw] font-bold tracking-[0.25em] text-[#d1d5db] uppercase">
            3D EXPERIENCE
          </span>
          <div className="w-10 lg:w-[2.6vw] h-[1.5px] lg:h-[0.1vw] bg-[#6b7280]"></div>
        </motion.div>

        {/* 
          Main Content Container:
          - Mobile / Tablet (<1024px): Responsive flow with left-aligned copy, centered 3D book, and 2-per-row features on tablet
          - Desktop (>=1024px): Flanking 2-column layout with center 3D book precisely positioned
        */}
        <div className="relative w-full min-h-0 lg:min-h-[38vw] flex flex-col lg:flex-row lg:items-start lg:pt-[1.5vw] lg:justify-between">
          
          {/* Left Column: Headings, Copy, Orange CTA (Left-aligned & justified copy on mobile/tab) */}
          <div
            className="w-full lg:w-[23vw] flex flex-col justify-start text-left items-start space-y-3.5 sm:space-y-4 md:space-y-5 lg:space-y-[1.4vw] z-20 relative pointer-events-auto"
          >
            <motion.h2
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3vw] lg:leading-[4.5vw] font-bold text-white leading-[1.08] sm:leading-[1.12] tracking-tight"
            >
              Not Just Pages. <br />
              A <span className="text-[#EC5137]">3D</span> Reading <br className="hidden sm:inline" />
              Experience.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs sm:text-[14px] md:text-[15.5px] lg:text-[0.95vw] text-[#A6ABB3] lg:text-[#D9D9D9] font-normal leading-[1.65] sm:leading-[1.75] text-justify lg:text-left w-full max-w-full sm:max-w-[560px] md:max-w-[620px] lg:max-w-none lg:w-[13vw]"
            >
              Transform static flipbooks into immersive experiences with realistic 3D objects, interactive hotspots, videos, audio, and smooth page transitions.
            </motion.p>

            {/* Orange CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2 sm:pt-3 lg:pt-[0.2vw]"
            >
              <button
                onClick={() => onOpenCreateModal && onOpenCreateModal()}
                className="inline-flex items-center gap-2.5 lg:gap-[0.55vw] px-5 sm:px-6 py-3 sm:py-3.5 lg:px-[1.65vw] lg:py-[0.85vw] bg-[#EA6229] hover:bg-[#d8551f] text-white rounded-lg lg:rounded-[0.5vw] font-semibold text-xs sm:text-[15px] lg:text-[0.88vw] shadow-md shadow-orange-900/30 transition-all duration-300 active:scale-95 cursor-pointer group"
              >
                <span>Bring Your Products into 3D</span>
                <Icon icon="lucide:arrow-right" className="w-4 h-4 lg:w-[0.95vw] lg:h-[0.95vw] group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* 
            Center 3D Book Graphic:
            - Desktop: Absolute positioning pinned directly with left: 40vw, top: 19vw, width: 44vw
            - Tablet/Mobile: Relative flow centered between top and features
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative lg:absolute lg:left-[40vw] lg:top-[19vw] lg:-translate-x-1/2 lg:-translate-y-1/2 w-full max-w-[460px] sm:max-w-[560px] md:max-w-[620px] lg:max-w-none lg:w-[44vw] flex items-center justify-center my-6 sm:my-8 md:my-10 lg:my-0 z-10 pointer-events-none mx-auto"
          >
            <img
              src={bookShowImg}
              alt="Modern Living Room 3D Catalogue with Lamp and Phone"
              className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.75)] hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>

          {/* 
            Features Container:
            - Mobile: Single column (1 per row)
            - Tablet (sm/md): Two per row grid (2 per row)
            - Desktop: Vertical column on right
          */}
          <div className="w-full lg:w-[24vw] grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-3.5 sm:gap-5 md:gap-6 lg:gap-0 lg:space-y-[2.5vw] text-left z-20 relative pointer-events-auto max-w-full sm:max-w-[680px] md:max-w-[760px] lg:max-w-none mx-auto lg:mx-0 mt-3 sm:mt-6 lg:mt-0">
            {features.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                transition={{ duration: 0.8, delay: 0.2 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3.5 sm:gap-4 lg:gap-[1.18vw] group bg-white/[0.03] sm:bg-white/[0.04] lg:bg-transparent p-3 sm:p-3.5 md:p-4 lg:p-0 rounded-xl sm:rounded-2xl lg:rounded-none border border-white/5 lg:border-transparent transition-all"
              >
                {/* Circular Ring Container */}
                <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] lg:w-[3.04vw] lg:h-[3.04vw] rounded-full border border-white/80 bg-transparent flex items-center justify-center text-white shrink-0 group-hover:border-[#EA6229] group-hover:text-[#EA6229] transition-all">
                  {item.customIcon ? (
                    <span className="text-white group-hover:text-[#EA6229] flex items-center justify-center">
                      {item.customIcon}
                    </span>
                  ) : (
                    <Icon icon={item.icon} className={`${item.iconClass || "w-[1.32rem] h-[1.32rem] lg:w-[1.76vw] lg:h-[1.76vw]"} text-white group-hover:text-[#EA6229]`} />
                  )}
                </div>
                
                {/* Title & Description */}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13.7px] sm:text-[15px] md:text-[16px] lg:text-[1.1vw] font-bold text-white leading-tight mb-1 lg:mb-[0.29vw] group-hover:text-[#EA6229] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11.7px] sm:text-[12.5px] md:text-[13px] lg:text-[0.8vw] text-[#9ca3af] lg:text-[#a0a5ad] font-normal leading-relaxed max-w-[240px] sm:max-w-none">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </motion.section>
  );
}
