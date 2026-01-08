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
import { BulkUploadDialog } from './bulk-upload-dialog';
import { AttendanceSheet } from './attendance-sheet';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Course, Student } from '@/lib/types';


interface CourseWithStudents extends Course {
  students: Student[];
}


export function ClassesTab() {
  const firestore = useFirestore();
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const [selectedClass, setSelectedClass] = useState<CourseWithStudents | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleMarkAttendance = async (classItem: Course) => {
    if (!firestore) return;
    
    // Fetch all students for now.
    // In a real app, you'd fetch students enrolled in the specific class.
    const studentsCollection = collection(firestore, 'students');
    const studentsSnapshot = await getDocs(studentsCollection);
    const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    
    const classWithStudents: CourseWithStudents = { ...classItem, students: studentsList };
    setSelectedClass(classWithStudents);
    setIsSheetOpen(true);
  };
  
  return (
    <>
      <div className="flex items-center justify-between gap-2 mt-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Classes</h2>
            <p className="text-muted-foreground">Here's a list of your classes for this semester.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUploadDialog />
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
                <TableHead className="hidden md:table-cell">Students</TableHead>
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
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">_ Students</Badge>
                  </TableCell>
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
                        <DropdownMenuItem>View Students</DropdownMenuItem>
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
    </>
  );
}
