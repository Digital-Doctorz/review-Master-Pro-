import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Star,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
  sky: "#0ea5e9",
  teal: "#14b8a6",
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const defaultAnalytics = { 
        average_rating: 0, 
        total_reviews: 0, 
        response_rate: 0, 
        positive_ratio: 0, 
        sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 }, 
        platform_breakdown: {},
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
      
      const [overviewRes, trendsRes] = await Promise.all([
        axios.get(`${API}/analytics/overview`, { withCredentials: true }).catch((err) => {
          console.error("Analytics overview fetch error:", err?.displayMessage || err?.message);
          return { data: defaultAnalytics };
        }),
        axios.get(`${API}/analytics/trends?days=30`, { withCredentials: true }).catch((err) => {
          console.error("Analytics trends fetch error:", err?.displayMessage || err?.message);
          return { data: [] };
        }),
      ]);

      // Safely extract analytics data with defaults
      const analytics = overviewRes?.data || defaultAnalytics;
      if (!analytics.sentiment_breakdown) {
        analytics.sentiment_breakdown = { positive: 0, neutral: 0, negative: 0 };
      }
      if (!analytics.platform_breakdown) {
        analytics.platform_breakdown = {};
      }
      if (!analytics.rating_distribution) {
        analytics.rating_distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      }

      setAnalytics(analytics);
      setTrends(Array.isArray(trendsRes?.data) ? trendsRes.data : []);
    } catch (error) {
      console.error("Error fetching analytics:", error?.displayMessage || error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const sentimentData = analytics
    ? [
        { name: "Positive", value: analytics.sentiment_breakdown.positive, color: COLORS.positive },
        { name: "Neutral", value: analytics.sentiment_breakdown.neutral, color: COLORS.neutral },
        { name: "Negative", value: analytics.sentiment_breakdown.negative, color: COLORS.negative },
      ]
    : [];

  const ratingData = analytics?.rating_distribution
    ? Object.entries(analytics.rating_distribution).map(([rating, count]) => ({
        rating: `${rating} Star`,
        count: count || 0,
      }))
    : [];

  const platformData = analytics?.platform_breakdown
    ? Object.entries(analytics.platform_breakdown)
        .filter(([, count]) => count > 0)
        .map(([platform, count]) => ({
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          value: count,
        }))
    : [];

  return (
    <div className="space-y-8" data-testid="analytics-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
          Analytics & Insights
        </h1>
        <p className="text-slate-600 mt-1">
          Track your review performance and customer sentiment over time.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-0" data-testid="metric-total-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-6 h-6 text-sky-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics?.total_reviews || 0}
              </p>
              <p className="text-sm text-slate-500">Total Reviews</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-0" data-testid="metric-avg-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics?.average_rating || 0}
              </p>
              <p className="text-sm text-slate-500">Average Rating</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-0" data-testid="metric-response-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
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
          <Card className="glass-card border-0" data-testid="metric-positive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <ThumbsUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics?.sentiment_breakdown?.positive || 0}
              </p>
              <p className="text-sm text-slate-500">Positive Reviews</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-500" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratingData.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ratingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="rating" type="category" stroke="#64748b" width={60} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No rating data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                Sentiment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentData.some((d) => d.value > 0) ? (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {sentimentData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-600">{item.name}</span>
                        <Badge variant="secondary" className="bg-slate-100">
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No sentiment data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Review Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              Review Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ fill: "#0ea5e9" }}
                    name="Reviews"
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_rating"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ fill: "#14b8a6" }}
                    name="Avg Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No trend data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Breakdown */}
      {platformData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Reviews by Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {platformData.map((platform, index) => (
                  <div
                    key={platform.name}
                    className="p-4 rounded-xl bg-slate-50 text-center"
                  >
                    <p className="text-2xl font-bold text-slate-900">
                      {platform.value}
                    </p>
                    <p className="text-sm text-slate-500">{platform.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
