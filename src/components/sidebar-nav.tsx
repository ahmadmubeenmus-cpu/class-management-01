'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookUser, Users, School, User, Database } from "lucide-react";
import { Badge } from "./ui/badge";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/classes", label: "Classes", icon: School },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendance", label: "Attendance", icon: BookUser },
    { href: "/records", label: "Records", icon: Database },
    { href: "/admin", label: "Admin", icon: User },
]

export function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start p-2 text-sm font-medium">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname.startsWith(href) && href !== "/" && "bg-muted text-primary",
            pathname === "/" && href === "/dashboard" && "bg-muted text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
