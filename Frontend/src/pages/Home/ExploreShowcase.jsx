import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import c1 from '../../assets/Home/final-images/explore-section/explore-slider-img-1.webp';
import c2 from '../../assets/Home/final-images/explore-section/explore-slider-img-2.webp';
import c3 from '../../assets/Home/final-images/explore-section/explore-slider-img-3.webp';
import c4 from '../../assets/Home/final-images/explore-section/explore-slider-img-4.webp';
import c5 from '../../assets/Home/final-images/explore-section/explore-slider-img-5.webp';
import p1 from '../../assets/Explore/p1.png';

export default function ExploreShowcase({ navigate, onOpenCreateModal }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [likedBooks, setLikedBooks] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

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
      views: "12.5k",
      rating: "4.5",
    },
    {
      id: 2,
      cover: c2,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p1,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k",
      rating: "4.5",
    },
    {
      id: 3,
      cover: c3,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p1,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k",
      rating: "4.5",
    },
    {
      id: 4,
      cover: c4,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p1,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k",
      rating: "4.5",
    },
    {
      id: 5,
      cover: c5,
      author: "Alex Johnson",
      authorRole: "Coimbatore",
      avatar: p1,
      title: "Name of the Flipbook",
      desc: '"Bring your content to life with a real, interactive experience"',
      pages: "12 Pages",
      views: "12.5k",
      rating: "4.5",
    }
  ];

  // Multiple cards for carousel
  const flipbooks = [
    ...baseFlipbooks.map((b, i) => ({ ...b, uniqueId: `b1-${i}` })),
    ...baseFlipbooks.map((b, i) => ({ ...b, uniqueId: `b2-${i}` })),
    ...baseFlipbooks.map((b, i) => ({ ...b, uniqueId: `b3-${i}` }))
  ];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  // Close popup menu on click outside or on scroll/resize
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.card-menu-container') && !e.target.closest('.card-fixed-portal-menu')) {
        setActiveMenuId(null);
        setMenuPosition(null);
      }
    };
    const handleScrollOrResize = () => {
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector('.snap-start');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : 300;
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector('.snap-start');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : 300;
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const [menuPosition, setMenuPosition] = useState(null);

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedBooks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate right-side position relative to the 3-dots button
      setMenuPosition({
        top: rect.top,
        left: rect.right + 8,
      });
      setActiveMenuId(id);
    }
  };

  const menuOptions = [
    { label: 'View Book', icon: 'lucide:eye' },
    { label: 'Creator Profile', icon: 'solar:user-bold' },
    { label: 'Share', icon: 'lucide:share-2' },
    { label: 'Download', icon: 'lucide:download' },
    { label: 'Report', icon: 'lucide:alert-circle' },
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.8 }} className="w-full bg-white py-12 lg:py-[3.5vw] px-6 sm:px-10 lg:px-[4.5vw] font-poppins relative">
      
      {/* Top Header Tag */}
      <div className="w-full flex items-center gap-3 lg:gap-[0.6vw] mb-4 lg:mb-[1.2vw]">
        <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-[#35363A] uppercase">
          EXPLORE
        </span>
        <div className="w-8 lg:w-[2.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#35363A]/25"></div>
      </div>

      {/* Main Center Title */}
      <div className="w-full text-center mb-6 sm:mb-8 lg:mb-[2.6vw]">
        <h2 className="text-2xl sm:text-4xl lg:text-[2.6vw] font-bold text-[#0D0F11] tracking-tight inline-flex items-baseline justify-center flex-wrap">
          <span>Disc</span>
          <span className="inline-flex self-center items-center justify-center text-[#EC5137] mx-[0.02em] translate-y-[0.05em]">
            <Icon icon="weui:discover-outlined" className="w-[0.8em] h-[0.8em]" />
          </span>
          <span>ver.&nbsp;&nbsp;Read.&nbsp;&nbsp;Get Inspired</span>
        </h2>
        <p className="text-xs sm:text-sm lg:text-[0.92vw] text-[#717680] font-normal mt-2 sm:mt-3 lg:mt-[1vw] leading-[1.6]">
          Dive into interactive flipbooks created by our community <br className="hidden sm:inline" />
          click any book to start reading
        </p>
      </div>

      {/* Slider Area with Left/Right Arrow Buttons */}
      <div className="w-full relative flex items-center px-2 sm:px-8 lg:px-[2.5vw]">
        
        {/* Left Arrow Button */}
        <button
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          title="Scroll Left"
          className={`absolute left-0 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-[2.6vw] lg:h-[2.6vw] rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-all ${
            canScrollLeft ? 'opacity-100 cursor-pointer active:scale-95' : 'opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-[1.2vw] lg:h-[1.2vw] text-gray-800" />
        </button>

        {/* Cards Row Carousel */}
        <div
          ref={scrollRef}
          className="w-full flex items-stretch gap-6 sm:gap-7 lg:gap-[2vw] overflow-x-auto py-3 px-1 scroll-smooth scrollbar-none snap-x"
        >
          {flipbooks.map((book) => {
            const isLiked = Boolean(likedBooks[book.uniqueId]);
            const isMenuOpen = activeMenuId === book.uniqueId;
            const isActive = activeCardId === book.uniqueId;

            return (
              <div
                key={book.uniqueId}
                onMouseEnter={() => setActiveCardId(book.uniqueId)}
                onMouseLeave={() => setActiveCardId(null)}
                className="w-[260px] sm:w-[275px] lg:w-[15.8vw] shrink-0 bg-white border border-gray-300/80 rounded-2xl lg:rounded-[1vw] overflow-hidden flex flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.05)] hover:border-gray-400 hover:shadow-[0_0_0_1.5px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] transition-all duration-300 group cursor-pointer snap-start relative"
                onClick={() => navigate && navigate('/explore')}
              >
                {/* Card Thumbnail Image with bottom left & right rounded corners */}
                <div className="relative w-full aspect-[4/3.5] lg:aspect-[4/3.4] overflow-hidden rounded-b-xl lg:rounded-b-[0.9vw] flex items-center justify-center bg-[#F4E8DF] shrink-0">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-b-xl lg:rounded-b-[0.9vw]"
                  />

                  {/* Top Right Floating Actions: Heart and 3-dots */}
                  <div className="absolute top-2.5 right-2.5 lg:top-[0.6vw] lg:right-[0.6vw] flex flex-col items-center gap-1.5 lg:gap-[0.4vw] z-10 card-menu-container">
                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => toggleLike(e, book.uniqueId)}
                      className="w-7 h-7 sm:w-7.5 sm:h-7.5 lg:w-[1.9vw] lg:h-[1.9vw] rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs hover:bg-white transition-all cursor-pointer"
                    >
                      <Icon
                        icon={isLiked ? "fa6-solid:heart" : "fa6-regular:heart"}
                        className={`w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] ${isLiked ? "text-red-500" : "text-gray-800"}`}
                      />
                    </button>

                    {/* 3-dots More Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(e, book.uniqueId)}
                        className="w-7 h-7 sm:w-7.5 sm:h-7.5 lg:w-[1.9vw] lg:h-[1.9vw] rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-gray-800 hover:bg-white transition-all shadow-xs cursor-pointer"
                      >
                        <Icon icon="mdi:dots-vertical" className="w-4 h-4 lg:w-[1vw] lg:h-[1vw]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body with precise vertical spacing matching reference */}
                <div className="p-3.5 sm:p-4 lg:p-[1vw] flex-1 flex flex-col justify-between">
                  <div>
                    {/* Author Row */}
                    <div className="flex items-center gap-2.5 lg:gap-[0.6vw] mb-3 lg:mb-[0.75vw]">
                      <img
                        src={book.avatar}
                        alt={book.author}
                        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full object-cover shrink-0 ring-1 ring-emerald-100/70"
                      />
                      <div className="flex flex-col text-left min-w-0 justify-center">
                        <span className="text-[13px] sm:text-[14px] lg:text-[0.85vw] font-normal text-[#000000] leading-tight truncate">
                          {book.author}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] lg:text-[0.68vw] font-light text-[#858585] mt-0.5">
                          <span className="truncate leading-none">{book.authorRole}</span>
                          <span className="text-[11px] lg:text-[0.68vw] leading-none text-red-500">📍</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row without full divider border */}
                    <div className="flex items-center gap-3 lg:gap-[0.7vw] text-[11px] sm:text-xs lg:text-[0.74vw] pt-0.5 pb-3 lg:pb-[0.8vw] whitespace-nowrap">
                      <span className="text-[#000000]">
                        <span className="font-medium">{book.pages.split(' ')[0]}</span>{' '}
                        <span className="font-normal text-gray-500">{book.pages.split(' ')[1] || 'Pages'}</span>
                      </span>
                      <span className="text-gray-300 font-light">|</span>
                      <span className="flex items-center gap-1.5 lg:gap-[0.3vw] text-[#000000] font-medium">
                        <Icon icon="lucide:eye" className="w-3.5 h-3.5 lg:w-[0.8vw] lg:h-[0.8vw] text-gray-700" />
                        <span>{book.views}</span>
                      </span>
                      <span className="text-gray-300 font-light">|</span>
                      <span className="flex items-center gap-1.5 lg:gap-[0.3vw] text-[#000000] font-medium">
                        <Icon icon="fa6-solid:star" className="w-3 h-3 lg:w-[0.7vw] lg:h-[0.7vw] text-[#EAB308]" />
                        <span>{book.rating}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description with Bottom Right Orange Button */}
                  <div className="relative text-left flex-1 flex flex-col justify-between pt-1 min-h-[4rem] lg:min-h-[3.8vw]">
                    <div className="pr-12 lg:pr-[3vw]">
                      <h4 className="text-sm sm:text-[15px] lg:text-[0.96vw] font-medium text-[#000000] leading-snug mb-1.5 lg:mb-[0.35vw] whitespace-normal">
                        {book.title}
                      </h4>
                      <p className="text-[11.5px] sm:text-xs lg:text-[0.76vw] font-normal text-[#555555] leading-relaxed whitespace-normal">
                        {book.desc}
                      </p>
                    </div>

                    {/* Card Action Button: Orange only on active card, otherwise black */}
                    <div
                      className={`absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full text-white flex items-center justify-center shadow-sm shrink-0 transition-all duration-300 ${
                        isActive
                          ? 'bg-[#EA5834] scale-105 shadow-[0_4px_12px_rgba(234,88,52,0.35)]'
                          : 'bg-[#1a1a1a] group-hover:bg-[#EA5834]'
                      }`}
                    >
                      <Icon icon="lucide:arrow-up-right" className="w-4 h-4 lg:w-[1.05vw] lg:h-[1.05vw] stroke-[2.5]" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Arrow Button with disabled fade */}
        <button
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          title="Scroll Right"
          className={`absolute right-0 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-[2.6vw] lg:h-[2.6vw] rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-all ${
            canScrollRight ? 'opacity-100 cursor-pointer active:scale-95' : 'opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-[1.2vw] lg:h-[1.2vw] text-gray-800" />
        </button>

      </div>

      {/* Bottom Center Two CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-[1.2vw] mt-6 sm:mt-8 lg:mt-[2.5vw] w-full max-w-sm sm:max-w-none mx-auto">
        <button
          onClick={() => onOpenCreateModal && onOpenCreateModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 lg:gap-[0.6vw] px-5 sm:px-6 py-2.5 sm:py-3 lg:px-[1.8vw] lg:py-[0.85vw] bg-white border border-gray-200/90 hover:border-gray-300 text-gray-900 rounded-xl sm:rounded-2xl lg:rounded-[1vw] font-medium text-xs sm:text-sm lg:text-[0.9vw] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <span>Create Your Flipbook</span>
          <Icon icon="proicons:book-open" className="w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw] text-gray-900" />
        </button>

        <button
          onClick={() => navigate && navigate('/explore')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-[0.8vw] px-5 sm:px-6 py-2.5 sm:py-3 lg:px-[1.8vw] lg:py-[0.85vw] bg-black hover:bg-neutral-900 text-white rounded-xl sm:rounded-2xl lg:rounded-[1vw] font-medium text-xs sm:text-sm lg:text-[0.9vw] shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:shadow-lg transition-all duration-300 cursor-pointer group"
        >
          <span>Explore more Flipbooks</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-[1.5vw] lg:h-[1.5vw] rounded-full bg-white text-black flex items-center justify-center group-hover:bg-[#FE4B0F] group-hover:text-white transition-colors shrink-0">
            <Icon icon="lucide:arrow-up-right" className="w-3.5 h-3.5 lg:w-[0.9vw] lg:h-[0.9vw] stroke-[2.5]" />
          </div>
        </button>
      </div>

      {/* Fixed Unclipped Right-Side Popup Menu */}
      {activeMenuId && menuPosition && (
        <div
          className="fixed z-50 card-fixed-portal-menu bg-white rounded-2xl shadow-2xl py-2 px-1 border border-gray-100 text-left w-44 lg:w-[11vw] animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveMenuId(null);
                setMenuPosition(null);
                if (navigate) navigate('/explore');
              }}
              className="w-full flex items-center gap-3 lg:gap-[0.7vw] px-3.5 lg:px-[0.9vw] py-2 lg:py-[0.5vw] hover:bg-orange-50/60 text-gray-700 hover:text-[#FE4B0F] rounded-xl text-xs sm:text-[13px] lg:text-[0.78vw] font-medium transition-colors cursor-pointer"
            >
              <Icon icon={opt.icon} className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] shrink-0" />
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

    </motion.section>
  );
}
