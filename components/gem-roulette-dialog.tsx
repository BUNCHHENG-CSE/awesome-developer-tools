"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Dices,
  Sparkles,
  ExternalLink,
  ArrowRight,
  RotateCw,
  Quote,
  Shield,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";

interface RouletteGem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  pricing: string;
  license?: string | null;
  hiddenGemReason?: string | null;
  category?: { name: string; slug: string } | null;
  country?: { code: string; name: string; region?: string | null } | null;
  tags?: Array<{ name: string; slug: string }>;
}

interface GemRouletteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GemRouletteDialog({ open, onOpenChange }: GemRouletteDialogProps) {
  const [gem, setGem] = useState<RouletteGem | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("Spinning...");

  const teaserNames = [
    "Hono",
    "DuckDB",
    "VictoriaMetrics",
    "Restic",
    "Hoppscotch",
    "Coolify",
    "Convoy",
    "Dragonfly",
    "k6",
    "Lazygit",
    "NocoDB",
    "Meilisearch",
    "Unleash",
  ];

  const spin = useCallback(async () => {
    setSpinning(true);

    // Rapid name ticker animation
    let tickCount = 0;
    const interval = setInterval(() => {
      setDisplayTitle(teaserNames[tickCount % teaserNames.length]);
      tickCount++;
    }, 70);

    try {
      const res = await fetch(`/api/tools/random${gem ? `?excludeId=${gem.id}` : ""}`);
      const data = await res.json();

      setTimeout(() => {
        clearInterval(interval);
        if (data.data) {
          setGem(data.data);
          setDisplayTitle(data.data.name);
        }
        setSpinning(false);
      }, 900);
    } catch {
      clearInterval(interval);
      setSpinning(false);
    }
  }, [gem]);

  useEffect(() => {
    if (open && !gem) {
      spin();
    }
  }, [open, gem, spin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-violet-500/30">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-primary p-6 text-white relative overflow-hidden">
          <div className="absolute top-2 right-3 opacity-15 pointer-events-none">
            <Sparkles className="h-32 w-32" />
          </div>

          <DialogHeader className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-white/20 backdrop-blur-xs">
                <Dices className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                Random Hidden Gem Roulette
              </span>
            </div>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2 pt-1">
              <span>{spinning ? displayTitle : gem?.name || "Discovery"}</span>
              {!spinning && <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />}
            </DialogTitle>
            <DialogDescription className="text-violet-100 text-xs">
              Unearth extraordinary IT tools built across the world that 99% of developers haven&apos;t heard of.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {spinning ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RotateCw className="h-8 w-8 text-violet-600 animate-spin" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Consulting the global radar...
              </p>
            </div>
          ) : gem ? (
            <div className="space-y-5">
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {gem.country && (
                  <CountryFlag
                    code={gem.country.code}
                    name={gem.country.name}
                    linkable={false}
                    className="font-medium bg-muted px-2.5 py-1 rounded-md"
                  />
                )}
                {gem.category && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{gem.category.name}</span>
                  </Badge>
                )}
                {gem.license && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>{gem.license}</span>
                  </Badge>
                )}
                <span className="text-xs capitalize text-muted-foreground px-2 py-0.5 rounded bg-muted/60">
                  {gem.pricing}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-base font-medium text-foreground leading-snug">
                {gem.tagline}
              </p>

              {/* Editorial Reason Callout */}
              {gem.hiddenGemReason && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-violet-600 dark:text-violet-400">
                    <Quote className="h-3.5 w-3.5 rotate-180" />
                    <span>Why it&apos;s a Hidden Gem:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-5">
                    {gem.hiddenGemReason}
                  </p>
                </div>
              )}

              {/* Tag Pills */}
              {gem.tags && gem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {gem.tags.slice(0, 5).map((t) => (
                    <span
                      key={t.slug}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={spin}
                  className="w-full sm:w-auto gap-2 text-xs"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Spin Again (R)</span>
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/tools/${gem.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex-1 sm:flex-initial"
                  >
                    <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5">
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>

                  <a
                    href={gem.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button size="sm" className="w-full text-xs gap-1.5">
                      <span>Visit Site</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Could not load gem. Try spinning again.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
