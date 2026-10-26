import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo/Flipibook_logo.svg';

export default function HomePreloader({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const diff = Math.floor(Math.random() * 9) + 5;
        return Math.min(prev + diff, 100);
      });
    }, 65);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsDone(true);
        if (onFinish) onFinish();
      }, 400);
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
            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFFFF] via-[#FAF9F7] to-[#F4F2EC] select-none"
        >
          {/* Centered Editorial Composition */}
          <div className="flex flex-col items-center w-full max-w-xs px-6">
            
            {/* Flipibook Logo */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <img
                src={logo}
                alt="Flipibook"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </motion.div>

            {/* Turning Book Animation */}
            <div className="relative w-20 h-14 mb-7 flex items-center justify-center [perspective:600px]">
              {/* Left Static Page Spread */}
              <div className="absolute left-2 w-8 h-12 bg-white rounded-l-[3px] border border-[#E5E5E5] shadow-xs flex flex-col justify-center px-1.5 gap-1">
                <div className="w-full h-[1.5px] bg-[#EBEBEB] rounded-full" />
                <div className="w-3/4 h-[1.5px] bg-[#EBEBEB] rounded-full" />
                <div className="w-1/2 h-[1.5px] bg-[#EBEBEB] rounded-full" />
              </div>

              {/* Right Static Page Spread */}
              <div className="absolute right-2 w-8 h-12 bg-white rounded-r-[3px] border border-[#E5E5E5] shadow-xs flex flex-col justify-center px-1.5 gap-1 items-end">
                <div className="w-full h-[1.5px] bg-[#EBEBEB] rounded-full" />
                <div className="w-3/4 h-[1.5px] bg-[#EBEBEB] rounded-full" />
                <div className="w-1/2 h-[1.5px] bg-[#EBEBEB] rounded-full" />
              </div>

              {/* Center Book Spine */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-[1.5px] bg-[#D4D4D4] z-30" />

              {/* Turning Page */}
              <motion.div
                animate={{
                  rotateY: [0, -180, -180],
                }}
                transition={{
                  duration: 1.35,
                  repeat: Infinity,
                  ease: [0.65, 0, 0.35, 1],
                  times: [0, 0.75, 1],
                  repeatDelay: 0.15
                }}
                style={{
                  transformOrigin: 'left center',
                  backfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d'
                }}
                className="absolute left-1/2 top-1 w-8 h-12 bg-[#FFF7F5] rounded-r-[3px] border border-[#EC5137]/30 shadow-[0_2px_8px_rgba(236,81,55,0.12)] z-20 flex flex-col justify-center px-1.5 gap-1 pointer-events-none"
              >
                <div className="w-full h-[1.5px] bg-[#EC5137]/35 rounded-full" />
                <div className="w-2/3 h-[1.5px] bg-[#EC5137]/25 rounded-full" />
              </motion.div>
            </div>

            {/* Single Progress Bar Below Book */}
            <div className="w-44 h-[3px] bg-[#E8E8E8] rounded-full overflow-hidden mb-2.5">
              <motion.div
                className="h-full bg-[#EC5137] rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>

            {/* Percentage Display */}
            <span className="font-mono text-xs font-semibold text-[#35363A] tracking-wider">
              {progress}%
            </span>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}




