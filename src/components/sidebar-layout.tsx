'use client';
import { useState } from "react";
import { Header } from "./header";
import { SidebarNav } from "./sidebar-nav";

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 border-r bg-background">
             <div className="p-4 border-b">
                 <h1 className="text-xl font-bold font-headline">AttendanceEase</h1>
             </div>
              <div className="flex-1 overflow-y-auto">
                 <SidebarNav />
              </div>
          </div>
      </aside>
      <div className="md:pl-64 flex flex-col flex-1">
          <Header open={isMobileMenuOpen} setOpen={setIsMobileMenuOpen} />
          {children}
      </div>
    </>
  );
}
