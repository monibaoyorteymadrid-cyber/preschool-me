"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Plus, Search, MoreHorizontal, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { Child, Class } from "@/types";
import { AddChildDialog } from "@/components/dashboard/add-child-dialog";
import { toast } from "sonner";

const editChildSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  parentName: z.string().min(2, "Parent/guardian name is required"),
  parentPhone: z.string().min(5, "Parent phone is required"),
  emergencyContact: z.string().min(5, "Emergency contact is required"),
  medicalNotes: z.string().optional(),
  allergies: z.string().optional(),
});

type EditChildFormValues = z.infer<typeof editChildSchema>;

const moveClassSchema = z.object({
  classId: z.string().min(1, "Class assignment is required"),
});

type MoveClassFormValues = z.infer<typeof moveClassSchema>;

export default function AdminChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activeAction, setActiveAction] = useState<"view" | "edit" | "move" | null>(null);

  const editForm = useForm<EditChildFormValues>({
    resolver: zodResolver(editChildSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "MALE",
      dateOfBirth: "",
      parentName: "",
      parentPhone: "",
      emergencyContact: "",
      medicalNotes: "",
      allergies: "",
    },
  });

  const moveForm = useForm<MoveClassFormValues>({
    resolver: zodResolver(moveClassSchema),
    defaultValues: { classId: "" },
  });

  const fetchClasses = async () => {
    try {
      const response = await axios.get<Class[]>("/api/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
      toast.error("Unable to load classes");
    }
  };

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Child[]>("/api/children");
      setChildren(response.data);
    } catch (error) {
      console.error("Failed to fetch children", error);
      toast.error("Failed to load children");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedChild) {
      return;
    }

    if (activeAction === "edit") {
      editForm.reset({
        firstName: selectedChild.firstName,
        lastName: selectedChild.lastName,
        gender: selectedChild.gender as "MALE" | "FEMALE" | "OTHER",
        dateOfBirth: selectedChild.dateOfBirth
          ? new Date(selectedChild.dateOfBirth).toISOString().slice(0, 10)
          : "",
        parentName: selectedChild.parentName,
        parentPhone: selectedChild.parentPhone,
        emergencyContact: selectedChild.emergencyContact,
        medicalNotes: selectedChild.medicalNotes || "",
        allergies: selectedChild.allergies || "",
      });
    }

    if (activeAction === "move") {
      moveForm.reset({ classId: selectedChild.classId || "" });
    }
  }, [selectedChild, activeAction, editForm, moveForm]);

  const openAction = (action: "view" | "edit" | "move", child: Child) => {
    setSelectedChild(child);
    setActiveAction(action);
  };

  const closeDialog = () => {
    setActiveAction(null);
    setSelectedChild(null);
  };

  const handleWithdraw = async (child: Child) => {
    if (!window.confirm(`Withdraw ${child.firstName} ${child.lastName} from the school?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.patch("/api/children", {
        id: child.id,
        enrollmentStatus: "INACTIVE",
      });
      toast.success("Child withdrawn successfully");
      await fetchChildren();
    } catch (error) {
      console.error("Withdraw failed", error);
      toast.error("Failed to withdraw child");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (child: Child) => {
    if (!window.confirm(`Delete ${child.firstName} ${child.lastName} permanently? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.delete(`/api/children?id=${child.id}`);
      toast.success("Child record deleted successfully");
      await fetchChildren();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete child");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (values: EditChildFormValues) => {
    if (!selectedChild) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.patch("/api/children", {
        id: selectedChild.id,
        ...values,
      });
      toast.success("Child details updated");
      await fetchChildren();
      closeDialog();
    } catch (error) {
      console.error("Edit child failed", error);
      toast.error("Failed to update child");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveSubmit = async (values: MoveClassFormValues) => {
    if (!selectedChild) {
      return;
    }

    setActionLoading(true);
    try {
      await axios.patch("/api/children", {
        id: selectedChild.id,
        classId: values.classId,
      });
      toast.success("Child moved successfully");
      await fetchChildren();
      closeDialog();
    } catch (error) {
      console.error("Move class failed", error);
      toast.error("Failed to move child");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredChildren = children.filter((child) =>
    `${child.firstName} ${child.lastName} ${child.admissionNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 400 }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Children Directory</h1>
            <p className="text-muted-foreground">
              Manage student records, enrollment, and class assignments.
            </p>
          </div>
          <AddChildDialog onChildAdded={fetchChildren} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Students</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Adm Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChildren.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {child.firstName[0]}
                            {child.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {child.firstName} {child.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{child.admissionNumber}</TableCell>
                    <TableCell>{child.class?.name?.replace("_", " ") || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={child.enrollmentStatus === "INACTIVE" ? "destructive" : "secondary"}>
                        {child.enrollmentStatus || "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell>{child.parentName}</TableCell>
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
                          <DropdownMenuItem onClick={() => openAction("view", child)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction("edit", child)}>
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction("move", child)}>
                            Move Class
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleWithdraw(child)}
                            disabled={child.enrollmentStatus === "INACTIVE"}
                          >
                            Withdraw
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(child)}
                          >
                            Delete Record
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

      <Dialog open={!!activeAction} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>
              {activeAction === "view" && "Child Profile"}
              {activeAction === "edit" && "Edit Child Details"}
              {activeAction === "move" && "Move Child to a New Class"}
            </DialogTitle>
            <DialogDescription>
              {activeAction === "view" && "Review the selected student's profile and enrollment details."}
              {activeAction === "edit" && "Update the child's information."}
              {activeAction === "move" && "Assign the child to a different class."}
            </DialogDescription>
          </DialogHeader>

          {activeAction === "view" && selectedChild && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedChild.firstName} {selectedChild.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission No.</p>
                  <p className="font-medium">{selectedChild.admissionNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{selectedChild.class?.name?.replace("_", " ") || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedChild.enrollmentStatus || "ACTIVE"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{selectedChild.dateOfBirth ? new Date(selectedChild.dateOfBirth).toLocaleDateString() : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedChild.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent/Guardian</p>
                <p className="font-medium">{selectedChild.parentName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parent Phone</p>
                  <p className="font-medium">{selectedChild.parentPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">{selectedChild.emergencyContact}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medical Notes</p>
                <p className="font-medium">{selectedChild.medicalNotes || "None"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allergies</p>
                <p className="font-medium">{selectedChild.allergies || "None"}</p>
              </div>
              <DialogFooter>
                <Button type="button" onClick={closeDialog} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}

          {activeAction === "edit" && selectedChild && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="medicalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={actionLoading} className="w-full">
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {activeAction === "move" && selectedChild && (
            <Form {...moveForm}>
              <form onSubmit={moveForm.handleSubmit(handleMoveSubmit)} className="space-y-4">
                <FormField
                  control={moveForm.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose Class</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={actionLoading} className="w-full">
                    {actionLoading ? "Updating..." : "Move Child"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
