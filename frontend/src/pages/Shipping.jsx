import { Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";

export default function Shipping() {
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
            <Package className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Shipping and Delivery Policy</h1>
          </div>
          <p className="text-slate-400">Last updated: January 30, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate max-w-none">
          {/* Digital Product Notice */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-2xl font-bold mb-2 text-white">100% Digital Product</h2>
            <p className="text-indigo-100">
              Review Master is a Software-as-a-Service (SaaS) product. There are no physical goods to ship. All services are delivered electronically and instantly upon subscription activation.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Trade Me India</strong> operates Review Master as a digital service. This Shipping and Delivery Policy explains how our digital services are delivered to customers.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Company:</strong> Trade Me India<br />
              <strong>Product:</strong> Review Master<br />
              <strong>Contact Email:</strong> trademeindia.sales@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Nature of Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master is a cloud-based software service that:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Requires no physical shipment or delivery</li>
              <li>Is accessed entirely through web browsers and mobile devices</li>
              <li>Is available 24/7 from anywhere with internet access</li>
              <li>Requires no installation or downloads</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Service Activation</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.1 Instant Activation</h3>
            <p className="text-slate-600 leading-relaxed">
              Upon successful payment:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Your subscription is activated <strong>immediately</strong></li>
              <li>You gain instant access to all features of your selected plan</li>
              <li>A confirmation email is sent to your registered email address</li>
              <li>You can start using Review Master right away</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.2 Activation Timeline</h3>
            <div className="bg-slate-100 rounded-xl p-6 mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 text-slate-700">Action</th>
                    <th className="text-left py-2 text-slate-700">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-600">Payment Confirmation</td>
                    <td className="py-2 text-slate-600">Instant</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-600">Service Activation</td>
                    <td className="py-2 text-slate-600">Within 30 seconds</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-600">Email Confirmation</td>
                    <td className="py-2 text-slate-600">Within 5 minutes</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">Invoice Generation</td>
                    <td className="py-2 text-slate-600">Within 24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Service Delivery</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master services are delivered through:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Web Application:</strong> Accessible at reviewmaster.trademe.in (or your custom domain)</li>
              <li><strong>Dashboard:</strong> Full-featured management interface</li>
              <li><strong>QR Codes:</strong> Generated digitally and downloadable as images</li>
              <li><strong>Reports:</strong> Exportable in PDF and CSV formats</li>
              <li><strong>Email Notifications:</strong> Delivered to your registered email</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. No Physical Shipping</h2>
            <p className="text-slate-600 leading-relaxed">
              Since Review Master is a digital service:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>No shipping charges apply</li>
              <li>No delivery address is required</li>
              <li>No waiting time for physical delivery</li>
              <li>No customs or import duties</li>
              <li>Service is available globally without geographical restrictions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Access Requirements</h2>
            <p className="text-slate-600 leading-relaxed">
              To access Review Master, you need:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>A modern web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Stable internet connection</li>
              <li>Valid email address for account verification</li>
              <li>Active subscription</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Service Availability</h2>
            <p className="text-slate-600 leading-relaxed">
              Review Master aims to provide:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>99.9% uptime</strong> guarantee</li>
              <li>24/7 service availability</li>
              <li>Scheduled maintenance with advance notice</li>
              <li>Global CDN for fast access from anywhere</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Service Interruptions</h2>
            <p className="text-slate-600 leading-relaxed">
              In case of service interruptions:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>We will notify users via email for planned maintenance</li>
              <li>Status updates will be available on our status page</li>
              <li>For extended outages, service credits may be provided</li>
              <li>See our <Link to="/refund" className="text-indigo-600 hover:text-indigo-800">Refund Policy</Link> for compensation details</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Exchange Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              As a digital service, traditional exchanges do not apply. However:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Plan Changes:</strong> You can upgrade or downgrade your subscription at any time</li>
              <li><strong>Upgrades:</strong> Take effect immediately with pro-rated billing</li>
              <li><strong>Downgrades:</strong> Take effect at the start of the next billing cycle</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about service delivery:
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
