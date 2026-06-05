import { withWebResponse } from "./_utils";
import { requireMethod } from "../src/lib/api-handlers/http";
import { siteDataHandler } from "../src/lib/api-handlers/site-data";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["GET"], siteDataHandler);
});
