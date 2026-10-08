import React from 'react';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { Icon } from '@iconify/react';
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
        <div className="w-full bg-white rounded-[1vw] py-[0.95vw] px-[1.4vw] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex justify-between items-center relative overflow-hidden mb-[0.9vw] flex-shrink-0">
            {/* Left Side: Greeting & Quick Action Cards */}
            <div className="flex flex-col z-10">
                <h1 className="text-[1.45vw] font-bold text-[#1f2937] leading-tight flex items-center gap-[0.4vw]">
                    Welcome back,{' '}
                    {displayName ? (
                        <span className="text-[#ea543a]">{displayName}</span>
                    ) : (
                        <span className="inline-block w-[6.5vw] h-[1.4vw] bg-gray-200 animate-pulse rounded-[0.35vw] align-middle" />
                    )}
                </h1>
                <p className="text-[0.78vw] text-gray-400 font-normal mt-[0.15vw] mb-[0.8vw]">
                    Ready to create something amazing today?
                </p>

                {/* 3 Action Cards */}
                <div className="flex items-center gap-[0.9vw]">
                    {/* 1. Drag & Drop or Upload */}
                    <div
                        onClick={() => { setCreateModalInitialView('upload'); setIsCreateModalOpen(true); }}
                        onDragOver={handleUploadBoxDragOver}
                        onDrop={handleUploadBoxDrop}
                        className="w-[16.2vw] h-[5.4vw] bg-[#fafafa]/70 hover:bg-white rounded-[0.7vw] border-[1.5px] border-dashed border-gray-300 hover:border-[#ea543a] flex flex-col items-center justify-center p-[0.45vw] cursor-pointer transition-all shadow-sm group"
                    >
                        <p className="text-[0.8vw] font-semibold text-gray-500 mb-[0.2vw]">
                            Drag & Drop or <span className="text-[#ea543a]">Upload</span>
                        </p>
                        <div className="mb-[0.25vw] transition-transform group-hover:-translate-y-[0.1vw]">
                            <UploadCloud size="1.2vw" className="text-[#ea543a]" strokeWidth={2} />
                        </div>
                        <div className="flex items-center gap-[0.3vw] text-[0.58vw] text-gray-400 font-medium">
                            <span>Supported File format -</span>
                            <div className="flex items-center gap-[0.25vw]">
                                <Icon icon="vscode-icons:file-type-pdf2" className="w-[0.85vw] h-[0.85vw]" />
                                <Icon icon="vscode-icons:file-type-word" className="w-[0.85vw] h-[0.85vw]" />
                                <Icon icon="vscode-icons:file-type-powerpoint" className="w-[0.85vw] h-[0.85vw]" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Create From Scratch */}
                    <div
                        onClick={() => {
                            setSelectedTemplateIdForModal('corporate'); // default A4
                            setCreateModalInitialView('template');
                            setIsCreateModalOpen(true);
                        }}
                        className="w-[16.2vw] h-[5.4vw] bg-white rounded-[0.7vw] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md px-[0.9vw] py-[0.5vw] flex items-center justify-between cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-[0.75vw] min-w-0">
                            <div className="w-[2.2vw] h-[2.2vw] rounded-[0.55vw] bg-[#fff2ef] flex items-center justify-center text-[#ea543a] flex-shrink-0">
                                <Icon icon="lucide:file-text" className="w-[1.1vw] h-[1.1vw]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[0.88vw] font-bold text-gray-800 leading-tight">Create From Scratch</h3>
                                <p className="text-[0.66vw] text-gray-400 font-normal mt-[0.12vw]">Start with a blank canvas</p>
                            </div>
                        </div>
                        <div className="w-[1.45vw] h-[1.45vw] rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#ea543a] group-hover:text-white transition-all flex-shrink-0 shadow-sm ml-[0.6vw]">
                            <ArrowRight size="0.72vw" />
                        </div>
                    </div>

                    {/* 3. Use a Template */}
                    <div
                        onClick={() => {
                            navigate('/templates');
                        }}
                        className="w-[16.2vw] h-[5.4vw] bg-white rounded-[0.7vw] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md px-[0.9vw] py-[0.5vw] flex items-center justify-between cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-[0.75vw] min-w-0">
                            <div className="w-[2.2vw] h-[2.2vw] rounded-[0.55vw] bg-[#fff2ef] flex items-center justify-center text-[#ea543a] flex-shrink-0">
                                <Icon icon="lucide:layout-template" className="w-[1.1vw] h-[1.1vw]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[0.88vw] font-bold text-gray-800 leading-tight">Use a Template</h3>
                                <p className="text-[0.66vw] text-gray-400 font-normal mt-[0.12vw]">Choose from professional templates</p>
                            </div>
                        </div>
                        <div className="w-[1.45vw] h-[1.45vw] rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#ea543a] group-hover:text-white transition-all flex-shrink-0 shadow-sm ml-[0.6vw]">
                            <ArrowRight size="0.72vw" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: 3D Flipbook Illustration Graphic */}
            <div className="flex-shrink-0 relative pointer-events-none select-none flex items-center justify-end -my-[1.2vw] -mr-[0.6vw]">
                <img
                    src={dashboardBannerImg}
                    alt="Bring your ideas to life"
                    className="h-[12vw] w-auto object-contain max-w-[27vw]"
                />
            </div>
        </div>
    );
}
