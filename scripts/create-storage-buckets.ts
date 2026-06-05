import { adminClient } from "../src/lib/supabase/admin";

const buckets = {
  "news-images": {
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "teacher-photos": {
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "achievement-images": {
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "documents": {
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"],
  },
  "site-assets": {
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
} as const;

for (const [bucket, rules] of Object.entries(buckets)) {
  const { error } = await adminClient.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: rules.fileSizeLimit,
    allowedMimeTypes: [...rules.allowedMimeTypes],
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
