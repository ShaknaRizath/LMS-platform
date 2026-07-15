"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ContentItemCard, type ContentItemData } from "@/components/lecturer/content-item-card";
import { ContentItemForm } from "@/components/lecturer/content-item-form";
import { createContentItem, reorderContentItems } from "@/lib/actions/lecturer/module-content.actions";
import { deleteWeek } from "@/lib/actions/lecturer/week.actions";

export function WeekPanel({
  week,
  moduleId,
  categories = [],
}: {
  week: { id: string; weekNumber: number; title: string | null; contentItems: ContentItemData[] };
  moduleId: string;
  categories?: { id: string; name: string }[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const items = [...week.contentItems];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    startTransition(() => reorderContentItems(week.id, moduleId, items.map((i) => i.id)));
  }

  return (
    <AccordionItem value={week.id} className="rounded-xl border border-border bg-card px-4">
      <AccordionTrigger className="text-base font-medium">
        Week {week.weekNumber}
        {week.title ? ` — ${week.title}` : ""}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pb-4">
        {week.contentItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {week.contentItems.map((item, index) => (
              <ContentItemCard
                key={item.id}
                item={item}
                moduleId={moduleId}
                canMoveUp={index > 0}
                canMoveDown={index < week.contentItems.length - 1}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                categories={categories}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No content yet in this week.</p>
        )}

        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger
              render={
                <Button type="button" variant="outline" size="sm">
                  <Plus />
                  Add content
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add content to Week {week.weekNumber}</DialogTitle>
              </DialogHeader>
              <ContentItemForm
                action={createContentItem.bind(null, week.id, moduleId)}
                submitLabel="Add content"
                onSuccess={() => setAddOpen(false)}
                categories={categories}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="ghost" size="sm">
                  <Trash2 />
                  Delete week
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Week {week.weekNumber}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this week and all {week.contentItems.length} content item(s) in it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => startTransition(() => deleteWeek(week.id, moduleId))}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
