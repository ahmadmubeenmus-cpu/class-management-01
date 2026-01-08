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
import { useState } from 'react';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
}

export function AddStudentDialog({ open, onOpenChange, courseId }: AddStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !courseId) return;
    if (!studentId || !firstName || !lastName || !email) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please fill out all fields.",
        });
        return;
    }

    const studentsCol = collection(firestore, 'students');
    try {
      const newStudentRef = doc(studentsCol); // create a ref with an auto-generated ID
      
      // 1. Create student document
      await setDocumentNonBlocking(newStudentRef, {
        id: newStudentRef.id,
        studentId,
        firstName,
        lastName,
        email,
      }, {});

      // 2. Enroll the student in the course
      const courseStudentRef = doc(firestore, `courses/${courseId}/students/${newStudentRef.id}`);
      await setDocumentNonBlocking(courseStudentRef, {
        studentId: newStudentRef.id,
        courseId: courseId
      }, {});
      
      toast({
        title: 'Student Added & Enrolled',
        description: 'The new student has been successfully created and enrolled in the class.',
        className: 'bg-accent text-accent-foreground'
      });
      
      onOpenChange(false);
      setStudentId('');
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the details for the new student. They will be automatically enrolled in the selected class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student ID
              </Label>
              <Input id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} className="col-span-3" />
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
          </div>
          <DialogFooter>
            <Button type="submit">Save Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
