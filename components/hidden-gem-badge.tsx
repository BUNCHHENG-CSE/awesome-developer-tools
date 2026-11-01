"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HiddenGemBadgeProps {
  reason?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export function HiddenGemBadge({
  reason,
  className,
  size = "md",
}: HiddenGemBadgeProps) {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 transition-colors shadow-xs select-none",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Sparkles className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", "text-violet-500 animate-pulse")} />
      <span>Hidden Gem</span>
    </span>
  );

  if (!reason) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="cursor-help inline-block">{badge}</span>} />
      <TooltipContent className="max-w-xs bg-popover text-popover-foreground border border-border text-xs p-2.5 shadow-md">
        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-0.5 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Why it&apos;s a gem
        </p>
        <p className="text-muted-foreground leading-relaxed">{reason}</p>
      </TooltipContent>
    </Tooltip>
  );
}
