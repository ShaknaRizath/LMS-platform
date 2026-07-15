import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument, type InvoiceData } from "@/lib/finance/invoice-document";

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return renderToBuffer(InvoiceDocument(data));
}
