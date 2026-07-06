import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramForm } from "@/components/admin/program-form";
import { createProgram } from "@/lib/actions/admin/program.actions";

export default function NewProgramPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">New program</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Program details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramForm action={createProgram} submitLabel="Create program" />
        </CardContent>
      </Card>
    </div>
  );
}
