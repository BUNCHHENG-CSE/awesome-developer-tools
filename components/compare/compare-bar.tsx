"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/lib/compare-context";

export function CompareBar() {
  const pathname = usePathname();
  const { tools, removeTool, clearCompare, compareUrl } = useCompare();

  // Hide on admin routes or if on compare page itself
  if (pathname?.startsWith("/admin") || pathname === "/compare" || tools.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Compare Tools Floating Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-card/95 border border-primary/30 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground shrink-0 pr-2 border-r border-border/60">
            <Scale className="h-4 w-4 text-primary" />
            <span>Compare ({tools.length}/4)</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {tools.map((t) => (
              <span
                key={t.slug}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/60"
              >
                <span className="max-w-[90px] truncate">{t.name}</span>
                <button
                  onClick={() => removeTool(t.slug)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                  aria-label={`Remove ${t.name} from comparison`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCompare}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Clear all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Link href={compareUrl}>
            <Button size="sm" className="h-8 text-xs font-semibold gap-1 px-3.5">
              <span>Compare</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
