import React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";

interface AlternativeTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  websiteUrl: string;
  pricing: string;
  license?: string | null;
  hiddenGem: boolean;
  hiddenGemReason?: string | null;
  category?: { name: string; slug: string } | null;
  country?: { code: string; name: string } | null;
}

interface ToolAlternativesProps {
  currentTool: {
    id: string;
    name: string;
    slug: string;
    hiddenGem: boolean;
    category: { name: string; slug: string };
  };
  alternatives: AlternativeTool[];
}

export function ToolAlternatives({ currentTool, alternatives }: ToolAlternativesProps) {
  if (alternatives.length === 0) return null;

  return (
    <section className="space-y-6 pt-6 border-t border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Alternative Swaps</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Alternatives & Replacements for {currentTool.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            Looking for independent, open-source, or lightweight alternatives? Compare options in the {currentTool.category.name} space.
          </p>
        </div>

        <Link
          href={`/compare?tools=${currentTool.slug},${alternatives[0]?.slug}`}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
        >
          <span>Compare vs #1 Alternative</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border bg-card shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
              alt.hiddenGem
                ? "border-violet-500/30 hover:border-violet-500/60 bg-gradient-to-b from-card to-violet-500/5"
                : "border-border/70 hover:border-border"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/tools/${alt.slug}`}
                    className="font-bold text-base text-foreground hover:text-primary transition-colors block"
                  >
                    {alt.name}
                  </Link>
                  {alt.country && (
                    <div className="mt-0.5">
                      <CountryFlag
                        code={alt.country.code}
                        name={alt.country.name}
                        linkable={true}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                {alt.hiddenGem && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/10 shrink-0"
                  >
                    Hidden Gem
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {alt.tagline}
              </p>

              {alt.hiddenGem && alt.hiddenGemReason && (
                <div className="text-[11px] text-violet-600/90 dark:text-violet-300/90 italic bg-violet-500/10 p-2 rounded-lg line-clamp-2">
                  &ldquo;{alt.hiddenGemReason}&rdquo;
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
              <Link
                href={`/compare?tools=${currentTool.slug},${alt.slug}`}
                className="font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Compare</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              <a
                href={alt.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground transition-colors"
              >
                <span>Visit Site</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
