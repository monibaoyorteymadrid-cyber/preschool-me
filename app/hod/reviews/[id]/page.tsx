"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowLeft, Smile, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reportId = id;
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/reports/${reportId}`);
        setReport(res.data);
      } catch {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setIsSubmitting(true);
    try {
      await axios.post(`/api/reports/${reportId}/review`, { action, comment });
      toast.success(action === "APPROVE" ? "Report approved and forwarded to Admin" : "Report returned to teacher");
      router.push("/hod/reviews");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Link href="/hod/reviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Review Report</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Child Information</CardTitle>
                <Badge className="bg-blue-500 text-white uppercase text-[10px]">
                  {report.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Child Name</p>
                <p className="font-medium">{report.child.firstName} {report.child.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-medium">{report.class.name.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teacher</p>
                <p className="font-medium">{report.teacher.firstName} {report.teacher.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(report.reportDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase">Attendance</p>
                  <p className="font-bold">{report.attendanceStatus}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase">Mood</p>
                  <div className="flex items-center gap-1">
                    <Smile className="h-4 w-4 text-green-500" />
                    <p className="font-bold">{report.mood}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase">Participation</p>
                  <p className="font-bold">{report.participationLevel.replace("_", " ")}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Skill Scores</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    Literacy: report.literacyScore,
                    Numeracy: report.numeracyScore,
                    Communication: report.communicationScore,
                    Motor: report.motorSkillsScore,
                    Social: report.socialSkillsScore,
                    Behavior: report.behaviorScore,
                  }).map(([skill, score]) => (
                    <div key={skill} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm capitalize">{skill}</span>
                      <span className="font-bold text-primary">{score}/5</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Observations</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Health & Meals</p>
                    <p className="text-sm">{report.healthNotes || "N/A"} | {report.mealNotes || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Teacher Comments</p>
                    <p className="text-sm p-3 bg-blue-50 rounded border border-blue-100 italic">
                      &quot;{report.teacherComment || "No comments provided."}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Review Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">HOD Comments (Optional)</p>
                <Textarea
                  placeholder="Add your feedback for the teacher..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-37.5"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleAction("APPROVE")}
                disabled={isSubmitting || report.status !== "SUBMITTED_TO_HOD"}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Approve & Forward
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting || report.status !== "SUBMITTED_TO_HOD"}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                Return to Teacher
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
