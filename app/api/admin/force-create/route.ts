import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin already exists",
        admin: {
          email: existingAdmin.email,
          id: existingAdmin.id
        }
      });
    }

    // Force create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newAdmin = await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: "admin@school.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Force created admin user:", newAdmin.id);

    return NextResponse.json({
      message: "Admin user force created",
      admin: {
        email: "admin@school.com",
        password: "admin123",
        id: newAdmin.id
      }
    });
  } catch (error) {
    console.error("Force create admin error:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}