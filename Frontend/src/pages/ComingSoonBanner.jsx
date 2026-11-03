import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import FlipibookLogo from '../assets/logo/Flipibook_logo.svg';
import './ComingSoonBanner.css';

// 4 Rich Page Spreads for Realistic Editorial Book Flipping
const PAGE_DATA = [
  {
    id: 1,
    front: {
      chapter: 'CHAPTER I',
      title: 'A NEW DAWN',
      dropCap: 'A',
      paragraphs: [
        '94%', '88%', '92%', '72%',
        '86%', '90%', '64%'
      ],
      pageNo: '1',
      motif: '✦',
    },
    back: {
      chapter: 'EX LIBRIS',
      title: 'THE ART OF FORM',
      dropCap: 'F',
      paragraphs: [
        '92%', '86%', '90%', '76%',
        '88%', '82%', '60%'
      ],
      pageNo: '2',
      motif: '❖',
    },
  },
  {
    id: 2,
    front: {
      chapter: 'CHAPTER II',
      title: 'INFINITE REALMS',
      dropCap: 'T',
      paragraphs: [
        '90%', '94%', '84%', '70%',
        '92%', '88%', '58%'
      ],
      pageNo: '3',
      motif: '✦',
    },
    back: {
      chapter: 'MEDITATION',
      title: 'HARMONY & LIGHT',
      dropCap: 'L',
      quote: '“Every page a journey, every word an open sky.”',
      paragraphs: [
        '88%', '92%', '78%', '65%'
      ],
      pageNo: '4',
      motif: '❖',
    },
  },
  {
    id: 3,
    front: {
      chapter: 'CHAPTER III',
      title: 'DIGITAL CRAFT',
      dropCap: 'C',
      paragraphs: [
        '92%', '88%', '94%', '75%',
        '86%', '80%', '62%'
      ],
      pageNo: '5',
      motif: '✦',
    },
    back: {
      chapter: 'CHRONICLES',
      title: 'TIMELESS MOTION',
      dropCap: 'M',
      paragraphs: [
        '94%', '86%', '90%', '68%',
        '84%', '76%', '55%'
      ],
      pageNo: '6',
      motif: '❖',
    },
  },
  {
    id: 4,
    front: {
      chapter: 'CHAPTER IV',
      title: 'THE FUTURE',
      dropCap: 'F',
      paragraphs: [
        '90%', '92%', '86%', '70%',
        '88%', '82%', '60%'
      ],
      pageNo: '7',
      motif: '✦',
    },
    back: {
      chapter: 'EPILOGUE',
      title: 'A BEGINNING',
      dropCap: 'B',
      paragraphs: [
        '92%', '88%', '85%', '72%',
        '80%', '74%', '50%'
      ],
      pageNo: '8',
      motif: '❖',
    },
  },
];

export default function ComingSoonBanner() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Mouse parallax state (-1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringBook, setIsHoveringBook] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Multi-page flipping state (0 = all on right, 4 = all flipped to left)
  const [flippedCount, setFlippedCount] = useState(0);
  const [flipDirection, setFlipDirection] = useState('forward'); // 'forward' | 'backward'
  const [isAutoFlipping, setIsAutoFlipping] = useState(true);

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Smooth, rhythmic page flipping orchestration
  useEffect(() => {
    if (shouldReduceMotion || !isAutoFlipping) return;

    let timer;
    if (flipDirection === 'forward') {
      if (flippedCount < 4) {
        // Turn next page smoothly after a readable pause
        timer = setTimeout(() => {
          setFlippedCount((prev) => prev + 1);
        }, 2200);
      } else {
        // All pages turned: pause to admire the artwork, then reverse smoothly
        timer = setTimeout(() => {
          setFlipDirection('backward');
          setFlippedCount((prev) => prev - 1);
        }, 3200);
      }
    } else {
      // Flipping backward (returning to start)
      if (flippedCount > 0) {
        timer = setTimeout(() => {
          setFlippedCount((prev) => prev - 1);
        }, 1100);
      } else {
        // Back at start: pause briefly, then begin forward journey again
        timer = setTimeout(() => {
          setFlipDirection('forward');
          setFlippedCount((prev) => prev + 1);
        }, 2500);
      }
    }

    return () => clearTimeout(timer);
  }, [flippedCount, flipDirection, isAutoFlipping, shouldReduceMotion]);

  // Click on right page: flip forward; click on left page: flip backward
  const handlePageClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isRightSide = clickX > rect.width / 2;

    setIsAutoFlipping(false); // User took control

    if (isRightSide) {
      setFlippedCount((prev) => Math.min(4, prev + 1));
    } else {
      setFlippedCount((prev) => Math.max(0, prev - 1));
    }

    // Resume smooth auto-flipping after 7 seconds of inactivity
    setTimeout(() => {
      setIsAutoFlipping(true);
    }, 7000);
  }, []);

  // Mouse move parallax
  const handleMouseMove = (e) => {
    if (isTouchDevice || shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const nx = (clientX / innerWidth - 0.5) * 2;
    const ny = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x: nx, y: ny });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHoveringBook(false);
  };

  // Canvas particle system (ethereal ambient dust & rising book embers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = isTouchDevice ? 20 : 50;
    const particles = [];

    class Particle {
      constructor(isEmber = false) {
        this.isEmber = isEmber;
        this.reset(true);
      }

      reset(initial = false) {
        if (this.isEmber) {
          // Embers rising from the center book area
          const spreadX = (Math.random() - 0.5) * (width < 640 ? 160 : 260);
          this.x = width / 2 + spreadX;
          this.y = initial
            ? height * 0.42 + (Math.random() - 0.5) * 90
            : height * 0.45 + Math.random() * 30;
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = -0.5 - Math.random() * 0.6;
          this.radius = Math.random() * 2 + 0.7;
          this.baseAlpha = Math.random() * 0.65 + 0.3;
          this.alpha = initial ? this.baseAlpha : 0;
          this.fadeSpeed = Math.random() * 0.007 + 0.004;
          this.flutter = Math.random() * Math.PI * 2;
          this.flutterSpeed = Math.random() * 0.04 + 0.02;
        } else {
          // Ambient cosmic dust
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = -Math.random() * 0.3 - 0.04;
          this.radius = Math.random() * 1.3 + 0.5;
          this.baseAlpha = Math.random() * 0.35 + 0.12;
          this.alpha = this.baseAlpha;
          this.pulse = Math.random() * Math.PI * 2;
          this.pulseSpeed = Math.random() * 0.02 + 0.01;
        }
      }

      update() {
        if (this.isEmber) {
          this.flutter += this.flutterSpeed;
          this.x += this.vx + Math.sin(this.flutter) * 0.3;
          this.y += this.vy;

          if (this.y > height * 0.32) {
            this.alpha = Math.min(this.baseAlpha, this.alpha + 0.03);
          } else {
            this.alpha -= this.fadeSpeed;
          }

          if (this.alpha <= 0 || this.y < height * 0.1) {
            this.reset(false);
          }
        } else {
          this.pulse += this.pulseSpeed;
          this.x += this.vx;
          this.y += this.vy;

          if (this.y < 0) this.y = height;
          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;

          this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.12;
        }
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.isEmber) {
          ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, this.alpha)})`;
          ctx.shadowBlur = this.radius * 3;
          ctx.shadowColor = `rgba(245, 158, 11, ${Math.max(0, this.alpha * 0.8)})`;
        } else {
          ctx.fillStyle = `rgba(254, 243, 199, ${Math.max(0, this.alpha)})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(i % 2 === 0));
    }

    let isRunning = true;
    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTouchDevice]);

  // 3D Parallax tilt
  const tiltX = shouldReduceMotion ? 17 : 17 - mousePos.y * 7;
  const tiltY = shouldReduceMotion ? 0 : mousePos.x * 10;

  // Background parallax offset
  const bgShiftX = -mousePos.x * 16;
  const bgShiftY = -mousePos.y * 16;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="csb-container px-3 sm:px-6 py-3 sm:py-5"
    >
      {/* Background Animated Ambient Lights */}
      <div
        className="csb-ambient-orb csb-orb-1"
        style={{ transform: `translate(${bgShiftX * 1.1}px, ${bgShiftY * 1.1}px)` }}
      />
      <div
        className="csb-ambient-orb csb-orb-2"
        style={{ transform: `translate(${bgShiftX * -0.8}px, ${bgShiftY * -0.8}px)` }}
      />
      <div
        className="csb-ambient-orb csb-orb-3"
        style={{ transform: `translate(${bgShiftX * 0.5}px, ${bgShiftY * 0.5}px)` }}
      />

      {/* Floating Canvas Particles */}
      <canvas ref={canvasRef} className="csb-particle-canvas" />

      {/* 1. Header: FlipiBook Logo with Soft Aura */}
      <motion.header
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 flex items-center justify-center pt-1 sm:pt-2"
      >
        <div className="relative group">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/15 via-red-500/18 to-amber-500/15 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <img
            src={FlipibookLogo}
            alt="FlipiBook"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)] relative z-10"
          />
        </div>
      </motion.header>

      {/* 2. Hero Center: Symmetrically Centered 3D Multi-Page Flipbook */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center w-full my-auto">
        
        {/* 3D Perspective Stage */}
        <div className="csb-perspective-stage py-2 sm:py-5">
          
          {/* Book Chassis (width: 0 anchors spine at dead center) */}
          <div
            className={`csb-book-chassis ${shouldReduceMotion ? '' : 'csb-levitate'}`}
            style={{
              transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              transition: isHoveringBook ? 'transform 0.2s ease-out' : 'transform 0.5s ease-out',
            }}
            onMouseEnter={() => !isTouchDevice && setIsHoveringBook(true)}
            onMouseLeave={() => !isTouchDevice && setIsHoveringBook(false)}
            onClick={handlePageClick}
          >
            {/* Ground Cast Shadow (Symmetrically centered directly under the open book) */}
            <div className="csb-book-shadow" />

            {/* Soft Volumetric Golden Aura (No harsh polygons!) */}
            <div className="csb-book-glow" />
            <div className="csb-book-rays" />

            {/* Hardcover Backing (Left & Right) */}
            <div className="csb-hardcover-left" />
            <div className="csb-hardcover-right" />

            {/* Spine Center Bar */}
            <div className="csb-spine-bar" />

            {/* Base Left Page Stack (Resting underneath) */}
            <div className="csb-base-stack-left">
              <div className="csb-gilded-edge-left" />
              <div className="p-3 sm:p-4 h-full flex flex-col justify-between select-none">
                <div className="csb-page-border-frame" />
                <div>
                  <div className="csb-chapter-title">PROLOGUE</div>
                  <div className="text-[10px] text-amber-900/60 font-serif font-semibold tracking-wider mb-2">
                    THE BEGINNING
                  </div>
                  <div className="csb-drop-cap">A</div>
                  <div className="space-y-1 pt-1">
                    <div className="csb-text-line w-full" />
                    <div className="csb-text-line w-[90%]" />
                    <div className="csb-text-line w-[95%]" />
                    <div className="csb-text-line w-[75%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="csb-text-line w-[92%]" />
                  <div className="csb-text-line w-[86%]" />
                  <div className="csb-text-line w-[60%]" />
                </div>
                <div className="csb-page-number left-3">I</div>
              </div>
            </div>

            {/* Base Right Page Stack (Resting underneath) */}
            <div className="csb-base-stack-right">
              <div className="csb-gilded-edge-right" />
              <div className="p-3 sm:p-4 h-full flex flex-col justify-between select-none">
                <div className="csb-page-border-frame" />
                <div>
                  <div className="csb-chapter-title">FUTURE SPREAD</div>
                  <div className="text-[10px] text-amber-900/60 font-serif font-semibold tracking-wider mb-2">
                    IMMERSIVE 3D
                  </div>
                  <div className="csb-drop-cap">V</div>
                  <div className="space-y-1 pt-1">
                    <div className="csb-text-line w-full" />
                    <div className="csb-text-line w-[92%]" />
                    <div className="csb-text-line w-[88%]" />
                    <div className="csb-text-line w-[70%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="csb-text-line w-[90%]" />
                  <div className="csb-text-line w-[82%]" />
                  <div className="csb-text-line w-[54%]" />
                </div>
                <div className="csb-page-number right-3">X</div>
              </div>
            </div>

            {/* 4 Cascading Flipping Pages */}
            {PAGE_DATA.map((page, index) => {
              const pageNumber = index + 1;
              const isFlipped = flippedCount >= pageNumber;

              // Smooth dynamic z-index for realistic layering:
              // When on right: lower index on top
              // When on left: higher index on top
              // While turning: elevated z-index
              let zIndex = 20;
              if (isFlipped) {
                zIndex = 10 + index;
              } else {
                zIndex = 10 + (4 - index);
              }

              // Hover effect: when hovering on desktop, the topmost right page peeks up slightly
              const isTopRightPage = !isFlipped && (flippedCount === index);
              const peekAngle = (isHoveringBook && isTopRightPage && !isTouchDevice) ? -14 : 0;

              // 3D rotation angle
              const rotateAngle = isFlipped ? -180 : peekAngle;

              // Realistic paper depth elevation (Z offset)
              const translateZOffset = isFlipped ? (index * 1.2) : ((4 - index) * 1.2);

              return (
                <div
                  key={page.id}
                  className="csb-flipping-sheet"
                  style={{
                    transform: `rotateY(${rotateAngle}deg) translateZ(${translateZOffset}px)`,
                    zIndex: zIndex,
                  }}
                >
                  {/* Front Face (Visible when on right side) */}
                  <div className="csb-sheet-face">
                    <div className="csb-page-border-frame" />
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="csb-chapter-title">{page.front.chapter}</span>
                          <span className="text-amber-800/40 text-[9px]">{page.front.motif}</span>
                        </div>
                        <div className="text-[10px] text-amber-900/60 font-serif font-semibold tracking-wider mb-2">
                          {page.front.title}
                        </div>
                        <div className="csb-drop-cap">{page.front.dropCap}</div>
                        <div className="space-y-1 pt-1">
                          {page.front.paragraphs.slice(0, 4).map((w, i) => (
                            <div key={i} className="csb-text-line" style={{ width: w }} />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {page.front.paragraphs.slice(4).map((w, i) => (
                          <div key={i} className="csb-text-line" style={{ width: w }} />
                        ))}
                      </div>

                      <div className="csb-page-number right-3">{page.front.pageNo}</div>
                    </div>
                    {/* Paper Curl Lighting Overlay */}
                    <div className="csb-paper-curl-overlay" />
                  </div>

                  {/* Back Face (Visible when flipped over to left side) */}
                  <div className="csb-sheet-face csb-sheet-face-back">
                    <div className="csb-page-border-frame" />
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-amber-800/40 text-[9px]">{page.back.motif}</span>
                          <span className="csb-chapter-title">{page.back.chapter}</span>
                        </div>
                        <div className="text-[10px] text-amber-900/60 font-serif font-semibold tracking-wider mb-2">
                          {page.back.title}
                        </div>
                        <div className="csb-drop-cap">{page.back.dropCap}</div>
                        <div className="space-y-1 pt-1">
                          {page.back.paragraphs.slice(0, 3).map((w, i) => (
                            <div key={i} className="csb-text-line" style={{ width: w }} />
                          ))}
                        </div>
                      </div>

                      {page.back.quote ? (
                        <div className="text-[9px] italic text-amber-900/70 font-serif text-center px-1 my-1">
                          {page.back.quote}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {page.back.paragraphs.slice(3).map((w, i) => (
                            <div key={i} className="csb-text-line" style={{ width: w }} />
                          ))}
                        </div>
                      )}

                      <div className="csb-page-number left-3">{page.back.pageNo}</div>
                    </div>
                    {/* Paper Curl Lighting Overlay */}
                    <div className="csb-paper-curl-overlay" />
                  </div>
                </div>
              );
            })}

            {/* Spine Center Gutter Creases (Depth effect) */}
            <div className="csb-spine-gutter-left" />
            <div className="csb-spine-gutter-right" />
          </div>
        </div>

        {/* 3. Status Badge, Main Headline & Supporting Text */}
        <div className="flex flex-col items-center text-center max-w-2xl px-4 z-30 mt-2 sm:mt-4">
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: shouldReduceMotion ? 0.1 : 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-2 sm:mb-3"
          >
            <div className="csb-status-badge">
              <span className="csb-status-sparkle">✦</span>
              <span>CURRENTLY BUILDING</span>
              <span className="csb-status-sparkle">✦</span>
            </div>
          </motion.div>

          {/* Main Headline (Line by Line reveal) */}
          <div className="space-y-0 sm:space-y-1 mb-2 sm:mb-3">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: '0%' }}
                transition={{
                  duration: 0.9,
                  delay: shouldReduceMotion ? 0.2 : 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="csb-gold-headline text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-tight"
              >
                A new chapter
              </motion.h1>
            </div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: '0%' }}
                transition={{
                  duration: 0.9,
                  delay: shouldReduceMotion ? 0.3 : 1.0,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="csb-gold-headline text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-tight"
              >
                is about to begin.
              </motion.h1>
            </div>
          </div>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: shouldReduceMotion ? 0.4 : 1.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-stone-300/80 font-normal text-xs sm:text-sm md:text-base tracking-wide max-w-sm mx-auto"
          >
            FlipiBook is coming soon.
          </motion.p>
        </div>
      </main>

      {/* 4. Footer Minimalistic Accent (No menus, purely aesthetic copyright/chapter mark) */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: shouldReduceMotion ? 0.5 : 1.5 }}
        className="relative z-30 pb-1 sm:pb-2 text-center"
      >
        <div className="flex items-center justify-center gap-2.5 text-[10px] sm:text-xs text-neutral-500 tracking-widest font-mono">
          <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-neutral-700" />
          <span>EST. 2026</span>
          <span className="w-1 h-1 rounded-full bg-amber-500/40" />
          <span>FLIPIBOOK</span>
          <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-neutral-700" />
        </div>
      </motion.footer>
    </div>
  );
}
