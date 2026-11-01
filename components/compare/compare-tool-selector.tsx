"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCompare } from "@/lib/compare-context";

interface ToolOption {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  categoryName?: string;
}

interface CompareToolSelectorProps {
  allTools: ToolOption[];
  currentSlugs: string[];
}

export function CompareToolSelector({ allTools, currentSlugs }: CompareToolSelectorProps) {
  const router = useRouter();
  const { addTool, removeTool } = useCompare();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = allTools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tagline.toLowerCase().includes(search.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSlug = (tool: ToolOption) => {
    let nextSlugs: string[];
    if (currentSlugs.includes(tool.slug)) {
      nextSlugs = currentSlugs.filter((s) => s !== tool.slug);
      removeTool(tool.slug);
    } else {
      if (currentSlugs.length >= 4) {
        alert("You can compare up to 4 tools at once.");
        return;
      }
      nextSlugs = [...currentSlugs, tool.slug];
      addTool({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        categoryName: tool.categoryName,
      });
    }

    router.push(`/compare?tools=${nextSlugs.join(",")}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-2 text-xs h-9">
            <Plus className="h-4 w-4" />
            <span>Manage Tools ({currentSlugs.length}/4)</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border/60">
          <DialogTitle className="text-base font-bold">Select Tools to Compare</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools to add..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 pr-1 divide-y divide-border/40">
            {filtered.slice(0, 30).map((tool) => {
              const isSelected = currentSlugs.includes(tool.slug);
              return (
                <button
                  key={tool.id}
                  onClick={() => toggleSlug(tool)}
                  className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{tool.name}</span>
                      {tool.categoryName && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                          {tool.categoryName}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{tool.tagline}</p>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
