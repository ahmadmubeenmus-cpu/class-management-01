'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AttendanceRecord } from '@/lib/types';
import { format } from 'date-fns';

interface StudentCourseAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  attendanceDetails: (AttendanceRecord & { date: Date })[];
}

export function StudentCourseAttendanceDialog({
  open,
  onOpenChange,
  courseName,
  attendanceDetails,
}: StudentCourseAttendanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{courseName}</DialogTitle>
          <DialogDescription>Your detailed attendance record for this course.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceDetails.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(record.date, 'PPP')}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={record.status === 'present' ? 'text-green-600' : 'text-red-600'}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {attendanceDetails.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No records yet for this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
