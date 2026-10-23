import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import exploreArrowIcon from '../../assets/Home/explore-arrow-icon.png';

export default function WhyChooseFlipibook() {
  return (
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.8 }} className="w-full bg-[#FAFAFA] text-[#1C1D21] py-10 lg:py-[3.2vw] px-6 sm:px-10 lg:px-[5vw] font-poppins relative overflow-hidden select-none">
      
      {/* Top Header Tag Row with Sub-Labels */}
      <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between mb-4 lg:mb-[1.2vw]">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-[15px] lg:text-[0.85vw] font-semibold tracking-[0.28em] text-[#35363A] uppercase">
            WHY FLIPIBOOK
          </span>
          <div className="w-12 lg:w-[3vw] h-[1.5px] bg-[#35363A]/40"></div>
        </div>

        <div className="hidden sm:flex items-start text-left gap-3">
          <div className="w-[2px] h-[36px] lg:h-[2.4vw] bg-[#EC5137] rounded-full mt-0.5"></div>
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[14px] lg:text-[0.78vw] font-semibold text-[#35363A] uppercase tracking-wider leading-snug">
              FEATURED FLIPBOOK
            </span>
            <span className="text-[11.5px] sm:text-[12px] lg:text-[0.68vw] font-medium text-[#35363A] uppercase tracking-wider leading-snug">
              LEADING THE INDUSTRY REVOLUTION
            </span>
          </div>
        </div>
      </div>

      {/* Main Title Row: Why Choose Flipibook ? */}
      <div className="w-full max-w-[1920px] mx-auto mb-2 lg:mb-[0.5vw]">
        <h2 className="text-[32px] sm:text-[44px] lg:text-[3.1vw] font-semibold tracking-tight text-[#35363A] leading-[1.12] lg:max-w-[26vw]">
          Why Choose <br />
          <span className="text-[#EC5137]">Flipibook ?</span>
        </h2>
        <p className="text-[13px] sm:text-[15.5px] lg:text-[0.88vw] text-[#69707D] max-w-[480px] lg:max-w-[28vw] mt-3 sm:mt-4 lg:mt-[1vw] leading-[1.65] font-normal">
          From product catalogues to marketing brochures, create stunning digital experiences that drive engagement and business growth.
        </p>
      </div>

      {/* 
        Exact Figma Canvas Container:
        Figma artboard coordinate reference: X: 0 to 1920, Y: 340 to 920 (~580px relative height)
        Aspect ratio lock ensures SVG and cards NEVER detach or stretch out of alignment on desktop screens (>= 992px)!
      */}
      <div className="w-full max-w-[1920px] mx-auto relative hidden min-[992px]:block mt-0 lg:-mt-[1.5vw] mb-0 lg:-mb-[1.5vw]" style={{ aspectRatio: '1920 / 580' }}>
        
        {/* Background SVG Wave and Accent Dots directly from Figma:
            Bounding box transformed to (0, 340) coordinate space:
            viewBox="32 340 1920 580"
        */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="32 340 1920 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>{`
              @keyframes dashAnimation {
                from {
                  stroke-dashoffset: 0;
                }
                to {
                  stroke-dashoffset: -36;
                }
              }
              .animated-dashed-trail {
                stroke-dasharray: 8 10;
                animation: dashAnimation 1.2s linear infinite;
              }
              @keyframes dotRadarPulse {
                0% {
                  r: 8px;
                  opacity: 0.9;
                  stroke-width: 3px;
                }
                50% {
                  r: 22px;
                  opacity: 0.5;
                  stroke-width: 2px;
                }
                100% {
                  r: 34px;
                  opacity: 0;
                  stroke-width: 0px;
                }
              }
              @keyframes dotCoreBreathe {
                0%, 100% {
                  transform: scale(0.9);
                  filter: drop-shadow(0 0 4px rgba(236, 81, 55, 0.4));
                }
                50% {
                  transform: scale(1.35);
                  filter: drop-shadow(0 0 10px rgba(236, 81, 55, 0.9));
                }
              }
              .radar-dot {
                animation: dotRadarPulse 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
              }
              .core-dot-1 {
                transform-origin: 532px 645px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite;
              }
              .core-dot-2 {
                transform-origin: 981px 510px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite 0.5s;
              }
              .core-dot-3 {
                transform-origin: 1431px 467px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite 1s;
              }
              .core-dot-4 {
                transform-origin: 1673.5px 481.5px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite 1.5s;
              }
            `}</style>
          </defs>

          {/* Animated Dashed Trajectory connecting the milestones to the paper plane */}
          <path
            d="M 148.0 707.0 C 150.6 704.3, 157.4 697.1, 163.6 691.1 C 169.8 685.0, 177.9 677.3, 185.3 670.7 C 192.7 664.2, 200.2 657.7, 208.0 651.5 C 215.8 645.4, 223.7 639.3, 231.8 633.7 C 240.0 628.1, 248.3 622.6, 257.0 617.9 C 265.7 613.2, 278.3 607.8, 284.0 605.4 C 289.6 602.9, 286.0 604.3, 291.0 603.0 C 296.0 601.7, 304.8 598.9, 313.7 597.7 C 322.7 596.4, 334.4 595.3, 344.8 595.5 C 355.1 595.8, 365.5 597.3, 375.6 599.2 C 385.8 601.2, 395.8 604.3, 405.7 607.4 C 415.6 610.5, 425.2 614.3, 435.0 617.8 C 444.8 621.3, 454.4 625.2, 464.3 628.5 C 474.1 631.9, 483.9 635.2, 493.9 637.9 C 503.9 640.6, 518.0 643.4, 524.3 644.8 C 530.6 646.1, 526.7 645.3, 532.0 646.0 C 537.3 646.7, 546.8 648.1, 556.2 648.9 C 565.7 649.7, 577.9 650.5, 588.7 650.7 C 599.6 650.9, 610.4 650.7, 621.3 650.0 C 632.1 649.4, 642.9 648.3, 653.6 646.8 C 664.3 645.2, 675.0 643.2, 685.6 640.8 C 696.2 638.4, 706.6 635.5, 716.9 632.1 C 727.3 628.8, 737.5 625.0, 747.4 620.8 C 757.4 616.6, 770.8 609.8, 776.8 606.9 C 782.9 603.9, 779.4 605.6, 784.0 603.0 C 788.6 600.4, 796.6 595.9, 804.4 591.0 C 812.3 586.2, 822.2 579.8, 831.0 574.1 C 839.9 568.4, 848.6 562.4, 857.5 556.8 C 866.3 551.2, 875.2 545.5, 884.4 540.3 C 893.5 535.2, 902.8 530.1, 912.4 525.9 C 922.0 521.7, 931.9 517.8, 942.0 515.1 C 952.1 512.5, 966.6 510.9, 973.1 510.0 C 979.6 509.1, 975.8 509.7, 981.0 509.8 C 986.2 509.8, 995.2 509.8, 1004.2 510.3 C 1013.1 510.7, 1024.6 511.5, 1034.8 512.5 C 1045.0 513.5, 1055.2 514.9, 1065.3 516.5 C 1075.5 518.0, 1085.6 519.9, 1095.7 521.9 C 1105.7 523.9, 1115.7 526.2, 1125.8 528.4 C 1135.8 530.6, 1145.8 532.9, 1155.8 534.9 C 1165.9 536.9, 1176.0 538.9, 1186.2 540.3 C 1196.3 541.6, 1206.6 542.6, 1216.8 542.8 C 1227.0 543.0, 1237.4 542.6, 1247.5 541.4 C 1257.7 540.2, 1267.8 538.2, 1277.7 535.6 C 1287.6 533.1, 1297.4 529.7, 1306.9 526.0 C 1316.5 522.3, 1329.1 516.1, 1335.0 513.3 C 1340.8 510.6, 1337.1 512.2, 1341.9 509.8 C 1346.7 507.3, 1355.4 503.0, 1364.0 498.8 C 1372.6 494.5, 1383.5 489.1, 1393.4 484.4 C 1403.2 479.6, 1413.0 474.9, 1423.0 470.5 C 1432.9 466.0, 1442.9 461.6, 1453.1 457.7 C 1463.3 453.8, 1473.6 449.9, 1484.1 447.1 C 1494.6 444.2, 1505.4 441.7, 1516.1 440.5 C 1526.9 439.4, 1538.0 439.2, 1548.8 440.0 C 1559.6 440.8, 1570.5 443.0, 1581.0 445.5 C 1591.6 448.1, 1602.0 451.7, 1612.2 455.4 C 1622.5 459.1, 1632.6 463.4, 1642.6 467.7 C 1652.7 472.0, 1666.1 478.4, 1672.3 481.2 C 1678.5 484.1, 1675.0 483.4, 1679.8 484.8 C 1684.6 486.3, 1692.9 490.0, 1701.3 489.9 C 1709.6 489.8, 1721.1 487.9, 1730.1 484.4 C 1739.1 480.9, 1747.8 475.2, 1755.1 468.8 C 1762.3 462.4, 1768.9 454.4, 1773.7 445.9 C 1778.5 437.5, 1781.9 424.1, 1783.9 418.3 C 1785.9 412.5, 1785.2 412.3, 1785.5 411.1"
            fill="none"
            stroke="#EC5137"
            strokeWidth="2"
            strokeLinecap="round"
            className="animated-dashed-trail"
          />

          {/* Dot 1: (532, 645) */}
          <circle cx="532" cy="645" fill="none" stroke="#EC5137" className="radar-dot" />
          <circle cx="532" cy="645" r="9" fill="#EC5137" className="core-dot-1" />

          {/* Dot 2: (981, 510) */}
          <circle cx="981" cy="510" fill="none" stroke="#EC5137" className="radar-dot" style={{ animationDelay: '0.5s' }} />
          <circle cx="981" cy="510" r="9" fill="#EC5137" className="core-dot-2" />

          {/* Dot 3: (1431, 467) */}
          <circle cx="1431" cy="467" fill="none" stroke="#EC5137" className="radar-dot" style={{ animationDelay: '1s' }} />
          <circle cx="1431" cy="467" r="9" fill="#EC5137" className="core-dot-3" />

          {/* Dot 4: (1673.5, 481.5) */}
          <circle cx="1673.5" cy="481.5" fill="none" stroke="#EC5137" className="radar-dot" style={{ animationDelay: '1.5s' }} />
          <circle cx="1673.5" cy="481.5" r="7" fill="#EC5137" className="core-dot-4" />
        </svg>

        {/* Animated Paper Plane: flying reveal & floating hover */}
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${(1708.4 / 1920) * 100}%`,
            top: `${((342 - 340) / 580) * 100}%`,
            width: `${(121 / 1920) * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0.2, x: -120, y: 80, rotate: -25 }}
          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <motion.img
            src={exploreArrowIcon}
            alt="Paper Plane"
            className="w-full h-auto object-contain drop-shadow-xl"
            animate={{
              y: [-6, 6, -6],
              x: [-4, 4, -4],
              rotate: [-2, 3, -2],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* 
          Exact 4 Milestone Node Coordinates from Figma:
          Circle centers:
          Circle 1: x = 317.5, y = 590 (w=144, h=144) -> top = 590 - 72 = 518
          Circle 2: x = 767,   y = 582 (w=143, h=144) -> top = 582 - 72 = 510
          Circle 3: x = 1224.5,y = 535 (w=143, h=144) -> top = 535 - 72 = 463
          Circle 4: x = 1653.5,y = 495 (w=143, h=144) -> top = 495 - 72 = 423
        */}

        {/* Node 1: 100+ Happy Clients */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(285.9 / 1920) * 100}%`,
            top: `${((534 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <Icon icon="mdi:account-group" className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw] text-[#697689]" />
          </div>
          <h3 className="text-4xl sm:text-[42px] lg:text-[2.4vw] font-bold text-[#051B2E] leading-none mb-2.5 lg:mb-[0.6vw]">
            100+
          </h3>
          <h4 className="text-lg sm:text-xl lg:text-[1.15vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Happy Clients
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            Trusted by businesses across various industries
          </p>
        </div>

        {/* Node 2: 500+ Flipbooks Created */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(735.4 / 1920) * 100}%`,
            top: `${((528 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <Icon icon="basil:book-open-outline" className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw] text-[#697689]" />
          </div>
          <h3 className="text-4xl sm:text-[42px] lg:text-[2.4vw] font-bold text-[#051B2E] leading-none mb-2.5 lg:mb-[0.6vw]">
            500+
          </h3>
          <h4 className="text-lg sm:text-xl lg:text-[1.15vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Flipibooks Created
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            From Product catalogues to brand stories
          </p>
        </div>

        {/* Node 3: 1M+ Page Views */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(1192.9 / 1920) * 100}%`,
            top: `${((480 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <Icon icon="mdi:eye-outline" className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw] text-[#697689]" />
          </div>
          <h3 className="text-4xl sm:text-[42px] lg:text-[2.4vw] font-bold text-[#051B2E] leading-none mb-2.5 lg:mb-[0.6vw]">
            1M+
          </h3>
          <h4 className="text-lg sm:text-xl lg:text-[1.15vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Page Views
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            Read, share and explore FlipiBooks across the globe.
          </p>
        </div>

        {/* Node 4: Global Reach */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(1621.9 / 1920) * 100}%`,
            top: `${((423 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <svg
              viewBox="0 0 26 26"
              className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw]"
              fill="none"
            >
              {/* Globe in #697689 */}
              <path
                fill="#697689"
                d="M13 2C6.383 2 1 7.383 1 14s5.383 12 12 12s12-5.383 12-12c0-2.01-.498-3.896-1.375-5.563c-.133.264-.267.515-.406.782c-.263.508-.54 1.021-.782 1.531c.25.715.422 1.471.5 2.25h-1.312c-.072.335-.125.65-.125.969V15h1.438a9.9 9.9 0 0 1-1.282 4H18.72c.22-.938.347-1.975.437-3.031h-1.97a19 19 0 0 1-.53 3.031H9.343a19.2 19.2 0 0 1-.594-4h7.75v-1.031a4.7 4.7 0 0 0-.125-.969H8.75a19.2 19.2 0 0 1 .594-4h5.344a31 31 0 0 1-.97-2h-3.687c.827-1.887 1.92-3 2.969-3c0-.695.125-1.348.344-1.969C13.229 2.027 13.116 2 13 2M8.875 4.906a12.4 12.4 0 0 0-1 2.094h-2a10 10 0 0 1 3-2.094M4.344 9H7.28a21.4 21.4 0 0 0-.531 4H3.062a9.9 9.9 0 0 1 1.282-4m-1.282 6H6.75c.059 1.425.243 2.77.531 4H4.344a9.9 9.9 0 0 1-1.282-4m2.813 6h2c.288.776.625 1.473 1 2.094a10 10 0 0 1-3-2.094m4.156 0h5.938c-.827 1.887-1.92 3-2.969 3s-2.143-1.113-2.969-3m8.094 0h2a10 10 0 0 1-3 2.094c.375-.62.712-1.317 1-2.094"
              />
              {/* Location pin in #EC5137 */}
              <path
                fill="#EC5137"
                d="M19 0c-2.209 0-4 1.793-4 4c0 2.665 3.5 6.306 3.5 9.969h1C19.501 10.306 23 6.77 23 4c0-2.207-1.791-4-4-4m0 1.938a2.063 2.063 0 1 1-.002 4.126A2.063 2.063 0 0 1 19 1.937z"
              />
            </svg>
          </div>
          <h4 className="text-2xl sm:text-[25px] lg:text-[1.35vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Global Reach
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            Share Everywhere, <br className="hidden sm:inline" /><br className="sm:hidden" />Anytime.
          </p>
        </div>

      </div>

      {/* Responsive Grid layout for Mobile and Tablet (< 992px) */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-7 min-[992px]:hidden mt-8 max-w-2xl sm:max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center p-4 sm:p-5 bg-white/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-xs">
            <Icon icon="mdi:account-group" className="w-8 h-8 sm:w-10 sm:h-10 text-[#697689]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#051B2E]">100+</h3>
          <h4 className="text-sm sm:text-base font-semibold text-[#051B2E] mb-1">Happy Clients</h4>
          <p className="text-xs sm:text-sm text-[#4B596C] leading-snug">Trusted by businesses across various industries</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 sm:p-5 bg-white/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-xs">
            <Icon icon="basil:book-open-outline" className="w-8 h-8 sm:w-10 sm:h-10 text-[#697689]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#051B2E]">500+</h3>
          <h4 className="text-sm sm:text-base font-semibold text-[#051B2E] mb-1">Flipibooks Created</h4>
          <p className="text-xs sm:text-sm text-[#4B596C] leading-snug">From Product catalogues to brand stories</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 sm:p-5 bg-white/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-xs">
            <Icon icon="mdi:eye-outline" className="w-8 h-8 sm:w-10 sm:h-10 text-[#697689]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#051B2E]">1M+</h3>
          <h4 className="text-sm sm:text-base font-semibold text-[#051B2E] mb-1">Page Views</h4>
          <p className="text-xs sm:text-sm text-[#4B596C] leading-snug">Read, share and explore FlipiBooks across the globe.</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 sm:p-5 bg-white/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-xs">
            <Icon icon="mdi:earth" className="w-8 h-8 sm:w-10 sm:h-10 text-[#697689]" />
          </div>
          <h4 className="text-lg sm:text-xl font-semibold text-[#051B2E] mb-1 mt-1">Global Reach</h4>
          <p className="text-xs sm:text-sm text-[#4B596C] leading-snug">Share Everywhere, <br />Anytime.</p>
        </div>
      </div>

    </motion.section>
  );
}
