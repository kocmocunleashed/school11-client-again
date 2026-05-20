import { withWebResponse } from "../_utils";

export default withWebResponse(async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { password?: string };
  try {
    body = await req.json() as { password?: string };
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const PASS = (process.env.ADMIN_PASSWORD ?? "").trim();
  const given = (body.password ?? "").trim();

  console.log("[login] ADMIN_PASSWORD defined:", Boolean(PASS));
  console.log("[login] ADMIN_PASSWORD length:", PASS.length);
  console.log("[login] given length:", given.length);
  console.log("[login] match:", PASS === given);

  if (!PASS) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured - ADMIN_PASSWORD not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (given !== PASS) {
    return new Response(
      JSON.stringify({ error: "Wrong password" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const cookieValue = crypto.randomUUID();
  const isProduction = process.env.NODE_ENV === "production";

  const cookie = [
    `school11_admin=${cookieValue}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=604800",
    isProduction ? "Secure" : "",
  ].filter(Boolean).join("; ");

  return new Response(
    JSON.stringify({ ok: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    },
  );
});
