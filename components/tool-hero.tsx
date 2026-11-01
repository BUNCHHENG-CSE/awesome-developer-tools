import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  GitFork,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";
import { HiddenGemBadge } from "@/components/hidden-gem-badge";
import { TagBadge } from "@/components/tag-badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { CompareButton } from "@/components/compare-button";
import { GitHubStatsBadge } from "@/components/github-stats-badge";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

interface ToolHeroProps {
  tool: {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    docsUrl?: string | null;
    githubUrl?: string | null;
    license?: string | null;
    pricing: string;
    createdYear?: number | null;
    popularity: number;
    hiddenGem: boolean;
    hiddenGemReason?: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
      icon?: string | null;
    };
    country?: {
      id: string;
      code: string;
      name: string;
      region?: string | null;
    } | null;
    parentTool?: {
      id: string;
      name: string;
      slug: string;
      tagline?: string | null;
    } | null;
    children?: Array<{
      id: string;
      name: string;
      slug: string;
      tagline?: string | null;
    }>;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
}

export function ToolHero({ tool }: ToolHeroProps) {
  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Link href="/tools" className="hover:text-foreground transition-colors">
            Tools
          </Link>
          <span>/</span>
          <Link
            href={`/categories/${tool.category.slug}`}
            className="hover:text-foreground transition-colors font-medium text-foreground"
          >
            {tool.category.name}
          </Link>
          <span>/</span>
          <span className="text-muted-foreground truncate max-w-[200px]">{tool.name}</span>
        </div>

        {tool.country && (
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full">
            <span className="text-muted-foreground">Origin:</span>
            <CountryFlag
              code={tool.country.code}
              name={tool.country.name}
              linkable={true}
              className="text-foreground font-semibold"
            />
            {tool.country.region && (
              <span className="text-[10px] text-muted-foreground">({tool.country.region})</span>
            )}
          </div>
        )}
      </div>

      {/* Main Hero Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {tool.name}
          </h1>

          {tool.hiddenGem && (
            <HiddenGemBadge reason={tool.hiddenGemReason} size="md" />
          )}

          <Link href={`/categories/${tool.category.slug}`}>
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 hover:bg-secondary/80">
              {tool.category.name}
            </Badge>
          </Link>
        </div>

        <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
          {tool.tagline}
        </p>
      </div>

      {/* PRIMARY CTA BAR - "Launchpad Principle" */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-card via-card to-primary/5 border-2 border-primary/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Official Resource
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Direct link to the verified official project website and documentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            asChild
            size="lg"
            className="h-12 px-6 text-sm sm:text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md group"
          >
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit official ${tool.name} website`}
            >
              <span>Visit official website</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>

          {tool.docsUrl && (
            <Button asChild variant="outline" size="lg" className="h-12 px-4 gap-2">
              <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Docs</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
          )}

          {tool.githubUrl && (
            <Button asChild variant="outline" size="lg" className="h-12 px-4 gap-2">
              <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-4 w-4 text-muted-foreground" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
          )}

          <BookmarkButton
            tool={{
              id: tool.id,
              name: tool.name,
              slug: tool.slug,
              tagline: tool.tagline,
              categoryName: tool.category?.name,
              countryCode: tool.country?.code,
            }}
            variant="button"
            size="lg"
            className="h-12"
          />

          <CompareButton
            tool={{
              id: tool.id,
              name: tool.name,
              slug: tool.slug,
              tagline: tool.tagline,
              categoryName: tool.category?.name,
              countryCode: tool.country?.code,
            }}
            variant="button"
            size="lg"
            className="h-12"
          />
        </div>
      </div>

      {tool.githubUrl && (
        <GitHubStatsBadge githubUrl={tool.githubUrl} showExtended={true} />
      )}

      {/* Hidden Gem Callout Banner */}
      {tool.hiddenGem && tool.hiddenGemReason && (
        <div className="p-4 sm:p-5 rounded-xl border border-violet-500/30 bg-violet-500/10 text-foreground space-y-2">
          <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Editorial Note: Why this tool is a Hidden Gem</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tool.hiddenGemReason}
          </p>
        </div>
      )}

      {/* Detailed Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">About {tool.name}</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base">
          <p>{tool.description}</p>
        </div>
      </div>

      {/* Hierarchical relations (Parent & Child frameworks) */}
      {(tool.parentTool || (tool.children && tool.children.length > 0)) && (
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <GitFork className="h-4 w-4 text-primary" />
            <span>Ecosystem & Lineage</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {tool.parentTool && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Built on / Extends:</span>
                <Link
                  href={`/tools/${tool.parentTool.slug}`}
                  className="font-medium px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tool.parentTool.name}
                </Link>
              </div>
            )}

            {tool.children && tool.children.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Frameworks / Ecosystem:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tool.children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/tools/${child.slug}`}
                      className="font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags section */}
      {tool.tags && tool.tags.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Related Tags & Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
