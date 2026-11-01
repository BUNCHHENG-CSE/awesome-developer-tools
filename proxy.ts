import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Guard /admin routes: Do not allow direct route if not logged in
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    // If not logged in, immediately redirect to /login with redirect target
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify JWT token signature and expiry
    const session = await verifySessionToken(token);
    if (!session) {
      // Invalid or expired token: clear cookie and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // If user is logged in but does not have the admin role,
    // redirect them to /login with error explaining admin role is required
    if (session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/admin");
      loginUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard /my-submissions: Do not allow if not logged in
  if (pathname === "/my-submissions" || pathname.startsWith("/my-submissions/")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySessionToken(token);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/my-submissions",
    "/my-submissions/:path*",
  ],
};
