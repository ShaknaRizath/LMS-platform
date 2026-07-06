"use client";

import { useState, useTransition } from "react";
import {
  FileText,
  Link as LinkIcon,
  Video,
  Presentation,
  File as FileIcon,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ContentType, ContentStatus } from "@/generated/prisma/enums";
import {
  deleteContentItem,
  setContentItemStatus,
  updateContentItem,
} from "@/lib/actions/lecturer/module-content.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { ContentItemForm } from "@/components/lecturer/content-item-form";

const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  RICH_TEXT: FileText,
  FILE: FileIcon,
  LINK: LinkIcon,
  VIDEO: Video,
  ZOOM: Presentation,
};

export type ContentItemData = {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  status: ContentStatus;
  isAssignment: boolean;
  dueDate: Date | null;
  linkUrl: string | null;
  videoUrl: string | null;
  zoomJoinUrl: string | null;
  zoomMeetingId: string | null;
  zoomPasscode: string | null;
  richTextHtml: string | null;
  fileUrl: string | null;
  fileName: string | null;
};

export function ContentItemCard({
  item,
  moduleId,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  item: ContentItemData;
  moduleId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const Icon = TYPE_ICONS[item.type];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex flex-col">
        <button
          type="button"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          className="text-muted-foreground disabled:opacity-30"
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          type="button"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          className="text-muted-foreground disabled:opacity-30"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      <Icon className="size-5 shrink-0 text-muted-foreground" />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{item.title}</p>
          {item.isAssignment && <Badge variant="outline">Assignment</Badge>}
        </div>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {item.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
        <Switch
          checked={item.status === "PUBLISHED"}
          disabled={pending}
          onCheckedChange={(checked) =>
            startTransition(() =>
              setContentItemStatus(item.id, moduleId, checked ? "PUBLISHED" : "DRAFT")
            )
          }
        />

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger
            render={
              <Button type="button" variant="ghost" size="icon-sm">
                <Pencil />
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit content</DialogTitle>
            </DialogHeader>
            <ContentItemForm
              action={updateContentItem.bind(null, item.id, moduleId)}
              defaultValues={item}
              submitLabel="Save changes"
              onSuccess={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>

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
              <AlertDialogTitle>Delete this content item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove &quot;{item.title}&quot; from this week. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => startTransition(() => deleteContentItem(item.id, moduleId))}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
