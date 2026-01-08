'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';

export function Login() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSigningIn) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Signed in successfully' });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Account created successfully' });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center gap-4 text-center">
         <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">AttendanceEase</h1>
          </div>
          <p className="text-muted-foreground">The one-stop solution for attendance management.</p>
        <Card className="mx-auto mt-4 w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{isSigningIn ? 'Sign In' : 'Sign Up'}</CardTitle>
            <CardDescription>
              Enter your email below to {isSigningIn ? 'login to' : 'create'} your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth}>
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
                  {isSigningIn ? 'Sign In' : 'Create Account'}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSigningIn ? "Don't have an account?" : 'Already have an account?'}
              <Button variant="link" onClick={() => setIsSigningIn(!isSigningIn)}>
                {isSigningIn ? 'Sign up' : 'Sign in'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
