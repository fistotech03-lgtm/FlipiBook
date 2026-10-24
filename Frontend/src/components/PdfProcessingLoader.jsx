import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, Lightbulb, Bell, ChevronDown, X, Loader2 } from 'lucide-react';
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
const PdfProcessingLoader = ({ progress, onCancel }) => {
    // If no progress is provided, don't render
    if (!progress) return null;

    const { user } = useAuth() || {};

    const {
        current = 0,
        total = 0,
        fileIndex = 0,
        totalFiles = (progress?.totalFiles || progress?.total || 1),
        pageCount = 0,
        message = '',
        fileName = progress?.fileName || '',
        stage = progress?.stage || 'converting',
        percent: explicitPercent
    } = progress || {};

    // Detect document type (PDF, Word, PowerPoint)
    const isPpt = fileName && (fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx'));
    const isWord = fileName && (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx'));
    const isPdf = !isPpt && !isWord;

    const docBadgeText = isPpt ? 'PPT' : isWord ? 'DOCX' : 'PDF';
    const docBadgeColor = isPpt ? 'bg-[#EA580C]' : isWord ? 'bg-[#2563EB]' : 'bg-[#EF4444]';

    const isDone = stage === 'done';

    // Total pages count from progress or file
    const totalPagesCount = useMemo(() => {
        if (pageCount && Number(pageCount) > 0) return Number(pageCount);
        if (total && Number(total) > 0 && (stage === 'converting' || stage === 'saving' || stage === 'done' || totalFiles === 1)) {
            return Number(total);
        }
        if (progress?.pageCount && Number(progress.pageCount) > 0) return Number(progress.pageCount);
        return 0;
    }, [pageCount, total, stage, totalFiles, progress?.pageCount]);

    // Extracted pages count (e.g. 8 of 12)
    const extractedPagesCount = useMemo(() => {
        if (!totalPagesCount || totalPagesCount <= 0) return 0;

        if (stage === 'saving' || stage === 'done') {
            return totalPagesCount;
        }

        if (current && Number(current) > 0) {
            return Math.min(totalPagesCount, Number(current));
        }

        if (stage === 'uploading') {
            return 0;
        }

        if (explicitPercent !== undefined && explicitPercent !== null && explicitPercent > 0) {
            return Math.min(totalPagesCount, Math.max(1, Math.round((explicitPercent / 100) * totalPagesCount)));
        }

        return 1;
    }, [totalPagesCount, stage, current, explicitPercent]);

    // Compute accurate target percentage mapped across the 4 stages
    const computedTargetPercent = useMemo(() => {
        // Step 4: Complete -> exactly 100%
        if (isDone) return 100;

        // Step 1: Uploading -> 0% to 20%
        if (stage === 'uploading') {
            if (explicitPercent !== undefined && explicitPercent !== null) {
                return Math.min(20, Math.max(1, Math.round((explicitPercent / 100) * 20)));
            }
            return 15;
        }

        // Step 2: Extracting Pages -> 20% to 85% (Accurately scaled by extractedPages / totalPages)
        if (stage === 'converting') {
            if (totalPagesCount > 0 && extractedPagesCount >= 0) {
                const ratio = Math.min(1, Math.max(0, extractedPagesCount / totalPagesCount));
                return Math.min(85, Math.round(20 + ratio * 65));
            }
            if (explicitPercent !== undefined && explicitPercent !== null) {
                return Math.min(85, Math.max(20, Math.round(20 + (explicitPercent / 100) * 65)));
            }
            return 50;
        }

        // Step 3: Processing & Saving -> 85% to 99% (Smooth, never freezes at 98%, 100% when stage === 'done')
        if (stage === 'saving') {
            if (explicitPercent !== undefined && explicitPercent !== null) {
                return Math.min(99, Math.max(85, Math.round(85 + (explicitPercent / 100) * 14)));
            }
            return 92;
        }

        // Fallback default
        if (explicitPercent !== undefined && explicitPercent !== null) {
            return Math.min(99, Math.max(0, Math.round(explicitPercent)));
        }
        return 68;
    }, [isDone, explicitPercent, stage, totalPagesCount, extractedPagesCount]);

    // Monotonicity reference: highest percentage reached so it strictly NEVER drops down
    const highestPercentRef = useRef(0);
    const prevFileRef = useRef(fileName);

    // Reset watermark only when a completely new file begins
    useEffect(() => {
        if (fileName && fileName !== prevFileRef.current) {
            prevFileRef.current = fileName;
            highestPercentRef.current = 0;
        }
    }, [fileName]);

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

        setFluidPercent(prev => Math.max(prev, monotonicTarget));
    }, [computedTargetPercent, isDone]);

    // Subtle ambient creep while waiting for network/IO (strictly bounded within stage ceilings)
    useEffect(() => {
        if (isDone) return;

        const interval = setInterval(() => {
            setFluidPercent(prev => {
                if (prev >= 99) return prev;
                const ceiling = stage === 'uploading' ? 20 : stage === 'converting' ? 85 : 99;
                if (prev >= ceiling) return prev;

                const increment = stage === 'uploading' ? 0.4 : stage === 'converting' ? 0.3 : 0.2;
                const next = Math.min(ceiling, Math.round((prev + increment) * 10) / 10);
                highestPercentRef.current = Math.max(highestPercentRef.current, next);
                return highestPercentRef.current;
            });
        }, 180);

        return () => clearInterval(interval);
    }, [isDone, stage]);

    // Displayed percentage: strictly 100% only when done, capped at 99% before completion
    const displayPercent = isDone 
        ? 100 
        : Math.min(99, Math.max(0, Math.round(fluidPercent)));

    // Smooth physics-based spring interpolation for percentage & circle stroke
    const progressMotion = useMotionValue(displayPercent);
    const smoothProgress = useSpring(progressMotion, { stiffness: 45, damping: 15, mass: 0.7 });
    const strokeDashoffset = useTransform(smoothProgress, [0, 100], [276.46, 0]);

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

    // Derive active step (1: Uploading, 2: Extracting, 3: Processing, 4: Complete, 5: All Finished)
    const activeStep = useMemo(() => {
        if (isDone) return 5; // All 4 steps completed with checkmarks!
        if (stage === 'saving' || displayPercent >= 80) return 3;
        if (stage === 'converting' || displayPercent >= 20) return 2;
        return 1; // Uploading
    }, [stage, displayPercent, isDone]);

    const displaySubtitle = "We're analysing your document and extracting the pages, text and images.";
    const displayTip = "Large files may take a little longer. Feel free to stay on this page.";

    const steps = useMemo(() => {
        return DEFAULT_STEPS.map(s => {
            if (s.id === 2) {
                return {
                    ...s,
                    sublabel: isPdf ? 'Reading PDF content' : isPpt ? 'Reading slides' : 'Reading document'
                };
            }
            return s;
        });
    }, [isPdf, isPpt]);

    // User Avatar Initials
    const userInitial = useMemo(() => {
        if (user?.name) return user.name.charAt(0).toUpperCase();
        if (user?.emailId) return user.emailId.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    }, [user]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[99999] bg-[#F8FAFC] flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none w-screen h-screen"
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Ambient Decorative Background Glows with breathing animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Top-Right Soft Lavender Glow */}
                    <motion.div 
                        className="absolute -top-[10vw] -right-[10vw] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-indigo-100/60 to-purple-100/40 blur-[7vw]"
                        animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
                        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                    />
                    {/* Bottom-Left Soft Blue Glow */}
                    <motion.div 
                        className="absolute -bottom-[10vw] -left-[10vw] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-blue-100/50 to-indigo-100/30 blur-[6.5vw]"
                        animate={{ scale: [1.06, 0.96, 1.06], opacity: [0.65, 0.9, 0.65] }}
                        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
                    />
                </div>

                {/* Top Navigation Bar */}
                <header className="relative z-10 w-full px-[3.5vw] py-[2.2vh] flex items-center justify-between">
                    {/* Flipibook Logo */}
                    <div className="flex items-center">
                        <img
                            src={FlipibookLogo}
                            alt="FLIPIBOOK"
                            className="h-[2.3vw] max-h-[4.5vh] object-contain cursor-default"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Top Right Controls (Notification Bell & User Profile Avatar Pill) */}
                    <div className="flex items-center gap-[0.8vw]">
                        {/* Notification Bell Button */}
                        <div className="w-[2.4vw] h-[2.4vw] min-w-[2.4vw] min-h-[2.4vw] rounded-full bg-white/90 border border-gray-200/80 shadow-xs flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                            <Bell className="w-[1vw] h-[1vw] text-gray-600" />
                        </div>

                        {/* User Avatar Pill */}
                        <div className="flex items-center gap-[0.5vw] py-[0.25vw] pl-[0.25vw] pr-[0.7vw] rounded-full bg-white/90 border border-gray-200/80 shadow-xs">
                            <div className="w-[1.9vw] h-[1.9vw] rounded-full overflow-hidden bg-gradient-to-tr from-amber-700 to-amber-600 border border-amber-200 flex items-center justify-center text-white text-[0.7vw] font-semibold shadow-inner">
                                {user?.picture ? (
                                    <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{userInitial}</span>
                                )}
                            </div>
                            <ChevronDown className="w-[0.8vw] h-[0.8vw] text-gray-500" />
                        </div>
                    </div>
                </header>

                {/* Main Centered Content */}
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-[1.5vw] py-[2vh] max-w-[55vw] mx-auto w-full text-center">
                    
                    {/* Halo with Shining Silver Fade from Left to Right */}
                    <div className="relative w-[13vw] h-[13vw] flex items-center justify-center mb-[1.5vw]">
                        
                        {/* Shining Silver Circular Disc */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-[#F8FAFC] to-[#E2E8F0] shadow-[0_0.7vw_1.8vw_rgba(148,163,184,0.18),inset_0_0.08vw_0.2vw_rgba(255,255,255,0.95)] overflow-hidden pointer-events-none">
                            {/* Radiant Pure Silver Specular Beam */}
                            <motion.div
                                className="absolute -inset-y-[1.5vw] -left-1/2 w-[200%] h-[150%] pointer-events-none"
                                style={{
                                    background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.35) 44%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.35) 56%, rgba(255,255,255,0) 65%, transparent 80%)'
                                }}
                                animate={{ x: ['-60%', '60%'] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
                            />

                            {/* Secondary Ambient Silver Sheen for Silky Luster */}
                            <motion.div
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.1) 75%, transparent 100%)'
                                }}
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: [0.4, 0, 0.2, 1], delay: 0.12 }}
                            />
                        </div>

                        {/* Clean Single Gray Border & Inside Percentage Progress Bar with Spring Motion */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="circleProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="50%" stopColor="#6366F1" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                                <filter id="circleGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#6366F1" floodOpacity="0.4" />
                                </filter>
                            </defs>

                            {/* Single Clean Gray Border Track */}
                            <circle
                                cx="50"
                                cy="50"
                                r="44"
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="2.5"
                            />

                            {/* Inside Percentage Progress Bar (smooth continuous spring stroke fill) */}
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="44"
                                fill="none"
                                stroke="url(#circleProgressGradient)"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeDasharray={276.46}
                                style={{
                                    strokeDashoffset,
                                    transformOrigin: '50% 50%',
                                    transform: 'rotate(-90deg)',
                                    filter: 'url(#circleGlow)'
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
                            <span className="text-[0.9vw] font-black tracking-tight text-[#4F46E5] select-none tabular-nums">
                                {animatedDisplayPercent}%
                            </span>
                        </motion.div>
                    </div>

                    {/* Subtitle Line */}
                    <div className="text-[0.88vw] text-[#64748B] max-w-[34vw] leading-relaxed mb-[2.5vw] font-normal">
                        <p>{displaySubtitle}</p>
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
                                    <motion.div
                                        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                        transition={isActive ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } : { duration: 0.35 }}
                                        className={`w-[2.3vw] h-[2.3vw] rounded-full flex items-center justify-center transition-colors duration-400 shadow-[0_0.2vw_0.6vw_rgba(0,0,0,0.04)] relative z-10 ${
                                            isCompleted
                                                ? 'bg-[#3B82F6] text-white shadow-blue-200'
                                                : isActive
                                                ? 'bg-white border-[0.15vw] border-[#4F46E5] text-[#4F46E5] ring-[0.25vw] ring-indigo-50'
                                                : 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8]'
                                        }`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isCompleted ? (
                                                <motion.div
                                                    key="completed"
                                                    initial={{ scale: 0, rotate: -40, opacity: 0 }}
                                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                                                >
                                                    <Check className="w-[1vw] h-[1vw] stroke-[3]" />
                                                </motion.div>
                                            ) : isActive ? (
                                                <motion.div
                                                    key="active"
                                                    initial={{ scale: 0.6, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.6, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Loader2 className="w-[1vw] h-[1vw] text-[#4F46E5] animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="pending"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="text-[0.78vw] font-semibold"
                                                >
                                                    {step.id}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Step Title with Extract Count beside Point 2 */}
                                    <div className="mt-[0.5vw] flex items-center justify-center gap-[0.35vw] flex-wrap">
                                        <span className={`text-[0.85vw] font-bold tracking-tight transition-colors duration-300 ${
                                            isActive || isCompleted ? 'text-[#0F172A]' : 'text-[#64748B]'
                                        }`}>
                                            {step.label}
                                        </span>
                                        {step.id === 2 && totalPagesCount > 0 && (
                                            <motion.span
                                                layout
                                                className={`inline-flex items-center gap-[0.25vw] px-[0.4vw] py-[0.12vw] rounded-full text-[0.65vw] font-extrabold tracking-tight shadow-2xs transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/90'
                                                        : isCompleted
                                                        ? 'bg-slate-100 text-slate-600 border border-slate-200/80'
                                                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                                                }`}
                                            >
                                                {isActive && (
                                                    <span className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#4F46E5] animate-pulse" />
                                                )}
                                                <span>{extractedPagesCount}/{totalPagesCount}</span>
                                            </motion.span>
                                        )}
                                    </div>

                                    {/* Step Sublabel */}
                                    <div className="text-[0.72vw] text-[#64748B] mt-[0.15vw] leading-snug whitespace-nowrap">
                                        {step.sublabel}
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
                            onClick={onCancel}
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
        </AnimatePresence>
    );
};

export default PdfProcessingLoader;
