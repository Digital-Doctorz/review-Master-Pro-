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
  Star,
  Webhook,
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/integrations", label: "Integrations", icon: Link2 },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/qr-generator", label: "QR Code", icon: QrCode },
  { path: "/webhooks", label: "Webhooks", icon: Webhook },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const { user, business } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
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
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight-custom">
              ReviewFlow
            </span>
          </Link>
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
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {business?.name}
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
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">ReviewFlow</span>
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

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 glass-nav rounded-full p-2 flex justify-around z-50"
        data-testid="mobile-bottom-nav"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-full transition-all ${
                isActive
                  ? "bg-sky-100 text-sky-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
