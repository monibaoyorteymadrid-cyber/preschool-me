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

    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: body.name ?? existingClass.name,
        assignedTeacherId: body.assignedTeacherId ?? existingClass.assignedTeacherId,
        hodId: body.hodId ?? existingClass.hodId,
        status: body.status ?? existingClass.status,
      },
    });

    await logAction({
      userId: session.user.id,
      action: "UPDATE_CLASS",
      entityType: "CLASS",
      entityId: id,
      oldValue: existingClass,
      newValue: updatedClass,
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Class update error:", error);
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await prisma.class.delete({ where: { id } });

    await logAction({
      userId: session.user.id,
      action: "DELETE_CLASS",
      entityType: "CLASS",
      entityId: id,
      oldValue: existingClass,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Class delete error:", error);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
