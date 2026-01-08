
'use client';

import { useState, useEffect } from 'react';
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
import { collection, doc, getDocs } from 'firebase/firestore';

interface EnrollStudentDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollStudentDialog({ course, open, onOpenChange }: EnrollStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const allStudentsQuery = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const { data: allStudents, isLoading: studentsLoading } = useCollection<Student>(allStudentsQuery);
  
  const [unenrolledStudents, setUnenrolledStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!open || !allStudents || !firestore) return;

    const getEnrolledStudentIds = async () => {
        const enrollmentRef = collection(firestore, `courses/${course.id}/students`);
        const enrollmentSnapshot = await getDocs(enrollmentRef);
        return enrollmentSnapshot.docs.map(d => d.id);
    };

    getEnrolledStudentIds().then(enrolledIds => {
        const unenrolled = allStudents.filter(student => !enrolledIds.includes(student.id));
        setUnenrolledStudents(unenrolled);
    });

  }, [open, allStudents, course.id, firestore]);

  const handleEnrollStudent = async (studentId: string) => {
    if (!firestore) return;

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
        // Refresh the list of unenrolled students
        setUnenrolledStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to enroll student in the class.",
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
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading && (
                 <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading students...</TableCell>
                </TableRow>
              )}
              {!studentsLoading && unenrolledStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">All students are enrolled in this class.</TableCell>
                </TableRow>
              )}
              {unenrolledStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleEnrollStudent(student.id)}
                    >
                      Enroll
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
