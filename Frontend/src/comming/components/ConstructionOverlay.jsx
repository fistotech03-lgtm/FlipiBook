import React from 'react';
import { motion } from 'framer-motion';
import FlipibookLogo from '../../assets/logo/Flipibook_logo.svg';

export default function ConstructionOverlay({
  isVisible = false,
  onReplay,
  shouldReduceMotion = false,
}) {
  return (
    <div className="cs-overlay-container pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header: Brand Logo with Soft Glow */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <img
            src={FlipibookLogo}
            alt="FlipiBook"
            className="h-7 sm:h-9 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Replay Sequence Button */}
        <button
          onClick={onReplay}
          className="pointer-events-auto group flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-stone-900/70 hover:bg-stone-800/90 border border-amber-500/30 hover:border-amber-400 text-stone-300 hover:text-amber-200 text-xs font-mono tracking-wider transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.5)] cursor-pointer"
          title="Replay cinematic impact sequence"
        >
          <span className="text-amber-400 group-hover:rotate-180 transition-transform duration-500">↺</span>
          <span className="hidden sm:inline">REPLAY</span>
        </button>
      </motion.header>

      {/* Bottom Center: Under Construction Badge & Subtitle (Positioned below the 3D text to prevent overlap) */}
      <footer className="w-full flex flex-col items-center text-center pb-2 sm:pb-6">
        
        {/* Under Construction Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.94 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15, scale: isVisible ? 1 : 0.94 }}
          transition={{
            duration: 0.8,
            delay: shouldReduceMotion ? 0.1 : 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-3 sm:mb-4"
        >
          <div className="cs-status-badge">
            <span className="cs-status-sparkle">✦</span>
            <span>UNDER CONSTRUCTION</span>
            <span className="cs-status-sparkle">✦</span>
          </div>
        </motion.div>

        {/* Subtitle Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15 }}
          transition={{
            duration: 0.9,
            delay: shouldReduceMotion ? 0.2 : 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="max-w-xl mx-auto space-y-1 sm:space-y-2 px-4"
        >
          <p className="cs-subtitle-text text-base sm:text-xl md:text-2xl font-normal text-stone-200 tracking-wide font-serif">
            “Something extraordinary is taking shape.”
          </p>

          <p className="text-stone-400/80 text-xs sm:text-sm tracking-wider uppercase font-mono">
            A NEW STANDARD FOR DIGITAL READING
          </p>
        </motion.div>

        {/* Minimalist Establishment Mark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 0.7 : 0 }}
          transition={{ duration: 1, delay: shouldReduceMotion ? 0.3 : 0.7 }}
          className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono tracking-widest mt-4 sm:mt-6"
        >
          <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-neutral-700" />
          <span>EST. 2026</span>
          <span className="w-1 h-1 rounded-full bg-amber-500/50" />
          <span>FLIPIBOOK</span>
          <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-neutral-700" />
        </motion.div>
      </footer>
    </div>
  );
}

