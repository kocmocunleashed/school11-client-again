import { adminLogin } from "../../src/lib/admin-server";

export default async function handler(request: Request) {
  console.log("ADMIN_PASSWORD set:", Boolean(process.env.ADMIN_PASSWORD));
  console.log("NODE_ENV:", process.env.NODE_ENV);

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return adminLogin(request);
}
