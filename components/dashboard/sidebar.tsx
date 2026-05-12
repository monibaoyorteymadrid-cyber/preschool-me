"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  School,
  FileText,
  BarChart3,
  Settings,
  UserCircle,
  ShieldCheck,
  ClipboardCheck,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
      roles: ["ADMIN", "HOD", "TEACHER"],
    },
    {
      label: "Daily Reports",
      icon: ClipboardList,
      href: "/dashboard/reports",
      color: "text-violet-500",
      roles: ["TEACHER"],
    },
    {
      label: "Pending Reviews",
      icon: ShieldCheck,
      href: "/hod/reviews",
      color: "text-orange-500",
      roles: ["HOD", "ADMIN"],
    },
    {
      label: "Admin Review",
      icon: ClipboardCheck,
      href: "/admin/reports",
      color: "text-emerald-600",
      roles: ["ADMIN"],
    },
    {
      label: "Classes",
      icon: School,
      href: "/admin/classes",
      color: "text-pink-700",
      roles: ["ADMIN"],
    },
    {
      label: "Children",
      icon: Users,
      href: "/admin/children",
      color: "text-orange-700",
      roles: ["ADMIN"],
    },
    {
      label: "User Management",
      icon: UserCircle,
      href: "/admin/users",
      color: "text-emerald-500",
      roles: ["ADMIN"],
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "text-yellow-600",
      roles: ["ADMIN", "HOD"],
    },
    {
      label: "Reports Archive",
      icon: FileText,
      href: "/dashboard/archive",
      color: "text-blue-500",
      roles: ["ADMIN", "HOD"],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      roles: ["ADMIN", "HOD", "TEACHER"],
    },
  ];

  const filteredRoutes = routes.filter((route) =>
    route.roles.includes(role as string)
  );

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-red-400 hover:text-red-300"
          )}
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </div>
        </button>
      </div>
    </div>
  );
}
