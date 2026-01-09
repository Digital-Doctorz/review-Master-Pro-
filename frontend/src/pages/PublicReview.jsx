import { useState, useEffect } from "react";
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
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PublicReview() {
  const { qrCodeId } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    author_name: "",
    rating: 0,
    text: "",
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await axios.get(`${API}/public/business/${qrCodeId}`);
        setBusiness(response.data);
      } catch (error) {
        console.error("Error fetching business:", error);
        setError("Business not found");
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [qrCodeId]);

  const fetchBusiness = async () => {
    try {
      const response = await axios.get(`${API}/public/business/${qrCodeId}`);
      setBusiness(response.data);
    } catch (error) {
      console.error("Error fetching business:", error);
      setError("Business not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.author_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!formData.text.trim()) {
      toast.error("Please write your review");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/public/review`, {
        business_id: business.business_id,
        author_name: formData.author_name,
        rating: formData.rating,
        text: formData.text,
      });

      setSubmitted(true);
      toast.success("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Business Not Found
          </h1>
          <p className="text-slate-600">
            The QR code you scanned may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      {/* Background Decoration */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-8 shadow-2xl text-center"
              data-testid="review-success"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Thank You!
              </h1>
              <p className="text-slate-600 mb-6">
                Your review has been submitted successfully. We appreciate your
                feedback!
              </p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i <= formData.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8 shadow-2xl"
              data-testid="review-form"
            >
              {/* Business Header */}
              <div className="text-center mb-8">
                {business?.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {business?.name}
                </h1>
                <p className="text-slate-500">{business?.category}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    How was your experience?
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="p-1 transition-transform hover:scale-110"
                        data-testid={`star-${star}`}
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hoveredStar || formData.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 hover:text-amber-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {formData.rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-slate-500 mt-2"
                    >
                      {formData.rating === 5 && "Excellent!"}
                      {formData.rating === 4 && "Great!"}
                      {formData.rating === 3 && "Good"}
                      {formData.rating === 2 && "Fair"}
                      {formData.rating === 1 && "Poor"}
                    </motion.p>
                  )}
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.author_name}
                    onChange={(e) =>
                      setFormData({ ...formData, author_name: e.target.value })
                    }
                    className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-100"
                    placeholder="John Doe"
                    data-testid="reviewer-name-input"
                    required
                  />
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <Label htmlFor="review" className="text-slate-700">
                    Your Review
                  </Label>
                  <Textarea
                    id="review"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    className="min-h-32 rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-100"
                    placeholder="Tell us about your experience..."
                    data-testid="review-text-input"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                  data-testid="submit-review-btn"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  Submit Review
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Powered by{" "}
                  <span className="font-semibold text-sky-500">ReviewFlow</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
