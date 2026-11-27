import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, Lightbulb, X, Loader2, Minimize2, Maximize2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FlipibookLogo = '/Login/logo.svg';

const DEFAULT_STEPS = [
    { id: 1, label: 'Uploading', sublabel: 'File received' },
    { id: 2, label: 'Extracting', sublabel: 'Reading PDF content' },
    { id: 3, label: 'Processing', sublabel: 'Organizing pages' },
    { id: 4, label: 'Complete', sublabel: 'Ready to use' }
];

/**
 * Pixel-perfect Document & PDF Processing Fullscreen Loading Screen
 * - Fullscreen 100vw x 100vh responsive layout
 * - Top navigation bar with Flipibook logo + Notification bell + User profile pill
 * - Ambient soft radial background glow
 * - Central halo with shining silver luster & radiant specular shine
 * - Single gray track border + inside gradient percentage progress stroke
 * - Compact document card with fold, badge & lines (balanced bottom)
 * - Monotonic percentage display inside circle at bottom (never drops, strictly caps at 99% before done)
 * - 4-stage stepper: Uploading -> Extracting -> Processing -> Complete
 *   (All 4 turn completed with checkmarks upon stage === 'done')
 * - Bottom tip pill banner with lightbulb icon
 */
const PdfProcessingLoader = ({
    progress,
    onCancel,
    isMinimized: controlledMinimized,
    setIsMinimized: setControlledMinimized,
    onOpenEditor
}) => {
    const { user } = useAuth() || {};

    const isControlled = controlledMinimized !== undefined;
    const [internalMinimized, setInternalMinimized] = useState(false);
    const isMinimized = isControlled ? controlledMinimized : internalMinimized;
    const setIsMinimized = isControlled ? setControlledMinimized : setInternalMinimized;

    const [isCancelledLocally, setIsCancelledLocally] = useState(false);
    const hadProgressRef = useRef(Boolean(progress));

    // Reset minimized and cancelled state ONLY when transitioning from no progress to active progress
    useEffect(() => {
        const hasProg = Boolean(progress);
        if (!hasProg) {
            if (!isControlled) setIsMinimized(false);
            setIsCancelledLocally(false);
        } else if (!hadProgressRef.current) {
            if (!isControlled) setIsMinimized(false);
            setIsCancelledLocally(false);
        }
        hadProgressRef.current = hasProg;
    }, [progress, isControlled, setIsMinimized]);

    const handleCancel = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setIsCancelledLocally(true);
        if (onCancel) {
            try {
                onCancel();
            } catch (err) {
                console.error('[PdfProcessingLoader] Cancel error:', err);
            }
        }
    };

    // Keep a "last seen" progress ref so hooks never see stale null and component doesn't remount on null
    const lastProgressRef = useRef(progress);
    if (progress) lastProgressRef.current = progress;
    const effectiveProgress = progress || lastProgressRef.current;

    const {
        current = 0,
        total = 0,
        fileIndex = 0,
        totalFiles = (effectiveProgress?.totalFiles || effectiveProgress?.total || 1),
        pageCount = 0,
        message = '',
        fileName = effectiveProgress?.fileName || '',
        stage = effectiveProgress?.stage || 'uploading',
        percent: explicitPercent
    } = effectiveProgress || {};

    // Detect document type (PDF, Word, PowerPoint)
    const isPpt = fileName && (fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx'));
    const isWord = fileName && (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx'));
    const isPdf = !isPpt && !isWord;

    const docBadgeText = isPpt ? 'PPT' : isWord ? 'DOCX' : 'PDF';
    const docBadgeColor = isPpt ? 'bg-[#EA580C]' : isWord ? 'bg-[#2563EB]' : 'bg-[#EF4444]';

    const isDone = stage === 'done';
    const isExtracting = stage === 'converting' || stage === 'extracting' || stage === 'extracting_initial' || (typeof stage === 'string' && stage.includes('extract'));
    const isSaving = stage === 'saving' || stage === 'processing';
    const isVps = effectiveProgress?.engine === 'vps';

    // Total pages count from progress or file
    const totalPagesCount = useMemo(() => {
        const directPageCount = Number(pageCount || progress?.pageCount || 0);
        if (directPageCount > 0) return directPageCount;
        const directTotal = Number(total || 0);
        if (directTotal > 0 && (isExtracting || isSaving || isDone)) {
            return directTotal;
        }
        return 0;
    }, [pageCount, total, isExtracting, isSaving, isDone, progress?.pageCount]);

    // Extracted pages count (e.g. 56 of 100)
    const extractedPagesCount = useMemo(() => {
        if (!totalPagesCount || totalPagesCount <= 0) return 0;

        if (isSaving || isDone) {
            return totalPagesCount;
        }

        if (stage === 'uploading') {
            return 0;
        }

        // Exact page count from worker/stream (e.g. 0 when starting, 1..N as pages extract)
        if (current !== undefined && current !== null && !isNaN(Number(current))) {
            return Math.min(totalPagesCount, Math.max(0, Number(current)));
        }

        return 0;
    }, [totalPagesCount, isSaving, isDone, stage, current]);

    // Compute accurate target percentage mapped continuously across all stages:
    // Upload: 0% -> 50% based strictly on actual upload bytes/percentage
    // Extract: 50% -> 90% based strictly on actual extracted pages count
    // Processing: 90% -> 99%
    // Complete: 100%
    const computedTargetPercent = useMemo(() => {
        // Complete -> exactly 100%
        if (isDone) return 100;

        // Stage 1: Uploading -> maps 0% to 50% based on upload bytes or upload percent
        if (stage === 'uploading') {
            if (effectiveProgress?.loadedBytes && effectiveProgress?.totalBytes && effectiveProgress.totalBytes > 0) {
                const ratio = Math.min(1, Math.max(0, effectiveProgress.loadedBytes / effectiveProgress.totalBytes));
                return Math.min(50, Math.max(0, Math.round(ratio * 50)));
            }
            if (explicitPercent !== undefined && explicitPercent !== null && explicitPercent >= 0) {
                const ratio = Math.min(1, Math.max(0, explicitPercent / 100));
                return Math.min(50, Math.max(0, Math.round(ratio * 50)));
            }
            return 0;
        }

        // Stage 2: Extracting Pages -> maps 50% to 90% strictly based on actual pages extracted
        if (isExtracting) {
            if (totalPagesCount > 0) {
                const ratio = Math.min(1, Math.max(0, extractedPagesCount / totalPagesCount));
                return Math.min(90, Math.max(50, Math.round(50 + (ratio * 40))));
            }
            return 50;
        }

        // Stage 3: Processing & Saving -> maps 90% to 99%
        if (isSaving) {
            return 95;
        }

        return 50;
    }, [isDone, explicitPercent, stage, isExtracting, isSaving, totalPagesCount, extractedPagesCount, effectiveProgress?.loadedBytes, effectiveProgress?.totalBytes]);

    // Monotonicity reference: highest percentage reached so it strictly NEVER drops down
    const highestPercentRef = useRef(0);
    const highestCountRef = useRef(0);
    const activeSessionRef = useRef(effectiveProgress?.sessionId || null);

    // Reset watermarks ONLY when a genuinely new upload session begins
    useEffect(() => {
        const sessId = effectiveProgress?.sessionId;
        if (!progress) {
            highestPercentRef.current = 0;
            highestCountRef.current = 0;
            setFluidPercent(0);
            activeSessionRef.current = null;
        } else if (sessId && sessId !== activeSessionRef.current) {
            activeSessionRef.current = sessId;
            highestPercentRef.current = 0;
            highestCountRef.current = 0;
            setFluidPercent(0);
        }
    }, [progress, effectiveProgress?.sessionId]);

    // Fluid continuous percentage state
    const [fluidPercent, setFluidPercent] = useState(() => {
        if (isDone) return 100;
        const initial = Math.min(99, computedTargetPercent);
        highestPercentRef.current = initial;
        return initial;
    });

    // Update percentage strictly monotonically: NEVER decreases, NEVER hits 100% before complete
    useEffect(() => {
        if (isDone) {
            highestPercentRef.current = 100;
            setFluidPercent(100);
            return;
        }

        // Strictly cap at 99% before complete
        const safeTarget = Math.min(99, computedTargetPercent);

        // Strictly monotonic: percentage must not drop below once it has arisen
        const monotonicTarget = Math.max(highestPercentRef.current, safeTarget);
        highestPercentRef.current = monotonicTarget;

        setFluidPercent(monotonicTarget);
    }, [computedTargetPercent, isDone]);

    // Displayed percentage: strictly 100% only when done, capped at 99% before completion
    const displayPercent = isDone 
        ? 100 
        : Math.min(99, Math.max(0, Math.round(fluidPercent)));

    // Smooth physics-based spring interpolation for percentage (responsive & silky smooth)
    const progressMotion = useMotionValue(displayPercent);
    const smoothProgress = useSpring(progressMotion, { stiffness: 65, damping: 16, mass: 0.5 });

    // SVG Circular Progress Ring constants (in SVG viewBox coordinate units)
    const CIRCLE_RADIUS = 44;
    const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // 276.46015...

    const [animatedDisplayPercent, setAnimatedDisplayPercent] = useState(displayPercent);

    useEffect(() => {
        progressMotion.set(displayPercent);
    }, [displayPercent, progressMotion]);

    useEffect(() => {
        const unsubscribe = smoothProgress.on('change', (latest) => {
            setAnimatedDisplayPercent(Math.min(isDone ? 100 : 99, Math.max(0, Math.round(latest))));
        });
        return () => unsubscribe();
    }, [smoothProgress, isDone]);

    // Derived dash offset in SVG viewBox units (never mixes CSS pixels with viewBox units)
    const circleDashOffset = useMemo(() => {
        const pct = Math.min(100, Math.max(0, animatedDisplayPercent));
        return CIRCLE_CIRCUMFERENCE - (pct / 100) * CIRCLE_CIRCUMFERENCE;
    }, [animatedDisplayPercent, CIRCLE_CIRCUMFERENCE]);

    // Extracted pages count displayed in badge (shows exact real-time extraction count monotonically)
    const displayedPagesCount = useMemo(() => {
        if (!totalPagesCount || totalPagesCount <= 0) return 0;
        if (isDone || stage === 'done' || isSaving) {
            highestCountRef.current = totalPagesCount;
            return totalPagesCount;
        }
        if (stage === 'uploading') {
            return 0;
        }
        let target = 0;
        // If exact current extraction count is reported by worker/stream, show it directly!
        if (current !== undefined && current !== null && Number(current) >= 0) {
            target = Math.min(totalPagesCount, Math.max(0, Number(current)));
        } else {
            // Fallback: synchronized with the animated progress percentage across the 50%-90% extraction arc
            const conversionRatio = Math.min(1, Math.max(0, (animatedDisplayPercent - 50) / 40));
            target = Math.min(totalPagesCount, Math.max(0, Math.round(conversionRatio * totalPagesCount)));
        }
        highestCountRef.current = Math.max(highestCountRef.current, target);
        return highestCountRef.current;
    }, [totalPagesCount, isDone, stage, isSaving, current, animatedDisplayPercent]);

    // Derive active step (1: Uploading, 2: Extracting, 3: Processing, 4: Complete, 5: All Finished)
    const activeStep = useMemo(() => {
        if (isDone || stage === 'done') return 5; // All 4 steps completed with checkmarks!
        if (isSaving) return 3; // Processing & saving
        if (isExtracting) return 2; // Extracting pages/slides
        return 1; // Uploading
    }, [stage, isDone, isExtracting, isSaving]);

    // Transferred megabytes for Stage 1 (e.g. 22.4 MB / 35.0 MB)
    const loadedMB = effectiveProgress?.loadedBytes ? (effectiveProgress.loadedBytes / (1024 * 1024)).toFixed(1) : null;
    const totalMB = effectiveProgress?.totalBytes ? (effectiveProgress.totalBytes / (1024 * 1024)).toFixed(1) : null;

    // Dynamic Live Status Display across both stages
    const dynamicStatus = useMemo(() => {
        if (isDone) return "All pages ready! Launching your flipbook...";
        if (isSaving) return "Finalizing flipbook structure & caching pages...";
        if (isExtracting) return "Extracting pages...";
        if (stage === 'uploading') return "Uploading document...";
        return "We're analysing your document and extracting the pages, text and images.";
    }, [isDone, isSaving, isExtracting, stage]);

    const displayTip = "Large files may take a little longer. Feel free to stay on this page.";

    const steps = useMemo(() => {
        return DEFAULT_STEPS.map(s => {
            if (s.id === 1) {
                return {
                    ...s,
                    sublabel: activeStep > 1
                        ? (totalMB ? `${totalMB} / ${totalMB} MB` : 'Uploaded')
                        : (loadedMB && totalMB
                            ? `${loadedMB} / ${totalMB} MB`
                            : 'Uploading...')
                };
            }
            if (s.id === 2) {
                return {
                    ...s,
                    sublabel: activeStep === 2 && totalPagesCount > 0
                        ? `${displayedPagesCount}/${totalPagesCount} Extracted`
                        : activeStep > 2
                        ? `${totalPagesCount}/${totalPagesCount} Extracted`
                        : (isPdf ? 'Reading PDF' : 'Reading pages')
                };
            }
            if (s.id === 3) {
                return {
                    ...s,
                    sublabel: isSaving ? 'Organizing...' : (activeStep > 3 ? 'Organized' : 'Page structure')
                };
            }
            if (s.id === 4) {
                return {
                    ...s,
                    sublabel: isDone ? 'Ready to open' : 'Finalizing'
                };
            }
            return s;
        });
    }, [isPdf, loadedMB, totalMB, activeStep, totalPagesCount, displayedPagesCount, isSaving, isDone]);

    // User Avatar Initials
    const userInitial = useMemo(() => {
        if (user?.name) return user.name.charAt(0).toUpperCase();
        if (user?.emailId) return user.emailId.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    }, [user]);

    return (
        <AnimatePresence>
            {Boolean(progress) && !isCancelledLocally && !isMinimized && (
                <motion.div
                    key="pdf-processing-overlay"
                    className="fixed inset-0 z-[99999] flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none w-screen h-screen bg-[#FAFBFD]"
                    initial={{ opacity: 0, scale: 0.995 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.995 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                {/* Ambient Decorative Background Glows with breathing animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Top-Right Soft Glow */}
                    <motion.div 
                        className="absolute -top-[10vw] -right-[10vw] w-[40vw] h-[40vw] rounded-full blur-[7vw] bg-gradient-to-br from-indigo-100/60 to-purple-100/40"
                        animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
                        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                    />
                    {/* Bottom-Left Soft Glow */}
                    <motion.div 
                        className="absolute -bottom-[10vw] -left-[10vw] w-[35vw] h-[35vw] rounded-full blur-[6.5vw] bg-gradient-to-tr from-blue-100/50 to-indigo-100/30"
                        animate={{ scale: [1.06, 0.96, 1.06], opacity: [0.65, 0.9, 0.65] }}
                        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
                    />
                </div>

                {/* Top Navigation Bar */}
                <header className="relative z-10 w-full px-[3.5vw] py-[2.2vh] flex items-center justify-between">
                    {/* Flipibook Logo */}
                    <div className="flex items-center gap-[1.2vw]">
                        <img
                            src={FlipibookLogo}
                            alt="FLIPIBOOK"
                            className="h-[2.3vw] max-h-[4.5vh] object-contain cursor-default"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Top Right Controls (Minimize Button) */}
                    <div className="flex items-center gap-[0.8vw]">
                        {/* Minimize Button */}
                        <button
                            type="button"
                            onClick={() => setIsMinimized(true)}
                            className="flex items-center gap-[0.35vw] px-[0.9vw] py-[0.45vw] rounded-full bg-white/90 hover:bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 text-[0.78vw] font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                            title="Minimize and continue browsing dashboard"
                        >
                            <Minimize2 className="w-[0.9vw] h-[0.9vw]" />
                            <span>Minimize</span>
                        </button>
                    </div>
                </header>

                {/* Main Centered Content */}
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-[1.5vw] py-[2vh] max-w-[55vw] mx-auto w-full text-center">
                    
                    {/* Halo with Shining Silver Fade from Left to Right */}
                    <div className="relative w-[13.5vw] h-[13.5vw] flex items-center justify-center mb-[1.5vw]">
                        
                        {/* Soft Ambient Diffused Outer Shade / Halo Glow like before */}
                        <div className="absolute -inset-[0.8vw] rounded-full bg-gradient-to-b from-indigo-200/50 via-purple-100/30 to-blue-200/40 blur-[1.6vw] pointer-events-none" />

                        {/* Dimensional Circular Disc with Rich Outer Drop Shadow and Inset Luster */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-[#F8FAFC] to-[#EDF2F7] shadow-[0_1.2vw_3.5vw_rgba(99,102,241,0.18),0_0.4vw_1.5vw_rgba(15,23,42,0.08),inset_0_0.1vw_0.25vw_rgba(255,255,255,1),inset_0_-0.1vw_0.3vw_rgba(148,163,184,0.18)] pointer-events-none overflow-hidden">
                            {/* Subtle Silky Silver Ambient Sheen */}
                            <motion.div
                                className="absolute -inset-y-[1.5vw] -left-1/2 w-[200%] h-[150%] pointer-events-none"
                                style={{
                                    background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.3) 44%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.3) 56%, rgba(255,255,255,0) 65%, transparent 80%)'
                                }}
                                animate={{ x: ['-60%', '60%'] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
                            />
                        </div>

                        {/* Clean Single Gray Border & Inside Continuous Percentage Progress Bar */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="circleProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={isVps ? "#F97316" : "#2563EB"} />
                                    <stop offset="50%" stopColor={isVps ? "#FB923C" : "#3B82F6"} />
                                    <stop offset="100%" stopColor={isVps ? "#EA580C" : "#60A5FA"} />
                                </linearGradient>
                            </defs>

                            {/* Single Clean Gray Border Track */}
                            <circle
                                cx="50"
                                cy="50"
                                r={CIRCLE_RADIUS}
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="2.5"
                            />

                            {/* Inside Percentage Progress Bar (continuous solid arc, unit-consistent in SVG space) */}
                            <circle
                                cx="50"
                                cy="50"
                                r={CIRCLE_RADIUS}
                                fill="none"
                                stroke="url(#circleProgressGradient)"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                                strokeDashoffset={circleDashOffset}
                                strokeOpacity={animatedDisplayPercent > 0 ? 1 : 0}
                                transform="rotate(-90 50 50)"
                                style={{
                                    transition: 'stroke-dashoffset 0.25s cubic-bezier(0.16, 1, 0.3, 1), stroke-opacity 0.2s ease',
                                    filter: isVps 
                                        ? 'drop-shadow(0 0 2.5px rgba(234, 88, 12, 0.45))' 
                                        : 'drop-shadow(0 0 2.5px rgba(37, 99, 235, 0.45))'
                                }}
                            />
                        </svg>

                        {/* Levitating Realistic Document Card */}
                        <motion.div
                            className="relative z-10 w-[4.2vw] h-[4.8vw] -mt-[1.5vw] bg-white rounded-[0.7vw] shadow-[0_0.4vw_1.2vw_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col items-center pt-[0.55vw] px-[0.4vw] overflow-hidden"
                            animate={{
                                y: [-3, 3, -3],
                                rotate: [-0.6, 0.6, -0.6]
                            }}
                            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                        >
                            {/* Folded Top-Right Corner */}
                            <div className="absolute top-0 right-0 w-[1vw] h-[1vw]">
                                <div className="absolute inset-0 bg-slate-100 rounded-bl-[0.3vw] border-b border-l border-slate-200/70" />
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[1vw] border-t-white border-l-[1vw] border-l-transparent" />
                            </div>

                            {/* Document Badge with Scanning Sheen */}
                            <div className={`relative overflow-hidden mt-[0.1vw] px-[0.45vw] py-[0.12vw] rounded-[0.25vw] ${docBadgeColor} text-white font-extrabold text-[0.6vw] tracking-wider shadow-xs`}>
                                <span className="relative z-10">{docBadgeText}</span>
                                <motion.div
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 1 }}
                                />
                            </div>

                            {/* Document Text Placeholder Lines with Live Shimmer */}
                            <div className="relative w-[2.2vw] h-[0.22vw] bg-[#CBD5E1] rounded-full mt-[0.6vw] overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/90 to-transparent"
                                    animate={{ x: ['-100%', '150%'] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                                />
                            </div>
                            <div className="relative w-[1.5vw] h-[0.22vw] bg-[#CBD5E1] rounded-full mt-[0.35vw] overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/90 to-transparent"
                                    animate={{ x: ['-100%', '150%'] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                                />
                            </div>
                        </motion.div>

                        {/* Soft Ground Shadow right below Document Card */}
                        <motion.div
                            className="absolute bottom-[4.3vw] w-[2.8vw] h-[0.35vw] bg-indigo-950/10 rounded-full blur-[0.15vw] pointer-events-none"
                            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.18, 0.38, 0.18] }}
                            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                        />

                        {/* Percentage text inside circle at bottom in fluid sync with circular bar */}
                        <motion.div
                            className="absolute bottom-[2.3vw] z-20 flex items-center justify-center pointer-events-none"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className={`text-[0.9vw] font-black tracking-tight select-none tabular-nums ${isVps ? 'text-[#EA580C]' : 'text-[#2563EB]'}`}>
                                {animatedDisplayPercent}%
                            </span>
                        </motion.div>
                    </div>

                    {/* Subtitle Line */}
                    <div className="text-[0.88vw] text-[#475569] max-w-[34vw] leading-relaxed mb-[2.5vw] font-medium">
                        <p>{dynamicStatus}</p>
                    </div>

                    {/* 4-Stage Stepper: Fluid connection lines & smooth step state transitions */}
                    <div className="w-full max-w-[38vw] grid grid-cols-4 relative px-[0.5vw]">
                        {steps.map((step, idx) => {
                            const isCompleted = isDone ? true : step.id < activeStep;
                            const isActive = !isDone && step.id === activeStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center text-center relative px-[0.25vw]">
                                    {/* Connecting Line to next step: smooth expanding gradient fill */}
                                    {idx < steps.length - 1 && (
                                        <div 
                                            className="absolute top-[1.15vw] left-[calc(50%+1.3vw)] w-[calc(100%-2.6vw)] h-[0.16vw] -translate-y-1/2 z-0 rounded-full bg-[#E2E8F0] overflow-hidden"
                                        >
                                            <motion.div 
                                                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#8B5CF6]"
                                                initial={false}
                                                animate={{ width: isDone || activeStep > step.id ? '100%' : '0%' }}
                                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                    )}

                                    {/* Step Circle Badge */}
                                    <div
                                        className={`w-[2.3vw] h-[2.3vw] rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0.2vw_0.6vw_rgba(0,0,0,0.04)] relative z-10 ${
                                            isCompleted
                                                ? 'bg-[#3B82F6] text-white shadow-blue-200'
                                                : isActive
                                                ? 'bg-white border-[0.16vw] border-[#4F46E5] text-[#4F46E5] ring-[0.25vw] ring-indigo-50 shadow-indigo-100'
                                                : 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8]'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-[1.05vw] h-[1.05vw] text-white stroke-[3]" />
                                        ) : isActive ? (
                                            <Loader2 className="w-[1.15vw] h-[1.15vw] text-[#4F46E5] animate-spin" />
                                        ) : (
                                            <span className="text-[0.78vw] font-bold text-[#64748B] select-none">
                                                {step.id}
                                            </span>
                                        )}
                                    </div>

                                    {/* Step Title (Locked minimum height to eliminate layout jumping) */}
                                    <div className="mt-[0.5vw] min-h-[1.7vw] flex items-center justify-center whitespace-nowrap">
                                        <span className={`text-[0.85vw] font-bold tracking-tight transition-colors duration-300 ${
                                            isActive || isCompleted ? 'text-[#0F172A]' : 'text-[#64748B]'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>

                                    {/* Step Sublabel (Locked minimum height) */}
                                    <div className="min-h-[1.1vw] flex items-center justify-center text-[0.72vw] text-[#64748B] mt-[0.15vw] leading-snug whitespace-nowrap">
                                        <span>{step.sublabel}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Tip Pill Banner */}
                    <motion.div
                        className="mt-[2.8vw] inline-flex items-center gap-[0.5vw] px-[1.2vw] py-[0.5vw] rounded-full bg-[#EEF2FF]/80 border border-[#E0E7FF] text-[#475569] text-[0.78vw] shadow-[0_0.2vw_0.6vw_rgba(0,0,0,0.03)]"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    >
                        <Lightbulb className="w-[0.9vw] h-[0.9vw] text-[#6366F1] flex-shrink-0" />
                        <span>{displayTip}</span>
                    </motion.div>

                    {/* Optional Cancel Upload Action */}
                    {onCancel && (
                        <motion.button
                            type="button"
                            onClick={handleCancel}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-[1vw] text-[0.72vw] font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-[0.25vw] cursor-pointer"
                        >
                            <X className="w-[0.75vw] h-[0.75vw]" />
                            <span>Cancel upload</span>
                        </motion.button>
                    )}
                </main>

                {/* Footer spacer to maintain balance */}
                <div className="w-full h-[2vh] pointer-events-none" />
            </motion.div>
        )}

        {/* Floating Background Upload Dock (rendered when minimized) */}
        {Boolean(progress) && !isCancelledLocally && isMinimized && (
            <motion.div
                key="pdf-processing-minimized"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-[99999] w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden select-none p-4"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${docBadgeColor} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs`}>
                            {docBadgeText}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate" title={fileName}>
                                {fileName || 'Document'}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium">
                                {stage === 'uploading'
                                    ? (loadedMB && totalMB ? `Uploading (${loadedMB} / ${totalMB} MB)...` : `Uploading (${animatedDisplayPercent}%)...`)
                                    : stage === 'extracting'
                                    ? `Extracting (${displayedPagesCount}/${totalPagesCount} pages)...`
                                    : stage === 'done'
                                    ? 'Ready to open'
                                    : 'Processing pages...'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {!isDone && (
                            <button
                                type="button"
                                onClick={() => setIsMinimized(false)}
                                title="Expand to fullscreen"
                                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        )}
                        {onCancel && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                title={isDone ? "Dismiss" : "Cancel upload"}
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sleek Thin Progress Bar with Left-to-Right Gradient */}
                <div className="w-full bg-slate-100 h-[5px] rounded-full overflow-hidden mb-2.5 relative">
                    <motion.div
                        className={`h-full rounded-full relative overflow-hidden transition-all duration-300 ${
                            isVps 
                                ? 'bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FDBA74]' 
                                : 'bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA]'
                        }`}
                        style={{ width: `${Math.max(4, animatedDisplayPercent)}%` }}
                    >
                        {/* Shimmer light sweep traveling smoothly left to right */}
                        <motion.div
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                        />
                    </motion.div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>{stage === 'uploading' ? 'Step 1 of 4: Uploading' : isExtracting ? 'Step 2 of 4: Extracting' : isSaving ? 'Step 3 of 4: Processing' : 'Complete'}</span>
                    <span className={`font-bold ${isVps ? 'text-[#EA580C]' : 'text-[#2563EB]'}`}>{animatedDisplayPercent}%</span>
                </div>

                {/* Open Flipbook Action Button when completed in background minimized dock */}
                {isDone && onOpenEditor && (
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={onOpenEditor}
                        className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                        <span>Open Flipbook in Editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </motion.div>
        )}
        </AnimatePresence>
    );
};

export default PdfProcessingLoader;
