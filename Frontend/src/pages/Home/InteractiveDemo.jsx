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
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} id="interactive-demo-section" className="w-full bg-[#f6f6f6] pt-8 pb-10 sm:pt-10 sm:pb-14 lg:pt-[2.6vw] lg:pb-[3.5vw] px-4 sm:px-8 lg:px-[4.2vw] font-poppins select-none">
      <div className="w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-[4.2vw]">
        
        {/* Left Column: Heading, Subtitle & Description */}
        <div className="w-full lg:w-[25%] flex flex-col text-left shrink-0">
          
          {/* Header Tag */}
          <div className="flex items-center gap-3 mb-4 lg:mb-[1.3vw]">
            <span className="text-[11px] lg:text-[0.82vw] font-bold tracking-[0.22em] text-[#2c2f35] uppercase">
              INTERACTIVE DEMO
            </span>
            <div className="w-8 sm:w-10 lg:w-[2.8vw] h-[1.5px] bg-[#9ca0a6]"></div>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-[3.2vw] font-bold text-[#202227] leading-[1.08] tracking-tight">
            Experience <br />
            <span className="text-[#ED5B43]">Flipibooks</span> <br />
            in Action
          </h2>

          {/* Thin Divider Line */}
          <div className="w-full max-w-[220px] lg:max-w-[15.5vw] h-[1px] bg-[#d2d4d8] mt-5 lg:mt-[1.4vw] mb-4 lg:mb-[1.2vw]"></div>

          {/* Description */}
          <p className="text-[11px] sm:text-xs lg:text-[0.82vw] text-[#6d7178] font-normal leading-[165%] max-w-[280px] lg:max-w-[17vw]">
            Explore our handpicked demo books. Flip, zoom, and interact to discover how immersive and engaging digital reading can be.
          </p>
        </div>

        {/* Right Column: 5 Standing Books with Code-Rendered Realistic Shadows */}
        <div className="w-full lg:w-[75%] flex items-start justify-between gap-4 sm:gap-6 lg:gap-[3.2vw] overflow-x-auto pb-4 lg:pb-0 scrollbar-none">
          {books.map((book, idx) => {
            const isHovered = selectedBook === idx;
            return (
              <div
                key={book.id}
                onMouseEnter={() => setSelectedBook(idx)}
                onMouseLeave={() => setSelectedBook(null)}
                className="flex flex-col items-center flex-1 min-w-[95px] sm:min-w-[115px] lg:min-w-[120px] max-w-[155px] cursor-pointer group transition-all duration-300"
              >
                {/* 3D Book Graphic Container with Code-Rendered Realistic Soft Wall & Cast Shadow */}
                <div className="relative w-full flex flex-col items-center">
                  
                  {/* Book Image with directional soft cast shadow */}
                  <div
                    className={`relative z-10 w-full flex items-center justify-center transition-transform duration-300 transform ${
                      isHovered ? '-translate-y-2 scale-[1.025]' : 'hover:-translate-y-1'
                    }`}
                  >
                    <img
                      src={book.cover}
                      alt={`${book.title} ${book.subtitle}`}
                      className="w-full h-auto object-contain select-none pointer-events-none rounded-[1px] transition-all duration-300"
                      style={{
                        filter: isHovered
                          ? 'drop-shadow(14px 22px 28px rgba(0, 0, 0, 0.40)) drop-shadow(4px 8px 12px rgba(0, 0, 0, 0.22))'
                          : 'drop-shadow(12px 18px 24px rgba(0, 0, 0, 0.32)) drop-shadow(3px 6px 10px rgba(0, 0, 0, 0.16))',
                      }}
                    />
                  </div>

                </div>

                {/* Book Title & Subtitle Below */}
                <div className="mt-5 sm:mt-6 lg:mt-[1.6vw] text-center select-none flex flex-col items-center">
                  <h4 className="text-xs sm:text-[13px] lg:text-[0.92vw] font-normal text-[#2c2f35] tracking-wide leading-snug">
                    {book.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs lg:text-[0.82vw] font-light text-[#5a5e65] tracking-wide leading-snug mt-0.5">
                    {book.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}

