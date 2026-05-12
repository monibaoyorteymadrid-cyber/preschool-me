import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center" style={{ height: 400 }}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}
