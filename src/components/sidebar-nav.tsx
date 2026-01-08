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

  return (
    <TooltipProvider>
      <nav className={cn(
        "grid items-start text-sm font-medium",
        isCollapsed ? "p-2" : "p-2"
        )}>
        {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = (pathname.startsWith(href) && href !== "/") || (pathname === "/" && href === "/dashboard");
            
            const linkContent = (
              <Link
                key={href}
                href={href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className={cn(isCollapsed && "hidden")}>{label}</span>
              </Link>
            );

            return isCollapsed ? (
                <Tooltip key={href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
            ) : (
                linkContent
            );
        })}
      </nav>
    </TooltipProvider>
  );
}
