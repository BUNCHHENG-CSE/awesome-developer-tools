"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
  Check,
  Star,
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

interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  docsUrl: string | null;
  githubUrl: string | null;
  pricing: string;
  hiddenGem: boolean;
  hiddenGemReason: string | null;
  isFeatured: boolean;
  popularity: number;
  categoryId: string;
  countryId: string | null;
  category: { id: string; name: string };
  country: { id: string; name: string; code: string } | null;
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

export function ToolsManager() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [pricing, setPricing] = useState("free");
  const [hiddenGem, setHiddenGem] = useState(false);
  const [hiddenGemReason, setHiddenGemReason] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [popularity, setPopularity] = useState(50);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCatFilter !== "all") params.append("categoryId", selectedCatFilter);

      const [toolsRes, catsRes, countriesRes] = await Promise.all([
        fetch(`/api/admin/tools?${params.toString()}`),
        fetch("/api/categories"),
        fetch("/api/countries").catch(() => null),
      ]);

      if (toolsRes.ok) {
        const json = await toolsRes.json();
        setTools(json.data || []);
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
      console.error(e);
      toast.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCatFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditingTool(null);
    setName("");
    setTagline("");
    setDescription("");
    setWebsiteUrl("");
    setDocsUrl("");
    setGithubUrl("");
    setCategoryId(categories[0]?.id || "");
    setCountryId("");
    setPricing("free");
    setHiddenGem(false);
    setHiddenGemReason("");
    setIsFeatured(false);
    setPopularity(50);
    setModalOpen(true);
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setName(tool.name);
    setTagline(tool.tagline);
    setDescription(tool.description);
    setWebsiteUrl(tool.websiteUrl);
    setDocsUrl(tool.docsUrl || "");
    setGithubUrl(tool.githubUrl || "");
    setCategoryId(tool.categoryId);
    setCountryId(tool.countryId || "");
    setPricing(tool.pricing);
    setHiddenGem(tool.hiddenGem);
    setHiddenGemReason(tool.hiddenGemReason || "");
    setIsFeatured(tool.isFeatured);
    setPopularity(tool.popularity);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagline || !description || !websiteUrl || !categoryId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        name,
        tagline,
        description,
        websiteUrl,
        docsUrl: docsUrl || null,
        githubUrl: githubUrl || null,
        categoryId,
        countryId: countryId || null,
        pricing,
        hiddenGem,
        hiddenGemReason: hiddenGem ? hiddenGemReason : null,
        isFeatured,
        popularity: Number(popularity),
      };

      if (editingTool) {
        const res = await fetch(`/api/admin/tools/${editingTool.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Update failed");
        toast.success(`Updated tool "${name}"`);
      } else {
        const res = await fetch("/api/admin/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Creation failed");
        toast.success(`Created new tool "${name}"`);
      }

      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving tool";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickToggleGem = async (tool: Tool) => {
    try {
      const newGemState = !tool.hiddenGem;
      const res = await fetch(`/api/admin/tools/${tool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hiddenGem: newGemState }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      toast.success(newGemState ? `Marked "${tool.name}" as Hidden Gem` : `Unmarked "${tool.name}" as Hidden Gem`);
      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, hiddenGem: newGemState } : t))
      );
    } catch {
      toast.error("Failed to toggle Hidden Gem status");
    }
  };

  const handleQuickToggleFeatured = async (tool: Tool) => {
    try {
      const newFeatured = !tool.isFeatured;
      const res = await fetch(`/api/admin/tools/${tool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: newFeatured }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      toast.success(newFeatured ? `Featured "${tool.name}" on homepage` : `Unfeatured "${tool.name}"`);
      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, isFeatured: newFeatured } : t))
      );
    } catch {
      toast.error("Failed to toggle Featured status");
    }
  };

  const handleDeleteTool = async (id: string, toolName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${toolName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/tools/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Deleted "${toolName}"`);
      loadData();
    } catch {
      toast.error("Failed to delete tool");
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tools by name, tagline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="text-xs h-9 px-2.5 rounded-lg border border-input bg-background"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            title="Refresh"
            className="h-9 w-9 shrink-0"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <Button onClick={openAddModal} className="gap-1.5 text-xs h-9 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add New Tool</span>
        </Button>
      </div>

      {/* Tools Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tools.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-card/40">
          <p className="text-sm font-semibold">No tools match your query</p>
          <p className="text-xs text-muted-foreground mt-1">Try clearing search or filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tool Name & Info</th>
                <th className="px-4 py-3">Category & Country</th>
                <th className="px-4 py-3">Pricing</th>
                <th className="px-4 py-3">Badges & Spotlight</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tools.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{t.name}</span>
                      <a
                        href={t.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        title="Open external website"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
                      {t.tagline}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="font-medium text-foreground">{t.category?.name || "—"}</div>
                    {t.country && (
                      <div className="text-[10px] text-muted-foreground">
                        {t.country.name} ({t.country.code})
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px] py-0 uppercase">
                      {t.pricing}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleQuickToggleGem(t)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium transition-colors ${
                          t.hiddenGem
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                        title="Click to toggle Hidden Gem"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Gem: {t.hiddenGem ? "Yes" : "No"}</span>
                      </button>

                      <button
                        onClick={() => handleQuickToggleFeatured(t)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium transition-colors ${
                          t.isFeatured
                            ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                        title="Click to toggle Featured on homepage"
                      >
                        <Star className="h-2.5 w-2.5" />
                        <span>Featured: {t.isFeatured ? "Yes" : "No"}</span>
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(t)}
                        title="Edit tool"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTool(t.id, t.name)}
                        title="Delete tool"
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

      {/* ADD / EDIT TOOL MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? `Edit Tool: ${editingTool.name}` : "Add New Tool to Directory"}
            </DialogTitle>
            <DialogDescription>
              Provide directory information and editorial metadata for this tool.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Tool Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hono, Woodpecker"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Website URL <span className="text-destructive">*</span>
                </label>
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                One-liner Tagline <span className="text-destructive">*</span>
              </label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Concise 1-sentence punchy summary"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Description (2-4 sentences) <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Editorial overview explaining features and why developers use it..."
                required
                className="w-full text-xs p-2 rounded-lg border border-input bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
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
                <label className="text-xs font-semibold text-foreground">Country of Origin</label>
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full text-xs h-9 px-2 rounded-lg border border-input bg-background"
                >
                  <option value="">Global / Unspecified</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Popularity (0-100)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={popularity}
                  onChange={(e) => setPopularity(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Documentation URL (Optional)</label>
                <Input
                  type="url"
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  placeholder="https://docs.example.com"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">GitHub URL (Optional)</label>
                <Input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="text-xs"
                />
              </div>
            </div>

            {/* Hidden Gem & Featured Checks */}
            <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Hidden Gem</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground">Highlight in Hidden Gems section.</p>
                </div>
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
                  placeholder="Editorial note: Why is this tool a hidden gem?"
                  className="text-xs"
                />
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-violet-500" />
                    <span>Featured Tool</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground">Spotlight this tool on the homepage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-violet-600"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="gap-2">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>{editingTool ? "Save Changes" : "Create Tool"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
