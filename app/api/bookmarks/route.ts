import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ data: [], error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.id },
      include: {
        tool: {
          include: {
            category: true,
            country: true,
            tags: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: bookmarks.map((b) => b.tool),
      error: null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load bookmarks";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ data: null, error: "Please log in to save tools" }, { status: 401 });
    }

    const body = await request.json();
    const { toolId } = body;
    if (!toolId) {
      return NextResponse.json({ data: null, error: "toolId is required" }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_toolId: {
          userId: session.id,
          toolId,
        },
      },
      create: {
        userId: session.id,
        toolId,
      },
      update: {},
    });

    return NextResponse.json({ data: bookmark, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to bookmark tool";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get("toolId");
    if (!toolId) {
      return NextResponse.json({ data: null, error: "toolId is required" }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: session.id,
        toolId,
      },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to remove bookmark";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
