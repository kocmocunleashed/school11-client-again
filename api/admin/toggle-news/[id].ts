import { withWebResponse } from "../../_utils";
import { toggleNews } from "../../../src/lib/admin-server";
import { requireMethod } from "../../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["POST"], request => {
    const id = new URL(request.url).pathname.split("/").filter(Boolean).at(-1) || "";
    return toggleNews(request, id);
  }, true);
});
