import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Link2,
  ExternalLink,
  Sparkles,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Copy,
  Globe,
  Users,
  ThumbsUp,
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

export default function Integrations() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Google connection modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleSearch, setGoogleSearch] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [searchingGoogle, setSearchingGoogle] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [selectedGoogleBusiness, setSelectedGoogleBusiness] = useState(null);
  
  // Facebook connection modal state
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
      const response = await axios.get(`${API}/platforms`, {
        withCredentials: true,
      });
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
      if (googleSearch) {
        searchGoogleBusinesses(googleSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [googleSearch, searchGoogleBusinesses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (facebookSearch) {
        searchFacebookPages(facebookSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [facebookSearch, searchFacebookPages]);

  const connectGoogleBusiness = async (business) => {
    setConnectingGoogle(true);
    setSelectedGoogleBusiness(business);
    
    try {
      await axios.post(
        `${API}/google/connect`,
        {
          place_id: business.place_id,
          name: business.name,
          review_link: business.review_link
        },
        { withCredentials: true }
      );
      
      toast.success("Google Business connected successfully! Reviews are syncing...");
      setShowGoogleModal(false);
      setGoogleSearch("");
      setGoogleResults([]);
      setSelectedGoogleBusiness(null);
      fetchPlatforms();
    } catch (error) {
      console.error("Error connecting Google:", error);
      toast.error("Failed to connect Google Business");
    } finally {
      setConnectingGoogle(false);
    }
  };

  const connectFacebookPage = async (page) => {
    setConnectingFacebook(true);
    setSelectedFacebookPage(page);
    
    try {
      await axios.post(
        `${API}/facebook/connect`,
        {
          page_id: page.page_id,
          name: page.name,
          page_name: page.name,
          url: page.url,
          page_url: page.url,
          review_link: page.review_link
        },
        { withCredentials: true }
      );
      
      toast.success("Facebook Page connected successfully! Reviews are syncing...");
      setShowFacebookModal(false);
      setFacebookSearch("");
      setFacebookResults([]);
      setSelectedFacebookPage(null);
      fetchPlatforms();
    } catch (error) {
      console.error("Error connecting Facebook:", error);
      toast.error("Failed to connect Facebook Page");
    } finally {
      setConnectingFacebook(false);
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      await axios.post(
        `${API}/platforms/${platform}/disconnect`,
        {},
        { withCredentials: true }
      );
      
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`);
      fetchPlatforms();
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      toast.error(`Failed to disconnect ${platform}`);
    }
  };

  const getPlatformStatus = (platformName) => {
    const platform = platforms.find((p) => p.platform === platformName);
    return platform?.status || "disconnected";
  };

  const getPlatformData = (platformName) => {
    return platforms.find((p) => p.platform === platformName);
  };

  const copyReviewLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Review link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const googleConnected = getPlatformStatus("google") === "connected";
  const facebookConnected = getPlatformStatus("facebook") === "connected";
  const googleData = getPlatformData("google");
  const facebookData = getPlatformData("facebook");

  return (
    <div className="space-y-8" data-testid="integrations-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
          Platform Integrations
        </h1>
        <p className="text-slate-600 mt-1">
          Connect Google & Facebook to manage all your reviews in one place.
        </p>
      </div>

      {/* Setup Guide Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border-0"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Easy 3-Step Setup</h3>
            <ol className="text-slate-600 text-sm space-y-1">
              <li><span className="font-medium">1.</span> Search for your business name below</li>
              <li><span className="font-medium">2.</span> Select your business from the results</li>
              <li><span className="font-medium">3.</span> That&apos;s it! Reviews will sync automatically</li>
            </ol>
          </div>
        </div>
      </motion.div>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Google Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className={`border-2 transition-all ${
              googleConnected
                ? "border-blue-300 bg-blue-50/50"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
            data-testid="platform-card-google"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100">
                    <GoogleIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">Google Business</h3>
                    <Badge
                      variant={googleConnected ? "default" : "secondary"}
                      className={
                        googleConnected
                          ? "bg-green-100 text-green-700 hover:bg-green-100 mt-1"
                          : "bg-slate-100 text-slate-600 mt-1"
                      }
                    >
                      {googleConnected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              {googleConnected && googleData?.review_link && (
                <div className="mb-4 p-3 rounded-xl bg-white border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Your Google Review Link</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-600 truncate flex-1">
                      {googleData.review_link}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyReviewLink(googleData.review_link)}
                      className="h-8 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600 mb-6">
                {googleConnected
                  ? "Your Google Business is connected. Reviews are syncing automatically."
                  : "Search for your business to connect and start collecting Google reviews."}
              </p>

              {googleConnected ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-slate-200"
                    onClick={() => handleDisconnect("google")}
                    data-testid="disconnect-google-btn"
                  >
                    Disconnect
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200"
                    onClick={() => window.open(googleData?.review_link, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                  onClick={() => setShowGoogleModal(true)}
                  data-testid="connect-google-btn"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search & Connect
                </Button>
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
          <Card
            className={`border-2 transition-all ${
              facebookConnected
                ? "border-indigo-300 bg-indigo-50/50"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
            data-testid="platform-card-facebook"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100">
                    <FacebookIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">Facebook Page</h3>
                    <Badge
                      variant={facebookConnected ? "default" : "secondary"}
                      className={
                        facebookConnected
                          ? "bg-green-100 text-green-700 hover:bg-green-100 mt-1"
                          : "bg-slate-100 text-slate-600 mt-1"
                      }
                    >
                      {facebookConnected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              {facebookConnected && facebookData?.page_url && (
                <div className="mb-4 p-3 rounded-xl bg-white border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Your Facebook Review Link</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-600 truncate flex-1">
                      {facebookData.review_link || facebookData.page_url}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyReviewLink(facebookData.review_link || facebookData.page_url)}
                      className="h-8 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600 mb-6">
                {facebookConnected
                  ? "Your Facebook Page is connected. Recommendations are syncing."
                  : "Search for your Facebook Page to connect and manage recommendations."}
              </p>

              {facebookConnected ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-slate-200"
                    onClick={() => handleDisconnect("facebook")}
                    data-testid="disconnect-facebook-btn"
                  >
                    Disconnect
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200"
                    onClick={() => window.open(facebookData?.page_url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                  onClick={() => setShowFacebookModal(true)}
                  data-testid="connect-facebook-btn"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search & Connect
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Google Search Modal */}
      <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
        <DialogContent className="max-w-lg" data-testid="google-search-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <GoogleIcon className="w-6 h-6" />
              Connect Google Business
            </DialogTitle>
            <DialogDescription>
              Search for your business name to find and connect your Google Business Profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={googleSearch}
                onChange={(e) => setGoogleSearch(e.target.value)}
                placeholder="Search your business name..."
                className="pl-10 h-12 rounded-xl border-slate-200"
                data-testid="google-search-input"
              />
              {searchingGoogle && (
                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {googleResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 max-h-80 overflow-y-auto"
                >
                  {googleResults.map((result, index) => (
                    <motion.button
                      key={result.place_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => connectGoogleBusiness(result)}
                      disabled={connectingGoogle}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-400 hover:bg-blue-50 ${
                        selectedGoogleBusiness?.place_id === result.place_id && connectingGoogle
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                      data-testid={`google-result-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{result.name}</p>
                            {result.rating && (
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs">{result.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {result.address}
                          </div>
                        </div>
                        {selectedGoogleBusiness?.place_id === result.place_id && connectingGoogle ? (
                          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results */}
            {googleSearch.length >= 2 && !searchingGoogle && googleResults.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No businesses found. Try a different search term.</p>
              </div>
            )}

            {/* Help Text */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Enter your exact business name as it appears on Google Maps for best results.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Facebook Search Modal */}
      <Dialog open={showFacebookModal} onOpenChange={setShowFacebookModal}>
        <DialogContent className="max-w-lg" data-testid="facebook-search-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FacebookIcon className="w-6 h-6" />
              Connect Facebook Page
            </DialogTitle>
            <DialogDescription>
              Search for your Facebook Page to connect and manage recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={facebookSearch}
                onChange={(e) => setFacebookSearch(e.target.value)}
                placeholder="Search your Facebook Page name..."
                className="pl-10 h-12 rounded-xl border-slate-200"
                data-testid="facebook-search-input"
              />
              {searchingFacebook && (
                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {facebookResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 max-h-80 overflow-y-auto"
                >
                  {facebookResults.map((result, index) => (
                    <motion.button
                      key={result.page_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => connectFacebookPage(result)}
                      disabled={connectingFacebook}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 ${
                        selectedFacebookPage?.page_id === result.page_id && connectingFacebook
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white"
                      }`}
                      data-testid={`facebook-result-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{result.name}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {result.category}
                            </span>
                            {result.likes && (
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {result.likes.toLocaleString()} likes
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedFacebookPage?.page_id === result.page_id && connectingFacebook ? (
                          <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results */}
            {facebookSearch.length >= 2 && !searchingFacebook && facebookResults.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No pages found. Try a different search term.</p>
              </div>
            )}

            {/* Help Text */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <strong>Tip:</strong> Enter your Facebook Page name exactly as it appears on Facebook for best results.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Section */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-2">Google Business Help</h4>
              <p className="text-sm text-slate-600">
                Search for your business name exactly as it appears on Google Maps. 
                If you can&apos;t find it, make sure you have a Google Business Profile set up.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-2">Facebook Page Help</h4>
              <p className="text-sm text-slate-600">
                Search for your Facebook Page name. Customers will be redirected 
                to your Facebook Page to leave recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
