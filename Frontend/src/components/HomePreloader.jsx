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
        // Random incremental jump for natural feel
        const diff = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + diff, 100);
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsDone(true);
        if (onFinish) onFinish();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="home-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#151719] text-white select-none overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#EC5137]/15 to-[#FE4B0F]/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center z-10 px-6">
            
            {/* Logo with pulsating subtle glow */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-8 flex flex-col items-center"
            >
              <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img
                  src={logo}
                  alt="Flipibook"
                  className="h-10 sm:h-12 w-auto object-contain filter brightness-110 drop-shadow-[0_4px_16px_rgba(236,81,55,0.3)]"
                />
              </div>
            </motion.div>

            {/* Elegant 3D Flipbook Animated Pages Indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [0.4, 1.2, 0.4],
                    backgroundColor: ['#4b5563', '#EC5137', '#4b5563'],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 h-6 rounded-full"
                />
              ))}
            </div>

            {/* Progress Bar Container */}
            <div className="w-56 sm:w-72 flex flex-col items-center gap-2.5">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FE4B0F] via-[#EC5137] to-[#FFA07A] rounded-full shadow-[0_0_12px_rgba(236,81,55,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Percentage & Loading Status */}
              <div className="w-full flex items-center justify-between text-xs text-gray-400 font-mono tracking-wider pt-1">
                <span className="font-poppins text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  {progress < 40 ? 'Preparing Experience' : progress < 80 ? 'Loading 3D Models' : 'Ready'}
                </span>
                <span className="font-semibold text-white/90">{progress}%</span>
              </div>
            </div>

          </div>

          {/* Footer watermark inside preloader */}
          <div className="absolute bottom-6 text-[11px] text-gray-500/80 font-poppins uppercase tracking-widest pointer-events-none">
            Interactive Digital Catalogues
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

