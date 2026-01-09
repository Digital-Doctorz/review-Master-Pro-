import { useState, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../App";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
} from "lucide-react";

const FRONTEND_URL = window.location.origin;

export default function QRGenerator() {
  const { business } = useContext(AuthContext);
  const qrRef = useRef(null);
  const [qrSize, setQrSize] = useState("256");
  const [downloadFormat, setDownloadFormat] = useState("png");

  const reviewUrl = `${FRONTEND_URL}/review/${business?.qr_code_id}`;

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
      a.download = `${business?.name || "reviewflow"}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = parseInt(qrSize);
      canvas.width = size;
      canvas.height = size;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);

        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${business?.name || "reviewflow"}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }

    toast.success(`QR code downloaded as ${downloadFormat.toUpperCase()}`);
  };

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
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-2xl shadow-lg mb-6"
                data-testid="qr-code-container"
              >
                <QRCodeSVG
                  value={reviewUrl}
                  size={parseInt(qrSize)}
                  level="H"
                  includeMargin={true}
                  fgColor="#0F172A"
                  bgColor="#FFFFFF"
                />
              </div>

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

        {/* Instructions & Link */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                      Download the QR Code
                    </p>
                    <p className="text-sm text-slate-600">
                      Choose your preferred size and format, then download.
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
                      Place the QR code on receipts, tables, posters, or
                      checkout counters.
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
                      Customers scan the code and leave reviews directly from
                      their phones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-dashed border-sky-200 bg-sky-50/50">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-sky-500 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">
                  Customer Experience
                </h3>
                <p className="text-sm text-slate-600">
                  When customers scan the QR code, they'll see a beautiful,
                  branded page where they can leave their review with just a few
                  taps.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
