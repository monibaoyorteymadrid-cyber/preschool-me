import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }
    
    if (session.user.role !== "ADMIN") {
      console.error("User role is not ADMIN:", session.user.role);
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, password, role } = body;

    if (!firstName || !lastName || !email || !password || !role) {
      console.error("Missing required fields:", { firstName, lastName, email, password, role });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate role enum
    if (!["ADMIN", "HOD", "TEACHER"].includes(role)) {
      console.error("Invalid role:", role);
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
        status: "ACTIVE",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
      },
    });

    await logAction({
      userId: session.user.id,
      action: "CREATE_USER",
      entityType: "USER",
      entityId: user.id,
      newValue: user,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("User creation error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });
    
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create user",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
      },
    });

    await logAction({
      userId: session.user.id,
      action: "UPDATE_USER",
      entityType: "USER",
      entityId: id,
      oldValue: existingUser,
      newValue: updatedUser,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User id required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the current admin user
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const dependentReports = await prisma.dailyReport.count({
      where: { teacherId: id },
    });
    const dependentClasses = await prisma.class.count({
      where: { OR: [{ assignedTeacherId: id }, { hodId: id }] },
    });

    if (dependentReports > 0 || dependentClasses > 0) {
      return NextResponse.json({
        error: "User is assigned to active records. Deactivate the account instead.",
      }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await logAction({
      userId: session.user.id,
      action: "DELETE_USER",
      entityType: "USER",
      entityId: id,
      oldValue: existingUser,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
