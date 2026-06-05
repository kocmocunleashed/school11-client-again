import { withWebResponse } from "../_utils";
import { adminLogin } from "../../src/lib/admin-server";
import { requireMethod } from "../../src/lib/api-handlers/http";

export default withWebResponse(async function handler(req: Request) {
  return requireMethod(req, ["POST"], adminLogin, true);
});
