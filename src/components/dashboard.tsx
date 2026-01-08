import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from '@/components/dashboard-tab';
import { ClassesTab } from '@/components/classes-tab';
import { ReportsTab } from '@/components/reports-tab';
import { LayoutDashboard, BookUser, FileText, Users } from 'lucide-react';
import { AdminTab } from './admin-tab';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Check if the current user has a document in the 'admins' collection
  const adminDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'admins', user.uid);
  }, [user, firestore]);
  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = adminDoc && adminDoc.id === user?.uid;

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
              {!isAdminLoading && isAdmin && (
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
