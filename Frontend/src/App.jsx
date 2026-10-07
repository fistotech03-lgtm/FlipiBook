import React, { lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/CustomToast';
import { ModernToastProvider } from './components/ModernToast';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/mainLayout';

// Main Pages
const Home = lazy(() => import('./pages/Home'));
const MyFlipbooks = lazy(() => import('./pages/MyFlipbooks'));
const Templates = lazy(() => import('./pages/Templates'));
const Explore = lazy(() => import('./pages/Explore'));
const Features = lazy(() => import('./pages/Features'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Help = lazy(() => import('./pages/Help'));

// Settings Components
const SettingsLayout = lazy(() => import('./components/Settings/SettingsLayout'));
const Profile = lazy(() => import('./components/Settings/Profile'));
const Account = lazy(() => import('./components/Settings/Account'));
const Notifications = lazy(() => import('./components/Settings/Notifications'));
const MyShelf = lazy(() => import('./components/Settings/MyShelf'));

function SettingsIndexRedirect() {
  let email = '';
  try {
    const stored = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      email = u.emailId || u.email || '';
    }
  } catch (e) {}

  if (email) {
    return <Navigate to={`profile/${encodeURIComponent(email)}`} replace />;
  }
  return <Navigate to="profile" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <ModernToastProvider>
        <Router>
        <Routes>
          {/* Public auth routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/forgot-password" element={<Login />} />

          {/* Protected Main Layout routes */}
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

            {/* Settings Nested Routes */}
            <Route
              path="/settings"
              element={
                <Suspense fallback={null}>
                  <SettingsLayout />
                </Suspense>
              }
            >
              <Route index element={<SettingsIndexRedirect />} />
              <Route
                path="profile"
                element={
                  <Suspense fallback={null}>
                    <Profile />
                  </Suspense>
                }
              />
              <Route
                path="profile/:useremail"
                element={
                  <Suspense fallback={null}>
                    <Profile />
                  </Suspense>
                }
              />
              <Route
                path="account"
                element={
                  <Suspense fallback={null}>
                    <Account />
                  </Suspense>
                }
              />
              <Route
                path="notifications"
                element={
                  <Suspense fallback={null}>
                    <Notifications />
                  </Suspense>
                }
              />
              <Route
                path="my-shelf"
                element={
                  <Suspense fallback={null}>
                    <MyShelf />
                  </Suspense>
                }
              />

            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ModernToastProvider>
    </ToastProvider>
  );
}
