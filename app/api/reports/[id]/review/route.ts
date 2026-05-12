import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { logAction } from "@/lib/audit";
import { createNotification, notifyRole } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["HOD", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action, comment } = await req.json(); // action: "APPROVE" | "REJECT"

    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const updatedStatus = action === "APPROVE" ? "SUBMITTED_TO_ADMIN" : "RETURNED_BY_HOD";

    const updatedReport = await prisma.dailyReport.update({
      where: { id },
      data: { status: updatedStatus },
    });

    await prisma.hODReview.create({
      data: {
        reportId: id,
        hodId: session.user.id,
        reviewStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
        hodComment: comment,
      },
    });

    await logAction({
      userId: session.user.id,
      action: `HOD_${action}`,
      entityType: "DAILY_REPORT",
      entityId: id,
      newValue: { status: updatedStatus, comment },
    });

    await createNotification({
      userId: report.teacher.id,
      reportId: id,
      title: action === "APPROVE" ? "Report approved" : "Report returned",
      message: action === "APPROVE"
        ? "Your report has been approved by the HOD and submitted to the admin for final processing."
        : "Your report has been returned by the HOD for revisions.",
      type: action === "APPROVE" ? "REPORT_APPROVED" : "REPORT_RETURNED",
    });

    if (action === "APPROVE") {
      await notifyRole({
        role: "ADMIN",
        reportId: id,
        title: "Report submitted to admin",
        message: `A report has been approved by HOD and is awaiting admin review.`,
        type: "REPORT_TO_ADMIN",
      });
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}
