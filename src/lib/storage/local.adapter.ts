import "server-only";
import { unlink } from "node:fs/promises";
import path from "node:path";
import type { SignedUploadParams, StorageAdapter } from "@/lib/storage/storage.interface";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function baseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

export class LocalStorageAdapter implements StorageAdapter {
  async getSignedUploadParams({ folder }: { folder: string }): Promise<SignedUploadParams> {
    return {
      url: "/api/uploads/local",
      fields: { folder },
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    const filePath = path.join(UPLOADS_ROOT, publicId);
    if (!filePath.startsWith(UPLOADS_ROOT)) return;
    await unlink(filePath).catch(() => undefined);
  }

  getFileUrl(publicId: string): string {
    return `${baseUrl()}/uploads/${publicId}`;
  }
}

export { UPLOADS_ROOT };
