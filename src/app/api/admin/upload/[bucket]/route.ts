import { adminUpload } from "@/lib/admin-server";

export async function POST(request: Request, { params }: { params: Promise<{ bucket: string }> }) {
  const { bucket } = await params;
  return adminUpload(request, bucket);
}
