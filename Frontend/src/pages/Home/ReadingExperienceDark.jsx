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
    <section className="w-full bg-[#1e2022] text-white py-14 lg:py-[5.5vw] px-6 sm:px-10 lg:px-[6vw] font-poppins border-t border-gray-800">
      <div className="w-full mx-auto flex flex-col space-y-6">
        
        {/* Top Header Tag */}
        <div className="flex items-center gap-3">
          <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-300 uppercase">
            FEATURES
          </span>
          <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-500"></div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column (col-span-4): Headings, Copy, Orange CTA */}
          <div className="lg:col-span-4 flex flex-col justify-center text-left space-y-6 lg:space-y-[1.4vw] pr-0 lg:pr-2">
            <h2 className="text-3xl sm:text-5xl lg:text-[3.4vw] font-extrabold text-white leading-[1.12] tracking-tight">
              Not Just Pages. <br />
              A <span className="text-[#ea543a]">3D</span> Reading <br />
              Experience.
            </h2>

            <p className="text-xs sm:text-[13px] lg:text-[0.88vw] text-[#9ca3af] font-normal leading-relaxed max-w-[340px]">
              Transform static flipbooks into immersive experiences with realistic 3D objects, interactive hotspots, videos, audio, and smooth page transitions.
            </p>

            {/* Orange CTA Button */}
            <div className="pt-1">
              <button
                onClick={() => onOpenCreateModal && onOpenCreateModal()}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#ea543a] hover:bg-[#d6452e] text-white rounded-lg font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition-all duration-300 active:scale-95 cursor-pointer group"
              >
                <span>Bring Your Products into 3D</span>
                <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Center Column (col-span-5): 3D Open Living Room Book Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[580px] lg:max-w-none">
              <img
                src={bookShowImg}
                alt="Modern Living Room 3D Catalogue with Lamp and Phone"
                className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column (col-span-3): 5 Feature Items */}
          <div className="lg:col-span-3 flex flex-col space-y-5 lg:space-y-[1.3vw] text-left pl-0 lg:pl-3">
            {features.map((item) => (
              <div key={item.id} className="flex items-start gap-4 group">
                {/* Thin Circular Ring Container */}
                <div className="w-11 h-11 lg:w-[2.8vw] lg:h-[2.8vw] rounded-full border border-gray-400/90 bg-transparent flex items-center justify-center text-white shrink-0 group-hover:border-[#ea543a] group-hover:text-[#ea543a] transition-all">
                  <Icon icon={item.icon} className="w-[22px] h-[22px] lg:w-[1.4vw] lg:h-[1.4vw]" />
                </div>
                
                {/* Title & Description */}
                <div className="flex flex-col pt-0.5">
                  <h4 className="text-xs sm:text-[13px] lg:text-[0.9vw] font-bold text-white leading-tight mb-1 group-hover:text-[#ea543a] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] lg:text-[0.74vw] text-[#9ca3af] font-normal leading-normal max-w-[220px]">
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
