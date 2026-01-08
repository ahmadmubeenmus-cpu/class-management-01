'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { Users, Book, Percent, CalendarClock, BookUser, UserPlus, PlusCircle } from 'lucide-react';
import { useMemoFirebase, useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';
import { AddClassDialog } from './add-class-dialog';
import { AddStudentDialog } from './add-student-dialog';
import { useState } from 'react';

export function Dashboard() {
    const firestore = useFirestore();

    const studentsQuery = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
    const { data: students } = useCollection(studentsQuery);
    
    const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
    const { data: courses } = useCollection(coursesQuery);
    
    const totalStudents = students?.length || 0;
    const totalClasses = courses?.length || 0;

    // Mock data for now
    const overallAttendancePercentage = 92;

    const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);


  return (
    <>
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your most common tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/attendance" passHref>
                <Button size="lg" className="w-full h-20 text-lg">
                    <BookUser className="mr-4 h-6 w-6" />
                    Mark Attendance
                </Button>
            </Link>
             <AddClassDialog>
                <Button size="lg" variant="secondary" className="w-full h-20 text-lg">
                    <PlusCircle className="mr-4 h-6 w-6" />
                    Add New Class
                </Button>
             </AddClassDialog>
             <Button size="lg" variant="secondary" className="w-full h-20 text-lg" onClick={() => setIsAddStudentDialogOpen(true)}>
                <UserPlus className="mr-4 h-6 w-6" />
                Add New Student
            </Button>
        </CardContent>
      </Card>
    </div>
    <AddStudentDialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen} />
    </>
  );
}
