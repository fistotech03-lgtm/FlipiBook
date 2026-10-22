import React from 'react';
import aboutUsImg from '../../assets/Home/final-images/about-us/about-us-image.png';

export default function AboutUsSection() {
  return (
    <section className="w-full bg-[#E2E2E2] font-poppins relative overflow-hidden select-none pt-6 sm:pt-8 lg:pt-[2.4vw] pb-4 sm:pb-6 lg:pb-0">
      
      {/* Top Header Tag: Guaranteed above all graphics */}
      <div className="w-full px-5 sm:px-8 lg:px-[4.5vw] mb-3 sm:mb-4 lg:mb-[1vw] flex items-center gap-3 relative z-30">
        <span className="text-[11px] sm:text-xs lg:text-[0.82vw] font-bold tracking-[0.25em] text-[#222428] uppercase">
          ABOUT US
        </span>
        <div className="w-8 sm:w-10 lg:w-[2.8vw] h-[1.5px] bg-[#8d9095]"></div>
      </div>

      {/* Main Section Content Area */}
      <div className="w-full relative min-h-[420px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[40vw] xl:min-h-[42vw] max-h-[820px] flex items-start">
        
        {/* Left 3D Monitor on Black Rock Display: Responsively grounded and aligned */}
        <div className="absolute inset-x-0 bottom-0 top-0 w-full flex items-end justify-start pointer-events-none z-0">
          <img
            src={aboutUsImg}
            alt="Flipibook Interactive 3D Catalogue Platform"
            className="w-full max-w-[1100px] sm:max-w-[1300px] md:max-w-[1450px] lg:max-w-[1650px] xl:max-w-[1850px] max-h-[420px] sm:max-h-[490px] md:max-h-[550px] lg:max-h-[42vw] xl:max-h-[720px] h-auto object-contain object-left-bottom block -ml-2 sm:-ml-3 lg:-ml-[1vw]"
          />
        </div>

        {/* Right-aligned Content Layer */}
        <div className="relative z-20 w-full flex flex-col items-end text-right px-5 sm:px-8 lg:px-[4.8vw] pt-2 sm:pt-4 lg:pt-[1.5vw] pointer-events-auto">
          <div className="max-w-[360px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[32vw] flex flex-col items-end">
            
            {/* Headline Group */}
            <div className="flex flex-col items-end">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.2vw] xl:text-[4.5vw] font-bold text-[#0D0F11] tracking-tight leading-[0.98] block">
                We
              </span>
              
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.2vw] xl:text-[4.5vw] font-bold tracking-tight leading-[0.98] block my-0.5 lg:my-[0.1vw]"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1.2px #9ba0a6',
                  textStroke: '1.2px #9ba0a6',
                }}
              >
                Transform
              </h2>

              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.2vw] xl:text-[4.5vw] font-bold text-[#0D0F11] tracking-tight leading-[0.98] block">
                Digital Ideas
              </span>
            </div>

            {/* Separator Line */}
            <div className="w-20 sm:w-28 lg:w-[12vw] h-[1px] bg-[#a8acb1] my-2.5 sm:my-3 lg:my-[0.9vw]"></div>

            {/* Narrative Paragraphs */}
            <div className="space-y-2.5 sm:space-y-3 lg:space-y-[0.6vw] text-xs sm:text-[13px] lg:text-[0.84vw] xl:text-[0.88vw] text-[#2b2e34] font-normal leading-[158%] max-w-[320px] sm:max-w-[370px] lg:max-w-[25vw]">
              <p>
                Flipibook by FIST-O Tech Pvt Ltd transforms static catalogues into Interactive Digital Experiences through IDC, AR/VR/MR, 2D/3D Animation, 3D Website design, Custom web and Mobile app development.
              </p>
              <p>
                We help businesses showcase products, simplify ideas, and engage audiences through innovative digital solutions.
              </p>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}

