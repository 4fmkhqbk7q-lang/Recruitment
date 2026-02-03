import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  FileCheck,
  Award,
  TrendingUp,
  User,
} from "lucide-react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";

const statusColors = {
  pending: "bg-slate-100 text-slate-700",
  applied: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700",
  submitted: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Learnerships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: learners = [], isLoading } = useQuery({
    queryKey: ["hiredCandidates"],
    queryFn: () => base44.entities.HiredCandidate.list("-hired_date"),
  });

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      learner.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.programme_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && learner.progress_percentage < 100;
    if (filterStatus === "completed") return matchesSearch && learner.progress_percentage >= 100;
    if (filterStatus === "moderation_due") {
      return matchesSearch && learner.moderation_application_date && 
        differenceInDays(new Date(learner.moderation_application_date), new Date()) <= 30 &&
        learner.moderation_status === "pending";
    }
    if (filterStatus === "eisa_due") {
      return matchesSearch && learner.eisa_application_date && 
        differenceInDays(new Date(learner.eisa_application_date), new Date()) <= 30 &&
        learner.eisa_status === "pending";
    }
    return matchesSearch;
  });

  const stats = {
    total: learners.length,
    active: learners.filter(l => l.progress_percentage < 100).length,
    completed: learners.filter(l => l.progress_percentage >= 100).length,
    moderationDue: learners.filter(l => 
      l.moderation_application_date && 
      differenceInDays(new Date(l.moderation_application_date), new Date()) <= 30 &&
      l.moderation_status === "pending"
    ).length,
    eisaDue: learners.filter(l => 
      l.eisa_application_date && 
      differenceInDays(new Date(l.eisa_application_date), new Date()) <= 30 &&
      l.eisa_status === "pending"
    ).length,
  };

  const getDateWarning = (date, status) => {
    if (!date || status === "completed" || status === "approved") return null;
    const daysUntil = differenceInDays(new Date(date), new Date());
    if (daysUntil < 0) return { type: "overdue", text: "Overdue", color: "text-red-600" };
    if (daysUntil <= 7) return { type: "urgent", text: `${daysUntil} days`, color: "text-orange-600" };
    if (daysUntil <= 30) return { type: "soon", text: `${daysUntil} days`, color: "text-amber-600" };
    return null;
  };

  const LearnerCard = ({ learner }) => {
    const moderationWarning = getDateWarning(learner.moderation_application_date, learner.moderation_status);
    const eisaWarning = getDateWarning(learner.eisa_application_date, learner.eisa_status);

    return (
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {learner.first_name?.[0]}{learner.last_name?.[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {learner.first_name} {learner.last_name}
              </h3>
              <p className="text-sm text-slate-500">{learner.programme_name || "No programme assigned"}</p>
              {learner.training_provider && (
                <p className="text-xs text-slate-400 mt-0.5">{learner.training_provider}</p>
              )}
            </div>
          </div>
          <Badge className={`${learner.progress_percentage >= 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
            {learner.progress_percentage >= 100 ? "Completed" : "Active"}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Programme Progress</span>
            <span className="text-sm font-semibold text-slate-900">{learner.progress_percentage || 0}%</span>
          </div>
          <Progress value={learner.progress_percentage || 0} className="h-2" />
        </div>

        {/* Key Dates */}
        <div className="space-y-2 mb-4">
          {learner.training_start_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                Training Period
              </span>
              <span className="text-slate-900 font-medium">
                {format(new Date(learner.training_start_date), "MMM d, yyyy")}
                {learner.training_end_date && ` - ${format(new Date(learner.training_end_date), "MMM d, yyyy")}`}
              </span>
            </div>
          )}
          {learner.workplace_experience_start && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Workplace Experience
              </span>
              <span className="text-slate-900 font-medium">
                {format(new Date(learner.workplace_experience_start), "MMM d, yyyy")}
                {learner.workplace_experience_end && ` - ${format(new Date(learner.workplace_experience_end), "MMM d, yyyy")}`}
              </span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600">Moderation:</span>
            <Badge className={statusColors[learner.moderation_status || "pending"]}>
              {learner.moderation_status || "pending"}
            </Badge>
            {moderationWarning && (
              <span className={`text-xs font-medium ${moderationWarning.color}`}>
                {moderationWarning.text}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600">EISA:</span>
            <Badge className={statusColors[learner.eisa_status || "pending"]}>
              {learner.eisa_status || "pending"}
            </Badge>
            {eisaWarning && (
              <span className={`text-xs font-medium ${eisaWarning.color}`}>
                {eisaWarning.text}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          {learner.assessor_name && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Assessor: {learner.assessor_name}
            </span>
          )}
          <Link to={createPageUrl(`LearnershipDetail?id=${learner.id}`)}>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </Link>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading learnerships...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Learnership Tracking</h1>
          <p className="text-slate-500 mt-1">Monitor learner progress and programme milestones</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-500">Total Learners</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileCheck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.moderationDue}</p>
                <p className="text-sm text-slate-500">Moderation Due</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.eisaDue}</p>
                <p className="text-sm text-slate-500">EISA Due</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or programme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Learners</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="moderation_due">Moderation Due</SelectItem>
              <SelectItem value="eisa_due">EISA Due</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Learners Grid */}
        {filteredLearners.length === 0 ? (
          <Card className="p-12 text-center border-slate-100">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No learners found</h3>
            <p className="text-slate-500 mt-1">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Hired candidates will appear here"}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLearners.map((learner) => (
              <LearnerCard key={learner.id} learner={learner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}