"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Bookmark,
  Share2,
  Copy,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBookmarks } from "@/lib/bookmarks-context";
import { useAuth } from "@/components/auth-provider";
import { CountryFlag } from "@/components/country-flag";
import { toast } from "sonner";

interface AvailableTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  websiteUrl: string;
  categoryName?: string;
  countryCode?: string;
  countryName?: string;
  hiddenGem?: boolean;
}

interface StackItem {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  user: { name?: string | null; email: string };
  createdAt: string;
  tools: Array<{
    role?: string | null;
    tool: {
      id: string;
      name: string;
      slug: string;
      tagline: string;
      websiteUrl: string;
      category?: { name: string } | null;
      country?: { code: string; name: string } | null;
    };
  }>;
}

interface StackBuilderViewProps {
  availableTools: AvailableTool[];
  initialCommunityStacks: StackItem[];
}

const ROLES = ["Frontend", "Backend", "Database", "DevOps", "Utility"] as const;

export function StackBuilderView({
  availableTools,
  initialCommunityStacks,
}: StackBuilderViewProps) {
  const router = useRouter();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const { user, openAuthDialog } = useAuth();

  // Builder State
  const [stackName, setStackName] = useState("");
  const [stackDesc, setStackDesc] = useState("");
  const [selectedTools, setSelectedTools] = useState<
    Array<{ toolId: string; role: string }>
  >([]);
  const [searchTool, setSearchTool] = useState("");
  const [activeRole, setActiveRole] = useState<(typeof ROLES)[number]>("Frontend");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communityStacks, setCommunityStacks] = useState<StackItem[]>(initialCommunityStacks);

  // Search in Saved Tools tab
  const [savedSearch, setSavedSearch] = useState("");

  const filteredSavedTools = bookmarks.filter(
    (b) =>
      b.name.toLowerCase().includes(savedSearch.toLowerCase()) ||
      b.tagline.toLowerCase().includes(savedSearch.toLowerCase()) ||
      b.categoryName?.toLowerCase().includes(savedSearch.toLowerCase())
  );

  const filteredAvailableTools = availableTools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTool.toLowerCase()) ||
      t.tagline.toLowerCase().includes(searchTool.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchTool.toLowerCase())
  );

  const addToolToStack = (tool: AvailableTool) => {
    if (selectedTools.some((st) => st.toolId === tool.id)) {
      toast.info(`${tool.name} is already in the stack`);
      return;
    }
    setSelectedTools((prev) => [...prev, { toolId: tool.id, role: activeRole }]);
    toast.success(`Added ${tool.name} as ${activeRole}`);
  };

  const removeToolFromStack = (toolId: string) => {
    setSelectedTools((prev) => prev.filter((st) => st.toolId !== toolId));
  };

  const updateToolRole = (toolId: string, newRole: string) => {
    setSelectedTools((prev) =>
      prev.map((st) => (st.toolId === toolId ? { ...st, role: newRole } : st))
    );
  };

  const handleSaveStack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to save your tech stack");
      openAuthDialog();
      return;
    }

    if (!stackName.trim()) {
      toast.error("Please provide a name for your stack");
      return;
    }

    if (selectedTools.length === 0) {
      toast.error("Please add at least 1 tool to your stack");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stackName.trim(),
          description: stackDesc.trim() || undefined,
          tools: selectedTools,
          isPublic: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save stack");
      }

      toast.success("Tech stack created successfully!");
      setStackName("");
      setStackDesc("");
      setSelectedTools([]);
      router.push(`/stacks/${json.data.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving stack";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Saved Tools as Markdown
  const copyBookmarksAsMarkdown = () => {
    if (bookmarks.length === 0) {
      toast.info("No bookmarks to export");
      return;
    }

    const md =
      `# 🧰 My DevAtlas Saved Tools\n\n` +
      bookmarks
        .map(
          (b) =>
            `- **[${b.name}](https://devatlas.com/tools/${b.slug})** — ${b.tagline}`
        )
        .join("\n");

    navigator.clipboard.writeText(md);
    toast.success("Copied saved tools markdown to clipboard!");
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="bookmarks" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8 h-10">
          <TabsTrigger value="bookmarks" className="text-xs font-semibold">
            Saved Tools ({bookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="builder" className="text-xs font-semibold">
            Stack Builder
          </TabsTrigger>
          <TabsTrigger value="community" className="text-xs font-semibold">
            Community Stacks
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SAVED TOOLS */}
        <TabsContent value="bookmarks" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Search saved tools..."
                value={savedSearch}
                onChange={(e) => setSavedSearch(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyBookmarksAsMarkdown}
                className="text-xs h-9 gap-1.5"
                disabled={bookmarks.length === 0}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Export as Markdown</span>
              </Button>
            </div>
          </div>

          {filteredSavedTools.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 space-y-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bookmark className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">No saved tools yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click the bookmark icon on any tool card while exploring the directory to save it here.
                </p>
              </div>
              <Link href="/tools">
                <Button size="sm" className="text-xs gap-1.5">
                  <span>Explore Tools</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSavedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-4 rounded-xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="font-bold text-foreground hover:text-primary transition-colors truncate"
                      >
                        {tool.name}
                      </Link>
                      <button
                        onClick={() => toggleBookmark(tool)}
                        className="text-primary hover:text-destructive transition-colors shrink-0"
                        title="Remove bookmark"
                      >
                        <Bookmark className="h-4 w-4 fill-primary" />
                      </button>
                    </div>

                    {tool.categoryName && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {tool.categoryName}
                      </span>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View Tool →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: STACK BUILDER */}
        <TabsContent value="builder" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Stack Configuration & Staged Tools (7 cols) */}
            <form onSubmit={handleSaveStack} className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-xs space-y-4">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span>Curate Your Stack</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Stack Name *</label>
                    <Input
                      value={stackName}
                      onChange={(e) => setStackName(e.target.value)}
                      placeholder="e.g. Modern Rust Microservices Stack 2026"
                      className="text-sm mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Description</label>
                    <Textarea
                      value={stackDesc}
                      onChange={(e) => setStackDesc(e.target.value)}
                      placeholder="Explain your architectural choices, target scale, or developer experience advantages..."
                      className="text-sm mt-1 resize-none h-20"
                    />
                  </div>
                </div>
              </div>

              {/* Staged Tools in Stack */}
              <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>Selected Tools ({selectedTools.length})</span>
                  </h4>
                  {selectedTools.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTools([])}
                      className="text-xs text-muted-foreground hover:text-destructive h-7"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {selectedTools.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border/60 rounded-xl">
                    No tools added yet. Select tools from the catalog on the right.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedTools.map(({ toolId, role }) => {
                      const tool = availableTools.find((t) => t.id === toolId);
                      if (!tool) return null;
                      return (
                        <div
                          key={toolId}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-foreground block truncate">
                              {tool.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate block">
                              {tool.tagline}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={role}
                              onChange={(e) => updateToolRole(toolId, e.target.value)}
                              className="text-[11px] font-semibold bg-background border border-border/70 rounded-md px-2 py-1 text-foreground focus:outline-none"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => removeToolFromStack(toolId)}
                              className="text-muted-foreground hover:text-destructive p-1"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || selectedTools.length === 0}
                  className="w-full text-xs font-semibold gap-1.5 h-10 mt-4"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSubmitting ? "Publishing..." : "Publish & Share Tech Stack"}</span>
                </Button>
              </div>
            </form>

            {/* Right: Available Catalog Search & Selector (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-border/70 bg-card shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-foreground">Add Tools by Role</h4>

              {/* Role selector buttons */}
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRole(r)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      activeRole === r
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Search tool */}
              <Input
                placeholder={`Search tools to add as ${activeRole}...`}
                value={searchTool}
                onChange={(e) => setSearchTool(e.target.value)}
                className="text-xs h-9"
              />

              <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                {filteredAvailableTools.slice(0, 25).map((tool) => {
                  const isAdded = selectedTools.some((st) => st.toolId === tool.id);
                  return (
                    <div
                      key={tool.id}
                      className="pt-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground truncate">
                            {tool.name}
                          </span>
                          {tool.hiddenGem && (
                            <span className="text-[10px] px-1 rounded bg-violet-500/10 text-violet-600 font-semibold">
                              Gem
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tool.tagline}
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={isAdded ? "secondary" : "outline"}
                        onClick={() => addToolToStack(tool)}
                        className="h-7 px-2.5 text-xs gap-1 shrink-0"
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3 w-3 text-primary" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: COMMUNITY STACKS */}
        <TabsContent value="community" className="space-y-6">
          {communityStacks.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 space-y-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground">No community stacks published yet</h3>
              <p className="text-xs text-muted-foreground">
                Be the first to curate and share a tech stack using the Stack Builder!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityStacks.map((st) => (
                <div
                  key={st.id}
                  className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-2">
                    <Link
                      href={`/stacks/${st.slug}`}
                      className="font-bold text-lg text-foreground hover:text-primary transition-colors block"
                    >
                      {st.name}
                    </Link>
                    {st.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {st.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {st.tools.map(({ role, tool }) => (
                        <span
                          key={tool.id}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                        >
                          <span className="font-medium text-foreground">{tool.name}</span>
                          {role && (
                            <span className="text-[10px] text-muted-foreground">
                              ({role})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground">
                      By {st.user.name || st.user.email.split("@")[0]}
                    </span>
                    <Link
                      href={`/stacks/${st.slug}`}
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Stack</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
