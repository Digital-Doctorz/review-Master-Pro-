import { useState, useContext, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../App";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import {
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Sparkles,
  Star,
  Palette,
  RefreshCw,
  MapPin,
  Building2,
  Info,
} from "lucide-react";

const FRONTEND_URL = window.location.origin;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Preset color themes
const COLOR_THEMES = [
  { name: "Classic", fg: "#0F172A", bg: "#FFFFFF" },
  { name: "Ocean Blue", fg: "#1E40AF", bg: "#EFF6FF" },
  { name: "Forest Green", fg: "#166534", bg: "#F0FDF4" },
  { name: "Sunset Orange", fg: "#C2410C", bg: "#FFF7ED" },
  { name: "Royal Purple", fg: "#7C3AED", bg: "#FAF5FF" },
  { name: "Rose Pink", fg: "#BE185D", bg: "#FDF2F8" },
  { name: "Slate Gray", fg: "#334155", bg: "#F1F5F9" },
  { name: "Midnight", fg: "#FFFFFF", bg: "#1E293B" },
];

// Demo locations
const DEMO_LOCATIONS = [
  { location_id: "demo_loc_1", name: "Demo Coffee Shop - Main", qr_code_id: "demo_qr_001", address: "123 Demo Street" },
];

export default function QRGenerator() {
  const { business, isDemo } = useContext(AuthContext);
  const qrRef = useRef(null);
  const [qrSize, setQrSize] = useState("256");
  const [downloadFormat, setDownloadFormat] = useState("png");
  
  // Location selection
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Customization options
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [customFgColor, setCustomFgColor] = useState("#0F172A");
  const [customBgColor, setCustomBgColor] = useState("#FFFFFF");
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [includeBranding, setIncludeBranding] = useState(true);

  useEffect(() => {
    loadLocations();
  }, [isDemo]);

  const loadLocations = async () => {
    if (isDemo) {
      setLocations(DEMO_LOCATIONS);
      setSelectedLocation(DEMO_LOCATIONS[0]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/locations`, { withCredentials: true });
      const locs = response.data.locations || [];
      setLocations(locs);
      if (locs.length > 0) {
        setSelectedLocation(locs[0]);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
      // Fall back to business QR code
      if (business?.qr_code_id) {
        setLocations([{ location_id: business.business_id, name: business.name, qr_code_id: business.qr_code_id }]);
        setSelectedLocation({ location_id: business.business_id, name: business.name, qr_code_id: business.qr_code_id });
      }
    } finally {
      setLoading(false);
    }
  };

  const reviewUrl = selectedLocation 
    ? `${FRONTEND_URL}/review/${selectedLocation.qr_code_id}` 
    : `${FRONTEND_URL}/review/${business?.qr_code_id || "demo_qr_001"}`;
  
  const currentFgColor = useCustomColors ? customFgColor : COLOR_THEMES[selectedTheme].fg;
  const currentBgColor = useCustomColors ? customBgColor : COLOR_THEMES[selectedTheme].bg;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reviewUrl);
    toast.success("Link copied to clipboard!");
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    if (downloadFormat === "svg") {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedLocation?.name || business?.name || "review-master"}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = parseInt(qrSize);
      const padding = includeBranding ? 40 : 0;
      canvas.width = size;
      canvas.height = size + padding;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
        // Add branding text if enabled
        if (includeBranding) {
          ctx.fillStyle = currentFgColor;
          ctx.font = `bold ${Math.max(12, size / 18)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("Powered by Review Master", size / 2, size + 25);
        }

        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${selectedLocation?.name || business?.name || "review-master"}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }

    toast.success(`QR code downloaded as ${downloadFormat.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="qr-generator-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
          QR Code Generator
        </h1>
        <p className="text-slate-600 mt-1">
          Generate custom QR codes for customers to leave reviews easily.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* QR Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-500" />
                Your QR Code
                {isDemo && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                    Demo
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* Location Selector */}
              {locations.length > 1 && (
                <div className="w-full mb-4">
                  <Label className="text-sm text-slate-600 mb-2 block">Select Location</Label>
                  <Select 
                    value={selectedLocation?.location_id || ""} 
                    onValueChange={(id) => {
                      const loc = locations.find(l => l.location_id === id);
                      if (loc) setSelectedLocation(loc);
                    }}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl" data-testid="location-select">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.location_id} value={loc.location_id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {loc.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Current Location Info */}
              {selectedLocation && (
                <div className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-900">{selectedLocation.name}</span>
                  </div>
                  {selectedLocation.address && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 ml-6">
                      <MapPin className="w-3 h-3" />
                      {selectedLocation.address}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 ml-6">
                    <span className="text-xs text-slate-500">QR ID:</span>
                    <code className="text-xs bg-white px-2 py-0.5 rounded font-mono text-indigo-700">{selectedLocation.qr_code_id}</code>
                  </div>
                </div>
              )}

              <div
                ref={qrRef}
                className="p-6 rounded-2xl shadow-lg mb-4 transition-colors duration-300"
                style={{ backgroundColor: currentBgColor }}
                data-testid="qr-code-container"
              >
                <QRCodeSVG
                  value={reviewUrl}
                  size={parseInt(qrSize)}
                  level="H"
                  includeMargin={true}
                  fgColor={currentFgColor}
                  bgColor={currentBgColor}
                />
              </div>
              
              {/* Powered by branding */}
              {includeBranding && (
                <p className="text-sm font-medium mb-4" style={{ color: currentFgColor }}>
                  Powered by <span className="font-bold">Review Master</span>
                </p>
              )}

              <div className="w-full space-y-4">
                {/* Size Selection */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-20">Size:</span>
                  <Select value={qrSize} onValueChange={setQrSize}>
                    <SelectTrigger className="flex-1 h-10 rounded-xl" data-testid="qr-size-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">Small (128px)</SelectItem>
                      <SelectItem value="256">Medium (256px)</SelectItem>
                      <SelectItem value="512">Large (512px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Selection */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-20">Format:</span>
                  <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                    <SelectTrigger className="flex-1 h-10 rounded-xl" data-testid="qr-format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG Image</SelectItem>
                      <SelectItem value="svg">SVG Vector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Download Button */}
                <Button
                  onClick={downloadQR}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                  data-testid="download-qr-btn"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Color Customization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-sky-500" />
                  Customize Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme Presets */}
                <div>
                  <Label className="text-sm text-slate-600 mb-2 block">Color Themes</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_THEMES.map((theme, index) => (
                      <button
                        key={theme.name}
                        onClick={() => {
                          setSelectedTheme(index);
                          setUseCustomColors(false);
                        }}
                        className={`p-2 rounded-xl border-2 transition-all ${
                          !useCustomColors && selectedTheme === index
                            ? "border-sky-500 ring-2 ring-sky-200"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        title={theme.name}
                        data-testid={`theme-${index}`}
                      >
                        <div
                          className="w-full h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: theme.bg }}
                        >
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: theme.fg }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm text-slate-600">Custom Colors</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseCustomColors(!useCustomColors)}
                      className={`text-xs ${useCustomColors ? "text-sky-600" : "text-slate-400"}`}
                    >
                      {useCustomColors ? "Using Custom" : "Use Custom"}
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 mb-1 block">QR Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customFgColor}
                          onChange={(e) => {
                            setCustomFgColor(e.target.value);
                            setUseCustomColors(true);
                          }}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={customFgColor}
                          onChange={(e) => {
                            setCustomFgColor(e.target.value);
                            setUseCustomColors(true);
                          }}
                          className="flex-1 h-10 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 mb-1 block">Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customBgColor}
                          onChange={(e) => {
                            setCustomBgColor(e.target.value);
                            setUseCustomColors(true);
                          }}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={customBgColor}
                          onChange={(e) => {
                            setCustomBgColor(e.target.value);
                            setUseCustomColors(true);
                          }}
                          className="flex-1 h-10 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branding Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <Label className="text-sm text-slate-700 font-medium">Include Branding</Label>
                    <p className="text-xs text-slate-500">Show "Powered by Review Master"</p>
                  </div>
                  <button
                    onClick={() => setIncludeBranding(!includeBranding)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      includeBranding ? "bg-sky-500" : "bg-slate-200"
                    }`}
                    data-testid="branding-toggle"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                        includeBranding ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Review Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-sky-500" />
                  Review Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-slate-50 font-mono text-sm text-slate-600 break-all mb-4">
                  {reviewUrl}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="flex-1 h-10 rounded-xl"
                    data-testid="copy-link-btn"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(reviewUrl, "_blank")}
                    className="flex-1 h-10 rounded-xl"
                    data-testid="preview-link-btn"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How to Use */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Customize & Download
                    </p>
                    <p className="text-sm text-slate-600">
                      Choose colors, size, and download your branded QR code.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Print & Display
                    </p>
                    <p className="text-sm text-slate-600">
                      Place on receipts, tables, posters, or checkout counters.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Collect Reviews
                    </p>
                    <p className="text-sm text-slate-600">
                      Customers scan and leave reviews from their phones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Demo Notice */}
          {isDemo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Demo QR Code
                  </h3>
                  <p className="text-sm text-slate-600">
                    This QR code works! Scan it to see the full customer review experience.
                    In your real account, reviews will be saved to your dashboard.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="text-center py-4 border-t border-slate-100">
        <p className="text-sm text-slate-400">
          Powered by <span className="font-semibold text-slate-500">Review Master</span> • 
          <span className="ml-1">The #1 Review Management Platform</span>
        </p>
      </div>
    </div>
  );
}
