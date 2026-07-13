import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { resolveAllowedFolderPrefixes } from "@/lib/storage/allowed-folder";
import { UPLOADS_ROOT } from "@/lib/storage/local.adapter";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-150);
}

function baseUrl(request: Request): string {
  return process.env.AUTH_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response(null, { status: 401 });
  }

  const formData = await request.formData();
  const folder = formData.get("folder");
  const file = formData.get("file");

  if (typeof folder !== "string" || !(file instanceof File)) {
    return Response.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const allowedPrefixes = resolveAllowedFolderPrefixes(session.user.role, session.user.id);
  if (!allowedPrefixes.some((prefix) => folder.startsWith(prefix))) {
    return Response.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  const safeFolder = folder
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9\-_]/g, "_"))
    .join("/");
  const fileName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const destDir = path.join(UPLOADS_ROOT, safeFolder);
  await mkdir(destDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(destDir, fileName), bytes);

  const publicId = `${safeFolder}/${fileName}`;
  return Response.json({
    secure_url: `${baseUrl(request)}/uploads/${publicId}`,
    public_id: publicId,
  });
}
