import React from "react";
import { Star, GitFork, AlertCircle, CheckCircle2 } from "lucide-react";
import { fetchGitHubRepo, formatNumberCompact } from "@/lib/github";
import { cn } from "@/lib/utils";

interface GitHubStatsBadgeProps {
  githubUrl?: string | null;
  className?: string;
  showExtended?: boolean;
}

export async function GitHubStatsBadge({
  githubUrl,
  className,
  showExtended = false,
}: GitHubStatsBadgeProps) {
  if (!githubUrl) return null;

  const data = await fetchGitHubRepo(githubUrl);
  if (!data) return null;

  if (showExtended) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/30 text-xs",
          className
        )}
      >
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>{formatNumberCompact(data.stars)}</span>
          <span className="text-muted-foreground font-normal">stars</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <GitFork className="h-3.5 w-3.5" />
          <span>{formatNumberCompact(data.forks)} forks</span>
        </div>

        {data.isMaintained ? (
          <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            Actively Maintained
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px]">
            <AlertCircle className="h-3 w-3" />
            Legacy Maintenance
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60",
        className
      )}
      title={`${data.stars.toLocaleString()} GitHub stars`}
    >
      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
      <span>{formatNumberCompact(data.stars)}</span>
      {data.isMaintained && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Active repo" />
      )}
    </div>
  );
}
