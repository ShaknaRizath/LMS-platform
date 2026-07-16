"use client";

import { useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
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

export type PostSummary = {
  id: string;
  body: string;
  authorName: string;
  createdAt: Date;
  canDelete: boolean;
};

export function DiscussionThreadView({
  thread,
  moduleId,
  posts,
  replyAction,
  deletePostAction,
  moderationActions,
}: {
  thread: { id: string; title: string; body: string; authorName: string; createdAt: Date; isLocked: boolean };
  moduleId: string | null;
  posts: PostSummary[];
  replyAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  deletePostAction: (postId: string, threadId: string, moduleId: string | null) => Promise<void>;
  moderationActions?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(replyAction, undefined);
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{thread.title}</h1>
          <p className="text-sm text-muted-foreground">
            {thread.authorName} · {thread.createdAt.toLocaleDateString()}
            {thread.isLocked && (
              <>
                {" "}
                · <Badge variant="outline">Locked</Badge>
              </>
            )}
          </p>
        </div>
        {moderationActions}
      </div>

      <p className="whitespace-pre-wrap rounded-lg border border-border bg-card p-4 text-sm">{thread.body}</p>

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {post.authorName} · {post.createdAt.toLocaleDateString()}
              </p>
              <p className="whitespace-pre-wrap text-sm">{post.body}</p>
            </div>
            {post.canDelete && (
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
                    <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
                    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => startTransition(() => deletePostAction(post.id, thread.id, moduleId))}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>

      {!thread.isLocked && (
        <form action={formAction} className="flex flex-col gap-2">
          <FieldGroup>
            <Field>
              <Textarea name="body" rows={3} placeholder="Write a reply..." required />
              <FieldError errors={state?.fieldErrors?.body?.map((message) => ({ message }))} />
            </Field>
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? "Posting..." : "Reply"}
            </Button>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
