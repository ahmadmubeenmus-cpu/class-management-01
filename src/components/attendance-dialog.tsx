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
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { Student, AttendanceStatus, Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { Input } from './ui/input';
import { Label } from './ui/label';


interface AttendanceDialogProps {
  classInfo: Course & { students: Student[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StudentAttendanceState = Record<string, AttendanceStatus>;

export function AttendanceDialog({ classInfo, open, onOpenChange }: AttendanceDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [attendance, setAttendance] = useState<StudentAttendanceState>(() => {
    const initialState: StudentAttendanceState = {};
    classInfo.students.forEach(student => {
      initialState[student.id] = 'present';
    });
    return initialState;
  });
  const [attendanceDate, setAttendanceDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setAttendanceDate(format(new Date(), 'yyyy-MM-dd'));
      const initialState: StudentAttendanceState = {};
      classInfo.students.forEach(student => {
        initialState[student.id] = 'present';
      });
      setAttendance(initialState);
    }
  }, [open, classInfo.students]);

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
    
    if (!attendanceDate) {
        toast({
            variant: "destructive",
            title: "No Date Selected",
            description: "Please select a date for the attendance.",
        });
        return;
    }

    const parsedDate = parseISO(attendanceDate);

    try {
        const batch = writeBatch(firestore);
        const attendanceCollectionRef = collection(firestore, `courses/${classInfo.id}/attendance_records`);

        Object.entries(attendance).forEach(([studentId, status]) => {
            const newRecordRef = doc(attendanceCollectionRef); // Auto-generates an ID
            batch.set(newRecordRef, {
                id: newRecordRef.id,
                studentId: studentId,
                courseId: classInfo.id,
                date: Timestamp.fromDate(parsedDate),
                status: status,
                markedBy: "admin", // Placeholder for user who marked attendance
            });
        });

        await batch.commit();
        
        toast({
          title: 'Attendance Saved',
          description: `Attendance for ${classInfo.courseName} on ${format(parsedDate, 'PPP')} has been recorded.`,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl w-full'>
        <DialogHeader>
          <DialogTitle>Mark Attendance: {classInfo.courseName}</DialogTitle>
          <DialogDescription>
            Enter the date and mark the status for each student.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 my-4" style={{gridTemplateColumns: '1fr'}}>
            <div className='flex items-center gap-4'>
                <div className='grid gap-1.5'>
                    <Label htmlFor="attendance-date">Attendance Date</Label>
                    <Input 
                        id="attendance-date"
                        type="date" 
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-[240px]"
                    />
                </div>
                <div className='flex self-end gap-2'>
                    <Button variant="outline" size="sm" onClick={() => markAll('present')}>Mark All Present</Button>
                    <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Mark All Absent</Button>
                </div>
            </div>
            <div className="overflow-y-auto border rounded-md" style={{maxHeight: 'calc(100vh - 350px)'}}>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className='text-center'>Present</TableHead>
                        <TableHead className='text-center'>Absent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classInfo.students.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-muted-foreground">{student.studentId}</div>
                            </TableCell>
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
        </div>

        <DialogFooter className='mt-4'>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Attendance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
