import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { logAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      childId,
      reportDate,
      attendanceStatus,
      mood,
      participationLevel,
      literacyScore,
      numeracyScore,
      communicationScore,
      motorSkillsScore,
      socialSkillsScore,
      behaviorScore,
      healthNotes,
      mealNotes,
      napNotes,
      teacherComment,
      status,
    } = body;

    // Get teacher's class
    const teacherClass = await prisma.class.findFirst({
      where: { assignedTeacherId: session.user.id },
    });

    if (!teacherClass) {
      return NextResponse.json({ error: "Teacher has no assigned class" }, { status: 400 });
    }

    const report = await prisma.dailyReport.create({
      data: {
        childId,
        teacherId: session.user.id,
        classId: teacherClass.id,
        reportDate: reportDate ? new Date(reportDate) : new Date(),
        attendanceStatus,
        mood,
        participationLevel,
        literacyScore: parseInt(literacyScore),
        numeracyScore: parseInt(numeracyScore),
        communicationScore: parseInt(communicationScore),
        motorSkillsScore: parseInt(motorSkillsScore),
        socialSkillsScore: parseInt(socialSkillsScore),
        behaviorScore: parseInt(behaviorScore),
        healthNotes,
        mealNotes,
        napNotes,
        teacherComment,
        status: status || "DRAFT",
      },
    });

    await logAction({
      userId: session.user.id,
      action: "CREATE_REPORT",
      entityType: "DAILY_REPORT",
      entityId: report.id,
      newValue: report,
    });

    if (report.status === "SUBMITTED_TO_HOD" && teacherClass.hodId) {
      const child = await prisma.child.findUnique({ where: { id: childId } });
      await createNotification({
        userId: teacherClass.hodId,
        reportId: report.id,
        title: "New report submitted",
        message: `A new report for ${child?.firstName ?? "a child"} ${child?.lastName ?? ""} was submitted for review.
`,
        type: "REPORT_SUBMITTED",
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report creation error:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const classId = searchParams.get("classId");
    const status = searchParams.get("status");

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (classId) where.classId = classId;
    if (status) where.status = status;

    // RBAC: Teachers can only see their own reports
    if (session.user.role === "TEACHER") {
      where.teacherId = session.user.id;
    }

    const reports = await prisma.dailyReport.findMany({
      where,
      include: {
        child: true,
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
