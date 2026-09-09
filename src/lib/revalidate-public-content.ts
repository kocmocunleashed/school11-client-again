import { revalidateTag } from "next/cache";
import { isPublicContentResource, PUBLIC_CONTENT_CACHE_TAG } from "./public-cache";

/** Only call after a successful authenticated database mutation. */
export function refreshPublicContent(response: Response, resource: string): Response {
  if (response.ok && isPublicContentResource(resource)) {
    // These endpoints are Route Handlers, so updateTag (Server Actions only)
    // cannot be used. expire: 0 makes the next read wait for the saved content.
    try {
      revalidateTag(PUBLIC_CONTENT_CACHE_TAG, { expire: 0 });
    } catch (error) {
      // A completed save must not look like a failed save and invite duplicates.
      // The five-minute TTL is the fallback if the cache service is unavailable.
      console.error("Public content cache invalidation failed:", error);
    }
  }
  return response;
}
