'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Student, Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface EnrollStudentDialogProps {
  course: Course & { students: Student[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollStudentDialog({ course, open, onOpenChange }: EnrollStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const allStudentsQuery = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const { data: allStudents, isLoading: studentsLoading } = useCollection<Student>(allStudentsQuery);
  
  const [unenrolledStudents, setUnenrolledStudents] = useState<Student[]>([]);
  const [enrollingStudentId, setEnrollingStudentId] = useState<string | null>(null);

  const enrolledStudentIds = useMemo(() => new Set(course.students.map(s => s.id)), [course.students]);

  useEffect(() => {
    if (!open || !allStudents) {
      setUnenrolledStudents([]);
      return;
    }
  
    // Filter out already enrolled students
    const unenrolled = allStudents.filter(student => !enrolledStudentIds.has(student.id));
    
    // Sort the filtered list
    unenrolled.sort((a, b) => (a.rollNo || "").localeCompare(b.rollNo || ""));
    
    setUnenrolledStudents(unenrolled);
  
  }, [open, allStudents, enrolledStudentIds]);
  

  const handleEnrollStudent = async (studentId: string) => {
    if (!firestore) return;
    setEnrollingStudentId(studentId);

    const studentEnrollmentRef = doc(firestore, `courses/${course.id}/students/${studentId}`);
    
    try {
        await setDocumentNonBlocking(studentEnrollmentRef, {
            studentId,
            courseId: course.id,
        }, {});
        toast({
            title: 'Student Enrolled',
            description: 'The student has been successfully enrolled in this class.',
            className: 'bg-accent text-accent-foreground',
        });
        // Refresh the list of unenrolled students by removing the one just enrolled
        setUnenrolledStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to enroll student in the class.",
        });
    } finally {
        setEnrollingStudentId(null);
    }
  };

  const handleEnrollAll = async () => {
    if (!firestore || unenrolledStudents.length === 0) return;

    const batch = writeBatch(firestore);
    
    unenrolledStudents.forEach(student => {
        const studentEnrollmentRef = doc(firestore, `courses/${course.id}/students/${student.id}`);
        batch.set(studentEnrollmentRef, {
            studentId: student.id,
            courseId: course.id,
        });
    });

    try {
        await batch.commit();
        toast({
            title: 'All Students Enrolled',
            description: `${unenrolledStudents.length} students have been enrolled.`,
            className: 'bg-accent text-accent-foreground',
        });
        onOpenChange(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Enrollment Failed",
            description: "Failed to enroll all students.",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enroll Students in {course.courseName}</DialogTitle>
          <DialogDescription>
            Select students from the list below to enroll them in this class.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">SR#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading && (
                 Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={4}>
                            <Skeleton className='h-8 w-full' />
                        </TableCell>
                    </TableRow>
                 ))
              )}
              {!studentsLoading && unenrolledStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">All students are already enrolled in this class.</TableCell>
                </TableRow>
              )}
              {unenrolledStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.rollNo}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleEnrollStudent(student.id)}
                      disabled={enrollingStudentId === student.id}
                    >
                      {enrollingStudentId === student.id ? 'Enrolling...' : 'Enroll'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="justify-between sm:justify-between">
          <div>
            {unenrolledStudents.length > 0 &&
                <Button onClick={handleEnrollAll}>Enroll All</Button>
            }
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
