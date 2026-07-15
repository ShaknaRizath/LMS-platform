import { v2 as cloudinary } from "cloudinary";
import type {
  SignedUploadParams,
  StorageAdapter,
  UploadedFile,
  UploadResourceType,
} from "@/lib/storage/storage.interface";

export class CloudinaryAdapter implements StorageAdapter {
  private cloudName: string;

  constructor(cloudName: string, apiKey: string, apiSecret: string) {
    this.cloudName = cloudName;
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }

  async getSignedUploadParams({
    folder,
    resourceType = "auto",
  }: {
    folder: string;
    resourceType?: UploadResourceType;
  }): Promise<SignedUploadParams> {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinary.config().api_secret as string
    );

    return {
      url: `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
      fields: {
        api_key: cloudinary.config().api_key as string,
        timestamp: String(timestamp),
        signature,
        folder,
      },
    };
  }

  async uploadBuffer({
    folder,
    filename,
    buffer,
    contentType,
  }: {
    folder: string;
    filename: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadedFile> {
    const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      public_id: filename,
      resource_type: "raw",
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  getFileUrl(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}
