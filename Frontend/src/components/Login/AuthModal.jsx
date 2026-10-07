import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthCard from './AuthCard';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const videoRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  useEffect(() => {
    if (isAuthModalOpen && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay notice:', err);
      });
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[0.1px] flex items-center justify-center p-[1vw] cursor-pointer select-none transition-all duration-300 animate-in fade-in"
      onClick={closeAuthModal}
    >
      {/* 70vw x 80vh Modal Window with Video & Auth Card */}
      <div
        className="relative w-[70vw] h-[80vh] rounded-[1.8vw] overflow-hidden shadow-[0_1.5vw_4vw_rgba(0,0,0,0.6)] flex items-center justify-end pr-[2.5vw] cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Video with Laptop on the Left */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          src="/Login/loginBG.webm"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/Login/loginBG.webm" type="video/webm" />
        </video>

        {/* Top-Left Logo inside Modal */}
        <div className="absolute top-[1.8vw] left-[1.8vw] z-10 pointer-events-none">
          <img
            src="/Login/logo.svg"
            alt="FlipiBook Logo"
            className="h-[2.2vw] w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Right-Side Auth Card without cancel button */}
        <div className="relative z-10 w-[27vw] h-[74vh] flex items-center justify-center p-[0.3vw]">
          <AuthCard />
        </div>
      </div>
    </div>
  );
}
