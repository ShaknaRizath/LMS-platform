import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold text-foreground">
        403 — Not authorized
      </h1>
      <p className="max-w-md text-muted-foreground">
        You don&apos;t have permission to view this page. If you think this
        is a mistake, contact your administrator.
      </p>
      <Button nativeButton={false} render={<Link href="/login" />}>
        Back to sign in
      </Button>
    </div>
  );
}
