import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.tool.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.tagline !== undefined && { tagline: body.tagline }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
        ...(body.docsUrl !== undefined && { docsUrl: body.docsUrl || null }),
        ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl || null }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.countryId !== undefined && { countryId: body.countryId || null }),
        ...(body.pricing !== undefined && { pricing: body.pricing }),
        ...(body.hiddenGem !== undefined && { hiddenGem: body.hiddenGem }),
        ...(body.hiddenGemReason !== undefined && { hiddenGemReason: body.hiddenGemReason || null }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.popularity !== undefined && { popularity: Number(body.popularity) }),
      },
    });

    return NextResponse.json({ data: updated, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update tool";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.tool.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete tool";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
