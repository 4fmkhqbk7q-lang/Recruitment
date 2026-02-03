import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, X } from "lucide-react";

const sources = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "job_board", label: "Job Board" },
  { value: "referral", label: "Referral" },
  { value: "direct_application", label: "Direct Application" },
  { value: "agency", label: "Agency" },
  { value: "other", label: "Other" },
];

export default function AddCandidateModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_number: "",
    tax_number: "",
    position_applied: "",
    source: "",
    location: "",
    experience_years: "",
    current_salary: "",
    expected_salary: "",
    notice_period: "",
    is_disabled: false,
    skills: "",
    cv_url: "",
    id_document_url: "",
    qualification_url: "",
    disability_proof_url: "",
    eea1_form_url: "",
    tax_document_url: "",
    popi_consent: false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange(field, file_url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        experience_years: formData.experience_years ? Number(formData.experience_years) : undefined,
        current_salary: formData.current_salary ? Number(formData.current_salary) : undefined,
        expected_salary: formData.expected_salary ? Number(formData.expected_salary) : undefined,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        status: "sourced",
        consent_date: new Date().toISOString(),
      };
      await base44.entities.Candidate.create(data);
      onSuccess();
      onClose();
      setFormData({
        first_name: "", last_name: "", email: "", phone: "", id_number: "", tax_number: "",
        position_applied: "", source: "", location: "", experience_years: "", current_salary: "",
        expected_salary: "", notice_period: "", is_disabled: false, skills: "", cv_url: "",
        id_document_url: "", qualification_url: "", disability_proof_url: "", eea1_form_url: "", tax_document_url: "",
        popi_consent: false,
      });
    } catch (error) {
      console.error("Error creating candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({ label, field, accept = ".pdf,.doc,.docx,.jpg,.png" }) => (
    <div>
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        {formData[field] ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg text-sm text-green-700 flex-1">
            <span className="truncate">File uploaded</span>
            <button type="button" onClick={() => handleChange(field, "")} className="hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
              {uploading[field] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading[field] ? "Uploading..." : "Upload file"}</span>
            </div>
            <input type="file" className="hidden" accept={accept} onChange={(e) => handleFileUpload(field, e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Add New Candidate</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>ID Number</Label>
                <Input value={formData.id_number} onChange={(e) => handleChange("id_number", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Tax Number</Label>
                <Input value={formData.tax_number} onChange={(e) => handleChange("tax_number", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => handleChange("location", e.target.value)} className="mt-1.5" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={formData.is_disabled} onCheckedChange={(checked) => handleChange("is_disabled", checked)} />
                <Label>Candidate has a disability</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Position Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Position Applied For *</Label>
                <Input value={formData.position_applied} onChange={(e) => handleChange("position_applied", e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label>Source</Label>
                <Select value={formData.source} onValueChange={(value) => handleChange("source", value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input type="number" value={formData.experience_years} onChange={(e) => handleChange("experience_years", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Notice Period</Label>
                <Input value={formData.notice_period} onChange={(e) => handleChange("notice_period", e.target.value)} placeholder="e.g., 1 month" className="mt-1.5" />
              </div>
              <div>
                <Label>Current Salary</Label>
                <Input type="number" value={formData.current_salary} onChange={(e) => handleChange("current_salary", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Expected Salary</Label>
                <Input type="number" value={formData.expected_salary} onChange={(e) => handleChange("expected_salary", e.target.value)} className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label>Skills (comma separated)</Label>
                <Input value={formData.skills} onChange={(e) => handleChange("skills", e.target.value)} placeholder="e.g., JavaScript, Python, Project Management" className="mt-1.5" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadField label="CV / Resume" field="cv_url" />
              <FileUploadField label="ID Document" field="id_document_url" />
              <FileUploadField label="Highest Qualification" field="qualification_url" />
              <FileUploadField label="EEA1 Form" field="eea1_form_url" />
              <FileUploadField label="Tax Document" field="tax_document_url" />
              {formData.is_disabled && (
                <FileUploadField label="Proof of Disability" field="disability_proof_url" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">POPI Act Compliance</h3>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Checkbox
                id="popi_consent"
                checked={formData.popi_consent}
                onCheckedChange={(checked) => handleChange("popi_consent", checked)}
                required
              />
              <div className="space-y-1 flex-1">
                <Label htmlFor="popi_consent" className="text-sm font-medium cursor-pointer">
                  POPI Act Consent *
                </Label>
                <p className="text-xs text-slate-600">
                  I consent to the processing of my personal information for recruitment purposes in accordance with the{" "}
                  <a href="https://popia.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    Protection of Personal Information Act (POPI)
                  </a>
                  . This includes storing and processing identity documents, qualifications, disability information, and other personal data.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !formData.popi_consent} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}