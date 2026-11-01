"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Sparkles,
  LayoutGrid,
  List,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  countries: Array<{ code: string; name: string; region: string | null }>;
  regions: string[];
  totalResults: number;
  layout: "grid" | "list";
  onLayoutChange: (layout: "grid" | "list") => void;
}

export function ToolFilters({
  categories,
  countries,
  regions,
  totalResults,
  layout,
  onLayoutChange,
}: ToolFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentRegion = searchParams.get("region") || "";
  const currentPricing = searchParams.get("pricing") || "";
  const currentHiddenGem = searchParams.get("hiddenGem") === "true";
  const currentSort = searchParams.get("sort") || "popularity-desc";
  const currentTag = searchParams.get("tag") || "";

  const [searchTerm, setSearchTerm] = useState(currentQ);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    // Reset page to 1 on filter change
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchTerm);
  };

  const hasActiveFilters =
    Boolean(currentQ) ||
    Boolean(currentCategory) ||
    Boolean(currentCountry) ||
    Boolean(currentRegion) ||
    Boolean(currentPricing) ||
    currentHiddenGem ||
    Boolean(currentTag) ||
    currentSort !== "popularity-desc";

  return (
    <div className="space-y-4">
      {/* Search Bar + Hidden Gem Switch + Layout Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by tool name, keywords, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-10 w-full bg-background"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateParam("q", null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent Hidden Gem Toggle */}
          <div
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all cursor-pointer select-none",
              currentHiddenGem
                ? "bg-violet-500/15 border-violet-500/50 text-violet-700 dark:text-violet-300 font-semibold"
                : "bg-background border-border/70 text-foreground hover:border-violet-500/30"
            )}
            onClick={() => updateParam("hiddenGem", currentHiddenGem ? null : "true")}
          >
            <Sparkles className={cn("h-4 w-4", currentHiddenGem ? "text-violet-500 animate-pulse" : "text-muted-foreground")} />
            <span className="text-xs">🎯 Hidden gems only</span>
            <Switch
              checked={currentHiddenGem}
              onCheckedChange={(checked) => updateParam("hiddenGem", checked ? "true" : null)}
              className="pointer-events-none"
            />
          </div>

          {/* Grid vs List layout switcher */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-background">
            <Button
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onLayoutChange("grid")}
              aria-label="Grid layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onLayoutChange("list")}
              aria-label="List layout"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-3 rounded-xl border border-border/60 bg-muted/30">
        {/* Category */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </label>
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value || null)}
            className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground shadow-2xs focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Region
          </label>
          <select
            value={currentRegion}
            onChange={(e) => updateParam("region", e.target.value || null)}
            className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground shadow-2xs focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Country
          </label>
          <select
            value={currentCountry}
            onChange={(e) => updateParam("country", e.target.value || null)}
            className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground shadow-2xs focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code.toLowerCase()}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pricing
          </label>
          <select
            value={currentPricing}
            onChange={(e) => updateParam("pricing", e.target.value || null)}
            className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground shadow-2xs focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="">All Pricing</option>
            <option value="free">Free / Open Source</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Sort */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sort By
          </label>
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value || null)}
            className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground shadow-2xs focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="popularity-desc">Popularity (High to Low)</option>
            <option value="popularity-asc">Under-the-Radar (Hidden Gems First)</option>
            <option value="newest">Newest Added</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-foreground">
            {totalResults} {totalResults === 1 ? "tool" : "tools"} found
          </span>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 ml-2">
              {currentQ && (
                <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                  Query: {currentQ}
                  <button onClick={() => updateParam("q", null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentCategory && (
                <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                  Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <button onClick={() => updateParam("category", null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentRegion && (
                <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                  Region: {currentRegion}
                  <button onClick={() => updateParam("region", null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentCountry && (
                <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                  Country: {countries.find((c) => c.code.toLowerCase() === currentCountry.toLowerCase())?.name || currentCountry}
                  <button onClick={() => updateParam("country", null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentPricing && (
                <Badge variant="secondary" className="gap-1 text-xs py-0.5 capitalize">
                  {currentPricing}
                  <button onClick={() => updateParam("pricing", null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentHiddenGem && (
                <Badge className="gap-1 text-xs py-0.5 bg-violet-600 hover:bg-violet-700 text-white">
                  Hidden Gems Only
                  <button onClick={() => updateParam("hiddenGem", null)} className="hover:text-violet-200">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentTag && (
                <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                  Tag: #{currentTag}
                  <button onClick={() => updateParam("tag", null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1 px-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear all</span>
              </Button>
            </div>
          )}
        </div>

        {isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Updating results...
          </span>
        )}
      </div>
    </div>
  );
}
