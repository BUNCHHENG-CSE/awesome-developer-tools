"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  RotateCcw,
  Trash2,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Submission {
  id: string;
  name: string;
  websiteUrl: string;
  categoryId: string | null;
  countryId: string | null;
  categoryName: string | null;
  countryName: string | null;
  submittedBy: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

export function SubmissionsManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Approval modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [publishToDirectory, setPublishToDirectory] = useState(true);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [pricing, setPricing] = useState("free");
  const [hiddenGem, setHiddenGem] = useState(false);
  const [hiddenGemReason, setHiddenGemReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [subsRes, catsRes, countriesRes] = await Promise.all([
        fetch(`/api/admin/submissions?status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`),
        fetch("/api/categories"),
        fetch("/api/countries").catch(() => null),
      ]);

      if (subsRes.ok) {
        const json = await subsRes.json();
        setSubmissions(json.data || []);
      }
      if (catsRes.ok) {
        const json = await catsRes.json();
        setCategories(json.data || []);
      }
      if (countriesRes && countriesRes.ok) {
        const json = await countriesRes.json();
        setCountries(json.data || []);
      }
    } catch (e) {
      console.error("Error loading submissions:", e);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openApproveModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setSelectedCategory(sub.categoryId || (categories[0]?.id || ""));
    setSelectedCountry(sub.countryId || "");
    setTagline(`${sub.name} — Modern developer tool.`);
    setDescription(`${sub.name} provides developers with efficient tools and solutions.`);
    setPricing("free");
    setHiddenGem(false);
    setHiddenGemReason("");
    setPublishToDirectory(true);
    setApproveModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setActionLoading(true);
    try {
      const payload: any = { action: "approve" };
      if (publishToDirectory) {
        payload.createToolData = {
          name: selectedSubmission.name,
          websiteUrl: selectedSubmission.websiteUrl,
          categoryId: selectedCategory,
          countryId: selectedCountry || null,
          tagline,
          description,
          pricing,
          hiddenGem,
          hiddenGemReason: hiddenGem ? hiddenGemReason : null,
          isFeatured: false,
        };
      }

      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Approval failed");

      toast.success(
        publishToDirectory
          ? `Approved and published "${selectedSubmission.name}" to directory!`
          : `Approved submission "${selectedSubmission.name}"`
      );
      setApproveModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during approval";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setRejectionReason("Does not meet directory inclusion criteria or website is unreachable.");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Rejection failed");

      toast.info(`Submission "${selectedSubmission.name}" marked as rejected.`);
      setRejectModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during rejection";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete submission "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Deleted submission "${name}"`);
      loadData();
    } catch {
      toast.error("Failed to delete submission");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px]">
            <Clock className="h-3 w-3" />
            <span>Pending Review</span>
          </Badge>
        );
    }
  };

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="text-xs h-8"
          >
            All Submissions
          </Button>
          <Button
            variant={statusFilter === "pending" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
            className="text-xs h-8 gap-1.5 text-amber-600 dark:text-amber-400"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Pending Review</span>
            {counts.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] font-bold">
                {counts.pending}
              </span>
            )}
          </Button>
          <Button
            variant={statusFilter === "approved" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
            className="text-xs h-8 gap-1.5 text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approved</span>
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
            className="text-xs h-8 gap-1.5 text-destructive"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Rejected</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by tool or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            title="Refresh submissions"
            className="h-8 w-8 shrink-0"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-card/40">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">No submissions found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {statusFilter !== "all"
              ? `No submissions currently in "${statusFilter}" state.`
              : "No user submissions have been made yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tool Name & Link</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitted By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="font-semibold text-foreground text-sm">{sub.name}</div>
                    <a
                      href={sub.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px] mt-0.5"
                    >
                      <span>{sub.websiteUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{sub.categoryName || "—"}</div>
                    {sub.countryName && (
                      <span className="text-[10px] text-muted-foreground">({sub.countryName})</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {sub.user?.name || sub.submittedBy || "Anonymous"}
                    </div>
                    {sub.user?.email && (
                      <div className="text-[10px] text-muted-foreground">{sub.user.email}</div>
                    )}
                    <Badge variant="outline" className="text-[9px] py-0 px-1 mt-0.5">
                      {sub.user?.role === "admin" ? "Admin" : "Tool Submitter"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {getStatusBadge(sub.status)}
                    {sub.status === "rejected" && sub.rejectionReason && (
                      <div className="text-[10px] text-destructive mt-1 max-w-xs truncate" title={sub.rejectionReason}>
                        Note: {sub.rejectionReason}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {sub.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => openApproveModal(sub)}
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </Button>
                      )}

                      {sub.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                          onClick={() => openRejectModal(sub)}
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Reject</span>
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(sub.id, sub.name)}
                        title="Delete submission"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPROVE SUBMISSION MODAL */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span>Approve Tool: {selectedSubmission?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Review tool details before approving this member submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border text-xs">
              <div>
                <span className="font-semibold text-foreground">Publish to Public Directory:</span>
                <p className="text-[11px] text-muted-foreground">
                  Immediately indexes this tool in DevAtlas directory tables.
                </p>
              </div>
              <input
                type="checkbox"
                checked={publishToDirectory}
                onChange={(e) => setPublishToDirectory(e.target.checked)}
                className="h-4 w-4 rounded text-primary"
              />
            </div>

            {publishToDirectory && (
              <div className="space-y-3 pt-1 border-t border-border">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">One-line Tagline</label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Concise, catchy summary of the tool"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Editorial Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2 rounded-lg border border-input bg-background"
                    placeholder="2-4 sentences explaining what the tool does..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-xs h-9 px-2 rounded-lg border border-input bg-background"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Pricing Model</label>
                    <select
                      value={pricing}
                      onChange={(e) => setPricing(e.target.value)}
                      className="w-full text-xs h-9 px-2 rounded-lg border border-input bg-background"
                    >
                      <option value="free">Free / Open Source</option>
                      <option value="freemium">Freemium</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Mark as Hidden Gem</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={hiddenGem}
                      onChange={(e) => setHiddenGem(e.target.checked)}
                      className="h-4 w-4 rounded text-amber-500"
                    />
                  </div>

                  {hiddenGem && (
                    <Input
                      value={hiddenGemReason}
                      onChange={(e) => setHiddenGemReason(e.target.value)}
                      placeholder="Why is this tool a hidden gem? (Editorial note)"
                      className="text-xs mt-1"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setApproveModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={actionLoading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>{publishToDirectory ? "Approve & Publish to Directory" : "Approve Submission"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT SUBMISSION MODAL */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Reject Submission: {selectedSubmission?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Provide an editorial reason for declining this tool submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-input bg-background"
              placeholder="e.g. Incomplete website, broken link, not a developer-focused tool..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              <span>Confirm Rejection</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
