import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import axios from "axios";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Link2,
  MessageSquare,
  BarChart3,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Webhook,
  Key,
  Play,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AnimatedLogo } from "./AnimatedLogo";
import ErrorBoundary from "./ErrorBoundary";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/integrations", label: "Integrations", icon: Link2 },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/qr-generator", label: "QR Code", icon: QrCode },
  { path: "/webhooks", label: "Webhooks", icon: Webhook },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/advanced-settings", label: "API Keys", icon: Key },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const { user, business, isDemo } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // If in demo mode, just clear session and go home
    if (isDemo) {
      sessionStorage.removeItem('demo_mode');
      toast.success("Demo session ended");
      navigate("/");
      return;
    }
    
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.warn("Logout error:", error?.displayMessage || error?.message);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white/50 backdrop-blur-xl h-screen fixed top-0 left-0 z-40"
        data-testid="desktop-sidebar"
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link to="/dashboard">
            <AnimatedLogo size="default" />
          </Link>
          {isDemo && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
              <Play className="w-3 h-3" />
              Demo Mode - No data saved
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-sky-50 text-sky-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-all"
                data-testid="user-menu-trigger"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="bg-sky-100 text-sky-600">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.name || "Demo User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {business?.name || "Demo Business"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isDemo ? "Exit Demo" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <AnimatedLogo size="small" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-sky-50 text-sky-600 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5" />
              Log out
            </button>
          </nav>
        </div>
      )}

      {/* Premium Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-safe-bottom"
        data-testid="mobile-bottom-nav"
      >
        <div className="mx-3 mb-3 glass-mobile-nav rounded-2xl p-1.5">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-sm" : ""}`} />
                  <span className={`text-[10px] font-medium mt-1 ${isActive ? "text-white/90" : ""}`}>
                    {item.label.split(' ')[0]}
                  </span>
                  {isActive && (
                    <span className="absolute -top-1 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-28 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
