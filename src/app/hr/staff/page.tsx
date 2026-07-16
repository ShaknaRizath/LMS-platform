import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function HrStaffDirectoryPage() {
  await requireRole(["HR_OFFICER"]);

  const staff = await prisma.user.findMany({
    where: { role: { not: "STUDENT" } },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Staff Directory</h1>
        <p className="text-muted-foreground">Every staff account and its employment record.</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead>Contract ends</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.jobTitle ?? "—"}</TableCell>
                <TableCell>{member.department ?? "—"}</TableCell>
                <TableCell>{member.employmentType ?? "—"}</TableCell>
                <TableCell>{member.contractEndDate?.toLocaleDateString() ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={member.isActive ? "secondary" : "destructive"}>
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/hr/staff/${member.id}`}
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
