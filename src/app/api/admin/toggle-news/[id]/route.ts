import { toggleNews } from "@/lib/admin-server";
import { refreshPublicContent } from "@/lib/revalidate-public-content";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return refreshPublicContent(await toggleNews(request, id), "news");
}
