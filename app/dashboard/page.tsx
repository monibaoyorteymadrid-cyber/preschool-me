import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { HODDashboard } from "@/components/dashboard/hod-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {session?.user?.name}
      </h1>
      
      {role === "TEACHER" && <TeacherDashboard />}
      {role === "HOD" && <HODDashboard />}
      {role === "ADMIN" && <AdminDashboard />}
    </div>
  );
}
