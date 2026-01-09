import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
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
} from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export default function Landing() {
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  const features = [
    {
      icon: Zap,
      title: "Zero-Knowledge Setup",
      description:
        "Connect your Google and Facebook reviews in under 3 minutes. No technical skills required.",
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Responses",
      description:
        "Generate professional, personalized responses to reviews with a single click using AI.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track your reputation with sentiment analysis, rating trends, and performance insights.",
    },
    {
      icon: QrCode,
      title: "QR Code Reviews",
      description:
        "Generate custom QR codes for customers to leave reviews directly from their phones.",
    },
    {
      icon: Shield,
      title: "Reputation Shield",
      description:
        "Get instant alerts for negative reviews so you can respond before it's too late.",
    },
    {
      icon: Sparkles,
      title: "Smart Insights",
      description:
        "AI-generated insights help you understand what customers love and what needs improvement.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight-custom">
              ReviewFlow
            </span>
          </div>
          <Button
            onClick={handleGoogleLogin}
            className="rounded-full px-6 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white shadow-lg shadow-sky-500/20"
            data-testid="nav-login-btn"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background Decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Review Management
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight-custom leading-tight mb-6">
                Turn Reviews Into
                <span className="block bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
                  Business Growth
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                The simplest way to manage your Google and Facebook reviews.
                Set up in minutes, respond with AI, and watch your reputation
                soar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGoogleLogin}
                  size="lg"
                  className="rounded-full px-8 py-6 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:-translate-y-0.5"
                  data-testid="hero-cta-btn"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 border-slate-200 hover:bg-slate-50"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-slate-100">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
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
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">500+</span> businesses trust
                    ReviewFlow
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card rounded-3xl p-6 shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Your Dashboard
                    </h3>
                    <p className="text-sm text-slate-500">Today's overview</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 live-indicator" />
                    Live
                  </div>
                </div>

                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total Reviews", value: "1,284" },
                    { label: "Avg Rating", value: "4.7" },
                    { label: "Response Rate", value: "98%" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-xl p-4 text-center"
                    >
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mock Review */}
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">
                          Sarah J.
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        "&quot;Absolutely fantastic experience! The service was
                        exceptional...&quot;"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">+23%</p>
                    <p className="text-xs text-slate-500">Rating improved</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight-custom mb-4"
            >
              Everything You Need to
              <span className="block">Manage Your Reputation</span>
            </motion.h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed for busy business owners. No technical
              knowledge required.
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
                className="rounded-3xl bg-slate-50 p-8 hover:bg-white hover:shadow-xl hover:border-sky-100 border border-transparent transition-all group"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-200/30 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight-custom mb-4">
                Ready to Transform Your Reviews?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
                Join 500+ businesses already using ReviewFlow to manage their
                online reputation effortlessly.
              </p>
              <Button
                onClick={handleGoogleLogin}
                size="lg"
                className="rounded-full px-8 py-6 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:-translate-y-0.5"
                data-testid="cta-start-btn"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-slate-500 mt-4">
                No credit card required. Setup takes 3 minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">ReviewFlow</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 ReviewFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
