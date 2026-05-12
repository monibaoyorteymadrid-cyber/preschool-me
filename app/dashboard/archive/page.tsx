"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DailyReport } from "@/types";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function ArchivedReportsPage() {
  const { data: reports, error, mutate, isLoading } = useSWR<DailyReport[]>('/api/reports?status=ARCHIVED', fetcher);
  const [search, setSearch] = useState('');

  const filteredReports = (reports || []).filter((report) =>
    `${report.teacher?.firstName ?? ''} ${report.teacher?.lastName ?? ''} ${report.child?.firstName} ${report.child?.lastName}`
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ height: 400 }}>
        <p className="text-destructive">Failed to load archived reports</p>
        <Button onClick={() => mutate()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Archive</h1>
          <p className="text-muted-foreground">
            View archived reports that have been finalized by the admin.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by teacher or child..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archived Reports</CardTitle>
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
                    <TableCell>
                      {report.child?.firstName} {report.child?.lastName}
                    </TableCell>
                    <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-500 text-white uppercase text-[10px]">Archived</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/reports/view/${report.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No archived reports found.
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
