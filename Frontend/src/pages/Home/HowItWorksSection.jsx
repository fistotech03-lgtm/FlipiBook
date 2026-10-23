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
      title: "Upload & Select",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg1,
      textPosition: "bottom",
      // Tuning individual image presentation to match Figma design
      imgClass: "w-[80%] h-auto max-h-[85%] object-contain drop-shadow-md"
    },
    {
      number: "02",
      title: "Page Layouts",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg2,
      textPosition: "top",
      imgClass: "w-[98%] max-w-none h-auto object-contain drop-shadow-md"
    },
    {
      number: "03",
      title: "Publish & Share",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg3,
      textPosition: "bottom",
      imgClass: "w-[100%] max-w-none h-auto object-contain drop-shadow-md"
    },
    {
      number: "04",
      title: "Analyse Performance",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg4,
      textPosition: "top",
      imgClass: "w-[76%] h-auto max-h-[88%] object-contain drop-shadow-md"
    }
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} className="relative w-full bg-white font-poppins py-10 lg:py-[3vw] px-6 sm:px-10 lg:px-[6vw] flex flex-col items-center justify-between border-t border-gray-100">
      
      {/* Top Header */}
      <div className="w-full text-left mb-6 lg:mb-[1.5vw]">
        <div className="flex items-center gap-3 lg:gap-[0.6vw]">
          <span className="text-xs lg:text-[0.75vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
            HOW IT WORKS
          </span>
          <div className="w-8 lg:w-[2.2vw] h-[1.5px] lg:h-[0.1vw] bg-gray-400"></div>
        </div>
      </div>

      <div className="text-center w-full mb-8 lg:mb-[2.4vw] space-y-2 lg:space-y-[0.5vw]">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.3vw] font-extrabold text-[#1b222c] tracking-tight leading-tight">
          Create Your <span className="text-[#ea543a]">Flipbook</span> in 4 Simple Steps
        </h2>
        <p className="text-sm sm:text-base lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed">
          From upload to publish, everything you need in one simple process.
        </p>
      </div>

      {/* 4 Cards Alternating Grid - Full width with vw-based proportional sizing on desktop */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-[1.5vw] items-end">
        {steps.map((step, idx) => {
          const isTopText = step.textPosition === "top";

          // Header/Footer Text Block
          const textBlock = (
            <div className={`text-center flex flex-col items-center w-full px-2 ${isTopText ? 'mb-4 lg:mb-[1vw]' : 'mt-4 lg:mt-[1vw]'}`}>
              <div className="flex items-center justify-center gap-2.5 lg:gap-[0.5vw] w-full mb-1.5 lg:mb-[0.4vw]">
                <span className="inline-block w-4 sm:w-6 lg:w-[1.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#9ca3af]"></span>
                <h3 className="text-base sm:text-lg lg:text-[1.1vw] font-bold text-[#1b222c] leading-snug">
                  {step.title}
                </h3>
                <span className="inline-block w-4 sm:w-6 lg:w-[1.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#9ca3af]"></span>
              </div>
              <p className="text-xs sm:text-[13px] lg:text-[0.8vw] text-gray-500 font-normal leading-relaxed lg:leading-[1.4] max-w-[280px] lg:max-w-[17vw]">
                {step.desc}
              </p>
            </div>
          );

          // Card Box (Grey rounded container with giant number and centered graphic)
          const cardBox = (
            <div className="w-full bg-[#e2e4e7] rounded-[22px] lg:rounded-[1.4vw] p-4 sm:p-5 lg:p-[1.1vw] flex flex-col justify-between aspect-[1/1.14] relative shadow-xs group-hover:shadow-md transition-all duration-300 overflow-hidden">
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
            <div key={idx} className="flex flex-col items-center group w-full justify-end">
              {isTopText ? (
                <>
                  {textBlock}
                  {cardBox}
                </>
              ) : (
                <>
                  {cardBox}
                  {textBlock}
                </>
              )}
            </div>
          );
        })}
      </div>

    </motion.section>
  );
}
