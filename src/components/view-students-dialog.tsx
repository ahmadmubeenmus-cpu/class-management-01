'use client';

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
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useState } from 'react';

interface ViewStudentsDialogProps {
  classInfo: Course & { students: Student[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewStudentsDialog({ classInfo, open, onOpenChange }: ViewStudentsDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [students, setStudents] = useState(classInfo.students);

  const handleRemoveStudent = async (studentId: string) => {
    if (!firestore) return;

    const studentEnrollmentRef = doc(firestore, `courses/${classInfo.id}/students/${studentId}`);
    
    try {
        await deleteDocumentNonBlocking(studentEnrollmentRef);
        toast({
            title: 'Student Removed',
            description: 'The student has been unenrolled from this class.',
            className: 'bg-accent text-accent-foreground',
        });
        setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to remove student from the class.",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Students in {classInfo.courseName}</DialogTitle>
          <DialogDescription>
            View and manage students enrolled in this class.
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
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No students enrolled in this class.</TableCell>
                </TableRow>
              )}
              {students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveStudent(student.id)}
                    >
                      Remove
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
