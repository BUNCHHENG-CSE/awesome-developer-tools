import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({
        data: { tools: [] },
        error: null,
      });
    }

    // Do NOT use mode: "insensitive" for SQLite compatibility!
    const tools = await prisma.tool.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { tagline: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
          { country: { name: { contains: query } } },
          { tags: { some: { name: { contains: query } } } },
        ],
      },
      take: 20,
      orderBy: { popularity: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        hiddenGem: true,
        hiddenGemReason: true,
        websiteUrl: true,
        popularity: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        country: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: { tools },
      error: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to search tools";
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
