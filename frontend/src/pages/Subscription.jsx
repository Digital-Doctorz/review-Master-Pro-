import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Crown,
  Zap,
  Building2,
  ExternalLink,
  Shield,
  Clock,
  Receipt
} from 'lucide-react';
import { Button } from '../components/ui/button';

const API = process.env.REACT_APP_BACKEND_URL;

const planIcons = {
  starter: Zap,
  growth: Crown,
  enterprise: Building2,
};

const planColors = {
  starter: "from-sky-500 to-cyan-500",
  growth: "from-violet-500 to-purple-600",
  enterprise: "from-amber-500 to-orange-500",
};

const planLimits = {
  starter: { reviews: 100, locations: 1, price: 499 },
  growth: { reviews: 500, locations: 3, price: 999 },
  enterprise: { reviews: "Unlimited", locations: "Unlimited", price: 2499 },
};

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
    fetchPaymentHistory();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await axios.get(`${API}/api/user/subscription`, { withCredentials: true });
      setSubscription(response.data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(`${API}/api/payment/history`, { withCredentials: true });
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period.")) {
      return;
    }

    setCancelling(true);
    try {
      await axios.post(`${API}/api/subscription/cancel`, {}, { withCredentials: true });
      toast.success("Subscription cancelled. You'll have access until your current period ends.");
      fetchSubscriptionDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const response = await axios.post(`${API}/api/subscription/update-payment-method`, {}, { withCredentials: true });
      if (response.data.payment_link) {
        window.open(response.data.payment_link, '_blank');
      } else {
        toast.info("Please contact support to update your payment method.");
      }
    } catch (error) {
      toast.error("Failed to generate payment update link");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const PlanIcon = subscription?.plan ? planIcons[subscription.plan] || Zap : Zap;
  const planColor = subscription?.plan ? planColors[subscription.plan] : "from-slate-500 to-slate-600";
  const limits = subscription?.plan ? planLimits[subscription.plan] : planLimits.starter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Subscription Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8"
        >
          <div className={`bg-gradient-to-r ${planColor} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <PlanIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white capitalize">
                    {subscription?.plan || 'No Plan'} Plan
                  </h2>
                  <p className="text-white/80 text-sm">
                    {subscription?.is_subscription ? 'Monthly Subscription' : subscription?.billing_cycle === 'yearly' ? 'Annual Plan' : 'One-time Payment'}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                subscription?.is_active 
                  ? 'bg-emerald-500/20 text-white border border-emerald-300/30' 
                  : 'bg-red-500/20 text-white border border-red-300/30'
              }`}>
                {subscription?.is_active ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Plan Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Receipt className="w-5 h-5 text-slate-400" />
                    <span>{formatCurrency(limits.price)}/month</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Zap className="w-5 h-5 text-slate-400" />
                    <span>{limits.reviews} reviews/month</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <span>{limits.locations} location{limits.locations !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Billing</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Next billing date</p>
                      <p className="font-medium">{formatDate(subscription?.expires_at)}</p>
                    </div>
                  </div>
                  {subscription?.subscription_id && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Subscription ID</p>
                        <p className="font-mono text-xs">{subscription.subscription_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Active since</p>
                      <p className="font-medium">{formatDate(subscription?.activated_at)}</p>
                    </div>
                  </div>
                  {subscription?.cancelled_at && (
                    <div className="flex items-center gap-3 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <p className="text-sm">Cancellation scheduled</p>
                        <p className="font-medium text-xs">Access until {formatDate(subscription?.expires_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
              {subscription?.is_subscription && subscription?.is_active && !subscription?.cancelled_at && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleUpdatePaymentMethod}
                    className="text-slate-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {cancelling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                </>
              )}
              {!subscription?.is_active && (
                <Button
                  onClick={() => navigate('/#pricing')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => window.open('https://dashboard.razorpay.com', '_blank')}
                className="text-slate-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Razorpay Dashboard
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
          </div>
          
          {paymentHistory.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {payment.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{payment.plan_name} Plan</p>
                      <p className="text-sm text-slate-500">{formatDate(payment.paid_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(payment.amount || limits.price)}</p>
                    <p className={`text-xs capitalize ${
                      payment.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No payment history yet</p>
            </div>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
              <p className="text-slate-600 text-sm mb-3">
                Having trouble with your subscription or billing? Our support team is here to help.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/contact')}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
