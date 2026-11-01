import React from "react";
import Link from "next/link";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  resetHref?: string;
  resetLabel?: string;
  className?: string;
}

export function EmptyState({
  title = "No tools found",
  description = "We couldn't find any tools matching your criteria. Try adjusting your filters or search keywords.",
  resetHref,
  resetLabel = "Clear all filters",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card/40 my-8",
        className
      )}
    >
      <div className="p-4 rounded-full bg-muted/60 text-muted-foreground mb-4">
        <SearchX className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {resetHref && (
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={resetHref}>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetLabel}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
