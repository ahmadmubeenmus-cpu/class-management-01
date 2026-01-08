'use client';
import Link from 'next/link';
import { GraduationCap, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { SidebarNav } from './sidebar-nav';

interface HeaderProps {
    isMobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Header({ isMobileMenuOpen, setMobileMenuOpen, isSidebarCollapsed, toggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden w-full flex-row items-center justify-between md:flex">
         <div className='flex items-center gap-4'>
            <Button variant="outline" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
            >
                <GraduationCap className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-headline">AttendanceEase</h1>
            </Link>
         </div>
        <Avatar>
          <AvatarImage src="https://picsum.photos/seed/admin/40/40" alt="Admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </nav>
       <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
            <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
            <div className="border-b p-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="">AttendanceEase</span>
                </Link>
            </div>
            <SidebarNav onLinkClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
       <div className='flex w-full justify-end md:hidden'>
        <Avatar>
            <AvatarImage src="https://picsum.photos/seed/admin/40/40" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
        </Avatar>
       </div>
    </header>
  );
}
