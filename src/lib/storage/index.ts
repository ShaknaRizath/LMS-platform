import "server-only";
import { CloudinaryAdapter } from "@/lib/storage/cloudinary.adapter";
import type { StorageAdapter } from "@/lib/storage/storage.interface";

class UnconfiguredStorageAdapter implements StorageAdapter {
  private fail(): never {
    throw new Error(
      "File storage isn't configured yet. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env."
    );
  }
  async getSignedUploadParams() {
    return this.fail();
  }
  async deleteFile() {
    return this.fail();
  }
  getFileUrl(): string {
    this.fail();
  }
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

export const storage: StorageAdapter =
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
    ? new CloudinaryAdapter(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
    : new UnconfiguredStorageAdapter();
