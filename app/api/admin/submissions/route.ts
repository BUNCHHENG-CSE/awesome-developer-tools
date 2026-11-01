import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.trim();

    const where: {
      status?: string;
      OR?: Array<{ name?: { contains: string }; websiteUrl?: { contains: string }; submittedBy?: { contains: string } }>;
    } = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { websiteUrl: { contains: query } },
        { submittedBy: { contains: query } },
      ];
    }

    const [submissions, categories, countries] = await Promise.all([
      prisma.toolSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.country.findMany({ select: { id: true, name: true, code: true } }),
    ]);

    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const countryMap = new Map(countries.map((c) => [c.id, c.name]));

    const enrichedSubmissions = submissions.map((sub) => ({
      ...sub,
      categoryName: sub.categoryId ? catMap.get(sub.categoryId) || null : null,
      countryName: sub.countryId ? countryMap.get(sub.countryId) || null : null,
    }));

    return NextResponse.json({
      data: enrichedSubmissions,
      error: null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch submissions";
    console.error("GET /api/admin/submissions error:", error);
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
