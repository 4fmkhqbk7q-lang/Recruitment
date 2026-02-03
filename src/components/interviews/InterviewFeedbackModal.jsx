import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const recommendations = [
  { value: "strongly_recommend", label: "Strongly Recommend" },
  { value: "recommend", label: "Recommend" },
  { value: "neutral", label: "Neutral" },
  { value: "not_recommend", label: "Do Not Recommend" },
  { value: "strongly_not_recommend", label: "Strongly Do Not Recommend" },
];

function RatingStars({ value, onChange, label }) {
  return (
    <div>
      <Label className="text-sm text-slate-600">{label}</Label>
      <div className="flex gap-1 mt-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InterviewFeedbackModal({ open, onClose, onSuccess, interview }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    overall_rating: interview?.overall_rating || 0,
    technical_rating: interview?.technical_rating || 0,
    communication_rating: interview?.communication_rating || 0,
    culture_fit_rating: interview?.culture_fit_rating || 0,
    comments: interview?.comments || "",
    strengths: interview?.strengths || "",
    areas_of_improvement: interview?.areas_of_improvement || "",
    recommendation: interview?.recommendation || "",
    next_steps: interview?.next_steps || "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.Interview.update(interview.id, {
        ...formData,
        status: "completed",
      });

      // Update candidate status
      await base44.entities.Candidate.update(interview.candidate_id, { status: "interviewed" });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!interview) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Interview Feedback</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            {interview.candidate_name} - {interview.interview_type?.replace(/_/g, " ")}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-6">
            <RatingStars label="Overall Rating" value={formData.overall_rating} onChange={(v) => handleChange("overall_rating", v)} />
            <RatingStars label="Technical Skills" value={formData.technical_rating} onChange={(v) => handleChange("technical_rating", v)} />
            <RatingStars label="Communication" value={formData.communication_rating} onChange={(v) => handleChange("communication_rating", v)} />
            <RatingStars label="Culture Fit" value={formData.culture_fit_rating} onChange={(v) => handleChange("culture_fit_rating", v)} />
          </div>

          <div>
            <Label>Detailed Comments</Label>
            <Textarea
              value={formData.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
              placeholder="Provide detailed feedback from the interview..."
              className="mt-1.5 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Strengths</Label>
              <Textarea
                value={formData.strengths}
                onChange={(e) => handleChange("strengths", e.target.value)}
                placeholder="What did the candidate do well?"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Areas of Improvement</Label>
              <Textarea
                value={formData.areas_of_improvement}
                onChange={(e) => handleChange("areas_of_improvement", e.target.value)}
                placeholder="Where can the candidate improve?"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Recommendation</Label>
            <Select value={formData.recommendation} onValueChange={(value) => handleChange("recommendation", value)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                {recommendations.map((rec) => (
                  <SelectItem key={rec.value} value={rec.value}>{rec.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Next Steps</Label>
            <Textarea
              value={formData.next_steps}
              onChange={(e) => handleChange("next_steps", e.target.value)}
              placeholder="What should happen next?"
              className="mt-1.5"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}