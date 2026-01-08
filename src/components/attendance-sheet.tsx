'use client';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { Student, AttendanceStatus, Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';


interface AttendanceSheetProps {
  classInfo: Course & { students: Student[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StudentAttendanceState = Record<string, AttendanceStatus>;

export function AttendanceSheet({ classInfo, open, onOpenChange }: AttendanceSheetProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [attendance, setAttendance] = useState<StudentAttendanceState>(() => {
    const initialState: StudentAttendanceState = {};
    classInfo.students.forEach(student => {
      initialState[student.id] = 'present';
    });
    return initialState;
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newState: StudentAttendanceState = {};
    classInfo.students.forEach(student => {
        newState[student.id] = status;
    });
    setAttendance(newState);
  };
  
  const handleSave = async () => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not connect to the database.",
        });
        return;
    }

    try {
        const batch = writeBatch(firestore);
        const attendanceCollectionRef = collection(firestore, `courses/${classInfo.id}/attendance_records`);

        Object.entries(attendance).forEach(([studentId, status]) => {
            const newRecordRef = doc(attendanceCollectionRef); // Auto-generates an ID
            batch.set(newRecordRef, {
                id: newRecordRef.id,
                studentId: studentId,
                courseId: classInfo.id,
                date: Timestamp.now(),
                status: status,
                markedBy: "admin", // Placeholder for user who marked attendance
            });
        });

        await batch.commit();
        
        toast({
          title: 'Attendance Saved',
          description: `Attendance for ${classInfo.courseName} has been recorded.`,
          className: 'bg-accent text-accent-foreground',
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Error saving attendance: ", error);
        toast({
            variant: "destructive",
            title: 'Save Failed',
            description: 'An error occurred while saving attendance records.',
        });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <SheetHeader>
          <SheetTitle>Mark Attendance: {classInfo.courseName}</SheetTitle>
          <SheetDescription>
            For {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
            Select the status for each student.
          </SheetDescription>
        </SheetHeader>
        <div className="my-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll('present')}>Mark All Present</Button>
            <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Mark All Absent</Button>
        </div>
        <div className="overflow-y-auto" style={{maxHeight: 'calc(100vh - 250px)'}}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">SR#</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead className='text-center'>Present</TableHead>
              <TableHead className='text-center'>Absent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classInfo.students.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{student.firstName} {student.lastName}</div>
                  <div className="text-sm text-muted-foreground">{student.email}</div>
                </TableCell>
                <TableCell>{student.studentId}</TableCell>
                <RadioGroup 
                    defaultValue="present" 
                    className="contents"
                    onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                    value={attendance[student.id]}
                >
                    <TableCell className="text-center">
                        <RadioGroupItem value="present" id={`${student.id}-present`} />
                    </TableCell>
                    <TableCell className="text-center">
                        <RadioGroupItem value="absent" id={`${student.id}-absent`} />
                    </TableCell>
                </RadioGroup>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        <SheetFooter className='mt-4'>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Attendance</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
