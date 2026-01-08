'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/stat-card';
import { Users, Book, Percent, CalendarClock } from 'lucide-react';
import { useMemo } from 'react';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function DashboardTab() {
    const firestore = useFirestore();

    const { data: students } = useCollection(useMemo(() => collection(firestore, 'students'), [firestore]));
    const { data: courses } = useCollection(useMemo(() => collection(firestore, 'courses'), [firestore]));
    
    const totalStudents = students?.length || 0;
    const totalClasses = courses?.length || 0;

    // Mock data for now
    const overallAttendancePercentage = 92;
    const upcomingClasses = (courses || []).slice(0, 3);

  return (
    <div className="flex flex-col gap-4 md:gap-8 mt-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            Icon={Book}
            title="Total Classes"
            value={totalClasses.toString()}
            description="All active courses"
        />
        <StatCard 
            Icon={Users}
            title="Total Students"
            value={totalStudents.toString()}
            description="Across all classes"
        />
        <StatCard 
            Icon={Percent}
            title="Overall Attendance"
            value={`${overallAttendancePercentage}%`}
            description="Based on all records"
        />
        <StatCard 
            Icon={CalendarClock}
            title="Classes Today"
            value="-"
            description="Scheduled for today"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>
            Here are your next scheduled classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="hidden md:table-cell">Course Code</TableHead>
                <TableHead className="text-right">Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingClasses.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.courseName}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{c.courseCode}</TableCell>
                  <TableCell className="text-right">_</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
