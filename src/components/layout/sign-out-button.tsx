import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth/logout.action";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut />
        Sign out
      </Button>
    </form>
  );
}
