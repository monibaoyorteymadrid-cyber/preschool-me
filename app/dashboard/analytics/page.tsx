"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BarChart3, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DailyReport } from "@/types";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED_TO_HOD: "Submitted to HOD",
  RETURNED_BY_HOD: "Returned",
  APPROVED_BY_HOD: "Approved",
  SUBMITTED_TO_ADMIN: "Submitted to Admin",
  ARCHIVED: "Archived",
};

export default function AnalyticsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get<DailyReport[]>("/api/reports");
      setReports(response.data);
    } catch (error) {
      console.error("Failed to load analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: statusLabels[status] || status,
    count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor report submission trends and approval workflow across the school.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchReports} disabled={loading}>
            <ArrowUpRight className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild>
            <a href="/dashboard/reports" className="inline-flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> View Reports
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending HOD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.SUBMITTED_TO_HOD ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.APPROVED_BY_HOD ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.RETURNED_BY_HOD ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Status Distribution</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle>{statusLabels[status] ?? status}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <div className="text-3xl font-bold">{count}</div>
                <p className="text-sm text-muted-foreground">Reports in this stage</p>
              </div>
              <div>
                {status === 'APPROVED_BY_HOD' ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : null}
                {status === 'RETURNED_BY_HOD' ? <XCircle className="h-8 w-8 text-amber-600" /> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
