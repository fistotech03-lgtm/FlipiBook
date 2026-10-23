import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo/Flipibook_logo.svg';

export default function HomePreloader({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random incremental jump for natural realistic loading feel
        const diff = Math.floor(Math.random() * 10) + 5;
        return Math.min(prev + diff, 100);
      });
    }, 85);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsDone(true);
        if (onFinish) onFinish();
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="home-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(10px)',
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#111315] text-white select-none overflow-hidden"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-tr from-[#EC5137]/15 via-[#FE4B0F]/8 to-transparent blur-3xl pointer-events-none" />

          {/* Central Glassmorphic Card */}
          <div className="relative z-10 flex flex-col items-center px-8 py-10 sm:px-12 sm:py-12 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] max-w-[90vw] sm:max-w-md w-full">
            
            {/* Logo Display with soft glow reflection */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8 flex flex-col items-center"
            >
              <div className="relative px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                <img
                  src={logo}
                  alt="Flipibook"
                  className="h-9 sm:h-11 w-auto object-contain filter brightness-105 drop-shadow-[0_4px_18px_rgba(236,81,55,0.35)]"
                />
              </div>
            </motion.div>

            {/* Stylized 3D Flipbook Page-Turning Animation */}
            <div className="relative w-16 h-12 mb-7 flex items-center justify-center perspective-[600px]">
              {/* Back Book Spine / Cover */}
              <div className="absolute w-12 h-10 rounded-[2px] bg-gradient-to-r from-[#2a2d32] to-[#1e2024] shadow-md border border-white/10" />

              {/* Turning 3D Leaf 1 */}
              <motion.div
                animate={{
                  rotateY: [0, -180, -180],
                  opacity: [0.9, 0.95, 0],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.7, 1],
                  repeatDelay: 0.2
                }}
                style={{ transformOrigin: 'left center' }}
                className="absolute left-2 w-6 h-9 rounded-r-[2px] bg-gradient-to-r from-white/90 to-white/70 border-r border-white/40 shadow-sm"
              />

              {/* Turning 3D Leaf 2 (Orange Accent Page) */}
              <motion.div
                animate={{
                  rotateY: [0, -180, -180],
                  opacity: [0.85, 1, 0],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: 0.25,
                  ease: 'easeInOut',
                  times: [0, 0.7, 1],
                  repeatDelay: 0.2
                }}
                style={{ transformOrigin: 'left center' }}
                className="absolute left-2 w-6 h-9 rounded-r-[2px] bg-gradient-to-r from-[#EC5137] to-[#FE4B0F] border-r border-orange-400/50 shadow-[0_2px_10px_rgba(236,81,55,0.4)]"
              />

              {/* Center Spine Crease Accent */}
              <div className="absolute left-2 top-1 bottom-1 w-[1.5px] bg-white/20 rounded-full z-20" />
            </div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-[280px] flex flex-col items-center gap-2.5">
              <div className="relative w-full h-[5px] bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FE4B0F] via-[#EC5137] to-[#FFA07A] rounded-full shadow-[0_0_12px_rgba(236,81,55,0.7)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Percentage & Status Label */}
              <div className="w-full flex items-center justify-between pt-1">
                <span className="font-poppins text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-gray-400 font-medium">
                  {progress < 35
                    ? 'Initializing Studio'
                    : progress < 70
                    ? 'Loading 3D Engine'
                    : progress < 100
                    ? 'Rendering Pages'
                    : 'Experience Ready'}
                </span>
                <span className="font-mono text-xs font-semibold text-[#EC5137] tracking-wider">
                  {progress}%
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Watermark Tagline */}
          <div className="absolute bottom-6 flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-500 font-poppins uppercase tracking-[0.25em] pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC5137]/80 animate-ping" />
            <span>Interactive Digital Catalogues</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
