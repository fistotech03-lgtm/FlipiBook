import React, { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import c1 from '../../assets/Home/final-images/explore-section/explore-slider-img-1.webp';
import c2 from '../../assets/Home/final-images/explore-section/explore-slider-img-2.webp';
import c3 from '../../assets/Home/final-images/explore-section/explore-slider-img-3.webp';
import c4 from '../../assets/Home/final-images/explore-section/explore-slider-img-4.webp';
import c5 from '../../assets/Home/final-images/explore-section/explore-slider-img-5.webp';
import p1 from '../../assets/Explore/p1.png';
import p2 from '../../assets/Explore/p2.png';
import p3 from '../../assets/Explore/p3.png';
import p4 from '../../assets/Explore/p4.png';
import p5 from '../../assets/Explore/p5.png';

export default function ExploreShowcase({ navigate, onOpenCreateModal }) {
  const scrollRef = useRef(null);

  const baseFlipbooks = [
    {
      id: 1,
      cover: c1,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p1,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k reader",
      rating: "4.5 (1,250)",
    },
    {
      id: 2,
      cover: c2,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p2,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k reader",
      rating: "4.5 (1,250)",
    },
    {
      id: 3,
      cover: c3,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p3,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k reader",
      rating: "4.5 (1,250)",
    },
    {
      id: 4,
      cover: c4,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p4,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k reader",
      rating: "4.5 (1,250)",
    },
    {
      id: 5,
      cover: c5,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p5,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k reader",
      rating: "4.5 (1,250)",
    }
  ];

  // Duplicate cards for working carousel (3x to provide seamless sliding)
  const flipbooks = [
    ...baseFlipbooks.map((b, i) => ({ ...b, uniqueId: `b1-${i}` })),
    ...baseFlipbooks.map((b, i) => ({ ...b, uniqueId: `b2-${i}` })),
    ...baseFlipbooks.map((b, i) => ({ ...b, uniqueId: `b3-${i}` }))
  ];

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector('.snap-start');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : 290;
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector('.snap-start');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : 290;
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-[#fdfdfd] py-12 lg:py-[4.5vw] px-4 sm:px-8 lg:px-[5vw] font-poppins border-t border-gray-100 relative">
      
      {/* Top Header Tag */}
      <div className="w-full mx-auto flex items-center gap-3 mb-4 lg:mb-[1vw]">
        <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-gray-700 uppercase">
          EXPLORE
        </span>
        <div className="w-8 lg:w-[2.5vw] h-[1.5px] bg-gray-400"></div>
      </div>

      {/* Main Center Title with Compass Icon */}
      <div className="w-full mx-auto text-center mb-8 lg:mb-[2.5vw]">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.6vw] font-bold text-[#1b222c] tracking-tight inline-flex items-center justify-center gap-1.5 flex-wrap">
          <span>Disc</span>
          <span className="inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full border-2 border-[#ea7233] text-[#ea7233] -mt-1 mx-0.5">
            <Icon icon="lucide:compass" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[1.4vw] lg:h-[1.4vw]" />
          </span>
          <span>ver. Read. Get Inspired</span>
        </h2>
        <p className="text-xs sm:text-sm lg:text-[0.85vw] text-gray-500 font-normal mt-2">
          Dive into interactive flipbooks created by our community <br className="hidden sm:inline" />
          click any book to start reding
        </p>
      </div>

      {/* Slider Area with Left/Right Arrow Buttons */}
      <div className="w-full mx-auto relative flex items-center">
        
        {/* Left Arrow Button */}
        <button
          onClick={handleScrollLeft}
          title="Scroll Left"
          className="absolute -left-3 sm:-left-5 lg:-left-6 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-md hover:bg-gray-50 transition-all cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Cards Row Carousel */}
        <div
          ref={scrollRef}
          className="w-full flex items-stretch gap-4 lg:gap-3.5 overflow-x-auto py-3 px-1 scroll-smooth scrollbar-none snap-x"
        >
          {flipbooks.map((book) => (
            <div
              key={book.uniqueId}
              className="w-[260px] sm:w-[280px] lg:w-[275px] shrink-0 bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer snap-start"
              onClick={() => navigate && navigate('/explore')}
            >
              {/* Card Thumbnail Image with bookmark badge */}
              <div className="relative w-full aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Top Right Orange Bookmark / Ribbon */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 shadow-sm">
                  <Icon icon="lucide:bookmark" className="w-3.5 h-3.5 text-gray-700" />
                </div>
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-2 mt-3 mb-2">
                <img
                  src={book.avatar}
                  alt={book.author}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight">
                    {book.author}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-gray-400">
                    <span>{book.authorRole}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  </div>
                </div>
              </div>

              {/* Stats Row (12 Pages, 12.5k reader, 4.5 star) */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 pb-2 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:book-open" className="w-3 h-3 text-gray-400" />
                  {book.pages}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:eye" className="w-3 h-3 text-gray-400" />
                  {book.views}
                </span>
                <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                  ★ <span className="text-gray-700 font-normal">{book.rating}</span>
                </span>
              </div>

              {/* Title & Quote Description */}
              <div className="mt-2 text-left">
                <h4 className="text-xs font-bold text-gray-900 leading-tight mb-1">
                  {book.title}
                </h4>
                <p className="text-[10px] text-gray-500 italic leading-snug line-clamp-2">
                  {book.desc}
                </p>
              </div>

              {/* Card Footer: Black Circle Arrow Button */}
              <div className="flex justify-end mt-3">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-[#ea7233] transition-colors">
                  <Icon icon="lucide:arrow-up-right" className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleScrollRight}
          title="Scroll Right"
          className="absolute -right-3 sm:-right-5 lg:-right-6 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-md hover:bg-gray-50 transition-all cursor-pointer"
        >
          <Icon icon="lucide:arrow-right" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

      </div>

      {/* Bottom Center Two CTA Buttons */}
      <div className="flex items-center justify-center gap-3 mt-8 lg:mt-[2.2vw]">
        <button
          onClick={() => onOpenCreateModal && onOpenCreateModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-md font-bold text-xs sm:text-sm lg:text-[0.85vw] shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
        >
          <span>Create Your Flipbook</span>
          <Icon icon="lucide:book-open" className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={() => navigate && navigate('/explore')}
          className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-md font-bold text-xs sm:text-sm lg:text-[0.85vw] shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
        >
          <span>Explore more Flipbooks</span>
          <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </section>
  );
}
