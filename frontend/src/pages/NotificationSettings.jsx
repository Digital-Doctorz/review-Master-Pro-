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
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Demo notification settings
const DEMO_NOTIFICATION_SETTINGS = {
  email_enabled: true,
  email_address: "demo@reviewmaster.com",
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
      toast.error("Failed to load notification settings");
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
      toast.success("Settings updated");
    } catch (error) {
      console.warn("Error updating settings:", error?.displayMessage || error?.message);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
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
        toast.error("Email service not configured. Contact admin to enable.");
      } else {
        toast.error("Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test:", error);
      toast.error("Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="notification-settings">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-1">
            Configure how you want to be notified about new reviews
          </p>
        </div>
        <Badge
          variant={settings?.email_service_enabled ? "default" : "secondary"}
          className={
            settings?.email_service_enabled
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }
        >
          {settings?.email_service_enabled ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Email Active
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              Email Disabled
            </>
          )}
        </Badge>
      </div>

      {/* Email Not Configured Warning */}
      {!settings?.email_service_enabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Email Service Not Configured</p>
              <p className="text-sm text-amber-700 mt-1">
                To enable email notifications, the admin needs to add a RESEND_API_KEY to the backend configuration.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Email */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            Notification Email
          </CardTitle>
          <CardDescription>
            Where should we send review notifications?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notification_email">Email Address</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="notification_email"
                type="email"
                value={settings?.notification_email || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notification_email: e.target.value,
                  }))
                }
                placeholder="your@email.com"
                className="flex-1"
              />
              <Button
                onClick={() =>
                  updateSettings({
                    notification_email: settings?.notification_email,
                  })
                }
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={sendTestEmail}
              disabled={testing || !settings?.email_service_enabled}
              className="w-full"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which events trigger email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">New Public Reviews</p>
                <p className="text-sm text-slate-500">
                  Get notified when customers leave 4-5 star reviews
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email_new_reviews || false}
              onCheckedChange={(checked) =>
                updateSettings({
                  ...settings,
                  email_new_reviews: checked,
                })
              }
              disabled={saving}
              data-testid="toggle-new-reviews"
            />
          </div>

          {/* Private Feedback */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Private Feedback</p>
                <p className="text-sm text-slate-500">
                  Get notified when customers leave 1-3 star feedback (private)
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email_private_feedback || false}
              onCheckedChange={(checked) =>
                updateSettings({
                  ...settings,
                  email_private_feedback: checked,
                })
              }
              disabled={saving}
              data-testid="toggle-private-feedback"
            />
          </div>

          {/* Weekly Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Weekly Summary</p>
                <p className="text-sm text-slate-500">
                  Get a weekly digest of your review performance
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email_weekly_summary || false}
              onCheckedChange={(checked) =>
                updateSettings({
                  ...settings,
                  email_weekly_summary: checked,
                })
              }
              disabled={saving}
              data-testid="toggle-weekly-summary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Pro Tips for Review Management
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              Respond to negative reviews within 2 hours to show you care
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              Use AI suggestions as a starting point, then personalize
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              Place QR codes at checkout to capture feedback at peak satisfaction
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              Thank positive reviewers - it encourages repeat business
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
