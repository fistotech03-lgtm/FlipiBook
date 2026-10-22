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
      desc: "Upload your PDF or choose from professionally designed templates.",
      image: workImg1
    },
    {
      number: "02",
      title: "Page Layouts",
      desc: "Upload your PDF or choose from professionally designed templates.",
      image: workImg2
    },
    {
      number: "03",
      title: "Publish & Share",
      desc: "Upload your PDF or choose from professionally designed templates.",
      image: workImg3
    },
    {
      number: "04",
      title: "Analyse Performance",
      desc: "Upload your PDF or choose from professionally designed templates.",
      image: workImg4
    }
  ];

  return (
    <section className="relative w-full bg-white font-poppins py-12 lg:py-[5vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col items-center justify-between border-t border-gray-100">
      
      {/* Top Header */}
      <div className="w-full mx-auto text-left mb-6 lg:mb-[1vw]">
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
            HOW IT WORKS
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-400"></div>
        </div>
      </div>

      <div className="text-center w-full mx-auto mb-10 lg:mb-[3.5vw] space-y-2">
        <h2 className="text-2xl sm:text-4xl lg:text-[2.8vw] font-bold text-[#1b222c] tracking-tight leading-tight">
          Create Your <span className="text-[#ea7233]">Flipbook</span> in 4 Simple Steps
        </h2>
        <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed">
          From upload to publish, everything you need in one simple process.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-[1.8vw] items-stretch">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center group w-full">
            
            {/* Top Step Card Box with Giant Number & Inner Mockup */}
            <div className="w-full bg-[#e3e4e7] rounded-2xl p-4 lg:p-[1.4vw] flex flex-col justify-between aspect-[1/1.25] relative shadow-xs group-hover:shadow-md transition-all duration-300 overflow-hidden">
              {/* Giant Step Number watermark */}
              <span className="text-5xl lg:text-[4.5vw] font-black text-white/95 leading-none select-none block text-left">
                {step.number}
              </span>

              {/* Step Image */}
              <div className="flex-1 flex items-center justify-center p-1 w-full h-full">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full max-h-[160px] sm:max-h-[190px] lg:max-h-none object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                />
              </div>
            </div>

            {/* Bottom Title & Description */}
            <div className="mt-4 lg:mt-[1.2vw] text-center flex flex-col items-center w-full px-2">
              {/* Title with side horizontal dash rules */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-1">
                <span className="inline-block w-4 sm:w-6 lg:w-[1.8vw] h-[1.5px] bg-gray-400"></span>
                <h3 className="text-sm sm:text-base lg:text-[1.05vw] font-bold text-[#1b222c] leading-tight">
                  {step.title}
                </h3>
                <span className="inline-block w-4 sm:w-6 lg:w-[1.8vw] h-[1.5px] bg-gray-400"></span>
              </div>

              {/* Description */}
              <p className="text-xs lg:text-[0.82vw] text-gray-500 font-normal leading-relaxed max-w-[92%]">
                {step.desc}
              </p>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
