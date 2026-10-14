import { newsDetailHandler } from "@/lib/api-handlers/news-detail";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: RouteContext<"/api/news/[id]">) {
  return newsDetailHandler((await params).id);
}
