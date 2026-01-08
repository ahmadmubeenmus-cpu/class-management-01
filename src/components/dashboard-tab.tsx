'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/stat-card';
import { Users, Book, Percent, CalendarClock } from 'lucide-react';
import { classes, students, attendance } from '@/lib/data';
import { useMemo } from 'react';

export function DashboardTab() {
    const totalStudents = students.length;
    const totalClasses = classes.length;

    const overallAttendancePercentage = useMemo(() => {
        const allRecords = attendance.flatMap(a => a.records);
        if (allRecords.length === 0) return 0;
        const presentRecords = allRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        return Math.round((presentRecords / allRecords.length) * 100);
    }, []);

    const upcomingClasses = classes.slice(0, 3);

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
            value="2"
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
                <TableHead className="hidden md:table-cell">Schedule</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="text-right">Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{c.schedule}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{c.schedule}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.location}</TableCell>
                  <TableCell className="text-right">{c.students.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
