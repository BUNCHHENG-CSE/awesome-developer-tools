import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const country = searchParams.get("country");
    const region = searchParams.get("region");
    const pricing = searchParams.get("pricing");
    const license = searchParams.get("license");
    const hiddenGem = searchParams.get("hiddenGem");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "popularity-desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "24", 10));

    const where: Prisma.ToolWhereInput = {};

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = {
        some: { slug: tag },
      };
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

    if (license) {
      where.license = license;
    }

    if (hiddenGem !== null && hiddenGem !== undefined && hiddenGem !== "") {
      where.hiddenGem = hiddenGem === "true";
    }

    // Do NOT use mode: "insensitive" for SQLite compatibility!
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { tagline: { contains: term } },
        { description: { contains: term } },
      ];
    }

    // Ordering
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

    const [total, items] = await Promise.all([
      prisma.tool.count({ where }),
      prisma.tool.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          country: {
            select: { id: true, code: true, name: true, region: true },
          },
          tags: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: {
        items,
        total,
        page,
        limit,
        totalPages,
      },
      error: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch tools";
    console.error("GET /api/tools error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
