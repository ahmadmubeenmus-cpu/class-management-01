'use client';
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./header";
import { useUser } from "@/firebase/auth/use-user";
import Loading from "@/app/loading";

const NO_LAYOUT_ROUTES = ['/login', '/student/login', '/student/attendance'];

// Define permissions for each route
const ROUTE_PERMISSIONS: Record<string, keyof NonNullable<UserProfile['permissions']>> = {
    '/dashboard': 'canViewDashboard',
    '/attendance': 'canMarkAttendance',
    '/records': 'canViewRecords',
    // Classes and Students pages are admin only. Profile is for all users.
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

    // If user is not logged in but trying to access a protected page, redirect to login
    if (!user && isLayoutRequired) {
      router.replace('/login');
      return;
    } 
    
    // If user is logged in and tries to go to login, redirect to dashboard
    if (user && pathname === '/login') {
      router.replace('/dashboard');
      return;
    }

    // If the route doesn't require the main layout, do nothing further.
    if(!isLayoutRequired) return;

    // From here on, we have a logged-in user on a protected route.
    // Check their permissions.
    if (userProfile) {
        // Admins can go anywhere, so no more checks needed for them.
        if(isAdmin) return;

        // --- NON-ADMIN USER LOGIC ---
        
        // Define pages that are strictly admin-only
        const adminOnlyPages = ['/admin', '/classes', '/students'];
        if (adminOnlyPages.some(p => pathname.startsWith(p))) {
            router.replace('/attendance'); // Redirect non-admins away
            return;
        }

        // Check permission for the specific page they are on
        const requiredPermission = ROUTE_PERMISSIONS[pathname];
        if (requiredPermission && !userProfile.permissions?.[requiredPermission]) {
             // Redirect if they lack permission for a specific route
             // Their default page is /attendance
             router.replace('/attendance'); 
             return;
        }

        // Special case: If a non-admin lands on the dashboard but lacks permission, redirect them.
        if(pathname === '/dashboard' && !userProfile.permissions?.canViewDashboard) {
             router.replace('/attendance');
             return;
        }
    }


  }, [user, userProfile, isAdmin, isLoading, router, pathname, isLayoutRequired]);

  // If it's a protected route and we're still checking auth, show a global loading screen.
  if (isLoading && isLayoutRequired) {
    return <Loading />;
  }
  
  // If it's a protected route and there's no user, show loading while the redirect to /login happens.
  if (!user && isLayoutRequired) {
    return <Loading />;
  }
  
  // Render pages without the sidebar/header layout (e.g., login page)
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
