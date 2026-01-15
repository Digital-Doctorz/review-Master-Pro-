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
  User,
  ChevronRight,
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

// Bottom nav - only show essential items (max 5)
const bottomNavItems = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/analytics", label: "Stats", icon: BarChart3 },
  { path: "/qr-generator", label: "QR", icon: QrCode },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white/80 backdrop-blur-xl h-screen fixed top-0 left-0 z-40 shadow-sm"
        data-testid="desktop-sidebar"
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <Link to="/dashboard" className="block">
            <AnimatedLogo size="default" />
          </Link>
          {isDemo && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-medium border border-amber-200">
              <Play className="w-3 h-3" />
              Demo Mode - No data saved
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-3 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-all group"
                data-testid="user-menu-trigger"
              >
                <Avatar className="w-10 h-10 ring-2 ring-slate-100">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                    {user?.name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || "Demo User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {business?.name || "Demo Business"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
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
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <AnimatedLogo size="small" />
          </Link>
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Demo
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full Screen Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/98 backdrop-blur-xl pt-16 safe-area-top overflow-y-auto">
          {/* User Profile Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50">
              <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-semibold">
                  {user?.name?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {user?.name || "Demo User"}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {business?.name || "Demo Business"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span className="font-medium">{item.label}</span>
                  {!isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - Fixed at bottom of menu, not hidden */}
          <div className="p-4 mt-auto border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 active:bg-red-200 transition-colors"
              data-testid="mobile-logout-btn"
            >
              <LogOut className="w-5 h-5" />
              {isDemo ? "Exit Demo" : "Log out"}
            </button>
          </div>
        </div>
      )}

      {/* Premium Mobile Bottom Nav - Only 4 essential items */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
        data-testid="mobile-bottom-nav"
      >
        <div className="mx-3 mb-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-1.5">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-sm" : ""}`} />
                  <span className={`text-[10px] font-medium mt-1 ${isActive ? "text-white/90" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
            {/* Menu button in bottom nav */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-2.5 px-5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
