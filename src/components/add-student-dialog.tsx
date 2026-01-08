'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
  children?: React.ReactNode;
}

export function AddStudentDialog({ open, onOpenChange, courseId, children }: AddStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    if (!firstName || !lastName || !email) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please fill out all fields.",
        });
        return;
    }
    
    if (!email.includes('@')) {
        toast({
            variant: "destructive",
            title: "Invalid Email",
            description: "Please enter a valid email address.",
        });
        return;
    }

    const studentsCol = collection(firestore, 'students');
    try {
      const newStudentRef = doc(studentsCol); // create a ref with an auto-generated ID
      
      const rollNo = email.split('@')[0];
      const password = generateRandomString(12);

      // 1. Create student document
      await setDocumentNonBlocking(newStudentRef, {
        id: newStudentRef.id,
        rollNo: rollNo,
        password: password,
        firstName,
        lastName,
        email,
      }, {});

      // 2. If a courseId is provided, enroll the student in that course
      if (courseId) {
        const courseStudentRef = doc(firestore, `courses/${courseId}/students/${newStudentRef.id}`);
        await setDocumentNonBlocking(courseStudentRef, {
          studentId: newStudentRef.id,
          courseId: courseId
        }, {});
         toast({
            title: 'Student Added & Enrolled',
            description: `Roll No: ${rollNo} | Password: ${password}`,
            className: 'bg-accent text-accent-foreground',
            duration: 15000,
          });
      } else {
         toast({
            title: 'Student Added',
            description: `Roll No: ${rollNo} | Password: ${password}`,
            className: 'bg-accent text-accent-foreground',
            duration: 15000,
          });
      }
      
      onOpenChange(false);
      setFirstName('');
      setLastName('');
      setEmail('');

    } catch(e) {
       toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add student.",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              {courseId 
                ? "Enter student details. Roll No. and password will be auto-generated."
                : "Enter student details. Roll No. and password will be auto-generated."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button type="submit">Save Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
