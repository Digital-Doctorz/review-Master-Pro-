import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Google icon component
const GoogleIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook icon component
const FacebookIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Search Result Card Component
const SearchResultCard = ({ result, platform, onSelect, isSelected, isConnecting }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => onSelect(result)}
    disabled={isConnecting}
    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
      isSelected
        ? platform === "google"
          ? "border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-500/20"
          : "border-indigo-500 bg-indigo-50/80 shadow-lg shadow-indigo-500/20"
        : "border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white/80 hover:shadow-md"
    }`}
    data-testid={`search-result-${result.place_id || result.id}`}
  >
    <div className="flex items-start gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
        platform === "google" ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}>
        {platform === "google" ? (
          <GoogleIcon className="w-8 h-8" />
        ) : (
          <FacebookIcon className="w-8 h-8" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate text-lg">{result.name}</h3>
        {result.address && (
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{result.address}</span>
          </div>
        )}
        {result.category && (
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <span className="truncate">{result.category}</span>
          </div>
        )}
        {result.rating && (
          <div className="flex items-center mt-2 gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(result.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-600">
              {result.rating?.toFixed(1)}
            </span>
            {result.review_count > 0 && (
              <span className="text-sm text-slate-400">
                ({result.review_count} reviews)
              </span>
            )}
          </div>
        )}
      </div>
      {isSelected && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          platform === "google" ? "bg-blue-500" : "bg-indigo-500"
        }`}>
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  </motion.button>
);

export default function Integrations() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Google connection state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleSearch, setGoogleSearch] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [searchingGoogle, setSearchingGoogle] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [selectedGoogleBusiness, setSelectedGoogleBusiness] = useState(null);
  
  // Facebook connection state
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [facebookSearch, setFacebookSearch] = useState("");
  const [facebookResults, setFacebookResults] = useState([]);
  const [searchingFacebook, setSearchingFacebook] = useState(false);
  const [connectingFacebook, setConnectingFacebook] = useState(false);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState(null);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(`${API}/platforms`, { withCredentials: true });
      setPlatforms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching platforms:", error?.message || error);
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Google search
  const searchGoogleBusinesses = useCallback(async (query) => {
    if (query.length < 2) {
      setGoogleResults([]);
      return;
    }
    
    setSearchingGoogle(true);
    try {
      const response = await axios.get(`${API}/google/search`, {
        params: { query },
        withCredentials: true,
      });
      setGoogleResults(Array.isArray(response.data?.results) ? response.data.results : []);
    } catch (error) {
      console.error("Error searching Google:", error?.message || error);
      toast.error("Search failed. Please try again.");
      setGoogleResults([]);
    } finally {
      setSearchingGoogle(false);
    }
  }, []);

  // Debounced Facebook search
  const searchFacebookPages = useCallback(async (query) => {
    if (query.length < 2) {
      setFacebookResults([]);
      return;
    }
    
    setSearchingFacebook(true);
    try {
      const response = await axios.get(`${API}/facebook/search`, {
        params: { query },
        withCredentials: true,
      });
      setFacebookResults(Array.isArray(response.data?.results) ? response.data.results : []);
    } catch (error) {
      console.error("Error searching Facebook:", error?.message || error);
      toast.error("Search failed. Please try again.");
      setFacebookResults([]);
    } finally {
      setSearchingFacebook(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (googleSearch) searchGoogleBusinesses(googleSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [googleSearch, searchGoogleBusinesses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (facebookSearch) searchFacebookPages(facebookSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [facebookSearch, searchFacebookPages]);

  const connectGoogleBusiness = async () => {
    if (!selectedGoogleBusiness) return;
    
    setConnectingGoogle(true);
    try {
      await axios.post(`${API}/google/connect`, {
        place_id: selectedGoogleBusiness.place_id,
        name: selectedGoogleBusiness.name,
        address: selectedGoogleBusiness.address,
        review_link: selectedGoogleBusiness.review_link,
      }, { withCredentials: true });
      
      toast.success("🎉 Google Business connected successfully!");
      setShowGoogleModal(false);
      setGoogleSearch("");
      setGoogleResults([]);
      setSelectedGoogleBusiness(null);
      fetchPlatforms();
    } catch (error) {
      console.error("Error connecting Google:", error?.message || error);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnectingGoogle(false);
    }
  };

  const connectFacebookPage = async () => {
    if (!selectedFacebookPage) return;
    
    setConnectingFacebook(true);
    try {
      await axios.post(`${API}/facebook/connect`, {
        page_id: selectedFacebookPage.id,
        name: selectedFacebookPage.name,
        url: selectedFacebookPage.url,
        category: selectedFacebookPage.category,
      }, { withCredentials: true });
      
      toast.success("🎉 Facebook Page connected successfully!");
      setShowFacebookModal(false);
      setFacebookSearch("");
      setFacebookResults([]);
      setSelectedFacebookPage(null);
      fetchPlatforms();
    } catch (error) {
      console.error("Error connecting Facebook:", error?.message || error);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnectingFacebook(false);
    }
  };

  const disconnectPlatform = async (platform) => {
    try {
      await axios.post(`${API}/platforms/${platform}/disconnect`, {}, { withCredentials: true });
      toast.success(`${platform === "google" ? "Google" : "Facebook"} disconnected`);
      fetchPlatforms();
    } catch (error) {
      console.error("Error disconnecting:", error?.message || error);
      toast.error("Failed to disconnect. Please try again.");
    }
  };

  const googlePlatform = platforms.find(p => p.platform === "google");
  const facebookPlatform = platforms.find(p => p.platform === "facebook");
  const isGoogleConnected = googlePlatform?.status === "connected";
  const isFacebookConnected = facebookPlatform?.status === "connected";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="integrations-page">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          60-Second Setup
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
          Connect Your Platforms
        </h1>
        <p className="text-slate-600 text-lg max-w-xl mx-auto">
          Just search your business name - we&apos;ll find it automatically. No technical skills required.
        </p>
      </div>

      {/* Features row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: Zap, label: "Instant Sync", color: "text-amber-500" },
          { icon: Shield, label: "100% Secure", color: "text-emerald-500" },
          { icon: Clock, label: "Real-time", color: "text-indigo-500" },
        ].map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl glass-frosted"
          >
            <feature.icon className={`w-6 h-6 ${feature.color} mb-2`} />
            <span className="text-sm font-medium text-slate-700">{feature.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Google Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`glass-card border-2 overflow-hidden transition-all duration-300 ${
            isGoogleConnected 
              ? "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white" 
              : "border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10"
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    isGoogleConnected 
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30" 
                      : "bg-white shadow-slate-200"
                  }`}>
                    {isGoogleConnected ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <GoogleIcon className="w-9 h-9" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Google Business</h3>
                    <p className="text-slate-500 text-sm">
                      {isGoogleConnected ? "Connected & syncing" : "Connect to sync reviews"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={isGoogleConnected 
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 text-slate-600"
                  }
                >
                  {isGoogleConnected ? "Active" : "Not Connected"}
                </Badge>
              </div>

              {isGoogleConnected && googlePlatform && (
                <div className="mb-6 p-4 rounded-xl bg-white/60 border border-slate-100">
                  <p className="font-medium text-slate-900 truncate">
                    {googlePlatform.place_id || "Connected Business"}
                  </p>
                  {googlePlatform.last_sync && (
                    <p className="text-sm text-slate-500 mt-1">
                      Last synced: {new Date(googlePlatform.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {isGoogleConnected ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                    onClick={() => disconnectPlatform("google")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700"
                    onClick={fetchPlatforms}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full rounded-xl h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                  data-testid="connect-google-btn"
                >
                  <GoogleIcon className="w-6 h-6 mr-3" />
                  Connect Google Business
                  <ArrowRight className="w-5 h-5 ml-auto" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Facebook Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`glass-card border-2 overflow-hidden transition-all duration-300 ${
            isFacebookConnected 
              ? "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white" 
              : "border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    isFacebookConnected 
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30" 
                      : "bg-white shadow-slate-200"
                  }`}>
                    {isFacebookConnected ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <FacebookIcon className="w-9 h-9" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Facebook Page</h3>
                    <p className="text-slate-500 text-sm">
                      {isFacebookConnected ? "Connected & syncing" : "Connect to sync reviews"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={isFacebookConnected 
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 text-slate-600"
                  }
                >
                  {isFacebookConnected ? "Active" : "Not Connected"}
                </Badge>
              </div>

              {isFacebookConnected && facebookPlatform && (
                <div className="mb-6 p-4 rounded-xl bg-white/60 border border-slate-100">
                  <p className="font-medium text-slate-900 truncate">
                    {facebookPlatform.page_id || "Connected Page"}
                  </p>
                  {facebookPlatform.last_sync && (
                    <p className="text-sm text-slate-500 mt-1">
                      Last synced: {new Date(facebookPlatform.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {isFacebookConnected ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                    onClick={() => disconnectPlatform("facebook")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700"
                    onClick={fetchPlatforms}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowFacebookModal(true)}
                  className="w-full rounded-xl h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300"
                  data-testid="connect-facebook-btn"
                >
                  <FacebookIcon className="w-6 h-6 mr-3" />
                  Connect Facebook Page
                  <ArrowRight className="w-5 h-5 ml-auto" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Pro Tip</h3>
            <p className="text-slate-600 text-sm">
              Once connected, reviews sync automatically. Low ratings (1-3 stars) go to your private inbox 
              so you can address issues before they become public complaints.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Google Connection Modal */}
      <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col glass-deep rounded-3xl border-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="block">Connect Google Business</span>
                <span className="text-sm font-normal text-slate-500">Search your business name</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={googleSearch}
                onChange={(e) => setGoogleSearch(e.target.value)}
                placeholder="e.g., Sunrise Cafe, Mumbai"
                className="pl-12 h-14 text-lg rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                autoFocus
                data-testid="google-search-input"
              />
              {searchingGoogle && (
                <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 hide-scrollbar">
            <AnimatePresence mode="wait">
              {googleResults.length > 0 ? (
                googleResults.map((result, index) => (
                  <SearchResultCard
                    key={result.place_id || index}
                    result={result}
                    platform="google"
                    onSelect={setSelectedGoogleBusiness}
                    isSelected={selectedGoogleBusiness?.place_id === result.place_id}
                    isConnecting={connectingGoogle}
                  />
                ))
              ) : googleSearch.length >= 2 && !searchingGoogle ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No businesses found</p>
                  <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
                </motion.div>
              ) : googleSearch.length < 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <GoogleIcon className="w-8 h-8" />
                  </div>
                  <p className="text-slate-600 font-medium">Search for your business</p>
                  <p className="text-slate-400 text-sm mt-1">Enter at least 2 characters to search</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {selectedGoogleBusiness && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
              <Button
                onClick={connectGoogleBusiness}
                disabled={connectingGoogle}
                className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30"
                data-testid="confirm-google-connect"
              >
                {connectingGoogle ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Connect {selectedGoogleBusiness.name?.substring(0, 20)}...
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Facebook Connection Modal */}
      <Dialog open={showFacebookModal} onOpenChange={setShowFacebookModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col glass-deep rounded-3xl border-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <FacebookIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="block">Connect Facebook Page</span>
                <span className="text-sm font-normal text-slate-500">Search your page name</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={facebookSearch}
                onChange={(e) => setFacebookSearch(e.target.value)}
                placeholder="e.g., My Business Page"
                className="pl-12 h-14 text-lg rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                autoFocus
                data-testid="facebook-search-input"
              />
              {searchingFacebook && (
                <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 hide-scrollbar">
            <AnimatePresence mode="wait">
              {facebookResults.length > 0 ? (
                facebookResults.map((result, index) => (
                  <SearchResultCard
                    key={result.id || index}
                    result={result}
                    platform="facebook"
                    onSelect={setSelectedFacebookPage}
                    isSelected={selectedFacebookPage?.id === result.id}
                    isConnecting={connectingFacebook}
                  />
                ))
              ) : facebookSearch.length >= 2 && !searchingFacebook ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No pages found</p>
                  <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
                </motion.div>
              ) : facebookSearch.length < 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <FacebookIcon className="w-8 h-8" />
                  </div>
                  <p className="text-slate-600 font-medium">Search for your page</p>
                  <p className="text-slate-400 text-sm mt-1">Enter at least 2 characters to search</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {selectedFacebookPage && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
              <Button
                onClick={connectFacebookPage}
                disabled={connectingFacebook}
                className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                data-testid="confirm-facebook-connect"
              >
                {connectingFacebook ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Connect {selectedFacebookPage.name?.substring(0, 20)}...
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
