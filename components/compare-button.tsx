"use client";

import React from "react";
import { Scale, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare, CompareToolItem } from "@/lib/compare-context";
import { cn } from "@/lib/utils";

interface CompareButtonProps {
  tool: CompareToolItem;
  variant?: "icon" | "button" | "pill";
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function CompareButton({
  tool,
  variant = "pill",
  className,
  size = "sm",
}: CompareButtonProps) {
  const { isInCompare, toggleTool } = useCompare();
  const inCompare = isInCompare(tool.slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTool(tool);
  };

  if (variant === "button") {
    return (
      <Button
        variant={inCompare ? "secondary" : "outline"}
        size={size}
        onClick={handleClick}
        className={cn(
          "gap-2 text-xs",
          inCompare && "text-primary border-primary/40 bg-primary/10",
          className
        )}
      >
        {inCompare ? <Check className="h-4 w-4 text-primary" /> : <Scale className="h-4 w-4" />}
        <span>{inCompare ? "In Comparison" : "+ Compare"}</span>
      </Button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors focus:outline-none",
          inCompare
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50",
          className
        )}
        title={inCompare ? "Remove from comparison" : "Add to comparison"}
      >
        {inCompare ? <Check className="h-3 w-3 text-primary" /> : <Scale className="h-3 w-3" />}
        <span>{inCompare ? "Comparing" : "Compare"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={inCompare ? `Remove ${tool.name} from comparison` : `Add ${tool.name} to comparison`}
      className={cn(
        "p-1.5 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none",
        inCompare && "text-primary hover:text-primary",
        className
      )}
      title={inCompare ? "Remove from comparison" : "Add to comparison"}
    >
      <Scale className={cn("h-4 w-4", inCompare && "text-primary")} />
    </button>
  );
}
