import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { data: null, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Default role for registered users is "user" (tool submitter)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await setSessionCookie({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role === "admin" ? "admin" : "user",
    });

    return NextResponse.json(
      {
        data: {
          user: newUser,
          message: "Account created successfully",
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to register";
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
