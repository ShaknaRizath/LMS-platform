import { auth } from "@/auth";
import { storage } from "@/lib/storage";
import { resolveAllowedFolderPrefix } from "@/lib/storage/allowed-folder";
import type { UploadResourceType } from "@/lib/storage/storage.interface";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response(null, { status: 401 });
  }

  const body = (await request.json()) as { folder?: string; resourceType?: UploadResourceType };
  const { folder, resourceType } = body;

  const allowedPrefix = resolveAllowedFolderPrefix(session.user.role, session.user.id);

  if (!folder || !folder.startsWith(allowedPrefix)) {
    return Response.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  try {
    const params = await storage.getSignedUploadParams({ folder, resourceType });
    return Response.json(params);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload signing failed." },
      { status: 500 }
    );
  }
}
