import React from "react";
import prisma from "@/lib/prisma";
import { WorldAtlas, AtlasCountry } from "@/components/atlas/world-atlas";
import { Globe2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Interactive World Atlas — Global Software Discovery | DevAtlas",
  description: "Explore the global developer tools ecosystem by country of origin. Discover hidden gems and renowned engineering projects from 28+ countries.",
};

export default async function AtlasPage() {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    include: {
      tools: {
        orderBy: [{ hiddenGem: "desc" }, { popularity: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          websiteUrl: true,
          hiddenGem: true,
          hiddenGemReason: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      },
    },
  });

  // Filter out any country with 0 tools if any
  const populatedCountries: AtlasCountry[] = countries
    .filter((c) => c.tools.length > 0)
    .map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      region: c.region,
      tools: c.tools,
    }));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <Globe2 className="h-3.5 w-3.5 text-violet-500" />
          <span>Geographical Ecosystem Explorer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
          World Tech Atlas
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          While household frameworks anchor Silicon Valley, engineering ecosystems across Japan, Germany, Ukraine, France, Brazil, India, and beyond produce exceptional, specialized software. Navigate the world map to discover tools by origin.
        </p>
      </div>

      <WorldAtlas countries={populatedCountries} />
    </div>
  );
}
