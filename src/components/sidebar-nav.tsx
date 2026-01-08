'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookUser, Users, School, Database, User, UserCog } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useUser } from "@/firebase/auth/use-user";

const allNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredPermission: 'canViewDashboard' },
    { href: "/classes", label: "Classes", icon: School },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendance", label: "Attendance", icon: BookUser, requiredPermission: 'canMarkAttendance' },
    { href: "/records", label: "Records", icon: Database, requiredPermission: 'canViewRecords' },
    { href: "/profile", label: "Profile", icon: UserCog },
    { href: "/admin", label: "Admin", icon: User, adminOnly: true },
]

export function SidebarNav({ onLinkClick, isCollapsed }: { onLinkClick?: () => void, isCollapsed?: boolean }) {
  const pathname = usePathname();
  const { isAdmin, userProfile } = useUser();

  const navItems = allNavItems.filter(item => {
    if (item.adminOnly) {
        return isAdmin;
    }
    if (isAdmin) {
        return true; // Admins see everything
    }
    if (item.requiredPermission) {
        return userProfile?.permissions?.[item.requiredPermission as keyof typeof userProfile.permissions] ?? false;
    }
    // Items without specific permissions are visible to non-admins by default
    // unless they are adminOnly
    return true;
  })

  const renderLink = (item: typeof navItems[number], isMobile: boolean) => {
    const isActive = (pathname.startsWith(item.href) && item.href !== "/") || (pathname === "/" && item.href === "/dashboard");
    
    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive && "text-primary",
          isMobile && "text-lg justify-start",
          !isMobile && !isCollapsed && "text-sm",
          !isMobile && isCollapsed && "justify-center"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span className={cn(
          (!isMobile && isCollapsed) && "hidden",
          isMobile && "ml-2"
        )}>{item.label}</span>
      </Link>
    );

    if (!isMobile && isCollapsed) {
        return (
            <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        )
    }

    return linkContent;
  }

  return (
    <TooltipProvider>
      <nav className={cn(
        "grid items-start text-sm font-medium md:flex md:flex-row md:gap-2",
        onLinkClick ? "grid p-2" : "hidden" // Use grid for mobile sheet, hidden on desktop header
        )}>
        {navItems.map((item) => renderLink(item, !!onLinkClick))}
      </nav>
    </TooltipProvider>
  );
}
