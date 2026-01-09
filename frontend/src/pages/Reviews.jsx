import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  Filter,
  Sparkles,
  Send,
  X,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Reviews() {
  const { business } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    platform: "all",
    sentiment: "all",
    responded: "all",
  });

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.platform !== "all") params.append("platform", filters.platform);
        if (filters.sentiment !== "all") params.append("sentiment", filters.sentiment);
        if (filters.responded === "yes") params.append("responded", "true");
        if (filters.responded === "no") params.append("responded", "false");

        const response = await axios.get(`${API}/reviews?${params.toString()}`, {
          withCredentials: true,
        });
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.platform !== "all") params.append("platform", filters.platform);
      if (filters.sentiment !== "all") params.append("sentiment", filters.sentiment);
      if (filters.responded === "yes") params.append("responded", "true");
      if (filters.responded === "no") params.append("responded", "false");

      const response = await axios.get(`${API}/reviews?${params.toString()}`, {
        withCredentials: true,
      });
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (tone = "professional") => {
    if (!selectedReview) return;

    setGeneratingAI(true);
    try {
      const response = await axios.post(
        `${API}/ai/generate-response`,
        {
          review_text: selectedReview.text,
          rating: selectedReview.rating,
          business_name: business?.name || "Our Business",
          tone: tone,
        },
        { withCredentials: true }
      );

      setResponseText(response.data.response);
      if (response.data.fallback) {
        toast.info("Using template response (AI temporarily unavailable)");
      } else {
        toast.success("AI response generated!");
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to generate AI response");
    } finally {
      setGeneratingAI(false);
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/reviews/${selectedReview.review_id}/respond`,
        {
          review_id: selectedReview.review_id,
          response_text: responseText,
        },
        { withCredentials: true }
      );

      toast.success("Response saved successfully!");
      setSelectedReview(null);
      setResponseText("");
      fetchReviews();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to save response");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reviews-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
            Review Inbox
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and respond to all your reviews in one place.
          </p>
        </div>
        <Badge variant="secondary" className="bg-sky-50 text-sky-600 w-fit">
          {reviews.length} Reviews
        </Badge>
      </div>

      {/* Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <Select
              value={filters.platform}
              onValueChange={(value) =>
                setFilters({ ...filters, platform: value })
              }
            >
              <SelectTrigger className="w-36 h-10 rounded-xl" data-testid="filter-platform">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sentiment}
              onValueChange={(value) =>
                setFilters({ ...filters, sentiment: value })
              }
            >
              <SelectTrigger className="w-36 h-10 rounded-xl" data-testid="filter-sentiment">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.responded}
              onValueChange={(value) =>
                setFilters({ ...filters, responded: value })
              }
            >
              <SelectTrigger className="w-36 h-10 rounded-xl" data-testid="filter-responded">
                <SelectValue placeholder="Response" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Responded</SelectItem>
                <SelectItem value="no">Not Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Reviews Found
              </h3>
              <p className="text-slate-500">
                Connect your platforms to start collecting reviews, or adjust
                your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="glass-card border-0 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedReview(review);
                    setResponseText(review.response || "");
                  }}
                  data-testid={`review-card-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.author_avatar} />
                        <AvatarFallback className="bg-sky-100 text-sky-600">
                          {review.author_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="font-semibold text-slate-900">
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
                          {review.response && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700 text-xs"
                            >
                              Responded
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-700">{review.text}</p>
                        {review.response && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-sky-400">
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Your Response:
                            </p>
                            <p className="text-slate-700 text-sm">
                              {review.response}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Response Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => {
          setSelectedReview(null);
          setResponseText("");
        }}
      >
        <DialogContent className="max-w-2xl" data-testid="response-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-500" />
              Respond to Review
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6">
              {/* Review Preview */}
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedReview.author_avatar} />
                    <AvatarFallback className="bg-sky-100 text-sky-600">
                      {selectedReview.author_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
                      {selectedReview.author_name}
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i <= selectedReview.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-700">{selectedReview.text}</p>
              </div>

              {/* AI Generation Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-slate-500 self-center mr-2">
                  Generate with AI:
                </span>
                {["professional", "friendly", "apologetic"].map((tone) => (
                  <Button
                    key={tone}
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIResponse(tone)}
                    disabled={generatingAI}
                    className="rounded-full capitalize"
                    data-testid={`ai-tone-${tone}`}
                  >
                    {generatingAI ? (
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-1" />
                    )}
                    {tone}
                  </Button>
                ))}
              </div>

              {/* Response Textarea */}
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response..."
                className="min-h-32 rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-100"
                data-testid="response-textarea"
              />

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText("");
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || submitting}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                  data-testid="submit-response-btn"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Save Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
