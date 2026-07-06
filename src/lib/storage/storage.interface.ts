export type UploadResourceType = "image" | "video" | "raw" | "auto";

export interface SignedUploadParams {
  url: string;
  fields: Record<string, string>;
}

export interface StorageAdapter {
  getSignedUploadParams(opts: {
    folder: string;
    resourceType?: UploadResourceType;
  }): Promise<SignedUploadParams>;
  deleteFile(publicId: string): Promise<void>;
  getFileUrl(publicId: string): string;
}
