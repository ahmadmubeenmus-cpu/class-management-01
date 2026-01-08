'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import Loading from "@/app/loading";

const NO_LAYOUT_ROUTES = ['/login', '/student/login', '/student/attendance'];

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLayoutRequired = !NO_LAYOUT_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) {
        return; // Wait until auth state is resolved
    }

    if (!user && isLayoutRequired) {
      router.push('/login');
    } else if (user && pathname === '/login') {
      router.push('/dashboard');
    }

    // Protect admin route
    if (pathname.startsWith('/admin') && !isAdmin) {
        router.push('/dashboard');
    }

  }, [user, isAdmin, isLoading, router, pathname, isLayoutRequired]);

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
