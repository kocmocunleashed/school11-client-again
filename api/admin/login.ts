import { withWebResponse } from "../_utils";
import { adminLogin } from "../../src/lib/admin-server";

export default withWebResponse(async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  return adminLogin(req);
});
