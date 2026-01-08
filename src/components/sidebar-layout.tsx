'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import Loading from "@/app/loading";

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="flex flex-col flex-1">
        <Header />
        {children}
    </div>
  );
}
