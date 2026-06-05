import { withWebResponse } from "../_utils";
import { bulkApplications } from "../../src/lib/admin-server";
import { requireMethod } from "../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["POST"], bulkApplications, true);
});
