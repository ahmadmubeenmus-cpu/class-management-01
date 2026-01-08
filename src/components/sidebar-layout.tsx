'use client';
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./header";
import { useUser } from "@/firebase/auth/use-user";
import Loading from "@/app/loading";

const NO_LAYOUT_ROUTES = ['/login', '/student/login', '/student/attendance'];

// Define permissions for each route
const ROUTE_PERMISSIONS: Record<string, keyof NonNullable<UserContextValue['userProfile']>['permissions']> = {
    '/dashboard': 'canViewDashboard',
    '/attendance': 'canMarkAttendance',
    '/records': 'canViewRecords',
    // Classes and Students pages don't have a specific permission in the model,
    // so we'll treat them as admin-only for now unless specified.
};

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, isAdmin, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLayoutRequired = !NO_LAYOUT_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) {
        return; // Wait until auth state is resolved
    }

    if (!user && isLayoutRequired) {
      router.replace('/login');
      return;
    } 
    
    if (user && pathname === '/login') {
      router.replace('/dashboard');
      return;
    }

    if(!isLayoutRequired) return;

    // If we have a user, check permissions
    if (userProfile) {
        // Admins can go anywhere
        if(isAdmin) return;

        // For non-admins, check route permissions
        const requiredPermission = ROUTE_PERMISSIONS[pathname];
        
        if (requiredPermission && !userProfile.permissions?.[requiredPermission]) {
             // Redirect if they lack permission for a specific route
             router.replace('/attendance'); // default page for them
             return;
        }

        // Block non-admins from admin, classes, and students pages
        if(pathname.startsWith('/admin') || pathname.startsWith('/classes') || pathname.startsWith('/students')) {
            router.replace('/attendance');
            return;
        }

        // If a non-admin lands on the root, redirect them to their default page
        if(pathname === '/dashboard' && !userProfile.permissions?.canViewDashboard) {
             router.replace('/attendance');
             return;
        }
    }


  }, [user, userProfile, isAdmin, isLoading, router, pathname, isLayoutRequired]);

  // If it's a protected route and we're still checking auth, show loading
  if (isLoading && isLayoutRequired) {
    return <Loading />;
  }
  
  // If it's a protected route and the user is not logged in,
  // we show a loading screen while the redirect happens.
  if (!user && isLayoutRequired) {
    return <Loading />;
  }
  
  // Render pages without the sidebar layout
  if (!isLayoutRequired) {
    return <>{children}</>;
  }


  return (
    <div className="flex flex-col flex-1 bg-muted/40 min-h-screen w-full">
        <Header />
        {children}
    </div>
  );
}
