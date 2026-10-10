import React, { lazy, Suspense, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { ToastProvider } from "./components/CustomToast";
import { ModernToastProvider } from "./components/ModernToast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./Layouts/MainLayout";

function AuthRouteRedirect({ mode = "signin" }) {
  const { openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || null;

  useEffect(() => {
    openAuthModal(mode, redirect);
  }, [mode, redirect, openAuthModal]);

  return <Navigate to="/" replace />;
}

const Home = lazy(() => import("./pages/Home"));
const MyFlipbooks = lazy(() => import("./pages/MyFlipbooks"));
const Templates = lazy(() => import("./pages/Templates"));
const Explore = lazy(() => import("./pages/Explore"));
const Features = lazy(() => import("./pages/Features"));
const Help = lazy(() => import("./pages/Help"));
const Converter = lazy(() => import("./pages/Converter"));
const Pricing = lazy(() => import("./pages/Pricing"));

// Editor Components
const EditorLayout = lazy(() => import("./Layouts/EditorLayout"));
const PageEditor = lazy(() => import("./components/PageEditor/PageEditor"));
const CustomizedEditor = lazy(
  () => import("./components/CustomizedEditor/CustomizedEditor"),
);

// Settings Components
const SettingsLayout = lazy(
  () => import("./components/Settings/SettingsLayout"),
);
const Profile = lazy(() => import("./components/Settings/Profile"));
const Account = lazy(() => import("./components/Settings/Account"));
const Notifications = lazy(() => import("./components/Settings/Notifications"));
const MyShelf = lazy(() => import("./components/Settings/MyShelf"));

function SettingsIndexRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const email = user?.emailId || user?.email || "";

  return <Navigate to="profile" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ModernToastProvider>
          <Router>
            <AuthModal />
            <Routes>
              {/* Direct visits to auth URLs automatically open the Auth Modal over home */}
              <Route
                path="/login"
                element={<AuthRouteRedirect mode="signin" />}
              />
              <Route
                path="/signin"
                element={<AuthRouteRedirect mode="signin" />}
              />
              <Route
                path="/signup"
                element={<AuthRouteRedirect mode="signup" />}
              />
              <Route
                path="/forgot-password"
                element={<AuthRouteRedirect mode="forgot-password" />}
              />

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
                  path="/help"
                  element={
                    <Suspense fallback={null}>
                      <Help />
                    </Suspense>
                  }
                />
                <Route
                  path="/converter"
                  element={
                    <Suspense fallback={null}>
                      <Converter />
                    </Suspense>
                  }
                />
                <Route
                  path="/pricing"
                  element={
                    <Suspense fallback={null}>
                      <Pricing />
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
                </Route>
              </Route>

              {/* Protected Editor Routes */}
              <Route
                path="/editor"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={null}>
                      <EditorLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <Suspense fallback={null}>
                      <PageEditor />
                    </Suspense>
                  }
                />
                <Route
                  path=":folder/:v_id"
                  element={
                    <Suspense fallback={null}>
                      <PageEditor />
                    </Suspense>
                  }
                />
                <Route
                  path=":v_id"
                  element={
                    <Suspense fallback={null}>
                      <PageEditor />
                    </Suspense>
                  }
                />
                <Route
                  path="customized_editor"
                  element={
                    <Suspense fallback={null}>
                      <CustomizedEditor />
                    </Suspense>
                  }
                />
                <Route
                  path="customized_editor/:v_id"
                  element={
                    <Suspense fallback={null}>
                      <CustomizedEditor />
                    </Suspense>
                  }
                />
                <Route
                  path="customized_editor/:folder/:v_id"
                  element={
                    <Suspense fallback={null}>
                      <CustomizedEditor />
                    </Suspense>
                  }
                />
                <Route
                  path="customized_editor/:folder/:v_id/:page"
                  element={
                    <Suspense fallback={null}>
                      <CustomizedEditor />
                    </Suspense>
                  }
                />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ModernToastProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
