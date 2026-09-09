import { adminDelete } from "@/lib/admin-server";
import { refreshPublicContent } from "@/lib/revalidate-public-content";

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  return refreshPublicContent(await adminDelete(request, resource, id), resource);
}
