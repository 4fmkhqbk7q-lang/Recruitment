import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CalendarClock, 
  CheckCircle, 
  UserPlus,
  Briefcase,
  Clock,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => base44.entities.Candidate.list("-created_date"),
  });

  const { data: interviews = [], isLoading: loadingInterviews } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => base44.entities.Interview.list("-interview_date"),
  });

  const { data: hiredCandidates = [], isLoading: loadingHired } = useQuery({
    queryKey: ["hiredCandidates"],
    queryFn: () => base44.entities.HiredCandidate.list("-hired_date"),
  });

  const stats = {
    totalCandidates: candidates.length,
    activePipeline: candidates.filter(c => !["hired", "rejected"].includes(c.status)).length,
    upcomingInterviews: interviews.filter(i => i.status === "scheduled" && new Date(i.interview_date) > new Date()).length,
    hiredThisMonth: hiredCandidates.filter(h => {
      const hiredDate = new Date(h.hired_date);
      const now = new Date();
      return hiredDate.getMonth() === now.getMonth() && hiredDate.getFullYear() === now.getFullYear();
    }).length,
  };

  const upcomingInterviewsList = interviews
    .filter(i => i.status === "scheduled" && new Date(i.interview_date) > new Date())
    .slice(0, 5);

  const recentCandidates = candidates.slice(0, 5);

  const pipelineStages = [
    { status: "sourced", count: candidates.filter(c => c.status === "sourced").length },
    { status: "cv_vetted", count: candidates.filter(c => c.status === "cv_vetted").length },
    { status: "interview_scheduled", count: candidates.filter(c => c.status === "interview_scheduled").length },
    { status: "interviewed", count: candidates.filter(c => c.status === "interviewed").length },
    { status: "offer_made", count: candidates.filter(c => c.status === "offer_made").length },
    { status: "hired", count: candidates.filter(c => c.status === "hired").length },
  ];

  if (loadingCandidates || loadingInterviews || loadingHired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your recruitment pipeline</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Candidates" value={stats.totalCandidates} icon={Users} />
          <StatsCard title="Active Pipeline" value={stats.activePipeline} icon={Briefcase} />
          <StatsCard title="Upcoming Interviews" value={stats.upcomingInterviews} icon={CalendarClock} />
          <StatsCard title="Hired This Month" value={stats.hiredThisMonth} icon={CheckCircle} />
        </div>

        {/* Pipeline Overview */}
        <Card className="p-6 mb-8 border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Overview</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {pipelineStages.map((stage, index) => (
              <div key={stage.status} className="flex items-center">
                <div className="flex flex-col items-center min-w-[120px] p-4 bg-slate-50 rounded-xl">
                  <span className="text-2xl font-bold text-slate-900">{stage.count}</span>
                  <StatusBadge status={stage.status} size="sm" />
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-300 mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Interviews */}
          <Card className="p-6 border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Interviews</h2>
              <Link to={createPageUrl("Interviews")}>
                <Button variant="ghost" size="sm" className="text-slate-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {upcomingInterviewsList.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No upcoming interviews</p>
            ) : (
              <div className="space-y-3">
                {upcomingInterviewsList.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{interview.candidate_name}</p>
                      <p className="text-sm text-slate-500">{interview.interview_type?.replace(/_/g, " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {format(new Date(interview.interview_date), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(interview.interview_date), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Candidates */}
          <Card className="p-6 border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Candidates</h2>
              <Link to={createPageUrl("Candidates")}>
                <Button variant="ghost" size="sm" className="text-slate-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {recentCandidates.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No candidates yet</p>
            ) : (
              <div className="space-y-3">
                {recentCandidates.map((candidate) => (
                  <Link 
                    key={candidate.id} 
                    to={createPageUrl(`CandidateDetail?id=${candidate.id}`)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{candidate.first_name} {candidate.last_name}</p>
                        <p className="text-sm text-slate-500">{candidate.position_applied}</p>
                      </div>
                    </div>
                    <StatusBadge status={candidate.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}