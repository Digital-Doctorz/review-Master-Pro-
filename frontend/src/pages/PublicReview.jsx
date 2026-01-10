import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  Star,
  Send,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Copy,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Google icon component
const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook icon component
const FacebookIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function PublicReview() {
  const { qrCodeId } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Multi-step flow state
  const [step, setStep] = useState(1); // 1: Rate, 2: Write, 3: Choose Platform, 4: Copy & Go, 5: Success
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorPhone, setAuthorPhone] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await axios.get(`${API}/public/business/${qrCodeId}`);
        setBusiness(response.data);
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("Business not found");
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [qrCodeId]);

  const generateAIReview = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/write-assist`, {
        rating,
        business_name: business?.name || "this business",
        keywords: null
      });
      setReviewText(response.data.review_text);
      toast.success("AI generated a review for you!");
    } catch (err) {
      console.error("AI error:", err);
      toast.error("Could not generate review. Please write your own.");
    } finally {
      setAiLoading(false);
    }
  };

  const copyReviewToClipboard = useCallback(() => {
    navigator.clipboard.writeText(reviewText);
    setCopied(true);
    toast.success("Review copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  }, [reviewText]);

  const handleSubmitReview = async () => {
    if (!authorName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    // For low ratings, require contact info
    if (rating < 4 && !authorEmail && !authorPhone) {
      toast.error("Please provide your email or phone so we can follow up");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/public/review`, {
        business_id: business.business_id,
        author_name: authorName,
        author_email: authorEmail || null,
        author_phone: authorPhone || null,
        rating,
        text: reviewText,
        platform_choice: selectedPlatform || "direct"
      });

      setStep(5);
      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformReviewLink = (platform) => {
    if (platform === "google" && business?.google_review_link) {
      return business.google_review_link;
    }
    if (platform === "facebook" && business?.platforms?.facebook?.review_link) {
      return business.platforms.facebook.review_link;
    }
    return null;
  };

  const openPlatformReview = (platform) => {
    const link = getPlatformReviewLink(platform);
    if (link) {
      window.open(link, "_blank");
    }
  };

  const getRatingText = (r) => {
    const texts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Great",
      5: "Excellent!"
    };
    return texts[r] || "";
  };

  const getRatingEmoji = (r) => {
    const emojis = { 1: "😞", 2: "😐", 3: "🙂", 4: "😊", 5: "🤩" };
    return emojis[r] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg p-6">
        <div className="glass-deep rounded-3xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Business Not Found</h1>
          <p className="text-slate-600">The QR code you scanned may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {/* STEP 1: Star Rating */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-deep rounded-3xl p-8"
              data-testid="review-step-1"
            >
              {/* Business Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight-custom mb-1">
                  {business?.name}
                </h1>
                <p className="text-slate-500">{business?.category}</p>
              </div>

              {/* Rating Selection */}
              <div className="text-center mb-8">
                <p className="text-lg font-medium text-slate-700 mb-6">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-all hover:scale-110"
                      data-testid={`star-${star}`}
                    >
                      <Star
                        className={`w-12 h-12 transition-all ${
                          star <= (hoveredStar || rating)
                            ? "fill-amber-400 text-amber-400 star-animate"
                            : "text-slate-200 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-3xl">{getRatingEmoji(rating)}</span>
                    <span className="text-lg font-semibold text-slate-700">
                      {getRatingText(rating)}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Continue Button */}
              <Button
                onClick={() => setStep(2)}
                disabled={rating === 0}
                className="w-full h-14 rounded-2xl text-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="continue-to-step-2"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Write Review */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-deep rounded-3xl p-8"
              data-testid="review-step-2"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tell us more</h2>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-2 mb-4">
                <Label className="text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Name
                </Label>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white"
                  data-testid="author-name-input"
                />
              </div>

              {/* Contact Info for Low Ratings */}
              {rating < 4 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <p className="text-sm text-amber-800 font-medium">
                    We&apos;d love to make things right. Please share your contact info so we can follow up.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-xl border-slate-200 bg-white/80"
                      data-testid="author-email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone (optional)
                    </Label>
                    <Input
                      type="tel"
                      value={authorPhone}
                      onChange={(e) => setAuthorPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-12 rounded-xl border-slate-200 bg-white/80"
                      data-testid="author-phone-input"
                    />
                  </div>
                </motion.div>
              )}

              {/* Review Text */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700">Your Review</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateAIReview}
                    disabled={aiLoading}
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                    data-testid="ai-write-btn"
                  >
                    {aiLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI Write for me
                  </Button>
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="min-h-32 rounded-xl border-slate-200 bg-white/50 focus:bg-white resize-none"
                  data-testid="review-text-input"
                />
              </div>

              {/* Continue Button */}
              <Button
                onClick={() => {
                  if (rating < 4) {
                    // Low ratings go directly to submit (private feedback)
                    handleSubmitReview();
                  } else {
                    // High ratings get platform choice
                    setStep(3);
                  }
                }}
                disabled={!authorName.trim() || !reviewText.trim() || submitting}
                className="w-full h-14 rounded-2xl text-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white btn-glow"
                data-testid="continue-to-step-3"
              >
                {submitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : rating < 4 ? (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Feedback
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Choose Platform (Only for 4+ stars) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-deep rounded-3xl p-8"
              data-testid="review-step-3"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Share your review</h2>
                  <p className="text-sm text-slate-500">Choose where to post</p>
                </div>
              </div>

              {/* Platform Options */}
              <div className="space-y-3 mb-6">
                {/* Google Option */}
                {business?.platforms?.google?.connected && (
                  <button
                    onClick={() => {
                      setSelectedPlatform("google");
                      setStep(4);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 hover:border-blue-400 hover:bg-blue-50 ${
                      selectedPlatform === "google" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                    data-testid="platform-google"
                  >
                    <GoogleIcon />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-900">Post on Google</p>
                      <p className="text-sm text-slate-500">Help others find great businesses</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                )}

                {/* Facebook Option */}
                {business?.platforms?.facebook?.connected && (
                  <button
                    onClick={() => {
                      setSelectedPlatform("facebook");
                      setStep(4);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 hover:border-indigo-400 hover:bg-indigo-50 ${
                      selectedPlatform === "facebook" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"
                    }`}
                    data-testid="platform-facebook"
                  >
                    <FacebookIcon />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-900">Post on Facebook</p>
                      <p className="text-sm text-slate-500">Share with your network</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                )}

                {/* Direct Feedback Option */}
                <button
                  onClick={() => {
                    setSelectedPlatform("direct");
                    handleSubmitReview();
                  }}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-white transition-all flex items-center gap-4 hover:border-teal-400 hover:bg-teal-50"
                  data-testid="platform-direct"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">Send to {business?.name}</p>
                    <p className="text-sm text-slate-500">Private feedback only</p>
                  </div>
                  <Send className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Copy & Go to Platform */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-deep rounded-3xl p-8"
              data-testid="review-step-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep(3)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Almost there!</h2>
                  <p className="text-sm text-slate-500">Copy your review first</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sky-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sky-900">Copy your review below</p>
                    <p className="text-sm text-sky-700">Click the copy button to save it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sky-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sky-900">Paste on {selectedPlatform === "google" ? "Google" : "Facebook"}</p>
                    <p className="text-sm text-sky-700">You&apos;ll be redirected to the review page</p>
                  </div>
                </div>
              </div>

              {/* Review Preview */}
              <div className="relative mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{reviewText}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReviewToClipboard}
                  className={`absolute top-2 right-2 ${copied ? "bg-green-50 text-green-600 border-green-200" : ""}`}
                  data-testid="copy-review-btn"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Go to Platform Button */}
              <Button
                onClick={() => {
                  handleSubmitReview();
                  openPlatformReview(selectedPlatform);
                }}
                disabled={submitting}
                className={`w-full h-14 rounded-2xl text-lg text-white ${
                  selectedPlatform === "google"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                data-testid="go-to-platform-btn"
              >
                {submitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Open {selectedPlatform === "google" ? "Google" : "Facebook"} Reviews
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-slate-400 mt-4">
                Your review is also saved to {business?.name}&apos;s dashboard
              </p>
            </motion.div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-deep rounded-3xl p-8 text-center"
              data-testid="review-success"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
              <p className="text-slate-600 mb-6">
                {rating < 4
                  ? "We appreciate your honest feedback. Our team will review it and reach out to you soon."
                  : "Your review has been submitted. Thank you for helping others!"}
              </p>
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Powered by <span className="font-semibold text-sky-500">ReviewFlow</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
