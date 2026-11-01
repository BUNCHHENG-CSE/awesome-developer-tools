import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      data: { message: "Logged out successfully" },
      error: null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to logout";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
