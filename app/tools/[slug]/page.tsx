import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  ExternalLink,
  Shield,
  Calendar,
  Layers,
  ArrowRight,
  Gauge,
  Globe,
} from "lucide-react";
import { ToolHero } from "@/components/tool-hero";
import { ToolCard } from "@/components/tool-card";
import { CountryFlag } from "@/components/country-flag";
import { ToolAlternatives } from "@/components/tool-alternatives";

export const dynamic = "force-dynamic";

interface ToolDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    select: { name: true, tagline: true, hiddenGem: true },
  });

  if (!tool) {
    return { title: "Tool Not Found — DevAtlas" };
  }

  return {
    title: `${tool.name} — ${tool.tagline} | DevAtlas`,
    description: `${tool.name}: ${tool.tagline}. Discover documentation, official website, ecosystem, and editorial review on DevAtlas.`,
  };
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;

  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      country: true,
      tags: true,
      parentTool: {
        select: { id: true, name: true, slug: true, tagline: true },
      },
      children: {
        select: { id: true, name: true, slug: true, tagline: true },
      },
    },
  });

  if (!tool) {
    notFound();
  }

  // Related Discovery 1: Up to 4 similar tools in the same category (prioritizing hidden gems)
  const similarTools = await prisma.tool.findMany({
    where: {
      categoryId: tool.categoryId,
      id: { not: tool.id },
    },
    take: 4,
    orderBy: [{ hiddenGem: "desc" }, { popularity: "desc" }],
    include: {
      category: true,
      country: true,
      tags: true,
    },
  });

  // Related Discovery 2: Up to 4 other tools from the same country
  const sameCountryTools = tool.countryId
    ? await prisma.tool.findMany({
        where: {
          countryId: tool.countryId,
          id: { not: tool.id },
        },
        take: 4,
        orderBy: [{ hiddenGem: "desc" }, { popularity: "desc" }],
        include: {
          category: true,
          country: true,
          tags: true,
        },
      })
    : [];

  const underTheRadarScore = 100 - tool.popularity;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-16">
      {/* 2-Column Main Section: Hero Content + Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Hero, CTA, Editorial, Lineage (2 cols) */}
        <div className="lg:col-span-2">
          <ToolHero tool={tool} />
        </div>

        {/* Right Column: Metadata Sidebar (1 col) */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground pb-2 border-b border-border/60">
              Tool Specifications
            </h3>

            {/* Category */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>Category</span>
              </span>
              <Link
                href={`/categories/${tool.category.slug}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {tool.category.name}
              </Link>
            </div>

            {/* Country of Origin */}
            {tool.country && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Origin</span>
                </span>
                <CountryFlag
                  code={tool.country.code}
                  name={tool.country.name}
                  linkable={true}
                  className="font-semibold"
                />
              </div>
            )}

            {/* Region */}
            {tool.country?.region && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Region</span>
                <Link
                  href={`/tools?region=${encodeURIComponent(tool.country.region)}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {tool.country.region}
                </Link>
              </div>
            )}

            {/* License */}
            {tool.license && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  <span>License</span>
                </span>
                <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
                  {tool.license}
                </span>
              </div>
            )}

            {/* Pricing Model */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pricing</span>
              <span className="font-semibold capitalize text-foreground">
                {tool.pricing}
              </span>
            </div>

            {/* Created Year */}
            {tool.createdYear && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Initial Release</span>
                </span>
                <span className="font-semibold text-foreground">{tool.createdYear}</span>
              </div>
            )}

            {/* Under-the-Radar Score Bar */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Gauge className="h-3.5 w-3.5 text-violet-500" />
                  <span>Under-the-Radar Score</span>
                </span>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {underTheRadarScore} / 100
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${underTheRadarScore}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {tool.hiddenGem
                  ? "High discovery potential: Exceptional utility with low mainstream exposure."
                  : "Recognized industry standard with widespread global adoption."}
              </p>
            </div>
          </div>

          {/* Quick Outbound Link Card */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-3">
            <h4 className="font-semibold text-foreground">Official Link Check</h4>
            <p className="text-muted-foreground leading-relaxed">
              DevAtlas verifies direct homepage destinations. Click below to explore the official {tool.name} website.
            </p>
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
            >
              <span>{tool.websiteUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </aside>
      </div>

      {/* ALTERNATIVES & SWAPS SECTION */}
      <ToolAlternatives
        currentTool={{
          id: tool.id,
          name: tool.name,
          slug: tool.slug,
          hiddenGem: tool.hiddenGem,
          category: { name: tool.category.name, slug: tool.category.slug },
        }}
        alternatives={similarTools}
      />

      {/* DISCOVERY SECTION 1: Similar Tools in this Category */}
      {similarTools.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Similar tools in {tool.category.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Compare {tool.name} against other alternatives and companions in the same category.
              </p>
            </div>

            <Link
              href={`/categories/${tool.category.slug}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all in category</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* DISCOVERY SECTION 2: Also from this Country */}
      {sameCountryTools.length > 0 && tool.country && (
        <section className="space-y-6 pt-6 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Also from</span>
                <CountryFlag
                  code={tool.country.code}
                  name={tool.country.name}
                  linkable={false}
                  flagSize="lg"
                  className="text-foreground"
                />
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Other notable software tools engineered by teams in {tool.country.name}.
              </p>
            </div>

            <Link
              href={`/countries/${tool.country.code.toLowerCase()}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore all from {tool.country.name}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sameCountryTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
