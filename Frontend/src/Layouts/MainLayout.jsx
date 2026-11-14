import React, { useRef, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNav from '../components/NavBar/HomeNav';
import { ChatBotButton, ChatBotDrawer } from '../components/ChatBot';

export default function MainLayout({ children }) {
  const location = useLocation();
  const mainRef = useRef(null);
  const isDashboard = location.pathname.startsWith('/my-flipbooks') || location.pathname.startsWith('/guide');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Feature flag: set to true whenever you are ready to enable the chatbot
  const ENABLE_CHATBOT = false;

  // Chat bot is strictly restricted to these top nav pages:
  // Home, Explore, Features, Converter, Pricing, Forum, Help
  const pathname = location.pathname;
  const isChatBotAllowedPage =
    ENABLE_CHATBOT &&
    (pathname === '/' ||
      pathname === '/home' ||
      pathname.startsWith('/explore') ||
      pathname.startsWith('/features') ||
      pathname.startsWith('/converter') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/forum') ||
      pathname.startsWith('/help'));

  // Automatically close chat drawer if navigating to a page where chatbot is not allowed
  useEffect(() => {
    if (!isChatBotAllowedPage && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [location.pathname, isChatBotAllowedPage, isChatOpen]);

  // Scroll to top of both window and the scrollable main container on route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="w-screen h-screen max-w-full max-h-screen overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      <header className="w-full flex-none bg-white z-[100] h-14 sm:h-16 md:h-[7vh] min-h-[52px]">
        <HomeNav />
      </header>
      {/* Scrollable container for page views */}
      <main
        ref={mainRef}
        className={`flex-1 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}
      >
        {children || <Outlet />}
      </main>

      {/* Floating Chat Bot FAB & Drawer - strictly restricted to Home, Explore, Features, Converter, Pricing, Forum, Help */}
      {isChatBotAllowedPage && (
        <>
          <ChatBotButton isOpen={isChatOpen} onClick={() => setIsChatOpen((prev) => !prev)} />
          <ChatBotDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
      )}
    </div>
  );
}
