import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import trustedAvatar1 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-1.webp';
import trustedAvatar2 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-2.webp';
import trustedAvatar3 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-3.webp';
import trustedAvatar4 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-4.webp';

export default function HeroSection({ navigate, page1, page2, page3, page4, page5, page6 }) {
  const containerRef = useRef(null);
  const heroBookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFlipAudioMuted, setIsFlipAudioMuted] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  const pagesList = [page1, page2, page3, page4, page5, page6];
  const totalPages = 20;
  const heroPages = Array.from({ length: totalPages }, (_, i) => pagesList[i % pagesList.length]);

  const flipAudioRef = useRef(null);
  const autoplayTimerRef = useRef(null);
  const userInteractionTimeoutRef = useRef(null);
  const isHeroVisibleRef = useRef(true);

  // IntersectionObserver: Only allow autoplay and sound when HeroSection is in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.15;
        setIsHeroVisible(visible);
        isHeroVisibleRef.current = visible;
        if (!visible) {
          stopAutoplay();
          if (flipAudioRef.current) {
            flipAudioRef.current.pause();
            flipAudioRef.current.currentTime = 0;
          }
        } else {
          startAutoplay();
        }
      },
      { threshold: [0, 0.15, 0.5] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    flipAudioRef.current = new Audio(softCoverAudio);
    return () => {
      if (flipAudioRef.current) {
        flipAudioRef.current.pause();
        flipAudioRef.current = null;
      }
    };
  }, []);

  const playFlipSound = useCallback(() => {
    if (isFlipAudioMuted || !isHeroVisibleRef.current) return;
    if (flipAudioRef.current) {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => {});
    }
  }, [isFlipAudioMuted]);

  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    if (!isHeroVisibleRef.current) return;

    autoplayTimerRef.current = setInterval(() => {
      if (!isHeroVisibleRef.current) return;
      if (heroBookRef.current) {
        const pageFlipObj = heroBookRef.current.pageFlip();
        if (pageFlipObj) {
          const count = pageFlipObj.getPageCount();
          const current = pageFlipObj.getCurrentPageIndex();
          if (current >= count - 2 || current >= 18) {
            pageFlipObj.flip(0);
          } else {
            pageFlipObj.flipNext();
          }
        }
      }
    }, 4500);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const handleUserFlipInteraction = useCallback(() => {
    stopAutoplay();
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
    userInteractionTimeoutRef.current = setTimeout(() => {
      if (isHeroVisibleRef.current) {
        startAutoplay();
      }
    }, 6000);
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (isHeroVisible) {
      startAutoplay();
    }
    return () => {
      stopAutoplay();
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [isHeroVisible, startAutoplay, stopAutoplay]);

  const onHeroBookFlip = useCallback((e) => {
    setCurrentPage(e.data + 1);
    playFlipSound();
    handleUserFlipInteraction();
  }, [playFlipSound, handleUserFlipInteraction]);

  return (
    <section ref={containerRef} className="relative w-full bg-[#fdfdfd] pt-6 pb-12 lg:pt-[2.2vw] lg:pb-[3vw] px-4 sm:px-8 lg:px-[6vw] font-poppins overflow-hidden">
      
      {/* Top Tag: IDC and line first */}
      <div className="w-full flex items-center gap-3 mb-6 ">
        <span className="text-[11px] lg:text-[0.85vw] font-semibold tracking-[0.28em] text-[#35363A] uppercase">
          IDC
        </span>
        <div className="w-10 lg:w-[2.8vw] h-[1.5px] bg-[#35363A]"></div>
      </div>

      {/* 3-Column Grid below IDC: left side content, center book, right side content */}
      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-stretch">
        
        {/* Left Column (col-span-3) - Expands to fill height in the row */}
        <div className="lg:col-span-3 flex flex-col justify-start text-center lg:text-left items-center lg:items-start py-1 h-full">
          {/* Main Headline: INTERACTIVE DIGITAL CATALOGUE - expanded line height */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.35vw] font-semibold text-[#35363A] leading-[1.3] sm:leading-[1.4] lg:leading-[1.55] tracking-tight">
            INTERACTIVE <br className="hidden sm:inline" />
            DIGITAL <br className="hidden sm:inline" />
            <span className="text-[#EC5137] font-semibold tracking-normal">CATALOGUE</span>
          </h1>

          {/* Bottom Sub-group: Divider + Description */}
          <div className="pt-3 sm:pt-4 flex flex-col items-center lg:items-start">
            {/* Thin Horizontal Rule */}
            <div className="w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[19vw] h-[1px] bg-gray-200 mb-3 sm:mb-5 lg:mb-[1.5vw]"></div>

            {/* Description Paragraph: font weight light & #555555, line height 160% */}
            <p className="text-xs sm:text-sm lg:text-[0.92vw] font-light text-[#555555] leading-[160%] max-w-[290px] sm:max-w-[340px] lg:max-w-[20vw]">
              Transform your products and ideas into immersive digital catalogues with interactive content, rich visuals, and engaging page-turn experiences.
            </p>
          </div>
        </div>

        {/* Center Column: Interactive Flipbook with Page Turning (col-span-6) - Centered */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center self-center relative my-2 sm:my-4 lg:my-0 px-1 sm:px-2 w-full">
          <div className="relative mx-auto w-full max-w-[500px] sm:max-w-[640px] lg:max-w-[48vw] h-[280px] sm:h-[420px] md:h-[460px] lg:h-[30vw] flex items-center justify-center group drop-shadow-[0_22px_40px_rgba(0,0,0,0.22)]">
            <HTMLFlipBook
              width={600}
              height={800}
              size="stretch"
              minWidth={220}
              maxWidth={1400}
              minHeight={260}
              maxHeight={1800}
              maxShadowOpacity={0.5}
              showCover={false}
              mobileScrollSupport={true}
              clickEventForward={false}
              useMouseEvents={true}
              onFlip={onHeroBookFlip}
              flippingTime={900}
              swipeDistance={30}
              ref={heroBookRef}
              startPage={0}
              className="w-full h-full mx-auto"
            >
              {heroPages.map((pageSrc, index) => (
                <div key={index} className="bg-white overflow-hidden shadow-inner flex items-center justify-center">
                  <img
                    src={pageSrc}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ))}
            </HTMLFlipBook>
          </div>
        </div>

        {/* Right Column (col-span-3) - Aligned height and position with center flipbook */}
        <div className="lg:col-span-3 flex flex-col justify-between items-center lg:items-end text-center lg:text-right h-auto lg:h-[30vw] lg:self-center w-full lg:pb-[2vw] space-y-6 lg:space-y-0">
          
          {/* Top Block: YOUR CONTENT. STORY. */}
          <div className="flex flex-col items-center lg:items-end w-full">
            {/* YOUR - semibold, linear 43% #17202C 50% - #C3C3C3 */}
            <h2
              className="text-4xl sm:text-5xl lg:text-[3.9vw] font-semibold tracking-tight leading-none uppercase select-none text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #17202C 0%, #17202C 43%, #C3C3C3 50%, #C3C3C3 100%)'
              }}
            >
              YOUR
            </h2>

            {/* CONTENT. STORY. - #35363A semibold */}
            <div className="text-xs sm:text-sm lg:text-[0.95vw] font-semibold text-[#35363A] tracking-wider uppercase mt-1 leading-[1.6]">
              CONTENT.<br />STORY.
            </div>

            {/* Interactive, Imm..... - #555555 & medium */}
            <div className="text-[10px] sm:text-xs lg:text-[0.72vw] font-medium text-[#555555] tracking-wider uppercase flex items-center gap-2.5 sm:gap-3.5 lg:gap-[0.8vw] flex-wrap justify-center lg:justify-end mt-3 lg:mt-[0.9vw]">
              <span className="whitespace-nowrap">• INTERACTIVE</span>
              <span className="whitespace-nowrap">• IMMERSIVE</span>
              <span className="whitespace-nowrap">• INTELLIGENT</span>
            </div>

            {/* Red Accent Line aligned precisely under INTELLIGENT (slightly increased width) */}
            <div className="w-20 lg:w-[5.4vw] h-[2px] bg-[#EC5137] mt-2 self-center lg:self-end"></div>
          </div>

          {/* Center Block: Connected Horizontal Stepper 1 - 2 - 3 */}
          <div className="w-full flex items-center justify-center lg:justify-end my-3 sm:my-4 lg:my-auto">
            <div className="relative flex items-center gap-7 sm:gap-9 lg:gap-[2.5vw]">
              {/* Connecting Red Line */}
              <div className="absolute left-3 sm:left-3.5 lg:left-[0.92vw] right-3 sm:right-3.5 lg:right-[0.92vw] top-1/2 -translate-y-1/2 h-[2px] bg-[#EC5137] z-0"></div>

              {/* 1, 2, 3 - medium, orange color - #EC5137 */}
              {/* Step 1: Solid Red Circle */}
              <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.85vw] lg:h-[1.85vw] rounded-full bg-[#EC5137] text-white font-medium text-xs sm:text-sm lg:text-[0.85vw] flex items-center justify-center shadow-sm">
                1
              </div>

              {/* Step 2: White Circle with Red Outline */}
              <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.85vw] lg:h-[1.85vw] rounded-full bg-white border-2 border-[#EC5137] text-[#EC5137] font-medium text-xs sm:text-sm lg:text-[0.85vw] flex items-center justify-center">
                2
              </div>

              {/* Step 3: White Circle with Red Outline */}
              <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.85vw] lg:h-[1.85vw] rounded-full bg-white border-2 border-[#EC5137] text-[#EC5137] font-medium text-xs sm:text-sm lg:text-[0.85vw] flex items-center justify-center">
                3
              </div>
            </div>
          </div>

          {/* Bottom Block: Customer Reviews with Orange Rings */}
          <div className="flex flex-col items-center lg:items-end w-full">
            {/* Overlapping individual circular avatars matching design */}
            <div className="flex items-center justify-center lg:justify-end -space-x-2.5 lg:-space-x-[0.6vw] mb-1.5">
              <img
                src={trustedAvatar1}
                alt="Customer 1"
                className="w-8 h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar2}
                alt="Customer 2"
                className="w-8 h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar3}
                alt="Customer 3"
                className="w-8 h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar4}
                alt="Customer 4"
                className="w-8 h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
            </div>

            {/* 5 Solid Yellow Stars */}
            <div className="flex text-[#FD9F0D] text-sm lg:text-[1.15vw] tracking-wider my-0.5">
              ★★★★★
            </div>

            {/* Trusted by 10,000+ Customer - #35363A regular */}
            <span className="text-[10px] sm:text-xs lg:text-[0.75vw] font-normal text-[#35363A] tracking-tight">
              Trusted by 10,000+ Customer
            </span>
          </div>

        </div>

      </div>

      {/* Center Bottom Action Buttons with Smooth Hover Color Animations (Reduced 5-10%) */}
      <div className="w-full flex items-center justify-center gap-3.5 lg:gap-[1.1vw] mt-7 lg:mt-[2.2vw] z-20">
        
        {/* View Live Demo Button: Inverts on hover to dark with white text */}
        <button
          onClick={() => {
            const el = document.getElementById('interactive-demo-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ borderRadius: '17.34px' }}
          className="group relative flex items-center gap-2 px-5 py-2 lg:px-[1.55vw] lg:py-[0.65vw] bg-white hover:bg-[#141b24] border border-gray-200 hover:border-[#141b24] text-[#35363A] hover:text-white font-medium text-[11px] sm:text-xs lg:text-[0.8vw] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(20,27,36,0.22)] transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
        >
          <div className="w-4.5 h-4.5 rounded-full bg-[#35363A] group-hover:bg-[#EC5137] text-white flex items-center justify-center transition-colors duration-300">
            <Icon icon="ic:round-play-arrow" className="w-3 h-3 fill-current ml-0.5" />
          </div>
          <span>View Live Demo</span>
        </button>

        {/* My Flipbook Button: Inverts on hover to vibrant brand orange #EC5137 */}
        <button
          onClick={() => navigate && navigate('/my-flipbooks')}
          style={{ borderRadius: '17.34px' }}
          className="group relative flex items-center gap-2 px-5 py-2 lg:px-[1.55vw] lg:py-[0.65vw] bg-[#141b24] hover:bg-[#EC5137] text-[#FFFFFF] font-medium text-[11px] sm:text-xs lg:text-[0.8vw] shadow-[0_6px_16px_rgba(20,27,36,0.25)] hover:shadow-[0_8px_22px_rgba(236,81,55,0.35)] transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
        >
          <span>My Flipbook</span>
          <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

    </section>
  );
}
