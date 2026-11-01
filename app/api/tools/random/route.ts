import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("excludeId");

    // Fetch hidden gem tools
    const hiddenGems = await prisma.tool.findMany({
      where: {
        hiddenGem: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        description: true,
        websiteUrl: true,
        pricing: true,
        license: true,
        hiddenGem: true,
        hiddenGemReason: true,
        category: {
          select: { name: true, slug: true },
        },
        country: {
          select: { code: true, name: true, region: true },
        },
        tags: {
          select: { name: true, slug: true },
        },
      },
    });

    if (hiddenGems.length === 0) {
      return NextResponse.json({ data: null, error: "No hidden gems found" }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * hiddenGems.length);
    const selectedGem = hiddenGems[randomIndex];

    return NextResponse.json({
      data: selectedGem,
      error: null,
      totalGems: hiddenGems.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
