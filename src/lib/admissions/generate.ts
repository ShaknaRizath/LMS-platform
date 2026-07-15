import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { OfferLetterDocument, type OfferLetterData } from "@/lib/admissions/offer-letter-document";

export async function generateOfferLetterPdf(data: OfferLetterData): Promise<Buffer> {
  return renderToBuffer(OfferLetterDocument(data));
}
