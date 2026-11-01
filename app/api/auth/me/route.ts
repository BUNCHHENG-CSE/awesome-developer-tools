import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      data: { user: session },
      error: null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch user session";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
