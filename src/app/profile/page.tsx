'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase/auth/use-user';
import { useAuth, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
    const { user, userProfile, isAdmin } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    useEffect(() => {
        if(userProfile) {
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            setUsername(userProfile.username || '');
            setEmail(userProfile.email || '');
            setProfilePictureUrl(userProfile.profilePictureUrl || `https://avatar.vercel.sh/${userProfile.email}.png`);
        }
    }, [userProfile]);

    const handleProfileUpdate = async () => {
        if (!firestore || !user) return;
        
        const collectionName = isAdmin ? 'admins' : 'users';
        const userRef = doc(firestore, collectionName, user.uid);
        
        try {
            await updateDocumentNonBlocking(userRef, {
                firstName,
                lastName,
                username,
                profilePictureUrl,
            });
            toast({
                title: 'Profile Updated',
                description: 'Your profile information has been successfully updated.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message,
            });
        }
    };

    const handlePasswordChange = async () => {
        if (!auth || !user || !user.email) return;

        if (newPassword !== confirmNewPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match.' });
            return;
        }
        if (!currentPassword) {
            toast({ variant: 'destructive', title: 'Current password is required.' });
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Password Change Failed',
                description: error.message,
            });
        }
    };
    
    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return 'U';
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information and security settings.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={profilePictureUrl} alt={userProfile?.firstName} />
                                <AvatarFallback className="text-4xl">{getInitials(userProfile?.firstName, userProfile?.lastName)}</AvatarFallback>
                            </Avatar>
                            <Input 
                                id="profilePictureUrl" 
                                value={profilePictureUrl} 
                                onChange={(e) => setProfilePictureUrl(e.target.value)}
                                placeholder="Image URL"
                            />
                             <p className="text-xs text-muted-foreground">Enter a URL for your new profile picture.</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
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
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={email} disabled />
                            </div>
                        </CardContent>
                        <CardContent>
                            <Button onClick={handleProfileUpdate}>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                    <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                        <CardContent>
                            <Button onClick={handlePasswordChange}>Update Password</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
