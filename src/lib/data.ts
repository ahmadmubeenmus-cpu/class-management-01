import type { Student, Class, ClassAttendance } from './types';

export const students: Student[] = [
  { id: '1', name: 'Alice Johnson', studentId: 'S001' },
  { id: '2', name: 'Bob Williams', studentId: 'S002' },
  { id: '3', name: 'Charlie Brown', studentId: 'S003' },
  { id: '4', name: 'Diana Miller', studentId: 'S004' },
  { id: '5', name: 'Ethan Davis', studentId: 'S005' },
  { id: '6', name: 'Fiona Garcia', studentId: 'S006' },
  { id: '7', name: 'George Rodriguez', studentId: 'S007' },
  { id: '8', name: 'Hannah Martinez', studentId: 'S008' },
  { id: '9', name: 'Ian Hernandez', studentId: 'S009' },
  { id: '10', name: 'Jane Lopez', studentId: 'S010' },
];

export const classes: Class[] = [
  {
    id: 'C101',
    name: 'Introduction to Computer Science',
    courseCode: 'CS101',
    schedule: 'Mon, Wed 10:00 - 11:30',
    location: 'Building A, Room 101',
    students: students.slice(0, 5),
  },
  {
    id: 'M202',
    name: 'Calculus II',
    courseCode: 'MATH202',
    schedule: 'Tue, Thu 13:00 - 14:30',
    location: 'Building B, Room 203',
    students: students.slice(5, 10),
  },
  {
    id: 'P301',
    name: 'Physics for Engineers',
    courseCode: 'PHY301',
    schedule: 'Fri 09:00 - 12:00',
    location: 'Science Hall, Lab 3',
    students: students,
  },
];

export const attendance: ClassAttendance[] = [
  {
    classId: 'C101',
    records: [
      { studentId: 'S001', date: '2024-05-01', status: 'present' },
      { studentId: 'S002', date: '2024-05-01', status: 'present' },
      { studentId: 'S003', date: '2024-05-01', status: 'absent' },
      { studentId: 'S004', date: '2024-05-01', status: 'present' },
      { studentId: 'S005', date: '2024-05-01', status: 'late' },
      { studentId: 'S001', date: '2024-05-03', status: 'present' },
      { studentId: 'S002', date: '2024-05-03', status: 'absent' },
      { studentId: 'S003', date: '2024-05-03', status: 'present' },
      { studentId: 'S004', date: '2024-05-03', status: 'present' },
      { studentId: 'S005', date: '2024-05-03', status: 'present' },
    ],
  },
  {
    classId: 'M202',
    records: [
      { studentId: 'S006', date: '2024-05-02', status: 'present' },
      { studentId: 'S007', date: '2024-05-02', status: 'present' },
      { studentId: 'S008', date: '2024-05-02', status: 'present' },
      { studentId: 'S009', date: '2024-05-02', status: 'excused' },
      { studentId: 'S010', date: '2024-05-02', status: 'absent' },
    ],
  },
];
