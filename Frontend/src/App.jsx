import React, { lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/CustomToast';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/dashboard'));

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

          {/* Protected routes — valid token required */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Suspense fallback={null}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
