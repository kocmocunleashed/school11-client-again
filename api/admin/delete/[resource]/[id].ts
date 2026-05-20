import { withWebResponse } from "../../../_utils";
import { adminDelete } from "../../../../src/lib/admin-server";

export default withWebResponse(async function handler(request: Request) {
  if (request.method !== "DELETE") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  const id = parts.at(-1) || "";
  const resource = parts.at(-2) || "";
  return adminDelete(request, resource, id);
});
