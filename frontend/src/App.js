import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "./components/ui/sonner";
import axios from "axios";

// Helper function to safely extract error message as a string
const extractErrorMessage = (error) => {
  // Default message
  let message = "An error occurred. Please try again.";
  
  try {
    // Check for detail field
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        // FastAPI validation errors come as array
        message = detail.map(d => d?.msg || String(d)).join(', ');
      } else if (typeof detail === 'object') {
        message = JSON.stringify(detail);
      }
    } 
    // Check for message field
    else if (error?.response?.data?.message) {
      const msg = error.response.data.message;
      message = typeof msg === 'string' ? msg : JSON.stringify(msg);
    }
    // Check for direct error message  
    else if (error?.message && typeof error.message === 'string') {
      message = error.message;
    }
  } catch (e) {
    console.error("Error extracting message:", e);
  }
  
  // Ensure we never return [object Object]
  if (message === '[object Object]' || message.includes('[object Object]')) {
    message = "An unexpected error occurred. Please try again.";
  }
  
  return message;
};

// Setup axios interceptors for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = extractErrorMessage(error);
    
    // Don't show toast for auth errors (401) - those are handled by redirects
    if (error.response?.status !== 401) {
      console.error("API Error:", errorMessage);
    }
    
    // Attach clean message to error for components to use
    error.displayMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import Reviews from "./pages/Reviews";
import Analytics from "./pages/Analytics";
import QRGenerator from "./pages/QRGenerator";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import PublicReview from "./pages/PublicReview";
import WebhookSettings from "./pages/WebhookSettings";
import NotificationSettings from "./pages/NotificationSettings";
import ApiSettings from "./pages/ApiSettings";

// Components
import Layout from "./components/Layout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext(null);

import React from "react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useLocation();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get("session_id");

      if (!sessionId) {
        window.location.href = "/";
        return;
      }

      try {
        const response = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const { user } = response.data;
        
        // Clear the hash and redirect to dashboard
        window.history.replaceState(null, "", "/dashboard");
        window.location.reload();
      } catch (error) {
        console.error("Auth error:", error);
        window.location.href = "/";
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
        });
        setUser(response.data);
        setIsAuthenticated(true);

        // Check if user has a business
        const bizResponse = await axios.get(`${API}/business`, {
          withCredentials: true,
        });
        setBusiness(bizResponse.data);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If no business, redirect to onboarding
  if (!business && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, business, setBusiness }}>
      {children}
    </AuthContext.Provider>
  );
}

function AppRouter() {
  const location = useLocation();

  // Check for session_id in URL hash (Emergent OAuth callback)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/review/:qrCodeId" element={<PublicReview />} />

      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <Layout>
              <Integrations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Layout>
              <Reviews />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-generator"
        element={
          <ProtectedRoute>
            <Layout>
              <QRGenerator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/webhooks"
        element={
          <ProtectedRoute>
            <Layout>
              <WebhookSettings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationSettings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-settings"
        element={
          <ProtectedRoute>
            <Layout>
              <ApiSettings />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
