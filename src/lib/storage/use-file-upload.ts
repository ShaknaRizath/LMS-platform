"use client";

import { useState } from "react";

export type UploadedFile = {
  url: string;
  publicId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
};

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, folder: string): Promise<UploadedFile | null> {
    setUploading(true);
    setError(null);
    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, resourceType: "auto" }),
      });
      if (!signRes.ok) {
        const body = await signRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not get an upload signature.");
      }
      const { url, fields } = await signRes.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value as string));
      formData.append("file", file);

      const uploadRes = await fetch(url, { method: "POST", body: formData });
      if (!uploadRes.ok) {
        throw new Error("File upload to storage provider failed.");
      }
      const uploaded = await uploadRes.json();

      return {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error };
}
