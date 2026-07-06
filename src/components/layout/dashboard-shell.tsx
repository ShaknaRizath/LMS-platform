import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardShell({
  roleLabel,
  navItems,
  userName,
  userEmail,
  children,
}: {
  roleLabel: string;
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 sm:flex">
        <div className="mb-6 px-2">
          <p className="text-lg font-semibold text-sidebar-foreground">
            CIMS Campus
          </p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
          <div className="sm:hidden">
            <p className="text-sm font-semibold">CIMS Campus</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{userName}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {userEmail}
              </p>
            </div>
            <Avatar className="size-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {initials(userName)}
              </AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
