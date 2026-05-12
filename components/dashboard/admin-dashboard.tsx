"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, ClipboardList, AlertCircle, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { User, Child, DailyReport } from "@/types";

interface AdminStats {
  totalUsers: number;
  totalChildren: number;
  totalReports: number;
  missingReports: number;
  chartData: { name: string; reports: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, childrenRes, reportsRes] = await Promise.all([
          axios.get<User[]>("/api/users"),
          axios.get<Child[]>("/api/children"),
          axios.get<DailyReport[]>("/api/reports"),
        ]);

        setStats({
          totalUsers: usersRes.data.length,
          totalChildren: childrenRes.data.length,
          totalReports: reportsRes.data.length,
          missingReports: 0,
          chartData: [
            { name: "Mon", reports: 40 },
            { name: "Tue", reports: 30 },
            { name: "Wed", reports: 20 },
            { name: "Thu", reports: 27 },
            { name: "Fri", reports: 18 },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Children",
      value: stats.totalChildren.toString(),
      icon: School,
      color: "text-green-600",
    },
    {
      label: "Total Reports",
      value: stats.totalReports.toString(),
      icon: ClipboardList,
      color: "text-purple-600",
    },
    {
      label: "Missing Reports",
      value: stats.missingReports.toString(),
      icon: AlertCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Daily Reporting Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Management</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/users">
                <UserCheck className="mr-2 h-4 w-4" />
                Manage Staff
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/classes">
                <School className="mr-2 h-4 w-4" />
                Manage Classes
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/children">
                <Users className="mr-2 h-4 w-4" />
                Manage Children
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
