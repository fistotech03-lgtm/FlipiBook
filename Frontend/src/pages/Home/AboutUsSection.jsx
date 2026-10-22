import React from 'react';
import aboutUsImg from '../../assets/Home/final-images/about-us/about-us-image.png';

export default function AboutUsSection() {
  return (
    <section className="w-full bg-[#E2E2E2] font-poppins relative overflow-hidden select-none pb-4 lg:pb-0">
      
      {/* Top Header Tag */}
      <div className="w-full px-5 sm:px-8 lg:px-[4.5vw] pt-5 sm:pt-6 lg:pt-[2.2vw] pb-1 flex items-center gap-3 relative z-20">
        <span className="text-[11px] sm:text-xs lg:text-[0.82vw] font-bold tracking-[0.25em] text-[#222428] uppercase">
          ABOUT US
        </span>
        <div className="w-8 sm:w-10 lg:w-[2.8vw] h-[1.5px] bg-[#8d9095]"></div>
      </div>

      {/* Main Visual & Content Container (Compact height to prevent excessive scrolling) */}
      <div className="w-full relative min-h-[440px] sm:min-h-[500px] lg:min-h-[42vw] xl:min-h-[44vw] max-h-[780px]">
        
        {/* Left-aligned Proportional 3D Monitor on Black Rock Display */}
        <div className="absolute inset-x-0 bottom-0 top-0 w-full flex items-end justify-start pointer-events-none z-0">
          <img
            src={aboutUsImg}
            alt="Flipibook Interactive 3D Catalogue Platform"
            className="w-full max-w-[1500px] xl:max-w-[1680px] max-h-[450px] sm:max-h-[530px] lg:max-h-[41vw] xl:max-h-[660px] h-auto object-contain object-left-bottom block -ml-2 sm:-ml-4 lg:-ml-[1.5vw]"
          />
        </div>

        {/* Right-aligned Content Layer */}
        <div className="relative z-10 w-full flex flex-col items-end text-right px-5 sm:px-8 lg:px-[4.8vw] pt-1 sm:pt-2 lg:pt-[0.8vw] pointer-events-auto">
          <div className="max-w-[400px] sm:max-w-[460px] lg:max-w-[32vw] flex flex-col items-end">
            
            {/* Headline Group */}
            <div className="flex flex-col items-end">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.4vw] xl:text-[4.6vw] font-bold text-[#0D0F11] tracking-tight leading-[0.98] block">
                We
              </span>
              
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.4vw] xl:text-[4.6vw] font-bold tracking-tight leading-[0.98] block my-0.5 lg:my-[0.1vw]"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1.2px #9ba0a6',
                  textStroke: '1.2px #9ba0a6',
                }}
              >
                Transform
              </h2>

              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.4vw] xl:text-[4.6vw] font-bold text-[#0D0F11] tracking-tight leading-[0.98] block">
                Digital Ideas
              </span>
            </div>

            {/* Separator Line */}
            <div className="w-20 sm:w-28 lg:w-[12vw] h-[1px] bg-[#a8acb1] my-2.5 sm:my-3 lg:my-[0.9vw]"></div>

            {/* Narrative Paragraphs */}
            <div className="space-y-2.5 sm:space-y-3 lg:space-y-[0.6vw] text-xs sm:text-[13px] lg:text-[0.85vw] xl:text-[0.88vw] text-[#2b2e34] font-normal leading-[158%] max-w-[320px] sm:max-w-[380px] lg:max-w-[25vw]">
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

