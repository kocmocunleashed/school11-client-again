import { withWebResponse } from "../../_utils";
import { adminUpload } from "../../../src/lib/admin-server";
import { requireMethod } from "../../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["POST"], request => {
    const bucket = new URL(request.url).pathname.split("/").filter(Boolean).at(-1) || "";
    return adminUpload(request, bucket);
  }, true);
});
