import { withWebResponse } from "./_utils";
import { applicationLookupHandler } from "../src/lib/api-handlers/application-lookup";
import { requireMethod } from "../src/lib/api-handlers/http";

export default withWebResponse(async function handler(request: Request) {
  return requireMethod(request, ["POST"], applicationLookupHandler, true);
});
