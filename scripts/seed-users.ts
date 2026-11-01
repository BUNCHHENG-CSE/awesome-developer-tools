import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("🌱 Seeding default users (Admin & Submitter)...");

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@devatlas.com" },
    update: {
      role: "admin",
      name: "DevAtlas Admin",
    },
    create: {
      email: "admin@devatlas.com",
      name: "DevAtlas Admin",
      password: adminPasswordHash,
      role: "admin",
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: "user@devatlas.com" },
    update: {
      role: "user",
      name: "Tool Submitter",
    },
    create: {
      email: "user@devatlas.com",
      name: "Tool Submitter",
      password: userPasswordHash,
      role: "user",
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email} (Role: ${admin.role})`);
  console.log(`✅ Normal user seeded: ${normalUser.email} (Role: ${normalUser.role})`);
}

if (typeof process !== "undefined") {
  seedUsers()
    .catch((err) => {
      console.error("Error seeding users:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
