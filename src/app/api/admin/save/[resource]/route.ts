import { adminSave } from "@/lib/admin-server";

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return adminSave(request, resource);
}
