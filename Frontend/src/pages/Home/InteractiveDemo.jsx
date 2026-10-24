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
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      id="interactive-demo-section"
      className="w-full bg-[#f6f6f6] pt-8 pb-10 sm:pt-10 sm:pb-14 lg:pt-[2.6vw] lg:pb-[3.5vw] px-6 sm:px-8 md:px-10 lg:px-[4.2vw] font-poppins select-none [--book-shadow:2px_4px_7px_rgba(0,0,0,0.18)] sm:[--book-shadow:4px_7px_12px_rgba(0,0,0,0.22)] lg:[--book-shadow:8px_14px_20px_rgba(0,0,0,0.28)] [--book-shadow-hover:4px_6px_10px_rgba(0,0,0,0.24)] sm:[--book-shadow-hover:6px_10px_16px_rgba(0,0,0,0.28)] lg:[--book-shadow-hover:10px_18px_24px_rgba(0,0,0,0.36)]"
    >
      <div className="w-full mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 lg:gap-[4.2vw]">
        
        {/* Left Column: Heading, Subtitle & Description (Left-aligned like About Us) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-[24%] flex flex-col text-left items-start shrink-0"
        >
          {/* Header Tag */}
          <div className="flex items-center justify-start gap-3 mb-3 sm:mb-4 lg:mb-[1.3vw]">
            <span className="text-[11px] lg:text-[0.82vw] font-bold tracking-[0.22em] text-[#2c2f35] uppercase">
              INTERACTIVE DEMO
            </span>
            <div className="w-8 sm:w-10 lg:w-[2.8vw] h-[1.5px] bg-[#9ca0a6]"></div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl lg:text-[3.2vw] font-bold text-[#202227] leading-[1.08] tracking-tight text-left">
            Experience <br className="hidden lg:inline" />
            <span className="text-[#ED5B43]">Flipibooks</span> <br className="hidden lg:inline" />
            in Action
          </h2>

          {/* Thin Divider Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-32 sm:w-full max-w-[220px] lg:max-w-[15.5vw] h-[1px] bg-[#d2d4d8] mt-3 sm:mt-5 lg:mt-[1.4vw] mb-3 sm:mb-4 lg:mb-[1.2vw] origin-left self-start"
          ></motion.div>

          {/* Description */}
          <p className="text-[12px] sm:text-[13.5px] md:text-[14px] lg:text-[0.82vw] text-[#6d7178] font-normal leading-[165%] text-justify lg:text-left w-full max-w-full sm:max-w-[480px] lg:max-w-[17vw]">
            Explore our handpicked demo books. Flip, zoom, and interact to discover how immersive and engaging digital reading can be.
          </p>
        </motion.div>

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
                  viewport={{ once: false, amount: 0.2 }}
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
                  viewport={{ once: false, amount: 0.2 }}
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

