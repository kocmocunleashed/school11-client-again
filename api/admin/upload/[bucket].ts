import { withWebResponse } from "../../_utils";
import { adminUpload } from "../../../src/lib/admin-server";

export default withWebResponse(async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const bucket = new URL(request.url).pathname.split("/").filter(Boolean).at(-1) || "";
  return adminUpload(request, bucket);
});
