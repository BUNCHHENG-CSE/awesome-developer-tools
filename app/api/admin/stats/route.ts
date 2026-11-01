import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [
      totalTools,
      hiddenGemsCount,
      featuredCount,
      totalCategories,
      totalCountries,
      totalUsers,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      recentSubmissions,
    ] = await Promise.all([
      prisma.tool.count(),
      prisma.tool.count({ where: { hiddenGem: true } }),
      prisma.tool.count({ where: { isFeatured: true } }),
      prisma.category.count(),
      prisma.country.count(),
      prisma.user.count(),
      prisma.toolSubmission.count({ where: { status: "pending" } }),
      prisma.toolSubmission.count({ where: { status: "approved" } }),
      prisma.toolSubmission.count({ where: { status: "rejected" } }),
      prisma.toolSubmission.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        totalTools,
        hiddenGemsCount,
        featuredCount,
        totalCategories,
        totalCountries,
        totalUsers,
        submissions: {
          pending: pendingSubmissions,
          approved: approvedSubmissions,
          rejected: rejectedSubmissions,
          total: pendingSubmissions + approvedSubmissions + rejectedSubmissions,
        },
        recentSubmissions,
      },
      error: null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch admin stats";
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
