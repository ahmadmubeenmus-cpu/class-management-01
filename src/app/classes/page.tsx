'use client';
import { useState } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
import { AddClassDialog } from '@/components/add-class-dialog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import type { Course, Student } from '@/lib/types';
import { ViewStudentsDialog } from '@/components/view-students-dialog';
import { AddStudentDialog } from '@/components/add-student-dialog';
import { EnrollStudentDialog } from '@/components/enroll-student-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseWithStudents extends Course {
  students: Student[];
}

export default function ClassesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading, error } = useCollection<Course>(coursesQuery);

  const [selectedClass, setSelectedClass] = useState<CourseWithStudents | null>(null);
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
    for (let i = 0; i < studentIds.length; i += 30) {
      const chunk = studentIds.slice(i, i + 30);
      if (chunk.length > 0) {
        const studentDocsQuery = query(collection(firestore, 'students'), where('id', 'in', chunk));
        const studentDocsSnapshot = await getDocs(studentDocsQuery);
        const studentsList: Student[] = studentDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        allStudents.push(...studentsList);
      }
    }
    
    allStudents.sort((a, b) => (a.uid || "").localeCompare(b.uid || ""));
  
    return allStudents;
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
    setSelectedClass({ ...classItem, students: [] });
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
  
  const handleDeleteClass = async (courseId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, "courses", courseId));
        toast({
            title: "Class Deleted",
            description: "The class has been successfully deleted.",
            className: 'bg-accent text-accent-foreground'
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete class.",
        });
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
            <p className="text-muted-foreground">Here's a list of your classes for this semester.</p>
        </div>
        <div className="flex items-center gap-2">
            <AddClassDialog>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Class
                    </span>
                </Button>
            </AddClassDialog>
        </div>
      </div>
      <Card>
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
              {coursesLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><div className="flex items-center justify-end gap-2"><Skeleton className="h-8 w-32" /><Skeleton className="h-8 w-8" /></div></TableCell>
                </TableRow>
              ))}
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
                    <Link href={`/attendance?courseId=${classItem.id}`} passHref>
                        <Button size="sm">Mark Attendance</Button>
                    </Link>
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
                        <DropdownMenuItem disabled>Edit Class</DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete Class</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the class and all its associated data, including enrollment and attendance records.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteClass(classItem.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
    </main>
  );
}
