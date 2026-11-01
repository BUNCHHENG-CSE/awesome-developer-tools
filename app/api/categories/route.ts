import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { tools: true },
        },
      },
    });

    return NextResponse.json({
      data: categories,
      error: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
