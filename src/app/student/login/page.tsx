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

export default function StudentLoginPage() {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store student info in session storage for the client-side session
      sessionStorage.setItem('student', JSON.stringify(data.student));

      router.push('/student/attendance');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
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
                    Are you an admin or faculty?
                </Link>
            </CardFooter>
        </Card>
    </div>
  );
}
