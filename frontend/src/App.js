import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, createContext } from "react";
import { Toaster, toast } from "./components/ui/sonner";
import axios from "axios";

// Helper function to safely extract error message as a string
const extractErrorMessage = (error) => {
  let message = "An error occurred. Please try again.";
  
  try {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map(d => d?.msg || String(d)).join(', ');
      } else if (typeof detail === 'object') {
        message = JSON.stringify(detail);
      }
    } else if (error?.response?.data?.message) {
      const msg = error.response.data.message;
      message = typeof msg === 'string' ? msg : JSON.stringify(msg);
    } else if (error?.message && typeof error.message === 'string') {
      message = error.message;
    }
  } catch (e) {
    console.warn("Error extracting message:", e);
  }
  
  if (message === '[object Object]' || message.includes('[object Object]')) {
    message = "An unexpected error occurred. Please try again.";
  }
  
  return message;
};

// Setup axios interceptors - suppress error throwing for handled cases
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = extractErrorMessage(error);
    error.displayMessage = errorMessage;
    
    // Only log non-auth errors
    if (error.response?.status !== 401) {
      console.warn("API Error:", errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// Suppress React's error overlay for handled API errors in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    // Suppress common API and auth-related errors
    if (event.message?.includes('[object Object]') || 
        event.error?.displayMessage ||
        event.message?.includes('Network Error') ||
        event.message?.includes('401') ||
        event.message?.includes('Request failed')) {
      event.preventDefault();
      return true;
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress unhandled promise rejections for axios errors and auth failures
    if (event.reason?.isAxiosError || 
        event.reason?.displayMessage ||
        event.reason?.response?.status === 401 ||
        event.reason?.response?.status === 404 ||
        String(event.reason).includes('[object Object]') ||
        String(event.reason).includes('Request failed')) {
      event.preventDefault();
      // Only log non-401 errors for debugging
      if (event.reason?.response?.status !== 401) {
        console.log("Suppressed promise rejection:", event.reason?.displayMessage || "API error");
      }
      return true;
    }
  });
}

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
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Shipping from "./pages/Shipping";
import Contact from "./pages/Contact";

// Components
import Layout from "./components/Layout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context with demo mode support
export const AuthContext = createContext(null);

// Demo user and business data
const DEMO_USER = {
  user_id: "demo_user_001",
  email: "demo@reviewmaster.com",
  name: "Demo User",
  avatar: null,
  is_demo: true
};

const DEMO_BUSINESS = {
  business_id: "demo_business_001",
  name: "Demo Coffee Shop",
  category: "Restaurant",
  address: "123 Demo Street, Sample City",
  qr_code_id: "demo_qr_001",
  google_place_id: "demo_google_place",
  google_business_name: "Demo Coffee Shop",
  google_review_link: "https://g.page/demo-coffee-shop",
  facebook_page_id: null,
  is_demo: true
};

function AuthCallback() {
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get("session_id");

      if (!sessionId) {
        setStatus("error");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      try {
        setStatus("loading");
        
        // Get selected plan from session storage
        const selectedPlan = sessionStorage.getItem('selected_plan');
        const selectedBillingCycle = sessionStorage.getItem('selected_billing_cycle');
        
        await axios.post(
          `${API}/auth/session`,
          { 
            session_id: sessionId,
            selected_plan: selectedPlan || 'starter'
          },
          { withCredentials: true }
        );
        
        setStatus("success");
        
        // Small delay to show success state
        setTimeout(() => {
          // If user had selected a plan before login, redirect to pricing to complete payment
          if (selectedPlan && selectedBillingCycle) {
            // Keep the plan info for the pricing page to pick up
            window.history.replaceState(null, "", "/#pricing");
            window.location.reload();
          } else {
            // Clear the selected plan from session storage
            sessionStorage.removeItem('selected_plan');
            sessionStorage.removeItem('selected_billing_cycle');
            window.history.replaceState(null, "", "/dashboard");
            window.location.reload();
          }
        }, 500);
      } catch (error) {
        console.warn("Auth callback error - redirecting to home");
        setStatus("error");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center p-8">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Signing you in...</h2>
            <p className="text-slate-500">Please wait while we verify your account</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome back!</h2>
            <p className="text-slate-500">Redirecting to your dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500">Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check for demo mode
    const demoMode = sessionStorage.getItem('demo_mode') === 'true';
    
    if (demoMode) {
      setUser(DEMO_USER);
      setBusiness(DEMO_BUSINESS);
      setIsAuthenticated(true);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
        });
        setUser(response.data);
        setIsAuthenticated(true);

        try {
          const bizResponse = await axios.get(`${API}/business`, {
            withCredentials: true,
          });
          setBusiness(bizResponse.data);
        } catch (bizError) {
          // No business yet - that's fine, redirect to onboarding
          console.log("No business found for user - will redirect to onboarding");
          setBusiness(null);
        }
        setLoading(false);
      } catch (error) {
        // If we just came from auth callback, retry a few times before giving up
        // This handles race condition where cookie might not be set yet
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 500);
          return;
        }
        // Not authenticated after retries
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading your dashboard...</h2>
          <p className="text-slate-500">Just a moment</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!business && !isDemo && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, business, setBusiness, isDemo }}>
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
        path="/advanced-settings"
        element={
          <ProtectedRoute>
            <Layout>
              <ApiSettings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
