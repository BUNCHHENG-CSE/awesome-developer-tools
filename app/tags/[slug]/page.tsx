import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { TagBadge } from "@/components/tag-badge";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Hash, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) return { title: "Tag Not Found — DevAtlas" };

  return {
    title: `#${tag.name} Developer Tools | DevAtlas`,
    description: `Discover all software tools, libraries, and frameworks tagged with #${tag.name} in DevAtlas.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
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

  if (!tag) {
    notFound();
  }

  const popularTags = await prisma.tag.findMany({
    take: 20,
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
  });

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
        <span className="text-foreground font-semibold">Tags</span>
        <span>/</span>
        <span className="truncate">#{tag.name}</span>
      </div>

      {/* Tag Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Hash className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              #{tag.name}
            </h1>
            <Badge variant="secondary" className="text-xs">
              {tag.tools.length} {tag.tools.length === 1 ? "tool" : "tools"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All IT industry projects, libraries, and frameworks tagged with #{tag.name}.
          </p>
        </div>

        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/tools?tag=${tag.slug}`}>
              <span>Filter in Directory View</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Popular Tags Strip */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {popularTags.map((t) => (
            <TagBadge
              key={t.slug}
              name={t.name}
              slug={t.slug}
              count={t._count.tools}
              className={t.slug === tag.slug ? "bg-primary text-primary-foreground font-bold" : ""}
            />
          ))}
        </div>
      </div>

      {/* Tagged Tools Grid */}
      {tag.tools.length === 0 ? (
        <EmptyState
          title={`No tools tagged with #${tag.name}`}
          description="Explore other categories or search across the entire directory."
          resetHref="/tools"
          resetLabel="Explore directory"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tag.tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
