import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

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
    const { action, rejectionReason, createToolData } = body;

    const submission = await prisma.toolSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ data: null, error: "Submission not found" }, { status: 404 });
    }

    if (action === "approve") {
      // If admin opted to also publish as a Tool directly:
      if (createToolData) {
        let baseSlug = slugify(createToolData.name || submission.name);
        if (!baseSlug) baseSlug = "tool-" + Date.now();

        // Ensure unique slug
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.tool.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Must have a valid category
        let categoryId = createToolData.categoryId || submission.categoryId;
        if (!categoryId) {
          const firstCategory = await prisma.category.findFirst();
          if (!firstCategory) {
            return NextResponse.json({ data: null, error: "Cannot create tool: No category found" }, { status: 400 });
          }
          categoryId = firstCategory.id;
        }

        await prisma.tool.create({
          data: {
            name: createToolData.name || submission.name,
            slug,
            tagline: createToolData.tagline || `${submission.name} — Modern developer tool.`,
            description:
              createToolData.description ||
              `${submission.name} is a software tool discovered and indexed in the DevAtlas directory.`,
            websiteUrl: createToolData.websiteUrl || submission.websiteUrl,
            categoryId,
            countryId: createToolData.countryId || submission.countryId || null,
            pricing: createToolData.pricing || "free",
            hiddenGem: Boolean(createToolData.hiddenGem),
            hiddenGemReason: createToolData.hiddenGemReason || null,
            isFeatured: Boolean(createToolData.isFeatured),
            popularity: 50,
          },
        });
      }

      const updated = await prisma.toolSubmission.update({
        where: { id },
        data: {
          status: "approved",
          rejectionReason: null,
        },
      });

      return NextResponse.json({ data: updated, error: null });
    }

    if (action === "reject") {
      const updated = await prisma.toolSubmission.update({
        where: { id },
        data: {
          status: "rejected",
          rejectionReason: rejectionReason || "Does not meet directory inclusion criteria.",
        },
      });

      return NextResponse.json({ data: updated, error: null });
    }

    if (action === "pending") {
      const updated = await prisma.toolSubmission.update({
        where: { id },
        data: {
          status: "pending",
          rejectionReason: null,
        },
      });

      return NextResponse.json({ data: updated, error: null });
    }

    return NextResponse.json({ data: null, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update submission";
    console.error("PATCH /api/admin/submissions/[id] error:", error);
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

    await prisma.toolSubmission.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete submission";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
