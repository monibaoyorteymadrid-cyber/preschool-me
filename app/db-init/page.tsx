"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DbInitPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();

  const handleInit = async () => {
    setIsInitializing(true);

    try {
      const response = await fetch("/api/db/init", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Database initialization failed.");
        console.error(data.details);
        return;
      }

      toast.success("Database initialized. Redirecting to setup...");
      setTimeout(() => {
        router.push("/setup");
      }, 1500);
    } catch (error) {
      console.error("DB init request failed:", error);
      toast.error("Unable to initialize database. Check logs.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Database Initialization Required</CardTitle>
          <CardDescription className="text-center">
            Your app needs the database schema created before setup can continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This page will initialize the database schema using Prisma and then redirect you to the admin setup page.
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            If this process succeeds, you will be able to create your first admin account.
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleInit} disabled={isInitializing}>
            {isInitializing ? "Initializing database..." : "Initialize Database"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
