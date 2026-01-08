'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import type { Student, Course, AttendanceRecord } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

interface EnrichedAttendanceRecord extends AttendanceRecord {
  student?: Student;
}

export default function RecordsPage() {
  const firestore = useFirestore();
  
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [attendanceData, setAttendanceData] = useState<EnrichedAttendanceRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchStudents = async (studentIds: string[]): Promise<Map<string, Student>> => {
    if (!firestore || studentIds.length === 0) return new Map();
    const studentMap = new Map<string, Student>();
    
    // Fetch students in chunks of 30
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
    setAttendanceData([]);

    const attendanceRef = collection(firestore, `courses/${selectedClassId}/attendance_records`);
    const attendanceQuery = query(attendanceRef);

    const attendanceSnap = await getDocs(attendanceQuery);
    const attendanceRecords = attendanceSnap.docs.map(doc => doc.data() as AttendanceRecord);

    if(attendanceRecords.length > 0) {
        const studentIds = [...new Set(attendanceRecords.map(rec => rec.studentId))];
        const studentMap = await fetchStudents(studentIds);
        
        const enrichedData: EnrichedAttendanceRecord[] = attendanceRecords.map(record => ({
            ...record,
            student: studentMap.get(record.studentId),
        }));

        enrichedData.sort((a,b) => {
            const dateA = a.date.toMillis();
            const dateB = b.date.toMillis();
            if (dateA !== dateB) return dateB - dateA;
            return (a.student?.studentId || "").localeCompare(b.student?.studentId || "");
        });

        setAttendanceData(enrichedData);
    } else {
        setAttendanceData([]);
    }

    setIsGenerating(false);
  };

  const handleDownload = () => {
    const headers = ["SR#", "Student Name", "Roll No.", "Date", "Status"];
    const csvRows = [headers.join(",")];
    
    attendanceData.forEach((record, index) => {
        if (!record.student) return;
        const row = [
            index + 1,
            `${record.student.firstName} ${record.student.lastName}`,
            record.student.studentId,
            format(record.date.toDate(), 'yyyy-MM-dd'),
            record.status,
        ];
        csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `attendance_records_${selectedClassId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Records</h1>
            <p className="text-muted-foreground">View and download detailed attendance records.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Class</CardTitle>
          <CardDescription>Select a class to view its attendance records.</CardDescription>
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

      {attendanceData.length > 0 && !isGenerating && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attendance Log</CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">SR#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record, index) => (
                  record.student ? (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{record.student.firstName} {record.student.lastName}</div>
                      <div className="text-sm text-muted-foreground">{record.student.email}</div>
                    </TableCell>
                    <TableCell>{record.student.studentId}</TableCell>
                    <TableCell>{format(record.date.toDate(), 'PPP')}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'} className={record.status === 'present' ? 'bg-accent text-accent-foreground hover:bg-accent/80' : ''}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                    </TableCell>
                  </TableRow>
                  ) : null
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {!attendanceData.length && !isGenerating && selectedClassId && (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No records found for the selected class.</p>
            </CardContent>
        </Card>
      )}
    </main>
  );
}
