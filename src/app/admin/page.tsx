'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, PlusCircle, Upload } from 'lucide-react';
import { BulkUploadDialog } from '@/components/bulk-upload-dialog';
import { AddClassDialog } from '@/components/add-class-dialog';

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Controls</h1>
              <p className="text-muted-foreground">Manage users, courses, and application data.</p>
          </div>
      </div>
    
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>Add, remove, or edit users and their roles.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
             <Button disabled>
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Users
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Courses</CardTitle>
            <CardDescription>Create new courses for student enrollment.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <AddClassDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Class
                </Button>
            </AddClassDialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bulk Student Upload</CardTitle>
            <CardDescription>Bulk upload students to the system from a CSV file.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end gap-2">
            <BulkUploadDialog>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </BulkUploadDialog>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
