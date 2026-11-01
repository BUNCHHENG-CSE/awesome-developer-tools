import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getFlagEmoji } from "@/lib/countries";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface CountryPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: CountryPageProps) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const country = await prisma.country.findUnique({
    where: { code: upperCode },
  });

  if (!country) return { title: "Country Not Found — DevAtlas" };

  return {
    title: `IT Tools from ${country.name} (${country.code}) | DevAtlas`,
    description: `Discover open-source projects, developer tools, and hidden gems created in ${country.name} (${country.region}).`,
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  const country = await prisma.country.findUnique({
    where: { code: upperCode },
    include: {
      tools: {
        orderBy: [{ hiddenGem: "desc" }, { popularity: "desc" }],
        include: {
          category: true,
          country: true,
          tags: true,
        },
      },
    },
  });

  if (!country) {
    notFound();
  }

  const allCountries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { code: true, name: true },
  });

  const hiddenGemsCount = country.tools.filter((t) => t.hiddenGem).length;
  const flagEmoji = getFlagEmoji(country.code);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs">
          <Link href="/tools">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Tools</span>
          </Link>
        </Button>
        <span>/</span>
        <span className="text-foreground font-semibold">Countries</span>
        <span>/</span>
        <span className="truncate">{country.name}</span>
      </div>

      {/* Country Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="text-5xl sm:text-6xl select-none leading-none" role="img" aria-label={country.name}>
            {flagEmoji}
          </span>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {country.name}
              </h1>
              <Badge variant="outline" className="text-xs">
                {country.code}
              </Badge>
              {country.region && (
                <Badge variant="secondary" className="text-xs">
                  {country.region}
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Cataloguing {country.tools.length} software projects, runtimes, and developer utilities engineered in {country.name}.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-xs">
                {country.tools.length} total tools
              </Badge>
              {hiddenGemsCount > 0 && (
                <Badge variant="outline" className="border-violet-500/30 text-violet-600 dark:text-violet-400 text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{hiddenGemsCount} hidden gems</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick filter link */}
        <div className="shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/tools?country=${country.code.toLowerCase()}&hiddenGem=true`}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
              <span>Gems from {country.name}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Country Switcher Bar */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Explore Other Country Hubs
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {allCountries.map((c) => (
            <Link
              key={c.code}
              href={`/countries/${c.code.toLowerCase()}`}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                c.code === country.code
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
            >
              <span>{getFlagEmoji(c.code)}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Country Tools Grid */}
      {country.tools.length === 0 ? (
        <EmptyState
          title={`No tools catalogued from ${country.name} yet`}
          description="Suggest your favorite project from this country using our submission dialog."
          resetHref="/tools"
          resetLabel="Explore directory"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {country.tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
