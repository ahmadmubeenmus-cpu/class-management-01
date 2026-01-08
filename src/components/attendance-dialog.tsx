'use client';
import { useState } from 'react';
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
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';


interface AttendanceDialogProps {
  classInfo: Course & { students: Student[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StudentAttendanceState = Record<string, AttendanceStatus>;
type Step = 'date' | 'students';

export function AttendanceDialog({ classInfo, open, onOpenChange }: AttendanceDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [step, setStep] = useState<Step>('date');
  const [attendance, setAttendance] = useState<StudentAttendanceState>(() => {
    const initialState: StudentAttendanceState = {};
    classInfo.students.forEach(student => {
      initialState[student.id] = 'present';
    });
    return initialState;
  });
  const [attendanceDate, setAttendanceDate] = useState<Date | undefined>(new Date());

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
  
  const handleNext = () => {
    if (!attendanceDate) {
        toast({
            variant: "destructive",
            title: "No Date Selected",
            description: "Please select a date for the attendance.",
        });
        return;
    }
    setStep('students');
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
        // This should not happen due to the new flow, but as a safeguard
        toast({
            variant: "destructive",
            title: "No Date Selected",
            description: "Please select a date for the attendance.",
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
                date: Timestamp.fromDate(attendanceDate),
                status: status,
                markedBy: "admin", // Placeholder for user who marked attendance
            });
        });

        await batch.commit();
        
        toast({
          title: 'Attendance Saved',
          description: `Attendance for ${classInfo.courseName} on ${format(attendanceDate, 'PPP')} has been recorded.`,
          className: 'bg-accent text-accent-foreground',
        });
        handleClose();
    } catch (error) {
        console.error("Error saving attendance: ", error);
        toast({
            variant: "destructive",
            title: 'Save Failed',
            description: 'An error occurred while saving attendance records.',
        });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state on close after a short delay to allow animation
    setTimeout(() => {
        setStep('date');
        setAttendanceDate(new Date());
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className={step === 'date' ? 'sm:max-w-auto' : 'max-w-4xl w-full'}
        >
        <DialogHeader>
          <DialogTitle>Mark Attendance: {classInfo.courseName}</DialogTitle>
          <DialogDescription>
            {step === 'date' 
              ? `Select the date for which you want to mark attendance. Today is ${format(new Date(), 'PPP')}.`
              : `Mark the status for each student for ${format(attendanceDate!, 'PPP')}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'date' && (
            <div className='flex flex-col items-center gap-4 py-4'>
                 <Calendar
                    mode="single"
                    selected={attendanceDate}
                    onSelect={setAttendanceDate}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    className="rounded-md border"
                    initialFocus
                />
            </div>
        )}

        {step === 'students' && (
            <div className="grid gap-4 my-4" style={{gridTemplateColumns: '1fr'}}>
                <div className='flex justify-end gap-2'>
                    <Button variant="outline" size="sm" onClick={() => markAll('present')}>Mark All Present</Button>
                    <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Mark All Absent</Button>
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
        )}

        <DialogFooter className='mt-4'>
          {step === 'date' ? (
              <>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleNext}>Next</Button>
              </>
          ) : (
             <>
                <Button variant="outline" onClick={() => setStep('date')}>Back</Button>
                <Button onClick={handleSave}>Save Attendance</Button>
             </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
