import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User,
  Heart,
  ThumbsUp,
  Zap,
  Check,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Confetti component for 5-star celebration
const Confetti = ({ active }) => {
  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  
  // Pre-generate confetti pieces with stable deterministic values
  const confettiPieces = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: (i * 17 + 23) % 100,
      rotate: (i * 37) % 720 - 360,
      xOffset: ((i * 13) % 200) - 100,
      duration: 2 + (i % 20) / 10,
      delay: (i % 10) / 20,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , []);
  
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: `${piece.left}%`,
            top: -20,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: [1, 1, 0],
            rotate: piece.rotate,
            x: piece.xOffset,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Google icon component
const GoogleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook icon component
const FacebookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Swiggy icon component
const SwiggyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect fill="#FC8019" width="24" height="24" rx="4"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">S</text>
  </svg>
);

// Zomato icon component
const ZomatoIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect fill="#E23744" width="24" height="24" rx="4"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">Z</text>
  </svg>
);

// Progress indicator
const ProgressSteps = ({ currentStep, totalSteps, isPrivate }) => {
  const steps = isPrivate 
    ? ["Rate", "Feedback", "Contact", "Done"]
    : ["Rate", "Write", "Share", "Done"];
  
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.slice(0, totalSteps).map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        
        return (
          <div key={label} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : isActive
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-slate-100 text-slate-400"
              }`}
              initial={false}
              animate={{ scale: isActive ? 1.1 : 1 }}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </motion.div>
            {index < steps.slice(0, totalSteps).length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${isCompleted ? "bg-emerald-500" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function PublicReview() {
  const { qrCodeId } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Multi-step flow state
  const [step, setStep] = useState(1);
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
  const [showConfetti, setShowConfetti] = useState(false);
  
  const textareaRef = useRef(null);

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

  // Handle rating selection with celebration for 5 stars
  const handleRatingSelect = (star) => {
    setRating(star);
    if (star === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    // Auto-advance after short delay
    setTimeout(() => setStep(2), 500);
  };

  const generateAIReview = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/public/ai/write-assist`, {
        rating,
        business_name: business?.name || "this business",
        keywords: null
      });
      setReviewText(response.data.review_text);
      toast.success("✨ AI generated a review for you!");
      // Focus textarea for editing
      textareaRef.current?.focus();
    } catch (err) {
      console.error("AI error:", err);
      toast.error("Could not generate review. Please write your own.");
    } finally {
      setAiLoading(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!reviewText.trim()) {
      toast.error("Please write something first, then enhance with AI");
      return;
    }
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/public/ai/write-assist`, {
        rating,
        business_name: business?.name || "this business",
        keywords: reviewText.substring(0, 100)
      });
      setReviewText(response.data.review_text);
      toast.success("✨ Review enhanced!");
    } catch (err) {
      toast.error("Enhancement failed. Your review is great as is!");
    } finally {
      setAiLoading(false);
    }
  };

  const copyReviewToClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(reviewText);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = reviewText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success("Review copied! Now paste it on the app");
      setTimeout(() => setCopied(false), 10000);
      return true;
    } catch (err) {
      // Show the review text for manual copy
      toast.error("Please select and copy the review text manually");
      return false;
    }
  }, [reviewText]);

  // Deep link automation - copy review and open app in one tap
  const handleDeepLinkAutomation = useCallback(async (platform) => {
    // First, copy the review to clipboard
    const copied = await copyReviewToClipboard();
    if (!copied) return;

    // Get the platform link
    const link = getPlatformReviewLink(platform);
    if (!link) {
      toast.error(`No ${platform} link configured for this business`);
      return;
    }

    // Detect if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Platform-specific handling
    if (platform === "swiggy") {
      // Swiggy deep link - try app first, then web
      if (isMobile) {
        // Try to open Swiggy app with the restaurant link
        const swiggyAppLink = link.replace("https://www.swiggy.com", "swiggy://");
        
        if (isAndroid) {
          // Android intent URL for better app detection
          const intentUrl = `intent://www.swiggy.com${new URL(link).pathname}#Intent;scheme=https;package=in.swiggy.android;end`;
          window.location.href = intentUrl;
        } else if (isIOS) {
          // iOS - try swiggy:// scheme first
          window.location.href = swiggyAppLink;
          // Fallback to web after delay if app not installed
          setTimeout(() => {
            window.open(link, "_blank");
          }, 2500);
        }
      } else {
        // Desktop - open web
        window.open(link, "_blank");
      }
      toast.success("Opening Swiggy... Paste your review there! 📋", { duration: 5000 });
    } 
    else if (platform === "zomato") {
      // Zomato deep link
      if (isMobile) {
        // Extract restaurant slug from URL for deep link
        const zomatoAppLink = link.replace("https://www.zomato.com", "zomato://");
        
        if (isAndroid) {
          // Android intent URL
          const intentUrl = `intent://www.zomato.com${new URL(link).pathname}#Intent;scheme=https;package=com.application.zomato;end`;
          window.location.href = intentUrl;
        } else if (isIOS) {
          // iOS - try zomato:// scheme
          window.location.href = zomatoAppLink;
          setTimeout(() => {
            window.open(link, "_blank");
          }, 2500);
        }
      } else {
        // Desktop - open web
        window.open(link, "_blank");
      }
      toast.success("Opening Zomato... Paste your review there! 📋", { duration: 5000 });
    }
    else if (platform === "google") {
      // Google reviews - direct web link works best
      window.open(link, "_blank");
      toast.success("Opening Google Reviews... Paste your review! 📋", { duration: 5000 });
    }
    else if (platform === "facebook") {
      // Facebook - add /reviews if needed
      let finalLink = link;
      if (!link.includes("/reviews")) {
        finalLink = `${link.replace(/\/$/, "")}/reviews`;
      }
      window.open(finalLink, "_blank");
      toast.success("Opening Facebook... Paste your review! 📋", { duration: 5000 });
    }

    // Mark as copied for UI feedback
    setCopied(true);
  }, [copyReviewToClipboard, getPlatformReviewLink]);

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

      // For high ratings with Google/Facebook, go to Copy & Go step (4)
      // For high ratings with direct or low ratings, go to success (4 for low, 5 for high direct)
      if (rating >= 4 && selectedPlatform && selectedPlatform !== "direct") {
        setStep(4); // Copy & Go step
      } else {
        setStep(rating >= 4 ? 5 : 4); // Success step
      }
      toast.success("Thank you for your feedback! 🙏");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformReviewLink = (platform) => {
    if (platform === "google") {
      return business?.google_review_link || business?.platforms?.google?.review_link;
    }
    if (platform === "facebook") {
      // Check multiple possible locations for Facebook review link
      return business?.facebook_page_url 
        || business?.platforms?.facebook?.review_link 
        || business?.platforms?.facebook?.page_url;
    }
    if (platform === "swiggy") {
      return business?.swiggy_link || business?.platforms?.swiggy?.review_link;
    }
    if (platform === "zomato") {
      return business?.zomato_link || business?.platforms?.zomato?.review_link;
    }
    return null;
  };

  const openPlatformReview = (platform) => {
    const link = getPlatformReviewLink(platform);
    if (link) {
      // For Facebook, append /reviews if not already there
      let finalLink = link;
      if (platform === "facebook" && !link.includes("/reviews")) {
        finalLink = `${link.replace(/\/$/, "")}/reviews`;
      }
      window.open(finalLink, "_blank");
    }
  };

  const getRatingEmoji = (r) => {
    const emojis = { 1: "😞", 2: "😐", 3: "🙂", 4: "😊", 5: "🤩" };
    return emojis[r] || "";
  };

  const getRatingText = (r) => {
    const texts = {
      1: "We're sorry to hear that",
      2: "We'll do better",
      3: "Thanks for the feedback",
      4: "Glad you liked it!",
      5: "You're amazing!"
    };
    return texts[r] || "";
  };

  const getRatingColor = (r) => {
    if (r >= 4) return "text-emerald-500";
    if (r === 3) return "text-amber-500";
    return "text-rose-500";
  };

  const isPrivateFeedback = rating > 0 && rating < 4;
  const totalSteps = isPrivateFeedback ? 4 : 4;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <motion.div 
          className="bg-white rounded-3xl p-8 text-center max-w-md shadow-xl border border-slate-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-600">This review link may be invalid or expired.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <Confetti active={showConfetti} />
      
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
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
              data-testid="review-step-1"
            >
              {/* Business Header */}
              <div className="text-center mb-8">
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <Star className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {business?.name}
                </h1>
                <p className="text-slate-500">{business?.category}</p>
              </div>

              {/* Rating Selection */}
              <div className="text-center">
                <p className="text-lg font-medium text-slate-700 mb-6">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => handleRatingSelect(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 focus:outline-none"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`star-${star}`}
                    >
                      <Star
                        className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-200 ${
                          star <= (hoveredStar || rating)
                            ? "fill-amber-400 text-amber-400 drop-shadow-lg"
                            : "text-slate-200 hover:text-amber-200"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                
                <AnimatePresence>
                  {(hoveredStar > 0 || rating > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <span className="text-4xl mb-2 block">{getRatingEmoji(hoveredStar || rating)}</span>
                      <span className={`font-semibold ${getRatingColor(hoveredStar || rating)}`}>
                        {getRatingText(hoveredStar || rating)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Write Review / Feedback */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
              data-testid="review-step-2"
            >
              <ProgressSteps currentStep={2} totalSteps={totalSteps} isPrivate={isPrivateFeedback} />
              
              {/* Rating Display */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
                <span className="ml-2 text-2xl">{getRatingEmoji(rating)}</span>
              </div>

              {isPrivateFeedback ? (
                // Private Feedback UI (< 4 stars)
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      We value your honest feedback
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      Your feedback will be sent privately to help us improve.
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">What can we do better?</Label>
                    <Textarea
                      ref={textareaRef}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Please share your concerns so we can improve..."
                      className="min-h-[120px] rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      data-testid="review-text"
                    />
                  </div>
                </div>
              ) : (
                // Public Review UI (>= 4 stars)
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-emerald-800 text-sm font-medium flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      Thank you for the great rating!
                    </p>
                    <p className="text-emerald-700 text-sm mt-1">
                      Would you mind sharing your experience publicly?
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-700 font-medium">Your Review</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={reviewText ? enhanceWithAI : generateAIReview}
                        disabled={aiLoading}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full"
                        data-testid="ai-assist-btn"
                      >
                        {aiLoading ? (
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-1" />
                        )}
                        {reviewText ? "Enhance" : "AI Write"}
                      </Button>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share what you loved about your experience..."
                      className="min-h-[120px] rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      data-testid="review-text"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      💡 Tip: Click &quot;AI Write&quot; to generate a review, or write your own and click &quot;Enhance&quot;
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!reviewText.trim()}
                  className="flex-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                  data-testid="next-step-btn"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Contact Info (Private) OR Platform Selection (Public) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
              data-testid="review-step-3"
            >
              <ProgressSteps currentStep={3} totalSteps={totalSteps} isPrivate={isPrivateFeedback} />
              
              {isPrivateFeedback ? (
                // Contact Info for Private Feedback
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Your Contact Info</h2>
                    <p className="text-slate-500 text-sm mt-1">So we can follow up and make things right</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                      <User className="w-4 h-4" /> Your Name *
                    </Label>
                    <Input
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter your name"
                      className="rounded-xl h-12 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                      data-testid="author-name"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </Label>
                    <Input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="rounded-xl h-12 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                      data-testid="author-email"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone
                    </Label>
                    <Input
                      type="tel"
                      value={authorPhone}
                      onChange={(e) => setAuthorPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="rounded-xl h-12 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                      data-testid="author-phone"
                    />
                  </div>
                  
                  <p className="text-xs text-slate-400 text-center">
                    * Please provide at least email or phone for follow-up
                  </p>
                </div>
              ) : (
                // Platform Selection for Public Reviews
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Share Your Review</h2>
                    <p className="text-slate-500 text-sm mt-1">Choose where to post your {rating}-star review</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                      <User className="w-4 h-4" /> Your Name
                    </Label>
                    <Input
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter your name"
                      className="rounded-xl h-12 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                      data-testid="author-name"
                    />
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <p className="text-sm font-medium text-slate-700">Post your review on:</p>
                    
                    {/* Google Option */}
                    {(business?.google_review_link || business?.platforms?.google?.review_link) && (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedPlatform("google")}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          selectedPlatform === "google"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/50"
                        }`}
                        whileTap={{ scale: 0.98 }}
                        data-testid="platform-google"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <GoogleIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">Google Reviews</p>
                          <p className="text-sm text-slate-500">Recommended for local visibility</p>
                        </div>
                        {selectedPlatform === "google" && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        )}
                      </motion.button>
                    )}
                    
                    {/* Facebook Option */}
                    {(business?.facebook_page_url || business?.platforms?.facebook?.review_link) && (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedPlatform("facebook")}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          selectedPlatform === "facebook"
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                        }`}
                        whileTap={{ scale: 0.98 }}
                        data-testid="platform-facebook"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <FacebookIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">Facebook</p>
                          <p className="text-sm text-slate-500">Great for social reach</p>
                        </div>
                        {selectedPlatform === "facebook" && (
                          <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                        )}
                      </motion.button>
                    )}

                    {/* Swiggy Option */}
                    {(business?.swiggy_link || business?.platforms?.swiggy?.review_link) && (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedPlatform("swiggy")}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          selectedPlatform === "swiggy"
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-200 hover:border-orange-200 hover:bg-orange-50/50"
                        }`}
                        whileTap={{ scale: 0.98 }}
                        data-testid="platform-swiggy"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <SwiggyIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">Swiggy</p>
                          <p className="text-sm text-slate-500">Order &amp; rate on Swiggy</p>
                        </div>
                        {selectedPlatform === "swiggy" && (
                          <CheckCircle2 className="w-6 h-6 text-orange-500" />
                        )}
                      </motion.button>
                    )}

                    {/* Zomato Option */}
                    {(business?.zomato_link || business?.platforms?.zomato?.review_link) && (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedPlatform("zomato")}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          selectedPlatform === "zomato"
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 hover:border-red-200 hover:bg-red-50/50"
                        }`}
                        whileTap={{ scale: 0.98 }}
                        data-testid="platform-zomato"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <ZomatoIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">Zomato</p>
                          <p className="text-sm text-slate-500">Rate on Zomato</p>
                        </div>
                        {selectedPlatform === "zomato" && (
                          <CheckCircle2 className="w-6 h-6 text-red-500" />
                        )}
                      </motion.button>
                    )}
                    
                    {/* Direct/Skip Option */}
                    <motion.button
                      type="button"
                      onClick={() => setSelectedPlatform("direct")}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        selectedPlatform === "direct"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                      whileTap={{ scale: 0.98 }}
                      data-testid="platform-direct"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Send Directly</p>
                        <p className="text-sm text-slate-500">Submit to business only</p>
                      </div>
                      {selectedPlatform === "direct" && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !authorName.trim() || (isPrivateFeedback && !authorEmail && !authorPhone)}
                  className="flex-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                  data-testid="submit-review-btn"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {isPrivateFeedback ? "Send Feedback" : "Continue"}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Copy & Go (Public Reviews Only) */}
          {step === 4 && !isPrivateFeedback && selectedPlatform !== "direct" && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
              data-testid="review-step-4"
            >
              <ProgressSteps currentStep={4} totalSteps={totalSteps} isPrivate={false} />
              
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                  selectedPlatform === "swiggy" ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                  selectedPlatform === "zomato" ? "bg-gradient-to-br from-red-400 to-red-600" :
                  "bg-gradient-to-br from-emerald-400 to-teal-500"
                }`}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Post Your Review!</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {selectedPlatform === "swiggy" ? "2 simple steps to share on Swiggy" :
                   selectedPlatform === "zomato" ? "2 simple steps to share on Zomato" :
                   selectedPlatform === "google" ? "2 simple steps to share on Google" : 
                   "2 simple steps to share on Facebook"}
                </p>
              </div>
              
              {/* Review Preview */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  ))}
                </div>
                <p className="text-slate-700 text-sm">{reviewText}</p>
              </div>
              
              {/* Step by Step Instructions */}
              <div className="space-y-4 mb-6">
                {/* Step 1: Copy */}
                <div className={`rounded-xl p-4 border ${
                  selectedPlatform === "swiggy" ? "bg-orange-50 border-orange-100" :
                  selectedPlatform === "zomato" ? "bg-red-50 border-red-100" :
                  "bg-blue-50 border-blue-100"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0 ${
                      selectedPlatform === "swiggy" ? "bg-orange-600" :
                      selectedPlatform === "zomato" ? "bg-red-600" :
                      "bg-blue-600"
                    }`}>1</span>
                    <h3 className={`font-semibold ${
                      selectedPlatform === "swiggy" ? "text-orange-900" :
                      selectedPlatform === "zomato" ? "text-red-900" :
                      "text-blue-900"
                    }`}>Copy your review</h3>
                  </div>
                  <Button
                    onClick={copyReviewToClipboard}
                    variant={copied ? "default" : "outline"}
                    className={`w-full rounded-xl h-12 ${copied ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                    data-testid="copy-review-btn"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Review Copied! Ready to paste
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Tap to Copy Review
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Step 2: Open & Paste */}
                <div className={`rounded-xl p-4 border ${copied ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-8 h-8 rounded-full ${copied ? "bg-indigo-600" : "bg-slate-400"} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>2</span>
                    <h3 className={`font-semibold ${copied ? "text-indigo-900" : "text-slate-500"}`}>
                      Open {selectedPlatform === "google" ? "Google" : selectedPlatform === "facebook" ? "Facebook" : selectedPlatform === "swiggy" ? "Swiggy" : "Zomato"} & paste
                    </h3>
                  </div>
                  <Button
                    onClick={() => openPlatformReview(selectedPlatform)}
                    disabled={!copied}
                    className={`w-full rounded-xl h-12 ${copied 
                      ? selectedPlatform === "swiggy" 
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                        : selectedPlatform === "zomato"
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                    data-testid="open-platform-btn"
                  >
                    {selectedPlatform === "google" ? <GoogleIcon className="w-5 h-5 mr-2" /> : 
                     selectedPlatform === "facebook" ? <FacebookIcon className="w-5 h-5 mr-2" /> :
                     selectedPlatform === "swiggy" ? <SwiggyIcon className="w-5 h-5 mr-2" /> :
                     <ZomatoIcon className="w-5 h-5 mr-2" />}
                    {copied ? (
                      <>
                        Open {selectedPlatform === "google" ? "Google Reviews" : 
                              selectedPlatform === "facebook" ? "Facebook" : 
                              selectedPlatform === "swiggy" ? "Swiggy" : "Zomato"} →
                      </>
                    ) : (
                      "Copy review first"
                    )}
                  </Button>
                  {copied && (
                    <p className={`text-xs text-center mt-2 ${
                      selectedPlatform === "swiggy" ? "text-orange-600" :
                      selectedPlatform === "zomato" ? "text-red-600" :
                      "text-indigo-600"
                    }`}>
                      {selectedPlatform === "swiggy" || selectedPlatform === "zomato" 
                        ? "Open the app and rate your experience!"
                        : "Paste your review in the text box and submit!"}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setStep(5)}
                className="w-full text-slate-500"
              >
                I&apos;ve posted my review →
              </Button>
            </motion.div>
          )}

          {/* STEP 5: Success */}
          {(step === 5 || (step === 4 && (isPrivateFeedback || selectedPlatform === "direct"))) && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center"
              data-testid="review-success"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isPrivateFeedback ? "Feedback Received!" : "Thank You!"}
              </h2>
              <p className="text-slate-600 mb-6">
                {isPrivateFeedback 
                  ? `${business?.name} will review your feedback and reach out soon.`
                  : `Your support means the world to ${business?.name}!`}
              </p>
              
              {!isPrivateFeedback && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-indigo-700 text-sm font-medium">
                    🌟 Reviews like yours help small businesses grow!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Powered By Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Powered by <span className="font-medium text-slate-500">Review Master</span>
        </p>
      </motion.div>
    </div>
  );
}
