import { withWebResponse } from "../../_utils";
import { adminSave } from "../../../src/lib/admin-server";
import { requireMethod } from "../../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["POST"], request => {
    const resource = new URL(request.url).pathname.split("/").filter(Boolean).at(-1) || "";
    return adminSave(request, resource);
  }, true);
});
