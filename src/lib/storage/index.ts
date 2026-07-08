import "server-only";
import { CloudinaryAdapter } from "@/lib/storage/cloudinary.adapter";
import { LocalStorageAdapter } from "@/lib/storage/local.adapter";
import type { StorageAdapter } from "@/lib/storage/storage.interface";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Cloudinary in production once configured; local-disk storage otherwise so
// uploads work out of the box in dev with zero external setup.
export const storage: StorageAdapter =
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
    ? new CloudinaryAdapter(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
    : new LocalStorageAdapter();
