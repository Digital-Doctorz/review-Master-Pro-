import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export default function Refund() {
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
            <RefreshCcw className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Cancellation and Refund Policy</h1>
          </div>
          <p className="text-slate-400">Last updated: January 30, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate max-w-none">
          {/* Money Back Guarantee Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-2xl font-bold mb-2 text-white">30-Day Money-Back Guarantee</h2>
            <p className="text-emerald-100">
              We're confident you'll love Review Master. If you're not satisfied within the first 30 days, we'll refund your payment - no questions asked.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Trade Me India</strong> ("we", "our", "us") is committed to customer satisfaction. This Cancellation and Refund Policy outlines the terms for cancelling your Review Master subscription and requesting refunds.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Company:</strong> Trade Me India<br />
              <strong>Product:</strong> Review Master<br />
              <strong>Contact Email:</strong> trademeindia.sales@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Subscription Cancellation</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.1 How to Cancel</h3>
            <p className="text-slate-600 leading-relaxed">
              You can cancel your subscription at any time by:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Logging into your Review Master account and navigating to Settings &gt; Subscription</li>
              <li>Sending an email to trademeindia.sales@gmail.com with your account details</li>
              <li>Calling our support line at +91-9555-9555-95</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.2 Effect of Cancellation</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Your subscription will remain active until the end of the current billing period</li>
              <li>You will retain access to all features until the subscription expires</li>
              <li>After expiration, your account will be downgraded to limited access</li>
              <li>Your data will be retained for 30 days after cancellation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Refund Policy</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.1 Monthly Subscriptions</h3>
            <div className="bg-slate-100 rounded-xl p-6 mt-4">
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Within 30 days of first payment:</strong> Full refund (100%)</li>
                <li><strong>After 30 days:</strong> No refund, but subscription continues until billing period ends</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.2 Yearly Subscriptions</h3>
            <div className="bg-slate-100 rounded-xl p-6 mt-4">
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Within 30 days of payment:</strong> Full refund (100%)</li>
                <li><strong>31-90 days:</strong> 75% refund (pro-rated)</li>
                <li><strong>91-180 days:</strong> 50% refund (pro-rated)</li>
                <li><strong>After 180 days:</strong> No refund</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Eligibility for Refund</h2>
            <p className="text-slate-600 leading-relaxed">
              To be eligible for a refund:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>You must request the refund within the applicable time frame</li>
              <li>Your account must be in good standing (not suspended for violations)</li>
              <li>Payment must have been made through our official payment gateway</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Non-Refundable Items</h2>
            <p className="text-slate-600 leading-relaxed">
              The following are NOT eligible for refunds:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Accounts terminated for Terms of Service violations</li>
              <li>Promotional or discounted subscriptions (unless otherwise stated)</li>
              <li>Add-on services or one-time purchases</li>
              <li>Requests made after the refund eligibility period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. How to Request a Refund</h2>
            <p className="text-slate-600 leading-relaxed">
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 space-y-3 mt-4">
              <li>Send an email to <strong>trademeindia.sales@gmail.com</strong> with subject line "Refund Request"</li>
              <li>Include your registered email address and account details</li>
              <li>Provide the reason for your refund request</li>
              <li>Include your payment transaction ID (if available)</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Refund Processing</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Refund requests are reviewed within <strong>3-5 business days</strong></li>
              <li>Approved refunds are processed within <strong>7-10 business days</strong></li>
              <li>Refunds are credited to the original payment method</li>
              <li>Bank processing times may add 5-7 additional days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Plan Downgrades</h2>
            <p className="text-slate-600 leading-relaxed">
              If you downgrade from a higher plan to a lower plan:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>The downgrade takes effect at the start of the next billing cycle</li>
              <li>No partial refunds are provided for the current billing period</li>
              <li>You will retain higher-tier features until the current period ends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Exceptional Circumstances</h2>
            <p className="text-slate-600 leading-relaxed">
              We may offer refunds outside the standard policy for:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Service outages exceeding 48 hours</li>
              <li>Critical bugs that significantly impact your business</li>
              <li>Billing errors on our part</li>
              <li>Medical or financial emergencies (at our discretion)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              For cancellation or refund inquiries:
            </p>
            <div className="bg-slate-100 rounded-xl p-6 mt-4">
              <p className="text-slate-700"><strong>Trade Me India</strong></p>
              <p className="text-slate-600">Product: Review Master</p>
              <p className="text-slate-600">Email: trademeindia.sales@gmail.com</p>
              <p className="text-slate-600">Phone: +91-9555-9555-95</p>
              <p className="text-slate-600">Hours: Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
