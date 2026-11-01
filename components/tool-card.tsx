"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";
import { HiddenGemBadge } from "@/components/hidden-gem-badge";
import { TagBadge } from "@/components/tag-badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { CompareButton } from "@/components/compare-button";
import { cn } from "@/lib/utils";

export interface ToolCardData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  websiteUrl: string;
  githubUrl?: string | null;
  license?: string | null;
  pricing?: string | null;
  popularity?: number;
  hiddenGem?: boolean;
  hiddenGemReason?: string | null;
  category?: {
    name: string;
    slug: string;
    icon?: string | null;
  } | null;
  country?: {
    code: string;
    name: string;
    region?: string | null;
  } | null;
  tags?: Array<{
    name: string;
    slug: string;
  }>;
}

interface ToolCardProps {
  tool: ToolCardData;
  layout?: "grid" | "list";
  className?: string;
}

export function ToolCard({ tool, layout = "grid", className }: ToolCardProps) {
  const commonToolData = {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline,
    categoryName: tool.category?.name,
    countryCode: tool.country?.code,
  };

  if (layout === "list") {
    return (
      <Card
        className={cn(
          "group border border-border/70 bg-card hover:bg-card/90 transition-all duration-200 hover:shadow-md hover:border-border",
          tool.hiddenGem && "border-violet-500/20 hover:border-violet-500/40 bg-gradient-to-r from-card to-violet-500/5",
          className
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/tools/${tool.slug}`}
                className="font-bold text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <span>{tool.name}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-primary" />
              </Link>

              {tool.country && (
                <CountryFlag
                  code={tool.country.code}
                  name={tool.country.name}
                  linkable={true}
                  className="text-xs"
                />
              )}

              {tool.hiddenGem && (
                <HiddenGemBadge reason={tool.hiddenGemReason} size="sm" />
              )}

              {tool.category && (
                <Link href={`/categories/${tool.category.slug}`}>
                  <Badge variant="outline" className="text-[11px] font-normal hover:bg-muted">
                    {tool.category.name}
                  </Badge>
                </Link>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {tool.tagline}
            </p>

            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tool.tags.slice(0, 4).map((tag) => (
                  <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <CompareButton tool={commonToolData} variant="pill" />
            <BookmarkButton tool={commonToolData} variant="icon" />

            {tool.pricing && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                {tool.pricing}
              </span>
            )}
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              title={`Visit official ${tool.name} website`}
            >
              <span>Visit</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid layout
  return (
    <Card
      className={cn(
        "group flex flex-col justify-between h-full border border-border/70 bg-card hover:bg-card/90 transition-all duration-200 hover:shadow-md hover:border-border group-hover:-translate-y-0.5",
        tool.hiddenGem && "border-violet-500/25 hover:border-violet-500/50 bg-gradient-to-b from-card via-card to-violet-500/5",
        className
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Top Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/tools/${tool.slug}`}
                className="font-bold text-lg text-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1 focus:outline-none"
              >
                <span className="truncate">{tool.name}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-primary" />
              </Link>

              {tool.country && (
                <div className="mt-0.5">
                  <CountryFlag
                    code={tool.country.code}
                    name={tool.country.name}
                    linkable={true}
                    className="text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <BookmarkButton tool={commonToolData} variant="icon" />
              {tool.hiddenGem ? (
                <HiddenGemBadge reason={tool.hiddenGemReason} size="sm" />
              ) : (
                tool.category && (
                  <Link href={`/categories/${tool.category.slug}`}>
                    <Badge variant="outline" className="text-[11px] font-normal hover:bg-muted shrink-0">
                      {tool.category.name}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {tool.tagline}
          </p>
        </div>

        {/* Footer Area */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
              ))}
              {tool.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center px-1">
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <CompareButton tool={commonToolData} variant="pill" />
              {tool.pricing && (
                <span className="capitalize">{tool.pricing}</span>
              )}
            </div>

            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground transition-colors shadow-2xs"
            >
              <span>Official Site</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
