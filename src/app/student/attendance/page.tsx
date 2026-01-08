'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Student, AttendanceRecord } from '@/lib/types';
import { format } from 'date-fns';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AttendanceStat {
    courseName: string;
    present: number;
    total: number;
    percentage: string;
    details: (AttendanceRecord & { date: Date })[];
}

export default function StudentAttendancePage() {
    const router = useRouter();
    const firestore = useFirestore();
    const [student, setStudent] = useState<Student | null>(null);
    const [stats, setStats] = useState<AttendanceStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const studentData = sessionStorage.getItem('student');
        if (!studentData) {
            router.push('/student/login');
        } else {
            setStudent(JSON.parse(studentData));
        }
    }, [router]);

    useEffect(() => {
        if (!firestore || !student) return;

        const fetchAttendanceData = async () => {
            setIsLoading(true);
            try {
                // 1. Find which courses the student is enrolled in
                const coursesRef = collection(firestore, 'courses');
                const coursesSnap = await getDocs(coursesRef);
                const enrolledCourses: { id: string; name: string }[] = [];

                for (const courseDoc of coursesSnap.docs) {
                    const enrollmentRef = doc(firestore, `courses/${courseDoc.id}/students/${student.id}`);
                    const enrollmentSnap = await getDoc(enrollmentRef);
                    if (enrollmentSnap.exists()) {
                        enrolledCourses.push({
                            id: courseDoc.id,
                            name: courseDoc.data().courseName || 'Unknown Course'
                        });
                    }
                }
                
                const statsByCourse: Record<string, AttendanceStat> = {};

                // 2. For each enrolled course, fetch attendance records and calculate stats
                for (const course of enrolledCourses) {
                    // Initialize stats for the course
                    statsByCourse[course.id] = {
                        courseName: course.name,
                        present: 0,
                        total: 0,
                        percentage: '0.00',
                        details: []
                    };
                    
                    // Fetch all attendance records for the entire course to find total lecture days
                    const allRecordsForCourseRef = collection(firestore, `courses/${course.id}/attendance_records`);
                    const allRecordsSnap = await getDocs(allRecordsForCourseRef);
                    const courseDates = new Set<string>();
                    allRecordsSnap.forEach(rec => {
                        courseDates.add(format(rec.data().date.toDate(), 'yyyy-MM-dd'));
                    });
                    const totalLectures = courseDates.size;
                    statsByCourse[course.id].total = totalLectures;


                    // Fetch records just for the current student in this course
                    const studentRecordsRef = collection(firestore, `courses/${course.id}/attendance_records`);
                    const q = query(studentRecordsRef, where('studentId', '==', student.id));
                    const studentRecordsSnap = await getDocs(q);

                    let presentCount = 0;
                    const studentAttendanceDetails : (AttendanceRecord & { date: Date })[] = [];
                    studentRecordsSnap.forEach(doc => {
                        const data = doc.data();
                        if (data.status === 'present') {
                            presentCount++;
                        }
                        const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
                        studentAttendanceDetails.push({ ...data, id: doc.id, date } as (AttendanceRecord & { date: Date }));
                    });
                    
                    statsByCourse[course.id].present = presentCount;
                    statsByCourse[course.id].details = studentAttendanceDetails.sort((a,b) => b.date.getTime() - a.date.getTime());
                    statsByCourse[course.id].percentage = totalLectures > 0 ? ((presentCount / totalLectures) * 100).toFixed(2) : '0.00';
                }
                
                setStats(Object.values(statsByCourse));

            } catch (err) {
                console.error("Failed to fetch attendance data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceData();
    }, [firestore, student]);

    const handleLogout = () => {
        sessionStorage.removeItem('student');
        router.push('/student/login');
    };

    if (!student) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <Skeleton className='w-full max-w-sm h-96' />
             </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
                 <div className='flex items-center gap-2 text-lg font-semibold'>
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-bold">Class Managment</span>
                </div>
                 <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
                        <p className="text-muted-foreground">Welcome, {student.firstName} {student.lastName} ({student.rollNo})</p>
                    </div>
                </div>

                {isLoading && (
                     <div className='space-y-4'>
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                )}
                
                {!isLoading && stats.length === 0 && (
                    <Card>
                        <CardContent className='pt-6'>
                            <p className='text-center text-muted-foreground'>No attendance records found for any of your enrolled classes.</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && stats.length > 0 && (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {stats.map((stat, index) => (
                           <Card key={index}>
                             <AccordionItem value={`item-${index}`} className="border-b-0">
                                <AccordionTrigger className="p-6 hover:no-underline">
                                    <div className='flex flex-col text-left'>
                                        <CardTitle>{stat.courseName}</CardTitle>
                                        <CardDescription className="pt-1">
                                            Overall: {stat.present} / {stat.total} days present ({stat.percentage}%)
                                        </CardDescription>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stat.details.map(record => (
                                                <TableRow key={record.id}>
                                                    <TableCell>{format(record.date, 'PPP')}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        <span className={record.status === 'present' ? 'text-green-600' : 'text-red-600'}>
                                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {stat.details.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center">No records yet for this class.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                           </Card>
                        ))}
                    </Accordion>
                )}
            </main>
        </div>
    );
}
