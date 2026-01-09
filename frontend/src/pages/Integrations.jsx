import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Link2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const platformInfo = {
  google: {
    name: "Google Business",
    description: "Connect your Google Business Profile to manage Google reviews",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: "bg-blue-50 border-blue-200 hover:border-blue-300",
    connectedColor: "bg-blue-50 border-blue-300",
  },
  facebook: {
    name: "Facebook Page",
    description: "Connect your Facebook Page to manage Facebook recommendations",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#1877F2"
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
    ),
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-300",
    connectedColor: "bg-indigo-50 border-indigo-300",
  },
};

export default function Integrations() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(`${API}/platforms`, {
        withCredentials: true,
      });
      setPlatforms(response.data);
    } catch (error) {
      console.error("Error fetching platforms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    setConnecting(platform);
    try {
      // Simulate OAuth delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await axios.post(
        `${API}/platforms/${platform}/connect`,
        {},
        { withCredentials: true }
      );
      
      toast.success(`${platformInfo[platform].name} connected successfully!`);
      fetchPlatforms();
    } catch (error) {
      console.error("Error connecting platform:", error);
      toast.error(`Failed to connect ${platformInfo[platform].name}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      await axios.post(
        `${API}/platforms/${platform}/disconnect`,
        {},
        { withCredentials: true }
      );
      
      toast.success(`${platformInfo[platform].name} disconnected`);
      fetchPlatforms();
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      toast.error(`Failed to disconnect ${platformInfo[platform].name}`);
    }
  };

  const getPlatformStatus = (platformName) => {
    const platform = platforms.find((p) => p.platform === platformName);
    return platform?.status || "disconnected";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="integrations-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
          Platform Integrations
        </h1>
        <p className="text-slate-600 mt-1">
          Connect your review platforms to start managing all your reviews in
          one place.
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border-0"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Zero-Knowledge Setup
            </h3>
            <p className="text-slate-600 text-sm">
              Our MOCK integration allows you to see how ReviewFlow works without
              connecting real accounts. Click "Connect" to simulate the OAuth
              flow and generate demo reviews.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(platformInfo).map(([key, platform], index) => {
          const status = getPlatformStatus(key);
          const isConnected = status === "connected";
          const isConnecting = connecting === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`border-2 transition-all ${
                  isConnected ? platform.connectedColor : platform.color
                }`}
                data-testid={`platform-card-${key}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-white shadow-sm">
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {platform.name}
                        </h3>
                        <Badge
                          variant={isConnected ? "default" : "secondary"}
                          className={
                            isConnected
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-600"
                          }
                        >
                          {isConnected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Connected
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Disconnected
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-6">
                    {platform.description}
                  </p>

                  {isConnected ? (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-xl border-slate-200"
                        onClick={() => handleDisconnect(key)}
                        data-testid={`disconnect-${key}-btn`}
                      >
                        Disconnect
                      </Button>
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl border-slate-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                      onClick={() => handleConnect(key)}
                      disabled={isConnecting}
                      data-testid={`connect-${key}-btn`}
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 mr-2" />
                          Connect {platform.name}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-2">
                Google Business Integration
              </h4>
              <p className="text-sm text-slate-600">
                Click "Connect" to simulate connecting your Google Business
                Profile. In production, this would open Google's OAuth flow.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-2">
                Facebook Page Integration
              </h4>
              <p className="text-sm text-slate-600">
                Click "Connect" to simulate connecting your Facebook Page. Demo
                reviews will be generated automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
