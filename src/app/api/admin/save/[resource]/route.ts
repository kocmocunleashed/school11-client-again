import { adminSave } from "@/lib/admin-server";
import { refreshPublicContent } from "@/lib/revalidate-public-content";

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return refreshPublicContent(await adminSave(request, resource), resource);
}
