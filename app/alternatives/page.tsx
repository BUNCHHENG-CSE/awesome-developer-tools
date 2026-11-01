import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  RefreshCw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Software Swaps & Alternatives — DevAtlas",
  description: "Find lightweight, open source, and regional hidden gem alternatives to mainstream developer tools and cloud services.",
};

export default async function AlternativesPage() {
  // Fetch popular pairs and categories
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      tools: {
        where: { hiddenGem: true },
        take: 3,
        include: { country: true },
      },
    },
  });

  const featuredSwaps = [
    {
      mainstream: "Postman",
      mainstreamTagline: "Heavyweight enterprise API development suite",
      alternativeSlug: "hoppscotch",
      whySwap: "Lightweight, browser-based, ultrafast open source API ecosystem created in India.",
    },
    {
      mainstream: "Redis",
      mainstreamTagline: "In-memory key-value data structure store",
      alternativeSlug: "dragonfly",
      whySwap: "Modern multi-threaded Redis drop-in engine with 25x throughput and 30% memory savings.",
    },
    {
      mainstream: "Vercel / Heroku",
      mainstreamTagline: "Proprietary cloud application platforms",
      alternativeSlug: "coolify",
      whySwap: "Self-hostable, all-in-one PaaS alternative to Heroku & Vercel for any Linux server, built in Germany.",
    },
    {
      mainstream: "Prometheus",
      mainstreamTagline: "Standard cloud-native metrics monitoring system",
      alternativeSlug: "victoriametrics",
      whySwap: "Ultra-fast, cost-effective time-series database and drop-in replacement built in Kyiv, Ukraine.",
    },
    {
      mainstream: "Elasticsearch",
      mainstreamTagline: "Resource-intensive Java search cluster",
      alternativeSlug: "meilisearch",
      whySwap: "Lightning-fast, typo-tolerant search engine built in Rust in Paris with instant setup.",
    },
    {
      mainstream: "Airtable",
      mainstreamTagline: "Proprietary low-code database spreadsheet",
      alternativeSlug: "nocodb",
      whySwap: "Open-source Airtable alternative turning any relational DB into a collaborative spreadsheet.",
    },
    {
      mainstream: "LaunchDarkly",
      mainstreamTagline: "Enterprise feature flagging SaaS",
      alternativeSlug: "unleash",
      whySwap: "Open-source, self-hostable feature management system built in Oslo, Norway.",
    },
    {
      mainstream: "Express.js",
      mainstreamTagline: "Classic legacy Node.js web framework",
      alternativeSlug: "hono",
      whySwap: "Ultrafast Web Standards framework designed for Cloudflare Workers, Bun, Deno, and Node.",
    },
  ];

  // Fetch the alternative tools from DB
  const alternativeTools = await prisma.tool.findMany({
    where: {
      slug: { in: featuredSwaps.map((s) => s.alternativeSlug) },
    },
    include: {
      country: true,
      category: true,
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <RefreshCw className="h-3.5 w-3.5 text-violet-500" />
          <span>Software Swaps & Alternatives</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Hidden Gem Swaps for Everyday Tools
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Escape vendor lock-in, resource bloat, and costly cloud bills. Discover fast, privacy-focused, and open-source alternatives created by engineers worldwide.
        </p>
      </div>

      {/* Curated Swaps Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <span>Curated Developer Swaps</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredSwaps.map((swap) => {
            const tool = alternativeTools.find((t) => t.slug === swap.alternativeSlug);
            if (!tool) return null;

            return (
              <div
                key={swap.mainstream}
                className="p-6 rounded-2xl border border-violet-500/25 bg-card/80 shadow-xs hover:border-violet-500/50 transition-all flex flex-col justify-between space-y-5"
              >
                {/* Comparison Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Mainstream Giant
                      </span>
                      <h3 className="font-extrabold text-base text-muted-foreground line-through decoration-muted-foreground/50">
                        {swap.mainstream}
                      </h3>
                    </div>

                    <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                      <ArrowRight className="h-4 w-4" />
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">
                        Hidden Gem Alternative
                      </span>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="font-extrabold text-base text-foreground hover:text-primary transition-colors"
                        >
                          {tool.name}
                        </Link>
                        {tool.country && (
                          <CountryFlag
                            code={tool.country.code}
                            name={tool.country.name}
                            linkable={true}
                            className="text-xs"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Why Swap Callout */}
                  <div className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-muted-foreground leading-relaxed">
                    <span className="font-bold text-violet-600 dark:text-violet-400 block pb-1">
                      💡 Why Engineers Swap:
                    </span>
                    {swap.whySwap}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                  <Link
                    href={`/compare?tools=${tool.slug}`}
                    className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>Side-by-Side Analysis</span>
                  </Link>

                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <span>Visit Official Site</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category-by-Category Gems */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <span>Browse Gems by Category</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="font-bold text-base text-foreground hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-xs text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="space-y-2 pt-1">
                {cat.tools.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-1.5">
                      {t.country && (
                        <CountryFlag code={t.country.code} name={t.country.name} linkable={false} />
                      )}
                      <Link href={`/tools/${t.slug}`} className="font-semibold text-foreground truncate">
                        {t.name}
                      </Link>
                    </div>

                    <a
                      href={t.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground p-1"
                      title="Visit website"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
