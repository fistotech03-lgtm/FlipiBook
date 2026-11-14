import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

// Layout Feature Assets
import heroBg from '../../assets/Features/Layout/Layout.webp';
import layout1Img from '../../assets/Features/Layout/Layout1.webp';
import layout2Img from '../../assets/Features/Layout/Layout2.webp';
import layout3Img from '../../assets/Features/Layout/Layout3.webp';
import layout4Img from '../../assets/Features/Layout/Layout4.webp';
import layout5Img from '../../assets/Features/Layout/Layout5.webp';

export default function LayoutFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1 pb-4">
        {/* =========================================
            SECTION 1: HERO BANNER (Personalize Your Flipbook Experience)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop banner background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-25 md:opacity-100">
              <img
                src={heroBg}
                alt="Personalize Your Flipbook Experience"
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
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-2 md:mb-[0.8vw]">
                  <span className="text-[11px] sm:text-xs md:text-[0.72vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    CUSTOMIZATION
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Personalize Your <br className="hidden sm:inline" />
                  <span className="text-[#EA580C]">Flipbook Experience</span>
                </h1>

                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Design and brand customize 3D interactive flipbooks with rich tools for materials, lighting, custom badges, and branding.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Design &amp; Brand
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:layout" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Layout Control
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sliders" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Smart Features
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:share-2" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Share &amp; Embed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Sub-Header / Divider */}
        <section className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 md:pb-14 text-center bg-white">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] tracking-tight">
                Customize, Preview &amp; <span className="text-[#EA580C]">Publish</span>
              </h2>
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
            </div>
            <p className="text-xs sm:text-sm md:text-[14px] text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
              Everything you need to create a unique, branded flipbook in one place.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 2: BOOK APPEARANCE (Layout1)
        ========================================= */}
        <section className="relative w-full py-8 md:py-12">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[3.5vw] items-center">
              {/* Left Column: Image preview grid */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="w-full flex justify-center items-center transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={layout1Img}
                    alt="Book Appearance styles - Soft page flip, Hard cover flip, Auto flip, Drag to flip"
                    className="w-full max-h-[380px] md:max-h-[440px] lg:max-h-[460px] object-contain drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    BOOK STYLES
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Book <span className="text-[#EA580C]">Appearance</span>
                </h2>
                <p className="mt-2 md:mt-[0.8vw] text-xs sm:text-sm md:text-[0.92vw] text-[#64748B] leading-relaxed">
                  Choose a page-flipping style: Soft cover, Hard cover, Auto-flip, and Drag-to-flip. Make your book engaging for the audience.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-5 md:mt-[1.6vw] space-y-4 md:space-y-[1.2vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:file-text" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Soft Page Flip
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Create smooth realistic page-curling animations that replicate the natural movement of paper pages.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:book" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Hard Cover Flip
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Give your catalogue a premium appearance with realistic hardcover opening and closing effects.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:play-circle" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Auto-Page Flip
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Automatically turn pages at a customizable speed for convenient, hands-free catalogue browsing.
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:hand" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Drag-to-Flip
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Grab and drag page corners to turn pages naturally, providing an interactive tactile reading experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: THEMES & LAYOUT (Layout2)
        ========================================= */}
        <section className="relative w-full py-8 md:py-12 bg-white/60">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[3.5vw] items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    CUSTOMIZATION
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Themes &amp; <span className="text-[#EA580C]">Layout</span>
                </h2>
                <p className="mt-2 md:mt-[0.8vw] text-xs sm:text-sm md:text-[0.92vw] text-[#64748B] leading-relaxed">
                  Personalize your flipbook background with attractive themes, adjust toolbar items, and choose viewing options for audience convenience.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-5 md:mt-[1.6vw] space-y-4 md:space-y-[1.2vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:palette" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Multiple Themes
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Choose from modern, classic, and minimal design themes.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:layout-template" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Flexible Layouts
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Select layouts for different catalogue formats and content types.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:paintbrush" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Brand Styling
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Customize colors, fonts, backgrounds, and viewer aesthetics.
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:layout-grid" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Interactive Controls
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Enable zoom, thumbnails, and quick page navigation buttons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Mockup */}
              <div className="lg:col-span-7 flex justify-center items-center order-1 lg:order-2">
                <div className="w-full flex justify-center items-center transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={layout2Img}
                    alt="Themes & Layout custom controls on flipbook device"
                    className="w-full max-h-[380px] md:max-h-[440px] lg:max-h-[460px] object-contain drop-shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: LEAD GENERATION (Layout3)
        ========================================= */}
        <section className="relative w-full py-8 md:py-12">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[3.5vw] items-center">
              {/* Left Column: Form Mockups */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="w-full flex justify-center items-center transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={layout3Img}
                    alt="Lead Generation interactive forms preview"
                    className="w-full max-h-[380px] md:max-h-[440px] lg:max-h-[460px] object-contain drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    ENGAGEMENT &amp; LEADS
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Lead <span className="text-[#EA580C]">Generation</span>
                </h2>
                <p className="mt-2 md:mt-[0.8vw] text-xs sm:text-sm md:text-[0.92vw] text-[#64748B] leading-relaxed">
                  Turn every flipbook into a high-converting lead generation engine by capturing viewer inquiries directly inside your digital catalogue.
                </p>

                {/* Feature Bullet List */}
                <div className="mt-5 md:mt-[1.6vw] space-y-4 md:space-y-[1.2vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:sparkles" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Predefined Templates
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Launch ready-to-use lead capture forms across your document in seconds using a simple master toggle.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:edit-3" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Full Design Customization
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Match the form's colors, fonts, and layout seamlessly to your brand identity and catalogue theme.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:sliders-horizontal" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Custom Data Fields
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Tailor your fields to capture the exact data you require, tailored specifically to your exact team needs.
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:shopping-bag" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Product List Integration
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Embed your product catalog directly in the form so prospects can select specific items and information while submitting their inquiry.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: VISIBILITY & PRIVACY (Layout4)
        ========================================= */}
        <section className="relative w-full py-6 md:py-8 bg-white/60">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-[3.5vw] items-center">
              {/* Left Column: Header + 2x2 Numbered Grid (01, 02, 03, 04) */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                {/* Header */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1">
                    <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                      ACCESS &amp; SECURITY
                    </span>
                    <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                    Visibility &amp; <span className="text-[#EA580C]">Privacy</span>
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm md:text-[0.92vw] text-[#64748B] max-w-xl leading-relaxed">
                    Control who can access your catalog with flexible privacy settings, secure sharing options, and customizable permissions.
                  </p>
                </div>

                {/* 2x2 Numbered Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-5">
                  {/* 01 */}
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl md:text-[2.2vw] font-bold text-[#111827] tracking-tight leading-none mb-1">
                      01
                    </span>
                    <h4 className="text-sm sm:text-base md:text-[0.98vw] font-bold text-[#1E293B] mb-1">
                      Privacy &amp; Control
                    </h4>
                    <p className="text-xs sm:text-sm md:text-[0.82vw] text-[#64748B] leading-relaxed">
                      Manage availability effortlessly with options to make your publication public or keep your content private.
                    </p>
                  </div>

                  {/* 02 */}
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl md:text-[2.2vw] font-bold text-[#111827] tracking-tight leading-none mb-1">
                      02
                    </span>
                    <h4 className="text-sm sm:text-base md:text-[0.98vw] font-bold text-[#1E293B] mb-1">
                      Public Reach &amp; Engagement
                    </h4>
                    <p className="text-xs sm:text-sm md:text-[0.82vw] text-[#64748B] leading-relaxed">
                      Publish publicly to maximize discovery, letting viewers view, share, refer, bookmark, follow your profile, and receive notifications for updates.
                    </p>
                  </div>

                  {/* 03 */}
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl md:text-[2.2vw] font-bold text-[#111827] tracking-tight leading-none mb-1">
                      03
                    </span>
                    <h4 className="text-sm sm:text-base md:text-[0.98vw] font-bold text-[#1E293B] mb-1">
                      Password-Protected Access
                    </h4>
                    <p className="text-xs sm:text-sm md:text-[0.82vw] text-[#64748B] leading-relaxed">
                      Secure sensitive pieces: set a password that viewers are client prompted to input so only authorized readers can open the page.
                    </p>
                  </div>

                  {/* 04 */}
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl md:text-[2.2vw] font-bold text-[#111827] tracking-tight leading-none mb-1">
                      04
                    </span>
                    <h4 className="text-sm sm:text-base md:text-[0.98vw] font-bold text-[#1E293B] mb-1">
                      Email-Specific &amp; Expiring Links
                    </h4>
                    <p className="text-xs sm:text-sm md:text-[0.82vw] text-[#64748B] leading-relaxed">
                      Grant private access exclusively to selected email addresses and set automatic expiration times to revoke reading permission whenever time is due.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Protected Laptop Visual Mockup */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="w-full flex justify-center items-center transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={layout4Img}
                    alt="Privacy and Access Control laptop illustration with shield"
                    className="w-full max-h-[340px] md:max-h-[380px] lg:max-h-[400px] object-contain drop-shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 6: EXPORT & SHARE (Layout5)
        ========================================= */}
        <section className="relative w-full py-4 md:py-6">
          <div className="max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-[3.5vw] items-center">
              {/* Left Column: Laptop with share/export dialog */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="w-full flex justify-center items-center transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={layout5Img}
                    alt="Export and share options on flipbook application"
                    className="w-full max-w-[420px] max-h-[190px] sm:max-h-[220px] md:max-h-[240px] lg:max-h-[260px] object-contain drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-[0.5vw] mb-1.5 md:mb-[0.6vw]">
                  <span className="text-xs md:text-[0.85vw] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
                    DISTRIBUTION
                  </span>
                  <span className="w-8 md:w-[2.2vw] h-[2px] bg-[#EA580C]"></span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Export &amp; <span className="text-[#EA580C]">Share</span>
                </h2>

                <div className="mt-4 md:mt-[1.2vw] space-y-3.5 md:space-y-[1vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:download" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        High-Resolution PDF Export
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Save a crisp and beautifully copy of your flipbook for offline access and printing.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3.5 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.4vw] md:h-[2.4vw] rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:share-2" className="w-4 h-4 md:w-[1.2vw] md:h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[0.98vw] font-semibold text-[#1E293B]">
                        Instant Digital Sharing
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.84vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Share seamless via direct URL link, responsive QR code, or one-click social media posting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
