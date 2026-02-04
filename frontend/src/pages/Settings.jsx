import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Save,
  User,
  RefreshCw,
  CreditCard,
  Crown,
  Zap,
  ChevronRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  "Restaurant",
  "Cafe",
  "Retail Store",
  "Salon & Spa",
  "Hotel",
  "Healthcare",
  "Automotive",
  "Professional Services",
  "Fitness & Gym",
  "Other",
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, business, setBusiness, isDemo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [planStatus, setPlanStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: business?.name || (isDemo ? "Demo Coffee Shop" : ""),
    category: business?.category || "Restaurant",
    address: business?.address || (isDemo ? "123 Demo Street, Sample City" : ""),
    phone: business?.phone || (isDemo ? "+1 (555) 123-4567" : ""),
    website: business?.website || (isDemo ? "https://democoffeeshop.com" : ""),
  });

  // Fetch plan status
  useEffect(() => {
    const fetchPlanStatus = async () => {
      if (isDemo) {
        setPlanStatus({
          plan: "growth",
          has_active_plan: true,
          has_lifetime_access: false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        return;
      }
      try {
        const response = await axios.get(`${API}/user/plan-status`, { withCredentials: true });
        setPlanStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch plan status:", error);
      }
    };
    fetchPlanStatus();
  }, [isDemo]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (isDemo) {
      toast.info("Demo mode - settings won't be saved");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Business name is required");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/business`, formData, {
        withCredentials: true,
      });

      // Refresh business data
      const bizResponse = await axios.get(`${API}/business`, {
        withCredentials: true,
      });
      setBusiness(bizResponse.data);

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight-custom">
          Settings
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your business profile and account settings.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="bg-sky-100 text-sky-600 text-xl">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Account ID
                </p>
                <p className="font-mono text-sm text-slate-600">
                  {user?.user_id}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-500" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Business Name *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        placeholder="Your Business Name"
                        data-testid="settings-business-name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-700">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger
                        className="h-12 rounded-xl border-slate-200"
                        data-testid="settings-category"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-700">
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        placeholder="123 Main St, City"
                        data-testid="settings-address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        placeholder="+1 (555) 000-0000"
                        data-testid="settings-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website" className="text-slate-700">
                      Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        placeholder="https://yourbusiness.com"
                        data-testid="settings-website"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                    data-testid="save-settings-btn"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* QR Code ID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Business Identifier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Business ID
                </p>
                <p className="font-mono text-sm text-slate-600">
                  {business?.business_id}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  QR Code ID
                </p>
                <p className="font-mono text-sm text-slate-600">
                  {business?.qr_code_id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
