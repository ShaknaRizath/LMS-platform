export type UploadResourceType = "image" | "video" | "raw" | "auto";

export interface SignedUploadParams {
  url: string;
  fields: Record<string, string>;
}

export interface UploadedFile {
  url: string;
  publicId: string;
}

export interface StorageAdapter {
  getSignedUploadParams(opts: {
    folder: string;
    resourceType?: UploadResourceType;
    /** Original filename from the browser — used so the delivered file keeps a readable name
     * instead of Cloudinary's auto-generated random public_id. */
    filename?: string;
  }): Promise<SignedUploadParams>;
  /** For server-generated files (e.g. PDFs) that never go through the browser-upload flow. */
  uploadBuffer(opts: {
    folder: string;
    filename: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadedFile>;
  deleteFile(publicId: string): Promise<void>;
  getFileUrl(publicId: string): string;
}
