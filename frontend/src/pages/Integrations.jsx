import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Link2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  Globe,
  MapPin,
  Plus,
  Building2,
  Copy,
  ExternalLink,
  Info,
  Crown,
  ArrowRight,
  Trash2,
  Edit3,
  Star,
  AlertTriangle,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Google Icon - Official colors
const GoogleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook Icon - Official color
const FacebookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Amazon Icon - Official smile logo
const AmazonIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#FF9900" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.483.126.094.172.063.343-.093.513-.156.17-.385.37-.688.6-.661.505-1.425.97-2.293 1.398-1.64.808-3.442 1.349-5.405 1.622-.6.084-1.188.136-1.758.154a23.66 23.66 0 01-1.982-.03 15.138 15.138 0 01-5.086-1.196c-1.324-.545-2.563-1.258-3.714-2.14-.28-.216-.456-.454-.392-.725.064-.271.174-.392.355-.505zm7.394-4.79c0-.792.193-1.474.578-2.05.385-.575.927-.973 1.625-1.194a5.756 5.756 0 012.426-.164c.56.07 1.094.2 1.602.392v-.338c0-.612-.152-1.05-.459-1.308-.305-.26-.778-.389-1.418-.389-.373 0-.75.054-1.13.163-.38.107-.77.267-1.167.474a1.27 1.27 0 01-.51.142c-.18 0-.334-.073-.46-.22a.833.833 0 01-.187-.567c0-.218.063-.418.188-.598.124-.18.34-.378.647-.593.61-.43 1.24-.752 1.889-.967a7.313 7.313 0 012.048-.322c.726 0 1.364.126 1.912.376.55.252.988.613 1.317 1.086.328.473.492 1.024.492 1.655v4.476c0 .345.076.595.228.754.152.156.357.236.615.236.24 0 .438-.08.598-.236a.69.69 0 00.236-.593v-.164h.882v.164c0 .6-.183 1.052-.55 1.36-.368.306-.826.459-1.373.459-.434 0-.825-.095-1.17-.285a1.843 1.843 0 01-.775-.82 3.298 3.298 0 01-1.162.82 3.64 3.64 0 01-1.526.322c-.772 0-1.436-.217-1.988-.652-.553-.434-.83-1.07-.83-1.912zm4.23.328c.408-.126.72-.318.94-.578v-1.72a4.715 4.715 0 00-1.09-.252 5.08 5.08 0 00-.82-.073c-.568 0-1.013.135-1.335.404-.322.27-.484.66-.484 1.166 0 .476.13.84.39 1.086.26.246.623.37 1.09.37.465 0 .9-.134 1.308-.404z"/>
    <path fill="#232F3E" d="M21.12 17.543c-.264-.172-.4-.364-.4-.644 0-.175.058-.332.174-.473a.56.56 0 01.45-.212c.136 0 .29.058.464.173 1.008.66 2.106.99 3.295.99.844 0 1.513-.164 2.008-.492.495-.327.742-.78.742-1.359 0-.515-.205-.912-.616-1.194-.41-.28-1.06-.528-1.947-.742l-1.163-.279c-.94-.226-1.687-.581-2.242-1.068-.555-.487-.832-1.14-.832-1.96 0-.587.154-1.104.463-1.55.308-.445.737-.79 1.287-1.032.55-.243 1.177-.364 1.88-.364 1.162 0 2.18.264 3.055.792.265.165.398.362.398.592 0 .172-.06.327-.18.464a.573.573 0 01-.444.206c-.104 0-.252-.05-.444-.149-.78-.421-1.628-.631-2.546-.631-.703 0-1.259.152-1.666.458-.408.305-.612.725-.612 1.26 0 .484.183.865.55 1.142.365.278.915.505 1.647.682l1.135.27c1.04.247 1.847.608 2.424 1.083.577.475.866 1.127.866 1.954 0 .6-.16 1.13-.478 1.592-.318.462-.762.82-1.33 1.075-.57.256-1.22.384-1.954.384-1.355 0-2.56-.343-3.617-1.03z"/>
  </svg>
);

// Flipkart Icon - Official blue/yellow
const FlipkartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect fill="#2874F0" width="24" height="24" rx="3"/>
    <path fill="#FFFFFF" d="M6 7h5.5c1.38 0 2.5 1.12 2.5 2.5S12.88 12 11.5 12H8v5H6V7z"/>
    <circle fill="#FFE500" cx="8" cy="7" r="1.5"/>
    <path fill="#FFFFFF" d="M8 9.5h3.5c.55 0 1 .45 1 1s-.45 1-1 1H8V9.5z"/>
  </svg>
);

// JustDial Icon - Blue/Orange official colors
const JustDialIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect fill="#FFFFFF" width="24" height="24" rx="3"/>
    <rect fill="#2C3E50" x="1" y="1" width="22" height="22" rx="2"/>
    <text x="4" y="15" fill="#3498DB" fontSize="8" fontWeight="bold" fontFamily="Arial">Just</text>
    <text x="4" y="20" fill="#E67E22" fontSize="6" fontWeight="bold" fontFamily="Arial">Dial</text>
  </svg>
);

// Swiggy Icon - Official orange with white arc
const SwiggyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect fill="#FC8019" width="24" height="24" rx="4"/>
    <path fill="#FFFFFF" d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
    <path fill="#FFFFFF" d="M12 8v8M8 12h8" strokeWidth="1.5" stroke="#FC8019"/>
    <circle fill="#FFFFFF" cx="12" cy="12" r="3"/>
    <text x="9.5" y="14.5" fill="#FC8019" fontSize="6" fontWeight="bold" fontFamily="Arial">S</text>
  </svg>
);

// Zomato Icon - Official red with spoon
const ZomatoIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect fill="#E23744" width="24" height="24" rx="4"/>
    <text x="6" y="16" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="Arial">zomato</text>
  </svg>
);

// Safe copy to clipboard with fallback
const copyToClipboard = async (text, successMessage = "Copied!") => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(successMessage);
    }
  } catch (err) {
    toast.error("Copy failed. Please copy manually.");
  }
};

export default function Integrations() {
  const { business, setBusiness, isDemo } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  
  // User plan & locations
  const [userPlan, setUserPlan] = useState(null);
  const [locations, setLocations] = useState([]);
  
  // Swiggy & Zomato setup modals
  const [swiggyModal, setSwiggyModal] = useState({ open: false, locationId: null });
  const [zomatoModal, setZomatoModal] = useState({ open: false, locationId: null });
  const [swiggyLink, setSwiggyLink] = useState("");
  const [zomatoLink, setZomatoLink] = useState("");
  
  // Amazon, Flipkart, JustDial setup modals
  const [amazonModal, setAmazonModal] = useState({ open: false, locationId: null });
  const [flipkartModal, setFlipkartModal] = useState({ open: false, locationId: null });
  const [justdialModal, setJustdialModal] = useState({ open: false, locationId: null });
  const [amazonLink, setAmazonLink] = useState("");
  const [flipkartLink, setFlipkartLink] = useState("");
  const [justdialLink, setJustdialLink] = useState("");
  
  // Modal states
  const [setupModal, setSetupModal] = useState({ open: false, platform: null, locationId: null });
  const [locationModal, setLocationModal] = useState({ open: false, editing: null });
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [reviewLink, setReviewLink] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [connecting, setConnecting] = useState(false);
  
  // New location form
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");

  // Demo data - simulate Growth plan for demo
  const DEMO_PLAN = {
    plan_name: "growth",
    max_locations: 3,
    current_locations: 1,
    can_add_location: true,
    features: ["google_integration", "facebook_integration", "amazon_integration", "flipkart_integration", "justdial_integration", "swiggy_integration", "zomato_integration", "qr_codes", "ai_responses", "email_notifications", "whatsapp_alerts", "advanced_analytics", "private_feedback", "custom_branding"]
  };
  
  const DEMO_LOCATIONS = [
    {
      location_id: "demo_loc_1",
      name: "Demo Coffee Shop - Main",
      address: "123 Demo Street, Sample City, India",
      google_review_link: "https://g.page/demo-coffee-shop/review",
      google_business_name: "Demo Coffee Shop",
      facebook_review_link: "https://facebook.com/democoffeeshop/reviews",
      facebook_page_name: "Demo Coffee FB",
      amazon_link: "https://www.amazon.in/sp?seller=DEMO123456",
      amazon_seller_name: "Demo Coffee Shop Store",
      flipkart_link: "https://www.flipkart.com/seller/demo-coffee-shop",
      flipkart_seller_name: "Demo Coffee Shop - Flipkart",
      justdial_link: "https://www.justdial.com/Sample-City/Demo-Coffee-Shop",
      justdial_business_name: "Demo Coffee Shop - JustDial",
      swiggy_link: "https://www.swiggy.com/restaurants/demo-coffee-shop-sample-city-123456",
      swiggy_restaurant_name: "Demo Coffee Shop - Swiggy",
      zomato_link: "https://www.zomato.com/sample-city/demo-coffee-shop",
      zomato_restaurant_name: "Demo Coffee Shop - Zomato",
      qr_code_id: "demo_qr_001",
      is_primary: true
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // In demo mode, use demo data
    if (isDemo) {
      setUserPlan(DEMO_PLAN);
      setLocations(DEMO_LOCATIONS);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const [planRes, locationsRes, businessRes] = await Promise.all([
        axios.get(`${API}/user/plan`, { withCredentials: true }).catch(() => null),
        axios.get(`${API}/locations`, { withCredentials: true }).catch(() => null),
        axios.get(`${API}/business`, { withCredentials: true }).catch(() => null)
      ]);
      
      if (planRes?.data) setUserPlan(planRes.data);
      if (locationsRes?.data) setLocations(locationsRes.data.locations || []);
      if (businessRes?.data) setBusiness(businessRes.data);
      
      // If no locations exist, create one from business data
      if ((!locationsRes?.data?.locations || locationsRes.data.locations.length === 0) && businessRes?.data) {
        await createInitialLocation(businessRes.data);
      }
    } catch (error) {
      console.warn("Error loading data:", error?.displayMessage || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const createInitialLocation = async (businessData) => {
    try {
      const response = await axios.post(`${API}/locations`, {
        name: businessData.name,
        address: businessData.address || ""
      }, { withCredentials: true });
      
      if (response.data.location) {
        // If business has existing integrations, connect them to this location
        const locationId = response.data.location.location_id;
        
        if (businessData.google_review_link) {
          await axios.post(`${API}/locations/${locationId}/connect/google`, {
            review_link: businessData.google_review_link,
            platform_name: businessData.google_business_name
          }, { withCredentials: true });
        }
        
        if (businessData.facebook_page_url || businessData.facebook_review_link) {
          await axios.post(`${API}/locations/${locationId}/connect/facebook`, {
            review_link: businessData.facebook_review_link || `${businessData.facebook_page_url}/reviews`,
            platform_name: businessData.facebook_page_name
          }, { withCredentials: true });
        }
        
        // Reload locations
        const locRes = await axios.get(`${API}/locations`, { withCredentials: true });
        if (locRes.data) setLocations(locRes.data.locations || []);
      }
    } catch (error) {
      console.error("Error creating initial location:", error);
    }
  };

  const handleConnectPlatform = async () => {
    if (!reviewLink.trim()) {
      toast.error("Please enter your review link");
      return;
    }
    
    setConnecting(true);
    
    try {
      const { platform, locationId } = setupModal;
      
      if (locationId) {
        // Connect to specific location
        await axios.post(`${API}/locations/${locationId}/connect/${platform}`, {
          review_link: reviewLink,
          platform_name: platformName || undefined
        }, { withCredentials: true });
      } else {
        // Connect to main business (legacy support)
        if (platform === "google") {
          await axios.post(`${API}/google/connect`, {
            place_id: `google_${Date.now()}`,
            name: platformName || business?.name,
            review_link: reviewLink
          }, { withCredentials: true });
        } else {
          await axios.post(`${API}/facebook/connect`, {
            page_id: `fb_${Date.now()}`,
            name: platformName || business?.name,
            url: reviewLink.replace("/reviews", ""),
            review_link: reviewLink.includes("/reviews") ? reviewLink : `${reviewLink}/reviews`
          }, { withCredentials: true });
        }
      }
      
      toast.success(`${platform === "google" ? "Google" : "Facebook"} connected successfully! 🎉`);
      setSetupModal({ open: false, platform: null, locationId: null });
      setReviewLink("");
      setPlatformName("");
      loadData();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Failed to connect. Please try again.";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (locationId, platform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform === "google" ? "Google" : "Facebook"}?`)) {
      return;
    }
    
    try {
      if (locationId) {
        await axios.post(`${API}/locations/${locationId}/disconnect/${platform}`, {}, { withCredentials: true });
      } else {
        await axios.post(`${API}/platforms/${platform}/disconnect`, {}, { withCredentials: true });
      }
      
      toast.success("Platform disconnected");
      loadData();
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const handleSync = async (platform) => {
    setSyncing({ ...syncing, [platform]: true });
    
    try {
      await axios.post(`${API}/reviews/sync`, null, {
        params: { platform },
        withCredentials: true,
      });
      
      toast.success(`Reviews synced from ${platform}!`);
    } catch (error) {
      toast.error("Sync failed. Please try again.");
    } finally {
      setSyncing({ ...syncing, [platform]: false });
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error("Please enter a location name");
      return;
    }
    
    // Check plan limits before creating
    const maxLocations = userPlan?.max_locations || 1;
    if (locations.length >= maxLocations) {
      setLocationModal({ open: false, editing: null });
      setUpgradeModal(true);
      return;
    }
    
    try {
      await axios.post(`${API}/locations`, {
        name: newLocationName,
        address: newLocationAddress || null
      }, { withCredentials: true });
      
      toast.success("Location created! 🎉");
      setLocationModal({ open: false, editing: null });
      setNewLocationName("");
      setNewLocationAddress("");
      loadData();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Failed to create location";
      // Check if it's a plan limit error
      if (errorMsg.toLowerCase().includes("limit") || errorMsg.toLowerCase().includes("upgrade")) {
        setLocationModal({ open: false, editing: null });
        setUpgradeModal(true);
      } else {
        toast.error(typeof errorMsg === 'string' ? errorMsg : "Failed to create location");
      }
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm("Are you sure you want to delete this location? The QR code will stop working.")) {
      return;
    }
    
    try {
      await axios.delete(`${API}/locations/${locationId}`, { withCredentials: true });
      toast.success("Location deleted. You can now add a new location.");
      loadData();
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  // Swiggy Connect
  const handleSwiggyConnect = async (locationId) => {
    if (!swiggyLink.trim()) {
      toast.error("Please enter your Swiggy link");
      return;
    }
    
    if (!swiggyLink.toLowerCase().includes("swiggy")) {
      toast.error("Please enter a valid Swiggy link");
      return;
    }
    
    try {
      await axios.post(`${API}/swiggy/connect-location/${locationId}`, {
        swiggy_link: swiggyLink
      }, { withCredentials: true });
      
      toast.success("Swiggy connected successfully! 🎉");
      setSwiggyModal({ open: false, locationId: null });
      setSwiggyLink("");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to connect Swiggy");
    }
  };

  // Zomato Connect
  const handleZomatoConnect = async (locationId) => {
    if (!zomatoLink.trim()) {
      toast.error("Please enter your Zomato link");
      return;
    }
    
    if (!zomatoLink.toLowerCase().includes("zomato")) {
      toast.error("Please enter a valid Zomato link");
      return;
    }
    
    try {
      await axios.post(`${API}/zomato/connect-location/${locationId}`, {
        zomato_link: zomatoLink
      }, { withCredentials: true });
      
      toast.success("Zomato connected successfully! 🎉");
      setZomatoModal({ open: false, locationId: null });
      setZomatoLink("");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to connect Zomato");
    }
  };

  // Amazon Connect
  const handleAmazonConnect = async (locationId) => {
    if (!amazonLink.trim()) {
      toast.error("Please enter your Amazon seller/store link");
      return;
    }
    
    if (!amazonLink.toLowerCase().includes("amazon")) {
      toast.error("Please enter a valid Amazon link");
      return;
    }
    
    try {
      await axios.post(`${API}/amazon/connect-location/${locationId}`, {
        amazon_link: amazonLink
      }, { withCredentials: true });
      
      toast.success("Amazon connected successfully! 🎉");
      setAmazonModal({ open: false, locationId: null });
      setAmazonLink("");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to connect Amazon");
    }
  };

  // Flipkart Connect
  const handleFlipkartConnect = async (locationId) => {
    if (!flipkartLink.trim()) {
      toast.error("Please enter your Flipkart seller link");
      return;
    }
    
    if (!flipkartLink.toLowerCase().includes("flipkart")) {
      toast.error("Please enter a valid Flipkart link");
      return;
    }
    
    try {
      await axios.post(`${API}/flipkart/connect-location/${locationId}`, {
        flipkart_link: flipkartLink
      }, { withCredentials: true });
      
      toast.success("Flipkart connected successfully! 🎉");
      setFlipkartModal({ open: false, locationId: null });
      setFlipkartLink("");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to connect Flipkart");
    }
  };

  // JustDial Connect
  const handleJustdialConnect = async (locationId) => {
    if (!justdialLink.trim()) {
      toast.error("Please enter your JustDial business link");
      return;
    }
    
    if (!justdialLink.toLowerCase().includes("justdial")) {
      toast.error("Please enter a valid JustDial link");
      return;
    }
    
    try {
      await axios.post(`${API}/justdial/connect-location/${locationId}`, {
        justdial_link: justdialLink
      }, { withCredentials: true });
      
      toast.success("JustDial connected successfully! 🎉");
      setJustdialModal({ open: false, locationId: null });
      setJustdialLink("");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to connect JustDial");
    }
  };

  const handleAddLocationClick = () => {
    // Check plan limits before opening modal
    const maxLocations = userPlan?.max_locations || 1;
    if (locations.length >= maxLocations) {
      setUpgradeModal(true);
    } else {
      setLocationModal({ open: true, editing: null });
    }
  };

  const openConnectModal = (platform, locationId = null) => {
    setSetupModal({ open: true, platform, locationId });
    setReviewLink("");
    setPlatformName("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const canAddLocation = userPlan?.can_add_location || locations.length < (userPlan?.max_locations || 1);
  const hasFacebookFeature = userPlan?.features?.includes("facebook_integration") || 
                             userPlan?.features?.includes("all_platforms") ||
                             userPlan?.plan_name === "growth" || 
                             userPlan?.plan_name === "enterprise";
  const isEnterprise = userPlan?.plan_name === "enterprise";
  const isGrowth = userPlan?.plan_name === "growth";

  // Plan display helper
  const getPlanDisplayName = () => {
    switch(userPlan?.plan_name) {
      case "enterprise": return "Enterprise";
      case "growth": return "Growth";
      default: return "Starter";
    }
  };

  const getPlanBadgeColor = () => {
    switch(userPlan?.plan_name) {
      case "enterprise": return "bg-gradient-to-r from-amber-500 to-orange-500";
      case "growth": return "bg-gradient-to-r from-indigo-500 to-purple-600";
      default: return "bg-gradient-to-r from-slate-500 to-slate-600";
    }
  };

  return (
    <div className="space-y-8" data-testid="integrations-page">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-4"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">Platform Integrations</span>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Connect Your Review Platforms
        </h1>
        <p className="text-slate-600">
          Connect all 7 platforms to collect reviews. Settings are saved automatically.
        </p>
      </div>

      {/* Plan Status Banner */}
      {userPlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-4xl mx-auto p-4 rounded-2xl border ${
            isEnterprise 
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" 
              : isGrowth 
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100"
                : "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${getPlanBadgeColor()} flex items-center justify-center`}>
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{getPlanDisplayName()} Plan</p>
                  {isEnterprise && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs">Unlimited</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {isEnterprise 
                    ? `${locations.length} locations (unlimited)` 
                    : `${locations.length} of ${userPlan.max_locations} locations used`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEnterprise && !canAddLocation && (
                <Button
                  size="sm"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  onClick={() => window.location.href = "/#pricing"}
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Upgrade Plan
                </Button>
              )}
              {isEnterprise && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Features Unlocked
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Benefits Bar */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {[
          { icon: Zap, label: "Auto-Saved", color: "text-amber-600" },
          { icon: Shield, label: "Secure", color: "text-emerald-600" },
          { icon: Globe, label: "Works Instantly", color: "text-blue-600" },
        ].map((benefit) => (
          <div key={benefit.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
            <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
            <span className="text-slate-600 font-medium">{benefit.label}</span>
          </div>
        ))}
      </div>

      {/* Locations Grid */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Location Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleAddLocationClick}
            variant="outline"
            className={`w-full h-16 rounded-2xl border-2 border-dashed ${
              canAddLocation 
                ? "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-600" 
                : "border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-600"
            }`}
          >
            {canAddLocation ? (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add New Location
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Add More Locations
              </>
            )}
          </Button>
        </motion.div>

        {/* Location Cards */}
        {locations.map((location, index) => (
          <motion.div
            key={location.location_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-0 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold">{location.name}</CardTitle>
                        {location.is_primary && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Primary</Badge>
                        )}
                      </div>
                      {location.address && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {location.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLocation(location.location_id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Delete location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Google Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.google_review_link 
                      ? "bg-emerald-50 border-emerald-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GoogleIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">Google Reviews</span>
                      </div>
                      <Badge className={location.google_review_link 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-slate-100 text-slate-600"
                      }>
                        {location.google_review_link ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    {location.google_review_link ? (
                      <div className="space-y-3">
                        <p className="text-sm text-emerald-700 font-medium">
                          {location.google_business_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(location.google_review_link, "Link copied!")}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(location.location_id, "google")}
                            className="rounded-lg text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => openConnectModal("google", location.location_id)}
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect Google
                      </Button>
                    )}
                  </div>

                  {/* Facebook Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.facebook_review_link || location.facebook_page_url
                      ? "bg-indigo-50 border-indigo-200" 
                      : "bg-slate-50 border-slate-200"
                  } ${!hasFacebookFeature ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FacebookIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">Facebook</span>
                      </div>
                      {!hasFacebookFeature ? (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Crown className="w-3 h-3 mr-1" />
                          Growth+
                        </Badge>
                      ) : (
                        <Badge className={location.facebook_review_link || location.facebook_page_url
                          ? "bg-indigo-100 text-indigo-700" 
                          : "bg-slate-100 text-slate-600"
                        }>
                          {location.facebook_review_link || location.facebook_page_url ? "Connected" : "Not Connected"}
                        </Badge>
                      )}
                    </div>
                    
                    {!hasFacebookFeature ? (
                      <div className="text-center py-2">
                        <p className="text-xs text-slate-500 mb-2">Upgrade to Growth plan</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs"
                          onClick={() => window.location.href = "/#pricing"}
                        >
                          Upgrade
                        </Button>
                      </div>
                    ) : location.facebook_review_link || location.facebook_page_url ? (
                      <div className="space-y-3">
                        <p className="text-sm text-indigo-700 font-medium">
                          {location.facebook_page_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(
                              location.facebook_review_link || `${location.facebook_page_url}/reviews`, 
                              "Link copied!"
                            )}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(location.location_id, "facebook")}
                            className="rounded-lg text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => openConnectModal("facebook", location.location_id)}
                        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect Facebook
                      </Button>
                    )}
                  </div>
                </div>

                {/* Swiggy & Zomato Row */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                  {/* Swiggy Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.swiggy_link 
                      ? "bg-orange-50 border-orange-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <SwiggyIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">Swiggy</span>
                      </div>
                      <Badge className={location.swiggy_link 
                        ? "bg-orange-100 text-orange-700" 
                        : "bg-slate-100 text-slate-600"
                      }>
                        {location.swiggy_link ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    {location.swiggy_link ? (
                      <div className="space-y-3">
                        <p className="text-sm text-orange-700 font-medium truncate">
                          {location.swiggy_restaurant_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(location.swiggy_link, "Swiggy link copied!")}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(location.swiggy_link, "_blank")}
                            className="rounded-lg text-xs text-orange-600 hover:bg-orange-50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSwiggyModal({ open: true, locationId: location.location_id })}
                        className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect Swiggy
                      </Button>
                    )}
                  </div>

                  {/* Zomato Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.zomato_link 
                      ? "bg-red-50 border-red-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ZomatoIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">Zomato</span>
                      </div>
                      <Badge className={location.zomato_link 
                        ? "bg-red-100 text-red-700" 
                        : "bg-slate-100 text-slate-600"
                      }>
                        {location.zomato_link ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    {location.zomato_link ? (
                      <div className="space-y-3">
                        <p className="text-sm text-red-700 font-medium truncate">
                          {location.zomato_restaurant_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(location.zomato_link, "Zomato link copied!")}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(location.zomato_link, "_blank")}
                            className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setZomatoModal({ open: true, locationId: location.location_id })}
                        className="w-full rounded-lg bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect Zomato
                      </Button>
                    )}
                  </div>
                </div>

                {/* Amazon, Flipkart, JustDial Row */}
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  {/* Amazon Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.amazon_link 
                      ? "bg-amber-50 border-amber-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AmazonIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">Amazon</span>
                      </div>
                      <Badge className={location.amazon_link 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-slate-100 text-slate-600"
                      }>
                        {location.amazon_link ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    {location.amazon_link ? (
                      <div className="space-y-3">
                        <p className="text-sm text-amber-700 font-medium truncate">
                          {location.amazon_seller_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(location.amazon_link, "Amazon link copied!")}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(location.amazon_link, "_blank")}
                            className="rounded-lg text-xs text-amber-600 hover:bg-amber-50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setAmazonModal({ open: true, locationId: location.location_id })}
                        className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect Amazon
                      </Button>
                    )}
                  </div>

                  {/* Flipkart Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.flipkart_link 
                      ? "bg-blue-50 border-blue-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FlipkartIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">Flipkart</span>
                      </div>
                      <Badge className={location.flipkart_link 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-slate-100 text-slate-600"
                      }>
                        {location.flipkart_link ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    {location.flipkart_link ? (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700 font-medium truncate">
                          {location.flipkart_seller_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(location.flipkart_link, "Flipkart link copied!")}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(location.flipkart_link, "_blank")}
                            className="rounded-lg text-xs text-blue-600 hover:bg-blue-50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setFlipkartModal({ open: true, locationId: location.location_id })}
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect Flipkart
                      </Button>
                    )}
                  </div>

                  {/* JustDial Integration */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    location.justdial_link 
                      ? "bg-yellow-50 border-yellow-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <JustDialIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-900">JustDial</span>
                      </div>
                      <Badge className={location.justdial_link 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-slate-100 text-slate-600"
                      }>
                        {location.justdial_link ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    
                    {location.justdial_link ? (
                      <div className="space-y-3">
                        <p className="text-sm text-yellow-700 font-medium truncate">
                          {location.justdial_business_name || location.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(location.justdial_link, "JustDial link copied!")}
                            className="flex-1 rounded-lg text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(location.justdial_link, "_blank")}
                            className="rounded-lg text-xs text-yellow-600 hover:bg-yellow-50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setJustdialModal({ open: true, locationId: location.location_id })}
                        className="w-full rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect JustDial
                      </Button>
                    )}
                  </div>
                </div>

                {/* QR Code Info - Persistent ID */}
                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-slate-700">
                        QR Code ID: <code className="text-xs bg-white px-2 py-1 rounded font-mono font-bold text-amber-700">{location.qr_code_id}</code>
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-indigo-600 hover:bg-indigo-50"
                      onClick={() => window.location.href = "/qr-generator"}
                    >
                      Generate QR
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    This ID is permanent. Update location details without changing QR code.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* No Locations Message */}
        {locations.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Locations Yet</h3>
            <p className="text-slate-500 mb-4">Add your first business location to get started</p>
            <Button onClick={() => setLocationModal({ open: true, editing: null })}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        )}
      </div>

      {/* Pro Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Your settings are saved automatically</h3>
              <p className="text-amber-800 text-sm">
                Once you connect Google or Facebook, your integration stays active forever. 
                You can edit or disconnect anytime from this page.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connect Platform Modal */}
      <Dialog open={setupModal.open} onOpenChange={(open) => {
        if (!open) {
          setSetupModal({ open: false, platform: null, locationId: null });
          setReviewLink("");
          setPlatformName("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {setupModal.platform === "google" ? (
                <GoogleIcon className="w-6 h-6" />
              ) : (
                <FacebookIcon className="w-6 h-6" />
              )}
              Connect {setupModal.platform === "google" ? "Google Reviews" : "Facebook Page"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Instructions */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {setupModal.platform === "google" 
                  ? "How to get your Google Review link" 
                  : "How to get your Facebook Review link"}
              </h4>
              {setupModal.platform === "google" ? (
                <div className="space-y-3">
                  <p className="text-sm text-blue-800 font-medium">From Google Business Profile:</p>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>Sign in to <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-600">Google Business Profile</a></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>Select your business</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>Click <strong>&quot;Ask for reviews&quot;</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      <span>Copy the review link shown</span>
                    </li>
                  </ol>
                  <a 
                    href="https://business.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors mt-2"
                  >
                    <Globe className="w-4 h-4" />
                    Open Google Business Profile
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>Open your <a href="https://www.facebook.com/pages" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-600">Facebook Business Page</a></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>Click the <strong>Reviews</strong> (or Recommendations) tab</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>Click <strong>&quot;Write a review&quot;</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      <span>Copy the page URL from the browser</span>
                    </li>
                  </ol>
                  <a 
                    href="https://www.facebook.com/pages" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors mt-2"
                  >
                    <Globe className="w-4 h-4" />
                    Open Facebook Pages
                  </a>
                </div>
              )}
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Paste your {setupModal.platform === "google" ? "Google Review" : "Facebook Page"} link:
                </label>
                <Input
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder={
                    setupModal.platform === "google"
                      ? "https://g.page/r/..."
                      : "https://www.facebook.com/yourbusiness/reviews"
                  }
                  className="h-12 rounded-xl"
                  data-testid="review-link-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Business Name (optional):
                </label>
                <Input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="Your business name on the platform"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnectPlatform}
              disabled={connecting || !reviewLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              data-testid="confirm-connect-btn"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Connect & Save
                </>
              )}
            </Button>

            <p className="text-xs text-center text-slate-500">
              Your settings will be saved permanently to your account.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Location Modal */}
      <Dialog open={locationModal.open} onOpenChange={(open) => {
        if (!open) {
          setLocationModal({ open: false, editing: null });
          setNewLocationName("");
          setNewLocationAddress("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-indigo-600" />
              Add New Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Location Name *
              </label>
              <Input
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="e.g., Downtown Branch, Main Street Location"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Address (optional)
              </label>
              <Input
                value={newLocationAddress}
                onChange={(e) => setNewLocationAddress(e.target.value)}
                placeholder="123 Main Street, City"
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={handleCreateLocation}
              disabled={!newLocationName.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Modal */}
      <Dialog open={upgradeModal} onOpenChange={setUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-amber-500" />
              Upgrade Your Plan
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Warning */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Location Limit Reached</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your <span className="font-semibold capitalize">{userPlan?.plan_name || 'current'} Plan</span> allows {userPlan?.max_locations || 1} location(s). 
                    You currently have {locations.length} location(s).
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <p className="text-sm text-slate-600">To add more locations, you can:</p>
              
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">Upgrade to Growth Plan</p>
                    <p className="text-xs text-indigo-700">Get up to 3 locations + Facebook integration</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Upgrade to Enterprise</p>
                    <p className="text-xs text-purple-700">Unlimited locations + all premium features</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Delete an Existing Location</p>
                    <p className="text-xs text-slate-500">Free up a slot to add a new location</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setUpgradeModal(false)}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setUpgradeModal(false);
                  window.location.href = "/#pricing";
                }}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swiggy Setup Modal */}
      <Dialog open={swiggyModal.open} onOpenChange={(open) => {
        if (!open) {
          setSwiggyModal({ open: false, locationId: null });
          setSwiggyLink("");
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <SwiggyIcon className="w-6 h-6" />
              Connect Swiggy
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Step by Step Guide */}
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How to get your Swiggy link
              </h4>
              
              <div className="space-y-4 text-sm">
                {/* Option 1 */}
                <div>
                  <p className="font-medium text-orange-800 mb-2">Option 1: Use Swiggy Smart Link (Recommended)</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-orange-700">
                    <li>Open the <strong>Swiggy Owner/Partner app</strong> and log in</li>
                    <li>Go to <strong>Growth/Marketing</strong> section</li>
                    <li>Look for <strong>&quot;Smart Link&quot;</strong> or <strong>&quot;Swiggy Smart Link&quot;</strong></li>
                    <li>Select your brand/outlet and tap <strong>Continue</strong></li>
                    <li>Copy the generated Smart Link</li>
                    <li>Paste it below</li>
                  </ol>
                </div>

                <div className="border-t border-orange-200 pt-3">
                  <p className="font-medium text-orange-800 mb-2">Option 2: Copy your Swiggy listing URL</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-orange-700">
                    <li>Open the <strong>Swiggy customer app</strong></li>
                    <li>Search and open your restaurant page</li>
                    <li>Tap <strong>Share</strong> &gt; <strong>Copy link</strong></li>
                    <li>Paste the URL below</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Paste your Swiggy link:
              </label>
              <Input
                value={swiggyLink}
                onChange={(e) => setSwiggyLink(e.target.value)}
                placeholder="https://www.swiggy.com/restaurants/..."
                className="h-12 rounded-xl"
              />
            </div>

            {/* Connect Button */}
            <Button
              onClick={() => handleSwiggyConnect(swiggyModal.locationId)}
              disabled={!swiggyLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Connect Swiggy
            </Button>

            <p className="text-xs text-center text-slate-500">
              Customers scanning your QR will be able to order on Swiggy and rate you.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zomato Setup Modal */}
      <Dialog open={zomatoModal.open} onOpenChange={(open) => {
        if (!open) {
          setZomatoModal({ open: false, locationId: null });
          setZomatoLink("");
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <ZomatoIcon className="w-6 h-6" />
              Connect Zomato
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Step by Step Guide */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How to get your Zomato link
              </h4>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-red-700">
                <li>Open the <strong>Zomato app</strong> or visit <strong>zomato.com</strong></li>
                <li>Search for your restaurant and open its page</li>
                <li>Tap the <strong>Share</strong> button (or copy URL from browser)</li>
                <li>Choose <strong>Copy link</strong></li>
                <li>Paste the URL below</li>
              </ol>

              <div className="mt-3 p-3 bg-white rounded-lg border border-red-100">
                <p className="text-xs text-red-600">
                  <strong>Tip:</strong> When customers open your Zomato link in the Zomato app, 
                  they can add ratings and reviews directly from their account.
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Paste your Zomato link:
              </label>
              <Input
                value={zomatoLink}
                onChange={(e) => setZomatoLink(e.target.value)}
                placeholder="https://www.zomato.com/..."
                className="h-12 rounded-xl"
              />
            </div>

            {/* Connect Button */}
            <Button
              onClick={() => handleZomatoConnect(zomatoModal.locationId)}
              disabled={!zomatoLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Connect Zomato
            </Button>

            <p className="text-xs text-center text-slate-500">
              Customers scanning your QR will be able to discover and rate you on Zomato.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Amazon Setup Modal */}
      <Dialog open={amazonModal.open} onOpenChange={(open) => {
        if (!open) {
          setAmazonModal({ open: false, locationId: null });
          setAmazonLink("");
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AmazonIcon className="w-6 h-6" />
              Connect Amazon
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How to get your Amazon link
              </h4>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-amber-700">
                <li>Go to your <strong>Amazon Seller Central</strong></li>
                <li>Navigate to your <strong>Storefront</strong> or <strong>Product page</strong></li>
                <li>Copy the <strong>store URL</strong> or <strong>product URL</strong></li>
                <li>Paste the link below</li>
              </ol>

              <div className="mt-3 p-3 bg-white rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600">
                  <strong>Tip:</strong> Customers can leave product reviews and seller feedback on Amazon.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Paste your Amazon store/product link:
              </label>
              <Input
                value={amazonLink}
                onChange={(e) => setAmazonLink(e.target.value)}
                placeholder="https://www.amazon.in/sp?seller=..."
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={() => handleAmazonConnect(amazonModal.locationId)}
              disabled={!amazonLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Connect Amazon
            </Button>

            <p className="text-xs text-center text-slate-500">
              Customers scanning your QR will be able to review your products on Amazon.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flipkart Setup Modal */}
      <Dialog open={flipkartModal.open} onOpenChange={(open) => {
        if (!open) {
          setFlipkartModal({ open: false, locationId: null });
          setFlipkartLink("");
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FlipkartIcon className="w-6 h-6" />
              Connect Flipkart
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How to get your Flipkart link
              </h4>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Go to <strong>Flipkart Seller Hub</strong></li>
                <li>Navigate to your <strong>Store page</strong> or <strong>Product listing</strong></li>
                <li>Copy the <strong>store URL</strong> or <strong>product URL</strong></li>
                <li>Paste the link below</li>
              </ol>

              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600">
                  <strong>Tip:</strong> Customers can rate products and leave seller reviews on Flipkart.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Paste your Flipkart store/product link:
              </label>
              <Input
                value={flipkartLink}
                onChange={(e) => setFlipkartLink(e.target.value)}
                placeholder="https://www.flipkart.com/seller/..."
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={() => handleFlipkartConnect(flipkartModal.locationId)}
              disabled={!flipkartLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Connect Flipkart
            </Button>

            <p className="text-xs text-center text-slate-500">
              Customers scanning your QR will be able to review your products on Flipkart.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* JustDial Setup Modal */}
      <Dialog open={justdialModal.open} onOpenChange={(open) => {
        if (!open) {
          setJustdialModal({ open: false, locationId: null });
          setJustdialLink("");
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <JustDialIcon className="w-6 h-6" />
              Connect JustDial
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How to get your JustDial link
              </h4>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                <li>Go to <strong>justdial.com</strong> and search for your business</li>
                <li>Open your <strong>business listing page</strong></li>
                <li>Copy the <strong>URL from browser</strong></li>
                <li>Paste the link below</li>
              </ol>

              <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-100">
                <p className="text-xs text-yellow-700">
                  <strong>Tip:</strong> Claim your JustDial listing for free to manage reviews and respond to customers.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Paste your JustDial business link:
              </label>
              <Input
                value={justdialLink}
                onChange={(e) => setJustdialLink(e.target.value)}
                placeholder="https://www.justdial.com/..."
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={() => handleJustdialConnect(justdialModal.locationId)}
              disabled={!justdialLink.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Connect JustDial
            </Button>

            <p className="text-xs text-center text-slate-500">
              Customers scanning your QR will be able to find and review you on JustDial.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
