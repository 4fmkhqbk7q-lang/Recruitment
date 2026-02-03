import { cn } from "@/lib/utils";

const statusConfig = {
  sourced: { label: "Sourced", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  cv_vetted: { label: "CV Vetted", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  interview_scheduled: { label: "Interview Scheduled", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  interviewed: { label: "Interviewed", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  offer_made: { label: "Offer Made", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  hired: { label: "Hired", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  scheduled: { label: "Scheduled", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  no_show: { label: "No Show", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  rescheduled: { label: "Rescheduled", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  pending: { label: "Pending", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  documents_submitted: { label: "Docs Submitted", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
};

export default function StatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || { label: status, bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium rounded-full",
      config.bg,
      config.text,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}