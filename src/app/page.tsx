'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import Loading from './loading';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        // Check if a student is logged in via session storage
        const studentData = sessionStorage.getItem('student');
        if (studentData) {
            router.replace('/student/attendance');
        } else {
            router.replace('/login');
        }
      }
    }
  }, [router, user, isLoading]);

  // Render a loading state while the redirect is happening
  return <Loading />; 
}
