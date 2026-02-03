import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import ScheduleInterviewModal from "@/components/interviews/ScheduleInterviewModal";
import InterviewFeedbackModal from "@/components/interviews/InterviewFeedbackModal";
import {
  Calendar,
  Search,
  Plus,
  Clock,
  MapPin,
  Users,
  Star,
  ChevronRight,
  Video,
  Building2,
} from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";

export default function Interviews() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => base44.entities.Interview.list("-interview_date"),
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => base44.entities.Candidate.list(),
  });

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingInterviews = filteredInterviews.filter(
    (i) => i.status === "scheduled" && new Date(i.interview_date) > new Date()
  );
  const pastInterviews = filteredInterviews.filter(
    (i) => i.status !== "scheduled" || new Date(i.interview_date) <= new Date()
  );

  const todayInterviews = upcomingInterviews.filter((i) => isToday(new Date(i.interview_date)));
  const tomorrowInterviews = upcomingInterviews.filter((i) => isTomorrow(new Date(i.interview_date)));
  const thisWeekInterviews = upcomingInterviews.filter(
    (i) => isThisWeek(new Date(i.interview_date)) && !isToday(new Date(i.interview_date)) && !isTomorrow(new Date(i.interview_date))
  );
  const laterInterviews = upcomingInterviews.filter(
    (i) => !isThisWeek(new Date(i.interview_date))
  );

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["interviews"] });
    queryClient.invalidateQueries({ queryKey: ["candidates"] });
  };

  const InterviewCard = ({ interview }) => (
    <Card className="p-5 hover:shadow-lg transition-all duration-300 border-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{interview.candidate_name}</h3>
            <p className="text-sm text-slate-500">{interview.position}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {format(new Date(interview.interview_date), "h:mm a")}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {format(new Date(interview.interview_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={interview.status} size="sm" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1">
          {interview.interview_type === "phone_screening" ? (
            <Video className="w-3.5 h-3.5" />
          ) : (
            <Building2 className="w-3.5 h-3.5" />
          )}
          {interview.interview_type?.replace(/_/g, " ")}
        </span>
        {interview.location && (
          <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {interview.location}
          </span>
        )}
        {interview.interviewers?.length > 0 && (
          <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {interview.interviewers.length} interviewer{interview.interviewers.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {interview.status === "completed" && interview.overall_rating && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <span className="text-sm text-slate-500">Rating:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= interview.overall_rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <Link to={createPageUrl(`CandidateDetail?id=${interview.candidate_id}`)}>
          <Button variant="ghost" size="sm" className="text-slate-600">
            View Candidate <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        {interview.status === "scheduled" && (
          <Button
            size="sm"
            onClick={() => {
              setSelectedInterview(interview);
              setShowFeedbackModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Feedback
          </Button>
        )}
      </div>
    </Card>
  );

  const InterviewSection = ({ title, interviews }) => {
    if (interviews.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading interviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interviews</h1>
            <p className="text-slate-500 mt-1">
              {upcomingInterviews.length} upcoming, {pastInterviews.length} past interviews
            </p>
          </div>
          <Button onClick={() => setShowScheduleModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by candidate or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingInterviews.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastInterviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingInterviews.length === 0 ? (
              <Card className="p-12 text-center border-slate-100">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No upcoming interviews</h3>
                <p className="text-slate-500 mt-1">Schedule an interview to get started</p>
                <Button onClick={() => setShowScheduleModal(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
              </Card>
            ) : (
              <>
                <InterviewSection title="Today" interviews={todayInterviews} />
                <InterviewSection title="Tomorrow" interviews={tomorrowInterviews} />
                <InterviewSection title="This Week" interviews={thisWeekInterviews} />
                <InterviewSection title="Later" interviews={laterInterviews} />
              </>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastInterviews.length === 0 ? (
              <Card className="p-12 text-center border-slate-100">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No past interviews</h3>
                <p className="text-slate-500 mt-1">Completed interviews will appear here</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ScheduleInterviewModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={handleSuccess}
          candidates={candidates.filter((c) => !["hired", "rejected"].includes(c.status))}
        />

        <InterviewFeedbackModal
          open={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSuccess={handleSuccess}
          interview={selectedInterview}
        />
      </div>
    </div>
  );
}