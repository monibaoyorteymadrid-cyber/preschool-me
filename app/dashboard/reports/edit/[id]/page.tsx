"use client";

import { useState, useEffect, use } from "react";
import { DailyReportForm } from "@/components/reports/daily-report-form";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reportId = id;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/reports/${reportId}`);
        setReport(res.data);
      } catch (error) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-10 text-muted-foreground">Report not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Daily Report</h1>
        <p className="text-muted-foreground">
          Update the daily observation for this child.
        </p>
      </div>
      
      <DailyReportForm initialData={report} />
    </div>
  );
}
