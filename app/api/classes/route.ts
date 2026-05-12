import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let assignedTeacherId = searchParams.get("assignedTeacherId") || undefined;

    if (assignedTeacherId === "me") {
      assignedTeacherId = session.user.id;
    }

    const classes = await prisma.class.findMany({
      where: assignedTeacherId ? { assignedTeacherId } : undefined,
      include: {
        assignedTeacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        hod: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { children: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Class list error:", error);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, assignedTeacherId, hodId } = body;

    const classData = await prisma.class.create({
      data: {
        name,
        assignedTeacherId,
        hodId,
        academicYear: new Date().getFullYear().toString(),
      },
      include: {
        assignedTeacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        hod: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { children: true },
        },
      },
    });

    await logAction({
      userId: session.user.id,
      action: "CREATE_CLASS",
      entityType: "CLASS",
      entityId: classData.id,
      newValue: classData,
    });

    return NextResponse.json(classData);
  } catch (error) {
    console.error("Class creation error:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
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
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        assignedTeacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        hod: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { children: true },
        },
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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Prevent deleting class with enrolled children
    if (existingClass._count.children > 0) {
      return NextResponse.json({ error: "Cannot delete class with enrolled children" }, { status: 400 });
    }

    await prisma.class.delete({
      where: { id },
    });

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
