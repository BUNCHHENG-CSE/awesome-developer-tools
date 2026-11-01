import React from "react";
import Link from "next/link";
import { getFlagEmoji } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
  code?: string | null;
  name?: string | null;
  showName?: boolean;
  linkable?: boolean;
  className?: string;
  flagSize?: "sm" | "md" | "lg";
}

export function CountryFlag({
  code,
  name,
  showName = true,
  linkable = false,
  className,
  flagSize = "md",
}: CountryFlagProps) {
  if (!code && !name) return null;

  const emoji = code ? getFlagEmoji(code) : "🌐";
  const displayName = name || code || "Global";

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground",
        sizeClasses[flagSize],
        className
      )}
      title={`${displayName} (${code || "Unknown"})`}
    >
      <span className="leading-none text-base select-none" aria-hidden="true">
        {emoji}
      </span>
      {showName && <span className="truncate">{displayName}</span>}
    </span>
  );

  if (linkable && code) {
    return (
      <Link
        href={`/countries/${code.toLowerCase()}`}
        className="hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded inline-block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
