import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if admin already exists
    const adminExists = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (adminExists) {
      return NextResponse.json({ message: "Admin already exists" }, { status: 400 });
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: "admin@school.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    // Create some default classes
    await prisma.class.createMany({
      data: [
        { name: "FOUNDATION_1", academicYear: "2026", status: "ACTIVE" },
        { name: "FOUNDATION_2", academicYear: "2026", status: "ACTIVE" },
        { name: "RECEPTION_1", academicYear: "2026", status: "ACTIVE" },
        { name: "RECEPTION_2", academicYear: "2026", status: "ACTIVE" },
      ],
    });

    return NextResponse.json({
      message: "Initial setup successful",
      admin: {
        email: "admin@school.com",
        password: "admin123"
      }
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if admin already exists
    const adminExists = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (adminExists) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
    }

    // Create custom admin
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Creating admin user with email:", email);

    const newUser = await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email,
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Admin user created successfully with ID:", newUser.id);

    // Create some default classes
    await prisma.class.createMany({
      data: [
        { name: "FOUNDATION_1", academicYear: "2026", status: "ACTIVE" },
        { name: "FOUNDATION_2", academicYear: "2026", status: "ACTIVE" },
        { name: "RECEPTION_1", academicYear: "2026", status: "ACTIVE" },
        { name: "RECEPTION_2", academicYear: "2026", status: "ACTIVE" },
      ],
    });

    return NextResponse.json({
      message: "Setup successful",
      admin: { email, password }
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
