import React from "react";
import prisma from "@/lib/prisma";
import { StackBuilderView } from "@/components/stacks/stack-builder-view";
import { Layers, Bookmark, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tech Stack Builder & Saved Tools — DevAtlas",
  description: "Curate personal developer tech stacks, save favorite tools, and export configuration architecture for GitHub READMEs.",
};

export default async function StacksPage() {
  const [tools, communityStacks] = await Promise.all([
    prisma.tool.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        websiteUrl: true,
        hiddenGem: true,
        category: { select: { name: true } },
        country: { select: { code: true, name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.techStack.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true, email: true } },
        tools: {
          include: {
            tool: {
              include: {
                category: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const serializedTools = tools.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    tagline: t.tagline,
    websiteUrl: t.websiteUrl,
    hiddenGem: t.hiddenGem,
    categoryName: t.category?.name,
    countryCode: t.country?.code,
    countryName: t.country?.name,
  }));

  const serializedStacks = communityStacks.map((st) => ({
    id: st.id,
    name: st.name,
    description: st.description,
    slug: st.slug,
    user: st.user,
    createdAt: st.createdAt.toISOString(),
    tools: st.tools.map((t) => ({
      role: t.role,
      tool: {
        id: t.tool.id,
        name: t.tool.name,
        slug: t.tool.slug,
        tagline: t.tool.tagline,
        websiteUrl: t.tool.websiteUrl,
        category: t.tool.category,
        country: t.tool.country,
      },
    })),
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <Layers className="h-3.5 w-3.5 text-violet-500" />
          <span>Curate, Bookmark & Export</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Tech Stack Builder & Saved Tools
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Assemble production-ready stacks using global tools and hidden gems. Export architecture specs directly to Markdown for your team or GitHub READMEs.
        </p>
      </div>

      <StackBuilderView
        availableTools={serializedTools}
        initialCommunityStacks={serializedStacks}
      />
    </div>
  );
}
