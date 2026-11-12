import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Footer from '../Footer';
import FAQSection from '../Home/FAQSection';

import exploreHeroImg from '../../assets/Explore/explore-hero-section.png';

// FeaturesHome images
import creationImg from '../../assets/Features/FeaturesHome/CreationFeatures.webp';
import arImg from '../../assets/Features/FeaturesHome/ARFreatures.webp';
import threeDEditorImg from '../../assets/Features/FeaturesHome/3DEditorFeatures.webp';
import exploreImg from '../../assets/Features/FeaturesHome/ExploreFeatures.webp';
import myShelfImg from '../../assets/Features/FeaturesHome/MyShelfFeatures.webp';
import pageEditorImg from '../../assets/Features/FeaturesHome/PageEditorFeatures.webp';
import layoutImg from '../../assets/Features/FeaturesHome/LayoutFeatures.webp';
import analyticsImg from '../../assets/Features/FeaturesHome/AnalyticsFeatures.webp';
import converterImg from '../../assets/Features/FeaturesHome/ConverterFeatures.webp';

export default function Features() {
  const navigate = useNavigate();

  const featureCards = [
    // Row 1
    {
      id: 'creation',
      span: 'col-span-12 md:col-span-7',
      aspect: 'aspect-[16/6.5]',
      path: '/features/creation',
      image: creationImg,
      titlePrefix: 'Creation: ',
      title: 'Create Interactive Publications Your Way',
      subtitle: 'Engage your audience with interactive elements',
    },
    {
      id: 'ar',
      span: 'col-span-12 md:col-span-5',
      aspect: 'aspect-[16/9]',
      path: '/features/ar',
      image: arImg,
      titlePrefix: 'Augmented Reality: ',
      title: 'Real-World AR Product Previews',
      subtitle: 'Engage your audience with interactive elements',
    },

    // Row 2
    {
      id: '3d-editor-studio',
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/3]',
      path: '/features/3d-editor-studio',
      image: threeDEditorImg,
      titlePrefix: '3D Editor Studio: ',
      title: 'Design, Customize & Optimize 3D Models',
      subtitle: 'Engage your audience with interactive elements',
    },
    {
      id: 'explore',
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/3]',
      path: '/features/explore',
      image: exploreImg,
      titlePrefix: 'Explore: ',
      title: 'Public Showcase & Discovery Hub',
      subtitle: 'Engage your audience with interactive elements',
    },
    {
      id: 'my-shelf',
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/3]',
      path: '/features/my-shelf',
      image: myShelfImg,
      titlePrefix: 'My Shelf: ',
      title: 'Store & Manage Your Digital Books',
      subtitle: 'Engage your audience with interactive elements',
    },

    // Row 3
    {
      id: 'page-editor',
      span: 'col-span-12 md:col-span-6',
      aspect: 'aspect-[16/9]',
      path: '/features/page-editor',
      image: pageEditorImg,
      titlePrefix: 'Page Editor: ',
      title: 'Craft Interactive Pages With Precision',
      subtitle: 'Engage your audience with interactive elements',
    },
    {
      id: 'interactive-layout',
      span: 'col-span-12 md:col-span-6',
      aspect: 'aspect-[16/9]',
      path: '/features/interactive-layout',
      image: layoutImg,
      titlePrefix: 'Interactive Layout: ',
      title: 'Customizing Your Unique Layout',
      subtitle: 'Engage your audience with interactive elements',
    },

    // Row 4
    {
      id: 'analytics',
      span: 'col-span-12 md:col-span-5',
      aspect: 'aspect-[16/9]',
      path: '/features/analytics',
      image: analyticsImg,
      titlePrefix: 'Analytics: ',
      title: 'Measure Every View, Click & Share',
      subtitle: 'Engage your audience with interactive elements',
    },
    {
      id: 'converter',
      span: 'col-span-12 md:col-span-7',
      aspect: 'aspect-[16/6.5]',
      path: '/features/converter',
      image: converterImg,
      titlePrefix: 'Converter: ',
      title: 'Convert & Compress Your Media',
      subtitle: 'Engage your audience with interactive elements',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white text-[#1E293B] font-poppins flex flex-col justify-between overflow-x-hidden">
      <main className="w-full flex-1">
        {/* =========================================
            HEADER HERO BANNER SECTION (Like Explore)
        ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-[#f5f5f5] border-b border-gray-100 px-[5vw]"
        >
          <div className="max-w-[85vw] mx-auto flex flex-col md:flex-row items-center justify-between gap-[3vw]">
            {/* Left Text Block */}
            <div className="max-w-[44vw] space-y-[1.8vh] py-[3vh]">
              <h1 className="text-[3.2vw] text-gray-900 font-normal tracking-tight leading-tight">
                Key Features
              </h1>

              <p className="text-[0.9vw] text-gray-600 font-normal leading-relaxed">
                Discover immersive digital catalogues created by businesses, designers, and creators worldwide. Explore interactive flipbooks enhanced with 3D models, hotspots, videos, animations, and rich multimedia experiences.
              </p>

              <div className="w-[7vw] h-[0.3vh] min-h-[2px] bg-gray-800 rounded-full mt-[1.8vh]"></div>
            </div>

            {/* Right Hero Graphic */}
            <div className="relative flex justify-center md:justify-end self-end">
              <img
                src={exploreHeroImg}
                alt="FlipiBook Key Features Hero Graphic"
                className="h-[35vh] max-h-[400px] w-auto object-contain object-bottom shrink-0 block"
              />
            </div>
          </div>
        </motion.div>

        {/* Subheading: Feature */}
        <section className="w-full max-w-[94vw] lg:max-w-[88vw] mx-auto pt-8 pb-4 px-4 sm:px-6">
          <div>
            <h2 className="text-[1.1vw] font-semibold text-[#111827] tracking-tight">
              Feature
            </h2>
            <p className="text-xs md:text-[0.78vw] text-[#94A3B8] mt-0.5">
              Share ideas, solve problems, and improve your workflow.
            </p>
          </div>
        </section>

        {/* =========================================
            FEATURES GRID (With FeaturesHome Images)
        ========================================= */}
        <section className="w-full max-w-[94vw] lg:max-w-[88vw] mx-auto pb-16 px-4 sm:px-6">
          <div className="grid grid-cols-12 gap-4 md:gap-5 lg:gap-6">
            {featureCards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`${card.span} group cursor-pointer bg-white rounded-2xl md:rounded-[1.2vw] p-2.5 sm:p-3 md:p-[0.7vw] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#CBD5E1] transition-all duration-300 flex flex-col justify-between`}
              >
                {/* Image Container with subtle hover zoom */}
                <div
                  className={`w-full ${card.aspect} rounded-xl md:rounded-[0.9vw] bg-[#F8FAFC] border border-[#E2E8F0]/60 flex items-center justify-center relative overflow-hidden`}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out select-none"
                    loading="lazy"
                  />

                  {/* Subtle hover overlay with arrow */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300 text-[#EC5137]">
                      <Icon icon="lucide:arrow-up-right" className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="pt-2.5 pb-0.5 px-1 text-center">
                  <h3 className="text-sm sm:text-base md:text-[1.05vw] lg:text-[1.12vw] font-semibold text-[#111827] tracking-tight leading-snug group-hover:text-[#EC5137] transition-colors">
                    <span>{card.titlePrefix}</span>
                    <span className="font-semibold text-[#334155] group-hover:text-[#EC5137]">{card.title}</span>
                  </h3>
                  <p className="text-xs sm:text-[13px] md:text-[0.85vw] text-[#64748B] mt-0.5 font-normal">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================
            FAQ SECTION (from Home/FAQSection.jsx)
        ========================================= */}
        <FAQSection />
      </main>

      {/* =========================================
          GLOBAL FOOTER
      ========================================= */}
      <Footer />
    </div>
  );
}
