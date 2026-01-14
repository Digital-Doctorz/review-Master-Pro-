import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Key,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Google Icon
const GoogleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook Icon
const FacebookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function ApiSettings() {
  const { business, isDemo } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ google: false, facebook: false });
  const [showKeys, setShowKeys] = useState({ google: false, facebook: false });
  
  const [credentials, setCredentials] = useState({
    google_api_key: "",
    facebook_app_id: "",
    facebook_app_secret: "",
  });
  
  const [integrationStatus, setIntegrationStatus] = useState(null);

  // Demo integration status
  const DEMO_INTEGRATION_STATUS = {
    google: { connected: true, mode: "demo" },
    facebook: { connected: true, mode: "demo" },
    overall_mode: "demo"
  };

  useEffect(() => {
    loadCredentials();
    loadIntegrationStatus();
  }, []);

  const loadCredentials = async () => {
    // Demo mode - use placeholder data
    if (isDemo) {
      setCredentials({
        google_api_key: "demo_google_api_key_xxx",
        facebook_app_id: "demo_facebook_app_id",
        facebook_app_secret: "demo_facebook_secret_xxx",
      });
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/settings/api-credentials`, { withCredentials: true });
      if (response.data) {
        setCredentials({
          google_api_key: response.data.google_api_key || "",
          facebook_app_id: response.data.facebook_app_id || "",
          facebook_app_secret: response.data.facebook_app_secret || "",
        });
      }
    } catch (error) {
      console.warn("Error loading credentials:", error?.displayMessage || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationStatus = async () => {
    if (isDemo) {
      setIntegrationStatus(DEMO_INTEGRATION_STATUS);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/integration-status`, { withCredentials: true });
      setIntegrationStatus(response.data);
    } catch (error) {
      console.warn("Error loading status:", error?.displayMessage || error?.message);
    }
  };

  const handleSave = async (platform) => {
    if (isDemo) {
      toast.info("Demo mode - credentials won't be saved");
      return;
    }
    
    setSaving(true);
    try {
      const payload = platform === "google" 
        ? { google_api_key: credentials.google_api_key }
        : { facebook_app_id: credentials.facebook_app_id, facebook_app_secret: credentials.facebook_app_secret };

      await axios.put(`${API}/settings/api-credentials`, payload, { withCredentials: true });
      toast.success(`${platform === "google" ? "Google" : "Facebook"} credentials saved!`);
      loadIntegrationStatus();
    } catch (error) {
      console.warn("Error saving credentials:", error?.displayMessage || error?.message);
      toast.error("Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (platform) => {
    if (isDemo) {
      toast.info("Demo mode - connection test simulated");
      setTesting({ ...testing, [platform]: true });
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${platform === "google" ? "Google" : "Facebook"} connection successful!`);
      setTesting({ ...testing, [platform]: false });
      return;
    }
    
    setTesting({ ...testing, [platform]: true });
    try {
      const response = await axios.post(`${API}/settings/test-connection/${platform}`, {}, { withCredentials: true });
      if (response.data.success) {
        toast.success(`${platform === "google" ? "Google" : "Facebook"} connection successful!`);
      } else {
        toast.error(`Connection failed: ${response.data.error || "Unknown error"}`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || "Connection failed";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Connection failed");
    } finally {
      setTesting({ ...testing, [platform]: false });
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
    <div className="space-y-8 max-w-4xl mx-auto" data-testid="api-settings-page">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Advanced Settings
            </h1>
            <p className="text-slate-600">
              Optional API credentials for advanced features
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border-2 bg-emerald-50 border-emerald-200"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800">You don&apos;t need this page!</p>
            <p className="text-sm text-emerald-700 mt-1">
              Review Master works perfectly without API keys. Just go to{" "}
              <Link to="/integrations" className="underline font-medium">Integrations</Link>{" "}
              and paste your Google/Facebook review link. That&apos;s all you need!
            </p>
          </div>
        </div>
      </motion.div>

      {/* When to use this */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">When would I need API keys?</p>
            <p className="text-sm text-amber-700 mt-1">
              API keys are only needed if you want to automatically fetch existing reviews from Google/Facebook 
              into your dashboard. Most users don&apos;t need this feature.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Link to Integrations */}
      <Link to="/integrations">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Simple Setup (Recommended)</h3>
                <p className="text-indigo-100 text-sm">
                  Connect Google/Facebook in 30 seconds - no API keys needed
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.div>
      </Link>

      {/* Divider */}
      <div className="flex items-center gap-4 py-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-400 font-medium">Advanced Options Below</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Google API Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <GoogleIcon className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Google Places API</CardTitle>
                  <p className="text-sm text-slate-500">For automatic review fetching</p>
                </div>
              </div>
              <Badge className={credentials.google_api_key
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-slate-100 text-slate-600"
              }>
                {credentials.google_api_key ? "Configured" : "Not Set"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* API Key Input */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                Google Places API Key
              </Label>
              <div className="relative">
                <Input
                  type={showKeys.google ? "text" : "password"}
                  value={credentials.google_api_key}
                  onChange={(e) => setCredentials({ ...credentials, google_api_key: e.target.value })}
                  placeholder="AIzaSy..."
                  className="pr-12 h-12 rounded-xl border-slate-200 font-mono text-sm"
                  data-testid="google-api-key-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeys({ ...showKeys, google: !showKeys.google })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                  {showKeys.google ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Get this from{" "}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleSave("google")}
                disabled={saving || !credentials.google_api_key}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
                data-testid="save-google-btn"
              >
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Save Key
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTestConnection("google")}
                disabled={testing.google || !credentials.google_api_key}
                className="rounded-xl"
                data-testid="test-google-btn"
              >
                {testing.google ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Facebook API Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <FacebookIcon className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Facebook Graph API</CardTitle>
                  <p className="text-sm text-slate-500">For automatic review fetching</p>
                </div>
              </div>
              <Badge className={credentials.facebook_app_id && credentials.facebook_app_secret
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-slate-100 text-slate-600"
              }>
                {credentials.facebook_app_id && credentials.facebook_app_secret ? "Configured" : "Not Set"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* App ID Input */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                Facebook App ID
              </Label>
              <Input
                type="text"
                value={credentials.facebook_app_id}
                onChange={(e) => setCredentials({ ...credentials, facebook_app_id: e.target.value })}
                placeholder="123456789012345"
                className="h-12 rounded-xl border-slate-200 font-mono text-sm"
                data-testid="facebook-app-id-input"
              />
            </div>

            {/* App Secret Input */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Facebook App Secret
              </Label>
              <div className="relative">
                <Input
                  type={showKeys.facebook ? "text" : "password"}
                  value={credentials.facebook_app_secret}
                  onChange={(e) => setCredentials({ ...credentials, facebook_app_secret: e.target.value })}
                  placeholder="abc123..."
                  className="pr-12 h-12 rounded-xl border-slate-200 font-mono text-sm"
                  data-testid="facebook-app-secret-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeys({ ...showKeys, facebook: !showKeys.facebook })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                  {showKeys.facebook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Get this from{" "}
                <a 
                  href="https://developers.facebook.com/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Facebook Developers
                </a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleSave("facebook")}
                disabled={saving || !credentials.facebook_app_id || !credentials.facebook_app_secret}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                data-testid="save-facebook-btn"
              >
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTestConnection("facebook")}
                disabled={testing.facebook || !credentials.facebook_app_id || !credentials.facebook_app_secret}
                className="rounded-xl"
                data-testid="test-facebook-btn"
              >
                {testing.facebook ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
