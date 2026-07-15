"use client";

import { useTransition } from "react";
import { lockModuleGrades, unlockModuleGrades } from "@/lib/actions/examinations/grade-lock.actions";
import { Button } from "@/components/ui/button";

export function ModuleGradeLockToggle({ moduleId, locked }: { moduleId: string; locked: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={locked ? "outline" : "default"}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(() => (locked ? unlockModuleGrades(moduleId) : lockModuleGrades(moduleId)))
      }
    >
      {pending ? "Saving..." : locked ? "Unlock marks" : "Lock marks"}
    </Button>
  );
}
