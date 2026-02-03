import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Menu,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

const navigation = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Candidates", page: "Candidates", icon: Users },
  { name: "Interviews", page: "Interviews", icon: Calendar },
  { name: "Learnerships", page: "Learnerships", icon: UserCheck },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <UserNotRegisteredError />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a467dbc5ffbfc5d089da6/27c2b7417_SSDSLogo.jpg" 
            alt="SSDS Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-slate-900">SSDSRecruitment</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a467dbc5ffbfc5d089da6/27c2b7417_SSDSLogo.jpg" 
              alt="SSDS Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-bold text-slate-900 text-lg">SSDSRecruitment</h1>
              <p className="text-xs text-slate-500">Recruitment Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 mt-16 lg:mt-0">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-100 space-y-3">
            {user?.role === 'admin' && (
              <Link
                to={createPageUrl("Admin")}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  currentPageName === "Admin"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Settings className={cn("w-5 h-5", currentPageName === "Admin" ? "text-blue-600" : "text-slate-400")} />
                Administration
              </Link>
            )}
            <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <p className="text-xs text-slate-500">Powered by</p>
              <p className="text-sm font-medium text-slate-700">Base44</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}