"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ToolFilters } from "@/components/tool-filters";
import { ToolCard, ToolCardData } from "@/components/tool-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolsDirectoryViewProps {
  tools: ToolCardData[];
  total: number;
  page: number;
  totalPages: number;
  categories: Array<{ id: string; name: string; slug: string }>;
  countries: Array<{ code: string; name: string; region: string | null }>;
  regions: string[];
}

export function ToolsDirectoryView({
  tools,
  total,
  page,
  totalPages,
  categories,
  countries,
  regions,
}: ToolsDirectoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Filters Header */}
      <ToolFilters
        categories={categories}
        countries={countries}
        regions={regions}
        totalResults={total}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {/* Tools Listing */}
      {tools.length === 0 ? (
        <EmptyState
          resetHref="/tools"
          resetLabel="Reset All Filters"
          title="No software tools matched your criteria"
          description="Try broadening your search query, deselecting regional filters, or toggling off specific pricing restrictions."
        />
      ) : (
        <div
          className={cn(
            layout === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          )}
        >
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} layout={layout} />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
