'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import { getFirestore } from 'firebase/firestore';

export function Login() {
  const auth = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const getEmailFromUsername = (uname: string) => `${uname}@example.com`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
      });
      return;
    }
    const email = getEmailFromUsername(username);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signed in successfully' });
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        try {
          // If sign-in fails because user doesn't exist, create the user
          await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: 'Account created',
            description: 'First time login, creating your account...',
          });
        } catch (signUpError: any) {
          toast({
            variant: 'destructive',
            title: 'Sign-up Failed',
            description: signUpError.message || 'An unknown error occurred during sign up.',
          });
        }
      } else {
        // Handle other sign-in errors like wrong password
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: error.message || 'An unknown error occurred.',
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">AttendanceEase</h1>
        </div>
        <p className="text-muted-foreground">
          The one-stop solution for attendance management.
        </p>
        <Card className="mx-auto mt-4 w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your username and password below to login.
              <br />
              Use <strong>admin</strong> and <strong>password</strong> to log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
