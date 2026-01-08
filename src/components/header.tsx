import Link from 'next/link';
import { Sheet, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="flex w-full flex-row items-center justify-between">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline">AttendanceEase</h1>
        </Link>
        <Avatar>
          <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" />
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
      </nav>
    </header>
  );
}
