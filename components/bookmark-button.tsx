"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks, BookmarkedTool } from "@/lib/bookmarks-context";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  tool: BookmarkedTool;
  variant?: "icon" | "button";
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function BookmarkButton({
  tool,
  variant = "icon",
  className,
  size = "default",
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(tool.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(tool);
  };

  if (variant === "button") {
    return (
      <Button
        variant={bookmarked ? "secondary" : "outline"}
        size={size}
        onClick={handleClick}
        className={cn(
          "gap-2 text-xs",
          bookmarked && "text-primary border-primary/40 bg-primary/10",
          className
        )}
      >
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary text-primary")} />
        <span>{bookmarked ? "Saved" : "Save Tool"}</span>
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={bookmarked ? `Remove ${tool.name} from saved` : `Save ${tool.name}`}
      className={cn(
        "p-1.5 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none",
        bookmarked && "text-primary hover:text-primary",
        className
      )}
      title={bookmarked ? "Remove from bookmarks" : "Bookmark tool"}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary text-primary")} />
    </button>
  );
}
