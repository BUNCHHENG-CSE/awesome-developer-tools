import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  Globe2,
  Layers,
  Flame,
  Clock,
  Scale,
  RefreshCw,
  Bookmark,
  Dices,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tool-card";
import { CategoryCard } from "@/components/category-card";
import { CountryFlag } from "@/components/country-flag";
import { TagBadge } from "@/components/tag-badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Live Database Counts
  const [
    toolCount,
    countryCount,
    categoryCount,
    hiddenGemCount,
    categories,
    hiddenGems,
    featuredTools,
    recentTools,
    topCountries,
  ] = await Promise.all([
    prisma.tool.count(),
    prisma.country.count(),
    prisma.category.count(),
    prisma.tool.count({ where: { hiddenGem: true } }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { tools: true },
        },
      },
    }),
    prisma.tool.findMany({
      where: { hiddenGem: true },
      include: {
        category: true,
        country: true,
        tags: true,
      },
      orderBy: { popularity: "asc" },
    }),
    prisma.tool.findMany({
      where: { isFeatured: true, hiddenGem: true },
      take: 6,
      include: {
        category: true,
        country: true,
        tags: true,
      },
    }),
    prisma.tool.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        country: true,
        tags: true,
      },
    }),
    prisma.country.findMany({
      take: 12,
      include: {
        _count: {
          select: { tools: true },
        },
      },
      orderBy: {
        tools: {
          _count: "desc",
        },
      },
    }),
  ]);

  // Deterministic "Hidden Gem of the Day"
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const gemOfTheDay = hiddenGems.length > 0 ? hiddenGems[dayOfYear % hiddenGems.length] : null;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-violet-500 animate-pulse" />
            <span>Discovering global software gems across {countryCount} countries</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
            Discover IT tools from around the world —{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-primary bg-clip-text text-transparent">
              especially the ones 99% of devs haven&apos;t heard of
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The global discovery directory indexing {toolCount}+ IT tools across {countryCount} countries and {categoryCount} categories. Read editorial reviews and jump straight to the source.
          </p>

          {/* Search Bar on Hero */}
          <form
            action="/search"
            method="GET"
            className="max-w-2xl mx-auto relative flex items-center shadow-lg rounded-2xl border border-border/80 bg-card p-1.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all"
          >
            <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
            <input
              type="text"
              name="q"
              placeholder="Search tools by name, tag, country (e.g. Hono, DuckDB, Japan, backup)..."
              className="w-full px-3 py-3 text-sm bg-transparent border-none text-foreground focus:outline-none"
            />
            <Button type="submit" size="sm" className="h-10 px-5 shrink-0 rounded-xl font-semibold">
              Explore
            </Button>
          </form>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <span className="font-medium">Explore:</span>
            <Link
              href="/atlas"
              className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              <Globe2 className="h-3 w-3" />
              <span>World Atlas</span>
            </Link>
            <Link
              href="/compare"
              className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors flex items-center gap-1"
            >
              <Scale className="h-3 w-3" />
              <span>Versus Mode</span>
            </Link>
            <Link
              href="/alternatives"
              className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Swaps</span>
            </Link>
            <Link
              href="/stacks"
              className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors flex items-center gap-1"
            >
              <Bookmark className="h-3 w-3" />
              <span>Stacks & Saved</span>
            </Link>
            <Link
              href="/hidden-gems"
              className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 font-semibold hover:bg-violet-500/25 transition-colors"
            >
              💎 {hiddenGemCount} Hidden Gems
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24 max-w-7xl">
        {/* HIDDEN GEM OF THE DAY SPOTLIGHT */}
        {gemOfTheDay && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Hidden Gem of the Day
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    A curated under-the-radar tool handpicked daily from around the globe.
                  </p>
                </div>
              </div>

              <Link
                href="/hidden-gems"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <span>View all {hiddenGemCount} gems</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-card via-card to-violet-500/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/tools/${gemOfTheDay.slug}`}
                      className="text-2xl sm:text-3xl font-extrabold text-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      {gemOfTheDay.name}
                    </Link>

                    {gemOfTheDay.country && (
                      <CountryFlag
                        code={gemOfTheDay.country.code}
                        name={gemOfTheDay.country.name}
                        linkable={true}
                        className="text-sm font-semibold"
                      />
                    )}

                    <Badge variant="outline" className="text-xs border-violet-500/40 text-violet-600 dark:text-violet-400">
                      {gemOfTheDay.category.name}
                    </Badge>
                  </div>

                  <p className="text-base text-foreground font-medium">
                    {gemOfTheDay.tagline}
                  </p>

                  {gemOfTheDay.hiddenGemReason && (
                    <div className="p-3.5 rounded-xl bg-violet-500/15 border border-violet-500/25 text-xs text-foreground leading-relaxed">
                      <span className="font-bold text-violet-700 dark:text-violet-300">Why it&apos;s a gem: </span>
                      {gemOfTheDay.hiddenGemReason}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gemOfTheDay.tags.slice(0, 4).map((tag) => (
                      <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground font-bold shadow-md">
                    <a
                      href={gemOfTheDay.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <span>Visit Official Website</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>

                  <Button asChild variant="outline" size="lg">
                    <Link href={`/tools/${gemOfTheDay.slug}`}>
                      <span>Read Full Profile</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INTERACTIVE DISCOVERY SUITE SHOWCASE */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Discovery Engine & Tools
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Powerful ways to unearth, evaluate, compare, and bookmark global software.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/atlas"
              className="p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:bg-card/90 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  World Tech Atlas
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive geographic map indexing developer tools born in 28+ nations.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 pt-2">
                <span>Explore Atlas</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/compare"
              className="p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:bg-card/90 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Scale className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  Side-by-Side Compare
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Versus mode comparing specs, licensing, pricing, and live GitHub health.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 pt-2">
                <span>Launch Versus</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/alternatives"
              className="p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:bg-card/90 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  Software Swaps
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Escape vendor bloat with lightweight, open source hidden gem alternatives.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 pt-2">
                <span>Browse Swaps</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/stacks"
              className="p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:bg-card/90 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bookmark className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  Stack Builder & Saved
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assemble custom tech stacks and export Markdown specs for your team README.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 pt-2">
                <span>Build a Stack</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </section>

        {/* BROWSE BY CATEGORY GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Browse by Category
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Explore 10 curated domains of developer tooling and infrastructure.
                </p>
              </div>
            </div>

            <Link
              href="/tools"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* FEATURED HIDDEN GEMS STRIP */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Curated Hidden Gems
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  High-leverage engineering tools from innovators around the globe.
                </p>
              </div>
            </div>

            <Link
              href="/hidden-gems"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              <span>View leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* GLOBAL COUNTRY EXPLORER BAR */}
        <section className="p-6 sm:p-8 rounded-2xl border border-border/70 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Globe2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">Global Tool Hubs</h3>
                <p className="text-xs text-muted-foreground">
                  Explore software tools born in specific developer communities and ecosystems.
                </p>
              </div>
            </div>

            <Link
              href="/tools"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Filter by country →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
            {topCountries.map((c) => (
              <Link
                key={c.code}
                href={`/countries/${c.code.toLowerCase()}`}
                className="p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/50 hover:border-border transition-all flex items-center justify-between text-xs group"
              >
                <CountryFlag code={c.code} name={c.name} linkable={false} className="font-semibold text-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                  {c._count.tools}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* RECENTLY ADDED TOOLS STRIP */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Recently Catalogued
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  The latest tools, frameworks, and engines added to the directory.
                </p>
              </div>
            </div>

            <Link
              href="/tools?sort=newest"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
