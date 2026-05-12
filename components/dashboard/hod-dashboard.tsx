"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle2, XCircle, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { DailyReport } from "@/types";

export function HODDashboard() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await axios.get<DailyReport[]>('/api/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Failed to load HOD dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const pendingCount = reports.filter((report) => report.status === 'SUBMITTED_TO_HOD').length;
  const approvedCount = reports.filter((report) => report.status === 'APPROVED_BY_HOD').length;
  const returnedCount = reports.filter((report) => report.status === 'RETURNED_BY_HOD').length;
  const totalReports = reports.length;

  const pendingReports = reports.filter((report) => report.status === 'SUBMITTED_TO_HOD');

  const stats = [
    {
      label: 'Awaiting Approval',
      value: pendingCount.toString(),
      icon: ClipboardList,
      color: 'text-amber-600',
    },
    {
      label: 'Approved',
      value: approvedCount.toString(),
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      label: 'Returned',
      value: returnedCount.toString(),
      icon: XCircle,
      color: 'text-destructive',
    },
    {
      label: 'Total Reports',
      value: totalReports.toString(),
      icon: Users,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            <CardTitle>Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading pending reports...</div>
            ) : pendingReports.length > 0 ? (
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div key={report.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {report.child?.firstName ?? 'Child'} {report.child?.lastName ?? ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted by {report.teacher?.firstName ?? 'Teacher'} {report.teacher?.lastName ?? ''}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/hod/reviews/${report.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No pending reports at the moment.</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <Link href="/hod/reviews">
                <ClipboardList className="mr-2 h-4 w-4" />
                Review All Submissions
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reporting Stats
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
