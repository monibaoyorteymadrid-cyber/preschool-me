import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: {
        child: true,
        teacher: {
          select: { firstName: true, lastName: true },
        },
        class: true,
        hodReviews: {
          include: {
            hod: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // RBAC check
    if (session.user.role === "TEACHER" && report.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingReport = await prisma.dailyReport.findUnique({
      where: { id },
      include: {
        class: {
          include: { hod: true },
        },
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (session.user.role === "TEACHER") {
      if (existingReport.teacherId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!["DRAFT", "RETURNED_BY_HOD"].includes(existingReport.status)) {
        return NextResponse.json({ error: "Cannot edit submitted reports" }, { status: 400 });
      }
      if (body.status && !["DRAFT", "SUBMITTED_TO_HOD"].includes(body.status)) {
        return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
      }
    }

    if (body.status === "ARCHIVED" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized status change" }, { status: 401 });
    }

    const updatedReport = await prisma.dailyReport.update({
      where: { id },
      data: {
        ...body,
        reportDate: body.reportDate ? new Date(body.reportDate) : undefined,
        literacyScore: body.literacyScore ? parseInt(body.literacyScore) : undefined,
        numeracyScore: body.numeracyScore ? parseInt(body.numeracyScore) : undefined,
        communicationScore: body.communicationScore ? parseInt(body.communicationScore) : undefined,
        motorSkillsScore: body.motorSkillsScore ? parseInt(body.motorSkillsScore) : undefined,
        socialSkillsScore: body.socialSkillsScore ? parseInt(body.socialSkillsScore) : undefined,
        behaviorScore: body.behaviorScore ? parseInt(body.behaviorScore) : undefined,
      },
    });

    if (session.user.role === "ADMIN" && body.status) {
      await prisma.adminReview.create({
        data: {
          reportId: id,
          adminId: session.user.id,
          adminComment: body.adminComment || null,
          finalStatus: body.status === "ARCHIVED" ? "ARCHIVED" : "ACCEPTED",
        },
      });

      await createNotification({
        userId: existingReport.teacherId,
        reportId: id,
        title: "Report updated by admin",
        message: `Your report was updated by an admin and is now ${updatedReport.status.replace(/_/g, " ")}.`,
        type: "ADMIN_OVERRIDE",
      });
    }

    if (existingReport.status !== updatedReport.status) {
      if (updatedReport.status === "SUBMITTED_TO_HOD" && existingReport.class?.hodId) {
        await createNotification({
          userId: existingReport.class.hodId,
          reportId: id,
          title: "New report awaiting your review",
          message: "A report has been submitted to your review queue.",
          type: "REPORT_SUBMITTED",
        });
      }

      if (updatedReport.status === "ARCHIVED") {
        await createNotification({
          userId: existingReport.teacherId,
          reportId: id,
          title: "Report archived",
          message: "An admin archived your report.",
          type: "REPORT_ARCHIVED",
        });
      }
    }

    await logAction({
      userId: session.user.id,
      action: "UPDATE_REPORT",
      entityType: "DAILY_REPORT",
      entityId: id,
      oldValue: existingReport,
      newValue: updatedReport,
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Report update error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingReport = await prisma.dailyReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (session.user.role === "TEACHER") {
      if (existingReport.teacherId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (existingReport.status !== "DRAFT") {
        return NextResponse.json({ error: "Only drafts can be deleted" }, { status: 400 });
      }
    }

    await prisma.dailyReport.delete({
      where: { id },
    });

    await logAction({
      userId: session.user.id,
      action: "DELETE_REPORT",
      entityType: "DAILY_REPORT",
      entityId: id,
      oldValue: existingReport,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report delete error:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
