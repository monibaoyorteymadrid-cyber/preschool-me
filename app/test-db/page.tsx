"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDbPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-db");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        status: "error",
        message: "Request failed",
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Database Connection Test</CardTitle>
          <CardDescription className="text-center">
            Test if the app can connect to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testConnection}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testing..." : "Test Database Connection"}
          </Button>

          {result && (
            <div className={`rounded-lg border p-4 text-sm ${
              result.status === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}>
              <div className="font-semibold mb-2">
                Status: {result.status === "success" ? "✅ Success" : "❌ Error"}
              </div>
              <div className="mb-2">{result.message}</div>
              {result.userCount !== undefined && (
                <div>Users in database: {result.userCount}</div>
              )}
              {result.error && (
                <div className="mt-2 text-xs">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-600">
                Timestamp: {result.timestamp}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}