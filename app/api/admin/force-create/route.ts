import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    console.log("[Force Admin] Starting...");

    // Hash password
    console.log("[Force Admin] Hashing password...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("[Force Admin] Password hashed");

    // Check if admin exists
    console.log("[Force Admin] Checking for existing admin...");
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("[Force Admin] Admin exists:", existingAdmin.email);
      return NextResponse.json({
        success: true,
        message: "Admin already exists",
        admin: { email: existingAdmin.email, id: existingAdmin.id }
      });
    }

    // Clean up any duplicate email
    console.log("[Force Admin] Cleaning up duplicates...");
    await prisma.user.deleteMany({
      where: { email: "admin@school.com" },
    }).catch(() => null);

    // Create admin
    console.log("[Force Admin] Creating admin user...");
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

    console.log("[Force Admin] Success! Created:", newAdmin.id);
    return NextResponse.json({
      success: true,
      message: "Admin created",
      admin: { email: "admin@school.com", password: "admin123", id: newAdmin.id }
    });
  } catch (error) {
    console.error("[Force Admin] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}