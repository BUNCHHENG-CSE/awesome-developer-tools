import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ToolsDirectoryView } from "@/components/tools-directory-view";

export const dynamic = "force-dynamic";

interface ToolsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    country?: string;
    region?: string;
    pricing?: string;
    tag?: string;
    hiddenGem?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category || "";
  const country = params.country || "";
  const region = params.region || "";
  const pricing = params.pricing || "";
  const tag = params.tag || "";
  const sort = params.sort || "popularity-desc";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 24;

  const where: Prisma.ToolWhereInput = {};

  if (category) {
    where.category = { slug: category };
  }

  if (country || region) {
    where.country = {
      is: {
        ...(country ? { code: country.toUpperCase() } : {}),
        ...(region ? { region } : {}),
      },
    };
  }

  if (pricing) {
    where.pricing = pricing;
  }

  if (tag) {
    where.tags = { some: { slug: tag } };
  }

  if (params.hiddenGem === "true") {
    where.hiddenGem = true;
  }

  // Do NOT use mode: "insensitive" for SQLite compatibility!
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { tagline: { contains: q } },
      { description: { contains: q } },
    ];
  }

  let orderBy: Prisma.ToolOrderByWithRelationInput = { popularity: "desc" };
  if (sort === "popularity-asc") {
    orderBy = { popularity: "asc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "name-asc") {
    orderBy = { name: "asc" };
  } else {
    orderBy = { popularity: "desc" };
  }

  const [total, tools, categories, countries] = await Promise.all([
    prisma.tool.count({ where }),
    prisma.tool.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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

  const totalPages = Math.ceil(total / limit);

  const regions = Array.from(
    new Set(countries.map((c) => c.region).filter(Boolean) as string[])
  ).sort();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Explore Global IT Tools
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Search and filter across {total} software projects, runtimes, frameworks, and utilities curated from software engineering ecosystems worldwide.
        </p>
      </div>

      <ToolsDirectoryView
        tools={tools}
        total={total}
        page={page}
        totalPages={totalPages}
        categories={categories}
        countries={countries}
        regions={regions}
      />
    </div>
  );
}
