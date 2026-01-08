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
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function Login() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    try {
      // First, just try to sign in.
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signed in successfully' });
    } catch (error: any) {
      // If sign-in fails, check if it's because the user doesn't exist.
      // 'auth/invalid-credential' can mean user not found or wrong password.
      // We'll attempt to create the user only if it's the demo admin email.
      if (error.code === 'auth/invalid-credential' && email === 'admin@example.com') {
        try {
          // Attempt to create the admin user.
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Also create the admin document in Firestore.
          const adminRef = doc(firestore, 'admins', user.uid);
          await setDoc(adminRef, {
            id: user.uid,
            email: user.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin'
          });

          toast({ title: 'Admin account created. Signed in successfully.' });
          // The onAuthStateChanged listener in the provider will handle the redirect.

        } catch (creationError: any) {
          // This might fail if the user exists but the password was wrong on the first attempt.
          // In that case, the original error message is more relevant.
           toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: "Invalid email or password.",
          });
        }
      } else {
        // For any other error, display it.
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: "Invalid email or password.",
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
              Enter your email below to login to your account.
              <br />
              Use <strong>admin@example.com</strong> and <strong>password</strong> to log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
