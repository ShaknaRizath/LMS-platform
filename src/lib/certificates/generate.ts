import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificateDocument, type CertificateData } from "@/lib/certificates/certificate-document";

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  return renderToBuffer(CertificateDocument(data));
}
