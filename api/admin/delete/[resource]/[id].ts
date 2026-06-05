import { withWebResponse } from "../../../_utils";
import { adminDelete } from "../../../../src/lib/admin-server";
import { requireMethod } from "../../../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["DELETE"], request => {
    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    const id = parts.at(-1) || "";
    const resource = parts.at(-2) || "";
    return adminDelete(request, resource, id);
  }, true);
});
