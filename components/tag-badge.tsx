import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  slug?: string;
  className?: string;
  count?: number;
}

export function TagBadge({ name, slug, className, count }: TagBadgeProps) {
  const targetSlug = slug || name.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      href={`/tags/${targetSlug}`}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40 transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
        className
      )}
    >
      <span className="text-muted-foreground">#</span>
      <span>{name}</span>
      {count !== undefined && (
        <span className="ml-1 text-[10px] text-muted-foreground/80">({count})</span>
      )}
    </Link>
  );
}
