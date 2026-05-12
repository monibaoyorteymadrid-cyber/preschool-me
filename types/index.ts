export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "HOD" | "TEACHER";
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: Date | string | null;
}

export interface Child {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: Date | string;
  photo?: string | null;
  parentName: string;
  parentPhone: string;
  emergencyContact: string;
  medicalNotes?: string | null;
  allergies?: string | null;
  className?: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
  };
  enrollmentStatus?: "ACTIVE" | "INACTIVE";
}

export interface DailyReport {
  id: string;
  childId: string;
  teacherId: string;
  classId: string;
  reportDate: Date | string;
  status: "DRAFT" | "SUBMITTED_TO_HOD" | "RETURNED_BY_HOD" | "APPROVED_BY_HOD" | "SUBMITTED_TO_ADMIN" | "ARCHIVED";
  child: Child;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  class?: {
    name: string;
  };
  hodReviews?: Array<{
    id: string;
    reviewStatus: string;
    hodComment?: string;
    reviewedAt: Date | string;
    hod: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  reportId?: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface Class {
  id: string;
  name: string;
  assignedTeacherId?: string | null;
  hodId?: string | null;
  status: string;
  _count?: {
    children: number;
  };
}
