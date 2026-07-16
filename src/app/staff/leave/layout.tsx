import { requireRole } from "@/lib/auth/rbac";
import { STAFF_ROLES } from "@/lib/validation/user.schema";

export default async function StaffLeaveLayout({ children }: { children: React.ReactNode }) {
  await requireRole(STAFF_ROLES);

  return <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">{children}</div>;
}
