import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'admin' | 'user';
  profilePictureUrl?: string;
  username?: string;
  permissions?: {
    canMarkAttendance?: boolean;
    canViewRecords?: boolean;
    canViewDashboard?: boolean;
  };
}

export interface Student {
  id: string;
  uid: string; // Unique, random login ID
  password?: string; // Should be handled securely
  firstName: string;
  lastName: string;
  email: string;
}

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  description: string;
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id: string;
  studentId: string; // The Firestore document ID of the student
  studentUid: string; // The student's unique login ID
  courseId: string;
  date: Timestamp;
  status: AttendanceStatus;
  markedBy: string;
}
