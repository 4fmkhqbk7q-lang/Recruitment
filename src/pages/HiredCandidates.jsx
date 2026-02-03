import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Search,
  Users,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  ExternalLink,
  MoreHorizontal,
  CheckCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HiredCandidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [onboardingFilter, setOnboardingFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: hiredCandidates = [], isLoading } = useQuery({
    queryKey: ["hiredCandidates"],
    queryFn: () => base44.entities.HiredCandidate.list("-hired_date"),
  });

  const filteredCandidates = hiredCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnboarding =
      onboardingFilter === "all" || candidate.onboarding_status === onboardingFilter;
    return matchesSearch && matchesOnboarding;
  });

  const handleUpdateOnboarding = async (id, status) => {
    await base44.entities.HiredCandidate.update(id, { onboarding_status: status });
    queryClient.invalidateQueries({ queryKey: ["hiredCandidates"] });
  };

  const DocumentLink = ({ url, label }) => {
    if (!url) return <span className="text-slate-300">—</span>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <FileText className="w-3.5 h-3.5" />
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading hired candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Hired Candidates</h1>
          <p className="text-slate-500 mt-1">
            {hiredCandidates.length} successful placements
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{hiredCandidates.length}</p>
                <p className="text-sm text-slate-500">Total Hired</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {hiredCandidates.filter((c) => c.onboarding_status === "pending").length}
                </p>
                <p className="text-sm text-slate-500">Pending Onboarding</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {hiredCandidates.filter((c) => c.onboarding_status === "in_progress").length}
                </p>
                <p className="text-sm text-slate-500">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {hiredCandidates.filter((c) => c.onboarding_status === "completed").length}
                </p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Onboarding status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="documents_submitted">Docs Submitted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredCandidates.length === 0 ? (
          <Card className="p-12 text-center border-slate-100">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No hired candidates</h3>
            <p className="text-slate-500 mt-1">
              {searchQuery || onboardingFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Candidates marked as 'Hired' will appear here"}
            </p>
          </Card>
        ) : (
          <Card className="border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Hired Date</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead className="text-center">Documents</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-sm font-semibold text-green-700">
                              {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {candidate.first_name} {candidate.last_name}
                            </p>
                            {candidate.department && (
                              <p className="text-xs text-slate-500">{candidate.department}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{candidate.position}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {candidate.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.hired_date
                          ? format(new Date(candidate.hired_date), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {candidate.start_date
                          ? format(new Date(candidate.start_date), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={candidate.onboarding_status || "pending"} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <DocumentLink url={candidate.cv_url} label="CV" />
                          <DocumentLink url={candidate.id_document_url} label="ID" />
                          <DocumentLink url={candidate.qualification_url} label="Qual" />
                          <DocumentLink url={candidate.eea1_form_url} label="EEA1" />
                          <DocumentLink url={candidate.tax_document_url} label="Tax" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateOnboarding(candidate.id, "pending")}>
                              Set as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateOnboarding(candidate.id, "documents_submitted")}>
                              Docs Submitted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateOnboarding(candidate.id, "in_progress")}>
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateOnboarding(candidate.id, "completed")}>
                              Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}