import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Scale,
  ExternalLink,
  Sparkles,
  Shield,
  Calendar,
  Layers,
  Globe,
  Share2,
  CheckCircle2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";
import { HiddenGemBadge } from "@/components/hidden-gem-badge";
import { GitHubStatsBadge } from "@/components/github-stats-badge";
import { CompareToolSelector } from "@/components/compare/compare-tool-selector";

export const dynamic = "force-dynamic";

interface ComparePageProps {
  searchParams: Promise<{ tools?: string }>;
}

export async function generateMetadata({ searchParams }: ComparePageProps) {
  const { tools } = await searchParams;
  const slugs = tools ? tools.split(",").map((s) => s.trim()).filter(Boolean) : [];

  if (slugs.length > 0) {
    return {
      title: `Comparing ${slugs.join(" vs ")} | DevAtlas`,
      description: `In-depth side-by-side comparison of ${slugs.join(", ")} specifications, licenses, countries of origin, and engineering health.`,
    };
  }

  return {
    title: "Side-by-Side Tool Comparison Engine — DevAtlas",
    description: "Compare open source developer tools, hidden gems, and engineering frameworks side-by-side.",
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { tools: toolsParam } = await searchParams;
  const slugs = toolsParam ? toolsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const comparedTools = slugs.length > 0
    ? await prisma.tool.findMany({
        where: { slug: { in: slugs } },
        include: {
          category: true,
          country: true,
          tags: true,
        },
      })
    : [];

  // Sort them in the exact order requested in the URL
  const orderedTools = slugs
    .map((s) => comparedTools.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Fetch all tools for the quick add/search dropdown
  const allTools = await prisma.tool.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const popularComparisons = [
    { label: "Hono vs Express", slugs: "hono,express" },
    { label: "DuckDB vs VictoriaMetrics", slugs: "duckdb,victoriametrics" },
    { label: "Coolify vs Dokku", slugs: "coolify,dokku" },
    { label: "Dragonfly vs Redis", slugs: "dragonfly,redis" },
    { label: "Hoppscotch vs Postman", slugs: "hoppscotch,postman" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
            <Scale className="h-3.5 w-3.5 text-violet-500" />
            <span>Versus Mode — Side-by-Side Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Tool Comparison Matrix
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Evaluate architecture, licensing, geographical origin, pricing, and under-the-radar scores across up to 4 developer tools simultaneously.
          </p>
        </div>

        {/* Action / Add Selector */}
        <div className="flex items-center gap-3">
          <CompareToolSelector
            allTools={allTools.map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              tagline: t.tagline,
              categoryName: t.category?.name,
            }))}
            currentSlugs={orderedTools.map((t) => t.slug)}
          />
        </div>
      </div>

      {/* Preset Comparisons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-medium">Quick comparisons:</span>
        {popularComparisons.map((item) => (
          <Link
            key={item.slugs}
            href={`/compare?tools=${item.slugs}`}
            className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {orderedTools.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border/80 bg-card/40 space-y-5">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Scale className="h-7 w-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">No tools selected yet</h3>
            <p className="text-sm text-muted-foreground">
              Select tools using the dropdown above or click the &quot;+ Compare&quot; button while exploring the directory.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/tools">
              <Button size="sm" className="gap-2">
                <span>Browse Directory</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* The Comparison Matrix Table */
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="p-4 w-48 min-w-[180px] font-bold text-muted-foreground uppercase text-xs tracking-wider">
                    Specification
                  </th>
                  {orderedTools.map((t) => (
                    <th key={t.id} className="p-4 min-w-[240px] align-top">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/tools/${t.slug}`}
                              className="font-extrabold text-lg text-foreground hover:text-primary transition-colors block"
                            >
                              {t.name}
                            </Link>
                            {t.country && (
                              <div className="mt-0.5">
                                <CountryFlag
                                  code={t.country.code}
                                  name={t.country.name}
                                  linkable={true}
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                          {t.hiddenGem && (
                            <HiddenGemBadge reason={t.hiddenGemReason} size="sm" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground font-normal line-clamp-2">
                          {t.tagline}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={t.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <span>Visit Official Site</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {/* Category */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Category</span>
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4 text-foreground font-medium">
                      <Link
                        href={`/categories/${t.category.slug}`}
                        className="hover:underline text-primary"
                      >
                        {t.category.name}
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Country / Region */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Geographic Origin</span>
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4 text-foreground">
                      {t.country ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold">{t.country.name}</span>
                          {t.country.region && (
                            <span className="text-xs text-muted-foreground block">
                              Region: {t.country.region}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Pricing */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs">
                    Pricing Model
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4 capitalize font-semibold text-foreground">
                      <Badge variant="secondary" className="font-medium">
                        {t.pricing}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* License */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span>License</span>
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4 text-foreground">
                      {t.license ? (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                          {t.license}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Proprietary / Unknown</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Release Year */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Initial Release</span>
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4 text-foreground font-medium">
                      {t.createdYear || "—"}
                    </td>
                  ))}
                </tr>

                {/* Under-the-radar Score */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    <span>Hidden Gem Score</span>
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4">
                      <div className="space-y-1">
                        <span className="font-bold text-violet-600 dark:text-violet-400">
                          {100 - t.popularity} / 100
                        </span>
                        {t.hiddenGem && t.hiddenGemReason && (
                          <p className="text-xs text-muted-foreground italic line-clamp-3">
                            &ldquo;{t.hiddenGemReason}&rdquo;
                          </p>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* GitHub Repository Health */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs">
                    GitHub Health
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4">
                      {t.githubUrl ? (
                        <div className="space-y-2">
                          <GitHubStatsBadge githubUrl={t.githubUrl} showExtended={true} />
                          <a
                            href={t.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>Open Repository</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No public GitHub URL</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs">
                    Overview
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4 text-xs text-muted-foreground leading-relaxed">
                      {t.description}
                    </td>
                  ))}
                </tr>

                {/* Tags */}
                <tr>
                  <td className="p-4 font-semibold text-muted-foreground text-xs">
                    Ecosystem Tags
                  </td>
                  {orderedTools.map((t) => (
                    <td key={t.id} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <Link
                            key={tag.slug}
                            href={`/tags/${tag.slug}`}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
