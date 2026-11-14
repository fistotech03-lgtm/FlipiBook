import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw, ChevronRight, HelpCircle } from 'lucide-react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const defaultSuggestedPrompts = [
  'How do I convert a PDF to a 3D flipbook?',
  'How to add clickable links or video hotspots?',
  'Can I embed my flipbook on WordPress or Shopify?',
  'How does the 3D Studio and AR view work?',
  'How do I password-protect my publication?',
  'How do I upgrade or manage billing?',
];

// Knowledge base responses for FlipiBook
const getBotResponse = (query) => {
  const q = query.toLowerCase().trim();

  if (q.includes('convert') || q.includes('upload') || q.includes('format') || q.includes('pdf')) {
    return {
      text: "To create a flipbook, click 'Upload' or 'Create Flipbook' in the top navbar or Converter page. You can upload PDF, Word (DOCX), PowerPoint (PPTX), or high-res image sets (PNG, JPG, WebP). Once uploaded, our engine converts pages into interactive 3D pages in seconds!",
      actionLink: { label: 'Go to Converter', to: '/converter' }
    };
  }

  if (q.includes('link') || q.includes('hotspot') || q.includes('video') || q.includes('editor') || q.includes('media') || q.includes('audio')) {
    return {
      text: "Inside the Page Editor, open the 'Interaction' panel on the right sidebar. Place clickable hotspots anywhere on the page to trigger web links, page jumps, YouTube/Vimeo video embeds, audio narrations, popup templates, or 3D models.",
      actionLink: { label: 'Explore Page Editor', to: '/features/page-editor' }
    };
  }

  if (q.includes('3d') || q.includes('ar') || q.includes('augmented') || q.includes('model') || q.includes('glb')) {
    return {
      text: "FlipiBook features a full 3D Studio that simulates real paper curvature, thickness, and lighting physics. You can also import .glb/.gltf 3D models onto pages, allowing mobile viewers to launch an Augmented Reality (AR) view in their real environment!",
      actionLink: { label: 'View 3D Features', to: '/features/3d-studio-editor' }
    };
  }

  if (q.includes('embed') || q.includes('share') || q.includes('wordpress') || q.includes('shopify') || q.includes('website') || q.includes('iframe')) {
    return {
      text: "To embed a flipbook, open the book and click 'Share' > 'Embed'. Copy the responsive <iframe> snippet and paste it directly into WordPress, Shopify, Squarespace, Wix, or custom HTML pages.",
      actionLink: { label: 'Share Features', to: '/features/interactive-layout' }
    };
  }

  if (q.includes('password') || q.includes('protect') || q.includes('privacy') || q.includes('download') || q.includes('domain')) {
    return {
      text: "You have complete control over publication privacy. Enable password protection in book settings, restrict PDF downloads, hide print/share buttons, or bind your custom branded domain under Account Settings.",
      actionLink: { label: 'Account Settings', to: '/settings/account' }
    };
  }

  if (q.includes('shelf') || q.includes('bookshelf') || q.includes('collection')) {
    return {
      text: "Use the 'My Shelf' feature to organize and showcase multiple flipbooks together on a gorgeous 3D wooden or modern bookshelf. You can share the entire shelf via a single public link!",
      actionLink: { label: 'Open My Shelf', to: '/features/my-shelf' }
    };
  }

  if (q.includes('price') || q.includes('pricing') || q.includes('plan') || q.includes('cost') || q.includes('free') || q.includes('billing')) {
    return {
      text: "FlipiBook offers a 100% Free plan (up to 5 flipbooks with core 3D features). For unlimited flipbooks, custom branding, domain binding, and 3D AR uploads, check out our Standard and Pro tiers.",
      actionLink: { label: 'View Pricing Plans', to: '/pricing' }
    };
  }

  if (q.includes('ticket') || q.includes('support') || q.includes('help') || q.includes('contact') || q.includes('email')) {
    return {
      text: "Need direct help from our team? You can submit a support ticket in your dashboard, email us at info@flipibook-o.com, or browse step-by-step documentation in the User Guide.",
      actionLink: { label: 'Open Support Ticket', to: '/settings/tickets' }
    };
  }

  return {
    text: "Thanks for reaching out! I can help you with PDF conversion, interactive hotspots, 3D & AR models, embedding on websites, privacy settings, and subscription plans. Try selecting one of the suggested topics below, or submit a support ticket if you need engineering help.",
    actionLink: { label: 'View Knowledge Base', to: '/guide' }
  };
};

export default function ChatBotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your FlipiBook AI Assistant. How can I help you create or publish your flipbook today?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, isTyping]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and reply
    setTimeout(() => {
      const response = getBotResponse(text);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        actionLink: response.actionLink,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Chat history cleared. How else can I assist you with FlipiBook today?',
        time: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Backdrop overlay matching NotificationDrawer */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed top-14 sm:top-16 md:top-[7vh] bottom-0 left-0 right-0 bg-black/20 backdrop-blur-[1px] z-[80] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Drawer from Right matching NotificationDrawer UI */}
      <aside
        role="dialog"
        aria-label="FlipiBook AI Assistant"
        aria-modal="true"
        className={`fixed top-14 sm:top-16 md:top-[7vh] right-0 bottom-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[93vh] w-[90vw] sm:w-[28vw] min-w-[340px] max-w-[460px] bg-white border-l border-gray-200/80 shadow-[-1vw_0_2.5vw_rgba(0,0,0,0.12)] z-[90] flex flex-col font-poppins transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EC5137] shadow-2xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-tight">
                    FlipiBook AI Assistant
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-md bg-orange-50 text-[10px] font-semibold text-[#EC5137] border border-orange-100">
                    AI
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-normal mt-0.5">
                  Instant answers to your questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close assistant"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar bg-[#FBFBFC]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#EC5137] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isBot
                      ? 'bg-white text-gray-700 border border-gray-200/80 rounded-tl-xs'
                      : 'bg-[#EC5137] text-white rounded-tr-xs font-normal'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Optional Action Link inside bot message */}
                  {msg.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100">
                      <Link
                        to={msg.actionLink.to}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#EC5137] hover:underline"
                      >
                        <span>{msg.actionLink.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isBot ? 'text-gray-400' : 'text-orange-200'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#EC5137] flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC5137] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC5137] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC5137] animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Pills */}
        <div className="px-4 py-2 bg-white border-t border-gray-100 shrink-0">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#EC5137]" />
            <span>Suggested Questions</span>
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {defaultSuggestedPrompts.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-gray-50 hover:bg-orange-50 border border-gray-200/80 hover:border-orange-200 text-[11px] text-gray-600 hover:text-[#EC5137] font-medium transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-gray-200/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#FBFBFC] rounded-xl border border-gray-200 px-3 py-1.5 focus-within:border-[#EC5137] focus-within:ring-2 focus-within:ring-[#EC5137]/15 transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about FlipiBook..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-hidden py-1"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 rounded-lg bg-[#EC5137] disabled:bg-gray-200 text-white disabled:text-gray-400 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            AI Assistant powered by FlipiBook Knowledge Base
          </p>
        </div>
      </aside>
    </>
  );
}
