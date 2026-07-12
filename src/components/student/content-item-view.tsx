import {
  FileText,
  Link as LinkIcon,
  Video,
  Presentation,
  File as FileIcon,
  Download,
  ExternalLink,
} from "lucide-react";
import type { ContentType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  RICH_TEXT: FileText,
  FILE: FileIcon,
  LINK: LinkIcon,
  VIDEO: Video,
  ZOOM: Presentation,
};

const TYPE_ICON_COLORS: Record<ContentType, string> = {
  RICH_TEXT: "#5EC3E0",
  FILE: "#E0637B",
  LINK: "#6FCB8F",
  VIDEO: "#8B7FE0",
  ZOOM: "#4FB8B0",
};

export function ContentItemView({
  item,
}: {
  item: {
    id: string;
    type: ContentType;
    title: string;
    description: string | null;
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
}) {
  const Icon = TYPE_ICONS[item.type];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4" style={{ color: TYPE_ICON_COLORS[item.type] }} />
        <p className="text-sm font-medium">{item.title}</p>
        {item.isAssignment && (
          <Badge variant="outline">
            Assignment{item.dueDate ? ` · Due ${item.dueDate.toLocaleDateString()}` : ""}
          </Badge>
        )}
      </div>
      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}

      {item.type === "RICH_TEXT" && item.richTextHtml && (
        <div
          className="prose prose-sm max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: item.richTextHtml }}
        />
      )}
      {item.type === "LINK" && item.linkUrl && (
        <a
          href={item.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          Open link
        </a>
      )}
      {item.type === "VIDEO" && item.videoUrl && (
        <a
          href={item.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          Watch video
        </a>
      )}
      {item.type === "ZOOM" && item.zoomJoinUrl && (
        <div className="flex flex-col gap-1">
          <a
            href={item.zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            Join Zoom session
          </a>
          {(item.zoomMeetingId || item.zoomPasscode) && (
            <p className="text-xs text-muted-foreground">
              {item.zoomMeetingId && `Meeting ID: ${item.zoomMeetingId}`}
              {item.zoomMeetingId && item.zoomPasscode && " · "}
              {item.zoomPasscode && `Passcode: ${item.zoomPasscode}`}
            </p>
          )}
        </div>
      )}
      {item.type === "FILE" && item.fileUrl && (
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Download className="size-3.5" />
          {item.fileName ?? "Download file"}
        </a>
      )}
    </div>
  );
}
