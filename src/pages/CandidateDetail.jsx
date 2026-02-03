import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import ScheduleInterviewModal from "@/components/interviews/ScheduleInterviewModal";
import InterviewFeedbackModal from "@/components/interviews/InterviewFeedbackModal";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  Star,
  Clock,
  User,
  Building,
  DollarSign,
  Award,
  CheckCircle,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function CandidateDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const candidateId = urlParams.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [vettingNotes, setVettingNotes] = useState("");
  const [vettingRating, setVettingRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => base44.entities.Candidate.filter({ id: candidateId }),
    select: (data) => data[0],
    enabled: !!candidateId,
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ["interviews", candidateId],
    queryFn: () => base44.entities.Interview.filter({ candidate_id: candidateId }),
    enabled: !!candidateId,
  });

  useEffect(() => {
    if (candidate) {
      setVettingNotes(candidate.vetting_notes || "");
      setVettingRating(candidate.vetting_rating || 0);
    }
  }, [candidate]);

  const handleStatusChange = async (newStatus) => {
    await base44.entities.Candidate.update(candidateId, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });

    if (newStatus === "hired") {
      await base44.entities.HiredCandidate.create({
        candidate_id: candidateId,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position_applied,
        department: candidate.department,
        hiring_manager: candidate.hiring_manager,
        hired_date: new Date().toISOString().split("T")[0],
        start_date: candidate.start_date,
        salary: candidate.expected_salary,
        cv_url: candidate.cv_url,
        id_document_url: candidate.id_document_url,
        qualification_url: candidate.qualification_url,
        disability_proof_url: candidate.disability_proof_url,
        eea1_form_url: candidate.eea1_form_url,
        tax_document_url: candidate.tax_document_url,
        tax_number: candidate.tax_number,
        id_number: candidate.id_number,
        is_disabled: candidate.is_disabled,
      });
      queryClient.invalidateQueries({ queryKey: ["hiredCandidates"] });
    }
  };

  const handleSaveVetting = async () => {
    setSaving(true);
    await base44.entities.Candidate.update(candidateId, {
      vetting_notes: vettingNotes,
      vetting_rating: vettingRating,
      status: candidate.status === "sourced" ? "cv_vetted" : candidate.status,
    });
    queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      await base44.entities.Candidate.delete(candidateId);
      navigate(createPageUrl("Candidates"));
    }
  };

  const DocumentLink = ({ url, label }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="flex-1">{label}</span>
        <ExternalLink className="w-4 h-4 text-slate-400" />
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading candidate...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Candidate not found</p>
          <Link to={createPageUrl("Candidates")}>
            <Button variant="outline" className="mt-4">Back to Candidates</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl("Candidates")} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {candidate.first_name} {candidate.last_name}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" />
                  {candidate.position_applied}
                </p>
                <div className="mt-2">
                  <StatusBadge status={candidate.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={candidate.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sourced">Sourced</SelectItem>
                  <SelectItem value="cv_vetted">CV Vetted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offer_made">Offer Made</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowInterviewModal(true)} className="bg-blue-600 hover:bg-blue-700">
                Schedule Interview
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="interviews">Interviews ({interviews.length})</TabsTrigger>
            <TabsTrigger value="vetting">CV Vetting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Contact Info */}
              <Card className="p-6 border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  {candidate.id_number && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>ID: {candidate.id_number}</span>
                    </div>
                  )}
                  {candidate.tax_number && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>Tax: {candidate.tax_number}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Professional Info */}
              <Card className="p-6 border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4">Professional Details</h3>
                <div className="space-y-3">
                  {candidate.experience_years && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{candidate.experience_years} years experience</span>
                    </div>
                  )}
                  {candidate.source && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Source: {candidate.source.replace(/_/g, " ")}</span>
                    </div>
                  )}
                  {candidate.notice_period && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Notice: {candidate.notice_period}</span>
                    </div>
                  )}
                  {candidate.current_salary && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>Current: R{candidate.current_salary?.toLocaleString()}</span>
                    </div>
                  )}
                  {candidate.expected_salary && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>Expected: R{candidate.expected_salary?.toLocaleString()}</span>
                    </div>
                  )}
                  {candidate.is_disabled && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <Award className="w-4 h-4" />
                      <span>Disability status declared</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Skills */}
              {candidate.skills?.length > 0 && (
                <Card className="p-6 border-slate-100 lg:col-span-2">
                  <h3 className="font-semibold text-slate-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-6 border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">Uploaded Documents</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <DocumentLink url={candidate.cv_url} label="CV / Resume" />
                <DocumentLink url={candidate.id_document_url} label="ID Document" />
                <DocumentLink url={candidate.qualification_url} label="Highest Qualification" />
                <DocumentLink url={candidate.eea1_form_url} label="EEA1 Form" />
                <DocumentLink url={candidate.tax_document_url} label="Tax Document" />
                {candidate.is_disabled && (
                  <DocumentLink url={candidate.disability_proof_url} label="Proof of Disability" />
                )}
              </div>
              {!candidate.cv_url && !candidate.id_document_url && !candidate.qualification_url && (
                <p className="text-slate-500 text-center py-8">No documents uploaded yet</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card className="p-6 border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Interview History</h3>
                <Button onClick={() => setShowInterviewModal(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Schedule Interview
                </Button>
              </div>
              
              {interviews.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No interviews scheduled yet</p>
              ) : (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">
                              {interview.interview_type?.replace(/_/g, " ")}
                            </span>
                            <StatusBadge status={interview.status} size="sm" />
                          </div>
                          <p className="text-sm text-slate-500">
                            {format(new Date(interview.interview_date), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                          {interview.location && (
                            <p className="text-sm text-slate-500 mt-1">📍 {interview.location}</p>
                          )}
                          {interview.interviewers?.length > 0 && (
                            <p className="text-sm text-slate-500 mt-1">
                              Interviewers: {interview.interviewers.join(", ")}
                            </p>
                          )}
                        </div>
                        {interview.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowFeedbackModal(true);
                            }}
                          >
                            Add Feedback
                          </Button>
                        )}
                      </div>

                      {interview.status === "completed" && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          {interview.overall_rating && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-slate-500">Rating:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= interview.overall_rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {interview.comments && (
                            <p className="text-sm text-slate-600 mt-2">{interview.comments}</p>
                          )}
                          {interview.recommendation && (
                            <p className="text-sm mt-2">
                              <span className="text-slate-500">Recommendation: </span>
                              <span className="font-medium">
                                {interview.recommendation.replace(/_/g, " ")}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="vetting">
            <Card className="p-6 border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">CV Vetting</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setVettingRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            rating <= vettingRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 hover:text-amber-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Vetting Notes</label>
                  <Textarea
                    value={vettingNotes}
                    onChange={(e) => setVettingNotes(e.target.value)}
                    placeholder="Add your assessment of the candidate's CV, qualifications, and experience..."
                    className="min-h-[150px]"
                  />
                </div>

                <Button onClick={handleSaveVetting} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Vetting
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <ScheduleInterviewModal
          open={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["interviews", candidateId] });
            queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
          }}
          candidate={candidate}
        />

        <InterviewFeedbackModal
          open={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["interviews", candidateId] });
            queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
          }}
          interview={selectedInterview}
        />
      </div>
    </div>
  );
}