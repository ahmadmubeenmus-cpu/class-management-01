'use client';
import { useState, useMemo } from 'react';
import { MoreHorizontal, PlusCircle, Sparkles } from 'lucide-react';
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
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { AddStudentDialog } from '@/components/add-student-dialog';
import { useToast } from '@/hooks/use-toast';
import { EditStudentDialog } from '@/components/edit-student-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export default function StudentsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const studentsQuery = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const { data: students, isLoading: studentsLoading, error } = useCollection<Student>(studentsQuery);
  
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sortedStudents = useMemo(() => {
    if (!students) return [];
    return [...students].sort((a, b) => (a.uid || "").localeCompare(b.uid || ""));
  }, [students]);

  const studentsWithoutCredentials = useMemo(() => {
    return sortedStudents.filter(s => !s.uid || !s.password);
  }, [sortedStudents]);

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditStudentDialogOpen(true);
  };
  
  const handleCloseEditStudent = () => {
    setIsEditStudentDialogOpen(false);
    setSelectedStudent(null);
  };
  
  const handleDeleteStudent = (studentId: string) => {
    if(!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'students', studentId));
    toast({
        title: 'Student Deleted',
        description: 'The student has been removed from the system.',
        className: 'bg-accent text-accent-foreground'
    });
  }

  const handleGenerateCredentials = async () => {
    if (!firestore || studentsWithoutCredentials.length === 0) return;
    setIsGenerating(true);

    const batch = writeBatch(firestore);

    studentsWithoutCredentials.forEach(student => {
        const studentRef = doc(firestore, 'students', student.id);
        const uid = generateRandomString(8);
        const password = generateRandomString(12);
        batch.update(studentRef, { uid, password });
    });

    try {
        await batch.commit();
        toast({
            title: "Credentials Generated",
            description: `Generated credentials for ${studentsWithoutCredentials.length} students.`,
            className: 'bg-accent text-accent-foreground'
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to generate credentials for existing students.",
        });
    } finally {
        setIsGenerating(false);
    }
  }


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">Manage all students in the system.</p>
        </div>
        <div className="flex items-center gap-2">
            {studentsWithoutCredentials.length > 0 && (
                <Button size="sm" className="h-8 gap-1" onClick={handleGenerateCredentials} disabled={isGenerating}>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                       {isGenerating ? 'Generating...' : `Generate Credentials (${studentsWithoutCredentials.length})`}
                    </span>
                </Button>
            )}
            <AddStudentDialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                 <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Student
                    </span>
                </Button>
            </AddStudentDialog>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">SR#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="hidden md:table-cell">Student UID</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8" /></div></TableCell>
                </TableRow>
              ))}
              {!studentsLoading && sortedStudents?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No students found. Add a student to get started.</TableCell></TableRow>}
              {sortedStudents?.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.firstName} {student.lastName}</div>
                     <div className="text-sm text-muted-foreground lg:hidden">{student.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono">{student.uid}</TableCell>
                  <TableCell className="hidden lg:table-cell">{student.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>Edit Student</DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete Student</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the student and remove them from all classes and attendance records.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>Delete</AlertDialogAction>
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

      {selectedStudent && (
        <EditStudentDialog 
            open={isEditStudentDialogOpen}
            onOpenChange={handleCloseEditStudent}
            student={selectedStudent}
        />
      )}
    </main>
  );
}
