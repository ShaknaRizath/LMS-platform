"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Pin, Lock, MessagesSquare, Plus } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export type ThreadSummary = {
  id: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  authorName: string;
  createdAt: Date;
  postCount: number;
};

export function DiscussionThreadList({
  threads,
  basePath,
  createThreadAction,
}: {
  threads: ThreadSummary[];
  basePath: string;
  createThreadAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await createThreadAction(prevState, formData);
    if (!result?.error && !result?.fieldErrors) setOpen(false);
    return result;
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Discussions</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button"><Plus />New thread</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a new discussion</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input id="title" name="title" required />
                  <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="body">Message</FieldLabel>
                  <Textarea id="body" name="body" rows={4} required />
                  <FieldError errors={state?.fieldErrors?.body?.map((message) => ({ message }))} />
                </Field>
                {state?.error && <FieldError>{state.error}</FieldError>}
                <Button type="submit" disabled={pending}>
                  {pending ? "Posting..." : "Post thread"}
                </Button>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {threads.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquare />
            </EmptyMedia>
            <EmptyTitle>No discussions yet</EmptyTitle>
            <EmptyDescription>Start the first thread for this module.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <Link key={thread.id} href={`${basePath}/${thread.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{thread.title}</CardTitle>
                    {thread.isPinned && (
                      <Badge variant="secondary">
                        <Pin className="size-3" /> Pinned
                      </Badge>
                    )}
                    {thread.isLocked && (
                      <Badge variant="outline">
                        <Lock className="size-3" /> Locked
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {thread.authorName} · {thread.createdAt.toLocaleDateString()} · {thread.postCount}{" "}
                    {thread.postCount === 1 ? "reply" : "replies"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
