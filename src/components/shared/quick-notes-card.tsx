import { Star, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createNote, toggleNoteStar, deleteNote } from "@/lib/actions/staff/notes.actions";

type PaletteColor = { bg: string; fg: string; accent: string };

export type QuickNoteItem = {
  id: string;
  title: string;
  content: string;
  isStarred: boolean;
  createdAt: Date;
};

export function QuickNotesCard({
  notes,
  palette,
}: {
  notes: QuickNoteItem[];
  palette: readonly PaletteColor[];
}) {
  // Starred notes surface first, then newest-first within each group — matches how a quick
  // personal notes list is actually used (pin what matters, browse the rest chronologically).
  const sorted = [...notes].sort((a, b) => {
    if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Notes</CardTitle>
        <CardDescription>Personal notes only you can see</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-3 px-(--card-spacing) pb-(--card-spacing)">
        <form action={createNote} className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-2">
          <Input name="title" placeholder="Note title" className="h-8" />
          <Textarea name="content" placeholder="Details (optional)" className="min-h-14" />
          <Button type="submit" size="sm" variant="outline" className="self-end">
            <Plus className="size-3.5" />
            Add note
          </Button>
        </form>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet — add one above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((note, index) => {
              const color = palette[index % palette.length];
              return (
                <div
                  key={note.id}
                  className="flex items-start gap-2 rounded-lg p-2.5"
                  style={{ backgroundColor: color.bg }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: color.fg }}>
                      {note.title}
                    </p>
                    {note.content && (
                      <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: color.fg, opacity: 0.85 }}>
                        {note.content}
                      </p>
                    )}
                    <p className="mt-1 text-[11px]" style={{ color: color.fg, opacity: 0.65 }}>
                      {note.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <form action={toggleNoteStar.bind(null, note.id)}>
                      <button type="submit" aria-label="Toggle star" className="rounded p-0.5 hover:bg-black/10">
                        <Star
                          className="size-3.5"
                          style={{ color: color.fg }}
                          fill={note.isStarred ? color.fg : "none"}
                        />
                      </button>
                    </form>
                    <form action={deleteNote.bind(null, note.id)}>
                      <button type="submit" aria-label="Delete note" className="rounded p-0.5 hover:bg-black/10">
                        <X className="size-3.5" style={{ color: color.fg }} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
