import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Webhook,
  Copy,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Bell,
  Zap,
  Clock,
  ExternalLink,
  TestTube,
  AlertCircle,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WebhookSettings() {
  const [config, setConfig] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [copied, setCopied] = useState(null);

  const fetchWebhookConfig = useCallback(async () => {
    try {
      const [configRes, eventsRes] = await Promise.all([
        axios.get(`${API}/webhooks/config`, { withCredentials: true }),
        axios.get(`${API}/webhooks/events?limit=10`, { withCredentials: true }),
      ]);
      setConfig(configRes.data);
      setEvents(eventsRes.data.events || []);
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      toast.error("Failed to load webhook settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhookConfig();
  }, [fetchWebhookConfig]);

  const updateSettings = async (settings) => {
    setSaving(true);
    try {
      await axios.put(`${API}/webhooks/config`, settings, { withCredentials: true });
      setConfig((prev) => ({ ...prev, ...settings }));
      toast.success("Webhook settings updated");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const regenerateSecret = async () => {
    try {
      const response = await axios.post(
        `${API}/webhooks/regenerate-secret`,
        {},
        { withCredentials: true }
      );
      setConfig((prev) => ({
        ...prev,
        webhook_secret_preview: response.data.webhook_secret_preview,
      }));
      toast.success("Webhook secret regenerated");
    } catch (error) {
      console.error("Error regenerating secret:", error);
      toast.error("Failed to regenerate secret");
    }
  };

  const testWebhook = async (platform) => {
    setTesting(platform);
    try {
      await axios.post(`${API}/webhooks/test/${platform}`, {}, { withCredentials: true });
      toast.success(`Test ${platform} review created!`);
      // Refresh events
      const eventsRes = await axios.get(`${API}/webhooks/events?limit=10`, {
        withCredentials: true,
      });
      setEvents(eventsRes.data.events || []);
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error(`Failed to test ${platform} webhook`);
    } finally {
      setTesting(null);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="webhook-settings">
      {/* Header Card */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Webhook className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Webhook Configuration</CardTitle>
              <CardDescription>
                Receive real-time review notifications from Google & Facebook
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-sky-600 mt-0.5" />
              <div>
                <p className="font-medium text-sky-900">How it works</p>
                <p className="text-sm text-sky-700 mt-1">
                  Copy your webhook URLs below and configure them in Google Business Profile 
                  and Facebook App settings. When new reviews are posted, they&apos;ll automatically 
                  appear in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook URLs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Google Webhook */}
        <Card className={`border-2 transition-all ${config?.google_enabled ? "border-blue-300 bg-blue-50/30" : "border-slate-200"}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">G</span>
                </div>
                <div>
                  <CardTitle className="text-lg">Google Webhook</CardTitle>
                  <Badge 
                    variant={config?.google_enabled ? "default" : "secondary"}
                    className={config?.google_enabled ? "bg-green-100 text-green-700 mt-1" : "bg-slate-100 text-slate-600 mt-1"}
                  >
                    {config?.google_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={config?.google_enabled || false}
                onCheckedChange={(checked) => updateSettings({ 
                  google_enabled: checked, 
                  facebook_enabled: config?.facebook_enabled || false 
                })}
                disabled={saving}
                data-testid="google-webhook-toggle"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600">Webhook URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={config?.webhook_url_google || ""}
                  readOnly
                  className="font-mono text-xs bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config?.webhook_url_google, "google")}
                  className="shrink-0"
                >
                  {copied === "google" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testWebhook("google")}
              disabled={testing === "google" || !config?.google_enabled}
              className="w-full"
              data-testid="test-google-webhook"
            >
              {testing === "google" ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Test Google Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Facebook Webhook */}
        <Card className={`border-2 transition-all ${config?.facebook_enabled ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200"}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">f</span>
                </div>
                <div>
                  <CardTitle className="text-lg">Facebook Webhook</CardTitle>
                  <Badge 
                    variant={config?.facebook_enabled ? "default" : "secondary"}
                    className={config?.facebook_enabled ? "bg-green-100 text-green-700 mt-1" : "bg-slate-100 text-slate-600 mt-1"}
                  >
                    {config?.facebook_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={config?.facebook_enabled || false}
                onCheckedChange={(checked) => updateSettings({ 
                  google_enabled: config?.google_enabled || false,
                  facebook_enabled: checked 
                })}
                disabled={saving}
                data-testid="facebook-webhook-toggle"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600">Webhook URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={config?.webhook_url_facebook || ""}
                  readOnly
                  className="font-mono text-xs bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config?.webhook_url_facebook, "facebook")}
                  className="shrink-0"
                >
                  {copied === "facebook" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testWebhook("facebook")}
              disabled={testing === "facebook" || !config?.facebook_enabled}
              className="w-full"
              data-testid="test-facebook-webhook"
            >
              {testing === "facebook" ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Test Facebook Webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Secret */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-slate-600">Webhook Verification Token</Label>
            <p className="text-xs text-slate-500 mb-2">
              Use this token to verify webhook requests. For Facebook, use as your Verify Token.
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={config?.webhook_secret_preview || "********"}
                readOnly
                className="font-mono bg-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(config?.webhook_secret_preview, "secret")}
                className="shrink-0"
              >
                {copied === "secret" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateSecret}
                className="shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Last triggered:</span>
              <span className="font-medium">{formatDate(config?.last_triggered)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-600">Total events received:</span>
              <span className="font-medium">{config?.trigger_count || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Webhook Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No webhook events yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Events will appear here when reviews are received via webhooks
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.event_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        event.platform === "google" ? "bg-blue-100" : "bg-indigo-100"
                      }`}>
                        <span className={`font-bold text-xs ${
                          event.platform === "google" ? "text-blue-600" : "text-indigo-600"
                        }`}>
                          {event.platform === "google" ? "G" : "f"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {event.event_type}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(event.received_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        event.status === "processed" || event.status === "test_processed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {event.status}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="border-2 border-dashed border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">G</span>
                Google Business Profile
              </h4>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Go to Google Cloud Console</li>
                <li>Enable Google My Business API</li>
                <li>Configure Pub/Sub topic for notifications</li>
                <li>Set the push endpoint to your Google webhook URL</li>
              </ol>
              <a
                href="https://developers.google.com/my-business/content/review-data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
              >
                View Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">f</span>
                Facebook Page
              </h4>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Go to Facebook Developers Console</li>
                <li>Select your app and go to Webhooks</li>
                <li>Add &quot;Page&quot; subscription</li>
                <li>Enter your Facebook webhook URL and verify token</li>
                <li>Subscribe to &quot;ratings&quot; field</li>
              </ol>
              <a
                href="https://developers.facebook.com/docs/graph-api/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mt-2"
              >
                View Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
