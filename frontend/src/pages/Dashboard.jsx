import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const { user, business } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, reviewsRes, platformsRes] = await Promise.all([
        axios.get(`${API}/analytics/overview`, { withCredentials: true }),
        axios.get(`${API}/reviews?limit=5`, { withCredentials: true }),
        axios.get(`${API}/platforms`, { withCredentials: true }),
      ]);

      setAnalytics(analyticsRes.data);
      setReviews(reviewsRes.data);
      setPlatforms(platformsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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
      direct: "bg-teal-100 text-teal-700",
    };
    return colors[platform] || "bg-slate-100 text-slate-700";
  };

  const connectedPlatforms = platforms.filter((p) => p.status === "connected");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-600 mt-1">
            Here&apos;s how {business?.name} is performing today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 live-indicator" />
          Live Dashboard
        </div>
      </div>

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
        {/* Recent Reviews */}
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
                  <p className="text-slate-500">No reviews yet.</p>
                  <p className="text-sm text-slate-400">
                    Connect your platforms to start collecting reviews.
                  </p>
                </div>
              ) : (
                reviews.map((review, index) => (
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">
                          {review.author_name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPlatformBadge(
                            review.platform
                          )}`}
                        >
                          {review.platform}
                        </Badge>
                        {getSentimentIcon(review.sentiment)}
                      </div>
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
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
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
        </div>
      </div>
    </div>
  );
}
