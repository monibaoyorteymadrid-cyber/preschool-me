"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText, RotateCcw, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Class, DailyReport } from "@/types";

interface DashboardStats {
  className: string;
  childrenCount: number;
  draftCount: number;
  pendingCount: number;
  returnedCount: number;
  recentReports: DailyReport[];
}

export function TeacherDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [classRes, reportsRes] = await Promise.all([
          axios.get<Class[]>("/api/classes?assignedTeacherId=me"),
          axios.get<DailyReport[]>("/api/reports"),
        ]);

        const teacherClass = classRes.data[0];
        const reports = reportsRes.data;

        const stats: DashboardStats = {
          className: teacherClass?.name.replace("_", " ") || "No Class Assigned",
          childrenCount: teacherClass?._count?.children || 0,
          draftCount: reports.filter((r) => r.status === "DRAFT").length,
          pendingCount: reports.filter((r) => r.status === "SUBMITTED_TO_HOD").length,
          returnedCount: reports.filter((r) => r.status === "RETURNED_BY_HOD").length,
          recentReports: reports.slice(0, 5),
        };

        setData(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      label: "My Class",
      value: data.className,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Children Count",
      value: data.childrenCount.toString(),
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Draft Reports",
      value: data.draftCount.toString(),
      icon: FileText,
      color: "text-amber-600",
    },
    {
      label: "Pending Approval",
      value: data.pendingCount.toString(),
      icon: ClipboardList,
      color: "text-purple-600",
    },
    {
      label: "Returned",
      value: data.returnedCount.toString(),
      icon: RotateCcw,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentReports.length > 0 ? (
                data.recentReports.map((report) => (
                  <div key={report.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Daily Report for {report.child.firstName} {report.child.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(report.reportDate), "PPP")}
                      </p>
                    </div>
                    <Badge variant={report.status === "APPROVED_BY_HOD" ? "default" : "secondary"}>
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/reports/new">
                <ClipboardList className="mr-2 h-4 w-4" />
                Create New Report
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/reports">
                <FileText className="mr-2 h-4 w-4" />
                View All Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
