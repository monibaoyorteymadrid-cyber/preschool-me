import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("Force create admin: Starting...");

    // Test database connection first
    await prisma.$connect();
    console.log("Force create admin: Database connected");

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    console.log("Force create admin: Existing admin check result:", existingAdmin ? "found" : "not found");

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
    console.log("Force create admin: Creating user...");
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
    console.error("Error details:", JSON.stringify(error, null, 2));

    // Return detailed error for debugging
    return NextResponse.json({
      error: "Failed to create admin",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}