import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from './Footer';

// Asset imports
import heroBg from '../assets/Features/Feature.webp';
import imgMock from '../assets/Features/img.webp';
import imgBgLeaves from '../assets/Features/imgbg.webp';
import vdoMock from '../assets/Features/vdo.webp';
import vdoBgReel from '../assets/Features/vdobg.webp';
import threeDMock from '../assets/Features/3d.webp';
import threeDBgGeom from '../assets/Features/3dbg.webp';

export default function Features() {
  const navigate = useNavigate();

  const handleStartConverting = () => {
    navigate('/converter');
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (Converter & Compress)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center">
              <img
                src={heroBg}
                alt="FlipiBook Converter Preview"
                className="w-full h-full object-contain object-right"
              />
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 w-full max-w-[94vw] mx-auto px-[3vw] py-[2vw]">
              <div className="max-w-[40vw]">
                <div className="flex items-center gap-[0.5vw] mb-[0.8vw]">
                  <span className="text-[0.72vw] font-bold tracking-[0.22em] text-[#94A3B8] uppercase">
                    CONVERTER
                  </span>
                  <span className="w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                <h1 className="text-[3.2vw] font-bold tracking-tight text-[#111827] leading-[1.12]">
                  Convert &amp; Compress <br />
                  <span className="text-[#EA580C]">Your Media</span>
                </h1>

                <p className="mt-[0.9vw] text-[0.86vw] text-[#64748B] leading-relaxed max-w-[34vw]">
                  Convert and compress images, videos, and 3D models with easy-to-use tools and optimized output quality.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-[0.6vw] mt-[1.4vw]">
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Fast Conversion
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-[0.4vw] px-[0.9vw] py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-[0.9vw] h-[0.9vw] text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* =========================================
            SECTION 2: IMAGE CONVERTER & COMPRESSOR
        ========================================= */}
        <section className="relative w-full py-[1.5vw] overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80">
          {/* Subtle floral background element */}
          <div className="absolute right-0 top-[17vw] -translate-y-1/2 pointer-events-none select-none z-0 max-w-[25vw] opacity-70">
            <img src={imgBgLeaves} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[92vw] mx-auto px-[2vw]">
            <div className="grid grid-cols-6 lg:grid-cols-10 gap-[2.5vw] items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-4 flex flex-col justify-center">
                <span className="text-[0.85vw] font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-[0.6vw]">
                  IMAGE CONVERTER
                </span>
                <h2 className="text-[2.3vw] font-bold tracking-tight text-[#111827] leading-[1.2]">
                  Image Converter <br />
                  <span className="text-[#EA580C]">&amp; Compressor</span>
                </h2>
                <p className="mt-[0.9vw] text-[0.95vw] text-[#64748B] leading-relaxed">
                  Convert, compress, and optimize your images for maximum visual quality and small file sizes.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-[1.8vw] space-y-[1.2vw]">
                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:shuffle" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Multi-Format Conversion
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Convert your images to WEBP, PNG, and JPEG formats with one click.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:minimize-2" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Smart Image Compression
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Reduce image file sizes with flexible compression options.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:sliders" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Image Resolution Details
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Keep original aspect ratios or scale resolutions dynamically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:sparkles" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Background Removal
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Remove unwanted backgrounds instantly with an automatic toggle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download-cloud" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Easy File Conversion
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Convert and download optimized assets ready for instant publication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase (70%) */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full rounded-[1vw] bg-white p-[0.9vw] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={imgMock}
                    alt="Image Converter & Compressor Interface"
                    className="w-full h-auto rounded-[0.6vw] object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: VIDEO CONVERTER & COMPRESSOR
        ========================================= */}
        <section className="relative w-full py-[1.5vw] overflow-hidden bg-[#F8FAFC]">
          {/* Subtle film reel background element */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 max-w-[16vw] opacity-70">
            <img src={vdoBgReel} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[92vw] mx-auto px-[2vw]">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-10 gap-[2.5vw] items-center">
              {/* Left Column: UI Mockup Showcase (70%) */}
              <div className="w-full lg:col-span-6 flex justify-center lg:justify-start">
                <div className="relative w-full rounded-[1vw] bg-white p-[0.9vw] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={vdoMock}
                    alt="Video Converter & Compressor Interface"
                    className="w-full h-auto rounded-[0.6vw] object-contain shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="w-full lg:col-span-4 flex flex-col justify-center">
                <span className="text-[0.85vw] font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-[0.6vw]">
                  VIDEO CONVERTER
                </span>
                <h2 className="text-[2.3vw] font-bold tracking-tight text-[#111827] leading-[1.2]">
                  Video Converter <br />
                  <span className="text-[#EA580C]">&amp; Compressor</span>
                </h2>
                <p className="mt-[0.9vw] text-[0.95vw] text-[#64748B] leading-relaxed">
                  Optimize your videos with flexible format and resolution options to ensure seamless and fast loading.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-[1.8vw] space-y-[1.2vw]">
                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:arrow-left-right" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Multiple Formats
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Convert your video into MP4 and WEBM formats with high fidelity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:bar-chart-2" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Smart Compression
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Reduce video file sizes with flexible bitrate compression options.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:layers" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Resolution Settings
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Choose from 1080p, 720p, or 480p resolution presets effortlessly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:play-circle" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Video Preview
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Preview your videos between conversions to verify output quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:check-circle" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Easy Conversion
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Convert and compress or optimize videos in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: 3D MODEL CONVERTER & COMPRESSOR
        ========================================= */}
        <section className="relative w-full py-[1.5vw] overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80 ">
          {/* Geometric 3D wireframe background element */}
          <div className="absolute right-0 bottom-0 pointer-events-none select-none z-0 max-w-[28vw] opacity-75">
            <img src={threeDBgGeom} alt="" className="w-full h-auto object-contain" />
          </div>

          <div className="relative z-10 max-w-[92vw] mx-auto px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-[2.5vw] items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-4 flex flex-col justify-center">
                <span className="text-[0.85vw] font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-[0.6vw]">
                  3D MODEL CONVERTER
                </span>
                <h2 className="text-[2.3vw] font-bold tracking-tight text-[#111827] leading-[1.2]">
                  3D Model Converter <br />
                  <span className="text-[#EA580C]">&amp; Compressor</span>
                </h2>
                <p className="mt-[0.9vw] text-[0.95vw] text-[#64748B] leading-relaxed">
                  Convert and optimize your 3D models for faster loading, efficient storage, and seamless interactive experience.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-[1.8vw] space-y-[1.2vw]">
                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:box" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Multi-Format Conversion
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Convert your 3D models into GLB, GLTF, and OBJ formats seamlessly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:bar-chart-2" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Smart Compression
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Optimize your 3D models with Draco texture and mesh compression.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:cpu" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Polygon Optimization
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Reduce polygon counts to improve model loading performance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:eye" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        3D Model Preview
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Inspect and rotate your 3D models in 360° before converting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-[0.9vw]">
                    <div className="w-[2.6vw] h-[2.6vw] rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download" className="w-[1.3vw] h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-[1.02vw] font-bold text-[#1E293B]">
                        Easy Model Conversion
                      </h4>
                      <p className="text-[0.85vw] text-[#64748B] mt-[0.15vw]">
                        Convert and download optimized 3D models in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase (70%) */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full rounded-[1vw] bg-white p-[0.9vw] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <img
                    src={threeDMock}
                    alt="3D Model Converter & Compressor Interface"
                    className="w-full h-auto rounded-[0.6vw] object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: BOTTOM CALL TO ACTION (CTA)
        ========================================= */}
        <section className="relative w-full py-[3vw] bg-white border-t border-[#F1F5F9]">
          <div className="max-w-[92vw] mx-auto px-[2vw]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-[2vw]">
              <div className="max-w-[44vw]">
                <span className="text-[0.72vw] font-bold tracking-[0.22em] text-[#94A3B8] uppercase block mb-[0.6vw]">
                  READY TO CONVERT?
                </span>
                <h3 className="text-[2vw] font-semibold tracking-tight text-[#111827] leading-[1.18]">
                  Make Your Media Lighter. <br />
                  Make Your <span className="text-[#EA580C]">Experience Better.</span>
                </h3>
                <p className="mt-[0.8vw] text-[0.82vw] text-[#64748B] leading-relaxed max-w-[34vw]">
                  Optimize images, videos, and 3D models for faster loading, efficient storage, and high-quality digital experiences.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleStartConverting}
                  className="inline-flex items-center gap-[0.7vw] px-[1.5vw] py-[0.6vw] rounded-full bg-black hover:bg-[#111827] text-white text-[0.82vw] font-medium tracking-wide transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span>Start Converting Now</span>
                  <span className="w-[1.4vw] h-[1.4vw] rounded-full bg-white text-black flex items-center justify-center shrink-0">
                    <Icon
                      icon="lucide:arrow-up-right"
                      className="w-[0.8vw] h-[0.8vw] stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================
          GLOBAL FOOTER
      ========================================= */}
      <Footer />
    </div>
  );
}
