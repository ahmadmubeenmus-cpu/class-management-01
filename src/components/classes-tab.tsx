'use client';
import { useState } from 'react';
import { MoreHorizontal, File, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { classes } from '@/lib/data';
import type { Class } from '@/lib/types';
import { AddClassDialog } from './add-class-dialog';
import { BulkUploadDialog } from './bulk-upload-dialog';
import { AttendanceSheet } from './attendance-sheet';

export function ClassesTab() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleMarkAttendance = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsSheetOpen(true);
  };
  
  return (
    <>
      <div className="flex items-center justify-between gap-2 mt-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Classes</h2>
            <p className="text-muted-foreground">Here's a list of your classes for this semester.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUploadDialog />
          <AddClassDialog />
        </div>
      </div>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead className="hidden md:table-cell">Schedule</TableHead>
                <TableHead className="hidden md:table-cell">Students</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div className="font-medium">{classItem.name}</div>
                    <div className="text-sm text-muted-foreground">{classItem.courseCode}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{classItem.schedule}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{classItem.students.length} Students</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                    <Button size="sm" onClick={() => handleMarkAttendance(classItem)}>Mark Attendance</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Students</DropdownMenuItem>
                        <DropdownMenuItem>Edit Class</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Class</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedClass && (
        <AttendanceSheet 
            classInfo={selectedClass} 
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
        />
      )}
    </>
  );
}
