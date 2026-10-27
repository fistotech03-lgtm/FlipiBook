import React from 'react';
import { motion } from 'framer-motion';
import workImg1 from '../../assets/Home/final-images/how-it-works/step-1.webp';
import workImg2 from '../../assets/Home/final-images/how-it-works/step-2.webp';
import workImg3 from '../../assets/Home/final-images/how-it-works/step-3.webp';
import workImg4 from '../../assets/Home/final-images/how-it-works/step-4.webp';

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Content",
      desc: "Upload your PDF or choose a ready-made template to start building your digital catalogue.",
      image: workImg1,
      textPosition: "bottom",
      imgClass: "w-[80%] h-auto max-h-[85%] object-contain drop-shadow-md"
    },
    {
      number: "02",
      title: "Make It Interactive",
      desc: "Customize your pages with product videos, 3D models, and clickable links that help customers explore.",
      image: workImg2,
      textPosition: "top",
      imgClass: "w-[98%] max-w-none h-auto object-contain drop-shadow-md"
    },
    {
      number: "03",
      title: "Publish & Share",
      desc: "Publish your catalogue and share it through a link, QR code, or website embed.",
      image: workImg3,
      textPosition: "bottom",
      imgClass: "w-[100%] max-w-none h-auto object-contain drop-shadow-md"
    },
    {
      number: "04",
      title: "Track & Improve",
      desc: "Review catalogue views and viewer activity to understand engagement and refine your content.",
      image: workImg4,
      textPosition: "top",
      imgClass: "w-[76%] h-auto max-h-[88%] object-contain drop-shadow-md"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="relative w-full bg-white font-poppins py-10 lg:py-[3vw] px-6 sm:px-10 lg:px-[6vw] flex flex-col items-center justify-between border-t border-gray-100"
    >
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.6 }}
        className="w-full text-left mb-6 lg:mb-[1.5vw]"
      >
        <div className="flex items-center gap-3 lg:gap-[0.6vw]">
          <span className="text-xs lg:text-[0.75vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
            HOW IT WORKS
          </span>
          <div className="w-8 lg:w-[2.2vw] h-[1.5px] lg:h-[0.1vw] bg-gray-400"></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-center w-full mb-7 sm:mb-9 md:mb-11 lg:mb-[3.2vw] space-y-2 sm:space-y-2.5 lg:space-y-[0.7vw]"
      >
        <h2 className="text-2xl sm:text-4xl lg:text-[3vw] font-semibold text-[#1b222c] tracking-tight leading-tight">
          Create Your Interactive Digital Catalogue <br />
          <span className="text-[#ea543a]">in 4 Simple Steps</span>
        </h2>
        <p className="text-xs sm:text-base lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
          Turn your PDF into a product experience customers can explore. Create, customize, share, and track your catalogue with FlipiBook.
        </p>
      </motion.div>

      {/* 
        Cards Grid:
        - Mobile & Tablet (< lg): Uniform layout with card on top and text below card for all steps
        - Desktop (lg+): Alternating wave layout preserved
      */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-y-12 md:gap-y-14 lg:gap-[2vw] items-start lg:items-end">
        {steps.map((step, idx) => {
          const isTopText = step.textPosition === "top";

          // Header/Footer Text Block: order-2 on mobile/tab (always below card), alternating on desktop
          const textBlock = (
            <div
              className={`text-center flex flex-col items-center w-full px-2 mt-3 sm:mt-4 ${
                isTopText ? 'order-2 lg:order-1 lg:mt-0 lg:mb-[1vw]' : 'order-2 lg:order-2 lg:mt-[1vw]'
              }`}
            >
              <div className="flex items-center justify-center gap-2.5 lg:gap-[0.5vw] w-full mb-1.5 lg:mb-[0.4vw]">
                <span className="inline-block w-4 sm:w-6 lg:w-[1.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#9ca3af]"></span>
                <h3 className="text-base sm:text-lg lg:text-[1.1vw] font-medium text-[#1b222c] leading-snug">
                  {step.title}
                </h3>
                <span className="inline-block w-4 sm:w-6 lg:w-[1.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#9ca3af]"></span>
              </div>
              <p className="text-xs sm:text-[13px] lg:text-[0.8vw] text-gray-500 font-normal leading-relaxed lg:leading-[1.4] max-w-[280px] lg:max-w-[17vw]">
                {step.desc}
              </p>
            </div>
          );

          // Card Box: order-1 on mobile/tab (always on top of text), alternating on desktop, slightly reduced width
          const cardBox = (
            <div
              className={`w-full lg:w-[92%] mx-auto bg-[#e2e4e7] rounded-[22px] lg:rounded-[1.4vw] p-4 sm:p-5 lg:p-[1.1vw] flex flex-col justify-between aspect-[1/1.14] relative shadow-xs group-hover:shadow-md transition-all duration-300 overflow-hidden ${
                isTopText ? 'order-1 lg:order-2' : 'order-1 lg:order-1'
              }`}
            >
              {/* Giant Step Number in top left */}
              <span className="text-4xl sm:text-5xl lg:text-[3.2vw] font-black text-white leading-none select-none block text-left shrink-0">
                {step.number}
              </span>
              
              {/* Image Centered and Sized */}
              <div className="flex-1 flex items-center justify-center w-full h-full min-h-0 py-1.5 lg:py-[0.3vw]">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`${step.imgClass} group-hover:scale-105 transition-transform duration-500`}
                />
              </div>
            </div>
          );

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.15 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center group w-full justify-start lg:justify-end max-w-[340px] sm:max-w-none mx-auto sm:mx-0"
            >
              {cardBox}
              {textBlock}
            </motion.div>
          );
        })}
      </div>

    </motion.section>
  );
}
