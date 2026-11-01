import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  FileCode2,
  Globe,
  Server,
  Workflow,
  Boxes,
  Database,
  Activity,
  Cloud,
  Wrench,
  TerminalSquare,
  Folder,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, React.ElementType> = {
  FileCode2,
  Globe,
  Server,
  Workflow,
  Boxes,
  Database,
  Activity,
  Cloud,
  Wrench,
  TerminalSquare,
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) return { title: "Category Not Found — DevAtlas" };

  return {
    title: `${category.name} Tools — Global Directory | DevAtlas`,
    description: category.description || `Browse curated ${category.name} tools, libraries, and frameworks from around the globe.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
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

  if (!category) {
    notFound();
  }

  const allCategories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const hiddenGemsCount = category.tools.filter((t) => t.hiddenGem).length;
  const IconComponent = (category.icon && ICON_MAP[category.icon]) || Folder;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-10">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs">
          <Link href="/tools">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Tools</span>
          </Link>
        </Button>
        <span>/</span>
        <span className="text-foreground font-semibold">Categories</span>
        <span>/</span>
        <span className="truncate">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {category.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {category.tools.length} total tools
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

          {category.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Quick filter link */}
        <div className="shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/tools?category=${category.slug}&hiddenGem=true`}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
              <span>Filter hidden gems only</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground font-medium mr-1">Other Categories:</span>
        {allCategories.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              c.slug === category.slug
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Tool Grid */}
      {category.tools.length === 0 ? (
        <EmptyState
          title={`No tools found in ${category.name}`}
          description="Check back soon as we continuously index new software from global developers."
          resetHref="/tools"
          resetLabel="Explore all tools"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
