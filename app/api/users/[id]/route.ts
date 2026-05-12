import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: body.firstName ?? existingUser.firstName,
        lastName: body.lastName ?? existingUser.lastName,
        email: body.email ?? existingUser.email,
        role: body.role ?? existingUser.role,
        status: body.status ?? existingUser.status,
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingUser.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete another admin" }, { status: 400 });
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
