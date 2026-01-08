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
  studentId: string;
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
  studentId: string;
  courseId: string;
  date: Timestamp;
  status: AttendanceStatus;
  markedBy: string;
}

    