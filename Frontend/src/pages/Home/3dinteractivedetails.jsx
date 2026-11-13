import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import homes2Img from '../../assets/Home/homes2.png';

export default function ThreeDInteractiveDetails({ navigate }) {
  const features = [
    {
      id: 1,
      title: '3D Product Models',
      desc: (
        <>
          Add your 3D models to catalogue <br />
          pages so customers can explore <br />
          product shapes and details.
        </>
      ),
      icon: 'lets-icons:3d-box-light',
    },
    {
      id: 2,
      title: '360° Product View',
      desc: (
        <>
          Let customers rotate and zoom in on <br />
          models to examine them from <br />
          different angles.
        </>
      ),
      icon: 'teenyicons:360-outline',
    },
    {
      id: 3,
      title: 'Materials & Textures',
      desc: (
        <>
          Customize model surfaces to <br />
          showcase product colors, materials, <br />
          and finishes.
        </>
      ),
      icon: 'streamline-flex:texture',
    },
    {
      id: 4,
      title: 'Lighting & Shadows',
      desc: (
        <>
          Adjust lighting to highlight <br />
          product details and give models <br />
          a realistic appearance.
        </>
      ),
      icon: 'entypo:light-up',
    },
    {
      id: 5,
      title: 'Background Colors',
      desc: (
        <>
          Choose 3D viewer background <br />
          colors that complement your <br />
          products and brand.
        </>
      ),
      icon: 'arcticons:removebg',
    },
  ];

  return (
    <section className="relative w-full bg-[#030303] text-white min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] flex flex-col justify-start pt-4 sm:pt-6 lg:pt-5 pb-0 px-6 sm:px-10 lg:px-[5vw] xl:px-[5.5vw] font-poppins overflow-hidden">

      {/* Top Tag: INTERACTIVE 3D CATALOGUES */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full flex items-center gap-3.5 mb-2 sm:mb-4 lg:mb-2 flex-shrink-0"
      >
        <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-bold tracking-[0.24em] text-white uppercase">
          INTERACTIVE 3D CATALOGUES
        </span>
        <div className="w-12 sm:w-16 lg:w-[3.6vw] h-[1.5px] bg-[#3a3a40]"></div>
      </motion.div>

      {/* Main 3-Column Layout: items-start so left & right sit high up */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 xl:gap-6 items-start relative">

        {/* Left Column (col-span-3) - directly at top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.1 }}
          className="lg:col-span-3 flex flex-col justify-start text-left items-start z-20 pt-7 sm:pt-9 lg:pt-12"
        >
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75vw] xl:text-[3vw] font-bold text-white leading-[1.12] tracking-tight">
            Give Customers <br />
            a <span className="text-[#EA7233]">Closer Look</span> <br />
            at Your <br />
            Products
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-[14px] lg:text-[0.84vw] font-normal text-[#9ca3af] leading-[165%] mt-5 sm:mt-6 lg:mt-6 max-w-[340px] sm:max-w-[400px] lg:max-w-none">
            Bring 3D product models into your FlipiBook catalogue. Let customers rotate products, inspect details, and discover features through clickable hotspots, videos, and audio.
          </p>

          {/* Explore Button */}
          <button
            onClick={() => {
              if (navigate) navigate('/explore');
            }}
            style={{ borderRadius: '12px' }}
            className="group flex items-center gap-2.5 px-6 py-2.5 sm:px-7 sm:py-3.5 lg:px-[1.6vw] lg:py-[0.65vw] bg-[#EA7233] hover:bg-[#d86224] text-white font-medium text-xs sm:text-sm lg:text-[0.84vw] shadow-[0_6px_20px_rgba(234,114,51,0.35)] transition-all duration-300 active:scale-95 cursor-pointer mt-6 sm:mt-8 lg:mt-7"
          >
            <span>Explore a 3D Catalogue</span>
            <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Center 3D Floor Plan - anchored to bottom (col-span-6) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-6 relative flex items-end justify-center w-full z-10 self-end -mb-1 translate-x-2 sm:translate-x-4 lg:translate-x-6"
        >
          <div className="relative w-full max-w-[560px] sm:max-w-[700px] lg:max-w-none lg:w-[116%] xl:w-[122%] lg:-ml-[4%] xl:-ml-[6%] flex items-end justify-center">

            {/* The Image itself */}
            <img
              src={homes2Img}
              alt="Interactive 3D Catalogue Floor Plan"
              className="w-full h-auto max-h-[56vh] sm:max-h-[66vh] lg:max-h-[80vh] xl:max-h-[85vh] object-contain select-none pointer-events-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)] scale-x-120 scale-y-124 origin-bottom"
            />

            {/* Exact Dot 1: Outer Wall Corner of Kitchen */}
            <span className="hidden lg:block absolute top-[11.8%] left-[28.7%] w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EC5137] rounded-full shadow-[0_0_10px_#EC5137] z-20 -translate-x-1/2 -translate-y-1/2"></span>

            {/* Exact Dot 2: Right side hallway/stair landing edge */}
            <span className="hidden lg:block absolute top-[33.2%] left-[67.8%] w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EC5137] rounded-full shadow-[0_0_10px_#EC5137] z-20 -translate-x-1/2 -translate-y-1/2"></span>

            {/* Exact Dot 3: Stone accent wall in living area */}
            <span className="hidden lg:block absolute top-[61.5%] left-[66.4%] w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EC5137] rounded-full shadow-[0_0_10px_#EC5137] z-20"></span>

            {/* Exact Dot 4: Bottom living sofa edge */}
            <span className="hidden lg:block absolute top-[85.8%] left-[47.2%] w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EC5137] rounded-full shadow-[0_0_10px_#EC5137] z-20"></span>

            {/* Exact Dot 5: Bottom right lamp / table corner */}
            <span className="hidden lg:block absolute top-[80.4%] left-[63.2%] w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EC5137] rounded-full shadow-[0_0_10px_#EC5137] z-20"></span>

            {/* SVG Connecting Dashed Lines */}
            <svg
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="dash-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="3.6"
                  markerHeight="3.6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 6 5 L 0 8.5" fill="none" stroke="#EC5137" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>

              {/* 1. From Dot 1 (Outer Top Kitchen Corner) -> short diagonal rise and curve into straight horizontal to 3D Product Models */}
              <path
                d="M 28.7 11.8 L 31.2 7.0 Q 32.5 5.2 35.0 5.2 L 96 5.2"
                fill="none"
                stroke="#EC5137"
                strokeWidth="0.22"
                strokeDasharray="1.0, 0.9"
                markerEnd="url(#dash-arrow)"
              />

              {/* 2. From Dot 2 (Stairs) -> Straight horizontal to 360° Product View */}
              <path
                d="M 68.2 33.2 L 70.8 33.2 L 96 33.2"
                fill="none"
                stroke="#EC5137"
                strokeWidth="0.22"
                strokeDasharray="1.0, 0.9"
                markerEnd="url(#dash-arrow)"
              />

              {/* 3. From Dot 3 (Stone Wall) -> Zig-zag step path into Lighting & Shadows */}
              <path
                d="M 66.8 63.2 L 72.8 80.5 L 77.2 67.5 L 96 67.5"
                fill="none"
                stroke="#EC5137"
                strokeWidth="0.22"
                strokeDasharray="1.0, 0.9"
                markerEnd="url(#dash-arrow)"
              />

              {/* 4. From Dot 4 (Bottom Sofa) -> Horizontal right through living room */}
              <path
                d="M 47.7 86.2 L 96 86.2"
                fill="none"
                stroke="#EC5137"
                strokeWidth="0.22"
                strokeDasharray="1.0, 0.9"
                markerEnd="url(#dash-arrow)"
              />
            </svg>

          </div>
        </motion.div>

        {/* Right Column (col-span-3): 5 Features List - directly at top */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.25 }}
          className="lg:col-span-3 flex flex-col justify-start gap-7 sm:gap-8 lg:gap-8 xl:gap-9.5 z-20 pt-7 sm:pt-9 lg:pt-12 pb-6 sm:pb-8 lg:pb-10 translate-x-3 sm:translate-x-5 lg:translate-x-6 xl:translate-x-8"
        >
          {features.map((item) => (
            <div key={item.id} className="flex items-start gap-3.5 xl:gap-4">
              {/* Circular Bordered Icon matching Figma styling */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-[2.6vw] lg:h-[2.6vw] rounded-full border border-white/90 bg-transparent flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                <Icon icon={item.icon} className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-[1.3vw] lg:h-[1.3vw]" />
              </div>

              {/* Text: Title & Description */}
              <div className="flex flex-col text-left">
                <h3 className="text-xs sm:text-sm lg:text-[0.88vw] font-semibold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[10.5px] sm:text-xs lg:text-[0.72vw] font-normal text-[#9ca3af] leading-[150%] mt-1 sm:mt-1.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>

    </section>
  );
}
