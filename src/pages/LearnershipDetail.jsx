import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  GraduationCap,
  Briefcase,
  FileCheck,
  Award,
  Calendar,
  User,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

const statusColors = {
  pending: "bg-slate-100 text-slate-700",
  applied: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700",
  submitted: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function LearnershipDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const learnerId = urlParams.get("id");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { data: learner, isLoading } = useQuery({
    queryKey: ["learner", learnerId],
    queryFn: () => base44.entities.HiredCandidate.filter({ id: learnerId }),
    select: (data) => data[0],
    enabled: !!learnerId,
  });

  const [formData, setFormData] = useState({
    programme_name: "",
    training_provider: "",
    training_start_date: "",
    training_end_date: "",
    workplace_experience_start: "",
    workplace_experience_end: "",
    moderation_application_date: "",
    moderation_status: "pending",
    eisa_application_date: "",
    eisa_status: "pending",
    progress_percentage: 0,
    assessor_name: "",
    progress_notes: "",
  });

  useEffect(() => {
    if (learner) {
      setFormData({
        programme_name: learner.programme_name || "",
        training_provider: learner.training_provider || "",
        training_start_date: learner.training_start_date || "",
        training_end_date: learner.training_end_date || "",
        workplace_experience_start: learner.workplace_experience_start || "",
        workplace_experience_end: learner.workplace_experience_end || "",
        moderation_application_date: learner.moderation_application_date || "",
        moderation_status: learner.moderation_status || "pending",
        eisa_application_date: learner.eisa_application_date || "",
        eisa_status: learner.eisa_status || "pending",
        progress_percentage: learner.progress_percentage || 0,
        assessor_name: learner.assessor_name || "",
        progress_notes: learner.progress_notes || "",
      });
    }
  }, [learner]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.HiredCandidate.update(learnerId, formData);
      queryClient.invalidateQueries({ queryKey: ["learner", learnerId] });
      queryClient.invalidateQueries({ queryKey: ["hiredCandidates"] });
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const getDateWarning = (date, status) => {
    if (!date || status === "completed" || status === "approved") return null;
    const daysUntil = differenceInDays(new Date(date), new Date());
    if (daysUntil < 0) return { type: "overdue", icon: AlertCircle, text: "Overdue!", color: "text-red-600 bg-red-50" };
    if (daysUntil <= 7) return { type: "urgent", icon: AlertCircle, text: `Due in ${daysUntil} days`, color: "text-orange-600 bg-orange-50" };
    if (daysUntil <= 30) return { type: "soon", icon: Calendar, text: `Due in ${daysUntil} days`, color: "text-amber-600 bg-amber-50" };
    return { type: "ok", icon: CheckCircle2, text: "On track", color: "text-green-600 bg-green-50" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading learner details...</div>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Learner not found</p>
          <Link to={createPageUrl("Learnerships")}>
            <Button variant="outline" className="mt-4">Back to Learnerships</Button>
          </Link>
        </div>
      </div>
    );
  }

  const moderationWarning = getDateWarning(formData.moderation_application_date, formData.moderation_status);
  const eisaWarning = getDateWarning(formData.eisa_application_date, formData.eisa_status);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl("Learnerships")} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learnerships
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {learner.first_name?.[0]}{learner.last_name?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {learner.first_name} {learner.last_name}
                </h1>
                <p className="text-slate-500 mt-1">{learner.position}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {learner.email}
                  </span>
                  {learner.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {learner.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-6 border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Programme Progress</h2>
            <span className="text-2xl font-bold text-slate-900">{formData.progress_percentage}%</span>
          </div>
          <Progress value={formData.progress_percentage} className="h-3 mb-4" />
          <div className="flex justify-between">
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.progress_percentage}
              onChange={(e) => handleChange("progress_percentage", Number(e.target.value))}
              className="w-32"
            />
            <Badge className={formData.progress_percentage >= 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
              {formData.progress_percentage >= 100 ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </Card>

        {/* Critical Dates Alerts */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {moderationWarning && (
            <Card className={`p-4 border-l-4 ${moderationWarning.color}`}>
              <div className="flex items-start gap-3">
                <moderationWarning.icon className="w-5 h-5 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Moderation</h3>
                  <p className="text-sm">{moderationWarning.text}</p>
                  {formData.moderation_application_date && (
                    <p className="text-xs mt-1 opacity-75">
                      Due: {format(new Date(formData.moderation_application_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
          {eisaWarning && (
            <Card className={`p-4 border-l-4 ${eisaWarning.color}`}>
              <div className="flex items-start gap-3">
                <eisaWarning.icon className="w-5 h-5 mt-0.5" />
                <div>
                  <h3 className="font-semibold">EISA Application</h3>
                  <p className="text-sm">{eisaWarning.text}</p>
                  {formData.eisa_application_date && (
                    <p className="text-xs mt-1 opacity-75">
                      Due: {format(new Date(formData.eisa_application_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid gap-6">
          {/* Programme Details */}
          <Card className="p-6 border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Programme Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Programme Name</Label>
                <Input
                  value={formData.programme_name}
                  onChange={(e) => handleChange("programme_name", e.target.value)}
                  placeholder="e.g., IT Systems Support NQF Level 4"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Training Provider</Label>
                <Input
                  value={formData.training_provider}
                  onChange={(e) => handleChange("training_provider", e.target.value)}
                  placeholder="Provider organization name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Training Start Date</Label>
                <Input
                  type="date"
                  value={formData.training_start_date}
                  onChange={(e) => handleChange("training_start_date", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Training End Date</Label>
                <Input
                  type="date"
                  value={formData.training_end_date}
                  onChange={(e) => handleChange("training_end_date", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Assessor Name</Label>
                <Input
                  value={formData.assessor_name}
                  onChange={(e) => handleChange("assessor_name", e.target.value)}
                  placeholder="Assigned assessor"
                  className="mt-1.5"
                />
              </div>
            </div>
          </Card>

          {/* Workplace Experience */}
          <Card className="p-6 border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Workplace Experience</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.workplace_experience_start}
                  onChange={(e) => handleChange("workplace_experience_start", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.workplace_experience_end}
                  onChange={(e) => handleChange("workplace_experience_end", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </Card>

          {/* Moderation */}
          <Card className="p-6 border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">Moderation</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Application Due Date</Label>
                <Input
                  type="date"
                  value={formData.moderation_application_date}
                  onChange={(e) => handleChange("moderation_application_date", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.moderation_status} onValueChange={(value) => handleChange("moderation_status", value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* EISA */}
          <Card className="p-6 border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">EISA Application</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Application Due Date</Label>
                <Input
                  type="date"
                  value={formData.eisa_application_date}
                  onChange={(e) => handleChange("eisa_application_date", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.eisa_status} onValueChange={(value) => handleChange("eisa_status", value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Progress Notes */}
          <Card className="p-6 border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Progress Notes</h2>
            <Textarea
              value={formData.progress_notes}
              onChange={(e) => handleChange("progress_notes", e.target.value)}
              placeholder="Add notes about learner's progress, challenges, achievements, etc."
              className="min-h-[150px]"
            />
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving} size="lg" className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}