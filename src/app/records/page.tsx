'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import type { Student, Course, AttendanceRecord } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

interface TransformedData {
  students: Student[];
  dates: string[];
  recordsByStudent: Record<string, Record<string, string>>;
}

export default function RecordsPage() {
  const firestore = useFirestore();
  
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [reportData, setReportData] = useState<TransformedData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchStudents = async (studentIds: string[]): Promise<Map<string, Student>> => {
    if (!firestore || studentIds.length === 0) return new Map();
    const studentMap = new Map<string, Student>();
    
    for (let i = 0; i < studentIds.length; i += 30) {
        const chunk = studentIds.slice(i, i + 30);
        if (chunk.length > 0) {
            const studentQuery = query(collection(firestore, 'students'), where('id', 'in', chunk));
            const snapshot = await getDocs(studentQuery);
            snapshot.forEach(doc => studentMap.set(doc.id, { id: doc.id, ...doc.data() } as Student));
        }
    }
    return studentMap;
  };

  const handleGenerateRecords = async () => {
    if (!firestore || !selectedClassId) return;

    setIsGenerating(true);
    setReportData(null);

    const attendanceRef = collection(firestore, `courses/${selectedClassId}/attendance_records`);
    const attendanceQuery = query(attendanceRef);

    const attendanceSnap = await getDocs(attendanceQuery);
    const attendanceRecords = attendanceSnap.docs.map(doc => doc.data() as AttendanceRecord);

    if(attendanceRecords.length > 0) {
        const studentIds = [...new Set(attendanceRecords.map(rec => rec.studentId))];
        const studentMap = await fetchStudents(studentIds);
        
        const students = Array.from(studentMap.values()).sort((a,b) => (a.studentId || "").localeCompare(b.studentId || ""));
        
        const dateSet = new Set<string>();
        const recordsByStudent: Record<string, Record<string, string>> = {};

        students.forEach(student => {
            recordsByStudent[student.id] = {};
        });
        
        attendanceRecords.forEach(record => {
            const dateStr = format(record.date.toDate(), 'yyyy-MM-dd');
            dateSet.add(dateStr);
            if (recordsByStudent[record.studentId]) {
                 recordsByStudent[record.studentId][dateStr] = record.status === 'present' ? 'P' : 'A';
            }
        });

        const sortedDates = Array.from(dateSet).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

        setReportData({
            students: students,
            dates: sortedDates,
            recordsByStudent: recordsByStudent,
        });

    } else {
        setReportData(null);
    }

    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!reportData) return;

    const { students, dates, recordsByStudent } = reportData;
    const headers = ["SR#", "Student Name", "Roll No.", ...dates.map(d => format(new Date(d), 'dd-MMM-yy'))];
    const csvRows = [headers.join(",")];
    
    students.forEach((student, index) => {
        const row = [
            index + 1,
            `"${student.firstName} ${student.lastName}"`,
            student.studentId
        ];
        dates.forEach(date => {
            const status = recordsByStudent[student.id]?.[date] || '-';
            row.push(status);
        });
        csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `attendance_register_${selectedClassId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Register</h1>
            <p className="text-muted-foreground">View and download attendance in a register format.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Class</CardTitle>
          <CardDescription>Select a class to view its attendance register.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
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
            <Button onClick={handleGenerateRecords} disabled={!selectedClassId || isGenerating}>
                {isGenerating ? 'Fetching...' : 'Fetch Records'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isGenerating && (
        <Card>
            <CardHeader><CardTitle>Fetching Records...</CardTitle></CardHeader>
            <CardContent>
                <div className='space-y-2'>
                    {Array.from({length: 5}).map((_, i) => (
                        <Skeleton key={i} className='h-12 w-full'/>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      {reportData && !isGenerating && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attendance Register</CardTitle>
                <CardDescription>
                    Records for {courses?.find(c => c.id === selectedClassId)?.courseName}.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Download CSV
                  </span>
              </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <Table className="min-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10 w-[50px]">SR#</TableHead>
                        <TableHead className="sticky left-[50px] bg-background z-10 min-w-[200px]">Student</TableHead>
                        <TableHead className="sticky left-[250px] bg-background z-10 min-w-[120px]">Roll No.</TableHead>
                        {reportData.dates.map(date => (
                            <TableHead key={date} className="text-center min-w-[120px]">{format(new Date(date), 'dd MMM, yy')}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportData.students.map((student, index) => (
                    <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium">{index + 1}</TableCell>
                        <TableCell className="sticky left-[50px] bg-background z-10 font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="sticky left-[250px] bg-background z-10">{student.studentId}</TableCell>
                        {reportData.dates.map(date => (
                            <TableCell key={date} className="text-center">
                                {reportData.recordsByStudent[student.id]?.[date] || '-'}
                            </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {!reportData && !isGenerating && selectedClassId && (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No records found for the selected class.</p>
            </CardContent>
        </Card>
      )}
    </main>
  );
}
