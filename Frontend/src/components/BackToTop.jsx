import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BackToTop({ scrollContainerRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = scrollContainerRef?.current || window;

    const checkScroll = () => {
      const scrollY = scrollContainerRef?.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;

      setIsVisible(scrollY > 350);
    };

    target.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    return () => {
      target.removeEventListener('scroll', checkScroll);
    };
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#1e232d] hover:bg-[#ea543a] text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center group active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#ea543a]/50"
        >
          <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
