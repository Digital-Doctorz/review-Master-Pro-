import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Star,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  AlertCircle,
  Lock,
  Link2,
  Cloud,
  CloudOff,
  Info,
  X,
  Play,
  Clock,
  Crown,
  CreditCard,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Format date to relative time or absolute date
const formatReviewDate = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return "";
  }
};

// Demo data for demonstration mode
const DEMO_ANALYTICS = {
  average_rating: 4.7,
  total_reviews: 1847,
  response_rate: 98,
  positive_ratio: 91,
  sentiment_breakdown: { positive: 1682, neutral: 112, negative: 53 }
};

const DEMO_REVIEWS = [
  {
    review_id: "demo_1",
    author_name: "Sarah J.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    platform: "google",
    rating: 5,
    text: "Absolutely fantastic experience! The food was amazing and service was top-notch. Will definitely come back!",
    sentiment: "positive",
    response: "Thank you Sarah! We're thrilled you enjoyed your visit. See you again soon!",
    created_at: new Date().toISOString()
  },
  {
    review_id: "demo_2",
    author_name: "Rahul M.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    platform: "facebook",
    rating: 5,
    text: "Best coffee in town! The ambiance is perfect for work meetings. Highly recommend the cold brew.",
    sentiment: "positive",
    response: null,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    review_id: "demo_3",
    author_name: "Amit P.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    platform: "swiggy",
    rating: 5,
    text: "Ordered via Swiggy and the food arrived hot and fresh! The packaging was excellent. Biryani was authentic and delicious.",
    sentiment: "positive",
    response: "Thank you Amit! We're glad the delivery experience was great. Order again soon!",
    created_at: new Date(Date.now() - 43200000).toISOString()
  },
  {
    review_id: "demo_4",
    author_name: "Priya S.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    platform: "zomato",
    rating: 5,
    text: "Found this gem on Zomato! The ambiance is cozy and the pasta is simply outstanding. Must try their tiramisu!",
    sentiment: "positive",
    response: "Thanks Priya! So happy you discovered us. The tiramisu is indeed our specialty!",
    created_at: new Date(Date.now() - 129600000).toISOString()
  },
  {
    review_id: "demo_5",
    author_name: "Deepak V.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=deepak",
    platform: "amazon",
    rating: 5,
    text: "Great product quality! Exactly as described. Delivery was quick and packaging was secure. Very satisfied!",
    sentiment: "positive",
    response: "Thank you Deepak! We take pride in product quality. Shop with us again!",
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    review_id: "demo_6",
    author_name: "Meera K.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=meera",
    platform: "flipkart",
    rating: 5,
    text: "Flipkart delivered this product on time! Quality is excellent and value for money. Highly recommend this seller.",
    sentiment: "positive",
    response: "Thanks Meera! We appreciate your trust in us. Happy shopping!",
    created_at: new Date(Date.now() - 216000000).toISOString()
  },
  {
    review_id: "demo_7",
    author_name: "Suresh R.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=suresh",
    platform: "justdial",
    rating: 5,
    text: "Found this business on JustDial and was not disappointed! Professional service and great rates. Will use again.",
    sentiment: "positive",
    response: "Thank you Suresh! We're glad JustDial helped you find us. See you soon!",
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    review_id: "demo_8",
    author_name: "Anita K.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anita",
    platform: "google",
    rating: 4,
    text: "Great food but parking was a bit difficult. Otherwise a lovely experience!",
    sentiment: "positive",
    response: "Thank you Anita! We're working on improving parking options. Appreciate your feedback!",
    created_at: new Date(Date.now() - 302400000).toISOString()
  },
  {
    review_id: "demo_9",
    author_name: "Vikram R.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    platform: "swiggy",
    rating: 4,
    text: "Quick delivery and tasty food. The portion size could be slightly bigger for the price, but overall satisfied.",
    sentiment: "positive",
    response: null,
    created_at: new Date(Date.now() - 345600000).toISOString()
  },
  {
    review_id: "demo_10",
    author_name: "Neha G.",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neha",
    platform: "zomato",
    rating: 5,
    text: "Sunday brunch here is a must! Great variety, fresh ingredients, and the staff is so friendly. 5 stars!",
    sentiment: "positive",
    response: "Thank you Neha! We love seeing you at our Sunday brunches. See you next weekend!",
    created_at: new Date(Date.now() - 388800000).toISOString()
  },
  {
    review_id: "demo_11",
    author_name: "Private Feedback",
    author_avatar: null,
    platform: "direct",
    rating: 2,
    text: "The service was slow today and my order was wrong. I hope this improves.",
    sentiment: "negative",
    response: "We sincerely apologize for the inconvenience. We've addressed this with our team and would love to make it up to you.",
    is_private: true,
    created_at: new Date(Date.now() - 432000000).toISOString()
  }
];

const DEMO_PLATFORMS = [
  { platform: "google", status: "connected", last_sync: new Date().toISOString() },
  { platform: "facebook", status: "connected", last_sync: new Date().toISOString() },
  { platform: "amazon", status: "connected", last_sync: new Date().toISOString() },
  { platform: "flipkart", status: "connected", last_sync: new Date().toISOString() },
  { platform: "justdial", status: "connected", last_sync: new Date().toISOString() },
  { platform: "swiggy", status: "connected", last_sync: new Date().toISOString() },
  { platform: "zomato", status: "connected", last_sync: new Date().toISOString() }
];

export default function Dashboard() {
  const { user, business, isDemo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [privateReviews, setPrivateReviews] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [userPlan, setUserPlan] = useState(null);

  // Fetch user plan info
  useEffect(() => {
    if (!isDemo) {
      axios.get(`${API}/user/plan`, { withCredentials: true })
        .then(res => setUserPlan(res.data))
        .catch(err => console.warn("Failed to fetch user plan:", err));
    }
  }, [isDemo]);

  const exitDemo = () => {
    sessionStorage.removeItem('demo_mode');
    navigate('/');
  };

  const fetchDashboardData = useCallback(async () => {
    // If in demo mode, use demo data
    if (isDemo) {
      setAnalytics(DEMO_ANALYTICS);
      setReviews(DEMO_REVIEWS);
      setPrivateReviews([]);
      setPlatforms(DEMO_PLATFORMS);
      setIntegrationStatus({ overall_mode: "demo" });
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Default fallback data structures
      const defaultAnalytics = { 
        average_rating: 0, 
        total_reviews: 0, 
        response_rate: 0, 
        positive_ratio: 0,
        sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 }
      };
      
      const [analyticsRes, reviewsRes, privateRes, platformsRes, statusRes] = await Promise.all([
        axios.get(`${API}/analytics/overview`, { withCredentials: true }).catch((err) => {
          console.warn("Analytics fetch error:", err?.displayMessage || err?.message);
          return { data: defaultAnalytics };
        }),
        axios.get(`${API}/reviews?limit=10&is_private=false`, { withCredentials: true }).catch((err) => {
          console.warn("Reviews fetch error:", err?.displayMessage || err?.message);
          return { data: [] };
        }),
        axios.get(`${API}/reviews/private`, { withCredentials: true }).catch((err) => {
          console.warn("Private reviews fetch error:", err?.displayMessage || err?.message);
          return { data: [] };
        }),
        axios.get(`${API}/platforms`, { withCredentials: true }).catch((err) => {
          console.warn("Platforms fetch error:", err?.displayMessage || err?.message);
          return { data: [] };
        }),
        axios.get(`${API}/integration-status`, { withCredentials: true }).catch((err) => {
          console.warn("Integration status fetch error:", err?.displayMessage || err?.message);
          return { data: null };
        }),
      ]);

      // Safely extract and validate data
      const analytics = analyticsRes?.data || defaultAnalytics;
      // Ensure sentiment_breakdown exists
      if (!analytics.sentiment_breakdown) {
        analytics.sentiment_breakdown = { positive: 0, neutral: 0, negative: 0 };
      }
      
      setAnalytics(analytics);
      setReviews(Array.isArray(reviewsRes?.data) ? reviewsRes.data : []);
      setPrivateReviews(Array.isArray(privateRes?.data) ? privateRes.data : []);
      setPlatforms(Array.isArray(platformsRes?.data) ? platformsRes.data : []);
      setIntegrationStatus(statusRes?.data || null);
    } catch (error) {
      console.warn("Error fetching dashboard data:", error?.displayMessage || error?.message || "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    if (isDemo) return; // Don't refresh in demo mode
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSyncReviews = async () => {
    if (isDemo) return; // Don't sync in demo mode
    setSyncing(true);
    try {
      await axios.post(`${API}/reviews/sync`, {}, { withCredentials: true });
      await fetchDashboardData();
    } catch (error) {
      console.warn("Error syncing reviews:", error?.displayMessage || error?.message);
    } finally {
      setSyncing(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPlatformBadge = (platform) => {
    const colors = {
      google: "bg-blue-100 text-blue-700",
      facebook: "bg-indigo-100 text-indigo-700",
      amazon: "bg-amber-100 text-amber-700",
      flipkart: "bg-yellow-100 text-yellow-700",
      justdial: "bg-yellow-100 text-yellow-800",
      swiggy: "bg-orange-100 text-orange-700",
      zomato: "bg-red-100 text-red-700",
      direct: "bg-teal-100 text-teal-700",
    };
    return colors[platform] || "bg-slate-100 text-slate-700";
  };

  const connectedPlatforms = platforms.filter((p) => p.status === "connected");
  const hasReviews = reviews.length > 0 || privateReviews.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="dashboard-page">
      {/* Demo Mode Banner */}
      {isDemo && showDemoBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-5 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl shrink-0">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">You&apos;re viewing a demo</p>
                <p className="text-sm text-white/80 mt-0.5">Explore all features with sample data. No data will be saved.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={exitDemo}
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-medium"
              >
                Start Free Trial
              </Button>
              <button 
                onClick={() => setShowDemoBanner(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              Welcome{isDemo ? " to Demo" : " back"}, {user?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Here&apos;s how {business?.name || "your business"} is performing
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {!isDemo && connectedPlatforms.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncReviews}
                disabled={syncing}
                className="rounded-xl text-xs sm:text-sm"
                data-testid="sync-reviews-btn"
              >
                <Cloud className={`w-4 h-4 mr-1.5 ${syncing ? "animate-pulse" : ""}`} />
                {syncing ? "Syncing..." : "Sync"}
              </Button>
            )}
            {!isDemo && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="rounded-xl text-xs sm:text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
            {isDemo || integrationStatus?.overall_mode === "demo" ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-xs sm:text-sm font-medium" data-testid="demo-mode-badge">
                <CloudOff className="w-3.5 h-3.5" />
                Demo
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-xs sm:text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 live-indicator" />
                Live
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Prompt - Show if no platforms connected */}
      {connectedPlatforms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border-2 border-amber-200 bg-amber-50/50"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Connect Your Platforms</h3>
              <p className="text-slate-600 text-sm mb-4">
                Connect Google or Facebook to start collecting and managing reviews. 
                It only takes 30 seconds!
              </p>
              <Link to="/integrations">
                <Button className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect Platforms
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upgrade Plan Banner - Show for free or basic plan users */}
      {!isDemo && userPlan && (userPlan.plan_name === 'free' || userPlan.plan_name === 'starter') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Upgrade Your Plan</h3>
                <p className="text-white/90 text-sm mt-1">
                  {userPlan.plan_name === 'free' 
                    ? "Subscribe to unlock all features and grow your business" 
                    : "Upgrade to Growth or Enterprise for more features"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/#pricing')}
              className="bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-semibold px-6"
              data-testid="upgrade-plan-btn"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View Plans
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-0" data-testid="stat-total-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="w-8 h-8 text-sky-500" />
                <Badge variant="secondary" className="bg-sky-50 text-sky-600">
                  Total
                </Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics?.total_reviews || 0}
              </p>
              <p className="text-sm text-slate-500">Reviews</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-0" data-testid="stat-avg-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-amber-500" />
                <Badge variant="secondary" className="bg-amber-50 text-amber-600">
                  Rating
                </Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics?.average_rating || 0}
              </p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i <= Math.round(analytics?.average_rating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-0" data-testid="stat-response-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <Badge variant="secondary" className="bg-green-50 text-green-600">
                  Response
                </Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics?.response_rate || 0}%
              </p>
              <p className="text-sm text-slate-500">Response Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-0" data-testid="stat-platforms">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                <Badge variant="secondary" className="bg-purple-50 text-purple-600">
                  Connected
                </Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {connectedPlatforms.length}
              </p>
              <p className="text-sm text-slate-500">Platforms</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Public Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-8"
        >
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Reviews
              </CardTitle>
              <Link to="/reviews">
                <Button variant="ghost" size="sm" className="text-sky-600">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No public reviews yet.</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {connectedPlatforms.length === 0 
                      ? "Connect your platforms to start collecting reviews."
                      : "Reviews will appear here once customers start leaving feedback."}
                  </p>
                </div>
              ) : (
                reviews.slice(0, 5).map((review, index) => (
                  <motion.div
                    key={review.review_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all"
                    data-testid={`review-item-${index}`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.author_avatar} />
                      <AvatarFallback className="bg-sky-100 text-sky-600">
                        {review.author_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-slate-900">
                          {review.author_name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPlatformBadge(review.platform)}`}
                        >
                          {review.platform}
                        </Badge>
                        {getSentimentIcon(review.sentiment)}
                      </div>
                      {/* Review Date */}
                      {review.created_at && (
                        <div className="flex items-center gap-1 mb-1.5 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatReviewDate(review.created_at)}</span>
                        </div>
                      )}
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {review.text}
                      </p>
                      {review.response && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Responded
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Private Feedback Alert */}
          {privateReviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card className="border-2 border-red-200 bg-red-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-700">
                    <Lock className="w-5 h-5" />
                    Private Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600 mb-4">
                    You have {privateReviews.length} private feedback(s) from customers 
                    who rated below 4 stars. Review and follow up!
                  </p>
                  <Link to="/reviews?filter=private">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl border-red-300 text-red-700 hover:bg-red-100"
                    >
                      View Private Feedback
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Sentiment Orb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-0" data-testid="sentiment-orb-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Sentiment Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center sentiment-orb mb-4">
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-900">
                        {analytics?.sentiment_breakdown?.positive || 0}
                      </p>
                      <p className="text-xs text-slate-500">Positive</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-600">
                      {analytics?.sentiment_breakdown?.positive || 0} Positive
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-600">
                      {analytics?.sentiment_breakdown?.negative || 0} Negative
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/integrations" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                    data-testid="quick-action-integrations"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Connect Platforms
                  </Button>
                </Link>
                <Link to="/qr-generator" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                    data-testid="quick-action-qr"
                  >
                    <Sparkles className="w-5 h-5 mr-3" />
                    Generate QR Code
                  </Button>
                </Link>
                <Link to="/reviews" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                    data-testid="quick-action-reviews"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Respond to Reviews
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.platform}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        platform.platform === "google" ? "bg-blue-100" : "bg-indigo-100"
                      }`}>
                        {platform.platform === "google" ? (
                          <span className="text-blue-600 font-bold text-xs">G</span>
                        ) : (
                          <span className="text-indigo-600 font-bold text-xs">f</span>
                        )}
                      </div>
                      <span className="font-medium text-slate-700 capitalize">
                        {platform.platform}
                      </span>
                    </div>
                    <Badge
                      variant={platform.status === "connected" ? "default" : "secondary"}
                      className={
                        platform.status === "connected"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }
                    >
                      {platform.status === "connected" ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
