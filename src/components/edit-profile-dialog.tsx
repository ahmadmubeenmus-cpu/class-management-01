'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { updatePassword } from 'firebase/auth';
import { doc, DocumentData } from 'firebase/firestore';

export function EditProfileDialog() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const adminRef = useMemoFirebase(() => user ? doc(firestore, 'admins', user.uid) : null, [user, firestore]);
  const { data: adminData } = useDoc<DocumentData>(adminRef);
  
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (adminData) {
      setUsername(adminData.username || '');
      setFirstName(adminData.firstName || '');
      setLastName(adminData.lastName || '');
    }
  }, [adminData]);


  const handleSave = async () => {
    if (!user || !adminRef) return;

    // Update profile data
    updateDocumentNonBlocking(adminRef, { username, firstName, lastName });
    
    // Update password if fields are filled and match
    if (password) {
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match.' });
            return;
        }
        try {
            await updatePassword(user, password);
            toast({ title: 'Password updated successfully.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Password Update Error', description: error.message });
            return; // Don't close dialog on password error
        }
    }

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
      className: 'bg-accent text-accent-foreground',
    });
    setOpen(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
            <DialogDescription>
              Update your personal details and password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
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
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
