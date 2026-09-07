import { bulkApplications } from "@/lib/admin-server";

export async function POST(request: Request) {
  return bulkApplications(request);
}
