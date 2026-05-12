import { DailyReportForm } from "@/components/reports/daily-report-form";

export default function NewReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Child Observation</h1>
        <p className="text-muted-foreground">
          Record daily observations for a child in your class.
        </p>
      </div>
      
      <DailyReportForm />
    </div>
  );
}
