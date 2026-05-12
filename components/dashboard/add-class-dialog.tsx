"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { User } from "@/types";

const classSchema = z.object({
  name: z.string().min(3, "Class name is required"),
  assignedTeacherId: z.string().optional(),
  hodId: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface AddClassDialogProps {
  onClassAdded: () => void;
}

export function AddClassDialog({ onClassAdded }: AddClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      assignedTeacherId: "",
      hodId: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadUsers = async () => {
      try {
        const response = await axios.get<User[]>('/api/users');
        setUsers(response.data);
      } catch {
        toast.error('Failed to load staff for class assignment');
      }
    };

    loadUsers();
  }, [open]);

  const onSubmit = async (values: ClassFormValues) => {
    setLoading(true);
    try {
      await axios.post('/api/classes', {
        ...values,
        status: 'ACTIVE',
      });
      toast.success('Class created successfully');
      form.reset();
      setOpen(false);
      onClassAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const teachers = users.filter((user) => user.role === 'TEACHER');
  const hods = users.filter((user) => user.role === 'HOD');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create New Class
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <DialogDescription>
            Define a new class and optionally assign a teacher and HOD.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Foundation 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTeacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Teacher</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of Department</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select HOD" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hods.map((hod) => (
                        <SelectItem key={hod.id} value={hod.id}>
                          {hod.firstName} {hod.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Class
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
