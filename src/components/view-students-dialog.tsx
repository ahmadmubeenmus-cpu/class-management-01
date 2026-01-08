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

interface ViewStudentsDialogProps {
  classInfo: Course & { students: Student[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewStudentsDialog({ classInfo, open, onOpenChange }: ViewStudentsDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

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
        onOpenChange(false); // Close and refresh would be better
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
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classInfo.students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No students enrolled in this class.</TableCell>
                </TableRow>
              )}
              {classInfo.students.map((student) => (
                <TableRow key={student.id}>
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
