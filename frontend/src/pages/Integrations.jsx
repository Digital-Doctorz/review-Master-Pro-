import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Link2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  Copy,
  AlertCircle,
  Info,
  Globe,
  HelpCircle,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Google Icon
const GoogleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook Icon
const FacebookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Safe copy to clipboard with fallback
const copyToClipboard = async (text, successMessage = "Copied!") => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success(successMessage);
      } catch (err) {
        toast.error("Copy failed. Please copy manually.");
      }
      document.body.removeChild(textArea);
    }
  } catch (err) {
    toast.error("Copy failed. Please copy manually.");
  }
};

export default function Integrations() {
  const { business, setBusiness } = useContext(AuthContext);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  
  // Setup modal states
  const [setupModal, setSetupModal] = useState({ open: false, platform: null, step: 1 });
  const [reviewLink, setReviewLink] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadPlatforms();
  }, []);

  useEffect(() => {
    if (business?.name) {
      setBusinessName(business.name);
    }
  }, [business]);

  const loadPlatforms = async () => {
    try {
      const response = await axios.get(`${API}/platforms`, { withCredentials: true });
      setPlatforms(response.data || []);
    } catch (error) {
      console.error("Error loading platforms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!reviewLink.trim()) {
      toast.error("Please enter your Google Review link");
      return;
    }
    
    setConnecting(true);
    
    try {
      const platform = setupModal.platform;
      
      if (platform === "google") {
        // Extract Place ID from Google URL if present
        let placeId = `google_${Date.now()}`;
        if (reviewLink.includes("placeid=")) {
          placeId = reviewLink.split("placeid=")[1].split("&")[0];
        } else if (reviewLink.includes("/place/")) {
          // Extract from Google Maps URL
          const match = reviewLink.match(/place\/([^\/]+)/);
          if (match) placeId = `place_${match[1].substring(0, 20)}`;
        }
        
        await axios.post(`${API}/google/connect`, {
          place_id: placeId,
          name: businessName || business?.name || "My Business",
          review_link: reviewLink
        }, { withCredentials: true });
      } else {
        // Facebook
        let pageId = `fb_${Date.now()}`;
        if (reviewLink.includes("facebook.com/")) {
          const parts = reviewLink.split("facebook.com/")[1];
          if (parts) pageId = parts.split("/")[0].split("?")[0];
        }
        
        await axios.post(`${API}/facebook/connect`, {
          page_id: pageId,
          name: businessName || business?.name || "My Business",
          url: reviewLink.replace("/reviews", ""),
          review_link: reviewLink.includes("/reviews") ? reviewLink : `${reviewLink}/reviews`
        }, { withCredentials: true });
      }
      
      // Refresh business data
      const bizResponse = await axios.get(`${API}/business`, { withCredentials: true });
      setBusiness(bizResponse.data);
      
      toast.success(`${platform === "google" ? "Google" : "Facebook"} connected successfully! 🎉`);
      setSetupModal({ open: false, platform: null, step: 1 });
      setReviewLink("");
      loadPlatforms();
    } catch (error) {
      console.error("Connect error:", error);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform === "google" ? "Google Business" : "Facebook Page"}?`)) {
      return;
    }
    
    try {
      await axios.post(`${API}/platforms/${platform}/disconnect`, {}, { withCredentials: true });
      
      const bizResponse = await axios.get(`${API}/business`, { withCredentials: true });
      setBusiness(bizResponse.data);
      
      toast.success("Platform disconnected");
      loadPlatforms();
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect");
    }
  };

  const handleSync = async (platform) => {
    setSyncing({ ...syncing, [platform]: true });
    
    try {
      await axios.post(`${API}/reviews/sync`, null, {
        params: { platform },
        withCredentials: true,
      });
      
      toast.success(`Reviews synced from ${platform}!`);
      loadPlatforms();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed. Please try again.");
    } finally {
      setSyncing({ ...syncing, [platform]: false });
    }
  };

  const getGoogleConnection = () => platforms.find(p => p.platform === "google");
  const getFacebookConnection = () => platforms.find(p => p.platform === "facebook");
  
  const googleConnected = getGoogleConnection()?.status === "connected";
  const facebookConnected = getFacebookConnection()?.status === "connected";

  const openSetupModal = (platform) => {
    setSetupModal({ open: true, platform, step: 1 });
    setReviewLink("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="integrations-page">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-4"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">Super Easy Setup</span>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Connect Your Review Platforms
        </h1>
        <p className="text-slate-600">
          Just paste your Google or Facebook review link. That&apos;s it! No API keys needed.
        </p>
      </div>

      {/* Benefits Bar */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {[
          { icon: Zap, label: "30-Second Setup", color: "text-amber-600" },
          { icon: Shield, label: "No Coding", color: "text-emerald-600" },
          { icon: Globe, label: "Works Instantly", color: "text-blue-600" },
        ].map((benefit) => (
          <div key={benefit.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
            <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
            <span className="text-slate-600 font-medium">{benefit.label}</span>
          </div>
        ))}
      </div>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Google Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-0 overflow-hidden h-full">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <GoogleIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Google Reviews</CardTitle>
                    <p className="text-sm text-slate-500">
                      {googleConnected ? "Connected" : "Google Maps & Business"}
                    </p>
                  </div>
                </div>
                <Badge className={googleConnected 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-slate-100 text-slate-600"
                }>
                  {googleConnected ? "Active" : "Not Connected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {googleConnected ? (
                <div className="space-y-4">
                  {/* Connected Info */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-emerald-900 truncate">
                          {business?.google_business_name || business?.name}
                        </p>
                        <p className="text-xs text-emerald-700">Connected & Ready</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Link */}
                  {business?.google_review_link && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Your Google Review Link:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-slate-700 flex-1 truncate">
                          {business.google_review_link.substring(0, 50)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => copyToClipboard(business.google_review_link, "Link copied!")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect("google")}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSync("google")}
                      disabled={syncing.google}
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-lg flex-1"
                    >
                      {syncing.google ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Sync Reviews
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Connect your Google Business to let customers leave reviews directly on Google Maps.
                  </p>
                  <Button
                    onClick={() => openSetupModal("google")}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    data-testid="connect-google-btn"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Connect Google Reviews
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Facebook Page Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-0 overflow-hidden h-full">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <FacebookIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Facebook Reviews</CardTitle>
                    <p className="text-sm text-slate-500">
                      {facebookConnected ? "Connected" : "Facebook Page Reviews"}
                    </p>
                  </div>
                </div>
                <Badge className={facebookConnected 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-slate-100 text-slate-600"
                }>
                  {facebookConnected ? "Active" : "Not Connected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {facebookConnected ? (
                <div className="space-y-4">
                  {/* Connected Info */}
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-indigo-900 truncate">
                          {business?.facebook_page_name || business?.name}
                        </p>
                        <p className="text-xs text-indigo-700">Connected & Ready</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect("facebook")}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSync("facebook")}
                      disabled={syncing.facebook}
                      className="bg-indigo-600 hover:bg-indigo-700 rounded-lg flex-1"
                    >
                      {syncing.facebook ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Sync Reviews
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Connect your Facebook Page to collect and manage Facebook recommendations.
                  </p>
                  <Button
                    onClick={() => openSetupModal("facebook")}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    data-testid="connect-facebook-btn"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Connect Facebook Page
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">How does this work?</h3>
              <ol className="text-amber-800 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>When customers scan your QR code, they&apos;ll write a review on Review Master</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>If they give 4-5 stars, they can copy their review and post it on Google/Facebook</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Low ratings (1-3 stars) stay private so you can address issues directly</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Setup Modal */}
      <Dialog open={setupModal.open} onOpenChange={(open) => {
        if (!open) {
          setSetupModal({ open: false, platform: null, step: 1 });
          setReviewLink("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {setupModal.platform === "google" ? (
                <GoogleIcon className="w-6 h-6" />
              ) : (
                <FacebookIcon className="w-6 h-6" />
              )}
              Connect {setupModal.platform === "google" ? "Google Reviews" : "Facebook Page"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Step 1: Find your link */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {setupModal.platform === "google" 
                    ? "How to get your Google Review link" 
                    : "How to get your Facebook Review link"}
                </h4>
                {setupModal.platform === "google" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-800 font-medium">From Google Business Profile (Owner):</p>
                    <ol className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <span>Sign in to <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-600">Google Business Profile</a></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <span>Select your business</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <span>Click <strong>&quot;Ask for reviews&quot;</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                        <span>Copy the review link shown</span>
                      </li>
                    </ol>
                    <div className="mt-3">
                      <a 
                        href="https://business.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Open Google Business Profile
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ol className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <span>Open your <a href="https://www.facebook.com/pages" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-600">Facebook Business Page</a></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <span>Click the <strong>Reviews</strong> (or Recommendations) tab</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <span>Click <strong>&quot;Write a review&quot;</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                        <span>Copy the page URL from the browser address bar</span>
                      </li>
                    </ol>
                    <div className="mt-3">
                      <a 
                        href="https://www.facebook.com/pages" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Open Facebook Pages
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Paste your {setupModal.platform === "google" ? "Google Review" : "Facebook Page"} link here:
                </label>
                <Input
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder={
                    setupModal.platform === "google"
                      ? "https://g.page/r/..."
                      : "https://www.facebook.com/yourbusiness/reviews"
                  }
                  className="h-12 rounded-xl"
                  data-testid="review-link-input"
                />
              </div>

              {/* Business Name (optional override) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Business Name (optional):
                </label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={business?.name || "Your Business Name"}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={connecting || !reviewLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              data-testid="confirm-connect-btn"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Connect {setupModal.platform === "google" ? "Google" : "Facebook"}
                </>
              )}
            </Button>

            {/* Help text */}
            <p className="text-xs text-center text-slate-500">
              Don&apos;t worry - we don&apos;t need any API keys or technical setup. Just paste your link!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
