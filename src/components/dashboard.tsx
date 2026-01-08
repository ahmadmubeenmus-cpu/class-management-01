import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from '@/components/dashboard-tab';
import { ClassesTab } from '@/components/classes-tab';
import { ReportsTab } from '@/components/reports-tab';
import { LayoutDashboard, BookUser, FileText, Users } from 'lucide-react';
import { AdminTab } from './admin-tab';
import { useUser } from '@/firebase';

export function Dashboard() {
  const { user, isUserLoading } = useUser();

  const isAdmin = user?.email === 'admin@example.com';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Tabs defaultValue="dashboard" className="grid w-full">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="classes">
                <BookUser className="mr-2 h-4 w-4" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
              {/* Conditionally render the Admin tab based on user's role */}
              {!isUserLoading && isAdmin && (
                <TabsTrigger value="admin">
                  <Users className="mr-2 h-4 w-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="classes">
            <ClassesTab />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="admin">
              <AdminTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
