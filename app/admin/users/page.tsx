"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, UserPlus, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { User } from "@/types";
import { AddUserDialog } from "@/components/dashboard/add-user-dialog";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AdminUsersPage() {
  const { data: users, error, mutate, isLoading } = useSWR<User[]>("/api/users", fetcher);
  const [search, setSearch] = useState("");

  const filteredUsers = (users || []).filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-600">Admin</Badge>;
      case "HOD":
        return <Badge className="bg-orange-500">HOD</Badge>;
      case "TEACHER":
        return <Badge className="bg-blue-500">Teacher</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await axios.patch("/api/users", { id: user.id, status: newStatus });
      toast.success(`User ${newStatus.toLowerCase()} successfully`);
      await mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user? This cannot be undone if there are no dependent records.")) {
      return;
    }

    try {
      await axios.delete(`/api/users?id=${userId}`);
      toast.success("User deleted successfully");
      await mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ height: 400 }}>
        <p className="text-destructive">Failed to load users</p>
        <Button onClick={() => mutate()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage staff members, roles, and access permissions.
          </p>
        </div>
        <AddUserDialog onUserAdded={() => mutate()} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff List</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "outline" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin
                      ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-slot="dropdown-menu-trigger"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
