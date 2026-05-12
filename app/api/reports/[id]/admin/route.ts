import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action, comment } = await req.json(); // action: "ACCEPT" | "FLAG" | "ARCHIVE"

    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: { teacher: true, child: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    let newStatus: "ARCHIVED";
    let finalStatus: "ACCEPTED" | "FLAGGED" | "ARCHIVED";

    switch (action) {
      case "ACCEPT":
        newStatus = "ARCHIVED";
        finalStatus = "ACCEPTED";
        break;
      case "FLAG":
        newStatus = "ARCHIVED";
        finalStatus = "FLAGGED";
        break;
      case "ARCHIVE":
        newStatus = "ARCHIVED";
        finalStatus = "ARCHIVED";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update report status
    const updatedReport = await prisma.dailyReport.update({
      where: { id },
      data: { status: newStatus },
    });

    // Create Admin Review record
    await prisma.adminReview.create({
      data: {
        reportId: id,
        adminId: session.user.id,
        adminComment: comment,
        finalStatus: finalStatus,
      },
    });

    // Create Audit Log
    await logAction({
      userId: session.user.id,
      action: `ADMIN_${action}`,
      entityType: "DAILY_REPORT",
      entityId: id,
      newValue: { status: newStatus, finalStatus, comment },
    });

    // Create notification for teacher
    await createNotification({
      userId: report.teacherId,
      reportId: id,
      title: `Report ${action.toLowerCase()}ed`,
      message: `Your report for ${report.child.firstName} ${report.child.lastName} has been ${action.toLowerCase()}ed by Admin.`,
      type: "ADMIN_ACTION",
    });

    // Create notification for HOD
    const hod = await prisma.class.findUnique({
      where: { id: report.classId },
      select: { hodId: true },
    });

    if (hod?.hodId) {
      await createNotification({
        userId: hod.hodId,
        reportId: id,
        title: `Report ${action.toLowerCase()}ed`,
        message: `Report for ${report.child.firstName} ${report.child.lastName} has been ${action.toLowerCase()}ed by Admin.`,
        type: "ADMIN_ACTION",
      });
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Failed to process admin action" }, { status: 500 });
  }
}