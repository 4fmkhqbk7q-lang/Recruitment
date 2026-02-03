import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CandidateCard from "@/components/candidates/CandidateCard";
import AddCandidateModal from "@/components/candidates/AddCandidateModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Filter, LayoutGrid, List } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

const statuses = [
  { value: "all", label: "All Candidates" },
  { value: "sourced", label: "Sourced" },
  { value: "cv_vetted", label: "CV Vetted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offer_made", label: "Offer Made" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export default function Candidates() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => base44.entities.Candidate.list("-created_date"),
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position_applied?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["candidates"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Candidates</h1>
            <p className="text-slate-500 mt-1">{candidates.length} total candidates in database</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statuses.slice(1).map((status) => {
            const count = candidates.filter((c) => c.status === status.value).length;
            return (
              <button
                key={status.value}
                onClick={() => setStatusFilter(statusFilter === status.value ? "all" : status.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Candidates Grid/List */}
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No candidates found</h3>
            <p className="text-slate-500 mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first candidate to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setShowAddModal(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}

        <AddCandidateModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}