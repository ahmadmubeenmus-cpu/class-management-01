'use client';
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AddClassDialog } from './add-class-dialog';
import { AttendanceSheet } from './attendance-sheet';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Course, Student } from '@/lib/types';
import { ViewStudentsDialog } from './view-students-dialog';
import { AddStudentDialog } from './add-student-dialog';
import { EnrollStudentDialog } from './enroll-student-dialog';

interface CourseWithStudents extends Course {
  students: Student[];
}

export function ClassesTab() {
  const firestore = useFirestore();
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const [selectedClass, setSelectedClass] = useState<CourseWithStudents | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEnrollStudentDialogOpen, setIsEnrollStudentDialogOpen] = useState(false);

  const fetchEnrolledStudents = async (courseId: string): Promise<Student[]> => {
    if (!firestore) return [];
  
    const studentsRef = collection(firestore, `courses/${courseId}/students`);
    const studentEnrollments = await getDocs(studentsRef);
    const studentIds = studentEnrollments.docs.map(d => d.id);
  
    if (studentIds.length === 0) {
      return [];
    }
  
    const allStudents: Student[] = [];
    // Firestore 'in' query is limited to 30 items, so we need to batch the requests
    for (let i = 0; i < studentIds.length; i += 30) {
      const chunk = studentIds.slice(i, i + 30);
      if (chunk.length > 0) {
        const studentDocsQuery = query(collection(firestore, 'students'), where('id', 'in', chunk));
        const studentDocsSnapshot = await getDocs(studentDocsQuery);
        const studentsList: Student[] = studentDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        allStudents.push(...studentsList);
      }
    }
    
    allStudents.sort((a, b) => (a.studentId || "").localeCompare(b.studentId || ""));
  
    return allStudents;
  }

  const handleMarkAttendance = async (classItem: Course) => {
    const studentsList = await fetchEnrolledStudents(classItem.id);
    setSelectedClass({ ...classItem, students: studentsList });
    setIsSheetOpen(true);
  };
  
  const handleCloseAttendanceSheet = () => {
    setIsSheetOpen(false);
    setSelectedClass(null);
  }

  const handleViewStudents = async (classItem: Course) => {
    const studentsList = await fetchEnrolledStudents(classItem.id);
    setSelectedClass({ ...classItem, students: studentsList });
    setIsStudentsDialogOpen(true);
  }
  
  const handleCloseViewStudents = () => {
    setIsStudentsDialogOpen(false);
    setSelectedClass(null);
  }

  const handleAddStudent = (classItem: Course) => {
    setSelectedClass({ ...classItem, students: [] }); // students array is empty as it's not needed here
    setIsAddStudentDialogOpen(true);
  }

  const handleCloseAddStudent = () => {
    setIsAddStudentDialogOpen(false);
    setSelectedClass(null);
  }


  const handleEnrollStudent = async (classItem: Course) => {
    const studentsList = await fetchEnrolledStudents(classItem.id);
    setSelectedClass({ ...classItem, students: studentsList });
    setIsEnrollStudentDialogOpen(true);
  }
  
  const handleCloseEnrollStudent = () => {
    setIsEnrollStudentDialogOpen(false);
    setSelectedClass(null);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 mt-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Classes</h2>
            <p className="text-muted-foreground">Here's a list of your classes for this semester.</p>
        </div>
        <div className="flex items-center gap-2">
          <AddClassDialog />
        </div>
      </div>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">SR#</TableHead>
                <TableHead>Class Name</TableHead>
                <TableHead className="hidden md:table-cell">Course Code</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesLoading && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
              {!coursesLoading && courses?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No classes found. Add a class to get started.</TableCell></TableRow>}
              {courses?.map((classItem, index) => (
                <TableRow key={classItem.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{classItem.courseName}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{classItem.courseCode}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{classItem.courseCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                    <Button size="sm" onClick={() => handleMarkAttendance(classItem)}>Mark Attendance</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAddStudent(classItem)}>Add New Student</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEnrollStudent(classItem)}>Enroll Existing Student</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStudents(classItem)}>View Enrolled Students</DropdownMenuItem>
                        <DropdownMenuItem>Edit Class</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Class</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedClass && isSheetOpen && (
        <AttendanceSheet 
            classInfo={selectedClass} 
            open={isSheetOpen}
            onOpenChange={handleCloseAttendanceSheet}
        />
      )}
       {selectedClass && isStudentsDialogOpen && (
        <ViewStudentsDialog
            classInfo={selectedClass}
            open={isStudentsDialogOpen}
            onOpenChange={handleCloseViewStudents}
        />
      )}
      {selectedClass && isAddStudentDialogOpen && (
        <AddStudentDialog
            open={isAddStudentDialogOpen}
            onOpenChange={handleCloseAddStudent}
            courseId={selectedClass.id}
        />
      )}
      {selectedClass && isEnrollStudentDialogOpen && (
        <EnrollStudentDialog
            open={isEnrollStudentDialogOpen}
            onOpenChange={handleCloseEnrollStudent}
            course={selectedClass}
        />
      )}
    </>
  );
}
