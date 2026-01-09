import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "../App";
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
  Star,
  Building2,
  MapPin,
  Phone,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

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

export default function Onboarding() {
  const { user, setBusiness } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Restaurant",
    address: "",
    phone: "",
    website: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter your business name");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/business`, formData, {
        withCredentials: true,
      });

      // Complete setup
      await axios.post(`${API}/business/complete-setup`, {}, {
        withCredentials: true,
      });

      // Fetch the created business
      const bizResponse = await axios.get(`${API}/business`, {
        withCredentials: true,
      });

      setBusiness(bizResponse.data);
      toast.success("Business created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error(error.response?.data?.detail || "Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      {/* Background Decoration */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight-custom">
              ReviewFlow
            </span>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-600">
              Let's set up your business profile in just a minute.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-20 h-2 rounded-full transition-all ${
                  step >= s
                    ? "bg-gradient-to-r from-sky-500 to-teal-400"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Business Name *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="name"
                        placeholder="Your Business Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-100"
                        data-testid="business-name-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-700">
                      Business Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger
                        className="h-12 rounded-xl border-slate-200"
                        data-testid="category-select"
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

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                    data-testid="next-step-btn"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-700">
                      Business Address (Optional)
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="address"
                        placeholder="123 Main St, City"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        data-testid="address-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      Phone Number (Optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        data-testid="phone-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-slate-700">
                      Website (Optional)
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="website"
                        placeholder="https://yourbusiness.com"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        data-testid="website-input"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-xl border-slate-200"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white"
                      data-testid="complete-setup-btn"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Complete Setup
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Info Card */}
          <div className="mt-8 p-4 rounded-xl bg-sky-50 border border-sky-100">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-sky-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-sky-900">
                  Quick Setup
                </p>
                <p className="text-sm text-sky-700">
                  You can always update these details later in Settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
