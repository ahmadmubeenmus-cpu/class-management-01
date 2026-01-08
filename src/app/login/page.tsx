'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('12345678');
  const [firstName, setFirstName] = useState('Admin');
  const [lastName, setLastName] = useState('User');

  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
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

  const handleSignUp = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        const userRef = doc(firestore, 'admins', user.uid);
        await setDoc(userRef, {
            id: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: user.email,
            role: 'admin',
        });

        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Tabs defaultValue="signin" className="w-full max-w-sm">
            <Card>
                 <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold font-headline">AttendanceEase</h1>
                    </div>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                </CardHeader>

                <TabsContent value="signin">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your credentials to access your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email-signin">Email</Label>
                        <Input
                        id="email-signin"
                        type="email"
                        placeholder="admin@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    <CardFooter>
                    <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    </CardFooter>
                </TabsContent>
                
                <TabsContent value="signup">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Admin Account</CardTitle>
                        <CardDescription>This is a one-time setup for the administrator.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email-signup">Email</Label>
                            <Input
                                id="email-signup"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password-signup">Password</Label>
                            <Input 
                                id="password-signup" 
                                type="password" 
                                required 
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                    <Button className="w-full" onClick={handleSignUp} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                    </CardFooter>
                </TabsContent>
            </Card>
        </Tabs>
    </div>
  );
}
