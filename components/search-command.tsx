"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Folder,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { CountryFlag } from "@/components/country-flag";
import { Badge } from "@/components/ui/badge";

interface SearchResultTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  hiddenGem: boolean;
  websiteUrl: string;
  category: {
    name: string;
    slug: string;
  };
  country?: {
    code: string;
    name: string;
  } | null;
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Global keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!cancelled && data && data.data && data.data.tools) {
          setResults(data.data.tools);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const navigateTo = (path: string) => {
    onOpenChange(false);
    startTransition(() => {
      router.push(path);
    });
  };

  const hiddenGems = results.filter((r) => r.hiddenGem);
  const standardTools = results.filter((r) => !r.hiddenGem);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search DevAtlas"
      description="Quick search for tools, languages, frameworks, and hidden gems"
    >
      <CommandInput
        placeholder="Search tools, countries, categories (e.g. Hono, Docker, Japan, Rust)..."
        value={query}
        onValueChange={handleQueryChange}
      />
      <CommandList className="max-h-[350px]">
        {loading && (
          <div className="flex items-center justify-center p-6 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Searching directory...</span>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <CommandEmpty>No matching tools found for &quot;{query}&quot;.</CommandEmpty>
        )}

        {!query && (
          <div className="p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Suggested Quick Links:</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => navigateTo("/hidden-gems")}
                className="text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5 text-violet-600 dark:text-violet-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Hidden Gems Leaderboard</span>
              </button>
              <button
                onClick={() => navigateTo("/tools")}
                className="text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5 text-foreground"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Browse All 140+ Tools</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden Gems Section */}
        {hiddenGems.length > 0 && (
          <CommandGroup heading="💎 Under-the-Radar Hidden Gems">
            {hiddenGems.map((tool) => (
              <CommandItem
                key={tool.id}
                value={`gem-${tool.name}-${tool.category.name}`}
                onSelect={() => navigateTo(`/tools/${tool.slug}`)}
                className="flex items-center justify-between p-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{tool.name}</span>
                      {tool.country && (
                        <CountryFlag code={tool.country.code} showName={false} className="text-xs" />
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-600 dark:text-violet-400">
                        {tool.category.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50 shrink-0 ml-2" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hiddenGems.length > 0 && standardTools.length > 0 && <CommandSeparator />}

        {/* Regular Tools Section */}
        {standardTools.length > 0 && (
          <CommandGroup heading="Tools & Frameworks">
            {standardTools.map((tool) => (
              <CommandItem
                key={tool.id}
                value={`tool-${tool.name}-${tool.category.name}`}
                onSelect={() => navigateTo(`/tools/${tool.slug}`)}
                className="flex items-center justify-between p-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{tool.name}</span>
                      {tool.country && (
                        <CountryFlag code={tool.country.code} showName={false} className="text-xs" />
                      )}
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tool.category.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50 shrink-0 ml-2" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value={`view-all-${query}`}
                onSelect={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
                className="justify-center text-primary font-semibold text-xs py-2.5 cursor-pointer"
              >
                <span>View all search results for &quot;{query}&quot; →</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
