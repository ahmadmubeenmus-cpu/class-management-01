'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, UserPlus } from 'lucide-react';
import { EditProfileDialog } from './edit-profile-dialog';

export function AdminTab() {
  return (
    <div className="flex flex-col gap-4 md:gap-8 mt-4">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin Controls</h2>
                <p className="text-muted-foreground">Manage users, courses, and application data.</p>
            </div>
            <EditProfileDialog />
        </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>Add, remove, or edit users and their roles.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
             <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Users
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Courses</CardTitle>
            <CardDescription>Create new courses and enroll students.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Manage Courses
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Students</CardTitle>
            <CardDescription>Bulk upload or manually add students.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end gap-2">
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
