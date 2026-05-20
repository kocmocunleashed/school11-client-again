import { adminLogin } from "../../src/lib/admin-server";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return adminLogin(request);
}
