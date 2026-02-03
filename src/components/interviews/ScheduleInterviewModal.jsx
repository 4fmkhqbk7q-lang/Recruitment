import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const interviewTypes = [
  { value: "phone_screening", label: "Phone Screening" },
  { value: "first_interview", label: "First Interview" },
  { value: "second_interview", label: "Second Interview" },
  { value: "technical", label: "Technical Interview" },
  { value: "final_interview", label: "Final Interview" },
  { value: "panel", label: "Panel Interview" },
];

export default function ScheduleInterviewModal({ open, onClose, onSuccess, candidate, candidates }) {
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(candidate?.id || "");
  const [formData, setFormData] = useState({
    interview_date: "",
    interview_type: "",
    location: "",
    interviewers: "",
  });

  useEffect(() => {
    if (candidate) {
      setSelectedCandidate(candidate.id);
    }
  }, [candidate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selected = candidate || candidates?.find(c => c.id === selectedCandidate);
      if (!selected) return;

      await base44.entities.Interview.create({
        candidate_id: selected.id,
        candidate_name: `${selected.first_name} ${selected.last_name}`,
        position: selected.position_applied,
        interview_date: formData.interview_date,
        interview_type: formData.interview_type,
        location: formData.location,
        interviewers: formData.interviewers ? formData.interviewers.split(",").map(i => i.trim()) : [],
        status: "scheduled",
      });

      // Update candidate status
      await base44.entities.Candidate.update(selected.id, { status: "interview_scheduled" });
      
      onSuccess();
      onClose();
      setFormData({ interview_date: "", interview_type: "", location: "", interviewers: "" });
    } catch (error) {
      console.error("Error scheduling interview:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Schedule Interview</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {!candidate && candidates && (
            <div>
              <Label>Select Candidate *</Label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate} required>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} - {c.position_applied}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {candidate && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">{candidate.first_name} {candidate.last_name}</p>
              <p className="text-sm text-slate-500">{candidate.position_applied}</p>
            </div>
          )}

          <div>
            <Label>Interview Type *</Label>
            <Select value={formData.interview_type} onValueChange={(value) => handleChange("interview_type", value)} required>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {interviewTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date & Time *</Label>
            <Input 
              type="datetime-local" 
              value={formData.interview_date} 
              onChange={(e) => handleChange("interview_date", e.target.value)} 
              required 
              className="mt-1.5" 
            />
          </div>

          <div>
            <Label>Location / Video Call Link</Label>
            <Input 
              value={formData.location} 
              onChange={(e) => handleChange("location", e.target.value)} 
              placeholder="e.g., Office Room A or Zoom link" 
              className="mt-1.5" 
            />
          </div>

          <div>
            <Label>Interviewers (comma separated)</Label>
            <Input 
              value={formData.interviewers} 
              onChange={(e) => handleChange("interviewers", e.target.value)} 
              placeholder="e.g., John Smith, Jane Doe" 
              className="mt-1.5" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || (!candidate && !selectedCandidate)} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Interview
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}