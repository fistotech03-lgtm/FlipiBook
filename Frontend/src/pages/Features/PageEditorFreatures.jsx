import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

// Asset imports
import heroBg from '../../assets/Features/PageEditor/PageEditor.webp';
import mediaIntegrationMock from '../../assets/Features/PageEditor/PageEditor1.webp';
import interactiveElementsMock from '../../assets/Features/PageEditor/PageEditor2.webp';
import animationsMock from '../../assets/Features/PageEditor/PageEditor3.webp';

export default function PageEditorFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden selection:bg-[#EA580C]/10 selection:text-[#EA580C]">
      <main className="w-full flex-1">
        {/* =========================================
            SECTION 1: HERO (Editor Banner)
        ========================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#F6F6F6] from-50% to-[#E9E5F2]">
          {/* Top Banner / Laptop Floating Background */}
          <div className="relative w-full max-w-[100vw] mx-auto flex items-center">
            {/* The laptop + rock 3D illustration background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none flex justify-end items-center opacity-30 md:opacity-100">
              <img
                src={heroBg}
                alt="FlipiBook Page Editor Preview"
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
                    EDITOR
                  </span>
                  <span className="w-8 md:w-[2.5vw] h-[1.5px] bg-[#CBD5E1]"></span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-[3.2vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.12]">
                  Turn Flat Catalogs <br className="hidden sm:inline" />
                  Into <span className="text-[#EA580C]">Interactive</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2 md:mt-[0.9vw] text-xs sm:text-sm md:text-[0.86vw] text-[#64748B] leading-relaxed max-w-full md:max-w-[34vw]">
                  Bring pages to life with hotspots, buttons, QR codes, slideshows, and forms built to engage and convert.
                </p>

                {/* Pill Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-[0.6vw] mt-3.5 md:mt-[1.4vw]">
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Fast Conversion
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:badge-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    High Quality Output
                  </span>
                  <span className="inline-flex items-center gap-1.5 md:gap-[0.4vw] px-2.5 sm:px-3 md:px-[0.9vw] py-1 md:py-[0.4vw] rounded-full bg-white/95 border border-[#E2E8F0] shadow-xs text-xs md:text-[0.74vw] font-medium text-[#475569]">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 md:w-[0.9vw] md:h-[0.9vw] text-[#EA580C]" />
                    Secure &amp; Private
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: CENTER HEADING BANNER
        ========================================= */}
        <section className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 md:pb-14 text-center bg-white">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] tracking-tight">
                Turn Every Page into an Interactive Experience
              </h2>
              <span className="w-8 sm:w-14 h-[2.5px] bg-[#EA580C] rounded-full inline-block shrink-0"></span>
            </div>
            <p className="text-xs sm:text-sm md:text-[14px] text-[#64748B] mt-2 max-w-2xl mx-auto leading-relaxed">
              Create engaging digital catalogues that get 3x more attention than static PDFs and turn interest into real business inquiries.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: MEDIA INTEGRATION
        ========================================= */}
        <section className="relative w-full py-8 md:py-[1.5vw] overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80">
          <div className="relative z-10 max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-10 gap-6 lg:gap-[2.5vw] items-center">
              {/* Left Column: UI Mockup Showcase (lg:col-span-6) */}
              <div className="w-full lg:col-span-6 flex justify-center lg:justify-start mt-4 lg:mt-0">
                <div className="relative w-full max-w-[460px] flex justify-center lg:justify-start">
                  <img
                    src={mediaIntegrationMock}
                    alt="Media Integration in Page Editor"
                    className="w-full max-h-[300px] md:max-h-[340px] lg:max-h-[360px] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
                  />
                </div>
              </div>

              {/* Right Column: Details (lg:col-span-4) */}
              <div className="w-full lg:col-span-4 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Media Integration
                </h2>

                {/* Feature Bullet List */}
                <div className="mt-4 md:mt-[1.8vw] space-y-3.5 md:space-y-[1.2vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:play" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Interactivity:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Enhance static pages by inserting videos, GIFs, vector icons, and audio clips.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:image" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Images &amp; Video &amp; Audio Embedding:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Native support for rich media to playback directly on the published experience.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:box" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Interactive 3D &amp; Web AR Previews:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Embed rotatable 3D container models and mobile AR triggers right inside product spreads so buyers can inspect lid seals, handle grip, and print finishes from every angle.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: INTERACTIVE ELEMENTS
        ========================================= */}
        <section className="relative w-full py-8 md:py-[1.5vw] overflow-hidden bg-[#F8FAFC]">
          <div className="relative z-10 max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-[2.5vw] items-center">
              {/* Left Column: Details (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Interactive Elements
                </h2>

                {/* Feature Bullet List */}
                <div className="mt-4 md:mt-[1.8vw] space-y-3.5 md:space-y-[1.1vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:target" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Clickable Hotspots &amp; Interaction Frames:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Turn static areas into interactive touchpoints linking to pop-ups, product details, or checkout pages.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:mouse-pointer-click" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Action-Oriented Buttons:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Drive conversions with customizable buttons designed to prompt immediate reader interaction.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:qr-code" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Scannable QR Codes:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Bridge the digital and physical world by embedding QR codes, enabling users to instantly access mobile-specific campaigns or save contact details.
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:map-pin" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Interactive Maps:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Embed location-based maps directly into the content perfect for event details, store locators, or regional data visualization.
                      </p>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:type" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Advanced Typography &amp; Grids:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Structure complex information beautifully using flexible typography grids and dedicated title styling to ensure maximum readability.
                      </p>
                    </div>
                  </div>

                  {/* Item 6 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:shapes" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Custom Shapes &amp; Masking:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Craft bespoke visual layouts and brand-aligned graphics using built-in vector shapes and precision masking tools.
                      </p>
                    </div>
                  </div>

                  {/* Item 7 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:gallery-horizontal" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Interactive Slideshows:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Showcase multiple product angles or promotional banners inside a compact, swipeable carousel frame.
                      </p>
                    </div>
                  </div>

                  {/* Item 8 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:table" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1vw] font-semibold text-[#1E293B]">
                        Structured Data Tables:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Organize technical specs, pricing tiers, and comparisons into clean, scannable layouts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: UI Mockup Showcase (lg:col-span-5) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end mt-4 lg:mt-0">
                <div className="relative w-full max-w-[420px] flex justify-center lg:justify-end">
                  <img
                    src={interactiveElementsMock}
                    alt="Interactive Elements Showcase"
                    className="w-full max-h-[380px] md:max-h-[440px] lg:max-h-[480px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: ANIMATIONS & INTERACTIVE HOTSPOTS
        ========================================= */}
        <section className="relative w-full py-8 md:py-[1.5vw] overflow-hidden bg-[#FBF9F7] border-t border-[#F1F5F9]/80">
          <div className="relative z-10 max-w-[92vw] mx-auto px-4 md:px-[2vw]">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-10 gap-6 lg:gap-[2.5vw] items-center">
              {/* Left Column: UI Mockup Showcase (lg:col-span-6) */}
              <div className="w-full lg:col-span-6 flex justify-center lg:justify-start mt-4 lg:mt-0">
                <div className="relative w-full max-w-[560px] flex justify-center lg:justify-start">
                  <img
                    src={animationsMock}
                    alt="Animations and Interactive Hotspots Showcase"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right Column: Details (lg:col-span-4) */}
              <div className="w-full lg:col-span-4 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-[2.3vw] font-semibold tracking-tight text-[#111827] leading-tight md:leading-[1.2]">
                  Animations &amp; interactive Hotspots
                </h2>

                {/* Feature Bullet List */}
                <div className="mt-4 md:mt-[1.8vw] space-y-3.5 md:space-y-[1.2vw]">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:play" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Animations &amp; Motion Effects:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Bring pages to life with smooth entrance transitions, hover animations, and kinetic text effects that guide reader focus.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:mouse-pointer" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Default Hotspot Buttons:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Add ready-to-use, customizable action buttons anywhere on the page to trigger pop-ups, product specs, or direct purchase links.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3 md:gap-[0.9vw]">
                    <div className="w-9 h-9 md:w-[2.6vw] md:h-[2.6vw] rounded-lg md:rounded-[0.65vw] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border border-[#FFEDD5]">
                      <Icon icon="lucide:share-2" className="w-4 h-4 md:w-[1.3vw] md:h-[1.3vw]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base md:text-[1.02vw] font-semibold text-[#1E293B]">
                        Social Media Icon Hotspots:
                      </h4>
                      <p className="text-xs sm:text-sm md:text-[0.85vw] text-[#64748B] mt-0.5 leading-relaxed">
                        Embed clickable social icons directly into your catalogue pages so readers can connect, share, or follow your brand in one tap.
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
