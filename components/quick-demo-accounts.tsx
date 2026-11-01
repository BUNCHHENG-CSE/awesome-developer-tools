"use client";

import React from "react";
import { Shield, UserCheck, Sparkles, Zap, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QuickDemoAccountsProps {
  onFill: (email: string, pass: string) => void;
  onQuickLogin?: (email: string, pass: string) => void;
  currentEmail?: string;
  isLoading?: boolean;
  className?: string;
}

export function QuickDemoAccounts({
  onFill,
  onQuickLogin,
  currentEmail = "",
  isLoading = false,
  className,
}: QuickDemoAccountsProps) {
  const normalizedEmail = (currentEmail || "").toLowerCase().trim();
  const isAdminSelected = normalizedEmail === "admin@devatlas.com";
  const isSubmitterSelected = normalizedEmail === "user@devatlas.com";

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
          <span>Quick Demo Accounts</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          Click card to fill or 1-Click login
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Admin Demo Card */}
        <div
          role="button"
          tabIndex={0}
          title="Click to autofill Admin credentials"
          aria-label="Autofill Admin credentials"
          onClick={() => !isLoading && onFill("admin@devatlas.com", "admin123")}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isLoading) {
              e.preventDefault();
              onFill("admin@devatlas.com", "admin123");
            }
          }}
          className={cn(
            "group relative flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
            isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            isAdminSelected
              ? "border-violet-500/80 bg-violet-500/10 shadow-xs ring-1 ring-violet-500/30"
              : "border-border/70 bg-card/60 hover:bg-violet-500/[0.04] hover:border-violet-500/40 hover:shadow-xs"
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 border",
                    isAdminSelected
                      ? "bg-violet-500/25 border-violet-500/60 text-violet-300 ring-2 ring-violet-500/20 shadow-xs"
                      : "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500/20 group-hover:border-violet-500/40 group-hover:text-violet-300 group-hover:scale-105"
                  )}
                >
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1 leading-none">
                    <span>Admin</span>
                    {isAdminSelected && (
                      <Check className="h-3 w-3 text-violet-500 animate-in zoom-in-50 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1 py-0 font-medium h-4 border transition-colors shrink-0",
                  isAdminSelected
                    ? "border-violet-500/50 bg-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold"
                    : "border-border/70 text-muted-foreground group-hover:border-violet-500/40 group-hover:text-violet-600 dark:group-hover:text-violet-300 group-hover:bg-violet-500/10"
                )}
              >
                /admin
              </Badge>
            </div>

            <div className="text-[10px] text-muted-foreground font-mono truncate leading-tight mb-2 group-hover:text-foreground/90 transition-colors">
              admin@devatlas.com
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border/40 group-hover:border-border/70 transition-colors text-[10px]">
            <span className="font-mono text-muted-foreground/90 bg-muted/70 group-hover:bg-muted group-hover:text-foreground px-1.5 py-0.5 rounded text-[9px] transition-colors">
              admin123
            </span>
            {onQuickLogin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickLogin("admin@devatlas.com", "admin123");
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium border border-border/60 bg-muted/60 text-muted-foreground group-hover:bg-violet-500/15 group-hover:border-violet-500/30 group-hover:text-violet-600 dark:group-hover:text-violet-300 hover:!bg-violet-600 hover:!text-white hover:!border-violet-600 transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50 text-[10px]"
                title="Instant 1-Click Sign In as Admin"
              >
                <Zap className="h-2.5 w-2.5 fill-current" />
                <span>1-Click</span>
              </button>
            )}
          </div>
        </div>

        {/* Submitter Demo Card */}
        <div
          role="button"
          tabIndex={0}
          title="Click to autofill Submitter credentials"
          aria-label="Autofill Submitter credentials"
          onClick={() => !isLoading && onFill("user@devatlas.com", "user123")}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isLoading) {
              e.preventDefault();
              onFill("user@devatlas.com", "user123");
            }
          }}
          className={cn(
            "group relative flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
            isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            isSubmitterSelected
              ? "border-sky-500/80 bg-sky-500/10 shadow-xs ring-1 ring-sky-500/30"
              : "border-border/70 bg-card/60 hover:bg-sky-500/[0.04] hover:border-sky-500/40 hover:shadow-xs"
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 border",
                    isSubmitterSelected
                      ? "bg-sky-500/25 border-sky-500/60 text-sky-300 ring-2 ring-sky-500/20 shadow-xs"
                      : "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 group-hover:text-sky-300 group-hover:scale-105"
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1 leading-none">
                    <span>Submitter</span>
                    {isSubmitterSelected && (
                      <Check className="h-3 w-3 text-sky-500 animate-in zoom-in-50 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1 py-0 font-medium h-4 border transition-colors shrink-0",
                  isSubmitterSelected
                    ? "border-sky-500/50 bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold"
                    : "border-border/70 text-muted-foreground group-hover:border-sky-500/40 group-hover:text-sky-600 dark:group-hover:text-sky-300 group-hover:bg-sky-500/10"
                )}
              >
                User
              </Badge>
            </div>

            <div className="text-[10px] text-muted-foreground font-mono truncate leading-tight mb-2 group-hover:text-foreground/90 transition-colors">
              user@devatlas.com
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border/40 group-hover:border-border/70 transition-colors text-[10px]">
            <span className="font-mono text-muted-foreground/90 bg-muted/70 group-hover:bg-muted group-hover:text-foreground px-1.5 py-0.5 rounded text-[9px] transition-colors">
              user123
            </span>
            {onQuickLogin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickLogin("user@devatlas.com", "user123");
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium border border-border/60 bg-muted/60 text-muted-foreground group-hover:bg-sky-500/15 group-hover:border-sky-500/30 group-hover:text-sky-600 dark:group-hover:text-sky-300 hover:!bg-sky-500 hover:!text-white hover:!border-sky-500 transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50 text-[10px]"
                title="Instant 1-Click Sign In as Tool Submitter"
              >
                <Zap className="h-2.5 w-2.5 fill-current" />
                <span>1-Click</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
