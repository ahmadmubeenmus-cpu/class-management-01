'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./header";
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import Loading from "@/app/loading";

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, isAdmin, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedState = localStorage.getItem('sidebar-collapsed');
    if (storedState) {
      setIsSidebarCollapsed(JSON.parse(storedState));
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
        return; // Wait until auth state is resolved
    }

    if (!user && pathname !== '/login') {
      router.push('/login');
    } else if (user && pathname === '/login') {
      router.push('/dashboard');
    }

    // Protect admin route
    if (pathname.startsWith('/admin') && !isAdmin) {
        router.push('/dashboard');
    }

  }, [user, isAdmin, isLoading, router, pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => {
        const newState = !prevState;
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
        return newState;
    });
  };

  // If it's a protected route and we're still checking auth, show loading
  if (isLoading && pathname !== '/login') {
    return <Loading />;
  }
  
  // If it's a protected route and the user is not logged in,
  // we show a loading screen while the redirect happens.
  if (!user && pathname !== '/login') {
    return <Loading />;
  }
  
  // Render login page without the sidebar layout
  if (pathname === '/login') {
    return <>{children}</>;
  }


  return (
    <>
      <aside className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300",
        isSidebarCollapsed ? "md:w-16" : "md:w-64"
        )}>
          <div className="flex-1 flex flex-col min-h-0 border-r bg-background">
             <div className={cn(
                 "p-4 border-b flex items-center gap-2",
                 isSidebarCollapsed && "justify-center"
                )}>
                 <h1 className={cn(
                     "text-xl font-bold font-headline",
                     isSidebarCollapsed && "hidden"
                     )}>Class Managment</h1>
             </div>
              <div className="flex-1 overflow-y-auto">
                 <SidebarNav isCollapsed={isSidebarCollapsed} />
              </div>
          </div>
      </aside>
      <div className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
          )}>
          <Header 
            isMobileMenuOpen={isMobileMenuOpen} 
            setMobileMenuOpen={setIsMobileMenuOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
           />
          {children}
      </div>
    </>
  );
}
