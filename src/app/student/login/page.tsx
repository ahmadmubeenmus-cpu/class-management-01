'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Student } from '@/lib/types';


export default function StudentLoginPage() {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleSignIn = async () => {
    if(!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.'});
        return;
    }

    setIsLoading(true);
    try {
      // Step 1: Sign in anonymously to get permissions to query
      await signInAnonymously(auth);

      // Step 2: Query for the student document with the given UID
      const studentsRef = collection(firestore, 'students');
      const q = query(studentsRef, where('uid', '==', uid), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid credentials');
      }

      const studentDoc = querySnapshot.docs[0];
      const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
      
      // Step 3: Verify the password
      if (studentData.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      // Step 4: Store student info in session storage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...studentInfo } = studentData;
      sessionStorage.setItem('student', JSON.stringify(studentInfo));

      // Step 5: Redirect to the student attendance page
      router.push('/student/attendance');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
       if(auth.currentUser) {
         await auth.signOut(); // Sign out the anonymous user on failure
       }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold font-headline">Class Managment</h1>
                </div>
            </CardHeader>
            <CardHeader>
                <CardTitle className="text-2xl">Student Login</CardTitle>
                <CardDescription>Enter your credentials to view your attendance.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="uid">Student UID</Label>
                <Input
                id="uid"
                type="text"
                placeholder="Your unique ID"
                required
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input 
                    id="password-signin" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                />
            </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-4'>
                <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                <Link href="/login" className="text-sm text-center text-muted-foreground hover:underline">
                    Are you a CR/GR?
                </Link>
            </CardFooter>
        </Card>
    </div>
  );
}
