import { adminDelete } from "@/lib/admin-server";

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  return adminDelete(request, resource, id);
}
