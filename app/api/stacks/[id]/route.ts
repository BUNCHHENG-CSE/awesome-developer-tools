import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const stack = await prisma.techStack.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tools: {
          include: {
            tool: {
              include: {
                category: true,
                country: true,
                tags: true,
              },
            },
          },
        },
      },
    });

    if (!stack) {
      return NextResponse.json({ data: null, error: "Stack not found" }, { status: 404 });
    }

    return NextResponse.json({ data: stack, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load stack";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const stack = await prisma.techStack.findUnique({
      where: { id },
    });

    if (!stack) {
      return NextResponse.json({ data: null, error: "Stack not found" }, { status: 404 });
    }

    if (stack.userId !== session.id && session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    await prisma.techStack.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete stack";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
