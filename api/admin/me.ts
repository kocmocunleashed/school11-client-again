import { withWebResponse } from "../_utils";
import { adminMe } from "../../src/lib/admin-server";

export default withWebResponse(async function handler(request: Request) {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return adminMe(request);
});
