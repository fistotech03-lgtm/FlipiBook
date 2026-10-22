import React from 'react';
import { Icon } from '@iconify/react';
import bookShowImg from '../../assets/Home/final-images/features/features-image.webp';

export default function ReadingExperienceDark({ onOpenCreateModal }) {
  const features = [
    {
      id: "models",
      title: "3D Models",
      desc: "Import realistic 3D models into your flipbook pages.",
      icon: "carbon:cube"
    },
    {
      id: "rotate",
      title: "360° Rotate",
      desc: "Rotate and explore every model from every angle.",
      icon: "mdi:rotate-360"
    },
    {
      id: "texture",
      title: "Texture Editor",
      desc: "Apply materials, textures, and realistic surface finishes.",
      icon: "material-symbols:texture"
    },
    {
      id: "lighting",
      title: "Lighting",
      desc: "Adjust lights, shadows, reflections, and scene ambience.",
      icon: "lucide:sun"
    },
    {
      id: "background",
      title: "Background Color",
      desc: "Customize popup backgrounds to match your brand style.",
      icon: "lucide:palette"
    }
  ];

  return (
    <section className="w-full bg-[#1b222c] text-white py-14 lg:py-[5.5vw] px-4 sm:px-8 lg:px-[6vw] font-poppins border-t border-gray-800">
      <div className="w-full mx-auto flex flex-col space-y-6">
        
        {/* Top Header Tag */}
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-400 uppercase">
            FEATURES
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-600"></div>
        </div>

        {/* 3-Column Grid: Left Copy & CTA | Center Open 3D Furniture Book | Right 5 Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column (col-span-4): Headings, Copy, Orange CTA */}
          <div className="lg:col-span-4 flex flex-col justify-center text-left space-y-4 lg:space-y-[1.2vw]">
            <h2 className="text-3xl sm:text-4xl lg:text-[3vw] font-bold text-white leading-[1.12] tracking-tight">
              Not Just Pages. <br />
              A <span className="text-[#ea7233]">3D</span> Reading <br />
              Experience.
            </h2>

            <p className="text-xs sm:text-sm lg:text-[0.85vw] text-gray-400 font-normal leading-relaxed max-w-[340px]">
              Transform static flipbooks into immersive experiences with realistic 3D objects, interactive hotspots, videos, audio, and smooth page transitions.
            </p>

            {/* Orange Button: Bring Your Products into 3D */}
            <div className="pt-2">
              <button
                onClick={() => onOpenCreateModal && onOpenCreateModal()}
                className="flex items-center gap-2.5 px-5 py-2.5 lg:px-[1.5vw] lg:py-[0.8vw] bg-[#ea7233] hover:bg-[#d96225] text-white rounded-md font-bold text-xs sm:text-sm lg:text-[0.85vw] shadow-lg shadow-orange-500/20 transition-all duration-300 active:scale-95 cursor-pointer group"
              >
                <span>Bring Your Products into 3D</span>
                <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Center Column (col-span-5): 3D Open Living Room Book Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[500px] lg:max-w-none">
              <img
                src={bookShowImg}
                alt="Modern Living Room 3D Catalogue with Lamp and Phone"
                className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column (col-span-3): 5 Feature Items with Circular Outline Icons */}
          <div className="lg:col-span-3 flex flex-col space-y-5 lg:space-y-[1.4vw] text-left">
            {features.map((item) => (
              <div key={item.id} className="flex items-start gap-3 group">
                {/* Circular Outline Icon */}
                <div className="w-9 h-9 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full border border-gray-600 bg-white/5 flex items-center justify-center text-gray-300 shrink-0 group-hover:border-[#ea7233] group-hover:text-[#ea7233] transition-colors">
                  <Icon icon={item.icon} className="w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw]" />
                </div>
                
                {/* Title & Description */}
                <div className="flex flex-col">
                  <h4 className="text-xs sm:text-sm lg:text-[0.9vw] font-bold text-white leading-tight group-hover:text-[#ea7233] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs lg:text-[0.72vw] text-gray-400 font-normal leading-snug mt-0.5">
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
