'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { deleteUser } from '@/ai/flows/delete-user-flow';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { EditUserDialog } from './edit-user-dialog';


const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  permissions: z.object({
    canMarkAttendance: z.boolean().default(false),
    canViewRecords: z.boolean().default(false),
    canViewDashboard: z.boolean().default(false),
  }),
});

type UserFormData = z.infer<typeof userSchema>;

interface ManageUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageUsersDialog({ open, onOpenChange }: ManageUsersDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading, error: usersError } = useCollection<UserProfile>(usersQuery);

  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      permissions: {
        canMarkAttendance: true,
        canViewRecords: false,
        canViewDashboard: true,
      }
    }
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleAddUser = async (data: UserFormData) => {
    if (!auth || !firestore) return;
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      // 2. Create user profile in Firestore
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        id: newUser.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: 'user',
        permissions: data.permissions,
        username: data.email, // Or generate a username
      });

      toast({
          title: 'User Created',
          description: `User ${data.email} has been created successfully.`,
          className: 'bg-accent text-accent-foreground'
      });
      reset();

    } catch(e: any) {
        let errorMessage = "An unexpected error occurred.";
        if (e.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use by another account.';
        } else if (e.message) {
            errorMessage = e.message;
        }
        toast({
            variant: "destructive",
            title: "Error Creating User",
            description: errorMessage,
        });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
        await deleteUser({ userId });
        toast({
            title: 'User Deleted',
            description: 'The user has been permanently deleted.',
            className: 'bg-accent text-accent-foreground',
        });
    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: e.message || 'Could not delete user.',
        });
    }
  }

  const handleDeleteAllUsers = async () => {
    if (!users || users.length === 0) {
      toast({ title: 'No users to delete.' });
      return;
    }
    try {
      for (const user of users) {
        await deleteUser({ userId: user.id });
      }
      toast({
        title: 'All Users Deleted',
        description: 'All non-admin user profiles have been deleted.',
        className: 'bg-accent text-accent-foreground',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'An error occurred while deleting all users.',
      });
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Manage Users</DialogTitle>
          <DialogDescription>
            Add, edit, or remove users with limited access.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            {/* Add User Form */}
            <div className="space-y-4 md:col-span-1">
                <h3 className="font-semibold text-lg">Add New User</h3>
                <form onSubmit={handleSubmit(handleAddUser)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register('firstName')} />
                            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register('lastName')} />
                             {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register('password')} />
                         {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="flex items-center space-x-2">
                           <Controller
                                name="permissions.canMarkAttendance"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="canMarkAttendance"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="canMarkAttendance" className="font-normal">Can Mark Attendance</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="permissions.canViewRecords"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="canViewRecords"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="canViewRecords" className="font-normal">Can View Records</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Controller
                                name="permissions.canViewDashboard"
                                control={control}
                                render={({ field }) => (
                                     <Checkbox
                                        id="canViewDashboard"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="canViewDashboard" className="font-normal">Can View Dashboard</Label>
                        </div>
                    </div>
                    <Button type="submit">Add User</Button>
                </form>
            </div>

            {/* Users List */}
            <div className="space-y-4 md:col-span-2">
                 <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Existing Users</h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={!users || users.length === 0}>
                                Delete All Users
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all non-admin user accounts.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAllUsers}>
                                    Yes, delete all users
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </div>
                 <div className="border rounded-md max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersLoading && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
                            {!usersLoading && users?.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-muted-foreground">
                                           <span>{user.permissions?.canMarkAttendance ? '✓' : '✗'} Mark Attendance</span>
                                           <span>{user.permissions?.canViewRecords ? '✓' : '✗'} View Records</span>
                                           <span>{user.permissions?.canViewDashboard ? '✓' : '✗'} View Dashboard</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user's account and all associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {!usersLoading && !users?.length && <TableRow><TableCell colSpan={4} className="text-center">No users found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                 </div>
            </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {selectedUser && (
        <EditUserDialog
            open={isEditUserDialogOpen}
            onOpenChange={setIsEditUserDialogOpen}
            user={selectedUser}
        />
    )}
    </>
  );
}
    
