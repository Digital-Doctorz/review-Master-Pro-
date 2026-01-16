import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Lock,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

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

export const ReviewCard = ({ review, index, isPrivate = false, onClick }) => (
  <motion.div
    key={review.review_id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Card
      className={`glass-card border-0 hover:shadow-lg transition-all cursor-pointer ${
        isPrivate ? "border-l-4 border-l-red-400" : ""
      }`}
      onClick={onClick}
      data-testid={`review-card-${index}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={review.author_avatar} />
            <AvatarFallback className="bg-sky-100 text-sky-600">
              {review.author_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="font-semibold text-slate-900">
                {review.author_name || "Anonymous"}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs ${getPlatformBadge(review.platform)}`}
              >
                {review.platform || "direct"}
              </Badge>
              {isPrivate && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
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
            
            {/* Review Date/Time */}
            {review.created_at && (
              <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatReviewDate(review.created_at)}</span>
              </div>
            )}
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= (review.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-700">{review.text || ""}</p>
            
            {/* Contact info for private reviews */}
            {isPrivate && (review.author_email || review.author_phone) && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-2">Customer Contact</p>
                <div className="space-y-1">
                  {review.author_email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${review.author_email}`} className="hover:text-sky-600">
                        {review.author_email}
                      </a>
                    </div>
                  )}
                  {review.author_phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${review.author_phone}`} className="hover:text-sky-600">
                        {review.author_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
);

export default ReviewCard;
