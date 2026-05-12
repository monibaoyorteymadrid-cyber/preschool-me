"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
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
import { Plus, Search, Users, School, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddClassDialog } from "@/components/dashboard/add-class-dialog";
import { EditClassDialog } from "@/components/dashboard/edit-class-dialog";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AdminClassesPage() {
  const { data: classes, error, mutate, isLoading } = useSWR<any[]>("/api/classes", fetcher);
  const [search, setSearch] = useState("");

  const handleToggleStatus = async (cls: any) => {
    try {
      const nextStatus = cls.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await axios.patch("/api/classes", { id: cls.id, status: nextStatus });
      toast.success(`Class ${nextStatus.toLowerCase()} successfully`);
      await mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update class status");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Delete this class? Only classes with no active assignments can be removed.")) {
      return;
    }

    try {
      await axios.delete(`/api/classes?id=${classId}`);
      toast.success("Class deleted successfully");
      await mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete class");
    }
  };

  const filteredClasses = (classes || []).filter((cls) =>
    `${cls.name} ${cls.assignedTeacher?.firstName ?? ""} ${cls.assignedTeacher?.lastName ?? ""} ${cls.hod?.firstName ?? ""} ${cls.hod?.lastName ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <span className="text-primary">Loading classes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ height: 400 }}>
        <p className="text-destructive">Failed to load classes</p>
        <Button onClick={() => mutate()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-muted-foreground">
            Create classes and assign teachers and HODs.
          </p>
        </div>
        <AddClassDialog onClassAdded={() => mutate()} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Classes</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
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
                <TableHead>Class Name</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>HOD</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name?.replace("_", " ")}</TableCell>
                    <TableCell>
                      {cls.assignedTeacher ? `${cls.assignedTeacher.firstName} ${cls.assignedTeacher.lastName}` : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      {cls.hod ? `${cls.hod.firstName} ${cls.hod.lastName}` : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {cls._count?.children ?? 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.status === "ACTIVE" ? "outline" : "secondary"}>
                        {cls.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <EditClassDialog classData={cls} onClassUpdated={() => mutate()} />
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(cls)}>
                        {cls.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No classes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
