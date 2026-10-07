import React, { lazy, Suspense, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { ToastProvider } from './components/CustomToast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/mainLayout';

function AuthRouteRedirect({ mode = 'signin' }) {
  const { openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || null;

  useEffect(() => {
    openAuthModal(mode, redirect);
  }, [mode, redirect, openAuthModal]);

  return <Navigate to="/" replace />;
}

const Home = lazy(() => import('./pages/Home'));
const MyFlipbooks = lazy(() => import('./pages/MyFlipbooks'));
const Templates = lazy(() => import('./pages/Templates'));
const Explore = lazy(() => import('./pages/Explore'));
const Features = lazy(() => import('./pages/Features'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Help = lazy(() => import('./pages/Help'));

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AuthModal />
          <Routes>
            {/* Direct visits to auth URLs automatically open the Auth Modal over home */}
            <Route path="/login" element={<AuthRouteRedirect mode="signin" />} />
            <Route path="/signin" element={<AuthRouteRedirect mode="signin" />} />
            <Route path="/signup" element={<AuthRouteRedirect mode="signup" />} />
            <Route path="/forgot-password" element={<AuthRouteRedirect mode="forgot-password" />} />

          {/* Main Layout routes — accessible without login initially */}
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <Suspense fallback={null}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/home"
              element={
                <Suspense fallback={null}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/my-flipbooks"
              element={
                <ProtectedRoute>
                  <Suspense fallback={null}>
                    <MyFlipbooks />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <Suspense fallback={null}>
                  <Templates />
                </Suspense>
              }
            />
            <Route
              path="/explore"
              element={
                <Suspense fallback={null}>
                  <Explore />
                </Suspense>
              }
            />
            <Route
              path="/features"
              element={
                <Suspense fallback={null}>
                  <Features />
                </Suspense>
              }
            />
            <Route
              path="/about"
              element={
                <Suspense fallback={null}>
                  <AboutUs />
                </Suspense>
              }
            />
            <Route
              path="/about-us"
              element={
                <Suspense fallback={null}>
                  <AboutUs />
                </Suspense>
              }
            />
            <Route
              path="/contact"
              element={
                <Suspense fallback={null}>
                  <ContactUs />
                </Suspense>
              }
            />
            <Route
              path="/contact-us"
              element={
                <Suspense fallback={null}>
                  <ContactUs />
                </Suspense>
              }
            />
            <Route
              path="/help"
              element={
                <Suspense fallback={null}>
                  <Help />
                </Suspense>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
