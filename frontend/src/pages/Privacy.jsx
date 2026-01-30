import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

export default function Privacy() {
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
            <Lock className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
              <strong>Trade Me India</strong> ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use Review Master.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Company:</strong> Trade Me India<br />
              <strong>Product:</strong> Review Master<br />
              <strong>Contact Email:</strong> trademeindia.sales@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.1 Personal Information</h3>
            <p className="text-slate-600 leading-relaxed">
              We collect information you provide directly:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Name and email address (via Google Sign-In)</li>
              <li>Business name and contact information</li>
              <li>Payment information (processed securely via Razorpay)</li>
              <li>Customer reviews and feedback data</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.3 Third-Party Data</h3>
            <p className="text-slate-600 leading-relaxed">
              When you connect external platforms, we may receive:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Google Business Profile reviews and ratings</li>
              <li>Facebook page reviews</li>
              <li>Swiggy and Zomato restaurant information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">
              We use collected information to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Provide and maintain the Review Master service</li>
              <li>Process transactions and send billing information</li>
              <li>Send important service updates and notifications</li>
              <li>Generate AI-powered review responses</li>
              <li>Analyze usage patterns to improve the service</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-slate-600 leading-relaxed">
              We do NOT sell your personal data. We may share information with:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Service Providers:</strong> Third parties that help us operate (e.g., Razorpay for payments, Google for authentication)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encrypted storage for sensitive data</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing via Razorpay (PCI-DSS compliant)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. After account deletion:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Personal data is deleted within 30 days</li>
              <li>Backup data is purged within 90 days</li>
              <li>Some data may be retained for legal compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Export your data in a readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              To exercise these rights, contact us at trademeindia.sales@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master uses cookies to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master integrates with third-party services:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Google:</strong> Authentication and business reviews</li>
              <li><strong>Facebook:</strong> Page reviews integration</li>
              <li><strong>Razorpay:</strong> Payment processing</li>
              <li><strong>Swiggy/Zomato:</strong> Restaurant reviews</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Each service has its own privacy policy. We encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Children's Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover such data, we will delete it promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service. The "Last updated" date reflects the most recent revision.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              For privacy-related questions or concerns, please contact:
            </p>
            <div className="bg-slate-100 rounded-xl p-6 mt-4">
              <p className="text-slate-700"><strong>Trade Me India</strong></p>
              <p className="text-slate-600">Product: Review Master</p>
              <p className="text-slate-600">Privacy Officer Email: trademeindia.sales@gmail.com</p>
              <p className="text-slate-600">Phone: +91-9555-9555-95</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
