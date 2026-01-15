import { useState, useEffect, useCallback, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Bell,
  Mail,
  MessageSquare,
  Star,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Send,
  Zap,
  Play,
  HelpCircle,
  ExternalLink,
  Copy,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Demo notification settings
const DEMO_NOTIFICATION_SETTINGS = {
  email_enabled: true,
  email_address: "demo@reviewmaster.com",
  email_service_enabled: true,
  notify_on_new_review: true,
  notify_on_negative_review: true,
  notify_on_response_needed: true,
  daily_digest: false,
  weekly_summary: true,
  urgency_threshold: 3,
  instant_alerts: true
};

export default function NotificationSettings() {
  const { isDemo } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSettings = useCallback(async () => {
    // Demo mode - use demo data
    if (isDemo) {
      setSettings(DEMO_NOTIFICATION_SETTINGS);
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/notifications/settings`, {
        withCredentials: true,
      });
      setSettings(response.data);
    } catch (error) {
      console.warn("Error fetching settings:", error?.displayMessage || error?.message);
      // Use default settings if fetch fails
      setSettings({
        email_enabled: false,
        email_address: "",
        email_service_enabled: false,
        notify_on_new_review: true,
        notify_on_negative_review: true,
        notify_on_response_needed: true,
        daily_digest: false,
        weekly_summary: false,
        urgency_threshold: 3,
        instant_alerts: true
      });
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates) => {
    if (isDemo) {
      toast.info("Demo mode - settings won't be saved");
      setSettings((prev) => ({ ...prev, ...updates }));
      return;
    }
    
    setSaving(true);
    try {
      await axios.put(`${API}/notifications/settings`, updates, {
        withCredentials: true,
      });
      setSettings((prev) => ({ ...prev, ...updates }));
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.warn("Error updating settings:", error?.displayMessage || error?.message);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (isDemo) {
      toast.success("Demo: Test email sent to demo@reviewmaster.com!");
      return;
    }
    
    setTesting(true);
    try {
      const response = await axios.post(
        `${API}/notifications/test`,
        {},
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        toast.success("Test email sent! Check your inbox.");
      } else if (response.data.status === "disabled") {
        toast.error("Email service not configured yet");
        setShowSetupGuide(true);
      } else {
        toast.error("Failed to send test email");
      }
    } catch (error) {
      console.warn("Error sending test:", error?.displayMessage || error?.message);
      toast.error("Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="notification-settings">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-1">
            Get notified when customers leave reviews
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={settings?.email_service_enabled ? "default" : "secondary"}
            className={`${
              settings?.email_service_enabled
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            } px-3 py-1`}
          >
            {settings?.email_service_enabled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Email Active
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                Setup Required
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Email Setup Guide Banner - Show if email not configured */}
      {!settings?.email_service_enabled && !isDemo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">Set up Email Notifications</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Get instant alerts when customers leave reviews. Takes only 2 minutes to set up!
                  </p>
                </div>
                <Button
                  onClick={() => setShowSetupGuide(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Setup Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Email Configuration */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Email Notifications</CardTitle>
              <CardDescription>Receive alerts directly in your inbox</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900">Enable Email Alerts</p>
                <p className="text-sm text-slate-500">Get notified via email</p>
              </div>
            </div>
            <Switch
              checked={settings?.email_enabled || false}
              onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
              disabled={saving}
            />
          </div>

          {/* Email Address */}
          {settings?.email_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Notification Email
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={settings?.email_address || ""}
                    onChange={(e) => setSettings({ ...settings, email_address: e.target.value })}
                    className="flex-1 rounded-xl"
                  />
                  <Button
                    variant="outline"
                    onClick={() => updateSettings({ email_address: settings.email_address })}
                    disabled={saving}
                    className="rounded-xl"
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Test Email Button */}
              <Button
                variant="outline"
                onClick={sendTestEmail}
                disabled={testing || !settings?.email_address}
                className="w-full sm:w-auto rounded-xl"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Alert Types</CardTitle>
              <CardDescription>Choose what to be notified about</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Review */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-slate-900">New Reviews</p>
                <p className="text-sm text-slate-500">Alert when a customer posts a review</p>
              </div>
            </div>
            <Switch
              checked={settings?.notify_on_new_review || false}
              onCheckedChange={(checked) => updateSettings({ notify_on_new_review: checked })}
              disabled={saving}
            />
          </div>

          {/* Negative Review */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-slate-900">Negative Reviews</p>
                <p className="text-sm text-slate-500">Instant alert for ratings 3 stars or below</p>
              </div>
            </div>
            <Switch
              checked={settings?.notify_on_negative_review || false}
              onCheckedChange={(checked) => updateSettings({ notify_on_negative_review: checked })}
              disabled={saving}
            />
          </div>

          {/* Response Needed */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-slate-900">Response Needed</p>
                <p className="text-sm text-slate-500">Reviews waiting for your reply</p>
              </div>
            </div>
            <Switch
              checked={settings?.notify_on_response_needed || false}
              onCheckedChange={(checked) => updateSettings({ notify_on_response_needed: checked })}
              disabled={saving}
            />
          </div>

          {/* Weekly Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-slate-900">Weekly Summary</p>
                <p className="text-sm text-slate-500">Get a weekly report every Monday</p>
              </div>
            </div>
            <Switch
              checked={settings?.weekly_summary || false}
              onCheckedChange={(checked) => updateSettings({ weekly_summary: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Setup Guide Dialog */}
      <Dialog open={showSetupGuide} onOpenChange={setShowSetupGuide}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              Email Setup Guide
            </DialogTitle>
            <DialogDescription>
              Follow these simple steps to enable email notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="font-semibold text-slate-900">Get a Resend API Key (Free)</h4>
                  <p className="text-sm text-slate-600">
                    Resend is an email service that lets you send up to 3,000 emails/month for free.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <strong>a.</strong> Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">resend.com</a> and create a free account
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>b.</strong> After signing up, go to <strong>API Keys</strong> in the sidebar
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>c.</strong> Click <strong>&quot;Create API Key&quot;</strong>, give it a name (e.g., &quot;Review Master&quot;)
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>d.</strong> Copy the API key (starts with <code className="bg-slate-200 px-1 rounded">re_</code>)
                    </p>
                  </div>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Open Resend Dashboard
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="font-semibold text-slate-900">Share Your API Key</h4>
                  <p className="text-sm text-slate-600">
                    Once you have the API key, share it with our support team and we&apos;ll enable email notifications for you within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => copyToClipboard("support@reviewmaster.app")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? "Copied!" : "Copy Support Email"}
                    </Button>
                    <a
                      href="mailto:support@reviewmaster.app?subject=Enable%20Email%20Notifications&body=Hi,%0A%0APlease%20enable%20email%20notifications%20for%20my%20account.%0A%0AMy%20Resend%20API%20Key:%20[PASTE_YOUR_KEY_HERE]%0A%0AThank%20you!"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email to Support
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="font-semibold text-slate-900">Start Receiving Notifications!</h4>
                  <p className="text-sm text-slate-600">
                    Once we enable email for your account, you&apos;ll see a green &quot;Email Active&quot; badge on this page. 
                    Enter your email address above and start receiving instant alerts!
                  </p>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">You&apos;ll be notified when setup is complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Need Help?</p>
                  <p className="text-sm text-amber-700 mt-1">
                    If you&apos;re having trouble, our support team is happy to help you set up email notifications for free. 
                    Just reach out!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowSetupGuide(false)} className="rounded-xl">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
