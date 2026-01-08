'use client';
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import type { Course, Student } from '@/lib/types';
import { ViewStudentsDialog } from './view-students-dialog';
import { AddStudentDialog } from './add-student-dialog';


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


  const handleMarkAttendance = async (classItem: Course) => {
    if (!firestore) return;
    
    const studentsRef = collection(firestore, `courses/${classItem.id}/students`);
    const studentEnrollments = await getDocs(studentsRef);
    const studentIds = studentEnrollments.docs.map(d => d.id);

    if (studentIds.length === 0) {
      const classWithStudents: CourseWithStudents = { ...classItem, students: [] };
      setSelectedClass(classWithStudents);
      setIsSheetOpen(true);
      return;
    }

    const studentsList: Student[] = [];
    // Firestore 'in' query is limited to 30 elements.
    // If more students, we'd need to batch this.
    const studentDocsQuery = query(collection(firestore, 'students'), where('id', 'in', studentIds));
    const studentDocsSnapshot = await getDocs(studentDocsQuery);
    
    studentDocsSnapshot.forEach(doc => {
        studentsList.push({ id: doc.id, ...doc.data() } as Student);
    });
    
    studentsList.sort((a, b) => {
      const idA = parseInt(a.studentId.replace(/[^0-9]/g, ''), 10) || 0;
      const idB = parseInt(b.studentId.replace(/[^0-9]/g, ''), 10) || 0;
      return idA - idB;
    });

    const classWithStudents: CourseWithStudents = { ...classItem, students: studentsList };
    setSelectedClass(classWithStudents);
    setIsSheetOpen(true);
  };

  const handleViewStudents = async (classItem: Course) => {
    await handleMarkAttendance(classItem); // re-uses the same student fetching logic
    setIsStudentsDialogOpen(true);
  }

  const handleAddStudent = (classItem: Course) => {
    setSelectedClass({ ...classItem, students: [] });
    setIsAddStudentDialogOpen(true);
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
                <TableHead>Class Name</TableHead>
                <TableHead className="hidden md:table-cell">Course Code</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesLoading && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
              {courses?.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div className="font-medium">{classItem.courseName}</div>
                    <div className="text-sm text-muted-foreground">{classItem.courseCode}</div>
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
                        <DropdownMenuItem onClick={() => handleAddStudent(classItem)}>Add Student</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStudents(classItem)}>View Students</DropdownMenuItem>
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
      {selectedClass && (
        <AttendanceSheet 
            classInfo={selectedClass} 
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
        />
      )}
       {selectedClass && (
        <ViewStudentsDialog
            classInfo={selectedClass}
            open={isStudentsDialogOpen}
            onOpenChange={setIsStudentsDialogOpen}
        />
      )}
      {selectedClass && (
        <AddStudentDialog
            open={isAddStudentDialogOpen}
            onOpenChange={setIsAddStudentDialogOpen}
            courseId={selectedClass.id}
        />
      )}
    </>
  );
}
