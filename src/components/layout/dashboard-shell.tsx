"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, ClipboardList, ListChecks, MessagesSquare, Megaphone, CalendarCheck, ClipboardCheck, CalendarClock } from "lucide-react";
import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { NotificationBell, type NotificationItem } from "@/components/layout/notification-bell";
import { SiteFooter } from "@/components/shared/site-footer";
import { LECTURER_PALETTE } from "@/components/lecturer/palette";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// While browsing inside a specific module, surface that module's Assignments/
// Quizzes/Discussions/Announcements as extra sidebar links — otherwise they're
// only reachable via header buttons on the module's own page.
function useLecturerModuleNavItems(pathname: string): NavItem[] {
  const match = pathname.match(/^\/lecturer\/modules\/([^/]+)/);
  const moduleId = match?.[1];
  if (!moduleId) return [];
  return [
    {
      href: `/lecturer/modules/${moduleId}/assignments`,
      label: "Assignments",
      icon: <ClipboardList className="size-4" style={{ color: LECTURER_PALETTE[0].accent }} />,
    },
    {
      href: `/lecturer/modules/${moduleId}/quizzes`,
      label: "Quizzes",
      icon: <ListChecks className="size-4" style={{ color: LECTURER_PALETTE[1].accent }} />,
    },
    {
      href: `/lecturer/modules/${moduleId}/discussions`,
      label: "Discussions",
      icon: <MessagesSquare className="size-4" style={{ color: LECTURER_PALETTE[2].accent }} />,
    },
    {
      href: `/lecturer/modules/${moduleId}/announcements`,
      label: "Announcements",
      icon: <Megaphone className="size-4" style={{ color: LECTURER_PALETTE[3].accent }} />,
    },
    {
      href: `/lecturer/modules/${moduleId}/attendance`,
      label: "Attendance",
      icon: <CalendarCheck className="size-4" style={{ color: LECTURER_PALETTE[4].accent }} />,
    },
    {
      href: `/lecturer/modules/${moduleId}/gradebook`,
      label: "Grade Book",
      icon: <ClipboardCheck className="size-4" style={{ color: LECTURER_PALETTE[0].accent }} />,
    },
  ];
}

export type NavItem = { href: string; label: string; icon: React.ReactNode };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CollapsedNavIcon({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = href === pathname || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function DashboardShell({
  roleLabel,
  navItems,
  userName,
  userEmail,
  profileHref,
  notifications,
  leaveHref,
  contentBackgroundClassName,
  children,
}: {
  roleLabel: string;
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  profileHref?: string;
  notifications?: NotificationItem[];
  leaveHref?: string;
  contentBackgroundClassName?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const moduleNavItems = useLecturerModuleNavItems(pathname);

  return (
    <div className="flex w-full flex-col bg-muted/30">
      <div className="flex min-h-screen flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-border bg-sidebar py-6 sm:flex",
            collapsed ? "w-16 items-center px-2" : "w-64 px-4"
          )}
        >
          <div className={cn("mb-6 flex flex-col gap-3", !collapsed && "px-2")}>
            <div className={cn("flex items-center", collapsed ? "flex-col gap-3" : "justify-between")}>
              <Image
                src="/cims-logo.png"
                alt="CIMS Campus"
                width={40}
                height={40}
                className="rounded-full"
                priority
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setCollapsed((prev) => !prev)}
                    >
                      <PanelLeft className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent side={collapsed ? "right" : "bottom"}>
                  {collapsed ? "Open sidebar" : "Close sidebar"}
                </TooltipContent>
              </Tooltip>
            </div>
            {!collapsed && (
              <div>
                <p className="text-lg font-semibold text-sidebar-foreground">CIMS Campus</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            )}
          </div>
          <nav className={cn("flex flex-1 flex-col gap-1", collapsed && "items-center")}>
            {navItems.map((item) =>
              collapsed ? (
                <CollapsedNavIcon key={item.href} {...item} />
              ) : (
                <NavLink key={item.href} {...item} />
              )
            )}
            {moduleNavItems.length > 0 && (
              <>
                <Separator className="my-2" />
                {!collapsed && (
                  <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">This module</p>
                )}
                {moduleNavItems.map((item) =>
                  collapsed ? (
                    <CollapsedNavIcon key={item.href} {...item} />
                  ) : (
                    <NavLink key={item.href} {...item} />
                  )
                )}
              </>
            )}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
            <div className="flex items-center gap-2 sm:hidden">
              <Image src="/cims-logo.png" alt="CIMS Campus" width={28} height={28} className="rounded-full" />
              <div>
                <p className="text-sm font-semibold">CIMS Campus</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {leaveHref && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={leaveHref}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      />
                    }
                  >
                    <CalendarClock className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">My Leave</TooltipContent>
                </Tooltip>
              )}
              {notifications && <NotificationBell items={notifications} />}
              {profileHref ? (
                <ProfileMenu userName={userName} userEmail={userEmail} profileHref={profileHref} />
              ) : (
                <>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium leading-tight">{userName}</p>
                    <p className="text-xs leading-tight text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                      {initials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <SignOutButton />
                </>
              )}
            </div>
          </header>
          <main className={cn("flex-1 px-6 py-6", contentBackgroundClassName)}>{children}</main>
        </div>
      </div>

      {pathname === "/student" && <SiteFooter />}
    </div>
  );
}
