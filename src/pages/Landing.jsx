import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Loader2, Video, FileText, ClipboardCheck, UserSquare2 } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        // User not authenticated, stay on landing page
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a467dbc5ffbfc5d089da6/27c2b7417_SSDSLogo.jpg" 
              alt="SSDS Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">SSDS Learner Hub</h1>
            <p className="text-slate-600">Learner Management & Training Platform</p>
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin} 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
          >
            Sign In to Continue
          </Button>

          {/* Features List */}
          <div className="mt-8 pt-8 border-t space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span>Enroll learners, track cohorts, and manage facilitators</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 text-indigo-600" />
              </div>
              <span>Schedule meetings and host secure video sessions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <span>Upload PDFs, videos, and PowerPoint learning materials</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <span>Monitor learner progress with real-time dashboards</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-4 h-4 text-purple-600" />
              </div>
              <span>Timed assessments with auto-marking and facilitator review</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserSquare2 className="w-4 h-4 text-rose-600" />
              </div>
              <span>Face verification and anti-cheat monitoring for exams</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-white/80">
          Powered by Base44 • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
