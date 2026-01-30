import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Contact Us</h1>
          </div>
          <p className="text-slate-400">We're here to help you grow your business</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
            <p className="text-slate-600 mb-8">
              Have questions about Review Master? Our team at Trade Me India is ready to help you manage your online reputation and grow your business.
            </p>

            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                    <a href="tel:+919555955595" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      +91-9555-9555-95
                    </a>
                    <p className="text-sm text-slate-500 mt-1">Mon - Sat, 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <a href="mailto:trademeindia.sales@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      trademeindia.sales@gmail.com
                    </a>
                    <p className="text-sm text-slate-500 mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
                    <p className="text-slate-600">India</p>
                    <p className="text-sm text-slate-500 mt-1">Serving businesses worldwide</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Business Hours</h3>
                    <p className="text-slate-600">Monday - Saturday</p>
                    <p className="text-sm text-slate-500 mt-1">9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form 
              action="https://formsubmit.co/trademeindia.sales@gmail.com" 
              method="POST"
              className="space-y-6"
            >
              <input type="hidden" name="_subject" value="New Contact Form Submission - Review Master" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="+91-XXXXX-XXXXX"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="Sales Inquiry">Sales Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Partnership">Partnership Opportunity</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Company Information */}
        <div className="mt-16 bg-slate-900 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">About Trade Me India</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-300 leading-relaxed">
                Trade Me India is a technology company focused on helping local businesses succeed in the digital age. Our flagship product, <strong className="text-white">Review Master</strong>, empowers businesses to manage their online reputation effectively.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                We believe that every business deserves the tools to showcase their best customer experiences. Our platform makes it easy to collect, manage, and respond to reviews across multiple platforms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-slate-300 hover:text-white transition-colors">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className="text-slate-300 hover:text-white transition-colors">
                    Cancellation and Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-slate-300 hover:text-white transition-colors">
                    Shipping and Delivery Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
