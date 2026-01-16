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
  Clock,
} from "lucide-react";
import { ReviewCard } from "../components/ReviewCard";

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
    
    // For older dates, show formatted date with time
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return "";
  }
};

// Demo reviews data
const DEMO_REVIEWS = [
  {
    review_id: "demo_r1",
    author_name: "Sarah Johnson",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    platform: "google",
    rating: 5,
    text: "Absolutely fantastic experience! The food was amazing and service was top-notch. Will definitely come back!",
    sentiment: "positive",
    response: "Thank you Sarah! We're thrilled you enjoyed your visit. See you again soon!",
    created_at: new Date().toISOString()
  },
  {
    review_id: "demo_r2",
    author_name: "Rahul Mehta",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    platform: "facebook",
    rating: 5,
    text: "Best coffee in town! The ambiance is perfect for work meetings. Highly recommend the cold brew.",
    sentiment: "positive",
    response: null,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    review_id: "demo_r3",
    author_name: "Anita Kumar",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anita",
    platform: "google",
    rating: 4,
    text: "Great food but parking was a bit difficult. Otherwise a lovely experience!",
    sentiment: "positive",
    response: "Thank you Anita! We're working on improving parking options. Appreciate your feedback!",
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    review_id: "demo_r4",
    author_name: "Vikram Singh",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    platform: "google",
    rating: 5,
    text: "The chai latte here is exceptional! Staff is very friendly and the place has good vibes.",
    sentiment: "positive",
    response: null,
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    review_id: "demo_r5",
    author_name: "Priya Sharma",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    platform: "facebook",
    rating: 3,
    text: "Food was okay but took too long to arrive. Hope they improve the wait time.",
    sentiment: "neutral",
    response: "Thank you for your feedback Priya. We're working on reducing wait times!",
    created_at: new Date(Date.now() - 345600000).toISOString()
  }
];

const DEMO_PRIVATE_REVIEWS = [
  {
    review_id: "demo_pr1",
    author_name: "Anonymous Customer",
    platform: "direct",
    rating: 2,
    text: "The food was cold when it arrived. Disappointed with the service today.",
    sentiment: "negative",
    contact_email: "customer@example.com",
    contact_phone: "+919876543210",
    is_private: true,
    created_at: new Date(Date.now() - 100000000).toISOString()
  },
  {
    review_id: "demo_pr2",
    author_name: "Feedback User",
    platform: "direct",
    rating: 3,
    text: "Average experience. The wait time was too long and the staff seemed overwhelmed.",
    sentiment: "neutral",
    contact_email: "feedback@example.com",
    contact_phone: "+919123456789",
    is_private: true,
    created_at: new Date(Date.now() - 200000000).toISOString()
  }
];

export default function Reviews() {
  const { business, isDemo } = useContext(AuthContext);
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
    // In demo mode, use demo data
    if (isDemo) {
      setReviews(DEMO_REVIEWS);
      setPrivateReviews(DEMO_PRIVATE_REVIEWS);
      setLoading(false);
      return;
    }
    
    try {
      const params = new URLSearchParams();
      if (filters.platform !== "all") params.append("platform", filters.platform);
      if (filters.sentiment !== "all") params.append("sentiment", filters.sentiment);
      if (filters.responded === "yes") params.append("responded", "true");
      if (filters.responded === "no") params.append("responded", "false");
      params.append("is_private", "false");

      const [publicRes, privateRes] = await Promise.all([
        axios.get(`${API}/reviews?${params.toString()}`, { withCredentials: true }).catch((err) => {
          console.warn("Public reviews fetch error:", err?.displayMessage || err?.message);
          return { data: [] };
        }),
        axios.get(`${API}/reviews/private`, { withCredentials: true }).catch((err) => {
          console.warn("Private reviews fetch error:", err?.displayMessage || err?.message);
          return { data: [] };
        }),
      ]);

      setReviews(Array.isArray(publicRes?.data) ? publicRes.data : []);
      setPrivateReviews(Array.isArray(privateRes?.data) ? privateRes.data : []);
    } catch (error) {
      console.warn("Error fetching reviews:", error?.displayMessage || error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters, isDemo]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const generateAIResponse = async (tone = "professional") => {
    if (!selectedReview) return;
    
    // In demo mode, return a sample response
    if (isDemo) {
      setGeneratingAI(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const demoResponses = {
        professional: "Thank you for taking the time to share your feedback. We truly value your input and are committed to providing the best experience possible. We hope to see you again soon!",
        friendly: "Thanks so much for your kind words! 😊 We're thrilled you had a great experience with us. Can't wait to see you again!",
        formal: "Dear Valued Customer, Thank you for your thoughtful review. Your feedback is invaluable to us. We remain committed to excellence and look forward to serving you again."
      };
      setResponseText(demoResponses[tone] || demoResponses.professional);
      setGeneratingAI(false);
      return;
    }

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
      // For demo mode, show success without API call
      if (isDemo) {
        toast.success("Demo: Response would be posted to " + selectedReview.platform);
        setSelectedReview(null);
        setResponseText("");
        return;
      }

      // Post response to the correct platform
      const response = await axios.post(
        `${API}/reviews/${selectedReview.review_id}/respond`,
        {
          review_id: selectedReview.review_id,
          response_text: responseText,
          platform: selectedReview.platform,
        },
        { withCredentials: true }
      );

      // Show success with platform-specific message
      if (response.data.posted_live) {
        toast.success(`Response posted live on ${selectedReview.platform.charAt(0).toUpperCase() + selectedReview.platform.slice(1)}!`);
      } else {
        toast.success("Response saved! Will be posted when connected to " + selectedReview.platform);
      }

      setSelectedReview(null);
      setResponseText("");
      fetchReviews();
    } catch (error) {
      console.warn("Error submitting response:", error?.displayMessage || error?.message);
      toast.error("Failed to save response");
    } finally {
      setSubmitting(false);
    }
  };

  // Send reply via WhatsApp for direct/private reviews
  const sendWhatsAppReply = (review) => {
    if (!review.contact_phone || !responseText.trim()) {
      toast.error("No WhatsApp number available for this reviewer");
      return;
    }
    
    // Format phone number (remove spaces, add country code if needed)
    let phone = review.contact_phone.replace(/\s/g, '').replace(/[^0-9+]/g, '');
    if (!phone.startsWith('+')) {
      phone = '+91' + phone; // Default to India country code
    }
    
    // Encode message
    const message = encodeURIComponent(responseText);
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success("Opening WhatsApp to send reply...");
  };

  // Send reply via Email for direct/private reviews
  const sendEmailReply = (review) => {
    if (!review.contact_email || !responseText.trim()) {
      toast.error("No email available for this reviewer");
      return;
    }
    
    const subject = encodeURIComponent(`Re: Your feedback for ${business?.name || 'our business'}`);
    const body = encodeURIComponent(responseText);
    
    // Open default email client
    const mailtoUrl = `mailto:${review.contact_email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    
    toast.success("Opening email client to send reply...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
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
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {selectedReview.author_name}
                    </p>
                    <div className="flex items-center gap-3">
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
                      {selectedReview.created_at && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatReviewDate(selectedReview.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-slate-700">{selectedReview.text}</p>
                
                {/* Contact info for private */}
                {selectedReview.is_private && (selectedReview.contact_email || selectedReview.contact_phone) && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-medium mb-2">Customer Contact</p>
                    <div className="flex flex-wrap gap-4">
                      {selectedReview.contact_email && (
                        <a href={`mailto:${selectedReview.contact_email}`} className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                          <Mail className="w-4 h-4" />
                          {selectedReview.contact_email}
                        </a>
                      )}
                      {selectedReview.contact_phone && (
                        <a href={`tel:${selectedReview.contact_phone}`} className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                          <Phone className="w-4 h-4" />
                          {selectedReview.contact_phone}
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
                className="min-h-32 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-100"
                data-testid="response-textarea"
              />

              {/* Actions - Different for public vs private reviews */}
              <div className="space-y-4">
                {/* For Private/Direct Reviews - Show WhatsApp and Email options */}
                {selectedReview.is_private && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-3">
                      Reply directly to customer via:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {selectedReview.contact_phone && (
                        <Button
                          onClick={() => sendWhatsAppReply(selectedReview)}
                          disabled={!responseText.trim()}
                          className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          Send via WhatsApp
                        </Button>
                      )}
                      {selectedReview.contact_email && (
                        <Button
                          onClick={() => sendEmailReply(selectedReview)}
                          disabled={!responseText.trim()}
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send via Email
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Standard actions - Post to Platform (for public) or Save (for all) */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
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
                  
                  {/* For Public Reviews - Post to platform */}
                  {!selectedReview.is_private && (
                    <Button
                      onClick={submitResponse}
                      disabled={!responseText.trim() || submitting}
                      className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      data-testid="submit-response-btn"
                    >
                      {submitting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Post to {selectedReview.platform.charAt(0).toUpperCase() + selectedReview.platform.slice(1)}
                    </Button>
                  )}
                  
                  {/* For Private Reviews - Just Save */}
                  {selectedReview.is_private && (
                    <Button
                      onClick={submitResponse}
                      disabled={!responseText.trim() || submitting}
                      variant="outline"
                      className="rounded-xl"
                      data-testid="save-response-btn"
                    >
                      {submitting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Save Response
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
