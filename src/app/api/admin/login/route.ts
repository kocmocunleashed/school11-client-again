import { adminLogin } from "@/lib/admin-server";

export async function POST(request: Request) {
  return adminLogin(request);
}
