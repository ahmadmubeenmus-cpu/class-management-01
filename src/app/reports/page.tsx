'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/date-picker-with-range';
import { Download, FileText } from 'lucide-react';
import type { Student, Course, AttendanceRecord } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


interface ReportData {
    student: Student;
    present: number;
    absent: number;
    total: number;
    percentage: number;
}

export default function ReportsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!firestore || !selectedClassId) return;

    setIsGenerating(true);
    setReportData([]);

    const studentEnrollmentsRef = collection(firestore, `courses/${selectedClassId}/students`);
    const studentEnrollmentsSnap = await getDocs(studentEnrollmentsRef);
    const studentIds = studentEnrollmentsSnap.docs.map(doc => doc.id);
    
    if (studentIds.length === 0) {
      setReportData([]);
      setIsGenerating(false);
      return;
    }
    
    const studentsRef = collection(firestore, 'students');
    const studentsQuery = query(studentsRef, where('id', 'in', studentIds));
    const studentsSnap = await getDocs(studentsQuery);
    const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    students.sort((a,b) => (a.studentId || "").localeCompare(b.studentId || ""));


    const attendanceRef = collection(firestore, `courses/${selectedClassId}/attendance_records`);
    let attendanceQuery = query(attendanceRef);

    if (dateRange?.from && dateRange?.to) {
        attendanceQuery = query(attendanceQuery, 
            where('date', '>=', startOfDay(dateRange.from)),
            where('date', '<=', endOfDay(dateRange.to))
        );
    }
    
    const attendanceSnap = await getDocs(attendanceQuery);
    const attendanceRecords = attendanceSnap.docs.map(doc => doc.data() as AttendanceRecord);

    const data: ReportData[] = students.map(student => {
        const studentRecords = attendanceRecords.filter(rec => rec.studentId === student.id);
        const present = studentRecords.filter(r => r.status === 'present').length;
        const absent = studentRecords.filter(r => r.status === 'absent').length;
        const total = studentRecords.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { student, present, absent, total, percentage };
    });

    setReportData(data);
    setIsGenerating(false);
  };

  const handleDownload = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
        const headers = ["SR#", "Student Name", "Roll No.", "Attendance %", "Present", "Absent", "Total Sessions"];
        const csvRows = [headers.join(",")];
        reportData.forEach((data, index) => {
            const row = [
                index + 1,
                `${data.student.firstName} ${data.student.lastName}`,
                data.student.studentId,
                `${data.percentage}%`,
                data.present,
                data.absent,
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
        toast({
            variant: "default",
            title: "Coming Soon",
            description: "PDF download functionality is not implemented yet.",
        });
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Reports</h1>
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
            <DatePickerWithRange onDateChange={setDateRange} />
          </div>
          <div className="grid gap-2">
            <Label>Class</Label>
            {coursesLoading ? <Skeleton className="h-10 w-full sm:w-[200px]" /> : (
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            )}
          </div>
          <div className="self-end">
            <Button onClick={handleGenerateReport} disabled={!selectedClassId || isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isGenerating && (
        <Card>
            <CardHeader><CardTitle>Generating Report...</CardTitle></CardHeader>
            <CardContent>
                <div className='space-y-2'>
                    {Array.from({length: 5}).map((_, i) => (
                        <Skeleton key={i} className='h-12 w-full'/>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      {reportData.length > 0 && !isGenerating && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Report Results</CardTitle>
                <CardDescription>
                    Generated for {courses?.find(c => c.id === selectedClassId)?.courseName}.
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
                    <FileText className="h-3.5 w-3.5" />
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
                  <TableHead className="w-[50px]">SR#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Summary (Present/Absent/Total)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map(({ student, percentage, present, absent, total }, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={percentage >= 75 ? 'default' : 'destructive'} className={percentage >= 75 ? 'bg-accent text-accent-foreground hover:bg-accent/80' : ''}>
                            {percentage}%
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                        {present} / {absent} / {total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
        {children}
    </label>
);
