import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Signin from './Signin';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';

import { useAuth } from '../../store/hooks';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '431373651052-bf7vob5dn4id8mbuip47creumrvqgjsd.apps.googleusercontent.com';

export default function AuthCard({ initialMode }) {
  const { authModalMode } = useAuth();
  const activeMode = initialMode || authModalMode || 'signin';

  const [isFlipped, setIsFlipped] = useState(false);
  const [frontMode, setFrontMode] = useState(activeMode);
  const [backMode, setBackMode] = useState(activeMode === 'signup' ? 'signin' : 'signup');
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    const target = initialMode || authModalMode || 'signin';
    setIsFlipped(false);
    setFrontMode(target);
    setBackMode(target === 'signup' ? 'signin' : 'signup');
    setForgotEmail('');
  }, [initialMode, authModalMode]);

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
      <div className="relative flex items-center justify-center perspective-container w-full h-full">
        <div
          className={`flip-card-inner w-full h-full ${
            isFlipped ? 'is-flipped' : ''
          }`}
        >
          {/* Front Side */}
          <div
            className={`flip-card-face flip-card-front relative bg-white rounded-[1.2vw] px-[2.2vw] py-[1.8vw] shadow-[0_0.8vw_2.5vw_rgba(0,0,0,0.2)] border border-white/70 flex flex-col justify-between ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            {renderContent(frontMode)}
          </div>

          {/* Back Side */}
          <div
            className={`flip-card-face flip-card-back relative bg-white rounded-[1.2vw] px-[2.2vw] py-[1.8vw] shadow-[0_0.8vw_2.5vw_rgba(0,0,0,0.2)] border border-white/70 flex flex-col justify-between ${
              !isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            {renderContent(backMode)}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
