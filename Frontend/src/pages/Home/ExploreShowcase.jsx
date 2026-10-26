import React from 'react';
import { motion } from 'framer-motion';
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

  const baseFlipbooks = [
    {
      id: 1,
      cover: c1,
      author: "Elena Rostova",
      authorRole: "Milan, Italy",
      avatar: p1,
      title: "Autumn Lookbook 2026",
      desc: '"Modern seasonal fashion catalogue with tactile fabric swatches and interactive styling."',
      pages: "24 Pages",
      views: "18.4k",
      rating: "4.9",
    },
    {
      id: 2,
      cover: c2,
      author: "Marcus Vance",
      authorRole: "Berlin, Germany",
      avatar: p2,
      title: "Architectural Blueprint",
      desc: '"Contemporary architectural monograph showcasing residential structures and layouts."',
      pages: "36 Pages",
      views: "29.1k",
      rating: "4.8",
    },
    {
      id: 3,
      cover: c3,
      author: "Aarav Mehta",
      authorRole: "Mumbai, India",
      avatar: p3,
      title: "Pulse Design Quarterly",
      desc: '"Curated editorial exploring vibrant typography, brand design, and modern packaging."',
      pages: "18 Pages",
      views: "14.8k",
      rating: "4.7",
    },
    {
      id: 4,
      cover: c4,
      author: "Sophia Chen",
      authorRole: "Toronto, Canada",
      avatar: p4,
      title: "Nordic Living Annual",
      desc: '"Crafted wooden furniture catalogue with immersive 3D previews and buying guides."',
      pages: "48 Pages",
      views: "32.6k",
      rating: "5.0",
    },
    {
      id: 5,
      cover: c5,
      author: "Liam O’Connor",
      authorRole: "Dublin, Ireland",
      avatar: p5,
      title: "Humanity at Work",
      desc: '"Illustrated cultural report celebrating workplace empathy, collaboration, and teams."',
      pages: "22 Pages",
      views: "21.3k",
      rating: "4.9",
    }
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-50px 0px -50px 0px" }} transition={{ duration: 0.8 }} className="w-full bg-white py-12 lg:py-[3.5vw] px-6 sm:px-10 lg:px-[4.5vw] font-poppins relative">
      
      {/* Top Header Tag */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-3 lg:gap-[0.6vw] mb-4 lg:mb-[1.2vw]"
      >
        <span className="text-xs lg:text-[0.8vw] font-bold tracking-[0.25em] text-[#35363A] uppercase">
          EXPLORE
        </span>
        <div className="w-8 lg:w-[2.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#35363A]/25"></div>
      </motion.div>

      {/* Main Center Title */}
      <div className="w-full text-center mb-6 sm:mb-8 lg:mb-[2.6vw]">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-[32px] sm:text-4xl lg:text-[2.6vw] font-bold text-[#0D0F11] tracking-tight inline-flex items-baseline justify-center flex-wrap gap-x-2 leading-[1.18] sm:leading-tight"
        >
          {/* Keep Discover as a single unbreakable word on all screen sizes */}
          <span className="inline-flex items-baseline whitespace-nowrap">
            <span>Disc</span>
            <span className="inline-flex self-center items-center justify-center text-[#EC5137] mx-[0.02em] translate-y-[0.05em]">
              <Icon icon="weui:discover-outlined" className="w-[0.8em] h-[0.8em]" />
            </span>
            <span>ver.</span>
          </span>
          <span className="whitespace-nowrap text-[#EC5137]">Explore.</span>
          <span className="whitespace-nowrap">Get Inspired.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs sm:text-sm lg:text-[0.92vw] text-[#717680] font-normal mt-2.5 sm:mt-3 lg:mt-[1vw] leading-[1.6] max-w-2xl mx-auto px-2 text-justify lg:text-center"
        >
          Explore interactive digital catalogues created with FlipiBook. Find fresh ideas for showcasing your products with videos, 3D models, and clickable content. <br className="hidden sm:inline" />
          <span className="text-[#35363A] font-medium">Click any catalogue to explore.</span>
        </motion.p>
      </div>

      {/* Cards Grid: 1 col on mobile, 2 cols on sm, 6-col subgrid on md (tablet) to center bottom 2 cards, 5 cols on lg (desktop) */}
      <div className="w-full max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-[1.2vw] xl:gap-5">
          {baseFlipbooks.map((book, index) => {
            return (
              <div
                key={book.id}
                className={`w-full bg-white border border-gray-300/80 rounded-2xl lg:rounded-[1vw] overflow-hidden flex flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.05)] hover:border-gray-400 hover:shadow-[0_0_0_1.5px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] transition-all duration-300 group cursor-pointer relative md:col-span-2 lg:col-span-1 ${
                  index === 3 ? 'md:col-start-2 lg:col-start-auto' : ''
                }`}
                onClick={() => navigate && navigate('/explore')}
              >
                {/* Card Thumbnail Image */}
                <div className="relative w-full aspect-[4/3.5] lg:aspect-[4/3.4] overflow-hidden rounded-b-xl lg:rounded-b-[0.9vw] flex items-center justify-center bg-[#F4E8DF] shrink-0">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-b-xl lg:rounded-b-[0.9vw]"
                  />
                </div>

                {/* Card Body */}
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

                  {/* Title & Description */}
                  <div className="text-left flex-1 flex flex-col justify-start pt-1">
                    <h4 className="text-sm sm:text-[15px] lg:text-[0.96vw] font-medium text-[#000000] leading-snug mb-1.5 lg:mb-[0.35vw] whitespace-normal line-clamp-1" title={book.title}>
                      {book.title}
                    </h4>
                    <p className="text-[11.5px] sm:text-xs lg:text-[0.76vw] font-normal text-[#555555] leading-relaxed whitespace-normal line-clamp-2">
                      {book.desc}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Center Two CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-[1.2vw] mt-8 sm:mt-10 lg:mt-[2.5vw] w-full max-w-sm sm:max-w-none mx-auto">
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

    </motion.section>
  );
}
