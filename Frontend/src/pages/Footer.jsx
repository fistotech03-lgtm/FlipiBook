import React from 'react';
import { Link } from 'react-router-dom';
import FlipibookLogo from '../assets/logo/Flipibook_logo.svg';
import { Icon } from '@iconify/react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#212224] text-white font-poppins relative overflow-hidden flex flex-col justify-between">

      {/* Main Content Area */}
      <div className="w-full max-w-[1920px] mx-auto px-5 sm:px-8 md:px-12 lg:pl-[2.8vw] lg:pr-0 relative z-10 flex flex-col">

        {/* Top Header Row with Content & Let's Talk CTA */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between relative pt-8 sm:pt-10 lg:pt-0 pb-2 sm:pb-4 lg:pb-0">

          {/* Main Content Area: Left Brand Column + Center Links Column */}
          <div className="flex flex-col lg:flex-row flex-1 lg:pr-[9.5vw] lg:pt-[1.4vw]">

            {/* Left Column: Brand Logo & Tagline Headline & Description */}
            <div className="w-full lg:w-[26vw] flex flex-col pr-0 lg:pr-[1vw] mb-6 sm:mb-8 lg:mb-0">
              {/* Logo Image */}
              <div className="flex items-center mb-5 sm:mb-6 md:mb-7 lg:mb-[1.1vw]">
                <img src={FlipibookLogo} alt="Flipibook Logo" className="h-10 sm:h-12 md:h-14 lg:h-[2.6vw] w-auto object-contain" />
              </div>

              {/* Tagline Headline */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[1.62vw] font-semibold text-white tracking-wide uppercase leading-[1.3] mb-2.5 sm:mb-3 lg:mb-[0.9vw]">
                LET’S BUILD YOUR NEXT <br />
                DIGITAL EXPERIENCE
              </h2>

              {/* Sub-paragraph */}
              <p className="text-[13px] sm:text-sm lg:text-[0.82vw] text-[#9CA3AF] font-normal leading-relaxed max-w-[340px] sm:max-w-[480px] lg:max-w-[21vw]">
                Turn your ideas into stunning interactive flipbooks and create a lasting impression.
              </p>
            </div>

            {/* Center Column: Social Links Bar on top + 3 Link Columns */}
            <div className="flex-1 flex flex-col justify-start lg:pl-[1.75vw]">

              {/* Horizontal Social Links Bar */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 sm:flex sm:flex-wrap sm:items-center sm:gap-x-7 lg:gap-[3.2vw] text-xs sm:text-sm md:text-sm lg:text-[0.9vw] font-normal text-white pb-5 sm:pb-6 lg:pb-[1vw] border-b border-white/10 lg:border-b-0">

                {/* Facebook */}
                <a href="#" className="flex items-center gap-1.5 sm:gap-2 lg:gap-[0.45vw] hover:text-[#EA7233] transition-colors group py-1">
                  <Icon icon="fa6-brands:facebook-f" className="text-sm sm:text-base lg:text-[1vw]" />
                  <span className="font-medium">Facebook</span>
                  <Icon icon="akar-icons:arrow-up-right" className="text-xs lg:text-[0.82vw] text-[#989898] group-hover:text-[#EA7233] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                {/* Vertical Divider 1 */}
                <div className="w-[1px] h-4 sm:h-5 lg:h-[2.3vw] bg-white/20 lg:bg-white/80 shrink-0 hidden sm:block" />

                {/* Instagram */}
                <a href="#" className="flex items-center gap-1.5 sm:gap-2 lg:gap-[0.45vw] hover:text-[#EA7233] transition-colors group py-1">
                  <Icon icon="mdi:instagram" className="text-base sm:text-lg lg:text-[1.15vw]" />
                  <span className="font-medium">Instagram</span>
                  <Icon icon="akar-icons:arrow-up-right" className="text-xs lg:text-[0.82vw] text-[#989898] group-hover:text-[#EA7233] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                {/* Vertical Divider 2 */}
                <div className="w-[1px] h-4 sm:h-5 lg:h-[2.3vw] bg-white/20 lg:bg-white/80 shrink-0 hidden sm:block" />

                {/* LinkedIn */}
                <a href="#" className="flex items-center gap-1.5 sm:gap-2 lg:gap-[0.45vw] hover:text-[#EA7233] transition-colors group py-1">
                  <Icon icon="fa6-brands:linkedin-in" className="text-sm sm:text-base lg:text-[1vw]" />
                  <span className="font-medium">Linked in</span>
                  <Icon icon="akar-icons:arrow-up-right" className="text-xs lg:text-[0.82vw] text-[#989898] group-hover:text-[#EA7233] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                {/* Vertical Divider 3 */}
                <div className="w-[1px] h-4 sm:h-5 lg:h-[2.3vw] bg-white/20 lg:bg-white/80 shrink-0 hidden sm:block" />

                {/* YouTube */}
                <a href="#" className="flex items-center gap-1.5 sm:gap-2 lg:gap-[0.45vw] hover:text-[#EA7233] transition-colors group py-1">
                  <Icon icon="fa6-brands:youtube" className="text-sm sm:text-base lg:text-[1.1vw]" />
                  <span className="font-medium">YouTube</span>
                  <Icon icon="akar-icons:arrow-up-right" className="text-xs lg:text-[0.82vw] text-[#989898] group-hover:text-[#EA7233] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </div>

              {/* 3 Link Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-6 lg:flex lg:items-start text-[13px] sm:text-sm lg:text-[0.74vw] text-[#C5CAD0] pt-6 sm:pt-7 lg:pt-0">

                {/* Column 1: Main Pages */}
                <div className="flex flex-col space-y-2.5 sm:space-y-3 lg:space-y-[0.48vw] lg:pl-[9.8vw]">
                  <Link to="/" className="hover:text-white underline underline-offset-4 transition-colors">Home</Link>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Features</a>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Templates</a>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Explore</a>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Pricing</a>
                </div>

                {/* Column 2: Contact Info - Shifted slightly right to center precisely under divider */}
                <div className="flex flex-col space-y-2.5 sm:space-y-3 lg:space-y-[0.48vw] lg:pl-[4.6vw]">
                  <a href="mailto:info@flipibook-o.com" className="hover:text-white underline underline-offset-4 transition-colors break-all sm:break-normal">
                    info@flipibook-o.com
                  </a>
                  <a href="tel:+917530025147" className="hover:text-white underline underline-offset-4 transition-colors whitespace-nowrap">
                    +91 75300 25147
                  </a>
                </div>

                {/* Column 3: Resource Links - Aligned straight under the vertical divider line before YouTube */}
                <div className="flex flex-col space-y-2.5 sm:space-y-3 lg:space-y-[0.48vw] lg:pl-[6.65vw] col-span-2 sm:col-span-1 pt-1 sm:pt-0">
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Documentation</a>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Tutorials</a>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">Help Center</a>
                  <a href="#" className="hover:text-white underline underline-offset-4 transition-colors">FAQs</a>
                </div>

              </div>

            </div>

          </div>

          {/* Orange "LET'S TALK" Box - Follows mobile layout: full-width horizontal bar on mobile & tab; converts to vertical right strip only on desktop (lg:) */}
          <a
            href="mailto:info@flipibook-o.com"
            className="mt-6 sm:mt-8 lg:mt-0 w-full lg:w-[8vw] lg:self-auto lg:h-auto bg-[#EA7233] hover:bg-[#d96528] text-white flex flex-row lg:flex-col items-center justify-between py-4 px-6 sm:py-4.5 sm:px-8 lg:py-[1.2vw] lg:px-[1vw] rounded-xl lg:rounded-none transition-all duration-300 group shadow-lg z-20 cursor-pointer shrink-0"
          >
            {/* Text on mobile/tab (left), text on desktop (bottom) */}
            <div className="text-base sm:text-lg lg:text-[1.5vw] font-semibold text-left lg:text-center uppercase tracking-wider leading-tight order-1 lg:order-2 lg:pb-[0.4vw]">
              <span className="lg:hidden">LET’S TALK</span>
              <span className="hidden lg:inline">LET’S <br /> TALK</span>
            </div>

            {/* Arrow on mobile/tab (right), arrow on desktop (top) */}
            <div className="flex items-center justify-center order-2 lg:order-1 lg:pt-[0.3vw]">
              <Icon
                icon="bi:arrow-up-right"
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-[4.8vw] lg:h-[4.8vw] text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform stroke-[0.3]"
              />
            </div>
          </a>

        </div>

      </div>

      {/* Giant Watermark Background Text "FLIPIBOOK." with subtle bottom blur/fade */}
      <div className="w-full relative overflow-hidden select-none pointer-events-none mt-2 sm:mt-4 lg:mt-[1.5vw] -mb-1 sm:-mb-2 lg:-mb-[0.6vw] flex justify-center z-0">
        <svg
          viewBox="0 0 1920 300"
          className="w-full max-w-[1920px] h-auto max-h-[140px] sm:max-h-[200px] lg:max-h-[17.5vw] px-2 sm:px-6 lg:px-[2vw]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="50%"
            y="280"
            textAnchor="middle"
            fill="white"
            fillOpacity="0.05"
            className="sm:fill-opacity-[0.04]"
            fontSize="355"
            fontWeight="600"
            fontFamily="Poppins, sans-serif"
            letterSpacing="0.04em"
          >
            FLIPIBOOK
          </text>
        </svg>

        {/* Bottom Blur & Gradient Fade Overlay (Reduced blur/height on mobile and tab, kept on desktop) */}
        <div className="absolute inset-x-0 bottom-0 h-8 sm:h-14 lg:h-[7.5vw] bg-gradient-to-t from-[#212224] via-[#212224]/50 to-transparent backdrop-blur-none sm:backdrop-blur-[1px] lg:backdrop-blur-[3px] pointer-events-none z-1" />
      </div>

      {/* Bottom Copyright & Legal Policy Bar */}
      <div className="w-full py-4 sm:py-5 lg:py-[0.55vw] px-6 sm:px-10 lg:px-[2.8vw] relative z-10 mt-2 sm:mt-0 bg-[#212224]/80 backdrop-blur-xs">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-4 lg:gap-[1vw] text-xs sm:text-[13px] lg:text-[0.75vw] text-white/80 font-normal text-center sm:text-left">

          {/* Copyright Left */}
          <div className="font-normal text-white/80 leading-relaxed">
            Copyright © 2026 <a href="https://fist-o.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-white/90 font-normal hover:text-[#EA7233] transition-colors cursor-pointer">Fisto Tech Private Limited</a>. All Rights Reserved.
          </div>

          {/* Legal Links Right */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-4 lg:gap-[1vw] text-white/80 font-normal">
            <a href="#" className="hover:text-[#EA7233] transition-colors">Privacy Policy</a>
            <span className="text-white/20">|</span>
            <a href="#" className="hover:text-[#EA7233] transition-colors">Terms of Use</a>
            <span className="text-white/20">|</span>
            <a href="#" className="hover:text-[#EA7233] transition-colors">Cookie Policy</a>
          </div>

        </div>
      </div>

    </footer>
  );
}
