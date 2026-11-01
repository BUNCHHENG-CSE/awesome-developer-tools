import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

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
    const { role, name, email, password } = body;

    // Prevent demoting yourself
    if (role && session.id === id && role !== "admin") {
      return NextResponse.json(
        { data: null, error: "You cannot demote your own admin account" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role !== undefined) {
      if (role !== "admin" && role !== "user") {
        return NextResponse.json({ data: null, error: "Role must be 'admin' or 'user'" }, { status: 400 });
      }
      updateData.role = role;
    }

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findFirst({
        where: { email: normalizedEmail, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ data: null, error: "Email is already taken by another user" }, { status: 409 });
      }
      updateData.email = normalizedEmail;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ data: null, error: "Password must be at least 6 characters" }, { status: 400 });
      }
      updateData.password = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: updated, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update user";
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

    // Safety check: Cannot delete your own account
    if (session.id === id) {
      return NextResponse.json(
        { data: null, error: "You cannot delete your own admin account while logged in" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
