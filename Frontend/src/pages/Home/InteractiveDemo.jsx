import React, { useState } from 'react';
import { motion } from 'framer-motion';
import demoBook1 from '../../assets/Home/final-images/interactive-demo-section/interactive-demo-book-1.webp';
import demoBook2 from '../../assets/Home/final-images/interactive-demo-section/interactive-demo-book-2.webp';
import demoBook3 from '../../assets/Home/final-images/interactive-demo-section/interactive-demo-book-3.webp';
import demoBook4 from '../../assets/Home/final-images/interactive-demo-section/interactive-demo-book-4.webp';
import demoBook5 from '../../assets/Home/final-images/interactive-demo-section/interactive-demo-book-5.webp';

export default function InteractiveDemo() {
  const [selectedBook, setSelectedBook] = useState(null);

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
    </motion.section>
  );
}

