import { withWebResponse } from "./_utils";

export default withWebResponse(async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { checkApplicationLookupLimit } = await import("../src/lib/admin-server");
    if (checkApplicationLookupLimit(request)) {
      return Response.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { code } = await request.json() as { code?: string };
    const { checkApplicationCode } = await import("../src/lib/data/applications");
    const result = await checkApplicationCode(code || "");

    if (!result) {
      return Response.json({ found: false }, { status: 404 });
    }

    return Response.json({
      found: true,
      status: result.status,
      message_mn: result.message_mn,
      student_name: result.student_name,
      academic_year: result.academic_year,
    });
  } catch (error) {
    console.error("Application check failed:", error);
    return Response.json({ found: false }, { status: 500 });
  }
});
