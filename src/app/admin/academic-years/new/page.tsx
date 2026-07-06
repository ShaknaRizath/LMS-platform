import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicYearForm } from "@/components/admin/academic-year-form";
import { createAcademicYear } from "@/lib/actions/admin/academic-year.actions";

export default function NewAcademicYearPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">New academic year</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Academic year details</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicYearForm action={createAcademicYear} submitLabel="Create academic year" />
        </CardContent>
      </Card>
    </div>
  );
}
