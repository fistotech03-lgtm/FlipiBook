import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

import { useToast } from '../CustomToast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, setSessionToken } from '../../utils/authUtils';

export default function Signup({ onSwitchToSignin }) {
  const { setUser, closeAuthModal, authRedirectPath } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const otpInputRefs = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const toast = useToast();

  // Timer countdown when OTP is sent
  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Google OAuth Signup
  let googleSignupFn;
  try {
    googleSignupFn = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        setIsLoading(true);
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
          const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });

          const res = await axios.post(
            `${backendUrl}/api/auth/google-login`,
            {
              isAccessToken: true,
              email: userInfo.data.email,
              name: userInfo.data.name,
              picture: userInfo.data.picture,
              sub: userInfo.data.sub,
              mode: 'signup'
            },
            { withCredentials: true }
          );

          if (res.data?.success) {
            if (res.data.token) {
              setSessionToken(res.data.token);
            }
            setUser(res.data.user || { name: userInfo.data.name, picture: userInfo.data.picture });
            toast.success('Registration successful with Google!');
            closeAuthModal?.();
            if (authRedirectPath) {
              navigate(authRedirectPath);
            }
          }
        } catch (err) {
          console.error('Google Auth Error:', err);
          const errorMsg = getErrorMessage(err, 'Google Registration failed. Please try again.');
          toast.error(errorMsg);

          // If account already exists, auto-switch to Sign in tab
          if (err.response?.data?.code === 'ACCOUNT_EXISTS' && onSwitchToSignin) {
            setTimeout(() => {
              onSwitchToSignin();
            }, 800);
          }
        } finally {
          setIsLoading(false);
        }
      },
      onError: () => toast.error('Google Registration Cancelled')
    });
  } catch {
    googleSignupFn = () => toast.error('Google OAuth is not configured yet');
  }

  const handleGoogleClick = () => {
    if (typeof googleSignupFn === 'function') {
      try {
        googleSignupFn();
      } catch {
        toast.error('Google Sign-in failed to initialize');
      }
    }
  };

  // Step 1: Send Signup OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error('Please enter a valid Email Address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please accept the Terms of Service & Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await axios.post(
        `${backendUrl}/api/auth/signup-otp`,
        {
          name: formData.name.trim(),
          emailId: cleanEmail,
          password: formData.password
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setIsOtpSent(true);
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        toast.success('Verification code sent to your email!');
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 100);
      } else {
        toast.error(res.data?.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Signup OTP error:', err);
      const errorMsg = getErrorMessage(err, 'Failed to send verification code');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Signup OTP & Finish Registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.join('');
    if (cleanOtp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const cleanEmail = formData.email.trim().toLowerCase();

      const res = await axios.post(
        `${backendUrl}/api/auth/verify-signup-otp`,
        {
          emailId: cleanEmail,
          otp: cleanOtp
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        if (res.data.token) {
          setSessionToken(res.data.token);
        }
        setUser(res.data.user || { emailId: cleanEmail });
        toast.success('Account created & verified successfully!');
        closeAuthModal?.();
        if (authRedirectPath) {
          navigate(authRedirectPath);
        }
      } else {
        toast.error(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verify Signup error:', err);
      const errorMsg = getErrorMessage(err, 'Verification failed. Please check the code.');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (isResending || timer > 0) return;
    setIsResending(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const cleanEmail = formData.email.trim().toLowerCase();

      const res = await axios.post(
        `${backendUrl}/api/auth/resend-signup-otp`,
        { emailId: cleanEmail },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        toast.success('A new verification code has been sent!');
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 100);
      } else {
        toast.error(res.data?.message || 'Failed to resend code');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      const errorMsg = getErrorMessage(err, 'Failed to resend code');
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="w-full h-full flex flex-col py-[1vw]">
      {/* 1. Header Section */}
      <div className="text-center">
        <h1 className="text-[1.8vw] font-semibold font-poppins tracking-tight text-gray-900 uppercase leading-tight">
          {isOtpSent ? 'Verify Email' : 'Create Your Account'}
        </h1>
        <p className="text-[0.82vw] text-gray-500 font-inter mt-[0.3vw]">
          {isOtpSent ? (
            <span>
              Code sent to <span className="font-semibold text-gray-800">{formData.email}</span>
            </span>
          ) : (
            'Join Flipibook and bring your documents to life'
          )}
        </p>
      </div>

      {/* 2. Unified Form */}
      {!isOtpSent ? (
        /* Step 1: Input Registration Details */
        <form onSubmit={handleSendOtp} className="flex-1 flex flex-col justify-center gap-[0.6vw] mt-[0.3vw]" noValidate>
          {/* Full Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <User className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type="text"
              name="name"
              autoComplete="name"
              disabled={isLoading}
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-[2.4vw] pr-[0.8vw] py-[0.6vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
          </div>

          {/* Email Address */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="codicon:mail" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type="email"
              name="email"
              autoComplete="email"
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full pl-[2.4vw] pr-[0.8vw] py-[0.6vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="ep:lock" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full pl-[2.4vw] pr-[2.4vw] py-[0.6vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-[0.8vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-[1.1vw] h-[1.1vw]" /> : <Eye className="w-[1.1vw] h-[1.1vw]" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="ep:lock" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              disabled={isLoading}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full pl-[2.4vw] pr-[2.4vw] py-[0.6vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-[0.8vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-[1.1vw] h-[1.1vw]" /> : <Eye className="w-[1.1vw] h-[1.1vw]" />}
            </button>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-[0.4vw] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-[0.1vw] h-[0.9vw] w-[0.9vw] rounded-[0.2vw] border-gray-300 text-[#EC5137] focus:ring-orange-200 cursor-pointer accent-[#EC5137]"
            />
            <span className="text-[0.72vw] font-inter text-gray-500 leading-tight">
              I agree to the{' '}
              <span className="text-[#EC5137] font-medium hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-[#EC5137] font-medium hover:underline">Privacy Policy</span>
            </span>
          </label>

          {/* Get Code Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password || !formData.confirmPassword}
              className="w-full py-[0.65vw] px-[0.8vw] bg-gradient-to-r from-[#FF725B] to-[#EC5137] hover:from-[#ff644c] hover:to-[#e14328] active:opacity-95 text-white font-poppins font-semibold text-[0.85vw] rounded-[0.65vw] shadow-[0_0.2vw_0.8vw_rgba(236,81,55,0.35)] transition-all flex items-center justify-center gap-[0.4vw] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-[0.9vw] h-[0.9vw] animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Get Verification Code</span>
                  <ArrowRight className="w-[0.9vw] h-[0.9vw]" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative text-center my-[0.3vw]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <span className="relative px-[0.6vw] bg-white text-[0.8vw] font-inter text-gray-400 font-medium">
              or sign up with
            </span>
          </div>

          {/* Google Signup Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-[0.6vw] px-[0.8vw] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[0.78vw] font-inter font-medium rounded-[0.65vw] transition-colors flex items-center justify-center gap-[0.5vw] shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign-up with Google</span>
            </button>
          </div>
        </form>
      ) : (
        /* Step 2: 6-Digit OTP Verification View */
        <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col justify-center gap-[1.2vw] mt-[0.5vw]" noValidate>
          <div className="flex flex-col gap-[0.6vw]">
            <div className="flex items-center justify-between px-[0.2vw]">
              <label className="text-[0.75vw] font-semibold font-inter text-gray-700">
                Enter 6-Digit OTP:
              </label>
              <div className="text-[0.75vw] font-inter text-gray-500">
                {timer > 0 ? (
                  <span className="font-semibold text-[#EC5137]">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="font-semibold text-[#EC5137] hover:text-[#d94428] underline cursor-pointer"
                  >
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* 6 OTP Inputs */}
            <div className="flex justify-between gap-[0.35vw]" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-[2.6vw] h-[2.6vw] text-center text-[1.1vw] font-medium text-gray-900 bg-white border border-gray-200 rounded-[0.6vw] focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all font-inter shadow-xs"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>

          {/* Action Button: Verify & Create Account */}
          <div>
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-[0.65vw] px-[0.8vw] bg-gradient-to-r from-[#FF725B] to-[#EC5137] hover:from-[#ff644c] hover:to-[#e14328] active:opacity-95 text-white font-poppins font-semibold text-[0.85vw] rounded-[0.65vw] shadow-[0_0.2vw_0.8vw_rgba(236,81,55,0.35)] transition-all flex items-center justify-center gap-[0.4vw] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-[0.9vw] h-[0.9vw] animate-spin" />
                  <span>Verifying & Creating...</span>
                </>
              ) : (
                <>
                  <span>Verify & Create Account</span>
                  <ArrowRight className="w-[0.9vw] h-[0.9vw]" />
                </>
              )}
            </button>
          </div>

          {/* Back to Edit Details */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className="inline-flex items-center gap-[0.3vw] text-[0.75vw] font-inter text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-[0.8vw] h-[0.8vw]" />
              <span>Edit Details / Change Email</span>
            </button>
          </div>
        </form>
      )}

      {/* 6. Footer Switcher */}
      <div className="text-center text-[0.8vw] font-inter text-gray-500">
        Already have an Account ?{' '}
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="font-semibold text-[#EC5137] hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
