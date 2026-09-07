import { adminLogout } from "@/lib/admin-server";

export async function POST(request: Request) {
  return adminLogout(request);
}
