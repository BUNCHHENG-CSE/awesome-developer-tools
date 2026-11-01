import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6)
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get("mine") === "true";
    const session = await getSession();

    let whereClause: any = { isPublic: true };
    if (mineOnly) {
      if (!session) {
        return NextResponse.json({ data: [], error: "Unauthorized" }, { status: 401 });
      }
      whereClause = { userId: session.id };
    }

    const stacks = await prisma.techStack.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
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
      take: 50,
    });

    return NextResponse.json({ data: stacks, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load stacks";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Please log in to build and save a tech stack" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, tools = [], isPublic = true } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ data: null, error: "Stack name is required" }, { status: 400 });
    }

    if (!Array.isArray(tools) || tools.length === 0) {
      return NextResponse.json(
        { data: null, error: "Select at least 1 tool for your stack" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const stack = await prisma.techStack.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug,
        isPublic: Boolean(isPublic),
        userId: session.id,
        tools: {
          create: tools.map((t: { toolId: string; role?: string }) => ({
            toolId: t.toolId,
            role: t.role || "Utility",
          })),
        },
      },
      include: {
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });

    return NextResponse.json({ data: stack, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create stack";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
