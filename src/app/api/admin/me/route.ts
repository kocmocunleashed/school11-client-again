import { adminMe } from "@/lib/admin-server";

export async function GET(request: Request) {
  return adminMe(request);
}
