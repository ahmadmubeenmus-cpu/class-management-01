'use client';

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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  permissions: z.object({
    canMarkAttendance: z.boolean().default(false),
    canViewRecords: z.boolean().default(false),
    canViewDashboard: z.boolean().default(false),
  }),
});

type EditUserFormData = z.infer<typeof editUserSchema>;


interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (user) {
        reset({
            firstName: user.firstName,
            lastName: user.lastName,
            permissions: {
                canMarkAttendance: user.permissions?.canMarkAttendance ?? false,
                canViewRecords: user.permissions?.canViewRecords ?? false,
                canViewDashboard: user.permissions?.canViewDashboard ?? false,
            }
        });
    }
  }, [user, reset]);


  const onSubmit = async (data: EditUserFormData) => {
    if (!firestore || !user) return;

    const userRef = doc(firestore, 'users', user.id);
    
    try {
        await updateDocumentNonBlocking(userRef, {
            firstName: data.firstName,
            lastName: data.lastName,
            permissions: data.permissions
        });

        toast({
            title: 'User Updated',
            description: 'The user details have been successfully updated.',
            className: 'bg-accent text-accent-foreground'
        });

        onOpenChange(false);
    } catch(e) {
       toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update user.",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
            <DialogDescription>
              Update the user's details and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                <Input id="email" type="email" value={user.email} disabled />
            </div>

            <div className="space-y-2 pt-2">
                <Label>Permissions</Label>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="permissions.canMarkAttendance"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="perm-mark-attendance"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="perm-mark-attendance" className="font-normal">Can Mark Attendance</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Controller
                        name="permissions.canViewRecords"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="perm-view-records"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="perm-view-records" className="font-normal">Can View Records</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Controller
                        name="permissions.canViewDashboard"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="perm-view-dashboard"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="perm-view-dashboard" className="font-normal">Can View Dashboard</Label>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
