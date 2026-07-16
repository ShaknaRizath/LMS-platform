import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { TranscriptDocument, type TranscriptData } from "@/lib/transcripts/transcript-document";

export async function generateTranscriptPdf(data: TranscriptData): Promise<Buffer> {
  return renderToBuffer(TranscriptDocument(data));
}
