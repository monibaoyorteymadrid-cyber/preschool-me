"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileEdit, Eye, Plus, Download, Loader2 } from "lucide-react";
import axios from "axios";
import { DailyReport } from "@/types";
import { exportReportsToPDF, exportToExcel } from "@/lib/export-utils";

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await axios.get<DailyReport[]>("/api/reports");
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportPDF = () => {
    exportReportsToPDF(reports, `Reports_Export_${new Date().toLocaleDateString()}`);
  };

  const handleExportExcel = () => {
    const flatData = reports.map(r => ({
      Student: `${r.child.firstName} ${r.child.lastName}`,
      Date: new Date(r.reportDate).toLocaleDateString(),
      Status: r.status,
    }));
    exportToExcel(flatData, `Reports_Export_${new Date().toLocaleDateString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "SUBMITTED_TO_HOD":
        return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
      case "RETURNED_BY_HOD":
        return <Badge variant="destructive">Returned</Badge>;
      case "APPROVED_BY_HOD":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "SUBMITTED_TO_ADMIN":
        return <Badge className="bg-purple-500 text-white">Admin Review</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-500 text-white">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Reports</h1>
          <p className="text-muted-foreground">
            Manage and track all your child observation reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button asChild>
            <Link href="/dashboard/reports/new">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.child.firstName} {report.child.lastName}
                    </TableCell>
                    <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {report.status === "DRAFT" || report.status === "RETURNED_BY_HOD" ? (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/edit/${report.id}`}>
                              <FileEdit className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/reports/view/${report.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No reports found. Create your first report to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
