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
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BulkUploadDialog() {
    const { toast } = useToast();

    const handleUpload = () => {
        // In a real app, you'd process the uploaded file here.
        toast({
          title: 'Upload Successful',
          description: 'Student roster has been updated.',
          className: 'bg-accent text-accent-foreground'
        });
    }

  return (
    <Dialog>
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
            Upload a CSV file with student details. The file should contain 'studentId' and 'name' columns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
            <Label htmlFor="file-upload" className="sr-only">Upload file</Label>
            <Input id="file-upload" type="file" accept=".csv" />
        </div>
        <p className="text-sm text-muted-foreground">
            Download a{' '}
            <a href="#" className="underline font-medium">sample template</a>
            {' '}to see the required format.
        </p>
        <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={handleUpload}>
                Upload and Process
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
