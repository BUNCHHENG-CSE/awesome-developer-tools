import Link from "next/link";
import prisma from "@/lib/prisma";
import { Search, Sparkles } from "lucide-react";
import { ToolCard, ToolCardData } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search Global IT Tools — DevAtlas",
  description:
    "Search across 140+ software tools, libraries, frameworks, and developer utilities from around the world.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  let tools: ToolCardData[] = [];

  if (q) {
    // Cross-platform search without mode: "insensitive"
    tools = await prisma.tool.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { tagline: { contains: q } },
          { description: { contains: q } },
          { category: { name: { contains: q } } },
          { country: { name: { contains: q } } },
          { tags: { some: { name: { contains: q } } } },
        ],
      },
      orderBy: [{ hiddenGem: "desc" }, { popularity: "desc" }],
      include: {
        category: true,
        country: true,
        tags: true,
      },
    });
  }

  const popularSearches = [
    "Hono",
    "DuckDB",
    "Docker",
    "Rust",
    "Japan",
    "Germany",
    "Monitoring",
    "Full-text search",
    "Self-hosted",
    "PostgreSQL",
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-8">
      {/* Header & Big Search Box */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Directory Search
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Search across tool titles, tags, descriptions, languages, frameworks, and country ecosystems.
        </p>

        <form action="/search" method="GET" className="relative pt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-0.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Type tool name, category, or country (e.g. VictoriaMetrics, Python, France)..."
            className="pl-10 pr-24 h-12 text-sm bg-card shadow-sm rounded-xl"
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-0.5 h-9 px-4 rounded-lg font-semibold"
          >
            Search
          </Button>
        </form>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1">
          <span className="font-medium mr-1">Popular:</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {q ? (
        <div className="space-y-6 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Found {tools.length} {tools.length === 1 ? "result" : "results"} for &quot;{q}&quot;
            </span>
            <Link href="/tools" className="hover:underline">
              Browse full directory →
            </Link>
          </div>

          {tools.length === 0 ? (
            <EmptyState
              title={`No tools found matching "${q}"`}
              description="Check your spelling, or try searching for a broader term like 'database', 'monitoring', or 'go'."
              resetHref="/search"
              resetLabel="Clear search"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-4 my-8">
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">
            Start typing above to search the Atlas
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Search our curated catalogue of 140+ tools across 28 countries, or jump to our Hidden Gems leaderboard.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/hidden-gems">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                <span>Explore Hidden Gems Leaderboard</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
