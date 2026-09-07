import { toggleNews } from "@/lib/admin-server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return toggleNews(request, id);
}
