"use client";

import { useState } from "react";
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
import { Eye, Search, CheckCircle, XCircle, Archive, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import useSWR from "swr";
import { toast } from "sonner";
import { DailyReport } from "@/types";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AdminReportsPage() {
  const { data: reports, error, mutate, isLoading } = useSWR<DailyReport[]>("/api/reports?status=SUBMITTED_TO_ADMIN", fetcher);
  const [search, setSearch] = useState("");

  const handleAdminAction = async (reportId: string, action: "ACCEPT" | "FLAG" | "ARCHIVE") => {
    try {
      await axios.post(`/api/reports/${reportId}/admin`, { action, comment: `${action} action performed by admin` });
      toast.success(`Report ${action.toLowerCase()}ed successfully`);
      mutate();
    } catch (error) {
      toast.error("Failed to process admin action");
    }
  };

  const filteredReports = (reports || []).filter((r) =>
    `${r.teacher?.firstName} ${r.teacher?.lastName} ${r.child?.firstName} ${r.child?.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Report Review</h1>
          <p className="text-muted-foreground">
            Final review and archiving of approved reports.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports Awaiting Final Review</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter by teacher or child..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Child Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.teacher?.firstName} {report.teacher?.lastName}
                    </TableCell>
                    <TableCell>{report.child?.firstName} {report.child?.lastName}</TableCell>
                    <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-500 text-white uppercase text-[10px]">Admin Review</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="View">
                          <Link href={`/dashboard/reports/view/${report.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                          title="Accept"
                          onClick={() => handleAdminAction(report.id, "ACCEPT")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" 
                          title="Flag"
                          onClick={() => handleAdminAction(report.id, "FLAG")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50" 
                          title="Archive"
                          onClick={() => handleAdminAction(report.id, "ARCHIVE")}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    {search ? "No reports match your search." : "No reports pending admin review."}
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