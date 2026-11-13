import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import trustedAvatar1 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-1.webp';
import trustedAvatar2 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-2.webp';
import trustedAvatar3 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-3.webp';
import trustedAvatar4 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-4.webp';

export default function HeroSection({ navigate, page1, page2, page3, page4, page5, page6, page7, page8 }) {
  const containerRef = useRef(null);
  const heroBookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStep, setActiveStep] = useState(1);
  const activeStepRef = useRef(1);
  const isWheelingRef = useRef(false);
  const step3ReachedTimeRef = useRef(0);
  const hasPassedHeroRef = useRef(false);
  const [isFlipAudioMuted, setIsFlipAudioMuted] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  const pagesList = [page1, page2, page3, page4, page5, page6, page7, page8];
  const heroPages = pagesList;

  const flipAudioRef = useRef(null);
  
  
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
          
          if (flipAudioRef.current) {
            flipAudioRef.current.pause();
            flipAudioRef.current.currentTime = 0;
          }
        } else {
          
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

  const [coverState, setCoverState] = useState('front'); // 'front' | 'open' | 'back'

  // Synchronize active step (1, 2, 3, 4, 5) and cover state based on page index
  const updateStepFromPage = useCallback((pageIndex) => {
    let step = 1;
    if (pageIndex >= 7) {
      step = 5;
    } else if (pageIndex >= 5) {
      step = 4;
    } else if (pageIndex >= 3) {
      step = 3;
    } else if (pageIndex >= 1) {
      step = 2;
    } else {
      step = 1;
    }
    setActiveStep(step);
    activeStepRef.current = step;

    // Front cover is on the right of the spread (needs -25% shift)
    // Back cover is on the left of the spread (needs +25% shift)
    // Open spreads (pages 1 to 6) are 2 pages (needs 0% shift)
    if (pageIndex === 0) {
      setCoverState('front');
    } else if (pageIndex >= 7) {
      setCoverState('back');
    } else {
      setCoverState('open');
    }
  }, []);

  const flipToStep = useCallback((stepNumber) => {
    if (!heroBookRef.current) return;
    const pageFlipObj = heroBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    let targetPageIndex = 0;
    if (stepNumber === 1) targetPageIndex = 0;
    else if (stepNumber === 2) targetPageIndex = 1;
    else if (stepNumber === 3) targetPageIndex = 3;
    else if (stepNumber === 4) targetPageIndex = 5;
    else if (stepNumber === 5) targetPageIndex = 7;

    const currentStep = activeStepRef.current;
    if (currentStep === stepNumber) return;

    setActiveStep(stepNumber);
    activeStepRef.current = stepNumber;

    const stepDiff = stepNumber - currentStep;
    if (stepDiff === 1) {
      pageFlipObj.flipNext();
    } else if (stepDiff === -1) {
      pageFlipObj.flipPrev();
    } else {
      if (typeof pageFlipObj.turnToPage === 'function') {
        pageFlipObj.turnToPage(targetPageIndex);
      } else {
        pageFlipObj.flip(targetPageIndex);
      }
    }
  }, []);

  const onHeroBookFlip = useCallback((e) => {
    const newPageIdx = e.data;
    setCurrentPage(newPageIdx + 1);
    updateStepFromPage(newPageIdx);
    playFlipSound();
  }, [playFlipSound, updateStepFromPage]);

  // Desktop scroll-driven page turn (Step 1 <-> Step 2 <-> Step 3)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let hasCentered = false;

    const handleWheel = (e) => {
      if (window.innerWidth < 1024) return;
      if (!heroBookRef.current) return;

      const rect = el.getBoundingClientRect();
      const currentStep = activeStepRef.current;

      // When section comes into view and user scrolls down, lock and flip pages first
      if (e.deltaY > 0) {
        // If section is reaching the viewport top
        if (rect.top <= 100 && rect.bottom >= window.innerHeight * 0.5) {
          if (currentStep < 5) {
            e.preventDefault();
            e.stopPropagation();

            // Smooth snap to center section once when flipping starts
            if (!hasCentered && Math.abs(rect.top) > 20) {
              hasCentered = true;
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (!isWheelingRef.current) {
              isWheelingRef.current = true;
              const nextStep = currentStep + 1;
              flipToStep(nextStep);
              setTimeout(() => {
                isWheelingRef.current = false;
              }, 700);
            }
            return false;
          } else {
            // Once Step 5 (home 8) is reached, allow natural scroll to the next section
            hasCentered = false;
          }
        }
      }
      // Scrolling UP
      else if (e.deltaY < 0) {
        // Only flip backwards if section is fully aligned in view
        if (rect.top >= -50 && rect.top <= 100) {
          if (currentStep > 1) {
            e.preventDefault();
            e.stopPropagation();

            if (!isWheelingRef.current) {
              isWheelingRef.current = true;
              const prevStep = currentStep - 1;
              flipToStep(prevStep);
              setTimeout(() => {
                isWheelingRef.current = false;
              }, 700);
            }
            return false;
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [flipToStep]);

  return (
    <section ref={containerRef} className="relative w-full min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] bg-[#fdfdfd] flex flex-col justify-center pt-4 sm:pt-6 lg:pt-5 pb-6 sm:pb-8 lg:pb-6 px-4 sm:px-8 lg:px-[6vw] font-poppins overflow-hidden">
      
      {/* Top Tag: IDC and line first */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-3 mb-3 lg:mb-4 flex-shrink-0"
      >
        <span className="text-[11px] lg:text-[0.85vw] font-semibold tracking-[0.28em] text-[#35363A] uppercase">
          IDC
        </span>
        <div className="w-10 lg:w-[2.8vw] h-[1.5px] bg-[#35363A]"></div>
      </motion.div>

      {/* 3-Column Grid below IDC: left side content, center book, right side content */}
      <div className="w-full flex-1 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        
        {/* Left Column (col-span-3) - Expands to fill height in the row */}
        <div
          className="lg:col-span-3 flex flex-col justify-start text-center lg:text-left items-center lg:items-start py-1 h-full"
        >
          {/* Main Headline: INTERACTIVE DIGITAL CATALOGUES (Increased size) */}
          <motion.h1
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2vw] font-semibold text-[#35363A] leading-[1.25] sm:leading-[1.2] lg:leading-[1.3] tracking-tight"
          >
            INTERACTIVE <br className="inline sm:hidden lg:inline" />DIGITAL <br className="hidden sm:inline" />
            <span className="text-[#EC5137] font-semibold tracking-normal">CATALOGUES</span>
            <span className="block text-sm sm:text-base md:text-lg lg:text-[1.08vw] font-medium text-[#4B596C] tracking-normal mt-2 lg:mt-[0.6vw] leading-snug">
              THAT BRINGS YOUR PRODUCTS TO LIFE.
            </span>
          </motion.h1>

          {/* Bottom Sub-group: Divider + Description */}
          <div className="pt-3 sm:pt-3.5 md:pt-4 flex flex-col items-center lg:items-start w-full">
            {/* Thin Horizontal Rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[200px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[19vw] h-[1px] bg-gray-200 mb-3 sm:mb-3.5 lg:mb-[1.2vw] origin-left"
            ></motion.div>

            {/* Description Paragraph (Slightly increased to fill well while staying secondary) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs sm:text-sm md:text-[15px] lg:text-[0.85vw] font-light text-[#555555] leading-[165%] max-w-[290px] sm:max-w-[500px] md:max-w-[560px] lg:max-w-[20vw] text-justify lg:text-left"
            >
              Turn your PDF into an interactive digital catalogue with FlipiBook. Add product videos, 3D models, and clickable links so customers can see how your products work, explore the details, and contact your team. Share your catalogue through a single link.
            </motion.p>
          </div>
        </div>

        {/* Center Column: Interactive Flipbook with Page Turning (col-span-6) - Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="lg:col-span-6 flex flex-col items-center justify-center self-center relative my-2 sm:my-3 lg:-mt-6 xl:-mt-8 px-1 sm:px-2 w-full"
        >
          <div className="relative mx-auto w-full max-w-[400px] xs:max-w-[500px] sm:max-w-[720px] lg:max-w-[52vw] xl:max-w-[55vw] aspect-[420/297] flex items-center justify-center group drop-shadow-[0_24px_45px_rgba(0,0,0,0.22)]">
            <div
              className={`w-full h-full flex items-center justify-center transition-transform duration-700 ease-in-out ${
                coverState === 'front'
                  ? '-translate-x-[25%]'
                  : coverState === 'back'
                  ? 'translate-x-[25%]'
                  : 'translate-x-0'
              }`}
            >
              <HTMLFlipBook
                width={595}
                height={842}
                size="stretch"
                minWidth={210}
                maxWidth={1200}
                minHeight={297}
                maxHeight={1700}
                maxShadowOpacity={0.5}
                showCover={true}
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

          {/* Mobile and Tab Stepper 1 - 2 - 3 directly below the book with increased size and spacing */}
          <div className="w-full flex lg:hidden items-center justify-center mt-7 sm:mt-9 mb-4 sm:mb-6">
            <div className="relative flex items-center gap-10 sm:gap-12">
              {/* Connecting Red Line */}
              <div className="absolute left-4 sm:left-5 right-4 sm:right-5 top-1/2 -translate-y-1/2 h-[2.5px] bg-[#EC5137] z-0"></div>

              {/* 1, 2, 3 - dynamic active highlight on each page turn */}
              {[1, 2, 3].map((step) => {
                const isActive = activeStep === step;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => flipToStep(step)}
                    className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-sm sm:text-base flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'bg-[#EC5137] text-white shadow-md scale-110'
                        : 'bg-white border-2 border-[#EC5137] text-[#EC5137] hover:bg-orange-50'
                    }`}
                  >
                    {step}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Content Pitch & Rating Box (col-span-3) - Right Aligned with Balanced Gap */}
        <div
          className="lg:col-span-3 flex flex-col justify-start lg:justify-between text-center lg:text-right items-center lg:items-end py-1 h-full gap-5 lg:gap-0 lg:pl-[1.5vw]"
        >
          
          {/* Top Block: Pitch Heading, Subtext, Bullets & Line */}
          <div className="flex flex-col items-center lg:items-end w-full">
            {/* YOUR - Gradient Fill: #17202C (Dark Slate) top to #C3C3C3 (Light Silver) bottom */}
            <motion.h2
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.35vw] font-bold tracking-tight uppercase bg-clip-text text-transparent inline-block leading-none"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #17202C 0%, #17202C 43%, #C3C3C3 50%, #C3C3C3 100%)'
              }}
            >
              YOUR
            </motion.h2>

            {/* CONTENT. STORY. - #35363A semibold */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-lg md:text-xl lg:text-[0.95vw] font-semibold text-[#35363A] tracking-wider uppercase mt-1.5 sm:mt-2.5 leading-[1.6]"
            >
              CONTENT.<br />STORY.
            </motion.div>

            {/* Interactive, Imm..... - #555555 & medium */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11.5px] xs:text-xs sm:text-base md:text-lg lg:text-[0.72vw] font-medium text-[#555555] tracking-wider uppercase flex items-center gap-2 sm:gap-4 lg:gap-[0.8vw] flex-wrap justify-center lg:justify-end mt-3.5 sm:mt-4 lg:mt-[0.9vw]"
            >
              <span className="whitespace-nowrap">• INTERACTIVE</span>
              <span className="whitespace-nowrap">• IMMERSIVE</span>
              <span className="whitespace-nowrap">• INTELLIGENT</span>
            </motion.div>

            {/* Red Accent Line aligned precisely under INTELLIGENT (slightly increased width) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-24 sm:w-36 md:w-44 lg:w-[5.4vw] h-[2px] bg-[#EC5137] mt-2.5 sm:mt-3.5 self-center lg:self-end origin-right"
            ></motion.div>
          </div>

          {/* Center Block: Connected Horizontal Stepper 1 - 2 - 3 (Desktop only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
            className="w-full hidden lg:flex items-center justify-end my-auto"
          >
            <div className="relative flex items-center gap-[2.5vw]">
              {/* Connecting Red Line */}
              <div className="absolute left-[0.92vw] right-[0.92vw] top-1/2 -translate-y-1/2 h-[2px] bg-[#EC5137] z-0"></div>

              {/* 1, 2, 3 - dynamic active highlight on each page turn */}
              {[1, 2, 3].map((step) => {
                const isActive = activeStep === step;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => flipToStep(step)}
                    className={`relative z-10 w-6 h-6 sm:w-7 sm:h-7 lg:w-[1.85vw] lg:h-[1.85vw] rounded-full font-medium text-xs sm:text-sm lg:text-[0.85vw] flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'bg-[#EC5137] text-white shadow-md scale-110'
                        : 'bg-white border-2 border-[#EC5137] text-[#EC5137] hover:bg-orange-50'
                    }`}
                  >
                    {step}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom Block: Customer Reviews with Orange Rings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center lg:items-end w-full mt-4 sm:mt-6 lg:-mt-4 xl:-mt-6"
          >
            {/* Overlapping individual circular avatars matching design */}
            <div className="flex items-center justify-center lg:justify-end -space-x-2.5 lg:-space-x-[0.6vw] mb-1.5">
              <img
                src={trustedAvatar1}
                alt="Customer 1"
                className="w-9 h-9 sm:w-8 sm:h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar2}
                alt="Customer 2"
                className="w-9 h-9 sm:w-8 sm:h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar3}
                alt="Customer 3"
                className="w-9 h-9 sm:w-8 sm:h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar4}
                alt="Customer 4"
                className="w-9 h-9 sm:w-8 sm:h-8 lg:w-[2.4vw] lg:h-[2.4vw] rounded-full ring-2 ring-[#EC5137] object-cover bg-gray-100 shadow-sm"
              />
            </div>

            {/* 5 Solid Yellow Stars */}
            <div className="flex text-[#FD9F0D] text-base sm:text-lg md:text-xl lg:text-[1.15vw] tracking-wider my-0.5 sm:my-1">
              ★★★★★
            </div>

            {/* Trusted by 10,000+ Customer - #35363A regular */}
            <span className="text-xs sm:text-sm md:text-base lg:text-[0.75vw] font-medium text-[#35363A] tracking-tight">
              Trusted by 10,000+ Customer
            </span>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
