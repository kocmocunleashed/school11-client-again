/** One invalidation tag for public data in pages and the refresh endpoint. */
export const PUBLIC_CONTENT_CACHE_TAG = "school11-public-content-v1";
export const PUBLIC_CONTENT_CACHE_SECONDS = 300;

const publicResources = new Set([
  "news", "teachers", "years", "achievements", "sections", "courseItems", "settings", "hallOfFame",
]);

export function isPublicContentResource(resource: string) {
  return publicResources.has(resource);
}
