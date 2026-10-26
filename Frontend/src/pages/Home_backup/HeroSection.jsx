import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import trustedAvatar1 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-1.webp';
import trustedAvatar2 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-2.webp';
import trustedAvatar3 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-3.webp';
import trustedAvatar4 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-4.webp';

export default function HeroSection({ navigate, page1, page2, page3, page4, page5, page6, isPreloaderDone = true }) {
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

  const pagesList = [page1, page2, page3, page4, page5, page6];
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

  // Synchronize active step (1, 2, 3) based on page index
  const updateStepFromPage = useCallback((pageIndex) => {
    let step = 1;
    if (pageIndex >= 4) {
      step = 3;
    } else if (pageIndex >= 2) {
      step = 2;
    } else {
      step = 1;
    }
    setActiveStep(step);
    activeStepRef.current = step;
  }, []);

  const flipToStep = useCallback((stepNumber) => {
    if (!heroBookRef.current) return;
    const pageFlipObj = heroBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    let targetPageIndex = 0;
    if (stepNumber === 1) targetPageIndex = 0;
    else if (stepNumber === 2) targetPageIndex = 2;
    else if (stepNumber === 3) targetPageIndex = 4;

    const currentStep = activeStepRef.current;
    if (currentStep === stepNumber) return;

    setActiveStep(stepNumber);
    activeStepRef.current = stepNumber;

    // If jumping multiple steps (e.g. from 1 directly to 3 or 3 directly to 1),
    // page-flip's internal flip(target) has a known bug in two-page spread mode that lands on the intermediate spread.
    // Calling flipNext()/flipPrev() for single step transitions or sequential/direct turn ensures exact landing.
    const stepDiff = stepNumber - currentStep;
    if (stepDiff === 1) {
      pageFlipObj.flipNext();
    } else if (stepDiff === -1) {
      pageFlipObj.flipPrev();
    } else if (Math.abs(stepDiff) > 1) {
      // Step 1 -> 3 or Step 3 -> 1
      if (typeof pageFlipObj.turnToPage === 'function') {
        pageFlipObj.turnToPage(targetPageIndex);
      } else {
        pageFlipObj.flip(targetPageIndex);
      }
    } else {
      pageFlipObj.flip(targetPageIndex);
    }
  }, []);

  const onHeroBookFlip = useCallback((e) => {
    const newPageIdx = e.data;
    setCurrentPage(newPageIdx + 1);
    updateStepFromPage(newPageIdx);
    playFlipSound();
  }, [playFlipSound, updateStepFromPage]);

  // Desktop scroll-driven page turn (Step 1 <-> Step 2 <-> Step 3)
  // Logic:
  // - Pin / lock scroll on the Hero section until Step 3 is reached when scrolling down.
  // - Once Step 3 is reached, allow page to scroll freely to all lower sections.
  // - When scrolling back UP from lower sections (Interactive Demo, About Us, etc.):
  //     ALLOW completely natural scrolling without ANY interception or pinning!
  // - ONLY when the Hero section is back in FULL view at the very top of the window (scrollTop === 0):
  //     scrolling UP will reverse page turns (3 -> 2 -> 1).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Helper to get true scrollTop from whatever container is scrolling
    const getTrueScrollTop = () => {
      const docTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const mainEl = document.querySelector('main');
      const mainTop = mainEl ? mainEl.scrollTop : 0;
      return Math.max(docTop, mainTop);
    };

    const handleWheel = (e) => {
      if (window.innerWidth < 1024) return;
      if (!heroBookRef.current) return;

      const currentStep = activeStepRef.current;
      const currentScrollTop = getTrueScrollTop();

      // Check the exact bounding box of HeroSection
      const rect = el.getBoundingClientRect();

      // Scrolling DOWN
      if (e.deltaY > 0) {
        // Only pin down when Hero is at the very top (currentScrollTop <= 5 and rect.top >= -5)
        if (currentScrollTop <= 5 && rect.top >= -5) {
          // If step 3 has not been reached yet
          if (currentStep < 3) {
            const mainEl = document.querySelector('main');
            if (mainEl && mainEl.scrollTop > 0) mainEl.scrollTop = 0;
            if (window.scrollY > 0) window.scrollTo(0, 0);

            e.preventDefault();
            e.stopPropagation();

            if (!isWheelingRef.current) {
              isWheelingRef.current = true;
              const nextStep = currentStep + 1;
              if (nextStep === 3) {
                step3ReachedTimeRef.current = Date.now();
              }
              flipToStep(nextStep);
              setTimeout(() => {
                isWheelingRef.current = false;
              }, 550);
            }
            return false;
          }

          // If we ARE at step 3, give a 0.5s pause before releasing the scroll lock
          const elapsedSinceStep3 = Date.now() - (step3ReachedTimeRef.current || 0);
          if (elapsedSinceStep3 < 500) {
            const mainEl = document.querySelector('main');
            if (mainEl && mainEl.scrollTop > 0) mainEl.scrollTop = 0;
            if (window.scrollY > 0) window.scrollTo(0, 0);

            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
        // Once 0.5s pause has elapsed after reaching Step 3, allow natural scroll down
      }
      // Scrolling UP
      else if (e.deltaY < 0) {
        // If we are NOT at the very top (currentScrollTop > 5 or rect.top < -5),
        // the user is in a lower section! Let them scroll up naturally! NEVER intercept!
        if (currentScrollTop > 5 || rect.top < -5) {
          return;
        }

        // We ARE at the top (full viewport of Hero section)!
        if (currentStep > 1) {
          const mainEl = document.querySelector('main');
          if (mainEl && mainEl.scrollTop > 0) mainEl.scrollTop = 0;
          if (window.scrollY > 0) window.scrollTo(0, 0);

          e.preventDefault();
          e.stopPropagation();

          if (!isWheelingRef.current) {
            isWheelingRef.current = true;
            const prevStep = currentStep - 1;
            flipToStep(prevStep);
            setTimeout(() => {
              isWheelingRef.current = false;
            }, 550);
          }
          return false;
        }
      }
    };

    // Attach to window and main element
    const mainEl = document.querySelector('main');
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    if (mainEl) {
      mainEl.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    }

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      if (mainEl) {
        mainEl.removeEventListener('wheel', handleWheel, { capture: true });
      }
    };
  }, [flipToStep]);

  return (
    <section ref={containerRef} className="relative w-full bg-[#fdfdfd] pt-6 pb-12 lg:pt-[2.2vw] lg:pb-[3vw] px-4 sm:px-8 lg:px-[6vw] font-poppins overflow-hidden">
      
      {/* Top Tag: IDC and line first */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isPreloaderDone ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-3 mb-6"
      >
        <span className="text-[11px] lg:text-[0.85vw] font-semibold tracking-[0.28em] text-[#35363A] uppercase">
          IDC
        </span>
        <div className="w-10 lg:w-[2.8vw] h-[1.5px] bg-[#35363A]"></div>
      </motion.div>

      {/* 3-Column Grid below IDC: left side content, center book, right side content */}
      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-stretch">
        
        {/* Left Column (col-span-3) - Expands to fill height in the row */}
        <div
          className="lg:col-span-3 flex flex-col justify-start text-center lg:text-left items-center lg:items-start py-1 h-full"
        >
          {/* Main Headline: INTERACTIVE DIGITAL CATALOGUE - expanded line height */}
          <motion.h1
            initial={{ opacity: 0, x: -35 }}
            animate={isPreloaderDone ? { opacity: 1, x: 0 } : { opacity: 0, x: -35 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.35vw] font-semibold text-[#35363A] leading-[1.3] sm:leading-[1.25] lg:leading-[1.55] tracking-tight"
          >
            INTERACTIVE <br className="inline sm:hidden lg:inline" />DIGITAL <br className="hidden sm:inline" />
            <span className="text-[#EC5137] font-semibold tracking-normal">CATALOGUE</span>
          </motion.h1>

          {/* Bottom Sub-group: Divider + Description */}
          <div className="pt-3 sm:pt-4 md:pt-4 flex flex-col items-center lg:items-start w-full">
            {/* Thin Horizontal Rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isPreloaderDone ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[200px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[19vw] h-[1px] bg-gray-200 mb-3 sm:mb-4 lg:mb-[1.5vw] origin-left"
            ></motion.div>

            {/* Description Paragraph: font weight light & #555555, line height 160% */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs sm:text-sm md:text-base lg:text-[0.92vw] font-light text-[#555555] leading-[160%] max-w-[290px] sm:max-w-[500px] md:max-w-[560px] lg:max-w-[20vw] text-center sm:text-justify lg:text-left"
            >
              Transform your products and ideas into immersive digital catalogues with interactive content, rich visuals, and engaging page-turn experiences.
            </motion.p>
          </div>
        </div>

        {/* Center Column: Interactive Flipbook with Page Turning (col-span-6) - Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={isPreloaderDone ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="lg:col-span-6 flex flex-col items-center justify-center self-center relative my-2 sm:my-4 lg:my-0 px-1 sm:px-2 w-full"
        >
          <div className="relative mx-auto w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[640px] lg:max-w-[48vw] h-[340px] xs:h-[390px] sm:h-[420px] md:h-[460px] lg:h-[30vw] flex items-center justify-center group drop-shadow-[0_22px_40px_rgba(0,0,0,0.22)]">
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
              animate={isPreloaderDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 35 }}
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
              animate={isPreloaderDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.85, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-lg md:text-xl lg:text-[0.95vw] font-semibold text-[#35363A] tracking-wider uppercase mt-1.5 sm:mt-2.5 leading-[1.6]"
            >
              CONTENT.<br />STORY.
            </motion.div>

            {/* Interactive, Imm..... - #555555 & medium */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
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
              animate={isPreloaderDone ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.85, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-24 sm:w-36 md:w-44 lg:w-[5.4vw] h-[2px] bg-[#EC5137] mt-2.5 sm:mt-3.5 self-center lg:self-end origin-right"
            ></motion.div>
          </div>

          {/* Center Block: Connected Horizontal Stepper 1 - 2 - 3 (Desktop only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isPreloaderDone ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
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
            animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.85, delay: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center lg:items-end w-full mt-4 sm:mt-6 lg:mt-0"
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

      {/* Center Bottom Action Buttons with Smooth Hover Color Animations */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={isPreloaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
        transition={{ duration: 0.85, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center justify-center gap-3.5 sm:gap-5 lg:gap-[1.1vw] mt-7 sm:mt-9 lg:mt-[2.2vw] z-20"
      >
        {/* View Live Demo Button */}
        <button
          onClick={() => {
            const el = document.getElementById('interactive-demo-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ borderRadius: '17.34px' }}
          className="group relative flex items-center gap-2 sm:gap-2.5 px-5 py-2 sm:px-7 sm:py-3.5 lg:px-[1.55vw] lg:py-[0.65vw] bg-white hover:bg-[#141b24] border border-gray-200 hover:border-[#141b24] text-[#35363A] hover:text-white font-medium text-[11px] sm:text-[15px] md:text-base lg:text-[0.8vw] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(20,27,36,0.22)] transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
        >
          <div className="w-4.5 h-4.5 sm:w-6 sm:h-6 lg:w-4.5 lg:h-4.5 rounded-full bg-[#35363A] group-hover:bg-[#EC5137] text-white flex items-center justify-center transition-colors duration-300">
            <Icon icon="ic:round-play-arrow" className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3 fill-current ml-0.5" />
          </div>
          <span>View Live Demo</span>
        </button>

        {/* My Flipbook Button */}
        <button
          onClick={() => navigate && navigate('/my-flipbooks')}
          style={{ borderRadius: '17.34px' }}
          className="group relative flex items-center gap-2 sm:gap-2.5 px-5 py-2 sm:px-7 sm:py-3.5 lg:px-[1.55vw] lg:py-[0.65vw] bg-[#141b24] hover:bg-[#EC5137] text-[#FFFFFF] font-medium text-[11px] sm:text-[15px] md:text-base lg:text-[0.8vw] shadow-[0_6px_16px_rgba(20,27,36,0.25)] hover:shadow-[0_8px_22px_rgba(236,81,55,0.35)] transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
        >
          <span>My Flipbook</span>
          <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 lg:w-3.5 lg:h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </motion.div>

    </section>
  );
}
