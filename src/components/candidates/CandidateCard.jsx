import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { User, Mail, Phone, MapPin, Briefcase, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CandidateCard({ candidate }) {
  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-300 border-slate-100 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-lg font-semibold text-slate-600">
              {candidate.first_name?.[0]}{candidate.last_name?.[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
              {candidate.first_name} {candidate.last_name}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5" />
              {candidate.position_applied}
            </p>
          </div>
        </div>
        <StatusBadge status={candidate.status} size="sm" />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="truncate">{candidate.email}</span>
        </div>
        {candidate.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{candidate.phone}</span>
          </div>
        )}
        {candidate.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{candidate.location}</span>
          </div>
        )}
        {candidate.cv_url && (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-blue-600">CV Uploaded</span>
          </div>
        )}
      </div>

      {candidate.vetting_rating && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Vetting Score:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`w-4 h-4 rounded-full ${
                    star <= candidate.vetting_rating ? "bg-amber-400" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
        <Link to={createPageUrl(`CandidateDetail?id=${candidate.id}`)}>
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}