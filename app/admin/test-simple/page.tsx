"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTestSimplePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const callTestEndpoint = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/test-simple", { method: "POST" });
      const data = await response.json();
      setResult({ status: response.ok ? "success" : "error", data });
    } catch (error) {
      setResult({ status: "error", error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Test Endpoint</CardTitle>
          <CardDescription className="text-center">
            Test the admin API routing and JSON response directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={callTestEndpoint} disabled={loading}>
            {loading ? "Testing..." : "Run Test"}
          </Button>

          {result && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <div className="font-semibold mb-2">Result: {result.status}</div>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(result.data ?? result.error ?? result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
