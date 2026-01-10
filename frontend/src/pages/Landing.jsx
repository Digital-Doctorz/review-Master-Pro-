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
  Play,
  Users,
  TrendingUp,
} from "lucide-react";

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
      title: "3-Minute Setup",
      description: "Connect Google & Facebook in minutes. Just search your business name - we do the rest.",
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
    { value: "10K+", label: "Reviews Managed" },
    { value: "500+", label: "Happy Businesses" },
    { value: "4.9", label: "Average Rating" },
    { value: "98%", label: "Response Rate" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, Sunrise Cafe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      text: "ReviewFlow changed everything. We went from 3.8 to 4.6 stars in just 2 months!",
    },
    {
      name: "Mike Johnson",
      role: "Manager, Downtown Diner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      text: "The private feedback feature is genius. We fix issues before they become public complaints.",
    },
    {
      name: "Emily Rodriguez",
      role: "Owner, Bella Salon",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      text: "Setup took literally 3 minutes. Now I respond to reviews from my phone in seconds.",
    },
  ];

  return (
    <div className="min-h-screen animated-bg overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight-custom">
              ReviewFlow
            </span>
          </div>
          <Button
            onClick={handleGoogleLogin}
            className="rounded-full px-6 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white btn-glow"
            data-testid="nav-login-btn"
          >
            Get Started Free
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-frosted text-slate-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Zero-Knowledge Review Management
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight-custom leading-tight mb-6">
                Turn Every Review Into
                <span className="block text-gradient">Business Growth</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                The simplest way to manage Google & Facebook reviews. AI-powered responses, 
                smart routing for negative feedback, and QR codes that convert.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleGoogleLogin}
                  size="lg"
                  className="rounded-full px-8 py-7 text-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white btn-glow hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="hero-cta-btn"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-7 text-lg border-slate-200 hover:bg-white/50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6">
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
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">500+</span> businesses love ReviewFlow
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
              <div className="glass-deep rounded-3xl p-6 shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">Dashboard</h3>
                    <p className="text-sm text-slate-500">Real-time overview</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                    Live
                  </div>
                </div>

                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Reviews", value: "1,284", color: "text-sky-600" },
                    { label: "Avg Rating", value: "4.7", color: "text-amber-600" },
                    { label: "Response", value: "98%", color: "text-emerald-600" },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/50 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mock Review */}
                <div className="p-4 rounded-xl bg-white border border-slate-100">
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
                        &quot;Absolutely fantastic experience! Highly recommend...&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl"
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
                className="absolute -top-4 -right-4 glass-card rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">AI Reply</p>
                    <p className="text-xs text-slate-500">Generated in 2s</p>
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

      {/* Features Section - Bento Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight-custom mb-4"
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

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight-custom mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600">Three simple steps to review success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect", desc: "Search your business name. We find your Google & Facebook profiles automatically." },
              { step: "2", title: "Generate QR", desc: "Print QR codes for your tables, receipts, or counter. Customers scan and review." },
              { step: "3", title: "Respond", desc: "Get notified instantly. Use AI to respond professionally in seconds." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-sky-500/20">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight-custom mb-4">
              Loved by business owners
            </h2>
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
                  <img src={testimonial.avatar} alt="" className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex gap-0.5 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
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
            className="glass-deep rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight-custom mb-4">
              Ready to transform your reviews?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
              Join 500+ businesses already using ReviewFlow. Setup takes 3 minutes.
            </p>
            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="rounded-full px-10 py-7 text-lg bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white btn-glow-purple hover:-translate-y-0.5 active:translate-y-0"
              data-testid="cta-start-btn"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-slate-500 mt-4">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">ReviewFlow</span>
          </div>
          <p className="text-sm text-slate-500">© 2025 ReviewFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
