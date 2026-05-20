import { withWebResponse } from "../../_utils";
import { toggleNews } from "../../../src/lib/admin-server";

export default withWebResponse(async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const id = new URL(request.url).pathname.split("/").filter(Boolean).at(-1) || "";
  return toggleNews(request, id);
});
