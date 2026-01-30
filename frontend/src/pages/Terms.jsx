import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
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
            <FileText className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          </div>
          <p className="text-slate-400">Last updated: January 30, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Welcome to Review Master, a product of <strong>Trade Me India</strong>. These Terms and Conditions govern your use of the Review Master platform and services. By accessing or using our services, you agree to be bound by these terms.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Company:</strong> Trade Me India<br />
              <strong>Product:</strong> Review Master<br />
              <strong>Contact Email:</strong> trademeindia.sales@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>"Service"</strong> refers to the Review Master platform, including all features, tools, and functionalities provided.</li>
              <li><strong>"User"</strong> refers to any individual or business entity that registers for and uses the Service.</li>
              <li><strong>"Account"</strong> refers to the unique account created by the User to access the Service.</li>
              <li><strong>"Subscription"</strong> refers to the paid plans that provide access to premium features.</li>
              <li><strong>"Content"</strong> refers to reviews, responses, and other data managed through the Service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Account Registration</h2>
            <p className="text-slate-600 leading-relaxed">
              To use Review Master, you must create an account by providing accurate and complete information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring your contact information is accurate and up-to-date</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Subscription and Payments</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master offers various subscription plans:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Starter Plan:</strong> ₹499/month or ₹4,788/year</li>
              <li><strong>Growth Plan:</strong> ₹999/month or ₹9,588/year</li>
              <li><strong>Enterprise Plan:</strong> ₹2,499/month or ₹23,988/year</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Payment Terms:</strong>
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li>Monthly subscriptions are billed on a recurring monthly basis</li>
              <li>Yearly subscriptions require full payment upfront for 12 months</li>
              <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
              <li>Payments are processed securely through Razorpay</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Free Trial</h2>
            <p className="text-slate-600 leading-relaxed">
              Trade Me India may offer a 7-day free trial for new users. During the trial period:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>You will have access to the Starter plan features</li>
              <li>No payment is required during the trial period</li>
              <li>After the trial ends, you must subscribe to continue using the Service</li>
              <li>Trial accounts and data may be deleted if not converted to paid subscriptions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Acceptable Use</h2>
            <p className="text-slate-600 leading-relaxed">
              You agree NOT to use Review Master to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Post fake, misleading, or fraudulent reviews</li>
              <li>Harass, abuse, or harm other users or businesses</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to the Service or other accounts</li>
              <li>Use automated tools or bots without prior written permission</li>
              <li>Transmit malware, viruses, or other harmful code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              The Review Master platform, including its design, features, and content, is owned by Trade Me India and protected by intellectual property laws. You retain ownership of your business data and content, but grant us a license to process and display it as necessary to provide the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data and Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Your use of Review Master is also governed by our <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</Link>. We are committed to protecting your data and using it only as described in our privacy practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Service Availability</h2>
            <p className="text-slate-600 leading-relaxed">
              We strive to maintain 99.9% uptime for Review Master. However, we do not guarantee uninterrupted access and may occasionally perform maintenance that temporarily affects availability. We will provide advance notice when possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, Trade Me India shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of Review Master. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Your access to the Service will be revoked</li>
              <li>You may request export of your data within 30 days</li>
              <li>Refunds will be processed according to our <Link to="/refund" className="text-indigo-600 hover:text-indigo-800">Refund Policy</Link></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              Trade Me India reserves the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Contact Information</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-slate-100 rounded-xl p-6 mt-4">
              <p className="text-slate-700"><strong>Trade Me India</strong></p>
              <p className="text-slate-600">Product: Review Master</p>
              <p className="text-slate-600">Email: trademeindia.sales@gmail.com</p>
              <p className="text-slate-600">Phone: +91-9555-9555-95</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
