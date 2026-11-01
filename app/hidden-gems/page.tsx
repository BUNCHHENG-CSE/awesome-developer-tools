import Link from "next/link";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  Sparkles,
  ExternalLink,
  ArrowRight,
  Layers,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";
import { TagBadge } from "@/components/tag-badge";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hidden Gems Leaderboard — Under-the-Radar IT Tools | DevAtlas",
  description:
    "The software tools 99% of developers have never tried — ranked from most under-the-radar to rising global stars.",
};

interface HiddenGemsPageProps {
  searchParams: Promise<{
    category?: string;
    region?: string;
    country?: string;
  }>;
}

export default async function HiddenGemsPage({
  searchParams,
}: HiddenGemsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const region = params.region;
  const countryCode = params.country;

  const where: Prisma.ToolWhereInput = {
    hiddenGem: true,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (countryCode || region) {
    where.country = {
      is: {
        ...(countryCode ? { code: countryCode.toUpperCase() } : {}),
        ...(region ? { region } : {}),
      },
    };
  }

  const [gems, categories, countries] = await Promise.all([
    prisma.tool.findMany({
      where,
      orderBy: { popularity: "asc" }, // Most under-the-radar first
      include: {
        category: true,
        country: true,
        tags: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { code: true, name: true, region: true },
    }),
  ]);

  const regions = Array.from(
    new Set(countries.map((c) => c.region).filter(Boolean) as string[])
  ).sort();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-card to-background shadow-md space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-500/30">
          <Sparkles className="h-4 w-4" />
          <span>Curated Global Discovery</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            The Hidden Gems Leaderboard
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            The tools 99% of developers have never tried — sorted from most under-the-radar to rising stars.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="pt-4 border-t border-violet-500/20 space-y-3">
          {/* Categories Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-foreground mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-violet-500" />
              <span>Category:</span>
            </span>
            <Link
              href="/hidden-gems"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !categorySlug
                  ? "bg-violet-600 text-white font-bold"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All Categories
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/hidden-gems?category=${c.slug}${region ? `&region=${encodeURIComponent(region)}` : ""}`}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  categorySlug === c.slug
                    ? "bg-violet-600 text-white font-bold"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Regions Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-foreground mr-1 flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5 text-violet-500" />
              <span>Region:</span>
            </span>
            <Link
              href={`/hidden-gems${categorySlug ? `?category=${categorySlug}` : ""}`}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !region
                  ? "bg-violet-600 text-white font-bold"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All Regions
            </Link>
            {regions.map((r) => (
              <Link
                key={r}
                href={`/hidden-gems?region=${encodeURIComponent(r)}${categorySlug ? `&category=${categorySlug}` : ""}`}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  region === r
                    ? "bg-violet-600 text-white font-bold"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {r}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">
          Showing {gems.length} verified hidden gems
        </span>
        <span className="text-[11px]">Ranked by Under-the-Radar Index (Popularity: lowest to highest)</span>
      </div>

      {/* Leaderboard List Cards */}
      {gems.length === 0 ? (
        <EmptyState
          title="No hidden gems match the selected filters"
          description="Try resetting category and regional filters to see the full global ranking."
          resetHref="/hidden-gems"
          resetLabel="View all hidden gems"
        />
      ) : (
        <div className="space-y-4">
          {gems.map((gem, index) => {
            const rank = index + 1;
            const underTheRadarScore = 100 - gem.popularity;

            return (
              <div
                key={gem.id}
                className="p-5 sm:p-6 rounded-2xl border border-violet-500/25 bg-card hover:bg-card/90 transition-all hover:border-violet-500/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-300 font-extrabold text-base sm:text-lg border border-violet-500/30">
                    #{rank}
                  </div>

                  {/* Main Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/tools/${gem.slug}`}
                        className="text-xl font-extrabold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                      >
                        {gem.name}
                      </Link>

                      {gem.country && (
                        <CountryFlag
                          code={gem.country.code}
                          name={gem.country.name}
                          linkable={true}
                          className="text-xs font-semibold"
                        />
                      )}

                      <Link href={`/categories/${gem.category.slug}`}>
                        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600 dark:text-violet-400">
                          {gem.category.name}
                        </Badge>
                      </Link>
                    </div>

                    <p className="text-sm text-foreground/90 font-medium">
                      {gem.tagline}
                    </p>

                    {gem.hiddenGemReason && (
                      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-violet-700 dark:text-violet-300">Origin & Superpower: </span>
                        {gem.hiddenGemReason}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {gem.tags.slice(0, 4).map((tag) => (
                        <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
                      ))}

                      <span className="text-[11px] text-muted-foreground ml-auto">
                        Radar Score: <strong className="text-violet-600 dark:text-violet-400">{underTheRadarScore}/100</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0 self-end md:self-center">
                  <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold shadow-xs">
                    <a
                      href={gem.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1.5"
                      title={`Visit official ${gem.name} website`}
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>

                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link href={`/tools/${gem.slug}`} className="gap-1">
                      <span>Full Profile</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
