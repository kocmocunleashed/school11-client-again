import { applicationLookupHandler } from "@/lib/api-handlers/application-lookup";

export async function POST(request: Request) {
  return applicationLookupHandler(request);
}
