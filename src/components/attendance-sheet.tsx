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
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import type { Class, Student, AttendanceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AttendanceSheetProps {
  classInfo: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StudentAttendanceState = Record<string, AttendanceStatus>;

export function AttendanceSheet({ classInfo, open, onOpenChange }: AttendanceSheetProps) {
  const { toast } = useToast();
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
  
  const handleSave = () => {
    // Logic to save attendance data
    console.log('Saving attendance:', attendance);
    toast({
      title: 'Attendance Saved',
      description: `Attendance for ${classInfo.name} has been recorded.`,
      className: 'bg-accent text-accent-foreground',
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <SheetHeader>
          <SheetTitle>Mark Attendance: {classInfo.name}</SheetTitle>
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
              <TableHead>Student Name</TableHead>
              <TableHead className='text-center'>Present</TableHead>
              <TableHead className='text-center'>Absent</TableHead>
              <TableHead className='text-center'>Late</TableHead>
              <TableHead className='text-center'>Excused</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classInfo.students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-muted-foreground">{student.studentId}</div>
                </TableCell>
                <RadioGroup 
                    defaultValue="present" 
                    className="flex items-center justify-around" 
                    onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                    value={attendance[student.id]}
                >
                    {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(status => (
                        <TableCell key={status} className="text-center">
                            <RadioGroupItem value={status} id={`${student.id}-${status}`} />
                        </TableCell>
                    ))}
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
