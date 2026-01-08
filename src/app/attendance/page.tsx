'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Course, Student } from '@/lib/types';
import { AttendanceSheet } from '@/components/attendance-sheet';

interface CourseWithStudents extends Course {
  students: Student[];
}

function AttendanceContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const courseIdFromQuery = searchParams.get('courseId');

  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses } = useCollection<Course>(coursesQuery);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(courseIdFromQuery ?? undefined);
  const [selectedClass, setSelectedClass] = useState<CourseWithStudents | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (courseIdFromQuery) {
        setSelectedClassId(courseIdFromQuery);
    }
  }, [courseIdFromQuery]);

  const handleClassSelect = (courseId: string) => {
    setSelectedClassId(courseId);
  };
  
  const fetchEnrolledStudents = async (courseId: string): Promise<Student[]> => {
    if (!firestore) return [];
  
    const studentsRef = collection(firestore, `courses/${courseId}/students`);
    const studentEnrollments = await getDocs(studentsRef);
    const studentIds = studentEnrollments.docs.map(d => d.id);
  
    if (studentIds.length === 0) {
      return [];
    }
  
    const allStudents: Student[] = [];
    // Firestore 'in' query is limited to 30 items, so we need to batch the requests
    for (let i = 0; i < studentIds.length; i += 30) {
      const chunk = studentIds.slice(i, i + 30);
      if (chunk.length > 0) {
        const studentDocsQuery = query(collection(firestore, 'students'), where('id', 'in', chunk));
        const studentDocsSnapshot = await getDocs(studentDocsQuery);
        const studentsList: Student[] = studentDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        allStudents.push(...studentsList);
      }
    }
    
    allStudents.sort((a, b) => (a.studentId || "").localeCompare(b.studentId || ""));
  
    return allStudents;
  }

  const handleMarkAttendance = async () => {
    if (!selectedClassId || !courses) return;
    const classInfo = courses.find(c => c.id === selectedClassId);
    if (!classInfo) return;

    const studentsList = await fetchEnrolledStudents(classInfo.id);
    setSelectedClass({ ...classInfo, students: studentsList });
    setIsSheetOpen(true);
  };

  const handleCloseAttendanceSheet = () => {
    setIsSheetOpen(false);
    setSelectedClass(null);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
            <p className="text-muted-foreground">Select a class to start marking attendance.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Select a Class</CardTitle>
          <CardDescription>Choose the class for which you want to mark attendance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="grid gap-2">
            <Select value={selectedClassId} onValueChange={handleClassSelect}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="self-end">
            <Button onClick={handleMarkAttendance} disabled={!selectedClassId}>Mark Attendance</Button>
          </div>
        </CardContent>
      </Card>
      {selectedClass && isSheetOpen && (
        <AttendanceSheet 
            classInfo={selectedClass} 
            open={isSheetOpen}
            onOpenChange={handleCloseAttendanceSheet}
        />
      )}
    </main>
  );
}


export default function AttendancePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AttendanceContent />
        </Suspense>
    )
}
