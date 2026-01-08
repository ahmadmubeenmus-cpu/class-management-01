'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePickerWithRange } from './date-picker-with-range';
import { Download } from 'lucide-react';
import type { Student, Course } from '@/lib/types';
import { Badge } from './ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface ReportData {
    student: Student;
    class: Course;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    percentage: number;
}

export function ReportsTab() {
  const firestore = useFirestore();
  const { data: courses } = useCollection<Course>(useMemoFirebase(() => collection(firestore, 'courses'), [firestore]));
  const { data: students } = useCollection<Student>(useMemoFirebase(() => collection(firestore, 'students'), [firestore]));

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData[]>([]);

  const handleGenerateReport = () => {
    // This is a placeholder.
    // In a real app, you would fetch and process attendance records from Firestore based on the filters.
    if (!students || !courses) return;

    let filteredStudents: Student[] = [];
    if (selectedClassId === 'all') {
        filteredStudents = students;
    } else {
        // This is simplified. In a real app, you'd filter students by course enrollment.
        filteredStudents = students;
    }

    const data = filteredStudents.map(student => {
        const studentClass = courses.find(c => c.id === selectedClassId) || courses[0];
        return {
            student,
            class: studentClass!,
            present: Math.floor(Math.random() * 20),
            absent: Math.floor(Math.random() * 5),
            late: Math.floor(Math.random() * 3),
            excused: Math.floor(Math.random() * 2),
            total: 25,
            percentage: Math.floor(Math.random() * 40) + 60, // Random % between 60 and 100
        };
    });
    setReportData(data);
  };

  const handleDownload = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
        const headers = ["Student Name", "Student ID", "Class", "Attendance %", "Present", "Absent", "Late", "Excused", "Total Sessions"];
        const csvRows = [headers.join(",")];
        reportData.forEach(data => {
            const row = [
                `${data.student.firstName} ${data.student.lastName}`,
                data.student.studentId,
                data.class.courseName,
                `${data.percentage}%`,
                data.present,
                data.absent,
                data.late,
                data.excused,
                data.total,
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        // PDF generation logic would go here.
        alert('PDF download is not implemented yet.');
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 mt-4">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Attendance Reports</h2>
            <p className="text-muted-foreground">Generate and download detailed attendance reports.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select filters to generate a report.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="grid gap-2">
            <Label>Date range</Label>
            <DatePickerWithRange />
          </div>
          <div className="grid gap-2">
            <Label>Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {courses?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="self-end">
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Report Results</CardTitle>
                <CardDescription>
                    Generated for {selectedClassId === 'all' ? 'all classes' : courses?.find(c => c.id === selectedClassId)?.courseName}.
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleDownload('csv')}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Download CSV
                    </span>
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleDownload('pdf')}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Download PDF
                    </span>
                </Button>
              </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  {selectedClassId === 'all' && <TableHead>Class</TableHead>}
                  <TableHead className="text-center">Attendance %</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Summary (P/A/L/E)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map(({ student, class: c, percentage, present, absent, late, excused }) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-muted-foreground">{student.studentId}</div>
                    </TableCell>
                    {selectedClassId === 'all' && <TableCell>{c.courseName}</TableCell>}
                    <TableCell className="text-center">
                        <Badge variant={percentage >= 75 ? 'default' : 'destructive'} className={percentage >= 75 ? 'bg-accent text-accent-foreground hover:bg-accent/80' : ''}>
                            {percentage}%
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                        {present} / {absent} / {late} / {excused}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
        {children}
    </label>
);
