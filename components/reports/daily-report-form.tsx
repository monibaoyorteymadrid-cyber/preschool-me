"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Smile, Meh, Frown, Battery, Save, Send, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Child } from "@/types";

const reportSchema = z.object({
  childId: z.string().min(1, "Child is required"),
  reportDate: z.string().min(1, "Report date is required"),
  attendanceStatus: z.enum(["PRESENT", "ABSENT", "LATE"]),
  mood: z.enum(["HAPPY", "QUIET", "UPSET", "TIRED"]),
  participationLevel: z.enum(["EXCELLENT", "GOOD", "FAIR", "NEEDS_SUPPORT"]),
  literacyScore: z.string().min(1, "Required"),
  numeracyScore: z.string().min(1, "Required"),
  communicationScore: z.string().min(1, "Required"),
  motorSkillsScore: z.string().min(1, "Required"),
  socialSkillsScore: z.string().min(1, "Required"),
  behaviorScore: z.string().min(1, "Required"),
  healthNotes: z.string().optional(),
  mealNotes: z.string().optional(),
  napNotes: z.string().optional(),
  teacherComment: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface DailyReportFormProps {
  initialData?: any;
}

export function DailyReportForm({ initialData }: DailyReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData ? {
      ...initialData,
      reportDate: initialData.reportDate
        ? new Date(initialData.reportDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      literacyScore: initialData.literacyScore.toString(),
      numeracyScore: initialData.numeracyScore.toString(),
      communicationScore: initialData.communicationScore.toString(),
      motorSkillsScore: initialData.motorSkillsScore.toString(),
      socialSkillsScore: initialData.socialSkillsScore.toString(),
      behaviorScore: initialData.behaviorScore.toString(),
    } : {
      reportDate: new Date().toISOString().slice(0, 10),
      attendanceStatus: "PRESENT",
      mood: "HAPPY",
      participationLevel: "GOOD",
      literacyScore: "3",
      numeracyScore: "3",
      communicationScore: "3",
      motorSkillsScore: "3",
      socialSkillsScore: "3",
      behaviorScore: "3",
      healthNotes: "",
      mealNotes: "",
      napNotes: "",
      teacherComment: "",
    },
  });

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get<Child[]>("/api/children");
        setChildrenList(response.data);
      } catch {
        toast.error("Failed to load children list");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  async function onSubmit(values: ReportFormValues, status: "DRAFT" | "SUBMITTED_TO_HOD") {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await axios.patch(`/api/reports/${initialData.id}`, { ...values, status });
        toast.success(status === "DRAFT" ? "Report updated as draft" : "Report updated and submitted to HOD");
      } else {
        await axios.post("/api/reports", { ...values, status });
        toast.success(status === "DRAFT" ? "Report saved as draft" : "Report submitted to HOD");
      }
      router.push("/dashboard/reports");
      router.refresh();
    } catch {
      toast.error("Failed to save report");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="childId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a child" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {childrenList.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.firstName} {child.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="attendanceStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attendance</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="participationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participation</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXCELLENT">Excellent</SelectItem>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="FAIR">Fair</SelectItem>
                          <SelectItem value="NEEDS_SUPPORT">Needs Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Daily Mood</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        {[
                          { value: "HAPPY", icon: Smile, label: "Happy" },
                          { value: "QUIET", icon: Meh, label: "Quiet" },
                          { value: "UPSET", icon: Frown, label: "Upset" },
                          { value: "TIRED", icon: Battery, label: "Tired" },
                        ].map((item) => (
                          <div
                            key={item.value}
                            onClick={() => field.onChange(item.value)}
                            className={`flex flex-col items-center p-2 rounded-lg border-2 transition cursor-pointer ${
                              field.value === item.value
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:border-gray-200"
                            }`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                field.onChange(item.value);
                              }
                            }}
                          >
                            <item.icon className={`h-8 w-8 ${field.value === item.value ? "text-primary" : "text-gray-400"}`} />
                            <span className="text-xs mt-1">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Assessment (1-5)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                { name: "literacyScore", label: "Literacy" },
                { name: "numeracyScore", label: "Numeracy" },
                { name: "communicationScore", label: "Communication" },
                { name: "motorSkillsScore", label: "Motor Skills" },
                { name: "socialSkillsScore", label: "Social Skills" },
                { name: "behaviorScore", label: "Behavior" },
              ].map((skill) => (
                <FormField
                  key={skill.name}
                  control={form.control}
                  name={skill.name as keyof ReportFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{skill.label}</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((val) => (
                            <SelectItem key={val} value={val.toString()}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Observations & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How was the child's health?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mealNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What did the child eat?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="napNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nap Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nap details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="teacherComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Teacher Comment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any other observations..." className="min-h-25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={form.handleSubmit((values) => onSubmit(values, "DRAFT"))}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit((values) => onSubmit(values, "SUBMITTED_TO_HOD"))}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit to HOD
          </Button>
        </div>
      </form>
    </Form>
  );
}
