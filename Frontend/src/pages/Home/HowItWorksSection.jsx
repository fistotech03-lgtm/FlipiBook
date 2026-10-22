import React from 'react';
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
      imgClass: "w-[88%] h-auto max-h-[92%] object-contain drop-shadow-md"
    },
    {
      number: "02",
      title: "Page Layouts",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg2,
      textPosition: "top",
      imgClass: "w-[108%] max-w-none h-auto object-contain drop-shadow-md -mx-3"
    },
    {
      number: "03",
      title: "Publish & Share",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg3,
      textPosition: "bottom",
      imgClass: "w-[110%] max-w-none h-auto object-contain drop-shadow-md -mx-3"
    },
    {
      number: "04",
      title: "Analyse Performance",
      desc: "Upload your PDF orr choose from professionally designed templates.",
      image: workImg4,
      textPosition: "top",
      imgClass: "w-[84%] h-auto max-h-[95%] object-contain drop-shadow-md"
    }
  ];

  return (
    <section className="relative w-full bg-white font-poppins py-14 lg:py-[5.5vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col items-center justify-between border-t border-gray-100">
      
      {/* Top Header */}
      <div className="w-full mx-auto text-left mb-6 lg:mb-[1vw]">
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
            HOW IT WORKS
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-400"></div>
        </div>
      </div>

      <div className="text-center w-full mx-auto mb-12 lg:mb-[4vw] space-y-2">
        <h2 className="text-3xl sm:text-5xl lg:text-[3.2vw] font-extrabold text-[#1b222c] tracking-tight leading-tight">
          Create Your <span className="text-[#ea543a]">Flipbook</span> in 4 Simple Steps
        </h2>
        <p className="text-xs sm:text-sm lg:text-[0.95vw] text-gray-500 font-normal leading-relaxed">
          From upload to publish, everything you need in one simple process.
        </p>
      </div>

      {/* 4 Cards Alternating Grid */}
      <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-[1.8vw] items-end">
        {steps.map((step, idx) => {
          const isTopText = step.textPosition === "top";

          // Header/Footer Text Block
          const textBlock = (
            <div className={`text-center flex flex-col items-center w-full px-2 ${isTopText ? 'mb-5 lg:mb-[1.4vw]' : 'mt-5 lg:mt-[1.4vw]'}`}>
              <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-1.5">
                <span className="inline-block w-4 sm:w-6 lg:w-[1.8vw] h-[1.5px] bg-[#9ca3af]"></span>
                <h3 className="text-sm sm:text-base lg:text-[1.1vw] font-bold text-[#1b222c] leading-tight">
                  {step.title}
                </h3>
                <span className="inline-block w-4 sm:w-6 lg:w-[1.8vw] h-[1.5px] bg-[#9ca3af]"></span>
              </div>
              <p className="text-xs lg:text-[0.82vw] text-gray-500 font-normal leading-relaxed max-w-[92%]">
                {step.desc}
              </p>
            </div>
          );

          // Card Box (Grey rounded container with giant number and centered graphic)
          const cardBox = (
            <div className="w-full bg-[#e2e4e7] rounded-[24px] p-6 sm:p-7 lg:p-[1.8vw] flex flex-col justify-between aspect-[1/1.22] relative shadow-xs group-hover:shadow-md transition-all duration-300 overflow-hidden">
              {/* Giant Step Number in top left */}
              <span className="text-5xl sm:text-6xl lg:text-[4.5vw] font-black text-white leading-none select-none block text-left shrink-0">
                {step.number}
              </span>
              
              {/* Image Centered and Sized */}
              <div className="flex-1 flex items-center justify-center w-full h-full min-h-0 py-1">
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

    </section>
  );
}
