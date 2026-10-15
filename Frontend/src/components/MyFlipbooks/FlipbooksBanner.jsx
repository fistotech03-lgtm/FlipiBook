import React from 'react';
import { ArrowRight, FileUp, FilePlus2, LayoutTemplate } from 'lucide-react';
import dashboardBannerImg from '../../assets/Dashboard/Main.png';
import { useAuth } from '../../context/AuthContext';

export default function FlipbooksBanner({
    user,
    setCreateModalInitialView,
    setIsCreateModalOpen,
    handleUploadBoxDragOver,
    handleUploadBoxDrop,
    setSelectedTemplateIdForModal,
    navigate
}) {
    const { user: authUser } = useAuth();
    const effectiveUser = user || authUser;
    const rawName = effectiveUser?.name || effectiveUser?.fullName || effectiveUser?.firstName || (effectiveUser?.emailId ? effectiveUser.emailId.split('@')[0] : (effectiveUser?.email ? effectiveUser.email.split('@')[0] : ''));
    const displayName = rawName ? (rawName.charAt(0).toUpperCase() + rawName.slice(1)) : '';

    return (
        <div className="w-full relative rounded-[1.2vw] py-[1.05vw] px-[1.5vw] border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex justify-between items-center overflow-hidden mb-[0.95vw] flex-shrink-0 select-none bg-gradient-to-r from-white via-white to-[#fff8f6]">
            {/* Ambient Background Accents */}
            <div className="absolute -top-[5vw] right-[14vw] w-[18vw] h-[18vw] bg-gradient-to-br from-orange-400/10 via-rose-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-[4vw] right-[2vw] w-[14vw] h-[14vw] bg-gradient-to-tl from-amber-400/10 via-orange-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Left Side: Greeting & Quick Action Cards */}
            <div className="flex flex-col z-10 max-w-[65%]">

                {/* Main Heading */}
                <h1 className="text-[1.5vw] font-bold text-slate-800 flex items-center gap-[0.45vw]">
                    <span>Welcome back,</span>
                    {displayName ? (
                        <span className="text-[#ec5137] drop-shadow-2xs">
                            {displayName}
                        </span>
                    ) : (
                        <span className="inline-block w-[7vw] h-[1.5vw] bg-slate-200 animate-pulse rounded-[0.4vw] align-middle" />
                    )}
                </h1>

                <p className="text-[0.78vw] text-slate-500 font-medium mt-[0.15vw] mb-[0.85vw]">
                    Ready to bring your ideas to life? Convert existing files or build interactive flipbooks.
                </p>

                {/* 3 Premium Action Cards */}
                <div className="flex items-center gap-[0.85vw]">
                    {/* Card 1: Create Flipbook By PDF, Word, PPT */}
                    <div
                        onClick={() => { setCreateModalInitialView('upload'); setIsCreateModalOpen(true); }}
                        onDragOver={handleUploadBoxDragOver}
                        onDrop={handleUploadBoxDrop}
                        className="w-[16.4vw] h-[5.6vw] bg-white rounded-[0.8vw] border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-[#ec5137] hover:shadow-[0_10px_24px_rgba(236,81,55,0.12)] hover:-translate-y-[2px] px-[0.85vw] py-[0.55vw] flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[3vw] h-[3vw] bg-gradient-to-bl from-[#ec5137]/5 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                            <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-gradient-to-br from-[#fff1ee] to-[#ffe5e0] border border-[#fecaca] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 text-[#ec5137]">
                                <FileUp size="1.25vw" className="text-[#ec5137]" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[0.84vw] font-bold text-slate-800 leading-tight group-hover:text-[#ec5137] transition-colors truncate">
                                    Create Flipbook
                                </h3>
                                <p className="text-[0.68vw] font-semibold text-slate-600 leading-snug mt-[0.08vw] truncate">
                                    PDF, Word & PPT
                                </p>
                                <span className="inline-block text-[0.6vw] text-slate-400 font-normal leading-none mt-[0.1vw]">
                                    Upload & auto-convert
                                </span>
                            </div>
                        </div>
                        <div className="w-[1.55vw] h-[1.55vw] rounded-full bg-slate-100 group-hover:bg-[#ec5137] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-2xs ml-[0.4vw] group-hover:translate-x-[2px]">
                            <ArrowRight size="0.8vw" strokeWidth={2.4} />
                        </div>
                    </div>

                    {/* Card 2: Create From Scratch */}
                    <div
                        onClick={() => {
                            setSelectedTemplateIdForModal('corporate');
                            setCreateModalInitialView('template');
                            setIsCreateModalOpen(true);
                        }}
                        className="w-[16.4vw] h-[5.6vw] bg-white rounded-[0.8vw] border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-[#ec5137] hover:shadow-[0_10px_24px_rgba(236,81,55,0.12)] hover:-translate-y-[2px] px-[0.85vw] py-[0.55vw] flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[3vw] h-[3vw] bg-gradient-to-bl from-[#ec5137]/5 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                            <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-gradient-to-br from-[#fff1ee] to-[#ffe5e0] border border-[#fecaca] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 text-[#ec5137]">
                                <FilePlus2 size="1.25vw" className="text-[#ec5137]" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[0.84vw] font-bold text-slate-800 leading-tight group-hover:text-[#ec5137] transition-colors truncate">
                                    Start from Scratch
                                </h3>
                                <p className="text-[0.68vw] font-semibold text-slate-600 leading-snug mt-[0.08vw] truncate">
                                    Blank Canvas
                                </p>
                                <span className="inline-block text-[0.6vw] text-slate-400 font-normal leading-none mt-[0.1vw]">
                                    Design with rich elements
                                </span>
                            </div>
                        </div>
                        <div className="w-[1.55vw] h-[1.55vw] rounded-full bg-slate-100 group-hover:bg-[#ec5137] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-2xs ml-[0.4vw] group-hover:translate-x-[2px]">
                            <ArrowRight size="0.8vw" strokeWidth={2.4} />
                        </div>
                    </div>

                    {/* Card 3: Use a Template */}
                    <div
                        onClick={() => {
                            navigate('/templates');
                        }}
                        className="w-[16.4vw] h-[5.6vw] bg-white rounded-[0.8vw] border border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-[#ec5137] hover:shadow-[0_10px_24px_rgba(236,81,55,0.12)] hover:-translate-y-[2px] px-[0.85vw] py-[0.55vw] flex items-center justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[3vw] h-[3vw] bg-gradient-to-bl from-[#ec5137]/5 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-[0.75vw] min-w-0 flex-1">
                            <div className="w-[2.4vw] h-[2.4vw] rounded-[0.6vw] bg-gradient-to-br from-[#fff1ee] to-[#ffe5e0] border border-[#fecaca] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 text-[#ec5137]">
                                <LayoutTemplate size="1.25vw" className="text-[#ec5137]" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[0.84vw] font-bold text-slate-800 leading-tight group-hover:text-[#ec5137] transition-colors truncate">
                                    Use a Template
                                </h3>
                                <p className="text-[0.68vw] font-semibold text-slate-600 leading-snug mt-[0.08vw] truncate">
                                    50+ Pro Presets
                                </p>
                                <span className="inline-block text-[0.6vw] text-slate-400 font-normal leading-none mt-[0.1vw]">
                                    Magazines, Catalogs & more
                                </span>
                            </div>
                        </div>
                        <div className="w-[1.55vw] h-[1.55vw] rounded-full bg-slate-100 group-hover:bg-[#ec5137] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-2xs ml-[0.4vw] group-hover:translate-x-[2px]">
                            <ArrowRight size="0.8vw" strokeWidth={2.4} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: 3D Flipbook Illustration Graphic with Glow */}
            <div className="flex-shrink-0 relative pointer-events-none select-none flex items-center justify-end -my-[1.4vw] -mr-[0.4vw]">
                {/* Soft circular aura behind book */}
                <div className="absolute w-[16vw] h-[16vw] rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 blur-xl pointer-events-none" />
                <img
                    src={dashboardBannerImg}
                    alt="Bring your ideas to life"
                    className="h-[12.4vw] w-auto object-contain max-w-[28vw] relative z-10 filter drop-shadow-[0_12px_24px_rgba(234,84,58,0.12)] transition-transform duration-500 hover:scale-[1.02]"
                />
            </div>
        </div>
    );
}

