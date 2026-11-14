import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import homes2Img from '../../assets/Home/homes2.png';
import arrow1Img from '../../assets/Home/arrow1.png';
import arrow2Img from '../../assets/Home/arrow2.png';
import arrow3Img from '../../assets/Home/arrow3.png';
import arrow4Img from '../../assets/Home/arrow4.png';
import arrow5Img from '../../assets/Home/arrow5.png';

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
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="w-full flex items-center gap-3.5 mt-3 sm:mt-4 lg:mt-4 mb-2 sm:mb-4 lg:mb-2 flex-shrink-0"
      >
        <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-bold tracking-[0.24em] text-white uppercase">
          INTERACTIVE 3D CATALOGUES
        </span>
        <div className="w-12 sm:w-16 lg:w-[3.6vw] h-[1.5px] bg-[#3a3a40]"></div>
      </motion.div>

      {/* Main 3-Column Layout: items-start so left & right sit high up */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 xl:gap-6 items-start relative">

        {/* Left Column (col-span-3) - directly at top */}
        <div className="lg:col-span-3 flex flex-col justify-start text-left items-start z-20 pt-7 sm:pt-9 lg:pt-12">
          {/* Headline with slide-in & fade */}
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75vw] xl:text-[3vw] font-bold text-white leading-[1.12] tracking-tight"
          >
            Give Customers <br />
            a <span className="text-[#EC5137]">Closer Look</span> <br />
            at Your <br />
            Products
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-sm md:text-[14px] lg:text-[0.84vw] font-normal text-[#9ca3af] leading-[165%] mt-5 sm:mt-6 lg:mt-6 max-w-[340px] sm:max-w-[400px] lg:max-w-none"
          >
            Bring 3D product models into your FlipiBook catalogue. Let customers rotate products, inspect details, and discover features through clickable hotspots, videos, and audio.
          </motion.p>

          {/* Explore Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              if (navigate) navigate('/explore');
            }}
            style={{ borderRadius: '12px' }}
            className="group flex items-center gap-2.5 px-6 py-2.5 sm:px-7 sm:py-3.5 lg:px-[1.6vw] lg:py-[0.65vw] bg-[#EA7233] hover:bg-[#d86224] text-white font-medium text-xs sm:text-sm lg:text-[0.84vw] shadow-[0_6px_20px_rgba(234,114,51,0.35)] transition-all duration-300 active:scale-95 cursor-pointer mt-6 sm:mt-8 lg:mt-7"
          >
            <span>Explore a 3D Catalogue</span>
            <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </div>

        {/* Center 3D Floor Plan - anchored to bottom (col-span-6) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
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

            {/* Arrow Images positioned individually */}
            {/* Arrow 1: 3D Product Models */}
            <img
              src={arrow1Img}
              alt="Arrow 1"
              style={{
                top: '-12.0%',
                left: '39.2%',
                width: '58%',
              }}
              className="hidden lg:block absolute object-contain pointer-events-none select-none z-20 origin-left"
            />

            {/* Arrow 2: 360° Product View */}
            <img
              src={arrow2Img}
              alt="Arrow 2"
              style={{
                top: '9.5%',
                left: '84%',
                width: '18%',
              }}
              className="hidden lg:block absolute object-contain pointer-events-none select-none z-20 origin-left"
            />

            {/* Arrow 3: Materials & Textures */}
            <img
              src={arrow3Img}
              alt="Arrow 3"
              style={{
                top: '30.5%',
                left: '70.5%',
                width: '30.5%',
              }}
              className="hidden lg:block absolute object-contain pointer-events-none select-none z-20 origin-left"
            />

            {/* Arrow 4: Lighting & Shadows */}
            <img
              src={arrow4Img}
              alt="Arrow 4"
              style={{
                top: '51.5%',
                left: '69.5%',
                width: '28%',
              }}
              className="hidden lg:block absolute object-contain pointer-events-none select-none z-20 origin-left"
            />

            {/* Arrow 5: Background Colors */}
            <img
              src={arrow5Img}
              alt="Arrow 5"
              style={{
                top: '80.5%',
                left: '43.5%',
                width: '51%',
              }}
              className="hidden lg:block absolute object-contain pointer-events-none select-none z-20 origin-left"
            />

          </div>
        </motion.div>

        {/* Right Column (col-span-3): 5 Features List - directly at top */}
        <div
          className="lg:col-span-3 flex flex-col justify-start gap-7 sm:gap-8 lg:gap-8 xl:gap-9.5 z-20 pt-2 sm:pt-4 lg:pt-5 xl:pt-6 pb-6 sm:pb-8 lg:pb-10 translate-x-3 sm:translate-x-5 lg:translate-x-6 xl:translate-x-8"
        >
          {features.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: 0.15 + index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-start gap-3.5 xl:gap-4"
            >
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
            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
}
