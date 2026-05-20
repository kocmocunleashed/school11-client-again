import { adminClient } from "../src/lib/supabase/admin";

const buckets = ["news-images", "teacher-photos", "achievement-images", "documents", "site-assets"];

for (const bucket of buckets) {
  const { error } = await adminClient.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: bucket === "documents"
      ? ["application/pdf", "image/jpeg", "image/png", "image/webp"]
      : ["image/jpeg", "image/png", "image/webp"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw error;
  }

  if (error) {
    console.log(`${bucket}: already exists`);
  } else {
    console.log(`${bucket}: created`);
  }
}
