'use client';

import { useState } from 'react';
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
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

export function BulkUploadDialog() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file || !firestore) {
        toast({
            variant: "destructive",
            title: "No file selected",
            description: "Please select a CSV file to upload.",
        });
      return;
    }
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const students = results.data as { studentId: string; name: string }[];
        if (!students.length || !results.meta.fields?.includes('studentId') || !results.meta.fields?.includes('name')) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Format',
                description: 'The CSV file is empty or does not contain the required headers: "studentId" and "name".',
            });
            setIsUploading(false);
            return;
        }

        try {
            const batch = writeBatch(firestore);
            const studentsCollection = collection(firestore, 'students');

            students.forEach(student => {
                if (student.studentId && student.name) {
                    const nameParts = student.name.trim().split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    const email = `${student.studentId.replace(/\s/g, '')}@example.com`;

                    const newStudentRef = doc(studentsCollection);
                    
                    batch.set(newStudentRef, {
                        id: newStudentRef.id,
                        studentId: student.studentId,
                        firstName,
                        lastName,
                        email,
                    });
                }
            });
            
            await batch.commit();

            toast({
                title: 'Upload Successful',
                description: `${students.length} students have been added.`,
                className: 'bg-accent text-accent-foreground',
            });

        } catch (error) {
            console.error("Error uploading students: ", error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'An error occurred while uploading the students.',
            });
        } finally {
            setIsUploading(false);
            setFile(null);
            setOpen(false);
        }
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        toast({
          variant: 'destructive',
          title: 'CSV Parsing Error',
          description: 'Failed to parse the CSV file. Please check its format.',
        });
        setIsUploading(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Upload className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Bulk Upload
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Student Upload</DialogTitle>
          <DialogDescription>
            Upload a CSV file with student details. The file must contain 'studentId' (roll number) and 'name' columns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
            <Label htmlFor="file-upload" className="sr-only">Upload file</Label>
            <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
        </div>
        <p className="text-sm text-muted-foreground">
            Download a{' '}
            <a href="/sample-students.csv" download className="underline font-medium">sample template</a>
            {' '}to see the required format.
        </p>
        <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={handleUpload} disabled={isUploading || !file}>
                {isUploading ? 'Uploading...' : 'Upload and Process'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
