
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
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

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
        unenrolled.sort((a, b) => (a.studentId || "").localeCompare(b.studentId || ""));
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
                 <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading students...</TableCell>
                </TableRow>
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
        <DialogFooter className="justify-between">
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
