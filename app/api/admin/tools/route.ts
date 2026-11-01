import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  websiteUrl: z.string().url("Must be a valid URL"),
  docsUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  countryId: z.string().optional().or(z.literal("")),
  pricing: z.enum(["free", "freemium", "paid"]).default("free"),
  hiddenGem: z.boolean().default(false),
  hiddenGemReason: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  popularity: z.number().min(0).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const categoryId = searchParams.get("categoryId");
    const hiddenGem = searchParams.get("hiddenGem");

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { tagline: { contains: query } },
        { description: { contains: query } },
      ];
    }
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }
    if (hiddenGem === "true") {
      where.hiddenGem = true;
    }

    const tools = await prisma.tool.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        country: { select: { id: true, name: true, code: true } },
      },
      take: 100,
    });

    return NextResponse.json({ data: tools, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch tools";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const json = await request.json();
    const parsed = toolSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let baseSlug = slugify(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.tool.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const tool = await prisma.tool.create({
      data: {
        name: data.name,
        slug,
        tagline: data.tagline,
        description: data.description,
        websiteUrl: data.websiteUrl,
        docsUrl: data.docsUrl || null,
        githubUrl: data.githubUrl || null,
        categoryId: data.categoryId,
        countryId: data.countryId || null,
        pricing: data.pricing,
        hiddenGem: data.hiddenGem,
        hiddenGemReason: data.hiddenGem ? data.hiddenGemReason || null : null,
        isFeatured: data.isFeatured,
        popularity: data.popularity,
      },
    });

    return NextResponse.json({ data: tool, error: null }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create tool";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
