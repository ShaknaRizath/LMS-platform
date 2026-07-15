import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FinanceProgramsPage() {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Programs &amp; Fees</h1>
        <p className="text-muted-foreground">Set the tuition fee for each program's year and semester.</p>
      </div>

      {programs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active programs.</p>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <Link href={`/finance/programs/${program.id}`} className="font-medium hover:underline">
                      {program.code}
                    </Link>
                  </TableCell>
                  <TableCell>{program.name}</TableCell>
                  <TableCell>{program.durationYears} year(s)</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
