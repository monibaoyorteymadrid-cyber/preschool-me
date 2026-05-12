"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForceCreateAdminPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleForceCreate = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/force-create", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        toast.success("Admin user created successfully!");
      } else {
        toast.error(data.error || "Failed to create admin");
      }
    } catch (error) {
      console.error("Force create request failed:", error);
      toast.error("Request failed - check console for details");
      setResult({
        error: "Request failed",
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Force Create Admin</CardTitle>
          <CardDescription className="text-center">
            Emergency admin creation for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create an admin user with email: <strong>admin@school.com</strong> and password: <strong>admin123</strong>
          </p>

          {result && (
            <div className="rounded-lg border p-4 text-sm">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <Button
            onClick={handleForceCreate}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Force Create Admin"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}