"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import { getCroppedImageFile } from "@/lib/image/crop-image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Avatar picker with a crop/zoom step before upload — file select opens a dialog
 * to reposition and zoom into a square crop, then uploads only the cropped result. */
export function AvatarUploadField({
  folder,
  value,
  onChange,
  fallbackName,
}: {
  folder: string;
  value: string;
  onChange: (url: string) => void;
  fallbackName: string;
}) {
  const [pendingFile, setPendingFile] = useState<{ src: string; name: string } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const { upload, uploading, error: uploadError } = useFileUpload();

  function closePendingCrop() {
    if (pendingFile) URL.revokeObjectURL(pendingFile.src);
    setPendingFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingFile({ src: URL.createObjectURL(file), name: file.name });
  }

  async function handleSaveCrop() {
    if (!pendingFile || !croppedPixels) return;
    setSaving(true);
    try {
      const croppedFile = await getCroppedImageFile(pendingFile.src, croppedPixels, pendingFile.name);
      const result = await upload(croppedFile, folder);
      if (result) onChange(result.url);
      closePendingCrop();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {value && <AvatarImage src={value} alt={fallbackName} />}
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {initials(fallbackName)}
          </AvatarFallback>
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading || saving} />
      </div>
      {(uploading || saving) && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {uploadError && <FieldError>{uploadError}</FieldError>}

      <Dialog open={pendingFile !== null} onOpenChange={(open) => !open && closePendingCrop()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust photo</DialogTitle>
            <DialogDescription>Drag to reposition, use the slider to zoom.</DialogDescription>
          </DialogHeader>
          {pendingFile && (
            <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
              <Cropper
                image={pendingFile.src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => setCroppedPixels(croppedAreaPixels)}
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-foreground"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closePendingCrop} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveCrop} disabled={saving || !croppedPixels}>
              {saving ? "Saving..." : "Save photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
