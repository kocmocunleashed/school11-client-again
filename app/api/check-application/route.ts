import { checkApplicationCode } from "../../../src/lib/data/applications";

export async function POST(req: Request) {
  const { code } = await req.json() as { code?: string };
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
}
