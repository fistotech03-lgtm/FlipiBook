import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Signin, Signup, ForgotPassword } from '../components/Login';
import { verifyToken } from '../utils/authUtils';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '431373651052-bf7vob5dn4id8mbuip47creumrvqgjsd.apps.googleusercontent.com';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const getTargetMode = () => {
    if (location.pathname === '/signup' || searchParams.get('mode') === 'signup') {
      return 'signup';
    }
    if (location.pathname === '/forgot-password' || searchParams.get('mode') === 'forgot-password') {
      return 'forgot-password';
    }
    return 'signin';
  };

  const initialMode = getTargetMode();
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontMode, setFrontMode] = useState(initialMode);
  const [backMode, setBackMode] = useState(initialMode === 'signup' ? 'signin' : 'signup');
  const [forgotEmail, setForgotEmail] = useState('');

  // Synchronize with external URL changes (e.g. back/forward navigation)
  useEffect(() => {
    const targetMode = getTargetMode();
    const currentActiveMode = isFlipped ? backMode : frontMode;

    if (targetMode !== currentActiveMode) {
      if (!isFlipped) {
        setBackMode(targetMode);
        setIsFlipped(true);
      } else {
        setFrontMode(targetMode);
        setIsFlipped(false);
      }
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (verifyToken()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay interaction notice:", err);
      });
    }
  }, []);

  const switchMode = (newMode, email = '') => {
    if (email) setForgotEmail(email);
    const currentActiveMode = isFlipped ? backMode : frontMode;
    if (newMode === currentActiveMode) return;

    if (!isFlipped) {
      setBackMode(newMode);
      setIsFlipped(true);
    } else {
      setFrontMode(newMode);
      setIsFlipped(false);
    }
    setSearchParams({ mode: newMode });
  };

  const renderContent = (currentMode) => {
    switch (currentMode) {
      case 'signup':
        return <Signup onSwitchToSignin={() => switchMode('signin')} />;
      case 'forgot-password':
        return (
          <ForgotPassword
            initialEmail={forgotEmail}
            onSwitchToSignin={() => switchMode('signin')}
          />
        );
      case 'signin':
      default:
        return (
          <Signin
            onSwitchToSignup={() => switchMode('signup')}
            onSwitchToForgotPassword={(email) => switchMode('forgot-password', email)}
          />
        );
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="relative h-screen w-screen overflow-hidden bg-black flex items-center justify-end pr-[5vw]">
        {/* Background Video */}
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

        {/* Top-Left Logo */}
        <div className="absolute top-[2vw] left-[2vw] z-10">
          <img
            src="/Login/logo.svg"
            alt="FlipiBook Logo"
            className="h-[2.5vw] w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Right Side Form Card with 3D Flip */}
        <main className="relative z-10 flex items-center justify-center perspective-container">
          <div
            className={`flip-card-inner w-[30vw] min-w-[30vw] h-[80vh] min-h-[80vh] ${
              isFlipped ? 'is-flipped' : ''
            }`}
          >
            {/* Front Side */}
            <div
              className={`flip-card-face flip-card-front bg-white rounded-[1vw] px-[3vw] py-[2.5vw] shadow-[0_1.5vw_3vw_rgba(0,0,0,0.25)] border border-white/60 flex flex-col justify-between ${
                isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
            >
              {renderContent(frontMode)}
            </div>

            {/* Back Side */}
            <div
              className={`flip-card-face flip-card-back bg-white rounded-[1vw] px-[3vw] py-[2.5vw] shadow-[0_1.5vw_3vw_rgba(0,0,0,0.25)] border border-white/60 flex flex-col justify-between ${
                !isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
            >
              {renderContent(backMode)}
            </div>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

