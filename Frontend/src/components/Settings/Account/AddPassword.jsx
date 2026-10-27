import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';

const AddPassword = ({ userEmail, onBack, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = enter OTP and set password
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Send OTP
  const handleSendOtp = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/send-add-password-otp`, {
        emailId: userEmail,
      });
      if (res.data?.success) {
        setStep(2);
        setOtpTimer(60);
      } else {
        setErrorMessage(res.data?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Password with OTP
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpValue.trim()) {
      setErrorMessage('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/set-password-otp`, {
        emailId: userEmail,
        otp: otpValue.trim(),
        password: newPassword,
      });

      if (res.data?.success) {
        onSuccess?.();
      } else {
        setErrorMessage(res.data?.message || 'Failed to set password.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Verification failed. Please check the OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-12vw)] flex flex-col p-[1.5vw] font-sans">
      {/* Top Navigation: Back to Account Page */}
      <div className="mb-[1vw] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[0.7vw]">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-[0.4vw] text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-[0.8vw] py-[0.45vw] rounded-[0.5vw] shadow-xs text-[0.78vw] font-medium transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <Icon
              icon="lucide:arrow-left"
              className="w-[0.9vw] h-[0.9vw] text-gray-500 group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Account</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-[0.76vw] text-gray-500 font-medium">
            Sign-in & Security &gt; Add Password
          </span>
        </div>
      </div>

      {/* Main Container Card - Centered both horizontally and vertically (middle) */}
      <div className="w-full flex-1 flex items-center justify-center py-[2vw]">
        <div className="w-full max-w-[40vw] bg-white border border-gray-200 rounded-[1vw] p-[2.2vw] shadow-sm">
          {/* Header */}
          <div className="pb-[1.4vw] border-b border-gray-100">
            <h1 className="text-[1.25vw] font-semibold text-gray-900 leading-tight">
              Add Account Password
            </h1>
            <p className="text-[0.76vw] text-gray-500 mt-[0.25vw] font-normal leading-relaxed">
              You registered using Google. Set up a secure password to enable direct email & password sign-in alongside Google.
            </p>
          </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-[1.2vw] p-[0.8vw] bg-[#FEF2F2] border border-[#FCA5A5] rounded-[0.6vw] flex items-center gap-[0.6vw] text-[#DC2626] text-[0.76vw]">
            <Icon icon="solar:danger-circle-bold" className="w-[1vw] h-[1vw] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Verify Google Email & Send OTP */}
        {step === 1 && (
          <div className="mt-[1.5vw] flex flex-col gap-[1.3vw]">
            <div className="bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.75vw] p-[1.1vw] flex flex-col gap-[0.5vw]">
              <span className="text-[0.7vw] text-gray-400 font-semibold uppercase tracking-wider">
                Target Email Address
              </span>
              <div className="flex items-center gap-[0.6vw]">
                <Icon icon="solar:letter-bold" className="w-[1.1vw] h-[1.1vw] text-gray-500" />
                <span className="text-[0.88vw] font-medium text-gray-800">
                  {userEmail}
                </span>
                <span className="ml-auto inline-flex items-center gap-[0.25vw] bg-[#DCFCE7] text-[#16A34A] text-[0.66vw] font-medium px-[0.55vw] py-[0.15vw] rounded-full">
                  Verified Google Account
                </span>
              </div>
            </div>

            <p className="text-[0.76vw] text-gray-600 leading-relaxed">
              We will send a 6-digit One-Time Password (OTP) to your email to verify account ownership before you set your new password.
            </p>

            <div className="flex items-center gap-[0.8vw] pt-[0.5vw]">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className="flex items-center gap-[0.5vw] bg-[#4c5add] hover:bg-[#3f4bb8] disabled:bg-[#9fa6eb] text-white text-[0.82vw] font-medium px-[1.4vw] py-[0.6vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-[0.9vw] h-[0.9vw] animate-spin" />
                    <span>Sending OTP to Email...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:send" className="w-[0.9vw] h-[0.9vw]" />
                    <span>Send Verification OTP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="px-[1.2vw] py-[0.6vw] rounded-[0.5vw] border border-gray-300 text-gray-700 hover:bg-gray-50 text-[0.82vw] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter OTP & Set New Password */}
        {step === 2 && (
          <form onSubmit={handleSetPassword} className="mt-[1.5vw] flex flex-col gap-[1.2vw]">
            {/* OTP Status Banner */}
            <div className="p-[0.85vw] bg-emerald-50 border border-emerald-200 rounded-[0.6vw] flex items-center justify-between text-[#15803D] text-[0.76vw]">
              <div className="flex items-center gap-[0.5vw]">
                <Icon icon="solar:check-circle-bold" className="w-[1vw] h-[1vw]" />
                <span>
                  6-digit OTP sent to <strong>{userEmail}</strong>
                </span>
              </div>
              {otpTimer > 0 ? (
                <span className="text-[0.72vw] text-emerald-700 font-medium">
                  Resend in {otpTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-[0.72vw] underline font-semibold cursor-pointer hover:text-emerald-900"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* OTP Input */}
            <div className="flex flex-col gap-[0.35vw]">
              <label className="text-[0.78vw] font-medium text-gray-700">
                Enter 6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="• • • • • •"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-[1vw] py-[0.6vw] tracking-[0.4em] text-center text-[1.1vw] font-bold rounded-[0.5vw] border border-gray-300 focus:outline-hidden focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] bg-[#fafafa]"
                  autoFocus
                />
              </div>
              <span className="text-[0.68vw] text-gray-400">
                Check your inbox or spam folder for the verification code.
              </span>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-[0.35vw]">
              <label className="text-[0.78vw] font-medium text-gray-700">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-[0.9vw] py-[0.55vw] pr-[2.4vw] text-[0.8vw] rounded-[0.5vw] border border-gray-300 focus:outline-hidden focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <Icon icon={showNewPassword ? 'lucide:eye-off' : 'lucide:eye'} className="w-[1vw] h-[1vw]" />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-[0.35vw]">
              <label className="text-[0.78vw] font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-[0.9vw] py-[0.55vw] pr-[2.4vw] text-[0.8vw] rounded-[0.5vw] border border-gray-300 focus:outline-hidden focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-[0.7vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <Icon icon={showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'} className="w-[1vw] h-[1vw]" />
                </button>
              </div>
            </div>

            {/* Submit / Back Action Buttons */}
            <div className="flex items-center gap-[0.8vw] pt-[0.6vw]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-[0.45vw] bg-[#4c5add] hover:bg-[#3f4bb8] disabled:bg-[#9fa6eb] text-white text-[0.82vw] font-medium px-[1.5vw] py-[0.6vw] rounded-[0.5vw] shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-[0.9vw] h-[0.9vw] animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw]" />
                    <span>Set Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-[1.2vw] py-[0.6vw] rounded-[0.5vw] border border-gray-300 text-gray-700 hover:bg-gray-50 text-[0.82vw] font-medium transition-colors cursor-pointer"
              >
                Change Email / Resend
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
  );
};

export default AddPassword;
