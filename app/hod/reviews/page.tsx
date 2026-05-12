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
import { CheckCircle2, XCircle, Eye, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import useSWR from "swr";
import { DailyReport } from "@/types";
import { toast } from "sonner";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function HODReviewsPage() {
  const { data: reports, error, mutate, isLoading } = useSWR<DailyReport[]>("/api/reports?status=SUBMITTED_TO_HOD", fetcher);
  const [search, setSearch] = useState("");

  const handleReviewAction = async (reportId: string, action: "APPROVE" | "REJECT") => {
    try {
      await axios.post(`/api/reports/${reportId}/review`, { action, comment: `Quick ${action.toLowerCase()}` });
      toast.success(`Report ${action === "APPROVE" ? "approved" : "returned"}`);
      mutate();
    } catch {
      toast.error("Failed to process review");
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
          <h1 className="text-3xl font-bold tracking-tight">Pending Reviews</h1>
          <p className="text-muted-foreground">
            Review and approve daily reports from teachers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={filteredReports.length === 0}>Batch Approve</Button>
          <Button disabled={filteredReports.length === 0}>Submit All to Admin</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports Awaiting Review</CardTitle>
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
                      <Badge className="bg-blue-500 text-white uppercase text-[10px]">Submitted</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Review">
                          <Link href={`/hod/reviews/${report.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                          title="Approve"
                          onClick={() => handleReviewAction(report.id, "APPROVE")}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-red-50" 
                          title="Reject"
                          onClick={() => handleReviewAction(report.id, "REJECT")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    {search ? "No reports match your search." : "No reports pending review."}
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
