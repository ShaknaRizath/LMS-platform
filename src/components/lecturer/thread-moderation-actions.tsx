"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pin, PinOff, Lock, LockOpen, Trash2 } from "lucide-react";
import { pinThread, lockThread, deleteThread } from "@/lib/actions/discussion.actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function ThreadModerationActions({
  threadId,
  moduleId,
  isPinned,
  isLocked,
}: {
  threadId: string;
  moduleId: string;
  isPinned: boolean;
  isLocked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => pinThread(threadId, moduleId, !isPinned))}
      >
        {isPinned ? <PinOff /> : <Pin />}
        {isPinned ? "Unpin" : "Pin"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => lockThread(threadId, moduleId, !isLocked))}
      >
        {isLocked ? <LockOpen /> : <Lock />}
        {isLocked ? "Unlock" : "Lock"}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button type="button" variant="ghost" size="icon-sm">
              <Trash2 />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this thread?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the thread and all its replies. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTransition(async () => {
                  await deleteThread(threadId, moduleId);
                  router.push(`/lecturer/modules/${moduleId}/discussions`);
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
