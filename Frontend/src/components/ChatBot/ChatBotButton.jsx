import React, { useState } from 'react';
import { Bot, MessageSquare, X, Sparkles } from 'lucide-react';

export default function ChatBotButton({ isOpen, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-6 right-6 z-[70] font-poppins flex items-center gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Prompt Pill - expands on hover or pulses subtly */}
      {!isOpen && (
        <div
          onClick={onClick}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-gray-800 text-xs font-semibold shadow-lg border border-gray-200/80 cursor-pointer transition-all duration-300 transform ${
            isHovered
              ? 'opacity-100 translate-x-0'
              : 'opacity-90 -translate-x-1 hover:opacity-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EC5137]" />
          <span>Ask AI Assistant</span>
        </div>
      )}

      {/* Floating Circle Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat assistant'}
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-gray-900 text-white hover:bg-gray-800 rotate-90'
            : 'bg-gradient-to-tr from-[#EC5137] to-[#FF7A59] text-white hover:scale-105'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <>
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            {/* Live Green Online Dot */}
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
