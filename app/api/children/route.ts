import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const where: { classId?: string } = {};
    if (classId) {
      where.classId = classId;
    } else if (session.user.role === "TEACHER") {
      // Teachers only see children in their class
      const teacherClass = await prisma.class.findFirst({
        where: { assignedTeacherId: session.user.id },
      });
      if (teacherClass) {
        where.classId = teacherClass.id;
      }
    }

    const children = await prisma.child.findMany({
      where,
      include: {
        class: true,
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error("Children fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let admissionNumber = body.admissionNumber;

    if (!admissionNumber) {
      do {
        admissionNumber = `ADM-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`;
      } while (await prisma.child.findUnique({ where: { admissionNumber } }));
    }

    const child = await prisma.child.create({
      data: {
        ...body,
        admissionNumber,
        dateOfBirth: new Date(body.dateOfBirth),
      },
    });

    return NextResponse.json(child);
  } catch (error) {
    console.error("Child creation error:", error);
    return NextResponse.json({ error: "Failed to create child" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Child id is required" }, { status: 400 });
    }

    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error("Child update error:", error);
    return NextResponse.json({ error: "Failed to update child" }, { status: 500 });
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
      return NextResponse.json({ error: "Child id is required" }, { status: 400 });
    }

    const existingChild = await prisma.child.findUnique({
      where: { id },
    });

    if (!existingChild) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    await prisma.child.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Child delete error:", error);
    return NextResponse.json({ error: "Failed to delete child" }, { status: 500 });
  }
}
