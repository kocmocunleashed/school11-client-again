import { withWebResponse } from "../_utils";
import { adminBootstrap } from "../../src/lib/admin-server";
import { requireMethod } from "../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["GET"], adminBootstrap, true);
});
