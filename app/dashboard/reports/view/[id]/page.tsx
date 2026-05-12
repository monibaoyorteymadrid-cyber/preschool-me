"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { Loader2, ArrowLeft, Calendar, User, School, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default function ViewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reportId = id;
  const [report, setReport] = useState<any>(null);
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Report Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Child Observation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Child:</span> {report.child.firstName} {report.child.lastName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span> {format(new Date(report.reportDate), "PPP")}
                </div>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Class:</span> {report.class.name.replace("_", " ")}
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span> 
                  <Badge variant="outline" className="ml-1 uppercase text-[10px]">
                    {report.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Daily Assessment</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground uppercase">Attendance</p>
                    <p className="font-bold">{report.attendanceStatus}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground uppercase">Mood</p>
                    <p className="font-bold">{report.mood}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground uppercase">Participation</p>
                    <p className="font-bold">{report.participationLevel.replace("_", " ")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Skill Scores (1-5)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries({
                    Literacy: report.literacyScore,
                    Numeracy: report.numeracyScore,
                    Communication: report.communicationScore,
                    "Motor Skills": report.motorSkillsScore,
                    "Social Skills": report.socialSkillsScore,
                    Behavior: report.behaviorScore,
                  }).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-xs">{label}</span>
                      <span className="font-bold text-primary">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Teacher Observations</h4>
                <div className="space-y-4 text-sm">
                  {report.healthNotes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Health</p>
                      <p>{report.healthNotes}</p>
                    </div>
                  )}
                  {report.mealNotes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Meals</p>
                      <p>{report.mealNotes}</p>
                    </div>
                  )}
                  {report.teacherComment && (
                    <div className="bg-blue-50 p-4 rounded border border-blue-100 italic">
                      <p className="text-xs font-medium text-blue-800 uppercase mb-1">General Comment</p>
                      <p>&quot;{report.teacherComment}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {report.hodReviews && report.hodReviews.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-sm">Review History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.hodReviews.map((review: any) => (
                  <div key={review.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase">{review.reviewStatus}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(review.reviewedAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                    {review.hodComment && (
                      <p className="text-sm italic">&quot;{review.hodComment}&quot;</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">Reviewed by {review.hod.firstName} {review.hod.lastName}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {["DRAFT", "RETURNED_BY_HOD"].includes(report.status) && (
                <Button asChild className="w-full">
                  <Link href={`/dashboard/reports/edit/${report.id}`}>Edit Report</Link>
                </Button>
              )}
              <Button variant="outline" className="w-full">Print Report</Button>
              {report.status === "ARCHIVED" && (
                <Badge className="w-full justify-center" variant="outline">
                  Report Archived
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
