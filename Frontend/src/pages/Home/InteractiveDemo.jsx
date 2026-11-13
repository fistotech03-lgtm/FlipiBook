import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import audioTrack from '../../assets/Audios/audio.mp3';

import page1 from '../../assets/Home/A4_1.webp';
import page2 from '../../assets/Home/A4_2.webp';
import page3 from '../../assets/Home/A4_3.webp';
import page4 from '../../assets/Home/A4_4.webp';
import page5 from '../../assets/Home/A4_5.webp';
import page6 from '../../assets/Home/A4_6.webp';

import demoBook1 from '../../assets/Home/demo1.png';
import demoBook2 from '../../assets/Home/demo2.png';
import demoBook3 from '../../assets/Home/demo3.png';
import demoBook4 from '../../assets/Home/demo4.png';
import demoBook5 from '../../assets/Home/demo5.png';

export default function InteractiveDemo() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeModalBook, setActiveModalBook] = useState(null);

  // Modal Flipbook state
  const modalBookRef = useRef(null);
  const [modalActiveStep, setModalActiveStep] = useState(1);
  const modalActiveStepRef = useRef(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const playIntervalRef = useRef(null);
  const modalAudioRef = useRef(null);
  const bgAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const isWheelingRef = useRef(false);

  const heroPages = [page1, page2, page3, page4, page5, page6];

  useEffect(() => {
    modalAudioRef.current = new Audio(softCoverAudio);
    bgAudioRef.current = new Audio(audioTrack);
    bgAudioRef.current.loop = true;

    return () => {
      if (modalAudioRef.current) {
        modalAudioRef.current.pause();
        modalAudioRef.current = null;
      }
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, []);

  // Control background music on modal open / mute toggle
  useEffect(() => {
    if (activeModalBook && !isMuted) {
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch(() => {});
      }
    } else {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    }
  }, [activeModalBook, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (bgAudioRef.current) {
        if (next) {
          bgAudioRef.current.pause();
        } else if (activeModalBook) {
          bgAudioRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  }, [activeModalBook]);

  const playFlipSound = useCallback(() => {
    if (!isMuted && modalAudioRef.current) {
      modalAudioRef.current.currentTime = 0;
      modalAudioRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  const flipToStep = useCallback((stepNumber) => {
    if (!modalBookRef.current) return;
    const pageFlipObj = modalBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    let targetPageIndex = 0;
    if (stepNumber === 1) targetPageIndex = 0;
    else if (stepNumber === 2) targetPageIndex = 2;
    else if (stepNumber === 3) targetPageIndex = 4;

    pageFlipObj.flip(targetPageIndex);
    setModalActiveStep(stepNumber);
    modalActiveStepRef.current = stepNumber;
    playFlipSound();
  }, [playFlipSound]);

  const flipNext = useCallback(() => {
    if (modalActiveStepRef.current < 3) {
      flipToStep(modalActiveStepRef.current + 1);
    }
  }, [flipToStep]);

  const flipPrev = useCallback(() => {
    if (modalActiveStepRef.current > 1) {
      flipToStep(modalActiveStepRef.current - 1);
    }
  }, [flipToStep]);

  // Autoplay handler: auto flip through pages, and when last page is reached, turn off play and return to page 1
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying && activeModalBook) {
      playIntervalRef.current = setInterval(() => {
        const current = modalActiveStepRef.current;
        if (current >= 3) {
          // Reached the last page: stop autoplay and return to 1st page
          setIsPlaying(false);
          isPlayingRef.current = false;
          clearInterval(playIntervalRef.current);
          flipToStep(1);
        } else {
          flipToStep(current + 1);
        }
      }, 3000);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, activeModalBook, flipToStep]);

  // Reset autoplay and step on modal close
  useEffect(() => {
    if (!activeModalBook) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setModalActiveStep(1);
      modalActiveStepRef.current = 1;
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
  }, [activeModalBook]);

  const onBookFlip = useCallback((e) => {
    const pageIndex = e.data;
    let step = 1;
    if (pageIndex >= 4) step = 3;
    else if (pageIndex >= 2) step = 2;
    else step = 1;
    setModalActiveStep(step);
    modalActiveStepRef.current = step;
    playFlipSound();
  }, [playFlipSound]);

  // Handle wheel scrolling inside modal to flip pages
  const handleModalWheel = useCallback((e) => {
    if (!modalBookRef.current) return;
    const pageFlipObj = modalBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    e.preventDefault();
    e.stopPropagation();

    if (isWheelingRef.current) return;

    if (e.deltaY > 0) {
      // scroll down -> flip next
      if (modalActiveStepRef.current < 3) {
        isWheelingRef.current = true;
        flipToStep(modalActiveStepRef.current + 1);
        setTimeout(() => {
          isWheelingRef.current = false;
        }, 600);
      }
    } else if (e.deltaY < 0) {
      // scroll up -> flip prev
      if (modalActiveStepRef.current > 1) {
        isWheelingRef.current = true;
        flipToStep(modalActiveStepRef.current - 1);
        setTimeout(() => {
          isWheelingRef.current = false;
        }, 600);
      }
    }
  }, [flipToStep]);

  const books = [
    {
      id: 0,
      title: "The Wise",
      subtitle: "Man's Fear",
      cover: demoBook1,
    },
    {
      id: 1,
      title: "Beyond",
      subtitle: "Horizons",
      cover: demoBook2,
    },
    {
      id: 2,
      title: "Design",
      subtitle: "Essential",
      cover: demoBook3,
    },
    {
      id: 3,
      title: "Future",
      subtitle: "Forward",
      cover: demoBook4,
    },
    {
      id: 4,
      title: "Culinary",
      subtitle: "Stories",
      cover: demoBook5,
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.6 }}
      id="interactive-demo-section"
      className="w-full bg-[#f6f6f6] pt-8 pb-10 sm:pt-10 sm:pb-14 lg:pt-[2.6vw] lg:pb-[3.5vw] px-6 sm:px-8 md:px-10 lg:px-[4.2vw] font-poppins select-none [--book-shadow:2px_4px_7px_rgba(0,0,0,0.18)] sm:[--book-shadow:4px_7px_12px_rgba(0,0,0,0.22)] lg:[--book-shadow:8px_14px_20px_rgba(0,0,0,0.28)] [--book-shadow-hover:4px_6px_10px_rgba(0,0,0,0.24)] sm:[--book-shadow-hover:6px_10px_16px_rgba(0,0,0,0.28)] lg:[--book-shadow-hover:10px_18px_24px_rgba(0,0,0,0.36)]"
    >
      <div className="w-full mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 lg:gap-[4.2vw]">
        
        {/* Left Column: Heading, Subtitle & Description (Left-aligned like About Us) */}
        <div
          className="w-full lg:w-[24%] flex flex-col text-left items-start shrink-0"
        >
          {/* Header Tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-start gap-2.5 sm:gap-3 mb-2.5 sm:mb-3.5 lg:mb-[1.1vw]"
          >
            <span className="text-[9.5px] sm:text-[10px] lg:text-[0.7vw] font-medium tracking-[0.2em] text-[#2c2f35] uppercase">
              INTERACTIVE CATALOGUE DEMO
            </span>
            <div className="w-6 sm:w-8 lg:w-[2.2vw] h-[1.5px] bg-[#9ca0a6]"></div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-[32px] xs:text-[36px] sm:text-[44px] md:text-[48px] lg:text-[2.6vw] font-bold text-[#202227] leading-[1.25] sm:leading-[1.2] md:leading-[1.18] lg:leading-[3.5vw] tracking-tight text-left"
          >
            <span className="whitespace-nowrap">See Your Products</span> <br />
            <span className="text-[#ED5B43]">Come to Life</span> <br />
            with FlipiBook
          </motion.h2>

          {/* Thin Divider Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-32 sm:w-full max-w-[220px] lg:max-w-[15.5vw] h-[1px] bg-[#d2d4d8] mt-3 sm:mt-5 lg:mt-[1.4vw] mb-3 sm:mb-4 lg:mb-[1.2vw] origin-left self-start"
          ></motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.85, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12px] sm:text-[13.5px] md:text-[14px] lg:text-[0.82vw] text-[#6d7178] font-normal leading-[165%] text-justify w-full max-w-full sm:max-w-[480px] lg:max-w-[17vw]"
          >
            Explore our interactive digital catalogue demos. Turn the pages, watch product videos, and rotate 3D models to see products from different angles. Discover how FlipiBook helps customers understand what you sell.
          </motion.p>

          {/* CTA Button: Explore Demo Catalogues */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.85, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 sm:mt-5 lg:mt-[1.5vw]"
          >
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('explore-section') || document.querySelector('[class*="ExploreShowcase"]');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#ED5B43] hover:bg-[#d84e37] text-white rounded-lg text-xs sm:text-sm lg:text-[0.82vw] font-medium shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Explore Demo Catalogues</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: 5 Standing Books with Staggered Entrance */}
        <div className="w-full lg:flex-1 flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6 md:gap-4 lg:gap-[2.5vw] overflow-visible pb-2 sm:pb-3 lg:pb-0 px-2 sm:px-4 lg:px-2">
          {/* Top Row on Mobile: 3 Books */}
          <div className="w-full flex items-start justify-center gap-4 sm:gap-6 md:contents">
            {books.slice(0, 3).map((book, idx) => {
              const isHovered = selectedBook === idx;
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setSelectedBook(idx)}
                  onMouseLeave={() => setSelectedBook(null)}
                  onClick={() => setActiveModalBook(book)}
                  className="flex flex-col items-center flex-1 max-w-[95px] xs:max-w-[105px] sm:max-w-[125px] md:max-w-[155px] cursor-pointer group transition-all duration-300"
                >
                  <div className="relative w-full flex flex-col items-center">
                    <div
                      className={`relative z-10 w-full flex items-center justify-center transition-transform duration-300 transform ${
                        isHovered ? '-translate-y-1.5 sm:-translate-y-2 scale-[1.025]' : 'hover:-translate-y-1'
                      }`}
                    >
                      <img
                        src={book.cover}
                        alt={`${book.title} ${book.subtitle}`}
                        className="w-full max-w-[88px] xs:max-w-[98px] sm:max-w-[115px] md:max-w-full h-auto object-contain select-none pointer-events-none rounded-[1px] transition-all duration-300"
                        style={{
                          filter: isHovered
                            ? 'drop-shadow(var(--book-shadow-hover, 5px 8px 12px rgba(0, 0, 0, 0.28)))'
                            : 'drop-shadow(var(--book-shadow, 3px 5px 9px rgba(0, 0, 0, 0.20)))',
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3.5 md:mt-5 lg:mt-[1.6vw] text-center select-none flex flex-col items-center w-full px-0.5">
                    <h4 className="text-[10px] sm:text-xs md:text-[13px] lg:text-[0.92vw] font-medium text-[#2c2f35] tracking-tight sm:tracking-wide leading-tight sm:leading-snug truncate max-w-full">
                      {book.title}
                    </h4>
                    <p className="text-[9px] sm:text-[11px] md:text-xs lg:text-[0.82vw] font-light text-[#5a5e65] tracking-tight sm:tracking-wide leading-tight sm:leading-snug mt-0.5 truncate max-w-full">
                      {book.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Row on Mobile: 2 Books centered */}
          <div className="w-full flex items-start justify-center gap-4 sm:gap-6 md:contents">
            {books.slice(3, 5).map((book, sliceIdx) => {
              const idx = sliceIdx + 3;
              const isHovered = selectedBook === idx;
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setSelectedBook(idx)}
                  onMouseLeave={() => setSelectedBook(null)}
                  onClick={() => setActiveModalBook(book)}
                  className="flex flex-col items-center flex-1 max-w-[95px] xs:max-w-[105px] sm:max-w-[125px] md:max-w-[155px] cursor-pointer group transition-all duration-300"
                >
                  <div className="relative w-full flex flex-col items-center">
                    <div
                      className={`relative z-10 w-full flex items-center justify-center transition-transform duration-300 transform ${
                        isHovered ? '-translate-y-1.5 sm:-translate-y-2 scale-[1.025]' : 'hover:-translate-y-1'
                      }`}
                    >
                      <img
                        src={book.cover}
                        alt={`${book.title} ${book.subtitle}`}
                        className="w-full max-w-[88px] xs:max-w-[98px] sm:max-w-[115px] md:max-w-full h-auto object-contain select-none pointer-events-none rounded-[1px] transition-all duration-300"
                        style={{
                          filter: isHovered
                            ? 'drop-shadow(var(--book-shadow-hover, 5px 8px 12px rgba(0, 0, 0, 0.28)))'
                            : 'drop-shadow(var(--book-shadow, 3px 5px 9px rgba(0, 0, 0, 0.20)))',
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3.5 md:mt-5 lg:mt-[1.6vw] text-center select-none flex flex-col items-center w-full px-0.5">
                    <h4 className="text-[10px] sm:text-xs md:text-[13px] lg:text-[0.92vw] font-medium text-[#2c2f35] tracking-tight sm:tracking-wide leading-tight sm:leading-snug truncate max-w-full">
                      {book.title}
                    </h4>
                    <p className="text-[9px] sm:text-[11px] md:text-xs lg:text-[0.82vw] font-light text-[#5a5e65] tracking-tight sm:tracking-wide leading-tight sm:leading-snug mt-0.5 truncate max-w-full">
                      {book.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal with Augmented Reality / Interactive Digital Catalogue Flipbook */}
      <AnimatePresence>
        {activeModalBook && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-20 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveModalBook(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-6xl xl:max-w-7xl bg-white rounded-2xl shadow-2xl p-4 sm:p-5 lg:p-6 flex flex-col items-center max-h-[86vh] overflow-hidden mt-4 sm:mt-6"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleModalWheel}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalBook(null)}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>

              {/* Modal Top Title */}
              <div className="w-full flex items-center justify-between border-b border-gray-100 pb-2 mb-2 pr-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#EC5137] uppercase">
                    Interactive Catalogue Demo
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {activeModalBook.title} {activeModalBook.subtitle}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:inline-block">
                  Scroll or click page to flip
                </span>
              </div>

              {/* Flipbook Container with Left & Right Floating Arrows */}
              <div className="relative w-full flex-1 flex items-center justify-center py-1 sm:py-2 px-8 sm:px-14">
                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={flipPrev}
                  disabled={modalActiveStep <= 1}
                  className={`absolute left-1 sm:left-3 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    modalActiveStep <= 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40'
                      : 'bg-white hover:bg-gray-50 text-gray-800 hover:text-[#EC5137] hover:scale-105 active:scale-95'
                  }`}
                  aria-label="Previous Page"
                >
                  <Icon icon="lucide:chevron-left" className="w-6 h-6" />
                </button>

                {/* Flipbook Canvas */}
                <div className="w-full max-w-[1000px] xl:max-w-[1100px] h-[58vh] max-h-[540px] flex items-center justify-center overflow-visible">
                  <HTMLFlipBook
                    width={595}
                    height={842}
                    size="stretch"
                    minWidth={320}
                    maxWidth={1200}
                    minHeight={250}
                    maxHeight={950}
                    maxShadowOpacity={0.5}
                    showCover={false}
                    mobileScrollSupport={true}
                    clickEventForward={false}
                    useMouseEvents={true}
                    onFlip={onBookFlip}
                    flippingTime={800}
                    swipeDistance={30}
                    ref={modalBookRef}
                    startPage={0}
                    className="w-full h-full mx-auto"
                  >
                    {heroPages.map((pageSrc, index) => (
                      <div key={index} className="bg-white overflow-hidden shadow-inner flex items-center justify-center w-full h-full">
                        <img
                          src={pageSrc}
                          alt={`Page ${index + 1}`}
                          className="w-full h-full object-contain select-none pointer-events-none"
                        />
                      </div>
                    ))}
                  </HTMLFlipBook>
                </div>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={flipNext}
                  disabled={modalActiveStep >= 3}
                  className={`absolute right-1 sm:right-3 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    modalActiveStep >= 3
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40'
                      : 'bg-white hover:bg-gray-50 text-gray-800 hover:text-[#EC5137] hover:scale-105 active:scale-95'
                  }`}
                  aria-label="Next Page"
                >
                  <Icon icon="lucide:chevron-right" className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Controls: Play/Pause Icon, Slim Progress Bar, and Page Indicator */}
              <div className="relative w-full max-w-2xl flex items-center justify-center gap-3.5 mt-2 pt-1">
                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EC5137] hover:bg-[#d84e37] text-white flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer shrink-0"
                  title={isPlaying ? "Pause autoplay" : "Play flipbook"}
                >
                  <Icon icon={isPlaying ? "lucide:pause" : "lucide:play"} className="w-4 h-4 ml-0.5" />
                </button>

                {/* Slim Progress Bar */}
                <div
                  className="flex-1 h-1.5 bg-gray-200 hover:bg-gray-300 rounded-full cursor-pointer relative overflow-hidden transition-colors"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = clickX / rect.width;
                    if (pct < 0.35) flipToStep(1);
                    else if (pct < 0.7) flipToStep(2);
                    else flipToStep(3);
                  }}
                  title="Click to jump to section"
                >
                  <motion.div
                    className="h-full bg-[#EC5137] rounded-full"
                    animate={{ width: `${(modalActiveStep / 3) * 100}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>

                {/* Page / Step Number */}
                <span className="text-xs sm:text-[13px] font-semibold text-gray-700 tracking-wider shrink-0 min-w-[3rem] text-right">
                  {modalActiveStep} / 3
                </span>

                {/* Right Bottom Corner Sound/Mute Toggle Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute -right-10 sm:-right-16 md:-right-24 bottom-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer"
                  title={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  <Icon icon={isMuted ? "lucide:volume-x" : "lucide:volume-2"} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

