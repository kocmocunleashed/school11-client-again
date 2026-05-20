import { withWebResponse } from "../../_utils";
import { adminSave } from "../../../src/lib/admin-server";

export default withWebResponse(async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const resource = new URL(request.url).pathname.split("/").filter(Boolean).at(-1) || "";
  return adminSave(request, resource);
});
