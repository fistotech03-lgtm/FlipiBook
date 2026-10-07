import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

import { useToast } from "../CustomToast";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/authUtils";

export default function Signin({ onSwitchToSignup, onSwitchToForgotPassword }) {
  const { setUser, closeAuthModal, authRedirectPath } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword(formData.emailId);
    }
  };

  let googleLoginFn;
  try {
    googleLoginFn = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        setIsLoading(true);
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
          const userInfo = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            },
          );

          const res = await axios.post(
            `${backendUrl}/api/auth/google-login`,
            {
              isAccessToken: true,
              email: userInfo.data.email,
              name: userInfo.data.name,
              picture: userInfo.data.picture,
              sub: userInfo.data.sub,
              mode: 'signin',
            },
            { withCredentials: true },
          );

          if (res.data?.success) {
            setUser(res.data.user || { name: userInfo.data.name, picture: userInfo.data.picture });
            toast.success("Login successful with Google!");
            closeAuthModal?.();
            if (authRedirectPath) {
              navigate(authRedirectPath);
            }
          }
        } catch (err) {
          console.error("Google Auth Error:", err);
          const errorMsg = getErrorMessage(err, "Google Authentication failed. Please try again.");
          toast.error(errorMsg);

          // If account doesn't exist, auto-switch to Sign up tab
          if (err.response?.data?.code === 'USER_NOT_FOUND' && onSwitchToSignup) {
            setTimeout(() => {
              onSwitchToSignup();
            }, 800);
          }
        } finally {
          setIsLoading(false);
        }
      },
      onError: () => toast.error("Google Login Cancelled"),
    });
  } catch {
    googleLoginFn = () => toast.error("Google OAuth is not configured yet");
  }

  const handleGoogleClick = () => {
    if (typeof googleLoginFn === "function") {
      try {
        googleLoginFn();
      } catch {
        toast.error("Google Sign-in failed to initialize");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.emailId.trim().toLowerCase();
    const password = formData.password;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid Email Address");
      return;
    }
    if (!password) {
      toast.error("Please enter your Password");
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const res = await axios.post(
        `${backendUrl}/api/auth/login`,
        {
          emailId: email,
          password: password,
        },
        { withCredentials: true },
      );

      if (res.data?.success) {
        setUser(res.data.user || { emailId: email });
        toast.success("Login successful!");
        closeAuthModal?.();
        if (authRedirectPath) {
          navigate(authRedirectPath);
        }
      } else {
        throw new Error(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = getErrorMessage(err, "Invalid email or password");
      toast.error(errorMsg);

      // If account doesn't exist, auto-switch to Sign up tab
      if (err.response?.data?.code === 'USER_NOT_FOUND' && onSwitchToSignup) {
        setTimeout(() => {
          onSwitchToSignup();
        }, 800);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col  py-[2vw]">
      {/* 1. Header Section */}
      <div className="text-center">
        <h1 className="text-[1.8vw] font-semibold font-poppins tracking-tight text-gray-900 uppercase leading-tight">
          WELCOME BACK
        </h1>
        <p className="text-[0.82vw] text-gray-500 font-inter mt-[0.3vw]">
          Sign in to continue to Flipbook
        </p>
      </div>

      {/* 2. Inputs Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col justify-center gap-[1vw] mt-[0.4vw]"
        noValidate
      >
        {/* Email Address */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
            <Icon icon="codicon:mail" className="w-[1.1vw] h-[1.1vw]" />
          </div>
          <input
            type="email"
            name="emailId"
            autoComplete="email"
            disabled={isLoading}
            value={formData.emailId}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full pl-[2.4vw] pr-[0.8vw] py-[0.65vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-[0.8vw] flex items-center pointer-events-none text-gray-400">
              <Icon icon="ep:lock" className="w-[1.1vw] h-[1.1vw]" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full pl-[2.4vw] pr-[2.4vw] py-[0.65vw] bg-white border border-gray-200 rounded-[0.65vw] text-[0.8vw] font-inter text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EC5137] focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-60 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-[0.8vw] flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-[1.1vw] h-[1.1vw]" />
              ) : (
                <Eye className="w-[1.1vw] h-[1.1vw]" />
              )}
            </button>
          </div>

          <div className="flex justify-end pt-[0.8vw]">
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              disabled={isLoading}
              className="text-[0.8vw] font-inter text-[#EC5137] hover:text-[#d94428] font-medium hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* 3. Sign In Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !formData.emailId || !formData.password}
            className="w-full py-[0.65vw] px-[0.8vw] bg-gradient-to-r from-[#FF725B] to-[#EC5137] hover:from-[#ff644c] hover:to-[#e14328] active:opacity-95 text-white font-poppins font-semibold text-[0.85vw] rounded-[0.65vw] shadow-[0_0.2vw_0.8vw_rgba(236,81,55,0.35)] transition-all flex items-center justify-center gap-[0.4vw] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-[0.9vw] h-[0.9vw] animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-[0.9vw] h-[0.9vw]" />
              </>
            )}
          </button>
        </div>

        {/* 4. Divider */}
        <div className="relative text-center my-[0.3vw]">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <span className="relative px-[0.6vw] bg-white text-[0.8vw] font-inter text-gray-400 font-medium">
            or continue with
          </span>
        </div>

        {/* 5. Google Login Button */}
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
            <span>Sign-in with Google</span>
          </button>
        </div>
      </form>

      {/* 6. Footer Switcher */}
      <div className="text-center text-[0.8vw] font-inter text-gray-500 ">
        Don't have an Account ?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-[#EC5137] hover:underline cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
