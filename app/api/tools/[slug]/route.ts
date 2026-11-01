import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    const tool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        category: true,
        country: true,
        tags: true,
        parentTool: {
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            category: true,
            country: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            category: true,
            country: true,
          },
        },
      },
    });

    if (!tool) {
      return NextResponse.json(
        { data: null, error: "Tool not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: tool,
      error: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch tool";
    console.error("GET /api/tools/[slug] error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
