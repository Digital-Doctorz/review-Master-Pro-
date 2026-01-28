import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { AnimatedLogo } from "../components/AnimatedLogo";
import {
  Star,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  TrendingUp,
  Crown,
  Rocket,
  Building2,
  BadgeCheck,
  Clock,
  Gift,
  ThumbsUp,
  Eye,
  Bell,
  Globe,
  X,
  Play,
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Google Icon
const GoogleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook Icon
const FacebookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Landing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setIsLoggedIn(true);
        setCurrentUser(response.data);
      } catch {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  const handlePlanSelection = async (planKey) => {
    if (isLoggedIn) {
      // User is logged in - upgrade their plan directly
      setUpgrading(true);
      try {
        await axios.post(
          `${API}/user/plan/upgrade`,
          { plan_name: planKey, billing_cycle: billingCycle },
          { withCredentials: true }
        );
        toast.success(`Successfully upgraded to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan!`);
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to upgrade plan');
      } finally {
        setUpgrading(false);
      }
    } else {
      // User not logged in - store plan and redirect to auth
      sessionStorage.setItem('selected_plan', planKey);
      handleGoogleLogin();
    }
  };

  const handleDemoMode = () => {
    // Set demo mode in session storage
    sessionStorage.setItem('demo_mode', 'true');
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Zap,
      title: "60-Second Setup",
      description: "Connect Google & Facebook instantly. Just paste your review link - no API keys needed.",
      color: "from-amber-400 to-orange-500",
    },
    {
      icon: MessageSquare,
      title: "AI Smart Replies",
      description: "Generate perfect responses in seconds. Professional, friendly, or apologetic - your choice.",
      color: "from-sky-400 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Reputation Shield",
      description: "Low ratings (1-3 stars) go directly to your inbox - not public. Fix issues privately.",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: QrCode,
      title: "Magic QR Codes",
      description: "Print QR codes for tables, receipts, or counters. Customers review in 30 seconds.",
      color: "from-violet-400 to-purple-500",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Track sentiment trends, response rates, and platform performance in real-time.",
      color: "from-pink-400 to-rose-500",
    },
    {
      icon: Sparkles,
      title: "AI Review Writer",
      description: "Customers can use AI to write reviews. More reviews, less friction.",
      color: "from-indigo-400 to-blue-500",
    },
  ];

  const stats = [
    { value: "50K+", label: "Reviews Managed" },
    { value: "2,500+", label: "Happy Businesses" },
    { value: "4.9", label: "Average Rating" },
    { value: "98%", label: "Response Rate" },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Owner, Sunrise Cafe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
      text: "Review Master changed everything. We went from 3.8 to 4.6 stars in just 2 months! The ROI is incredible.",
      rating: 5,
    },
    {
      name: "Rahul Patel",
      role: "Manager, Downtown Diner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
      text: "The private feedback feature is genius. We fix issues before they become public complaints. Worth every rupee!",
      rating: 5,
    },
    {
      name: "Anita Desai",
      role: "Owner, Bella Salon",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anita",
      text: "Setup took literally 60 seconds. Now I respond to reviews from my phone. My Google rating jumped from 4.1 to 4.7!",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      icon: Rocket,
      price: billingCycle === "monthly" ? 499 : 399,
      originalPrice: billingCycle === "monthly" ? 999 : 799,
      reviews: 100,
      color: "from-sky-500 to-cyan-500",
      badge: null,
      features: [
        "100 reviews/month",
        "1 business location",
        "Google Reviews integration",
        "QR code generator",
        "AI review responses",
        "Email notifications",
        "Basic analytics",
      ],
      cta: "Try Now",
      planKey: "starter",
    },
    {
      name: "Growth",
      icon: TrendingUp,
      price: billingCycle === "monthly" ? 999 : 799,
      originalPrice: billingCycle === "monthly" ? 1999 : 1599,
      reviews: 500,
      color: "from-violet-500 to-purple-600",
      badge: "BEST SAVINGS",
      features: [
        "500 reviews/month",
        "3 business locations",
        "Google + Facebook integration",
        "Swiggy & Zomato integration",
        "Unlimited QR codes",
        "AI review responses",
        "Priority email + WhatsApp alerts",
        "Advanced analytics & reports",
        "Private feedback inbox",
        "Custom branding",
      ],
      cta: "Try Now",
      planKey: "growth",
    },
    {
      name: "Enterprise",
      icon: Building2,
      price: billingCycle === "monthly" ? 2499 : 1999,
      originalPrice: billingCycle === "monthly" ? 4999 : 3999,
      reviews: "Unlimited",
      color: "from-amber-500 to-orange-500",
      badge: null,
      features: [
        "Unlimited reviews",
        "Unlimited locations",
        "All platforms (Google, Facebook, Swiggy, Zomato)",
        "Unlimited QR codes",
        "AI review responses",
        "Dedicated account manager",
        "Custom analytics dashboard",
        "API access",
        "White-label option",
        "Priority 24/7 support",
      ],
      cta: "Try All Features",
      planKey: "enterprise",
    },
  ];

  return (
    <div className="min-h-screen animated-bg overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <AnimatedLogo size="default" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
          </div>
          <Button
            onClick={handleDemoMode}
            className="rounded-full px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white btn-glow"
            data-testid="nav-demo-btn"
          >
            <Play className="w-4 h-4 mr-2" />
            See A Demo
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Limited Offer Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-medium mb-6 animate-pulse">
                <Gift className="w-4 h-4" />
                Limited Time: 50% OFF All Plans!
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Turn Every Review Into
                <span className="block text-gradient">₹10,000+ Revenue</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                Join <span className="font-bold text-indigo-600">2,500+ businesses</span> already using Review Master. 
                Collect reviews from <span className="font-semibold">Google, Facebook, Swiggy & Zomato</span> with one-click setup, 
                AI-powered responses, and smart routing for negative feedback.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleDemoMode}
                  size="lg"
                  className="rounded-full px-8 py-7 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white btn-glow hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="hero-demo-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  See A Demo
                </Button>
                <Button
                  onClick={handleGoogleLogin}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-7 text-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="hero-cta-btn"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">7-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">Cancel anytime</span>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 font-bold text-slate-900">4.9/5</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    from <span className="font-semibold">2,500+</span> happy businesses
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Main Dashboard Card */}
              <div className="glass-deep rounded-3xl p-6 shadow-2xl border border-white/20">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">Dashboard Overview</h3>
                    <p className="text-sm text-slate-500">Real-time performance</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Total Reviews", value: "1,284", change: "+12%", color: "text-sky-600", bg: "bg-sky-50" },
                    { label: "Avg Rating", value: "4.7", change: "+0.3", color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Response Rate", value: "98%", change: "+5%", color: "text-emerald-600", bg: "bg-emerald-50" },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl ${stat.bg}`}>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Platform Status */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 flex-wrap">
                  <div className="flex items-center gap-2">
                    <GoogleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium text-slate-700">Google</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <FacebookIcon className="w-5 h-5" />
                    <span className="text-sm font-medium text-slate-700">Facebook</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Swiggy</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Zomato</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>

                {/* Recent Review */}
                <div className="p-4 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">New Review - Just now</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">5★</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">Sarah J.</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        &quot;Absolutely fantastic experience! The food was amazing and service was top-notch. Will definitely come back!&quot;
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Reply
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">+23%</p>
                    <p className="text-xs text-slate-500">Rating improved</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute -top-4 -right-4 glass-card rounded-2xl p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Instant Alert</p>
                    <p className="text-xs text-slate-500">New review!</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-slate-600 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Critical Role of Online Reviews Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 via-white to-indigo-50/30" data-testid="reviews-stats-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-32"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                <BarChart3 className="w-4 h-4" />
                Industry Statistics
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                The Critical Role of
                <span className="block text-gradient">Online Reviews</span>
              </h2>
              
              <div className="space-y-5 text-slate-600 leading-relaxed text-lg">
                <p>
                  Online reviews are a <span className="font-semibold text-indigo-600">powerful tool</span> for any business. They directly impact sales, trust, and serve as a critical factor in reputation management.
                </p>
                <p>
                  Encouraging customers to leave reviews and engaging with their feedback can <span className="font-semibold text-indigo-600">significantly enhance</span> your credibility and attract more customers.
                </p>
              </div>
              
              {/* CTA Button */}
              <Button
                onClick={handleDemoMode}
                size="lg"
                className="mt-8 rounded-full px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                See How It Works
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Right Content - Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    percentage: "78%",
                    text: "of consumers trust online reviews as much as recommendations from friends and family.",
                    gradient: "from-indigo-500 to-purple-500",
                    bg: "bg-indigo-50"
                  },
                  {
                    percentage: "93%",
                    text: "of users have made buying decisions based upon an online review.",
                    gradient: "from-violet-500 to-purple-600",
                    bg: "bg-violet-50"
                  },
                  {
                    percentage: "81%",
                    text: "of consumers use Google to evaluate local businesses, making it the most influential review site.",
                    gradient: "from-sky-500 to-indigo-500",
                    bg: "bg-sky-50"
                  },
                  {
                    percentage: "31%",
                    text: "of consumers read more than 10 reviews before their trust is formed.",
                    gradient: "from-emerald-500 to-teal-500",
                    bg: "bg-emerald-50"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`${stat.bg} rounded-2xl p-6 border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                    data-testid={`review-stat-card-${index}`}
                  >
                    <p className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-4`}>
                      {stat.percentage}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">{stat.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 relative overflow-hidden" data-testid="grow-faster-section">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - App Flow Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="flex flex-col items-center gap-6">
                {/* Step 1 - SMS */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Automated SMS</p>
                      <p className="text-xs text-slate-500">Sent after visit</p>
                    </div>
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Step 1</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
                    &quot;Hi! Thank you for visiting us today. We&apos;d love to hear about your experience. Tap here to leave a quick review!&quot;
                  </p>
                </motion.div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-white/30" />
                </div>

                {/* Step 2 - Rating Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">Rate Experience</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">Step 2</span>
                  </div>
                  <p className="text-center text-sm text-slate-600 mb-4">How was your experience?</p>
                  <div className="flex gap-3 justify-center">
                    <button className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Positive
                    </button>
                    <button className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors">
                      <Shield className="w-4 h-4" />
                      Private
                    </button>
                  </div>
                </motion.div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-white/30" />
                </div>

                {/* Step 3 - Platform Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">Choose Platform</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 font-medium">Step 3</span>
                  </div>
                  <p className="text-center text-xs text-slate-500 mb-4">Where would you like to leave your review?</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center border-2 border-indigo-200 hover:border-indigo-400 cursor-pointer transition-colors">
                      <GoogleIcon className="w-6 h-6" />
                    </div>
                    <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center border-2 border-slate-200 hover:border-indigo-400 cursor-pointer transition-colors">
                      <FacebookIcon className="w-6 h-6" />
                    </div>
                    <div className="aspect-square rounded-xl bg-orange-500 flex items-center justify-center border-2 border-orange-400">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <div className="aspect-square rounded-xl bg-red-500 flex items-center justify-center border-2 border-red-400">
                      <span className="text-white text-sm font-bold">Z</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Content - Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2 text-white"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/20">
                <Rocket className="w-4 h-4" />
                How It Works
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
                We help you grow
                <span className="block text-white/90">faster and better</span>
              </h2>
              
              <p className="text-lg text-white/80 leading-relaxed mb-4">
                If you&apos;re struggling with negative feedback affecting your business growth, <span className="font-bold text-white">Review Master</span> is here to help.
              </p>
              
              <p className="text-white/70 leading-relaxed mb-10">
                Manage your online presence, route negative feedback privately, and boost your credibility with positive reviews on the platforms that matter most.
              </p>
              
              {/* Benefits List */}
              <div className="space-y-4 mb-10">
                {[
                  { icon: Eye, text: "Monitor your reputation in real-time" },
                  { icon: Shield, text: "Route negative feedback privately" },
                  { icon: TrendingUp, text: "Boost ratings with positive reviews" },
                  { icon: BadgeCheck, text: "Build trust and credibility" }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleGoogleLogin}
                  size="lg"
                  className="rounded-full px-8 py-6 bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all"
                  data-testid="grow-section-cta"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={handleDemoMode}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-semibold transition-all"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Screenshots Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white/50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4"
            >
              <Eye className="w-4 h-4" />
              See It In Action
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Powerful Dashboard,
              <span className="block text-gradient">Simple Interface</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage reviews in one beautiful dashboard
            </p>
          </div>

          {/* Dashboard Preview Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Analytics Dashboard</h3>
                  <p className="text-xs text-slate-500">Track your growth</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">This Month</span>
                  <span className="font-bold text-emerald-600">+127 reviews</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Avg Rating</span>
                  <span className="font-bold text-amber-600">4.7 ★</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Response Time</span>
                  <span className="font-bold text-sky-600">2 mins</span>
                </div>
              </div>
            </motion.div>

            {/* Reviews Management Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Review Management</h3>
                  <p className="text-xs text-slate-500">All reviews in one place</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Amit K.", stars: 5, text: "Best restaurant in town!" },
                  { name: "Neha S.", stars: 4, text: "Great food, nice ambiance" },
                  { name: "Raj P.", stars: 5, text: "Amazing experience!" },
                ].map((review, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900">{review.name}</span>
                      <div className="flex">
                        {[...Array(review.stars)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* QR Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">QR Code Generator</h3>
                  <p className="text-xs text-slate-500">Easy review collection</p>
                </div>
              </div>
              <div className="text-center p-6 rounded-xl bg-slate-50">
                <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 mb-2">Scan to leave a review</p>
                <Button size="sm" className="rounded-lg">Download QR</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4"
            >
              Everything you need to
              <span className="block text-gradient">dominate reviews</span>
            </motion.h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for business owners who want results, not complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all group"
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-white to-indigo-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-medium mb-4"
            >
              <Gift className="w-4 h-4" />
              Limited Time: 50% OFF All Plans!
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle - Fixed Alignment */}
            <div className="inline-flex items-center justify-center gap-3 p-1.5 rounded-full bg-slate-100 mb-12">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === "yearly" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => {
              const isGrowth = plan.name === "Growth";
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-8 ${
                  isGrowth
                    ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-2xl shadow-violet-500/30 md:scale-105 ring-4 ring-violet-300/30"
                    : "glass-card hover:shadow-xl transition-shadow"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    isGrowth ? "bg-amber-400 text-amber-900" : "bg-indigo-600 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isGrowth ? "text-white" : "text-slate-900"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${isGrowth ? "text-violet-200" : "text-slate-500"}`}>
                      {plan.reviews} reviews/month
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl sm:text-4xl font-bold ${isGrowth ? "text-white" : "text-slate-900"}`}>
                      ₹{plan.price}
                    </span>
                    <span className={`text-sm ${isGrowth ? "text-violet-200" : "text-slate-500"}`}>/month</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm line-through ${isGrowth ? "text-violet-300" : "text-slate-400"}`}>
                      ₹{plan.originalPrice}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isGrowth ? "bg-amber-400 text-amber-900" : "bg-emerald-100 text-emerald-700"
                    } font-semibold`}>
                      50% OFF
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isGrowth ? "text-emerald-300" : "text-emerald-500"
                      }`} />
                      <span className={`text-sm ${isGrowth ? "text-violet-100" : "text-slate-600"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanSelection(plan.planKey)}
                  disabled={upgrading}
                  className={`w-full rounded-xl py-5 sm:py-6 font-semibold text-base transition-all ${
                    isGrowth
                      ? "bg-white text-violet-700 hover:bg-violet-50 shadow-lg"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                  } ${upgrading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-testid={`pricing-cta-${index}`}
                >
                  {upgrading ? 'Processing...' : (isLoggedIn ? `Upgrade to ${plan.name}` : plan.cta)}
                  {!upgrading && <ArrowRight className="w-4 h-4 ml-2 inline" />}
                </Button>
              </motion.div>
            )})}
          </div>

          {/* Money Back Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 border border-emerald-200">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800 font-medium">30-Day Money-Back Guarantee</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Loved by 2,500+ Business Owners
            </h2>
            <p className="text-lg text-slate-600">See why businesses are switching to Review Master</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.avatar} alt="" className="w-14 h-14 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed">&quot;{testimonial.text}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-deep rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                Offer Ends Soon - Don&apos;t Miss Out!
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Start Growing Your Reviews Today
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
                Join 2,500+ businesses already using Review Master. 
                <span className="font-bold text-indigo-600"> Start your free trial now!</span>
              </p>
              
              <Button
                onClick={handleGoogleLogin}
                size="lg"
                className="rounded-full px-10 py-7 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white btn-glow hover:-translate-y-0.5 active:translate-y-0"
                data-testid="cta-start-btn"
              >
                Start Free Trial - ₹0 Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  7-day free trial
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Review Master</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The #1 review management platform for local businesses. Turn customer feedback into growth.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <Globe className="w-5 h-5 text-slate-400" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <Users className="w-5 h-5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors text-sm">Testimonials</a></li>
                <li><button onClick={handleDemoMode} className="text-slate-400 hover:text-white transition-colors text-sm">Live Demo</button></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Terms of Service</a></li>
                <li><a href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"><Lock className="w-4 h-4" />Privacy Policy</a></li>
                <li><a href="/refund" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"><Shield className="w-4 h-4" />Refund Policy</a></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-4">
                <li>
                  <a href="tel:+919555955595" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">+91-9555-9555-95</p>
                      <p className="text-xs text-slate-500">Mon-Sat, 9am-6pm IST</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="mailto:trademeindia.sales@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">trademeindia.sales@gmail.com</p>
                      <p className="text-xs text-slate-500">Sales & Support</p>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">India</p>
                      <p className="text-xs text-slate-500">Serving businesses worldwide</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 Review Master. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-600">Trusted by 2,500+ businesses</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-slate-500 ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
