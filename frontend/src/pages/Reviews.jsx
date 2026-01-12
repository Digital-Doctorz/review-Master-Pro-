import { useState, useEffect, useContext, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Star,
  MessageSquare,
  RefreshCw,
  Filter,
  Sparkles,
  Send,
  Lock,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { ReviewCard } from "../components/ReviewCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Reviews() {
  const { business } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [privateReviews, setPrivateReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("filter") === "private" ? "private" : "public");
  const [filters, setFilters] = useState({
    platform: "all",
    sentiment: "all",
    responded: "all",
  });

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.platform !== "all") params.append("platform", filters.platform);
      if (filters.sentiment !== "all") params.append("sentiment", filters.sentiment);
      if (filters.responded === "yes") params.append("responded", "true");
      if (filters.responded === "no") params.append("responded", "false");
      params.append("is_private", "false");

      const [publicRes, privateRes] = await Promise.all([
        axios.get(`${API}/reviews?${params.toString()}`, { withCredentials: true }).catch((err) => {
          console.error("Public reviews fetch error:", err?.response?.data || err.message);
          return { data: [] };
        }),
        axios.get(`${API}/reviews/private`, { withCredentials: true }).catch((err) => {
          console.error("Private reviews fetch error:", err?.response?.data || err.message);
          return { data: [] };
        }),
      ]);

      setReviews(Array.isArray(publicRes.data) ? publicRes.data : []);
      setPrivateReviews(Array.isArray(privateRes.data) ? privateRes.data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
  };

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
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-sky-50 text-sky-600">
            {reviews.length} Public
          </Badge>
          {privateReviews.length > 0 && (
            <Badge variant="secondary" className="bg-red-50 text-red-600">
              {privateReviews.length} Private
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Public Reviews
            <Badge variant="secondary" className="ml-1 bg-slate-200">{reviews.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Private Feedback
            {privateReviews.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">{privateReviews.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Public Reviews Tab */}
        <TabsContent value="public" className="space-y-4">
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
                    No Public Reviews Found
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
                  <ReviewCard 
                    key={review.review_id} 
                    review={review} 
                    index={index} 
                    onClick={() => handleReviewClick(review)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </TabsContent>

        {/* Private Feedback Tab */}
        <TabsContent value="private" className="space-y-4">
          {/* Info Banner */}
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Private Feedback</p>
                  <p className="text-sm text-amber-700">
                    These are reviews from customers who rated below 4 stars. 
                    They were directed to provide private feedback instead of posting publicly.
                    Use their contact info to follow up and resolve issues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Private Reviews List */}
          <div className="space-y-4">
            {privateReviews.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <Lock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Private Feedback
                  </h3>
                  <p className="text-slate-500">
                    Great news! You don&apos;t have any private feedback from unhappy customers.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {privateReviews.map((review, index) => (
                  <ReviewCard 
                    key={review.review_id} 
                    review={review} 
                    index={index} 
                    isPrivate 
                    onClick={() => handleReviewClick(review)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
              {selectedReview?.is_private ? "Respond to Private Feedback" : "Respond to Review"}
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
                
                {/* Contact info for private */}
                {selectedReview.is_private && (selectedReview.author_email || selectedReview.author_phone) && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-medium mb-2">Customer Contact</p>
                    <div className="flex flex-wrap gap-4">
                      {selectedReview.author_email && (
                        <a href={`mailto:${selectedReview.author_email}`} className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                          <Mail className="w-4 h-4" />
                          {selectedReview.author_email}
                        </a>
                      )}
                      {selectedReview.author_phone && (
                        <a href={`tel:${selectedReview.author_phone}`} className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                          <Phone className="w-4 h-4" />
                          {selectedReview.author_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
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
