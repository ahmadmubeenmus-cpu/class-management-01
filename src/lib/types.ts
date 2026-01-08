export type Student = {
  id: string;
  name: string;
  studentId: string;
};

export type Class = {
  id: string;
  name: string;
  courseCode: string;
  schedule: string;
  location: string;
  students: Student[];
};

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AttendanceRecord = {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
};

export type ClassAttendance = {
  classId: string;
  records: AttendanceRecord[];
};
