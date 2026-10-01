import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

import { useToast } from '../CustomToast';

export default function Signup({ onSwitchToSignin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
              sub: userInfo.data.sub
            },
            { withCredentials: true }
          );

          if (res.data?.success) {
            toast.success('Registration successful with Google!');
            navigate('/home');
          }
        } catch (err) {
          console.error('Google Auth Error:', err);
          toast.error('Google Registration failed');
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

  const handleSubmit = async (e) => {
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
        `${backendUrl}/api/auth/signup`,
        {
          name: formData.name.trim(),
          emailId: cleanEmail,
          password: formData.password
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success('Account created successfully!');
        navigate('/home');
      } else {
        toast.success('Account created! Please sign in.');
        if (onSwitchToSignin) {
          onSwitchToSignin();
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Signup error:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between py-[0.5vw]">
      {/* 1. Header Section */}
      <div className="text-center">
        <h1 className="text-[2vw] font-semibold font-poppins tracking-tight text-gray-900 leading-tight">
          Create Your Account
        </h1>
        <p className="text-[0.82vw] text-gray-500 font-inter mt-[0.35vw]">
          Join Flipibook and bring your documents to life
        </p>
      </div>

      {/* 2. Inputs Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-around py-[0.8vw]" noValidate>
        {/* Full Name */}
        <div className="relative my-[0.2vw]">
          <div className="absolute inset-y-0 left-0 pl-[1vw] flex items-center pointer-events-none text-gray-400">
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
            className="w-full pl-[2.8vw] pr-[1vw] py-[0.7vw] bg-white border border-gray-200 rounded-[0.75vw] text-[0.85vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-200 transition-all disabled:opacity-60 shadow-xs"
          />
        </div>

        {/* Email Address */}
        <div className="relative my-[0.2vw]">
          <div className="absolute inset-y-0 left-0 pl-[1vw] flex items-center pointer-events-none text-gray-400">
            <Icon icon="codicon:mail" className="w-[1.2vw] h-[1.2vw]" />
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
            className="w-full pl-[2.8vw] pr-[1vw] py-[0.7vw] bg-white border border-gray-200 rounded-[0.75vw] text-[0.85vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-200 transition-all disabled:opacity-60 shadow-xs"
          />
        </div>

        {/* Password */}
        <div className="relative my-[0.2vw]">
          <div className="absolute inset-y-0 left-0 pl-[1vw] flex items-center pointer-events-none text-gray-400">
            <Icon icon="ep:lock" className="w-[1.2vw] h-[1.2vw]" />
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
            className="w-full pl-[2.8vw] pr-[2.8vw] py-[0.7vw] bg-white border border-gray-200 rounded-[0.75vw] text-[0.85vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-200 transition-all disabled:opacity-60 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-[1vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-[1.1vw] h-[1.1vw]" /> : <Eye className="w-[1.1vw] h-[1.1vw]" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative my-[0.2vw]">
          <div className="absolute inset-y-0 left-0 pl-[1vw] flex items-center pointer-events-none text-gray-400">
            <Icon icon="ep:lock" className="w-[1.2vw] h-[1.2vw]" />
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
            className="w-full pl-[2.8vw] pr-[2.8vw] py-[0.7vw] bg-white border border-gray-200 rounded-[0.75vw] text-[0.85vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-200 transition-all disabled:opacity-60 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-[1vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-[1.1vw] h-[1.1vw]" /> : <Eye className="w-[1.1vw] h-[1.1vw]" />}
          </button>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-[0.6vw] cursor-pointer select-none mt-[1vw] mb-[0.2vw] ml-[0.2vw]">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-[0.15vw] h-[0.9vw] w-[0.9vw] rounded-[0.2vw] border-gray-300 text-[#f05537] focus:ring-orange-200 cursor-pointer accent-[#f05537]"
          />
          <span className="text-[0.75vw] font-inter text-gray-500 leading-tight">
            I agree to the{' '}
            <span className="text-[#f05537] font-medium hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#f05537] font-medium hover:underline">Privacy Policy</span>
          </span>
        </label>

        {/* 3. Create Account Button */}
        <div className="my-[0.2vw]">
          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password || !formData.confirmPassword}
            className="w-full py-[0.85vw] px-[1vw] bg-gradient-to-r from-[#FF725B] to-[#EC5137] hover:from-[#ff644c] hover:to-[#e14328] active:opacity-95 text-white font-poppins font-semibold text-[0.9vw] rounded-[0.75vw] shadow-[0_0.3vw_0.8vw_rgba(236,81,55,0.28)] transition-all flex items-center justify-center gap-[0.4vw] disabled:opacity-85 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-[1.1vw] h-[1.1vw] animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-[1vw] h-[1vw]" />
              </>
            )}
          </button>
        </div>

        {/* 4. Divider */}
        <div className="relative text-center my-[0.15vw]">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <span className="relative px-[0.8vw] bg-white text-[0.8vw] font-inter text-gray-500 font-medium">
            or sign up with
          </span>
        </div>

        {/* 5. Google Signup Button */}
        <div className="my-[0.2vw]">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full py-[0.75vw] px-[1vw] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[0.82vw] font-inter font-medium rounded-[0.75vw] transition-colors flex items-center justify-center gap-[0.6vw] shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-[1.2vw] h-[1.2vw]" viewBox="0 0 24 24">
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

      {/* 6. Footer Switcher */}
      <div className="text-center text-[0.82vw] font-inter text-gray-500 pt-[0.4vw]">
        Already have an Account ?{' '}
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="font-semibold text-[#f05537] hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
