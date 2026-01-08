'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import type { Course, Student, AttendanceRecord } from '@/lib/types';
import { format } from 'date-fns';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
                const enrolledCourseIds: string[] = [];

                for (const courseDoc of coursesSnap.docs) {
                    const enrollmentRef = doc(firestore, `courses/${courseDoc.id}/students/${student.id}`);
                    const enrollmentSnap = await getDoc(enrollmentRef);
                    if (enrollmentSnap.exists()) {
                        enrolledCourseIds.push(courseDoc.id);
                    }
                }

                // 2. Fetch all attendance records for that student
                const attendanceRef = collection(firestore, `students/${student.id}/attendance`);
                const q = query(collection(firestore, 'attendance_records'), where('studentId', '==', student.id));
                const attendanceSnap = await getDocs(q);
                
                const records = attendanceSnap.docs.map(doc => ({ ...doc.data(), date: doc.data().date.toDate() })) as (AttendanceRecord & { date: Date })[];

                // 3. Group records by course and calculate stats
                const statsByCourse: Record<string, AttendanceStat> = {};

                for (const courseId of enrolledCourseIds) {
                    const courseDoc = await getDoc(doc(firestore, 'courses', courseId));
                    const courseName = courseDoc.data()?.courseName || 'Unknown Course';
                    statsByCourse[courseId] = {
                        courseName,
                        present: 0,
                        total: 0,
                        percentage: '0.00',
                        details: []
                    };
                }

                records.forEach(record => {
                    if (statsByCourse[record.courseId]) {
                        statsByCourse[record.courseId].total++;
                        if (record.status === 'present') {
                            statsByCourse[record.courseId].present++;
                        }
                        statsByCourse[record.courseId].details.push(record);
                    }
                });
                
                // 4. Finalize calculations
                Object.values(statsByCourse).forEach(stat => {
                    stat.percentage = stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(2) : '0.00';
                    stat.details.sort((a, b) => b.date.getTime() - a.date.getTime());
                });

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
                        <p className="text-muted-foreground">Welcome, {student.firstName} {student.lastName} ({student.uid})</p>
                    </div>
                </div>

                {isLoading && (
                     <div className='space-y-4'>
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                )}
                
                {!isLoading && stats.length === 0 && (
                    <Card>
                        <CardContent className='pt-6'>
                            <p className='text-center text-muted-foreground'>No attendance records found for any of your enrolled classes.</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{stat.courseName}</CardTitle>
                            <CardDescription>
                                Overall: {stat.present} / {stat.total} days present ({stat.percentage}%)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>
                ))}
            </main>
        </div>
    );
}
