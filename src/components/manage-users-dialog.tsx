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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { createUser } from '@/ai/flows/create-user-flow';

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

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

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

  const handleAddUser = async (data: UserFormData) => {
    try {
        const result = await createUser(data);
        if (result.success) {
            toast({
                title: 'User Created',
                description: `User ${data.email} has been created successfully.`,
                className: 'bg-accent text-accent-foreground'
            });
            reset();
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message || 'Failed to create user.',
            });
        }
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: e.message || "An unexpected error occurred.",
        });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!firestore) return;
    // NOTE: This only deletes the Firestore document, not the Firebase Auth user.
    // A Genkit flow would be needed for a complete deletion.
    await deleteDoc(doc(firestore, 'users', userId));
     toast({
      title: 'User Deleted',
      description: 'The user has been removed from the database.',
      className: 'bg-accent text-accent-foreground',
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Users</DialogTitle>
          <DialogDescription>
            Add, edit, or remove users with limited access.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Add User Form */}
            <div className="space-y-4">
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
                            <Label htmlFor="canMarkAttendance">Can Mark Attendance</Label>
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
                            <Label htmlFor="canViewRecords">Can View Records</Label>
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
                            <Label htmlFor="canViewDashboard">Can View Dashboard</Label>
                        </div>
                    </div>
                    <Button type="submit">Add User</Button>
                </form>
            </div>

            {/* Users List */}
            <div className="space-y-4">
                 <h3 className="font-semibold text-lg">Existing Users</h3>
                 <div className="border rounded-md max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersLoading && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                            {!usersLoading && users?.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {!usersLoading && !users?.length && <TableRow><TableCell colSpan={3} className="text-center">No users found.</TableCell></TableRow>}
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
  );
}
    