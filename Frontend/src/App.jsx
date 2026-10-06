import React, { lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/CustomToast';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/mainLayout';

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
      <Router>
        <Routes>
          {/* Public auth routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/forgot-password" element={<Login />} />

          {/* Main Layout routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
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
                <Suspense fallback={null}>
                  <MyFlipbooks />
                </Suspense>
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
    </ToastProvider>
  );
}
