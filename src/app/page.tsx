'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import Loading from './loading';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If we have a regular user (not anonymous)
      if (user && !user.isAnonymous) {
        router.replace('/dashboard');
      } 
      // If we have an anonymous user, it might be a student session
      else if (user && user.isAnonymous) {
        const studentData = sessionStorage.getItem('student');
        if (studentData) {
          router.replace('/student/attendance');
        } else {
          // If there's an anon session but no student data, it's an invalid state.
          // Log them out and send to login.
          if(auth) signOut(auth);
          router.replace('/login');
        }
      }
      // No user at all
      else {
        router.replace('/login');
      }
    }
  }, [router, user, isLoading, auth]);

  // Render a loading state while the redirect is happening
  return <Loading />; 
}
