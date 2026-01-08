'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Login } from '@/components/login';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // This is a simple protection mechanism.
    // In a real app, you would have more robust routing and protected routes.
    if (!isUserLoading && !user) {
      // If loading is finished and there's no user, we don't need to do anything,
      // the Login component will be displayed.
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}
