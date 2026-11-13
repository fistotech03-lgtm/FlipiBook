import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import heroBg from '../../assets/Features/3DEditor/3DEditor.webp';
import editor1Img from '../../assets/Features/3DEditor/3DEditor1.webp';
import editor2Img from '../../assets/Features/3DEditor/3DEditor2.webp';
import editor3Img from '../../assets/Features/3DEditor/3DEditor3.webp';

export default function ThreeDStudioEditorFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1 pb-12">
        {/* =========================================
            SECTION 1: HERO BANNER
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-30 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook 3D Studio Editor Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-4 sm:px-6 md:px-[3vw] pt-3 pb-4 md:py-[1.8vw]">
              {/* Back to Features Button */}
              <div className="mb-2.5 md:mb-3 ml-0 md:ml-[-4vw] mt-0 md:mt-[-0.8vw]">
                <button
                  type="button"
                  onClick={() => navigate('/features')}
                  className="inline-flex items-center gap-1.5 md:gap-[0.5vw] px-3 md:px-3.5 py-1.5 rounded-sm border border-gray-200 bg-white/90 text-gray-600 text-xs sm:text-sm md:text-[0.9vw] font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-xs hover:bg-white"
                >
                  <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5 md:w-[1vw] md:h-[1vw] text-gray-600" />
                  <span>Back to Features</span>
                </button>
              </div>

              <div className="w-full max-w-full md:max-w-[44vw] lg:max-w-[40vw]">
                {/* Tag */}
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-2 md:mb-[0.8vw]">
                  <span className="text-[11px] sm:text-xs md:text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    3D EDITOR
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Create, Customize <br className="hidden sm:inline" />
                  &amp; <span className="text-[#EA580C]">Render in 3D</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Design, edit, and customize 3D models with precise controls for materials, lighting, camera angles, and rendering.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:box" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    3D Model Customization
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sun" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Advanced Lighting Controls
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:camera" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Camera &amp; Render Settings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: 3-CARD SHOWCASE SECTION
        ========================================= */}
        <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <section className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 md:pb-14 text-center bg-white">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] tracking-tight">
                  Build, Control &amp; Export Your <span className="text-[#EA580C]">3D Assets</span>
                </h2>
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
            </div>
            <p className="text-xs sm:text-sm md:text-[14px] text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
                Create, customize, and export high-quality 3D assets with precise control over materials, lighting, and rendering.
              </p>
          </div>
        </section>

            {/* 3 Columns Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-5 items-stretch">
              
              {/* CARD 1: Material & Texture Customization (Image Top, Info Bottom) */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                {/* Visual Image */}
                <div className="w-full flex items-center justify-center">
                  <img
                    src={editor1Img}
                    alt="Material and Texture Customization"
                    className="w-full h-auto object-contain block rounded-xl"
                  />
                </div>

                {/* Text Content */}
                <div className="pt-4 sm:pt-5 bg-white flex-1 flex flex-col justify-start">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E293B] mb-2 leading-snug">
                    Material &amp; Texture Customization
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                    Fine-tune material properties with metallic, roughness, bump map, normal, and ambient occlusion sliders to achieve photorealistic surface reflections and textures.
                  </p>
                </div>
              </div>

              {/* CARD 2: Environment & Lighting Controls (Info Top, Image Bottom) */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                {/* Text Content at Top */}
                <div className="pb-4 sm:pb-5 bg-white flex-1 flex flex-col justify-start">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E293B] mb-2 leading-snug">
                    Environment &amp; Lighting Controls
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                    Set the atmosphere with Studio, Daylight, or Soft Box presets and sliders for rotation, brightness, blur, and opacity. Control sun shadows via a compass widget and customize active light positions, colors, intensity, and softness.
                  </p>
                </div>

                {/* Visual Image */}
                <div className="w-full flex items-center justify-center">
                  <img
                    src={editor2Img}
                    alt="Environment and Lighting Controls"
                    className="w-full h-auto object-contain block rounded-xl"
                  />
                </div>
              </div>

              {/* CARD 3: Camera Setup & Export Options (Image Top, Info Bottom) */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                {/* Visual Image */}
                <div className="w-full flex items-center justify-center">
                  <img
                    src={editor3Img}
                    alt="Camera Setup and Export Options"
                    className="w-full h-auto object-contain block rounded-xl"
                  />
                </div>

                {/* Text Content */}
                <div className="pt-4 sm:pt-5 bg-white flex-1 flex flex-col justify-start">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E293B] mb-2 leading-snug">
                    Camera Setup &amp; Export Options
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                    Frame exact camera angles using spatial coordinates, preset or Hex backgrounds, and aspect ratios. Save custom views to your preview gallery and export high-quality renders.
                  </p>
                </div>
              </div>

            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
