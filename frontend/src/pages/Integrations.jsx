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
  ThumbsUp,
  MapPin,
  ArrowRight,
  X,
  AlertCircle,
  Info,
  Copy,
  Check,
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

export default function Integrations() {
  const { business, setBusiness } = useContext(AuthContext);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  
  // Modal states
  const [searchModal, setSearchModal] = useState({ open: false, platform: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // Manual setup modal
  const [manualModal, setManualModal] = useState({ open: false, platform: null });
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const response = await axios.get(`${API}/platforms`, { withCredentials: true });
      setPlatforms(response.data || []);
    } catch (error) {
      console.error("Error loading platforms:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast.error("Please enter at least 2 characters");
      return;
    }
    
    setSearching(true);
    setSearchResults([]);
    
    try {
      const endpoint = searchModal.platform === "google" ? "google/search" : "facebook/search";
      const response = await axios.get(`${API}/${endpoint}`, {
        params: { query: searchQuery },
        withCredentials: true,
      });
      
      setSearchResults(response.data.results || []);
      
      if (response.data.results?.length === 0) {
        toast.info("No results found. Try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleConnect = async (result) => {
    setConnecting(true);
    setSelectedResult(result);
    
    try {
      const endpoint = searchModal.platform === "google" ? "google/connect" : "facebook/connect";
      const payload = searchModal.platform === "google"
        ? { place_id: result.place_id, name: result.name, review_link: result.review_link }
        : { page_id: result.page_id, name: result.name, url: result.url, review_link: result.review_link };
      
      await axios.post(`${API}/${endpoint}`, payload, { withCredentials: true });
      
      // Refresh business data
      const bizResponse = await axios.get(`${API}/business`, { withCredentials: true });
      setBusiness(bizResponse.data);
      
      toast.success(`${result.name} connected successfully! 🎉`);
      setSearchModal({ open: false, platform: null });
      setSearchQuery("");
      setSearchResults([]);
      loadPlatforms();
    } catch (error) {
      console.error("Connect error:", error);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
      setSelectedResult(null);
    }
  };

  const handleManualConnect = async () => {
    if (!manualUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    
    setConnecting(true);
    
    try {
      const platform = manualModal.platform;
      
      if (platform === "google") {
        // Extract Place ID from Google URL or use as review link
        const placeId = manualUrl.includes("placeid=") 
          ? manualUrl.split("placeid=")[1].split("&")[0]
          : `manual_${Date.now()}`;
        
        await axios.post(`${API}/google/connect`, {
          place_id: placeId,
          name: business?.name || "My Business",
          review_link: manualUrl
        }, { withCredentials: true });
      } else {
        // Facebook - extract page info from URL
        const pageId = manualUrl.split("/").filter(Boolean).pop() || `fb_manual_${Date.now()}`;
        
        await axios.post(`${API}/facebook/connect`, {
          page_id: pageId,
          name: business?.name || "My Business",
          url: manualUrl,
          review_link: `${manualUrl}/reviews`
        }, { withCredentials: true });
      }
      
      // Refresh
      const bizResponse = await axios.get(`${API}/business`, { withCredentials: true });
      setBusiness(bizResponse.data);
      
      toast.success("Platform connected! 🎉");
      setManualModal({ open: false, platform: null });
      setManualUrl("");
      loadPlatforms();
    } catch (error) {
      console.error("Manual connect error:", error);
      toast.error("Failed to connect. Please check the URL and try again.");
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
      
      // Refresh
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
      const response = await axios.post(`${API}/reviews/sync`, null, {
        params: { platform },
        withCredentials: true,
      });
      
      const result = response.data.results?.[platform];
      if (result?.synced > 0) {
        toast.success(`Synced ${result.synced} reviews from ${platform}!`);
      } else {
        toast.info("No new reviews to sync");
      }
      
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
          <span className="text-sm font-medium text-indigo-700">Magic Search</span>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Connect Your Platforms
        </h1>
        <p className="text-slate-600">
          Just search your business name - we'll find it automatically. No technical skills required.
        </p>
      </div>

      {/* Benefits Bar */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {[
          { icon: Zap, label: "60-Second Setup", color: "text-amber-600" },
          { icon: RefreshCw, label: "Instant Sync", color: "text-blue-600" },
          { icon: Shield, label: "100% Secure", color: "text-emerald-600" },
          { icon: Clock, label: "Real-time", color: "text-purple-600" },
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
                    <CardTitle className="text-lg font-semibold">Google Business</CardTitle>
                    <p className="text-sm text-slate-500">
                      {googleConnected ? "Connected & syncing" : "Connect to sync reviews"}
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
                  {/* Connected Business Info */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-emerald-900 truncate">
                          {business?.google_business_name || business?.name}
                        </p>
                        <p className="text-xs text-emerald-700">
                          Last synced: {getGoogleConnection()?.last_sync 
                            ? new Date(getGoogleConnection().last_sync).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Link */}
                  {business?.google_review_link && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Your Google Review Link:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-slate-700 flex-1 truncate">
                          {business.google_review_link}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(business.google_review_link);
                            toast.success("Link copied!");
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect("google")}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      data-testid="disconnect-google-btn"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSync("google")}
                      disabled={syncing.google}
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-lg flex-1"
                      data-testid="sync-google-btn"
                    >
                      {syncing.google ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Sync Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Connect your Google Business Profile to automatically sync reviews and let customers leave reviews directly.
                  </p>
                  <Button
                    onClick={() => setSearchModal({ open: true, platform: "google" })}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    data-testid="connect-google-btn"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Connect Google Business
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setManualModal({ open: true, platform: "google" })}
                    className="w-full text-slate-500"
                  >
                    Or enter your Google review link manually
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
                    <CardTitle className="text-lg font-semibold">Facebook Page</CardTitle>
                    <p className="text-sm text-slate-500">
                      {facebookConnected ? "Connected & syncing" : "Connect to sync reviews"}
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
                  {/* Connected Page Info */}
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-indigo-900 truncate">
                          {business?.facebook_page_name || business?.name}
                        </p>
                        <p className="text-xs text-indigo-700">
                          Last synced: {getFacebookConnection()?.last_sync 
                            ? new Date(getFacebookConnection().last_sync).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Page URL */}
                  {business?.facebook_page_url && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Your Facebook Page:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-slate-700 flex-1 truncate">
                          {business.facebook_page_url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => window.open(business.facebook_page_url, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect("facebook")}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      data-testid="disconnect-facebook-btn"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSync("facebook")}
                      disabled={syncing.facebook}
                      className="bg-indigo-600 hover:bg-indigo-700 rounded-lg flex-1"
                      data-testid="sync-facebook-btn"
                    >
                      {syncing.facebook ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Sync Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Connect your Facebook Page to sync recommendations and reviews automatically.
                  </p>
                  <Button
                    onClick={() => setSearchModal({ open: true, platform: "facebook" })}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    data-testid="connect-facebook-btn"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Connect Facebook Page
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setManualModal({ open: true, platform: "facebook" })}
                    className="w-full text-slate-500"
                  >
                    Or enter your Facebook page URL manually
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pro Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Pro Tip</h3>
              <p className="text-amber-800 text-sm">
                Once connected, reviews sync automatically. Low ratings (1-3 stars) go to your private inbox 
                so you can address issues before they become public complaints.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Modal */}
      <Dialog open={searchModal.open} onOpenChange={(open) => {
        if (!open) {
          setSearchModal({ open: false, platform: null });
          setSearchQuery("");
          setSearchResults([]);
        }
      }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {searchModal.platform === "google" ? (
                <GoogleIcon className="w-6 h-6" />
              ) : (
                <FacebookIcon className="w-6 h-6" />
              )}
              Connect {searchModal.platform === "google" ? "Google Business" : "Facebook Page"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 flex-1 overflow-auto">
            {/* Search Input */}
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Search for your business by name. We'll find it automatically.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={`Search ${searchModal.platform === "google" ? "Google" : "Facebook"} for your business...`}
                    className="pl-10 h-12 rounded-xl"
                    autoFocus
                    data-testid="search-business-input"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="h-12 px-6 rounded-xl"
                  data-testid="search-business-btn"
                >
                  {searching ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium text-slate-700">
                    Found {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={result.place_id || result.page_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedResult === result
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedResult(result)}
                        data-testid={`search-result-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{result.name}</p>
                            <p className="text-sm text-slate-500 truncate">
                              {result.address || result.category || "Business"}
                            </p>
                            {result.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm text-slate-600">{result.rating}</span>
                              </div>
                            )}
                            {result.likes && (
                              <div className="flex items-center gap-1 mt-1">
                                <ThumbsUp className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm text-slate-600">{result.likes.toLocaleString()} likes</span>
                              </div>
                            )}
                          </div>
                          {selectedResult === result ? (
                            <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                          ) : (
                            <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results */}
            {searchResults.length === 0 && searchQuery && !searching && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No results found</p>
                <p className="text-sm text-slate-400">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Connect Button */}
          {selectedResult && (
            <div className="pt-4 border-t border-slate-100">
              <Button
                onClick={() => handleConnect(selectedResult)}
                disabled={connecting}
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
                    Connect {selectedResult.name}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Setup Modal */}
      <Dialog open={manualModal.open} onOpenChange={(open) => {
        if (!open) {
          setManualModal({ open: false, platform: null });
          setManualUrl("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {manualModal.platform === "google" ? (
                <GoogleIcon className="w-6 h-6" />
              ) : (
                <FacebookIcon className="w-6 h-6" />
              )}
              Manual Setup
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
                <p className="text-sm text-slate-600">
                  {manualModal.platform === "google"
                    ? "Enter your Google review link. You can find this by searching your business on Google Maps and copying the review link."
                    : "Enter your Facebook Page URL. This is the URL that appears when you visit your page."}
                </p>
            
            <div className="space-y-2">
              <Input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder={
                  manualModal.platform === "google"
                    ? "https://search.google.com/local/writereview?placeid=..."
                    : "https://facebook.com/yourbusiness"
                }
                className="h-12 rounded-xl"
                data-testid="manual-url-input"
              />
            </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  How to find your Google review link:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Search for your business on Google Maps</li>
                  <li>Click on your business profile</li>
                  <li>Click the &quot;Write a review&quot; button</li>
                  <li>Copy the URL from your browser</li>
                </ol>
              </div>

            <Button
              onClick={handleManualConnect}
              disabled={connecting || !manualUrl.trim()}
              className="w-full h-12 rounded-xl"
              data-testid="manual-connect-btn"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
