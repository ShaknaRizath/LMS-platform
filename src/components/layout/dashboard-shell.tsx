"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { SiteFooter } from "@/components/shared/site-footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  contentBackgroundClassName,
  children,
}: {
  roleLabel: string;
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  profileHref?: string;
  contentBackgroundClassName?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col bg-muted/30">
      <div className="flex min-h-screen flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-border bg-sidebar py-6 sm:flex",
            collapsed ? "w-16 items-center px-2" : "w-64 px-4"
          )}
        >
          <div className={cn("mb-6 flex items-center", collapsed ? "flex-col gap-3" : "justify-between px-2")}>
            {!collapsed && (
              <div>
                <p className="text-lg font-semibold text-sidebar-foreground">CIMS Campus</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            )}
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
          <nav className={cn("flex flex-1 flex-col gap-1", collapsed && "items-center")}>
            {navItems.map((item) =>
              collapsed ? (
                <CollapsedNavIcon key={item.href} {...item} />
              ) : (
                <NavLink key={item.href} {...item} />
              )
            )}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
            <div className="sm:hidden">
              <p className="text-sm font-semibold">CIMS Campus</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
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
