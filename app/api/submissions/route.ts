import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const submissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  websiteUrl: z.string().url("Must be a valid URL (include https://)"),
  categoryId: z.string().optional().nullable(),
  countryId: z.string().optional().nullable(),
  submittedBy: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // REQUIRE AUTHENTICATION: Only logged-in users can submit a tool
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          data: null,
          error: "Authentication required. Please sign in or create an account to submit a tool.",
        },
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = submissionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          data: null,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { name, websiteUrl, categoryId, countryId } = parsed.data;

    const submission = await prisma.toolSubmission.create({
      data: {
        name,
        websiteUrl,
        categoryId: categoryId || null,
        countryId: countryId || null,
        submittedBy: session.email,
        userId: session.id,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        data: submission,
        error: null,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process submission";
    console.error("POST /api/submissions error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // If admin and requested all, they can see all. Otherwise users only see their own.
    const isAdmin = session.role === "admin";
    const where: { userId?: string; status?: string } = {};

    if (!isAdmin || searchParams.get("myOnly") === "true") {
      where.userId = session.id;
    }

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      where.status = status;
    }

    const submissions = await prisma.toolSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: submissions,
      error: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch submissions";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
