import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useToast } from '../CustomToast';
import { getErrorMessage } from '../../utils/authUtils';

export default function ForgotPassword({ initialEmail = '', onSwitchToSignin }) {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const toast = useToast();
  const otpInputRefs = useRef([]);

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

  // Step 1: Validate email + new passwords and Send OTP
  const handleGetOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error('Please enter a valid Gmail / Email Address');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, { emailId: cleanEmail });
      if (res.data?.success) {
        toast.success('OTP sent to your email!');
        setIsOtpSent(true);
        setTimer(60);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        toast.error(res.data?.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMsg = getErrorMessage(err, 'Failed to send OTP');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    const digit = sanitized.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
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
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        emailId: email.trim().toLowerCase()
      });
      if (res.data?.success) {
        toast.success('New OTP sent to your email');
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        toast.error(res.data?.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      const errorMsg = getErrorMessage(err, 'Failed to resend OTP');
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Submit OTP and Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        emailId: email.trim().toLowerCase(),
        otp: otpCode,
        newPassword
      });

      if (res.data?.success) {
        toast.success('Password updated successfully! Please sign in.');
        onSwitchToSignin();
      } else {
        toast.error(res.data?.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = getErrorMessage(err, 'Failed to update password');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center gap-[1.3vw] py-[1vw]">
      {/* 1. Header Section */}
      <div className="text-center">
        <h1 className="text-[1.8vw] font-semibold font-poppins tracking-tight text-gray-900 uppercase leading-tight">
          Reset Password
        </h1>
        <p className="text-[0.82vw] text-gray-500 font-inter mt-[0.35vw] px-[0.4vw]">
          {isOtpSent
            ? 'Enter the 6-digit code sent to your email to update'
            : 'Enter your Gmail & new password to receive verification OTP'}
        </p>
      </div>

      {/* 2. Unified Form */}
      <form
        onSubmit={isOtpSent ? handleUpdatePassword : handleGetOtp}
        className="flex flex-col gap-[0.9vw]"
        noValidate
      >
        <div className="space-y-[0.75vw]">
          {/* Gmail / Email Address */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="codicon:mail" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type="email"
              name="email"
              disabled={isLoading || isOtpSent}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Gmail / Email ID"
              required
              className="w-full pl-[2.4vw] pr-[0.8vw] py-[0.65vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
          </div>

          {/* New Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="ep:lock" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type={showNewPass ? 'text' : 'password'}
              name="newPassword"
              disabled={isLoading || isOtpSent}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 characters)"
              required
              className="w-full pl-[2.4vw] pr-[2.4vw] py-[0.65vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute inset-y-0 right-0 pr-[0.8vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showNewPass ? <EyeOff className="w-[1.1vw] h-[1.1vw]" /> : <Eye className="w-[1.1vw] h-[1.1vw]" />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="ep:lock" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type={showConfirmPass ? 'text' : 'password'}
              name="confirmPassword"
              disabled={isLoading || isOtpSent}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              className="w-full pl-[2.4vw] pr-[2.4vw] py-[0.65vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute inset-y-0 right-0 pr-[0.8vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showConfirmPass ? <EyeOff className="w-[1.1vw] h-[1.1vw]" /> : <Eye className="w-[1.1vw] h-[1.1vw]" />}
            </button>
          </div>

          {/* 3. OTP Section */}
          {isOtpSent && (
            <div className="space-y-[0.4vw] pt-[0.4vw] animate-in fade-in duration-200">
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
                    className="w-[2.6vw] h-[2.6vw] text-center text-[1vw] font-medium text-gray-900 bg-white border border-gray-200 rounded-[0.6vw] focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all font-inter shadow-xs"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button: "Get OTP" or "Update Password" */}
        <div className="mt-[0.2vw]">
          {!isOtpSent ? (
            <button
              type="submit"
              disabled={isLoading || !email || !newPassword || !confirmPassword}
              className="w-full py-[0.65vw] px-[0.8vw] bg-gradient-to-r from-[#FF725B] to-[#EC5137] hover:from-[#ff644c] hover:to-[#e14328] active:opacity-95 text-white font-poppins font-semibold text-[0.85vw] rounded-[0.65vw] shadow-[0_0.2vw_0.8vw_rgba(236,81,55,0.35)] transition-all flex items-center justify-center gap-[0.4vw] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-[0.9vw] h-[0.9vw] animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight className="w-[0.9vw] h-[0.9vw]" />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-[0.65vw] px-[0.8vw] bg-gradient-to-r from-[#FF725B] to-[#EC5137] hover:from-[#ff644c] hover:to-[#e14328] active:opacity-95 text-white font-poppins font-semibold text-[0.85vw] rounded-[0.65vw] shadow-[0_0.2vw_0.8vw_rgba(236,81,55,0.35)] transition-all flex items-center justify-center gap-[0.4vw] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-[0.9vw] h-[0.9vw] animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-[0.9vw] h-[0.9vw]" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Footer Switcher */}
      <div className="text-center text-[0.8vw] font-inter text-gray-500">
        Remember your password ?{' '}
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
