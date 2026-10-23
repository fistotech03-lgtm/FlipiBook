import React from 'react';
import { Icon } from '@iconify/react';
import bookShowImg from '../../assets/Home/final-images/features/features-image.webp';

export default function ReadingExperienceDark({ onOpenCreateModal }) {
  const features = [
    {
      id: "models",
      title: "3D Models",
      desc: "Import realistic 3D models into your flipbook pages.",
      icon: "lets-icons:3d-box-light"
    },
    {
      id: "rotate",
      title: "360° Rotate",
      desc: "Rotate and explore every model from every angle.",
      icon: "teenyicons:360-outline"
    },
    {
      id: "texture",
      title: "Texture Editor",
      desc: "Apply materials, textures, and realistic surface finishes.",
      icon: "streamline-flex:texture"
    },
    {
      id: "lighting",
      title: "Lighting",
      desc: "Adjust lights, shadows, reflections, and scene ambience.",
      icon: "entypo:light-up"
    },
    {
      id: "background",
      title: "Background Color",
      desc: "Customize popup backgrounds to match your brand style.",
      icon: "arcticons:removebg"
    }
  ];

  return (
    <section className="w-full bg-[#252728] text-white py-14 lg:py-[5.2vw] px-6 sm:px-10 lg:px-[5.2vw] font-poppins border-t border-gray-800 overflow-hidden relative">
      <div className="w-full mx-auto flex flex-col space-y-6 lg:space-y-[2.6vw]">
        
        {/* Top Header Tag */}
        <div className="flex items-center gap-4 lg:gap-[1vw]">
          <span className="text-xs lg:text-[0.72vw] font-bold tracking-[0.25em] text-[#d1d5db] uppercase">
            FEATURES
          </span>
          <div className="w-10 lg:w-[2.6vw] h-[1.5px] lg:h-[0.1vw] bg-[#6b7280]"></div>
        </div>

        {/* 
          Main Content Container:
          - Mobile / Tablet (<1024px): Standard responsive flex/grid with relative flow
          - Desktop (>=1024px): Relative parent with 2-column flanking layout (Left text & Right features)
            and the Center 3D Book Graphic precisely positioned with absolute coordinates!
        */}
        <div className="relative w-full min-h-0 lg:min-h-[38vw] flex flex-col lg:flex-row lg:items-center lg:justify-between">
          
          {/* Left Column: Headings, Copy, Orange CTA */}
          <div className="w-full lg:w-[23vw] flex flex-col justify-center text-left space-y-6 lg:space-y-[1.8vw] z-20 relative pointer-events-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-[3vw] lg:leading-[4.5vw] font-bold text-white leading-[1.08] tracking-tight">
              Not Just Pages. <br />
              A <span className="text-[#EC5137]">3D</span> Reading <br />
              Experience.
            </h2>

            <p className="text-sm sm:text-base lg:text-[0.95vw] text-[#A6ABB3] lg:text-[#D9D9D9] font-normal leading-[1.6] max-w-[360px] lg:max-w-none lg:w-[13vw]">
              Transform static flipbooks into immersive experiences with realistic 3D objects, interactive hotspots, videos, audio, and smooth page transitions.
            </p>

            {/* Orange CTA Button */}
            <div className="pt-2 lg:pt-[0.3vw]">
              <button
                onClick={() => onOpenCreateModal && onOpenCreateModal()}
                className="inline-flex items-center gap-2.5 lg:gap-[0.55vw] px-6 py-3.5 lg:px-[1.65vw] lg:py-[0.85vw] bg-[#EA6229] hover:bg-[#d8551f] text-white rounded-lg lg:rounded-[0.5vw] font-semibold text-sm sm:text-[15px] lg:text-[0.88vw] shadow-md shadow-orange-900/30 transition-all duration-300 active:scale-95 cursor-pointer group"
              >
                <span>Bring Your Products into 3D</span>
                <Icon icon="lucide:arrow-right" className="w-4 h-4 lg:w-[0.95vw] lg:h-[0.95vw] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 
            Center 3D Book Graphic:
            - Desktop: Absolute positioning pinned directly with left: 40vw, top: 19vw, width: 44vw!
            - Tablet/Mobile: Relative flow centered between top and bottom
          */}
          <div className="relative lg:absolute lg:left-[40vw] lg:top-[19vw] lg:-translate-x-1/2 lg:-translate-y-1/2 w-full max-w-[620px] lg:max-w-none lg:w-[44vw] flex items-center justify-center my-6 lg:my-0 z-10 pointer-events-none">
            <img
              src={bookShowImg}
              alt="Modern Living Room 3D Catalogue with Lamp and Phone"
              className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.75)] hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          {/* Right Column: 5 Feature Items */}
          <div className="w-full lg:w-[22vw] flex flex-col space-y-6 lg:space-y-[1.4vw] text-left z-20 relative pointer-events-auto">
            {features.map((item) => (
              <div key={item.id} className="flex items-center gap-4 lg:gap-[1vw] group">
                {/* Circular Ring Container */}
                <div className="w-12 h-12 lg:w-[3vw] lg:h-[3vw] rounded-full border border-white/80 bg-transparent flex items-center justify-center text-white shrink-0 group-hover:border-[#EA6229] group-hover:text-[#EA6229] transition-all">
                  <Icon icon={item.icon} className="w-6 h-6 lg:w-[1.45vw] lg:h-[1.45vw] text-white group-hover:text-[#EA6229]" />
                </div>
                
                {/* Title & Description */}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-sm sm:text-base lg:text-[1.05vw] font-bold text-white leading-tight mb-1 lg:mb-[0.25vw] group-hover:text-[#EA6229] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs lg:text-[0.8vw] text-[#9ca3af] lg:text-[#a0a5ad] font-normal leading-normal max-w-[210px] lg:max-w-none">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
