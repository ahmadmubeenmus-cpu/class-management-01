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
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';


interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

export function EditStudentDialog({ open, onOpenChange, student }: EditStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [rollNo, setRollNo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (student) {
        setRollNo(student.rollNo);
        setFirstName(student.firstName);
        setLastName(student.lastName);
        setEmail(student.email);
        setPassword(student.password || '');
    }
  }, [student]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !student) return;
    if (!rollNo || !firstName || !lastName || !email) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please fill out all required fields.",
        });
        return;
    }

    const studentRef = doc(firestore, 'students', student.id);
    
    try {
        const updateData: Partial<Student> = {
            rollNo,
            firstName,
            lastName,
            email,
        };
        // Only update password if it has been changed
        if (password && password !== student.password) {
            updateData.password = password;
        }

        await updateDocumentNonBlocking(studentRef, updateData);

        toast({
            title: 'Student Updated',
            description: 'The student details have been successfully updated.',
            className: 'bg-accent text-accent-foreground'
        });

        onOpenChange(false);
    } catch(e) {
       toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update student.",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the details for this student. The Roll No. should be derived from the email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollNo" className="text-right">
                Roll No.
              </Label>
              <Input id="rollNo" value={rollNo} onChange={e => setRollNo(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input id="password" type="text" value={password} onChange={e => setPassword(e.target.value)} className="col-span-3" placeholder="Leave blank to keep unchanged" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
