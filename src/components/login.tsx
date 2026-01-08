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
import { useAuth, setDocumentNonBlocking } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import { doc, getFirestore } from 'firebase/firestore';

export function Login() {
  const auth = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  // We'll construct a fake email from the username for Firebase Auth
  const getEmailFromUsername = (uname: string) => `${uname}@example.com`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Firebase not initialized",
        });
        return;
    }
    const email = getEmailFromUsername(username);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signed in successfully' });
    } catch (signInError: any) {
      if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/user-not-found') {
        // User does not exist, so create them
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          toast({
            title: 'Account created',
            description: 'First time login, creating your account...',
          });
          
          // If this is the 'admin' user, create their document in the admins collection
          if (username === 'admin') {
            const firestore = getFirestore();
            const adminDocRef = doc(firestore, 'admins', user.uid);
            // Use setDocumentNonBlocking to create the admin profile
            setDocumentNonBlocking(adminDocRef, {
              id: user.uid,
              username: 'admin',
              firstName: 'Admin',
              lastName: 'User',
              role: 'super_admin'
            }, {});
          }

        } catch (signUpError: any) {
            toast({
                variant: 'destructive',
                title: 'Sign-up Failed',
                description: signUpError.message || 'An unknown error occurred during sign up.',
            });
        }
      } else {
        // Handle other sign-in errors
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: signInError.message || 'An unknown error occurred.',
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
